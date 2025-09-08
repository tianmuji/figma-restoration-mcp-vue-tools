import chalk from 'chalk';

/**
 * OperationLogger - Enhanced logging with performance monitoring for MCP tools
 */
export class OperationLogger {
  constructor(toolName, options = {}) {
    this.toolName = toolName;
    this.options = {
      verbose: options.verbose || false,
      logLevel: options.logLevel || 'info', // debug, info, warn, error
      includeTimestamp: options.includeTimestamp !== false,
      includePerformance: options.includePerformance !== false,
      maxLogLength: options.maxLogLength || 1000
    };
    this.operations = new Map();
  }

  /**
   * Log operation start
   * @param {string} operationId - Unique operation identifier
   * @param {string} operation - Operation name
   * @param {Object} args - Operation arguments
   */
  logStart(operationId, operation, args = {}) {
    const startTime = Date.now();
    const sanitizedArgs = this.sanitizeArgs(args);
    
    this.operations.set(operationId, {
      operation,
      args: sanitizedArgs,
      startTime,
      status: 'running'
    });

    if (this.shouldLog('info')) {
      const timestamp = this.getTimestamp();
      console.log(chalk.blue(`${timestamp}🚀 [${this.toolName}] Starting ${operation}`));
      
      if (this.options.verbose && Object.keys(sanitizedArgs).length > 0) {
        console.log(chalk.gray(`${timestamp}   Parameters: ${JSON.stringify(sanitizedArgs)}`));
      }
    }
  }

  /**
   * Log operation success
   * @param {string} operationId - Operation identifier
   * @param {Object} result - Operation result
   * @param {Object} metrics - Additional metrics
   */
  logSuccess(operationId, result = {}, metrics = {}) {
    const operation = this.operations.get(operationId);
    if (!operation) {
      this.logError(operationId, new Error('Operation not found for success logging'));
      return;
    }

    const endTime = Date.now();
    const duration = endTime - operation.startTime;
    
    operation.status = 'completed';
    operation.endTime = endTime;
    operation.duration = duration;
    operation.result = this.sanitizeResult(result);
    operation.metrics = metrics;

    if (this.shouldLog('info')) {
      const timestamp = this.getTimestamp();
      console.log(chalk.green(`${timestamp}✅ [${this.toolName}] Completed ${operation.operation}`));
      
      if (this.options.includePerformance) {
        console.log(chalk.gray(`${timestamp}   Duration: ${duration}ms`));
        
        if (Object.keys(metrics).length > 0) {
          console.log(chalk.gray(`${timestamp}   Metrics: ${JSON.stringify(metrics)}`));
        }
      }
      
      if (this.options.verbose && result.success !== undefined) {
        console.log(chalk.gray(`${timestamp}   Success: ${result.success}`));
      }
    }

    // Clean up old operations to prevent memory leaks
    this.cleanupOldOperations();
  }

  /**
   * Log operation error
   * @param {string} operationId - Operation identifier
   * @param {Error} error - Error that occurred
   * @param {Object} context - Additional error context
   */
  logError(operationId, error, context = {}) {
    const operation = this.operations.get(operationId);
    const endTime = Date.now();
    const duration = operation ? endTime - operation.startTime : 0;
    
    if (operation) {
      operation.status = 'failed';
      operation.endTime = endTime;
      operation.duration = duration;
      operation.error = {
        message: error.message,
        name: error.name,
        code: error.code,
        stack: error.stack
      };
      operation.context = context;
    }

    if (this.shouldLog('error')) {
      const timestamp = this.getTimestamp();
      const operationName = operation ? operation.operation : 'Unknown Operation';
      
      console.error(chalk.red(`${timestamp}❌ [${this.toolName}] Failed ${operationName}`));
      console.error(chalk.red(`${timestamp}   Error: ${error.message}`));
      
      if (this.options.includePerformance && duration > 0) {
        console.error(chalk.gray(`${timestamp}   Duration: ${duration}ms`));
      }
      
      if (this.options.verbose && error.stack) {
        console.error(chalk.gray(`${timestamp}   Stack: ${this.truncateText(error.stack)}`));
      }
      
      if (Object.keys(context).length > 0) {
        console.error(chalk.gray(`${timestamp}   Context: ${JSON.stringify(context)}`));
      }
    }
  }

