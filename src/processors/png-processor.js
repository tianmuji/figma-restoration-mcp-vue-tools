import fs from 'fs/promises';
import path from 'path';
import chalk from 'chalk';
import sharp from 'sharp';
import { BaseProcessor } from './base-processor.js';
import { ProcessorFactory } from './processor-factory.js';
import { ValidationError } from '../utils/error-handler.js';

/**
 * PNGProcessor - PNG image optimization using Sharp
 */
export class PNGProcessor extends BaseProcessor {
  constructor() {
    super('png');
  }

  /**
   * Get default configuration for PNG optimization
   * @returns {Object} - Default PNG configuration
   */
  getDefaultConfig() {
    return {
      compressionLevel: 6,        // 0-9, higher = better compression
      quality: 100,               // PNG quality (for palette reduction)
      progressive: false,         // PNG doesn't support progressive
      stripMetadata: true,        // Remove EXIF and other metadata
      palette: false,             // Convert to palette-based PNG if beneficial
      colors: 256,                // Maximum colors for palette (if enabled)
      dither: 1.0,               // Dithering level for palette conversion
      timeout: 30                 // Timeout in seconds
    };
  }

  /**
   * Validate PNG-specific configuration
   * @param {Object} config - Configuration to validate
   * @returns {Object} - Validated configuration
   */
  validateConfig(config) {
    // Call parent validation first
    config = super.validateConfig(config);

    if (config.compressionLevel !== undefined) {
      if (typeof config.compressionLevel !== 'number' || config.compressionLevel < 0 || config.compressionLevel > 9) {
        throw new ValidationError('PNG compression level must be between 0 and 9', 'compressionLevel');
      }
    }

    if (config.quality !== undefined) {
      if (typeof config.quality !== 'number' || config.quality < 1 || config.quality > 100) {
        throw new ValidationError('PNG quality must be between 1 and 100', 'quality');
      }
    }

    if (config.colors !== undefined) {
      if (typeof config.colors !== 'number' || config.colors < 2 || config.colors > 256) {
        throw new ValidationError('PNG palette colors must be between 2 and 256', 'colors');
      }
    }

    return config;
  }

  /**
   * Optimize a PNG image file
   * @param {string} inputPath - Path to input PNG file
   * @param {Object} config - Optimization configuration
   * @returns {Promise<Object>} - Optimization result
   */
  async optimize(inputPath, config = {}) {
    // Validate format
    await this.validateFormat(inputPath);

    // Merge and validate configuration
    const finalConfig = this.validateConfig(this.mergeConfig(config));

    console.log(chalk.blue('🖼️  Starting PNG optimization...'));
    console.log(chalk.gray(`   Compression level: ${finalConfig.compressionLevel}`));
    console.log(chalk.gray(`   Strip metadata: ${finalConfig.stripMetadata}`));

    // Get original file stats
    const originalStats = await this.getFileStats(inputPath);
    const originalSize = originalStats.size;

    // Create temporary output path
    const tempOutputPath = `${inputPath}.optimizing.${Date.now()}.png`;

    const optimizationFn = async () => {
      try {
        // Create Sharp instance
        let sharpInstance = sharp(inputPath);

        // Get image metadata
        const metadata = await sharpInstance.metadata();
        console.log(chalk.gray(`   Original: ${metadata.width}×${metadata.height}, ${metadata.channels} channels`));

        // Configure PNG optimization
        const pngOptions = {
          compressionLevel: finalConfig.compressionLevel,
          progressive: false, // PNG doesn't support progressive
          palette: finalConfig.palette
        };

        // Add palette options if palette mode is enabled
        if (finalConfig.palette) {
          pngOptions.colors = finalConfig.colors;
          pngOptions.dither = finalConfig.dither;
        }

        // Strip metadata if requested
        if (finalConfig.stripMetadata) {
          sharpInstance = sharpInstance.withMetadata({
            exif: {},
            icc: metadata.icc, // Keep color profile for accuracy
            iptc: {},
            xmp: {}
          });
        }

        // Apply PNG optimization
        await sharpInstance
          .png(pngOptions)
          .toFile(tempOutputPath);

        // Get optimized file stats
        const optimizedStats = await this.getFileStats(tempOutputPath);
        const optimizedSize = optimizedStats.size;

        // Calculate compression statistics
        const compressionStats = this.calculateCompressionStats(originalSize, optimizedSize);

        // Replace original file with optimized version
        await this.replaceFile(inputPath, tempOutputPath, false);

        // Log results
        this.logOptimizationResults(compressionStats, 'PNG optimization');

        return {
          success: true,
          inputPath: inputPath,
          format: this.format,
          ...compressionStats,
          config: finalConfig,
          metadata: {
            width: metadata.width,
            height: metadata.height,
            channels: metadata.channels,
            hasAlpha: metadata.channels === 4,
            colorSpace: metadata.space
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
   * Analyze PNG image and suggest optimization settings
   * @param {string} inputPath - Path to PNG file
   * @returns {Promise<Object>} - Analysis results and suggestions
   */
  async analyze(inputPath) {
    await this.validateFormat(inputPath);

    const sharpInstance = sharp(inputPath);
    const metadata = await sharpInstance.metadata();
    const stats = await this.getFileStats(inputPath);

    const analysis = {
      format: this.format,
      size: stats.size,
      dimensions: {
        width: metadata.width,
        height: metadata.height
      },
      channels: metadata.channels,
      hasAlpha: metadata.channels === 4,
      colorSpace: metadata.space,
      density: metadata.density,
      hasMetadata: !!(metadata.exif || metadata.icc || metadata.iptc || metadata.xmp),
      suggestions: []
    };

    // Generate optimization suggestions
    if (analysis.hasMetadata) {
      analysis.suggestions.push('Strip metadata to reduce file size');
    }

    if (analysis.size > 1024 * 1024) { // > 1MB
      analysis.suggestions.push('Large file detected - consider higher compression level');
    }

    if (analysis.channels === 4 && analysis.hasAlpha) {
      analysis.suggestions.push('Image has alpha channel - ensure it\'s necessary');
    }

    if (metadata.density && metadata.density > 150) {
      analysis.suggestions.push('High DPI image - consider if full resolution is needed');
    }

    return analysis;
  }
}

// Register this processor with the factory
ProcessorFactory.registerProcessor('png', PNGProcessor);