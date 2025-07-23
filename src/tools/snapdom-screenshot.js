import fs from 'fs/promises';
import path from 'path';
import chalk from 'chalk';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import {
  ensureDirectory
} from '../utils/path-config.js';
import { puppeteerManager } from '../utils/puppeteer-manager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class SnapDOMScreenshotTool {
  constructor() {
    this.description = 'Take high-quality screenshots using snapDOM technology for precise DOM-to-image capture';
    this.DEFAULT_TIMEOUT = 3000; // 3秒超时
    
    this.inputSchema = {
      type: 'object',
      properties: {
        componentName: {
          type: 'string',
          description: 'Name of the component to screenshot'
        },
        projectPath: {
          type: 'string',
          default: '/Users/yujie_wu/Documents/work/camscanner-cloud-vue3',
          description: 'Path to the Vue project'
        },
        port: {
          type: 'number',
          default: 83,
          description: 'Port where Vue dev server is running'
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
            scale: { type: 'number', default: 3 },
            compress: { type: 'boolean', default: true },
            fast: { type: 'boolean', default: false },
            embedFonts: { type: 'boolean', default: true },
            backgroundColor: { type: 'string', default: 'transparent' },
            width: { type: 'number', description: 'Fixed width for output' },
            height: { type: 'number', description: 'Fixed height for output' },
            padding: { type: 'number', default: 0, description: 'Padding around element to capture shadows and effects' }
          },
          description: 'snapDOM capture options for high-quality screenshots with box-shadow support'
        },
        outputPath: {
          type: 'string',
          description: 'Custom output path for screenshot (optional)'
        },
        selector: {
          type: 'string',
          description: 'Custom CSS selector to screenshot (optional)'
        },
        figmaEffects: {
          type: 'array',
          description: 'Figma effects data for smart shadow padding calculation (optional)'
        }
      },
      required: ['componentName']
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
    const {
      componentName,
      projectPath = '/Users/yujie_wu/Documents/work/camscanner-cloud-vue3',
      port = 83,
      viewport = { width: 1440, height: 800 },
      snapDOMOptions = {
        scale: 3,
        compress: true,
        fast: false,
        embedFonts: true,
        backgroundColor: 'transparent',
        padding: 0
      },
      outputPath,
      selector,
      figmaEffects // Optional Figma effects data for smart padding calculation
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
      console.log(chalk.blue('🚀 Checking Vue dev server...'));
      await this.ensureDevServerRunning(port, projectPath);

      // Calculate smart padding if Figma effects are provided
      let enhancedSnapDOMOptions = { ...snapDOMOptions };
      if (figmaEffects && snapDOMOptions.padding === 0) {
        const calculatedPadding = this.calculateShadowPaddingFromFigma(figmaEffects);
        if (calculatedPadding > 0) {
          enhancedSnapDOMOptions.padding = calculatedPadding;
          console.log(chalk.yellow(`[Smart Padding] Calculated from Figma effects: ${calculatedPadding}px`));
        }
      }

      const screenshotResult = await this.withTimeout(
        this.takeSnapDOMScreenshot({
          componentName,
          port,
          viewport,
          snapDOMOptions: enhancedSnapDOMOptions,
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
      console.error(chalk.red('❌ Screenshot failed:'), error.message);
      return {
        success: false,
        error: error.message,
        componentName
      };
    }
  }

  async ensureDevServerRunning(port, projectPath) {
    try {
      // Check if server is already running with timeout
      console.log(chalk.gray(`🔍 Checking server on port ${port}...`));
      const response = await this.withTimeout(
        fetch(`http://localhost:${port}`),
        this.DEFAULT_TIMEOUT,
        `Server check on port ${port} timed out`
      );
      if (response.ok) {
        console.log(chalk.green(`✅ Vue dev server already running on port ${port}`));
        return true;
      }
    } catch (error) {
      if (error.message.includes('timed out')) {
        console.log(chalk.red(`❌ Server check timed out after ${this.DEFAULT_TIMEOUT}ms`));
        throw error;
      }
      // Server not running, try to start it
      console.log(chalk.yellow(`⚠️ Vue dev server not running on port ${port}, attempting to start...`));

      try {
        // Start the server
        const child = spawn('yarn', ['dev'], {
          cwd: projectPath,
          detached: true,
          stdio: 'ignore'
        });

        child.unref();

        // Wait for server to start
        let attempts = 0;
        const maxAttempts = 30;

        while (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          try {
            const serverResponse = await fetch(`http://localhost:${port}`);
            if (serverResponse.ok) {
              console.log(chalk.green(`✅ Vue dev server started successfully on port ${port}`));
              return true;
            }
          } catch (e) {
            // Continue waiting
          }
          attempts++;
        }

        throw new Error('Server failed to start within timeout period');
      } catch (startError) {
        throw new Error(`Failed to start Vue dev server: ${startError.message}`);
      }
    }
  }

  // Helper function to calculate padding from Figma shadow data
  calculateShadowPaddingFromFigma(figmaEffects) {
    if (!figmaEffects || !Array.isArray(figmaEffects)) return 0;

    let maxPadding = 0;

    for (const effect of figmaEffects) {
      if (effect.type === 'DROP_SHADOW' || effect.type === 'INNER_SHADOW') {
        const offsetX = Math.abs(effect.offset?.x || 0);
        const offsetY = Math.abs(effect.offset?.y || 0);
        const blurRadius = effect.radius || 0;
        const spreadRadius = effect.spread || 0;

        // Calculate required padding: max(blur + spread + offset)
        const requiredPadding = Math.max(
          offsetX + blurRadius + spreadRadius,
          offsetY + blurRadius + spreadRadius
        );

        maxPadding = Math.max(maxPadding, requiredPadding);
      }
    }

    return maxPadding > 0 ? Math.ceil(maxPadding) + 5 : 0; // Add 5px buffer and round up
  }

  async takeSnapDOMScreenshot({ componentName, port, viewport, snapDOMOptions, resultsDir, outputPath, selector }) {
    console.log(chalk.gray(`⏱️  Starting screenshot with ${this.DEFAULT_TIMEOUT}ms timeout for each operation`));
    
    const browser = await this.withTimeout(
      puppeteerManager.launchBrowser(),
      this.DEFAULT_TIMEOUT,
      'Browser launch timed out'
    );

    try {
      const page = await this.withTimeout(
        browser.newPage(),
        this.DEFAULT_TIMEOUT,
        'New page creation timed out'
      );
      
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

      // Navigate to component
      const url = `http://localhost:${port}/component/${componentName}`;
      console.log(chalk.gray(`📍 Navigating to: ${url}`));
      
      await this.withTimeout(
        page.goto(url, { 
          waitUntil: 'networkidle2',
          timeout: this.DEFAULT_TIMEOUT
        }),
        this.DEFAULT_TIMEOUT,
        `Page navigation to ${url} timed out`
      );

      // Determine selector
      let targetSelector = selector;
      if (!targetSelector) {
        targetSelector = `.${componentName.replace(/([A-Z])/g, (match, letter, index) =>
          index === 0 ? letter.toLowerCase() : '-' + letter.toLowerCase()
        )}`;
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

      // Use snapDOM for screenshot
      console.log(chalk.blue('📸 Using snapDOM for high-quality screenshot...'));
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

      // Use snapDOM to capture the element with box-shadow support
      console.log(chalk.gray(`⏱️  Starting snapDOM capture with ${this.DEFAULT_TIMEOUT}ms timeout...`));
      const snapResult = await this.withTimeout(
        page.evaluate(async (sel, options) => {
        const element = document.querySelector(sel);
        if (!element) {
          throw new Error(`Element not found: ${sel}`);
        }

        // Import snapdom from CDN as fallback
        let snapdom;
        try {
          const module = await import('/@fs/Users/yujie_wu/Documents/study/11111/figma-restoration-mcp-vue-tools/node_modules/@zumer/snapdom/dist/snapdom.mjs');
          snapdom = module.snapdom;
        } catch (error) {
          // Fallback to CDN if local import fails
          const module = await import('https://unpkg.com/@zumer/snapdom@1.9.5/dist/snapdom.mjs');
          snapdom = module.snapdom;
        }

        // Smart shadow detection and padding calculation
        let targetElement = element;
        let calculatedPadding = options.padding;

        // If padding is 0, check if element has box-shadow and calculate needed padding
        if (options.padding === 0) {
          const computedStyle = window.getComputedStyle(element);
          const boxShadow = computedStyle.getPropertyValue('box-shadow');

          if (boxShadow && boxShadow !== 'none') {
            // Calculate padding directly in browser context
            const shadows = boxShadow.split(',');
            let maxPadding = 0;

            for (const shadow of shadows) {
              const match = shadow.trim().match(/(\d+)px\s+(\d+)px\s+(\d+)px\s+(\d+)px/);
              if (match) {
                const offsetX = parseInt(match[1]);
                const offsetY = parseInt(match[2]);
                const blurRadius = parseInt(match[3]);
                const spreadRadius = parseInt(match[4]);

                const requiredPadding = Math.max(
                  Math.abs(offsetX) + blurRadius + spreadRadius,
                  Math.abs(offsetY) + blurRadius + spreadRadius
                );

                maxPadding = Math.max(maxPadding, requiredPadding);
              }
            }

            if (maxPadding > 0) {
              calculatedPadding = maxPadding + 5; // Add 5px buffer
              console.log(`[SnapDOM] Detected box-shadow: ${boxShadow}`);
              console.log(`[SnapDOM] Calculated padding: ${calculatedPadding}px`);
            }
          }
        }

        // Create wrapper if padding is needed
        if (calculatedPadding > 0) {
          const wrapper = document.createElement('div');
          wrapper.style.padding = `${calculatedPadding}px`;
          wrapper.style.display = 'inline-block';
          wrapper.style.backgroundColor = 'transparent';

          // Clone the element to avoid modifying the original
          const clonedElement = element.cloneNode(true);
          wrapper.appendChild(clonedElement);

          // Temporarily insert wrapper into DOM for accurate rendering
          element.parentNode.insertBefore(wrapper, element);
          element.style.display = 'none';

          targetElement = wrapper;
        }

        // Capture with snapDOM using only supported options
        const result = await snapdom(targetElement, {
          scale: options.scale,
          compress: options.compress,
          fast: options.fast,
          embedFonts: options.embedFonts,
          backgroundColor: options.backgroundColor,
          width: options.width,
          height: options.height
        });

        // Clean up wrapper if created
        if (calculatedPadding > 0 && targetElement !== element) {
          targetElement.remove();
          element.style.display = '';
        }

        // Convert to PNG blob
        const blob = await result.toBlob({ type: 'png' });

        // Convert blob to base64
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.readAsDataURL(blob);
        });
      }, targetSelector, snapDOMOptions),
      this.DEFAULT_TIMEOUT,
      'SnapDOM capture operation timed out'
    );

      // Save the base64 image to file
      console.log(chalk.gray(`💾 Saving screenshot to: ${screenshotPath}`));
      const base64Data = snapResult.replace(/^data:image\/png;base64,/, '');
      await this.withTimeout(
        fs.writeFile(screenshotPath, Buffer.from(base64Data, 'base64')),
        this.DEFAULT_TIMEOUT,
        'File save operation timed out'
      );

      console.log(chalk.green(`✅ snapDOM screenshot saved: ${screenshotPath}`));
      
      return {
        path: screenshotPath,
        url,
        selector: targetSelector,
        viewport,
        snapDOMOptions,
        method: 'snapDOM',
        snapDOMVersion: '1.9.5',
        quality: 'high',
        features: ['DOM-to-image', 'font-embedding', 'pseudo-elements', 'shadow-DOM', 'smart-shadow-detection', 'high-performance', '3x-scale']
      };

    } finally {
      try {
        await this.withTimeout(
          puppeteerManager.closeBrowser(),
          this.DEFAULT_TIMEOUT,
          'Browser close operation timed out'
        );
      } catch (error) {
        console.log(chalk.yellow(`⚠️  Browser close timeout: ${error.message}`));
        // Don't throw here, just log the warning
      }
    }
  }
}
