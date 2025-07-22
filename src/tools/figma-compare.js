import fs from 'fs/promises';
import path from 'path';
import chalk from 'chalk';
import sharp from 'sharp';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';
import {
  ensureDirectory
} from '../utils/path-config.js';
import { EnhancedRegionAnalyzer } from '../../scripts/enhanced-region-analyzer.js';

export class FigmaCompareTool {
  constructor() {
    this.description = 'Pure Figma component comparison tool: compare existing screenshots and analyze differences with detailed reporting';
    this.inputSchema = {
      type: 'object',
      properties: {
        componentName: {
          type: 'string',
          description: 'Name of the component to compare'
        },
        projectPath: {
          type: 'string',
          default: '/Users/yujie_wu/Documents/work/camscanner-cloud-vue3',
          description: 'Path to the Vue project'
        },
        outputPath: {
          type: 'string',
          description: 'Custom absolute path where comparison results should be saved. If not provided, defaults to component directory'
        },
        threshold: {
          type: 'number',
          default: 0.1,
          description: 'Comparison threshold (0-1, lower is more strict)'
        },
        generateReport: {
          type: 'boolean',
          default: true,
          description: 'Generate detailed analysis report'
        }
      },
      required: ['componentName']
    };
  }

  async execute(args) {
    const {
      componentName,
      projectPath = '/Users/yujie_wu/Documents/work/camscanner-cloud-vue3',
      outputPath, // 新增：自定义输出路径
      threshold = 0.1,
      generateReport = true
    } = args;

    try {
      console.log(chalk.cyan('🎯 Figma Component Comparison'));
      console.log(chalk.cyan(`Component: ${componentName}`));
      console.log(chalk.gray('='.repeat(60)));

      // 优先使用自定义路径，否则使用组件目录
      const resultsDir = outputPath || path.join(projectPath, 'src', 'components', componentName);
      console.log(chalk.blue(`📁 Output directory: ${resultsDir}`));
      await ensureDirectory(resultsDir);

      // Check if actual.png exists
      const actualPath = path.join(resultsDir, 'actual.png');
      try {
        await fs.access(actualPath);
        console.log(chalk.green('✅ Found existing screenshot: actual.png'));
      } catch (error) {
        throw new Error(`Screenshot not found: ${actualPath}\n\nPlease take a screenshot first using the snapDOM screenshot tool:\n  snapdom_screenshot_vue-figma-tools --componentName ${componentName} --outputPath "${resultsDir}"`);
      }

      // Step 1: Compare images
      console.log(chalk.blue('🔍 Comparing images...'));
      const comparisonResult = await this.compareImages({
        componentName,
        resultsDir,
        threshold
      });

      // Step 2: Generate report (if requested)
      let reportPath = null;
      if (generateReport) {
        console.log(chalk.blue('📊 Generating analysis report...'));

        // Load region analysis if available
        let regionAnalysisData = null;
        try {
          const regionAnalysisPath = path.join(resultsDir, 'region-analysis.json');
          const regionAnalysisContent = await fs.readFile(regionAnalysisPath, 'utf-8');
          regionAnalysisData = JSON.parse(regionAnalysisContent);
        } catch (error) {
          // Region analysis file not found, continue without it
        }

        reportPath = await this.generateReport({
          componentName,
          resultsDir,
          comparisonResult: {
            ...comparisonResult,
            regionAnalysis: regionAnalysisData
          }
        });
      }

      console.log(chalk.green('✅ Comparison completed successfully!'));
      console.log(chalk.yellow(`📊 Match Percentage: ${comparisonResult.matchPercentage.toFixed(2)}%`));

      // Check if Self-Reflective analysis is needed
      const qualityLevel = this.getQualityLevel(comparisonResult.matchPercentage);
      if (comparisonResult.matchPercentage < 98) {
        console.log(chalk.red('🚨 还原度未达到98%标准，需要启动Self-Reflective分析！'));
        console.log(chalk.yellow('📋 Self-Reflective分析流程：'));
        console.log(chalk.gray('   1. 重新深度分析Figma JSON数据'));
        console.log(chalk.gray('   2. 验证素材完整性和位置精确性'));
        console.log(chalk.gray('   3. 执行针对性修复和迭代优化'));
        console.log(chalk.gray('   4. 目标：达到98%+还原度'));
        console.log(chalk.cyan('💡 请按照.augment/rules/中的Self-Reflective工作流程执行'));
      } else {
        console.log(chalk.green('🎉 恭喜！已达到98%还原度标准！'));
      }

      return {
        success: true,
        componentName,
        comparison: comparisonResult,
        reportPath,
        summary: {
          matchPercentage: comparisonResult.matchPercentage,
          qualityLevel: qualityLevel,
          diffPixels: comparisonResult.diffPixels,
          totalPixels: comparisonResult.totalPixels,
          needsSelfReflective: qualityLevel.needsSelfReflective,
          storagePath: resultsDir, // 返回实际使用的存储路径
          customPath: !!outputPath // 标识是否使用了自定义路径
        }
      };

    } catch (error) {
      console.error(chalk.red('❌ Comparison failed:'), error.message);
      return {
        success: false,
        error: error.message,
        componentName
      };
    }
  }





