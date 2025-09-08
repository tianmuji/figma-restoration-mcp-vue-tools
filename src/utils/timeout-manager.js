import chalk from 'chalk';

/**
 * TimeoutManager - Centralized timeout handling with configurable limits and retry logic
 */
export class TimeoutManager {
  /**
   * Execute an operation with timeout protection
   * @param {Promise|Function} operation - The operation to execute (Promise or function returning Promise)
   * @param {Object} config - Configuration options
   * @param {number} config.timeoutMs - Timeout in milliseconds (default: 30000)
   * @param {string} config.operationName - Name of the operation for logging
   * @param {Function} config.cleanupFn - Cleanup function to call on timeout
   * @param {number} config.retryCount - Number of retries (default: 0)
   * @param {number} config.retryDelay - Delay between retries in ms (default: 1000)
   * @returns {Promise} - The operation result or timeout error
   */
  static async withTimeout(operation, config = {}) {
    const {
      timeoutMs = 30000,
      operationName = 'Operation',
      cleanupFn = null,
      retryCount = 0,
      retryDelay = 1000
    } = config;

    // If operation is already a Promise, wrap it in a function for retry compatibility
    const operationFn = typeof operation === 'function' ? operation : () => operation;

    return this.executeWithRetry(operationFn, {
      timeoutMs,
      operationName,
      cleanupFn,
      retryCount,
      retryDelay
    });
  }

  /**
   * Execute operation with retry logic
   * @param {Function} operationFn - Function that returns a Promise
   * @param {Object} config - Configuration options
   * @returns {Promise} - The operation result
   */
  static async executeWithRetry(operationFn, config) {
    const { retryCount, retryDelay, operationName } = config;
    let lastError;

    for (let attempt = 0; attempt <= retryCount; attempt++) {
      try {
        if (attempt > 0) {
          console.log(chalk.yellow(`🔄 Retry attempt ${attempt}/${retryCount} for ${operationName}`));
          await this.delay(retryDelay);
        }

        // Execute the operation function to get a fresh Promise
        const operation = operationFn();
        return await this.executeWithTimeoutOnly(operation, config);
      } catch (error) {
        lastError = error;
        
        if (attempt === retryCount) {
          // Last attempt failed, throw the error
          throw error;
        }

        // Check if error is retryable
        if (!this.isRetryableError(error)) {
          throw error;
        }

        console.log(chalk.yellow(`⚠️  ${operationName} failed (attempt ${attempt + 1}): ${error.message}`));
      }
    }

    throw lastError;
  }

  /**
   * Execute operation with timeout only (no retry)
   * @param {Promise} operation - The operation to execute
   * @param {Object} config - Configuration options
   * @returns {Promise} - The operation result
   */
  static async executeWithTimeoutOnly(operation, config) {
    const { timeoutMs, operationName, cleanupFn } = config;
    const startTime = Date.now();

    return Promise.race([
      // The actual operation with proper error handling
      operation.then(
        result => {
          const duration = Date.now() - startTime;
          if (duration > timeoutMs * 0.8) {
            console.log(chalk.yellow(`⚠️  Slow operation: ${operationName} took ${duration}ms (limit: ${timeoutMs}ms)`));
          }
          return result;
        },
        error => {
          // Re-throw the error to be caught by the retry logic
          throw error;
        }
      ),
      
      // Timeout promise
      new Promise((_, reject) => {
        const timeoutId = setTimeout(async () => {
          console.log(chalk.red(`❌ TIMEOUT: ${operationName} exceeded ${timeoutMs}ms`));
          
          // Execute cleanup function if provided
          if (cleanupFn && typeof cleanupFn === 'function') {
            try {
              console.log(chalk.blue(`🧹 Executing cleanup for ${operationName}...`));
              await cleanupFn();
              console.log(chalk.green(`✅ Cleanup completed for ${operationName}`));
            } catch (cleanupError) {
              console.log(chalk.red(`❌ Cleanup failed for ${operationName}: ${cleanupError.message}`));
            }
          }
          
          reject(new TimeoutError(`${operationName} timed out after ${timeoutMs}ms`));
        }, timeoutMs);

        // Clear timeout if operation completes first (success or failure)
        operation.finally(() => {
          clearTimeout(timeoutId);
        }).catch(() => {
          // Ignore errors here, they'll be handled by the main promise
        });
      })
    ]);
  }

  /**
   * Check if an error is retryable
   * @param {Error} error - The error to check
   * @returns {boolean} - True if the error is retryable
   */
  static isRetryableError(error) {
    // Don't retry timeout errors or validation errors
    if (error instanceof TimeoutError || error instanceof ValidationError) {
      return false;
    }

    // Don't retry file not found errors
    if (error.code === 'ENOENT') {
      return false;
    }

    // Don't retry permission errors
    if (error.code === 'EACCES' || error.code === 'EPERM') {
      return false;
    }

    // Retry network errors, temporary file system errors, etc.
    const retryableCodes = ['ETIMEDOUT', 'ECONNRESET', 'ECONNREFUSED', 'ENOTFOUND', 'EMFILE', 'ENFILE'];
    return retryableCodes.includes(error.code) || error.message.includes('network') || error.message.includes('temporary');
  }

  /**
   * Delay execution for specified milliseconds
   * @param {number} ms - Milliseconds to delay
   * @returns {Promise} - Promise that resolves after delay
   */
  static delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Create a timeout configuration for specific operations
   * @param {string} operationType - Type of operation (file, network, processing)
   * @param {Object} customConfig - Custom configuration overrides
   * @returns {Object} - Timeout configuration
   */
  static createConfig(operationType, customConfig = {}) {
    const defaultConfigs = {
      file: {
        timeoutMs: 10000,
        retryCount: 2,
        retryDelay: 500
      },
      network: {
        timeoutMs: 30000,
        retryCount: 3,
        retryDelay: 1000
      },
      processing: {
        timeoutMs: 60000,
        retryCount: 1,
        retryDelay: 2000
      },
      default: {
        timeoutMs: 30000,
        retryCount: 0,
        retryDelay: 1000
      }
    };

    const baseConfig = defaultConfigs[operationType] || defaultConfigs.default;
    return { ...baseConfig, ...customConfig };
  }
}

/**
 * Custom timeout error class
 */
export class TimeoutError extends Error {
  constructor(message) {
    super(message);
    this.name = 'TimeoutError';
    this.code = 'TIMEOUT';
  }
}

/**
 * Custom validation error class
 */
export class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
    this.code = 'VALIDATION_ERROR';
  }
}