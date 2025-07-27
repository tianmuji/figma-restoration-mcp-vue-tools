/**
 * 增强的对比分析引擎
 * 提供详细的像素级对比分析、差异区域识别和优化建议生成
 */

import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';

export class ComparisonAnalyzer {
  constructor(options = {}) {
    this.threshold = options.threshold || 0.1;
    this.includeAA = options.includeAA !== false;
    this.alpha = options.alpha || 0.1;
    this.aaColor = options.aaColor || [255, 255, 0];
    this.diffColor = options.diffColor || [255, 0, 0];
  }

  /**
   * 执行完整的对比分析
   * @param {Buffer} expectedBuffer - 期望图片的缓冲区
   * @param {Buffer} actualBuffer - 实际图片的缓冲区
   * @returns {Promise<ComparisonResult>} 详细的对比分析结果
   */
  async analyzeComparison(expectedBuffer, actualBuffer) {
    try {
      // 解析PNG图片
      const expectedPng = PNG.sync.read(expectedBuffer);
      const actualPng = PNG.sync.read(actualBuffer);

      // 验证图片尺寸
      if (expectedPng.width !== actualPng.width || expectedPng.height !== actualPng.height) {
        throw new Error(`Image dimensions mismatch: expected ${expectedPng.width}x${expectedPng.height}, got ${actualPng.width}x${actualPng.height}`);
      }

      const { width, height } = expectedPng;
      const totalPixels = width * height;

      // 创建差异图片
      const diffPng = new PNG({ width, height });

      // 执行像素匹配
      const diffPixels = pixelmatch(
        expectedPng.data,
        actualPng.data,
        diffPng.data,
        width,
        height,
        {
          threshold: this.threshold,
          includeAA: this.includeAA,
          alpha: this.alpha,
          aaColor: this.aaColor,
          diffColor: this.diffColor
        }
      );

      const matchPercentage = ((totalPixels - diffPixels) / totalPixels) * 100;

      // 执行详细分析
      const regions = this.identifyDiffRegions(expectedPng, actualPng, diffPng);
      const colorAnalysis = this.analyzeColorDifferences(expectedPng, actualPng);
      const heatmapData = this.generateHeatmap(diffPng);
      const suggestions = this.generateSuggestions(regions, colorAnalysis, matchPercentage);

      return {
        matchPercentage,
        diffPixels,
        totalPixels,
        dimensions: { width, height },
        regions,
        colorAnalysis,
        heatmapData,
        suggestions,
        metadata: {
          threshold: this.threshold,
          includeAA: this.includeAA,
          analysisTimestamp: new Date().toISOString()
        },
        diffImageBuffer: PNG.sync.write(diffPng)
      };

    } catch (error) {
      throw new Error(`Comparison analysis failed: ${error.message}`);
    }
  }

