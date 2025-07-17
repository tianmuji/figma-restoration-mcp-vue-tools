import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 智能Figma数据分析器 - 基于真实JSON数据
 */
class SmartFigmaAnalyzer {
  constructor(figmaData) {
    this.figmaData = figmaData;
    this.globalStyles = figmaData.globalVars?.styles || {};
    this.materials = [];
    this.icons = [];
    this.layout = null;
  }

  /**
   * 解析样式引用
   */
  resolveStyle(styleRef) {
    if (!styleRef || typeof styleRef !== 'string') return null;
    return this.globalStyles[styleRef] || null;
  }

  /**
   * 解析填充颜色
   */
  resolveFill(fillRef) {
    const fill = this.resolveStyle(fillRef);
    if (!fill) return null;
    
    if (Array.isArray(fill)) {
      return fill[0]; // 取第一个颜色
    }
    return fill;
  }

  /**
   * 解析布局样式
   */
  resolveLayout(layoutRef) {
    return this.resolveStyle(layoutRef);
  }

  /**
   * 解析文本样式
   */
  resolveTextStyle(styleRef) {
    return this.resolveStyle(styleRef);
  }

  /**
   * 检查节点是否需要下载素材
   */
  needsImageDownload(node) {
    // 检查是否有图片填充
    if (node.fills) {
      const fill = this.resolveFill(node.fills);
      if (fill && typeof fill === 'object' && fill.type === 'IMAGE') {
        return true;
      }
    }
    
    // 检查是否是图标组件
    if (node.type === 'INSTANCE' && node.componentId) {
      // 根据组件名称判断是否是图标
      const name = node.name?.toLowerCase() || '';
      if (name.includes('icon') || name.includes('ic_')) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * 分析节点并转换为Flex布局
   */
  analyzeNode(node, parentLayout = null) {
    const layout = this.resolveLayout(node.layout);
    const textStyle = this.resolveTextStyle(node.textStyle);
    const fill = this.resolveFill(node.fills);
    
    const analyzedNode = {
      id: node.id,
      name: node.name,
      type: node.type,
      text: node.text,
      layout: layout,
      textStyle: textStyle,
      fill: fill,
      borderRadius: node.borderRadius,
      boundingBox: node.boundingBox,
      styles: this.generateCSSStyles(node, layout, textStyle, fill),
      children: []
    };

    // 检查是否需要下载素材
    if (this.needsImageDownload(node)) {
      const material = {
        nodeId: node.id,
        name: node.name,
        type: node.type,
        componentId: node.componentId,
        isIcon: this.isIconNode(node)
      };
      
      if (material.isIcon) {
        this.icons.push(material);
      } else {
        this.materials.push(material);
      }
    }

    // 递归分析子节点
    if (node.children && node.children.length > 0) {
      for (const child of node.children) {
        const childNode = this.analyzeNode(child, layout);
        if (childNode) {
          analyzedNode.children.push(childNode);
        }
      }
    }

    return analyzedNode;
  }

  /**
   * 判断是否是图标节点
   */
  isIconNode(node) {
    const name = node.name?.toLowerCase() || '';
    
    // 根据名称判断
    if (name.includes('icon') || name.includes('ic_') || name.includes('close')) {
      return true;
    }
    
    // 根据尺寸判断
    if (node.boundingBox) {
      const { width, height } = node.boundingBox;
      return width <= 50 && height <= 50;
    }
    
    // 根据类型判断
    if (node.type === 'VECTOR' || node.type === 'GROUP') {
      return true;
    }
    
    return false;
  }

  /**
   * 生成CSS样式
   */
  generateCSSStyles(node, layout, textStyle, fill) {
    const styles = {};

    // 布局样式
    if (layout) {
      if (layout.mode === 'row' || layout.mode === 'column') {
        styles.display = 'flex';
        styles.flexDirection = layout.mode;
        
        if (layout.justifyContent) {
          styles.justifyContent = this.mapJustifyContent(layout.justifyContent);
        }
        
        if (layout.alignItems) {
          styles.alignItems = this.mapAlignItems(layout.alignItems);
        }
        
        if (layout.gap) {
          styles.gap = typeof layout.gap === 'string' ? layout.gap : `${layout.gap}px`;
        }
        
        if (layout.padding) {
          styles.padding = layout.padding;
        }
      }
      
      // 尺寸
      if (layout.dimensions) {
        if (layout.dimensions.width) {
          styles.width = `${layout.dimensions.width}px`;
        }
        if (layout.dimensions.height) {
          styles.height = `${layout.dimensions.height}px`;
        }
      }
      
      // 定位
      if (layout.position === 'absolute') {
        styles.position = 'absolute';
        if (layout.locationRelativeToParent) {
          const loc = layout.locationRelativeToParent;
          if (loc.x !== undefined) styles.left = `${loc.x}px`;
          if (loc.y !== undefined) styles.top = `${loc.y}px`;
        }
      }
    }

    // 文本样式
    if (textStyle) {
      if (textStyle.fontFamily) styles.fontFamily = `'${textStyle.fontFamily}', sans-serif`;
      if (textStyle.fontWeight) styles.fontWeight = textStyle.fontWeight;
      if (textStyle.fontSize) styles.fontSize = `${textStyle.fontSize}px`;
      if (textStyle.lineHeight) styles.lineHeight = textStyle.lineHeight;
      if (textStyle.textAlignHorizontal) {
        styles.textAlign = textStyle.textAlignHorizontal.toLowerCase();
      }
    }

    // 填充颜色
    if (fill) {
      if (typeof fill === 'string') {
        styles.backgroundColor = fill;
      } else if (Array.isArray(fill)) {
        styles.backgroundColor = fill[0];
      }
    }

    // 边框圆角
    if (node.borderRadius) {
      styles.borderRadius = node.borderRadius;
    }

    // 边框
    if (node.strokes) {
      const stroke = this.resolveStyle(node.strokes);
      if (stroke && stroke.colors && stroke.strokeWeight) {
        styles.border = `${stroke.strokeWeight} solid ${stroke.colors[0]}`;
      }
    }

    // 阴影
    if (node.effects) {
      const effect = this.resolveStyle(node.effects);
      if (effect && effect.boxShadow) {
        styles.boxShadow = effect.boxShadow;
      }
    }

    return styles;
  }

  /**
   * 映射justifyContent值
   */
  mapJustifyContent(value) {
    const mapping = {
      'center': 'center',
      'flex-start': 'flex-start',
      'flex-end': 'flex-end',
      'space-between': 'space-between',
      'space-around': 'space-around'
    };
    return mapping[value] || value;
  }

  /**
   * 映射alignItems值
   */
  mapAlignItems(value) {
    const mapping = {
      'center': 'center',
      'flex-start': 'flex-start',
      'flex-end': 'flex-end',
      'stretch': 'stretch'
    };
    return mapping[value] || value;
  }

  /**
   * 执行完整分析
   */
  analyze() {
    console.log('🔍 开始智能分析Figma数据...');

    // 分析根节点
    const rootNode = this.figmaData.nodes?.[0];
    if (!rootNode) {
      throw new Error('未找到根节点');
    }

    this.layout = this.analyzeNode(rootNode);

    console.log(`📊 分析完成:`);
    console.log(`   素材: ${this.materials.length} 个`);
    console.log(`   图标: ${this.icons.length} 个`);
    console.log(`   布局节点: ${this.countNodes(this.layout)} 个`);

    // 打印素材和图标信息
    if (this.materials.length > 0) {
      console.log('\n📷 需要下载的素材:');
      this.materials.forEach(m => console.log(`   - ${m.name} (${m.nodeId})`));
    }

    if (this.icons.length > 0) {
      console.log('\n🎨 需要下载的图标:');
      this.icons.forEach(i => console.log(`   - ${i.name} (${i.nodeId})`));
    }

    return {
      materials: this.materials,
      icons: this.icons,
      layout: this.layout,
      globalStyles: this.globalStyles
    };
  }

  /**
   * 计算节点数量
   */
  countNodes(node) {
    if (!node) return 0;
    let count = 1;
    if (node.children) {
      for (const child of node.children) {
        count += this.countNodes(child);
      }
    }
    return count;
  }
}

/**
 * 分析指定组件
 */
async function analyzeComponent(componentName) {
  console.log(`\n🎯 分析组件: ${componentName}`);
  
  // 读取Figma数据
  const dataPath = path.join(__dirname, '../results', componentName, 'figma-data.json');
  if (!fs.existsSync(dataPath)) {
    console.error(`❌ 未找到Figma数据文件: ${dataPath}`);
    return null;
  }
  
  const figmaData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  
  // 创建分析器并分析
  const analyzer = new SmartFigmaAnalyzer(figmaData);
  const analysis = analyzer.analyze();
  
  // 保存分析结果
  const outputDir = path.join(__dirname, '../results', componentName);
  const analysisPath = path.join(outputDir, 'smart-analysis.json');
  fs.writeFileSync(analysisPath, JSON.stringify(analysis, null, 2));
  
  console.log(`💾 智能分析结果已保存: ${analysisPath}`);
  
  return analysis;
}

// 命令行工具
if (import.meta.url === `file://${process.argv[1]}`) {
  const componentName = process.argv[2] || 'ModalRemoveMember';
  analyzeComponent(componentName).catch(console.error);
}

export { SmartFigmaAnalyzer, analyzeComponent };
