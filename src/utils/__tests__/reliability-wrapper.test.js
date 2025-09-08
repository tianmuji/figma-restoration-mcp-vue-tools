import { ReliabilityWrapper } from '../reliability-wrapper.js';
import { ValidationError } from '../error-handler.js';
import { TimeoutError } from '../timeout-manager.js';

/**
 * Mock tool for testing ReliabilityWrapper
 */
class MockTool {
  constructor() {
    this.description = 'Mock tool for testing';
    this.inputSchema = {
      type: 'object',
      properties: {
        requiredParam: {
          type: 'string',
          description: 'Required parameter'
        },
        optionalParam: {
          type: 'number',
          description: 'Optional parameter'
        }
      },
      required: ['requiredParam']
    };
  }

  async execute(args) {
    // Simulate different behaviors based on input
    if (args.shouldFail) {
      throw new Error('Mock tool failure');
    }
    
    if (args.shouldTimeout) {
      return new Promise(() => {}); // Never resolves
    }
    
    if (args.shouldReturnError) {
      return { success: false, error: 'Mock error response' };
    }
    
    // Normal successful execution
    return {
      success: true,
      result: 'Mock tool executed successfully',
      processedParam: args.requiredParam,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Simple test runner for ReliabilityWrapper
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
    console.log('🧪 Running ReliabilityWrapper Tests...\n');

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

runner.test('should create wrapper with original tool', async () => {
  const mockTool = new MockTool();
  const wrapper = new ReliabilityWrapper(mockTool);
  
  runner.assert(wrapper.originalTool === mockTool, 'Should store original tool');
  runner.assert(wrapper.toolName === 'MockTool', 'Should extract tool name');
  runner.assert(wrapper.description === 'Mock tool for testing', 'Should preserve description');
  runner.assert(wrapper.inputSchema.type === mockTool.inputSchema.type, 'Should preserve input schema structure');
});

runner.test('should throw error if no original tool provided', async () => {
  await runner.assertThrows(
    () => new ReliabilityWrapper(null),
    Error
  );
});

runner.test('should enhance input schema with reliability options', async () => {
  const mockTool = new MockTool();
  const wrapper = new ReliabilityWrapper(mockTool);
  
  runner.assert(wrapper.inputSchema.properties.timeout, 'Should add timeout property');
  runner.assert(wrapper.inputSchema.properties.retryCount, 'Should add retryCount property');
  runner.assert(wrapper.inputSchema.properties.retryDelay, 'Should add retryDelay property');
  runner.assert(wrapper.inputSchema.properties.verbose, 'Should add verbose property');
});

runner.test('should execute original tool successfully', async () => {
  const mockTool = new MockTool();
  const wrapper = new ReliabilityWrapper(mockTool);
  
  const result = await wrapper.execute({
    requiredParam: 'test-value'
  });
  
  runner.assert(result.success === true, 'Should return successful result');
  runner.assert(result.result.result === 'Mock tool executed successfully', 'Should return original result');
  runner.assert(result._reliability, 'Should add reliability metadata');
  runner.assert(result._reliability.enhanced === true, 'Should mark as enhanced');
  runner.assert(typeof result._reliability.duration === 'number', 'Should include duration');
});

runner.test('should validate required parameters', async () => {
  const mockTool = new MockTool();
  const wrapper = new ReliabilityWrapper(mockTool);
  
  const result = await wrapper.execute({
    // Missing requiredParam
    optionalParam: 123
  });
  
  runner.assert(result.success === false, 'Should return error for missing required param');
  runner.assert(result.error.category === 'General', 'Should categorize validation error');
  runner.assert(result.error.message.includes('Required property'), 'Should mention missing property');
});

runner.test('should validate parameter types', async () => {
  const mockTool = new MockTool();
  const wrapper = new ReliabilityWrapper(mockTool);
  
  const result = await wrapper.execute({
    requiredParam: 'test-value',
    optionalParam: 'not-a-number' // Should be number
  });
  
  runner.assert(result.success === false, 'Should return error for wrong type');
  runner.assert(result.error.message.includes('must be of type number'), 'Should mention type error');
});

runner.test('should handle tool execution errors', async () => {
  const mockTool = new MockTool();
  const wrapper = new ReliabilityWrapper(mockTool);
  
  const result = await wrapper.execute({
    requiredParam: 'test-value',
    shouldFail: true
  });
  
  runner.assert(result.success === false, 'Should return error response');
  runner.assert(result.error.message === 'Mock tool failure', 'Should preserve original error message');
  runner.assert(result.error.category, 'Should categorize error');
  runner.assert(result.error.context.tool === 'MockTool', 'Should include tool context');
});

runner.test('should handle timeout scenarios', async () => {
  const mockTool = new MockTool();
  const wrapper = new ReliabilityWrapper(mockTool);
  
  const result = await wrapper.execute({
    requiredParam: 'test-value',
    shouldTimeout: true,
    timeout: 100 // Very short timeout
  });
  
  runner.assert(result.success === false, 'Should return error for timeout');
  runner.assert(result.error.category === 'Timeout', 'Should categorize as timeout error');
  runner.assert(result.error.message.includes('timed out'), 'Should mention timeout');
});

runner.test('should use custom timeout from arguments', async () => {
  const mockTool = new MockTool();
  const wrapper = new ReliabilityWrapper(mockTool);
  
  const startTime = Date.now();
  const result = await wrapper.execute({
    requiredParam: 'test-value',
    timeout: 200 // Valid custom timeout
  });
  const duration = Date.now() - startTime;
  
  runner.assert(result.success === true, 'Should complete within custom timeout');
  runner.assert(duration < 300, 'Should respect custom timeout setting');
});

runner.test('should enhance arguments with reliability metadata', async () => {
  const mockTool = new MockTool();
  const wrapper = new ReliabilityWrapper(mockTool);
  
  // Override execute to capture enhanced args
  let capturedArgs = null;
  const originalExecute = mockTool.execute;
  mockTool.execute = async (args) => {
    capturedArgs = args;
    return originalExecute.call(mockTool, args);
  };
  
  await wrapper.execute({
    requiredParam: 'test-value'
  });
  
  runner.assert(capturedArgs._reliability, 'Should add reliability metadata to args');
  runner.assert(capturedArgs._reliability.wrapperVersion, 'Should include wrapper version');
  runner.assert(capturedArgs._reliability.toolName === 'MockTool', 'Should include tool name');
});

runner.test('should collect and include metrics', async () => {
  const mockTool = new MockTool();
  const wrapper = new ReliabilityWrapper(mockTool, { enableMetrics: true });
  
  const result = await wrapper.execute({
    requiredParam: 'test-value'
  });
  
  runner.assert(result._reliability.metrics, 'Should include metrics');
  runner.assert(typeof result._reliability.metrics.duration === 'number', 'Should include duration metric');
  runner.assert(result._reliability.metrics.success === true, 'Should include success metric');
  runner.assert(result._reliability.metrics.toolName === 'MockTool', 'Should include tool name metric');
});

runner.test('should preserve error responses from original tool', async () => {
  const mockTool = new MockTool();
  const wrapper = new ReliabilityWrapper(mockTool);
  
  const result = await wrapper.execute({
    requiredParam: 'test-value',
    shouldReturnError: true
  });
  
  // Original tool returns error response, wrapper should preserve it
  runner.assert(result.success === false, 'Should preserve error response');
  runner.assert(result.error === 'Mock error response', 'Should preserve original error');
});

runner.test('should generate unique operation IDs', async () => {
  const mockTool = new MockTool();
  const wrapper = new ReliabilityWrapper(mockTool);
  
  const result1 = await wrapper.execute({ requiredParam: 'test1' });
  const result2 = await wrapper.execute({ requiredParam: 'test2' });
  
  runner.assert(result1._reliability.operationId !== result2._reliability.operationId, 
    'Should generate unique operation IDs');
});

runner.test('should update configuration dynamically', async () => {
  const mockTool = new MockTool();
  const wrapper = new ReliabilityWrapper(mockTool, { verbose: false });
  
  runner.assert(wrapper.config.verbose === false, 'Should start with verbose false');
  
  wrapper.updateConfig({ verbose: true, enableMetrics: true });
  
  runner.assert(wrapper.config.verbose === true, 'Should update verbose setting');
  runner.assert(wrapper.config.enableMetrics === true, 'Should update metrics setting');
});

runner.test('should provide tool statistics', async () => {
  const mockTool = new MockTool();
  const wrapper = new ReliabilityWrapper(mockTool);
  
  // Execute a few operations
  await wrapper.execute({ requiredParam: 'test1' });
  await wrapper.execute({ requiredParam: 'test2' });
  
  const stats = wrapper.getStatistics();
  
  runner.assert(typeof stats === 'object', 'Should return statistics object');
  runner.assert(stats.total >= 2, 'Should track executed operations');
});

runner.test('should handle invalid arguments gracefully', async () => {
  const mockTool = new MockTool();
  const wrapper = new ReliabilityWrapper(mockTool);
  
  const result = await wrapper.execute(null);
  
  runner.assert(result.success === false, 'Should handle null arguments');
  runner.assert(result.error.message.includes('valid object'), 'Should mention object requirement');
});

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runner.run().then(success => {
    process.exit(success ? 0 : 1);
  });
}

export { runner as reliabilityWrapperTests };