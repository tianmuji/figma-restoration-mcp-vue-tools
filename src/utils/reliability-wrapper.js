import { TimeoutManager } from './timeout-manager.js';
import { ErrorHandler } from './error-handler.js';
import { OperationLogger } from './operation-logger.js';
import { globalConfig } from './config-manager.js';
import { ValidationError } from './error-handler.js';
import { ErrorResponseSystem } from './error-response-system.js';
import crypto from 'crypto';

/**
 * ReliabilityWrapper - Base class for enhancing existing tools with reliability features
 * 
 * This wrapper provides:
 * - Timeout protection for all operations
 * - Comprehensive error handling and categorization
 * - Parameter validation and enhancement
 * - Performance monitoring and logging
 * - Backward compatibility with existing tool interfaces
 */
export class ReliabilityWrapper {
  constructor(originalTool, config = {}) {
    if (!originalTool) {
      throw new Error('Original tool is required for ReliabilityWrapper');
    }

    this.originalTool = originalTool;
    this.toolName = originalTool.constructor.name;
    
    // Merge configuration with defaults
    this.config = this.mergeConfig(config);
    
    // Initialize logger with tool-specific settings
    this.logger = new OperationLogger(this.toolName, {
      verbose: this.config.verbose,
      logLevel: this.config.logLevel,
      includePerformance: this.config.enableMetrics
    });

    // Preserve original tool properties for backward compatibility
    this.description = originalTool.description || `Enhanced ${this.toolName}`;
    this.inputSchema = { ...originalTool.inputSchema } || {};
    
    // Add reliability-specific schema properties
    this.enhanceInputSchema();
  }

  /**
   * Enhanced execute method with reliability features
   * @param {Object} args - Tool arguments
   * @returns {Promise<Object>} - Tool result with reliability enhancements
   */
  async execute(args) {
    const operationId = this.generateOperationId();
    const startTime = Date.now();
    
    try {
      // Pre-execution logging
      this.logger.logStart(operationId, 'execute', args);
      
      // Enhanced parameter validation
      const validatedArgs = await this.validateAndEnhanceArgs(args);
      
      // Get timeout configuration for this operation
      const timeoutConfig = this.getTimeoutConfig(validatedArgs);
      
      // Execute with timeout and error handling
      const result = await TimeoutManager.withTimeout(
        () => this.originalTool.execute(validatedArgs),
        {
          ...timeoutConfig,
          operationName: `${this.toolName}.execute`,
          cleanupFn: () => this.cleanup(operationId, validatedArgs)
        }
      );
      
      // Post-execution logging and metrics
      const duration = Date.now() - startTime;
      const metrics = this.collectMetrics(result, duration, validatedArgs);
      
      this.logger.logSuccess(operationId, result, metrics);
      
      // Return enhanced result
      return this.enhanceResult(result, {
        operationId,
        duration,
        metrics,
        toolName: this.toolName
      });
      
    } catch (error) {
      // Enhanced error handling with standardized response system
      const duration = Date.now() - startTime;
      
      this.logger.logError(operationId, error, {
        tool: this.toolName,
        operation: 'execute',
        duration,
        operationId
      });
      
      // Return standardized error response
      return ErrorResponseSystem.createErrorResponse(error, {
        tool: this.toolName,
        operation: 'execute',
        operationId,
        duration,
        args: args
      });
    }
  }

  /**
   * Validate and enhance input arguments
   * @param {Object} args - Original arguments
   * @returns {Object} - Validated and enhanced arguments
   */
  async validateAndEnhanceArgs(args) {
    if (!args || typeof args !== 'object') {
      throw new ValidationError('Arguments must be a valid object');
    }

    const validatedArgs = { ...args };
    
    // Basic schema validation if available
    if (this.originalTool.inputSchema) {
      this.validateAgainstSchema(validatedArgs, this.originalTool.inputSchema);
    }
    
    // Add reliability-specific enhancements
    validatedArgs._reliability = {
      wrapperVersion: '1.0.0',
      enhancedAt: new Date().toISOString(),
      toolName: this.toolName
    };
    
    // Path validation and normalization
    await this.validatePaths(validatedArgs);
    
    // Resource availability checks
    await this.checkResourceAvailability(validatedArgs);
    
    return validatedArgs;
  }

