#!/usr/bin/env node

// 简单的调试脚本，测试截图工具的各个组件

async function debugComponents() {
  console.log('🔍 Debugging screenshot tool components...');
  
  try {
    // 1. 测试基本导入
    console.log('1️⃣ Testing basic imports...');
    
    const fs = await import('fs/promises');
    console.log('✅ fs/promises imported');
    
    const path = await import('path');
    console.log('✅ path imported');
    
    const chalk = await import('chalk');
    console.log('✅ chalk imported');
    
    // 2. 测试路径配置
    console.log('\n2️⃣ Testing path configuration...');
    const { ensureDirectory } = await import('./src/utils/path-config.js');
    console.log('✅ path-config imported');
    
    // 3. 测试 Puppeteer 错误类
    console.log('\n3️⃣ Testing Puppeteer errors...');
    const { PuppeteerLaunchError } = await import('./src/utils/puppeteer-errors.js');
    console.log('✅ puppeteer-errors imported');
    
    // 4. 测试 Puppeteer Manager
    console.log('\n4️⃣ Testing Puppeteer Manager...');
    const { puppeteerManager } = await import('./src/utils/puppeteer-manager.js');
    console.log('✅ puppeteer-manager imported');
    
    // 5. 测试截图工具类
    console.log('\n5️⃣ Testing SnapDOM Screenshot Tool...');
    const { SnapDOMScreenshotTool } = await import('./src/tools/snapdom-screenshot.js');
    console.log('✅ snapdom-screenshot imported');
    
    const tool = new SnapDOMScreenshotTool();
    console.log('✅ SnapDOMScreenshotTool instantiated');
    console.log('   - Default timeout:', tool.DEFAULT_TIMEOUT);
    console.log('   - Description:', tool.description);
    
    // 6. 测试目录创建
    console.log('\n6️⃣ Testing directory creation...');
    const testDir = '/Users/yujie_wu/Documents/study/11111/figma-restoration-mcp-vue-tools/src/components/DesignV1/results';
    await ensureDirectory(testDir);
    console.log('✅ Directory ensured:', testDir);
    
    // 7. 测试服务器连接（不实际连接，只是测试方法）
    console.log('\n7️⃣ Testing server check method...');
    const serverResult = await tool.ensureDevServerRunning(1933, '/Users/yujie_wu/Documents/study/11111/figma-restoration-mcp-vue-tools');
    console.log('✅ Server check method executed:', serverResult);
    
    console.log('\n🎉 All components loaded successfully!');
    console.log('💡 The issue might be in the actual screenshot execution or browser launch.');
    
  } catch (error) {
    console.error('❌ Debug failed at:', error.message);
    console.error('📋 Stack trace:', error.stack);
  }
}

debugComponents();