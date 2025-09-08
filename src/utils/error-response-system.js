import { ErrorHandler } from './error-handler.js';

/**
 * Standardized Error Response System
 * Provides consistent error response format across all enhanced MCP tools
 */
export class ErrorResponseSystem {
  /**
   * Error codes for programmatic error handling
   */
  static ERROR_CODES = {
    // Validation errors (1000-1099)
    VALIDATION_ERROR: 'E1001',
    MISSING_REQUIRED_PARAM: 'E1002',
    INVALID_PARAM_TYPE: 'E1003',
    INVALID_PARAM_VALUE: 'E1004',
    INVALID_FILE_PATH: 'E1005',
    INVALID_FILE_FORMAT: 'E1006',
    
    // File system errors (1100-1199)
    FILE_NOT_FOUND: 'E1101',
    FILE_ACCESS_DENIED: 'E1102',
    DIRECTORY_NOT_FOUND: 'E1103',
    INSUFFICIENT_DISK_SPACE: 'E1104',
    FILE_LOCKED: 'E1105',
    FILE_CORRUPTED: 'E1106',
    
    // Network errors (1200-1299)
    NETWORK_TIMEOUT: 'E1201',
    CONNECTION_REFUSED: 'E1202',
    HOST_NOT_FOUND: 'E1203',
    NETWORK_UNAVAILABLE: 'E1204',
    
    // Processing errors (1300-1399)
    OPERATION_TIMEOUT: 'E1301',
    PROCESSING_FAILED: 'E1302',
    MEMORY_INSUFFICIENT: 'E1303',
    RESOURCE_UNAVAILABLE: 'E1304',
    
    // Library-specific errors (1400-1499)
    SHARP_ERROR: 'E1401',
    SVGO_ERROR: 'E1402',
    PUPPETEER_ERROR: 'E1403',
    BROWSER_ERROR: 'E1404',
    
    // Tool-specific errors (1500-1599)
    FIGMA_COMPARE_ERROR: 'E1501',
    SNAPDOM_SCREENSHOT_ERROR: 'E1502',
    OPTIMIZE_SVG_ERROR: 'E1503',
    
    // System errors (1600-1699)
    SYSTEM_ERROR: 'E1601',
    CONFIGURATION_ERROR: 'E1602',
    DEPENDENCY_ERROR: 'E1603',
    UNKNOWN_ERROR: 'E1699'
  };

