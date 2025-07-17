import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 生成智能修复建议
 */
function generateFixSuggestions(analysisData) {
  const suggestions = [];
  
  if (!analysisData.figmaMatches || analysisData.figmaMatches.length === 0) {
    return [{
      priority: 'low',
      type: 'general',
      message: '无法进行精确分析，建议检查整体布局和颜色匹配'
    }];
  }
  
  analysisData.figmaMatches.forEach((match, index) => {
    const region = match.region;
    const elements = match.elements;
    
    if (elements.length === 0) {
      suggestions.push({
        priority: 'medium',
        type: 'unknown',
        region: region,
        message: `差异区域 ${index + 1}: 未找到对应的Figma元素，可能是新增或遗漏的元素`,
        coordinates: `(${region.left},${region.top}) ${region.width}×${region.height}`,
        fixes: [
          '检查是否有遗漏的素材或元素',
          '确认该区域是否应该存在',
          '检查z-index层级关系'
        ]
      });
      return;
    }
    
    const primaryElement = elements[0];
    const elementType = primaryElement.type;
    const elementName = primaryElement.name;
    
    // 根据元素类型生成具体建议
    const suggestion = {
      priority: calculatePriority(region.pixelCount, region.width * region.height),
      type: elementType.toLowerCase(),
      element: primaryElement,
      region: region,
      message: `差异区域 ${index + 1}: ${elementName} (${elementType})`,
      coordinates: `Figma: (${primaryElement.boundingBox.x},${primaryElement.boundingBox.y}) ${primaryElement.boundingBox.width}×${primaryElement.boundingBox.height}`,
      actualCoordinates: `实际: (${region.left},${region.top}) ${region.width}×${region.height}`,
      fixes: generateElementFixes(elementType, elementName, primaryElement, region)
    };
    
    suggestions.push(suggestion);
  });
  
  // 按优先级排序
  return suggestions.sort((a, b) => {
    const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });
}

/**
 * 计算修复优先级
 */
function calculatePriority(pixelCount, areaSize) {
  const density = pixelCount / areaSize;
  
  if (pixelCount > 1000 || density > 0.5) {
    return 'high';
  } else if (pixelCount > 200 || density > 0.2) {
    return 'medium';
  } else {
    return 'low';
  }
}

/**
 * 根据元素类型生成修复建议
 */
function generateElementFixes(elementType, elementName, figmaElement, diffRegion) {
  const fixes = [];
  const bbox = figmaElement.boundingBox;
  
  // 位置偏差分析
  const xDiff = diffRegion.center.x - (bbox.x + bbox.width / 2);
  const yDiff = diffRegion.center.y - (bbox.y + bbox.height / 2);
  
  if (Math.abs(xDiff) > 5 || Math.abs(yDiff) > 5) {
    fixes.push(`位置调整: left: ${bbox.x}px → ${bbox.x + xDiff}px, top: ${bbox.y}px → ${bbox.y + yDiff}px`);
  }
  
  // 尺寸偏差分析
  const widthDiff = diffRegion.width - bbox.width;
  const heightDiff = diffRegion.height - bbox.height;
  
  if (Math.abs(widthDiff) > 5 || Math.abs(heightDiff) > 5) {
    fixes.push(`尺寸调整: width: ${bbox.width}px → ${bbox.width + widthDiff}px, height: ${bbox.height}px → ${bbox.height + heightDiff}px`);
  }
  
  // 根据元素类型添加特定建议
  switch (elementType) {
    case 'IMAGE-SVG':
    case 'INSTANCE':
      fixes.push('检查SVG图标是否正确加载和显示');
      fixes.push('确认图标颜色和透明度设置');
      fixes.push('验证object-fit属性设置');
      break;
      
    case 'TEXT':
      fixes.push('检查字体family、size、weight设置');
      fixes.push('确认文字颜色和行高');
      fixes.push('验证text-align和letter-spacing');
      break;
      
    case 'RECTANGLE':
    case 'FRAME':
      fixes.push('检查背景色或渐变设置');
      fixes.push('确认border-radius和边框样式');
      fixes.push('验证box-shadow效果');
      break;
      
    case 'ELLIPSE':
      fixes.push('检查圆形元素的border-radius设置');
      fixes.push('确认背景色和边框样式');
      break;
      
    default:
      fixes.push('检查元素的CSS样式是否与Figma设计一致');
      fixes.push('确认元素的显示状态和层级关系');
  }
  
  return fixes;
}

/**
 * 生成CSS修复代码
 */
