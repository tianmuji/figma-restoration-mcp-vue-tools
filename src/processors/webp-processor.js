import fs from 'fs/promises';
import path from 'path';
import chalk from 'chalk';
import sharp from 'sharp';
import { BaseProcessor } from './base-processor.js';
import { ProcessorFactory } from './processor-factory.js';
import { ValidationError } from '../utils/error-handler.js';

/**
 * WebPProcessor - WebP image optimization using Sharp
 */
export class WebPProcessor extends BaseProcessor {
  constructor() {
    super('webp');
  }

  /**
   * Get default configuration for WebP optimization
   * @returns {Object} - Default WebP configuration
   */
  getDefaultConfig() {
    return {
      quality: 85,                // WebP quality (1-100, higher = better quality)
      lossless: false,            // Use lossless compression
      nearLossless: false,        // Use near-lossless compression
      smartSubsample: true,       // Use smart subsampling
      preset: 'default',          // Encoding preset: default, photo, picture, drawing, icon, text
      effort: 4,                  // Encoding effort (0-6, higher = better compression)
      stripMetadata: true,        // Remove EXIF and other metadata
      alphaQuality: 100,          // Alpha channel quality (0-100)
      timeout: 30                 // Timeout in seconds
    };
  }

  /**
   * Validate WebP-specific configuration
   * @param {Object} config - Configuration to validate
   * @returns {Object} - Validated configuration
   */
  validateConfig(config) {
    // Call parent validation first
    config = super.validateConfig(config);

    if (config.quality !== undefined) {
      if (typeof config.quality !== 'number' || config.quality < 1 || config.quality > 100) {
        throw new ValidationError('WebP quality must be between 1 and 100', 'quality');
      }
    }

    if (config.alphaQuality !== undefined) {
      if (typeof config.alphaQuality !== 'number' || config.alphaQuality < 0 || config.alphaQuality > 100) {
        throw new ValidationError('WebP alphaQuality must be between 0 and 100', 'alphaQuality');
      }
    }

    if (config.effort !== undefined) {
      if (typeof config.effort !== 'number' || config.effort < 0 || config.effort > 6) {
        throw new ValidationError('WebP effort must be between 0 and 6', 'effort');
      }
    }

    if (config.preset !== undefined) {
      const validPresets = ['default', 'photo', 'picture', 'drawing', 'icon', 'text'];
      if (!validPresets.includes(config.preset)) {
        throw new ValidationError(`WebP preset must be one of: ${validPresets.join(', ')}`, 'preset');
      }
    }

    if (config.lossless !== undefined && typeof config.lossless !== 'boolean') {
      throw new ValidationError('WebP lossless must be a boolean', 'lossless');
    }

    if (config.nearLossless !== undefined && typeof config.nearLossless !== 'boolean') {
      throw new ValidationError('WebP nearLossless must be a boolean', 'nearLossless');
    }

    return config;
  }

