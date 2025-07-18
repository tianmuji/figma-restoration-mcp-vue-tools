# 🛠️ Figma组件还原工具包

基于MCP (Model Context Protocol) 的Vue组件开发和Figma还原工具集。专注于AI生成的Vue组件验证和像素级对比分析，支持3倍图归一化处理和智能差异定位。

## 📋 核心功能

### 🎯 智能调试系统 (v2.1.0 新增)
- **三级优先级调试法**: 系统化问题诊断和解决方案
  1. 🔴 大区域差异 → 素材问题 (最高优先级)
  2. 🟡 普通元素差异 → 布局问题 (中等优先级)
  3. 🟢 字体差异 → 可忽略 (最低优先级)

### 🔍 增强分析引擎
- **智能差异检测**: 四象限分析，精确定位问题区域
- **Figma元素匹配**: 自动匹配差异区域与Figma设计元素
- **置信度评分**: 基于重叠度和尺寸的智能评分系统
- **质量等级评估**: 完美/优秀/良好/需改进/不合格五级评估

### 🛠️ 传统功能
- **🎨 Vue组件编译渲染**: 编译Vue组件并生成高质量截图 (✅ 无白边)
- **🔍 像素级对比分析**: 与Figma设计进行精确的像素对比，支持3倍图归一化
- **🎯 智能元素差异定位**: 基于Figma位置信息精确定位问题元素
- **🛠️ 自动CSS修复建议**: 根据差异分析自动生成针对性修复代码
- **📊 完整质量评估**: 自动生成匹配度报告和改进建议
- **🔄 一站式工作流程**: 从Vue代码到修复建议的端到端自动化

## 📁 目录结构

```
figma-restoration-mcp-vue-tools/
├── figma-restoration-toolkit.mjs         # 🎯 核心工具包 (一站式解决方案)
├── compare-pixelmatch-enhanced.mjs       # 🔍 增强版像素对比工具
├── compile-and-render.mjs                # 🖼️ Vue组件编译渲染工具
├── clean-component.mjs                   # 🗑️ 智能组件清理工具
├── show-diff-details.mjs                 # 📊 详细差异分析工具
├── example.mjs                           # 📖 使用示例
├── src/server.js                         # 🛠️ MCP服务器
├── mcp-config.json                       # ⚙️ MCP配置
├── results/                              # 📁 分析结果目录
└── temp/                                 # 📁 临时文件目录
```

## 🚀 快速开始

### 安装依赖

```bash
cd figma-restoration-mcp-vue-tools
yarn install  # 或 npm install
```

### 基本使用

```bash
# 使用核心工具包进行完整还原分析
node figma-restoration-toolkit.mjs MyComponent ./MyComponent.vue

# 或者单独使用编译渲染工具
node compile-and-render.mjs MyComponent

# 单独使用像素对比工具
node compare-pixelmatch-enhanced.mjs expected.png actual.png diff.png
```

### MCP服务器配置

Add to your MCP client configuration:

```json
{
  "mcpServers": {
    "vue-figma-tools": {
      "command": "node",
      "args": ["path/to/figma-restoration-mcp-vue-tools/src/server.js"],
      "env": {
        "CHROME_EXECUTABLE_PATH": "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
      }
    }
  }
}
```

## 🛠️ 核心工具

### 1. figma-restoration-toolkit.mjs ⭐ **主要工具**
一站式Figma组件还原解决方案，包含完整的分析和修复流程。

**功能特性:**
- 🎨 Vue组件编译和渲染
- 🔍 像素级对比分析 (支持3倍图归一化)
- 🎯 智能元素差异定位
- 🛠️ 自动CSS修复建议生成
- 📊 完整质量评估报告

**使用方法:**
```bash
node figma-restoration-toolkit.mjs <component-name> <vue-file-path>

# 示例
node figma-restoration-toolkit.mjs MyButton ./components/MyButton.vue
```

**输出结果:**
- 组件截图 (actual.png)
- 差异对比图 (diff.png)
- 详细分析报告 (restoration-report.json)
- CSS修复建议

