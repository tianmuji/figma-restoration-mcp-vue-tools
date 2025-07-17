# Release Notes v1.3.1

## 🔧 Puppeteer 依赖修复版本

这是一个重要的修复版本，解决了 v1.3.0 中 Puppeteer 依赖导致的 MCP 服务器启动失败问题。

## 🐛 修复的问题

### 主要问题
- **MCP 服务器启动失败**: 修复了 `Cannot find package 'puppeteer'` 错误
- **全局安装依赖问题**: 解决了全局安装包无法找到 Puppeteer 的问题
- **动态导入复杂性**: 简化了 Puppeteer 导入逻辑

### 根本原因
- 全局安装的 npm 包有独立的 node_modules 目录
- Puppeteer 作为 dependencies 但无法被全局包访问
- 复杂的动态导入策略导致不稳定性

## ✅ 解决方案

### 1. **简化导入逻辑**
- 移除复杂的动态导入策略
- 恢复标准的 ES6 静态导入
- 简化 PuppeteerManager 类

### 2. **bundledDependencies 配置**
```json
{
  "bundledDependencies": [
    "puppeteer"
  ]
}
```
- 确保 Puppeteer 与包一起打包
- 解决全局安装的依赖访问问题

### 3. **代码简化**
- `src/utils/puppeteer-manager.js`: 移除复杂的多策略导入
- `src/tools/snapdom-screenshot.js`: 简化错误处理
- `scripts/quick-screenshot.js`: 使用标准导入

## 🔄 更改详情

### 修改的文件

#### `src/utils/puppeteer-manager.js`
```javascript
// 之前: 复杂的动态导入
async loadPuppeteer() {
  // 多种导入策略...
}

// 现在: 简单的静态导入
import puppeteer from 'puppeteer';
```

#### `package.json`
```json
{
  "version": "1.3.1",
  "bundledDependencies": ["puppeteer"]
}
```

#### `src/tools/snapdom-screenshot.js`
- 移除复杂的 try-catch 错误处理
- 恢复简洁的浏览器启动逻辑

## 🧪 测试结果

### ✅ 安装测试
- **测试成功率**: 100% (10/10)
- **包完整性**: ✅ 通过
- **依赖检查**: ✅ 通过
- **工具验证**: ✅ 通过

### ✅ 功能测试
- **MCP 服务器启动**: ✅ 成功
- **Puppeteer 加载**: ✅ 正常
- **Chrome 检测**: ✅ 自动发现
- **工具可用性**: ✅ 完全可用

## 📦 安装和使用

### 全局安装
```bash
npm install -g figma-restoration-mcp-vue-tools@1.3.1
```

### 启动 MCP 服务器
```bash
npx figma-restoration-mcp-vue-tools start
```

### 验证安装
```bash
npx figma-restoration-mcp-vue-tools --version
# 输出: 1.3.1
```

## 🛠️ 工具状态

### 可用工具 (2个)
1. **`figma_compare`** - 完整的对比分析工具 ✅
2. **`snapdom_screenshot`** - 高质量截图工具 ✅

### 质量指标
- **截图质量**: 3x 缩放 ✅
- **对比精度**: 98%+ ✅
- **阴影检测**: 自动 ✅
- **字体嵌入**: 完整 ✅

## 🔗 依赖信息

### 核心依赖
- `puppeteer@21.0.0` - 浏览器自动化 (已打包)
- `@zumer/snapdom@1.9.5` - 高质量截图
- `@modelcontextprotocol/sdk@0.4.0` - MCP 框架
- `sharp@0.34.3` - 图像处理
- `pixelmatch@5.3.0` - 像素对比

### 打包策略
- Puppeteer 现在作为 bundledDependency 打包
- 确保全局安装时依赖可用
- 减少用户手动安装步骤

## 🚨 重要说明

### 从 v1.3.0 升级
如果您之前安装了 v1.3.0 并遇到启动问题：

```bash
# 卸载旧版本
npm uninstall -g figma-restoration-mcp-vue-tools

# 安装新版本
npm install -g figma-restoration-mcp-vue-tools@1.3.1

# 验证修复
npx figma-restoration-mcp-vue-tools start
```

### 兼容性
- **Node.js**: >=18.0.0
- **Chrome**: 自动检测系统安装
- **操作系统**: macOS, Linux, Windows

## 📚 文档

- [主要文档](./README.md)
- [工具概览](./TOOLS_OVERVIEW.md)
- [集成指南](./MCP_INTEGRATION_GUIDE.md)
- [简化总结](./SIMPLIFICATION_SUMMARY.md)

## 🙏 致谢

感谢用户反馈帮助我们快速识别和解决这个关键问题。

## 📞 支持

- 🐛 [报告问题](https://github.com/tianmuji/figma-restoration-mcp-vue-tools/issues)
- 💬 [讨论区](https://github.com/tianmuji/figma-restoration-mcp-vue-tools/discussions)
- 📚 [文档](https://github.com/tianmuji/figma-restoration-mcp-vue-tools#readme)
