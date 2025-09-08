import { ErrorResponseSystem, ErrorResponseBuilder } from '../error-response-system.js';

/**
 * Simple test runner for ErrorResponseSystem
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
    console.log('🧪 Running ErrorResponseSystem Tests...\\n');

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

    console.log(`\\n📊 Test Results: ${this.passed} passed, ${this.failed} failed`);
    return this.failed === 0;
  }

  assert(condition, message) {
    if (!condition) {
      throw new Error(message || 'Assertion failed');
    }
  }

  assertDeepEqual(actual, expected, message) {
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
      throw new Error(message || `Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
    }
  }
}

// Test suite
const runner = new TestRunner();

runner.test('should have all required error codes', () => {
  const codes = ErrorResponseSystem.ERROR_CODES;
  
  runner.assert(codes.VALIDATION_ERROR === 'E1001', 'Should have validation error code');
  runner.assert(codes.FILE_NOT_FOUND === 'E1101', 'Should have file not found code');
  runner.assert(codes.NETWORK_TIMEOUT === 'E1201', 'Should have network timeout code');
  runner.assert(codes.OPERATION_TIMEOUT === 'E1301', 'Should have operation timeout code');
  runner.assert(codes.SHARP_ERROR === 'E1401', 'Should have Sharp error code');
  runner.assert(codes.FIGMA_COMPARE_ERROR === 'E1501', 'Should have Figma compare error code');
  runner.assert(codes.UNKNOWN_ERROR === 'E1699', 'Should have unknown error code');
});

runner.test('should have all severity levels', () => {
  const levels = ErrorResponseSystem.SEVERITY_LEVELS;
  
  runner.assert(levels.LOW === 'low', 'Should have low severity');
  runner.assert(levels.MEDIUM === 'medium', 'Should have medium severity');
  runner.assert(levels.HIGH === 'high', 'Should have high severity');
  runner.assert(levels.CRITICAL === 'critical', 'Should have critical severity');
});

runner.test('should create standardized error response', () => {
  const error = new Error('Test error message');
  error.code = 'ENOENT';
  
  const response = ErrorResponseSystem.createErrorResponse(error, {
    tool: 'TestTool',
    operation: 'testOperation',
    operationId: 'test-123'
  });
  
  runner.assert(response.success === false, 'Should mark as failed');
  runner.assert(response.error.message, 'Should have error message');
  runner.assert(response.error.code, 'Should have error code');
  runner.assert(response.error.category, 'Should have error category');
  runner.assert(response.error.severity, 'Should have severity level');
  runner.assert(Array.isArray(response.error.suggestions), 'Should have suggestions array');
  runner.assert(response.error.context.tool === 'TestTool', 'Should include tool context');
  runner.assert(response.error.context.operation === 'testOperation', 'Should include operation context');
  runner.assert(response.error.recovery, 'Should have recovery information');
  runner.assert(response._reliability, 'Should have reliability metadata');
  runner.assert(response._reliability.enhanced === true, 'Should mark as enhanced');
});

runner.test('should create validation error response', () => {
  const response = ErrorResponseSystem.createValidationError(
    'Required field is missing',
    'inputPath',
    { tool: 'TestTool' }
  );
  
  runner.assert(response.success === false, 'Should mark as failed');
  runner.assert(response.error.code === 'E1001', 'Should use validation error code');
  runner.assert(response.error.message === 'Required field is missing', 'Should preserve message');
  runner.assert(response.error.context.validationField === 'inputPath', 'Should include field context');
});

runner.test('should create timeout error response', () => {
  const response = ErrorResponseSystem.createTimeoutError(
    'imageProcessing',
    30000,
    { tool: 'TestTool' }
  );
  
  runner.assert(response.success === false, 'Should mark as failed');
  runner.assert(response.error.code === 'E1301', 'Should use timeout error code');
  runner.assert(response.error.message.includes('imageProcessing'), 'Should include operation name');
  runner.assert(response.error.message.includes('30000ms'), 'Should include timeout value');
  runner.assert(response.error.context.timeout === 30000, 'Should include timeout context');
});

runner.test('should create file system error response', () => {
  const fsError = new Error('File not found');
  fsError.code = 'ENOENT';
  fsError.path = '/test/path.svg';
  
  const response = ErrorResponseSystem.createFileSystemError(
    '/test/path.svg',
    'read',
    fsError,
    { tool: 'TestTool' }
  );
  
  runner.assert(response.success === false, 'Should mark as failed');
  runner.assert(response.error.code === 'E1101', 'Should use file not found error code');
  runner.assert(response.error.context.filePath === '/test/path.svg', 'Should include file path');
  runner.assert(response.error.context.fileOperation === 'read', 'Should include operation');
});

runner.test('should create library error response', () => {
  const libError = new Error('Sharp processing failed');
  
  const response = ErrorResponseSystem.createLibraryError(
    'sharp',
    libError,
    { tool: 'TestTool' }
  );
  
  runner.assert(response.success === false, 'Should mark as failed');
  runner.assert(response.error.code === 'E1401', 'Should use Sharp error code');
  runner.assert(response.error.context.library === 'sharp', 'Should include library name');
  runner.assert(response.error.context.libraryError === true, 'Should mark as library error');
});

runner.test('should map error codes correctly', () => {
  // File system errors
  const enoentError = new Error('File not found');
  enoentError.code = 'ENOENT';
  const enoentCode = ErrorResponseSystem.mapToStandardErrorCode(enoentError, { category: 'FileSystem' });
  runner.assert(enoentCode === 'E1101', 'Should map ENOENT to file not found');
  
  // Network errors
  const timeoutError = new Error('Network timeout');
  timeoutError.code = 'ETIMEDOUT';
  const timeoutCode = ErrorResponseSystem.mapToStandardErrorCode(timeoutError, { category: 'Network' });
  runner.assert(timeoutCode === 'E1201', 'Should map ETIMEDOUT to network timeout');
  
  // Memory errors
  const memoryError = new Error('Out of memory');
  memoryError.code = 'ENOMEM';
  const memoryCode = ErrorResponseSystem.mapToStandardErrorCode(memoryError, { category: 'Memory' });
  runner.assert(memoryCode === 'E1303', 'Should map ENOMEM to memory insufficient');
});

runner.test('should determine severity levels correctly', () => {
  // Critical severity
  const memoryError = new Error('Out of memory');
  memoryError.code = 'ENOMEM';
  const criticalSeverity = ErrorResponseSystem.determineSeverity(memoryError, { category: 'Memory' });
  runner.assert(criticalSeverity === 'critical', 'Memory errors should be critical');
  
  // High severity
  const fileError = new Error('File not found');
  fileError.code = 'ENOENT';
  const highSeverity = ErrorResponseSystem.determineSeverity(fileError, { category: 'FileSystem' });
  runner.assert(highSeverity === 'high', 'File system errors should be high');
  
  // Medium severity
  const timeoutError = new Error('Operation timeout');
  const mediumSeverity = ErrorResponseSystem.determineSeverity(timeoutError, { category: 'Timeout' });
  runner.assert(mediumSeverity === 'medium', 'Timeout errors should be medium');
  
  // Low severity
  const validationError = new Error('Invalid input');
  const lowSeverity = ErrorResponseSystem.determineSeverity(validationError, { category: 'Validation' });
  runner.assert(lowSeverity === 'low', 'Validation errors should be low');
});

runner.test('should determine retryability correctly', () => {
  // Retryable errors
  const timeoutError = new Error('Timeout');
  const timeoutRetryable = ErrorResponseSystem.isRetryable(timeoutError, { category: 'Timeout' });
  runner.assert(timeoutRetryable === true, 'Timeout errors should be retryable');
  
  const networkError = new Error('Network error');
  networkError.code = 'ETIMEDOUT';
  const networkRetryable = ErrorResponseSystem.isRetryable(networkError, { category: 'Network' });
  runner.assert(networkRetryable === true, 'Network errors should be retryable');
  
  // Non-retryable errors
  const validationError = new Error('Invalid input');
  const validationRetryable = ErrorResponseSystem.isRetryable(validationError, { category: 'Validation' });
  runner.assert(validationRetryable === false, 'Validation errors should not be retryable');
});

runner.test('should calculate retry delays correctly', () => {
  const timeoutDelay = ErrorResponseSystem.getRetryDelay(
    new Error('Timeout'),
    { category: 'Timeout' }
  );
  runner.assert(timeoutDelay === 5000, 'Timeout errors should have 5s delay');
  
  const networkDelay = ErrorResponseSystem.getRetryDelay(
    new Error('Network error'),
    { category: 'Network' }
  );
  runner.assert(networkDelay === 3000, 'Network errors should have 3s delay');
  
  const nonRetryableDelay = ErrorResponseSystem.getRetryDelay(
    new Error('Validation error'),
    { category: 'Validation' }
  );
  runner.assert(nonRetryableDelay === 0, 'Non-retryable errors should have 0 delay');
});

runner.test('should detect fallback availability', () => {
  const libraryFallback = ErrorResponseSystem.hasFallback(
    new Error('Library error'),
    { category: 'Library' }
  );
  runner.assert(libraryFallback === true, 'Library errors should have fallbacks');
  
  const formatFallback = ErrorResponseSystem.hasFallback(
    new Error('Format error'),
    { category: 'Format' }
  );
  runner.assert(formatFallback === true, 'Format errors should have fallbacks');
  
  const validationFallback = ErrorResponseSystem.hasFallback(
    new Error('Validation error'),
    { category: 'Validation' }
  );
  runner.assert(validationFallback === false, 'Validation errors should not have fallbacks');
});

runner.test('should validate error response format', () => {
  const validResponse = {
    success: false,
    error: {
      message: 'Test error',
      code: 'E1001',
      category: 'Validation',
      severity: 'low',
      suggestions: ['Try again'],
      context: { tool: 'TestTool' },
      technical: {},
      recovery: {}
    }
  };
  
  runner.assert(
    ErrorResponseSystem.validateErrorResponse(validResponse) === true,
    'Should validate correct error response'
  );
  
  const invalidResponse = {
    success: false,
    error: {
      message: 'Test error'
      // Missing required fields
    }
  };
  
  runner.assert(
    ErrorResponseSystem.validateErrorResponse(invalidResponse) === false,
    'Should reject invalid error response'
  );
});

runner.test('should create success response', () => {
  const result = { data: 'test result' };
  const context = {
    operationId: 'test-123',
    duration: 1500,
    metrics: { processed: 1 }
  };
  
  const response = ErrorResponseSystem.createSuccessResponse(result, context);
  
  runner.assert(response.success === true, 'Should mark as successful');
  runner.assert(response.result === result, 'Should include result');
  runner.assert(response._reliability.enhanced === true, 'Should mark as enhanced');
  runner.assert(response._reliability.operationId === 'test-123', 'Should include operation ID');
  runner.assert(response._reliability.duration === 1500, 'Should include duration');
  runner.assert(response._reliability.metrics === context.metrics, 'Should include metrics');
});

runner.test('should wrap responses correctly', () => {
  // Wrap success result
  const successResult = { data: 'success' };
  const wrappedSuccess = ErrorResponseSystem.wrapResponse(successResult, { operationId: 'test-1' });
  
  runner.assert(wrappedSuccess.success === true, 'Should wrap success result');
  runner.assert(wrappedSuccess.result === successResult, 'Should preserve result');
  runner.assert(wrappedSuccess._reliability.operationId === 'test-1', 'Should include context');
  
  // Wrap error response
  const errorResponse = {
    success: false,
    error: {
      message: 'Test error',
      code: 'E1001',
      category: 'Test',
      severity: 'low',
      suggestions: [],
      context: {},
      technical: {},
      recovery: {}
    }
  };
  const wrappedError = ErrorResponseSystem.wrapResponse(errorResponse);
  
  runner.assert(wrappedError.success === false, 'Should preserve error response');
  runner.assert(wrappedError.error.message === 'Test error', 'Should preserve error message');
});

// ErrorResponseBuilder tests

runner.test('should build error response with fluent API', () => {
  const response = new ErrorResponseBuilder()
    .message('Test error message')
    .tool('TestTool')
    .operation('testOperation')
    .operationId('test-123')
    .duration(1500)
    .context({ custom: 'data' })
    .build();
  
  runner.assert(response.success === false, 'Should create error response');
  runner.assert(response.error.message === 'Test error message', 'Should set message');
  runner.assert(response.error.context.tool === 'TestTool', 'Should set tool');
  runner.assert(response.error.context.operation === 'testOperation', 'Should set operation');
  runner.assert(response.error.context.operationId === 'test-123', 'Should set operation ID');
  runner.assert(response.error.context.duration === 1500, 'Should set duration');
  runner.assert(response.error.context.custom === 'data', 'Should include custom context');
});

runner.test('should build validation error with fluent API', () => {
  const response = new ErrorResponseBuilder()
    .message('Field is required')
    .tool('TestTool')
    .buildValidation('inputPath');
  
  runner.assert(response.success === false, 'Should create validation error');
  runner.assert(response.error.code === 'E1001', 'Should use validation error code');
  runner.assert(response.error.context.validationField === 'inputPath', 'Should include field');
});

runner.test('should build timeout error with fluent API', () => {
  const response = new ErrorResponseBuilder()
    .message('Operation timed out')
    .tool('TestTool')
    .operation('imageProcessing')
    .buildTimeout(30000);
  
  runner.assert(response.success === false, 'Should create timeout error');
  runner.assert(response.error.code === 'E1301', 'Should use timeout error code');
  runner.assert(response.error.context.timeout === 30000, 'Should include timeout');
});

runner.test('should map library-specific error codes', () => {
  const sharpError = new Error('Sharp processing failed');
  const sharpCode = ErrorResponseSystem.mapLibraryErrorCode(sharpError);
  runner.assert(sharpCode === 'E1401', 'Should map Sharp errors correctly');
  
  const svgoError = new Error('SVGO optimization failed');
  const svgoCode = ErrorResponseSystem.mapLibraryErrorCode(svgoError);
  runner.assert(svgoCode === 'E1402', 'Should map SVGO errors correctly');
  
  const puppeteerError = new Error('Puppeteer browser launch failed');
  const puppeteerCode = ErrorResponseSystem.mapLibraryErrorCode(puppeteerError);
  runner.assert(puppeteerCode === 'E1403', 'Should map Puppeteer errors correctly');
  
  const genericError = new Error('Generic library error');
  const genericCode = ErrorResponseSystem.mapLibraryErrorCode(genericError);
  runner.assert(genericCode === 'E1302', 'Should map generic library errors to processing failed');
});

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runner.run().then(success => {
    process.exit(success ? 0 : 1);
  });
}

export { runner as errorResponseSystemTests };