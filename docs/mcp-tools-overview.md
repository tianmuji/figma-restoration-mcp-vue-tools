# MCP工具功能详解

## 📋 概述

本项目提供4个核心MCP工具，专门用于Figma组件还原和Vue组件开发验证。所有工具都基于MCP (Model Context Protocol) 协议，可以通过AI助手直接调用。

## 🛠️ 工具列表

### 1. vue_dev_server 🚀 **开发服务器管理**

#### 功能描述
管理Vue开发服务器的启动、停止和状态检查。这是整个工作流程的基础工具。

#### 主要功能
- ✅ **启动服务器**: 运行 `yarn dev` 启动Vue开发环境
- ⏹️ **停止服务器**: 终止正在运行的开发服务器
- 🔄 **重启服务器**: 先停止再启动服务器
- 📊 **状态检查**: 检查服务器是否正在运行

#### 参数说明
```javascript
{
  "action": "start|stop|status|restart",  // 必需：操作类型
  "port": 83,                             // 可选：端口号，默认83
  "projectPath": "/path/to/project"       // 可选：项目路径，默认当前目录
}
```

#### 使用示例
```javascript
// 启动开发服务器
{
  "tool": "vue_dev_server",
  "arguments": {
    "action": "start",
    "port": 83
  }
}

// 检查服务器状态
{
  "tool": "vue_dev_server", 
  "arguments": {
    "action": "status"
  }
}
```

#### 返回结果
```javascript
{
  "success": true,
  "status": "running",
  "port": 83,
  "url": "http://localhost:83",
  "message": "Vue dev server is running"
}
```

---

### 2. save_vue_component 💾 **组件保存工具**

#### 功能描述
将AI生成的Vue组件代码保存到项目的组件目录中，并创建相应的目录结构。

#### 主要功能
- 💾 **保存组件**: 将Vue代码保存为.vue文件
- 📁 **创建目录**: 自动创建组件和结果目录
- 📝 **元数据管理**: 保存组件相关的元数据信息
- 🔒 **覆盖保护**: 防止意外覆盖已存在的组件

#### 参数说明
```javascript
{
  "componentName": "MyComponent",         // 必需：组件名称
  "vueCode": "<template>...</template>",  // 必需：完整的Vue组件代码
  "projectPath": "/path/to/project",      // 可选：项目路径
  "overwrite": false,                     // 可选：是否覆盖已存在的组件
  "metadata": {                           // 可选：组件元数据
    "figmaUrl": "https://...",
    "description": "组件描述",
    "createdBy": "AI Assistant"
  }
}
```

#### 使用示例
```javascript
{
  "tool": "save_vue_component",
  "arguments": {
    "componentName": "BeeSchoolCard",
    "vueCode": "<template>\n  <div class=\"card\">...</div>\n</template>\n<script>...</script>\n<style>...</style>",
    "metadata": {
      "figmaUrl": "https://figma.com/file/...",
      "description": "蜜蜂学校卡片组件"
    }
  }
}
```

#### 文件结构
```
figma-restoration-mcp-vue-tools/
├── src/components/BeeSchoolCard/
│   ├── index.vue          # Vue组件文件
│   └── metadata.json      # 组件元数据
└── results/BeeSchoolCard/ # 分析结果目录
```

---

### 3. figma_compare 🎯 **一站式对比分析** ⭐

#### 功能描述
**核心工具** - 完整的Figma组件还原对比分析解决方案，集成snapDOM高质量截图和像素级对比分析。

#### 主要功能
- 📸 **snapDOM截图**: 高质量DOM-to-image转换，支持三倍图
- 🔍 **像素级对比**: 与expected.png进行精确对比分析
- 📊 **质量评估**: 自动生成匹配度报告和质量等级
- 💡 **智能建议**: 基于差异分析提供修复建议
- 📋 **双格式报告**: 生成Markdown和JSON格式的详细报告
- 🌟 **Box-shadow支持**: 完整捕获阴影效果

#### 参数说明
```javascript
{
  "componentName": "MyComponent",         // 必需：组件名称
  "port": 83,                            // 可选：开发服务器端口
  "viewport": {                          // 可选：视窗尺寸
    "width": 1440,
    "height": 800
  },
  "screenshotOptions": {                 // 可选：截图选项
    "deviceScaleFactor": 3,              // 三倍图缩放
    "omitBackground": true,              // 透明背景
    "useSnapDOM": true,                  // 使用snapDOM
    "embedFonts": true,                  // 嵌入字体
    "compress": true                     // 压缩图片
  },
  "threshold": 0.1,                      // 可选：对比阈值(0.1 = 90%匹配度)
  "generateReport": true                 // 可选：是否生成报告
}
```

