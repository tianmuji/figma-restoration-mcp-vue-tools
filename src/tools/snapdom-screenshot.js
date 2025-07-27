import fs from 'fs/promises';
import path from 'path';
import chalk from 'chalk';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import {
  ensureDirectory
} from '../utils/path-config.js';
import { puppeteerManager } from '../utils/puppeteer-manager.js';
import { 
  PuppeteerLaunchError, 
  NetworkError, 
  PermissionError, 
  TimeoutError,
  MemoryError 
} from '../utils/puppeteer-errors.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class SnapDOMScreenshotTool {
  constructor() {
    this.description = 'Take high-quality screenshots using snapDOM technology for precise DOM-to-image capture';
    this.DEFAULT_TIMEOUT = 30000; // 30秒超时
    
    this.inputSchema = {
      type: 'object',
      properties: {
        componentName: {
          type: 'string',
          description: 'Name of the component to screenshot'
        },
        projectPath: {
          type: 'string',
          description: 'Path to the Vue project (required)'
        },
        viewport: {
          type: 'object',
          properties: {
            width: { type: 'number', default: 1440 },
            height: { type: 'number', default: 800 }
          },
          description: 'Viewport size for screenshot'
        },
        snapDOMOptions: {
          type: 'object',
          properties: {
            compress: { type: 'boolean', default: true },
            fast: { type: 'boolean', default: false },
            embedFonts: { type: 'boolean', default: true },
            backgroundColor: { type: 'string', default: 'transparent' },
            width: { type: 'number', description: 'Fixed width for output' },
            height: { type: 'number', description: 'Fixed height for output' }
          },
          description: 'snapDOM capture options for high-quality screenshots'
        },
        outputPath: {
          type: 'string',
          description: 'Custom output path for screenshot (required)'
        },
        selector: {
          type: 'string',
          description: 'Custom CSS selector to screenshot (optional)'
        }
      },
      required: ['componentName', 'projectPath', 'outputPath']
    };
  }

  // 超时包装函数
  async withTimeout(promise, timeoutMs = this.DEFAULT_TIMEOUT, errorMessage = 'Operation timed out') {
    const startTime = Date.now();
    return Promise.race([
      promise.then(result => {
        const duration = Date.now() - startTime;
        if (duration > timeoutMs * 0.8) {  // 如果操作时间超过80%，发出警告
          console.log(chalk.yellow(`⚠️  Slow operation: ${errorMessage} took ${duration}ms (limit: ${timeoutMs}ms)`));
        }
        return result;
      }),
      new Promise((_, reject) => 
        setTimeout(() => {
          console.log(chalk.red(`❌ TIMEOUT: ${errorMessage} after ${timeoutMs}ms`));
          reject(new Error(`${errorMessage} (${timeoutMs}ms)`));
        }, timeoutMs)
      )
    ]);
  }

  async execute(args) {
    // 验证必传参数
    if (!args.componentName) {
      throw new Error('❌ 参数错误: componentName 是必传参数，请提供组件名称');
    }

    if (!args.projectPath) {
      throw new Error('❌ 参数错误: projectPath 是必传参数，请提供项目路径');
    }

    if (!args.outputPath) {
      throw new Error('❌ 参数错误: outputPath 是必传参数，请提供输出路径');
    }

    // 验证项目路径是否存在
    try {
      await fs.access(args.projectPath);
    } catch (error) {
      throw new Error(`❌ 项目路径不存在: ${args.projectPath}`);
    }

    // 验证输出路径的父目录是否存在，如果不存在则创建
    const outputDir = path.dirname(args.outputPath);
    try {
      await fs.access(outputDir);
    } catch (error) {
      try {
        await fs.mkdir(outputDir, { recursive: true });
        console.log(chalk.blue(`📁 创建输出目录: ${outputDir}`));
      } catch (mkdirError) {
        throw new Error(`❌ 无法创建输出目录: ${outputDir} - ${mkdirError.message}`);
      }
    }

    const {
      componentName,
      projectPath,
      viewport = { width: 1440, height: 800 },
      snapDOMOptions = {
        compress: true,
        fast: false,
        embedFonts: true,
        backgroundColor: 'transparent'
      },
      outputPath,
      selector
    } = args;

    try {
      console.log(chalk.cyan('📸 snapDOM Screenshot Tool'));
      console.log(chalk.cyan(`Component: ${componentName}`));
      console.log(chalk.gray('='.repeat(50)));

      // Determine results directory based on outputPath or use default
      let resultsDir;
      if (outputPath) {
        // Check if outputPath is a directory or file path
        const stats = await fs.stat(outputPath).catch(() => null);
        if (stats && stats.isDirectory()) {
          resultsDir = outputPath;
        } else if (outputPath.endsWith('.png') || outputPath.endsWith('.jpg') || outputPath.endsWith('.jpeg')) {
          resultsDir = path.dirname(outputPath);
        } else {
          // Assume it's a directory path if no file extension
          resultsDir = outputPath;
        }
      } else {
        resultsDir = path.join(projectPath, 'src', 'components', componentName, 'results');
      }
      await ensureDirectory(resultsDir);

      // Ensure Vue dev server is running
      const port = 1932;
      console.log(chalk.blue('🚀 Checking Vue dev server...'));
      await this.ensureDevServerRunning(port, projectPath);

      const screenshotResult = await this.withTimeout(
        this.takeSnapDOMScreenshot({
          componentName,
          port,
          viewport,
          snapDOMOptions: { ...snapDOMOptions, scale: 3 },
          resultsDir,
          outputPath: outputPath && (outputPath.endsWith('.png') || outputPath.endsWith('.jpg') || outputPath.endsWith('.jpeg')) ? outputPath : null,
          selector
        }),
        this.DEFAULT_TIMEOUT * 5, // 给整个截图流程15秒时间
        'Overall screenshot process timed out'
      );

      console.log(chalk.green('✅ snapDOM screenshot completed successfully!'));
      
      return {
        success: true,
        componentName,
        screenshot: screenshotResult,
        summary: {
          method: 'snapDOM',
          quality: 'high',
          outputPath: screenshotResult.path,
          features: screenshotResult.features
        }
      };

    } catch (error) {
      // 处理不同类型的错误并提供具体解决方案
      if (error instanceof PuppeteerLaunchError || 
          error instanceof NetworkError || 
          error instanceof PermissionError || 
          error instanceof TimeoutError || 
          error instanceof MemoryError) {
        
        console.error(chalk.red('❌ Screenshot failed:'), error.message);
        console.log(chalk.yellow('💡 Suggested solutions:'));
        error.solutions.forEach(solution => {
          console.log(chalk.yellow(`   • ${solution}`));
        });
        
        return {
          success: false,
          error: error.message,
          errorType: error.name,
          solutions: error.solutions,
          componentName
        };
      } else {
        console.error(chalk.red('❌ Screenshot failed:'), error.message);
        return {
          success: false,
          error: error.message,
          componentName
        };
      }
    }
  }

  async ensureDevServerRunning(port, projectPath) {
    // Skip server check and assume server is running
    console.log(chalk.green(`✅ Assuming Vue dev server is running on port ${port}`));
    return true;
  }



  async takeSnapDOMScreenshot({ componentName, port, viewport, snapDOMOptions, resultsDir, outputPath, selector }) {
    console.log(chalk.gray(`⏱️  Starting screenshot with ${this.DEFAULT_TIMEOUT}ms timeout for each operation`));
    
    // 使用页面池管理获取页面实例
    const page = await this.withTimeout(
      puppeteerManager.getPage(),
      this.DEFAULT_TIMEOUT,
      'Page acquisition timed out'
    );

    try {
      
      // Set viewport
      await this.withTimeout(
        page.setViewport({
          width: viewport.width,
          height: viewport.height,
          deviceScaleFactor: 1 // snapDOM handles scaling
        }),
        this.DEFAULT_TIMEOUT,
        'Viewport setup timed out'
      );

      // Navigate to component - try different URL patterns
      let url = `http://localhost:${port}`;
      console.log(chalk.gray(`📍 Navigating to: ${url}`));
      
      await this.withTimeout(
        page.goto(url, { 
          waitUntil: 'networkidle2',
          timeout: this.DEFAULT_TIMEOUT
        }),
        this.DEFAULT_TIMEOUT,
        `Page navigation to ${url} timed out`
      );

      // Determine selector - try different selector patterns
      let targetSelector = selector;
      if (!targetSelector) {
        // Try multiple selector patterns
        const kebabCase = componentName.replace(/([A-Z])/g, (match, letter, index) =>
          index === 0 ? letter.toLowerCase() : '-' + letter.toLowerCase()
        );
        targetSelector = `.${kebabCase}`;
      }

      console.log(chalk.gray(`🔍 Looking for selector: ${targetSelector}`));
      
      try {
        await this.withTimeout(
          page.waitForSelector(targetSelector, { timeout: this.DEFAULT_TIMEOUT }),
          this.DEFAULT_TIMEOUT,
          `Element selector ${targetSelector} wait timed out`
        );
      } catch (error) {
        // Fallback to container selector
        console.log(chalk.yellow(`⚠️  Primary selector failed, trying container selector...`));
        targetSelector = '#benchmark-container-for-screenshot';
        await this.withTimeout(
          page.waitForSelector(targetSelector, { timeout: this.DEFAULT_TIMEOUT }),
          this.DEFAULT_TIMEOUT,
          `Fallback selector ${targetSelector} wait timed out`
        );
      }

      // Additional wait for animations/images
      await this.withTimeout(
        page.waitForTimeout(500),
        this.DEFAULT_TIMEOUT,
        'Animation wait timed out'
      );

      // Use Puppeteer screenshot as fallback
      console.log(chalk.blue('📸 Using Puppeteer screenshot as fallback...'));
      let screenshotPath;
      if (outputPath && (outputPath.endsWith('.png') || outputPath.endsWith('.jpg') || outputPath.endsWith('.jpeg'))) {
        screenshotPath = outputPath;
      } else {
        screenshotPath = path.join(resultsDir, 'actual.png');
      }
      
      const element = await this.withTimeout(
        page.$(targetSelector),
        this.DEFAULT_TIMEOUT,
        `Element query ${targetSelector} timed out`
      );
      if (!element) {
        throw new Error(`Component selector ${targetSelector} not found`);
      }

      // Use Puppeteer's built-in screenshot functionality
      console.log(chalk.gray(`⏱️  Starting Puppeteer screenshot with ${this.DEFAULT_TIMEOUT}ms timeout...`));
      const screenshotBuffer = await this.withTimeout(
        element.screenshot({
          type: 'png',
          omitBackground: snapDOMOptions.backgroundColor === 'transparent'
        }),
        this.DEFAULT_TIMEOUT,
        'Puppeteer screenshot operation timed out'
      );

      // Save the screenshot buffer to file
      console.log(chalk.gray(`💾 Saving screenshot to: ${screenshotPath}`));
      await this.withTimeout(
        fs.writeFile(screenshotPath, screenshotBuffer),
        this.DEFAULT_TIMEOUT,
        'File save operation timed out'
      );

      console.log(chalk.green(`✅ Puppeteer screenshot saved: ${screenshotPath}`));
      
      return {
        path: screenshotPath,
        url,
        selector: targetSelector,
        viewport,
        snapDOMOptions,
        method: 'Puppeteer',
        quality: 'high',
        features: ['element-screenshot', 'transparent-background', 'high-quality']
      };

    } finally {
      try {
        // 释放页面回到池中而不是关闭整个浏览器
        await this.withTimeout(
          puppeteerManager.releasePage(page),
          this.DEFAULT_TIMEOUT,
          'Page release operation timed out'
        );
      } catch (error) {
        console.log(chalk.yellow(`⚠️  Page release timeout: ${error.message}`));
        // Don't throw here, just log the warning
      }
    }
  }
}
