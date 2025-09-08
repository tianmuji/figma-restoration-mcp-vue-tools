import fs from 'fs/promises';
import path from 'path';
import { PNGProcessor } from '../png-processor.js';
import { ValidationError } from '../../utils/error-handler.js';

/**
 * Simple test runner
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
    console.log('🧪 Running PNGProcessor Tests...\n');

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

runner.test('should create PNG processor with correct format', async () => {
  const processor = new PNGProcessor();
  runner.assert(processor.format === 'png', 'Should have PNG format');
});

runner.test('should have correct default configuration', async () => {
  const processor = new PNGProcessor();
  const config = processor.getDefaultConfig();
  
  runner.assert(typeof config.compressionLevel === 'number', 'Should have compression level');
  runner.assert(config.compressionLevel >= 0 && config.compressionLevel <= 9, 'Should have valid compression level');
  runner.assert(typeof config.stripMetadata === 'boolean', 'Should have stripMetadata setting');
  runner.assert(typeof config.timeout === 'number', 'Should have timeout setting');
});

runner.test('should validate configuration correctly', async () => {
  const processor = new PNGProcessor();
  
  // Valid configurations should pass
  const validConfig1 = { compressionLevel: 6, quality: 90 };
  const validated1 = processor.validateConfig(validConfig1);
  runner.assert(validated1.compressionLevel === 6, 'Should accept valid compression level');
  
  const validConfig2 = { colors: 128, palette: true };
  const validated2 = processor.validateConfig(validConfig2);
  runner.assert(validated2.colors === 128, 'Should accept valid colors');
});

runner.test('should reject invalid configuration', async () => {
  const processor = new PNGProcessor();
  
  // Invalid compression level
  await runner.assertThrows(() => processor.validateConfig({ compressionLevel: -1 }), ValidationError);
  await runner.assertThrows(() => processor.validateConfig({ compressionLevel: 10 }), ValidationError);
  
  // Invalid quality
  await runner.assertThrows(() => processor.validateConfig({ quality: 0 }), ValidationError);
  await runner.assertThrows(() => processor.validateConfig({ quality: 101 }), ValidationError);
  
  // Invalid colors
  await runner.assertThrows(() => processor.validateConfig({ colors: 1 }), ValidationError);
  await runner.assertThrows(() => processor.validateConfig({ colors: 300 }), ValidationError);
});

runner.test('should merge configuration with defaults', async () => {
  const processor = new PNGProcessor();
  const defaultConfig = processor.getDefaultConfig();
  
  const userConfig = { compressionLevel: 9, customOption: true };
  const merged = processor.mergeConfig(userConfig);
  
  runner.assert(merged.compressionLevel === 9, 'Should override default compression level');
  runner.assert(merged.stripMetadata === defaultConfig.stripMetadata, 'Should keep default stripMetadata');
  runner.assert(merged.customOption === true, 'Should add custom option');
});

runner.test('should validate PNG format correctly', async () => {
  const processor = new PNGProcessor();
  
  // Mock detectFormat to return 'png'
  const originalDetectFormat = processor.detectFormat;
  processor.detectFormat = () => 'png';
  
  const isValid = await processor.validateFormat('test.png');
  runner.assert(isValid === true, 'Should validate PNG format');
  
  // Restore original method
  processor.detectFormat = originalDetectFormat;
});

runner.test('should calculate compression statistics correctly', async () => {
  const processor = new PNGProcessor();
  
  const stats = processor.calculateCompressionStats(1000, 750);
  runner.assert(stats.originalSize === 1000, 'Should have correct original size');
  runner.assert(stats.optimizedSize === 750, 'Should have correct optimized size');
  runner.assert(stats.reduction === 250, 'Should calculate reduction');
  runner.assert(stats.reductionPercentage === 25, 'Should calculate percentage');
});

runner.test('should format file sizes correctly', async () => {
  const processor = new PNGProcessor();
  
  runner.assert(processor.formatFileSize(1024) === '1 KB', 'Should format KB');
  runner.assert(processor.formatFileSize(1048576) === '1 MB', 'Should format MB');
  runner.assert(processor.formatFileSize(0) === '0 B', 'Should format zero bytes');
});

// Note: We skip actual file optimization tests since they require real PNG files
// and the Sharp library. In a real test environment, you would create test PNG files
// and verify the optimization results.

runner.test('should handle timeout configuration', async () => {
  const processor = new PNGProcessor();
  
  const config = processor.mergeConfig({ timeout: 60 });
  runner.assert(config.timeout === 60, 'Should accept custom timeout');
  
  const validated = processor.validateConfig(config);
  runner.assert(validated.timeout === 60, 'Should validate custom timeout');
});

runner.test('should provide analysis structure', async () => {
  const processor = new PNGProcessor();
  
  // We can't test actual analysis without a real PNG file,
  // but we can verify the processor has the analyze method
  runner.assert(typeof processor.analyze === 'function', 'Should have analyze method');
});

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runner.run().then(success => {
    process.exit(success ? 0 : 1);
  });
}

export { runner as pngProcessorTests };