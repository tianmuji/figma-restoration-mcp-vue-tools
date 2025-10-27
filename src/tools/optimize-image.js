import fs from 'fs/promises';
import path from 'path';
import chalk from 'chalk';
import sharp from 'sharp';
import {
  ensureDirectory,
  pathExists
} from '../utils/path-config.js';

export class OptimizeImageTool {
  constructor() {
    this.description = 'Optimize PNG, JPEG, and WebP images using Sharp with intelligent quality settings for maximum compression while maintaining visual quality';
    this.inputSchema = {
      type: 'object',
      properties: {
        inputPath: {
          type: 'string',
          description: 'Path to the input image file (PNG, JPEG, WebP supported)'
        },
        outputPath: {
          type: 'string',
          description: 'Path to the output image file (optional - if not provided, overwrites the original file)'
        },
        quality: {
          type: 'number',
          description: 'Image quality (0-100, default: 85 for JPEG/WebP). Higher values mean better quality but larger file size',
          default: 85
        },
        format: {
          type: 'string',
          description: 'Output format: "png", "jpeg", "webp", or "auto" (auto detects best format)',
          enum: ['png', 'jpeg', 'webp', 'auto'],
          default: 'auto'
        },
        resize: {
          type: 'object',
          description: 'Optional resize settings',
          properties: {
            width: { type: 'number', description: 'Target width in pixels' },
            height: { type: 'number', description: 'Target height in pixels' },
            fit: {
              type: 'string',
              description: 'How to resize',
              enum: ['cover', 'contain', 'fill', 'inside', 'outside'],
              default: 'contain'
            }
          }
        },
        compressionLevel: {
          type: 'number',
          description: 'PNG compression level (0-9, default: 9 for maximum compression)',
          default: 9
        },
        progressive: {
          type: 'boolean',
          description: 'Enable progressive encoding for JPEG',
          default: true
        },
        mozjpeg: {
          type: 'boolean',
          description: 'Use MozJPEG encoder (better compression than standard JPEG)',
          default: true
        }
      },
      required: ['inputPath']
    };
  }

