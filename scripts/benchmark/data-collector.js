/**
 * Data Collector
 * Extracts restoration data from component files
 */

import fs from 'fs';
import path from 'path';
import { BENCHMARK_CONFIG } from './config.js';
import { readJsonFile, getFileModificationTime, logWithTimestamp } from './utils.js';

/**
 * Interface for restoration data
 * @typedef {Object} RestorationData
 * @property {string} componentName - Component name
 * @property {string} status - Status (completed, pending, failed, not_tested)
 * @property {number|null} matchPercentage - Restoration accuracy percentage
 * @property {number|null} diffPixels - Number of different pixels
 * @property {number|null} totalPixels - Total number of pixels
 * @property {Object|null} dimensions - Image dimensions {width, height}
 * @property {string|null} timestamp - Last update timestamp
 * @property {number} assetCount - Number of assets
 * @property {string|null} figmaNodeId - Figma node ID
 * @property {string|null} figmaFileKey - Figma file key
 * @property {Object} metadata - Full metadata object
 * @property {Object} resultsInfo - Results file information
 */

export class DataCollector {
  constructor() {
    this.collectedData = [];
  }

  /**
   * Collect restoration data from component info
   * @param {ComponentInfo} componentInfo - Component information from scanner
   * @returns {RestorationData} Restoration data
   */
  collectRestorationData(componentInfo) {
    logWithTimestamp(`Collecting data for component: ${componentInfo.name}`);

    const metadata = this.parseMetadata(componentInfo.path);
    const resultsInfo = this.analyzeResults(componentInfo.path);
    
    const restorationData = {
      componentName: componentInfo.name,
      status: this.determineStatus(componentInfo, metadata, resultsInfo),
      matchPercentage: this.extractMatchPercentage(metadata),
      diffPixels: this.extractDiffPixels(metadata),
      totalPixels: this.extractTotalPixels(metadata),
      dimensions: this.extractDimensions(metadata),
      timestamp: this.extractTimestamp(metadata, resultsInfo),
      assetCount: componentInfo.assetCount,
      figmaNodeId: this.extractFigmaNodeId(metadata),
      figmaFileKey: this.extractFigmaFileKey(metadata),
      metadata: metadata || {},
      resultsInfo
    };

    this.collectedData.push(restorationData);
    
    logWithTimestamp(`Data collected for ${componentInfo.name}: ${restorationData.status} (${restorationData.matchPercentage || 'N/A'}%)`);
    
    return restorationData;
  }

  /**
   * Parse metadata.json file
   * @param {string} componentPath - Path to component directory
   * @returns {Object|null} Parsed metadata or null if not found/invalid
   */
  parseMetadata(componentPath) {
    const metadataPath = path.join(componentPath, BENCHMARK_CONFIG.METADATA_FILE);
    
    try {
      const metadata = readJsonFile(metadataPath);
      
      if (!metadata) {
        logWithTimestamp(`No metadata found for component at: ${componentPath}`, 'warn');
        return null;
      }

      // Validate metadata structure
      if (!this.validateMetadataStructure(metadata)) {
        logWithTimestamp(`Invalid metadata structure for component at: ${componentPath}`, 'warn');
        return metadata; // Return anyway, but log warning
      }

      return metadata;
    } catch (error) {
      logWithTimestamp(`Error parsing metadata for ${componentPath}: ${error.message}`, 'error');
      return null;
    }
  }

  /**
   * Validate metadata structure
   * @param {Object} metadata - Metadata object
   * @returns {boolean} True if structure is valid
   */
  validateMetadataStructure(metadata) {
    const requiredFields = ['componentName'];
    const optionalFields = [
      'figmaNodeId', 
      'figmaFileKey', 
      'dimensions', 
      'restorationData',
      'assets',
      'colors',
      'fonts',
      'createdAt'
    ];

    // Check required fields
    for (const field of requiredFields) {
      if (!(field in metadata)) {
        logWithTimestamp(`Missing required field in metadata: ${field}`, 'warn');
        return false;
      }
    }

    // Validate restorationData structure if present
    if (metadata.restorationData) {
      const restorationFields = ['status', 'matchPercentage', 'diffPixels', 'totalPixels', 'timestamp'];
      const restoration = metadata.restorationData;
      
      // Check if it has the expected structure
      const hasValidStructure = restorationFields.some(field => field in restoration);
      if (!hasValidStructure) {
        logWithTimestamp('Invalid restorationData structure in metadata', 'warn');
      }
    }

    return true;
  }

