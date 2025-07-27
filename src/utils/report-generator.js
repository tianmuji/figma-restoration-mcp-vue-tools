/**
 * 报告生成系统
 * 负责生成结构化的对比分析报告和可视化数据
 */

import fs from 'fs/promises';
import path from 'path';
import { PNG } from 'pngjs';
import { ensureDirectory } from './path-config.js';

export class ReportGenerator {
  constructor(options = {}) {
    this.version = options.version || '1.0.0';
    this.includeHeatmap = options.includeHeatmap !== false;
    this.includeThumbnails = options.includeThumbnails !== false;
  }

  /**
   * 生成完整的对比报告
   * @param {string} componentName - 组件名称
   * @param {Object} comparisonResult - 对比分析结果
   * @param {string} outputDir - 输出目录
   * @returns {Promise<ComparisonReport>} 生成的报告对象
   */
  async generateReport(componentName, comparisonResult, outputDir) {
    try {
      await ensureDirectory(outputDir);

      const timestamp = new Date().toISOString();
      const status = this.determineStatus(comparisonResult.matchPercentage);

      // 生成基础报告结构
      const report = {
        componentName,
        timestamp,
        version: this.version,
        summary: {
          matchPercentage: comparisonResult.matchPercentage,
          status,
          totalIssues: this.countIssues(comparisonResult.regions, comparisonResult.suggestions),
          diffPixels: comparisonResult.diffPixels,
          totalPixels: comparisonResult.totalPixels
        },
        images: {
          expected: path.join(outputDir, 'expected.png'),
          actual: path.join(outputDir, 'actual.png'),
          diff: path.join(outputDir, 'diff.png')
        },
        analysis: {
          matchPercentage: comparisonResult.matchPercentage,
          diffPixels: comparisonResult.diffPixels,
          totalPixels: comparisonResult.totalPixels,
          dimensions: comparisonResult.dimensions,
          regions: comparisonResult.regions || [],
          colorAnalysis: comparisonResult.colorAnalysis || [],
          metadata: comparisonResult.metadata || {}
        },
        recommendations: this.categorizeRecommendations(comparisonResult.suggestions || [])
      };

      // 生成热力图（如果启用）
      if (this.includeHeatmap && comparisonResult.heatmapData) {
        const heatmapPath = path.join(outputDir, 'heatmap.png');
        await this.generateHeatmapImage(comparisonResult.heatmapData, heatmapPath);
        report.images.heatmap = heatmapPath;
      }

      // 保存差异图片
      if (comparisonResult.diffImageBuffer) {
        await fs.writeFile(report.images.diff, comparisonResult.diffImageBuffer);
      }

      // 生成缩略图（如果启用）
      if (this.includeThumbnails) {
        await this.generateThumbnails(report.images, outputDir);
        report.images.thumbnails = {
          expected: path.join(outputDir, 'expected_thumb.png'),
          actual: path.join(outputDir, 'actual_thumb.png'),
          diff: path.join(outputDir, 'diff_thumb.png')
        };
      }

      // 保存报告到文件
      await this.saveReport(report, outputDir);

      return report;

    } catch (error) {
      throw new Error(`Report generation failed: ${error.message}`);
    }
  }

  /**
   * 保存报告到文件
   * @param {Object} report - 报告对象
   * @param {string} outputDir - 输出目录
   */
  async saveReport(report, outputDir) {
    const reportPath = path.join(outputDir, 'comparison-report.json');
    const reportContent = JSON.stringify(report, null, 2);
    await fs.writeFile(reportPath, reportContent, 'utf8');

    // 同时生成人类可读的Markdown报告
    const markdownReport = this.generateMarkdownReport(report);
    const markdownPath = path.join(outputDir, 'comparison-report.md');
    await fs.writeFile(markdownPath, markdownReport, 'utf8');
  }

  /**
   * 生成热力图图片
   * @param {Object} heatmapData - 热力图数据
   * @param {string} outputPath - 输出路径
   */
  async generateHeatmapImage(heatmapData, outputPath) {
    const { data, gridSize, width, height } = heatmapData;
    const imageWidth = width * gridSize;
    const imageHeight = height * gridSize;

    const png = new PNG({ width: imageWidth, height: imageHeight });

    // 生成热力图颜色
    for (let gridY = 0; gridY < height; gridY++) {
      for (let gridX = 0; gridX < width; gridX++) {
        const intensity = data[gridY][gridX];
        const color = this.intensityToColor(intensity);

        // 填充网格区域
        for (let py = 0; py < gridSize; py++) {
          for (let px = 0; px < gridSize; px++) {
            const x = gridX * gridSize + px;
            const y = gridY * gridSize + py;
            
            if (x < imageWidth && y < imageHeight) {
              const idx = (imageWidth * y + x) << 2;
              png.data[idx] = color.r;
              png.data[idx + 1] = color.g;
              png.data[idx + 2] = color.b;
              png.data[idx + 3] = color.a;
            }
          }
        }
      }
    }

    const buffer = PNG.sync.write(png);
    await fs.writeFile(outputPath, buffer);
  }

