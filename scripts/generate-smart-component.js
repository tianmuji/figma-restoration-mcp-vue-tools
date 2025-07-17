import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 基于智能分析结果生成Vue组件
 */
class SmartComponentGenerator {
  constructor(analysis, componentName) {
    this.analysis = analysis;
    this.componentName = componentName;
    this.layout = analysis.layout;
    this.materials = analysis.materials;
    this.icons = analysis.icons;
  }

  /**
   * 生成Vue组件代码
   */
  generate() {
    const template = this.generateTemplate();
    const script = this.generateScript();
    const style = this.generateStyle();

    return `<template>
${template}
</template>

<script>
${script}
</script>

<style scoped>
${style}
</style>`;
  }

  /**
   * 生成模板
   */
  generateTemplate() {
    return this.generateNodeTemplate(this.layout, 1);
  }

  /**
   * 生成节点模板
   */
  generateNodeTemplate(node, depth = 0) {
    const indent = '  '.repeat(depth);
    const className = this.getClassName(node);
    const tag = this.getHtmlTag(node);

    let template = `${indent}<${tag}`;
    
    if (className) {
      template += ` class="${className}"`;
    }

    // 添加事件处理
    if (this.needsEventHandler(node)) {
      template += ` @click="${this.getEventHandler(node)}"`;
    }

    // 处理文本节点
    if (node.type === 'TEXT' && node.text) {
      template += `>${node.text}</${tag}>`;
      return template;
    }

    // 处理图标节点
    if (this.isIconNode(node)) {
      const iconPath = this.getIconPath(node);
      if (iconPath) {
        template += `>
${indent}  <img src="${iconPath}" alt="${node.name}" />
${indent}</${tag}>`;
        return template;
      }
    }

    // 处理子节点
    if (node.children && node.children.length > 0) {
      template += '>\n';
      
      for (const child of node.children) {
        template += this.generateNodeTemplate(child, depth + 1) + '\n';
      }
      
      template += `${indent}</${tag}>`;
    } else {
      template += ' />';
    }

    return template;
  }

  /**
   * 获取HTML标签
   */
  getHtmlTag(node) {
    switch (node.type) {
      case 'TEXT':
        return 'span';
      case 'FRAME':
        return 'div';
      case 'RECTANGLE':
        return 'div';
      case 'INSTANCE':
        if (this.isButtonNode(node)) return 'button';
        if (this.isIconNode(node)) return 'div';
        return 'div';
      default:
        return 'div';
    }
  }

  /**
   * 获取CSS类名
   */
  getClassName(node) {
    let name = node.name || node.id;
    
    // 清理名称
    name = name.toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fff]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    // 添加类型前缀
    const typePrefix = this.getTypePrefix(node);
    if (typePrefix) {
      name = `${typePrefix}-${name}`;
    }

