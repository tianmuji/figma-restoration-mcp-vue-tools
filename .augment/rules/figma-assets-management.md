---
type: "always_apply"
---

# Figma组件素材管理规范

## 🎯 核心原则

### 1. 素材存放位置
- ⭐ **必须规范**: 素材放在组件同目录下的images文件夹中
- ❌ **错误做法**: 放在其他目录如src/figma-restoration-kit/
- ✅ **正确结构**:
```
figma-restoration-mcp-vue-tools/src/components/ComponentName/
├── index.vue
├── metadata.json
└── images/              ⭐ 同目录下的images文件夹
    ├── icon_scan.svg
    ├── image_bg.png
    └── logo_main.svg
```

### 2. 文件命名规范
- ⭐ **必须包含类型标识**: 文件名必须使用英文
- 使用snake_case命名格式
- 常见类型标识：

```
图标类: icon_功能名.svg
- icon_scan_id.svg      (证件扫描图标)
- icon_pdf.svg          (PDF图标)
- icon_remove_ad.svg    (去广告图标)

图片类: image_描述.png
- image_decoration.png  (装饰图片)
- image_background.png  (背景图片)
- image_avatar.png      (头像图片)

```

### 3. 图片导入方式
- ⭐ **必须使用new URL形式**:
```javascript
// ✅ 正确做法
const iconUrl = new URL('./images/icon_scan.svg', import.meta.url).href

// ❌ 错误做法
import iconScan from './images/icon_scan.svg'
const iconUrl = '/images/icon_scan.svg'
```