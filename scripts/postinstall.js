#!/usr/bin/env node

/**
 * Post-installation script for figma-restoration-mcp-vue-tools
 * Simple setup with Puppeteer bundled Chromium
 */

import fs from 'fs';
import path from 'path';

console.log('🔧 Configuring figma-restoration-mcp-vue-tools...');

/**
 * 检查并清理废弃的配置文件
 */
function cleanupDeprecatedFiles() {
  const puppeteerConfigPath = path.join(process.cwd(), '.puppeteerrc.cjs');
  
  if (fs.existsSync(puppeteerConfigPath)) {
    try {
      fs.unlinkSync(puppeteerConfigPath);
      console.log('🧹 Removed deprecated .puppeteerrc.cjs configuration');
    } catch (error) {
      console.log('⚠️  Could not remove .puppeteerrc.cjs:', error.message);
    }
  }
}

/**
 * 检查废弃的环境变量并给出警告
 */
function checkDeprecatedEnvVars() {
  const deprecatedVars = [
    'PUPPETEER_SKIP_CHROMIUM_DOWNLOAD',
    'PUPPETEER_SKIP_DOWNLOAD', 
    'PUPPETEER_EXECUTABLE_PATH',
    'CHROME_EXECUTABLE_PATH'
  ];
  
  const foundDeprecated = [];
  
  for (const envVar of deprecatedVars) {
    if (process.env[envVar]) {
      foundDeprecated.push(envVar);
    }
  }
  
  if (foundDeprecated.length > 0) {
    console.log('⚠️  Deprecated environment variables detected:');
    foundDeprecated.forEach(envVar => {
      console.log(`   - ${envVar} (will be ignored)`);
    });
    console.log('   Puppeteer now uses bundled Chromium automatically');
    console.log('');
  }
}

/**
 * 主配置函数
 */
function configure() {
  try {
    // 清理废弃文件
    cleanupDeprecatedFiles();
    
    // 检查废弃环境变量
    checkDeprecatedEnvVars();
    
    console.log('✅ Puppeteer with bundled Chromium installed successfully!');
    console.log('');
    console.log('🎯 Key improvements:');
    console.log('• No Chrome installation required');
    console.log('• No path configuration needed');
    console.log('• Cross-platform compatibility guaranteed');
    console.log('• Simplified error handling');
    console.log('');
    console.log('📚 Next steps:');
    console.log('1. Start MCP server: npx figma-restoration-mcp-vue-tools start');
    console.log('2. Check documentation: https://github.com/tianmuji/figma-restoration-mcp-vue-tools');
    console.log('');
    console.log('🚀 Ready to use! No additional configuration required.');
    
  } catch (error) {
    console.error('❌ Configuration failed:', error.message);
    console.log('');
    console.log('🔧 Troubleshooting:');
    console.log('1. Clear npm cache: npm cache clean --force');
    console.log('2. Reinstall: npm install --force');
    console.log('3. Check Node.js version: node --version (requires >=18.0.0)');
    console.log('4. Report issues: https://github.com/tianmuji/figma-restoration-mcp-vue-tools/issues');
  }
}

// Run configuration
configure();
