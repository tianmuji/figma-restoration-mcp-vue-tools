# useAbsoluteBounds 关键参数优化

## 问题描述
在Figma图片下载过程中，不使用`useAbsoluteBounds`参数会导致图片尺寸不准确，严重影响还原度计算。

## 影响分析

### 不使用 useAbsoluteBounds
- **还原度**: 通常只有70-80%
- **尺寸问题**: 下载的图片尺寸与设计稿不匹配
- **像素差异**: 大量不必要的像素差异

### 使用 useAbsoluteBounds: true
- **还原度**: 可达到95%以上
- **尺寸精确**: 使用精确的边界框
- **像素匹配**: 最小化像素差异

## 实际案例

### ConfirmationDialog 组件
- **修复前**: 77.91% 还原度
- **修复后**: 99.48% 还原度
- **提升幅度**: +21.57%

## 正确用法

```javascript
// ✅ 正确 - 包含 useAbsoluteBounds 参数
mcp_figma-context_download_figma_images({
  fileKey: "your-figma-file-key",
  nodes: [
    { nodeId: "node-id", fileName: "expected.png" }
  ],
  localPath: "/path/to/save/images",
  pngScale: 3,
  useAbsoluteBounds: true  // 关键参数
})

// ❌ 错误 - 缺少 useAbsoluteBounds 参数
mcp_figma-context_download_figma_images({
  fileKey: "your-figma-file-key",
  nodes: [
    { nodeId: "node-id", fileName: "expected.png" }
  ],
  localPath: "/path/to/save/images",
  pngScale: 3
  // 缺少 useAbsoluteBounds: true
})
```

## 最佳实践

1. **始终使用**: 每次下载Figma图片都必须包含`useAbsoluteBounds: true`
2. **配合3倍缩放**: 与`pngScale: 3`一起使用获得最佳质量
3. **尺寸验证**: 下载后检查图片尺寸是否与预期一致
4. **还原度检查**: 如果还原度低于90%，首先检查是否使用了此参数

## 技术原理

`useAbsoluteBounds`参数告诉Figma API使用组件的精确边界框，而不是包含额外padding或margin的容器边界。这确保了下载的图片尺寸与设计稿中的实际组件尺寸完全匹配。

## 注意事项

- 此参数可能略微增加下载时间，但质量提升显著
- 对于复杂组件，此参数的影响更加明显
- 建议在所有Figma图片下载操作中默认使用此参数
