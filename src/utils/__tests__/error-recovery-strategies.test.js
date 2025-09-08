import { ErrorRecoveryStrategies } from '../error-recovery-strategies.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Simple test runner for ErrorRecoveryStrategies
 */
class TestRunner {
  constructor() {
    this.tests = [];
    this.passed = 0;
    this.failed = 0;
    this.testDir = path.join(__dirname, 'test-temp-recovery');
  }

  test(name, testFn) {
    this.tests.push({ name, testFn });
  }

  async run() {
    console.log('🧪 Running ErrorRecoveryStrategies Tests...\n');

    // Setup test environment
    await this.setupTestEnvironment();

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

    // Cleanup test environment
    await this.cleanupTestEnvironment();

    console.log(`\n📊 Test Results: ${this.passed} passed, ${this.failed} failed`);
    return this.failed === 0;
  }

  async setupTestEnvironment() {
    await fs.mkdir(this.testDir, { recursive: true });
    await fs.writeFile(path.join(this.testDir, 'test.txt'), 'test content');
  }

  async cleanupTestEnvironment() {
    try {
      await fs.rm(this.testDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  }

  assert(condition, message) {
    if (!condition) {
      throw new Error(message || 'Assertion failed');
    }
  }
}

// Test suite
const runner = new TestRunner();

runner.test('should initialize with all recovery strategies', () => {
  const recovery = new ErrorRecoveryStrategies();
  
  runner.assert(recovery.strategies.has('FileSystem'), 'Should have FileSystem strategy');
  runner.assert(recovery.strategies.has('Network'), 'Should have Network strategy');
  runner.assert(recovery.strategies.has('Browser'), 'Should have Browser strategy');
  runner.assert(recovery.strategies.has('ImageProcessing'), 'Should have ImageProcessing strategy');
  runner.assert(recovery.strategies.has('Library'), 'Should have Library strategy');
});

runner.test('should handle file not found errors', async () => {
  const recovery = new ErrorRecoveryStrategies();
  
  const error = new Error('File not found');
  error.code = 'ENOENT';
  error.path = '/nonexistent/file.txt';
  
  const strategy = await recovery.getRecoveryStrategy('FileSystem', error);
  
  runner.assert(strategy.canRecover === false, 'ENOENT should not be auto-recoverable');
  runner.assert(strategy.suggestions.length > 0, 'Should provide suggestions');
  runner.assert(strategy.actions.length > 0, 'Should provide actions');
  runner.assert(strategy.fallbackOptions.length > 0, 'Should provide fallback options');
  runner.assert(strategy.category === 'FileSystem', 'Should include category');
});

runner.test('should handle permission denied errors', async () => {
  const recovery = new ErrorRecoveryStrategies();
  
  const error = new Error('Permission denied');
  error.code = 'EACCES';
  error.path = '/restricted/file.txt';
  
  const strategy = await recovery.getRecoveryStrategy('FileSystem', error);
  
  runner.assert(strategy.canRecover === true, 'Permission errors should be recoverable');
  runner.assert(strategy.severity === 'high', 'Permission errors should be high severity');
  runner.assert(
    strategy.suggestions.some(s => s.includes('permission')),
    'Should mention permissions in suggestions'
  );
});

runner.test('should handle disk space errors', async () => {
  const recovery = new ErrorRecoveryStrategies();
  
  const error = new Error('No space left on device');
  error.code = 'ENOSPC';
  
  const strategy = await recovery.getRecoveryStrategy('FileSystem', error);
  
  runner.assert(strategy.canRecover === false, 'Disk space errors need manual intervention');
  runner.assert(strategy.severity === 'critical', 'Disk space errors should be critical');
  runner.assert(
    strategy.suggestions.some(s => s.includes('disk space')),
    'Should mention disk space in suggestions'
  );
});

runner.test('should handle network timeout errors', async () => {
  const recovery = new ErrorRecoveryStrategies();
  
  const error = new Error('Network timeout');
  error.code = 'ETIMEDOUT';
  error.hostname = 'example.com';
  
  const strategy = await recovery.getRecoveryStrategy('Network', error);
  
  runner.assert(strategy.canRecover === true, 'Network timeouts should be recoverable');
  runner.assert(strategy.retryable === true, 'Network timeouts should be retryable');
  runner.assert(typeof strategy.retryDelay === 'number', 'Should provide retry delay');
  runner.assert(
    strategy.suggestions.some(s => s.includes('network')),
    'Should mention network in suggestions'
  );
});

runner.test('should handle connection refused errors', async () => {
  const recovery = new ErrorRecoveryStrategies();
  
  const error = new Error('Connection refused');
  error.code = 'ECONNREFUSED';
  error.hostname = 'localhost';
  error.port = 3000;
  
  const strategy = await recovery.getRecoveryStrategy('Network', error);
  
  runner.assert(strategy.canRecover === true, 'Connection refused should be recoverable');
  runner.assert(strategy.severity === 'high', 'Connection refused should be high severity');
  runner.assert(
    strategy.actions.some(a => a.type === 'checkPort'),
    'Should include port check action'
  );
});

runner.test('should handle browser Chrome errors', async () => {
  const recovery = new ErrorRecoveryStrategies();
  
  const error = new Error('Chrome browser not found');
  
  const strategy = await recovery.getRecoveryStrategy('Browser', error);
  
  runner.assert(strategy.canRecover === true, 'Browser errors should be recoverable');
  runner.assert(
    strategy.suggestions.some(s => s.includes('Chrome')),
    'Should mention Chrome in suggestions'
  );
  runner.assert(
    strategy.fallbackOptions.some(f => f.includes('Install Chrome')),
    'Should suggest Chrome installation'
  );
});

runner.test('should handle browser memory errors', async () => {
  const recovery = new ErrorRecoveryStrategies();
  
  const error = new Error('Browser memory exceeded');
  
  const strategy = await recovery.getRecoveryStrategy('Browser', error);
  
  runner.assert(strategy.canRecover === true, 'Memory errors should be recoverable');
  runner.assert(
    strategy.actions.some(a => a.type === 'clearMemory'),
    'Should include memory clearing action'
  );
});

runner.test('should handle image format errors', async () => {
  const recovery = new ErrorRecoveryStrategies();
  
  const error = new Error('Unsupported image format');
  
  const strategy = await recovery.getRecoveryStrategy('ImageProcessing', error, {
    imagePath: '/path/to/image.bmp'
  });
  
  runner.assert(strategy.canRecover === true, 'Format errors should be recoverable');
  runner.assert(strategy.retryable === false, 'Format errors should not be retryable');
  runner.assert(
    strategy.actions.some(a => a.type === 'convertImageFormat'),
    'Should include format conversion action'
  );
});

runner.test('should handle Sharp library errors', async () => {
  const recovery = new ErrorRecoveryStrategies();
  
  const error = new Error('Sharp processing failed');
  
  const strategy = await recovery.getRecoveryStrategy('Library', error);
  
  runner.assert(strategy.canRecover === true, 'Sharp errors should be recoverable');
  runner.assert(strategy.severity === 'high', 'Library errors should be high severity');
  runner.assert(
    strategy.fallbackOptions.some(f => f.includes('Jimp')),
    'Should suggest Jimp as fallback'
  );
});

runner.test('should handle SVGO library errors', async () => {
  const recovery = new ErrorRecoveryStrategies();
  
  const error = new Error('SVGO optimization failed');
  
  const strategy = await recovery.getRecoveryStrategy('Library', error, {
    svgPath: '/path/to/file.svg'
  });
  
  runner.assert(strategy.canRecover === true, 'SVGO errors should be recoverable');
  runner.assert(
    strategy.actions.some(a => a.type === 'validateSVG'),
    'Should include SVG validation action'
  );
});

runner.test('should handle Puppeteer library errors', async () => {
  const recovery = new ErrorRecoveryStrategies();
  
  const error = new Error('Puppeteer browser launch failed');
  
  const strategy = await recovery.getRecoveryStrategy('Library', error);
  
  runner.assert(strategy.canRecover === true, 'Puppeteer errors should be recoverable');
  runner.assert(
    strategy.fallbackOptions.some(f => f.includes('Playwright')),
    'Should suggest Playwright as fallback'
  );
});

runner.test('should handle unknown error categories', async () => {
  const recovery = new ErrorRecoveryStrategies();
  
  const error = new Error('Unknown error type');
  
  const strategy = await recovery.getRecoveryStrategy('UnknownCategory', error);
  
  runner.assert(strategy.canRecover === false, 'Unknown categories should not be recoverable');
  runner.assert(strategy.suggestions.length > 0, 'Should provide generic suggestions');
});

runner.test('should execute recovery actions', async () => {
  const recovery = new ErrorRecoveryStrategies();
  
  // Test path check action
  const pathAction = { type: 'checkPath', path: runner.testDir };
  const pathResult = await recovery.executeRecoveryAction(pathAction);
  runner.assert(pathResult.success === true, 'Should successfully check existing path');
  
  // Test non-existent path
  const badPathAction = { type: 'checkPath', path: '/nonexistent/path' };
  const badPathResult = await recovery.executeRecoveryAction(badPathAction);
  runner.assert(badPathResult.success === false, 'Should fail for non-existent path');
  
  // Test unknown action
  const unknownAction = { type: 'unknownAction' };
  const unknownResult = await recovery.executeRecoveryAction(unknownAction);
  runner.assert(unknownResult.success === false, 'Should fail for unknown action');
});

runner.test('should check system health', async () => {
  const recovery = new ErrorRecoveryStrategies();
  
  const health = await recovery.checkSystemHealth();
  
  runner.assert(health.timestamp, 'Should include timestamp');
  runner.assert(health.overallHealth, 'Should include overall health status');
  runner.assert(health.categories, 'Should include category health checks');
  runner.assert(health.categories.FileSystem, 'Should check FileSystem health');
  runner.assert(health.categories.Network, 'Should check Network health');
  runner.assert(health.categories.Library, 'Should check Library health');
});

runner.test('should calculate error severity correctly', () => {
  const recovery = new ErrorRecoveryStrategies();
  
  runner.assert(recovery.getFileSystemErrorSeverity('ENOSPC') === 'critical', 'Disk space should be critical');
  runner.assert(recovery.getFileSystemErrorSeverity('EACCES') === 'high', 'Permission should be high');
  runner.assert(recovery.getFileSystemErrorSeverity('ENOENT') === 'medium', 'File not found should be medium');
  
  runner.assert(recovery.getNetworkErrorSeverity('ECONNREFUSED') === 'high', 'Connection refused should be high');
  runner.assert(recovery.getNetworkErrorSeverity('ETIMEDOUT') === 'medium', 'Timeout should be medium');
});

runner.test('should calculate network retry delays', () => {
  const recovery = new ErrorRecoveryStrategies();
  
  runner.assert(recovery.getNetworkRetryDelay('ETIMEDOUT') === 3000, 'Timeout should have 3s delay');
  runner.assert(recovery.getNetworkRetryDelay('ECONNREFUSED') === 5000, 'Connection refused should have 5s delay');
  runner.assert(recovery.getNetworkRetryDelay('ENOTFOUND') === 10000, 'Host not found should have 10s delay');
});

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runner.run().then(success => {
    process.exit(success ? 0 : 1);
  });
}

export { runner as errorRecoveryStrategiesTests };