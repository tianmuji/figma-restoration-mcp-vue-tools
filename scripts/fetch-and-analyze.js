import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { FigmaAnalyzer, analyzeFigmaComponent } from './figma-analyzer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 组件配置
const COMPONENTS = [
  {
    name: 'ModalRemoveMember',
    fileKey: 'Mbz0mgLIVbz46bxPwBFnSl',
    nodeId: '16343-60515',
    figmaUrl: 'https://www.figma.com/design/Mbz0mgLIVbz46bxPwBFnSl/CS%E4%BC%81%E4%B8%9A%E7%89%88?node-id=16343-60515&m=dev'
  },
  {
    name: 'ExchangeSuccess',
    fileKey: 'D59IG2u1r4gfGQ56qdIlyB',
    nodeId: '5276-10661',
    figmaUrl: 'https://www.figma.com/design/D59IG2u1r4gfGQ56qdIlyB/6.92.0?node-id=5276-10661&m=dev'
  },
  {
    name: 'AssignmentComplete',
    fileKey: 'WLaxbF2J6FAm6eBmXmG4tx',
    nodeId: '12712-178431',
    figmaUrl: 'https://www.figma.com/design/WLaxbF2J6FAm6eBmXmG4tx/v20.14.0-v20.5.0%E8%9C%9C%E8%9C%82%E5%AE%B6%E6%A0%A1%E6%A0%A1%E5%9B%AD%E7%89%88--%E4%BA%A7%E5%93%81%E8%AE%BE%E8%AE%A1%E7%89%88%E6%9C%AC?node-id=12712-178431&m=dev'
  },
  {
    name: 'ScanComplete',
    fileKey: 'WLaxbF2J6FAm6eBmXmG4tx',
    nodeId: '12739-182336',
    figmaUrl: 'https://www.figma.com/design/WLaxbF2J6FAm6eBmXmG4tx/v20.14.0-v20.5.0%E8%9C%9C%E8%9C%82%E5%AE%B6%E6%A0%A1%E6%A0%A1%E5%9B%AD%E7%89%88--%E4%BA%A7%E5%93%81%E8%AE%BE%E8%AE%A1%E7%89%88%E6%9C%AC?node-id=12739-182336&m=dev'
  }
];

/**
 * 使用MCP工具获取Figma数据
 */
async function fetchFigmaData(fileKey, nodeId) {
  try {
    console.log(`📡 获取Figma数据: ${fileKey}/${nodeId}`);
    
    // 这里我们需要调用MCP工具
    // 由于我们在Node.js环境中，需要模拟MCP调用
    // 实际项目中应该通过MCP服务获取
    
    // 临时方案：从之前保存的数据中读取
    // 在实际使用中，这里应该调用MCP的get_figma_data工具
    
    console.log('⚠️  注意：当前使用模拟数据，实际应用中需要通过MCP获取');
    
    return {
      id: nodeId,
      name: 'Component',
      type: 'FRAME',
      absoluteBoundingBox: { x: 0, y: 0, width: 400, height: 300 },
      children: []
    };
    
  } catch (error) {
    console.error(`❌ 获取Figma数据失败: ${error.message}`);
    return null;
  }
}

/**
 * 生成基于分析结果的Vue组件代码
 */
