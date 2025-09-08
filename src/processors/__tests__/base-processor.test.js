import { BaseProcessor } from '../base-processor.js';
import { ValidationError, FormatError } from '../../utils/error-handler.js';

/**
 * Test implementation of BaseProcessor
 */
class TestProcessor extends BaseProcessor {
  constructor() {
    super('test');
  }

  async optimize(inputPath, config = {}) {
    // Mock optimization that returns success
    return {
      success: true,
      originalSize: 1000,
      optimizedSize: 800,
      format: this.format
    };
  }

  getDefaultConfig() {
    return {
      quality: 85,
      stripMetadata: true
    };
  }
}

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
    console.log('🧪 Running BaseProcessor Tests...\n');

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

runner.test('should not allow direct instantiation of BaseProcessor', async () => {
  await runner.assertThrows(() => new BaseProcessor('test'), Error);
});

runner.test('should allow instantiation of subclasses', async () => {
  const processor = new TestProcessor();
  runner.assert(processor instanceof BaseProcessor, 'Should be instance of BaseProcessor');
  runner.assert(processor.format === 'test', 'Should have correct format');
});

runner.test('should detect image formats correctly', async () => {
  const processor = new TestProcessor();
  
  runner.assert(processor.detectFormat('image.png') === 'png', 'Should detect PNG');
  runner.assert(processor.detectFormat('image.jpg') === 'jpeg', 'Should detect JPEG');
  runner.assert(processor.detectFormat('image.jpeg') === 'jpeg', 'Should detect JPEG');
  runner.assert(processor.detectFormat('image.svg') === 'svg', 'Should detect SVG');
  runner.assert(processor.detectFormat('image.webp') === 'webp', 'Should detect WebP');
});

runner.test('should throw error for unsupported formats', async () => {
  const processor = new TestProcessor();
  
  await runner.assertThrows(() => processor.detectFormat('image.bmp'), FormatError);
  await runner.assertThrows(() => processor.detectFormat('image.gif'), FormatError);
});

runner.test('should merge configuration correctly', async () => {
  const processor = new TestProcessor();
  
  const defaultConfig = processor.getDefaultConfig();
  runner.assert(defaultConfig.quality === 85, 'Should have default quality');
  runner.assert(defaultConfig.stripMetadata === true, 'Should have default stripMetadata');
  
  const mergedConfig = processor.mergeConfig({ quality: 90, newOption: true });
  runner.assert(mergedConfig.quality === 90, 'Should override quality');
  runner.assert(mergedConfig.stripMetadata === true, 'Should keep default stripMetadata');
  runner.assert(mergedConfig.newOption === true, 'Should add new option');
});

runner.test('should validate configuration', async () => {
  const processor = new TestProcessor();
  
  // Valid config should pass
  const validConfig = { timeout: 30 };
  const validated = processor.validateConfig(validConfig);
  runner.assert(validated.timeout === 30, 'Should return valid config');
  
  // Invalid timeout should throw
  await runner.assertThrows(() => processor.validateConfig({ timeout: -1 }), ValidationError);
  await runner.assertThrows(() => processor.validateConfig({ timeout: 'invalid' }), ValidationError);
});

runner.test('should format file sizes correctly', async () => {
  const processor = new TestProcessor();
  
  runner.assert(processor.formatFileSize(0) === '0 B', 'Should format 0 bytes');
  runner.assert(processor.formatFileSize(1024) === '1 KB', 'Should format 1 KB');
  runner.assert(processor.formatFileSize(1048576) === '1 MB', 'Should format 1 MB');
  runner.assert(processor.formatFileSize(1536) === '1.5 KB', 'Should format 1.5 KB');
});

runner.test('should calculate compression statistics correctly', async () => {
  const processor = new TestProcessor();
  
  const stats = processor.calculateCompressionStats(1000, 800);
  runner.assert(stats.originalSize === 1000, 'Should have correct original size');
  runner.assert(stats.optimizedSize === 800, 'Should have correct optimized size');
  runner.assert(stats.reduction === 200, 'Should calculate reduction');
  runner.assert(stats.reductionPercentage === 20, 'Should calculate percentage');
  runner.assert(stats.compressionRatio === 0.8, 'Should calculate compression ratio');
});

runner.test('should handle zero-size files in compression stats', async () => {
  const processor = new TestProcessor();
  
  const stats = processor.calculateCompressionStats(0, 0);
  runner.assert(stats.reductionPercentage === 0, 'Should handle zero original size');
  runner.assert(stats.compressionRatio === 1, 'Should handle zero original size');
});

runner.test('should validate format correctly', async () => {
  const processor = new TestProcessor();
  
  // Mock the detectFormat to return 'test' for valid files
  const originalDetectFormat = processor.detectFormat;
  processor.detectFormat = () => 'test';
  
  const isValid = await processor.validateFormat('test.file');
  runner.assert(isValid === true, 'Should validate matching format');
  
  // Restore original method
  processor.detectFormat = originalDetectFormat;
});

runner.test('should throw FormatError for mismatched formats', async () => {
  const processor = new TestProcessor();
  
  // This will detect 'png' but processor expects 'test'
  await runner.assertThrows(() => processor.validateFormat('image.png'), FormatError);
});

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runner.run().then(success => {
    process.exit(success ? 0 : 1);
  });
}

export { runner as baseProcessorTests };