  async execute(args) {
    const {
      inputPath,
      outputPath,
      quality = 85,
      format = 'auto',
      resize,
      compressionLevel = 9,
      progressive = true,
      mozjpeg = true
    } = args;

    try {
      console.log(chalk.cyan('🖼️  Image Optimizer Tool'));
      console.log(chalk.cyan(`Input: ${inputPath}`));
      console.log(chalk.gray('='.repeat(50)));

      // Validate input file
      const resolvedInputPath = path.resolve(inputPath);
      if (!(await pathExists(resolvedInputPath))) {
        throw new Error(`Input image file not found: ${resolvedInputPath}`);
      }

      // Get image info
      const imageInfo = await sharp(resolvedInputPath).metadata();
      const parsingFormat = imageInfo.format;
      
      if (!parsingFormat || !['png', 'jpeg', 'jpg', 'webp'].includes(parsingFormat)) {
        throw new Error(`Unsupported image format: ${parsingFormat}. Supported formats: PNG, JPEG, WebP`);
      }

      // Determine output path
      const resolvedOutputPath = outputPath ? path.resolve(outputPath) : resolvedInputPath;
      
      // Ensure output directory exists
      const outputDir = path.dirname(resolvedOutputPath);
      await ensureDirectory(outputDir);

      // Get original file size
      const originalStats = await fs.stat(resolvedInputPath);
      const originalSize = originalStats.size;
      console.log(chalk.gray(`   Original size: ${this.formatFileSize(originalSize)}`));
      console.log(chalk.gray(`   Dimensions: ${imageInfo.width}x${imageInfo.height}px`));
      console.log(chalk.gray(`   Format: ${parsingFormat.toUpperCase()}`));

      // Determine optimal format
      const outputFormat = this.determineOutputFormat(parsingFormat, format);
      console.log(chalk.blue('⚡ Optimizing image...'));
      console.log(chalk.gray(`   Output format: ${outputFormat.toUpperCase()}`));

      // Build Sharp pipeline
      let pipeline = sharp(resolvedInputPath);

      // Apply resize if specified
      if (resize) {
        const resizeOptions = {
          width: resize.width,
          height: resize.height,
          fit: resize.fit || 'contain'
        };
        pipeline = pipeline.resize(resizeOptions);
        console.log(chalk.gray(`   Resizing to: ${resize.width || 'auto'}x${resize.height || 'auto'}px`));
      }

      // Apply format-specific compression
      switch (outputFormat) {
        case 'png':
          pipeline = pipeline.png({
            compressionLevel,
            quality: 100,
            palette: true, // Use palette for better compression
            colors: 256 // Max colors for palette
          });
          break;
        
        case 'jpeg':
        case 'jpg':
          const jpegOptions = {
            quality,
            progressive,
            mozjpeg,
            optimizeCoding: true,
            trellisQuantisation: mozjpeg,
            overshootDeringing: mozjpeg,
            optimizeScans: mozjpeg
          };
          pipeline = pipeline.jpeg(jpegOptions);
          break;
        
        case 'webp':
          pipeline = pipeline.webp({
            quality,
            effort: 6, // Max compression effort (0-6)
            smartSubsample: true,
            nearLossless: false, // Use lossy for better compression
            alphaQuality: quality
          });
          break;
      }

      // Process and save the image
      const buffer = await pipeline.toBuffer();
      await fs.writeFile(resolvedOutputPath, buffer);

      // Get optimized file size
      const optimizedStats = await fs.stat(resolvedOutputPath);
      const optimizedSize = optimizedStats.size;
      const reduction = originalSize - optimizedSize;
      const reductionPercentage = ((reduction / originalSize) * 100).toFixed(2);

      console.log(chalk.green('✅ Image optimization completed successfully!'));
      console.log(chalk.yellow(`📊 Optimization Results:`));
      console.log(chalk.gray(`   Original size: ${this.formatFileSize(originalSize)}`));
      console.log(chalk.gray(`   Optimized size: ${this.formatFileSize(optimizedSize)}`));
      console.log(chalk.gray(`   Size reduction: ${this.formatFileSize(reduction)} (${reductionPercentage}%)`));
      
      if (resolvedOutputPath !== resolvedInputPath) {
        console.log(chalk.gray(`   Output saved to: ${resolvedOutputPath}`));
      } else {
        console.log(chalk.gray(`   Original file overwritten`));
      }

      // Get optimized image dimensions
      const optimizedInfo = await sharp(resolvedOutputPath).metadata();

      return {
        success: true,
        inputPath: resolvedInputPath,
        outputPath: resolvedOutputPath,
        optimization: {
          originalSize,
          optimizedSize,
          reduction,
          reductionPercentage: parseFloat(reductionPercentage),
          originalDimensions: { width: imageInfo.width, height: imageInfo.height },
          optimizedDimensions: { width: optimizedInfo.width, height: optimizedInfo.height }
        },
        settings: {
          format: outputFormat,
          quality,
          compressionLevel,
          progressive,
          mozjpeg,
          resize: resize || null
        },
        summary: {
          method: 'Sharp',
          status: 'completed',
          sizeSaved: this.formatFileSize(reduction),
          percentageSaved: `${reductionPercentage}%`,
          compressionRatio: (originalSize / optimizedSize).toFixed(2) + 'x'
        }
      };

    } catch (error) {
      console.error(chalk.red('❌ Image optimization failed:'), error.message);
      return {
        success: false,
        error: error.message,
        inputPath: inputPath || 'unknown'
      };
    }
  }

  determineOutputFormat(originalFormat, userFormat) {
    if (userFormat !== 'auto') {
      return userFormat;
    }

    // Smart format selection based on typical compression results
    // WebP generally provides best compression, but PNG for transparency
    return originalFormat; // Keep original format by default
  }

  formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

