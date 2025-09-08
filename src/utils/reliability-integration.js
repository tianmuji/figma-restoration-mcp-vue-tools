/**
 * Reliability Integration - Integrate resource management and health monitoring
 * 
 * This module provides integration points for resource management and health monitoring
 * into the existing reliability enhancement system.
 */

import { globalResourceManager } from './resource-manager.js';
import { globalHealthMonitor } from './health-monitor.js';
import { globalConfig } from './config-manager.js';
import { globalRecoveryManager } from './error-recovery-strategies.js';

/**
 * Reliability Integration Manager
 */
export class ReliabilityIntegration {
  constructor() {
    this.initialized = false;
    this.components = {
      resourceManager: globalResourceManager,
      healthMonitor: globalHealthMonitor,
      configManager: globalConfig,
      recoveryManager: globalRecoveryManager
    };
  }

  /**
   * Initialize all reliability components
   * @param {Object} options - Integration options
   */
  async initialize(options = {}) {
    if (this.initialized) return;

    const config = {
      enableResourceManagement: true,
      enableHealthMonitoring: true,
      enableAutoCleanup: true,
      enableMetrics: true,
      ...options
    };

    try {
      // Initialize resource management
      if (config.enableResourceManagement) {
        await this.initializeResourceManagement(config);
      }

      // Initialize health monitoring
      if (config.enableHealthMonitoring) {
        await this.initializeHealthMonitoring(config);
      }

      // Setup integration between components
      this.setupComponentIntegration();

      this.initialized = true;
      console.log('✅ Reliability integration initialized successfully');

    } catch (error) {
      console.error('❌ Failed to initialize reliability integration:', error.message);
      throw error;
    }
  }

  /**
   * Initialize resource management
   * @param {Object} config - Configuration options
   */
  async initializeResourceManagement(config) {
    const resourceManager = this.components.resourceManager;

    // Configure resource manager based on config
    if (config.resourceManagement) {
      Object.assign(resourceManager.options, config.resourceManagement);
    }

    // Start auto cleanup if enabled
    if (config.enableAutoCleanup && resourceManager.options.enableAutoCleanup) {
      resourceManager.startAutoCleanup();
    }

    // Start monitoring if enabled
    if (config.enableMetrics && resourceManager.options.enableMonitoring) {
      resourceManager.startMonitoring();
    }

    console.log('🧹 Resource management initialized');
  }

  /**
   * Initialize health monitoring
   * @param {Object} config - Configuration options
   */
  async initializeHealthMonitoring(config) {
    const healthMonitor = this.components.healthMonitor;

    // Configure health monitor based on config
    if (config.healthMonitoring) {
      Object.assign(healthMonitor.options, config.healthMonitoring);
    }

    // Start health monitoring if enabled
    if (config.enableHealthMonitoring) {
      healthMonitor.start();
    }

    console.log('🏥 Health monitoring initialized');
  }

  /**
   * Setup integration between components
   */
  setupComponentIntegration() {
    const { resourceManager, healthMonitor, recoveryManager } = this.components;

    // Resource manager events -> Health monitor metrics
    resourceManager.on('autoCleanupCompleted', (data) => {
      healthMonitor.recordMetric('resource_cleanup', {
        filesRemoved: data.filesRemoved,
        bytesFreed: data.bytesFreed,
        resourcesCleaned: data.resourcesCleaned,
        timestamp: Date.now()
      });
    });

    resourceManager.on('memoryWarning', (data) => {
      healthMonitor.recordMetric('memory_warning', {
        usage: data.usage,
        threshold: data.threshold,
        timestamp: Date.now()
      });
    });

    resourceManager.on('diskWarning', (data) => {
      healthMonitor.recordMetric('disk_warning', {
        usage: data.usage,
        threshold: data.threshold,
        path: data.path,
        timestamp: Date.now()
      });
    });

    // Health monitor alerts -> Recovery manager
    healthMonitor.on('alert', (alert) => {
      if (alert.severity === 'critical') {
        // Trigger emergency cleanup for critical alerts
        this.handleCriticalAlert(alert);
      }
    });

    console.log('🔗 Component integration configured');
  }

