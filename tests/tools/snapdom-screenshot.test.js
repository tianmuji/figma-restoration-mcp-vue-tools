/**
 * SnapDOMScreenshotTool 集成测试
 */

import { SnapDOMScreenshotTool } from '../../src/tools/snapdom-screenshot.js';
import { puppeteerManager } from '../../src/utils/puppeteer-manager.js';
import { PuppeteerLaunchError } from '../../src/utils/puppeteer-errors.js';

// Mock dependencies
jest.mock('../../src/utils/puppeteer-manager.js');
jest.mock('../../src/utils/path-config.js', () => ({
  ensureDirectory: jest.fn().mockResolvedValue()
}));
jest.mock('fs/promises', () => ({
  stat: jest.fn(),
  writeFile: jest.fn().mockResolvedValue()
}));
jest.mock('chalk', () => ({
  cyan: jest.fn(text => text),
  gray: jest.fn(text => text),
  blue: jest.fn(text => text),
  green: jest.fn(text => text),
  yellow: jest.fn(text => text),
  red: jest.fn(text => text)
}));

// Mock global fetch
global.fetch = jest.fn();

describe('SnapDOMScreenshotTool', () => {
  let tool;
  let mockPage;

  beforeEach(() => {
    jest.clearAllMocks();
    
    tool = new SnapDOMScreenshotTool();
    
    mockPage = {
      setViewport: jest.fn().mockResolvedValue(),
      goto: jest.fn().mockResolvedValue(),
      waitForSelector: jest.fn().mockResolvedValue(),
      waitForTimeout: jest.fn().mockResolvedValue(),
      $: jest.fn().mockResolvedValue({}),
      evaluate: jest.fn().mockResolvedValue('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==')
    };
    
    puppeteerManager.getPage.mockResolvedValue(mockPage);
    puppeteerManager.releasePage.mockResolvedValue();
  });

  describe('constructor', () => {
    test('should initialize with correct properties', () => {
      expect(tool.description).toContain('snapDOM technology');
      expect(tool.DEFAULT_TIMEOUT).toBe(30000);
      expect(tool.inputSchema).toHaveProperty('type', 'object');
      expect(tool.inputSchema.properties).toHaveProperty('componentName');
    });

    test('should not include padding option in schema', () => {
      expect(tool.inputSchema.properties.snapDOMOptions.properties).not.toHaveProperty('padding');
    });

    test('should not include figmaEffects parameter in schema', () => {
      expect(tool.inputSchema.properties).not.toHaveProperty('figmaEffects');
    });

    test('should have simplified snapDOMOptions description', () => {
      expect(tool.inputSchema.properties.snapDOMOptions.description).toBe('snapDOM capture options for high-quality screenshots');
      expect(tool.inputSchema.properties.snapDOMOptions.description).not.toContain('box-shadow');
    });
  });

  describe('withTimeout', () => {
    test('should resolve promise within timeout', async () => {
      const promise = Promise.resolve('success');
      const result = await tool.withTimeout(promise, 1000, 'Test operation');
      
      expect(result).toBe('success');
    });

    test('should reject promise that exceeds timeout', async () => {
      const promise = new Promise(resolve => setTimeout(() => resolve('late'), 2000));
      
      await expect(tool.withTimeout(promise, 1000, 'Test operation')).rejects.toThrow('Test operation (1000ms)');
    });

    test('should warn about slow operations', async () => {
      const promise = new Promise(resolve => setTimeout(() => resolve('slow'), 900));
      
      await tool.withTimeout(promise, 1000, 'Test operation');
      
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('Slow operation')
      );
    });
  });

  describe('execute', () => {
    const defaultArgs = {
      componentName: 'TestComponent',
      projectPath: '/test/project',
      port: 3000
    };

    beforeEach(() => {
      // Mock successful server check
      global.fetch.mockResolvedValue({ ok: true });
    });

    test('should execute screenshot successfully with default options', async () => {
      const result = await tool.execute(defaultArgs);
      
      expect(result.success).toBe(true);
      expect(result.componentName).toBe('TestComponent');
      expect(result.screenshot).toHaveProperty('path');
      expect(result.summary.method).toBe('snapDOM');
    });

    test('should handle custom output path', async () => {
      const args = {
        ...defaultArgs,
        outputPath: '/custom/output/screenshot.png'
      };
      
      const result = await tool.execute(args);
      
      expect(result.success).toBe(true);
      expect(result.screenshot.path).toBe('/custom/output/screenshot.png');
    });

    test('should handle custom viewport settings', async () => {
      const args = {
        ...defaultArgs,
        viewport: { width: 1920, height: 1080 }
      };
      
      await tool.execute(args);
      
      expect(mockPage.setViewport).toHaveBeenCalledWith({
        width: 1920,
        height: 1080,
        deviceScaleFactor: 1
      });
    });

    test('should handle custom snapDOM options', async () => {
      const args = {
        ...defaultArgs,
        snapDOMOptions: {
          scale: 2,
          compress: false,
          backgroundColor: 'white'
        }
      };
      
      const result = await tool.execute(args);
      
      expect(result.success).toBe(true);
      expect(mockPage.evaluate).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(String),
        expect.objectContaining({
          scale: 2,
          compress: false,
          backgroundColor: 'white'
        })
      );
    });

    test('should ignore figmaEffects parameter if provided', async () => {
      const args = {
        ...defaultArgs,
        figmaEffects: [{
          type: 'DROP_SHADOW',
          offset: { x: 2, y: 4 },
          radius: 8,
          spread: 2
        }]
      };
      
      const result = await tool.execute(args);
      
      expect(result.success).toBe(true);
      // Should work normally without any padding calculation
      expect(result.screenshot).toHaveProperty('path');
    });

    test('should use default snapDOMOptions without padding', async () => {
      const result = await tool.execute(defaultArgs);
      
      expect(result.success).toBe(true);
      expect(result.screenshot.snapDOMOptions).not.toHaveProperty('padding');
      expect(result.screenshot.snapDOMOptions).toEqual({
        scale: 3,
        compress: true,
        fast: false,
        embedFonts: true,
        backgroundColor: 'transparent'
      });
    });

    test('should handle PuppeteerLaunchError with solutions', async () => {
      const launchError = new PuppeteerLaunchError(new Error('Launch failed'));
      puppeteerManager.getPage.mockRejectedValue(launchError);
      
      const result = await tool.execute(defaultArgs);
      
      expect(result.success).toBe(false);
      expect(result.errorType).toBe('PuppeteerLaunchError');
      expect(result.solutions).toBeInstanceOf(Array);
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('Screenshot failed'),
        expect.any(String)
      );
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('Suggested solutions')
      );
    });

    test('should handle generic errors', async () => {
      const genericError = new Error('Generic failure');
      puppeteerManager.getPage.mockRejectedValue(genericError);
      
      const result = await tool.execute(defaultArgs);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Generic failure');
      expect(result).not.toHaveProperty('solutions');
    });

    test('should release page even on error', async () => {
      puppeteerManager.getPage.mockResolvedValue(mockPage);
      mockPage.setViewport.mockRejectedValue(new Error('Viewport error'));
      
      await tool.execute(defaultArgs);
      
      expect(puppeteerManager.releasePage).toHaveBeenCalledWith(mockPage);
    });
  });

  describe('ensureDevServerRunning', () => {
    test('should return true if server is already running', async () => {
      global.fetch.mockResolvedValue({ ok: true });
      
      const result = await tool.ensureDevServerRunning(3000, '/test/project');
      
      expect(result).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith('http://localhost:3000');
    });

    test('should throw error if server check times out', async () => {
      global.fetch.mockRejectedValue(new Error('timeout'));
      
      await expect(tool.ensureDevServerRunning(3000, '/test/project')).rejects.toThrow();
    });
  });



  describe('takeSnapDOMScreenshot', () => {
    const screenshotArgs = {
      componentName: 'TestComponent',
      port: 3000,
      viewport: { width: 1440, height: 800 },
      snapDOMOptions: { scale: 3 },
      resultsDir: '/test/results',
      outputPath: null,
      selector: null
    };

    test('should navigate to correct URL', async () => {
      await tool.takeSnapDOMScreenshot(screenshotArgs);
      
      expect(mockPage.goto).toHaveBeenCalledWith(
        'http://localhost:3000/component/TestComponent',
        expect.objectContaining({
          waitUntil: 'networkidle2'
        })
      );
    });

    test('should use custom selector if provided', async () => {
      const args = { ...screenshotArgs, selector: '.custom-selector' };
      
      await tool.takeSnapDOMScreenshot(args);
      
      expect(mockPage.waitForSelector).toHaveBeenCalledWith(
        '.custom-selector',
        expect.any(Object)
      );
    });

    test('should fallback to container selector if primary fails', async () => {
      mockPage.waitForSelector
        .mockRejectedValueOnce(new Error('Selector not found'))
        .mockResolvedValueOnce();
      
      await tool.takeSnapDOMScreenshot(screenshotArgs);
      
      expect(mockPage.waitForSelector).toHaveBeenCalledWith(
        '#benchmark-container-for-screenshot',
        expect.any(Object)
      );
    });

    test('should save screenshot to correct path', async () => {
      const fs = await import('fs/promises');
      
      await tool.takeSnapDOMScreenshot(screenshotArgs);
      
      expect(fs.writeFile).toHaveBeenCalledWith(
        '/test/results/actual.png',
        expect.any(Buffer)
      );
    });

    test('should return screenshot metadata', async () => {
      const result = await tool.takeSnapDOMScreenshot(screenshotArgs);
      
      expect(result).toEqual({
        path: '/test/results/actual.png',
        url: 'http://localhost:3000/component/TestComponent',
        selector: '.test-component',
        viewport: { width: 1440, height: 800 },
        snapDOMOptions: { scale: 3 },
        method: 'snapDOM',
        snapDOMVersion: '1.9.5',
        quality: 'high',
        features: expect.arrayContaining(['DOM-to-image', 'font-embedding'])
      });
    });
  });
});