function generateVueComponent(componentName, analysis) {
  const { layout, materials, icons } = analysis;
  
  // 生成template
  const template = generateTemplate(layout);
  
  // 生成script
  const script = generateScript(componentName, materials, icons);
  
  // 生成style
  const style = generateStyle(layout);
  
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
 * 生成模板代码
 */
function generateTemplate(layout, depth = 0) {
  if (!layout) return '';
  
  const indent = '  '.repeat(depth + 1);
  const tag = getHtmlTag(layout);
  const className = getClassName(layout);
  
  let template = `${indent}<${tag}${className ? ` class="${className}"` : ''}`;
  
  // 添加文本内容
  if (layout.type === 'TEXT') {
    template += `>${layout.name || 'Text'}</${tag}>`;
    return template;
  }
  
  // 处理子元素
  if (layout.children && layout.children.length > 0) {
    template += '>\n';
    for (const child of layout.children) {
      template += generateTemplate(child, depth + 1) + '\n';
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
function getHtmlTag(layout) {
  switch (layout.type) {
    case 'TEXT': return 'span';
    case 'VECTOR': return 'div'; // 图标容器
    default: return 'div';
  }
}

/**
 * 获取CSS类名
 */
function getClassName(layout) {
  const name = layout.name || layout.id;
  return name.toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * 生成脚本代码
 */
function generateScript(componentName, materials, icons) {
  return `export default {
  name: '${componentName}',
  data() {
    return {
      // 组件数据
    }
  },
  mounted() {
    // 组件挂载后的逻辑
  },
  methods: {
    // 组件方法
  }
}`;
}

/**
 * 生成样式代码
 */
function generateStyle(layout) {
  let styles = '';
  
  function addStyles(node) {
    const className = getClassName(node);
    if (className && node.styles) {
      styles += `.${className} {\n`;
      
      // 添加Flex布局
      if (node.children && node.children.length > 0) {
        styles += '  display: flex;\n';
        if (node.flexDirection) {
          styles += `  flex-direction: ${node.flexDirection};\n`;
        }
      }
      
      // 添加其他样式
      for (const [prop, value] of Object.entries(node.styles)) {
        styles += `  ${camelToKebab(prop)}: ${value};\n`;
      }
      
      styles += '}\n\n';
    }
    
    // 递归处理子节点
    if (node.children) {
      for (const child of node.children) {
        addStyles(child);
      }
    }
  }
  
  addStyles(layout);
  return styles;
}

/**
 * 驼峰转短横线
 */
function camelToKebab(str) {
  return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

/**
 * 处理单个组件
 */
async function processComponent(component) {
  console.log(`\n🎯 处理组件: ${component.name}`);
  
  // 1. 获取Figma数据
  const figmaData = await fetchFigmaData(component.fileKey, component.nodeId);
  if (!figmaData) {
    console.log(`❌ ${component.name}: 无法获取Figma数据`);
    return false;
  }
  
  // 2. 分析数据
  const analysis = await analyzeFigmaComponent(component.name, figmaData);
  
  // 3. 生成Vue组件
  const vueCode = generateVueComponent(component.name, analysis);
  
  // 4. 保存组件
  const componentDir = path.join(__dirname, '../src/components', component.name);
  if (!fs.existsSync(componentDir)) {
    fs.mkdirSync(componentDir, { recursive: true });
  }
  
  const componentPath = path.join(componentDir, 'index-analyzed.vue');
  fs.writeFileSync(componentPath, vueCode);
  
  console.log(`✅ ${component.name}: 基于分析的组件已生成`);
  console.log(`   素材: ${analysis.materials.length} 个`);
  console.log(`   图标: ${analysis.icons.length} 个`);
  console.log(`   保存路径: ${componentPath}`);
  
  return true;
}

/**
 * 处理所有组件
 */
async function processAllComponents() {
  console.log('🚀 开始基于Figma数据分析生成组件...\n');
  
  let successCount = 0;
  
  for (const component of COMPONENTS) {
    const success = await processComponent(component);
    if (success) successCount++;
    
    // 添加延迟避免API限制
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log(`\n📊 处理完成:`);
  console.log(`   成功: ${successCount}/${COMPONENTS.length}`);
  console.log(`   失败: ${COMPONENTS.length - successCount}/${COMPONENTS.length}`);
}

// 命令行工具
if (import.meta.url === `file://${process.argv[1]}`) {
  const command = process.argv[2];
  
  if (command === 'single') {
    const componentName = process.argv[3];
    const component = COMPONENTS.find(c => c.name === componentName);
    if (component) {
      processComponent(component);
    } else {
      console.error(`❌ 未找到组件: ${componentName}`);
      console.log('可用组件:', COMPONENTS.map(c => c.name).join(', '));
    }
  } else {
    processAllComponents();
  }
}

export { processComponent, processAllComponents };
