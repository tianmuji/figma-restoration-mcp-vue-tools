import fs from 'fs/promises';
import path from 'path';
import chalk from 'chalk';
import { optimize } from 'svgo';
import {
  ensureDirectory,
  pathExists
} from '../utils/path-config.js';

export class OptimizeSVGTool {
  constructor() {
    this.description = 'Optimize SVG files using SVGO (SVG Optimizer) with customizable configuration';
    this.inputSchema = {
      type: 'object',
      properties: {
        inputPath: {
          type: 'string',
          description: 'Path to the input SVG file (required)'
        },
        outputPath: {
          type: 'string',
          description: 'Path to the output SVG file (optional - if not provided, overwrites the original file)'
        },
        svgoConfig: {
          type: 'object',
          description: 'Custom SVGO configuration (optional - uses default if not provided)',
          properties: {
            plugins: {
              type: 'array',
              description: 'Array of SVGO plugins to use'
            },
            multipass: {
              type: 'boolean',
              description: 'Enable multipass optimization'
            },
            floatPrecision: {
              type: 'number',
              description: 'Precision for floating point numbers'
            }
          }
        }
      },
      required: ['inputPath']
    };
  }

  async execute(args) {
    const {
      inputPath,
      outputPath,
      svgoConfig
    } = args;

    try {
      console.log(chalk.cyan('🎨 SVG Optimizer Tool'));
      console.log(chalk.cyan(`Input: ${inputPath}`));
      console.log(chalk.gray('='.repeat(50)));

      // Validate input file
      const resolvedInputPath = path.resolve(inputPath);
      if (!(await pathExists(resolvedInputPath))) {
        throw new Error(`Input SVG file not found: ${resolvedInputPath}`);
      }

      // Check if input is actually an SVG file
      if (!resolvedInputPath.toLowerCase().endsWith('.svg')) {
        throw new Error(`Input file must be an SVG file: ${resolvedInputPath}`);
      }

      // Determine output path
      const resolvedOutputPath = outputPath ? path.resolve(outputPath) : resolvedInputPath;
      
      // Ensure output directory exists
      const outputDir = path.dirname(resolvedOutputPath);
      await ensureDirectory(outputDir);

      console.log(chalk.blue('📖 Reading SVG file...'));
      const svgContent = await fs.readFile(resolvedInputPath, 'utf-8');
      
      // Get file size before optimization
      const originalSize = Buffer.byteLength(svgContent, 'utf-8');
      console.log(chalk.gray(`   Original size: ${this.formatFileSize(originalSize)}`));

      // Use provided config or default
      const config = svgoConfig || this.getDefaultSVGOConfig();
      
      console.log(chalk.blue('⚡ Optimizing SVG...'));
      console.log(chalk.gray(`   Using ${config.plugins?.length || 0} plugins`));

      // Optimize the SVG
      const result = optimize(svgContent, {
        path: resolvedInputPath,
        ...config
      });

      if (result.error) {
        throw new Error(`SVGO optimization failed: ${result.error}`);
      }

      const optimizedContent = result.data;
      const optimizedSize = Buffer.byteLength(optimizedContent, 'utf-8');
      const reduction = originalSize - optimizedSize;
      const reductionPercentage = ((reduction / originalSize) * 100).toFixed(2);

      console.log(chalk.blue('💾 Saving optimized SVG...'));
      await fs.writeFile(resolvedOutputPath, optimizedContent, 'utf-8');

      console.log(chalk.green('✅ SVG optimization completed successfully!'));
      console.log(chalk.yellow(`📊 Optimization Results:`));
      console.log(chalk.gray(`   Original size: ${this.formatFileSize(originalSize)}`));
      console.log(chalk.gray(`   Optimized size: ${this.formatFileSize(optimizedSize)}`));
      console.log(chalk.gray(`   Size reduction: ${this.formatFileSize(reduction)} (${reductionPercentage}%)`));
      
      if (resolvedOutputPath !== resolvedInputPath) {
        console.log(chalk.gray(`   Output saved to: ${resolvedOutputPath}`));
      } else {
        console.log(chalk.gray(`   Original file overwritten`));
      }

      return {
        success: true,
        inputPath: resolvedInputPath,
        outputPath: resolvedOutputPath,
        optimization: {
          originalSize,
          optimizedSize,
          reduction,
          reductionPercentage: parseFloat(reductionPercentage)
        },
        config: config,
        summary: {
          method: 'SVGO',
          status: 'completed',
          sizeSaved: this.formatFileSize(reduction),
          percentageSaved: `${reductionPercentage}%`
        }
      };

    } catch (error) {
      console.error(chalk.red('❌ SVG optimization failed:'), error.message);
      return {
        success: false,
        error: error.message,
        inputPath: inputPath || 'unknown'
      };
    }
  }

  getDefaultSVGOConfig() {
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
      floatPrecision: 2
    };
  }

  formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