  /**
   * Optimize a WebP image file
   * @param {string} inputPath - Path to input WebP file
   * @param {Object} config - Optimization configuration
   * @returns {Promise<Object>} - Optimization result
   */
  async optimize(inputPath, config = {}) {
    // Validate format
    await this.validateFormat(inputPath);

    // Merge and validate configuration
    const finalConfig = this.validateConfig(this.mergeConfig(config));

    console.log(chalk.blue('🖼️  Starting WebP optimization...'));
    console.log(chalk.gray(`   Quality: ${finalConfig.quality}`));
    console.log(chalk.gray(`   Lossless: ${finalConfig.lossless}`));
    console.log(chalk.gray(`   Preset: ${finalConfig.preset}`));
    console.log(chalk.gray(`   Effort: ${finalConfig.effort}`));

    // Get original file stats
    const originalStats = await this.getFileStats(inputPath);
    const originalSize = originalStats.size;

    // Create temporary output path
    const tempOutputPath = `${inputPath}.optimizing.${Date.now()}.webp`;

    const optimizationFn = async () => {
      try {
        // Create Sharp instance
        let sharpInstance = sharp(inputPath);

        // Get image metadata
        const metadata = await sharpInstance.metadata();
        console.log(chalk.gray(`   Original: ${metadata.width}×${metadata.height}, ${metadata.channels} channels`));

        // Configure WebP optimization
        const webpOptions = {
          quality: finalConfig.quality,
          lossless: finalConfig.lossless,
          nearLossless: finalConfig.nearLossless,
          smartSubsample: finalConfig.smartSubsample,
          preset: finalConfig.preset,
          effort: finalConfig.effort
        };

        // Handle alpha channel quality
        if (metadata.channels === 4) {
          webpOptions.alphaQuality = finalConfig.alphaQuality;
          console.log(chalk.gray(`   Alpha quality: ${finalConfig.alphaQuality}`));
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

        // Apply WebP optimization
        await sharpInstance
          .webp(webpOptions)
          .toFile(tempOutputPath);

        // Get optimized file stats
        const optimizedStats = await this.getFileStats(tempOutputPath);
        const optimizedSize = optimizedStats.size;

        // Calculate compression statistics
        const compressionStats = this.calculateCompressionStats(originalSize, optimizedSize);

        // Replace original file with optimized version
        await this.replaceFile(inputPath, tempOutputPath, false);

        // Log results
        this.logOptimizationResults(compressionStats, 'WebP optimization');

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
            colorSpace: metadata.space,
            isLossless: finalConfig.lossless,
            preset: finalConfig.preset
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
   * Analyze WebP image and suggest optimization settings
   * @param {string} inputPath - Path to WebP file
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

    if (analysis.hasAlpha) {
      analysis.suggestions.push('Consider alpha quality settings for transparency optimization');
    }

    if (analysis.size > 1024 * 1024) { // > 1MB
      analysis.suggestions.push('Large file detected - consider reducing quality or using lossless compression');
    }

    // Suggest preset based on image characteristics
    const pixelCount = metadata.width * metadata.height;
    if (pixelCount < 100 * 100) {
      analysis.suggestions.push('Small image detected - consider "icon" preset');
    } else if (metadata.channels === 1) {
      analysis.suggestions.push('Grayscale image - consider "drawing" preset');
    } else {
      analysis.suggestions.push('Color image - "photo" preset may be optimal');
    }

    // Quality suggestions based on file size
    const bytesPerPixel = analysis.size / pixelCount;
    if (bytesPerPixel > 2) {
      analysis.suggestions.push('High compression ratio - consider reducing quality from 85 to 75');
    } else if (bytesPerPixel < 0.5) {
      analysis.suggestions.push('Low compression ratio - consider increasing quality or using lossless');
    }

    return analysis;
  }

  /**
   * Get preset recommendation based on image characteristics
   * @param {Object} metadata - Image metadata
   * @param {number} fileSize - File size in bytes
   * @returns {string} - Recommended preset
   */
  getPresetRecommendation(metadata, fileSize) {
    const pixelCount = metadata.width * metadata.height;
    
    // Small images (icons)
    if (pixelCount < 100 * 100) {
      return 'icon';
    }
    
    // Grayscale or simple images
    if (metadata.channels === 1 || metadata.channels === 2) {
      return 'drawing';
    }
    
    // Large images with fine detail
    if (pixelCount > 1920 * 1080) {
      return 'photo';
    }
    
    // Default for most cases
    return 'default';
  }

  /**
   * Get quality recommendation based on image characteristics
   * @param {Object} metadata - Image metadata
   * @param {number} fileSize - File size in bytes
   * @returns {number} - Recommended quality (1-100)
   */
  getQualityRecommendation(metadata, fileSize) {
    const pixelCount = metadata.width * metadata.height;
    const bytesPerPixel = fileSize / pixelCount;
    
    // Recommend quality based on current compression ratio
    if (bytesPerPixel > 3) {
      return 75; // High compression, reduce quality
    } else if (bytesPerPixel > 1.5) {
      return 80; // Medium compression
    } else if (bytesPerPixel > 0.8) {
      return 85; // Good balance (default)
    } else {
      return 90; // Low compression, can afford higher quality
    }
  }
}

// Register this processor with the factory
ProcessorFactory.registerProcessor('webp', WebPProcessor);