import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 检测差异区域的坐标 - 高效实现
 */
function detectDiffRegions(diffData, width, height, threshold = 100) {
  let diffPixelCount = 0;
  let minX = width, maxX = 0, minY = height, maxY = 0;

  // 简化版：只计算总体边界框，避免复杂的聚类算法
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (width * y + x) << 2;
      const r = diffData[idx];
      const g = diffData[idx + 1];
      const b = diffData[idx + 2];

      // 检查是否为差异像素（红色像素）
      if (r > 200 && g < 50 && b < 50) {
        diffPixelCount++;
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
      }
    }
  }

  if (diffPixelCount === 0) {
    return [];
  }

  // 将大的差异区域分割为更小的区域进行分析
  const regions = [];
  const regionWidth = maxX - minX + 1;
  const regionHeight = maxY - minY + 1;

  // 如果差异区域太大，分割为4个子区域
  if (regionWidth > 300 || regionHeight > 300) {
    const midX = Math.floor((minX + maxX) / 2);
    const midY = Math.floor((minY + maxY) / 2);

    const subRegions = [
      { left: minX, top: minY, right: midX, bottom: midY },
      { left: midX, top: minY, right: maxX, bottom: midY },
      { left: minX, top: midY, right: midX, bottom: maxY },
      { left: midX, top: midY, right: maxX, bottom: maxY }
    ];

    for (const subRegion of subRegions) {
      const pixelCount = countPixelsInRegion(diffData, width, height, subRegion);
      if (pixelCount >= threshold) {
        regions.push({
          left: subRegion.left,
          right: subRegion.right,
          top: subRegion.top,
          bottom: subRegion.bottom,
          width: subRegion.right - subRegion.left + 1,
          height: subRegion.bottom - subRegion.top + 1,
          pixelCount: pixelCount,
          center: {
            x: Math.round((subRegion.left + subRegion.right) / 2),
            y: Math.round((subRegion.top + subRegion.bottom) / 2)
          }
        });
      }
    }
  } else {
    // 单个区域
    regions.push({
      left: minX,
      right: maxX,
      top: minY,
      bottom: maxY,
      width: regionWidth,
      height: regionHeight,
      pixelCount: diffPixelCount,
      center: {
        x: Math.round((minX + maxX) / 2),
        y: Math.round((minY + maxY) / 2)
      }
    });
  }

  // 按区域大小排序
  return regions.sort((a, b) => b.pixelCount - a.pixelCount);
}

/**
 * 计算指定区域内的差异像素数量
 */
function countPixelsInRegion(diffData, width, height, region) {
  let count = 0;
  for (let y = region.top; y <= region.bottom && y < height; y++) {
    for (let x = region.left; x <= region.right && x < width; x++) {
      const idx = (width * y + x) << 2;
      const r = diffData[idx];
      const g = diffData[idx + 1];
      const b = diffData[idx + 2];

      if (r > 200 && g < 50 && b < 50) {
        count++;
      }
    }
  }
  return count;
}



/**
 * 计算区域边界
 */
function calculateBounds(pixels) {
  let left = Infinity, right = -Infinity;
  let top = Infinity, bottom = -Infinity;
  
  for (const {x, y} of pixels) {
    left = Math.min(left, x);
    right = Math.max(right, x);
    top = Math.min(top, y);
    bottom = Math.max(bottom, y);
  }
  
  return {
    left,
    right,
    top,
    bottom,
    width: right - left + 1,
    height: bottom - top + 1
  };
}

/**
 * 将3倍图坐标转换为1倍图坐标
 */
function convertTo1xCoordinates(regions, scale = 3) {
  return regions.map(region => ({
    ...region,
    left: Math.round(region.left / scale),
    right: Math.round(region.right / scale),
    top: Math.round(region.top / scale),
    bottom: Math.round(region.bottom / scale),
    width: Math.round(region.width / scale),
    height: Math.round(region.height / scale),
    center: {
      x: Math.round(region.center.x / scale),
      y: Math.round(region.center.y / scale)
    }
  }));
}

/**
 * 根据坐标匹配Figma元素 - 增强版
 */
