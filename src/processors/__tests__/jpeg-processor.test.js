import { JPEGProcessor } from '../jpeg-processor.js';
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
    console.log('🧪 Running JPEGProcessor Tests...\n');

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

runner.test('should create JPEG processor with correct format', async () => {
  const processor = new JPEGProcessor();
  runner.assert(processor.format === 'jpeg', 'Should have JPEG format');
});

runner.test('should have correct default configuration', async () => {
  const processor = new JPEGProcessor();
  const config = processor.getDefaultConfig();
  
  runner.assert(typeof config.quality === 'number', 'Should have quality setting');
  runner.assert(config.quality >= 1 && config.quality <= 100, 'Should have valid quality range');
  runner.assert(typeof config.progressive === 'boolean', 'Should have progressive setting');
  runner.assert(typeof config.stripMetadata === 'boolean', 'Should have stripMetadata setting');
  runner.assert(typeof config.mozjpeg === 'boolean', 'Should have mozjpeg setting');
  runner.assert(typeof config.timeout === 'number', 'Should have timeout setting');
});

runner.test('should validate configuration correctly', async () => {
  const processor = new JPEGProcessor();
  
  // Valid configurations should pass
  const validConfig1 = { quality: 85, progressive: true };
  const validated1 = processor.validateConfig(validConfig1);
  runner.assert(validated1.quality === 85, 'Should accept valid quality');
  
  const validConfig2 = { quality: 50, mozjpeg: false };
  const validated2 = processor.validateConfig(validConfig2);
  runner.assert(validated2.quality === 50, 'Should accept valid quality');
});

runner.test('should reject invalid configuration', async () => {
  const processor = new JPEGProcessor();
  
  // Invalid quality
  await runner.assertThrows(() => processor.validateConfig({ quality: 0 }), ValidationError);
  await runner.assertThrows(() => processor.validateConfig({ quality: 101 }), ValidationError);
  await runner.assertThrows(() => processor.validateConfig({ quality: 'invalid' }), ValidationError);
  
  // Invalid progressive
  await runner.assertThrows(() => processor.validateConfig({ progressive: 'invalid' }), ValidationError);
  
  // Invalid mozjpeg
  await runner.assertThrows(() => processor.validateConfig({ mozjpeg: 'invalid' }), ValidationError);
});

runner.test('should merge configuration with defaults', async () => {
  const processor = new JPEGProcessor();
  const defaultConfig = processor.getDefaultConfig();
  
  const userConfig = { quality: 75, customOption: true };
  const merged = processor.mergeConfig(userConfig);
  
  runner.assert(merged.quality === 75, 'Should override default quality');
  runner.assert(merged.progressive === defaultConfig.progressive, 'Should keep default progressive');
  runner.assert(merged.customOption === true, 'Should add custom option');
});

runner.test('should validate JPEG format correctly', async () => {
  const processor = new JPEGProcessor();
  
  // Mock detectFormat to return 'jpeg'
  const originalDetectFormat = processor.detectFormat;
  processor.detectFormat = () => 'jpeg';
  
  const isValid = await processor.validateFormat('test.jpg');
  runner.assert(isValid === true, 'Should validate JPEG format');
  
  // Restore original method
  processor.detectFormat = originalDetectFormat;
});

runner.test('should provide quality recommendations', async () => {
  const processor = new JPEGProcessor();
  
  // High compression scenario
  const highCompression = processor.getQualityRecommendation(
    { width: 1000, height: 1000 }, 
    5000000 // 5MB for 1MP image = 5 bytes per pixel
  );
  runner.assert(highCompression === 75, 'Should recommend lower quality for high compression');
  
  // Low compression scenario
  const lowCompression = processor.getQualityRecommendation(
    { width: 1000, height: 1000 }, 
    500000 // 0.5MB for 1MP image = 0.5 bytes per pixel
  );
  runner.assert(lowCompression === 90, 'Should recommend higher quality for low compression');
  
  // Balanced scenario
  const balanced = processor.getQualityRecommendation(
    { width: 1000, height: 1000 }, 
    1500000 // 1.5MB for 1MP image = 1.5 bytes per pixel
  );
  runner.assert(balanced === 85, 'Should recommend balanced quality');
});

runner.test('should calculate compression statistics correctly', async () => {
  const processor = new JPEGProcessor();
  
  const stats = processor.calculateCompressionStats(2000, 1200);
  runner.assert(stats.originalSize === 2000, 'Should have correct original size');
  runner.assert(stats.optimizedSize === 1200, 'Should have correct optimized size');
  runner.assert(stats.reduction === 800, 'Should calculate reduction');
  runner.assert(stats.reductionPercentage === 40, 'Should calculate percentage');
});

runner.test('should format file sizes correctly', async () => {
  const processor = new JPEGProcessor();
  
  runner.assert(processor.formatFileSize(1024) === '1 KB', 'Should format KB');
  runner.assert(processor.formatFileSize(1048576) === '1 MB', 'Should format MB');
  runner.assert(processor.formatFileSize(0) === '0 B', 'Should format zero bytes');
});

runner.test('should handle timeout configuration', async () => {
  const processor = new JPEGProcessor();
  
  const config = processor.mergeConfig({ timeout: 45 });
  runner.assert(config.timeout === 45, 'Should accept custom timeout');
  
  const validated = processor.validateConfig(config);
  runner.assert(validated.timeout === 45, 'Should validate custom timeout');
});

runner.test('should provide analysis structure', async () => {
  const processor = new JPEGProcessor();
  
  // We can't test actual analysis without a real JPEG file,
  // but we can verify the processor has the analyze method
  runner.assert(typeof processor.analyze === 'function', 'Should have analyze method');
  runner.assert(typeof processor.getQualityRecommendation === 'function', 'Should have quality recommendation method');
});

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runner.run().then(success => {
    process.exit(success ? 0 : 1);
  });
}

export { runner as jpegProcessorTests };