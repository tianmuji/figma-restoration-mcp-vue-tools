# 🛠️ Figma组件还原工具包

[![npm version](https://badge.fury.io/js/figma-restoration-mcp-vue-tools.svg)](https://badge.fury.io/js/figma-restoration-mcp-vue-tools)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)

🛠️ **专业级Figma组件还原工具包** - 基于MCP（模型上下文协议）的Vue组件开发和Figma设计还原综合服务器。具备snapDOM驱动的高质量截图、智能视觉对比和自动化SVG优化功能，**零配置浏览器安装**。

## 🚀 v4.2.0新特性

- ✅ **简化Puppeteer集成**: 现在自动使用内置Chromium - 无需安装Chrome
- ✅ **增强错误处理**: 智能错误分类，提供具体解决方案建议
- ✅ **性能优化**: 浏览器实例复用和页面池管理，操作更快速
- ✅ **零配置**: 完全消除复杂的浏览器路径检测和配置文件
- ✅ **跨平台可靠性**: 保证在macOS、Linux和Windows上的兼容性

## 🌟 核心功能

- **🎯 高质量截图**: snapDOM技术支持3倍缩放、字体嵌入和智能阴影检测
- **🔍 高级视觉对比**: 像素级精确分析，智能差异检测和质量评估
- **🎨 SVG优化**: 内置SVGO集成，支持自定义配置
- **🤖 MCP集成**: 无缝集成AI编码助手（Cursor、Claude等）
- **🔧 零配置**: 自动浏览器安装和依赖管理
- **🛡️ 安全优先**: 无外部CDN依赖，所有资源本地提供

## 📦 快速开始

### 🌐 远端版本（推荐）

最简单的使用方式 - 无需手动安装浏览器！

**步骤1**: 添加MCP服务器配置到Cursor设置（`~/.cursor/mcp.json`）:

```json
{
  "mcpServers": {
    "figma-restoration-mcp-vue-tools": {
      "command": "npx",
      "args": [
        "-y",
        "figma-restoration-mcp-vue-tools@^4.2.0",
        "start"
      ],
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
```

**步骤2**: 重启Cursor编辑器。

**步骤3**: 包会自动：
- 安装最新的Chrome测试浏览器
- 本地设置所有依赖
- 配置截图的最优设置

**步骤4**: 在Cursor中使用以下MCP工具：
- `figma_compare` - Figma设计对比分析
- `snapdom_screenshot` - 高质量组件截图
- `optimize_svg` - SVG资源优化

### 🔧 本地开发版本

适用于贡献者或需要修改源代码的高级用户：

**步骤1**: 克隆并设置仓库：

```bash
git clone https://github.com/tianmuji/figma-restoration-mcp-vue-tools.git
cd figma-restoration-mcp-vue-tools
npm install

# 浏览器会在npm install期间自动安装
# 无需额外设置！
```

**步骤2**: 添加本地MCP服务器配置：

```json
{
  "mcpServers": {
    "figma-restoration-mcp-vue-tools": {
      "command": "node",
      "args": [
        "/绝对路径/figma-restoration-mcp-vue-tools/src/server.js"
      ],
      "cwd": "/绝对路径/figma-restoration-mcp-vue-tools",
      "env": {
        "NODE_ENV": "development"
      }
    }
  }
}
```

## 🛠️ MCP工具详解

### figma_compare

高级组件对比工具，分析预期截图与实际截图之间的差异。

**参数配置:**
```json
{
  "tool": "figma_compare",
  "arguments": {
    "componentName": "MyComponent",
    "projectPath": "/你的Vue项目路径",
    "threshold": 0.1,
    "outputPath": "/自定义输出目录"
  }
}
```

**核心功能:**
- 像素级差异检测
- 质量评估评分
- 详细分析报告（JSON和Markdown格式）
- 可定制对比阈值

### snapdom_screenshot

使用snapDOM技术的高质量DOM截图工具，专为精确组件捕获设计。

**参数配置:**
```json
{
  "tool": "snapdom_screenshot", 
  "arguments": {
    "componentName": "MyComponent",
    "projectPath": "/你的Vue项目路径",
    "port": 3000,
    "viewport": {
      "width": 1440,
      "height": 800
    },
    "snapDOMOptions": {
      "scale": 3,
      "compress": true,
      "embedFonts": true,
      "backgroundColor": "transparent",
      "padding": 0
    },
    "outputPath": "/自定义输出路径.png"
  }
}
```

**核心功能:**
- 3倍缩放高分辨率输出
- 智能阴影和效果捕获
- 字体嵌入支持
- 透明背景支持
- 自定义视窗和输出设置

### optimize_svg

基于SVGO的SVG优化工具，支持自定义配置。

**参数配置:**
```json
{
  "tool": "optimize_svg",
  "arguments": {
    "inputPath": "/输入文件路径.svg",
    "outputPath": "/优化后文件路径.svg",
    "svgoConfig": {
      "plugins": ["preset-default"],
      "multipass": true,
      "floatPrecision": 2
    }
  }
}
```

**核心功能:**
- 高级SVG优化
- 可定制SVGO配置
- 批量处理支持
- 文件大小减少报告

## ⚙️ 配置说明

### 环境变量

- `PUPPETEER_EXECUTABLE_PATH`: Chrome/Chromium可执行文件路径
- `NODE_ENV`: 环境模式（development/production）

### 阴影检测

对于带有阴影的组件，工具会根据效果数据自动计算最佳padding：

```json
{
  "snapDOMOptions": {
    "scale": 3,
    "padding": 0,
    "figmaEffects": [
      {
        "type": "DROP_SHADOW", 
        "offset": {"x": 0, "y": 5}, 
        "radius": 30, 
        "spread": 0
      }
    ]
  }
}
```

### 对比阈值说明

| 阈值范围 | 敏感度 | 使用场景 |
|----------|--------|----------|
| 0.0-0.05 | 极严格 | 像素级完美匹配 |
| 0.05-0.1 | 严格   | 高质量组件对比 |
| 0.1-0.2  | 中等   | 常规对比分析 |
| 0.2+     | 宽松   | 大致相似性检查 |

## 🎯 典型工作流程

1. **环境配置**: 在Cursor中配置MCP服务器
2. **组件截图**: 使用 `snapdom_screenshot` 捕获组件
3. **对比分析**: 使用 `figma_compare` 分析差异
4. **资源优化**: 使用 `optimize_svg` 优化素材
5. **迭代改进**: 根据分析结果优化组件

## 📋 系统要求

- **Node.js**: ≥ 18.0.0
- **Chrome/Chromium**: 用于截图生成
- **Vue.js项目**: 组件还原目标
- **MCP兼容客户端**: Cursor IDE、Claude Desktop等

## 🛠️ 核心工具详解（传统命令行版本）

### 智能调试系统

- **三级优先级调试法**: 系统化问题诊断和解决方案
  1. 🔴 大区域差异 → 素材问题 (最高优先级)
  2. 🟡 普通元素差异 → 布局问题 (中等优先级)
  3. 🟢 字体差异 → 可忽略 (最低优先级)

### 增强分析引擎

- **智能差异检测**: 四象限分析，精确定位问题区域
- **Figma元素匹配**: 自动匹配差异区域与Figma设计元素
- **置信度评分**: 基于重叠度和尺寸的智能评分系统
- **质量等级评估**: 完美/优秀/良好/需改进/不合格五级评估

### 基本使用（命令行）

```bash
# 使用核心工具包进行完整还原分析
node figma-restoration-toolkit.mjs MyComponent ./MyComponent.vue

# 或者单独使用编译渲染工具
node compile-and-render.mjs MyComponent

# 单独使用像素对比工具
node compare-pixelmatch-enhanced.mjs expected.png actual.png diff.png
```

## 🤝 参与贡献

1. Fork 仓库
2. 创建功能分支 (`git checkout -b feature/new-feature`)
3. 提交更改 (`git commit -m '添加新功能'`)
4. 推送到分支 (`git push origin feature/new-feature`)
5. 开启 Pull Request

## 📄 开源协议

本项目基于 MIT 协议开源。详见 [LICENSE](LICENSE) 文件。

## 🔗 相关链接

- **GitHub**: [tianmuji/figma-restoration-mcp-vue-tools](https://github.com/tianmuji/figma-restoration-mcp-vue-tools)
- **npm**: [figma-restoration-mcp-vue-tools](https://www.npmjs.com/package/figma-restoration-mcp-vue-tools)
- **问题反馈**: [报告Bug和功能请求](https://github.com/tianmuji/figma-restoration-mcp-vue-tools/issues)

## 🙏 致谢

- **[snapDOM](https://github.com/zumer/snapdom)**: 高质量DOM截图库
- **[Model Context Protocol](https://modelcontextprotocol.io/)**: MCP框架
- **[Vue.js](https://vuejs.org/)**: 渐进式JavaScript框架
- **[SVGO](https://github.com/svg/svgo)**: SVG优化库

---

🎨 **为追求像素级完美组件还原的开发者而生** 🎨
