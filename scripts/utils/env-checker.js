#!/usr/bin/env node

import { execSync, spawn } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';
import chalk from 'chalk';

/**
 * Environment checker for auto-start functionality
 * Checks Node.js, Yarn, and project dependencies
 */
class EnvironmentChecker {
  constructor(projectPath = process.cwd()) {
    this.projectPath = projectPath;
    this.packageJsonPath = join(projectPath, 'package.json');
    this.nodeModulesPath = join(projectPath, 'node_modules');
    this.yarnLockPath = join(projectPath, 'yarn.lock');
  }

  /**
   * Check if Node.js is installed and get version
   */
  checkNodeJs() {
    try {
      const version = execSync('node --version', { encoding: 'utf8' }).trim();
      const majorVersion = parseInt(version.replace('v', '').split('.')[0]);
      
      return {
        installed: true,
        version: version,
        supported: majorVersion >= 18,
        path: execSync('which node', { encoding: 'utf8' }).trim()
      };
    } catch (error) {
      return {
        installed: false,
        version: null,
        supported: false,
        path: null,
        error: error.message
      };
    }
  }

  /**
   * Check if Yarn is installed and get version
   */
  checkYarn() {
    try {
      const version = execSync('yarn --version', { encoding: 'utf8' }).trim();
      const path = execSync('which yarn', { encoding: 'utf8' }).trim();
      
      return {
        installed: true,
        version: version,
        path: path
      };
    } catch (error) {
      return {
        installed: false,
        version: null,
        path: null,
        error: error.message
      };
    }
  }

  /**
   * Check if npm is available as fallback
   */
  checkNpm() {
    try {
      const version = execSync('npm --version', { encoding: 'utf8' }).trim();
      const path = execSync('which npm', { encoding: 'utf8' }).trim();
      
      return {
        installed: true,
        version: version,
        path: path
      };
    } catch (error) {
      return {
        installed: false,
        version: null,
        path: null,
        error: error.message
      };
    }
  }

  /**
   * Check if project dependencies are installed
   */
  checkDependencies() {
    const packageJsonExists = existsSync(this.packageJsonPath);
    const nodeModulesExists = existsSync(this.nodeModulesPath);
    const yarnLockExists = existsSync(this.yarnLockPath);

    if (!packageJsonExists) {
      return {
        installed: false,
        packageJsonExists: false,
        nodeModulesExists: false,
        yarnLockExists: false,
        error: 'package.json not found'
      };
    }

    // Check if critical dependencies exist
    const criticalDeps = ['vite', 'vue', '@vitejs/plugin-vue'];
    const missingDeps = [];

    for (const dep of criticalDeps) {
      const depPath = join(this.nodeModulesPath, dep);
      if (!existsSync(depPath)) {
        missingDeps.push(dep);
      }
    }

    return {
      installed: nodeModulesExists && missingDeps.length === 0,
      packageJsonExists,
      nodeModulesExists,
      yarnLockExists,
      missingDependencies: missingDeps,
      needsInstall: !nodeModulesExists || missingDeps.length > 0
    };
  }

  /**
   * Perform comprehensive environment check
   */
  async checkEnvironment() {
    console.log(chalk.blue('🔍 Checking environment...'));

    const nodeCheck = this.checkNodeJs();
    const yarnCheck = this.checkYarn();
    const npmCheck = this.checkNpm();
    const depsCheck = this.checkDependencies();

    const result = {
      node: nodeCheck,
      yarn: yarnCheck,
      npm: npmCheck,
      dependencies: depsCheck,
      ready: false,
      errors: [],
      warnings: [],
      suggestions: []
    };

    // Validate Node.js
    if (!nodeCheck.installed) {
      result.errors.push('Node.js is not installed');
      result.suggestions.push('Install Node.js from https://nodejs.org/');
    } else if (!nodeCheck.supported) {
      result.warnings.push(`Node.js version ${nodeCheck.version} may not be supported. Recommended: v18+`);
    }

    // Validate package manager
    if (!yarnCheck.installed && !npmCheck.installed) {
      result.errors.push('Neither Yarn nor npm is available');
      result.suggestions.push('Install Yarn: npm install -g yarn');
    } else if (!yarnCheck.installed) {
      result.warnings.push('Yarn not found, will use npm as fallback');
    }

    // Validate dependencies
    if (!depsCheck.installed) {
      if (!depsCheck.packageJsonExists) {
        result.errors.push('package.json not found in project directory');
      } else if (depsCheck.needsInstall) {
        result.warnings.push('Dependencies need to be installed');
        result.suggestions.push(yarnCheck.installed ? 'Run: yarn install' : 'Run: npm install');
      }
    }

    // Determine if environment is ready
    result.ready = nodeCheck.installed && 
                   nodeCheck.supported && 
                   (yarnCheck.installed || npmCheck.installed) && 
                   depsCheck.installed;

    return result;
  }

  /**
   * Print environment check results
   */
  printResults(results) {
    console.log('\n' + chalk.bold('Environment Check Results:'));
    console.log('━'.repeat(40));

    // Node.js status
    if (results.node.installed) {
      console.log(chalk.green('✓') + ` Node.js: ${results.node.version}`);
    } else {
      console.log(chalk.red('✗') + ' Node.js: Not installed');
    }

    // Package manager status
    if (results.yarn.installed) {
      console.log(chalk.green('✓') + ` Yarn: ${results.yarn.version}`);
    } else if (results.npm.installed) {
      console.log(chalk.yellow('⚠') + ` Yarn: Not installed (npm ${results.npm.version} available)`);
    } else {
      console.log(chalk.red('✗') + ' Package Manager: None available');
    }

    // Dependencies status
    if (results.dependencies.installed) {
      console.log(chalk.green('✓') + ' Dependencies: Installed');
    } else {
      console.log(chalk.red('✗') + ' Dependencies: Missing or incomplete');
    }

    // Overall status
    console.log('\n' + chalk.bold('Overall Status:'));
    if (results.ready) {
      console.log(chalk.green('✓ Environment is ready for auto-start'));
    } else {
      console.log(chalk.red('✗ Environment needs attention'));
    }

    // Print errors
    if (results.errors.length > 0) {
      console.log('\n' + chalk.red.bold('Errors:'));
      results.errors.forEach(error => {
        console.log(chalk.red('  • ') + error);
      });
    }

    // Print warnings
    if (results.warnings.length > 0) {
      console.log('\n' + chalk.yellow.bold('Warnings:'));
      results.warnings.forEach(warning => {
        console.log(chalk.yellow('  • ') + warning);
      });
    }

    // Print suggestions
    if (results.suggestions.length > 0) {
      console.log('\n' + chalk.blue.bold('Suggestions:'));
      results.suggestions.forEach(suggestion => {
        console.log(chalk.blue('  • ') + suggestion);
      });
    }

    console.log('');
  }
}

// Export for use in other modules
export default EnvironmentChecker;

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const checker = new EnvironmentChecker();
  const results = await checker.checkEnvironment();
  checker.printResults(results);
  process.exit(results.ready ? 0 : 1);
}