# Design Document

## Overview

本设计文档描述了将 figma-restoration-mcp-vue-tools 从可选 Puppeteer 安装和系统 Chrome 检测机制重构为必需 Puppeteer 依赖的架构设计。新架构将使用 Puppeteer 内置的 Chromium，消除路径配置复杂性和跨平台兼容性问题。

## Architecture

### Current Architecture Issues

基于代码分析，当前架构存在以下问题：

1. **复杂的 Chrome 路径检测** (`postinstall.js` 和 `puppeteer-manager.js`)
   - 需要维护多平台 Chrome 路径列表
   - 路径检测可能失败或不准确
   - 用户需要手动设置环境变量

2. **可选依赖管理复杂性**
   - `package.json` 中 Puppeteer 配置混乱
   - `postinstall.js` 创建复杂的 `.puppeteerrc.cjs` 配置
   - 环境变量依赖过多

3. **错误处理不够友好**
   - Chrome 路径错误时提供的解决方案复杂
   - 用户需要理解底层浏览器配置

### New Architecture Design

#### 1. Dependency Management Simplification

**Before:**
```json
{
  "config": {
    "puppeteer": {
      "skipDownload": false,
      "skipChromiumDownload": false
    }
  },
  "puppeteer": {
    "skipDownload": false
  },
  "bundleDependencies": ["puppeteer"]
}
```

**After:**
```json
{
  "dependencies": {
    "puppeteer": "^21.11.0"
  }
}
```

#### 2. Browser Management Simplification

**Before:** Complex Chrome path detection and configuration
**After:** Direct Puppeteer Chromium usage

```javascript
// Simplified browser launch
const browser = await puppeteer.launch({
  headless: "new",
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage'
  ]
});
```

#### 3. Configuration File Elimination

**Remove:**
- `.puppeteerrc.cjs` generation
- Complex Chrome path detection
- Environment variable requirements

**Keep:**
- Simple launch options
- Error handling for network issues
- Performance optimizations

## Components and Interfaces

### 1. Simplified PuppeteerManager

```javascript
export class PuppeteerManager {
  constructor() {
    this.browser = null;
  }

  async launchBrowser(options = {}) {
    const defaultOptions = {
      headless: "new",
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    };

    const launchOptions = { ...defaultOptions, ...options };

    try {
      this.browser = await puppeteer.launch(launchOptions);
      return this.browser;
    } catch (error) {
      throw new PuppeteerLaunchError(error);
    }
  }

  async closeBrowser() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}
```

### 2. Enhanced Error Handling

```javascript
export class PuppeteerLaunchError extends Error {
  constructor(originalError) {
    super(`Failed to launch Puppeteer browser: ${originalError.message}`);
    this.name = 'PuppeteerLaunchError';
    this.originalError = originalError;
    this.solutions = this.generateSolutions(originalError);
  }

  generateSolutions(error) {
    const solutions = [];
    
    if (error.message.includes('ECONNREFUSED')) {
      solutions.push('Check network connectivity');
      solutions.push('Verify firewall settings');
    }
    
    if (error.message.includes('Permission denied')) {
      solutions.push('Check file system permissions');
      solutions.push('Run with appropriate user privileges');
    }
    
    solutions.push('Try reinstalling the package: npm install --force');
    solutions.push('Clear npm cache: npm cache clean --force');
    
    return solutions;
  }
}
```

### 3. Simplified Installation Process

```javascript
// New postinstall.js - much simpler
#!/usr/bin/env node

console.log('🔧 Configuring figma-restoration-mcp-vue-tools...');
console.log('✅ Puppeteer with bundled Chromium installed successfully!');
console.log('');
console.log('📚 Next steps:');
console.log('1. Start MCP server: npx figma-restoration-mcp-vue-tools start');
console.log('2. Check documentation: https://github.com/tianmuji/figma-restoration-mcp-vue-tools');
```

### 4. Updated SnapDOM Screenshot Tool

```javascript
export class SnapDOMScreenshotTool {
  async execute(args) {
    try {
      // Simplified browser launch - no path detection needed
      const browser = await puppeteerManager.launchBrowser();
      
      // Rest of the implementation remains the same
      // ...
      
    } catch (error) {
      if (error instanceof PuppeteerLaunchError) {
        console.error('Browser launch failed:', error.message);
        console.log('Suggested solutions:');
        error.solutions.forEach(solution => console.log(`- ${solution}`));
      }
      throw error;
    }
  }
}
```

## Data Models

### 1. Package Configuration

```json
{
  "name": "figma-restoration-mcp-vue-tools",
  "dependencies": {
    "puppeteer": "^21.11.0"
  },
  "scripts": {
    "postinstall": "node scripts/postinstall.js"
  }
}
```

### 2. Browser Launch Options

```javascript
const BrowserLaunchOptions = {
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
};
```

### 3. Error Response Format

```javascript
const ErrorResponse = {
  success: false,
  error: {
    type: 'PuppeteerLaunchError',
    message: 'Failed to launch browser',
    solutions: [
      'Check network connectivity',
      'Verify firewall settings',
      'Try reinstalling: npm install --force'
    ]
  }
};
```

## Error Handling

### 1. Browser Launch Errors

