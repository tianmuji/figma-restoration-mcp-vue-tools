/**
 * Component Scanner
 * Discovers and analyzes all components in the project
 */

import fs from 'fs';
import path from 'path';
import { BENCHMARK_CONFIG } from './config.js';
import { directoryExists, fileExists, logWithTimestamp } from './utils.js';

/**
 * Interface for component information
 * @typedef {Object} ComponentInfo
 * @property {string} name - Component name
 * @property {string} path - Component directory path
 * @property {boolean} hasMetadata - Whether metadata.json exists
 * @property {boolean} hasResults - Whether results directory exists
 * @property {boolean} hasExpected - Whether expected.png exists
 * @property {boolean} hasActual - Whether actual.png exists
 * @property {boolean} hasDiff - Whether diff.png exists
 * @property {number} assetCount - Number of assets in images directory
 * @property {string[]} assets - List of asset filenames
 * @property {boolean} hasImages - Whether images directory exists
 */

export class ComponentScanner {
  constructor(componentsDir = BENCHMARK_CONFIG.COMPONENTS_DIR) {
    this.componentsDir = path.resolve(componentsDir);
    this.scannedComponents = [];
  }

  /**
   * Scan all components in the components directory
   * @returns {ComponentInfo[]} Array of component information
   */
  scanComponents() {
    logWithTimestamp(`Starting component scan in: ${this.componentsDir}`);
    
    if (!directoryExists(this.componentsDir)) {
      logWithTimestamp(`Components directory not found: ${this.componentsDir}`, 'warn');
      return [];
    }

    try {
      const entries = fs.readdirSync(this.componentsDir);
      const components = [];

      for (const entry of entries) {
        const entryPath = path.join(this.componentsDir, entry);
        
        // Skip files, only process directories
        if (!directoryExists(entryPath)) {
          continue;
        }

        // Skip common non-component directories
        if (this.shouldSkipDirectory(entry)) {
          continue;
        }

        const componentInfo = this.validateComponentStructure(entryPath);
        if (componentInfo) {
          components.push(componentInfo);
        }
      }

      this.scannedComponents = components;
      logWithTimestamp(`Component scan completed. Found ${components.length} components`);
      
      return components;
    } catch (error) {
      logWithTimestamp(`Error scanning components: ${error.message}`, 'error');
      return [];
    }
  }

  /**
   * Validate component structure and extract information
   * @param {string} componentPath - Path to component directory
   * @returns {ComponentInfo|null} Component information or null if invalid
   */
  validateComponentStructure(componentPath) {
    try {
      const componentName = path.basename(componentPath);
      
      // Check for metadata.json
      const metadataPath = path.join(componentPath, BENCHMARK_CONFIG.METADATA_FILE);
      const hasMetadata = fileExists(metadataPath);

      // Check for results directory and its contents
      const resultsDir = path.join(componentPath, 'results');
      const hasResults = directoryExists(resultsDir);
      
      const expectedPath = path.join(resultsDir, BENCHMARK_CONFIG.EXPECTED_IMAGE);
      const actualPath = path.join(resultsDir, BENCHMARK_CONFIG.ACTUAL_IMAGE);
      const diffPath = path.join(resultsDir, BENCHMARK_CONFIG.DIFF_IMAGE);
      
      const hasExpected = fileExists(expectedPath);
      const hasActual = fileExists(actualPath);
      const hasDiff = fileExists(diffPath);

      // Check for images directory and count assets
      const imagesDir = path.join(componentPath, 'images');
      const hasImages = directoryExists(imagesDir);
      
      let assetCount = 0;
      let assets = [];
      
      if (hasImages) {
        try {
          const imageFiles = fs.readdirSync(imagesDir);
          assets = imageFiles.filter(file => this.isAssetFile(file));
          assetCount = assets.length;
        } catch (error) {
          logWithTimestamp(`Error reading images directory for ${componentName}: ${error.message}`, 'warn');
        }
      }

      const componentInfo = {
        name: componentName,
        path: componentPath,
        hasMetadata,
        hasResults,
        hasExpected,
        hasActual,
        hasDiff,
        assetCount,
        assets,
        hasImages
      };

      logWithTimestamp(`Scanned component: ${componentName} (metadata: ${hasMetadata}, results: ${hasResults}, assets: ${assetCount})`);
      
      return componentInfo;
    } catch (error) {
      logWithTimestamp(`Error validating component structure at ${componentPath}: ${error.message}`, 'error');
      return null;
    }
  }