  /**
   * Log operation timeout
   * @param {string} operationId - Operation identifier
   * @param {number} timeoutMs - Timeout duration
   */
  logTimeout(operationId, timeoutMs) {
    const operation = this.operations.get(operationId);
    const endTime = Date.now();
    const duration = operation ? endTime - operation.startTime : timeoutMs;
    
    if (operation) {
      operation.status = 'timeout';
      operation.endTime = endTime;
      operation.duration = duration;
    }

    if (this.shouldLog('warn')) {
      const timestamp = this.getTimestamp();
      const operationName = operation ? operation.operation : 'Unknown Operation';
      
      console.warn(chalk.yellow(`${timestamp}⏰ [${this.toolName}] Timeout ${operationName}`));
      console.warn(chalk.yellow(`${timestamp}   Timeout: ${timeoutMs}ms, Actual: ${duration}ms`));
    }
  }

  /**
   * Log operation retry
   * @param {string} operationId - Operation identifier
   * @param {number} attempt - Retry attempt number
   * @param {Error} error - Error that caused retry
   */
  logRetry(operationId, attempt, error) {
    const operation = this.operations.get(operationId);
    
    if (operation) {
      if (!operation.retries) {
        operation.retries = [];
      }
      operation.retries.push({
        attempt,
        error: error.message,
        timestamp: Date.now()
      });
    }

    if (this.shouldLog('warn')) {
      const timestamp = this.getTimestamp();
      const operationName = operation ? operation.operation : 'Unknown Operation';
      
      console.warn(chalk.yellow(`${timestamp}🔄 [${this.toolName}] Retry ${operationName} (attempt ${attempt})`));
      console.warn(chalk.yellow(`${timestamp}   Reason: ${error.message}`));
    }
  }

  /**
   * Log debug information
   * @param {string} message - Debug message
   * @param {Object} data - Additional debug data
   */
  logDebug(message, data = {}) {
    if (this.shouldLog('debug')) {
      const timestamp = this.getTimestamp();
      console.log(chalk.gray(`${timestamp}🔍 [${this.toolName}] ${message}`));
      
      if (Object.keys(data).length > 0) {
        console.log(chalk.gray(`${timestamp}   Data: ${JSON.stringify(data)}`));
      }
    }
  }

  /**
   * Log warning
   * @param {string} message - Warning message
   * @param {Object} data - Additional warning data
   */
  logWarning(message, data = {}) {
    if (this.shouldLog('warn')) {
      const timestamp = this.getTimestamp();
      console.warn(chalk.yellow(`${timestamp}⚠️  [${this.toolName}] ${message}`));
      
      if (Object.keys(data).length > 0) {
        console.warn(chalk.yellow(`${timestamp}   Data: ${JSON.stringify(data)}`));
      }
    }
  }

  /**
   * Get operation statistics
   * @returns {Object} - Operation statistics
   */
  getStatistics() {
    const operations = Array.from(this.operations.values());
    const completed = operations.filter(op => op.status === 'completed');
    const failed = operations.filter(op => op.status === 'failed');
    const timeout = operations.filter(op => op.status === 'timeout');
    const running = operations.filter(op => op.status === 'running');

    const durations = completed.map(op => op.duration).filter(d => d > 0);
    const avgDuration = durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0;
    const maxDuration = durations.length > 0 ? Math.max(...durations) : 0;
    const minDuration = durations.length > 0 ? Math.min(...durations) : 0;

    return {
      total: operations.length,
      completed: completed.length,
      failed: failed.length,
      timeout: timeout.length,
      running: running.length,
      successRate: operations.length > 0 ? (completed.length / operations.length) * 100 : 0,
      performance: {
        avgDuration: Math.round(avgDuration),
        maxDuration,
        minDuration,
        totalDuration: durations.reduce((a, b) => a + b, 0)
      }
    };
  }

