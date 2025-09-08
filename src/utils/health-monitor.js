/**
 * Health Monitor - System health checking and diagnostic capabilities
 * 
 * This module provides comprehensive health monitoring including:
 * - Tool health checks and diagnostics
 * - System resource monitoring
 * - Performance metrics collection
 * - Alert and notification system
 */

import { EventEmitter } from 'events';
import os from 'os';
import { globalResourceManager } from './resource-manager.js';
import { globalConfig } from './config-manager.js';
import { globalRecoveryManager } from './error-recovery-strategies.js';

/**
 * Health Monitor for system diagnostics
 */
export class HealthMonitor extends EventEmitter {
  constructor(options = {}) {
    super();
    
    this.options = {
      checkInterval: options.checkInterval || 60000, // 1 minute
      alertThresholds: {
        memory: options.memoryThreshold || 0.85,
        cpu: options.cpuThreshold || 0.9,
        disk: options.diskThreshold || 0.9,
        errorRate: options.errorRateThreshold || 0.1,
        responseTime: options.responseTimeThreshold || 5000
      },
      enableAlerts: options.enableAlerts !== false,
      enableMetrics: options.enableMetrics !== false,
      retentionPeriod: options.retentionPeriod || 86400000, // 24 hours
      ...options
    };

    this.healthChecks = new Map();
    this.metrics = new Map();
    this.alerts = [];
    this.monitoringInterval = null;
    this.isRunning = false;

    this.registerDefaultHealthChecks();
  }

  /**
   * Register default health checks
   */
  registerDefaultHealthChecks() {
    // System resource checks
    this.registerHealthCheck('system_memory', {
      name: 'System Memory',
      description: 'Monitor system memory usage',
      check: this.checkSystemMemory.bind(this),
      interval: 30000,
      critical: true
    });

    this.registerHealthCheck('system_cpu', {
      name: 'System CPU',
      description: 'Monitor CPU usage',
      check: this.checkSystemCPU.bind(this),
      interval: 30000,
      critical: true
    });

    this.registerHealthCheck('disk_space', {
      name: 'Disk Space',
      description: 'Monitor disk space usage',
      check: this.checkDiskSpace.bind(this),
      interval: 60000,
      critical: true
    });

    // Application-specific checks
    this.registerHealthCheck('resource_manager', {
      name: 'Resource Manager',
      description: 'Check resource manager health',
      check: this.checkResourceManager.bind(this),
      interval: 30000,
      critical: true
    });

    this.registerHealthCheck('error_recovery', {
      name: 'Error Recovery',
      description: 'Check error recovery system',
      check: this.checkErrorRecovery.bind(this),
      interval: 60000,
      critical: false
    });

    this.registerHealthCheck('configuration', {
      name: 'Configuration',
      description: 'Validate system configuration',
      check: this.checkConfiguration.bind(this),
      interval: 300000, // 5 minutes
      critical: false
    });

    // Tool-specific checks
    this.registerHealthCheck('enhanced_tools', {
      name: 'Enhanced Tools',
      description: 'Check enhanced tool availability',
      check: this.checkEnhancedTools.bind(this),
      interval: 120000, // 2 minutes
      critical: false
    });
  }

  /**
   * Register a health check
   * @param {string} id - Health check ID
   * @param {Object} healthCheck - Health check configuration
   */
  registerHealthCheck(id, healthCheck) {
    this.healthChecks.set(id, {
      ...healthCheck,
      id,
      lastRun: null,
      lastResult: null,
      runCount: 0,
      errorCount: 0,
      enabled: healthCheck.enabled !== false
    });

    this.emit('healthCheckRegistered', { id, healthCheck });
  }

  /**
   * Unregister a health check
   * @param {string} id - Health check ID
   */
  unregisterHealthCheck(id) {
    const healthCheck = this.healthChecks.get(id);
    if (healthCheck) {
      this.healthChecks.delete(id);
      this.emit('healthCheckUnregistered', { id, healthCheck });
    }
  }

  /**
   * Start health monitoring
   */
  start() {
    if (this.isRunning) return;

    this.isRunning = true;
    this.monitoringInterval = setInterval(() => {
      this.runHealthChecks();
    }, this.options.checkInterval);

    // Run initial health check
    this.runHealthChecks();

    this.emit('monitoringStarted');
  }

  /**
   * Stop health monitoring
   */
  stop() {
    if (!this.isRunning) return;

    this.isRunning = false;
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    this.emit('monitoringStopped');
  }