### 2. compare-pixelmatch-enhanced.mjs 🔍 **像素对比工具**
增强版像素对比分析工具，支持3倍图归一化和详细差异分析。

**功能特性:**
- 🔢 自动图片尺寸归一化处理
- 📊 网格化差异区域分析
- 🎨 颜色差异统计
- 📈 详细匹配度报告
- 💡 智能修复建议

**使用方法:**
```bash
node compare-pixelmatch-enhanced.mjs <expected-image> <actual-image> <diff-output>

# 示例
node compare-pixelmatch-enhanced.mjs expected.png actual.png diff.png
```

### 3. compile-and-render.mjs 🖼️ **组件渲染工具**
Vue组件编译和截图工具，支持自动元素检测和高质量渲染。

**功能特性:**
- 📝 Vue SFC解析和编译
- 🖼️ 自动组件截图
- 🎯 智能元素选择器
- ⚙️ 可配置渲染参数

**使用方法:**
```bash
node compile-and-render.mjs <component-name> [output-dir]

# 示例
node compile-and-render.mjs MyButton ./results/MyButton
```

### 4. clean-component.mjs 🗑️ **智能清理工具**
智能组件文件清理工具，避免重复生成时文件堆积。

**功能特性:**
- 🗑️ 智能清理组件文件
- 📌 保留重要文件 (expected.png, README.md)
- 🔍 预览模式，安全操作
- 📊 清理统计和文件管理

**使用方法:**
```bash
# 预览清理 (安全模式)
node clean-component.mjs clean MyComponent

# 执行清理
node clean-component.mjs clean MyComponent --execute

# 清理所有组件
node clean-component.mjs clean-all --execute

# 查看清理统计
node clean-component.mjs stats
```

### 5. show-diff-details.mjs 📊 **详细差异分析**
显示完整的差异分析结果，包含位置信息和元素匹配。

**使用方法:**
```bash
node show-diff-details.mjs <component-name>

# 示例
node show-diff-details.mjs MyButton
```

## 📋 工作流程示例

### 完整还原工作流程

**步骤1: 准备Vue组件代码**
```vue
<template>
  <div class="my-button">
    <span class="button-text">Click me</span>
  </div>
</template>

<script>
export default {
  name: 'MyButton'
}
</script>

<style scoped>
.my-button {
  width: 120px;
  height: 40px;
  background: #007bff;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.button-text {
  color: white;
  font-size: 14px;
}
</style>
```

**步骤2: 运行完整分析**
```bash
node figma-restoration-toolkit.mjs MyButton ./MyButton.vue
```

**步骤3: 查看分析结果**
```
🎉 还原工作流程完成！
📊 还原总结:
   匹配度: 97.47%
   质量评级: high
   差异区域: 4个
   修复建议: 2个

💡 建议:
   ✅ 高质量还原，建议直接使用
   🔧 可以应用细节修复建议进一步优化

📁 结果文件: ./results/MyButton/restoration-report.json
```

## 🚀 MCP工具 (v2.1.0 简化版)

**重要更新**: 为了简化工作流程，我们移除了独立的`vue_dev_server`和`save_vue_component`工具：

- ✅ **开发服务器管理**: 已集成到截图工具中，自动检查和启动
- ✅ **组件保存**: 通过cursor rules配置，AI直接创建文件到指定路径

这样的设计更加自动化和用户友好！

### figma_compare 🎯 **一站式对比分析** ⭐
**核心工具** - 完整的Figma组件还原对比分析解决方案，集成snapDOM高质量截图技术。

**功能特性:**
- 📸 snapDOM高质量DOM截图 (无需传统浏览器自动化)
- 🔍 像素级图片对比分析
- 📊 详细质量评估报告
- 💡 智能优化建议
- 📋 Markdown + JSON双格式报告
- ⚡ 更快的截图性能和更高的保真度

**MCP调用示例:**
```javascript
// 完整的组件对比分析 (使用snapDOM)
{
  "tool": "figma_compare",
  "arguments": {
    "componentName": "BeeSchoolHomepage",
    "port": 83,
    "viewport": {"width": 1440, "height": 800},
    "screenshotOptions": {
      "deviceScaleFactor": 3,
      "omitBackground": true,
      "useSnapDOM": true,
      "embedFonts": true,
      "compress": true
    },
    "threshold": 0.1,
    "generateReport": true
  }
}
```

