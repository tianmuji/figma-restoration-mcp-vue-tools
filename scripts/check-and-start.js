#!/usr/bin/env node

/**
 * Check and start development server
 * This script can be run periodically or on demand to ensure the dev server is running
 */

import { execSync, spawn } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';
import chalk from 'chalk';

// Detect if we're running from root directory or project directory
const currentDir = process.cwd();
const projectRoot = currentDir.endsWith('figma-restoration-mcp-vue-tools') 
  ? currentDir 
  : join(currentDir, 'figma-restoration-mcp-vue-tools');
const autoStartScript = join(projectRoot, 'scripts', 'auto-start.sh');

function log(message) {
  console.log(chalk.blue('[Check-Start]'), message);
}

function logSuccess(message) {
  console.log(chalk.green('[Check-Start]'), message);
}

function logWarning(message) {
  console.log(chalk.yellow('[Check-Start]'), message);
}

function logError(message) {
  console.log(chalk.red('[Check-Start]'), message);
}

async function main() {
  log('Checking if development server should be started...');
  
  // Check if auto-start script exists
  if (!existsSync(autoStartScript)) {
    logError('Auto-start script not found');
    process.exit(1);
  }
  
  try {
    // Run the auto-start script
    const result = execSync(`bash "${autoStartScript}"`, {
      encoding: 'utf8',
      stdio: 'pipe',
      cwd: projectRoot
    });
    
    console.log(result);
    logSuccess('Auto-start check completed');
    
  } catch (error) {
    if (error.status === 0) {
      // Exit code 0 means success or skip
      console.log(error.stdout);
      logSuccess('Auto-start check completed');
    } else {
      logError('Auto-start failed:');
      console.error(error.stdout || error.message);
      process.exit(error.status || 1);
    }
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    logError(`Unexpected error: ${error.message}`);
    process.exit(1);
  });
}

export default main;