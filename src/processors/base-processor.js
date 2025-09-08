import fs from 'fs/promises';
import path from 'path';
import chalk from 'chalk';
import { TimeoutManager } from '../utils/timeout-manager.js';
import { ErrorHandler, ValidationError, FormatError } from '../utils/error-handler.js';

/**
 * BaseProcessor - Abstract base class for image format processors
 */
export class BaseProcessor {
  constructor(format) {
    if (new.target === BaseProcessor) {
      throw new Error('BaseProcessor is an abstract class and cannot be instantiated directly');
    }
    this.format = format;
  }

  /**
   * Optimize an image file (abstract method)
   * @param {string} inputPath - Path to input file
   * @param {Object} config - Optimization configuration
   * @returns {Promise<Object>} - Optimization result
   */
  async optimize(inputPath, config = {}) {
    throw new Error('optimize() method must be implemented by subclasses');
  }

  /**
   * Validate that the file format matches this processor
   * @param {string} filePath - Path to the file
   * @returns {Promise<boolean>} - True if format is supported
   */
  async validateFormat(filePath) {
    const detectedFormat = this.detectFormat(filePath);
    if (detectedFormat !== this.format) {
      throw new FormatError(
        `Format mismatch: expected ${this.format}, detected ${detectedFormat}`,
        detectedFormat
      );
    }
    return true;
  }

  /**
   * Detect image format from file extension
   * @param {string} filePath - Path to the file
   * @returns {string} - Detected format
   */
  detectFormat(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    
    switch (ext) {
      case '.png':
        return 'png';
      case '.jpg':
      case '.jpeg':
        return 'jpeg';
      case '.svg':
        return 'svg';
      case '.webp':
        return 'webp';
      default:
        throw new FormatError(`Unsupported image format: ${ext}. Supported formats: .png, .jpg, .jpeg, .svg, .webp`);
    }
  }

  /**
   * Get default configuration for this processor
   * @returns {Object} - Default configuration
   */
  getDefaultConfig() {
    return {};
  }

  /**
   * Merge user configuration with defaults
   * @param {Object} userConfig - User-provided configuration
   * @returns {Object} - Merged configuration
   */
  mergeConfig(userConfig = {}) {
    return { ...this.getDefaultConfig(), ...userConfig };
  }

  /**
   * Validate configuration parameters
   * @param {Object} config - Configuration to validate
   * @returns {Object} - Validated configuration
   */
  validateConfig(config) {
    // Base validation - subclasses can override
    if (config.timeout && (typeof config.timeout !== 'number' || config.timeout <= 0)) {
      throw new ValidationError('Timeout must be a positive number', 'timeout');
    }
    return config;
  }

  /**
   * Get file statistics
   * @param {string} filePath - Path to the file
   * @returns {Promise<Object>} - File statistics
   */
  async getFileStats(filePath) {
    try {
      const stats = await fs.stat(filePath);
      return {
        size: stats.size,
        modified: stats.mtime,
        created: stats.birthtime
      };
    } catch (error) {
      throw new Error(`Failed to get file statistics: ${error.message}`);
    }
  }

  /**
   * Create a backup of the original file
   * @param {string} filePath - Path to the file
   * @returns {Promise<string>} - Path to backup file
   */
  async createBackup(filePath) {
    const backupPath = `${filePath}.backup.${Date.now()}`;
    try {
      await fs.copyFile(filePath, backupPath);
      console.log(chalk.blue(`📋 Created backup: ${path.basename(backupPath)}`));
      return backupPath;
    } catch (error) {
      throw new Error(`Failed to create backup: ${error.message}`);
    }
  }

  /**
   * Safely replace the original file with optimized version
   * @param {string} originalPath - Path to original file
   * @param {string} optimizedPath - Path to optimized file
   * @param {boolean} createBackup - Whether to create a backup
   * @returns {Promise<void>}
   */
  async replaceFile(originalPath, optimizedPath, createBackup = false) {
    try {
      let backupPath = null;
      
      if (createBackup) {
        backupPath = await this.createBackup(originalPath);
      }

      // Atomic replacement using rename
      await fs.rename(optimizedPath, originalPath);
      console.log(chalk.green(`✅ File replaced: ${path.basename(originalPath)}`));

      // Clean up backup if replacement was successful and not requested
      if (backupPath && !createBackup) {
        await fs.unlink(backupPath).catch(() => {
          // Ignore cleanup errors
        });
      }
    } catch (error) {
      throw new Error(`Failed to replace file: ${error.message}`);
    }
  }

  /**
   * Format file size in human-readable format
   * @param {number} bytes - File size in bytes
   * @returns {string} - Formatted file size
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Calculate compression statistics
   * @param {number} originalSize - Original file size in bytes
   * @param {number} optimizedSize - Optimized file size in bytes
   * @returns {Object} - Compression statistics
   */
  calculateCompressionStats(originalSize, optimizedSize) {
    const reduction = originalSize - optimizedSize;
    const reductionPercentage = originalSize > 0 ? ((reduction / originalSize) * 100) : 0;
    
    return {
      originalSize,
      optimizedSize,
      reduction,
      reductionPercentage: parseFloat(reductionPercentage.toFixed(2)),
      compressionRatio: originalSize > 0 ? parseFloat((optimizedSize / originalSize).toFixed(3)) : 1
    };
  }

  /**
   * Log optimization results
   * @param {Object} stats - Compression statistics
   * @param {string} operation - Operation name
   */
  logOptimizationResults(stats, operation = 'Optimization') {
    console.log(chalk.green(`✅ ${operation} completed successfully!`));
    console.log(chalk.yellow(`📊 ${operation} Results:`));
    console.log(chalk.gray(`   Original size: ${this.formatFileSize(stats.originalSize)}`));
    console.log(chalk.gray(`   Optimized size: ${this.formatFileSize(stats.optimizedSize)}`));
    console.log(chalk.gray(`   Size reduction: ${this.formatFileSize(stats.reduction)} (${stats.reductionPercentage}%)`));
    console.log(chalk.gray(`   Compression ratio: ${stats.compressionRatio}:1`));
  }

  /**
   * Execute optimization with timeout and error handling
   * @param {Function} optimizationFn - Function that performs the optimization
   * @param {Object} config - Configuration including timeout settings
   * @returns {Promise<Object>} - Optimization result
   */
  async executeWithTimeout(optimizationFn, config = {}) {
    const timeoutConfig = TimeoutManager.createConfig('processing', {
      timeoutMs: (config.timeout || 30) * 1000,
      operationName: `${this.format.toUpperCase()} optimization`,
      cleanupFn: config.cleanupFn
    });

    try {
      return await TimeoutManager.withTimeout(optimizationFn, timeoutConfig);
    } catch (error) {
      const errorInfo = ErrorHandler.categorizeError(error, {
        processor: this.format,
        operation: 'optimization'
      });
      
      ErrorHandler.logError(errorInfo, `${this.format.toUpperCase()} Processor`);
      throw error;
    }
  }
}