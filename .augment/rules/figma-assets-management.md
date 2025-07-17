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
mcp-vue-tools/src/components/ComponentName/
├── index.vue
├── metadata.json
└── images/              ⭐ 同目录下的images文件夹
    ├── icon_scan.svg
    ├── image_bg.png
    └── logo_main.svg
```

### 2. 文件命名规范
- ⭐ **必须包含类型标识**: 文件名必须包含类型前缀
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

Logo类: logo_组件.svg
- logo_bg.svg          (Logo背景)
- logo_icon.svg        (Logo图标)
- logo_text.svg        (Logo文字)

矢量图: vector_描述.svg
- vector_pattern.svg   (装饰图案)
- vector_shape.svg     (形状元素)

星星/装饰: star_位置.svg
- star_left.svg        (左侧星星)
- star_right.svg       (右侧星星)

联合图形: union_描述.svg
- union_card.svg       (卡片联合图形)
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

## 🔍 素材识别和下载流程

### 1. 三遍分析法
```
第一遍: 整体结构理解
- 分析页面层级和布局
- 识别主要功能区域
- 理解设计意图

第二遍: 详细组件分解  
- 分析每个元素的类型和属性
- 识别所有IMAGE-SVG节点
- 找出所有imageRef引用

第三遍: 精确定位和样式细节
- 确认所有素材的nodeId
- 验证位置和尺寸数据
- 制定下载清单
```

### 2. 素材类型识别
```json
{
  "IMAGE-SVG": "SVG图标和矢量图",
  "imageRef": "位图图片(PNG/JPG)",
  "INSTANCE": "组件实例(可能包含图标)",
  "BOOLEAN_OPERATION": "联合图形(Union/Subtract等)"
}
```

### 3. 下载命名策略
- 根据元素name字段确定用途
- 添加合适的类型前缀
- 确保文件名具有描述性

## 📝 文案完整性检查

### 1. 差异图分析法
- ⭐ **核心方法**: 依据对比差异图进行文案分析
- 重点检查文字区域的红色差异
- 对比原始Figma数据中的TEXT节点

### 2. 文案检查清单
```
□ 页面标题是否完整
□ 按钮文案是否正确
□ 描述文本是否遗漏
□ 状态提示是否显示
□ 功能标签是否准确
□ 数字/日期是否正确
□ 特殊字符是否显示
```

### 3. 文案修复流程
```
1. 在差异图中标记文字差异区域
2. 在Figma JSON中查找对应的TEXT节点
3. 提取正确的文字内容和样式
4. 在Vue组件中补充或修正文案
5. 验证字体、大小、颜色、对齐方式
6. 重新测试确认修复效果
```

## 🛠️ 实施检查清单

### 开始还原前
- [ ] 已进行三遍Figma JSON分析
- [ ] 已识别所有素材类型和数量
- [ ] 已制定素材下载和命名计划

### 素材下载时
- [ ] 素材下载到正确的images目录
- [ ] 文件名包含类型标识
- [ ] 所有素材下载成功无遗漏

### 组件开发时  
- [ ] 使用new URL形式导入图片
- [ ] 图片路径使用相对路径
- [ ] 所有文案内容完整准确

### 测试验证时
- [ ] 检查差异图中的文字区域
- [ ] 验证素材是否正确显示
- [ ] 确认还原度达到目标要求

## ⚠️ 常见错误避免

### 1. 素材管理错误
- ❌ 放在错误目录 (如src/figma-restoration-kit/)
- ❌ 文件名无类型标识 (如scan.svg而非icon_scan.svg)
- ❌ 使用错误的导入方式

### 2. 文案遗漏错误
- ❌ 未检查差异图中的文字区域
- ❌ 忽略Figma JSON中的TEXT节点
- ❌ 文字样式不匹配原设计

### 3. 路径引用错误
- ❌ 使用绝对路径或错误的相对路径
- ❌ 图片无法正确加载显示
- ❌ 在不同环境下路径失效

## 🎯 质量标准

### 素材管理质量
- 100% 素材放在正确位置
- 100% 文件名符合命名规范  
- 100% 图片能正确加载显示

### 文案还原质量
- 100% 文字内容准确无遗漏
- 95%+ 文字样式匹配度
- 100% 文字位置布局正确

### 整体还原质量
- 目标: 95%+ 视觉还原度
- 重点: 素材和文案的完整性
- 标准: 通过差异图验证
