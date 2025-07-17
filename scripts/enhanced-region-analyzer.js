import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 增强的区域差异分析器
 * 能够识别具体的差异区域并生成详细的JSON描述
 */
class EnhancedRegionAnalyzer {
  constructor() {
    this.threshold = 0.1;
    this.minRegionSize = 100; // 最小区域大小（像素数）
    this.regionPadding = 10; // 区域边界扩展像素
  }

  /**
   * 分析两张图片的区域差异
   */
  async analyzeRegionDifferences(expectedPath, actualPath, figmaData = null) {
    console.log('🔍 开始增强区域差异分析...');
    
    try {
      // 读取和预处理图片
      const { expectedPng, actualPng, width, height } = await this.preprocessImages(expectedPath, actualPath);
      
      // 生成差异图和差异数据
      const { diffPixels, diffData } = this.generateDiffData(expectedPng, actualPng, width, height);
      
      // 识别差异区域
      const diffRegions = this.identifyDiffRegions(diffData, width, height);
      
      // 分析区域特征
      const analyzedRegions = this.analyzeRegionFeatures(diffRegions, expectedPng, actualPng, width, height);
      
      // 结合Figma数据进行语义分析
      const semanticAnalysis = this.performSemanticAnalysis(analyzedRegions, figmaData, width, height);
      
      // 生成详细报告
      const detailedReport = this.generateDetailedReport(
        analyzedRegions, 
        semanticAnalysis, 
        diffPixels, 
        width * height,
        width,
        height
      );
      
      console.log(`✅ 区域分析完成，发现 ${analyzedRegions.length} 个差异区域`);
      
      return detailedReport;
      
    } catch (error) {
      console.error('❌ 区域分析失败:', error.message);
      throw error;
    }
  }

  /**
   * 预处理图片 - 确保尺寸一致
   */
  async preprocessImages(expectedPath, actualPath) {
    let expectedBuffer = fs.readFileSync(expectedPath);
    let actualBuffer = fs.readFileSync(actualPath);

    const expectedSharp = sharp(expectedBuffer);
    const actualSharp = sharp(actualBuffer);

    const expectedMeta = await expectedSharp.metadata();
    const actualMeta = await actualSharp.metadata();

    console.log(`📐 期望图片尺寸: ${expectedMeta.width} × ${expectedMeta.height}`);
    console.log(`📐 实际图片尺寸: ${actualMeta.width} × ${actualMeta.height}`);
    
    // 如果尺寸不匹配，调整期望图片尺寸
    if (expectedMeta.width !== actualMeta.width || expectedMeta.height !== actualMeta.height) {
      console.warn('⚠️  图片尺寸不匹配，正在调整期望图片尺寸...');
      
      expectedBuffer = await expectedSharp
        .resize(actualMeta.width, actualMeta.height, { 
          fit: 'fill',
          kernel: sharp.kernel.nearest 
        })
        .png()
        .toBuffer();
    }

    const expectedPng = PNG.sync.read(expectedBuffer);
    const actualPng = PNG.sync.read(actualBuffer);
    const { width, height } = actualPng;

    return { expectedPng, actualPng, width, height };
  }

  /**
   * 生成差异数据
   */
  generateDiffData(expectedPng, actualPng, width, height) {
    const diff = new PNG({ width, height });
    
    const diffPixels = pixelmatch(
      expectedPng.data, 
      actualPng.data, 
      diff.data, 
      width, 
      height, 
      {
        threshold: this.threshold,
        includeAA: false,
        alpha: 0.1,
        diffColor: [255, 0, 0],
        aaColor: [255, 255, 0]
      }
    );

    // 创建差异掩码数组（1表示差异，0表示匹配）
    const diffMask = new Array(width * height).fill(0);
    for (let i = 0; i < diff.data.length; i += 4) {
      const pixelIndex = i / 4;
      // 如果红色通道值高，说明是差异像素
      if (diff.data[i] > 200) {
        diffMask[pixelIndex] = 1;
      }
    }

    return { diffPixels, diffData: diffMask };
  }

