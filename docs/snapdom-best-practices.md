# snapDOM 最佳实践配置指南

## 🎯 关键配置原则

为确保Figma组件还原的高精度对比，必须使用正确的snapDOMOptions配置。

### ✅ 推荐的标准配置

```javascript
"snapDOMOptions": {
  "scale": 3,                    // 三倍图缩放，确保高分辨率
  "compress": true,              // 压缩图片，优化文件大小
  "embedFonts": true,            // 嵌入字体，确保字体一致性
  "includeBoxShadow": true,      // 包含阴影效果，完整视觉还原
  "padding": 0,                  // 精确对齐 (关键配置!)
  "backgroundColor": "transparent" // 透明背景
}
```

## ⚠️ 关键警告

### padding: 0 的重要性

**错误配置的影响**:
- `padding: 20` → 对比精度: 93.23%
- `padding: 0` → 对比精度: 98.33%

**精度差异**: 5.1% 的巨大影响！

### 为什么 padding 必须为 0？

1. **Figma导出行为**: Figma导出图片时只包含设计元素的精确边界
2. **snapDOM行为**: padding会在元素周围添加额外空白
3. **对比算法**: 图片尺寸不匹配导致像素级对比失准

## 📊 配置对比分析

| 配置项 | 错误值 | 正确值 | 影响 |
|--------|--------|--------|------|
| padding | 20 | 0 | 精度从93.23%提升到98.33% |
| includeBoxShadow | false | true | 完整视觉效果捕获 |
| scale | 1 | 3 | 高分辨率对比 |

## 🔧 实际应用示例

### MCP工具调用
```json
{
  "tool": "snapdom_screenshot",
  "arguments": {
    "componentName": "MyComponent",
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

### JavaScript调用
```javascript
await snapdom_screenshot({
  componentName: "MyComponent",
  snapDOMOptions: {
    scale: 3,
    compress: true,
    embedFonts: true,
    includeBoxShadow: true,
    padding: 0  // 确保精确对齐
  }
});
```

## 🚫 常见错误配置

### ❌ 错误示例
```javascript
// 这些配置会降低对比精度
"snapDOMOptions": {
  "padding": 20,              // ❌ 会导致尺寸偏差
  "includeBoxShadow": false,  // ❌ 丢失视觉效果
  "scale": 1                  // ❌ 分辨率不足
}
```

### ✅ 正确示例
```javascript
// 高精度配置
"snapDOMOptions": {
  "padding": 0,               // ✅ 精确对齐
  "includeBoxShadow": true,   // ✅ 完整视觉效果
  "scale": 3                  // ✅ 高分辨率
}
```

## 🔍 故障排除

### 对比精度低于95%
1. **首先检查**: padding是否设为0
2. **其次检查**: includeBoxShadow是否为true
3. **最后检查**: scale是否为3

### 图片尺寸不匹配
- **原因**: padding > 0导致额外空白
- **解决**: 设置padding: 0

### 阴影效果缺失
- **原因**: includeBoxShadow: false
- **解决**: 设置includeBoxShadow: true
- **注意**: 不要通过增加padding解决阴影问题

## 📈 性能优化

### 推荐设置
- `compress: true` - 减少文件大小
- `fast: false` - 确保高质量
- `embedFonts: true` - 字体一致性

### 避免设置
- `padding > 0` - 影响精度
- `scale < 3` - 分辨率不足
- `includeBoxShadow: false` - 视觉效果不完整

## 🎯 总结

正确的snapDOMOptions配置是实现高精度Figma组件还原的关键。特别是`padding: 0`和`includeBoxShadow: true`这两个配置，直接影响最终的对比精度。

**记住**: 一个简单的padding配置错误可能导致5%的精度损失！