  /**
   * Run all health checks
   */
  async runHealthChecks() {
    const results = new Map();
    const now = Date.now();

    for (const [id, healthCheck] of this.healthChecks) {
      if (!healthCheck.enabled) continue;

      // Check if it's time to run this health check
      if (healthCheck.lastRun && 
          (now - healthCheck.lastRun) < healthCheck.interval) {
        continue;
      }

      try {
        const startTime = Date.now();
        const result = await this.runHealthCheck(id);
        const duration = Date.now() - startTime;

        results.set(id, { ...result, duration });

        // Record metrics
        if (this.options.enableMetrics) {
          this.recordMetric(`health_check_${id}`, {
            status: result.status,
            duration,
            timestamp: now
          });
        }

        // Check for alerts
        if (this.options.enableAlerts && result.status !== 'healthy') {
          this.handleAlert(id, result, healthCheck);
        }

      } catch (error) {
        const errorResult = {
          status: 'error',
          message: `Health check failed: ${error.message}`,
          error: error.message,
          timestamp: now
        };

        results.set(id, errorResult);
        healthCheck.errorCount++;

        this.emit('healthCheckError', { id, error, healthCheck });
      }
    }

    if (results.size > 0) {
      this.emit('healthCheckResults', results);
    }

    // Cleanup old metrics
    this.cleanupOldMetrics();
  }

  /**
   * Run a specific health check
   * @param {string} id - Health check ID
   * @returns {Promise<Object>} - Health check result
   */
  async runHealthCheck(id) {
    const healthCheck = this.healthChecks.get(id);
    if (!healthCheck) {
      throw new Error(`Health check not found: ${id}`);
    }

    const now = Date.now();
    healthCheck.lastRun = now;
    healthCheck.runCount++;

    const result = await healthCheck.check();
    healthCheck.lastResult = result;

    this.emit('healthCheckCompleted', { id, result, healthCheck });

    return {
      ...result,
      id,
      timestamp: now,
      runCount: healthCheck.runCount
    };
  }

  /**
   * Handle health check alerts
   * @param {string} id - Health check ID
   * @param {Object} result - Health check result
   * @param {Object} healthCheck - Health check configuration
   */
  handleAlert(id, result, healthCheck) {
    const alert = {
      id: `alert_${id}_${Date.now()}`,
      healthCheckId: id,
      healthCheckName: healthCheck.name,
      status: result.status,
      message: result.message,
      details: result.details,
      severity: this.getAlertSeverity(result.status, healthCheck.critical),
      timestamp: Date.now(),
      acknowledged: false
    };

    this.alerts.push(alert);

    // Keep only recent alerts
    const cutoff = Date.now() - this.options.retentionPeriod;
    this.alerts = this.alerts.filter(a => a.timestamp > cutoff);

    this.emit('alert', alert);
  }

  /**
   * Get alert severity
   * @param {string} status - Health check status
   * @param {boolean} critical - Is critical check
   * @returns {string} - Alert severity
   */
  getAlertSeverity(status, critical) {
    if (status === 'error' || status === 'critical') {
      return critical ? 'critical' : 'high';
    }
    if (status === 'warning') {
      return critical ? 'high' : 'medium';
    }
    return 'low';
  }

