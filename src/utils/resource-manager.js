/**
 * Resource Manager - Automatic cleanup and resource tracking
 * 
 * This module provides comprehensive resource management including:
 * - Automatic cleanup of temporary files and resources
 * - Resource usage tracking with warning thresholds
 * - Cleanup mechanisms for interrupted operations
 * - Memory and disk space monitoring
 */

import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { EventEmitter } from 'events';

/**
 * Resource Manager for automatic cleanup and monitoring
 */
export class ResourceManager extends EventEmitter {
  constructor(options = {}) {
    super();
    
    this.options = {
      tempDir: options.tempDir || os.tmpdir(),
      maxTempFiles: options.maxTempFiles || 100,
      maxTempSize: options.maxTempSize || 100 * 1024 * 1024, // 100MB
      cleanupInterval: options.cleanupInterval || 300000, // 5 minutes
      memoryThreshold: options.memoryThreshold || 0.8, // 80%
      diskThreshold: options.diskThreshold || 0.9, // 90%
      enableAutoCleanup: options.enableAutoCleanup !== false,
      enableMonitoring: options.enableMonitoring !== false,
      ...options
    };

    this.resources = new Map(); // Track active resources
    this.tempFiles = new Set(); // Track temporary files
    this.operations = new Map(); // Track active operations
    this.cleanupInterval = null;
    this.monitoringInterval = null;
    this.stats = {
      totalCleanups: 0,
      filesRemoved: 0,
      bytesFreed: 0,
      operationsTracked: 0,
      warningsIssued: 0
    };

    this.initialize();
  }

  /**
   * Initialize resource manager
   */
  initialize() {
    if (this.options.enableAutoCleanup) {
      this.startAutoCleanup();
    }

    if (this.options.enableMonitoring) {
      this.startMonitoring();
    }

    // Handle process exit
    process.on('exit', () => this.cleanup());
    process.on('SIGINT', () => this.cleanup());
    process.on('SIGTERM', () => this.cleanup());
    process.on('uncaughtException', () => this.cleanup());
  }

  /**
   * Register a resource for tracking
   * @param {string} resourceId - Unique resource identifier
   * @param {Object} resource - Resource information
   */
  registerResource(resourceId, resource) {
    this.resources.set(resourceId, {
      ...resource,
      createdAt: Date.now(),
      lastAccessed: Date.now(),
      type: resource.type || 'unknown'
    });

    this.emit('resourceRegistered', { resourceId, resource });
  }

  /**
   * Unregister a resource
   * @param {string} resourceId - Resource identifier
   */
  unregisterResource(resourceId) {
    const resource = this.resources.get(resourceId);
    if (resource) {
      this.resources.delete(resourceId);
      this.emit('resourceUnregistered', { resourceId, resource });
    }
  }

  /**
   * Register a temporary file for cleanup
   * @param {string} filePath - Path to temporary file
   * @param {Object} options - File options
   */
  registerTempFile(filePath, options = {}) {
    const fileInfo = {
      path: filePath,
      createdAt: Date.now(),
      size: options.size || 0,
      operation: options.operation || 'unknown',
      autoCleanup: options.autoCleanup !== false
    };

    this.tempFiles.add(JSON.stringify(fileInfo));
    this.emit('tempFileRegistered', fileInfo);

    return filePath;
  }

  /**
   * Unregister a temporary file
   * @param {string} filePath - Path to temporary file
   */
  unregisterTempFile(filePath) {
    for (const fileInfoStr of this.tempFiles) {
      const fileInfo = JSON.parse(fileInfoStr);
      if (fileInfo.path === filePath) {
        this.tempFiles.delete(fileInfoStr);
        this.emit('tempFileUnregistered', fileInfo);
        break;
      }
    }
  }

