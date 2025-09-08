import { OperationLogger } from '../operation-logger.js';

/**
 * Simple test runner for OperationLogger
 */
class TestRunner {
  constructor() {
    this.tests = [];
    this.passed = 0;
    this.failed = 0;
  }

  test(name, testFn) {
    this.tests.push({ name, testFn });
  }

  async run() {
    console.log('🧪 Running OperationLogger Tests...\n');

    for (const { name, testFn } of this.tests) {
      try {
        await testFn();
        console.log(`✅ ${name}`);
        this.passed++;
      } catch (error) {
        console.log(`❌ ${name}: ${error.message}`);
        this.failed++;
      }
    }

    console.log(`\n📊 Test Results: ${this.passed} passed, ${this.failed} failed`);
    return this.failed === 0;
  }

  assert(condition, message) {
    if (!condition) {
      throw new Error(message || 'Assertion failed');
    }
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Test suite
const runner = new TestRunner();

runner.test('should initialize with default options', () => {
  const logger = new OperationLogger('TestTool');
  
  runner.assert(logger.toolName === 'TestTool', 'Should set tool name');
  runner.assert(logger.options.verbose === false, 'Should have default verbose setting');
  runner.assert(logger.options.logLevel === 'info', 'Should have default log level');
  runner.assert(logger.options.includeTimestamp === true, 'Should include timestamp by default');
});

runner.test('should initialize with custom options', () => {
  const logger = new OperationLogger('TestTool', {
    verbose: true,
    logLevel: 'debug',
    includeTimestamp: false,
    maxLogLength: 500
  });
  
  runner.assert(logger.options.verbose === true, 'Should set custom verbose');
  runner.assert(logger.options.logLevel === 'debug', 'Should set custom log level');
  runner.assert(logger.options.includeTimestamp === false, 'Should set custom timestamp setting');
  runner.assert(logger.options.maxLogLength === 500, 'Should set custom max log length');
});

runner.test('should log operation start', () => {
  const logger = new OperationLogger('TestTool', { verbose: false });
  
  logger.logStart('op-1', 'testOperation', { param1: 'value1' });
  
  const operation = logger.operations.get('op-1');
  runner.assert(operation, 'Should store operation');
  runner.assert(operation.operation === 'testOperation', 'Should store operation name');
  runner.assert(operation.status === 'running', 'Should set status to running');
  runner.assert(operation.args.param1 === 'value1', 'Should store sanitized args');
  runner.assert(typeof operation.startTime === 'number', 'Should record start time');
});

runner.test('should log operation success', async () => {
  const logger = new OperationLogger('TestTool', { verbose: false });
  
  logger.logStart('op-2', 'testOperation');
  await runner.sleep(10); // Small delay to ensure duration > 0
  logger.logSuccess('op-2', { success: true, data: 'result' }, { processed: 100 });
  
  const operation = logger.operations.get('op-2');
  runner.assert(operation.status === 'completed', 'Should set status to completed');
  runner.assert(operation.duration > 0, 'Should calculate duration');
  runner.assert(operation.result.success === true, 'Should store result');
  runner.assert(operation.metrics.processed === 100, 'Should store metrics');
});

runner.test('should log operation error', async () => {
  const logger = new OperationLogger('TestTool', { verbose: false });
  
  logger.logStart('op-3', 'testOperation');
  await runner.sleep(10);
  
  const error = new Error('Test error');
  error.code = 'TEST_ERROR';
  logger.logError('op-3', error, { context: 'test' });
  
  const operation = logger.operations.get('op-3');
  runner.assert(operation.status === 'failed', 'Should set status to failed');
  runner.assert(operation.error.message === 'Test error', 'Should store error message');
  runner.assert(operation.error.code === 'TEST_ERROR', 'Should store error code');
  runner.assert(operation.context.context === 'test', 'Should store error context');
});

runner.test('should log operation timeout', () => {
  const logger = new OperationLogger('TestTool', { verbose: false });
  
  logger.logStart('op-4', 'testOperation');
  logger.logTimeout('op-4', 5000);
  
  const operation = logger.operations.get('op-4');
  runner.assert(operation.status === 'timeout', 'Should set status to timeout');
});

runner.test('should log operation retries', () => {
  const logger = new OperationLogger('TestTool', { verbose: false });
  
  logger.logStart('op-5', 'testOperation');
  logger.logRetry('op-5', 1, new Error('First attempt failed'));
  logger.logRetry('op-5', 2, new Error('Second attempt failed'));
  
  const operation = logger.operations.get('op-5');
  runner.assert(operation.retries.length === 2, 'Should store retry attempts');
  runner.assert(operation.retries[0].attempt === 1, 'Should store first retry');
  runner.assert(operation.retries[1].attempt === 2, 'Should store second retry');
});

runner.test('should log step-by-step details', () => {
  const logger = new OperationLogger('TestTool', { verbose: true });
  
  logger.logStart('op-6', 'testOperation');
  logger.logStep('op-6', 'validation', { valid: true });
  logger.logStep('op-6', 'processing', { items: 5 });
  
  const operation = logger.operations.get('op-6');
  runner.assert(operation.steps.length === 2, 'Should store steps');
  runner.assert(operation.steps[0].step === 'validation', 'Should store first step');
  runner.assert(operation.steps[1].step === 'processing', 'Should store second step');
});

runner.test('should log performance metrics', () => {
  const logger = new OperationLogger('TestTool', { includePerformance: true });
  
  logger.logStart('op-7', 'testOperation');
  logger.logMetrics('op-7', { cpu: 45.2, memory: 128 });
  logger.logMetrics('op-7', { cpu: 52.1, memory: 135 });
  
  const operation = logger.operations.get('op-7');
  runner.assert(operation.performanceMetrics.length === 2, 'Should store metrics');
  runner.assert(operation.performanceMetrics[0].cpu === 45.2, 'Should store first metric');
  runner.assert(operation.performanceMetrics[1].cpu === 52.1, 'Should store second metric');
});

runner.test('should log resource usage', () => {
  const logger = new OperationLogger('TestTool', { verbose: true });
  
  logger.logStart('op-8', 'testOperation');
  logger.logResourceUsage('op-8', { memory: 256, disk: 1024 });
  
  const operation = logger.operations.get('op-8');
  runner.assert(operation.resourceUsage.length === 1, 'Should store resource usage');
  runner.assert(operation.resourceUsage[0].memory === 256, 'Should store memory usage');
  runner.assert(operation.resourceUsage[0].disk === 1024, 'Should store disk usage');
});

runner.test('should generate operation statistics', async () => {
  const logger = new OperationLogger('TestTool', { verbose: false });
  
  // Create various operations
  logger.logStart('stat-1', 'operation1');
  await runner.sleep(5);
  logger.logSuccess('stat-1', { success: true });
  
  logger.logStart('stat-2', 'operation2');
  await runner.sleep(5);
  logger.logError('stat-2', new Error('Failed'));
  
  logger.logStart('stat-3', 'operation3');
  logger.logTimeout('stat-3', 1000);
  
  const stats = logger.getStatistics();
  runner.assert(stats.total === 3, 'Should count total operations');
  runner.assert(stats.completed === 1, 'Should count completed operations');
  runner.assert(stats.failed === 1, 'Should count failed operations');
  runner.assert(stats.timeout === 1, 'Should count timeout operations');
  runner.assert(stats.successRate > 0, 'Should calculate success rate');
  runner.assert(stats.performance.avgDuration >= 0, 'Should calculate average duration');
});

runner.test('should generate performance report', async () => {
  const logger = new OperationLogger('TestTool', { verbose: false });
  
  // Create test operations
  logger.logStart('perf-1', 'testOp');
  await runner.sleep(5);
  logger.logSuccess('perf-1', { success: true });
  
  logger.logStart('perf-2', 'testOp');
  await runner.sleep(5);
  logger.logError('perf-2', new Error('Test error'));
  
  const report = logger.generatePerformanceReport();
  runner.assert(report.summary, 'Should have summary section');
  runner.assert(report.operationBreakdown, 'Should have operation breakdown');
  runner.assert(report.performanceTrends, 'Should have performance trends');
  runner.assert(report.errorPatterns, 'Should have error patterns');
  
  runner.assert(report.operationBreakdown.testOp, 'Should break down by operation type');
  runner.assert(report.operationBreakdown.testOp.count === 2, 'Should count operations by type');
});

runner.test('should generate single operation report', async () => {
  const logger = new OperationLogger('TestTool', { verbose: true });
  
  logger.logStart('single-1', 'detailedOp');
  logger.logStep('single-1', 'step1', { data: 'test' });
  logger.logMetrics('single-1', { cpu: 30 });
  await runner.sleep(5);
  logger.logSuccess('single-1', { result: 'done' });
  
  const report = logger.generatePerformanceReport('single-1');
  runner.assert(report.operation === 'detailedOp', 'Should include operation name');
  runner.assert(report.status === 'completed', 'Should include status');
  runner.assert(report.steps.length === 1, 'Should include steps');
  runner.assert(report.performanceMetrics.length === 1, 'Should include metrics');
});

runner.test('should export logs in JSON format', async () => {
  const logger = new OperationLogger('TestTool', { verbose: false });
  
  logger.logStart('export-1', 'exportTest');
  await runner.sleep(5);
  logger.logSuccess('export-1', { data: 'exported' });
  
  const exported = logger.exportLogs({ format: 'json' });
  runner.assert(exported.toolName === 'TestTool', 'Should include tool name');
  runner.assert(exported.totalOperations === 1, 'Should count operations');
  runner.assert(exported.operations.length === 1, 'Should include operations');
  runner.assert(exported.operations[0].operation === 'exportTest', 'Should include operation details');
});

runner.test('should export logs in CSV format', async () => {
  const logger = new OperationLogger('TestTool', { verbose: false });
  
  logger.logStart('csv-1', 'csvTest');
  await runner.sleep(5);
  logger.logSuccess('csv-1', { data: 'csv' });
  
  const exported = logger.exportLogs({ format: 'csv' });
  runner.assert(typeof exported === 'string', 'Should return CSV string');
  runner.assert(exported.includes('"Operation","Status"'), 'Should include CSV headers');
  runner.assert(exported.includes('csvTest'), 'Should include operation data');
});

runner.test('should get real-time monitoring data', async () => {
  const logger = new OperationLogger('TestTool', { verbose: false });
  
  logger.logStart('monitor-1', 'monitorTest');
  logger.logStart('monitor-2', 'monitorTest');
  await runner.sleep(5);
  logger.logError('monitor-2', new Error('Monitor error'));
  
  const monitoring = logger.getMonitoringData();
  runner.assert(monitoring.activeOperations === 1, 'Should count active operations');
  runner.assert(monitoring.recentOperations === 2, 'Should count recent operations');
  runner.assert(monitoring.recentErrors === 1, 'Should count recent errors');
  runner.assert(monitoring.systemHealth, 'Should include system health');
});

runner.test('should calculate system health', async () => {
  const logger = new OperationLogger('TestTool', { verbose: false });
  
  // Create operations with different outcomes
  for (let i = 0; i < 5; i++) {
    logger.logStart(`health-${i}`, 'healthTest');
    await runner.sleep(2);
    if (i < 4) {
      logger.logSuccess(`health-${i}`, { success: true });
    } else {
      logger.logError(`health-${i}`, new Error('Health test error'));
    }
  }
  
  const health = logger.calculateSystemHealth();
  runner.assert(health.status, 'Should have health status');
  runner.assert(typeof health.score === 'number', 'Should have numeric score');
  runner.assert(Array.isArray(health.factors), 'Should have health factors');
  runner.assert(health.score >= 0 && health.score <= 100, 'Score should be 0-100');
});

runner.test('should sanitize sensitive arguments', () => {
  const logger = new OperationLogger('TestTool', { verbose: false });
  
  logger.logStart('sanitize-1', 'sensitiveOp', {
    username: 'testuser',
    password: 'secret123',
    token: 'abc123token',
    apiKey: 'key456',
    normalData: 'visible'
  });
  
  const operation = logger.operations.get('sanitize-1');
  runner.assert(operation.args.username === 'testuser', 'Should keep non-sensitive data');
  runner.assert(operation.args.password === '[REDACTED]', 'Should redact password');
  runner.assert(operation.args.token === '[REDACTED]', 'Should redact token');
  runner.assert(operation.args.apiKey === '[REDACTED]', 'Should redact API key');
  runner.assert(operation.args.normalData === 'visible', 'Should keep normal data');
});

runner.test('should respect log levels', () => {
  const logger = new OperationLogger('TestTool', { logLevel: 'error' });
  
  // These should not log anything (but we can't easily test console output)
  logger.logDebug('Debug message');
  logger.logWarning('Warning message');
  
  // This should log (error level)
  logger.logError('error-1', new Error('Error message'));
  
  // Test shouldLog method directly
  runner.assert(logger.shouldLog('error') === true, 'Should log error level');
  runner.assert(logger.shouldLog('warn') === false, 'Should not log warn level');
  runner.assert(logger.shouldLog('info') === false, 'Should not log info level');
  runner.assert(logger.shouldLog('debug') === false, 'Should not log debug level');
});

runner.test('should update options dynamically', () => {
  const logger = new OperationLogger('TestTool', { verbose: false, logLevel: 'info' });
  
  runner.assert(logger.options.verbose === false, 'Should start with verbose false');
  runner.assert(logger.options.logLevel === 'info', 'Should start with info level');
  
  logger.setOptions({ verbose: true, logLevel: 'debug' });
  
  runner.assert(logger.options.verbose === true, 'Should update verbose setting');
  runner.assert(logger.options.logLevel === 'debug', 'Should update log level');
});

runner.test('should cleanup old operations', () => {
  const logger = new OperationLogger('TestTool', { verbose: false });
  
  // Add more than 100 operations
  for (let i = 0; i < 105; i++) {
    logger.logStart(`cleanup-${i}`, 'cleanupTest');
    logger.logSuccess(`cleanup-${i}`, { success: true });
  }
  
  runner.assert(logger.operations.size <= 100, 'Should limit operations to 100');
  runner.assert(logger.operations.has('cleanup-104'), 'Should keep most recent operations');
  runner.assert(!logger.operations.has('cleanup-0'), 'Should remove oldest operations');
});

runner.test('should clear history', () => {
  const logger = new OperationLogger('TestTool', { verbose: false });
  
  logger.logStart('clear-1', 'clearTest');
  logger.logStart('clear-2', 'clearTest');
  
  runner.assert(logger.operations.size === 2, 'Should have operations before clear');
  
  logger.clearHistory();
  
  runner.assert(logger.operations.size === 0, 'Should have no operations after clear');
});

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runner.run().then(success => {
    process.exit(success ? 0 : 1);
  });
}

export { runner as operationLoggerTests };