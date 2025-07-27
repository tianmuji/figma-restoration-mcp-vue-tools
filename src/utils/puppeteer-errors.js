/**
 * Puppeteer 专用错误处理类
 * 提供具体的错误分类和解决方案建议
 */

export class PuppeteerLaunchError extends Error {
  constructor(originalError) {
    super(`Failed to launch Puppeteer browser: ${originalError.message}`);
    this.name = 'PuppeteerLaunchError';
    this.originalError = originalError;
    this.solutions = this.generateSolutions(originalError);
  }

  generateSolutions(error) {
    const solutions = [];
    const errorMessage = error.message.toLowerCase();
    
    if (errorMessage.includes('econnrefused') || errorMessage.includes('network')) {
      solutions.push('Check network connectivity and firewall settings');
      solutions.push('Verify internet connection for Chromium download');
      solutions.push('Try using a different network or VPN');
    }
    
    if (errorMessage.includes('permission denied') || errorMessage.includes('eacces')) {
      solutions.push('Check file system permissions in the project directory');
      solutions.push('Run with appropriate user privileges');
      solutions.push('Ensure write access to node_modules directory');
    }
    
    if (errorMessage.includes('timeout') || errorMessage.includes('timed out')) {
      solutions.push('Increase timeout settings');
      solutions.push('Check system resources (CPU/Memory)');
      solutions.push('Close other resource-intensive applications');
    }
    
    if (errorMessage.includes('chromium') || errorMessage.includes('chrome')) {
      solutions.push('Clear npm cache: npm cache clean --force');
      solutions.push('Reinstall Puppeteer: npm uninstall puppeteer && npm install puppeteer');
      solutions.push('Check if antivirus is blocking Chromium download');
    }
    
    // Generic solutions
    solutions.push('Try reinstalling the package: npm install --force');
    solutions.push('Update Node.js to the latest LTS version');
    solutions.push('Check system requirements: Node.js >=18.0.0');
    
    return solutions;
  }
}

export class NetworkError extends Error {
  constructor(message, originalError) {
    super(`Network connectivity issue: ${message}`);
    this.name = 'NetworkError';
    this.originalError = originalError;
    this.solutions = [
      'Check internet connection',
      'Verify firewall and proxy settings',
      'Try using a different network',
      'Check if corporate firewall is blocking downloads'
    ];
  }
}

export class PermissionError extends Error {
  constructor(message, originalError) {
    super(`Permission denied: ${message}`);
    this.name = 'PermissionError';
    this.originalError = originalError;
    this.solutions = [
      'Check file system permissions',
      'Run with appropriate user privileges',
      'Ensure write access to project directory',
      'Check if directory is read-only'
    ];
  }
}

export class TimeoutError extends Error {
  constructor(message, originalError) {
    super(`Operation timed out: ${message}`);
    this.name = 'TimeoutError';
    this.originalError = originalError;
    this.solutions = [
      'Increase timeout settings',
      'Check system resources (CPU/Memory)',
      'Close other applications',
      'Try again when system is less busy'
    ];
  }
}

export class MemoryError extends Error {
  constructor(message, originalError) {
    super(`Insufficient memory: ${message}`);
    this.name = 'MemoryError';
    this.originalError = originalError;
    this.solutions = [
      'Close other applications to free memory',
      'Increase system memory if possible',
      'Use headless mode to reduce memory usage',
      'Process fewer concurrent operations'
    ];
  }
}