  /**
   * Register an operation for tracking
   * @param {string} operationId - Operation identifier
   * @param {Object} operation - Operation information
   */
  registerOperation(operationId, operation) {
    this.operations.set(operationId, {
      ...operation,
      startTime: Date.now(),
      status: 'running',
      resources: new Set(),
      tempFiles: new Set()
    });

    this.stats.operationsTracked++;
    this.emit('operationRegistered', { operationId, operation });
  }

  /**
   * Complete an operation and cleanup its resources
   * @param {string} operationId - Operation identifier
   * @param {Object} result - Operation result
   */
  async completeOperation(operationId, result = {}) {
    const operation = this.operations.get(operationId);
    if (!operation) return;

    operation.status = result.success ? 'completed' : 'failed';
    operation.endTime = Date.now();
    operation.result = result;

    // Cleanup operation resources
    await this.cleanupOperationResources(operationId);

    this.operations.delete(operationId);
    this.emit('operationCompleted', { operationId, operation });
  }

  /**
   * Cleanup resources for a specific operation
   * @param {string} operationId - Operation identifier
   */
  async cleanupOperationResources(operationId) {
    const operation = this.operations.get(operationId);
    if (!operation) return;

    let cleanedFiles = 0;
    let bytesFreed = 0;

    // Cleanup temporary files
    for (const filePath of operation.tempFiles) {
      try {
        const stats = await fs.stat(filePath);
        await fs.unlink(filePath);
        cleanedFiles++;
        bytesFreed += stats.size;
        this.unregisterTempFile(filePath);
      } catch (error) {
        // File might already be deleted
      }
    }

    // Cleanup other resources
    for (const resourceId of operation.resources) {
      await this.cleanupResource(resourceId);
    }

    this.stats.filesRemoved += cleanedFiles;
    this.stats.bytesFreed += bytesFreed;

    this.emit('operationResourcesCleaned', {
      operationId,
      filesRemoved: cleanedFiles,
      bytesFreed
    });
  }

  /**
   * Cleanup a specific resource
   * @param {string} resourceId - Resource identifier
   */
  async cleanupResource(resourceId) {
    const resource = this.resources.get(resourceId);
    if (!resource) return;

    try {
      switch (resource.type) {
        case 'file':
          if (resource.path) {
            await fs.unlink(resource.path);
          }
          break;
        case 'directory':
          if (resource.path) {
            await fs.rmdir(resource.path, { recursive: true });
          }
          break;
        case 'stream':
          if (resource.stream && typeof resource.stream.destroy === 'function') {
            resource.stream.destroy();
          }
          break;
        case 'process':
          if (resource.process && typeof resource.process.kill === 'function') {
            resource.process.kill();
          }
          break;
      }

      this.unregisterResource(resourceId);
      this.emit('resourceCleaned', { resourceId, resource });

    } catch (error) {
      this.emit('resourceCleanupError', { resourceId, resource, error });
    }
  }

  /**
   * Start automatic cleanup process
   */
  startAutoCleanup() {
    if (this.cleanupInterval) return;

    this.cleanupInterval = setInterval(async () => {
      await this.performAutoCleanup();
    }, this.options.cleanupInterval);

    this.emit('autoCleanupStarted');
  }

