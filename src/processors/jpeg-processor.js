import fs from 'fs/promises';
import path from 'path';
import chalk from 'chalk';
import sharp from 'sharp';
import { BaseProcessor } from './base-processor.js';
import { ProcessorFactory } from './processor-factory.js';
import { ValidationError } from '../utils/error-handler.js';

/**
 * JPEGProcessor - JPEG image optimization using Sharp
 */
export class JPEGProcessor extends BaseProcessor {
  constructor() {
    super('jpeg');
  }

  /**
   * Get default configuration for JPEG optimization
   * @returns {Object} - Default JPEG configuration
   */
  getDefaultConfig() {
    return {
      quality: 85,                // JPEG quality (1-100, higher = better quality)
      progressive: true,          // Progressive JPEG encoding
      stripMetadata: true,        // Remove EXIF, IPTC, XMP metadata
      optimizeScans: true,        // Optimize Huffman coding tables
      overshootDeringing: false,  // Reduce ringing artifacts
      trellisQuantisation: false, // Use trellis quantisation
      mozjpeg: true,              // Use mozjpeg encoder if available
      timeout: 30                 // Timeout in seconds
    };
  }

  /**
   * Validate JPEG-specific configuration
   * @param {Object} config - Configuration to validate
   * @returns {Object} - Validated configuration
   */
  validateConfig(config) {
    // Call parent validation first
    config = super.validateConfig(config);

    if (config.quality !== undefined) {
      if (typeof config.quality !== 'number' || config.quality < 1 || config.quality > 100) {
        throw new ValidationError('JPEG quality must be between 1 and 100', 'quality');
      }
    }

    if (config.progressive !== undefined && typeof config.progressive !== 'boolean') {
      throw new ValidationError('JPEG progressive must be a boolean', 'progressive');
    }

    if (config.mozjpeg !== undefined && typeof config.mozjpeg !== 'boolean') {
      throw new ValidationError('JPEG mozjpeg must be a boolean', 'mozjpeg');
    }

    return config;
  }

  /**
   * Optimize a JPEG image file
   * @param {string} inputPath - Path to input JPEG file
   * @param {Object} config - Optimization configuration
   * @returns {Promise<Object>} - Optimization result
   */
  async optimize(inputPath, config = {}) {
    // Validate format
    await this.validateFormat(inputPath);

    // Merge and validate configuration
    const finalConfig = this.validateConfig(this.mergeConfig(config));

    console.log(chalk.blue('🖼️  Starting JPEG optimization...'));
    console.log(chalk.gray(`   Quality: ${finalConfig.quality}`));
    console.log(chalk.gray(`   Progressive: ${finalConfig.progressive}`));
    console.log(chalk.gray(`   Strip metadata: ${finalConfig.stripMetadata}`));

    // Get original file stats
    const originalStats = await this.getFileStats(inputPath);
    const originalSize = originalStats.size;

    // Create temporary output path
    const tempOutputPath = `${inputPath}.optimizing.${Date.now()}.jpg`;

    const optimizationFn = async () => {
      try {
        // Create Sharp instance
        let sharpInstance = sharp(inputPath);

        // Get image metadata
        const metadata = await sharpInstance.metadata();
        console.log(chalk.gray(`   Original: ${metadata.width}×${metadata.height}, ${metadata.channels} channels`));

        // Configure JPEG optimization
        const jpegOptions = {
          quality: finalConfig.quality,
          progressive: finalConfig.progressive,
          optimizeScans: finalConfig.optimizeScans,
          overshootDeringing: finalConfig.overshootDeringing,
          trellisQuantisation: finalConfig.trellisQuantisation,
          mozjpeg: finalConfig.mozjpeg
        };

        // Strip metadata if requested
        if (finalConfig.stripMetadata) {
          sharpInstance = sharpInstance.withMetadata({
            exif: {},
            icc: metadata.icc, // Keep color profile for accuracy
            iptc: {},
            xmp: {}
          });
        }

        // Convert to RGB if necessary (JPEG doesn't support alpha)
        if (metadata.channels === 4) {
          console.log(chalk.yellow('   ⚠️  Converting RGBA to RGB (removing alpha channel)'));
          sharpInstance = sharpInstance.removeAlpha();
        }

        // Apply JPEG optimization
        await sharpInstance
          .jpeg(jpegOptions)
          .toFile(tempOutputPath);

        // Get optimized file stats
        const optimizedStats = await this.getFileStats(tempOutputPath);
        const optimizedSize = optimizedStats.size;

        // Calculate compression statistics
        const compressionStats = this.calculateCompressionStats(originalSize, optimizedSize);

        // Replace original file with optimized version
        await this.replaceFile(inputPath, tempOutputPath, false);

        // Log results
        this.logOptimizationResults(compressionStats, 'JPEG optimization');

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
            originalChannels: metadata.channels,
            colorSpace: metadata.space,
            hasAlpha: metadata.channels === 4,
            alphaRemoved: metadata.channels === 4
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
   * Analyze JPEG image and suggest optimization settings
   * @param {string} inputPath - Path to JPEG file
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
      isProgressive: metadata.isProgressive,
      suggestions: []
    };

    // Generate optimization suggestions
    if (analysis.hasMetadata) {
      analysis.suggestions.push('Strip metadata to reduce file size');
    }

    if (analysis.hasAlpha) {
      analysis.suggestions.push('Remove alpha channel (JPEG doesn\'t support transparency)');
    }

    if (!analysis.isProgressive) {
      analysis.suggestions.push('Enable progressive encoding for better perceived loading');
    }

    if (analysis.size > 2 * 1024 * 1024) { // > 2MB
      analysis.suggestions.push('Large file detected - consider reducing quality or dimensions');
    }

    if (metadata.density && metadata.density > 150) {
      analysis.suggestions.push('High DPI image - consider if full resolution is needed');
    }

    // Quality suggestions based on file size and dimensions
    const pixelCount = metadata.width * metadata.height;
    const bytesPerPixel = analysis.size / pixelCount;
    
    if (bytesPerPixel > 3) {
      analysis.suggestions.push('High bytes per pixel - consider reducing quality from 85 to 75');
    } else if (bytesPerPixel < 1) {
      analysis.suggestions.push('Low bytes per pixel - quality might be too low, consider increasing');
    }

    return analysis;
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
    if (bytesPerPixel > 4) {
      return 75; // High compression, reduce quality
    } else if (bytesPerPixel > 2) {
      return 80; // Medium compression
    } else if (bytesPerPixel > 1) {
      return 85; // Good balance (default)
    } else {
      return 90; // Low compression, can afford higher quality
    }
  }
}

// Register this processor with the factory
ProcessorFactory.registerProcessor('jpeg', JPEGProcessor);