  /**
   * Log step-by-step operation details (verbose mode)
   * @param {string} operationId - Operation identifier
   * @param {string} step - Step name
   * @param {Object} stepData - Step data
   */
  logStep(operationId, step, stepData = {}) {
    const operation = this.operations.get(operationId);
    
    if (operation) {
      if (!operation.steps) {
        operation.steps = [];
      }
      operation.steps.push({
        step,
        data: stepData,
        timestamp: Date.now()
      });
    }

    if (this.options.verbose && this.shouldLog('debug')) {
      const timestamp = this.getTimestamp();
      console.log(chalk.cyan(`${timestamp}🔍 [${this.toolName}] Step: ${step}`));
      
      if (Object.keys(stepData).length > 0) {
        console.log(chalk.gray(`${timestamp}   Step Data: ${JSON.stringify(stepData)}`));
      }
    }
  }

  /**
   * Log performance metrics
   * @param {string} operationId - Operation identifier
   * @param {Object} metrics - Performance metrics
   */
  logMetrics(operationId, metrics) {
    const operation = this.operations.get(operationId);
    
    if (operation) {
      if (!operation.performanceMetrics) {
        operation.performanceMetrics = [];
      }
      operation.performanceMetrics.push({
        ...metrics,
        timestamp: Date.now()
      });
    }

    if (this.options.includePerformance && this.shouldLog('debug')) {
      const timestamp = this.getTimestamp();
      console.log(chalk.magenta(`${timestamp}📊 [${this.toolName}] Metrics: ${JSON.stringify(metrics)}`));
    }
  }

  /**
   * Log resource usage
   * @param {string} operationId - Operation identifier
   * @param {Object} resources - Resource usage data
   */
  logResourceUsage(operationId, resources) {
    const operation = this.operations.get(operationId);
    
    if (operation) {
      if (!operation.resourceUsage) {
        operation.resourceUsage = [];
      }
      operation.resourceUsage.push({
        ...resources,
        timestamp: Date.now()
      });
    }

    if (this.options.verbose && this.shouldLog('debug')) {
      const timestamp = this.getTimestamp();
      console.log(chalk.blue(`${timestamp}💾 [${this.toolName}] Resources: ${JSON.stringify(resources)}`));
    }
  }

  /**
   * Generate performance report
   * @param {string} operationId - Operation identifier (optional)
   * @returns {Object} - Performance report
   */
  generatePerformanceReport(operationId = null) {
    if (operationId) {
      const operation = this.operations.get(operationId);
      if (!operation) {
        return null;
      }
      return this.generateSingleOperationReport(operation);
    }

    // Generate report for all operations
    const operations = Array.from(this.operations.values());
    const stats = this.getStatistics();
    
    const report = {
      summary: stats,
      operationBreakdown: {},
      performanceTrends: this.analyzePerformanceTrends(),
      resourceUsage: this.analyzeResourceUsage(),
      errorPatterns: this.analyzeErrorPatterns()
    };

    // Group operations by type
    operations.forEach(op => {
      if (!report.operationBreakdown[op.operation]) {
        report.operationBreakdown[op.operation] = {
          count: 0,
          avgDuration: 0,
          successRate: 0,
          errors: []
        };
      }
      
      const breakdown = report.operationBreakdown[op.operation];
      breakdown.count++;
      
      if (op.duration) {
        breakdown.avgDuration = (breakdown.avgDuration * (breakdown.count - 1) + op.duration) / breakdown.count;
      }
      
      if (op.status === 'failed' && op.error) {
        breakdown.errors.push(op.error.message);
      }
    });

    // Calculate success rates
    Object.keys(report.operationBreakdown).forEach(opType => {
      const breakdown = report.operationBreakdown[opType];
      const successful = breakdown.count - breakdown.errors.length;
      breakdown.successRate = (successful / breakdown.count) * 100;
    });

    return report;
  }

