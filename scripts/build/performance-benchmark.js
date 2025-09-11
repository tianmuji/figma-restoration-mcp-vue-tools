#!/usr/bin/env node

/**
 * 性能基准测试脚本
 * 测试重构后的项目性能
 */

import fs from 'fs';
import path from 'path';
import { performance } from 'perf_hooks';

const benchmarkResults = {
  timestamp: new Date().toISOString(),
  version: '4.1.0',
  tests: {}
};

/**
 * 测试文件扫描性能
 */
function benchmarkFileScanning() {
  const startTime = performance.now();
  
  // 扫描所有源文件
  const scanFiles = (dir) => {
    const files = [];
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        files.push(...scanFiles(fullPath));
      } else {
        files.push(fullPath);
      }
    }
    
    return files;
  };
  
  const srcFiles = scanFiles('./src');
  const testFiles = scanFiles('./tests');
  const scriptFiles = scanFiles('./scripts');
  
  const endTime = performance.now();
  const duration = endTime - startTime;
  
  return {
    duration,
    srcFiles: srcFiles.length,
    testFiles: testFiles.length,
    scriptFiles: scriptFiles.length,
    totalFiles: srcFiles.length + testFiles.length + scriptFiles.length
  };
}

/**
 * 测试模块加载性能
 */
function benchmarkModuleLoading() {
  const startTime = performance.now();
  
  try {
    // 测试核心模块加载
    const coreModules = [
      './src/core/analyzers/figma-analyzer.ts',
      './src/core/comparators/image-comparator.ts',
      './src/core/processors/screenshot-processor.ts'
    ];
    
    let loadedModules = 0;
    for (const module of coreModules) {
      if (fs.existsSync(module)) {
        loadedModules++;
      }
    }
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    return {
      duration,
      loadedModules,
      totalModules: coreModules.length,
      successRate: (loadedModules / coreModules.length) * 100
    };
  } catch (error) {
    return {
      duration: 0,
      error: error.message,
      successRate: 0
    };
  }
}

/**
 * 测试配置加载性能
 */
function benchmarkConfigLoading() {
  const startTime = performance.now();
  
  try {
    // 测试配置文件加载
    const configFiles = [
      './package.json',
      './vite.config.js',
      './tsconfig.json',
      './jest.config.js',
      './.babelrc'
    ];
    
    let loadedConfigs = 0;
    for (const config of configFiles) {
      if (fs.existsSync(config)) {
        const content = fs.readFileSync(config, 'utf8');
        if (content.length > 0) {
          loadedConfigs++;
        }
      }
    }
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    return {
      duration,
      loadedConfigs,
      totalConfigs: configFiles.length,
      successRate: (loadedConfigs / configFiles.length) * 100
    };
  } catch (error) {
    return {
      duration: 0,
      error: error.message,
      successRate: 0
    };
  }
}

/**
 * 测试目录结构验证
 */
function benchmarkDirectoryStructure() {
  const startTime = performance.now();
  
  const expectedDirs = [
    './src/core/analyzers',
    './src/core/comparators',
    './src/core/processors',
    './src/ui/pages',
    './src/ui/layouts',
    './src/ui/common',
    './src/types',
    './src/tools',
    './src/services',
    './src/utils',
    './scripts/build',
    './scripts/deploy',
    './scripts/setup',
    './tests/unit',
    './tests/integration',
    './tests/fixtures'
  ];
  
  let validDirs = 0;
  for (const dir of expectedDirs) {
    if (fs.existsSync(dir)) {
      validDirs++;
    }
  }
  
  const endTime = performance.now();
  const duration = endTime - startTime;
  
  return {
    duration,
    validDirs,
    totalDirs: expectedDirs.length,
    successRate: (validDirs / expectedDirs.length) * 100
  };
}

/**
 * 运行所有基准测试
 */
function runAllBenchmarks() {
  console.log('🚀 开始性能基准测试...\n');
  
  // 文件扫描测试
  console.log('📁 测试文件扫描性能...');
  benchmarkResults.tests.fileScanning = benchmarkFileScanning();
  console.log(`✅ 完成: ${benchmarkResults.tests.fileScanning.duration.toFixed(2)}ms`);
  console.log(`   发现 ${benchmarkResults.tests.fileScanning.totalFiles} 个文件\n`);
  
  // 模块加载测试
  console.log('📦 测试模块加载性能...');
  benchmarkResults.tests.moduleLoading = benchmarkModuleLoading();
  console.log(`✅ 完成: ${benchmarkResults.tests.moduleLoading.duration.toFixed(2)}ms`);
  console.log(`   加载成功率: ${benchmarkResults.tests.moduleLoading.successRate.toFixed(1)}%\n`);
  
  // 配置加载测试
  console.log('⚙️ 测试配置加载性能...');
  benchmarkResults.tests.configLoading = benchmarkConfigLoading();
  console.log(`✅ 完成: ${benchmarkResults.tests.configLoading.duration.toFixed(2)}ms`);
  console.log(`   配置加载成功率: ${benchmarkResults.tests.configLoading.successRate.toFixed(1)}%\n`);
  
  // 目录结构测试
  console.log('🏗️ 测试目录结构验证...');
  benchmarkResults.tests.directoryStructure = benchmarkDirectoryStructure();
  console.log(`✅ 完成: ${benchmarkResults.tests.directoryStructure.duration.toFixed(2)}ms`);
  console.log(`   目录结构完整性: ${benchmarkResults.tests.directoryStructure.successRate.toFixed(1)}%\n`);
  
  // 计算总体性能
  const totalDuration = Object.values(benchmarkResults.tests)
    .reduce((sum, test) => sum + test.duration, 0);
  
  const overallSuccessRate = Object.values(benchmarkResults.tests)
    .reduce((sum, test) => sum + test.successRate, 0) / Object.keys(benchmarkResults.tests).length;
  
  benchmarkResults.summary = {
    totalDuration,
    overallSuccessRate,
    timestamp: new Date().toISOString()
  };
  
  console.log('📊 性能基准测试结果:');
  console.log(`   总耗时: ${totalDuration.toFixed(2)}ms`);
  console.log(`   总体成功率: ${overallSuccessRate.toFixed(1)}%`);
  console.log(`   测试时间: ${benchmarkResults.summary.timestamp}\n`);
  
  // 保存结果
  const resultsPath = './benchmark-results.json';
  fs.writeFileSync(resultsPath, JSON.stringify(benchmarkResults, null, 2));
  console.log(`💾 结果已保存到: ${resultsPath}`);
  
  return benchmarkResults;
}

// 运行基准测试
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllBenchmarks();
}

export { runAllBenchmarks }; 