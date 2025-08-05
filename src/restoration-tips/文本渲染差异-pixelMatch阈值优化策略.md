# 文本渲染差异：CSS优化策略

## 问题描述
在Figma组件还原中，文本渲染差异是导致还原度下降的主要原因。这些差异包括字体抗锯齿、子像素渲染、字体平滑度等差异。

## 重要原则
**阈值必须严格限定为 0.02**，不允许通过提高阈值来掩盖真实的还原问题。

## 解决方案
通过CSS优化来减少文本渲染差异：

### 文本渲染优化
```css
.text-element {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
  font-feature-settings: "kern" 1;
}
```

### 字体匹配优化
```css
.text-element {
  font-family: 'PingFang SC', -apple-system, BlinkMacSystemFont, sans-serif;
  font-weight: 500;
  font-size: 20px;
  line-height: 1.4em;
  letter-spacing: 0;
}
```

## 最佳实践
- **严格使用 threshold: 0.02**
- **通过CSS优化而非阈值调整来提升还原度**
- **精确匹配字体族、大小、行高**
- **添加字体平滑属性**

## 注意事项
- 绝不允许提高阈值来"优化"还原度
- 真实的还原问题必须通过代码改进解决
- 保持98%+还原度的严格标准 