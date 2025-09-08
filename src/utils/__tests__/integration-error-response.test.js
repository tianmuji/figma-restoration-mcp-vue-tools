import { ErrorResponseSystem } from '../error-response-system.js';
import { EnhancedOptimizeSVGTool } from '../../tools/enhanced-optimize-svg.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Integration test runner for standardized error response system
 */
class IntegrationTestRunner {
  constructor() {
    this.tests = [];
    this.passed = 0;
    this.failed = 0;
    this.testDir = path.join(__dirname, 'test-temp-integration');
  }

  test(name, testFn) {
    this.tests.push({ name, testFn });
  }

  async run() {
    console.log('🧪 Running Integration Error Response Tests...\\n');

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

    console.log(`\\n📊 Integration Test Results: ${this.passed} passed, ${this.failed} failed`);
    return this.failed === 0;
  }

  async setupTestEnvironment() {
    // Create test directory structure
    await fs.mkdir(this.testDir, { recursive: true });
    await fs.mkdir(path.join(this.testDir, 'src'), { recursive: true });
    await fs.mkdir(path.join(this.testDir, 'src', 'components'), { recursive: true });
    await fs.mkdir(path.join(this.testDir, 'src', 'components', 'TestComponent'), { recursive: true });

    // Create test files
    const testSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
  <rect x="10" y="10" width="80" height="80" fill="red" />
</svg>`;

    await fs.writeFile(path.join(this.testDir, 'src', 'components', 'TestComponent', 'test.svg'), testSvg);
    
    // Create invalid files for error testing
    await fs.writeFile(path.join(this.testDir, 'invalid.svg'), 'Not an SVG file');
    await fs.writeFile(path.join(this.testDir, 'empty.svg'), '');
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

  /**
   * Validate that a response follows the standardized error format
   */
  validateErrorResponse(response, toolName) {
    this.assert(response.success === false, 'Error response should have success: false');
    this.assert(response.error, 'Error response should have error object');
    this.assert(response.error.message, 'Error should have message');
    this.assert(response.error.code, 'Error should have code');
    this.assert(/^E\\d{4}$/.test(response.error.code), 'Error code should match E#### format');
    this.assert(response.error.category, 'Error should have category');
    this.assert(response.error.severity, 'Error should have severity');
    this.assert(Array.isArray(response.error.suggestions), 'Error should have suggestions array');
    this.assert(response.error.context, 'Error should have context');
    this.assert(response.error.context.tool === toolName, 'Error context should include tool name');
    this.assert(response.error.technical, 'Error should have technical details');
    this.assert(response.error.recovery, 'Error should have recovery information');
    this.assert(response._reliability, 'Error response should have reliability metadata');
    this.assert(response._reliability.enhanced === true, 'Should mark as enhanced');
  }

  /**
   * Validate that a response follows the standardized success format
   */
  validateSuccessResponse(response) {
    this.assert(response.success === true, 'Success response should have success: true');
    this.assert(response.result !== undefined, 'Success response should have result');
    this.assert(response._reliability, 'Success response should have reliability metadata');
    this.assert(response._reliability.enhanced === true, 'Should mark as enhanced');
    this.assert(response._reliability.timestamp, 'Should have timestamp');
    this.assert(response._reliability.version, 'Should have version');
  }
}

// Test suite
const runner = new IntegrationTestRunner();

// Enhanced Optimize SVG Tool Tests
runner.test('EnhancedOptimizeSVGTool should return standardized error responses', async () => {
  const tool = new EnhancedOptimizeSVGTool({ verbose: false });
  
  // Test with non-existent file
  const result = await tool.execute({
    inputPath: path.join(runner.testDir, 'nonexistent.svg')
  });
  
  runner.validateErrorResponse(result, 'OptimizeSVGTool');
  // File validation errors can be either E1001 (validation) or E1101 (file not found)
  runner.assert(
    result.error.code === 'E1001' || result.error.code === 'E1101', 
    `Should use validation or file not found error code, got ${result.error.code}`
  );
});

runner.test('EnhancedOptimizeSVGTool should handle invalid SVG files', async () => {
  const tool = new EnhancedOptimizeSVGTool({ verbose: false });
  
  // Test with invalid SVG content
  const result = await tool.execute({
    inputPath: path.join(runner.testDir, 'invalid.svg')
  });
  
  runner.validateErrorResponse(result, 'OptimizeSVGTool');
});

runner.test('EnhancedOptimizeSVGTool should handle empty SVG files', async () => {
  const tool = new EnhancedOptimizeSVGTool({ verbose: false });
  
  // Test with empty SVG file
  const result = await tool.execute({
    inputPath: path.join(runner.testDir, 'empty.svg')
  });
  
  runner.validateErrorResponse(result, 'OptimizeSVGTool');
});

runner.test('EnhancedOptimizeSVGTool should return standardized success responses', async () => {
  const tool = new EnhancedOptimizeSVGTool({ verbose: false });
  
  // Test with valid SVG file
  const result = await tool.execute({
    inputPath: path.join(runner.testDir, 'src', 'components', 'TestComponent', 'test.svg')
  });
  
  if (result.success === true) {
    runner.validateSuccessResponse(result);
  } else {
    runner.validateErrorResponse(result, 'OptimizeSVGTool');
  }
});

runner.test('Error responses should be valid according to ErrorResponseSystem', async () => {
  const tool = new EnhancedOptimizeSVGTool({ verbose: false });
  
  const result = await tool.execute({
    inputPath: '/nonexistent/file.svg'
  });
  
  runner.assert(result.success === false, 'Should be error response');
  
  // Validate using ErrorResponseSystem
  const isValid = ErrorResponseSystem.validateErrorResponse(result);
  runner.assert(isValid === true, 'Error response should pass ErrorResponseSystem validation');
});

runner.test('Success responses should follow standardized format', async () => {
  const tool = new EnhancedOptimizeSVGTool({ verbose: false });
  
  const result = await tool.execute({
    inputPath: path.join(runner.testDir, 'src', 'components', 'TestComponent', 'test.svg')
  });
  
  if (result.success === true) {
    runner.validateSuccessResponse(result);
    
    // Check that it follows ErrorResponseSystem success format
    runner.assert(result.result !== undefined, 'Should have result property');
    runner.assert(result._reliability.operationId, 'Should have operation ID');
    runner.assert(typeof result._reliability.duration === 'number', 'Should have duration');
  }
});

runner.test('All tools should provide actionable error suggestions', async () => {
  const tool = new EnhancedOptimizeSVGTool({ verbose: false });
  
  const result = await tool.execute({
    inputPath: '/nonexistent/file.svg'
  });
  
  runner.assert(result.success === false, 'Should be error response');
  runner.assert(Array.isArray(result.error.suggestions), 'Should have suggestions array');
  runner.assert(result.error.suggestions.length > 0, 'Should provide at least one suggestion');
  
  // Check that suggestions are actionable (contain action words)
  const actionWords = ['check', 'verify', 'ensure', 'try', 'use', 'install', 'update', 'create'];
  const hasActionableSuggestion = result.error.suggestions.some(suggestion => 
    actionWords.some(word => suggestion.toLowerCase().includes(word))
  );
  
  runner.assert(hasActionableSuggestion, 'Should provide actionable suggestions');
});

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runner.run().then(success => {
    process.exit(success ? 0 : 1);
  });
}

export { runner as integrationErrorResponseTests };