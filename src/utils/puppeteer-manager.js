/**
 * Puppeteer Manager - 统一管理 Puppeteer 浏览器实例
 * 支持浏览器启动和错误处理
 */

import puppeteer from 'puppeteer';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';

export class PuppeteerManager {
  constructor() {
    this.browser = null;
  }

  /**
   * 查找 Chrome 可执行文件
   */
  findChromeExecutable() {
    const platform = process.platform;
    const chromePaths = {
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

    const paths = chromePaths[platform] || [];
    
    for (const chromePath of paths) {
      if (fs.existsSync(chromePath)) {
        return chromePath;
      }
    }

    return null;
  }

  /**
   * 启动浏览器实例
   */
  async launchBrowser(options = {}) {

    // 确定 Chrome 可执行文件路径
    const executablePath = 
      process.env.CHROME_EXECUTABLE_PATH || 
      process.env.PUPPETEER_EXECUTABLE_PATH || 
      this.findChromeExecutable() ||
      undefined; // 让 Puppeteer 使用默认路径

    const defaultOptions = {
      headless: "new",
      executablePath,
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

    const launchOptions = { ...defaultOptions, ...options };

    try {
      console.log(chalk.gray(`🚀 Launching browser...`));
      if (executablePath) {
        console.log(chalk.gray(`📍 Chrome path: ${executablePath}`));
      }

      this.browser = await puppeteer.launch(launchOptions);
      console.log(chalk.green('✅ Browser launched successfully'));
      return this.browser;
    } catch (error) {
      const errorMessage = `
❌ Failed to launch browser.

🔧 Possible solutions:

1. Install Google Chrome:
   - macOS: Download from https://www.google.com/chrome/
   - Linux: sudo apt-get install google-chrome-stable
   - Windows: Download from https://www.google.com/chrome/

2. Set Chrome path manually:
   export CHROME_EXECUTABLE_PATH="/path/to/chrome"

3. Check if Chrome is running:
   ps aux | grep chrome

Error details: ${error.message}
`;
      throw new Error(errorMessage);
    }
  }

  /**
   * 关闭浏览器实例
   */
  async closeBrowser() {
    if (this.browser) {
      try {
        await this.browser.close();
        console.log(chalk.gray('🔒 Browser closed'));
      } catch (error) {
        console.warn(chalk.yellow(`⚠️  Warning: Failed to close browser: ${error.message}`));
      } finally {
        this.browser = null;
      }
    }
  }

  /**
   * 检查 Puppeteer 是否可用
   */
  async checkAvailability() {
    try {
      const chromeExecutable = this.findChromeExecutable();

      return {
        available: true,
        puppeteerLoaded: true,
        chromeFound: !!chromeExecutable,
        chromePath: chromeExecutable
      };
    } catch (error) {
      return {
        available: false,
        puppeteerLoaded: false,
        chromeFound: false,
        error: error.message
      };
    }
  }

  /**
   * 获取单例实例
   */
  static getInstance() {
    if (!PuppeteerManager.instance) {
      PuppeteerManager.instance = new PuppeteerManager();
    }
    return PuppeteerManager.instance;
  }
}

// 导出单例实例
export const puppeteerManager = PuppeteerManager.getInstance();