  /**
   * Error severity levels
   */
  static SEVERITY_LEVELS = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    CRITICAL: 'critical'
  };

  /**
   * Create a standardized error response
   * @param {Error} error - The original error
   * @param {Object} context - Additional context information
   * @returns {Object} - Standardized error response
   */
  static createErrorResponse(error, context = {}) {
    const errorInfo = ErrorHandler.categorizeError(error, context);
    const errorCode = this.mapToStandardErrorCode(error, errorInfo);
    const severity = this.determineSeverity(error, errorInfo);
    
    return {
      success: false,
      error: {
        // User-facing information
        message: errorInfo.userMessage,
        code: errorCode,
        category: errorInfo.category,
        severity: severity,
        
        // Actionable suggestions
        suggestions: errorInfo.suggestions,
        
        // Technical information for debugging
        technical: {
          originalMessage: error.message,
          stack: error.stack,
          name: error.name,
          details: errorInfo.technicalDetails
        },
        
        // Context and metadata
        context: {
          timestamp: new Date().toISOString(),
          tool: context.tool || 'Unknown',
          operation: context.operation || 'Unknown',
          operationId: context.operationId,
          duration: context.duration,
          ...context
        },
        
        // Recovery information
        recovery: {
          retryable: this.isRetryable(error, errorInfo),
          retryAfter: this.getRetryDelay(error, errorInfo),
          fallbackAvailable: this.hasFallback(error, errorInfo)
        }
      },
      
      // Reliability metadata
      _reliability: {
        enhanced: true,
        errorHandled: true,
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      }
    };
  }

  /**
   * Create a validation error response
   * @param {string} message - Error message
   * @param {string} field - Field that failed validation
   * @param {Object} context - Additional context
   * @returns {Object} - Standardized validation error response
   */
  static createValidationError(message, field = null, context = {}) {
    const error = new Error(message);
    error.name = 'ValidationError';
    error.code = 'VALIDATION_ERROR';
    error.field = field;
    
    return this.createErrorResponse(error, {
      ...context,
      validationField: field
    });
  }

  /**
   * Create a timeout error response
   * @param {string} operation - Operation that timed out
   * @param {number} timeout - Timeout value in milliseconds
   * @param {Object} context - Additional context
   * @returns {Object} - Standardized timeout error response
   */
  static createTimeoutError(operation, timeout, context = {}) {
    const error = new Error(`Operation '${operation}' timed out after ${timeout}ms`);
    error.name = 'TimeoutError';
    error.code = 'TIMEOUT';
    
    return this.createErrorResponse(error, {
      ...context,
      operation,
      timeout,
      timeoutType: 'operation'
    });
  }

  /**
   * Create a file system error response
   * @param {string} path - File path that caused the error
   * @param {string} operation - File operation that failed
   * @param {Error} originalError - Original file system error
   * @param {Object} context - Additional context
   * @returns {Object} - Standardized file system error response
   */
  static createFileSystemError(path, operation, originalError, context = {}) {
    return this.createErrorResponse(originalError, {
      ...context,
      filePath: path,
      fileOperation: operation
    });
  }

  /**
   * Create a library error response
   * @param {string} library - Library name that failed
   * @param {Error} originalError - Original library error
   * @param {Object} context - Additional context
   * @returns {Object} - Standardized library error response
   */
  static createLibraryError(library, originalError, context = {}) {
    return this.createErrorResponse(originalError, {
      ...context,
      library,
      libraryError: true
    });
  }

  /**
   * Map error to standard error code
   * @param {Error} error - Original error
   * @param {Object} errorInfo - Categorized error information
   * @returns {string} - Standard error code
   */
  static mapToStandardErrorCode(error, errorInfo) {
    // Check for specific error codes first
    if (error.code) {
      switch (error.code) {
        case 'ENOENT': return this.ERROR_CODES.FILE_NOT_FOUND;
        case 'EACCES':
        case 'EPERM': return this.ERROR_CODES.FILE_ACCESS_DENIED;
        case 'ENOSPC': return this.ERROR_CODES.INSUFFICIENT_DISK_SPACE;
        case 'ETIMEDOUT': return this.ERROR_CODES.NETWORK_TIMEOUT;
        case 'ECONNREFUSED': return this.ERROR_CODES.CONNECTION_REFUSED;
        case 'ENOTFOUND': return this.ERROR_CODES.HOST_NOT_FOUND;
        case 'ENOMEM': return this.ERROR_CODES.MEMORY_INSUFFICIENT;
        case 'TIMEOUT': return this.ERROR_CODES.OPERATION_TIMEOUT;
        case 'VALIDATION_ERROR': return this.ERROR_CODES.VALIDATION_ERROR;
      }
    }

    // Check by error category
    switch (errorInfo.category) {
      case 'Timeout': return this.ERROR_CODES.OPERATION_TIMEOUT;
      case 'FileSystem': return this.ERROR_CODES.FILE_NOT_FOUND;
      case 'Network': return this.ERROR_CODES.NETWORK_TIMEOUT;
      case 'Permission': return this.ERROR_CODES.FILE_ACCESS_DENIED;
      case 'Format': return this.ERROR_CODES.INVALID_FILE_FORMAT;
      case 'Library': return this.mapLibraryErrorCode(error);
      case 'Memory': return this.ERROR_CODES.MEMORY_INSUFFICIENT;
      default: return this.ERROR_CODES.UNKNOWN_ERROR;
    }
  }

  /**
   * Map library-specific errors to error codes
   * @param {Error} error - Original error
   * @returns {string} - Library-specific error code
   */
  static mapLibraryErrorCode(error) {
    const message = error.message.toLowerCase();
    
    if (message.includes('sharp')) {
      return this.ERROR_CODES.SHARP_ERROR;
    } else if (message.includes('svgo')) {
      return this.ERROR_CODES.SVGO_ERROR;
    } else if (message.includes('puppeteer') || message.includes('browser')) {
      return this.ERROR_CODES.PUPPETEER_ERROR;
    } else {
      return this.ERROR_CODES.PROCESSING_FAILED;
    }
  }

  /**
   * Determine error severity level
   * @param {Error} error - Original error
   * @param {Object} errorInfo - Categorized error information
   * @returns {string} - Severity level
   */
  static determineSeverity(error, errorInfo) {
    // Critical errors that prevent any operation
    if (error.code === 'ENOMEM' || errorInfo.category === 'Memory') {
      return this.SEVERITY_LEVELS.CRITICAL;
    }

    // High severity errors that affect core functionality
    if (errorInfo.category === 'FileSystem' && ['ENOENT', 'EACCES'].includes(error.code)) {
      return this.SEVERITY_LEVELS.HIGH;
    }

    if (errorInfo.category === 'Library' || errorInfo.category === 'Format') {
      return this.SEVERITY_LEVELS.HIGH;
    }

    // Medium severity errors that can often be retried
    if (errorInfo.category === 'Timeout' || errorInfo.category === 'Network') {
      return this.SEVERITY_LEVELS.MEDIUM;
    }

    // Low severity errors (validation, configuration)
    return this.SEVERITY_LEVELS.LOW;
  }

  /**
   * Determine if an error is retryable
   * @param {Error} error - Original error
   * @param {Object} errorInfo - Categorized error information
   * @returns {boolean} - Whether the operation can be retried
   */
  static isRetryable(error, errorInfo) {
    // Retryable error categories
    const retryableCategories = ['Timeout', 'Network', 'Memory'];
    
    if (retryableCategories.includes(errorInfo.category)) {
      return true;
    }

    // Specific retryable error codes
    const retryableCodes = ['ETIMEDOUT', 'ECONNREFUSED', 'ECONNRESET', 'EHOSTUNREACH'];
    
    return retryableCodes.includes(error.code);
  }

  /**
   * Get recommended retry delay
   * @param {Error} error - Original error
   * @param {Object} errorInfo - Categorized error information
   * @returns {number} - Retry delay in milliseconds
   */
  static getRetryDelay(error, errorInfo) {
    if (!this.isRetryable(error, errorInfo)) {
      return 0;
    }

    switch (errorInfo.category) {
      case 'Timeout': return 5000; // 5 seconds
      case 'Network': return 3000; // 3 seconds
      case 'Memory': return 10000; // 10 seconds
      default: return 1000; // 1 second
    }
  }

  /**
   * Check if fallback options are available
   * @param {Error} error - Original error
   * @param {Object} errorInfo - Categorized error information
   * @returns {boolean} - Whether fallback options exist
   */
  static hasFallback(error, errorInfo) {
    // Library errors often have fallback options
    if (errorInfo.category === 'Library') {
      return true;
    }

    // Format errors might have conversion options
    if (errorInfo.category === 'Format') {
      return true;
    }

    // Timeout errors can often use different approaches
    if (errorInfo.category === 'Timeout') {
      return true;
    }

    return false;
  }

  /**
   * Validate error response format
   * @param {Object} errorResponse - Error response to validate
   * @returns {boolean} - Whether the response is valid
   */
  static validateErrorResponse(errorResponse) {
    if (!errorResponse || typeof errorResponse !== 'object') {
      return false;
    }

    // Check required top-level properties
    if (errorResponse.success !== false || !errorResponse.error) {
      return false;
    }

    const { error } = errorResponse;

    // Check required error properties
    const requiredProps = ['message', 'code', 'category', 'severity', 'suggestions', 'context'];
    
    for (const prop of requiredProps) {
      if (!(prop in error)) {
        return false;
      }
    }

    // Validate error code format
    if (!/^E\d{4}$/.test(error.code)) {
      return false;
    }

    // Validate severity level
    if (!Object.values(this.SEVERITY_LEVELS).includes(error.severity)) {
      return false;
    }

    // Validate suggestions array
    if (!Array.isArray(error.suggestions)) {
      return false;
    }

    return true;
  }

  /**
   * Create a success response with reliability metadata
   * @param {*} result - Operation result
   * @param {Object} context - Additional context
   * @returns {Object} - Standardized success response
   */
  static createSuccessResponse(result, context = {}) {
    return {
      success: true,
      result: result,
      _reliability: {
        enhanced: true,
        timestamp: new Date().toISOString(),
        operationId: context.operationId,
        duration: context.duration,
        metrics: context.metrics,
        version: '1.0.0'
      }
    };
  }

  /**
   * Wrap any response to ensure it has reliability metadata
   * @param {*} response - Original response
   * @param {Object} context - Additional context
   * @returns {Object} - Response with reliability metadata
   */
  static wrapResponse(response, context = {}) {
    if (response && typeof response === 'object' && response.success === false) {
      // Already an error response, ensure it's properly formatted
      return this.validateErrorResponse(response) ? response : this.createErrorResponse(
        new Error(response.error?.message || 'Unknown error'),
        context
      );
    }

    // Success response or raw result
    return this.createSuccessResponse(response, context);
  }
}