  /**
   * Get timeout configuration for the current operation
   * @param {Object} args - Operation arguments
   * @returns {Object} - Timeout configuration
   */
  getTimeoutConfig(args) {
    // Check for operation-specific timeout in args
    if (args.timeout && typeof args.timeout === 'number') {
      return {
        timeoutMs: args.timeout,
        retryCount: args.retryCount || 0,
        retryDelay: args.retryDelay || 1000
      };
    }
    
    // Get tool-specific timeout from global config
    const toolTimeouts = globalConfig.get('timeouts', this.toolName.toLowerCase().replace('tool', ''));
    const defaultTimeout = toolTimeouts?.default || globalConfig.get('global', 'timeout');
    
    // Determine operation type for specific timeout
    let operationType = 'default';
    if (args.inputPath || args.outputPath || args.projectPath) {
      operationType = 'fileOperations';
    }
    if (args.componentName && this.toolName.includes('Screenshot')) {
      operationType = 'screenshot';
    }
    if (this.toolName.includes('Compare')) {
      operationType = 'imageProcessing';
    }
    
    const specificTimeout = toolTimeouts?.[operationType] || defaultTimeout;
    
    return {
      timeoutMs: specificTimeout,
      retryCount: globalConfig.get('global', 'retryCount'),
      retryDelay: globalConfig.get('global', 'retryDelay')
    };
  }

  /**
   * Cleanup function called on timeout or failure
   * @param {string} operationId - Operation identifier
   * @param {Object} args - Operation arguments
   */
  async cleanup(operationId, args) {
    try {
      this.logger.logDebug(`Executing cleanup for operation ${operationId}`);
      
      // Tool-specific cleanup logic can be overridden
      await this.performCleanup(args);
      
      this.logger.logDebug(`Cleanup completed for operation ${operationId}`);
    } catch (cleanupError) {
      this.logger.logWarning(`Cleanup failed for operation ${operationId}`, {
        error: cleanupError.message
      });
    }
  }

  /**
   * Collect performance and operation metrics
   * @param {Object} result - Operation result
   * @param {number} duration - Operation duration in ms
   * @param {Object} args - Operation arguments
   * @returns {Object} - Collected metrics
   */
  collectMetrics(result, duration, args) {
    const metrics = {
      duration,
      timestamp: new Date().toISOString(),
      success: result.success !== false,
      toolName: this.toolName
    };
    
    // Add tool-specific metrics
    if (result.matchPercentage !== undefined) {
      metrics.matchPercentage = result.matchPercentage;
    }
    
    if (result.fileSize !== undefined) {
      metrics.fileSize = result.fileSize;
    }
    
    if (args.threshold !== undefined) {
      metrics.threshold = args.threshold;
    }
    
    return metrics;
  }

  /**
   * Enhance the result with reliability metadata
   * @param {Object} result - Original result
   * @param {Object} metadata - Reliability metadata
   * @returns {Object} - Enhanced result
   */
  enhanceResult(result, metadata) {
    // If the original result is already an error response, preserve it
    if (result && typeof result === 'object' && result.success === false) {
      return result;
    }
    
    // Use standardized success response format for successful results
    return ErrorResponseSystem.createSuccessResponse(result, metadata);
  }

  /**
   * Merge configuration with defaults
   * @param {Object} config - User configuration
   * @returns {Object} - Merged configuration
   */
  mergeConfig(config) {
    const defaults = {
      verbose: globalConfig.get('global', 'verbose'),
      logLevel: globalConfig.get('global', 'logLevel'),
      enableMetrics: globalConfig.get('global', 'enableMetrics'),
      validatePaths: true,
      checkResources: true
    };
    
    return { ...defaults, ...config };
  }

  /**
   * Enhance input schema with reliability options
   */
  enhanceInputSchema() {
    if (!this.inputSchema.properties) {
      this.inputSchema.properties = {};
    }
    
    // Add reliability-specific properties
    this.inputSchema.properties.timeout = {
      type: 'number',
      description: 'Operation timeout in milliseconds (optional)',
      minimum: 100
    };
    
    this.inputSchema.properties.retryCount = {
      type: 'number',
      description: 'Number of retry attempts (optional)',
      minimum: 0,
      maximum: 5
    };
    
    this.inputSchema.properties.retryDelay = {
      type: 'number',
      description: 'Delay between retries in milliseconds (optional)',
      minimum: 100
    };
    
    this.inputSchema.properties.verbose = {
      type: 'boolean',
      description: 'Enable verbose logging for this operation (optional)'
    };
  }

