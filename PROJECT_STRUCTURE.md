# 项目结构说明

## 目录组织

### `/src/components/` - 还原组件目录
这个目录**只放置已经还原好的 Figma 组件**，每个组件都应该包含：
- `index.vue` - 组件主文件
- `results/` - 对比分析结果目录
  - `expected.png` - Figma 设计稿截图
  - `actual.png` - 实际组件截图
  - `diff.png` - 差异对比图
  - `heatmap.png` - 差异热力图
  - `comparison-report.json` - 详细对比报告

**示例结构：**
```
src/components/
├── DesignV1/
│   ├── index.vue
│   ├── metadata.json
│   └── results/
│       ├── expected.png
│       ├── actual.png
│       ├── diff.png
│       ├── heatmap.png
│       └── comparison-report.json
└── ButtonComponent/
    ├── index.vue
    └── results/
        └── ...
```

### `/src/pages/` - 页面和工具组件
这个目录放置系统的页面组件和工具组件：

- `ComparisonViewer/` - 对比查看页面
  - `ComparisonViewer.vue` - 主对比页面
  - `ImageViewer.vue` - 图片查看器
- `ComponentList/` - 组件列表页面
  - `ComponentList.vue` - 组件列表主页
  - `ComponentCard.vue` - 组件卡片
- `Navigation/` - 导航组件
- `Common/` - 通用组件

### `/src/services/` - 服务层
- `comparison-data-service.js` - 数据服务
- `export-service.js` - 导出服务
- `file-watcher.js` - 文件监听服务
- 等等...

## 功能简化

### 已移除的功能
- ❌ 差异区域详细分析
- ❌ 颜色差异分析
- ❌ 优化建议和修复指导
- ❌ HelloWorld 测试组件

### 保留的核心功能
- ✅ 图片对比展示（原始设计 vs 实际截图 vs 差异图）
- ✅ 基本统计信息（还原度百分比、差异像素数等）
- ✅ 组件列表和汇总
- ✅ 实时更新和文件监听
- ✅ 导出和分享功能

## 使用流程

1. **添加新的还原组件**
   ```bash
   # 在 src/components/ 下创建新组件目录
   mkdir src/components/NewComponent
   # 创建组件文件
   touch src/components/NewComponent/index.vue
   ```

2. **生成对比数据**
   ```bash
   # 使用截图工具
   snapdom_screenshot --componentName NewComponent
   # 使用对比工具
   figma_compare --componentName NewComponent
   ```

3. **查看对比结果**
   - 访问 http://localhost:1932 查看组件列表
   - 点击组件查看详细对比结果

## 开发命令

```bash
# 启动开发服务器
npm run dev

# 运行系统测试
node test-system.js

# 功能测试页面
# http://localhost:1932/src/test-components.html
```

## 注意事项

- `src/components/` 目录应该只包含已经完成还原的组件
- 每个组件都应该有完整的 results 目录和对比数据
- 系统会自动扫描 components 目录下的组件并生成列表
- 如果没有真实的对比数据，系统会使用模拟数据运行