  /**
   * Analyze results directory contents
   * @param {string} componentPath - Path to component directory
   * @returns {Object} Results analysis
   */
  analyzeResults(componentPath) {
    const resultsDir = path.join(componentPath, 'results');
    
    const analysis = {
      hasResultsDir: fs.existsSync(resultsDir),
      expectedImage: null,
      actualImage: null,
      diffImage: null,
      lastModified: null
    };

    if (!analysis.hasResultsDir) {
      return analysis;
    }

    try {
      // Analyze expected.png
      const expectedPath = path.join(resultsDir, BENCHMARK_CONFIG.EXPECTED_IMAGE);
      if (fs.existsSync(expectedPath)) {
        const stats = fs.statSync(expectedPath);
        analysis.expectedImage = {
          exists: true,
          size: stats.size,
          modified: stats.mtime
        };
        analysis.lastModified = stats.mtime;
      } else {
        analysis.expectedImage = { exists: false };
      }

      // Analyze actual.png
      const actualPath = path.join(resultsDir, BENCHMARK_CONFIG.ACTUAL_IMAGE);
      if (fs.existsSync(actualPath)) {
        const stats = fs.statSync(actualPath);
        analysis.actualImage = {
          exists: true,
          size: stats.size,
          modified: stats.mtime
        };
        if (!analysis.lastModified || stats.mtime > analysis.lastModified) {
          analysis.lastModified = stats.mtime;
        }
      } else {
        analysis.actualImage = { exists: false };
      }

      // Analyze diff.png
      const diffPath = path.join(resultsDir, BENCHMARK_CONFIG.DIFF_IMAGE);
      if (fs.existsSync(diffPath)) {
        const stats = fs.statSync(diffPath);
        analysis.diffImage = {
          exists: true,
          size: stats.size,
          modified: stats.mtime
        };
        if (!analysis.lastModified || stats.mtime > analysis.lastModified) {
          analysis.lastModified = stats.mtime;
        }
      } else {
        analysis.diffImage = { exists: false };
      }

    } catch (error) {
      logWithTimestamp(`Error analyzing results for ${componentPath}: ${error.message}`, 'error');
    }

    return analysis;
  }

  /**
   * Determine component status based on available data
   * @param {ComponentInfo} componentInfo - Component info
   * @param {Object|null} metadata - Parsed metadata
   * @param {Object} resultsInfo - Results analysis
   * @returns {string} Component status
   */
  determineStatus(componentInfo, metadata, resultsInfo) {
    // If no metadata, it's not tested
    if (!metadata) {
      return BENCHMARK_CONFIG.STATUS.NOT_TESTED;
    }

    // Check if restoration data exists in metadata
    if (metadata.restorationData && metadata.restorationData.status) {
      const metadataStatus = metadata.restorationData.status;
      
      // Validate status against file existence
      if (metadataStatus === BENCHMARK_CONFIG.STATUS.COMPLETED) {
        // For completed status, we need expected, actual, and diff images
        if (resultsInfo.expectedImage?.exists && 
            resultsInfo.actualImage?.exists && 
            resultsInfo.diffImage?.exists) {
          return BENCHMARK_CONFIG.STATUS.COMPLETED;
        } else {
          // Status says completed but files are missing
          return BENCHMARK_CONFIG.STATUS.FAILED;
        }
      }
      
      return metadataStatus;
    }

    // Determine status based on file existence
    if (!resultsInfo.expectedImage?.exists) {
      return BENCHMARK_CONFIG.STATUS.NOT_TESTED;
    }

    if (resultsInfo.expectedImage?.exists && !resultsInfo.actualImage?.exists) {
      return BENCHMARK_CONFIG.STATUS.PENDING;
    }

    if (resultsInfo.expectedImage?.exists && 
        resultsInfo.actualImage?.exists && 
        !resultsInfo.diffImage?.exists) {
      return BENCHMARK_CONFIG.STATUS.FAILED;
    }

    if (resultsInfo.expectedImage?.exists && 
        resultsInfo.actualImage?.exists && 
        resultsInfo.diffImage?.exists) {
      return BENCHMARK_CONFIG.STATUS.COMPLETED;
    }

    return BENCHMARK_CONFIG.STATUS.NOT_TESTED;
  }

