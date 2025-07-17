import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { enhancedCompareImages } from './enhanced-compare.js';
import { smartFix } from './smart-fix.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 完整的分析和修复流程
 */
async function analyzeAndFix(componentName) {
  console.log(`🚀 开始完整分析和修复流程: ${componentName}`);
  console.log('='.repeat(60));
  
  const resultsDir = path.join(__dirname, '../results', componentName);
  const expectedPath = path.join(resultsDir, `${componentName}_expected.png`);
  const actualPath = path.join(resultsDir, 'actual.png');
  const diffPath = path.join(resultsDir, 'diff.png');
  
  // 检查必需文件
  if (!fs.existsSync(expectedPath)) {
    console.error(`❌ 未找到期望图片: ${expectedPath}`);
    return;
  }
  
  if (!fs.existsSync(actualPath)) {
    console.error(`❌ 未找到实际图片: ${actualPath}`);
    console.log('   请先运行截图工具生成实际图片');
    return;
  }
  
  try {
    // 第一步：增强对比分析
    console.log('\n📊 第一步：增强对比分析');
    console.log('-'.repeat(30));
    const compareResult = await enhancedCompareImages(expectedPath, actualPath, diffPath, componentName);
    
    if (!compareResult.success) {
      console.error('❌ 对比分析失败:', compareResult.error);
      return;
    }
    
    // 第二步：智能修复建议
    console.log('\n🔧 第二步：智能修复建议');
    console.log('-'.repeat(30));
    const fixReport = await smartFix(componentName);
    
    if (!fixReport) {
      console.error('❌ 生成修复建议失败');
      return;
    }
    
    // 第三步：生成综合报告
    console.log('\n📋 第三步：生成综合报告');
    console.log('-'.repeat(30));
    const comprehensiveReport = generateComprehensiveReport(componentName, compareResult, fixReport);
    
    // 保存综合报告
    const reportPath = path.join(resultsDir, 'comprehensive-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(comprehensiveReport, null, 2));
    
    // 生成Markdown报告
    const markdownReport = generateMarkdownReport(comprehensiveReport);
    const markdownPath = path.join(resultsDir, 'analysis-report.md');
    fs.writeFileSync(markdownPath, markdownReport);
    
    console.log('\n🎉 分析完成！');
    console.log(`📊 还原度: ${compareResult.matchPercentage}%`);
    console.log(`🔍 发现问题: ${fixReport.totalIssues} 个`);
    console.log(`📄 综合报告: ${reportPath}`);
    console.log(`📝 Markdown报告: ${markdownPath}`);
    
    return comprehensiveReport;
    
  } catch (error) {
    console.error('❌ 分析流程失败:', error.message);
    return null;
  }
}

/**
 * 生成综合报告
 */
function generateComprehensiveReport(componentName, compareResult, fixReport) {
  return {
    componentName,
    timestamp: new Date().toISOString(),
    analysis: {
      matchPercentage: compareResult.matchPercentage,
      diffPixels: compareResult.diffPixels,
      totalPixels: compareResult.totalPixels,
      diffRegions: compareResult.diffRegions,
      figmaMatches: compareResult.figmaMatches
    },
    fixes: {
      totalIssues: fixReport.totalIssues,
      priorityBreakdown: fixReport.priorityBreakdown,
      suggestions: fixReport.suggestions,
      cssCode: fixReport.cssCode
    },
    summary: {
      status: getStatus(compareResult.matchPercentage),
      recommendation: getRecommendation(compareResult.matchPercentage, fixReport.priorityBreakdown),
      nextSteps: getNextSteps(compareResult.matchPercentage, fixReport.priorityBreakdown)
    }
  };
}

/**
 * 获取状态评级
 */
function getStatus(matchPercentage) {
  if (matchPercentage >= 95) return '🏆 优秀';
  if (matchPercentage >= 90) return '👍 良好';
  if (matchPercentage >= 85) return '⚠️ 需改进';
  return '❌ 不合格';
}

/**
 * 获取建议
 */
function getRecommendation(matchPercentage, priorityBreakdown) {
  if (matchPercentage >= 95) {
    return '组件还原度已达到优秀标准，可以投入使用';
  }
  
  if (priorityBreakdown.high > 0) {
    return `优先修复 ${priorityBreakdown.high} 个高优先级问题，预计可提升还原度 5-10%`;
  }
  
  if (priorityBreakdown.medium > 0) {
    return `建议修复 ${priorityBreakdown.medium} 个中优先级问题，预计可提升还原度 3-5%`;
  }
  
  return '继续优化细节问题，逐步提升还原度';
}

/**
 * 获取下一步行动
 */
function getNextSteps(matchPercentage, priorityBreakdown) {
  const steps = [];
  
  if (priorityBreakdown.high > 0) {
    steps.push('1. 立即修复所有高优先级问题');
    steps.push('2. 重新截图并对比验证');
  }
  
  if (priorityBreakdown.medium > 0) {
    steps.push(`${steps.length + 1}. 修复中优先级问题`);
  }
  
  if (matchPercentage < 95) {
    steps.push(`${steps.length + 1}. 继续迭代优化直到达到95%+还原度`);
  }
  
  steps.push(`${steps.length + 1}. 更新组件文档和使用说明`);
  
  return steps;
}

/**
 * 生成Markdown报告
 */
function generateMarkdownReport(report) {
  const { componentName, analysis, fixes, summary } = report;
  
  return `# ${componentName} 组件还原分析报告

## 📊 总体评估

- **还原度**: ${analysis.matchPercentage}%
- **状态**: ${summary.status}
- **发现问题**: ${fixes.totalIssues} 个
- **生成时间**: ${new Date(report.timestamp).toLocaleString('zh-CN')}

## 🎯 问题分布

| 优先级 | 数量 | 说明 |
|--------|------|------|
| 🔴 高优先级 | ${fixes.priorityBreakdown.high} | 需要立即修复 |
| 🟡 中优先级 | ${fixes.priorityBreakdown.medium} | 建议优化 |
| 🟢 低优先级 | ${fixes.priorityBreakdown.low} | 可选优化 |

## 🔍 差异区域分析

发现 ${analysis.diffRegions.length} 个主要差异区域：

${analysis.diffRegions.map((region, index) => `
### 区域 ${index + 1}
- **位置**: (${region.left}, ${region.top}) → (${region.right}, ${region.bottom})
- **尺寸**: ${region.width} × ${region.height}
- **中心点**: (${region.center.x}, ${region.center.y})
- **像素数**: ${region.pixelCount}
`).join('')}

## 🔧 修复建议

${fixes.suggestions.map((suggestion, index) => `
### ${index + 1}. [${suggestion.priority.toUpperCase()}] ${suggestion.message}

**坐标信息**:
- ${suggestion.coordinates}
${suggestion.actualCoordinates ? `- ${suggestion.actualCoordinates}` : ''}

**修复方案**:
${suggestion.fixes.map(fix => `- ${fix}`).join('\n')}
`).join('')}

## 💡 总结建议

${summary.recommendation}

## 📋 下一步行动

${summary.nextSteps.map(step => `${step}`).join('\n')}

## 🎨 CSS修复代码

\`\`\`css
${fixes.cssCode}
\`\`\`

---
*报告生成时间: ${new Date(report.timestamp).toLocaleString('zh-CN')}*
`;
}

// 命令行工具
if (import.meta.url === `file://${process.argv[1]}`) {
  const componentName = process.argv[2];
  if (!componentName) {
    console.error('用法: node analyze-and-fix.js <组件名>');
    console.log('\n示例:');
    console.log('  node analyze-and-fix.js ExchangeSuccess');
    console.log('  node analyze-and-fix.js ScanResult');
    process.exit(1);
  }
  
  analyzeAndFix(componentName);
}

export { analyzeAndFix, generateComprehensiveReport };