  /**
   * Validate arguments against schema
   * @param {Object} args - Arguments to validate
   * @param {Object} schema - JSON schema
   */
  validateAgainstSchema(args, schema) {
    if (!schema.properties) return;
    
    // Check required properties
    if (schema.required) {
      for (const requiredProp of schema.required) {
        if (args[requiredProp] === undefined || args[requiredProp] === null) {
          throw new ValidationError(`Required property '${requiredProp}' is missing`);
        }
      }
    }
    
    // Basic type validation
    for (const [propName, propSchema] of Object.entries(schema.properties)) {
      const value = args[propName];
      
      if (value !== undefined && propSchema.type) {
        if (!this.validateType(value, propSchema.type)) {
          throw new ValidationError(`Property '${propName}' must be of type ${propSchema.type}`);
        }
        
        // Additional validations
        if (propSchema.minimum !== undefined && typeof value === 'number' && value < propSchema.minimum) {
          throw new ValidationError(`Property '${propName}' must be >= ${propSchema.minimum}`);
        }
        
        if (propSchema.maximum !== undefined && typeof value === 'number' && value > propSchema.maximum) {
          throw new ValidationError(`Property '${propName}' must be <= ${propSchema.maximum}`);
        }
      }
    }
  }

  /**
   * Validate type of a value
   * @param {*} value - Value to validate
   * @param {string} expectedType - Expected type
   * @returns {boolean} - True if type is valid
   */
  validateType(value, expectedType) {
    switch (expectedType) {
      case 'string':
        return typeof value === 'string';
      case 'number':
        return typeof value === 'number' && !isNaN(value);
      case 'boolean':
        return typeof value === 'boolean';
      case 'object':
        return typeof value === 'object' && value !== null && !Array.isArray(value);
      case 'array':
        return Array.isArray(value);
      default:
        return true;
    }
  }

  /**
   * Validate and normalize file paths
   * @param {Object} args - Arguments containing paths
   */
  async validatePaths(args) {
    if (!this.config.validatePaths) return;
    
    const pathProperties = ['inputPath', 'outputPath', 'projectPath'];
    
    for (const pathProp of pathProperties) {
      if (args[pathProp]) {
        try {
          // Normalize path
          args[pathProp] = path.resolve(args[pathProp]);
          
          // Check if input paths exist (except outputPath which might be created)
          if (pathProp !== 'outputPath') {
            await fs.access(args[pathProp]);
          }
        } catch (error) {
          throw new ValidationError(`Invalid ${pathProp}: ${error.message}`);
        }
      }
    }
  }

  /**
   * Check resource availability (disk space, memory, etc.)
   * @param {Object} args - Operation arguments
   */
  async checkResourceAvailability(args) {
    if (!this.config.checkResources) return;
    
    // Basic resource checks can be implemented here
    // For now, we'll do a simple check
    try {
      // Check if we can write to temp directory
      const tempDir = process.env.TMPDIR || '/tmp';
      await fs.access(tempDir, fs.constants.W_OK);
    } catch (error) {
      throw new ValidationError('Insufficient system resources or permissions');
    }
  }

  /**
   * Tool-specific cleanup logic (to be overridden by subclasses)
   * @param {Object} args - Operation arguments
   */
  async performCleanup(args) {
    // Default implementation - can be overridden by specific tool wrappers
    this.logger.logDebug('Performing default cleanup');
  }

  /**
   * Generate unique operation ID
   * @returns {string} - Unique operation identifier
   */
  generateOperationId() {
    return `${this.toolName}_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  }

  /**
   * Get tool statistics
   * @returns {Object} - Tool usage statistics
   */
  getStatistics() {
    return this.logger.getStatistics();
  }

  /**
   * Update wrapper configuration
   * @param {Object} newConfig - New configuration options
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    this.logger.setOptions({
      verbose: this.config.verbose,
      logLevel: this.config.logLevel,
      includePerformance: this.config.enableMetrics
    });
  }
}

// Import fs and path modules
import fs from 'fs/promises';
import path from 'path';