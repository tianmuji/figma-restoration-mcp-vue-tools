# 98% Self-Reflective 触发条件更新总结

## 📋 更新概述

本次更新将Figma还原Self-Reflective分析的触发条件从95%提升到**98%**，确保更高的还原质量标准。

## 🔧 更新内容

### 1. Cursor Rules 更新

#### `.augment/rules/figma-self-reflective-workflow.md`
- ✅ 触发条件: `< 98%` 
- ✅ 迭代决策: `≥ 98%` 完成
- ✅ 目标还原度: `98%`
- ✅ 质量保证: `98%` 还原度标准

#### `.augment/rules/figma-self-reflective.md`
- ✅ 触发条件检测: `< 98%`
- ✅ 修复后验证: `≥ 98%`
- ✅ 成功标准: `≥ 98%`
- ✅ 自动触发: `< 98%`

#### `cursor-rules-figma-kit.md`
- ✅ 项目集成: `98%+` 准确度
- ✅ 目标还原度: `98%`
- ✅ 自动触发: `< 98%`
- ✅ 组件测试: `98%+` 视觉准确度
- ✅ 验证流程: `< 98%` 触发分析
- ✅ 自动触发条件: `< 98%`
- ✅ 测试策略: `98%` 阈值
- ✅ 调试流程: `< 98%` 触发
- ✅ 核心指标: `≥ 98%`
- ✅ 过程验证: `98%` 准确度目标

### 2. MCP工具代码更新

#### `mcp-vue-tools/src/tools/figma-compare.js`
- ✅ **getRecommendation()**: 
  - `≥ 98%`: 像素级精确还原标准
  - `< 98%`: 触发Self-Reflective分析
- ✅ **getNextSteps()**:
  - `≥ 98%`: 还原度已达标
  - `< 98%`: 立即启动Self-Reflective分析流程
- ✅ **getQualityLevel()**:
  - `≥ 98%`: 完美级别，无需Self-Reflective
  - `< 98%`: 需要Self-Reflective分析
- ✅ **execute()**: 添加98%触发检测和提示

### 3. 三倍图和Box-shadow支持

#### 截图工具增强
- ✅ **snapdom-screenshot.js**: 
  - 默认3x缩放
  - Box-shadow自动捕获
  - 20px边距处理
- ✅ **figma-compare.js**:
  - 三倍图智能处理
  - Box-shadow包装策略
  - 优化的像素匹配算法

#### 图片对比优化
- ✅ **智能尺寸处理**: 自动检测3x缩放差异
- ✅ **更严格阈值**: 针对高分辨率图片优化
- ✅ **抗锯齿支持**: 更好的边缘差异处理

## 🎯 新的工作流程

### Self-Reflective触发逻辑
```javascript
// 在figma_compare工具执行后
if (comparisonResult.matchPercentage < 98) {
  console.log("🚨 还原度未达到98%标准，需要启动Self-Reflective分析！");
  // 显示Self-Reflective分析流程指导
  // 引导用户按照.augment/rules/中的工作流程执行
}
```

### 质量等级标准
- **98%+**: 🎯 完美 - 像素级精确还原
- **95-97%**: ✨ 优秀 - 需要Self-Reflective分析
- **90-94%**: ✅ 良好 - 需要Self-Reflective分析
- **85-89%**: ⚠️ 需要改进 - 需要Self-Reflective分析
- **80-84%**: ❌ 较差 - 需要Self-Reflective分析
- **<80%**: 💥 失败 - 需要Self-Reflective分析

### 迭代决策流程
1. **还原度 ≥ 98%**: ✅ 完成，可用于生产
2. **还原度 < 98% 且迭代次数 < 3**: 🔄 继续Self-Reflective分析
3. **迭代次数 ≥ 3**: 📊 输出详细分析报告

## 📸 三倍图增强特性

### 截图质量提升
- **3x缩放**: 默认高分辨率截图
- **Box-shadow捕获**: 自动包含阴影效果
- **智能边距**: 20px边距确保完整显示
- **DOM包装**: 临时包装元素避免影响原DOM

### 对比算法优化
- **智能缩放检测**: 自动识别3x差异
- **精确像素匹配**: 优化的阈值和抗锯齿
- **尺寸归一化**: 自动调整图片尺寸进行对比

## 🔍 使用指南

### 1. 执行Figma对比
```javascript
{
  "tool": "figma_compare",
  "arguments": {
    "componentName": "MyComponent",
    "screenshotOptions": {
      "deviceScaleFactor": 3,  // 三倍图
      "omitBackground": true,
      "useSnapDOM": true
    },
    "threshold": 0.08,  // 更严格的阈值
    "generateReport": true
  }
}
```

### 2. 检查结果
- 查看控制台输出的还原度
- 如果 < 98%，会显示Self-Reflective分析提示
- 按照提示执行相应的分析流程

### 3. Self-Reflective分析
按照 `.augment/rules/figma-self-reflective-workflow.md` 执行：
1. 重新深度分析Figma JSON数据
2. 验证素材完整性和位置精确性
3. 执行针对性修复和迭代优化
4. 目标：达到98%+还原度

## 📁 相关文件

### 规则文件
- `.augment/rules/figma-self-reflective-workflow.md`
- `.augment/rules/figma-self-reflective.md`
- `cursor-rules-figma-kit.md`

### 工具文件
- `mcp-vue-tools/src/tools/figma-compare.js`
- `mcp-vue-tools/src/tools/snapdom-screenshot.js`

### 文档文件
- `mcp-vue-tools/docs/3x-screenshot-guide.md`
- `mcp-vue-tools/README.md`

## 🎉 预期效果

1. **更高质量标准**: 98%还原度确保像素级精确
2. **自动化分析**: 低于98%自动触发优化流程
3. **三倍图支持**: 高分辨率截图和精确对比
4. **Box-shadow完整**: 阴影效果完整捕获
5. **智能迭代**: 最多3次自动优化循环

---

*更新时间: 2025-01-16*
*版本: v2.1 - 98% Self-Reflective Standard*
