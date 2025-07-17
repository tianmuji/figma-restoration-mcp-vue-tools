# 三倍图截图和Box-shadow支持指南

## 🎯 概述

本指南介绍如何使用更新后的截图工具和图片对比工具，支持三倍图和box-shadow效果的完整捕获。

## 🆕 新功能特性

### 1. 三倍图支持
- **默认3x缩放**: 所有截图默认使用3倍分辨率
- **智能尺寸处理**: 自动检测和处理不同尺寸的图片对比
- **高精度对比**: 优化的像素匹配算法，适合高分辨率图片

### 2. Box-shadow捕获
- **自动包含阴影**: 截图时自动包含元素的box-shadow效果
- **智能边距**: 自动添加20px边距确保阴影完整显示
- **DOM包装**: 使用临时包装元素确保阴影正确渲染

## 🔧 使用方法

### snapdom_screenshot 工具

```javascript
{
  "tool": "snapdom_screenshot",
  "arguments": {
    "componentName": "MyComponent",
    "port": 83,
    "snapDOMOptions": {
      "scale": 3,                    // 三倍图缩放
      "includeBoxShadow": true,      // 启用box-shadow捕获
      "padding": 0,                  // 精确对齐Figma导出 (关键!)
      "compress": true,
      "embedFonts": true,
      "backgroundColor": "transparent"
    }
  }
}
```

### figma_compare 工具

```javascript
{
  "tool": "figma_compare",
  "arguments": {
    "componentName": "MyComponent",
    "port": 83,
    "screenshotOptions": {
      "deviceScaleFactor": 3,        // 三倍图缩放
      "omitBackground": true,
      "useSnapDOM": true,
      "embedFonts": true,
      "compress": true
    },
    "threshold": 0.08,               // 更严格的对比阈值
    "generateReport": true
  }
}
```

## 📊 图片对比增强

### 智能尺寸处理
- **自动检测**: 识别3x缩放差异
- **智能调整**: 自动调整图片尺寸进行对比
- **保持质量**: 使用最近邻算法保持像素精度

### 优化的对比算法
- **更严格阈值**: 针对高分辨率图片优化
- **抗锯齿支持**: 更好地处理边缘差异
- **颜色差异**: 多级颜色标记不同类型的差异

## 🎨 Box-shadow处理

### 自动检测
工具会自动检测元素是否有box-shadow样式，并相应调整截图策略。

### 包装策略
```javascript
// 精确捕获策略 - 无额外边距
// 注意: padding设为0确保与Figma导出精确对齐
const wrapper = document.createElement('div');
wrapper.style.padding = '0px';        // 关键: 避免尺寸偏差
wrapper.style.display = 'inline-block';
wrapper.style.backgroundColor = 'transparent';

// 克隆原元素避免影响原DOM
const clonedElement = element.cloneNode(true);
wrapper.appendChild(clonedElement);
```

### 清理机制
截图完成后自动清理临时包装元素，不影响原始DOM结构。

## 📈 质量提升

### 分辨率对比
- **标准截图**: 1x分辨率，可能丢失细节
- **三倍图**: 3x分辨率，像素级精确度
- **文件大小**: 适度增加，但质量显著提升

### 准确度提升
- **边缘处理**: 更好的抗锯齿处理
- **阴影捕获**: 完整的视觉效果
- **字体渲染**: 高分辨率字体显示

## 🔍 故障排除

### 常见问题

1. **截图尺寸不匹配Figma导出**
   - 检查scale设置是否为3
   - **关键**: 确认padding设置为0 (避免93.23% vs 98.33%的精度问题)

2. **阴影未完整显示**
   - 确保includeBoxShadow设为true
   - 检查元素的box-shadow属性
   - 注意: 不要通过增加padding解决，会影响对比精度

3. **对比结果不准确**
   - 确认expected.png是否为3x分辨率
   - **首要检查**: padding是否为0 (最常见的精度问题)
   - 调整threshold阈值

### 调试技巧

1. **查看生成的图片**
   ```bash
   open mcp-vue-tools/results/ComponentName/
   ```

2. **检查图片元数据**
   ```javascript
   const sharp = require('sharp');
   const metadata = await sharp('screenshot.png').metadata();
   console.log(metadata);
   ```

3. **对比报告分析**
   查看生成的Markdown报告，包含详细的尺寸和特性信息。

## 📝 最佳实践

1. **统一使用3x**: 确保所有截图都使用相同的缩放比例
2. **精确对齐配置**: 始终使用padding: 0确保与Figma导出精确对齐
3. **阴影处理**: 使用includeBoxShadow: true而非padding处理阴影
4. **定期清理**: 删除不需要的测试截图文件
5. **版本控制**: 将expected.png纳入版本控制

### ⚠️ 关键配置说明
- **padding: 0** - 防止尺寸偏差，确保98%+对比精度
- **includeBoxShadow: true** - 完整捕获视觉效果
- 错误的padding设置可导致精度从98.33%降至93.23%

## 🚀 性能优化

- **压缩启用**: 默认启用图片压缩减少文件大小
- **快速模式**: 开发时可设置fast: true加快速度
- **缓存策略**: 复用相同配置的截图结果

---

*更新时间: 2025-01-16*
*版本: v2.0 - 三倍图和Box-shadow支持*