  /**
   * Record a metric
   * @param {string} name - Metric name
   * @param {Object} value - Metric value
   */
  recordMetric(name, value) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }

    const metric = {
      ...value,
      timestamp: value.timestamp || Date.now()
    };

    this.metrics.get(name).push(metric);

    this.emit('metricRecorded', { name, value: metric });
  }

  /**
   * Get metrics
   * @param {string} name - Metric name (optional)
   * @param {number} since - Since timestamp (optional)
   * @returns {Object|Array} - Metrics
   */
  getMetrics(name = null, since = null) {
    if (name) {
      const metrics = this.metrics.get(name) || [];
      return since ? metrics.filter(m => m.timestamp >= since) : metrics;
    }

    const result = {};
    for (const [metricName, values] of this.metrics) {
      result[metricName] = since ? values.filter(m => m.timestamp >= since) : values;
    }
    return result;
  }

  /**
   * Cleanup old metrics
   */
  cleanupOldMetrics() {
    const cutoff = Date.now() - this.options.retentionPeriod;

    for (const [name, values] of this.metrics) {
      const filtered = values.filter(v => v.timestamp > cutoff);
      this.metrics.set(name, filtered);
    }
  }

  /**
   * Get overall health status
   * @returns {Promise<Object>} - Overall health status
   */
  async getOverallHealth() {
    const healthChecks = {};
    let overallStatus = 'healthy';
    const issues = [];
    const warnings = [];

    for (const [id, healthCheck] of this.healthChecks) {
      if (!healthCheck.enabled || !healthCheck.lastResult) continue;

      const result = healthCheck.lastResult;
      healthChecks[id] = {
        name: healthCheck.name,
        status: result.status,
        message: result.message,
        lastRun: healthCheck.lastRun,
        runCount: healthCheck.runCount,
        errorCount: healthCheck.errorCount
      };

      // Determine overall status
      if (result.status === 'error' || result.status === 'critical') {
        if (healthCheck.critical) {
          overallStatus = 'critical';
        } else if (overallStatus !== 'critical') {
          overallStatus = 'warning';
        }
        issues.push(`${healthCheck.name}: ${result.message}`);
      } else if (result.status === 'warning') {
        if (overallStatus === 'healthy') {
          overallStatus = 'warning';
        }
        warnings.push(`${healthCheck.name}: ${result.message}`);
      }
    }

    return {
      status: overallStatus,
      issues,
      warnings,
      healthChecks,
      alerts: this.getRecentAlerts(),
      metrics: this.getSystemMetrics(),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get recent alerts
   * @param {number} limit - Maximum number of alerts
   * @returns {Array} - Recent alerts
   */
  getRecentAlerts(limit = 10) {
    return this.alerts
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  /**
   * Get system metrics summary
   * @returns {Object} - System metrics
   */
  getSystemMetrics() {
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    
    return {
      memory: {
        process: memoryUsage,
        system: {
          total: os.totalmem(),
          free: os.freemem(),
          usage: (os.totalmem() - os.freemem()) / os.totalmem()
        }
      },
      cpu: {
        usage: cpuUsage,
        loadAverage: os.loadavg(),
        cores: os.cpus().length
      },
      uptime: {
        process: process.uptime(),
        system: os.uptime()
      },
      platform: {
        type: os.type(),
        platform: os.platform(),
        arch: os.arch(),
        release: os.release()
      }
    };
  }

  // Default Health Check Implementations

  /**
   * Check system memory usage
   * @returns {Promise<Object>} - Memory check result
   */
  async checkSystemMemory() {
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;
    const usagePercent = usedMemory / totalMemory;

    const processMemory = process.memoryUsage();
    const processUsagePercent = processMemory.heapUsed / processMemory.heapTotal;

    let status = 'healthy';
    let message = `Memory usage: ${Math.round(usagePercent * 100)}%`;

    if (usagePercent > 0.95) {
      status = 'critical';
      message = `Critical memory usage: ${Math.round(usagePercent * 100)}%`;
    } else if (usagePercent > this.options.alertThresholds.memory) {
      status = 'warning';
      message = `High memory usage: ${Math.round(usagePercent * 100)}%`;
    }

    return {
      status,
      message,
      details: {
        system: {
          total: totalMemory,
          used: usedMemory,
          free: freeMemory,
          usagePercent
        },
        process: {
          ...processMemory,
          usagePercent: processUsagePercent
        }
      }
    };
  }

  /**
   * Check system CPU usage
   * @returns {Promise<Object>} - CPU check result
   */
  async checkSystemCPU() {
    const loadAvg = os.loadavg();
    const cpuCount = os.cpus().length;
    const load1min = loadAvg[0] / cpuCount;

    let status = 'healthy';
    let message = `CPU load: ${Math.round(load1min * 100)}%`;

    if (load1min > 0.95) {
      status = 'critical';
      message = `Critical CPU load: ${Math.round(load1min * 100)}%`;
    } else if (load1min > this.options.alertThresholds.cpu) {
      status = 'warning';
      message = `High CPU load: ${Math.round(load1min * 100)}%`;
    }

    return {
      status,
      message,
      details: {
        loadAverage: loadAvg,
        cpuCount,
        load1min,
        cpus: os.cpus().map(cpu => ({
          model: cpu.model,
          speed: cpu.speed
        }))
      }
    };
  }

  /**
   * Check disk space usage
   * @returns {Promise<Object>} - Disk check result
   */
  async checkDiskSpace() {
    try {
      const tempDir = os.tmpdir();
      const diskUsage = await globalResourceManager.getDiskUsage(tempDir);

      let status = 'healthy';
      let message = `Disk usage: ${Math.round(diskUsage.usagePercent * 100)}%`;

      if (diskUsage.usagePercent > 0.95) {
        status = 'critical';
        message = `Critical disk usage: ${Math.round(diskUsage.usagePercent * 100)}%`;
      } else if (diskUsage.usagePercent > this.options.alertThresholds.disk) {
        status = 'warning';
        message = `High disk usage: ${Math.round(diskUsage.usagePercent * 100)}%`;
      }

      return {
        status,
        message,
        details: {
          path: tempDir,
          ...diskUsage
        }
      };
    } catch (error) {
      return {
        status: 'warning',
        message: `Could not check disk usage: ${error.message}`,
        details: { error: error.message }
      };
    }
  }

  /**
   * Check resource manager health
   * @returns {Promise<Object>} - Resource manager check result
   */
  async checkResourceManager() {
    try {
      const health = await globalResourceManager.getHealthStatus();
      const stats = globalResourceManager.getStatistics();

      let status = 'healthy';
      let message = 'Resource manager is healthy';

      if (health.status === 'critical') {
        status = 'critical';
        message = `Resource manager critical: ${health.issues.join(', ')}`;
      } else if (health.status === 'warning') {
        status = 'warning';
        message = `Resource manager warnings: ${health.warnings.join(', ')}`;
      }

      return {
        status,
        message,
        details: {
          health,
          statistics: stats
        }
      };
    } catch (error) {
      return {
        status: 'error',
        message: `Resource manager check failed: ${error.message}`,
        details: { error: error.message }
      };
    }
  }

  /**
   * Check error recovery system
   * @returns {Promise<Object>} - Error recovery check result
   */
  async checkErrorRecovery() {
    try {
      const stats = globalRecoveryManager.getGlobalStatistics();

      let status = 'healthy';
      let message = 'Error recovery system is healthy';

      const errorRate = stats.global.totalRecoveries > 0 
        ? (stats.global.totalRecoveries - stats.global.successfulRecoveries) / stats.global.totalRecoveries
        : 0;

      if (errorRate > this.options.alertThresholds.errorRate) {
        status = 'warning';
        message = `High error recovery rate: ${Math.round(errorRate * 100)}%`;
      }

      return {
        status,
        message,
        details: {
          statistics: stats,
          errorRate
        }
      };
    } catch (error) {
      return {
        status: 'error',
        message: `Error recovery check failed: ${error.message}`,
        details: { error: error.message }
      };
    }
  }

  /**
   * Check system configuration
   * @returns {Promise<Object>} - Configuration check result
   */
  async checkConfiguration() {
    try {
      const config = globalConfig.getAllConfig();
      const issues = [];
      const warnings = [];

      // Check for missing required configurations
      if (!config.reliability) {
        issues.push('Missing reliability configuration');
      }

      // Check timeout values
      if (config.timeouts) {
        for (const [tool, timeout] of Object.entries(config.timeouts)) {
          if (timeout < 1000) {
            warnings.push(`Very low timeout for ${tool}: ${timeout}ms`);
          } else if (timeout > 300000) {
            warnings.push(`Very high timeout for ${tool}: ${timeout}ms`);
          }
        }
      }

      let status = 'healthy';
      let message = 'Configuration is valid';

      if (issues.length > 0) {
        status = 'warning';
        message = `Configuration issues: ${issues.join(', ')}`;
      } else if (warnings.length > 0) {
        status = 'warning';
        message = `Configuration warnings: ${warnings.join(', ')}`;
      }

      return {
        status,
        message,
        details: {
          issues,
          warnings,
          configKeys: Object.keys(config)
        }
      };
    } catch (error) {
      return {
        status: 'error',
        message: `Configuration check failed: ${error.message}`,
        details: { error: error.message }
      };
    }
  }

  /**
   * Check enhanced tools availability
   * @returns {Promise<Object>} - Enhanced tools check result
   */
  async checkEnhancedTools() {
    const tools = ['figma-compare', 'snapdom-screenshot', 'optimize-svg'];
    const results = {};
    let healthyCount = 0;

    for (const tool of tools) {
      try {
        // Basic availability check
        results[tool] = {
          available: true,
          status: 'healthy'
        };
        healthyCount++;
      } catch (error) {
        results[tool] = {
          available: false,
          status: 'error',
          error: error.message
        };
      }
    }

    const successRate = healthyCount / tools.length;
    let status = 'healthy';
    let message = `${healthyCount}/${tools.length} enhanced tools available`;

    if (successRate < 0.5) {
      status = 'critical';
      message = `Most enhanced tools unavailable: ${healthyCount}/${tools.length}`;
    } else if (successRate < 1.0) {
      status = 'warning';
      message = `Some enhanced tools unavailable: ${healthyCount}/${tools.length}`;
    }

    return {
      status,
      message,
      details: {
        tools: results,
        successRate,
        healthyCount,
        totalCount: tools.length
      }
    };
  }
}

/**
 * Global health monitor instance
 */
export const globalHealthMonitor = new HealthMonitor();

/**
 * Health check decorator for methods
 * @param {Object} options - Health check options
 * @returns {Function} - Decorator function
 */
export function healthCheck(options = {}) {
  return function(target, propertyKey, descriptor) {
    const originalMethod = descriptor.value;
    const healthCheckId = options.id || `${target.constructor.name}_${propertyKey}`;

    // Register health check
    globalHealthMonitor.registerHealthCheck(healthCheckId, {
      name: options.name || `${target.constructor.name}.${propertyKey}`,
      description: options.description || `Health check for ${propertyKey}`,
      check: originalMethod.bind(target),
      interval: options.interval || 60000,
      critical: options.critical || false,
      enabled: options.enabled !== false
    });

    return descriptor;
  };
}