function matchFigmaElements(diffRegions, figmaData) {
  const matches = [];

  if (!figmaData || !figmaData.nodes) {
    console.warn('⚠️  Figma数据不完整，无法进行元素匹配');
    return matches;
  }

  // 将1倍图坐标转换为3倍图坐标进行匹配
  const scaledRegions = diffRegions.map(region => ({
    ...region,
    left: region.left * 3,
    right: region.right * 3,
    top: region.top * 3,
    bottom: region.bottom * 3,
    width: region.width * 3,
    height: region.height * 3,
    center: {
      x: region.center.x * 3,
      y: region.center.y * 3
    }
  }));

  for (const region of scaledRegions) {
    const matchedElements = [];

    // 递归搜索所有节点
    function searchNodes(nodes) {
      for (const node of nodes) {
        if (node.boundingBox) {
          const bbox = node.boundingBox;

          // 检查是否有重叠
          if (isOverlapping(region, bbox)) {
            const overlap = calculateOverlap(region, bbox);
            const distance = calculateDistance(region.center, {
              x: bbox.x + bbox.width / 2,
              y: bbox.y + bbox.height / 2
            });

            matchedElements.push({
              id: node.id,
              name: node.name,
              type: node.type,
              boundingBox: bbox,
              overlapPercentage: overlap,
              distance: distance,
              confidence: calculateConfidence(overlap, distance, region.pixelCount)
            });
          }
        }

        // 递归搜索子节点
        if (node.children) {
          searchNodes(node.children);
        }
      }
    }

    searchNodes(figmaData.nodes);

    // 按置信度排序
    matchedElements.sort((a, b) => b.confidence - a.confidence);

    matches.push({
      region: diffRegions[scaledRegions.indexOf(region)], // 返回原始1倍图区域
      elements: matchedElements.slice(0, 5) // 保留前5个最匹配的元素
    });
  }

  return matches;
}

/**
 * 计算两点之间的距离
 */
function calculateDistance(point1, point2) {
  return Math.sqrt(
    Math.pow(point1.x - point2.x, 2) + Math.pow(point1.y - point2.y, 2)
  );
}

/**
 * 计算匹配置信度
 */
function calculateConfidence(overlapPercentage, distance, pixelCount) {
  // 重叠度权重40%，距离权重30%，像素数量权重30%
  const overlapScore = overlapPercentage / 100;
  const distanceScore = Math.max(0, 1 - distance / 200); // 距离越近分数越高
  const pixelScore = Math.min(1, pixelCount / 1000); // 像素数量越多分数越高

  return (overlapScore * 0.4 + distanceScore * 0.3 + pixelScore * 0.3) * 100;
}

/**
 * 检查两个矩形是否重叠
 */
function isOverlapping(region, bbox) {
  return !(region.right < bbox.x || 
           region.left > bbox.x + bbox.width ||
           region.bottom < bbox.y || 
           region.top > bbox.y + bbox.height);
}

/**
 * 计算重叠百分比
 */
function calculateOverlap(region, bbox) {
  const overlapLeft = Math.max(region.left, bbox.x);
  const overlapRight = Math.min(region.right, bbox.x + bbox.width);
  const overlapTop = Math.max(region.top, bbox.y);
  const overlapBottom = Math.min(region.bottom, bbox.y + bbox.height);
  
  if (overlapLeft >= overlapRight || overlapTop >= overlapBottom) {
    return 0;
  }
  
  const overlapArea = (overlapRight - overlapLeft) * (overlapBottom - overlapTop);
  const regionArea = region.width * region.height;
  
  return (overlapArea / regionArea * 100);
}

/**
 * 增强版图片对比 - 包含差异区域检测
 */