```javascript
try {
  const browser = await puppeteer.launch(options);
} catch (error) {
  if (error.message.includes('ECONNREFUSED')) {
    throw new NetworkError('Network connectivity issue', error);
  } else if (error.message.includes('Permission denied')) {
    throw new PermissionError('File system permission issue', error);
  } else {
    throw new PuppeteerLaunchError('Generic browser launch failure', error);
  }
}
```

### 2. Installation Errors

```javascript
// In postinstall.js
try {
  console.log('✅ Puppeteer installation completed');
} catch (error) {
  console.error('❌ Installation failed:', error.message);
  console.log('🔧 Troubleshooting:');
  console.log('1. Clear npm cache: npm cache clean --force');
  console.log('2. Reinstall: npm install --force');
  console.log('3. Check Node.js version: node --version (requires >=18.0.0)');
}
```

### 3. Runtime Errors

```javascript
// Enhanced error messages for common issues
const ErrorMessages = {
  NETWORK_ERROR: 'Network connectivity issue. Check your internet connection.',
  PERMISSION_ERROR: 'Permission denied. Check file system permissions.',
  TIMEOUT_ERROR: 'Operation timed out. Try increasing timeout or check system resources.',
  MEMORY_ERROR: 'Insufficient memory. Close other applications or increase system memory.'
};
```

## Testing Strategy

### 1. Unit Tests

```javascript
describe('PuppeteerManager', () => {
  test('should launch browser successfully', async () => {
    const manager = new PuppeteerManager();
    const browser = await manager.launchBrowser();
    expect(browser).toBeDefined();
    await manager.closeBrowser();
  });

  test('should handle launch errors gracefully', async () => {
    const manager = new PuppeteerManager();
    // Mock network error
    jest.spyOn(puppeteer, 'launch').mockRejectedValue(new Error('ECONNREFUSED'));
    
    await expect(manager.launchBrowser()).rejects.toThrow(PuppeteerLaunchError);
  });
});
```

### 2. Integration Tests

```javascript
describe('SnapDOMScreenshotTool', () => {
  test('should take screenshot without Chrome path configuration', async () => {
    const tool = new SnapDOMScreenshotTool();
    const result = await tool.execute({
      componentName: 'TestComponent',
      port: 3000
    });
    
    expect(result.success).toBe(true);
    expect(result.screenshot.path).toBeDefined();
  });
});
```

### 3. Cross-Platform Tests

```javascript
describe('Cross-platform compatibility', () => {
  test.each(['darwin', 'linux', 'win32'])('should work on %s', async (platform) => {
    Object.defineProperty(process, 'platform', { value: platform });
    
    const manager = new PuppeteerManager();
    const browser = await manager.launchBrowser();
    expect(browser).toBeDefined();
    await manager.closeBrowser();
  });
});
```

## Performance Considerations

### 1. Browser Instance Reuse

```javascript
export class PuppeteerManager {
  constructor() {
    this.browser = null;
    this.pagePool = [];
  }

  async getPage() {
    if (this.pagePool.length > 0) {
      return this.pagePool.pop();
    }
    
    if (!this.browser) {
      this.browser = await this.launchBrowser();
    }
    
    return await this.browser.newPage();
  }

  async releasePage(page) {
    await page.goto('about:blank');
    this.pagePool.push(page);
  }
}
```

### 2. Memory Management

```javascript
// Automatic cleanup after operations
async takeScreenshot(options) {
  const page = await this.getPage();
  try {
    // Screenshot logic
    return result;
  } finally {
    await this.releasePage(page);
  }
}
```

### 3. Startup Optimization

```javascript
// Pre-warm browser instance
export class PuppeteerManager {
  async warmup() {
    if (!this.browser) {
      console.log('🔥 Pre-warming browser instance...');
      this.browser = await this.launchBrowser();
    }
  }
}
```

## Migration Strategy

### 1. Backward Compatibility

- Keep existing MCP tool APIs unchanged
- Maintain same output formats and file structures
- Preserve existing configuration options where possible

### 2. Deprecation Plan

```javascript
// Warn about deprecated environment variables
if (process.env.PUPPETEER_EXECUTABLE_PATH) {
  console.warn('⚠️  PUPPETEER_EXECUTABLE_PATH is deprecated and will be ignored');
  console.warn('   Puppeteer now uses bundled Chromium automatically');
}
```

### 3. Documentation Updates

- Update installation instructions
- Remove Chrome installation requirements
- Simplify troubleshooting guides
- Add migration notes for existing users

## Security Considerations

### 1. Sandboxing

```javascript
const secureArgs = [
  '--no-sandbox',           // Required for containerized environments
  '--disable-setuid-sandbox',
  '--disable-dev-shm-usage',
  '--disable-gpu',
  '--no-first-run',
  '--no-zygote'
];
```

### 2. Network Security

```javascript
// Restrict network access if needed
const restrictedArgs = [
  '--disable-web-security',
  '--disable-features=VizDisplayCompositor',
  '--proxy-server="direct://"',
  '--proxy-bypass-list=*'
];
```

### 3. File System Access

```javascript
// Ensure output directories are within project bounds
function validateOutputPath(outputPath, projectPath) {
  const resolvedOutput = path.resolve(outputPath);
  const resolvedProject = path.resolve(projectPath);
  
  if (!resolvedOutput.startsWith(resolvedProject)) {
    throw new SecurityError('Output path must be within project directory');
  }
}
```