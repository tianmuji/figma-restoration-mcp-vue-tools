import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { enhancedCompareImages } from './enhanced-compare.js';
import { smartFix } from './smart-fix.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Figma差异分析器 - MCP工具集成版
 */
class FigmaDiffAnalyzer {
  constructor(componentName) {
    this.componentName = componentName;
    this.resultsDir = path.join(__dirname, '../results', componentName);
    this.expectedPath = path.join(this.resultsDir, `${componentName}_expected.png`);
    this.actualPath = path.join(this.resultsDir, 'actual.png');
    this.diffPath = path.join(this.resultsDir, 'diff.png');
    this.figmaDataPath = path.join(this.resultsDir, 'complete-figma-data.json');
  }

  /**
   * 完整的差异分析流程
   */
  async analyze() {
    console.log(`🔍 开始Figma差异分析: ${this.componentName}`);
    console.log('='.repeat(60));

    // 检查必需文件
    if (!this.checkRequiredFiles()) {
      return null;
    }

    try {
      // 第一步：增强对比分析
      console.log('\n📊 第一步：增强对比分析');
      console.log('-'.repeat(30));
      const compareResult = await enhancedCompareImages(
        this.expectedPath, 
        this.actualPath, 
        this.diffPath, 
        this.componentName
      );

      if (!compareResult.success) {
        console.error('❌ 对比分析失败:', compareResult.error);
        return null;
      }

      // 第二步：智能修复建议
      console.log('\n🔧 第二步：智能修复建议');
      console.log('-'.repeat(30));
      const fixReport = await smartFix(this.componentName);

      if (!fixReport) {
        console.error('❌ 生成修复建议失败');
        return null;
      }

      // 第三步：生成综合分析报告
      console.log('\n📋 第三步：生成综合分析报告');
      console.log('-'.repeat(30));
      const analysisReport = this.generateAnalysisReport(compareResult, fixReport);

      // 保存报告
      await this.saveReports(analysisReport);

      // 输出总结
      this.printSummary(analysisReport);

      return analysisReport;

    } catch (error) {
      console.error('❌ 分析流程失败:', error.message);
      return null;
    }
  }

  /**
   * 检查必需文件
   */
  checkRequiredFiles() {
    const requiredFiles = [
      { path: this.expectedPath, name: '期望图片' },
      { path: this.actualPath, name: '实际图片' }
    ];

    for (const file of requiredFiles) {
      if (!fs.existsSync(file.path)) {
        console.error(`❌ 未找到${file.name}: ${file.path}`);
        return false;
      }
    }

    return true;
  }

  /**
   * 生成综合分析报告
   */
  generateAnalysisReport(compareResult, fixReport) {
    const diffRegions = compareResult.diffRegions || [];
    const figmaMatches = compareResult.figmaMatches || [];

    return {
      componentName: this.componentName,
      timestamp: new Date().toISOString(),
      
      // 基础对比数据
      comparison: {
        matchPercentage: compareResult.matchPercentage,
        diffPixels: compareResult.diffPixels,
        totalPixels: compareResult.totalPixels,
        dimensions: compareResult.dimensions
      },

      // 差异区域分析
      diffAnalysis: {
        totalRegions: diffRegions.length,
        regions: diffRegions.map((region, index) => ({
          id: index + 1,
          coordinates: {
            left: region.left,
            top: region.top,
            right: region.right,
            bottom: region.bottom,
            width: region.width,
            height: region.height,
            center: region.center
          },
          pixelCount: region.pixelCount,
          severity: this.calculateSeverity(region.pixelCount, region.width * region.height)
        }))
      },

      // Figma元素匹配
      figmaMatching: {
        totalMatches: figmaMatches.length,
        matches: figmaMatches.map((match, index) => ({
          regionId: index + 1,
          region: match.region,
          elements: match.elements.map(element => ({
            id: element.id,
            name: element.name,
            type: element.type,
            boundingBox: element.boundingBox,
            confidence: element.confidence || 0,
            overlapPercentage: element.overlapPercentage || 0
          }))
        }))
      },

      // 修复建议
      fixSuggestions: {
        totalIssues: fixReport.totalIssues,
        priorityBreakdown: fixReport.priorityBreakdown,
        suggestions: fixReport.suggestions.map(suggestion => ({
          priority: suggestion.priority,
          type: suggestion.type,
          message: suggestion.message,
          coordinates: suggestion.coordinates,
          actualCoordinates: suggestion.actualCoordinates,
          fixes: suggestion.fixes,
          element: suggestion.element
        }))
      },

      // 总结和建议
      summary: {
        status: this.getOverallStatus(compareResult.matchPercentage),
        recommendation: this.getRecommendation(compareResult.matchPercentage, fixReport.priorityBreakdown),
        nextSteps: this.getNextSteps(compareResult.matchPercentage, fixReport.priorityBreakdown),
        estimatedImprovement: this.estimateImprovement(fixReport.priorityBreakdown)
      }
    };
  }

