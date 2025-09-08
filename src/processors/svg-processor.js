import fs from 'fs/promises';
import path from 'path';
import chalk from 'chalk';
import { optimize } from 'svgo';
import { BaseProcessor } from './base-processor.js';
import { ProcessorFactory } from './processor-factory.js';
import { ValidationError } from '../utils/error-handler.js';

/**
 * SVGProcessor - SVG optimization using SVGO (wraps existing optimize-svg functionality)
 */
export class SVGProcessor extends BaseProcessor {
  constructor() {
    super('svg');
  }

  /**
   * Get default configuration for SVG optimization
   * @returns {Object} - Default SVG configuration
   */
  getDefaultConfig() {
    return {
      plugins: [
        {
          name: 'preset-default',
          params: {
            overrides: {
              convertShapeToPath: false,
            },
          },
        },
        { name: 'convertShapeToPath' },
        { name: 'mergePaths' },
      ],
      multipass: true,
      floatPrecision: 2,
      stripMetadata: true,        // Remove metadata elements
      removeComments: true,       // Remove XML comments
      removeEmptyElements: true,  // Remove empty elements
      timeout: 30                 // Timeout in seconds
    };
  }

  /**
   * Validate SVG-specific configuration
   * @param {Object} config - Configuration to validate
   * @returns {Object} - Validated configuration
   */
  validateConfig(config) {
    // Call parent validation first
    config = super.validateConfig(config);

    if (config.plugins !== undefined && !Array.isArray(config.plugins)) {
      throw new ValidationError('SVG plugins must be an array', 'plugins');
    }

    if (config.multipass !== undefined && typeof config.multipass !== 'boolean') {
      throw new ValidationError('SVG multipass must be a boolean', 'multipass');
    }

    if (config.floatPrecision !== undefined) {
      if (typeof config.floatPrecision !== 'number' || config.floatPrecision < 0 || config.floatPrecision > 10) {
        throw new ValidationError('SVG floatPrecision must be between 0 and 10', 'floatPrecision');
      }
    }

    return config;
  }

  /**
   * Optimize an SVG file
   * @param {string} inputPath - Path to input SVG file
   * @param {Object} config - Optimization configuration
   * @returns {Promise<Object>} - Optimization result
   */
  async optimize(inputPath, config = {}) {
    // Validate format
    await this.validateFormat(inputPath);

    // Merge and validate configuration
    const finalConfig = this.validateConfig(this.mergeConfig(config));

    console.log(chalk.blue('🖼️  Starting SVG optimization...'));
    console.log(chalk.gray(`   Multipass: ${finalConfig.multipass}`));
    console.log(chalk.gray(`   Float precision: ${finalConfig.floatPrecision}`));
    console.log(chalk.gray(`   Plugins: ${finalConfig.plugins?.length || 0}`));

    // Get original file stats
    const originalStats = await this.getFileStats(inputPath);
    const originalSize = originalStats.size;

    // Create temporary output path
    const tempOutputPath = `${inputPath}.optimizing.${Date.now()}.svg`;

    const optimizationFn = async () => {
      try {
        // Read SVG content
        console.log(chalk.blue('📖 Reading SVG file...'));
        const svgContent = await fs.readFile(inputPath, 'utf-8');
        
        console.log(chalk.gray(`   Original size: ${this.formatFileSize(originalSize)}`));

        // Prepare SVGO configuration
        const svgoConfig = {
          plugins: finalConfig.plugins,
          multipass: finalConfig.multipass,
          floatPrecision: finalConfig.floatPrecision
        };

        // Add metadata removal plugins if requested
        if (finalConfig.stripMetadata) {
          svgoConfig.plugins = [
            ...svgoConfig.plugins,
            { name: 'removeMetadata' },
            { name: 'removeEditorsNSData' }
          ];
        }

        if (finalConfig.removeComments) {
          svgoConfig.plugins = [
            ...svgoConfig.plugins,
            { name: 'removeComments' }
          ];
        }

        if (finalConfig.removeEmptyElements) {
          svgoConfig.plugins = [
            ...svgoConfig.plugins,
            { name: 'removeEmptyContainers' },
            { name: 'removeEmptyText' }
          ];
        }

        console.log(chalk.blue('⚡ Optimizing SVG...'));
        console.log(chalk.gray(`   Using ${svgoConfig.plugins?.length || 0} plugins`));

        // Optimize the SVG using SVGO
        const result = optimize(svgContent, {
          path: inputPath,
          ...svgoConfig
        });

        if (result.error) {
          throw new Error(`SVGO optimization failed: ${result.error}`);
        }

        const optimizedContent = result.data;
        const optimizedSize = Buffer.byteLength(optimizedContent, 'utf-8');

        // Write optimized content to temporary file
        console.log(chalk.blue('💾 Saving optimized SVG...'));
        await fs.writeFile(tempOutputPath, optimizedContent, 'utf-8');

        // Calculate compression statistics
        const compressionStats = this.calculateCompressionStats(originalSize, optimizedSize);

        // Replace original file with optimized version
        await this.replaceFile(inputPath, tempOutputPath, false);

        // Log results
        this.logOptimizationResults(compressionStats, 'SVG optimization');

        return {
          success: true,
          inputPath: inputPath,
          format: this.format,
          ...compressionStats,
          config: finalConfig,
          svgoResult: {
            modernizeSvg: result.modernizeSvg || false,
            info: result.info || {}
          },
          metadata: {
            encoding: 'utf-8',
            isValid: !result.error,
            pluginsUsed: svgoConfig.plugins?.length || 0
          }
        };

      } catch (error) {
        // Clean up temporary file if it exists
        try {
          await fs.unlink(tempOutputPath);
        } catch (cleanupError) {
          // Ignore cleanup errors
        }
        throw error;
      }
    };

    // Execute with timeout and error handling
    return await this.executeWithTimeout(optimizationFn, {
      timeout: finalConfig.timeout,
      cleanupFn: async () => {
        try {
          await fs.unlink(tempOutputPath);
        } catch (error) {
          // Ignore cleanup errors
        }
      }
    });
  }