  /**
   * Export operation logs
   * @param {Object} options - Export options
   * @returns {Object} - Exported logs
   */
  exportLogs(options = {}) {
    const {
      format = 'json',
      includeSteps = false,
      includeMetrics = false,
      timeRange = null
    } = options;

    let operations = Array.from(this.operations.values());

    // Filter by time range if specified
    if (timeRange) {
      const { start, end } = timeRange;
      operations = operations.filter(op => {
        return op.startTime >= start && op.startTime <= end;
      });
    }

    const exportData = {
      toolName: this.toolName,
      exportTime: new Date().toISOString(),
      totalOperations: operations.length,
      operations: operations.map(op => {
        const exported = {
          operation: op.operation,
          status: op.status,
          startTime: new Date(op.startTime).toISOString(),
          duration: op.duration,
          args: op.args
        };

        if (op.error) {
          exported.error = op.error;
        }

        if (op.result) {
          exported.result = op.result;
        }

        if (includeSteps && op.steps) {
          exported.steps = op.steps;
        }

        if (includeMetrics && op.performanceMetrics) {
          exported.performanceMetrics = op.performanceMetrics;
        }

        return exported;
      })
    };

    return format === 'json' ? exportData : this.formatAsCSV(exportData);
  }

  /**
   * Clear operation history
   */
  clearHistory() {
    this.operations.clear();
  }

  /**
   * Set logging options
   * @param {Object} options - New logging options
   */
  setOptions(options) {
    this.options = { ...this.options, ...options };
  }

  /**
   * Get real-time monitoring data
   * @returns {Object} - Real-time monitoring data
   */
  getMonitoringData() {
    const now = Date.now();
    const operations = Array.from(this.operations.values());
    
    // Operations in the last minute
    const recentOps = operations.filter(op => now - op.startTime < 60000);
    
    // Current running operations
    const runningOps = operations.filter(op => op.status === 'running');
    
    // Recent errors
    const recentErrors = operations
      .filter(op => op.status === 'failed' && now - op.startTime < 300000) // Last 5 minutes
      .map(op => ({
        operation: op.operation,
        error: op.error?.message,
        time: new Date(op.startTime).toISOString()
      }));

    return {
      timestamp: new Date(now).toISOString(),
      activeOperations: runningOps.length,
      recentOperations: recentOps.length,
      recentErrors: recentErrors.length,
      errorDetails: recentErrors,
      systemHealth: this.calculateSystemHealth(),
      performanceMetrics: this.getRecentPerformanceMetrics()
    };
  }

  // Private methods

  shouldLog(level) {
    const levels = { debug: 0, info: 1, warn: 2, error: 3 };
    const currentLevel = levels[this.options.logLevel] || 1;
    const messageLevel = levels[level] || 1;
    return messageLevel >= currentLevel;
  }

  getTimestamp() {
    if (!this.options.includeTimestamp) {
      return '';
    }
    return `[${new Date().toISOString()}] `;
  }

  sanitizeArgs(args) {
    const sanitized = { ...args };
    
    // Remove sensitive information
    if (sanitized.password) sanitized.password = '[REDACTED]';
    if (sanitized.token) sanitized.token = '[REDACTED]';
    if (sanitized.apiKey) sanitized.apiKey = '[REDACTED]';
    
    // Truncate long strings
    Object.keys(sanitized).forEach(key => {
      if (typeof sanitized[key] === 'string' && sanitized[key].length > this.options.maxLogLength) {
        sanitized[key] = this.truncateText(sanitized[key]);
      }
    });
    
    return sanitized;
  }

