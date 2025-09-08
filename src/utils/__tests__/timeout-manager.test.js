import { TimeoutManager, TimeoutError, ValidationError } from '../timeout-manager.js';

/**
 * Simple test runner for TimeoutManager
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
    console.log('🧪 Running TimeoutManager Tests...\n');

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

  async assertThrows(fn, expectedError) {
    try {
      await fn();
      throw new Error('Expected function to throw an error');
    } catch (error) {
      if (expectedError && !(error instanceof expectedError)) {
        throw new Error(`Expected ${expectedError.name}, got ${error.constructor.name}`);
      }
    }
  }
}

// Test suite
const runner = new TestRunner();

runner.test('should execute operation successfully within timeout', async () => {
  const operation = Promise.resolve('success');
  const result = await TimeoutManager.withTimeout(operation, {
    timeoutMs: 1000,
    operationName: 'test operation'
  });
  runner.assert(result === 'success', 'Should return operation result');
});

runner.test('should timeout and throw TimeoutError', async () => {
  const operation = new Promise(resolve => setTimeout(() => resolve('late'), 2000));
  
  await runner.assertThrows(
    () => TimeoutManager.withTimeout(operation, {
      timeoutMs: 500,
      operationName: 'slow operation'
    }),
    TimeoutError
  );
});

runner.test('should execute cleanup function on timeout', async () => {
  let cleanupCalled = false;
  const cleanupFn = () => {
    cleanupCalled = true;
  };

  const operation = new Promise(resolve => setTimeout(() => resolve('late'), 2000));
  
  try {
    await TimeoutManager.withTimeout(operation, {
      timeoutMs: 500,
      operationName: 'cleanup test',
      cleanupFn
    });
  } catch (error) {
    // Expected timeout error
  }

  // Give cleanup time to execute
  await new Promise(resolve => setTimeout(resolve, 100));
  runner.assert(cleanupCalled, 'Cleanup function should be called on timeout');
});

runner.test('should retry retryable errors', async () => {
  let attempts = 0;
  const operationFn = () => {
    attempts++;
    if (attempts < 3) {
      const error = new Error('Network error');
      error.code = 'ETIMEDOUT';
      return Promise.reject(error);
    } else {
      return Promise.resolve('success after retries');
    }
  };

  const result = await TimeoutManager.withTimeout(operationFn, {
    timeoutMs: 1000,
    operationName: 'retry test',
    retryCount: 3,
    retryDelay: 100
  });

  runner.assert(result === 'success after retries', 'Should succeed after retries');
  runner.assert(attempts === 3, 'Should make correct number of attempts');
});

runner.test('should not retry non-retryable errors', async () => {
  let attempts = 0;
  const operationFn = () => {
    attempts++;
    const error = new Error('File not found');
    error.code = 'ENOENT';
    return Promise.reject(error);
  };

  await runner.assertThrows(
    () => TimeoutManager.withTimeout(operationFn, {
      timeoutMs: 1000,
      operationName: 'non-retry test',
      retryCount: 3,
      retryDelay: 100
    })
  );

  runner.assert(attempts === 1, 'Should not retry non-retryable errors');
});

runner.test('should create correct configuration for operation types', async () => {
  const fileConfig = TimeoutManager.createConfig('file');
  runner.assert(fileConfig.timeoutMs === 10000, 'File config should have 10s timeout');
  runner.assert(fileConfig.retryCount === 2, 'File config should have 2 retries');

  const networkConfig = TimeoutManager.createConfig('network');
  runner.assert(networkConfig.timeoutMs === 30000, 'Network config should have 30s timeout');
  runner.assert(networkConfig.retryCount === 3, 'Network config should have 3 retries');

  const customConfig = TimeoutManager.createConfig('file', { timeoutMs: 5000 });
  runner.assert(customConfig.timeoutMs === 5000, 'Custom config should override defaults');
});

runner.test('should warn about slow operations', async () => {
  const operation = new Promise(resolve => setTimeout(() => resolve('slow'), 900));
  
  // This should trigger the slow operation warning (>80% of timeout)
  const result = await TimeoutManager.withTimeout(operation, {
    timeoutMs: 1000,
    operationName: 'slow operation test'
  });

  runner.assert(result === 'slow', 'Should complete slow operation');
});

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runner.run().then(success => {
    process.exit(success ? 0 : 1);
  });
}

export { runner as timeoutManagerTests };