  /**
   * 生成缩略图
   * @param {Object} images - 图片路径对象
   * @param {string} outputDir - 输出目录
   */
  async generateThumbnails(images, outputDir) {
    const thumbnailSize = 200; // 缩略图尺寸

    for (const [type, imagePath] of Object.entries(images)) {
      if (type === 'thumbnails') continue;

      try {
        const exists = await fs.access(imagePath).then(() => true).catch(() => false);
        if (!exists) continue;

        const imageBuffer = await fs.readFile(imagePath);
        const png = PNG.sync.read(imageBuffer);
        
        const thumbnail = this.resizeImage(png, thumbnailSize, thumbnailSize);
        const thumbnailBuffer = PNG.sync.write(thumbnail);
        
        const thumbnailPath = path.join(outputDir, `${type}_thumb.png`);
        await fs.writeFile(thumbnailPath, thumbnailBuffer);
      } catch (error) {
        console.warn(`Failed to generate thumbnail for ${type}:`, error.message);
      }
    }
  }

  /**
   * 生成Markdown格式的报告
   * @param {Object} report - 报告对象
   * @returns {string} Markdown内容
   */
  generateMarkdownReport(report) {
    const { componentName, timestamp, summary, analysis, recommendations } = report;

    let markdown = `# ${componentName} 组件还原度报告\n\n`;
    markdown += `**生成时间**: ${new Date(timestamp).toLocaleString('zh-CN')}\n`;
    markdown += `**版本**: ${this.version}\n\n`;

    // 概要信息
    markdown += `## 📊 概要信息\n\n`;
    markdown += `- **还原度**: ${summary.matchPercentage.toFixed(2)}%\n`;
    markdown += `- **状态**: ${this.getStatusEmoji(summary.status)} ${this.getStatusText(summary.status)}\n`;
    markdown += `- **总问题数**: ${summary.totalIssues}\n`;
    markdown += `- **差异像素**: ${summary.diffPixels.toLocaleString()} / ${summary.totalPixels.toLocaleString()}\n`;
    markdown += `- **图片尺寸**: ${analysis.dimensions.width} × ${analysis.dimensions.height}\n\n`;

    // 图片对比
    markdown += `## 🖼️ 图片对比\n\n`;
    markdown += `| 原始设计 | 实际截图 | 差异对比 |\n`;
    markdown += `|----------|----------|----------|\n`;
    markdown += `| ![Expected](expected.png) | ![Actual](actual.png) | ![Diff](diff.png) |\n\n`;

    // 差异区域分析
    if (analysis.regions && analysis.regions.length > 0) {
      markdown += `## 🎯 差异区域分析\n\n`;
      analysis.regions.forEach((region, index) => {
        markdown += `### ${index + 1}. ${region.description}\n\n`;
        markdown += `- **位置**: (${region.x}, ${region.y})\n`;
        markdown += `- **尺寸**: ${region.width} × ${region.height}\n`;
        markdown += `- **严重程度**: ${this.getSeverityEmoji(region.severity)} ${region.severity}\n`;
        markdown += `- **类型**: ${region.type}\n`;
        markdown += `- **影响像素**: ${region.pixelCount}\n\n`;
      });
    }

    // 颜色差异分析
    if (analysis.colorAnalysis && analysis.colorAnalysis.length > 0) {
      markdown += `## 🎨 颜色差异分析\n\n`;
      markdown += `| 期望颜色 | 实际颜色 | 影响像素数 |\n`;
      markdown += `|----------|----------|------------|\n`;
      analysis.colorAnalysis.slice(0, 10).forEach(colorDiff => {
        markdown += `| ${colorDiff.expectedColor} | ${colorDiff.actualColor} | ${colorDiff.pixelCount} |\n`;
      });
      markdown += `\n`;
    }

    // 优化建议
    if (recommendations.immediate && recommendations.immediate.length > 0) {
      markdown += `## 🚨 立即修复建议\n\n`;
      recommendations.immediate.forEach((suggestion, index) => {
        markdown += `### ${index + 1}. ${suggestion.description}\n\n`;
        markdown += `- **类型**: ${suggestion.type}\n`;
        markdown += `- **优先级**: ${this.getPriorityEmoji(suggestion.priority)} ${suggestion.priority}\n`;
        markdown += `- **建议修复**: \`${suggestion.suggestedFix}\`\n`;
        markdown += `- **影响区域**: ${suggestion.affectedArea}\n\n`;
      });
    }

    if (recommendations.longTerm && recommendations.longTerm.length > 0) {
      markdown += `## 📈 长期优化建议\n\n`;
      recommendations.longTerm.forEach((suggestion, index) => {
        markdown += `### ${index + 1}. ${suggestion.description}\n\n`;
        markdown += `- **类型**: ${suggestion.type}\n`;
        markdown += `- **建议修复**: \`${suggestion.suggestedFix}\`\n`;
        markdown += `- **影响区域**: ${suggestion.affectedArea}\n\n`;
      });
    }

    // 技术信息
    markdown += `## 🔧 技术信息\n\n`;
    markdown += `- **分析阈值**: ${analysis.metadata.threshold || 'N/A'}\n`;
    markdown += `- **包含抗锯齿**: ${analysis.metadata.includeAA ? '是' : '否'}\n`;
    markdown += `- **分析时间**: ${analysis.metadata.analysisTimestamp || 'N/A'}\n\n`;

    return markdown;
  }

