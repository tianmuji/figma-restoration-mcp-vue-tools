import fs from 'fs/promises';
import path from 'path';
import chalk from 'chalk';
import sharp from 'sharp';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';
import { ensureDirectory } from '../utils/path-config.js';

export class FigmaCompareTool {
  constructor() {
    this.description = 'Simple Figma component comparison tool: compare screenshots and generate diff.png';
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
        }
      },
      required: ['componentName', 'projectPath']
    };
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
      outputPath
    } = args;

    try {
      console.log(chalk.cyan('🎯 Figma Component Comparison'));
      console.log(chalk.cyan(`Component: ${componentName}`));
      console.log(chalk.gray('='.repeat(50)));

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

      // 执行图片对比
      console.log(chalk.blue('🔍 Performing image comparison...'));
      const comparisonResult = await this.compareImages({
        resultsDir,
        threshold
      });

      console.log(chalk.green('✅ Comparison completed successfully!'));
      console.log(chalk.yellow(`📊 还原度: ${comparisonResult.matchPercentage.toFixed(2)}%`));
      console.log(chalk.gray(`📁 Diff image saved: ${comparisonResult.paths.diff}`));

      // Check quality level
      if (comparisonResult.matchPercentage < 98) {
        console.log(chalk.red('🚨 还原度未达到98%标准！'));
      } else {
        console.log(chalk.green('🎉 恭喜！已达到98%还原度标准！'));
      }

      // 保存还原度数据到JSON文件
      const comparisonData = {
        matchPercentage: comparisonResult.matchPercentage,
        diffPixels: comparisonResult.diffPixels,
        totalPixels: comparisonResult.totalPixels,
        dimensions: comparisonResult.dimensions,
        timestamp: new Date().toISOString(),
        componentName: componentName,
        // 新增详细差异分析数据
        analysis: comparisonResult.analysis
      };
      
      const comparisonDataPath = path.join(resultsDir, 'comparison-data.json');
      await fs.writeFile(comparisonDataPath, JSON.stringify(comparisonData, null, 2));
      console.log(chalk.green(`📊 还原度数据已保存: ${comparisonDataPath}`));

      return {
        success: true,
        componentName,
        matchPercentage: comparisonResult.matchPercentage,
        diffPixels: comparisonResult.diffPixels,
        totalPixels: comparisonResult.totalPixels,
        analysis: comparisonResult.analysis,
        diffImagePath: comparisonResult.paths.diff,
        comparisonDataPath: comparisonDataPath
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







  async compareImages({ resultsDir, threshold }) {
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
        threshold: threshold * 1.2, // 提高阈值以忽略更多文本渲染差异
        includeAA: false, // 忽略抗锯齿像素差异，减少文本渲染差异
        alpha: 0.1, // 提高alpha值以减少细微差异的影响
        aaColor: [255, 255, 0], // Yellow for anti-aliasing differences
        diffColor: [255, 0, 0], // Red for significant differences
        diffColorAlt: [255, 128, 0] // Orange for alternative differences
      }
    );

    // Save diff image
    await fs.writeFile(diffPath, PNG.sync.write(diffPng));

    const totalPixels = width * height;
    const matchPercentage = ((totalPixels - diffPixels) / totalPixels) * 100;

    // 执行详细的差异分析
    console.log(chalk.blue('🔍 Analyzing diff patterns...'));
    const diffAnalysis = await this.analyzeDiffPatterns(diffPng, expectedPng, actualPng, width, height);

    console.log(chalk.green(`✅ Comparison completed`));
    console.log(chalk.yellow(`📊 Match: ${matchPercentage.toFixed(2)}% (${diffPixels}/${totalPixels} pixels differ)`));
    
    // 输出差异分析摘要
    this.printDiffSummary(diffAnalysis);

    return {
      matchPercentage,
      diffPixels,
      totalPixels,
      dimensions: { width, height },
      analysis: diffAnalysis,
      paths: {
        expected: expectedPath,
        actual: actualPath,
        diff: diffPath
      }
    };
  }

  async analyzeDiffPatterns(diffPng, expectedPng, actualPng, width, height) {
    const analysis = {
      colorRegions: {
        red: { pixels: 0, regions: [], description: 'Significant structural differences' },
        orange: { pixels: 0, regions: [], description: 'Medium-level layout differences' },
        yellow: { pixels: 0, regions: [], description: 'Anti-aliasing/rendering differences' }
      },
      spatialDistribution: {
        border: { pixels: 0, percentage: 0 },
        content: { pixels: 0, percentage: 0 },
        text: { pixels: 0, percentage: 0 }
      },
      diffPatterns: [],
      recommendations: []
    };

    // 分析每个像素的差异类型和位置
    const diffRegions = new Map(); // 用于聚合相邻的差异像素
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (width * y + x) << 2;
        const r = diffPng.data[idx];
        const g = diffPng.data[idx + 1];
        const b = diffPng.data[idx + 2];
        
        if (r > 0 || g > 0 || b > 0) { // 有差异的像素
          // 识别差异颜色类型
          const colorType = this.identifyDiffColor(r, g, b);
          analysis.colorRegions[colorType].pixels++;
          
          // 识别空间位置类型
          const spatialType = this.identifySpatialRegion(x, y, width, height);
          analysis.spatialDistribution[spatialType].pixels++;
          
          // 聚合相邻区域
          this.aggregateDiffRegion(diffRegions, x, y, colorType, spatialType);
        }
      }
    }

    // 处理聚合的差异区域
    this.processDiffRegions(diffRegions, analysis);
    
    // 计算百分比
    const totalDiffPixels = analysis.colorRegions.red.pixels + 
                           analysis.colorRegions.orange.pixels + 
                           analysis.colorRegions.yellow.pixels;
    
    Object.keys(analysis.spatialDistribution).forEach(key => {
      analysis.spatialDistribution[key].percentage = 
        (analysis.spatialDistribution[key].pixels / totalDiffPixels * 100).toFixed(1);
    });

    // 识别差异模式
    analysis.diffPatterns = this.identifyDiffPatterns(analysis);
    
    // 生成优化建议
    analysis.recommendations = this.generateRecommendations(analysis);

    return analysis;
  }

  identifyDiffColor(r, g, b) {
    // 基于 pixelmatch 的颜色配置识别差异类型
    if (r === 255 && g === 0 && b === 0) {
      return 'red'; // 显著差异
    } else if (r === 255 && g === 128 && b === 0) {
      return 'orange'; // 中等差异
    } else if (r === 255 && g === 255 && b === 0) {
      return 'yellow'; // 抗锯齿差异
    } else {
      // 其他颜色，根据主导色分类
      if (r > g && r > b) return 'red';
      if (g > r && g > b) return 'yellow';
      return 'orange';
    }
  }

  identifySpatialRegion(x, y, width, height) {
    const borderThickness = Math.min(width, height) * 0.05; // 5% 作为边框区域
    
    // 边框区域检测
    if (x < borderThickness || x > width - borderThickness || 
        y < borderThickness || y > height - borderThickness) {
      return 'border';
    }
    
    // 文本区域检测（基于常见的文本位置模式）
    const centerX = width / 2;
    const centerY = height / 2;
    const textRegionWidth = width * 0.6;
    const textRegionHeight = height * 0.3;
    
    if (Math.abs(x - centerX) < textRegionWidth / 2 && 
        Math.abs(y - centerY) < textRegionHeight / 2) {
      return 'text';
    }
    
    return 'content';
  }

  aggregateDiffRegion(diffRegions, x, y, colorType, spatialType) {
    const regionKey = `${Math.floor(x / 10)}_${Math.floor(y / 10)}`; // 10x10 像素块
    
    if (!diffRegions.has(regionKey)) {
      diffRegions.set(regionKey, {
        x: Math.floor(x / 10) * 10,
        y: Math.floor(y / 10) * 10,
        width: 10,
        height: 10,
        colorType,
        spatialType,
        pixels: 0
      });
    }
    
    diffRegions.get(regionKey).pixels++;
  }

  processDiffRegions(diffRegions, analysis) {
    for (const region of diffRegions.values()) {
      if (region.pixels > 5) { // 只记录有意义的区域
        analysis.colorRegions[region.colorType].regions.push({
          x: region.x,
          y: region.y,
          width: region.width,
          height: region.height,
          pixels: region.pixels,
          spatialType: region.spatialType
        });
      }
    }
  }

  identifyDiffPatterns(analysis) {
    const patterns = [];
    
    // 边框条带模式
    if (analysis.spatialDistribution.border.pixels > 0) {
      const borderPercentage = parseFloat(analysis.spatialDistribution.border.percentage);
      if (borderPercentage > 50) {
        patterns.push({
          type: 'border_stripe',
          severity: borderPercentage > 80 ? 'high' : 'medium',
          description: 'Border rendering differences detected',
          affectedArea: `${borderPercentage}% of diff pixels in border region`
        });
      }
    }
    
    // 块状差异模式
    const redRegions = analysis.colorRegions.red.regions;
    if (redRegions.length > 0) {
      const largeBlocks = redRegions.filter(r => r.pixels > 50);
      if (largeBlocks.length > 0) {
        patterns.push({
          type: 'block_difference',
          severity: 'high',
          description: 'Large structural differences detected',
          regions: largeBlocks.length,
          affectedArea: `${largeBlocks.reduce((sum, r) => sum + r.pixels, 0)} pixels`
        });
      }
    }
    
    // 文本渲染差异模式
    if (analysis.spatialDistribution.text.pixels > 0) {
      const textPercentage = parseFloat(analysis.spatialDistribution.text.percentage);
      if (textPercentage > 30) {
        patterns.push({
          type: 'text_rendering',
          severity: 'low',
          description: 'Text rendering differences detected',
          affectedArea: `${textPercentage}% of diff pixels in text region`
        });
      }
    }
    
    return patterns;
  }

  generateRecommendations(analysis) {
    const recommendations = [];
    
    // 基于颜色分布的建议
    const totalDiff = analysis.colorRegions.red.pixels + 
                     analysis.colorRegions.orange.pixels + 
                     analysis.colorRegions.yellow.pixels;
    
    if (analysis.colorRegions.red.pixels / totalDiff > 0.6) {
      recommendations.push({
        priority: 'high',
        category: 'structural',
        action: 'Check layout positioning, element sizing, and border implementation',
        reason: 'High proportion of red pixels indicates structural issues'
      });
    }
    
    if (analysis.spatialDistribution.border.pixels / totalDiff > 0.5) {
      recommendations.push({
        priority: 'high',
        category: 'border',
        action: 'Review strokeAlign implementation and border positioning',
        reason: 'Border region contains majority of differences'
      });
    }
    
    if (analysis.colorRegions.yellow.pixels / totalDiff > 0.4) {
      recommendations.push({
        priority: 'low',
        category: 'rendering',
        action: 'Apply font-smoothing and anti-aliasing optimizations',
        reason: 'High proportion of yellow pixels indicates rendering differences'
      });
    }
    
    return recommendations;
  }

  printDiffSummary(analysis) {
    console.log(chalk.blue('\n📊 Diff Analysis Summary:'));
    
    // 颜色分布
    console.log(chalk.yellow('Color Distribution:'));
    Object.entries(analysis.colorRegions).forEach(([color, data]) => {
      if (data.pixels > 0) {
        console.log(chalk.gray(`  ${color.toUpperCase()}: ${data.pixels} pixels - ${data.description}`));
      }
    });
    
    // 空间分布
    console.log(chalk.yellow('\nSpatial Distribution:'));
    Object.entries(analysis.spatialDistribution).forEach(([region, data]) => {
      if (data.pixels > 0) {
        console.log(chalk.gray(`  ${region}: ${data.pixels} pixels (${data.percentage}%)`));
      }
    });
    
    // 识别的模式
    if (analysis.diffPatterns.length > 0) {
      console.log(chalk.yellow('\nIdentified Patterns:'));
      analysis.diffPatterns.forEach(pattern => {
        const severityColor = pattern.severity === 'high' ? chalk.red : 
                             pattern.severity === 'medium' ? chalk.yellow : chalk.green;
        console.log(severityColor(`  ${pattern.type}: ${pattern.description}`));
      });
    }
    
    // 优化建议
    if (analysis.recommendations.length > 0) {
      console.log(chalk.yellow('\nRecommendations:'));
      analysis.recommendations.forEach(rec => {
        const priorityColor = rec.priority === 'high' ? chalk.red : 
                             rec.priority === 'medium' ? chalk.yellow : chalk.blue;
        console.log(priorityColor(`  [${rec.priority.toUpperCase()}] ${rec.category}: ${rec.action}`));
      });
    }
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
