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

      const resultsDir = path.join(projectPath, 'mcp-vue-tools', 'results', componentName);
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

      const screenshotResult = await this.takeSnapDOMScreenshot({
        componentName,
        port,
        viewport,
        snapDOMOptions: enhancedSnapDOMOptions,
        resultsDir,
        outputPath,
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
      // Check if server is already running
      const response = await fetch(`http://localhost:${port}`);
      if (response.ok) {
        console.log(chalk.green(`✅ Vue dev server already running on port ${port}`));
        return true;
      }
    } catch (error) {
      // Server not running, try to start it
      console.log(chalk.yellow(`⚠️ Vue dev server not running on port ${port}, attempting to start...`));

      try {
        // Start the server
        const mcpToolsPath = path.join(projectPath, 'mcp-vue-tools');
        const child = spawn('yarn', ['dev'], {
          cwd: mcpToolsPath,
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
    const browser = await puppeteerManager.launchBrowser();

    try {
      const page = await browser.newPage();
      
      // Set viewport
      await page.setViewport({
        width: viewport.width,
        height: viewport.height,
        deviceScaleFactor: 1 // snapDOM handles scaling
      });

      // Navigate to component
      const url = `http://localhost:${port}/component/${componentName}`;
      console.log(chalk.gray(`📍 Navigating to: ${url}`));
      
      await page.goto(url, { 
        waitUntil: 'networkidle2',
        timeout: 15000 
      });

      // Determine selector
      let targetSelector = selector;
      if (!targetSelector) {
        targetSelector = `.${componentName.replace(/([A-Z])/g, (match, letter, index) =>
          index === 0 ? letter.toLowerCase() : '-' + letter.toLowerCase()
        )}`;
      }

      console.log(chalk.gray(`🔍 Looking for selector: ${targetSelector}`));
      
      try {
        await page.waitForSelector(targetSelector, { timeout: 5000 });
      } catch (error) {
        // Fallback to container selector
        console.log(chalk.yellow(`⚠️  Primary selector failed, trying container selector...`));
        targetSelector = '#benchmark-container-for-screenshot';
        await page.waitForSelector(targetSelector, { timeout: 10000 });
      }

      // Additional wait for animations/images
      await page.waitForTimeout(500);

      // Use snapDOM for screenshot
      console.log(chalk.blue('📸 Using snapDOM for high-quality screenshot...'));
      const screenshotPath = outputPath || path.join(resultsDir, 'actual.png');
      
      const element = await page.$(targetSelector);
      if (!element) {
        throw new Error(`Component selector ${targetSelector} not found`);
      }

      // Use snapDOM to capture the element with box-shadow support
      const snapResult = await page.evaluate(async (sel, options) => {
        const element = document.querySelector(sel);
        if (!element) {
          throw new Error(`Element not found: ${sel}`);
        }

        // Import snapdom from local node_modules
        const { snapdom } = await import('/node_modules/@zumer/snapdom/dist/snapdom.mjs');

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
      }, targetSelector, snapDOMOptions);

      // Save the base64 image to file
      const base64Data = snapResult.replace(/^data:image\/png;base64,/, '');
      await fs.writeFile(screenshotPath, Buffer.from(base64Data, 'base64'));

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
      await puppeteerManager.closeBrowser();
    }
  }
}
