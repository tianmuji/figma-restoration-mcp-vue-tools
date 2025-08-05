# 截图边框：outline与border的关键差异

## 问题描述
在Figma组件还原过程中，使用`outline`实现边框时，截图工具无法捕获边框，导致actual.png与expected.png存在巨大差异，还原度严重下降。

## 问题分析

### 根本原因
- **outline特性**: CSS的`outline`属性不占用布局空间，位于元素外部
- **截图范围**: 截图工具只捕获元素的实际渲染边界
- **边框缺失**: outline不在元素的渲染边界内，因此不被截图包含

### 典型场景
- **Figma设计**: `strokeAlign: OUTSIDE` 的边框
- **错误实现**: 使用`outline: 2px solid #000000`
- **截图结果**: actual.png缺少边框，与expected.png差异巨大
- **还原度影响**: 从99%+下降到93%左右

## 解决方案

### 1. 使用border替代outline
```css
/* ❌ 错误方式 - outline不会被截图 */
.component {
  width: 194px;
  height: 271px;
  outline: 2px solid #000000;
}

/* ✅ 正确方式 - border会被截图包含 */
.component {
  width: 198px; /* 194 + 2*2 = 198px */
  height: 275px; /* 271 + 2*2 = 275px */
  border: 2px solid #000000;
}
```

### 2. 尺寸调整策略
- **原始尺寸**: Figma中的内容区域尺寸
- **边框宽度**: 2px (根据strokeWeight)
- **最终尺寸**: 原始尺寸 + 2 × 边框宽度

### 3. 验证方法
- 截图前后对比actual.png
- 确认边框是否完整显示
- 验证还原度是否显著提升

## 实际案例：DesignV1组件

### 修复前
- **实现**: `outline: 2px solid #000000`
- **还原度**: 93.18%
- **问题**: 边框完全缺失

### 修复后  
- **实现**: `border: 2px solid #000000`
- **尺寸调整**: 194×271 → 198×275
- **还原度**: 99.03% ✅
- **提升**: +5.85% 巨大改善

## 关键经验

### 1. 边框实现优先级
1. **border**: 首选，确保截图包含
2. **box-shadow**: 备选，适用于复杂边框效果
3. **outline**: 避免使用，除非确定不需要截图对比

### 2. strokeAlign映射
- **INSIDE**: 使用border，无需调整尺寸
- **CENTER**: 使用border，尺寸调整一半边框宽度
- **OUTSIDE**: 使用border，尺寸调整完整边框宽度

### 3. 调试技巧
- 使用浏览器开发者工具检查元素边界
- 对比截图前后的视觉差异
- 验证元素实际渲染尺寸

## 注意事项

### 1. 盒模型影响
- 确保使用`box-sizing: border-box`
- border会影响内容区域大小
- 可能需要调整内部元素布局

### 2. 响应式考虑
- 固定边框宽度在缩放时的表现
- 不同设备像素比下的显示效果

### 3. 性能影响
- border比outline有更好的截图兼容性
- 对渲染性能影响微乎其微

## 适用场景
- **所有需要截图对比的组件**
- **Figma strokeAlign: OUTSIDE的边框**
- **需要精确还原度的UI组件**

## 标签
`#边框` `#截图` `#outline` `#border` `#还原度` `#关键修复`