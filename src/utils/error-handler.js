import chalk from 'chalk';

/**
 * ErrorHandler - Comprehensive error categorization and user-friendly messaging
 */
export class ErrorHandler {
  /**
   * Categorize an error and provide user-friendly information
   * @param {Error} error - The error to categorize
   * @param {Object} context - Additional context information
   * @returns {Object} - Categorized error information
   */
  static categorizeError(error, context = {}) {
    const errorInfo = {
      category: 'Unknown',
      userMessage: error.message || 'An unknown error occurred',
      technicalDetails: error.stack || error.message,
      suggestions: [],
      errorCode: error.code || 'UNKNOWN_ERROR',
      context: {
        timestamp: new Date().toISOString(),
        ...context
      }
    };

    // Categorize based on error type and properties (order matters)
    if (error.name === 'TimeoutError' || error.code === 'TIMEOUT') {
      return this.categorizeTimeoutError(error, errorInfo);
    } else if (this.isMemoryError(error)) {
      return this.categorizeMemoryError(error, errorInfo);
    } else if (this.isLibraryError(error)) {
      return this.categorizeLibraryError(error, errorInfo);
    } else if (this.isFormatError(error)) {
      return this.categorizeFormatError(error, errorInfo);
    } else if (this.isNetworkError(error)) {
      return this.categorizeNetworkError(error, errorInfo);
    } else if (this.isPermissionError(error)) {
      return this.categorizePermissionError(error, errorInfo);
    } else if (this.isFileSystemError(error)) {
      return this.categorizeFileSystemError(error, errorInfo);
    }

    // Default categorization
    errorInfo.category = 'General';
    errorInfo.suggestions = [
      'Check the input parameters and try again',
      'Ensure all required dependencies are installed',
      'Contact support if the problem persists'
    ];

    return errorInfo;
  }

  /**
   * Format an error response for MCP tools
   * @param {Object} errorInfo - Categorized error information
   * @param {string} toolName - Name of the tool that failed
   * @param {string} operation - Operation that was being performed
   * @returns {Object} - Formatted error response
   */
  static formatErrorResponse(errorInfo, toolName, operation) {
    return {
      success: false,
      error: {
        message: errorInfo.userMessage,
        category: errorInfo.category,
        code: errorInfo.errorCode,
        suggestions: errorInfo.suggestions,
        technicalDetails: errorInfo.technicalDetails,
        context: {
          tool: toolName,
          operation: operation,
          ...errorInfo.context
        }
      }
    };
  }

  /**
   * Log an error with appropriate formatting
   * @param {Object} errorInfo - Categorized error information
   * @param {string} toolName - Name of the tool that failed
   */
  static logError(errorInfo, toolName = 'Unknown Tool') {
    console.error(chalk.red(`❌ ${toolName} Error [${errorInfo.category}]:`), errorInfo.userMessage);
    
    if (errorInfo.suggestions.length > 0) {
      console.log(chalk.yellow('💡 Suggestions:'));
      errorInfo.suggestions.forEach(suggestion => {
        console.log(chalk.yellow(`   • ${suggestion}`));
      });
    }

    if (process.env.NODE_ENV === 'development' && errorInfo.technicalDetails) {
      console.log(chalk.gray('🔍 Technical Details:'));
      console.log(chalk.gray(errorInfo.technicalDetails));
    }
  }

  // Error categorization methods

  static categorizeTimeoutError(error, errorInfo) {
    errorInfo.category = 'Timeout';
    errorInfo.userMessage = `Operation timed out: ${error.message}`;
    errorInfo.suggestions = [
      'Increase the timeout value in configuration',
      'Check system performance and available resources',
      'Try processing smaller files or reducing complexity',
      'Ensure stable network connection if applicable'
    ];
    return errorInfo;
  }

  static categorizeFileSystemError(error, errorInfo) {
    errorInfo.category = 'FileSystem';
    
    switch (error.code) {
      case 'ENOENT':
        errorInfo.userMessage = `File or directory not found: ${error.path || 'unknown path'}`;
        errorInfo.suggestions = [
          'Verify the file path is correct',
          'Check if the file exists',
          'Ensure proper file permissions'
        ];
        break;
      case 'EACCES':
      case 'EPERM':
        errorInfo.userMessage = `Permission denied: ${error.path || 'unknown path'}`;
        errorInfo.suggestions = [
          'Check file and directory permissions',
          'Run with appropriate user privileges',
          'Ensure the file is not locked by another process'
        ];
        break;
      case 'ENOSPC':
        errorInfo.userMessage = 'Insufficient disk space';
        errorInfo.suggestions = [
          'Free up disk space',
          'Clean temporary files',
          'Move files to a different location with more space'
        ];
        break;
      case 'EMFILE':
      case 'ENFILE':
        errorInfo.userMessage = 'Too many open files';
        errorInfo.suggestions = [
          'Close unused file handles',
          'Increase system file descriptor limits',
          'Process files in smaller batches'
        ];
        break;
      default:
        errorInfo.userMessage = `File system error: ${error.message}`;
        errorInfo.suggestions = [
          'Check file and directory permissions',
          'Verify the file path is accessible',
          'Ensure sufficient disk space'
        ];
    }
    
    return errorInfo;
  }

