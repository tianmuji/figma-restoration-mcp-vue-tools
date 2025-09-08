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
      await this.ensureDevServerRunning(port);

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
        8000, // 静态页面8秒完成截图
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

  async ensureDevServerRunning(port) {
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

      // Set viewport with 3x scale factor for high-resolution screenshots
      await this.withTimeout(
        page.setViewport({
          width: viewport.width,
          height: viewport.height,
          deviceScaleFactor: 3 // 3x scale for high-resolution screenshots
        }),
        this.DEFAULT_TIMEOUT,
        'Viewport setup timed out'
      );

      // Navigate to component - use the correct component route
      let url = `http://localhost:${port}/component/${componentName}`;
      console.log(chalk.gray(`📍 Navigating to: ${url}`));

      await this.withTimeout(
        page.goto(url, {
          waitUntil: 'domcontentloaded', // 静态页面DOM加载完成即可
          timeout: this.DEFAULT_TIMEOUT
        }),
        this.DEFAULT_TIMEOUT,
        `Page navigation to ${url} timed out`
      );

      // 等待 Vue 应用加载 (静态页面快速加载)
      console.log(chalk.gray('⏳ Waiting for Vue app to load...'));
      await this.withTimeout(
        page.waitForTimeout(300),
        1000,
        'Vue app loading wait timed out'
      );

      // Determine selector - try different selector patterns
            let targetSelector = selector;
      if (!targetSelector) {
        // 使用固定的截图目标容器
        targetSelector = '.screenshot-target';
      }

      console.log(chalk.gray(`🔍 Looking for selector: ${targetSelector}`));
      
      // 智能选择器：检测是否有子元素包含box-shadow，用于精确clip计算
      if (targetSelector === '.screenshot-target') {
        const hasBoxShadowElement = await page.evaluate(() => {
          const container = document.querySelector('.screenshot-target');
          if (!container) return null;
          
          // 查找所有子元素，寻找有box-shadow的
          const allElements = container.querySelectorAll('*');
          for (let element of allElements) {
            const style = window.getComputedStyle(element);
            if (style.boxShadow && style.boxShadow !== 'none') {
              // 找到有box-shadow的元素，返回其选择器信息
              return {
                tagName: element.tagName.toLowerCase(),
                className: element.className,
                boxShadow: style.boxShadow
              };
            }
          }
          return null;
        });
        
        if (hasBoxShadowElement) {
          // 如果找到有box-shadow的元素，更新选择器用于精确截图
          if (hasBoxShadowElement.className) {
            const firstClass = hasBoxShadowElement.className.split(' ')[0];
            targetSelector = `.screenshot-target .${firstClass}`;
            console.log(chalk.green(`🎯 Found element with box-shadow: .${firstClass}`));
            console.log(chalk.green(`   Updated selector: ${targetSelector}`));
            console.log(chalk.green(`   Box-shadow preview: ${hasBoxShadowElement.boxShadow.substring(0, 100)}...`));
          }
        } else {
          console.log(chalk.yellow(`⚠️  No box-shadow detected, using container: ${targetSelector}`));
        }
      }

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

      // Additional wait for animations/images (静态组件快速)
      await this.withTimeout(
        page.waitForTimeout(100),
        500,
        'Animation wait timed out'
      );

      // Use Puppeteer screenshot with 3x scaling
      console.log(chalk.blue('📸 Taking 3x scale screenshot with Puppeteer...'));
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

      // Calculate element bounds including box-shadow with enhanced parsing
      console.log(chalk.gray('📐 Calculating element bounds with enhanced box-shadow detection...'));
      const elementBounds = await this.withTimeout(
        page.evaluate((selector) => {
          // Wait for element to be properly rendered
          return new Promise((resolve) => {
            const checkElement = () => {
              const element = document.querySelector(selector);
              if (!element) {
                console.log(`❌ Element not found: ${selector}`);
                return null;
              }
              
              const rect = element.getBoundingClientRect();
              
              // Validate that rect has valid dimensions
              if (!rect || rect.width === 0 || rect.height === 0 || 
                  isNaN(rect.x) || isNaN(rect.y) || isNaN(rect.width) || isNaN(rect.height)) {
                console.log(`⚠️ Element found but invalid bounds:`, {
                  x: rect.x, y: rect.y, width: rect.width, height: rect.height
                });
                return null;
              }
              
              const computedStyle = window.getComputedStyle(element);
              const boxShadow = computedStyle.boxShadow;
              
              console.log(`✅ Element validated: ${selector}`, {
                x: rect.x, y: rect.y, width: rect.width, height: rect.height,
                boxShadow: boxShadow
              });
              
              return { rect, boxShadow, computedStyle };
            };
            
            // Try immediate check first
            const result = checkElement();
            if (result) {
              const { rect, boxShadow, computedStyle } = result;
              resolve(processElementBounds(rect, boxShadow));
              return;
            }
            
            // If immediate check failed, retry with timeout (快速重试)
            let attempts = 0;
            const maxAttempts = 5;
            const retryInterval = 50;
            
            const retryCheck = () => {
              attempts++;
              const result = checkElement();
              if (result) {
                const { rect, boxShadow, computedStyle } = result;
                resolve(processElementBounds(rect, boxShadow));
              } else if (attempts < maxAttempts) {
                setTimeout(retryCheck, retryInterval);
              } else {
                console.log(`❌ Failed to validate element after ${maxAttempts} attempts`);
                resolve(null);
              }
            };
            
            setTimeout(retryCheck, retryInterval);
          });
          
          function processElementBounds(rect, boxShadow) {
            console.log('=' .repeat(60));
            console.log('🔍 RAW BOX-SHADOW VALUE:');
            console.log(`   "${boxShadow}"`);
            console.log('📏 RAW ELEMENT RECT:');
            console.log(`   x: ${rect.x}, y: ${rect.y}, width: ${rect.width}, height: ${rect.height}`);
            console.log('🧮 RECT VALIDATION:');
            console.log(`   x isNaN: ${isNaN(rect.x)}, y isNaN: ${isNaN(rect.y)}`);
            console.log(`   width isNaN: ${isNaN(rect.width)}, height isNaN: ${isNaN(rect.height)}`);
            console.log('=' .repeat(60));
          
          // 按照用户要求：根据上下左右的box-shadow取最大值来调整clip
          let maxShadowExtent = 0;
          let shadowDetails = [];
          
          if (boxShadow && boxShadow !== 'none') {
            console.log('🎨 开始解析复合阴影...');
            
            // 分割多个阴影，保持括号内容完整
            const shadows = boxShadow.split(/,\s*(?![^()]*\))/);
            console.log(`📋 发现 ${shadows.length} 个阴影:`, shadows);
            
            shadows.forEach((shadow, index) => {
              const trimmedShadow = shadow.trim();
              console.log(`🔍 解析阴影 ${index + 1}: "${trimmedShadow}"`);
              
              // 匹配两种格式：
              // 1. color offsetX offsetY blurRadius [spreadRadius]
              // 2. offsetX offsetY blurRadius [spreadRadius] color
              let match = trimmedShadow.match(/rgba?\([^)]+\)\s+(-?\d+(?:\.\d+)?)px\s+(-?\d+(?:\.\d+)?)px\s+(-?\d+(?:\.\d+)?)px(?:\s+(-?\d+(?:\.\d+)?)px)?/);
              if (!match) {
                // 如果没匹配到颜色在前的格式，尝试颜色在后的格式
                match = trimmedShadow.match(/^(?:inset\s+)?(-?\d+(?:\.\d+)?)px\s+(-?\d+(?:\.\d+)?)px\s+(-?\d+(?:\.\d+)?)px(?:\s+(-?\d+(?:\.\d+)?)px)?/);
              }
              
              if (match) {
                const x = parseFloat(match[1]) || 0;
                const y = parseFloat(match[2]) || 0;
                const blur = parseFloat(match[3]) || 0;
                const spread = parseFloat(match[4]) || 0;
                
                console.log(`   📊 解析结果: offset(${x}, ${y}) blur(${blur}) spread(${spread})`);
                
                // 只处理外阴影
                if (!trimmedShadow.includes('inset')) {
                  // 计算阴影的最大扩散范围：取blur和offset的最大值，再加上spread
                  const shadowExtent = Math.max(blur, Math.max(Math.abs(x), Math.abs(y))) + Math.abs(spread);
                  maxShadowExtent = Math.max(maxShadowExtent, shadowExtent);
                  
                  shadowDetails.push({
                    index: index + 1,
                    x, y, blur, spread,
                    extent: shadowExtent
                  });
                  
                  console.log(`   ✅ 阴影 ${index + 1} 扩散范围: ${shadowExtent}px`);
                } else {
                  console.log(`   ⏭️  跳过内阴影: ${index + 1}`);
                }
              } else {
                console.log(`   ❌ 无法解析阴影 ${index + 1}: "${trimmedShadow}"`);
              }
            });
          } else {
            console.log('ℹ️  未检测到box-shadow');
          }
          
          console.log(`🎯 最大阴影扩散范围: ${maxShadowExtent}px`);
          
          // 使用最大扩散范围调整clip（四个方向都用同一个最大值）
          const clipPadding = maxShadowExtent;
          
          const finalClipX = Math.max(0, rect.x - clipPadding);
          const finalClipY = Math.max(0, rect.y - clipPadding);
          const finalClipWidth = rect.width + (clipPadding * 2);
          const finalClipHeight = rect.height + (clipPadding * 2);
          
          console.log(`📐 Clip调整: padding=${clipPadding}px (最大扩散=${maxShadowExtent}px + 安全边距=10px)`);
          console.log(`📍 最终Clip区域: x=${finalClipX}, y=${finalClipY}, w=${finalClipWidth}, h=${finalClipHeight}`);
          
            return {
              x: finalClipX,
              y: finalClipY,
              width: finalClipWidth,
              height: finalClipHeight,
              elementRect: rect,
              maxShadowExtent: maxShadowExtent,
              clipPadding: clipPadding,
              shadowDetails: shadowDetails,
              originalBoxShadow: boxShadow,
              // 添加调试信息
              debugInfo: {
                rawBoxShadow: boxShadow,
                rectIsValid: !isNaN(rect.x) && !isNaN(rect.y) && !isNaN(rect.width) && !isNaN(rect.height),
                rectValues: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
                shadowDetected: boxShadow && boxShadow !== 'none',
                shadowCount: shadowDetails.length
              }
            };
          }
        }, targetSelector),
        this.DEFAULT_TIMEOUT,
        'Element bounds calculation timed out'
      );

      if (!elementBounds) {
        throw new Error(`Could not calculate bounds for element ${targetSelector}`);
      }

      console.log(chalk.gray(`📏 Element bounds: ${Math.round(elementBounds.width)}x${Math.round(elementBounds.height)}, max shadow extent: ${elementBounds.maxShadowExtent}px`));

      // 输出详细调试信息
      if (elementBounds.debugInfo) {
        console.log(chalk.cyan('🔍 DETAILED DEBUG INFO:'));
        console.log(chalk.cyan(`   Raw Box-Shadow: "${elementBounds.debugInfo.rawBoxShadow}"`));
        console.log(chalk.cyan(`   Rect Valid: ${elementBounds.debugInfo.rectIsValid}`));
        console.log(chalk.cyan(`   Rect Values: x=${elementBounds.debugInfo.rectValues.x}, y=${elementBounds.debugInfo.rectValues.y}, w=${elementBounds.debugInfo.rectValues.width}, h=${elementBounds.debugInfo.rectValues.height}`));
        console.log(chalk.cyan(`   Shadow Detected: ${elementBounds.debugInfo.shadowDetected}`));
        console.log(chalk.cyan(`   Shadow Count: ${elementBounds.debugInfo.shadowCount}`));
      }

      // Enhanced detailed clip debug info
      const clipArea = {
        x: elementBounds.x,
        y: elementBounds.y,
        width: elementBounds.width,
        height: elementBounds.height
      };
      
      console.log(chalk.blue('🎯 ENHANCED CLIP AREA DEBUG INFO:'));
      console.log(chalk.blue(`   📍 Final Position: x=${Math.round(clipArea.x)}, y=${Math.round(clipArea.y)}`));
      console.log(chalk.blue(`   📐 Final Size: width=${Math.round(clipArea.width)}, height=${Math.round(clipArea.height)}`));
      console.log(chalk.blue(`   🔍 Element Rect: x=${Math.round(elementBounds.elementRect.x)}, y=${Math.round(elementBounds.elementRect.y)}, w=${Math.round(elementBounds.elementRect.width)}, h=${Math.round(elementBounds.elementRect.height)}`));
      console.log(chalk.blue(`   🎯 Max Shadow Extent: ${elementBounds.maxShadowExtent}px`));
      console.log(chalk.blue(`   📏 Clip Padding: ${elementBounds.clipPadding}px`));
      
      if (elementBounds.originalBoxShadow && elementBounds.originalBoxShadow !== 'none') {
        console.log(chalk.magenta('🌟 BOX-SHADOW ANALYSIS:'));
        console.log(chalk.magenta(`   🎨 Original: ${elementBounds.originalBoxShadow}`));
        if (elementBounds.shadowDetails && elementBounds.shadowDetails.length > 0) {
          elementBounds.shadowDetails.forEach(shadow => {
            console.log(chalk.magenta(`   🔸 Shadow ${shadow.index}: offset(${shadow.x},${shadow.y}) blur(${shadow.blur}) spread(${shadow.spread}) → extent(${shadow.extent}px)`));
          });
        }
      } else {
        console.log(chalk.gray('   ℹ️  No box-shadow detected, using element bounds only'));
      }

      // Use page screenshot with calculated clip area to include shadows
      console.log(chalk.gray(`⏱️  Starting 3x scale screenshot with shadow inclusion...`));
      const screenshotBuffer = await this.withTimeout(
        page.screenshot({
          type: 'png',
          omitBackground: snapDOMOptions.backgroundColor === 'transparent',
          clip: clipArea
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
