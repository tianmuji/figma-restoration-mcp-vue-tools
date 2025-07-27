/**
 * 性能测试 - 验证重构后的性能改进
 */

describe('Performance Tests', () => {
  describe('PuppeteerManager Performance', () => {
    test('should initialize quickly', async () => {
      const startTime = Date.now();
      
      const { PuppeteerManager } = await import('../src/utils/puppeteer-manager.js');
      const manager = new PuppeteerManager();
      
      const endTime = Date.now();
      const initTime = endTime - startTime;
      
      expect(initTime).toBeLessThan(200); // Should initialize in less than 200ms
      expect(manager).toBeInstanceOf(PuppeteerManager);
    });

    test('should have fast checkAvailability', async () => {
      const { PuppeteerManager } = await import('../src/utils/puppeteer-manager.js');
      const manager = new PuppeteerManager();
      
      const startTime = Date.now();
      const availability = await manager.checkAvailability();
      const endTime = Date.now();
      
      const checkTime = endTime - startTime;
      
      expect(checkTime).toBeLessThan(50); // Should check availability in less than 50ms
      expect(availability.available).toBe(true);
    });

    test('should handle multiple getInstance calls efficiently', async () => {
      const { PuppeteerManager } = await import('../src/utils/puppeteer-manager.js');
      
      const startTime = Date.now();
      
      // Call getInstance multiple times
      const instances = [];
      for (let i = 0; i < 100; i++) {
        instances.push(PuppeteerManager.getInstance());
      }
      
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      
      expect(totalTime).toBeLessThan(10); // Should handle 100 calls in less than 10ms
      
      // All instances should be the same
      const firstInstance = instances[0];
      instances.forEach(instance => {
        expect(instance).toBe(firstInstance);
      });
    });
  });

  describe('Error Handling Performance', () => {
    test('should create errors quickly', async () => {
      const { PuppeteerLaunchError, NetworkError, PermissionError } = await import('../src/utils/puppeteer-errors.js');
      
      const startTime = Date.now();
      
      // Create multiple error instances
      const originalError = new Error('Test error');
      const errors = [
        new PuppeteerLaunchError(originalError),
        new NetworkError('Network issue', originalError),
        new PermissionError('Permission issue', originalError)
      ];
      
      const endTime = Date.now();
      const creationTime = endTime - startTime;
      
      expect(creationTime).toBeLessThan(20); // Should create errors in less than 20ms
      expect(errors).toHaveLength(3);
      
      // Each error should have solutions
      errors.forEach(error => {
        expect(error.solutions).toBeInstanceOf(Array);
        expect(error.solutions.length).toBeGreaterThan(0);
      });
    });

    test('should generate solutions efficiently', async () => {
      const { PuppeteerLaunchError } = await import('../src/utils/puppeteer-errors.js');
      
      const testCases = [
        new Error('ECONNREFUSED connection failed'),
        new Error('EACCES permission denied'),
        new Error('timeout exceeded'),
        new Error('chromium download failed'),
        new Error('generic error')
      ];
      
      const startTime = Date.now();
      
      const errors = testCases.map(originalError => new PuppeteerLaunchError(originalError));
      
      const endTime = Date.now();
      const generationTime = endTime - startTime;
      
      expect(generationTime).toBeLessThan(50); // Should generate all solutions in less than 50ms
      
      // Each error should have appropriate solutions
      errors.forEach(error => {
        expect(error.solutions.length).toBeGreaterThan(2); // At least generic solutions
      });
    });
  });

  describe('SnapDOMScreenshotTool Performance', () => {
    test('should initialize tool quickly', async () => {
      const startTime = Date.now();
      
      const { SnapDOMScreenshotTool } = await import('../src/tools/snapdom-screenshot.js');
      const tool = new SnapDOMScreenshotTool();
      
      const endTime = Date.now();
      const initTime = endTime - startTime;
      
      expect(initTime).toBeLessThan(200); // Should initialize in less than 200ms
      expect(tool.inputSchema).toBeDefined();
    });



    test('should handle timeout wrapper efficiently', async () => {
      const { SnapDOMScreenshotTool } = await import('../src/tools/snapdom-screenshot.js');
      const tool = new SnapDOMScreenshotTool();
      
      const startTime = Date.now();
      
      // Test multiple fast promises
      const promises = Array.from({ length: 10 }, (_, i) => 
        tool.withTimeout(Promise.resolve(`result-${i}`), 1000, `Operation ${i}`)
      );
      
      const results = await Promise.all(promises);
      
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      
      expect(totalTime).toBeLessThan(100); // Should handle 10 promises in less than 100ms
      expect(results).toHaveLength(10);
      
      results.forEach((result, i) => {
        expect(result).toBe(`result-${i}`);
      });
    });
  });

  describe('Memory Usage', () => {
    test('should not leak memory during repeated operations', async () => {
      const { PuppeteerManager } = await import('../src/utils/puppeteer-manager.js');
      
      // Get initial memory usage
      const initialMemory = process.memoryUsage().heapUsed;
      
      // Perform repeated operations
      for (let i = 0; i < 1000; i++) {
        const manager = new PuppeteerManager();
        await manager.checkAvailability();
      }
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }
      
      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;
      
      // Memory increase should be reasonable (less than 10MB)
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
    });

    test('should handle singleton pattern efficiently', async () => {
      const { PuppeteerManager } = await import('../src/utils/puppeteer-manager.js');
      
      const initialMemory = process.memoryUsage().heapUsed;
      
      // Get many references to singleton
      const instances = [];
      for (let i = 0; i < 10000; i++) {
        instances.push(PuppeteerManager.getInstance());
      }
      
      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;
      
      // Should not create multiple instances
      const uniqueInstances = new Set(instances);
      expect(uniqueInstances.size).toBe(1);
      
      // Memory increase should be minimal
      expect(memoryIncrease).toBeLessThan(1024 * 1024); // Less than 1MB
    });
  });
});