  static categorizeNetworkError(error, errorInfo) {
    errorInfo.category = 'Network';
    
    switch (error.code) {
      case 'ETIMEDOUT':
        errorInfo.userMessage = 'Network request timed out';
        errorInfo.suggestions = [
          'Check network connectivity',
          'Increase network timeout settings',
          'Try again later'
        ];
        break;
      case 'ECONNREFUSED':
        errorInfo.userMessage = 'Connection refused by server';
        errorInfo.suggestions = [
          'Verify the server is running',
          'Check the port number',
          'Ensure firewall allows the connection'
        ];
        break;
      case 'ENOTFOUND':
        errorInfo.userMessage = 'Host not found';
        errorInfo.suggestions = [
          'Check DNS settings',
          'Verify the URL spelling',
          'Try using an IP address instead'
        ];
        break;
      default:
        errorInfo.userMessage = `Network error: ${error.message}`;
        errorInfo.suggestions = [
          'Check network connectivity',
          'Verify server availability',
          'Try again later'
        ];
    }
    
    return errorInfo;
  }

  static categorizePermissionError(error, errorInfo) {
    errorInfo.category = 'Permission';
    errorInfo.userMessage = `Permission denied: ${error.message}`;
    errorInfo.suggestions = [
      'Check file and directory permissions',
      'Run with administrator/root privileges if necessary',
      'Ensure the user has write access to the target directory'
    ];
    return errorInfo;
  }

  static categorizeFormatError(error, errorInfo) {
    errorInfo.category = 'Format';
    
    if (error.message.includes('Unsupported image format')) {
      errorInfo.userMessage = error.message;
      errorInfo.suggestions = [
        'Use supported formats: PNG, JPEG, SVG, WebP',
        'Convert the image to a supported format',
        'Check the file extension matches the actual format'
      ];
    } else if (error.message.includes('corrupted') || error.message.includes('invalid')) {
      errorInfo.userMessage = `Invalid or corrupted file: ${error.message}`;
      errorInfo.suggestions = [
        'Verify the file is not corrupted',
        'Try re-downloading or re-creating the file',
        'Use a different image editing tool to save the file'
      ];
    } else {
      errorInfo.userMessage = `Format validation error: ${error.message}`;
      errorInfo.suggestions = [
        'Check the file format and extension',
        'Ensure the file is a valid image',
        'Try opening the file in an image viewer to verify'
      ];
    }
    
    return errorInfo;
  }

  static categorizeLibraryError(error, errorInfo) {
    errorInfo.category = 'Library';
    
    if (error.message.includes('sharp')) {
      errorInfo.userMessage = `Image processing error: ${error.message}`;
      errorInfo.suggestions = [
        'Ensure Sharp library is properly installed',
        'Check image format compatibility',
        'Try with a different image file'
      ];
    } else if (error.message.includes('svgo') || error.message.includes('SVGO')) {
      errorInfo.userMessage = `SVG optimization error: ${error.message}`;
      errorInfo.suggestions = [
        'Verify the SVG file is valid',
        'Check SVGO configuration settings',
        'Try with a simpler SVG file'
      ];
    } else {
      errorInfo.userMessage = `Library error: ${error.message}`;
      errorInfo.suggestions = [
        'Check library installation and version',
        'Verify input parameters are correct',
        'Try updating the library to the latest version'
      ];
    }
    
    return errorInfo;
  }

  static categorizeMemoryError(error, errorInfo) {
    errorInfo.category = 'Memory';
    errorInfo.userMessage = `Memory error: ${error.message}`;
    errorInfo.suggestions = [
      'Close other applications to free memory',
      'Process smaller files or reduce image resolution',
      'Increase system memory if possible',
      'Process files in batches rather than all at once'
    ];
    return errorInfo;
  }

  // Error detection methods

  static isFileSystemError(error) {
    const fsCodes = ['ENOENT', 'EACCES', 'EPERM', 'ENOSPC', 'EMFILE', 'ENFILE', 'EISDIR', 'ENOTDIR'];
    return fsCodes.includes(error.code) || error.message.includes('file') || error.message.includes('directory');
  }

  static isNetworkError(error) {
    const networkCodes = ['ETIMEDOUT', 'ECONNREFUSED', 'ENOTFOUND', 'ECONNRESET', 'EHOSTUNREACH'];
    return networkCodes.includes(error.code) || error.message.includes('network') || error.message.includes('connection');
  }

  static isPermissionError(error) {
    return error.code === 'EACCES' || error.code === 'EPERM' || error.message.includes('permission');
  }

  static isFormatError(error) {
    return error.message.includes('format') || 
           error.message.includes('Unsupported') || 
           error.message.includes('corrupted') || 
           error.message.includes('invalid');
  }

  static isLibraryError(error) {
    const message = error.message.toLowerCase();
    return message.includes('sharp') || 
           message.includes('svgo') || 
           error.message.includes('SVGO') ||
           error.stack?.includes('node_modules') ||
           message.includes('library');
  }

  static isMemoryError(error) {
    return error.message.includes('memory') || 
           error.message.includes('heap') || 
           error.code === 'ENOMEM';
  }
}

/**
 * Custom validation error class
 */
export class ValidationError extends Error {
  constructor(message, field = null) {
    super(message);
    this.name = 'ValidationError';
    this.code = 'VALIDATION_ERROR';
    this.field = field;
  }
}

/**
 * Custom format error class
 */
export class FormatError extends Error {
  constructor(message, format = null) {
    super(message);
    this.name = 'FormatError';
    this.code = 'FORMAT_ERROR';
    this.format = format;
  }
}