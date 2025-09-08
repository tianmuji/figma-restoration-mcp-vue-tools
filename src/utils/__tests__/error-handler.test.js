import { ErrorHandler, ValidationError, FormatError } from '../error-handler.js';
import { TimeoutError } from '../timeout-manager.js';

/**
 * Simple test runner for ErrorHandler
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
    console.log('🧪 Running ErrorHandler Tests...\n');

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
}

// Test suite
const runner = new TestRunner();

runner.test('should categorize timeout errors correctly', async () => {
  const error = new TimeoutError('Operation timed out after 5000ms');
  const errorInfo = ErrorHandler.categorizeError(error);
  
  runner.assert(errorInfo.category === 'Timeout', 'Should categorize as Timeout');
  runner.assert(errorInfo.userMessage.includes('timed out'), 'Should have timeout message');
  runner.assert(errorInfo.suggestions.length > 0, 'Should provide suggestions');
  runner.assert(errorInfo.suggestions.some(s => s.includes('timeout')), 'Should suggest timeout solutions');
});

runner.test('should categorize file system errors correctly', async () => {
  const error = new Error('File not found');
  error.code = 'ENOENT';
  error.path = '/path/to/file.jpg';
  
  const errorInfo = ErrorHandler.categorizeError(error);
  
  runner.assert(errorInfo.category === 'FileSystem', 'Should categorize as FileSystem');
  runner.assert(errorInfo.userMessage.includes('not found'), 'Should have file not found message');
  runner.assert(errorInfo.suggestions.some(s => s.includes('file path')), 'Should suggest checking file path');
});

runner.test('should categorize permission errors correctly', async () => {
  const error = new Error('Permission denied');
  error.code = 'EACCES';
  error.path = '/protected/file.jpg';
  
  const errorInfo = ErrorHandler.categorizeError(error);
  
  // EACCES with "permission" in message is categorized as Permission
  runner.assert(errorInfo.category === 'Permission', 'Should categorize as Permission for EACCES with permission message');
  runner.assert(errorInfo.userMessage.includes('Permission denied'), 'Should have permission message');
  runner.assert(errorInfo.suggestions.some(s => s.includes('permission')), 'Should suggest permission solutions');
});

runner.test('should categorize network errors correctly', async () => {
  const error = new Error('Connection timed out');
  error.code = 'ETIMEDOUT';
  
  const errorInfo = ErrorHandler.categorizeError(error);
  
  runner.assert(errorInfo.category === 'Network', 'Should categorize as Network');
  runner.assert(errorInfo.userMessage.includes('timed out'), 'Should have timeout message');
  runner.assert(errorInfo.suggestions.some(s => s.includes('network')), 'Should suggest network solutions');
});

runner.test('should categorize format errors correctly', async () => {
  const error = new FormatError('Unsupported image format: .bmp');
  
  const errorInfo = ErrorHandler.categorizeError(error);
  
  runner.assert(errorInfo.category === 'Format', 'Should categorize as Format');
  runner.assert(errorInfo.userMessage.includes('Unsupported'), 'Should have format message');
  runner.assert(errorInfo.suggestions.some(s => s.includes('supported formats')), 'Should suggest supported formats');
});

runner.test('should categorize library errors correctly', async () => {
  const error = new Error('sharp: Input file is missing');
  
  const errorInfo = ErrorHandler.categorizeError(error);
  
  runner.assert(errorInfo.category === 'Library', 'Should categorize as Library');
  runner.assert(errorInfo.userMessage.includes('processing error'), 'Should have processing message');
  runner.assert(errorInfo.suggestions.some(s => s.includes('Sharp')), 'Should suggest Sharp solutions');
});

runner.test('should categorize memory errors correctly', async () => {
  const error = new Error('JavaScript heap out of memory');
  
  const errorInfo = ErrorHandler.categorizeError(error);
  
  runner.assert(errorInfo.category === 'Memory', 'Should categorize as Memory');
  runner.assert(errorInfo.userMessage.includes('Memory error'), 'Should have memory message');
  runner.assert(errorInfo.suggestions.some(s => s.includes('memory')), 'Should suggest memory solutions');
});

runner.test('should format error response correctly', async () => {
  const error = new ValidationError('Invalid input parameter');
  const errorInfo = ErrorHandler.categorizeError(error);
  const response = ErrorHandler.formatErrorResponse(errorInfo, 'optimize_image', 'execute');
  
  runner.assert(response.success === false, 'Should indicate failure');
  runner.assert(response.error.message === errorInfo.userMessage, 'Should include user message');
  runner.assert(response.error.category === errorInfo.category, 'Should include category');
  runner.assert(response.error.context.tool === 'optimize_image', 'Should include tool name');
  runner.assert(response.error.context.operation === 'execute', 'Should include operation');
});

runner.test('should handle unknown errors gracefully', async () => {
  const error = new Error('Some unknown error');
  const errorInfo = ErrorHandler.categorizeError(error);
  
  runner.assert(errorInfo.category === 'General', 'Should categorize as General');
  runner.assert(errorInfo.userMessage === 'Some unknown error', 'Should use original message');
  runner.assert(errorInfo.suggestions.length > 0, 'Should provide general suggestions');
});

runner.test('should include context information', async () => {
  const error = new Error('Test error');
  const context = { operation: 'test', file: 'test.jpg' };
  const errorInfo = ErrorHandler.categorizeError(error, context);
  
  runner.assert(errorInfo.context.operation === 'test', 'Should include operation context');
  runner.assert(errorInfo.context.file === 'test.jpg', 'Should include file context');
  runner.assert(errorInfo.context.timestamp, 'Should include timestamp');
});

runner.test('should detect error types correctly', async () => {
  const fsError = new Error('File not found');
  fsError.code = 'ENOENT';
  runner.assert(ErrorHandler.isFileSystemError(fsError), 'Should detect file system error');
  
  const networkError = new Error('Connection failed');
  networkError.code = 'ETIMEDOUT';
  runner.assert(ErrorHandler.isNetworkError(networkError), 'Should detect network error');
  
  const formatError = new Error('Unsupported format');
  runner.assert(ErrorHandler.isFormatError(formatError), 'Should detect format error');
  
  const libraryError = new Error('sharp processing failed');
  runner.assert(ErrorHandler.isLibraryError(libraryError), 'Should detect library error');
  
  const memoryError = new Error('heap out of memory');
  runner.assert(ErrorHandler.isMemoryError(memoryError), 'Should detect memory error');
});

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runner.run().then(success => {
    process.exit(success ? 0 : 1);
  });
}

export { runner as errorHandlerTests };