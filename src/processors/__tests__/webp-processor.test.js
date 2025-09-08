import { WebPProcessor } from '../webp-processor.js';
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
    console.log('🧪 Running WebPProcessor Tests...\n');

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

runner.test('should create WebP processor with correct format', async () => {
  const processor = new WebPProcessor();
  runner.assert(processor.format === 'webp', 'Should have WebP format');
});

runner.test('should have correct default configuration', async () => {
  const processor = new WebPProcessor();
  const config = processor.getDefaultConfig();
  
  runner.assert(typeof config.quality === 'number', 'Should have quality setting');
  runner.assert(config.quality >= 1 && config.quality <= 100, 'Should have valid quality range');
  runner.assert(typeof config.lossless === 'boolean', 'Should have lossless setting');
  runner.assert(typeof config.stripMetadata === 'boolean', 'Should have stripMetadata setting');
  runner.assert(typeof config.effort === 'number', 'Should have effort setting');
  runner.assert(typeof config.preset === 'string', 'Should have preset setting');
  runner.assert(typeof config.timeout === 'number', 'Should have timeout setting');
});

runner.test('should validate configuration correctly', async () => {
  const processor = new WebPProcessor();
  
  // Valid configurations should pass
  const validConfig1 = { quality: 85, lossless: false };
  const validated1 = processor.validateConfig(validConfig1);
  runner.assert(validated1.quality === 85, 'Should accept valid quality');
  
  const validConfig2 = { preset: 'photo', effort: 5 };
  const validated2 = processor.validateConfig(validConfig2);
  runner.assert(validated2.preset === 'photo', 'Should accept valid preset');
});

runner.test('should reject invalid configuration', async () => {
  const processor = new WebPProcessor();
  
  // Invalid quality
  await runner.assertThrows(() => processor.validateConfig({ quality: 0 }), ValidationError);
  await runner.assertThrows(() => processor.validateConfig({ quality: 101 }), ValidationError);
  
  // Invalid alphaQuality
  await runner.assertThrows(() => processor.validateConfig({ alphaQuality: -1 }), ValidationError);
  await runner.assertThrows(() => processor.validateConfig({ alphaQuality: 101 }), ValidationError);
  
  // Invalid effort
  await runner.assertThrows(() => processor.validateConfig({ effort: -1 }), ValidationError);
  await runner.assertThrows(() => processor.validateConfig({ effort: 7 }), ValidationError);
  
  // Invalid preset
  await runner.assertThrows(() => processor.validateConfig({ preset: 'invalid' }), ValidationError);
  
  // Invalid lossless
  await runner.assertThrows(() => processor.validateConfig({ lossless: 'invalid' }), ValidationError);
});

runner.test('should merge configuration with defaults', async () => {
  const processor = new WebPProcessor();
  const defaultConfig = processor.getDefaultConfig();
  
  const userConfig = { quality: 75, customOption: true };
  const merged = processor.mergeConfig(userConfig);
  
  runner.assert(merged.quality === 75, 'Should override default quality');
  runner.assert(merged.lossless === defaultConfig.lossless, 'Should keep default lossless');
  runner.assert(merged.customOption === true, 'Should add custom option');
});

runner.test('should validate WebP format correctly', async () => {
  const processor = new WebPProcessor();
  
  // Mock detectFormat to return 'webp'
  const originalDetectFormat = processor.detectFormat;
  processor.detectFormat = () => 'webp';
  
  const isValid = await processor.validateFormat('test.webp');
  runner.assert(isValid === true, 'Should validate WebP format');
  
  // Restore original method
  processor.detectFormat = originalDetectFormat;
});

runner.test('should provide preset recommendations', async () => {
  const processor = new WebPProcessor();
  
  // Small image (icon)
  const iconPreset = processor.getPresetRecommendation(
    { width: 64, height: 64, channels: 4 }, 
    5000
  );
  runner.assert(iconPreset === 'icon', 'Should recommend icon preset for small images');
  
  // Grayscale image
  const drawingPreset = processor.getPresetRecommendation(
    { width: 500, height: 500, channels: 1 }, 
    50000
  );
  runner.assert(drawingPreset === 'drawing', 'Should recommend drawing preset for grayscale');
  
  // Large image
  const photoPreset = processor.getPresetRecommendation(
    { width: 2000, height: 1500, channels: 3 }, 
    500000
  );
  runner.assert(photoPreset === 'photo', 'Should recommend photo preset for large images');
  
  // Default case
  const defaultPreset = processor.getPresetRecommendation(
    { width: 800, height: 600, channels: 3 }, 
    100000
  );
  runner.assert(defaultPreset === 'default', 'Should recommend default preset for typical images');
});

runner.test('should provide quality recommendations', async () => {
  const processor = new WebPProcessor();
  
  // High compression scenario
  const highCompression = processor.getQualityRecommendation(
    { width: 1000, height: 1000 }, 
    4000000 // 4MB for 1MP image = 4 bytes per pixel
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
    1200000 // 1.2MB for 1MP image = 1.2 bytes per pixel
  );
  runner.assert(balanced === 85, 'Should recommend balanced quality');
});

runner.test('should calculate compression statistics correctly', async () => {
  const processor = new WebPProcessor();
  
  const stats = processor.calculateCompressionStats(3000, 1800);
  runner.assert(stats.originalSize === 3000, 'Should have correct original size');
  runner.assert(stats.optimizedSize === 1800, 'Should have correct optimized size');
  runner.assert(stats.reduction === 1200, 'Should calculate reduction');
  runner.assert(stats.reductionPercentage === 40, 'Should calculate percentage');
});

runner.test('should format file sizes correctly', async () => {
  const processor = new WebPProcessor();
  
  runner.assert(processor.formatFileSize(1024) === '1 KB', 'Should format KB');
  runner.assert(processor.formatFileSize(1048576) === '1 MB', 'Should format MB');
  runner.assert(processor.formatFileSize(0) === '0 B', 'Should format zero bytes');
});

runner.test('should handle timeout configuration', async () => {
  const processor = new WebPProcessor();
  
  const config = processor.mergeConfig({ timeout: 45 });
  runner.assert(config.timeout === 45, 'Should accept custom timeout');
  
  const validated = processor.validateConfig(config);
  runner.assert(validated.timeout === 45, 'Should validate custom timeout');
});

runner.test('should provide analysis structure', async () => {
  const processor = new WebPProcessor();
  
  // We can't test actual analysis without a real WebP file,
  // but we can verify the processor has the analyze method
  runner.assert(typeof processor.analyze === 'function', 'Should have analyze method');
  runner.assert(typeof processor.getPresetRecommendation === 'function', 'Should have preset recommendation method');
  runner.assert(typeof processor.getQualityRecommendation === 'function', 'Should have quality recommendation method');
});

runner.test('should validate preset options', async () => {
  const processor = new WebPProcessor();
  const validPresets = ['default', 'photo', 'picture', 'drawing', 'icon', 'text'];
  
  // All valid presets should pass
  for (const preset of validPresets) {
    const config = processor.validateConfig({ preset });
    runner.assert(config.preset === preset, `Should accept ${preset} preset`);
  }
});

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runner.run().then(success => {
    process.exit(success ? 0 : 1);
  });
}

export { runner as webpProcessorTests };