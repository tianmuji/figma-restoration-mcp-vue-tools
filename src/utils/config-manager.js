import fs from 'fs/promises';
import { ValidationError } from './error-handler.js';

/**
 * ConfigManager - Unified reliability configuration management for MCP tools
 */
export class ConfigManager {
  constructor() {
    this.config = new Map();
    this.validators = new Map();
    this.defaults = new Map();
    this.listeners = new Map();
    
    // Initialize default configurations
    this.initializeDefaults();
  }

  /**
   * Initialize default configurations for all tools
   */
  initializeDefaults() {
    // Global reliability settings
    this.setDefaults('global', {
      timeout: 30000,              // Default timeout in milliseconds
      retryCount: 0,               // Default retry count
      retryDelay: 1000,            // Default retry delay in milliseconds
      logLevel: 'info',            // Default log level
      verbose: false,              // Verbose logging
      enableMetrics: true,         // Enable performance metrics
      cleanupOnExit: true          // Cleanup resources on exit
    });

    // Tool-specific timeout configurations
    this.setDefaults('timeouts', {
      figma_compare: {
        default: 30000,
        imageProcessing: 45000,
        pixelMatch: 60000,
        fileOperations: 10000
      },
      snapdom_screenshot: {
        default: 60000,
        browserLaunch: 30000,
        pageNavigation: 15000,
        screenshot: 30000,
        cleanup: 5000
      },
      optimize_svg: {
        default: 30000,
        fileRead: 10000,
        optimization: 45000,
        fileWrite: 10000
      },
      optimize_image: {
        default: 30000,
        processing: 60000,
        fileOperations: 15000
      }
    });

    // Retry configurations
    this.setDefaults('retries', {
      networkOperations: {
        count: 3,
        delay: 1000,
        backoff: 'exponential'
      },
      fileOperations: {
        count: 2,
        delay: 500,
        backoff: 'linear'
      },
      browserOperations: {
        count: 2,
        delay: 2000,
        backoff: 'linear'
      },
      imageProcessing: {
        count: 1,
        delay: 1000,
        backoff: 'none'
      }
    });

    // Error handling configurations
    this.setDefaults('errorHandling', {
      includeStackTrace: false,
      includeTechnicalDetails: true,
      suggestSolutions: true,
      categorizeErrors: true,
      logErrors: true
    });

    // Resource management configurations
    this.setDefaults('resources', {
      maxTempFiles: 10,
      tempFileMaxAge: 3600000,     // 1 hour in milliseconds
      autoCleanup: true,
      memoryThreshold: 0.8,        // 80% memory usage threshold
      diskSpaceThreshold: 0.9      // 90% disk space threshold
    });

    // Environment-specific configurations
    this.setDefaults('environments', {
      development: {
        timeout: 60000,
        verbose: true,
        logLevel: 'debug',
        enableMetrics: true
      },
      production: {
        timeout: 30000,
        verbose: false,
        logLevel: 'info',
        enableMetrics: false
      },
      testing: {
        timeout: 10000,
        verbose: false,
        logLevel: 'error',
        enableMetrics: false
      }
    });
  }

  /**
   * Set default configuration for a category
   * @param {string} category - Configuration category
   * @param {Object} defaults - Default configuration values
   */
  setDefaults(category, defaults) {
    this.defaults.set(category, { ...defaults });
    
    // Initialize config with defaults if not already set
    if (!this.config.has(category)) {
      this.config.set(category, { ...defaults });
    }
  }

  /**
   * Get configuration for a category
   * @param {string} category - Configuration category
   * @param {string} key - Specific configuration key (optional)
   * @returns {*} - Configuration value or entire category
   */
  get(category, key = null) {
    const categoryConfig = this.config.get(category);
    
    if (!categoryConfig) {
      // Return defaults if category doesn't exist
      const defaults = this.defaults.get(category);
      return key ? defaults?.[key] : defaults;
    }
    
    return key ? categoryConfig[key] : categoryConfig;
  }

