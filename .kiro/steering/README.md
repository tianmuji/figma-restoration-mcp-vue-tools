# Kiro Steering 规则说明

本目录包含了从 Cursor 编辑器规则转换而来的 Kiro steering 规则，确保 Kiro 能够按照相同的标准和流程工作。

## 已设置的规则文件

### 1. figma-restoration-rules.md
- **来源**: `.cursor/rules/figma-restoration-rules.mdc`
- **用途**: Figma组件还原的完整流程规则
- **包含内容**:
  - 9步完整还原流程
  - 视觉驱动的分析方法
  - 路径配置最佳实践
  - 质量标准和优化策略

### 2. image-analysis.md
- **来源**: `.cursor/rules/image-analysis.mdc`
- **用途**: 图像分析能力使用指南
- **包含内容**:
  - 视觉元素识别能力
  - 图片分析应用场景
  - 使用原则和方法

### 3. project-rules.md
- **来源**: `.cursor/rules/project.mdc`
- **用途**: 项目开发规则和最佳实践
- **包含内容**:
  - 禁止修改的文件列表
  - 组件添加的正确方式
  - Vue 3 开发最佳实践

### 4. mcp-tools-usage.md
- **来源**: 新增规则
- **用途**: MCP工具使用指南
- **包含内容**:
  - 可用MCP工具列表
  - 工具使用最佳实践
  - 错误处理和性能优化

## 规则应用方式

所有规则文件都设置为默认应用（alwaysApply: true），这意味着：
- Kiro 在所有交互中都会遵循这些规则
- 无需用户手动激活或引用
- 确保工作流程的一致性和标准化

## 与 Cursor 规则的对应关系

| Cursor 规则文件 | Kiro Steering 文件 | 状态 |
|----------------|-------------------|------|
| figma-restoration-rules.mdc | figma-restoration-rules.md | ✅ 已转换 |
| image-analysis.mdc | image-analysis.md | ✅ 已转换 |
| project.mdc | project-rules.md | ✅ 已转换 |
| - | mcp-tools-usage.md | ✅ 新增 |

## 使用说明

这些规则确保 Kiro 能够：
1. 按照标准化流程进行 Figma 组件还原
2. 充分利用视觉分析能力
3. 遵循项目开发最佳实践
4. 正确使用 MCP 工具
5. 维护代码质量和一致性

如需修改或添加新规则，请直接编辑对应的 `.md` 文件。