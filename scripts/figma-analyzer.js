import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 分析Figma JSON数据，提取布局信息、素材和图标
 */
class FigmaAnalyzer {
  constructor(figmaData) {
    this.figmaData = figmaData;
    this.materials = []; // 需要下载的素材
    this.icons = [];     // 需要下载的图标
    this.layout = null;  // 布局结构
  }

  /**
   * 分析节点是否包含图片素材
   */
  isImageNode(node) {
    // 检查是否有图片填充
    if (node.fills && node.fills.length > 0) {
      return node.fills.some(fill => 
        fill.type === 'IMAGE' && fill.imageRef
      );
    }
    return false;
  }

  /**
   * 分析节点是否是图标
   */
  isIconNode(node) {
    // 图标通常是VECTOR类型，或者是小尺寸的图片
    if (node.type === 'VECTOR') return true;
    
    // 小尺寸的图片可能是图标
    if (this.isImageNode(node)) {
      const { width, height } = node.absoluteBoundingBox || {};
      return width <= 100 && height <= 100; // 小于100px认为是图标
    }
    
    return false;
  }

  /**
   * 分析节点是否是文本
   */
  isTextNode(node) {
    return node.type === 'TEXT';
  }

  /**
   * 分析节点是否是容器
   */
  isContainerNode(node) {
    return ['FRAME', 'GROUP', 'COMPONENT', 'INSTANCE'].includes(node.type);
  }

  /**
   * 提取图片素材信息
   */
  extractImageMaterial(node) {
    if (!this.isImageNode(node)) return null;

    const imageRef = node.fills.find(fill => fill.type === 'IMAGE')?.imageRef;
    if (!imageRef) return null;

    return {
      nodeId: node.id,
      imageRef: imageRef,
      name: node.name || `image_${node.id}`,
      bounds: node.absoluteBoundingBox,
      isIcon: this.isIconNode(node)
    };
  }

  /**
   * 分析布局结构并转换为Flex布局
   */
  analyzeLayout(node, parentBounds = null) {
    const bounds = node.absoluteBoundingBox;
    if (!bounds) return null;

    const layoutNode = {
      id: node.id,
      name: node.name,
      type: node.type,
      bounds: bounds,
      styles: this.extractStyles(node),
      children: []
    };

    // 分析子节点
    if (node.children && node.children.length > 0) {
      // 按位置排序子节点
      const sortedChildren = this.sortChildrenByPosition(node.children);
      
      // 分析布局方向
      const layoutDirection = this.analyzeLayoutDirection(sortedChildren);
      layoutNode.flexDirection = layoutDirection;
      
      // 递归分析子节点
      for (const child of sortedChildren) {
        const childLayout = this.analyzeLayout(child, bounds);
        if (childLayout) {
          layoutNode.children.push(childLayout);
        }
      }
    }

    return layoutNode;
  }

  /**
   * 按位置排序子节点
   */
  sortChildrenByPosition(children) {
    return children
      .filter(child => child.absoluteBoundingBox)
      .sort((a, b) => {
        const aBox = a.absoluteBoundingBox;
        const bBox = b.absoluteBoundingBox;
        
        // 先按Y轴排序（从上到下）
        if (Math.abs(aBox.y - bBox.y) > 10) {
          return aBox.y - bBox.y;
        }
        
        // Y轴位置相近时按X轴排序（从左到右）
        return aBox.x - bBox.x;
      });
  }

  /**
   * 分析布局方向
   */
  analyzeLayoutDirection(children) {
    if (children.length < 2) return 'column';

    const first = children[0].absoluteBoundingBox;
    const second = children[1].absoluteBoundingBox;

    // 计算水平和垂直间距
    const horizontalGap = Math.abs(second.x - (first.x + first.width));
    const verticalGap = Math.abs(second.y - (first.y + first.height));

    // 如果水平排列（Y轴位置相近）
    if (Math.abs(first.y - second.y) < 20 && horizontalGap < verticalGap) {
      return 'row';
    }

    return 'column';
  }

  /**
   * 提取样式信息
   */
  extractStyles(node) {
    const styles = {};
    const bounds = node.absoluteBoundingBox;

    if (bounds) {
      styles.width = `${bounds.width}px`;
      styles.height = `${bounds.height}px`;
    }

    // 背景色
    if (node.fills && node.fills.length > 0) {
      const solidFill = node.fills.find(fill => fill.type === 'SOLID');
      if (solidFill && solidFill.color) {
        const { r, g, b } = solidFill.color;
        const alpha = solidFill.opacity || 1;
        styles.backgroundColor = `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${alpha})`;
      }
    }

    // 边框
    if (node.strokes && node.strokes.length > 0) {
      const stroke = node.strokes[0];
      if (stroke.color) {
        const { r, g, b } = stroke.color;
        styles.border = `${node.strokeWeight || 1}px solid rgb(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)})`;
      }
    }

    // 圆角
    if (node.cornerRadius) {
      styles.borderRadius = `${node.cornerRadius}px`;
    }

    // 文本样式
    if (node.type === 'TEXT' && node.style) {
      const textStyle = node.style;
      if (textStyle.fontSize) styles.fontSize = `${textStyle.fontSize}px`;
      if (textStyle.fontFamily) styles.fontFamily = textStyle.fontFamily;
      if (textStyle.fontWeight) styles.fontWeight = textStyle.fontWeight;
      if (textStyle.textAlignHorizontal) {
        styles.textAlign = textStyle.textAlignHorizontal.toLowerCase();
      }
    }

    return styles;
  }

  /**
   * 执行完整分析
   */
  analyze() {
    console.log('🔍 开始分析Figma数据...');

    // 遍历所有节点
    this.traverseNodes(this.figmaData);

    // 分析根布局
    this.layout = this.analyzeLayout(this.figmaData);

    console.log(`📊 分析完成:`);
    console.log(`   素材: ${this.materials.length} 个`);
    console.log(`   图标: ${this.icons.length} 个`);
    console.log(`   布局节点: ${this.countLayoutNodes(this.layout)} 个`);

    return {
      materials: this.materials,
      icons: this.icons,
      layout: this.layout
    };
  }

  /**
   * 遍历所有节点
   */
  traverseNodes(node) {
    // 检查当前节点
    if (this.isImageNode(node)) {
      const material = this.extractImageMaterial(node);
      if (material) {
        if (material.isIcon) {
          this.icons.push(material);
        } else {
          this.materials.push(material);
        }
      }
    }

    // 递归遍历子节点
    if (node.children) {
      for (const child of node.children) {
        this.traverseNodes(child);
      }
    }
  }

  /**
   * 计算布局节点数量
   */
  countLayoutNodes(layout) {
    if (!layout) return 0;
    let count = 1;
    if (layout.children) {
      for (const child of layout.children) {
        count += this.countLayoutNodes(child);
      }
    }
    return count;
  }
}

/**
 * 分析指定组件的Figma数据
 */
async function analyzeFigmaComponent(componentName, figmaData) {
  console.log(`\n🎯 分析组件: ${componentName}`);
  
  const analyzer = new FigmaAnalyzer(figmaData);
  const analysis = analyzer.analyze();
  
  // 保存分析结果
  const outputDir = path.join(__dirname, '../results', componentName);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const analysisPath = path.join(outputDir, 'figma-analysis.json');
  fs.writeFileSync(analysisPath, JSON.stringify(analysis, null, 2));
  
  console.log(`💾 分析结果已保存: ${analysisPath}`);
  
  return analysis;
}

export { FigmaAnalyzer, analyzeFigmaComponent };
