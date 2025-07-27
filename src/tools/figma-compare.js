import fs from 'fs/promises';
import path from 'path';
import chalk from 'chalk';
import sharp from 'sharp';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';
import {
  ensureDirectory
} from '../utils/path-config.js';
import { ComparisonAnalyzer } from '../utils/comparison-analyzer.js';
import { ReportGenerator } from '../utils/report-generator.js';

export class FigmaCompareTool {
  constructor() {
    this.description = 'Enhanced Figma component comparison tool: compare screenshots, generate detailed analysis reports and provide optimization suggestions';
    this.inputSchema = {
      type: 'object',
      properties: {
        componentName: {
          type: 'string',
          description: 'Name of the component to compare'
        },
        projectPath: {
          type: 'string',
          description: 'Path to the Vue project (required)'
        },
        threshold: {
          type: 'number',
          default: 0.1,
          description: 'Comparison threshold (0-1, lower is more strict)'
        },
        outputPath: {
          type: 'string',
          description: 'Custom output directory for results (optional). If not provided, defaults to src/components/{componentName}/results'
        },
        generateReport: {
          type: 'boolean',
          default: true,
          description: 'Whether to generate detailed analysis report'
        },
        includeHeatmap: {
          type: 'boolean',
          default: true,
          description: 'Whether to generate heatmap visualization'
        }
      },
      required: ['componentName', 'projectPath']
    };
    
    // 初始化分析器和报告生成器
    this.analyzer = new ComparisonAnalyzer();
    this.reportGenerator = new ReportGenerator();
  }

  async execute(args) {
    // 验证必传参数
    if (!args.componentName) {
      throw new Error('❌ 参数错误: componentName 是必传参数，请提供组件名称');
    }

    if (!args.projectPath) {
      throw new Error('❌ 参数错误: projectPath 是必传参数，请提供项目路径');
    }

    // 验证项目路径是否存在
    try {
      await fs.access(args.projectPath);
    } catch (error) {
      throw new Error(`❌ 项目路径不存在: ${args.projectPath}`);
    }

    const {
      componentName,
      projectPath,
      threshold = 0.1,
      outputPath,
      generateReport = true,
      includeHeatmap = true
    } = args;

    try {
      console.log(chalk.cyan('🎯 Enhanced Figma Component Comparison'));
      console.log(chalk.cyan(`Component: ${componentName}`));
      console.log(chalk.gray('='.repeat(60)));

      const resultsDir = outputPath || path.join(projectPath, 'src', 'components', componentName, 'results');
      await ensureDirectory(resultsDir);

      // Check if actual.png exists
      const actualPath = path.join(resultsDir, 'actual.png');
      try {
        await fs.access(actualPath);
        console.log(chalk.green('✅ Found existing screenshot: actual.png'));
      } catch (error) {
        throw new Error(`Screenshot not found: ${actualPath}\n\nPlease take a screenshot first using the snapDOM screenshot tool:\n  snapdom_screenshot_vue-figma-tools --componentName ${componentName}`);
      }

      // 执行基础图片对比
      console.log(chalk.blue('🔍 Performing basic image comparison...'));
      const basicComparison = await this.compareImages({
        componentName,
        resultsDir,
        threshold
      });

      // 执行增强分析
      console.log(chalk.blue('🧠 Performing enhanced analysis...'));
      let enhancedAnalysis;
      try {
        enhancedAnalysis = await this.performEnhancedAnalysis({
          resultsDir,
          threshold,
          includeHeatmap
        });
      } catch (error) {
        console.warn(chalk.yellow('⚠️  Enhanced analysis failed, using basic comparison only:'), error.message);
        enhancedAnalysis = {
          regions: [],
          colorAnalysis: [],
          heatmapData: null,
          suggestions: []
        };
      }

      // 合并分析结果
      const comparisonResult = {
        ...basicComparison,
        ...enhancedAnalysis
      };

      // 生成详细报告
      let report = null;
      if (generateReport) {
        console.log(chalk.blue('📊 Generating detailed analysis report...'));
        report = await this.reportGenerator.generateReport(
          componentName,
          comparisonResult,
          resultsDir
        );
        console.log(chalk.green('✅ Analysis report generated successfully!'));
        console.log(chalk.gray(`📁 Report saved: ${path.join(resultsDir, 'comparison-report.json')}`));
      }

      console.log(chalk.green('✅ Enhanced comparison completed successfully!'));
      console.log(chalk.yellow(`📊 Match Percentage: ${comparisonResult.matchPercentage.toFixed(2)}%`));
      console.log(chalk.gray(`📁 Diff image saved: ${comparisonResult.paths.diff}`));

      // 显示分析摘要
      this.displayAnalysisSummary(comparisonResult);

      // Check quality level
      if (comparisonResult.matchPercentage < 98) {
        console.log(chalk.red('🚨 还原度未达到98%标准，需要启动Self-Reflective分析！'));
        if (comparisonResult.suggestions && comparisonResult.suggestions.length > 0) {
          console.log(chalk.yellow('💡 优化建议:'));
          comparisonResult.suggestions.slice(0, 3).forEach((suggestion, index) => {
            console.log(chalk.yellow(`   ${index + 1}. ${suggestion.description}`));
            console.log(chalk.gray(`      修复建议: ${suggestion.suggestedFix}`));
          });
        }
      } else {
        console.log(chalk.green('🎉 恭喜！已达到98%还原度标准！'));
      }

      return {
        success: true,
        componentName,
        comparison: comparisonResult,
        report,
        summary: {
          matchPercentage: comparisonResult.matchPercentage,
          diffPixels: comparisonResult.diffPixels,
          totalPixels: comparisonResult.totalPixels,
          status: this.reportGenerator.determineStatus(comparisonResult.matchPercentage),
          totalIssues: this.reportGenerator.countIssues(comparisonResult.regions, comparisonResult.suggestions)
        }
      };

    } catch (error) {
      console.error(chalk.red('❌ Enhanced comparison failed:'), error.message);
      return {
        success: false,
        error: error.message,
        componentName
      };
    }
  }





