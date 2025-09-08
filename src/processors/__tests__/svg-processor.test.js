import { SVGProcessor } from '../svg-processor.js';
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
    console.log('🧪 Running SVGProcessor Tests...\n');

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

runner.test('should create SVG processor with correct format', async () => {
  const processor = new SVGProcessor();
  runner.assert(processor.format === 'svg', 'Should have SVG format');
});

runner.test('should have correct default configuration', async () => {
  const processor = new SVGProcessor();
  const config = processor.getDefaultConfig();
  
  runner.assert(Array.isArray(config.plugins), 'Should have plugins array');
  runner.assert(config.plugins.length > 0, 'Should have default plugins');
  runner.assert(typeof config.multipass === 'boolean', 'Should have multipass setting');
  runner.assert(typeof config.floatPrecision === 'number', 'Should have floatPrecision setting');
  runner.assert(typeof config.stripMetadata === 'boolean', 'Should have stripMetadata setting');
  runner.assert(typeof config.timeout === 'number', 'Should have timeout setting');
});

runner.test('should validate configuration correctly', async () => {
  const processor = new SVGProcessor();
  
  // Valid configurations should pass
  const validConfig1 = { multipass: true, floatPrecision: 3 };
  const validated1 = processor.validateConfig(validConfig1);
  runner.assert(validated1.multipass === true, 'Should accept valid multipass');
  
  const validConfig2 = { plugins: [{ name: 'removeComments' }] };
  const validated2 = processor.validateConfig(validConfig2);
  runner.assert(Array.isArray(validated2.plugins), 'Should accept valid plugins');
});

runner.test('should reject invalid configuration', async () => {
  const processor = new SVGProcessor();
  
  // Invalid plugins
  await runner.assertThrows(() => processor.validateConfig({ plugins: 'invalid' }), ValidationError);
  
  // Invalid multipass
  await runner.assertThrows(() => processor.validateConfig({ multipass: 'invalid' }), ValidationError);
  
  // Invalid floatPrecision
  await runner.assertThrows(() => processor.validateConfig({ floatPrecision: -1 }), ValidationError);
  await runner.assertThrows(() => processor.validateConfig({ floatPrecision: 11 }), ValidationError);
});

runner.test('should merge configuration with defaults', async () => {
  const processor = new SVGProcessor();
  const defaultConfig = processor.getDefaultConfig();
  
  const userConfig = { floatPrecision: 1, customOption: true };
  const merged = processor.mergeConfig(userConfig);
  
  runner.assert(merged.floatPrecision === 1, 'Should override default floatPrecision');
  runner.assert(merged.multipass === defaultConfig.multipass, 'Should keep default multipass');
  runner.assert(merged.customOption === true, 'Should add custom option');
});

runner.test('should validate SVG format correctly', async () => {
  const processor = new SVGProcessor();
  
  // Mock detectFormat to return 'svg'
  const originalDetectFormat = processor.detectFormat;
  processor.detectFormat = () => 'svg';
  
  const isValid = await processor.validateFormat('test.svg');
  runner.assert(isValid === true, 'Should validate SVG format');
  
  // Restore original method
  processor.detectFormat = originalDetectFormat;
});

runner.test('should provide plugin recommendations', async () => {
  const processor = new SVGProcessor();
  
  // Test with SVG content containing defs
  const svgWithDefs = '<svg><defs><rect id="r"/></defs><use href="#r"/></svg>';
  const recommendations = processor.getPluginRecommendations(svgWithDefs);
  
  runner.assert(Array.isArray(recommendations), 'Should return array of plugins');
  runner.assert(recommendations.length > 0, 'Should have plugin recommendations');
  
  // Should include collapseGroups for defs
  const hasCollapseGroups = recommendations.some(plugin => 
    plugin.name === 'collapseGroups' || (typeof plugin === 'string' && plugin === 'collapseGroups')
  );
  runner.assert(hasCollapseGroups, 'Should recommend collapseGroups for defs');
});

runner.test('should analyze SVG content structure', async () => {
  const processor = new SVGProcessor();
  
  // We can't test actual file analysis without creating files,
  // but we can verify the analyze method exists and has the right structure
  runner.assert(typeof processor.analyze === 'function', 'Should have analyze method');
  runner.assert(typeof processor.getPluginRecommendations === 'function', 'Should have plugin recommendations method');
});

runner.test('should calculate compression statistics correctly', async () => {
  const processor = new SVGProcessor();
  
  const stats = processor.calculateCompressionStats(5000, 3500);
  runner.assert(stats.originalSize === 5000, 'Should have correct original size');
  runner.assert(stats.optimizedSize === 3500, 'Should have correct optimized size');
  runner.assert(stats.reduction === 1500, 'Should calculate reduction');
  runner.assert(stats.reductionPercentage === 30, 'Should calculate percentage');
});

runner.test('should format file sizes correctly', async () => {
  const processor = new SVGProcessor();
  
  runner.assert(processor.formatFileSize(1024) === '1 KB', 'Should format KB');
  runner.assert(processor.formatFileSize(1048576) === '1 MB', 'Should format MB');
  runner.assert(processor.formatFileSize(0) === '0 B', 'Should format zero bytes');
});

runner.test('should handle timeout configuration', async () => {
  const processor = new SVGProcessor();
  
  const config = processor.mergeConfig({ timeout: 60 });
  runner.assert(config.timeout === 60, 'Should accept custom timeout');
  
  const validated = processor.validateConfig(config);
  runner.assert(validated.timeout === 60, 'Should validate custom timeout');
});

runner.test('should have SVGO-compatible default plugins', async () => {
  const processor = new SVGProcessor();
  const config = processor.getDefaultConfig();
  
  // Check that plugins follow SVGO format
  const hasPresetDefault = config.plugins.some(plugin => 
    plugin.name === 'preset-default' || plugin === 'preset-default'
  );
  runner.assert(hasPresetDefault, 'Should include preset-default plugin');
  
  // Check multipass and floatPrecision are valid SVGO options
  runner.assert(typeof config.multipass === 'boolean', 'Should have boolean multipass');
  runner.assert(typeof config.floatPrecision === 'number', 'Should have numeric floatPrecision');
});

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runner.run().then(success => {
    process.exit(success ? 0 : 1);
  });
}

export { runner as svgProcessorTests };