  async compareImages({ componentName, resultsDir, threshold }) {
    const expectedPath = path.join(resultsDir, 'expected.png');
    const actualPath = path.join(resultsDir, 'actual.png');
    const diffPath = path.join(resultsDir, 'diff.png');

    // Check if expected image exists
    try {
      await fs.access(expectedPath);
    } catch (error) {
      throw new Error(`Expected image not found: ${expectedPath}. Please ensure the Figma design image is downloaded.`);
    }

    // Ensure actual image is in correct format and size
    await this.normalizeImage(actualPath, expectedPath);

    // Load images
    const expectedBuffer = await fs.readFile(expectedPath);
    const actualBuffer = await fs.readFile(actualPath);

    const expectedPng = PNG.sync.read(expectedBuffer);
    const actualPng = PNG.sync.read(actualBuffer);

    const { width, height } = expectedPng;
    const diffPng = new PNG({ width, height });

    // Compare images with optimized settings for 3x scale
    console.log(chalk.blue(`🔍 Comparing images at ${width} × ${height} resolution...`));

    const diffPixels = pixelmatch(
      expectedPng.data,
      actualPng.data,
      diffPng.data,
      width,
      height,
      {
        threshold: threshold * 0.8, // Slightly more sensitive for high-res images
        includeAA: true, // Include anti-aliasing for better 3x scale comparison
        alpha: 0.05, // Lower alpha threshold for more precise comparison
        aaColor: [255, 255, 0], // Yellow for anti-aliasing differences
        diffColor: [255, 0, 0], // Red for significant differences
        diffColorAlt: [255, 128, 0] // Orange for alternative differences
      }
    );

    // Save diff image
    await fs.writeFile(diffPath, PNG.sync.write(diffPng));

    const totalPixels = width * height;
    const matchPercentage = ((totalPixels - diffPixels) / totalPixels) * 100;

    console.log(chalk.green(`✅ Comparison completed`));
    console.log(chalk.yellow(`📊 Match: ${matchPercentage.toFixed(2)}% (${diffPixels}/${totalPixels} pixels differ)`));

    // Enhanced region analysis
    console.log(chalk.blue('🔍 Performing enhanced region analysis...'));
    let regionAnalysis = null;
    try {
      const analyzer = new EnhancedRegionAnalyzer();

      // Try to load Figma data for semantic analysis
      let figmaData = null;
      try {
        const figmaDataPath = path.join(resultsDir, 'figma-data.json');
        const figmaDataContent = await fs.readFile(figmaDataPath, 'utf-8');
        figmaData = JSON.parse(figmaDataContent);
        console.log(chalk.gray('📋 Figma data loaded for semantic analysis'));
      } catch (error) {
        console.log(chalk.yellow('⚠️  No Figma data found for semantic analysis'));
      }

      regionAnalysis = await analyzer.analyzeRegionDifferences(expectedPath, actualPath, figmaData);
      console.log(chalk.green(`✅ Region analysis completed: ${regionAnalysis.regions.length} difference regions identified`));

      // Save detailed region analysis
      const regionAnalysisPath = path.join(resultsDir, 'region-analysis.json');
      await fs.writeFile(regionAnalysisPath, JSON.stringify(regionAnalysis, null, 2));
      console.log(chalk.gray(`💾 Region analysis saved: ${regionAnalysisPath}`));

    } catch (error) {
      console.log(chalk.yellow(`⚠️  Region analysis failed: ${error.message}`));
      console.log(chalk.gray(`Error details: ${error.stack}`));
    }

    return {
      matchPercentage,
      diffPixels,
      totalPixels,
      dimensions: { width, height },
      paths: {
        expected: expectedPath,
        actual: actualPath,
        diff: diffPath
      },
      regionAnalysis
    };
  }

