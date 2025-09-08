/**
 * Configuration Management System Examples
 * 
 * This file demonstrates how to use the ConfigManager for various scenarios
 */

import { ConfigManager, globalConfig } from './config-manager.js';

/**
 * Example 1: Basic Configuration Usage
 */
export function basicConfigurationExample() {
  console.log('=== Basic Configuration Example ===');
  
  // Get default timeout
  const defaultTimeout = globalConfig.get('global', 'timeout');
  console.log(`Default timeout: ${defaultTimeout}ms`);
  
  // Set a custom timeout
  globalConfig.set('global', 'timeout', 45000);
  console.log(`Updated timeout: ${globalConfig.get('global', 'timeout')}ms`);
  
  // Get tool-specific timeout
  const figmaTimeout = globalConfig.getTimeout('figma_compare', 'imageProcessing');
  console.log(`Figma compare image processing timeout: ${figmaTimeout}ms`);
  
  // Reset to defaults
  globalConfig.reset('global');
  console.log(`Reset timeout: ${globalConfig.get('global', 'timeout')}ms`);
}

/**
 * Example 2: Environment-Specific Configuration
 */
export function environmentConfigurationExample() {
  console.log('\n=== Environment Configuration Example ===');
  
  const config = new ConfigManager();
  
  // Auto-detect and apply environment
  const env = config.autoDetectEnvironment();
  console.log(`Detected environment: ${env}`);
  
  // Manually apply development environment
  config.applyEnvironment('development');
  console.log(`Development timeout: ${config.get('global', 'timeout')}ms`);
  console.log(`Development verbose: ${config.get('global', 'verbose')}`);
  
  // Apply production environment
  config.applyEnvironment('production');
  console.log(`Production timeout: ${config.get('global', 'timeout')}ms`);
  console.log(`Production verbose: ${config.get('global', 'verbose')}`);
}

/**
 * Example 3: Custom Tool Configuration
 */
export function customToolConfigurationExample() {
  console.log('\n=== Custom Tool Configuration Example ===');
  
  const config = new ConfigManager();
  
  // Add configuration for a custom tool
  config.set('timeouts', {
    custom_ai_tool: {
      default: 60000,
      modelInference: 120000,
      dataProcessing: 30000,
      fileUpload: 45000
    }
  });
  
  // Add retry configuration for the custom tool
  config.set('retries', {
    aiOperations: {
      count: 3,
      delay: 2000,
      backoff: 'exponential'
    }
  });
  
  // Get custom tool timeouts
  console.log(`Custom tool default timeout: ${config.getTimeout('custom_ai_tool')}ms`);
  console.log(`Custom tool inference timeout: ${config.getTimeout('custom_ai_tool', 'modelInference')}ms`);
  
  // Get custom retry configuration
  const retryConfig = config.getRetryConfig('aiOperations');
  console.log(`AI operations retry config:`, retryConfig);
}

/**
 * Example 4: Configuration Validation
 */
export function configurationValidationExample() {
  console.log('\n=== Configuration Validation Example ===');
  
  const config = new ConfigManager();
  
  try {
    // This should work
    config.set('global', {
      timeout: 30000,
      retryCount: 2,
      logLevel: 'info',
      verbose: true
    });
    console.log('✅ Valid configuration accepted');
  } catch (error) {
    console.log('❌ Validation error:', error.message);
  }
  
  try {
    // This should fail
    config.set('global', {
      timeout: -1000,  // Invalid: negative timeout
      retryCount: 15,  // Invalid: too many retries
      logLevel: 'invalid'  // Invalid: not in enum
    });
    console.log('❌ Invalid configuration was accepted (this should not happen)');
  } catch (error) {
    console.log('✅ Validation correctly rejected invalid config:', error.message);
  }
}

/**
 * Example 5: Configuration Listeners
 */
export function configurationListenersExample() {
  console.log('\n=== Configuration Listeners Example ===');
  
  const config = new ConfigManager();
  
  // Add a listener for global configuration changes
  const globalListener = (newConfig, category) => {
    console.log(`📢 Global config changed in category '${category}':`, {
      timeout: newConfig.timeout,
      verbose: newConfig.verbose
    });
  };
  
  config.addListener('global', globalListener);
  
  // Make some changes (this will trigger the listener)
  console.log('Making configuration changes...');
  config.set('global', 'timeout', 50000);
  config.set('global', 'verbose', true);
  
  // Remove the listener
  config.removeListener('global', globalListener);
  console.log('Listener removed - further changes will not be logged');
  config.set('global', 'timeout', 60000);
}

/**
 * Example 6: Custom Validators
 */
