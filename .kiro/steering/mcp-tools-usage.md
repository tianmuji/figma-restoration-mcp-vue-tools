# MCP工具使用规则

## 可用的MCP工具

### Figma数据获取工具
- `mcp_figma_context_get_figma_data`: 获取Figma组件的JSON数据
- `mcp_figma_context_download_figma_images`: 下载Figma组件的图片素材

### 截图和对比工具
- `mcp_figma_restoration_mcp_vue_tools_snapdom_screenshot`: 高质量组件截图
- `mcp_figma_restoration_mcp_vue_tools_figma_compare`: 图片对比分析

### SVG优化工具
- `mcp_figma_restoration_mcp_vue_tools_optimize_svg`: SVG文件优化

## 工具使用最佳实践

### 路径配置原则
- **始终使用绝对路径**: 确保工具能正确找到文件位置
- **分类存储**: 
  - Figma数据: `/Users/yujie_wu/Documents/study/11111/figma-restoration-mcp-vue-tools/src/figma-data/`
  - 组件素材: `{ComponentPath}/images/`
  - 截图结果: `{ComponentPath}/results/`
  - 经验文档: `/Users/yujie_wu/Documents/study/11111/figma-restoration-mcp-vue-tools/src/restoration-tips/`

### 错误处理
- 如果工具调用失败，检查路径是否正确
- 确保目标目录存在
- 验证Figma链接的有效性
- 检查服务器端口是否正确启动

### 性能优化
- 使用高分辨率设置 (scale: 3) 确保截图质量
- 合理设置padding避免不必要的空白
- 优化SVG文件减少文件大小