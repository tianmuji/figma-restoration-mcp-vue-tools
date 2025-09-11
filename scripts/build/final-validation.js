#!/usr/bin/env node

/**
 * 最终验证脚本
 * 验证重构后的项目完整性和功能
 */

import fs from 'fs';
import path from 'path';

const validationResults = {
  timestamp: new Date().toISOString(),
  version: '4.1.0',
  checks: {},
  summary: {}
};

/**
 * 检查目录结构完整性
 */
function checkDirectoryStructure() {
  console.log('🏗️ 检查目录结构完整性...');
  
  const expectedDirs = [
    'src/core/analyzers',
    'src/core/comparators', 
    'src/core/processors',
    'src/ui/pages',
    'src/ui/layouts',
    'src/ui/common',
    'src/types',
    'src/tools',
    'src/services',
    'src/utils',
    'scripts/build',
    'scripts/deploy',
    'scripts/setup',
    'tests/unit',
    'tests/integration',
    'tests/fixtures'
  ];
  
  const results = {
    total: expectedDirs.length,
    found: 0,
    missing: [],
    valid: []
  };
  
  for (const dir of expectedDirs) {
    if (fs.existsSync(dir)) {
      results.found++;
      results.valid.push(dir);
    } else {
      results.missing.push(dir);
    }
  }
  
  results.successRate = (results.found / results.total) * 100;
  
  console.log(`✅ 找到 ${results.found}/${results.total} 个目录`);
  console.log(`   成功率: ${results.successRate.toFixed(1)}%`);
  
  if (results.missing.length > 0) {
    console.log(`❌ 缺失目录: ${results.missing.join(', ')}`);
  }
  
  return results;
}

/**
 * 检查核心文件完整性
 */
function checkCoreFiles() {
  console.log('\n📦 检查核心文件完整性...');
  
  const expectedFiles = [
    'src/core/analyzers/figma-analyzer.ts',
    'src/core/analyzers/layout-analyzer.ts',
    'src/core/analyzers/material-analyzer.ts',
    'src/core/comparators/image-comparator.ts',
    'src/core/comparators/layout-comparator.ts',
    'src/core/comparators/style-comparator.ts',
    'src/core/processors/screenshot-processor.ts',
    'src/core/processors/svg-processor.ts',
    'src/core/processors/report-processor.ts',
    'src/types/analyzer.ts',
    'src/types/comparator.ts',
    'src/types/processor.ts',
    'src/types/index.ts',
    'package.json',
    'vite.config.js',
    'tsconfig.json',
    'jest.config.js',
    '.babelrc'
  ];
  
  const results = {
    total: expectedFiles.length,
    found: 0,
    missing: [],
    valid: []
  };
  
  for (const file of expectedFiles) {
    if (fs.existsSync(file)) {
      results.found++;
      results.valid.push(file);
    } else {
      results.missing.push(file);
    }
  }
  
  results.successRate = (results.found / results.total) * 100;
  
  console.log(`✅ 找到 ${results.found}/${results.total} 个文件`);
  console.log(`   成功率: ${results.successRate.toFixed(1)}%`);
  
  if (results.missing.length > 0) {
    console.log(`❌ 缺失文件: ${results.missing.join(', ')}`);
  }
  
  return results;
}

/**
 * 检查配置文件有效性
 */
function checkConfigFiles() {
  console.log('\n⚙️ 检查配置文件有效性...');
  
  const configFiles = [
    { path: 'package.json', check: (content) => JSON.parse(content) },
    { path: 'vite.config.js', check: (content) => content.includes('resolve') },
    { path: 'tsconfig.json', check: (content) => JSON.parse(content) },
    { path: 'jest.config.js', check: (content) => content.includes('moduleNameMapper') },
    { path: '.babelrc', check: (content) => JSON.parse(content) }
  ];
  
  const results = {
    total: configFiles.length,
    valid: 0,
    invalid: [],
    errors: []
  };
  
  for (const config of configFiles) {
    try {
      const content = fs.readFileSync(config.path, 'utf8');
      config.check(content);
      results.valid++;
    } catch (error) {
      results.invalid.push(config.path);
      results.errors.push(`${config.path}: ${error.message}`);
    }
  }
  
  results.successRate = (results.valid / results.total) * 100;
  
  console.log(`✅ 验证 ${results.valid}/${results.total} 个配置文件`);
  console.log(`   成功率: ${results.successRate.toFixed(1)}%`);
  
  if (results.errors.length > 0) {
    console.log(`❌ 配置错误:`);
    results.errors.forEach(error => console.log(`   ${error}`));
  }
  
  return results;
}

/**
 * 检查导入路径别名
 */