  async normalizeImage(actualPath, expectedPath) {
    // Get both image metadata
    const expectedMeta = await sharp(expectedPath).metadata();
    const actualMeta = await sharp(actualPath).metadata();

    console.log(chalk.blue('📐 Image size analysis:'));
    console.log(chalk.gray(`   Expected: ${expectedMeta.width} × ${expectedMeta.height} pixels`));
    console.log(chalk.gray(`   Actual: ${actualMeta.width} × ${actualMeta.height} pixels`));

    // Check if images are already the same size
    if (expectedMeta.width === actualMeta.width && expectedMeta.height === actualMeta.height) {
      console.log(chalk.green('✅ Images are already the same size, no normalization needed'));
      return;
    }

    // Calculate scale factors
    const scaleX = actualMeta.width / expectedMeta.width;
    const scaleY = actualMeta.height / expectedMeta.height;

    console.log(chalk.yellow(`⚠️  Size mismatch detected:`));
    console.log(chalk.gray(`   Scale factors: X=${scaleX.toFixed(2)}x, Y=${scaleY.toFixed(2)}x`));

    // For 3x scale images, we should resize the expected image to match actual size
    // This preserves the high-resolution actual screenshot for accurate comparison
    if (Math.abs(scaleX - 3) < 0.1 && Math.abs(scaleY - 3) < 0.1) {
      console.log(chalk.blue('🔄 Detected 3x scale difference, upscaling expected image...'));
      await sharp(expectedPath)
        .resize(actualMeta.width, actualMeta.height, {
          fit: 'fill',
          kernel: sharp.kernel.nearest // Use nearest neighbor to preserve pixel accuracy
        })
        .ensureAlpha()
        .png()
        .toFile(expectedPath + '.tmp');

      await fs.rename(expectedPath + '.tmp', expectedPath);
      console.log(chalk.green('✅ Expected image upscaled to match actual 3x resolution'));
    } else {
      // For other cases, resize actual to match expected
      console.log(chalk.blue('🔄 Resizing actual image to match expected size...'));
      await sharp(actualPath)
        .resize(expectedMeta.width, expectedMeta.height, { fit: 'fill' })
        .ensureAlpha()
        .png()
        .toFile(actualPath + '.tmp');

      await fs.rename(actualPath + '.tmp', actualPath);
      console.log(chalk.green('✅ Actual image resized to match expected size'));
    }
  }

  async generateReport({ componentName, resultsDir, comparisonResult }) {
    const reportData = {
      componentName,
      timestamp: new Date().toISOString(),
      comparison: {
        ...comparisonResult,
        qualityLevel: this.getQualityLevel(comparisonResult.matchPercentage)
      },
      regionAnalysis: comparisonResult.regionAnalysis || null,
      summary: {
        status: this.getQualityLevel(comparisonResult.matchPercentage),
        recommendation: this.getRecommendation(comparisonResult.matchPercentage, comparisonResult.regionAnalysis),
        nextSteps: this.getNextSteps(comparisonResult.matchPercentage, comparisonResult.regionAnalysis)
      }
    };

    // Save JSON report
    const jsonReportPath = path.join(resultsDir, 'figma-analysis-report.json');
    await fs.writeFile(jsonReportPath, JSON.stringify(reportData, null, 2));

    // Generate Markdown report
    const markdownReport = this.generateMarkdownReport(reportData);
    const mdReportPath = path.join(resultsDir, 'figma-analysis-report.md');
    await fs.writeFile(mdReportPath, markdownReport);

    console.log(chalk.green(`✅ Reports generated:`));
    console.log(chalk.gray(`   JSON: ${jsonReportPath}`));
    console.log(chalk.gray(`   Markdown: ${mdReportPath}`));

    return {
      json: jsonReportPath,
      markdown: mdReportPath,
      data: reportData
    };
  }