export function customValidatorsExample() {
  console.log('\n=== Custom Validators Example ===');
  
  const config = new ConfigManager();
  
  // Register a custom validator for a new category
  const customValidator = (configData) => {
    const errors = [];
    
    if (configData.maxConnections && configData.maxConnections > 1000) {
      errors.push('maxConnections cannot exceed 1000');
    }
    
    if (configData.poolSize && configData.poolSize < 1) {
      errors.push('poolSize must be at least 1');
    }
    
    if (configData.maxConnections && configData.poolSize && 
        configData.maxConnections < configData.poolSize) {
      errors.push('maxConnections must be >= poolSize');
    }
    
    return { valid: errors.length === 0, errors };
  };
  
  config.registerValidator('database', customValidator);
  
  try {
    // This should work
    config.set('database', {
      maxConnections: 100,
      poolSize: 10,
      timeout: 5000
    });
    console.log('✅ Valid database configuration accepted');
  } catch (error) {
    console.log('❌ Validation error:', error.message);
  }
  
  try {
    // This should fail
    config.set('database', {
      maxConnections: 5,   // Less than poolSize
      poolSize: 10,
      timeout: 5000
    });
    console.log('❌ Invalid configuration was accepted');
  } catch (error) {
    console.log('✅ Custom validator correctly rejected config:', error.message);
  }
}

/**
 * Example 7: Configuration Import/Export
 */
export async function configurationImportExportExample() {
  console.log('\n=== Configuration Import/Export Example ===');
  
  const config = new ConfigManager();
  
  // Modify some configurations
  config.set('global', { timeout: 75000, verbose: true });
  config.set('custom', { feature1: true, feature2: 'enabled' });
  
  // Export configuration
  const exported = config.export();
  console.log('📤 Exported configuration categories:', Object.keys(exported));
  
  // Create a new config manager and import
  const newConfig = new ConfigManager();
  
  // Simulate importing from the exported data
  for (const [category, categoryConfig] of Object.entries(exported)) {
    if (category === 'custom') {  // Only import custom category
      newConfig.set(category, categoryConfig);
    }
  }
  
  console.log('📥 Imported custom configuration:', newConfig.get('custom'));
  
  // Show that global config wasn't imported (still has defaults)
  console.log('🔄 Global config (not imported):', {
    timeout: newConfig.get('global', 'timeout'),
    verbose: newConfig.get('global', 'verbose')
  });
}

/**
 * Example 8: Runtime Configuration Updates
 */
export function runtimeConfigurationExample() {
  console.log('\n=== Runtime Configuration Updates Example ===');
  
  const config = new ConfigManager();
  
  // Simulate a tool that needs to adjust its timeout based on load
  const adjustTimeoutBasedOnLoad = (currentLoad) => {
    let newTimeout;
    
    if (currentLoad > 0.8) {
      newTimeout = 60000;  // High load: longer timeout
    } else if (currentLoad > 0.5) {
      newTimeout = 45000;  // Medium load: medium timeout
    } else {
      newTimeout = 30000;  // Low load: default timeout
    }
    
    config.set('global', 'timeout', newTimeout);
    console.log(`🔧 Adjusted timeout to ${newTimeout}ms for load ${(currentLoad * 100).toFixed(1)}%`);
  };
  
  // Simulate different load conditions
  adjustTimeoutBasedOnLoad(0.3);  // Low load
  adjustTimeoutBasedOnLoad(0.7);  // Medium load
  adjustTimeoutBasedOnLoad(0.9);  // High load
  
  // Simulate adjusting retry strategy based on error rate
  const adjustRetryStrategy = (errorRate) => {
    let retryConfig;
    
    if (errorRate > 0.1) {
      retryConfig = { count: 5, delay: 2000, backoff: 'exponential' };
    } else if (errorRate > 0.05) {
      retryConfig = { count: 3, delay: 1000, backoff: 'linear' };
    } else {
      retryConfig = { count: 1, delay: 500, backoff: 'none' };
    }
    
    config.set('retries', 'adaptiveOperations', retryConfig);
    console.log(`🔄 Adjusted retry strategy for error rate ${(errorRate * 100).toFixed(1)}%:`, retryConfig);
  };
  
  adjustRetryStrategy(0.02);  // Low error rate
  adjustRetryStrategy(0.08);  // Medium error rate
  adjustRetryStrategy(0.15);  // High error rate
}

/**
 * Run all examples
 */
export function runAllExamples() {
  console.log('🚀 Configuration Management System Examples\n');
  
  basicConfigurationExample();
  environmentConfigurationExample();
  customToolConfigurationExample();
  configurationValidationExample();
  configurationListenersExample();
  customValidatorsExample();
  configurationImportExportExample();
  runtimeConfigurationExample();
  
  console.log('\n✅ All examples completed!');
}

// Run examples if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllExamples();
}