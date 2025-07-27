/**
 * Puppeteer Manager - 统一管理 Puppeteer 浏览器实例
 * 使用 Puppeteer 内置 Chromium，简化配置和错误处理
 */

import puppeteer from 'puppeteer';
import chalk from 'chalk';
import { 
  PuppeteerLaunchError, 
  NetworkError, 
  PermissionError, 
  TimeoutError,
  MemoryError 
} from './puppeteer-errors.js';

export class PuppeteerManager {
  constructor() {
    this.browser = null;
    this.pagePool = [];
    this.maxPoolSize = 5; // 限制页面池大小
    this.isWarmedUp = false;
  }

  /**
   * 检查并警告废弃的环境变量
   */
  checkDeprecatedEnvVars() {
    if (process.env.PUPPETEER_EXECUTABLE_PATH) {
      console.warn(chalk.yellow('⚠️  PUPPETEER_EXECUTABLE_PATH is deprecated and will be ignored'));
      console.warn(chalk.yellow('   Puppeteer now uses bundled Chromium automatically'));
    }
    
    if (process.env.CHROME_EXECUTABLE_PATH) {
      console.warn(chalk.yellow('⚠️  CHROME_EXECUTABLE_PATH is deprecated and will be ignored'));
      console.warn(chalk.yellow('   Puppeteer now uses bundled Chromium automatically'));
    }
  }

  /**
   * 启动浏览器实例 - 使用 Puppeteer 内置 Chromium
   */
  async launchBrowser(options = {}) {
    // 检查废弃的环境变量
    this.checkDeprecatedEnvVars();

    const defaultOptions = {
      headless: "new",
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ],
      timeout: 30000
    };

    const launchOptions = { ...defaultOptions, ...options };

    try {
      console.log(chalk.gray('🚀 Launching browser with bundled Chromium...'));
      
      this.browser = await puppeteer.launch(launchOptions);
      console.log(chalk.green('✅ Browser launched successfully'));
      return this.browser;
    } catch (error) {
      // 分类错误并提供具体解决方案
      if (error.message.includes('ECONNREFUSED') || error.message.includes('network')) {
        throw new NetworkError('Failed to download or connect to Chromium', error);
      } else if (error.message.includes('Permission denied') || error.message.includes('EACCES')) {
        throw new PermissionError('Insufficient permissions to launch browser', error);
      } else if (error.message.includes('timeout') || error.message.includes('timed out')) {
        throw new TimeoutError('Browser launch timed out', error);
      } else if (error.message.includes('memory') || error.message.includes('ENOMEM')) {
        throw new MemoryError('Insufficient memory to launch browser', error);
      } else {
        throw new PuppeteerLaunchError(error);
      }
    }
  }

  /**
   * 获取页面实例 - 支持页面池复用
   */
  async getPage() {
    if (this.pagePool.length > 0) {
      return this.pagePool.pop();
    }
    
    if (!this.browser) {
      this.browser = await this.launchBrowser();
    }
    
    return await this.browser.newPage();
  }

  /**
   * 释放页面实例回到池中
   */
  async releasePage(page) {
    // 如果页面池已满，直接关闭页面
    if (this.pagePool.length >= this.maxPoolSize) {
      try {
        await page.close();
      } catch (error) {
        // 忽略关闭错误
      }
      return;
    }

    try {
      // 清理页面状态
      await page.goto('about:blank');
      await page.evaluate(() => {
        // 清理全局变量和事件监听器
        if (typeof window !== 'undefined') {
          window.stop();
        }
      });
      
      this.pagePool.push(page);
    } catch (error) {
      // 如果清理失败，直接关闭页面
      console.warn(chalk.yellow(`⚠️  Failed to clean page, closing: ${error.message}`));
      try {
        await page.close();
      } catch (closeError) {
        // 忽略关闭错误
      }
    }
  }

  /**
   * 关闭浏览器实例
   */
  async closeBrowser() {
    if (this.browser) {
      try {
        // 清理页面池
        for (const page of this.pagePool) {
          try {
            await page.close();
          } catch (error) {
            // 忽略单个页面关闭错误
          }
        }
        this.pagePool = [];
        
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
   * 预热浏览器实例
   */
  async warmup() {
    if (!this.browser) {
      console.log(chalk.gray('🔥 Pre-warming browser instance...'));
      this.browser = await this.launchBrowser();
    }
  }

  /**
   * 检查 Puppeteer 是否可用
   */
  async checkAvailability() {
    try {
      // 简单检查 Puppeteer 模块是否加载
      const puppeteerVersion = puppeteer.version || 'unknown';
      
      return {
        available: true,
        puppeteerLoaded: true,
        puppeteerVersion,
        chromiumBundled: true,
        message: 'Puppeteer with bundled Chromium is ready'
      };
    } catch (error) {
      return {
        available: false,
        puppeteerLoaded: false,
        chromiumBundled: false,
        error: error.message,
        message: 'Puppeteer is not available'
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