  /**
   * Analyze SVG file and suggest optimization settings
   * @param {string} inputPath - Path to SVG file
   * @returns {Promise<Object>} - Analysis results and suggestions
   */
  async analyze(inputPath) {
    await this.validateFormat(inputPath);

    const stats = await this.getFileStats(inputPath);
    const svgContent = await fs.readFile(inputPath, 'utf-8');

    const analysis = {
      format: this.format,
      size: stats.size,
      encoding: 'utf-8',
      lineCount: svgContent.split('\n').length,
      hasComments: svgContent.includes('<!--'),
      hasMetadata: svgContent.includes('<metadata>') || svgContent.includes('<title>') || svgContent.includes('<desc>'),
      hasUnusedElements: false, // Would need deeper analysis
      suggestions: []
    };

    // Analyze SVG structure
    const elementMatches = svgContent.match(/<[^>]+>/g) || [];
    analysis.elementCount = elementMatches.length;

    // Check for common optimization opportunities
    if (analysis.hasComments) {
      analysis.suggestions.push('Remove XML comments to reduce file size');
    }

    if (analysis.hasMetadata) {
      analysis.suggestions.push('Remove metadata elements if not needed for accessibility');
    }

    if (svgContent.includes('stroke-width="0"')) {
      analysis.suggestions.push('Remove elements with zero stroke width');
    }

    if (svgContent.includes('fill="none"') && svgContent.includes('stroke="none"')) {
      analysis.suggestions.push('Remove invisible elements (no fill or stroke)');
    }

    if (analysis.size > 100 * 1024) { // > 100KB
      analysis.suggestions.push('Large SVG detected - consider reducing precision or simplifying paths');
    }

    // Check for optimization potential
    const pathElements = (svgContent.match(/<path[^>]*>/g) || []).length;
    if (pathElements > 50) {
      analysis.suggestions.push('Many path elements detected - consider merging similar paths');
    }

    // Check for inline styles vs attributes
    if (svgContent.includes('style=')) {
      analysis.suggestions.push('Convert inline styles to attributes for better optimization');
    }

    return analysis;
  }

  /**
   * Get SVGO plugin recommendations based on SVG content
   * @param {string} svgContent - SVG file content
   * @returns {Array} - Recommended SVGO plugins
   */
  getPluginRecommendations(svgContent) {
    const recommendations = [...this.getDefaultConfig().plugins];

    // Add specific plugins based on content analysis
    if (svgContent.includes('<defs>')) {
      recommendations.push({ name: 'collapseGroups' });
    }

    if (svgContent.includes('transform=')) {
      recommendations.push({ name: 'convertTransform' });
    }

    if (svgContent.includes('<use')) {
      recommendations.push({ name: 'removeUselessDefs' });
    }

    return recommendations;
  }
}

// Register this processor with the factory
ProcessorFactory.registerProcessor('svg', SVGProcessor);