  /**
   * Handle critical alerts
   * @param {Object} alert - Critical alert
   */
  async handleCriticalAlert(alert) {
    const { resourceManager } = this.components;

    console.warn(`🚨 Critical alert: ${alert.message}`);

    try {
      // Perform emergency cleanup
      if (alert.healthCheckId === 'system_memory' || alert.healthCheckId === 'disk_space') {
        console.log('🧹 Performing emergency cleanup...');
        await resourceManager.performAutoCleanup();
      }

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
        console.log('🗑️ Forced garbage collection');
      }

    } catch (error) {
      console.error('❌ Emergency cleanup failed:', error.message);
    }
  }

  /**
   * Get comprehensive system status
   * @returns {Promise<Object>} - System status
   */
  async getSystemStatus() {
    const { resourceManager, healthMonitor, recoveryManager } = this.components;

    const [
      resourceHealth,
      overallHealth,
      recoveryStats,
      resourceStats
    ] = await Promise.all([
      resourceManager.getHealthStatus(),
      healthMonitor.getOverallHealth(),
      recoveryManager.getGlobalStatistics(),
      resourceManager.getStatistics()
    ]);

    return {
      timestamp: new Date().toISOString(),
      overall: {
        status: this.calculateOverallStatus([
          resourceHealth.status,
          overallHealth.status
        ]),
        initialized: this.initialized
      },
      resources: {
        health: resourceHealth,
        statistics: resourceStats
      },
      health: overallHealth,
      recovery: recoveryStats,
      integration: {
        componentsActive: Object.keys(this.components).length,
        resourceManagementActive: resourceManager.options.enableAutoCleanup,
        healthMonitoringActive: healthMonitor.isRunning,
        metricsEnabled: healthMonitor.options.enableMetrics
      }
    };
  }

  /**
   * Calculate overall system status
   * @param {Array<string>} statuses - Individual component statuses
   * @returns {string} - Overall status
   */
  calculateOverallStatus(statuses) {
    if (statuses.includes('critical')) return 'critical';
    if (statuses.includes('warning')) return 'warning';
    return 'healthy';
  }

  /**
   * Perform system maintenance
   * @param {Object} options - Maintenance options
   */
  async performMaintenance(options = {}) {
    const {
      forceCleanup = false,
      clearMetrics = false,
      resetCounters = false
    } = options;

    console.log('🔧 Starting system maintenance...');

    const { resourceManager, healthMonitor, recoveryManager } = this.components;

    try {
      // Resource cleanup
      if (forceCleanup) {
        await resourceManager.performAutoCleanup();
        console.log('✅ Resource cleanup completed');
      }

      // Clear old metrics
      if (clearMetrics) {
        healthMonitor.cleanupOldMetrics();
        console.log('✅ Old metrics cleared');
      }

      // Reset recovery counters
      if (resetCounters) {
        recoveryManager.clearHistory();
        console.log('✅ Recovery counters reset');
      }

      console.log('✅ System maintenance completed');

    } catch (error) {
      console.error('❌ System maintenance failed:', error.message);
      throw error;
    }
  }

  /**
   * Shutdown all reliability components
   */
  async shutdown() {
    if (!this.initialized) return;

    console.log('🛑 Shutting down reliability integration...');

    const { resourceManager, healthMonitor } = this.components;

    try {
      // Stop health monitoring
      healthMonitor.stop();

      // Stop resource management
      resourceManager.stopAutoCleanup();
      resourceManager.stopMonitoring();

      // Perform final cleanup
      await resourceManager.cleanup();

      this.initialized = false;
      console.log('✅ Reliability integration shutdown completed');

    } catch (error) {
      console.error('❌ Shutdown failed:', error.message);
      throw error;
    }
  }

  /**
   * Get integration statistics
   * @returns {Object} - Integration statistics
   */
  getStatistics() {
    const { resourceManager, healthMonitor, recoveryManager } = this.components;

    return {
      initialized: this.initialized,
      uptime: process.uptime(),
      components: {
        resourceManager: {
          active: resourceManager.options.enableAutoCleanup,
          statistics: resourceManager.getStatistics()
        },
        healthMonitor: {
          active: healthMonitor.isRunning,
          checksRegistered: healthMonitor.healthChecks.size,
          metricsCollected: healthMonitor.metrics.size,
          alertsGenerated: healthMonitor.alerts.length
        },
        recoveryManager: {
          statistics: recoveryManager.getGlobalStatistics()
        }
      },
      memory: process.memoryUsage(),
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Global reliability integration instance
 */
export const globalReliabilityIntegration = new ReliabilityIntegration();

/**
 * Initialize reliability integration with default configuration
 * @param {Object} options - Configuration options
 * @returns {Promise<void>}
 */
export async function initializeReliability(options = {}) {
  await globalReliabilityIntegration.initialize(options);
}

/**
 * Get system status
 * @returns {Promise<Object>} - System status
 */
export async function getSystemStatus() {
  return await globalReliabilityIntegration.getSystemStatus();
}

/**
 * Perform system maintenance
 * @param {Object} options - Maintenance options
 * @returns {Promise<void>}
 */
export async function performSystemMaintenance(options = {}) {
  await globalReliabilityIntegration.performMaintenance(options);
}

/**
 * Shutdown reliability system
 * @returns {Promise<void>}
 */
export async function shutdownReliability() {
  await globalReliabilityIntegration.shutdown();
}

/**
 * Reliability-enhanced function decorator
 * @param {Object} options - Enhancement options
 * @returns {Function} - Decorator function
 */
export function withReliability(options = {}) {
  return function(target, propertyKey, descriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function(...args) {
      const operationId = `${target.constructor.name}_${propertyKey}_${Date.now()}`;
      
      // Register operation
      globalResourceManager.registerOperation(operationId, {
        class: target.constructor.name,
        method: propertyKey,
        timestamp: Date.now()
      });

      try {
        const result = await originalMethod.apply(this, args);
        
        // Complete operation successfully
        await globalResourceManager.completeOperation(operationId, { 
          success: true, 
          result 
        });

        // Record success metric
        globalHealthMonitor.recordMetric(`${target.constructor.name}_${propertyKey}_success`, {
          timestamp: Date.now(),
          duration: Date.now() - parseInt(operationId.split('_').pop())
        });

        return result;

      } catch (error) {
        // Complete operation with error
        await globalResourceManager.completeOperation(operationId, { 
          success: false, 
          error: error.message 
        });

        // Record error metric
        globalHealthMonitor.recordMetric(`${target.constructor.name}_${propertyKey}_error`, {
          timestamp: Date.now(),
          error: error.message
        });

        throw error;
      }
    };

    return descriptor;
  };
}

// Auto-initialize on import if not in test environment
if (process.env.NODE_ENV !== 'test' && !process.env.DISABLE_AUTO_INIT) {
  initializeReliability().catch(error => {
    console.warn('⚠️ Auto-initialization failed:', error.message);
  });
}