    return name;
  }

  /**
   * 获取类型前缀
   */
  getTypePrefix(node) {
    if (node.type === 'TEXT') return 'text';
    if (this.isButtonNode(node)) return 'btn';
    if (this.isIconNode(node)) return 'icon';
    return null;
  }

  /**
   * 判断是否是按钮节点
   */
  isButtonNode(node) {
    const name = node.name?.toLowerCase() || '';
    return name.includes('button') || name.includes('btn');
  }

  /**
   * 判断是否是图标节点
   */
  isIconNode(node) {
    return this.icons.some(icon => icon.nodeId === node.id);
  }

  /**
   * 获取图标路径
   */
  getIconPath(node) {
    const icon = this.icons.find(icon => icon.nodeId === node.id);
    if (!icon) return null;
    
    // 假设图标已下载到images目录
    return `./images/${icon.name}.svg`;
  }

  /**
   * 判断是否需要事件处理
   */
  needsEventHandler(node) {
    return this.isButtonNode(node) || this.isIconNode(node);
  }

  /**
   * 获取事件处理器名称
   */
  getEventHandler(node) {
    if (this.isIconNode(node) && node.name?.includes('close')) {
      return '$emit(\'close\')';
    }
    if (this.isButtonNode(node)) {
      const name = node.name?.toLowerCase() || '';
      if (name.includes('cancel') || name.includes('取消')) {
        return '$emit(\'cancel\')';
      }
      if (name.includes('confirm') || name.includes('确认')) {
        return '$emit(\'confirm\')';
      }
    }
    return 'handleClick';
  }

  /**
   * 生成脚本
   */
  generateScript() {
    const emits = this.getEmits();
    const data = this.getData();
    const methods = this.getMethods();

    return `export default {
  name: '${this.componentName}',
  ${emits ? `emits: ${JSON.stringify(emits)},` : ''}
  data() {
    return ${JSON.stringify(data, null, 4)};
  },
  methods: {
${methods}
  }
}`;
  }

  /**
   * 获取事件列表
   */
  getEmits() {
    const emits = [];
    
    // 检查是否有关闭按钮
    if (this.hasCloseButton()) {
      emits.push('close');
    }
    
    // 检查是否有取消/确认按钮
    if (this.hasCancelButton()) {
      emits.push('cancel');
    }
    
    if (this.hasConfirmButton()) {
      emits.push('confirm');
    }

    return emits.length > 0 ? emits : null;
  }

  /**
   * 获取数据
   */
  getData() {
    const data = {};
    
    // 检查是否有输入框
    if (this.hasTextInput()) {
      data.inputContent = this.getDefaultInputContent();
    }

    return data;
  }

  /**
   * 获取方法
   */
  getMethods() {
    let methods = '';
    
    if (this.hasTextInput()) {
      methods += `    handleInput(value) {
      this.inputContent = value;
    },\n`;
    }

    methods += `    handleClick() {
      // 处理点击事件
    }`;

    return methods;
  }

  /**
   * 检查是否有关闭按钮
   */
  hasCloseButton() {
    return this.findNodeByName(this.layout, name => 
      name?.toLowerCase().includes('close') || name?.toLowerCase().includes('ic_close')
    ) !== null;
  }

  /**
   * 检查是否有取消按钮
   */
  hasCancelButton() {
    return this.findNodeByName(this.layout, name => 
      name?.toLowerCase().includes('cancel') || name?.includes('取消')
    ) !== null;
  }

  /**
   * 检查是否有确认按钮
   */
  hasConfirmButton() {
    return this.findNodeByName(this.layout, name => 
      name?.toLowerCase().includes('confirm') || name?.includes('确认')
    ) !== null;
  }

  /**
   * 检查是否有文本输入
   */
  hasTextInput() {
    return this.findNodeByName(this.layout, name => 
      name?.includes('输入') || name?.includes('填写')
    ) !== null;
  }

  /**
   * 获取默认输入内容
   */
  getDefaultInputContent() {
    const inputNode = this.findNodeByName(this.layout, name => 
      name?.includes('填写')
    );
    return inputNode?.text || '';
  }

  /**
   * 根据名称查找节点
   */
  findNodeByName(node, predicate) {
    if (predicate(node.name)) {
      return node;
    }
    
    if (node.children) {
      for (const child of node.children) {
        const found = this.findNodeByName(child, predicate);
        if (found) return found;
      }
    }
    
    return null;
  }

  /**
   * 生成样式
   */
  generateStyle() {
    let styles = '';
    
    // 生成节点样式
    styles += this.generateNodeStyles(this.layout);
    
    return styles;
  }

  /**
   * 生成节点样式
   */
  generateNodeStyles(node) {
    let styles = '';
    const className = this.getClassName(node);
    
    if (className && node.styles) {
      styles += `.${className} {\n`;
      
      for (const [prop, value] of Object.entries(node.styles)) {
        const cssProp = this.camelToKebab(prop);
        styles += `  ${cssProp}: ${value};\n`;
      }
      
      styles += '}\n\n';
    }
    
    // 递归处理子节点
    if (node.children) {
      for (const child of node.children) {
        styles += this.generateNodeStyles(child);
      }
    }
    
    return styles;
  }

  /**
   * 驼峰转短横线
   */
  camelToKebab(str) {
    return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
  }
}

/**
 * 生成智能组件
 */
async function generateSmartComponent(componentName) {
  console.log(`\n🎯 生成智能组件: ${componentName}`);
  
  // 读取分析结果
  const analysisPath = path.join(__dirname, '../results', componentName, 'smart-analysis.json');
  if (!fs.existsSync(analysisPath)) {
    console.error(`❌ 未找到分析结果: ${analysisPath}`);
    return false;
  }
  
  const analysis = JSON.parse(fs.readFileSync(analysisPath, 'utf8'));
  
  // 生成组件
  const generator = new SmartComponentGenerator(analysis, componentName);
  const vueCode = generator.generate();
  
  // 保存组件
  const componentDir = path.join(__dirname, '../src/components', componentName);
  if (!fs.existsSync(componentDir)) {
    fs.mkdirSync(componentDir, { recursive: true });
  }
  
  const componentPath = path.join(componentDir, 'smart-index.vue');
  fs.writeFileSync(componentPath, vueCode);
  
  console.log(`✅ 智能组件已生成: ${componentPath}`);
  console.log(`   基于 ${analysis.materials.length} 个素材和 ${analysis.icons.length} 个图标`);
  
  return true;
}

// 命令行工具
if (import.meta.url === `file://${process.argv[1]}`) {
  const componentName = process.argv[2] || 'ModalRemoveMember';
  generateSmartComponent(componentName).catch(console.error);
}

export { SmartComponentGenerator, generateSmartComponent };