  /**
   * Set configuration for a category
   * @param {string} category - Configuration category
   * @param {string|Object} keyOrConfig - Configuration key or entire config object
   * @param {*} value - Configuration value (if keyOrConfig is a string)
   */
  set(category, keyOrConfig, value = undefined) {
    let categoryConfig = this.config.get(category) || {};
    
    if (typeof keyOrConfig === 'string') {
      // Setting a specific key
      categoryConfig[keyOrConfig] = value;
    } else {
      // Setting entire category config
      categoryConfig = { ...categoryConfig, ...keyOrConfig };
    }
    
    // Validate configuration
    this.validateConfig(category, categoryConfig);
    
    // Update configuration
    this.config.set(category, categoryConfig);
    
    // Notify listeners
    this.notifyListeners(category, categoryConfig);
  }

  /**
   * Merge configuration with existing values
   * @param {string} category - Configuration category
   * @param {Object} newConfig - New configuration to merge
   */
  merge(category, newConfig) {
    const existing = this.config.get(category) || {};
    const merged = this.deepMerge(existing, newConfig);
    
    this.validateConfig(category, merged);
    this.config.set(category, merged);
    this.notifyListeners(category, merged);
  }

  /**
   * Reset configuration to defaults
   * @param {string} category - Configuration category (optional, resets all if not provided)
   */
  reset(category = null) {
    if (category) {
      const defaults = this.defaults.get(category);
      if (defaults) {
        this.config.set(category, { ...defaults });
        this.notifyListeners(category, defaults);
      }
    } else {
      // Reset all categories
      for (const [cat, defaults] of this.defaults) {
        this.config.set(cat, { ...defaults });
        this.notifyListeners(cat, defaults);
      }
    }
  }