function checkImportAliases() {
  console.log('\n🔗 检查导入路径别名...');
  
  const aliasPatterns = [
    '@/core/',
    '@/ui/',
    '@/utils/',
    '@/services/',
    '@/types/',
    '@/components/',
    '@/tools/'
  ];
  
  const results = {
    total: aliasPatterns.length,
    found: 0,
    missing: [],
    valid: []
  };
  
  // 检查 vite.config.js 中的别名配置
  try {
    const viteConfig = fs.readFileSync('vite.config.js', 'utf8');
    for (const alias of aliasPatterns) {
      if (viteConfig.includes(alias)) {
        results.found++;
        results.valid.push(alias);
      } else {
        results.missing.push(alias);
      }
    }
  } catch (error) {
    results.errors = [error.message];
  }
  
  results.successRate = (results.found / results.total) * 100;
  
  console.log(`✅ 找到 ${results.found}/${results.total} 个路径别名`);
  console.log(`   成功率: ${results.successRate.toFixed(1)}%`);
  
  if (results.missing.length > 0) {
    console.log(`❌ 缺失别名: ${results.missing.join(', ')}`);
  }
  
  return results;
}

/**
 * 检查测试覆盖率
 */
function checkTestCoverage() {
  console.log('\n🧪 检查测试覆盖率...');
  
  const testDirs = [
    'tests/unit',
    'tests/integration',
    'tests/fixtures'
  ];
  
  const results = {
    total: testDirs.length,
    found: 0,
    testFiles: 0,
    valid: []
  };
  
  for (const dir of testDirs) {
    if (fs.existsSync(dir)) {
      results.found++;
      results.valid.push(dir);
      
      // 计算测试文件数量
      const countTestFiles = (dirPath) => {
        let count = 0;
        try {
          const items = fs.readdirSync(dirPath);
          for (const item of items) {
            const fullPath = path.join(dirPath, item);
            const stat = fs.statSync(fullPath);
            if (stat.isDirectory()) {
              count += countTestFiles(fullPath);
            } else if (item.endsWith('.test.js') || item.endsWith('.test.ts')) {
              count++;
            }
          }
        } catch (error) {
          // 忽略错误
        }
        return count;
      };
      
      results.testFiles += countTestFiles(dir);
    }
  }
  
  results.successRate = (results.found / results.total) * 100;
  
  console.log(`✅ 找到 ${results.found}/${results.total} 个测试目录`);
  console.log(`   发现 ${results.testFiles} 个测试文件`);
  console.log(`   成功率: ${results.successRate.toFixed(1)}%`);
  
  return results;
}

/**
 * 运行所有验证检查
 */
function runAllValidations() {
  console.log('🔍 开始最终验证检查...\n');
  
  // 目录结构检查
  validationResults.checks.directoryStructure = checkDirectoryStructure();
  
  // 核心文件检查
  validationResults.checks.coreFiles = checkCoreFiles();
  
  // 配置文件检查
  validationResults.checks.configFiles = checkConfigFiles();
  
  // 导入别名检查
  validationResults.checks.importAliases = checkImportAliases();
  
  // 测试覆盖率检查
  validationResults.checks.testCoverage = checkTestCoverage();
  
  // 计算总体结果
  const allChecks = Object.values(validationResults.checks);
  const totalSuccessRate = allChecks.reduce((sum, check) => sum + check.successRate, 0) / allChecks.length;
  const allPassed = allChecks.every(check => check.successRate === 100);
  
  validationResults.summary = {
    totalChecks: allChecks.length,
    passedChecks: allChecks.filter(check => check.successRate === 100).length,
    overallSuccessRate: totalSuccessRate,
    allPassed,
    timestamp: new Date().toISOString()
  };
  
  console.log('\n📊 最终验证结果:');
  console.log(`   检查项目: ${validationResults.summary.totalChecks}`);
  console.log(`   通过检查: ${validationResults.summary.passedChecks}`);
  console.log(`   总体成功率: ${validationResults.summary.overallSuccessRate.toFixed(1)}%`);
  console.log(`   全部通过: ${validationResults.summary.allPassed ? '✅' : '❌'}`);
  console.log(`   验证时间: ${validationResults.summary.timestamp}\n`);
  
  if (validationResults.summary.allPassed) {
    console.log('🎉 恭喜！所有验证检查都通过了！');
    console.log('✅ 项目重构完成，可以安全使用。');
  } else {
    console.log('⚠️ 部分验证检查未通过，请检查上述问题。');
  }
  
  // 保存结果
  const resultsPath = './validation-results.json';
  fs.writeFileSync(resultsPath, JSON.stringify(validationResults, null, 2));
  console.log(`💾 验证结果已保存到: ${resultsPath}`);
  
  return validationResults;
}

// 运行验证
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllValidations();
}

export { runAllValidations }; 