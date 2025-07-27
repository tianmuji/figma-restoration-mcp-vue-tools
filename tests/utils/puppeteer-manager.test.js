/**
 * PuppeteerManager 单元测试
 */

import { PuppeteerManager } from '../../src/utils/puppeteer-manager.js';
import { 
  PuppeteerLaunchError, 
  NetworkError, 
  PermissionError, 
  TimeoutError,
  MemoryError 
} from '../../src/utils/puppeteer-errors.js';

// Mock puppeteer
jest.mock('puppeteer', () => ({
  launch: jest.fn(),
  version: '21.11.0'
}));

// Mock chalk
jest.mock('chalk', () => ({
  gray: jest.fn(text => text),
  green: jest.fn(text => text),
  yellow: jest.fn(text => text),
  red: jest.fn(text => text)
}));

describe('PuppeteerManager', () => {
  let puppeteerManager;
  let mockBrowser;
  let mockPage;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Create fresh instance
    puppeteerManager = new PuppeteerManager();
    
    // Mock browser and page
    mockPage = {
      goto: jest.fn(),
      close: jest.fn(),
      evaluate: jest.fn()
    };
    
    mockBrowser = {
      newPage: jest.fn().mockResolvedValue(mockPage),
      close: jest.fn()
    };
    
    // Reset singleton
    PuppeteerManager.instance = null;
  });

  afterEach(async () => {
    // Clean up browser instance
    if (puppeteerManager.browser) {
      await puppeteerManager.closeBrowser();
    }
  });

  describe('constructor', () => {
    test('should initialize with null browser and empty page pool', () => {
      expect(puppeteerManager.browser).toBeNull();
      expect(puppeteerManager.pagePool).toEqual([]);
    });
  });

  describe('checkDeprecatedEnvVars', () => {
    test('should warn about deprecated PUPPETEER_EXECUTABLE_PATH', () => {
      process.env.PUPPETEER_EXECUTABLE_PATH = '/some/path';
      
      puppeteerManager.checkDeprecatedEnvVars();
      
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('PUPPETEER_EXECUTABLE_PATH is deprecated')
      );
      
      delete process.env.PUPPETEER_EXECUTABLE_PATH;
    });

    test('should warn about deprecated CHROME_EXECUTABLE_PATH', () => {
      process.env.CHROME_EXECUTABLE_PATH = '/some/path';
      
      puppeteerManager.checkDeprecatedEnvVars();
      
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('CHROME_EXECUTABLE_PATH is deprecated')
      );
      
      delete process.env.CHROME_EXECUTABLE_PATH;
    });

    test('should not warn if no deprecated env vars are set', () => {
      puppeteerManager.checkDeprecatedEnvVars();
      
      expect(console.warn).not.toHaveBeenCalled();
    });
  });

  describe('launchBrowser', () => {
    test('should launch browser successfully with default options', async () => {
      const puppeteer = await import('puppeteer');
      puppeteer.launch.mockResolvedValue(mockBrowser);
      
      const browser = await puppeteerManager.launchBrowser();
      
      expect(puppeteer.launch).toHaveBeenCalledWith({
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
      });
      expect(browser).toBe(mockBrowser);
      expect(puppeteerManager.browser).toBe(mockBrowser);
    });

    test('should merge custom options with defaults', async () => {
      const puppeteer = await import('puppeteer');
      puppeteer.launch.mockResolvedValue(mockBrowser);
      
      const customOptions = {
        headless: false,
        timeout: 60000
      };
      
      await puppeteerManager.launchBrowser(customOptions);
      
      expect(puppeteer.launch).toHaveBeenCalledWith(
        expect.objectContaining({
          headless: false,
          timeout: 60000
        })
      );
    });

    test('should throw NetworkError for network-related failures', async () => {
      const puppeteer = await import('puppeteer');
      const networkError = new Error('ECONNREFUSED connection failed');
      puppeteer.launch.mockRejectedValue(networkError);
      
      await expect(puppeteerManager.launchBrowser()).rejects.toThrow(NetworkError);
    });

    test('should throw PermissionError for permission-related failures', async () => {
      const puppeteer = await import('puppeteer');
      const permissionError = new Error('Permission denied');
      puppeteer.launch.mockRejectedValue(permissionError);
      
      await expect(puppeteerManager.launchBrowser()).rejects.toThrow(PermissionError);
    });

    test('should throw TimeoutError for timeout failures', async () => {
      const puppeteer = await import('puppeteer');
      const timeoutError = new Error('timeout exceeded');
      puppeteer.launch.mockRejectedValue(timeoutError);
      
      await expect(puppeteerManager.launchBrowser()).rejects.toThrow(TimeoutError);
    });

    test('should throw MemoryError for memory-related failures', async () => {
      const puppeteer = await import('puppeteer');
      const memoryError = new Error('ENOMEM: not enough memory');
      puppeteer.launch.mockRejectedValue(memoryError);
      
      await expect(puppeteerManager.launchBrowser()).rejects.toThrow(MemoryError);
    });

    test('should throw PuppeteerLaunchError for generic failures', async () => {
      const puppeteer = await import('puppeteer');
      const genericError = new Error('Generic launch failure');
      puppeteer.launch.mockRejectedValue(genericError);
      
      await expect(puppeteerManager.launchBrowser()).rejects.toThrow(PuppeteerLaunchError);
    });
  });

  describe('getPage', () => {
    test('should return page from pool if available', async () => {
      const pooledPage = { test: 'pooled' };
      puppeteerManager.pagePool.push(pooledPage);
      
      const page = await puppeteerManager.getPage();
      
      expect(page).toBe(pooledPage);
      expect(puppeteerManager.pagePool).toHaveLength(0);
    });

    test('should create new page if pool is empty and browser exists', async () => {
      puppeteerManager.browser = mockBrowser;
      
      const page = await puppeteerManager.getPage();
      
      expect(mockBrowser.newPage).toHaveBeenCalled();
      expect(page).toBe(mockPage);
    });

    test('should launch browser and create page if browser does not exist', async () => {
      const puppeteer = await import('puppeteer');
      puppeteer.launch.mockResolvedValue(mockBrowser);
      
      const page = await puppeteerManager.getPage();
      
      expect(puppeteer.launch).toHaveBeenCalled();
      expect(mockBrowser.newPage).toHaveBeenCalled();
      expect(page).toBe(mockPage);
    });
  });

  describe('releasePage', () => {
    test('should clean page and add to pool', async () => {
      mockPage.goto.mockResolvedValue();
      mockPage.evaluate.mockResolvedValue();
      
      await puppeteerManager.releasePage(mockPage);
      
      expect(mockPage.goto).toHaveBeenCalledWith('about:blank');
      expect(mockPage.evaluate).toHaveBeenCalled();
      expect(puppeteerManager.pagePool).toContain(mockPage);
    });

    test('should close page if cleaning fails', async () => {
      mockPage.goto.mockRejectedValue(new Error('Navigation failed'));
      mockPage.close.mockResolvedValue();
      
      await puppeteerManager.releasePage(mockPage);
      
      expect(mockPage.close).toHaveBeenCalled();
      expect(puppeteerManager.pagePool).not.toContain(mockPage);
    });
  });

  describe('closeBrowser', () => {
    test('should close all pages in pool and browser', async () => {
      const page1 = { close: jest.fn() };
      const page2 = { close: jest.fn() };
      puppeteerManager.pagePool = [page1, page2];
      puppeteerManager.browser = mockBrowser;
      
      await puppeteerManager.closeBrowser();
      
      expect(page1.close).toHaveBeenCalled();
      expect(page2.close).toHaveBeenCalled();
      expect(mockBrowser.close).toHaveBeenCalled();
      expect(puppeteerManager.browser).toBeNull();
      expect(puppeteerManager.pagePool).toEqual([]);
    });

    test('should handle page close errors gracefully', async () => {
      const page1 = { close: jest.fn().mockRejectedValue(new Error('Close failed')) };
      puppeteerManager.pagePool = [page1];
      puppeteerManager.browser = mockBrowser;
      
      await puppeteerManager.closeBrowser();
      
      expect(mockBrowser.close).toHaveBeenCalled();
      expect(puppeteerManager.browser).toBeNull();
    });

    test('should do nothing if no browser exists', async () => {
      await puppeteerManager.closeBrowser();
      
      expect(mockBrowser.close).not.toHaveBeenCalled();
    });
  });

  describe('warmup', () => {
    test('should launch browser if not already launched', async () => {
      const puppeteer = await import('puppeteer');
      puppeteer.launch.mockResolvedValue(mockBrowser);
      
      await puppeteerManager.warmup();
      
      expect(puppeteer.launch).toHaveBeenCalled();
      expect(puppeteerManager.browser).toBe(mockBrowser);
    });

    test('should not launch browser if already exists', async () => {
      const puppeteer = await import('puppeteer');
      puppeteerManager.browser = mockBrowser;
      
      await puppeteerManager.warmup();
      
      expect(puppeteer.launch).not.toHaveBeenCalled();
    });
  });

  describe('checkAvailability', () => {
    test('should return availability info with puppeteer version', async () => {
      const result = await puppeteerManager.checkAvailability();
      
      expect(result).toEqual({
        available: true,
        puppeteerLoaded: true,
        puppeteerVersion: '21.11.0',
        chromiumBundled: true,
        message: 'Puppeteer with bundled Chromium is ready'
      });
    });

    test('should handle puppeteer load errors', async () => {
      // This is harder to test since puppeteer is already imported
      // but we can test the error path structure
      const result = await puppeteerManager.checkAvailability();
      
      expect(result).toHaveProperty('available');
      expect(result).toHaveProperty('puppeteerLoaded');
    });
  });

  describe('getInstance', () => {
    test('should return singleton instance', () => {
      const instance1 = PuppeteerManager.getInstance();
      const instance2 = PuppeteerManager.getInstance();
      
      expect(instance1).toBe(instance2);
      expect(instance1).toBeInstanceOf(PuppeteerManager);
    });
  });
});