/**
 * Error response builder for fluent API
 */
export class ErrorResponseBuilder {
  constructor() {
    this.errorData = {
      message: '',
      context: {}
    };
  }

  /**
   * Set error message
   * @param {string} message - Error message
   * @returns {ErrorResponseBuilder} - Builder instance
   */
  message(message) {
    this.errorData.message = message;
    return this;
  }

  /**
   * Set tool context
   * @param {string} tool - Tool name
   * @returns {ErrorResponseBuilder} - Builder instance
   */
  tool(tool) {
    this.errorData.context.tool = tool;
    return this;
  }

  /**
   * Set operation context
   * @param {string} operation - Operation name
   * @returns {ErrorResponseBuilder} - Builder instance
   */
  operation(operation) {
    this.errorData.context.operation = operation;
    return this;
  }

  /**
   * Set operation ID
   * @param {string} operationId - Operation ID
   * @returns {ErrorResponseBuilder} - Builder instance
   */
  operationId(operationId) {
    this.errorData.context.operationId = operationId;
    return this;
  }

  /**
   * Set duration
   * @param {number} duration - Operation duration in milliseconds
   * @returns {ErrorResponseBuilder} - Builder instance
   */
  duration(duration) {
    this.errorData.context.duration = duration;
    return this;
  }

  /**
   * Add custom context
   * @param {Object} context - Additional context
   * @returns {ErrorResponseBuilder} - Builder instance
   */
  context(context) {
    Object.assign(this.errorData.context, context);
    return this;
  }

  /**
   * Build the error response
   * @returns {Object} - Standardized error response
   */
  build() {
    const error = new Error(this.errorData.message);
    return ErrorResponseSystem.createErrorResponse(error, this.errorData.context);
  }

  /**
   * Build a validation error response
   * @param {string} field - Field that failed validation
   * @returns {Object} - Standardized validation error response
   */
  buildValidation(field = null) {
    return ErrorResponseSystem.createValidationError(
      this.errorData.message,
      field,
      this.errorData.context
    );
  }

  /**
   * Build a timeout error response
   * @param {number} timeout - Timeout value in milliseconds
   * @returns {Object} - Standardized timeout error response
   */
  buildTimeout(timeout) {
    return ErrorResponseSystem.createTimeoutError(
      this.errorData.context.operation || 'Unknown',
      timeout,
      this.errorData.context
    );
  }
}