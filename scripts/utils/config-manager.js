#!/usr/bin/env node

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Configuration manager for auto-start functionality
 * Handles loading, validation, and merging of configuration files
 */
class ConfigManager {
  constructor(projectPath = process.cwd()) {
    this.projectPath = projectPath;
    this.configDir = join(projectPath, 'scripts', 'config');
    this.configFile = join(this.configDir, 'auto-start-config.json');
    this.defaultConfigFile = join(this.configDir, 'default-config.json');
    this.vscodeSettingsFile = join(projectPath, '.vscode', 'settings.json');
    
    this._config = null;
    this._schema = this.getConfigSchema();
  }

  /**
   * Get the configuration schema for validation
   */
  getConfigSchema() {
    return {
      enabled: { type: 'boolean', default: true },
      command: { type: 'string', default: 'yarn dev' },
      port: { type: 'number', default: 1932, min: 1024, max: 65535 },
      timeout: { type: 'number', default: 30000, min: 1000 },
      retryCount: { type: 'number', default: 3, min: 0, max: 10 },
      checkDependencies: { type: 'boolean', default: true },
      showNotifications: { type: 'boolean', default: true },
      environment: {
        type: 'object',
        properties: {
          nodeMinVersion: { type: 'string', default: '18.0.0' },
          preferredPackageManager: { type: 'string', default: 'yarn', enum: ['yarn', 'npm'] }
        }
      },
      portOptions: {
        type: 'object',
        properties: {
          defaultPorts: { type: 'array', default: [1932, 3000, 5173, 8080, 8000] },
          autoSelectAlternative: { type: 'boolean', default: true },
          killConflictingProcesses: { type: 'boolean', default: false }
        }
      },
      logging: {
        type: 'object',
        properties: {
          level: { type: 'string', default: 'info', enum: ['debug', 'info', 'warn', 'error'] },
          logFile: { type: 'string', default: '.vscode/dev-server.log' },
          keepLogs: { type: 'boolean', default: true },
          maxLogSize: { type: 'string', default: '10MB' }
        }
      },
      startup: {
        type: 'object',
        properties: {
          delay: { type: 'number', default: 0, min: 0 },
          checkInterval: { type: 'number', default: 2000, min: 100 },
          maxStartupTime: { type: 'number', default: 30000, min: 5000 },
          gracefulShutdown: { type: 'boolean', default: true }
        }
      }
    };
  }

  /**
   * Load default configuration
   */
  loadDefaultConfig() {
    try {
      if (existsSync(this.defaultConfigFile)) {
        const content = readFileSync(this.defaultConfigFile, 'utf8');
        return JSON.parse(content);
      }
    } catch (error) {
      console.warn(chalk.yellow(`Warning: Failed to load default config: ${error.message}`));
    }

    // Return hardcoded defaults if file doesn't exist
    return this.getDefaultConfig();
  }

  /**
   * Get hardcoded default configuration
   */
  getDefaultConfig() {
    return {
      enabled: true,
      command: 'yarn dev',
      port: 1932,
      timeout: 30000,
      retryCount: 3,
      checkDependencies: true,
      showNotifications: true,
      environment: {
        nodeMinVersion: '18.0.0',
        preferredPackageManager: 'yarn'
      },
      portOptions: {
        defaultPorts: [1932, 3000, 5173, 8080, 8000],
        autoSelectAlternative: true,
        killConflictingProcesses: false
      },
      logging: {
        level: 'info',
        logFile: '.vscode/dev-server.log',
        keepLogs: true,
        maxLogSize: '10MB'
      },
      startup: {
        delay: 0,
        checkInterval: 2000,
        maxStartupTime: 30000,
        gracefulShutdown: true
      }
    };
  }

  /**
   * Load user configuration
   */
  loadUserConfig() {
    try {
      if (existsSync(this.configFile)) {
        const content = readFileSync(this.configFile, 'utf8');
        return JSON.parse(content);
      }
    } catch (error) {
      console.warn(chalk.yellow(`Warning: Failed to load user config: ${error.message}`));
    }
    return {};
  }