  /**
   * Stop automatic cleanup process
   */
  stopAutoCleanup() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
      this.emit('autoCleanupStopped');
    }
  }

  /**
   * Perform automatic cleanup
   */
  async performAutoCleanup() {
    const now = Date.now();
    let cleanedFiles = 0;
    let bytesFreed = 0;

    // Cleanup old temporary files
    const tempFilesToRemove = [];
    for (const fileInfoStr of this.tempFiles) {
      const fileInfo = JSON.parse(fileInfoStr);
      const age = now - fileInfo.createdAt;
      
      // Remove files older than 1 hour or if we have too many
      if (age > 3600000 || this.tempFiles.size > this.options.maxTempFiles) {
        tempFilesToRemove.push(fileInfo);
      }
    }

    for (const fileInfo of tempFilesToRemove) {
      try {
        const stats = await fs.stat(fileInfo.path);
        await fs.unlink(fileInfo.path);
        cleanedFiles++;
        bytesFreed += stats.size;
        this.unregisterTempFile(fileInfo.path);
      } catch (error) {
        // File might already be deleted
      }
    }

    // Cleanup stale resources
    const resourcesToCleanup = [];
    for (const [resourceId, resource] of this.resources) {
      const age = now - resource.lastAccessed;
      
      // Remove resources not accessed for 2 hours
      if (age > 7200000) {
        resourcesToCleanup.push(resourceId);
      }
    }

    for (const resourceId of resourcesToCleanup) {
      await this.cleanupResource(resourceId);
    }

    // Cleanup interrupted operations (running for more than 1 hour)
    const operationsToCleanup = [];
    for (const [operationId, operation] of this.operations) {
      const age = now - operation.startTime;
      
      if (operation.status === 'running' && age > 3600000) {
        operationsToCleanup.push(operationId);
      }
    }

    for (const operationId of operationsToCleanup) {
      await this.completeOperation(operationId, { 
        success: false, 
        error: 'Operation timed out and was cleaned up' 
      });
    }

    this.stats.totalCleanups++;
    this.stats.filesRemoved += cleanedFiles;
    this.stats.bytesFreed += bytesFreed;

    if (cleanedFiles > 0 || resourcesToCleanup.length > 0 || operationsToCleanup.length > 0) {
      this.emit('autoCleanupCompleted', {
        filesRemoved: cleanedFiles,
        bytesFreed,
        resourcesCleaned: resourcesToCleanup.length,
        operationsCleaned: operationsToCleanup.length
      });
    }
  }

  /**
   * Start resource monitoring
   */
  startMonitoring() {
    if (this.monitoringInterval) return;

    this.monitoringInterval = setInterval(async () => {
      await this.performMonitoring();
    }, 60000); // Check every minute

    this.emit('monitoringStarted');
  }

  /**
   * Stop resource monitoring
   */
  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      this.emit('monitoringStopped');
    }
  }

  /**
   * Perform resource monitoring
   */
  async performMonitoring() {
    const memoryUsage = process.memoryUsage();
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const memoryUsagePercent = (totalMemory - freeMemory) / totalMemory;

    // Check memory usage
    if (memoryUsagePercent > this.options.memoryThreshold) {
      this.stats.warningsIssued++;
      this.emit('memoryWarning', {
        usage: memoryUsagePercent,
        threshold: this.options.memoryThreshold,
        totalMemory,
        freeMemory,
        processMemory: memoryUsage
      });
    }

    // Check disk usage for temp directory
    try {
      const tempDirStats = await this.getDiskUsage(this.options.tempDir);
      if (tempDirStats.usagePercent > this.options.diskThreshold) {
        this.stats.warningsIssued++;
        this.emit('diskWarning', {
          usage: tempDirStats.usagePercent,
          threshold: this.options.diskThreshold,
          path: this.options.tempDir,
          ...tempDirStats
        });
      }
    } catch (error) {
      this.emit('monitoringError', { type: 'disk', error });
    }

    // Check temp file accumulation
    const tempFileCount = this.tempFiles.size;
    const tempFileSize = await this.calculateTempFileSize();

    if (tempFileCount > this.options.maxTempFiles) {
      this.stats.warningsIssued++;
      this.emit('tempFileWarning', {
        count: tempFileCount,
        maxCount: this.options.maxTempFiles,
        totalSize: tempFileSize
      });
    }

    if (tempFileSize > this.options.maxTempSize) {
      this.stats.warningsIssued++;
      this.emit('tempSizeWarning', {
        size: tempFileSize,
        maxSize: this.options.maxTempSize,
        count: tempFileCount
      });
    }

    this.emit('monitoringUpdate', {
      memory: {
        usage: memoryUsagePercent,
        process: memoryUsage,
        system: { total: totalMemory, free: freeMemory }
      },
      tempFiles: {
        count: tempFileCount,
        size: tempFileSize
      },
      resources: this.resources.size,
      operations: this.operations.size
    });
  }

  /**
   * Get disk usage for a path
   * @param {string} dirPath - Directory path
   * @returns {Promise<Object>} - Disk usage information
   */
  async getDiskUsage(dirPath) {
    try {
      const stats = await fs.statfs(dirPath);
      const total = stats.blocks * stats.blksize;
      const free = stats.bavail * stats.blksize;
      const used = total - free;
      const usagePercent = used / total;

      return {
        total,
        used,
        free,
        usagePercent
      };
    } catch (error) {
      // Fallback for systems without statfs
      return {
        total: 0,
        used: 0,
        free: 0,
        usagePercent: 0
      };
    }
  }

  /**
   * Calculate total size of temporary files
   * @returns {Promise<number>} - Total size in bytes
   */
  async calculateTempFileSize() {
    let totalSize = 0;

    for (const fileInfoStr of this.tempFiles) {
      const fileInfo = JSON.parse(fileInfoStr);
      try {
        const stats = await fs.stat(fileInfo.path);
        totalSize += stats.size;
      } catch (error) {
        // File might not exist
      }
    }

    return totalSize;
  }

  /**
   * Force cleanup of all resources
   */
  async cleanup() {
    this.stopAutoCleanup();
    this.stopMonitoring();

    // Cleanup all temporary files
    for (const fileInfoStr of this.tempFiles) {
      const fileInfo = JSON.parse(fileInfoStr);
      try {
        await fs.unlink(fileInfo.path);
      } catch (error) {
        // Ignore errors during cleanup
      }
    }

    // Cleanup all resources
    for (const resourceId of this.resources.keys()) {
      await this.cleanupResource(resourceId);
    }

    // Complete all operations
    for (const operationId of this.operations.keys()) {
      await this.completeOperation(operationId, { 
        success: false, 
        error: 'Operation interrupted by cleanup' 
      });
    }

    this.emit('cleanupCompleted');
  }

  /**
   * Get resource manager statistics
   * @returns {Object} - Statistics
   */
  getStatistics() {
    return {
      ...this.stats,
      activeResources: this.resources.size,
      activeTempFiles: this.tempFiles.size,
      activeOperations: this.operations.size,
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage()
    };
  }

  /**
   * Get health status
   * @returns {Promise<Object>} - Health status
   */
  async getHealthStatus() {
    const memoryUsage = process.memoryUsage();
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const memoryUsagePercent = (totalMemory - freeMemory) / totalMemory;

    const tempFileCount = this.tempFiles.size;
    const tempFileSize = await this.calculateTempFileSize();

    const issues = [];
    const warnings = [];

    // Check for issues
    if (memoryUsagePercent > 0.95) {
      issues.push('Critical memory usage');
    } else if (memoryUsagePercent > this.options.memoryThreshold) {
      warnings.push('High memory usage');
    }

    if (tempFileCount > this.options.maxTempFiles * 1.5) {
      issues.push('Excessive temporary files');
    } else if (tempFileCount > this.options.maxTempFiles) {
      warnings.push('High temporary file count');
    }

    if (tempFileSize > this.options.maxTempSize * 1.5) {
      issues.push('Excessive temporary file size');
    } else if (tempFileSize > this.options.maxTempSize) {
      warnings.push('High temporary file size');
    }

    const health = issues.length === 0 ? 
      (warnings.length === 0 ? 'healthy' : 'warning') : 'critical';

    return {
      status: health,
      issues,
      warnings,
      metrics: {
        memory: {
          usage: memoryUsagePercent,
          process: memoryUsage,
          system: { total: totalMemory, free: freeMemory }
        },
        tempFiles: {
          count: tempFileCount,
          size: tempFileSize,
          maxCount: this.options.maxTempFiles,
          maxSize: this.options.maxTempSize
        },
        resources: {
          active: this.resources.size,
          operations: this.operations.size
        }
      },
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Create a temporary file with automatic cleanup
   * @param {string} prefix - File prefix
   * @param {string} suffix - File suffix
   * @param {Object} options - Options
   * @returns {Promise<string>} - Temporary file path
   */
  async createTempFile(prefix = 'tmp', suffix = '', options = {}) {
    const tempDir = options.dir || this.options.tempDir;
    const fileName = `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 8)}${suffix}`;
    const filePath = path.join(tempDir, fileName);

    // Ensure directory exists
    await fs.mkdir(tempDir, { recursive: true });

    // Create empty file
    await fs.writeFile(filePath, '');

    // Register for cleanup
    this.registerTempFile(filePath, {
      operation: options.operation,
      autoCleanup: options.autoCleanup !== false
    });

    return filePath;
  }

  /**
   * Create a temporary directory with automatic cleanup
   * @param {string} prefix - Directory prefix
   * @param {Object} options - Options
   * @returns {Promise<string>} - Temporary directory path
   */
  async createTempDir(prefix = 'tmpdir', options = {}) {
    const tempDir = options.dir || this.options.tempDir;
    const dirName = `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
    const dirPath = path.join(tempDir, dirName);

    await fs.mkdir(dirPath, { recursive: true });

    // Register as resource
    const resourceId = `tempdir_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
    this.registerResource(resourceId, {
      type: 'directory',
      path: dirPath,
      operation: options.operation,
      autoCleanup: options.autoCleanup !== false
    });

    return dirPath;
  }
}

/**
 * Global resource manager instance
 */
export const globalResourceManager = new ResourceManager();

/**
 * Resource cleanup decorator for functions
 * @param {Object} options - Decorator options
 * @returns {Function} - Decorator function
 */
export function withResourceCleanup(options = {}) {
  return function(target, propertyKey, descriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function(...args) {
      const operationId = `${target.constructor.name}_${propertyKey}_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
      
      globalResourceManager.registerOperation(operationId, {
        class: target.constructor.name,
        method: propertyKey,
        args: options.logArgs ? args : undefined
      });

      try {
        const result = await originalMethod.apply(this, args);
        await globalResourceManager.completeOperation(operationId, { success: true, result });
        return result;
      } catch (error) {
        await globalResourceManager.completeOperation(operationId, { success: false, error: error.message });
        throw error;
      }
    };

    return descriptor;
  };
}

/**
 * Resource tracking mixin for classes
 * @param {Class} BaseClass - Base class to extend
 * @returns {Class} - Extended class with resource tracking
 */
export function withResourceTracking(BaseClass) {
  return class extends BaseClass {
    constructor(...args) {
      super(...args);
      this.resourceManager = globalResourceManager;
      this.operationId = null;
    }

    startOperation(operationName, details = {}) {
      this.operationId = `${this.constructor.name}_${operationName}_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
      this.resourceManager.registerOperation(this.operationId, {
        class: this.constructor.name,
        operation: operationName,
        ...details
      });
      return this.operationId;
    }

    async completeOperation(result = {}) {
      if (this.operationId) {
        await this.resourceManager.completeOperation(this.operationId, result);
        this.operationId = null;
      }
    }

    registerTempFile(filePath, options = {}) {
      const result = this.resourceManager.registerTempFile(filePath, {
        ...options,
        operation: this.operationId
      });

      // Add to current operation if active
      if (this.operationId) {
        const operation = this.resourceManager.operations.get(this.operationId);
        if (operation) {
          operation.tempFiles.add(filePath);
        }
      }

      return result;
    }

    registerResource(resourceId, resource) {
      this.resourceManager.registerResource(resourceId, resource);

      // Add to current operation if active
      if (this.operationId) {
        const operation = this.resourceManager.operations.get(this.operationId);
        if (operation) {
          operation.resources.add(resourceId);
        }
      }

      return resourceId;
    }
  };
}