function generateCSSFixes(suggestions, componentName) {
  let cssCode = `/* ${componentName} 组件修复建议 */\n\n`;
  
  suggestions.forEach((suggestion, index) => {
    if (suggestion.element) {
      const element = suggestion.element;
      const region = suggestion.region;
      const bbox = element.boundingBox;
      
      cssCode += `/* 修复建议 ${index + 1}: ${element.name} */\n`;
      cssCode += `/* 优先级: ${suggestion.priority.toUpperCase()} */\n`;
      cssCode += `.${elementNameToClass(element.name)} {\n`;
      
      // 位置修复
      cssCode += `  position: absolute;\n`;
      cssCode += `  top: ${bbox.y}px;\n`;
      cssCode += `  left: ${bbox.x}px;\n`;
      cssCode += `  width: ${bbox.width}px;\n`;
      cssCode += `  height: ${bbox.height}px;\n`;
      
      // 根据元素类型添加特定样式
      if (element.type === 'IMAGE-SVG' || element.type === 'INSTANCE') {
        cssCode += `  object-fit: contain;\n`;
      }
      
      cssCode += `}\n\n`;
    }
  });
  
  return cssCode;
}

/**
 * 将元素名称转换为CSS类名
 */
function elementNameToClass(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * 生成修复报告
 */
function generateFixReport(componentName, analysisData) {
  const suggestions = generateFixSuggestions(analysisData);
  const cssCode = generateCSSFixes(suggestions, componentName);
  
  const report = {
    componentName,
    timestamp: new Date().toISOString(),
    matchPercentage: analysisData.matchPercentage,
    totalIssues: suggestions.length,
    priorityBreakdown: {
      high: suggestions.filter(s => s.priority === 'high').length,
      medium: suggestions.filter(s => s.priority === 'medium').length,
      low: suggestions.filter(s => s.priority === 'low').length
    },
    suggestions,
    cssCode,
    summary: generateSummary(suggestions, analysisData.matchPercentage)
  };
  
  return report;
}

/**
 * 生成修复总结
 */
function generateSummary(suggestions, matchPercentage) {
  const highPriority = suggestions.filter(s => s.priority === 'high').length;
  const mediumPriority = suggestions.filter(s => s.priority === 'medium').length;
  
  let summary = `当前还原度: ${matchPercentage}%\n`;
  
  if (highPriority > 0) {
    summary += `🔴 发现 ${highPriority} 个高优先级问题，需要立即修复\n`;
  }
  
  if (mediumPriority > 0) {
    summary += `🟡 发现 ${mediumPriority} 个中优先级问题，建议优化\n`;
  }
  
  if (matchPercentage >= 95) {
    summary += `🎉 还原度已达到优秀标准！`;
  } else if (matchPercentage >= 90) {
    summary += `👍 还原度良好，可进一步优化到95%+`;
  } else if (matchPercentage >= 85) {
    summary += `⚠️ 还原度需要改进，建议重点修复高优先级问题`;
  } else {
    summary += `❌ 还原度较低，需要全面检查和修复`;
  }
  
  return summary;
}

/**
 * 主要的智能修复函数
 */
async function smartFix(componentName) {
  console.log(`🔧 开始为 ${componentName} 生成智能修复建议...`);
  
  const resultsDir = path.join(__dirname, '../results', componentName);
  const analysisPath = path.join(resultsDir, 'diff-analysis.json');
  
  if (!fs.existsSync(analysisPath)) {
    console.error('❌ 未找到差异分析文件，请先运行增强对比');
    console.log('   运行: node enhanced-compare.js', componentName);
    return;
  }
  
  try {
    const analysisData = JSON.parse(fs.readFileSync(analysisPath, 'utf8'));
    const report = generateFixReport(componentName, analysisData);
    
    // 保存修复报告
    const reportPath = path.join(resultsDir, 'fix-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    // 保存CSS修复代码
    const cssPath = path.join(resultsDir, 'fix-suggestions.css');
    fs.writeFileSync(cssPath, report.cssCode);
    
    // 输出报告
    console.log('\n📋 智能修复报告:');
    console.log('='.repeat(50));
    console.log(report.summary);
    console.log('\n🎯 修复建议:');
    
    report.suggestions.forEach((suggestion, index) => {
      console.log(`\n${index + 1}. [${suggestion.priority.toUpperCase()}] ${suggestion.message}`);
      console.log(`   坐标: ${suggestion.coordinates}`);
      if (suggestion.actualCoordinates) {
        console.log(`   ${suggestion.actualCoordinates}`);
      }
      console.log('   修复方案:');
      suggestion.fixes.forEach(fix => {
        console.log(`     • ${fix}`);
      });
    });
    
    console.log(`\n💾 详细报告已保存: ${reportPath}`);
    console.log(`💾 CSS修复代码已保存: ${cssPath}`);
    
    return report;
    
  } catch (error) {
    console.error('❌ 生成修复建议失败:', error.message);
    return null;
  }
}

// 命令行工具
if (import.meta.url === `file://${process.argv[1]}`) {
  const componentName = process.argv[2];
  if (!componentName) {
    console.error('用法: node smart-fix.js <组件名>');
    process.exit(1);
  }
  
  smartFix(componentName);
}

export { smartFix, generateFixSuggestions, generateCSSFixes };