async function enhancedCompareImages(expectedPath, actualPath, diffOutputPath, componentName) {
  console.log('🔍 开始增强版图片对比...');
  
  try {
    // 读取图片
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
      console.log('✅ 期望图片已调整为实际图片尺寸');
    } else {
      console.log('✅ 图片尺寸完全匹配，无需调整');
    }

    // 使用 PNG.js 解析图片
    const expectedPng = PNG.sync.read(expectedBuffer);
    const actualPng = PNG.sync.read(actualBuffer);
    const { width, height } = actualPng;

    // 创建差异图
    const diff = new PNG({ width, height });

    // 进行像素匹配
    const diffPixelCount = pixelmatch(expectedPng.data, actualPng.data, diff.data, width, height, {
      threshold: 0.1,
      includeAA: false,
      alpha: 0.1,
      diffColor: [255, 0, 0], // 红色
      aaColor: [255, 255, 0]  // 黄色
    });

    // 保存差异图
    fs.writeFileSync(diffOutputPath, PNG.sync.write(diff));

    const totalPixels = width * height;
    const matchPercentage = ((totalPixels - diffPixelCount) / totalPixels * 100).toFixed(2);

    console.log(`\n📊 对比结果:`);
    console.log(`   匹配度: ${matchPercentage}%`);
    console.log(`   差异像素: ${diffPixelCount}/${totalPixels}`);
    console.log(`   差异图已保存: ${diffOutputPath}`);

    // 检测差异区域
    console.log('\n🔍 检测差异区域...');
    const diffRegions3x = detectDiffRegions(diff.data, width, height, 25);
    const diffRegions1x = convertTo1xCoordinates(diffRegions3x, 3);
    
    console.log(`📍 发现 ${diffRegions1x.length} 个主要差异区域:`);
    diffRegions1x.forEach((region, index) => {
      console.log(`   区域 ${index + 1}: (${region.left},${region.top}) → (${region.right},${region.bottom})`);
      console.log(`            尺寸: ${region.width}×${region.height}, 中心: (${region.center.x},${region.center.y})`);
      console.log(`            像素数: ${region.pixelCount}`);
    });

    // 尝试加载Figma数据进行元素匹配
    const figmaDataPath = path.join(path.dirname(expectedPath), 'complete-figma-data.json');
    let figmaMatches = [];
    
    if (fs.existsSync(figmaDataPath)) {
      try {
        const figmaData = JSON.parse(fs.readFileSync(figmaDataPath, 'utf8'));
        figmaMatches = matchFigmaElements(diffRegions1x, figmaData);
        
        console.log('\n🎯 Figma元素匹配分析:');
        figmaMatches.forEach((match, index) => {
          console.log(`\n   差异区域 ${index + 1}:`);
          if (match.elements.length > 0) {
            match.elements.forEach((element, i) => {
              console.log(`     ${i + 1}. ${element.name} (${element.type})`);
              console.log(`        位置: (${element.boundingBox.x},${element.boundingBox.y}) ${element.boundingBox.width}×${element.boundingBox.height}`);
              console.log(`        重叠度: ${element.overlapPercentage.toFixed(1)}%`);
            });
          } else {
            console.log(`     ❌ 未找到匹配的Figma元素`);
          }
        });
      } catch (error) {
        console.warn('⚠️  无法解析Figma数据:', error.message);
      }
    } else {
      console.warn('⚠️  未找到Figma数据文件，跳过元素匹配');
    }

    // 保存详细分析结果
    const analysisPath = path.join(path.dirname(diffOutputPath), 'diff-analysis.json');
    const analysisData = {
      timestamp: new Date().toISOString(),
      componentName,
      matchPercentage: parseFloat(matchPercentage),
      diffPixels: diffPixelCount,
      totalPixels,
      dimensions: { width, height },
      diffRegions: diffRegions1x,
      figmaMatches,
      scale: 3
    };
    
    fs.writeFileSync(analysisPath, JSON.stringify(analysisData, null, 2));
    console.log(`\n💾 详细分析已保存: ${analysisPath}`);

    return {
      success: true,
      matchPercentage: parseFloat(matchPercentage),
      diffPixels: diffPixelCount,
      totalPixels,
      dimensions: { width, height },
      diffRegions: diffRegions1x,
      figmaMatches,
      analysisPath
    };

  } catch (error) {
    console.error('❌ 对比失败:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// 命令行工具
if (import.meta.url === `file://${process.argv[1]}`) {
  const componentName = process.argv[2];
  if (!componentName) {
    console.error('用法: node enhanced-compare.js <组件名>');
    process.exit(1);
  }
  
  const resultsDir = path.join(__dirname, '../results', componentName);
  const expectedPath = path.join(resultsDir, `${componentName}_expected.png`);
  const actualPath = path.join(resultsDir, 'actual.png');
  const diffPath = path.join(resultsDir, 'diff.png');
  
  enhancedCompareImages(expectedPath, actualPath, diffPath, componentName);
}

export { enhancedCompareImages, detectDiffRegions, matchFigmaElements };