  /**
   * 识别连续的差异区域
   */
  identifyDiffRegions(diffData, width, height) {
    const visited = new Array(width * height).fill(false);
    const regions = [];

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = y * width + x;
        
        if (diffData[index] === 1 && !visited[index]) {
          const region = this.floodFill(diffData, visited, x, y, width, height);
          
          if (region.pixels.length >= this.minRegionSize) {
            regions.push(region);
          }
        }
      }
    }

    return regions;
  }

  /**
   * 洪水填充算法识别连通区域
   */
  floodFill(diffData, visited, startX, startY, width, height) {
    const stack = [[startX, startY]];
    const pixels = [];
    let minX = startX, maxX = startX, minY = startY, maxY = startY;

    while (stack.length > 0) {
      const [x, y] = stack.pop();
      const index = y * width + x;

      if (x < 0 || x >= width || y < 0 || y >= height || 
          visited[index] || diffData[index] === 0) {
        continue;
      }

      visited[index] = true;
      pixels.push({ x, y });

      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);

      // 添加相邻像素到栈中
      stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
    }

    return {
      pixels,
      boundingBox: {
        x: Math.max(0, minX - this.regionPadding),
        y: Math.max(0, minY - this.regionPadding),
        width: Math.min(width, maxX - minX + 1 + 2 * this.regionPadding),
        height: Math.min(height, maxY - minY + 1 + 2 * this.regionPadding)
      },
      center: {
        x: Math.round((minX + maxX) / 2),
        y: Math.round((minY + maxY) / 2)
      },
      area: pixels.length
    };
  }

  /**
   * 分析区域特征
   */
  analyzeRegionFeatures(regions, expectedPng, actualPng, width, height) {
    return regions.map((region, index) => {
      const { boundingBox, center, area } = region;
      
      // 计算区域在图片中的相对位置
      const relativePosition = {
        x: center.x / width,
        y: center.y / height
      };

      // 分析颜色差异
      const colorAnalysis = this.analyzeRegionColors(region, expectedPng, actualPng, width);
      
      // 确定区域类型
      const regionType = this.classifyRegion(boundingBox, area, colorAnalysis);
      
      return {
        id: `region_${index + 1}`,
        boundingBox,
        center,
        area,
        relativePosition,
        colorAnalysis,
        regionType,
        severity: this.calculateSeverity(area, colorAnalysis)
      };
    });
  }

  /**
   * 分析区域颜色差异
   */
  analyzeRegionColors(region, expectedPng, actualPng, width) {
    const { pixels } = region;
    let totalColorDiff = 0;
    const colorDiffs = [];

    for (const pixel of pixels.slice(0, Math.min(100, pixels.length))) { // 采样分析
      const index = (pixel.y * width + pixel.x) * 4;
      
      const expectedR = expectedPng.data[index];
      const expectedG = expectedPng.data[index + 1];
      const expectedB = expectedPng.data[index + 2];
      
      const actualR = actualPng.data[index];
      const actualG = actualPng.data[index + 1];
      const actualB = actualPng.data[index + 2];
      
      const colorDiff = Math.sqrt(
        Math.pow(expectedR - actualR, 2) +
        Math.pow(expectedG - actualG, 2) +
        Math.pow(expectedB - actualB, 2)
      );
      
      totalColorDiff += colorDiff;
      colorDiffs.push(colorDiff);
    }

    return {
      averageColorDiff: totalColorDiff / colorDiffs.length,
      maxColorDiff: Math.max(...colorDiffs),
      minColorDiff: Math.min(...colorDiffs)
    };
  }

  /**
   * 分类区域类型
   */
  classifyRegion(boundingBox, area, colorAnalysis) {
    const aspectRatio = boundingBox.width / boundingBox.height;
    
    if (area < 500) return 'small_detail';
    if (area > 10000) return 'large_area';
    if (aspectRatio > 3) return 'horizontal_element';
    if (aspectRatio < 0.33) return 'vertical_element';
    if (colorAnalysis.averageColorDiff > 100) return 'color_mismatch';
    
    return 'general_difference';
  }

  /**
   * 计算差异严重程度
   */
  calculateSeverity(area, colorAnalysis) {
    const areaScore = Math.min(area / 1000, 10); // 面积评分
    const colorScore = colorAnalysis.averageColorDiff / 25.5; // 颜色差异评分
    
    const totalScore = (areaScore + colorScore) / 2;
    
    if (totalScore > 7) return 'critical';
    if (totalScore > 4) return 'major';
    if (totalScore > 2) return 'minor';
    return 'trivial';
  }

  /**
   * 结合Figma数据进行语义分析
   */
  performSemanticAnalysis(regions, figmaData, width, height) {
    if (!figmaData || !figmaData.nodes) {
      return { message: 'No Figma data available for semantic analysis' };
    }

    const semanticRegions = regions.map(region => {
      const matchedElements = this.findMatchingFigmaElements(region, figmaData.nodes, width, height);
      
      return {
        regionId: region.id,
        matchedElements,
        possibleIssues: this.identifyPossibleIssues(region, matchedElements)
      };
    });

    return {
      semanticRegions,
      summary: this.generateSemanticSummary(semanticRegions)
    };
  }

  /**
   * 查找匹配的Figma元素
   */
  findMatchingFigmaElements(region, figmaNodes, width, height) {
    const matches = [];
    
    const searchNodes = (nodes) => {
      for (const node of nodes) {
        if (node.boundingBox) {
          const figmaBox = node.boundingBox;
          const overlap = this.calculateOverlap(region.boundingBox, figmaBox, width, height);
          
          if (overlap > 0.3) { // 30%以上重叠认为是匹配
            matches.push({
              nodeId: node.id,
              nodeName: node.name,
              nodeType: node.type,
              overlap,
              figmaBoundingBox: figmaBox
            });
          }
        }
        
        if (node.children) {
          searchNodes(node.children);
        }
      }
    };

    searchNodes(figmaNodes);
    return matches.sort((a, b) => b.overlap - a.overlap);
  }

  /**
   * 计算区域重叠度
   */
  calculateOverlap(regionBox, figmaBox, width, height) {
    // 将Figma坐标转换为像素坐标
    const figmaPixelBox = {
      x: figmaBox.x * 3, // 假设3x缩放
      y: figmaBox.y * 3,
      width: figmaBox.width * 3,
      height: figmaBox.height * 3
    };

    const x1 = Math.max(regionBox.x, figmaPixelBox.x);
    const y1 = Math.max(regionBox.y, figmaPixelBox.y);
    const x2 = Math.min(regionBox.x + regionBox.width, figmaPixelBox.x + figmaPixelBox.width);
    const y2 = Math.min(regionBox.y + regionBox.height, figmaPixelBox.y + figmaPixelBox.height);

    if (x2 <= x1 || y2 <= y1) return 0;

    const overlapArea = (x2 - x1) * (y2 - y1);
    const regionArea = regionBox.width * regionBox.height;
    
    return overlapArea / regionArea;
  }

  /**
   * 识别可能的问题
   */
  identifyPossibleIssues(region, matchedElements) {
    const issues = [];
    
    if (matchedElements.length === 0) {
      issues.push({
        type: 'unmatched_element',
        description: '该差异区域无法匹配到对应的Figma元素',
        suggestion: '检查是否有遗漏的元素或位置偏移'
      });
    }

    if (region.regionType === 'color_mismatch') {
      issues.push({
        type: 'color_difference',
        description: '颜色差异较大',
        suggestion: '检查CSS颜色值、渐变或背景图片'
      });
    }

    if (region.regionType === 'large_area') {
      issues.push({
        type: 'layout_issue',
        description: '大面积差异，可能是布局问题',
        suggestion: '检查元素位置、尺寸或显示状态'
      });
    }

    if (region.severity === 'critical') {
      issues.push({
        type: 'critical_difference',
        description: '严重差异，需要优先处理',
        suggestion: '立即检查该区域的实现'
      });
    }

    return issues;
  }

  /**
   * 生成语义分析摘要
   */
  generateSemanticSummary(semanticRegions) {
    const totalRegions = semanticRegions.length;
    const unmatchedRegions = semanticRegions.filter(r => r.matchedElements.length === 0).length;
    const criticalIssues = semanticRegions.filter(r => 
      r.possibleIssues.some(issue => issue.type === 'critical_difference')
    ).length;

    return {
      totalDifferenceRegions: totalRegions,
      unmatchedElements: unmatchedRegions,
      criticalIssues,
      analysisQuality: unmatchedRegions / totalRegions < 0.3 ? 'good' : 'needs_improvement'
    };
  }

  /**
   * 生成详细报告
   */
  generateDetailedReport(regions, semanticAnalysis, diffPixels, totalPixels, width, height) {
    const matchPercentage = ((totalPixels - diffPixels) / totalPixels * 100);
    
    return {
      summary: {
        matchPercentage: parseFloat(matchPercentage.toFixed(2)),
        totalDiffPixels: diffPixels,
        totalPixels,
        dimensions: { width, height },
        qualityLevel: this.getQualityLevel(matchPercentage),
        totalDifferenceRegions: regions.length
      },
      regions: regions.map(region => ({
        ...region,
        semanticInfo: semanticAnalysis.semanticRegions?.find(s => s.regionId === region.id) || null
      })),
      semanticAnalysis,
      recommendations: this.generateRecommendations(regions, semanticAnalysis),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * 获取质量等级
   */
  getQualityLevel(matchPercentage) {
    if (matchPercentage >= 99) return { level: 'excellent', emoji: '🎯', text: '完美' };
    if (matchPercentage >= 95) return { level: 'good', emoji: '✅', text: '优秀' };
    if (matchPercentage >= 90) return { level: 'fair', emoji: '👍', text: '良好' };
    if (matchPercentage >= 80) return { level: 'poor', emoji: '⚠️', text: '一般' };
    return { level: 'very_poor', emoji: '❌', text: '较差' };
  }

  /**
   * 生成优化建议
   */
  generateRecommendations(regions, semanticAnalysis) {
    const recommendations = [];
    
    // 基于区域分析的建议
    const criticalRegions = regions.filter(r => r.severity === 'critical');
    if (criticalRegions.length > 0) {
      recommendations.push({
        priority: 'high',
        type: 'critical_fixes',
        description: `发现 ${criticalRegions.length} 个严重差异区域需要立即修复`,
        regions: criticalRegions.map(r => r.id)
      });
    }

    const colorIssues = regions.filter(r => r.regionType === 'color_mismatch');
    if (colorIssues.length > 0) {
      recommendations.push({
        priority: 'medium',
        type: 'color_adjustments',
        description: `${colorIssues.length} 个区域存在颜色差异，检查CSS颜色值`,
        regions: colorIssues.map(r => r.id)
      });
    }

    const layoutIssues = regions.filter(r => r.regionType === 'large_area');
    if (layoutIssues.length > 0) {
      recommendations.push({
        priority: 'high',
        type: 'layout_fixes',
        description: `${layoutIssues.length} 个大面积差异，可能是布局问题`,
        regions: layoutIssues.map(r => r.id)
      });
    }

    // 基于语义分析的建议
    if (semanticAnalysis.summary?.unmatchedElements > 0) {
      recommendations.push({
        priority: 'medium',
        type: 'element_mapping',
        description: `${semanticAnalysis.summary.unmatchedElements} 个差异区域无法匹配Figma元素，检查是否有遗漏`
      });
    }

    return recommendations;
  }
}

export { EnhancedRegionAnalyzer };
