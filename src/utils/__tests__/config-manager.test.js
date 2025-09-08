import { ConfigManager, globalConfig } from '../config-manager.js';
import { ValidationError } from '../error-handler.js';

/**
 * Simple test runner for ConfigManager
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
    console.log('🧪 Running ConfigManager Tests...\n');

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

runner.test('should initialize with default configurations', async () => {
  const config = new ConfigManager();
  
  const globalDefaults = config.get('global');
  runner.assert(globalDefaults.timeout === 30000, 'Should have default timeout');
  runner.assert(globalDefaults.retryCount === 0, 'Should have default retry count');
  runner.assert(globalDefaults.logLevel === 'info', 'Should have default log level');
  
  const timeouts = config.get('timeouts');
  runner.assert(timeouts.figma_compare.default === 30000, 'Should have figma_compare timeout');
  runner.assert(timeouts.snapdom_screenshot.default === 60000, 'Should have snapdom_screenshot timeout');
  runner.assert(timeouts.optimize_svg.default === 30000, 'Should have optimize_svg timeout');
});

runner.test('should get and set configuration values', async () => {
  const config = new ConfigManager();
  
  // Test setting specific key
  config.set('global', 'timeout', 45000);
  runner.assert(config.get('global', 'timeout') === 45000, 'Should set specific key');
  
  // Test setting entire category
  config.set('global', { timeout: 60000, verbose: true });
  runner.assert(config.get('global', 'timeout') === 60000, 'Should set entire category');
  runner.assert(config.get('global', 'verbose') === true, 'Should merge with existing config');
});

runner.test('should merge configurations correctly', async () => {
  const config = new ConfigManager();
  
  const originalGlobal = config.get('global');
  config.merge('global', { timeout: 50000, newProperty: 'test' });
  
  const mergedGlobal = config.get('global');
  runner.assert(mergedGlobal.timeout === 50000, 'Should update existing property');
  runner.assert(mergedGlobal.newProperty === 'test', 'Should add new property');
  runner.assert(mergedGlobal.retryCount === originalGlobal.retryCount, 'Should preserve other properties');
});

runner.test('should reset to defaults', async () => {
  const config = new ConfigManager();
  
  // Modify configuration
  config.set('global', 'timeout', 99999);
  runner.assert(config.get('global', 'timeout') === 99999, 'Should modify config');
  
  // Reset to defaults
  config.reset('global');
  runner.assert(config.get('global', 'timeout') === 30000, 'Should reset to default');
});

runner.test('should get tool-specific timeouts', async () => {
  const config = new ConfigManager();
  
  const figmaTimeout = config.getTimeout('figma_compare', 'imageProcessing');
  runner.assert(figmaTimeout === 45000, 'Should get specific operation timeout');
  
  const defaultTimeout = config.getTimeout('figma_compare');
  runner.assert(defaultTimeout === 30000, 'Should get default timeout');
  
  const unknownToolTimeout = config.getTimeout('unknown_tool');
  runner.assert(unknownToolTimeout === 30000, 'Should fallback to global timeout');
});

runner.test('should get retry configurations', async () => {
  const config = new ConfigManager();
  
  const networkRetry = config.getRetryConfig('networkOperations');
  runner.assert(networkRetry.count === 3, 'Should get network retry count');
  runner.assert(networkRetry.delay === 1000, 'Should get network retry delay');
  runner.assert(networkRetry.backoff === 'exponential', 'Should get network backoff strategy');
  
  const unknownRetry = config.getRetryConfig('unknownOperation');
  runner.assert(unknownRetry.count === 0, 'Should fallback to global retry count');
});

runner.test('should apply environment configurations', async () => {
  const config = new ConfigManager();
  
  const originalTimeout = config.get('global', 'timeout');
  config.applyEnvironment('development');
  
  const devTimeout = config.get('global', 'timeout');
  runner.assert(devTimeout === 60000, 'Should apply development timeout');
  runner.assert(config.get('global', 'verbose') === true, 'Should apply development verbose setting');
});

runner.test('should validate configurations', async () => {
  const config = new ConfigManager();
  
  // Test invalid timeout
  await runner.assertThrows(
    () => config.set('global', 'timeout', -1000),
    ValidationError
  );
  
  // Test invalid retry count
  await runner.assertThrows(
    () => config.set('global', 'retryCount', -1),
    ValidationError
  );
});

runner.test('should handle configuration listeners', async () => {
  const config = new ConfigManager();
  let listenerCalled = false;
  let receivedConfig = null;
  
  const listener = (newConfig, category) => {
    listenerCalled = true;
    receivedConfig = newConfig;
  };
  
  config.addListener('global', listener);
  config.set('global', 'timeout', 55000);
  
  runner.assert(listenerCalled, 'Should call listener on config change');
  runner.assert(receivedConfig.timeout === 55000, 'Should pass new config to listener');
  
  // Test listener removal
  config.removeListener('global', listener);
  listenerCalled = false;
  config.set('global', 'timeout', 66000);
  
  runner.assert(!listenerCalled, 'Should not call removed listener');
});

runner.test('should register and use custom validators', async () => {
  const config = new ConfigManager();
  
  const customValidator = (configData) => {
    if (configData.customValue && configData.customValue < 0) {
      return { valid: false, errors: ['customValue must be positive'] };
    }
    return { valid: true, errors: [] };
  };
  
  config.registerValidator('custom', customValidator);
  
  // Valid configuration should work
  config.set('custom', { customValue: 10 });
  runner.assert(config.get('custom', 'customValue') === 10, 'Should accept valid config');
  
  // Invalid configuration should throw
  await runner.assertThrows(
    () => config.set('custom', { customValue: -5 }),
    ValidationError
  );
});

runner.test('should export and import configurations', async () => {
  const config = new ConfigManager();
  
  // Modify some configurations
  config.set('global', 'timeout', 77000);
  config.set('custom', { testValue: 'exported' });
  
  const exported = config.export();
  runner.assert(exported.global.timeout === 77000, 'Should export modified values');
  runner.assert(exported.custom.testValue === 'exported', 'Should export custom categories');
  
  // Test categories list
  const categories = config.getCategories();
  runner.assert(categories.includes('global'), 'Should list global category');
  runner.assert(categories.includes('timeouts'), 'Should list timeouts category');
});

runner.test('should handle deep merge correctly', async () => {
  const config = new ConfigManager();
  
  // Set nested configuration
  config.set('nested', {
    level1: {
      level2: {
        value1: 'original',
        value2: 'keep'
      }
    }
  });
  
  // Merge with partial update
  config.merge('nested', {
    level1: {
      level2: {
        value1: 'updated',
        value3: 'new'
      }
    }
  });
  
  const result = config.get('nested');
  runner.assert(result.level1.level2.value1 === 'updated', 'Should update existing nested value');
  runner.assert(result.level1.level2.value2 === 'keep', 'Should preserve other nested values');
  runner.assert(result.level1.level2.value3 === 'new', 'Should add new nested values');
});

runner.test('should handle timeout validation for tool configurations', async () => {
  const config = new ConfigManager();
  
  // Test valid timeout configuration
  config.set('timeouts', {
    custom_tool: {
      default: 15000,
      operation1: 25000
    }
  });
  
  const customTimeout = config.getTimeout('custom_tool', 'operation1');
  runner.assert(customTimeout === 25000, 'Should get custom tool timeout');
  
  // Test invalid timeout configuration
  await runner.assertThrows(
    () => config.set('timeouts', {
      invalid_tool: {
        default: -1000  // Invalid negative timeout
      }
    }),
    ValidationError
  );
});

runner.test('should use global config instance correctly', async () => {
  // Test that globalConfig is properly initialized
  runner.assert(globalConfig instanceof ConfigManager, 'Should be ConfigManager instance');
  
  const globalTimeout = globalConfig.get('global', 'timeout');
  runner.assert(typeof globalTimeout === 'number', 'Should have numeric timeout');
  
  // Test that changes persist
  globalConfig.set('global', 'testProperty', 'testValue');
  runner.assert(globalConfig.get('global', 'testProperty') === 'testValue', 'Should persist changes');
});

runner.test('should auto-detect environment', async () => {
  const config = new ConfigManager();
  
  // Mock NODE_ENV
  const originalEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = 'production';
  
  const detectedEnv = config.autoDetectEnvironment();
  runner.assert(detectedEnv === 'production', 'Should detect production environment');
  
  const timeout = config.get('global', 'timeout');
  runner.assert(timeout === 30000, 'Should apply production timeout');
  
  // Restore original environment
  process.env.NODE_ENV = originalEnv;
});

runner.test('should validate configuration against schema', async () => {
  const config = new ConfigManager();
  
  // Test valid configuration
  const validResult = config.validateAgainstSchema('global', {
    timeout: 5000,
    retryCount: 2,
    logLevel: 'info',
    verbose: true
  });
  runner.assert(validResult.valid === true, 'Should validate correct configuration');
  
  // Test invalid configuration
  const invalidResult = config.validateAgainstSchema('global', {
    timeout: 'invalid',  // Should be number
    retryCount: -1,      // Should be >= 0
    logLevel: 'invalid'  // Should be valid enum value
  });
  runner.assert(invalidResult.valid === false, 'Should reject invalid configuration');
  runner.assert(invalidResult.errors.length > 0, 'Should provide error details');
});

runner.test('should get configuration schema', async () => {
  const config = new ConfigManager();
  
  const schema = config.getSchema();
  runner.assert(schema.global, 'Should have global schema');
  runner.assert(schema.timeouts, 'Should have timeouts schema');
  runner.assert(schema.retries, 'Should have retries schema');
  
  // Test schema structure
  runner.assert(schema.global.type === 'object', 'Global schema should be object type');
  runner.assert(schema.global.properties.timeout, 'Should have timeout property schema');
});

runner.test('should validate property types correctly', async () => {
  const config = new ConfigManager();
  
  // Test number property validation
  const numberErrors = config.validateProperty('timeout', 'not-a-number', { type: 'number', minimum: 100 });
  runner.assert(numberErrors.length > 0, 'Should reject non-number for number property');
  
  // Test enum validation
  const enumErrors = config.validateProperty('logLevel', 'invalid', { type: 'string', enum: ['error', 'warn', 'info', 'debug'] });
  runner.assert(enumErrors.length > 0, 'Should reject invalid enum value');
  
  // Test minimum validation
  const minErrors = config.validateProperty('timeout', 50, { type: 'number', minimum: 100 });
  runner.assert(minErrors.length > 0, 'Should reject value below minimum');
});

runner.test('should handle enhanced validation errors', async () => {
  const config = new ConfigManager();
  
  // Test timeout too small
  await runner.assertThrows(
    () => config.set('global', 'timeout', 50),
    ValidationError
  );
  
  // Test invalid log level
  await runner.assertThrows(
    () => config.set('global', 'logLevel', 'invalid-level'),
    ValidationError
  );
  
  // Test retry count too high
  await runner.assertThrows(
    () => config.set('global', 'retryCount', 15),
    ValidationError
  );
});

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runner.run().then(success => {
    process.exit(success ? 0 : 1);
  });
}

export { runner as configManagerTests };