  /**
   * 计算区域严重程度
   */
  calculateSeverity(pixelCount, areaSize) {
    const density = pixelCount / areaSize;
    
    if (pixelCount > 50000 || density > 0.7) {
      return 'critical';
    } else if (pixelCount > 10000 || density > 0.4) {
      return 'high';
    } else if (pixelCount > 1000 || density > 0.2) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  /**
   * 获取整体状态
   */
  getOverallStatus(matchPercentage) {
    if (matchPercentage >= 95) return { level: 'excellent', emoji: '🏆', text: '优秀' };
    if (matchPercentage >= 90) return { level: 'good', emoji: '👍', text: '良好' };
    if (matchPercentage >= 85) return { level: 'needs_improvement', emoji: '⚠️', text: '需改进' };
    return { level: 'poor', emoji: '❌', text: '不合格' };
  }

  /**
   * 获取建议
   */
  getRecommendation(matchPercentage, priorityBreakdown) {
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
  getNextSteps(matchPercentage, priorityBreakdown) {
    const steps = [];
    
    if (priorityBreakdown.high > 0) {
      steps.push('立即修复所有高优先级问题');
      steps.push('重新截图并对比验证');
    }
    
    if (priorityBreakdown.medium > 0) {
      steps.push('修复中优先级问题');
    }
    
    if (matchPercentage < 95) {
      steps.push('继续迭代优化直到达到95%+还原度');
    }
    
    steps.push('更新组件文档和使用说明');
    
    return steps;
  }

  /**
   * 估算改进幅度
   */
  estimateImprovement(priorityBreakdown) {
    let improvement = 0;
    improvement += priorityBreakdown.high * 3; // 每个高优先级问题约3%
    improvement += priorityBreakdown.medium * 1.5; // 每个中优先级问题约1.5%
    improvement += priorityBreakdown.low * 0.5; // 每个低优先级问题约0.5%
    
    return Math.min(improvement, 15); // 最大改进幅度15%
  }

  /**
   * 保存报告
   */
  async saveReports(analysisReport) {
    // 保存JSON报告
    const jsonPath = path.join(this.resultsDir, 'figma-analysis-report.json');
    fs.writeFileSync(jsonPath, JSON.stringify(analysisReport, null, 2));

    // 生成Markdown报告
    const markdownReport = this.generateMarkdownReport(analysisReport);
    const markdownPath = path.join(this.resultsDir, 'figma-analysis-report.md');
    fs.writeFileSync(markdownPath, markdownReport);

    console.log(`💾 JSON报告已保存: ${jsonPath}`);
    console.log(`💾 Markdown报告已保存: ${markdownPath}`);
  }

  /**
   * 生成Markdown报告
   */
  generateMarkdownReport(report) {
    const { componentName, comparison, diffAnalysis, figmaMatching, fixSuggestions, summary } = report;
    
    return `# ${componentName} Figma还原分析报告

## 📊 总体评估

- **还原度**: ${comparison.matchPercentage}%
- **状态**: ${summary.status.emoji} ${summary.status.text}
- **发现问题**: ${fixSuggestions.totalIssues} 个
- **预计改进**: +${summary.estimatedImprovement}%
- **生成时间**: ${new Date(report.timestamp).toLocaleString('zh-CN')}

## 🎯 问题分布

| 优先级 | 数量 | 说明 |
|--------|------|------|
| 🔴 高优先级 | ${fixSuggestions.priorityBreakdown.high} | 需要立即修复 |
| 🟡 中优先级 | ${fixSuggestions.priorityBreakdown.medium} | 建议优化 |
| 🟢 低优先级 | ${fixSuggestions.priorityBreakdown.low} | 可选优化 |

## 🔍 差异区域分析

发现 ${diffAnalysis.totalRegions} 个差异区域：

${diffAnalysis.regions.map((region, index) => `
### 区域 ${region.id} [${region.severity.toUpperCase()}]
- **位置**: (${region.coordinates.left}, ${region.coordinates.top}) → (${region.coordinates.right}, ${region.coordinates.bottom})
- **尺寸**: ${region.coordinates.width} × ${region.coordinates.height}
- **中心点**: (${region.coordinates.center.x}, ${region.coordinates.center.y})
- **像素数**: ${region.pixelCount}
`).join('')}

## 🎯 Figma元素匹配

${figmaMatching.matches.map((match, index) => `
### 区域 ${match.regionId} 匹配结果
${match.elements.length > 0 ? 
  match.elements.map((element, i) => `
${i + 1}. **${element.name}** (${element.type})
   - 位置: (${element.boundingBox.x}, ${element.boundingBox.y}) ${element.boundingBox.width}×${element.boundingBox.height}
   - 置信度: ${element.confidence.toFixed(1)}%
   - 重叠度: ${element.overlapPercentage.toFixed(1)}%
`).join('') : 
  '❌ 未找到匹配的Figma元素'
}
`).join('')}

## 🔧 修复建议

${fixSuggestions.suggestions.map((suggestion, index) => `
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

${summary.nextSteps.map((step, index) => `${index + 1}. ${step}`).join('\n')}

---
*报告生成时间: ${new Date(report.timestamp).toLocaleString('zh-CN')}*
`;
  }

  /**
   * 打印总结
   */
  printSummary(report) {
    const { comparison, summary, fixSuggestions } = report;
    
    console.log('\n🎉 分析完成！');
    console.log(`📊 还原度: ${comparison.matchPercentage}% ${summary.status.emoji}`);
    console.log(`🔍 发现问题: ${fixSuggestions.totalIssues} 个`);
    console.log(`📈 预计改进: +${summary.estimatedImprovement}%`);
    console.log(`💡 建议: ${summary.recommendation}`);
  }
}

// 命令行工具
if (import.meta.url === `file://${process.argv[1]}`) {
  const componentName = process.argv[2];
  if (!componentName) {
    console.error('用法: node figma-diff-analyzer.js <组件名>');
    console.log('\n示例:');
    console.log('  node figma-diff-analyzer.js ExchangeSuccess');
    console.log('  node figma-diff-analyzer.js ScanResult');
    process.exit(1);
  }
  
  const analyzer = new FigmaDiffAnalyzer(componentName);
  analyzer.analyze();
}

/**
 * MCP工具函数：分析Figma组件差异
 */
export async function analyzeFigmaDiff(componentName) {
  const analyzer = new FigmaDiffAnalyzer(componentName);
  return await analyzer.analyze();
}

/**
 * MCP工具函数：批量分析多个组件
 */
export async function batchAnalyzeFigmaDiff(componentNames) {
  const results = {};

  for (const componentName of componentNames) {
    console.log(`\n🔄 分析组件: ${componentName}`);
    const analyzer = new FigmaDiffAnalyzer(componentName);
    const result = await analyzer.analyze();
    results[componentName] = result;
  }

  // 生成批量分析报告
  const batchReport = generateBatchReport(results);
  const reportPath = path.join(__dirname, '../results/batch-analysis-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(batchReport, null, 2));

  console.log(`\n📊 批量分析完成！报告已保存: ${reportPath}`);
  return batchReport;
}

/**
 * 生成批量分析报告
 */
function generateBatchReport(results) {
  const components = Object.keys(results);
  const validResults = components.filter(name => results[name] !== null);

  const summary = {
    totalComponents: components.length,
    successfulAnalysis: validResults.length,
    averageMatchPercentage: validResults.length > 0 ?
      validResults.reduce((sum, name) => sum + results[name].comparison.matchPercentage, 0) / validResults.length : 0,
    totalIssues: validResults.reduce((sum, name) => sum + results[name].fixSuggestions.totalIssues, 0),
    componentRanking: validResults
      .map(name => ({
        name,
        matchPercentage: results[name].comparison.matchPercentage,
        status: results[name].summary.status,
        issues: results[name].fixSuggestions.totalIssues
      }))
      .sort((a, b) => b.matchPercentage - a.matchPercentage)
  };

  return {
    timestamp: new Date().toISOString(),
    summary,
    results
  };
}

export { FigmaDiffAnalyzer };