  generateMarkdownReport(data) {
    const { componentName, comparison, summary, regionAnalysis } = data;
    const { qualityLevel } = comparison;

    let regionSection = '';
    if (regionAnalysis && regionAnalysis.regions && regionAnalysis.regions.length > 0) {
      regionSection = `
## 🔍 区域差异分析

**发现差异区域**: ${regionAnalysis.regions.length} 个
**语义分析质量**: ${regionAnalysis.semanticAnalysis?.summary?.analysisQuality || 'N/A'}

### 主要差异区域

${regionAnalysis.regions.slice(0, 5).map((region, index) => `
#### 区域 ${index + 1} (${region.id})
- **位置**: (${region.center.x}, ${region.center.y})
- **大小**: ${region.boundingBox.width} × ${region.boundingBox.height} (${region.area} 像素)
- **类型**: ${this.getRegionTypeDescription(region.regionType)}
- **严重程度**: ${this.getSeverityDescription(region.severity)}
${region.semanticInfo?.matchedElements?.length > 0 ?
  `- **匹配的Figma元素**: ${region.semanticInfo.matchedElements[0].nodeName} (${region.semanticInfo.matchedElements[0].nodeType})` :
  '- **匹配的Figma元素**: 未找到匹配元素'
}
${region.semanticInfo?.possibleIssues?.length > 0 ?
  `- **可能问题**: ${region.semanticInfo.possibleIssues[0].description}` :
  ''
}
`).join('')}

### 优化建议

${regionAnalysis.recommendations?.map(rec => `
**${rec.type}** (优先级: ${rec.priority})
- ${rec.description}
${rec.regions ? `- 涉及区域: ${rec.regions.join(', ')}` : ''}
`).join('') || '暂无特定建议'}
`;
    }

    return `# Figma组件还原分析报告 - ${componentName}

## 📊 还原度评估

**还原度**: ${comparison.matchPercentage.toFixed(2)}% ${qualityLevel.emoji}
**质量等级**: ${qualityLevel.text}
**差异像素**: ${comparison.diffPixels.toLocaleString()} / ${comparison.totalPixels.toLocaleString()}
**图片尺寸**: ${comparison.dimensions.width} × ${comparison.dimensions.height}

## 🎯 质量分析

${this.getQualityAnalysis(comparison.matchPercentage)}
${regionSection}
## 📁 文件路径

- **预期图片**: \`${path.basename(comparison.paths.expected)}\`
- **实际截图**: \`${path.basename(comparison.paths.actual)}\`
- **差异图片**: \`${path.basename(comparison.paths.diff)}\`
${regionAnalysis ? `- **区域分析**: \`region-analysis.json\`` : ''}

## 💡 优化建议

${summary.recommendation}

### 下一步行动

${summary.nextSteps.map(step => `- ${step}`).join('\n')}

---
*报告生成时间: ${new Date(data.timestamp).toLocaleString('zh-CN')}*
`;
  }

  getQualityAnalysis(percentage) {
    if (percentage >= 97) {
      return '🎯 **优秀还原** - 达到像素级精确还原，可直接用于生产环境。';
    } else if (percentage >= 95) {
      return '✅ **良好还原** - 高质量还原，细节处理到位，适合生产使用。';
    } else if (percentage >= 90) {
      return '⚠️ **需要改进** - 基本结构正确，但存在明显差异，建议继续优化。';
    } else if (percentage >= 85) {
      return '❌ **较差还原** - 存在较大差异，需要重点检查布局和样式。';
    } else {
      return '💥 **还原失败** - 差异过大，建议重新分析设计稿和实现方案。';
    }
  }

  getRecommendation(percentage, regionAnalysis = null) {
    let baseRecommendation = '';
    if (percentage >= 98) {
      baseRecommendation = '🎉 恭喜！已达到像素级精确还原标准，可直接用于生产环境。';
    } else if (percentage < 98) {
      baseRecommendation = '🔄 **触发Self-Reflective分析** - 还原度未达到98%标准，需要启动自动重新分析流程：\n' +
        '1. 重新深度分析Figma JSON数据\n' +
        '2. 验证素材完整性和位置精确性\n' +
        '3. 执行针对性修复和迭代优化\n' +
        '4. 目标：达到98%+还原度';
    } else if (percentage >= 95) {
      baseRecommendation = '当前还原质量已达到高标准，但需要进一步优化以达到98%目标。';
    } else if (percentage >= 90) {
      baseRecommendation = '继续优化布局和样式细节，重点关注差异较大的区域。';
    } else if (percentage >= 85) {
      baseRecommendation = '需要系统性检查布局结构、素材使用和样式实现。';
    } else {
      baseRecommendation = '建议重新分析Figma设计稿，检查素材下载和基础布局实现。';
    }

    // 如果有区域分析数据，添加具体建议
    if (regionAnalysis && regionAnalysis.recommendations && regionAnalysis.recommendations.length > 0) {
      const topRecommendation = regionAnalysis.recommendations[0];
      baseRecommendation += ` 重点关注：${topRecommendation.description}`;
    }

    return baseRecommendation;
  }

  getNextSteps(percentage, regionAnalysis = null) {
    let baseSteps = [];
    if (percentage >= 98) {
      baseSteps = [
        '✅ 还原度已达标，进行最终验收',
        '📝 完善组件文档和使用说明',
        '🚀 准备发布到生产环境'
      ];
    } else if (percentage < 98) {
      baseSteps = [
        '🔄 **立即启动Self-Reflective分析流程**',
        '📊 重新获取和深度分析Figma JSON数据',
        '🎨 验证所有素材完整性和正确性',
        '📐 重新计算元素位置和布局精确性',
        '🔧 执行针对性修复和优化',
        '🎯 目标：达到98%+还原度'
      ];
    } else if (percentage >= 95) {
      baseSteps = [
        '🔍 分析剩余差异区域',
        '⚡ 进行精细化调优',
        '📈 提升至98%目标还原度'
      ];
    } else if (percentage >= 90) {
      baseSteps = [
        '分析差异图片，定位具体问题区域',
        '优化布局和样式实现',
        '重新测试并对比'
      ];
    } else if (percentage >= 85) {
      baseSteps = [
        '检查素材文件是否正确下载和使用',
        '验证布局结构和CSS实现',
        '对比Figma设计稿重新调整'
      ];
    } else {
      baseSteps = [
        '重新分析Figma设计稿结构',
        '确认所有素材已正确下载',
        '重新实现基础布局和样式'
      ];
    }

    // 如果有区域分析数据，添加具体步骤
    if (regionAnalysis && regionAnalysis.recommendations) {
      const criticalRecs = regionAnalysis.recommendations.filter(rec => rec.priority === 'high');
      if (criticalRecs.length > 0) {
        baseSteps.unshift(`优先处理：${criticalRecs[0].description}`);
      }
    }

    return baseSteps;
  }

  getRegionTypeDescription(regionType) {
    const descriptions = {
      'small_detail': '小细节差异',
      'large_area': '大面积差异',
      'horizontal_element': '水平元素差异',
      'vertical_element': '垂直元素差异',
      'color_mismatch': '颜色不匹配',
      'general_difference': '一般差异'
    };
    return descriptions[regionType] || regionType;
  }

  getSeverityDescription(severity) {
    const descriptions = {
      'critical': '🔴 严重',
      'major': '🟠 重要',
      'minor': '🟡 轻微',
      'trivial': '🟢 微小'
    };
    return descriptions[severity] || severity;
  }

  getQualityLevel(percentage) {
    if (percentage >= 98) return { level: 'perfect', emoji: '🎯', text: '完美', needsSelfReflective: false };
    if (percentage >= 95) return { level: 'excellent', emoji: '✨', text: '优秀', needsSelfReflective: true };
    if (percentage >= 90) return { level: 'good', emoji: '✅', text: '良好', needsSelfReflective: true };
    if (percentage >= 85) return { level: 'needs_improvement', emoji: '⚠️', text: '需要改进', needsSelfReflective: true };
    if (percentage >= 80) return { level: 'poor', emoji: '❌', text: '较差', needsSelfReflective: true };
    return { level: 'failed', emoji: '💥', text: '失败', needsSelfReflective: true };
  }
}