  sanitizeResult(result) {
    if (typeof result !== 'object' || result === null) {
      return result;
    }
    
    const sanitized = { ...result };
    
    // Remove large data from logs
    if (sanitized.data && typeof sanitized.data === 'string' && sanitized.data.length > this.options.maxLogLength) {
      sanitized.data = `[DATA: ${sanitized.data.length} chars]`;
    }
    
    return sanitized;
  }

  truncateText(text) {
    if (text.length <= this.options.maxLogLength) {
      return text;
    }
    return text.substring(0, this.options.maxLogLength) + '...';
  }

  cleanupOldOperations() {
    // Keep only the last 100 operations to prevent memory leaks
    if (this.operations.size > 100) {
      const entries = Array.from(this.operations.entries());
      const toKeep = entries.slice(-100);
      this.operations.clear();
      toKeep.forEach(([key, value]) => {
        this.operations.set(key, value);
      });
    }
  }

  generateSingleOperationReport(operation) {
    const report = {
      operation: operation.operation,
      status: operation.status,
      duration: operation.duration,
      startTime: new Date(operation.startTime).toISOString(),
      endTime: operation.endTime ? new Date(operation.endTime).toISOString() : null
    };

    if (operation.steps) {
      report.steps = operation.steps.map(step => ({
        step: step.step,
        data: step.data,
        timestamp: new Date(step.timestamp).toISOString()
      }));
    }

    if (operation.performanceMetrics) {
      report.performanceMetrics = operation.performanceMetrics;
    }

    if (operation.resourceUsage) {
      report.resourceUsage = operation.resourceUsage;
    }

    if (operation.error) {
      report.error = operation.error;
    }

    return report;
  }

  analyzePerformanceTrends() {
    const operations = Array.from(this.operations.values())
      .filter(op => op.status === 'completed' && op.duration)
      .sort((a, b) => a.startTime - b.startTime);

    if (operations.length < 2) {
      return { trend: 'insufficient_data', operations: operations.length };
    }

    const recentOps = operations.slice(-10); // Last 10 operations
    const olderOps = operations.slice(0, -10);

    if (olderOps.length === 0) {
      return { trend: 'insufficient_data', operations: operations.length };
    }

    const recentAvg = recentOps.reduce((sum, op) => sum + op.duration, 0) / recentOps.length;
    const olderAvg = olderOps.reduce((sum, op) => sum + op.duration, 0) / olderOps.length;

    const change = ((recentAvg - olderAvg) / olderAvg) * 100;

    return {
      trend: change > 10 ? 'degrading' : change < -10 ? 'improving' : 'stable',
      changePercent: Math.round(change),
      recentAverage: Math.round(recentAvg),
      historicalAverage: Math.round(olderAvg),
      operations: operations.length
    };
  }

  analyzeResourceUsage() {
    const operations = Array.from(this.operations.values())
      .filter(op => op.resourceUsage && op.resourceUsage.length > 0);

    if (operations.length === 0) {
      return { available: false };
    }

    const allResources = operations.flatMap(op => op.resourceUsage);
    
    const memoryUsage = allResources
      .filter(r => r.memory)
      .map(r => r.memory);
    
    const cpuUsage = allResources
      .filter(r => r.cpu)
      .map(r => r.cpu);

    return {
      available: true,
      memory: memoryUsage.length > 0 ? {
        avg: memoryUsage.reduce((a, b) => a + b, 0) / memoryUsage.length,
        max: Math.max(...memoryUsage),
        min: Math.min(...memoryUsage)
      } : null,
      cpu: cpuUsage.length > 0 ? {
        avg: cpuUsage.reduce((a, b) => a + b, 0) / cpuUsage.length,
        max: Math.max(...cpuUsage),
        min: Math.min(...cpuUsage)
      } : null
    };
  }