  /**
   * 识别差异区域
   * @param {PNG} expectedPng - 期望图片
   * @param {PNG} actualPng - 实际图片
   * @param {PNG} diffPng - 差异图片
   * @returns {Array<DiffRegion>} 差异区域列表
   */
  identifyDiffRegions(expectedPng, actualPng, diffPng) {
    const { width, height } = diffPng;
    const regions = [];
    const visited = new Set();
    const minRegionSize = 10; // 最小区域大小（像素）

    // 扫描差异像素并聚类成区域
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (width * y + x) << 2;
        const key = `${x},${y}`;

        // 跳过已访问的像素和非差异像素
        if (visited.has(key) || diffPng.data[idx] === 0) {
          continue;
        }

        // 使用洪水填充算法找到连通的差异区域
        const region = this.floodFillRegion(diffPng, x, y, visited);
        
        if (region.pixels.length >= minRegionSize) {
          const analysis = this.analyzeRegion(region, expectedPng, actualPng);
          regions.push({
            x: region.bounds.minX,
            y: region.bounds.minY,
            width: region.bounds.maxX - region.bounds.minX + 1,
            height: region.bounds.maxY - region.bounds.minY + 1,
            pixelCount: region.pixels.length,
            severity: this.calculateSeverity(region.pixels.length, analysis),
            type: analysis.type,
            description: analysis.description,
            expectedColors: analysis.expectedColors,
            actualColors: analysis.actualColors
          });
        }
      }
    }

    // 按严重程度和大小排序
    return regions.sort((a, b) => {
      const severityOrder = { high: 3, medium: 2, low: 1 };
      const severityDiff = severityOrder[b.severity] - severityOrder[a.severity];
      return severityDiff !== 0 ? severityDiff : b.pixelCount - a.pixelCount;
    });
  }

  /**
   * 洪水填充算法找到连通区域
   * @param {PNG} diffPng - 差异图片
   * @param {number} startX - 起始X坐标
   * @param {number} startY - 起始Y坐标
   * @param {Set} visited - 已访问像素集合
   * @returns {Object} 区域信息
   */
  floodFillRegion(diffPng, startX, startY, visited) {
    const { width, height } = diffPng;
    const stack = [{ x: startX, y: startY }];
    const pixels = [];
    const bounds = {
      minX: startX,
      maxX: startX,
      minY: startY,
      maxY: startY
    };

    while (stack.length > 0) {
      const { x, y } = stack.pop();
      const key = `${x},${y}`;

      if (visited.has(key) || x < 0 || x >= width || y < 0 || y >= height) {
        continue;
      }

      const idx = (width * y + x) << 2;
      if (diffPng.data[idx] === 0) {
        continue; // 非差异像素
      }

      visited.add(key);
      pixels.push({ x, y, idx });

      // 更新边界
      bounds.minX = Math.min(bounds.minX, x);
      bounds.maxX = Math.max(bounds.maxX, x);
      bounds.minY = Math.min(bounds.minY, y);
      bounds.maxY = Math.max(bounds.maxY, y);

      // 添加相邻像素到栈中
      stack.push(
        { x: x + 1, y },
        { x: x - 1, y },
        { x, y: y + 1 },
        { x, y: y - 1 }
      );
    }

    return { pixels, bounds };
  }

  /**
   * 分析区域特征
   * @param {Object} region - 区域信息
   * @param {PNG} expectedPng - 期望图片
   * @param {PNG} actualPng - 实际图片
   * @returns {Object} 区域分析结果
   */
  analyzeRegion(region, expectedPng, actualPng) {
    const expectedColors = new Map();
    const actualColors = new Map();
    let totalColorDiff = 0;

    // 分析区域内的颜色分布
    region.pixels.forEach(({ idx }) => {
      const expectedColor = this.getPixelColor(expectedPng.data, idx);
      const actualColor = this.getPixelColor(actualPng.data, idx);

      // 统计颜色分布
      const expectedKey = this.colorToKey(expectedColor);
      const actualKey = this.colorToKey(actualColor);

      expectedColors.set(expectedKey, (expectedColors.get(expectedKey) || 0) + 1);
      actualColors.set(actualKey, (actualColors.get(actualKey) || 0) + 1);

      // 计算颜色差异
      totalColorDiff += this.calculateColorDistance(expectedColor, actualColor);
    });

    const avgColorDiff = totalColorDiff / region.pixels.length;
    const type = this.determineRegionType(region, expectedColors, actualColors, avgColorDiff);
    const description = this.generateRegionDescription(type, region, expectedColors, actualColors);

    return {
      type,
      description,
      expectedColors: Array.from(expectedColors.entries()).map(([color, count]) => ({ color, count })),
      actualColors: Array.from(actualColors.entries()).map(([color, count]) => ({ color, count })),
      avgColorDiff
    };
  }

  /**
   * 分析颜色差异
   * @param {PNG} expectedPng - 期望图片
   * @param {PNG} actualPng - 实际图片
   * @returns {Array<ColorDifference>} 颜色差异列表
   */
  analyzeColorDifferences(expectedPng, actualPng) {
    const colorDiffs = new Map();
    const { width, height } = expectedPng;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (width * y + x) << 2;
        const expectedColor = this.getPixelColor(expectedPng.data, idx);
        const actualColor = this.getPixelColor(actualPng.data, idx);

        if (!this.colorsEqual(expectedColor, actualColor)) {
          const key = `${this.colorToKey(expectedColor)}->${this.colorToKey(actualColor)}`;
          
          if (!colorDiffs.has(key)) {
            colorDiffs.set(key, {
              expectedColor: this.colorToKey(expectedColor),
              actualColor: this.colorToKey(actualColor),
              pixelCount: 0,
              regions: []
            });
          }

          const diff = colorDiffs.get(key);
          diff.pixelCount++;
          
          // 简化区域记录（可以后续优化为更精确的区域检测）
          if (diff.regions.length === 0 || 
              Math.abs(diff.regions[diff.regions.length - 1].x - x) > 10 ||
              Math.abs(diff.regions[diff.regions.length - 1].y - y) > 10) {
            diff.regions.push({ x, y, width: 1, height: 1 });
          }
        }
      }
    }

    return Array.from(colorDiffs.values())
      .sort((a, b) => b.pixelCount - a.pixelCount)
      .slice(0, 20); // 返回前20个最显著的颜色差异
  }

  /**
   * 生成热力图数据
   * @param {PNG} diffPng - 差异图片
   * @returns {Object} 热力图数据
   */
  generateHeatmap(diffPng) {
    const { width, height } = diffPng;
    const gridSize = 10; // 热力图网格大小
    const gridWidth = Math.ceil(width / gridSize);
    const gridHeight = Math.ceil(height / gridSize);
    const heatmap = new Array(gridHeight).fill(null).map(() => new Array(gridWidth).fill(0));

    // 计算每个网格的差异密度
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (width * y + x) << 2;
        if (diffPng.data[idx] > 0) { // 有差异的像素
          const gridX = Math.floor(x / gridSize);
          const gridY = Math.floor(y / gridSize);
          heatmap[gridY][gridX]++;
        }
      }
    }

    // 归一化热力图数据
    const maxValue = Math.max(...heatmap.flat());
    if (maxValue > 0) {
      for (let y = 0; y < gridHeight; y++) {
        for (let x = 0; x < gridWidth; x++) {
          heatmap[y][x] = heatmap[y][x] / maxValue;
        }
      }
    }

    return {
      data: heatmap,
      gridSize,
      width: gridWidth,
      height: gridHeight,
      maxValue
    };
  }

  /**
   * 生成优化建议
   * @param {Array<DiffRegion>} regions - 差异区域
   * @param {Array<ColorDifference>} colorAnalysis - 颜色分析
   * @param {number} matchPercentage - 匹配百分比
   * @returns {Array<OptimizationSuggestion>} 优化建议列表
   */
  generateSuggestions(regions, colorAnalysis, matchPercentage) {
    const suggestions = [];

    // 基于整体匹配度的建议
    if (matchPercentage < 80) {
      suggestions.push({
        type: 'layout',
        priority: 'high',
        description: '整体还原度较低，建议检查组件的基本布局和尺寸设置',
        suggestedFix: '检查 width、height、padding、margin 等基础样式属性',
        affectedArea: '整个组件',
        impact: 'high'
      });
    }

    // 基于颜色差异的建议
    colorAnalysis.slice(0, 5).forEach((colorDiff, index) => {
      if (colorDiff.pixelCount > 100) {
        suggestions.push({
          type: 'color',
          priority: colorDiff.pixelCount > 1000 ? 'high' : 'medium',
          description: `检测到显著的颜色差异：期望 ${colorDiff.expectedColor}，实际 ${colorDiff.actualColor}`,
          suggestedFix: `background-color: ${colorDiff.expectedColor}; 或 color: ${colorDiff.expectedColor};`,
          affectedArea: `${colorDiff.pixelCount} 个像素区域`,
          impact: colorDiff.pixelCount > 1000 ? 'high' : 'medium'
        });
      }
    });

    // 基于差异区域的建议
    regions.slice(0, 3).forEach((region) => {
      if (region.severity === 'high') {
        let suggestion = {
          type: region.type,
          priority: 'high',
          affectedArea: `区域 (${region.x}, ${region.y}) ${region.width}x${region.height}`,
          impact: 'high'
        };

        switch (region.type) {
          case 'color':
            suggestion.description = '检测到大面积颜色差异';
            suggestion.suggestedFix = '检查背景色、边框色或文字颜色设置';
            break;
          case 'shape':
            suggestion.description = '检测到形状或边框差异';
            suggestion.suggestedFix = '检查 border-radius、border-width 或元素形状';
            break;
          case 'position':
            suggestion.description = '检测到位置偏移';
            suggestion.suggestedFix = '检查 position、top、left、transform 等定位属性';
            break;
          case 'size':
            suggestion.description = '检测到尺寸差异';
            suggestion.suggestedFix = '检查 width、height、padding、margin 等尺寸属性';
            break;
          default:
            suggestion.description = region.description;
            suggestion.suggestedFix = '请根据差异图片进行具体分析';
        }

        suggestions.push(suggestion);
      }
    });

    // 基于匹配度的通用建议
    if (matchPercentage >= 95) {
      suggestions.push({
        type: 'general',
        priority: 'low',
        description: '组件还原度优秀，可以考虑微调细节',
        suggestedFix: '检查字体渲染、抗锯齿设置或细微的间距调整',
        affectedArea: '细节优化',
        impact: 'low'
      });
    } else if (matchPercentage >= 90) {
      suggestions.push({
        type: 'general',
        priority: 'medium',
        description: '组件还原度良好，建议优化主要差异区域',
        suggestedFix: '重点关注面积较大的差异区域',
        affectedArea: '主要差异区域',
        impact: 'medium'
      });
    }

    return suggestions.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  // 辅助方法

  getPixelColor(data, idx) {
    return {
      r: data[idx],
      g: data[idx + 1],
      b: data[idx + 2],
      a: data[idx + 3]
    };
  }

  colorToKey(color) {
    return `rgb(${color.r},${color.g},${color.b})`;
  }

  colorsEqual(color1, color2, tolerance = 5) {
    return Math.abs(color1.r - color2.r) <= tolerance &&
           Math.abs(color1.g - color2.g) <= tolerance &&
           Math.abs(color1.b - color2.b) <= tolerance;
  }

  calculateColorDistance(color1, color2) {
    return Math.sqrt(
      Math.pow(color1.r - color2.r, 2) +
      Math.pow(color1.g - color2.g, 2) +
      Math.pow(color1.b - color2.b, 2)
    );
  }

  calculateSeverity(pixelCount, analysis) {
    if (pixelCount > 1000 || analysis.avgColorDiff > 100) return 'high';
    if (pixelCount > 100 || analysis.avgColorDiff > 50) return 'medium';
    return 'low';
  }

  determineRegionType(region, expectedColors, actualColors, avgColorDiff) {
    const area = region.bounds ? 
      (region.bounds.maxX - region.bounds.minX) * (region.bounds.maxY - region.bounds.minY) : 
      region.pixels.length;

    // 基于颜色差异判断类型
    if (avgColorDiff > 100) return 'color';
    
    // 基于形状特征判断
    const aspectRatio = region.bounds ? 
      (region.bounds.maxX - region.bounds.minX) / (region.bounds.maxY - region.bounds.minY) : 1;
    
    if (aspectRatio > 5 || aspectRatio < 0.2) return 'shape';
    if (area > 500) return 'size';
    
    return 'position';
  }

  generateRegionDescription(type, region, expectedColors, actualColors) {
    const pixelCount = region.pixels.length;
    const area = region.bounds ? 
      `${region.bounds.maxX - region.bounds.minX}x${region.bounds.maxY - region.bounds.minY}` : 
      `${pixelCount}px`;

    switch (type) {
      case 'color':
        return `${area} 区域存在颜色差异，涉及 ${pixelCount} 个像素`;
      case 'shape':
        return `${area} 区域存在形状差异，可能是边框或圆角问题`;
      case 'position':
        return `${area} 区域存在位置偏移，涉及 ${pixelCount} 个像素`;
      case 'size':
        return `${area} 区域存在尺寸差异，涉及 ${pixelCount} 个像素`;
      default:
        return `${area} 区域存在未知类型差异，涉及 ${pixelCount} 个像素`;
    }
  }
}