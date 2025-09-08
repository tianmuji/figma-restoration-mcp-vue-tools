import { ResourceManager, globalResourceManager, withResourceCleanup, withResourceTracking } from '../resource-manager.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Simple test runner for Resource Manager
 */
class TestRunner {
  constructor() {
    this.tests = [];
    this.passed = 0;
    this.failed = 0;
    this.testDir = path.join(__dirname, 'test-temp-resource');
  }

  test(name, testFn) {
    this.tests.push({ name, testFn });
  }

  async run() {
    console.log('🧪 Running Resource Manager Tests...\n');
    
    // Setup test environment
    await this.setupTestEnvironment();

    for (const { name, testFn } of this.tests) {
      try {
        await testFn();
        console.log(`✅ ${name}`);
        this.passed++;
      } catch (error) {
        console.log(`❌ ${name}: ${error.message}`);
        this.failed++;
      }
    }

    // Cleanup test environment
    await this.cleanupTestEnvironment();

    console.log(`\n📊 Test Results: ${this.passed} passed, ${this.failed} failed`);
    return this.failed === 0;
  }

  async setupTestEnvironment() {
    await fs.mkdir(this.testDir, { recursive: true });
  }

  async cleanupTestEnvironment() {
    try {
      await fs.rm(this.testDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  }

  assert(condition, message) {
    if (!condition) {
      throw new Error(message || 'Assertion failed');
    }
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Test suite
const runner = new TestRunner();

// ResourceManager basic functionality tests
runner.test('should create resource manager with default options', () => {
  const manager = new ResourceManager();
  
  runner.assert(manager.options.enableAutoCleanup === true, 'Should enable auto cleanup by default');
  runner.assert(manager.options.enableMonitoring === true, 'Should enable monitoring by default');
  runner.assert(manager.resources instanceof Map, 'Should have resources map');
  runner.assert(manager.tempFiles instanceof Set, 'Should have temp files set');
  runner.assert(manager.operations instanceof Map, 'Should have operations map');
});

runner.test('should create resource manager with custom options', () => {
  const manager = new ResourceManager({
    maxTempFiles: 50,
    maxTempSize: 50 * 1024 * 1024,
    cleanupInterval: 60000,
    enableAutoCleanup: false,
    enableMonitoring: false
  });
  
  runner.assert(manager.options.maxTempFiles === 50, 'Should set custom max temp files');
  runner.assert(manager.options.maxTempSize === 50 * 1024 * 1024, 'Should set custom max temp size');
  runner.assert(manager.options.cleanupInterval === 60000, 'Should set custom cleanup interval');
  runner.assert(manager.options.enableAutoCleanup === false, 'Should disable auto cleanup');
  runner.assert(manager.options.enableMonitoring === false, 'Should disable monitoring');
});

runner.test('should register and unregister resources', () => {
  const manager = new ResourceManager();
  
  const resourceId = 'test-resource';
  const resource = {
    type: 'file',
    path: '/test/path',
    operation: 'test-op'
  };
  
  manager.registerResource(resourceId, resource);
  runner.assert(manager.resources.has(resourceId), 'Should register resource');
  
  const registered = manager.resources.get(resourceId);
  runner.assert(registered.type === 'file', 'Should store resource type');
  runner.assert(registered.path === '/test/path', 'Should store resource path');
  runner.assert(registered.createdAt, 'Should set created timestamp');
  
  manager.unregisterResource(resourceId);
  runner.assert(!manager.resources.has(resourceId), 'Should unregister resource');
});

runner.test('should register and unregister temporary files', () => {
  const manager = new ResourceManager();
  
  const filePath = '/test/temp/file.txt';
  manager.registerTempFile(filePath, { operation: 'test-op', size: 1024 });
  
  runner.assert(manager.tempFiles.size === 1, 'Should register temp file');
  
  // Check if file info is stored correctly
  let found = false;
  for (const fileInfoStr of manager.tempFiles) {
    const fileInfo = JSON.parse(fileInfoStr);
    if (fileInfo.path === filePath) {
      found = true;
      runner.assert(fileInfo.operation === 'test-op', 'Should store operation');
      runner.assert(fileInfo.size === 1024, 'Should store size');
      break;
    }
  }
  runner.assert(found, 'Should find registered temp file');
  
  manager.unregisterTempFile(filePath);
  runner.assert(manager.tempFiles.size === 0, 'Should unregister temp file');
});

runner.test('should register and complete operations', async () => {
  const manager = new ResourceManager();
  
  const operationId = 'test-operation';
  const operation = {
    name: 'test',
    tool: 'TestTool'
  };
  
  manager.registerOperation(operationId, operation);
  runner.assert(manager.operations.has(operationId), 'Should register operation');
  
  const registered = manager.operations.get(operationId);
  runner.assert(registered.name === 'test', 'Should store operation name');
  runner.assert(registered.status === 'running', 'Should set status to running');
  runner.assert(registered.startTime, 'Should set start time');
  
  await manager.completeOperation(operationId, { success: true });
  runner.assert(!manager.operations.has(operationId), 'Should remove completed operation');
});

runner.test('should create temporary files', async () => {
  const manager = new ResourceManager({ tempDir: runner.testDir });
  
  const tempFile = await manager.createTempFile('test', '.txt');
  
  runner.assert(tempFile.includes(runner.testDir), 'Should create file in temp dir');
  runner.assert(tempFile.includes('test'), 'Should include prefix');
  runner.assert(tempFile.endsWith('.txt'), 'Should include suffix');
  
  // Check if file exists
  const exists = await fs.access(tempFile).then(() => true).catch(() => false);
  runner.assert(exists, 'Should create actual file');
  
  // Check if registered
  runner.assert(manager.tempFiles.size === 1, 'Should register temp file');
  
  // Cleanup
  await fs.unlink(tempFile);
});

runner.test('should create temporary directories', async () => {
  const manager = new ResourceManager({ tempDir: runner.testDir });
  
  const tempDir = await manager.createTempDir('testdir');
  
  runner.assert(tempDir.includes(runner.testDir), 'Should create dir in temp dir');
  runner.assert(tempDir.includes('testdir'), 'Should include prefix');
  
  // Check if directory exists
  const stats = await fs.stat(tempDir);
  runner.assert(stats.isDirectory(), 'Should create actual directory');
  
  // Check if registered as resource
  runner.assert(manager.resources.size === 1, 'Should register temp directory');
  
  // Cleanup
  await fs.rmdir(tempDir);
});

runner.test('should cleanup operation resources', async () => {
  const manager = new ResourceManager({ tempDir: runner.testDir });
  
  const operationId = 'cleanup-test';
  manager.registerOperation(operationId, { name: 'cleanup-test' });
  
  // Create temp file for operation
  const tempFile = await manager.createTempFile('cleanup', '.txt', { operation: operationId });
  const operation = manager.operations.get(operationId);
  operation.tempFiles.add(tempFile);
  
  // Complete operation (should cleanup resources)
  await manager.completeOperation(operationId, { success: true });
  
  // Check if temp file was cleaned up
  const exists = await fs.access(tempFile).then(() => true).catch(() => false);
  runner.assert(!exists, 'Should cleanup temp file');
  runner.assert(manager.tempFiles.size === 0, 'Should unregister temp file');
});

runner.test('should perform auto cleanup', async () => {
  const manager = new ResourceManager({ 
    tempDir: runner.testDir,
    enableAutoCleanup: false // We'll trigger manually
  });
  
  // Create old temp file
  const oldTempFile = await manager.createTempFile('old', '.txt');
  
  // Simulate old file by modifying creation time
  for (const fileInfoStr of manager.tempFiles) {
    const fileInfo = JSON.parse(fileInfoStr);
    if (fileInfo.path === oldTempFile) {
      fileInfo.createdAt = Date.now() - 7200000; // 2 hours ago
      manager.tempFiles.delete(fileInfoStr);
      manager.tempFiles.add(JSON.stringify(fileInfo));
      break;
    }
  }
  
  // Perform auto cleanup
  await manager.performAutoCleanup();
  
  // Check if old file was cleaned up
  const exists = await fs.access(oldTempFile).then(() => true).catch(() => false);
  runner.assert(!exists, 'Should cleanup old temp file');
});

runner.test('should get health status', async () => {
  const manager = new ResourceManager({ tempDir: runner.testDir });
  
  const health = await manager.getHealthStatus();
  
  runner.assert(health.status, 'Should have health status');
  runner.assert(health.metrics, 'Should have metrics');
  runner.assert(health.metrics.memory, 'Should have memory metrics');
  runner.assert(health.metrics.tempFiles, 'Should have temp files metrics');
  runner.assert(health.metrics.resources, 'Should have resources metrics');
  runner.assert(health.timestamp, 'Should have timestamp');
});

runner.test('should get statistics', () => {
  const manager = new ResourceManager();
  
  // Add some test data
  manager.registerResource('test1', { type: 'file' });
  manager.registerTempFile('/test/file1.txt');
  manager.registerOperation('op1', { name: 'test' });
  
  const stats = manager.getStatistics();
  
  runner.assert(stats.activeResources === 1, 'Should count active resources');
  runner.assert(stats.activeTempFiles === 1, 'Should count active temp files');
  runner.assert(stats.activeOperations === 1, 'Should count active operations');
  runner.assert(typeof stats.uptime === 'number', 'Should include uptime');
  runner.assert(stats.memoryUsage, 'Should include memory usage');
});

runner.test('should emit events for resource operations', async () => {
  const manager = new ResourceManager();
  let eventCount = 0;
  
  return new Promise((resolve, reject) => {
    manager.on('resourceRegistered', () => {
      eventCount++;
      if (eventCount === 1) {
        manager.registerTempFile('/test/file.txt');
      }
    });
    
    manager.on('tempFileRegistered', () => {
      eventCount++;
      if (eventCount === 2) {
        manager.registerOperation('test-op', { name: 'test' });
      }
    });
    
    manager.on('operationRegistered', () => {
      eventCount++;
      if (eventCount === 3) {
        runner.assert(true, 'Should emit all events');
        resolve();
      }
    });
    
    manager.registerResource('test-resource', { type: 'file' });
    
    // Timeout fallback
    setTimeout(() => {
      if (eventCount < 3) {
        reject(new Error('Not all events were emitted'));
      }
    }, 1000);
  });
});

// withResourceCleanup decorator tests
runner.test('should work with resource cleanup decorator', async () => {
  class TestClass {
    async testMethod(arg1, arg2) {
      return `${arg1}-${arg2}`;
    }
  }
  
  // Apply decorator manually
  const descriptor = { value: TestClass.prototype.testMethod };
  withResourceCleanup({ logArgs: false })(TestClass.prototype, 'testMethod', descriptor);
  TestClass.prototype.testMethod = descriptor.value;
  
  const instance = new TestClass();
  const result = await instance.testMethod('hello', 'world');
  
  runner.assert(result === 'hello-world', 'Should return correct result');
  // Note: In a real test, we'd check if operation was registered and completed
});

// withResourceTracking mixin tests
runner.test('should work with resource tracking mixin', () => {
  class BaseClass {
    constructor(name) {
      this.name = name;
    }
  }
  
  const TrackedClass = withResourceTracking(BaseClass);
  const instance = new TrackedClass('test');
  
  runner.assert(instance.name === 'test', 'Should preserve base class functionality');
  runner.assert(instance.resourceManager, 'Should have resource manager');
  runner.assert(typeof instance.startOperation === 'function', 'Should have startOperation method');
  runner.assert(typeof instance.completeOperation === 'function', 'Should have completeOperation method');
  runner.assert(typeof instance.registerTempFile === 'function', 'Should have registerTempFile method');
  runner.assert(typeof instance.registerResource === 'function', 'Should have registerResource method');
});

runner.test('should track operations with mixin', async () => {
  class BaseClass {}
  const TrackedClass = withResourceTracking(BaseClass);
  const instance = new TrackedClass();
  
  const operationId = instance.startOperation('test-operation', { detail: 'test' });
  runner.assert(operationId, 'Should return operation ID');
  runner.assert(instance.operationId === operationId, 'Should set current operation ID');
  
  await instance.completeOperation({ success: true });
  runner.assert(instance.operationId === null, 'Should clear operation ID after completion');
});

runner.test('should register temp files with current operation', () => {
  class BaseClass {}
  const TrackedClass = withResourceTracking(BaseClass);
  const instance = new TrackedClass();
  
  const operationId = instance.startOperation('test-operation');
  const filePath = instance.registerTempFile('/test/file.txt');
  
  runner.assert(filePath === '/test/file.txt', 'Should return file path');
  
  // Check if file was added to operation
  const operation = instance.resourceManager.operations.get(operationId);
  runner.assert(operation.tempFiles.has('/test/file.txt'), 'Should add file to current operation');
});

runner.test('should register resources with current operation', () => {
  class BaseClass {}
  const TrackedClass = withResourceTracking(BaseClass);
  const instance = new TrackedClass();
  
  const operationId = instance.startOperation('test-operation');
  const resourceId = instance.registerResource('test-resource', { type: 'file' });
  
  runner.assert(resourceId === 'test-resource', 'Should return resource ID');
  
  // Check if resource was added to operation
  const operation = instance.resourceManager.operations.get(operationId);
  runner.assert(operation.resources.has('test-resource'), 'Should add resource to current operation');
});

// Global resource manager tests
runner.test('should have global resource manager', () => {
  runner.assert(globalResourceManager instanceof ResourceManager, 'Should be ResourceManager instance');
  runner.assert(globalResourceManager.options.enableAutoCleanup === true, 'Should have auto cleanup enabled');
  runner.assert(globalResourceManager.options.enableMonitoring === true, 'Should have monitoring enabled');
});

runner.test('should handle cleanup on process events', () => {
  const manager = new ResourceManager();
  
  // Check if process event listeners are set up
  const exitListeners = process.listeners('exit');
  const sigintListeners = process.listeners('SIGINT');
  const sigtermListeners = process.listeners('SIGTERM');
  
  runner.assert(exitListeners.length > 0, 'Should have exit listener');
  runner.assert(sigintListeners.length > 0, 'Should have SIGINT listener');
  runner.assert(sigtermListeners.length > 0, 'Should have SIGTERM listener');
});

// Error handling tests
runner.test('should handle cleanup errors gracefully', async () => {
  const manager = new ResourceManager();
  
  // Register resource with invalid path
  manager.registerResource('invalid-resource', {
    type: 'file',
    path: '/nonexistent/path/file.txt'
  });
  
  // Should not throw error during cleanup
  try {
    await manager.cleanupResource('invalid-resource');
    runner.assert(true, 'Should handle cleanup errors gracefully');
  } catch (error) {
    runner.assert(false, `Should not throw error: ${error.message}`);
  }
});

runner.test('should handle monitoring errors gracefully', async () => {
  const manager = new ResourceManager({ 
    tempDir: '/nonexistent/path',
    enableMonitoring: false // We'll trigger manually
  });
  
  // Should not throw error during monitoring
  try {
    await manager.performMonitoring();
    runner.assert(true, 'Should handle monitoring errors gracefully');
  } catch (error) {
    runner.assert(false, `Should not throw error: ${error.message}`);
  }
});

// Performance tests
runner.test('should handle large number of resources efficiently', () => {
  const manager = new ResourceManager();
  const startTime = Date.now();
  
  // Register many resources
  for (let i = 0; i < 1000; i++) {
    manager.registerResource(`resource-${i}`, { type: 'file', path: `/test/${i}` });
  }
  
  const registrationTime = Date.now() - startTime;
  runner.assert(registrationTime < 1000, 'Should register 1000 resources quickly');
  
  const statsStartTime = Date.now();
  const stats = manager.getStatistics();
  const statsTime = Date.now() - statsStartTime;
  
  runner.assert(stats.activeResources === 1000, 'Should count all resources');
  runner.assert(statsTime < 100, 'Should get statistics quickly');
});

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runner.run().then(success => {
    process.exit(success ? 0 : 1);
  });
}

export { runner as resourceManagerTests };