  analyzeErrorPatterns() {
    const failedOps = Array.from(this.operations.values())
      .filter(op => op.status === 'failed' && op.error);

    const errorCounts = {};
    const errorsByType = {};

    failedOps.forEach(op => {
      const errorMsg = op.error.message;
      const errorType = op.error.name || 'Unknown';

      errorCounts[errorMsg] = (errorCounts[errorMsg] || 0) + 1;
      
      if (!errorsByType[errorType]) {
        errorsByType[errorType] = [];
      }
      errorsByType[errorType].push(errorMsg);
    });

    // Find most common errors
    const commonErrors = Object.entries(errorCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([error, count]) => ({ error, count }));

    return {
      totalErrors: failedOps.length,
      uniqueErrors: Object.keys(errorCounts).length,
      commonErrors,
      errorsByType
    };
  }

  calculateSystemHealth() {
    const stats = this.getStatistics();
    
    if (stats.total === 0) {
      return { status: 'unknown', score: 0, factors: [] };
    }

    let score = 100;
    const factors = [];

    // Success rate factor (40% weight)
    const successRateScore = stats.successRate;
    score = score * 0.6 + successRateScore * 0.4;
    factors.push({
      factor: 'success_rate',
      score: successRateScore,
      weight: 0.4
    });

    // Performance factor (30% weight)
    const avgDuration = stats.performance.avgDuration;
    let performanceScore = 100;
    if (avgDuration > 30000) { // > 30s is poor
      performanceScore = 30;
    } else if (avgDuration > 10000) { // > 10s is fair
      performanceScore = 60;
    } else if (avgDuration > 5000) { // > 5s is good
      performanceScore = 80;
    }
    
    score = score * 0.7 + performanceScore * 0.3;
    factors.push({
      factor: 'performance',
      score: performanceScore,
      weight: 0.3
    });

    // Timeout factor (20% weight)
    const timeoutRate = (stats.timeout / stats.total) * 100;
    const timeoutScore = Math.max(0, 100 - timeoutRate * 10);
    
    score = score * 0.8 + timeoutScore * 0.2;
    factors.push({
      factor: 'timeout_rate',
      score: timeoutScore,
      weight: 0.2
    });

    // Recent errors factor (10% weight)
    const now = Date.now();
    const recentErrors = Array.from(this.operations.values())
      .filter(op => op.status === 'failed' && now - op.startTime < 300000); // Last 5 minutes
    
    const recentErrorScore = Math.max(0, 100 - recentErrors.length * 20);
    score = score * 0.9 + recentErrorScore * 0.1;
    factors.push({
      factor: 'recent_errors',
      score: recentErrorScore,
      weight: 0.1
    });

    let status;
    if (score >= 90) status = 'excellent';
    else if (score >= 75) status = 'good';
    else if (score >= 60) status = 'fair';
    else if (score >= 40) status = 'poor';
    else status = 'critical';

    return {
      status,
      score: Math.round(score),
      factors
    };
  }

  getRecentPerformanceMetrics() {
    const now = Date.now();
    const recentOps = Array.from(this.operations.values())
      .filter(op => now - op.startTime < 300000); // Last 5 minutes

    if (recentOps.length === 0) {
      return { available: false };
    }

    const completedOps = recentOps.filter(op => op.status === 'completed' && op.duration);
    
    if (completedOps.length === 0) {
      return { available: false };
    }

    const durations = completedOps.map(op => op.duration);
    const throughput = completedOps.length / 5; // Operations per minute

    return {
      available: true,
      operationsPerMinute: throughput,
      averageDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
      p95Duration: this.calculatePercentile(durations, 95),
      p99Duration: this.calculatePercentile(durations, 99)
    };
  }

  calculatePercentile(values, percentile) {
    const sorted = values.slice().sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[index] || 0;
  }

  formatAsCSV(data) {
    const headers = ['Operation', 'Status', 'Start Time', 'Duration', 'Error'];
    const rows = data.operations.map(op => [
      op.operation,
      op.status,
      op.startTime,
      op.duration || '',
      op.error?.message || ''
    ]);

    return [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
  }
}