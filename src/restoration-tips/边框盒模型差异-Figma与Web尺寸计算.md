# 边框盒模型差异 - Figma与Web尺寸计算

## 问题描述

Figma 和 Web 在处理边框时的盒模型计算方式不同，导致组件还原时内容区域偏小。

## 核心差异

### Figma 盒模型
- **边框不占用内容尺寸**
- 设置宽高 194×271px，边框 2px
- **实际占用空间**: 198×275px (194+2×2, 271+2×2)
- **内容区域**: 完整的 194×271px

### Web 默认盒模型 (content-box)
- **边框占用总尺寸**
- 设置宽高 194×271px，边框 2px
- **实际占用空间**: 194×271px
- **内容区域**: 190×267px (194-2×2, 271-2×2)

## 解决方案

### 方案1: 调整总尺寸 (推荐)
```css
.component {
  /* Figma: 194×271px 内容 + 2px边框 = 198×275px 总尺寸 */
  width: 198px;  /* 194 + 2×2 */
  height: 275px; /* 271 + 2×2 */
  border: 2px solid #000000;
  box-sizing: border-box; /* 确保子元素一致性 */
}
```

### 方案2: 仅使用 border-box (不推荐)
```css
.component {
  width: 194px;
  height: 271px;
  border: 2px solid #000000;
  box-sizing: border-box; /* 内容区域会被压缩到 190×267px */
}
```

**⚠️ 注意**: 方案2虽然简单，但内容区域会被边框压缩，导致与Figma设计不符。

## 最佳实践

### 1. 统一使用 border-box
```css
.component,
.component * {
  box-sizing: border-box;
}
```

### 2. 尺寸计算公式
- **Figma 尺寸 → Web border-box**: 直接使用 Figma 尺寸
- **Figma 尺寸 → Web content-box**: Figma尺寸 + 边框宽度×2

### 3. 验证方法
- 对比 expected.png 和 actual.png
- 检查内容是否被边框"挤压"
- 测量实际内容区域尺寸

## 实际案例

### DesignV1 组件问题
- **Figma 设计**: 194×271px + 2px边框
- **初始实现**: 内容区域变成 190×267px
- **解决方案**: 添加 `box-sizing: border-box`

### 修复前后对比
```css
/* 修复前 - 内容偏小 */
.design-v1 {
  width: 194px;
  height: 271px;
  border: 2px solid #000000;
  /* 默认 content-box，内容区域只有 190×267px */
}

/* 修复后 - 尺寸正确 */
.design-v1 {
  width: 198px;  /* 194 + 2×2 */
  height: 275px; /* 271 + 2×2 */
  border: 2px solid #000000;
  box-sizing: border-box; /* 内容区域保持完整的 194×271px */
}
```

### 实际效果验证
- **修复前还原度**: 92.10%
- **修复后还原度**: 94.39% ⬆️
- **改进效果**: 减少了 10,815 个像素差异

## 注意事项

1. **全局设置**: 建议在组件根元素设置通用的 border-box 规则
2. **子元素继承**: 确保子元素也使用相同的盒模型
3. **padding 影响**: padding 也会受到盒模型影响，需要同样处理
4. **响应式设计**: 在响应式布局中更要注意盒模型一致性

## 相关文档

- [CSS Box Model - MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Box_Model)
- [box-sizing - MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/box-sizing)
- Figma 设计规范中的尺寸定义

## 标签
`#盒模型` `#边框` `#尺寸计算` `#Figma差异` `#CSS基础`