  /**
   * Load VSCode settings that affect auto-start
   */
  loadVSCodeSettings() {
    try {
      if (existsSync(this.vscodeSettingsFile)) {
        const content = readFileSync(this.vscodeSettingsFile, 'utf8');
        const settings = JSON.parse(content);
        
        // Extract auto-start related settings
        const autoStartSettings = {};
        for (const [key, value] of Object.entries(settings)) {
          if (key.startsWith('figma-restoration.autoStart.')) {
            const configKey = key.replace('figma-restoration.autoStart.', '');
            autoStartSettings[configKey] = value;
          }
        }
        
        return autoStartSettings;
      }
    } catch (error) {
      console.warn(chalk.yellow(`Warning: Failed to load VSCode settings: ${error.message}`));
    }
    return {};
  }

  /**
   * Validate configuration value against schema
   */
  validateValue(key, value, schema) {
    if (!schema) return { valid: true };

    const errors = [];

    // Type validation
    if (schema.type) {
      const actualType = Array.isArray(value) ? 'array' : typeof value;
      if (actualType !== schema.type) {
        errors.push(`Expected ${schema.type}, got ${actualType}`);
      }
    }

    // Enum validation
    if (schema.enum && !schema.enum.includes(value)) {
      errors.push(`Value must be one of: ${schema.enum.join(', ')}`);
    }

    // Number range validation
    if (schema.type === 'number') {
      if (schema.min !== undefined && value < schema.min) {
        errors.push(`Value must be >= ${schema.min}`);
      }
      if (schema.max !== undefined && value > schema.max) {
        errors.push(`Value must be <= ${schema.max}`);
      }
    }

    // Object property validation
    if (schema.type === 'object' && schema.properties) {
      for (const [propKey, propValue] of Object.entries(value || {})) {
        if (schema.properties[propKey]) {
          const propValidation = this.validateValue(propKey, propValue, schema.properties[propKey]);
          if (!propValidation.valid) {
            errors.push(`${propKey}: ${propValidation.errors.join(', ')}`);
          }
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate entire configuration
   */
  validateConfig(config) {
    const errors = [];
    
    for (const [key, value] of Object.entries(config)) {
      if (this._schema[key]) {
        const validation = this.validateValue(key, value, this._schema[key]);
        if (!validation.valid) {
          errors.push(`${key}: ${validation.errors.join(', ')}`);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Merge configurations with priority: VSCode settings > user config > default config
   */
  mergeConfigs(defaultConfig, userConfig, vscodeSettings) {
    const merged = { ...defaultConfig };

    // Apply user config
    for (const [key, value] of Object.entries(userConfig)) {
      if (typeof value === 'object' && !Array.isArray(value) && merged[key]) {
        merged[key] = { ...merged[key], ...value };
      } else {
        merged[key] = value;
      }
    }

    // Apply VSCode settings (highest priority)
    for (const [key, value] of Object.entries(vscodeSettings)) {
      if (key.includes('.')) {
        // Handle nested properties like "environment.nodeMinVersion"
        const parts = key.split('.');
        let target = merged;
        for (let i = 0; i < parts.length - 1; i++) {
          if (!target[parts[i]]) target[parts[i]] = {};
          target = target[parts[i]];
        }
        target[parts[parts.length - 1]] = value;
      } else {
        merged[key] = value;
      }
    }

    return merged;
  }

  /**
   * Load and merge all configurations
   */
  loadConfig(force = false) {
    if (this._config && !force) {
      return this._config;
    }

    const defaultConfig = this.loadDefaultConfig();
    const userConfig = this.loadUserConfig();
    const vscodeSettings = this.loadVSCodeSettings();

    const merged = this.mergeConfigs(defaultConfig, userConfig, vscodeSettings);

    // Validate the merged configuration
    const validation = this.validateConfig(merged);
    if (!validation.valid) {
      console.warn(chalk.yellow('Configuration validation warnings:'));
      validation.errors.forEach(error => {
        console.warn(chalk.yellow(`  • ${error}`));
      });
    }

    this._config = merged;
    return this._config;
  }

  /**
   * Get configuration value with dot notation support
   */
  get(key, defaultValue = undefined) {
    const config = this.loadConfig();
    
    if (!key.includes('.')) {
      return config[key] !== undefined ? config[key] : defaultValue;
    }

    // Handle nested keys like "environment.nodeMinVersion"
    const parts = key.split('.');
    let value = config;
    
    for (const part of parts) {
      if (value && typeof value === 'object' && part in value) {
        value = value[part];
      } else {
        return defaultValue;
      }
    }

    return value;
  }

  /**
   * Set configuration value
   */
  set(key, value) {
    const config = this.loadConfig();
    
    if (!key.includes('.')) {
      config[key] = value;
    } else {
      // Handle nested keys
      const parts = key.split('.');
      let target = config;
      
      for (let i = 0; i < parts.length - 1; i++) {
        if (!target[parts[i]] || typeof target[parts[i]] !== 'object') {
          target[parts[i]] = {};
        }
        target = target[parts[i]];
      }
      
      target[parts[parts.length - 1]] = value;
    }

    this._config = config;
    return this;
  }

  /**
   * Save configuration to file
   */
  save() {
    if (!this._config) {
      throw new Error('No configuration to save');
    }

    try {
      const content = JSON.stringify(this._config, null, 2);
      writeFileSync(this.configFile, content, 'utf8');
      return true;
    } catch (error) {
      console.error(chalk.red(`Failed to save configuration: ${error.message}`));
      return false;
    }
  }

  /**
   * Reset configuration to defaults
   */
  reset() {
    this._config = this.getDefaultConfig();
    return this;
  }

  /**
   * Print current configuration
   */
  print() {
    const config = this.loadConfig();
    
    console.log(chalk.bold('\nCurrent Auto-Start Configuration:'));
    console.log('━'.repeat(50));
    
    this.printSection('General', {
      'Enabled': config.enabled,
      'Command': config.command,
      'Port': config.port,
      'Timeout': `${config.timeout}ms`,
      'Retry Count': config.retryCount,
      'Check Dependencies': config.checkDependencies,
      'Show Notifications': config.showNotifications
    });

    this.printSection('Environment', config.environment);
    this.printSection('Port Options', config.portOptions);
    this.printSection('Logging', config.logging);
    this.printSection('Startup', config.startup);
    
    console.log('');
  }

  /**
   * Print a configuration section
   */
  printSection(title, data) {
    console.log(chalk.blue(`\n${title}:`));
    for (const [key, value] of Object.entries(data)) {
      const displayValue = Array.isArray(value) ? value.join(', ') : value;
      console.log(`  ${key}: ${chalk.green(displayValue)}`);
    }
  }
}

// Export for use in other modules
export default ConfigManager;

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const manager = new ConfigManager();
  const command = process.argv[2];
  
  switch (command) {
    case 'show':
    case 'print':
      manager.print();
      break;
      
    case 'get':
      const key = process.argv[3];
      if (!key) {
        console.error('Usage: config-manager.js get <key>');
        process.exit(1);
      }
      console.log(manager.get(key));
      break;
      
    case 'set':
      const setKey = process.argv[3];
      const setValue = process.argv[4];
      if (!setKey || setValue === undefined) {
        console.error('Usage: config-manager.js set <key> <value>');
        process.exit(1);
      }
      
      // Try to parse value as JSON, fallback to string
      let parsedValue;
      try {
        parsedValue = JSON.parse(setValue);
      } catch {
        parsedValue = setValue;
      }
      
      manager.set(setKey, parsedValue).save();
      console.log(chalk.green(`Set ${setKey} = ${setValue}`));
      break;
      
    case 'reset':
      manager.reset().save();
      console.log(chalk.green('Configuration reset to defaults'));
      break;
      
    default:
      console.log('Usage: config-manager.js <command>');
      console.log('Commands:');
      console.log('  show|print    - Show current configuration');
      console.log('  get <key>     - Get configuration value');
      console.log('  set <key> <value> - Set configuration value');
      console.log('  reset         - Reset to default configuration');
      break;
  }
}