  // 辅助方法

  /**
   * 确定状态等级
   * @param {number} matchPercentage - 匹配百分比
   * @returns {string} 状态等级
   */
  determineStatus(matchPercentage) {
    if (matchPercentage >= 95) return 'excellent';
    if (matchPercentage >= 90) return 'good';
    if (matchPercentage >= 80) return 'needs_improvement';
    return 'poor';
  }

  /**
   * 统计问题数量
   * @param {Array} regions - 差异区域
   * @param {Array} suggestions - 建议列表
   * @returns {number} 问题总数
   */
  countIssues(regions = [], suggestions = []) {
    const highSeverityRegions = regions.filter(r => r.severity === 'high').length;
    const highPrioritySuggestions = suggestions.filter(s => s.priority === 'high').length;
    return highSeverityRegions + highPrioritySuggestions;
  }

  /**
   * 分类建议
   * @param {Array} suggestions - 建议列表
   * @returns {Object} 分类后的建议
   */
  categorizeRecommendations(suggestions) {
    return {
      immediate: suggestions.filter(s => s.priority === 'high'),
      longTerm: suggestions.filter(s => s.priority === 'medium' || s.priority === 'low')
    };
  }

  /**
   * 强度转颜色（热力图）
   * @param {number} intensity - 强度值 (0-1)
   * @returns {Object} RGBA颜色对象
   */
  intensityToColor(intensity) {
    if (intensity === 0) {
      return { r: 0, g: 0, b: 0, a: 0 }; // 透明
    }

    // 从蓝色到红色的渐变
    const red = Math.floor(255 * intensity);
    const blue = Math.floor(255 * (1 - intensity));
    const green = Math.floor(128 * (1 - Math.abs(intensity - 0.5) * 2));

    return {
      r: red,
      g: green,
      b: blue,
      a: Math.floor(255 * Math.min(intensity + 0.3, 1)) // 半透明到不透明
    };
  }

  /**
   * 调整图片尺寸
   * @param {PNG} png - 原始PNG对象
   * @param {number} maxWidth - 最大宽度
   * @param {number} maxHeight - 最大高度
   * @returns {PNG} 调整后的PNG对象
   */
  resizeImage(png, maxWidth, maxHeight) {
    const { width, height } = png;
    
    // 计算缩放比例
    const scaleX = maxWidth / width;
    const scaleY = maxHeight / height;
    const scale = Math.min(scaleX, scaleY);
    
    const newWidth = Math.floor(width * scale);
    const newHeight = Math.floor(height * scale);
    
    const resized = new PNG({ width: newWidth, height: newHeight });
    
    // 简单的最近邻插值
    for (let y = 0; y < newHeight; y++) {
      for (let x = 0; x < newWidth; x++) {
        const srcX = Math.floor(x / scale);
        const srcY = Math.floor(y / scale);
        
        const srcIdx = (width * srcY + srcX) << 2;
        const dstIdx = (newWidth * y + x) << 2;
        
        resized.data[dstIdx] = png.data[srcIdx];
        resized.data[dstIdx + 1] = png.data[srcIdx + 1];
        resized.data[dstIdx + 2] = png.data[srcIdx + 2];
        resized.data[dstIdx + 3] = png.data[srcIdx + 3];
      }
    }
    
    return resized;
  }

  // UI辅助方法

  getStatusText(status) {
    const statusMap = {
      excellent: '优秀',
      good: '良好',
      needs_improvement: '需要改进',
      poor: '较差'
    };
    return statusMap[status] || status;
  }

  getStatusEmoji(status) {
    const emojiMap = {
      excellent: '🎉',
      good: '✅',
      needs_improvement: '⚠️',
      poor: '❌'
    };
    return emojiMap[status] || '❓';
  }

  getSeverityEmoji(severity) {
    const emojiMap = {
      high: '🔴',
      medium: '🟡',
      low: '🟢'
    };
    return emojiMap[severity] || '⚪';
  }

  getPriorityEmoji(priority) {
    const emojiMap = {
      high: '🚨',
      medium: '⚠️',
      low: '💡'
    };
    return emojiMap[priority] || '📝';
  }
}