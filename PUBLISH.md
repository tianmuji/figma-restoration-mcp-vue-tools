# 发布指南 - @figma-restoration/mcp-vue-tools

## 🚀 快速发布

### 1. 准备工作

确保你已经：
- ✅ 登录 npm: `npm login`
- ✅ 有 GitHub 账户和仓库访问权限
- ✅ 本地 git 配置正确

### 2. 创建 GitHub 仓库

1. 访问 [GitHub](https://github.com) 并创建新仓库
2. 仓库名: `figma-restoration-mcp-vue-tools`
3. 设置为 Public
4. 不要初始化 README (我们已经有了)

### 3. 连接远程仓库

```bash
# 添加远程仓库
git remote add origin https://github.com/yujie-wu/figma-restoration-mcp-vue-tools.git

# 推送到 GitHub
git branch -M main
git push -u origin main
```

### 4. 发布到 npm

#### 方法 1: 使用自动化脚本
```bash
# 运行发布脚本
./scripts/publish.sh
```

#### 方法 2: 手动发布
```bash
# 1. 更新版本
npm version patch  # 或 minor, major

# 2. 运行测试
npm test

# 3. 发布到 npm
npm publish --access public

# 4. 推送标签到 GitHub
git push origin --tags
```

## 📦 发布后验证

### 检查 npm 包
```bash
# 搜索包
npm search @figma-restoration/mcp-vue-tools

# 查看包信息
npm info @figma-restoration/mcp-vue-tools

# 测试安装
npm install -g @figma-restoration/mcp-vue-tools
figma-restoration-mcp help
```

### 检查 GitHub
- ✅ 代码已推送
- ✅ 标签已创建
- ✅ README 显示正常
- ✅ Issues 和 Discussions 已启用

## 🔄 版本管理

### 语义化版本
- **patch** (1.0.0 → 1.0.1): 错误修复
- **minor** (1.0.0 → 1.1.0): 新功能，向后兼容
- **major** (1.0.0 → 2.0.0): 破坏性更改

### 发布流程
1. 开发功能 → 提交到 `develop` 分支
2. 测试完成 → 合并到 `main` 分支
3. 更新版本 → 发布到 npm
4. 创建 Release → GitHub 发布说明

## 📚 发布清单

### 发布前检查
- [ ] 所有测试通过
- [ ] 文档已更新
- [ ] CHANGELOG 已更新
- [ ] 版本号正确
- [ ] 依赖项已更新

### 发布后检查
- [ ] npm 包可正常安装
- [ ] CLI 命令工作正常
- [ ] GitHub 仓库访问正常
- [ ] 文档链接有效
- [ ] 示例代码可运行

## 🛠️ 故障排除

### npm 发布失败
```bash
# 检查登录状态
npm whoami

# 检查包名是否可用
npm info @figma-restoration/mcp-vue-tools

# 强制发布 (谨慎使用)
npm publish --force
```

### GitHub 推送失败
```bash
# 检查远程仓库
git remote -v

# 重新设置远程仓库
git remote set-url origin https://github.com/yujie-wu/figma-restoration-mcp-vue-tools.git

# 强制推送 (谨慎使用)
git push -f origin main
```

## 🎯 发布成功标志

发布成功后，用户应该能够：

1. **安装包**:
   ```bash
   npm install figma-restoration-mcp-vue-tools
   ```

2. **使用 CLI**:
   ```bash
   npx figma-restoration-mcp-vue-tools init
   npx figma-restoration-mcp-vue-tools start
   ```

3. **在Cursor中使用MCP服务器**:
   ```json
   {
     "mcpServers": {
       "figma-restoration-mcp-vue-tools": {
         "command": "npx",
         "args": [
           "-y",
           "figma-restoration-mcp-vue-tools",
           "start"
         ],
         "env": {
           "PUPPETEER_EXECUTABLE_PATH": "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
           "NODE_ENV": "production"
         }
       }
     }
   }
   ```

4. **查看文档**:
   - npm: https://www.npmjs.com/package/figma-restoration-mcp-vue-tools
   - GitHub: https://github.com/tianmuji/figma-restoration-mcp-vue-tools

## 📖 用户使用指南

### 远端版本使用（推荐）

用户无需克隆仓库，直接通过npm包使用：

1. **配置Cursor MCP**: 在 `~/.cursor/mcp.json` 中添加服务器配置
2. **重启Cursor**: 重启编辑器以加载新配置
3. **使用工具**: 直接在Cursor中使用MCP工具
   - `snapdom_screenshot`: 高质量组件截图
   - `figma_compare`: Figma设计对比
   - `optimize_svg`: SVG优化

### 本地开发版本

适用于需要修改源码的贡献者：

1. **克隆仓库**: `git clone https://github.com/tianmuji/figma-restoration-mcp-vue-tools.git`
2. **安装依赖**: `npm install`
3. **配置MCP**: 使用本地路径配置
4. **开发调试**: 修改代码并测试

## 📞 支持

如果发布过程中遇到问题：
1. 检查本文档的故障排除部分
2. 查看 GitHub Issues
3. 联系维护者

---

**祝发布顺利！** 🎉