  /**
   * Check if a directory should be skipped during scanning
   * @param {string} dirName - Directory name
   * @returns {boolean} True if directory should be skipped
   */
  shouldSkipDirectory(dirName) {
    const skipPatterns = [
      '__tests__',
      '__mocks__',
      'node_modules',
      '.git',
      '.DS_Store',
      'dist',
      'build'
    ];

    return skipPatterns.some(pattern => 
      dirName.startsWith(pattern) || dirName === pattern
    );
  }

  /**
   * Check if a file is considered an asset
   * @param {string} filename - File name
   * @returns {boolean} True if file is an asset
   */
  isAssetFile(filename) {
    const assetExtensions = ['.svg', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.ico'];
    const ext = path.extname(filename).toLowerCase();
    return assetExtensions.includes(ext);
  }

  /**
   * Get components by status
   * @param {string} status - Status to filter by
   * @returns {ComponentInfo[]} Filtered components
   */
  getComponentsByStatus(status) {
    return this.scannedComponents.filter(component => {
      switch (status) {
        case 'complete':
          return component.hasMetadata && component.hasResults && component.hasExpected;
        case 'pending':
          return component.hasMetadata && component.hasExpected && !component.hasActual;
        case 'failed':
          return component.hasMetadata && component.hasExpected && component.hasActual && !component.hasDiff;
        case 'not_tested':
          return !component.hasMetadata || !component.hasExpected;
        default:
          return true;
      }
    });
  }

  /**
   * Get summary statistics of scanned components
   * @returns {Object} Summary statistics
   */
  getScanSummary() {
    const total = this.scannedComponents.length;
    const withMetadata = this.scannedComponents.filter(c => c.hasMetadata).length;
    const withResults = this.scannedComponents.filter(c => c.hasResults).length;
    const withExpected = this.scannedComponents.filter(c => c.hasExpected).length;
    const withActual = this.scannedComponents.filter(c => c.hasActual).length;
    const withDiff = this.scannedComponents.filter(c => c.hasDiff).length;
    const totalAssets = this.scannedComponents.reduce((sum, c) => sum + c.assetCount, 0);

    return {
      totalComponents: total,
      withMetadata,
      withResults,
      withExpected,
      withActual,
      withDiff,
      totalAssets,
      completionRate: total > 0 ? (withDiff / total) * 100 : 0
    };
  }

  /**
   * Find component by name
   * @param {string} componentName - Name of component to find
   * @returns {ComponentInfo|null} Component info or null if not found
   */
  findComponent(componentName) {
    return this.scannedComponents.find(c => c.name === componentName) || null;
  }

  /**
   * Get all scanned components
   * @returns {ComponentInfo[]} All scanned components
   */
  getAllComponents() {
    return [...this.scannedComponents];
  }

  /**
   * Analyze assets in component's images directory
   * @param {string} componentPath - Path to component directory
   * @returns {Object} Asset analysis results
   */
  analyzeAssets(componentPath) {
    const imagesDir = path.join(componentPath, 'images');
    
    if (!directoryExists(imagesDir)) {
      return {
        totalAssets: 0,
        assetTypes: {},
        assetSizes: {},
        optimizedAssets: 0,
        largeAssets: []
      };
    }

    try {
      const files = fs.readdirSync(imagesDir);
      const assets = files.filter(file => this.isAssetFile(file));
      
      const analysis = {
        totalAssets: assets.length,
        assetTypes: {},
        assetSizes: {},
        optimizedAssets: 0,
        largeAssets: []
      };

      for (const asset of assets) {
        const assetPath = path.join(imagesDir, asset);
        const ext = path.extname(asset).toLowerCase();
        const stats = fs.statSync(assetPath);
        
        // Count by type
        analysis.assetTypes[ext] = (analysis.assetTypes[ext] || 0) + 1;
        
        // Track file sizes
        analysis.assetSizes[asset] = stats.size;
        
        // Check if asset is optimized (SVG files under 10KB, PNG files under 50KB)
        const isOptimized = (ext === '.svg' && stats.size < 10240) || 
                           (ext === '.png' && stats.size < 51200) ||
                           (ext === '.jpg' && stats.size < 51200);
        
        if (isOptimized) {
          analysis.optimizedAssets++;
        }
        
        // Track large assets (over 100KB)
        if (stats.size > 102400) {
          analysis.largeAssets.push({
            name: asset,
            size: stats.size,
            sizeFormatted: this.formatFileSize(stats.size)
          });
        }
      }

      return analysis;
    } catch (error) {
      logWithTimestamp(`Error analyzing assets for ${path.basename(componentPath)}: ${error.message}`, 'warn');
      return {
        totalAssets: 0,
        assetTypes: {},
        assetSizes: {},
        optimizedAssets: 0,
        largeAssets: []
      };
    }
  }

  /**
   * Validate result files and extract metadata
   * @param {string} componentPath - Path to component directory
   * @returns {Object} Results validation data
   */
  validateResultFiles(componentPath) {
    const resultsDir = path.join(componentPath, 'results');
    
    if (!directoryExists(resultsDir)) {
      return {
        hasResults: false,
        expectedExists: false,
        actualExists: false,
        diffExists: false,
        expectedSize: null,
        actualSize: null,
        diffSize: null,
        lastModified: null
      };
    }

    const expectedPath = path.join(resultsDir, BENCHMARK_CONFIG.EXPECTED_IMAGE);
    const actualPath = path.join(resultsDir, BENCHMARK_CONFIG.ACTUAL_IMAGE);
    const diffPath = path.join(resultsDir, BENCHMARK_CONFIG.DIFF_IMAGE);

    const validation = {
      hasResults: true,
      expectedExists: fileExists(expectedPath),
      actualExists: fileExists(actualPath),
      diffExists: fileExists(diffPath),
      expectedSize: null,
      actualSize: null,
      diffSize: null,
      lastModified: null
    };

    try {
      if (validation.expectedExists) {
        const stats = fs.statSync(expectedPath);
        validation.expectedSize = stats.size;
        validation.lastModified = stats.mtime;
      }

      if (validation.actualExists) {
        const stats = fs.statSync(actualPath);
        validation.actualSize = stats.size;
        if (!validation.lastModified || stats.mtime > validation.lastModified) {
          validation.lastModified = stats.mtime;
        }
      }

      if (validation.diffExists) {
        const stats = fs.statSync(diffPath);
        validation.diffSize = stats.size;
        if (!validation.lastModified || stats.mtime > validation.lastModified) {
          validation.lastModified = stats.mtime;
        }
      }
    } catch (error) {
      logWithTimestamp(`Error validating result files for ${path.basename(componentPath)}: ${error.message}`, 'warn');
    }

    return validation;
  }

  /**
   * Create comprehensive component inventory
   * @param {ComponentInfo} componentInfo - Basic component info
   * @returns {Object} Enhanced component inventory
   */
  createComponentInventory(componentInfo) {
    const assetAnalysis = this.analyzeAssets(componentInfo.path);
    const resultsValidation = this.validateResultFiles(componentInfo.path);
    
    return {
      ...componentInfo,
      assetAnalysis,
      resultsValidation,
      inventory: {
        totalFiles: this.countTotalFiles(componentInfo.path),
        directories: this.listDirectories(componentInfo.path),
        lastActivity: this.getLastActivity(componentInfo.path)
      }
    };
  }

  /**
   * Count total files in component directory
   * @param {string} componentPath - Path to component directory
   * @returns {number} Total file count
   */
  countTotalFiles(componentPath) {
    try {
      let count = 0;
      const countFilesRecursive = (dir) => {
        const entries = fs.readdirSync(dir);
        for (const entry of entries) {
          const entryPath = path.join(dir, entry);
          const stats = fs.statSync(entryPath);
          if (stats.isFile()) {
            count++;
          } else if (stats.isDirectory()) {
            countFilesRecursive(entryPath);
          }
        }
      };
      countFilesRecursive(componentPath);
      return count;
    } catch (error) {
      return 0;
    }
  }

  /**
   * List directories in component
   * @param {string} componentPath - Path to component directory
   * @returns {string[]} List of directory names
   */
  listDirectories(componentPath) {
    try {
      const entries = fs.readdirSync(componentPath);
      return entries.filter(entry => {
        const entryPath = path.join(componentPath, entry);
        return directoryExists(entryPath);
      });
    } catch (error) {
      return [];
    }
  }

  /**
   * Get last activity timestamp for component
   * @param {string} componentPath - Path to component directory
   * @returns {Date|null} Last modification time
   */
  getLastActivity(componentPath) {
    try {
      let lastModified = null;
      
      const checkFilesRecursive = (dir) => {
        const entries = fs.readdirSync(dir);
        for (const entry of entries) {
          const entryPath = path.join(dir, entry);
          const stats = fs.statSync(entryPath);
          
          if (stats.isFile()) {
            if (!lastModified || stats.mtime > lastModified) {
              lastModified = stats.mtime;
            }
          } else if (stats.isDirectory()) {
            checkFilesRecursive(entryPath);
          }
        }
      };
      
      checkFilesRecursive(componentPath);
      return lastModified;
    } catch (error) {
      return null;
    }
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
}