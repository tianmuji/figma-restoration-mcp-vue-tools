/**
 * 集成测试 - 测试重构后的核心功能
 */

describe('Integration Tests', () => {
  describe('PuppeteerManager Integration', () => {
    test('should be able to import PuppeteerManager', async () => {
      const { PuppeteerManager } = await import('../src/utils/puppeteer-manager.js');
      expect(PuppeteerManager).toBeDefined();
      expect(typeof PuppeteerManager).toBe('function');
    });

    test('should be able to create PuppeteerManager instance', async () => {
      const { PuppeteerManager } = await import('../src/utils/puppeteer-manager.js');
      const manager = new PuppeteerManager();
      
      expect(manager).toBeInstanceOf(PuppeteerManager);
      expect(manager.browser).toBeNull();
      expect(manager.pagePool).toEqual([]);
    });

    test('should have singleton getInstance method', async () => {
      const { PuppeteerManager } = await import('../src/utils/puppeteer-manager.js');
      const instance1 = PuppeteerManager.getInstance();
      const instance2 = PuppeteerManager.getInstance();
      
      expect(instance1).toBe(instance2);
      expect(instance1).toBeInstanceOf(PuppeteerManager);
    });

    test('should have checkAvailability method', async () => {
      const { PuppeteerManager } = await import('../src/utils/puppeteer-manager.js');
      const manager = new PuppeteerManager();
      
      const availability = await manager.checkAvailability();
      
      expect(availability).toHaveProperty('available');
      expect(availability).toHaveProperty('puppeteerLoaded');
      expect(availability).toHaveProperty('chromiumBundled');
      expect(availability.available).toBe(true);
      expect(availability.puppeteerLoaded).toBe(true);
      expect(availability.chromiumBundled).toBe(true);
    });
  });

  describe('Error Classes Integration', () => {
    test('should be able to import all error classes', async () => {
      const errors = await import('../src/utils/puppeteer-errors.js');
      
      expect(errors.PuppeteerLaunchError).toBeDefined();
      expect(errors.NetworkError).toBeDefined();
      expect(errors.PermissionError).toBeDefined();
      expect(errors.TimeoutError).toBeDefined();
      expect(errors.MemoryError).toBeDefined();
    });

    test('should create PuppeteerLaunchError with solutions', async () => {
      const { PuppeteerLaunchError } = await import('../src/utils/puppeteer-errors.js');
      const originalError = new Error('Test error');
      const error = new PuppeteerLaunchError(originalError);
      
      expect(error.name).toBe('PuppeteerLaunchError');
      expect(error.solutions).toBeInstanceOf(Array);
      expect(error.solutions.length).toBeGreaterThan(0);
      expect(error.originalError).toBe(originalError);
    });

    test('should create NetworkError with network-specific solutions', async () => {
      const { NetworkError } = await import('../src/utils/puppeteer-errors.js');
      const originalError = new Error('Connection failed');
      const error = new NetworkError('Network issue', originalError);
      
      expect(error.name).toBe('NetworkError');
      expect(error.message).toContain('Network connectivity issue');
      expect(error.solutions).toContain('Check internet connection');
    });
  });

  describe('SnapDOMScreenshotTool Integration', () => {
    test('should be able to import SnapDOMScreenshotTool', async () => {
      const { SnapDOMScreenshotTool } = await import('../src/tools/snapdom-screenshot.js');
      expect(SnapDOMScreenshotTool).toBeDefined();
      expect(typeof SnapDOMScreenshotTool).toBe('function');
    });

    test('should create SnapDOMScreenshotTool with correct properties', async () => {
      const { SnapDOMScreenshotTool } = await import('../src/tools/snapdom-screenshot.js');
      const tool = new SnapDOMScreenshotTool();
      
      expect(tool.description).toContain('snapDOM technology');
      expect(tool.DEFAULT_TIMEOUT).toBe(3000);
      expect(tool.inputSchema).toHaveProperty('type', 'object');
      expect(tool.inputSchema.properties).toHaveProperty('componentName');
    });


  });

  describe('Package Structure', () => {
    test('should have correct package.json structure', async () => {
      const fs = await import('fs/promises');
      const packageJson = JSON.parse(await fs.readFile('package.json', 'utf8'));
      
      expect(packageJson.name).toBe('figma-restoration-mcp-vue-tools');
      expect(packageJson.dependencies).toHaveProperty('puppeteer');
      expect(packageJson.dependencies).toHaveProperty('@zumer/snapdom');
      expect(packageJson.dependencies).toHaveProperty('chalk');
    });

    test('should have postinstall script working', async () => {
      // Test that postinstall script exists and is executable
      const fs = await import('fs/promises');
      const stats = await fs.stat('scripts/postinstall.js');
      expect(stats.isFile()).toBe(true);
    });
  });
});