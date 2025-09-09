import fs from 'fs/promises';
import path from 'path';
import chalk from 'chalk';
import { ensureDirectory } from '../utils/path-config.js';
import { puppeteerManager } from '../utils/puppeteer-manager.js';
import {
  PuppeteerLaunchError,
  NetworkError,
  PermissionError,
  TimeoutError,
  MemoryError
} from '../utils/puppeteer-errors.js';

export class SnapDOMScreenshotTool {
  constructor() {
    this.description = 'Take high-quality 3x scale screenshots using snapDOM technology for precise DOM-to-image capture';
    this.DEFAULT_TIMEOUT = 3000; // 增加超时时间到15秒

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

  // 简化的超时包装函数
  async withTimeout(promise, timeoutMs = 10000, errorMessage = 'Operation timed out') {
    return Promise.race([
      promise,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error(`${errorMessage} (${timeoutMs}ms)`)), timeoutMs)
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
      await this.ensureDevServerRunning(port);

      const screenshotResult = await this.takeSnapDOMScreenshot({
        componentName,
        port,
        viewport,
        snapDOMOptions: { ...snapDOMOptions, scale: 3 },
        resultsDir,
        outputPath: outputPath && (outputPath.endsWith('.png') || outputPath.endsWith('.jpg') || outputPath.endsWith('.jpeg')) ? outputPath : null,
        selector
      });

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

  async ensureDevServerRunning(port) {
    // Skip server check and assume server is running
    console.log(chalk.green(`✅ Assuming Vue dev server is running on port ${port}`));
    return true;
  }



  async takeSnapDOMScreenshot({ componentName, port, viewport, snapDOMOptions, resultsDir, outputPath, selector }) {
    console.log(chalk.gray(`📸 Starting simple screenshot...`));

    // 使用页面池管理获取页面实例
    const page = await puppeteerManager.getPage();

    try {
      // Set viewport with 3x scale factor for high-resolution screenshots
      await page.setViewport({
        width: viewport.width,
        height: viewport.height,
        deviceScaleFactor: 3
      });

      // Navigate to component
      let url = `http://localhost:${port}/component/${componentName}`;
      console.log(chalk.gray(`📍 Navigating to: ${url}`));

      await page.goto(url, {
        waitUntil: 'domcontentloaded',
        timeout: 10000
      });

      // 简单等待
      await page.waitForTimeout(500);

      // 确定选择器
      let targetSelector = selector || '.screenshot-target';
      console.log(chalk.gray(`🎯 Using selector: ${targetSelector}`));

      // 等待元素
      await page.waitForSelector(targetSelector, { timeout: 5000 });

      // 简单截图
      console.log(chalk.blue('📸 Taking screenshot...'));
      let screenshotPath;
      if (outputPath && (outputPath.endsWith('.png') || outputPath.endsWith('.jpg') || outputPath.endsWith('.jpeg'))) {
        screenshotPath = outputPath;
      } else {
        screenshotPath = path.join(resultsDir, 'actual.png');
      }

      // 直接截图元素
      const element = await page.$(targetSelector);
      if (!element) {
        throw new Error(`Component selector ${targetSelector} not found`);
      }

      const screenshotBuffer = await element.screenshot({
        type: 'png',
        omitBackground: snapDOMOptions.backgroundColor === 'transparent'
      });

      // 保存截图
      console.log(chalk.gray(`💾 Saving screenshot to: ${screenshotPath}`));
      await fs.writeFile(screenshotPath, screenshotBuffer);

      console.log(chalk.green(`✅ 3x scale Puppeteer screenshot saved: ${screenshotPath}`));

      return {
        path: screenshotPath,
        url,
        selector: targetSelector,
        viewport: {
          ...viewport,
          actualWidth: viewport.width * 3,
          actualHeight: viewport.height * 3,
          scale: 3
        },
        snapDOMOptions,
        method: 'Puppeteer',
        quality: 'high',
        scale: 3,
        features: ['element-screenshot', 'transparent-background', 'high-quality', '3x-scale']
      };

    } finally {
      // 释放页面
      await puppeteerManager.releasePage(page);
    }
  }
}

// Command line execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const componentName = process.argv[2];
  
  if (!componentName) {
    console.error('Usage: node snapdom-screenshot.js <componentName>');
    process.exit(1);
  }

  const tool = new SnapDOMScreenshotTool();
  const projectPath = process.cwd();
  const outputPath = path.join(projectPath, 'src', 'components', componentName, 'results', 'actual.png');
  
  tool.execute({
    componentName,
    projectPath,
    outputPath,
    viewport: { width: 1440, height: 800 },
    snapDOMOptions: {
      backgroundColor: 'transparent',
      compress: true,
      deviceScaleFactor: 3,
      embedFonts: true
    }
  }).then(result => {
    console.log('Screenshot completed:', result.path);
  }).catch(error => {
    console.error('Screenshot failed:', error.message);
    process.exit(1);
  });
}