  /**
   * 执行增强分析
   * @param {Object} params - 分析参数
   * @returns {Promise<Object>} 增强分析结果
   */
  async performEnhancedAnalysis({ resultsDir, threshold, includeHeatmap }) {
    try {
      const expectedPath = path.join(resultsDir, 'expected.png');
      const actualPath = path.join(resultsDir, 'actual.png');

      // 读取图片缓冲区
      const expectedBuffer = await fs.readFile(expectedPath);
      const actualBuffer = await fs.readFile(actualPath);

      // 配置分析器
      this.analyzer.threshold = threshold;
      this.analyzer.includeAA = true;

      // 执行详细分析
      const analysisResult = await this.analyzer.analyzeComparison(expectedBuffer, actualBuffer);

      return analysisResult;

    } catch (error) {
      console.warn(chalk.yellow('⚠️  Enhanced analysis failed, falling back to basic comparison:'), error.message);
      return {
        regions: [],
        colorAnalysis: [],
        heatmapData: null,
        suggestions: []
      };
    }
  }

  /**
   * 显示分析摘要
   * @param {Object} comparisonResult - 对比结果
   */
  displayAnalysisSummary(comparisonResult) {
    console.log(chalk.blue('\n📋 Analysis Summary:'));
    
    // 差异区域摘要
    if (comparisonResult.regions && comparisonResult.regions.length > 0) {
      const highSeverity = comparisonResult.regions.filter(r => r.severity === 'high').length;
      const mediumSeverity = comparisonResult.regions.filter(r => r.severity === 'medium').length;
      const lowSeverity = comparisonResult.regions.filter(r => r.severity === 'low').length;
      
      console.log(chalk.gray(`   差异区域: ${comparisonResult.regions.length} 个`));
      if (highSeverity > 0) console.log(chalk.red(`   - 高严重度: ${highSeverity} 个`));
      if (mediumSeverity > 0) console.log(chalk.yellow(`   - 中严重度: ${mediumSeverity} 个`));
      if (lowSeverity > 0) console.log(chalk.green(`   - 低严重度: ${lowSeverity} 个`));
    }

    // 颜色差异摘要
    if (comparisonResult.colorAnalysis && comparisonResult.colorAnalysis.length > 0) {
      const significantColorDiffs = comparisonResult.colorAnalysis.filter(c => c.pixelCount > 100).length;
      console.log(chalk.gray(`   颜色差异: ${comparisonResult.colorAnalysis.length} 种`));
      if (significantColorDiffs > 0) {
        console.log(chalk.yellow(`   - 显著差异: ${significantColorDiffs} 种`));
      }
    }

    // 优化建议摘要
    if (comparisonResult.suggestions && comparisonResult.suggestions.length > 0) {
      const highPriority = comparisonResult.suggestions.filter(s => s.priority === 'high').length;
      const mediumPriority = comparisonResult.suggestions.filter(s => s.priority === 'medium').length;
      
      console.log(chalk.gray(`   优化建议: ${comparisonResult.suggestions.length} 条`));
      if (highPriority > 0) console.log(chalk.red(`   - 高优先级: ${highPriority} 条`));
      if (mediumPriority > 0) console.log(chalk.yellow(`   - 中优先级: ${mediumPriority} 条`));
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

    return {
      matchPercentage,
      diffPixels,
      totalPixels,
      dimensions: { width, height },
      paths: {
        expected: expectedPath,
        actual: actualPath,
        diff: diffPath
      }
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




}