  /**
   * Extract match percentage from metadata
   * @param {Object|null} metadata - Metadata object
   * @returns {number|null} Match percentage
   */
  extractMatchPercentage(metadata) {
    if (!metadata || !metadata.restorationData) {
      return null;
    }

    const matchPercentage = metadata.restorationData.matchPercentage;
    
    if (typeof matchPercentage === 'number' && matchPercentage >= 0 && matchPercentage <= 100) {
      return matchPercentage;
    }

    return null;
  }

  /**
   * Extract diff pixels from metadata
   * @param {Object|null} metadata - Metadata object
   * @returns {number|null} Diff pixels count
   */
  extractDiffPixels(metadata) {
    if (!metadata || !metadata.restorationData) {
      return null;
    }

    const diffPixels = metadata.restorationData.diffPixels;
    
    if (typeof diffPixels === 'number' && diffPixels >= 0) {
      return diffPixels;
    }

    return null;
  }

  /**
   * Extract total pixels from metadata
   * @param {Object|null} metadata - Metadata object
   * @returns {number|null} Total pixels count
   */
  extractTotalPixels(metadata) {
    if (!metadata || !metadata.restorationData) {
      return null;
    }

    const totalPixels = metadata.restorationData.totalPixels;
    
    if (typeof totalPixels === 'number' && totalPixels > 0) {
      return totalPixels;
    }

    return null;
  }

  /**
   * Extract dimensions from metadata
   * @param {Object|null} metadata - Metadata object
   * @returns {Object|null} Dimensions {width, height}
   */
  extractDimensions(metadata) {
    if (!metadata) {
      return null;
    }

    // Try restorationData first
    if (metadata.restorationData && metadata.restorationData.dimensions) {
      const dims = metadata.restorationData.dimensions;
      if (dims.width && dims.height) {
        return { width: dims.width, height: dims.height };
      }
    }

    // Try main dimensions field
    if (metadata.dimensions) {
      const dims = metadata.dimensions;
      if (dims.width && dims.height) {
        return { width: dims.width, height: dims.height };
      }
    }

    return null;
  }

  /**
   * Extract timestamp from metadata or results
   * @param {Object|null} metadata - Metadata object
   * @param {Object} resultsInfo - Results analysis
   * @returns {string|null} ISO timestamp
   */
  extractTimestamp(metadata, resultsInfo) {
    // Try restoration data timestamp first
    if (metadata && metadata.restorationData && metadata.restorationData.timestamp) {
      return metadata.restorationData.timestamp;
    }

    // Use last modified time from results
    if (resultsInfo.lastModified) {
      return resultsInfo.lastModified.toISOString();
    }

    // Try created at from metadata
    if (metadata && metadata.createdAt) {
      return metadata.createdAt;
    }

    return null;
  }

  /**
   * Extract Figma node ID from metadata
   * @param {Object|null} metadata - Metadata object
   * @returns {string|null} Figma node ID
   */
  extractFigmaNodeId(metadata) {
    if (!metadata) {
      return null;
    }

    return metadata.figmaNodeId || null;
  }

  /**
   * Extract Figma file key from metadata
   * @param {Object|null} metadata - Metadata object
   * @returns {string|null} Figma file key
   */
  extractFigmaFileKey(metadata) {
    if (!metadata) {
      return null;
    }

    return metadata.figmaFileKey || null;
  }

  /**
   * Get all collected data
   * @returns {RestorationData[]} All collected restoration data
   */
  getAllData() {
    return [...this.collectedData];
  }

  /**
   * Clear collected data
   */
  clearData() {
    this.collectedData = [];
  }

  /**
   * Get data by status
   * @param {string} status - Status to filter by
   * @returns {RestorationData[]} Filtered data
   */
  getDataByStatus(status) {
    return this.collectedData.filter(data => data.status === status);
  }

  /**
   * Get data summary statistics
   * @returns {Object} Summary statistics
   */
  getDataSummary() {
    const total = this.collectedData.length;
    const byStatus = {};
    
    // Count by status
    for (const status of Object.values(BENCHMARK_CONFIG.STATUS)) {
      byStatus[status] = this.collectedData.filter(data => data.status === status).length;
    }

    // Calculate accuracy statistics for completed components
    const completedData = this.collectedData.filter(data => 
      data.status === BENCHMARK_CONFIG.STATUS.COMPLETED && 
      data.matchPercentage !== null
    );

    let accuracyStats = {
      count: 0,
      average: null,
      median: null,
      min: null,
      max: null
    };

    if (completedData.length > 0) {
      const accuracies = completedData.map(data => data.matchPercentage).sort((a, b) => a - b);
      
      accuracyStats = {
        count: accuracies.length,
        average: accuracies.reduce((sum, acc) => sum + acc, 0) / accuracies.length,
        median: accuracies[Math.floor(accuracies.length / 2)],
        min: accuracies[0],
        max: accuracies[accuracies.length - 1]
      };
    }

    return {
      totalComponents: total,
      byStatus,
      accuracyStats,
      completionRate: total > 0 ? (byStatus[BENCHMARK_CONFIG.STATUS.COMPLETED] / total) * 100 : 0
    };
  }