#### 使用示例
```javascript
{
  "tool": "figma_compare",
  "arguments": {
    "componentName": "BeeSchoolHomepage",
    "port": 83,
    "screenshotOptions": {
      "deviceScaleFactor": 3,
      "omitBackground": true,
      "useSnapDOM": true
    },
    "threshold": 0.02,  // 98%匹配度目标
    "generateReport": true
  }
}
```

#### 工作流程
1. 🚀 检查Vue开发服务器状态
2. 📸 使用snapDOM进行三倍图高质量截图
3. 🔍 与expected.png进行智能像素对比
4. 📊 生成详细分析报告
5. 💡 提供优化建议和下一步行动

#### 返回结果
```javascript
{
  "success": true,
  "componentName": "BeeSchoolHomepage",
  "screenshot": {
    "path": "./results/BeeSchoolHomepage/actual.png",
    "method": "snapDOM",
    "features": ["3x-scale", "box-shadow-capture"]
  },
  "comparison": {
    "matchPercentage": 97.20,
    "diffPixels": 1234,
    "totalPixels": 44100
  },
  "summary": {
    "qualityLevel": {
      "level": "excellent",
      "emoji": "✨",
      "needsSelfReflective": true
    }
  }
}
```

---

### 4. snapdom_screenshot 📸 **高质量DOM截图** 🆕

#### 功能描述
专门的snapDOM截图工具，提供最高质量的DOM-to-image转换，支持三倍图和box-shadow捕获。

#### 主要功能
- ⚡ **超快速度**: 比传统截图快150倍
- 🎨 **完美保真**: 保留CSS样式、字体和伪元素
- 🔧 **高级支持**: Shadow DOM和Web Components
- 📐 **三倍图**: 默认3x缩放，确保高分辨率
- 🌟 **Box-shadow**: 自动包含阴影效果，带边距
- 🎯 **灵活选择**: 支持自定义CSS选择器

#### 参数说明
```javascript
{
  "componentName": "MyComponent",         // 必需：组件名称
  "port": 83,                            // 可选：开发服务器端口
  "snapDOMOptions": {                    // 可选：snapDOM配置
    "scale": 3,                          // 缩放比例
    "compress": true,                    // 压缩图片
    "fast": false,                       // 高质量模式
    "embedFonts": true,                  // 嵌入字体
    "backgroundColor": "transparent",     // 背景色
    "includeBoxShadow": true,            // 包含阴影效果
    "padding": 0                        // 精确对齐 (关键配置!)
  },
  "outputPath": "./custom-screenshot.png", // 可选：自定义输出路径
  "selector": ".my-component"             // 可选：自定义选择器
}
```

#### 使用示例
```javascript
{
  "tool": "snapdom_screenshot",
  "arguments": {
    "componentName": "BeeSchoolCard",
    "snapDOMOptions": {
      "scale": 3,
      "includeBoxShadow": true,
      "padding": 0,
      "backgroundColor": "white"
    },
    "outputPath": "./high-quality-card.png"
  }
}
```

#### 特性对比
| 特性 | 传统截图 | snapDOM截图 |
|------|----------|-------------|
| 速度 | 2-5秒 | 0.1-0.3秒 |
| CSS支持 | 基础 | 完美 |
| 字体渲染 | 一般 | 高质量 |
| 阴影效果 | 可能丢失 | 完整捕获 |
| 分辨率 | 标准 | 三倍图 |

## 🔄 典型工作流程

### 完整的Figma还原流程
```javascript
// 1. 启动开发服务器
await vue_dev_server({ action: "start", port: 83 });

// 2. 保存AI生成的组件
await save_vue_component({
  componentName: "MyComponent",
  vueCode: "...",
  metadata: { figmaUrl: "..." }
});

// 3. 进行完整对比分析
await figma_compare({
  componentName: "MyComponent",
  threshold: 0.02,  // 98%目标
  generateReport: true
});

// 4. 如需单独截图
await snapdom_screenshot({
  componentName: "MyComponent",
  snapDOMOptions: {
    scale: 3,
    padding: 0,           // 确保精确对齐
    includeBoxShadow: true
  }
});
```

## 📊 Self-Reflective分析

当figma_compare工具检测到还原度低于98%时，会自动触发Self-Reflective分析提示：

```
🚨 还原度未达到98%标准，需要启动Self-Reflective分析！
📋 Self-Reflective分析流程：
   1. 重新深度分析Figma JSON数据
   2. 验证素材完整性和位置精确性
   3. 执行针对性修复和迭代优化
   4. 目标：达到98%+还原度
```

---

*文档版本: v2.1*
*更新时间: 2025-01-16*