**工作流程:**
1. 🚀 **自动检查和启动**Vue开发服务器 (无需手动管理)
2. 📸 使用snapDOM进行**三倍图**高质量DOM截图 (包含box-shadow)
3. 🔍 与expected.png进行**智能像素对比** (自动处理尺寸差异)
4. 📊 生成详细分析报告 (包含三倍图信息)
5. 💡 提供优化建议和下一步行动

**🆕 三倍图增强:**
- 自动检测和处理3x缩放差异
- 智能图片尺寸归一化
- 优化的像素匹配算法
- Box-shadow效果完整捕获

### snapdom_screenshot 📸 **高质量DOM截图** 🆕
**新增工具** - 专门的snapDOM截图工具，提供最高质量的DOM-to-image转换。

**功能特性:**
- ⚡ 基于snapDOM技术，比传统截图快150倍
- 🎨 完美保留CSS样式、字体和伪元素
- 🔧 支持Shadow DOM和Web Components
- 📐 **三倍图支持** - 默认3x缩放，确保高分辨率截图
- 🌟 **Box-shadow捕获** - 自动包含阴影效果，带20px边距
- 🎯 自定义选择器支持

**MCP调用示例:**
```javascript
// 高质量组件截图
{
  "tool": "snapdom_screenshot",
  "arguments": {
    "componentName": "MyComponent",
    "port": 83,
    "snapDOMOptions": {
      "scale": 3,
      "compress": true,
      "embedFonts": true,
      "backgroundColor": "transparent",
      "includeBoxShadow": true,
      "padding": 0
    },
    "outputPath": "./custom-screenshot.png"
  }
}
```

**输出报告示例:**
```markdown
# ExchangeSuccess Figma还原分析报告

## 📊 总体评估
- **还原度**: 97.20%
- **状态**: ✨ 优秀级别
- **发现问题**: 2 个
- **预计改进**: +1.5%

## 🎯 问题分布
| 优先级 | 数量 | 说明 |
|--------|------|------|
| 🔴 高优先级 | 0 | 需要立即修复 |
| 🟡 中优先级 | 2 | 建议优化 |
| 🟢 低优先级 | 0 | 可选优化 |

## 🔧 修复建议
1. [MEDIUM] 调整卡片内容位置
   - position: absolute; top: 20px; left: 46px;
   - 检查父容器的定位和尺寸
```

## 🔧 高级功能

### 坐标归一化处理
工具包自动处理Figma 3倍图与Vue组件的坐标系转换：
- 🔢 自动检测图片缩放比例
- 📐 矩阵归一化坐标转换
- 🎯 精确元素位置匹配

### 智能差异定位
基于Figma位置信息精确定位问题元素：
- 📍 Figma元素位置信息解析
- 🔍 差异区域与元素匹配
- 💡 针对性修复建议生成

### 质量评估体系
- 🏆 **优秀** (99%+): 可直接使用
- ✅ **高质量** (95-99%): 建议微调
- ⚠️ **良好** (90-95%): 需要优化
- ❌ **较差** (<90%): 需要重新实现

## 📚 文档和最佳实践

### 重要配置指南
- 📖 [snapDOM最佳实践配置](./docs/snapdom-best-practices.md) - **必读**: 确保98%+对比精度
- 📸 [3x截图指南](./docs/3x-screenshot-guide.md) - 高质量截图配置
- 🔄 [工作流程文档](./docs/workflow.md) - 完整还原流程

### ⚠️ 关键提醒
正确的snapDOMOptions配置至关重要：
```javascript
"snapDOMOptions": {
  "padding": 0,              // 关键: 确保精确对齐
  "includeBoxShadow": true   // 完整视觉效果
}
```
错误配置可能导致精度从98.33%降至93.23%！

## 🌍 环境变量

```bash
# Chrome浏览器路径 (macOS) - snapDOM需要
export CHROME_EXECUTABLE_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

# 开发模式
export NODE_ENV="development"
```

## 📄 License

MIT