  /**
   * Load configuration from file
   * @param {string} filePath - Path to configuration file
   */
  async loadFromFile(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const fileConfig = JSON.parse(content);
      
      // Merge file configuration with existing
      for (const [category, config] of Object.entries(fileConfig)) {
        this.merge(category, config);
      }
      
      return true;
    } catch (error) {
      throw new Error(`Failed to load configuration from ${filePath}: ${error.message}`);
    }
  }

  /**
   * Save configuration to file
   * @param {string} filePath - Path to save configuration file
   */
  async saveToFile(filePath) {
    try {
      const configObject = {};
      for (const [category, config] of this.config) {
        configObject[category] = config;
      }
      
      const content = JSON.stringify(configObject, null, 2);
      await fs.writeFile(filePath, content, 'utf-8');
      
      return true;
    } catch (error) {
      throw new Error(`Failed to save configuration to ${filePath}: ${error.message}`);
    }
  }

  /**
   * Register configuration validator
   * @param {string} category - Configuration category
   * @param {Function} validator - Validation function
   */
  registerValidator(category, validator) {
    this.validators.set(category, validator);
  }

  /**
   * Register configuration change listener
   * @param {string} category - Configuration category
   * @param {Function} listener - Listener function
   */
  addListener(category, listener) {
    if (!this.listeners.has(category)) {
      this.listeners.set(category, []);
    }
    this.listeners.get(category).push(listener);
  }

  /**
   * Remove configuration change listener
   * @param {string} category - Configuration category
   * @param {Function} listener - Listener function to remove
   */
  removeListener(category, listener) {
    const listeners = this.listeners.get(category);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * Get tool-specific timeout configuration
   * @param {string} toolName - Name of the tool
   * @param {string} operation - Specific operation (optional)
   * @returns {number} - Timeout in milliseconds
   */
  getTimeout(toolName, operation = 'default') {
    const timeouts = this.get('timeouts', toolName);
    if (timeouts && timeouts[operation] !== undefined) {
      return timeouts[operation];
    }
    
    // Fallback to default timeout
    return timeouts?.default || this.get('global', 'timeout');
  }

  /**
   * Get retry configuration for operation type
   * @param {string} operationType - Type of operation
   * @returns {Object} - Retry configuration
   */
  getRetryConfig(operationType) {
    const retries = this.get('retries', operationType);
    if (retries) {
      return retries;
    }
    
    // Fallback to default retry config
    return {
      count: this.get('global', 'retryCount'),
      delay: this.get('global', 'retryDelay'),
      backoff: 'none'
    };
  }

  /**
   * Apply environment-specific configuration
   * @param {string} environment - Environment name (development, production, testing)
   */
  applyEnvironment(environment) {
    const envConfig = this.get('environments', environment);
    if (envConfig) {
      this.merge('global', envConfig);
    }
  }

  /**
   * Auto-detect and apply environment configuration
   */
  autoDetectEnvironment() {
    const env = process.env.NODE_ENV || 'development';
    this.applyEnvironment(env);
    return env;
  }

  /**
   * Watch configuration file for changes and auto-reload
   * @param {string} filePath - Path to configuration file to watch
   */
  async watchConfigFile(filePath) {
    try {
      const { watch } = await import('fs');
      
      watch(filePath, async (eventType) => {
        if (eventType === 'change') {
          try {
            await this.loadFromFile(filePath);
            console.log(`Configuration reloaded from ${filePath}`);
          } catch (error) {
            console.error(`Failed to reload configuration: ${error.message}`);
          }
        }
      });
      
      return true;
    } catch (error) {
      console.warn(`Configuration file watching not available: ${error.message}`);
      return false;
    }
  }

  /**
   * Get configuration schema for validation
   * @returns {Object} - Configuration schema
   */
  getSchema() {
    return {
      global: {
        type: 'object',
        properties: {
          timeout: { type: 'number', minimum: 100 },
          retryCount: { type: 'number', minimum: 0, maximum: 10 },
          retryDelay: { type: 'number', minimum: 0 },
          logLevel: { type: 'string', enum: ['error', 'warn', 'info', 'debug'] },
          verbose: { type: 'boolean' },
          enableMetrics: { type: 'boolean' },
          cleanupOnExit: { type: 'boolean' }
        }
      },
      timeouts: {
        type: 'object',
        patternProperties: {
          '^[a-zA-Z_][a-zA-Z0-9_]*$': {
            type: 'object',
            properties: {
              default: { type: 'number', minimum: 100 }
            },
            additionalProperties: { type: 'number', minimum: 100 }
          }
        }
      },
      retries: {
        type: 'object',
        patternProperties: {
          '^[a-zA-Z_][a-zA-Z0-9_]*$': {
            type: 'object',
            properties: {
              count: { type: 'number', minimum: 0, maximum: 10 },
              delay: { type: 'number', minimum: 0 },
              backoff: { type: 'string', enum: ['none', 'linear', 'exponential'] }
            }
          }
        }
      }
    };
  }

  /**
   * Validate configuration against schema
   * @param {string} category - Configuration category
   * @param {Object} config - Configuration to validate
   * @returns {Object} - Validation result
   */
  validateAgainstSchema(category, config) {
    const schema = this.getSchema()[category];
    if (!schema) {
      return { valid: true, errors: [] };
    }

    const errors = [];
    
    // Basic type validation
    if (schema.type === 'object' && typeof config !== 'object') {
      errors.push(`${category} must be an object`);
      return { valid: false, errors };
    }

    // Property validation
    if (schema.properties) {
      for (const [prop, propSchema] of Object.entries(schema.properties)) {
        const value = config[prop];
        if (value !== undefined) {
          const propErrors = this.validateProperty(prop, value, propSchema);
          errors.push(...propErrors);
        }
      }
    }

    // Pattern properties validation (for dynamic keys like tool names)
    if (schema.patternProperties) {
      for (const [prop, value] of Object.entries(config)) {
        for (const [pattern, propSchema] of Object.entries(schema.patternProperties)) {
          const regex = new RegExp(pattern);
          if (regex.test(prop)) {
            if (propSchema.type === 'object' && typeof value === 'object') {
              // Validate nested object properties
              if (propSchema.properties) {
                for (const [nestedProp, nestedValue] of Object.entries(value)) {
                  const nestedSchema = propSchema.properties[nestedProp] || propSchema.additionalProperties;
                  if (nestedSchema) {
                    const nestedErrors = this.validateProperty(`${prop}.${nestedProp}`, nestedValue, nestedSchema);
                    errors.push(...nestedErrors);
                  }
                }
              }
            } else {
              const propErrors = this.validateProperty(prop, value, propSchema);
              errors.push(...propErrors);
            }
            break; // Found matching pattern, no need to check others
          }
        }
      }
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Validate a single property against its schema
   * @param {string} propName - Property name
   * @param {*} value - Property value
   * @param {Object} schema - Property schema
   * @returns {Array} - Validation errors
   */
  validateProperty(propName, value, schema) {
    const errors = [];

    // Type validation
    if (schema.type) {
      const actualType = typeof value;
      if (actualType !== schema.type) {
        errors.push(`${propName} must be of type ${schema.type}, got ${actualType}`);
        return errors;
      }
    }

    // Enum validation
    if (schema.enum && !schema.enum.includes(value)) {
      errors.push(`${propName} must be one of: ${schema.enum.join(', ')}`);
    }

    // Number validations
    if (schema.type === 'number') {
      if (schema.minimum !== undefined && value < schema.minimum) {
        errors.push(`${propName} must be >= ${schema.minimum}`);
      }
      if (schema.maximum !== undefined && value > schema.maximum) {
        errors.push(`${propName} must be <= ${schema.maximum}`);
      }
    }

    return errors;
  }

  /**
   * Get all configuration categories
   * @returns {Array<string>} - List of configuration categories
   */
  getCategories() {
    return Array.from(this.config.keys());
  }

  /**
   * Export configuration as JSON
   * @returns {Object} - Configuration object
   */
  export() {
    const exported = {};
    for (const [category, config] of this.config) {
      exported[category] = { ...config };
    }
    return exported;
  }

  // Private methods

  validateConfig(category, config) {
    const validator = this.validators.get(category);
    if (validator) {
      const result = validator(config);
      if (!result.valid) {
        throw new ValidationError(`Invalid configuration for ${category}: ${result.errors.join(', ')}`);
      }
    }
    
    // Basic validation for known categories
    this.performBasicValidation(category, config);
  }

  performBasicValidation(category, config) {
    // Use schema validation first
    const schemaResult = this.validateAgainstSchema(category, config);
    if (!schemaResult.valid) {
      throw new ValidationError(`Configuration validation failed for ${category}: ${schemaResult.errors.join(', ')}`);
    }

    // Additional custom validations
    switch (category) {
      case 'global':
        if (config.timeout && config.timeout < 100) {
          throw new ValidationError('Global timeout must be at least 100ms');
        }
        break;
        
      case 'timeouts':
        for (const [tool, timeouts] of Object.entries(config)) {
          if (!timeouts.default) {
            throw new ValidationError(`Tool ${tool} must have a default timeout`);
          }
        }
        break;

      case 'retries':
        for (const [operation, retryConfig] of Object.entries(config)) {
          if (retryConfig.count > 0 && retryConfig.delay === 0) {
            console.warn(`Retry configuration for ${operation} has count > 0 but delay = 0`);
          }
        }
        break;
    }
  }

  notifyListeners(category, config) {
    const listeners = this.listeners.get(category);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(config, category);
        } catch (error) {
          console.error(`Configuration listener error for ${category}:`, error);
        }
      });
    }
  }

  deepMerge(target, source) {
    const result = { ...target };
    
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.deepMerge(result[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
    
    return result;
  }
}

// Global configuration manager instance
export const globalConfig = new ConfigManager();