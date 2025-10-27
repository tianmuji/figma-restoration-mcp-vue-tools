# useAbsoluteBounds - 关键参数优化

## 问题发现

在ConfirmationDialog组件还原过程中，发现下载预期图片时使用`useAbsoluteBounds`参数对还原度有重大影响。

## 关键差异分析

### 不使用useAbsoluteBounds参数
- **还原度**: 77.27%
- **差异像素**: 173,550 / 763,560
- **问题**: 图片边界不精确，导致对比基准不准确

### 使用useAbsoluteBounds参数
- **还原度**: 94.08%
- **差异像素**: 27,235 / 460,080
- **改善**: +16.81% 还原度提升
- **差异像素减少**: 146,315个像素

## 参数作用

### useAbsoluteBounds: true
- **作用**: 使用绝对边界进行图片导出
- **效果**: 确保图片边界与Figma设计完全一致
- **适用场景**: 所有需要精确对比的组件还原

### useAbsoluteBounds: false (默认)
- **作用**: 使用相对边界进行图片导出
- **问题**: 可能包含额外的空白区域或裁剪不准确
- **影响**: 导致对比基准不准确，还原度评估错误

## 实现方法

### 正确的图片下载方式
```javascript
mcp_figma-context_download_figma_images({
  fileKey: "A5j9IzIvvLDI8mxZZWIt19",
  nodes: [
    { nodeId: "17606:50778", fileName: "expected.png" }
  ],
  localPath: "/path/to/results/",
  pngScale: 3,
  useAbsoluteBounds: true  // 关键参数
})
```

### 错误的方式
```javascript
// 缺少useAbsoluteBounds参数
mcp_figma-context_download_figma_images({
  fileKey: "A5j9IzIvvLDI8mxZZWIt19",
  nodes: [
    { nodeId: "17606:50778", fileName: "expected.png" }
  ],
  localPath: "/path/to/results/",
  pngScale: 3
  // 缺少useAbsoluteBounds: true
})
```

## 经验总结

### 重要发现
1. **useAbsoluteBounds参数至关重要**: 对还原度有16%以上的影响
2. **图片边界精度**: 直接影响像素对比的准确性
3. **对比基准质量**: 高质量的预期图片是准确还原的前提

### 最佳实践
1. **始终使用useAbsoluteBounds: true**: 确保图片边界精确
2. **优先检查图片质量**: 在组件优化前先确保对比基准准确
3. **记录参数使用**: 在文档中明确记录关键参数的使用

### 常见问题
- **忽略useAbsoluteBounds参数**: 导致还原度评估不准确
- **图片边界不匹配**: 影响后续优化效果
- **对比基准错误**: 基于错误基准的优化无效

## 影响范围

### 适用场景
- 所有Figma组件还原
- 需要精确像素对比的场景
- 还原度评估和优化

### 预期效果
- **还原度提升**: 10-20%的显著改善
- **对比准确性**: 像素级精确对比
- **优化效果**: 基于准确基准的有效优化

## 检查清单

### 图片下载检查
- [ ] 使用useAbsoluteBounds: true参数
- [ ] 验证图片边界是否精确
- [ ] 确认图片尺寸与Figma设计一致
- [ ] 检查图片质量是否清晰

### 对比验证
- [ ] 对比前后还原度变化
- [ ] 验证差异像素数量
- [ ] 确认优化效果是否真实