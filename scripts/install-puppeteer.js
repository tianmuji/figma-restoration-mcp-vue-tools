#!/usr/bin/env node

/**
 * Safe Puppeteer installation script for figma-restoration-mcp-vue-tools
 * Handles registry issues and provides fallback options
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Installing Puppeteer safely...');

// Set environment variables to prevent Chrome download
process.env.PUPPETEER_SKIP_CHROMIUM_DOWNLOAD = 'true';
process.env.PUPPETEER_SKIP_DOWNLOAD = 'true';

function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      env: { ...process.env, ...options.env },
      ...options
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });

    child.on('error', reject);
  });
}

async function detectPackageManager() {
  if (fs.existsSync('yarn.lock')) return 'yarn';
  if (fs.existsSync('pnpm-lock.yaml')) return 'pnpm';
  return 'npm';
}

async function installPuppeteer() {
  const packageManager = await detectPackageManager();
  
  console.log(`📦 Using package manager: ${packageManager}`);
  
  const installCommands = {
    npm: ['install', 'puppeteer', '--registry', 'https://registry.npmjs.org/'],
    yarn: ['add', 'puppeteer', '--registry', 'https://registry.npmjs.org/'],
    pnpm: ['add', 'puppeteer', '--registry', 'https://registry.npmjs.org/']
  };

  const env = {
    PUPPETEER_SKIP_CHROMIUM_DOWNLOAD: 'true',
    PUPPETEER_SKIP_DOWNLOAD: 'true',
    PUPPETEER_DOWNLOAD_BASE_URL: 'https://registry.npmjs.org'
  };

  try {
    console.log('🚀 Installing Puppeteer with safe configuration...');
    await runCommand(packageManager, installCommands[packageManager], { env });
    console.log('✅ Puppeteer installed successfully!');
    
    console.log('');
    console.log('📚 Next steps:');
    console.log('1. Initialize configuration: npx figma-restoration-mcp-vue-tools init');
    console.log('2. Start MCP server: npx figma-restoration-mcp-vue-tools start');
    
  } catch (error) {
    console.error('❌ Puppeteer installation failed:', error.message);
    console.log('');
    console.log('🔧 Manual installation options:');
    console.log('1. Skip Puppeteer: The tools can work without it for some features');
    console.log('2. Install manually: PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true npm install puppeteer');
    console.log('3. Use system Chrome: Set PUPPETEER_EXECUTABLE_PATH environment variable');
    
    process.exit(1);
  }
}

// Check if Puppeteer is already installed
try {
  require.resolve('puppeteer');
  console.log('✅ Puppeteer is already installed');
  process.exit(0);
} catch (error) {
  // Puppeteer not installed, proceed with installation
  installPuppeteer();
}
