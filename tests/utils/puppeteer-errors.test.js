/**
 * Puppeteer 错误处理类测试
 */

import { 
  PuppeteerLaunchError, 
  NetworkError, 
  PermissionError, 
  TimeoutError,
  MemoryError 
} from '../../src/utils/puppeteer-errors.js';

describe('Puppeteer Error Classes', () => {
  describe('PuppeteerLaunchError', () => {
    test('should create error with correct message and solutions', () => {
      const originalError = new Error('Browser launch failed');
      const error = new PuppeteerLaunchError(originalError);
      
      expect(error.name).toBe('PuppeteerLaunchError');
      expect(error.message).toBe('Failed to launch Puppeteer browser: Browser launch failed');
      expect(error.originalError).toBe(originalError);
      expect(error.solutions).toBeInstanceOf(Array);
      expect(error.solutions.length).toBeGreaterThan(0);
    });

    test('should generate network-specific solutions for ECONNREFUSED', () => {
      const networkError = new Error('ECONNREFUSED connection failed');
      const error = new PuppeteerLaunchError(networkError);
      
      expect(error.solutions).toContain('Check network connectivity and firewall settings');
      expect(error.solutions).toContain('Verify internet connection for Chromium download');
    });

    test('should generate permission-specific solutions for EACCES', () => {
      const permissionError = new Error('EACCES permission denied');
      const error = new PuppeteerLaunchError(permissionError);
      
      expect(error.solutions).toContain('Check file system permissions in the project directory');
      expect(error.solutions).toContain('Run with appropriate user privileges');
    });

    test('should generate timeout-specific solutions for timeout errors', () => {
      const timeoutError = new Error('Operation timed out');
      const error = new PuppeteerLaunchError(timeoutError);
      
      expect(error.solutions).toContain('Increase timeout settings');
      expect(error.solutions).toContain('Check system resources (CPU/Memory)');
    });

    test('should generate chromium-specific solutions for chromium errors', () => {
      const chromiumError = new Error('Chromium download failed');
      const error = new PuppeteerLaunchError(chromiumError);
      
      expect(error.solutions).toContain('Clear npm cache: npm cache clean --force');
      expect(error.solutions).toContain('Reinstall Puppeteer: npm uninstall puppeteer && npm install puppeteer');
    });

    test('should always include generic solutions', () => {
      const genericError = new Error('Generic error');
      const error = new PuppeteerLaunchError(genericError);
      
      expect(error.solutions).toContain('Try reinstalling the package: npm install --force');
      expect(error.solutions).toContain('Update Node.js to the latest LTS version');
      expect(error.solutions).toContain('Check system requirements: Node.js >=18.0.0');
    });
  });

  describe('NetworkError', () => {
    test('should create network error with correct properties', () => {
      const originalError = new Error('Connection failed');
      const error = new NetworkError('Network issue', originalError);
      
      expect(error.name).toBe('NetworkError');
      expect(error.message).toBe('Network connectivity issue: Network issue');
      expect(error.originalError).toBe(originalError);
      expect(error.solutions).toContain('Check internet connection');
      expect(error.solutions).toContain('Verify firewall and proxy settings');
    });
  });

  describe('PermissionError', () => {
    test('should create permission error with correct properties', () => {
      const originalError = new Error('Access denied');
      const error = new PermissionError('File access denied', originalError);
      
      expect(error.name).toBe('PermissionError');
      expect(error.message).toBe('Permission denied: File access denied');
      expect(error.originalError).toBe(originalError);
      expect(error.solutions).toContain('Check file system permissions');
      expect(error.solutions).toContain('Run with appropriate user privileges');
    });
  });

  describe('TimeoutError', () => {
    test('should create timeout error with correct properties', () => {
      const originalError = new Error('Operation exceeded time limit');
      const error = new TimeoutError('Browser launch timeout', originalError);
      
      expect(error.name).toBe('TimeoutError');
      expect(error.message).toBe('Operation timed out: Browser launch timeout');
      expect(error.originalError).toBe(originalError);
      expect(error.solutions).toContain('Increase timeout settings');
      expect(error.solutions).toContain('Check system resources (CPU/Memory)');
    });
  });

  describe('MemoryError', () => {
    test('should create memory error with correct properties', () => {
      const originalError = new Error('Out of memory');
      const error = new MemoryError('Insufficient memory for browser', originalError);
      
      expect(error.name).toBe('MemoryError');
      expect(error.message).toBe('Insufficient memory: Insufficient memory for browser');
      expect(error.originalError).toBe(originalError);
      expect(error.solutions).toContain('Close other applications to free memory');
      expect(error.solutions).toContain('Increase system memory if possible');
    });
  });

  describe('Error inheritance', () => {
    test('all custom errors should extend Error', () => {
      const originalError = new Error('Test error');
      
      expect(new PuppeteerLaunchError(originalError)).toBeInstanceOf(Error);
      expect(new NetworkError('test', originalError)).toBeInstanceOf(Error);
      expect(new PermissionError('test', originalError)).toBeInstanceOf(Error);
      expect(new TimeoutError('test', originalError)).toBeInstanceOf(Error);
      expect(new MemoryError('test', originalError)).toBeInstanceOf(Error);
    });

    test('errors should be catchable as their specific types', () => {
      const originalError = new Error('Test error');
      
      try {
        throw new NetworkError('test', originalError);
      } catch (error) {
        expect(error).toBeInstanceOf(NetworkError);
        expect(error).toBeInstanceOf(Error);
      }
    });
  });
});