  /**
   * Analyze image file properties
   * @param {string} imagePath - Path to image file
   * @returns {Object|null} Image analysis or null if file doesn't exist
   */
  analyzeImageFile(imagePath) {
    if (!fs.existsSync(imagePath)) {
      return null;
    }

    try {
      const stats = fs.statSync(imagePath);
      const analysis = {
        exists: true,
        size: stats.size,
        sizeFormatted: this.formatFileSize(stats.size),
        modified: stats.mtime,
        extension: path.extname(imagePath).toLowerCase()
      };

      // Try to extract image dimensions if it's a PNG file
      if (analysis.extension === '.png') {
        try {
          const dimensions = this.extractPngDimensions(imagePath);
          if (dimensions) {
            analysis.width = dimensions.width;
            analysis.height = dimensions.height;
            analysis.totalPixels = dimensions.width * dimensions.height;
          }
        } catch (error) {
          logWithTimestamp(`Could not extract PNG dimensions from ${imagePath}: ${error.message}`, 'warn');
        }
      }

      return analysis;
    } catch (error) {
      logWithTimestamp(`Error analyzing image file ${imagePath}: ${error.message}`, 'error');
      return null;
    }
  }

  /**
   * Extract PNG dimensions from file header
   * @param {string} pngPath - Path to PNG file
   * @returns {Object|null} Dimensions {width, height} or null
   */
  extractPngDimensions(pngPath) {
    try {
      const buffer = fs.readFileSync(pngPath);
      
      // Check PNG signature
      if (buffer.length < 24 || 
          buffer[0] !== 0x89 || buffer[1] !== 0x50 || 
          buffer[2] !== 0x4E || buffer[3] !== 0x47) {
        return null;
      }

      // Read IHDR chunk (starts at byte 16)
      const width = buffer.readUInt32BE(16);
      const height = buffer.readUInt32BE(20);

      return { width, height };
    } catch (error) {
      return null;
    }
  }

  /**
   * Analyze results directory comprehensively
   * @param {string} componentPath - Path to component directory
   * @returns {Object} Enhanced results analysis
   */
  analyzeResultsComprehensive(componentPath) {
    const resultsDir = path.join(componentPath, 'results');
    const componentName = path.basename(componentPath);
    
    const analysis = {
      componentName,
      hasResultsDir: fs.existsSync(resultsDir),
      images: {},
      timeline: [],
      status: BENCHMARK_CONFIG.STATUS.NOT_TESTED,
      completeness: 0
    };

    if (!analysis.hasResultsDir) {
      return analysis;
    }

    try {
      // Analyze each image type
      const imageTypes = [
        { key: 'expected', filename: BENCHMARK_CONFIG.EXPECTED_IMAGE },
        { key: 'actual', filename: BENCHMARK_CONFIG.ACTUAL_IMAGE },
        { key: 'diff', filename: BENCHMARK_CONFIG.DIFF_IMAGE }
      ];

      for (const imageType of imageTypes) {
        const imagePath = path.join(resultsDir, imageType.filename);
        const imageAnalysis = this.analyzeImageFile(imagePath);
        
        analysis.images[imageType.key] = imageAnalysis || { exists: false };
        
        if (imageAnalysis) {
          analysis.timeline.push({
            type: imageType.key,
            timestamp: imageAnalysis.modified,
            size: imageAnalysis.size
          });
        }
      }

      // Sort timeline by timestamp
      analysis.timeline.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

      // Determine status and completeness
      const hasExpected = analysis.images.expected.exists;
      const hasActual = analysis.images.actual.exists;
      const hasDiff = analysis.images.diff.exists;

      if (!hasExpected) {
        analysis.status = BENCHMARK_CONFIG.STATUS.NOT_TESTED;
        analysis.completeness = 0;
      } else if (hasExpected && !hasActual) {
        analysis.status = BENCHMARK_CONFIG.STATUS.PENDING;
        analysis.completeness = 33;
      } else if (hasExpected && hasActual && !hasDiff) {
        analysis.status = BENCHMARK_CONFIG.STATUS.FAILED;
        analysis.completeness = 66;
      } else if (hasExpected && hasActual && hasDiff) {
        analysis.status = BENCHMARK_CONFIG.STATUS.COMPLETED;
        analysis.completeness = 100;
      }

      // Add validation checks
      analysis.validation = this.validateResultsConsistency(analysis);

    } catch (error) {
      logWithTimestamp(`Error in comprehensive results analysis for ${componentName}: ${error.message}`, 'error');
      analysis.error = error.message;
    }

    return analysis;
  }

