#!/usr/bin/env node

/**
 * Post-installation script for figma-restoration-mcp-vue-tools
 * Ensures proper configuration and prevents Puppeteer download issues
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

console.log('🔧 Configuring figma-restoration-mcp-vue-tools...');

// Set environment variables to prevent Puppeteer download
process.env.PUPPETEER_SKIP_CHROMIUM_DOWNLOAD = 'true';
process.env.PUPPETEER_SKIP_DOWNLOAD = 'true';

// Common Chrome executable paths
const chromeExecutablePaths = {
  darwin: [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary'
  ],
  linux: [
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium',
    '/snap/bin/chromium'
  ],
  win32: [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files\\Google\\Chrome Beta\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome Beta\\Application\\chrome.exe'
  ]
};

// Find available Chrome executable
function findChromeExecutable() {
  const platform = process.platform;
  const paths = chromeExecutablePaths[platform] || [];
  
  for (const chromePath of paths) {
    try {
      if (fs.existsSync(chromePath)) {
        return chromePath;
      }
    } catch (error) {
      // Continue searching
    }
  }
  
  return null;
}

// Create or update .puppeteerrc.cjs if it doesn't exist
function createPuppeteerConfig() {
  const puppeteerConfigPath = path.join(process.cwd(), '.puppeteerrc.cjs');
  
  if (!fs.existsSync(puppeteerConfigPath)) {
    const chromeExecutable = findChromeExecutable();
    
    const config = `/**
 * Puppeteer configuration for figma-restoration-mcp-vue-tools
 * This configuration prevents Chrome download during package installation
 */

module.exports = {
  // Skip Chrome download during installation
  skipDownload: true,
  
  // Use system Chrome if available
  executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || 
                  process.env.CHROME_EXECUTABLE_PATH || 
                  '${chromeExecutable || '/usr/bin/google-chrome'}',
  
  // Default launch options
  defaultViewport: {
    width: 1440,
    height: 800
  },
  
  // Launch options for headless mode
  headless: true,
  
  // Additional launch arguments
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-accelerated-2d-canvas',
    '--no-first-run',
    '--no-zygote',
    '--disable-gpu'
  ]
};`;

    try {
      fs.writeFileSync(puppeteerConfigPath, config);
      console.log('✅ Created .puppeteerrc.cjs configuration');
    } catch (error) {
      console.log('⚠️  Could not create .puppeteerrc.cjs:', error.message);
    }
  }
}

// Main configuration function
function configure() {
  try {
    // Create Puppeteer configuration
    createPuppeteerConfig();
    
    // Find Chrome executable
    const chromeExecutable = findChromeExecutable();
    if (chromeExecutable) {
      console.log(`✅ Found Chrome executable: ${chromeExecutable}`);
    } else {
      console.log('⚠️  Chrome executable not found. Please install Google Chrome or set PUPPETEER_EXECUTABLE_PATH environment variable.');
    }
    
    console.log('✅ figma-restoration-mcp-vue-tools configured successfully!');
    console.log('');
    console.log('📚 Next steps:');
    console.log('1. Initialize configuration: npx figma-restoration-mcp-vue-tools init');
    console.log('2. Start MCP server: npx figma-restoration-mcp-vue-tools start');
    console.log('3. Check documentation: https://github.com/tianmuji/figma-restoration-mcp-vue-tools');
    
  } catch (error) {
    console.error('❌ Configuration failed:', error.message);
    console.log('');
    console.log('🔧 Manual setup:');
    console.log('1. Set environment variable: export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true');
    console.log('2. Install Chrome: https://www.google.com/chrome/');
    console.log('3. Try again: npx figma-restoration-mcp-vue-tools init');
  }
}

// Run configuration
configure();
