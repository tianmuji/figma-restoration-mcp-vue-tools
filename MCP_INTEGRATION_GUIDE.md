# 🚀 Figma Restoration MCP 集成指南

## 📋 前提条件

✅ **已完成**：
- [x] 安装了 `figma-restoration-mcp-vue-tools@1.3.0`
- [x] 创建了 MCP 配置文件
- [x] 检测到您的系统环境

## 🛠️ 集成步骤

### 方法 1: Cursor IDE 集成 (推荐)

如果您使用 Cursor IDE：

1. **安装 Cursor IDE** (如果还没有)：
   ```bash
   # 下载并安装 Cursor IDE
   # https://cursor.sh/
   ```

2. **配置 MCP**：
   - 打开 Cursor IDE
   - 按 `Cmd+Shift+P` 打开命令面板
   - 搜索 "MCP" 或 "Model Context Protocol"
   - 选择 "Configure MCP Servers"
   - 将 `cursor-mcp-settings.json` 的内容复制到配置中

3. **重启 Cursor**：
   - 重启 Cursor IDE 以加载 MCP 配置

### 方法 2: VS Code 集成

如果您使用 VS Code：

1. **安装 MCP 扩展**：
   - 在 VS Code 扩展市场搜索 "MCP" 或 "Model Context Protocol"
   - 安装相关扩展

2. **配置 MCP**：
   - 打开 VS Code 设置 (`Cmd+,`)
   - 搜索 "MCP"
   - 将 `vscode-mcp-settings.json` 的内容添加到配置中

### 方法 3: Claude Desktop 集成

如果您使用 Claude Desktop：

1. **找到配置文件**：
   ```bash
   # macOS 配置文件位置
   ~/Library/Application Support/Claude/claude_desktop_config.json
   ```

2. **编辑配置文件**：
   ```bash
   # 打开配置文件
   open ~/Library/Application\ Support/Claude/claude_desktop_config.json
   ```

3. **添加 MCP 配置**：
   将 `mcp-config.json` 的内容合并到现有配置中

4. **重启 Claude Desktop**

## 🧪 测试集成

### 1. 验证 MCP 服务器启动

```bash
# 手动测试 MCP 服务器
npx figma-restoration-mcp-vue-tools start
```

### 2. 在 IDE 中测试工具

在您的 AI 助手中尝试以下命令：

#### 测试 snapdom_screenshot 工具：
```javascript
{
  "tool": "snapdom_screenshot",
  "arguments": {
    "componentName": "TestComponent",
    "snapDOMOptions": {
      "scale": 3,
      "compress": true,
      "embedFonts": true,
      "includeBoxShadow": true,
      "padding": 0
    }
  }
}
```

#### 测试 figma_compare 工具：
```javascript
{
  "tool": "figma_compare",
  "arguments": {
    "componentName": "TestComponent",
    "threshold": 0.1,
    "generateReport": true
  }
}
```

## 📁 项目结构设置

为了最佳使用体验，建议在您的 Vue 项目中创建以下结构：

```
your-vue-project/
├── src/
│   └── components/
│       └── YourComponent/
│           ├── index.vue          # Vue 组件
│           ├── images/            # 组件图片资源
│           └── expected.png       # Figma 设计稿 (3x)
├── results/                       # MCP 工具输出目录
└── mcp-config.json               # MCP 配置
```

## 🎯 使用工作流程

### 1. 准备 Figma 设计稿
- 从 Figma 导出设计稿为 PNG (3x 缩放)
- 保存为 `expected.png` 在组件目录中

### 2. 开发 Vue 组件
- 创建 Vue 组件文件
- 实现设计稿中的样式和布局

### 3. 使用 MCP 工具对比
- 使用 `snapdom_screenshot` 截取组件截图
- 使用 `figma_compare` 对比分析差异
- 根据报告优化组件

### 4. 迭代优化
- 根据对比报告调整样式
- 重复截图和对比过程
- 直到达到满意的还原度 (98%+)

## 🔧 高级配置

### 自定义 Chrome 路径
如果 Chrome 安装在非标准位置：

```json
{
  "env": {
    "PUPPETEER_EXECUTABLE_PATH": "/path/to/your/chrome"
  }
}
```

### 性能优化配置
```json
{
  "env": {
    "NODE_ENV": "production",
    "PUPPETEER_EXECUTABLE_PATH": "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "PUPPETEER_ARGS": "--no-sandbox,--disable-setuid-sandbox"
  }
}
```

## 🆘 故障排除

### 常见问题

1. **MCP 服务器无法启动**
   - 检查 Chrome 路径是否正确
   - 确认 Node.js 版本 >= 18.0.0
   - 检查端口是否被占用

2. **截图失败**
   - 确认 Vue 开发服务器正在运行
   - 检查组件路径是否正确
   - 验证组件是否可以正常渲染

3. **对比分析失败**
   - 确认 `expected.png` 文件存在
   - 检查图片格式和尺寸
   - 验证组件截图是否成功生成

### 获取帮助

- 📚 [完整文档](./README.md)
- 🐛 [报告问题](https://github.com/tianmuji/figma-restoration-mcp-vue-tools/issues)
- 💬 [讨论区](https://github.com/tianmuji/figma-restoration-mcp-vue-tools/discussions)

## ✅ 集成完成检查清单

- [ ] 安装了 figma-restoration-mcp-vue-tools
- [ ] 配置了 MCP 服务器
- [ ] 在 IDE 中可以看到 MCP 工具
- [ ] 成功测试了 snapdom_screenshot 工具
- [ ] 成功测试了 figma_compare 工具
- [ ] 设置了项目目录结构
- [ ] 准备了第一个测试组件

完成以上步骤后，您就可以开始使用 Figma Restoration MCP 工具进行高效的组件还原工作了！🎉
