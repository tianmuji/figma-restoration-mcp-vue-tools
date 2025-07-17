/**
 * Puppeteer configuration for figma-restoration-mcp-vue-tools
 * This configuration prevents Chrome download during package installation
 * and allows users to configure their own Chrome executable path
 */

const { join } = require('path');
const { existsSync } = require('fs');

// Common Chrome executable paths for different platforms
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
  
  for (const path of paths) {
    if (existsSync(path)) {
      return path;
    }
  }
  
  return null;
}

module.exports = {
  // Skip Chrome download during installation
  skipDownload: true,
  
  // Use system Chrome if available
  executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || 
                  process.env.CHROME_EXECUTABLE_PATH || 
                  findChromeExecutable(),
  
  // Cache directory (optional)
  cacheDirectory: join(__dirname, '.cache', 'puppeteer'),
  
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
};