  /**
   * Validate consistency of results files
   * @param {Object} analysis - Results analysis object
   * @returns {Object} Validation results
   */
  validateResultsConsistency(analysis) {
    const validation = {
      isValid: true,
      warnings: [],
      errors: []
    };

    const { expected, actual, diff } = analysis.images;

    // Check if dimensions match between expected and actual
    if (expected.exists && actual.exists) {
      if (expected.width && actual.width && expected.width !== actual.width) {
        validation.warnings.push(`Width mismatch: expected ${expected.width}px, actual ${actual.width}px`);
        validation.isValid = false;
      }
      
      if (expected.height && actual.height && expected.height !== actual.height) {
        validation.warnings.push(`Height mismatch: expected ${expected.height}px, actual ${actual.height}px`);
        validation.isValid = false;
      }
    }

    // Check file sizes for anomalies
    if (expected.exists && expected.size < 1000) {
      validation.warnings.push(`Expected image is very small (${expected.sizeFormatted})`);
    }

    if (actual.exists && actual.size < 1000) {
      validation.warnings.push(`Actual image is very small (${actual.sizeFormatted})`);
    }

    if (diff.exists && diff.size > expected.size * 2) {
      validation.warnings.push(`Diff image is unusually large (${diff.sizeFormatted})`);
    }

    // Check timeline consistency
    if (analysis.timeline.length >= 2) {
      const expectedTime = analysis.timeline.find(t => t.type === 'expected')?.timestamp;
      const actualTime = analysis.timeline.find(t => t.type === 'actual')?.timestamp;
      
      if (expectedTime && actualTime && new Date(actualTime) < new Date(expectedTime)) {
        validation.warnings.push('Actual image is older than expected image');
      }
    }

    return validation;
  }

  /**
   * Extract historical data from results
   * @param {string} componentPath - Path to component directory
   * @returns {Object[]} Historical data points
   */
  extractHistoricalData(componentPath) {
    const resultsDir = path.join(componentPath, 'results');
    const historical = [];

    if (!fs.existsSync(resultsDir)) {
      return historical;
    }

    try {
      // Look for backup or versioned files
      const files = fs.readdirSync(resultsDir);
      const versionedFiles = files.filter(file => 
        file.includes('backup') || 
        file.includes('_v') || 
        file.match(/\d{4}-\d{2}-\d{2}/)
      );

      for (const file of versionedFiles) {
        const filePath = path.join(resultsDir, file);
        const stats = fs.statSync(filePath);
        
        historical.push({
          filename: file,
          timestamp: stats.mtime,
          size: stats.size,
          type: this.inferFileType(file)
        });
      }

      // Sort by timestamp
      historical.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    } catch (error) {
      logWithTimestamp(`Error extracting historical data for ${path.basename(componentPath)}: ${error.message}`, 'warn');
    }

    return historical;
  }

  /**
   * Infer file type from filename
   * @param {string} filename - File name
   * @returns {string} Inferred file type
   */
  inferFileType(filename) {
    if (filename.includes('expected')) return 'expected';
    if (filename.includes('actual')) return 'actual';
    if (filename.includes('diff')) return 'diff';
    if (filename.includes('backup')) return 'backup';
    return 'unknown';
  }

  /**
   * Format file size for display
   * @param {number} bytes - File size in bytes
   * @returns {string} Formatted file size
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Create enhanced restoration data with comprehensive analysis
   * @param {ComponentInfo} componentInfo - Component information
   * @returns {RestorationData} Enhanced restoration data
   */
  createEnhancedRestorationData(componentInfo) {
    const basicData = this.collectRestorationData(componentInfo);
    const comprehensiveResults = this.analyzeResultsComprehensive(componentInfo.path);
    const historicalData = this.extractHistoricalData(componentInfo.path);

    return {
      ...basicData,
      enhancedResults: comprehensiveResults,
      historicalData,
      analysisTimestamp: new Date().toISOString()
    };
  }
}