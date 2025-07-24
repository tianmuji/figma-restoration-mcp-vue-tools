---
alwaysApply: true
---

# 🔄 持续生效规则：Figma组件还原流程

# 工作目录范围
你始终在 figma-restoration-mcp-vue-tools目录下的文件工作

# Figma组件还原流程规则

## 概述
当用户要求还原Figma组件并提供Figma链接时，严格按照以下7步流程执行。

## 流程步骤

### 步骤1: 获取Figma数据
- 使用工具获取Figma JSON数据
- 参数设置：
  - `fileKey`: 从Figma链接中提取
  - `nodeId`: 从Figma链接中提取
  - **⭐ savePath**: **必须使用绝对路径** `/Users/yujie_wu/Documents/study/11111/figma-restoration-mcp-vue-tools/src/components/{ComponentName}`
- 工具会自动保存JSON到指定目录

### 步骤2: 分析JSON内容
分析返回的JSON数据，确认以下关键信息：
1. **页面结构**: 
   - 组件层级关系
   - 布局方式（**优先使用flex布局，非必要不使用绝对定位**）
   - 尺寸和位置信息
2. **🆕 智能素材节点识别**:
   - **根据节点名字识别**: 检测名字中含有 `ic`、`ic_`、`素材`、`material`、`asset`、`icon`、`img`、`image` 等关键词
   - **自动跳过子节点**: 当识别为素材节点时，直接导出该节点，不再分析其子节点
   - **图片节点**: imageRef填充的节点
   - **图标节点**: SVG矢量图标
   - **背景图片**: 背景填充图片
   - **优先级**: 名字识别 > 类型+填充识别
3. **子组件识别**:
   - 嵌套的组件实例
   - 可复用的UI元素
4. **样式信息**:
   - 颜色、字体、边框
   - 阴影、圆角等效果
   - 响应式布局需求

输出：生成符合Web标准、层级分明的优化JSON结构

### 步骤2.5: 🆕 基于位置和可见性优化JSON
**⭐ 新增关键步骤** - 生成符合Web最佳实践的优化JSON：
- **位置分析验证**:
  - 对比Figma坐标与预期截图(expected.png)
  - 识别和移除在预期图中不可见的冗余元素
  - 验证每个元素在视觉输出中的实际作用
- **布局结构优化**:
  - 将Figma的绝对定位转换为现代flex布局
  - 分析元素间的相对位置关系
  - 确定合理的padding和gap值
  - 不使用margin
- **HTML结构映射**:
  - 确定元素的语义角色（容器、内容、装饰等）
  - 规划合理的DOM层级结构
  - 考虑flex布局中的元素顺序
- **输出优化JSON**:
  - 包含经过验证的元素列表
  - 明确的CSS布局策略（flex优先）
  - 精确的尺寸和间距规范
  - 符合Web标准的实现方案

### 步骤3: 使用tool下载素材
- **🆕 规范目录结构** - **⭐ 素材和结果文件分类存储**：
```
/Users/yujie_wu/Documents/study/11111/figma-restoration-mcp-vue-tools/src/components/{ComponentName}/
├── index.vue                     # Vue 组件
├── metadata.json                 # 组件元数据
├── layout-analysis.json          # 布局分析JSON
├── figma-{fileKey}-{nodeId}-{timestamp}.json  # Figma原始数据
├── images/                       # ⭐ 素材文件目录
│   ├── folder-icon.svg           # 图标文件
│   ├── project-icon.svg          # 项目图标
│   └── background.png            # 背景图片等
└── results/                      # ⭐ 截图对比结果目录
    ├── expected.png              # Figma原图
    ├── actual.png                # 组件截图
    ├── diff.png                  # 差异对比图
    ├── figma-analysis-report.json # 分析报告
    ├── figma-analysis-report.md   # 分析报告MD
    └── region-analysis.json      # 区域分析
```
- **素材准备方式**:
  - 从Figma手动导出图片素材到images目录
  - 确保素材命名符合规范（icon_xxx.svg, image_xxx.png等）
  - 推荐使用高分辨率素材（2x或3x）

### 步骤4: 递归还原子组件
对于识别出的子组件：
- 每个子组件重新执行步骤1-7的完整流程
- 创建独立的组件目录结构
- 确保组件间的依赖关系正确
- 优先还原基础组件，再还原复合组件

### 步骤5: 生成Vue组件代码
基于优化的JSON、准备的素材和制作的子组件生成代码：
- **技术栈要求**:
  - Vue 3 Composition API
  - TypeScript支持
  - **优先使用flex布局，避免绝对定位**
- **代码结构**:
  - 响应式设计
  - 不需要语义化HTML结构
- **文件生成**:
  - `index.vue`: 主组件文件
  - `metadata.json`: 组件元数据（尺寸、描述等）
- **⭐ 组件自动注册**: Vue组件在项目中通过 `src/components/index.ts` 自动注册，无需检查注册相关代码

### 步骤6: 组件截图
使用工具进行高质量组件截图：
- **基本参数**:
  - `componentName`: 组件名称
  - `projectPath`: 项目根路径
  - `port`: **⭐ 必须使用用户启动的服务器端口号**
- **⭐ 必须指定输出路径**:
  - **outputPath**: **必须使用绝对路径到组件的results目录下的actual.png**
  - **路径格式**: `/Users/yujie_wu/Documents/study/11111/figma-restoration-mcp-vue-tools/src/components/{ComponentName}/results/actual.png`
- **截图配置**:
  - `snapDOMOptions`: 高质量截图配置
    - `scale`: 3（高分辨率）
    - **⭐ padding设置规则**:
      - **无阴影组件**: `padding: 0` （精确裁切，提升还原度）
    - `backgroundColor`: "transparent"
    - `embedFonts`: true

### 步骤7: 还原度对比
使用工具进行像素级对比分析：
- **基本参数**:
  - `componentName`: 组件名称
  - `threshold`: 0.02（98%还原度要求）
  - `generateReport`: true
- **⭐ 必须指定输出路径**:
  - **必须与步骤6使用相同的results目录**
  - **路径格式**: `/Users/yujie_wu/Documents/study/11111/figma-restoration-mcp-vue-tools/src/components/{ComponentName}/results`
- **⭐ 结果存储位置**:
  - expected.png, actual.png, diff.png 存储在组件的results目录
  - 分析报告存储在同一results目录下
- 分析对比结果，识别差异点

### 步骤8: 自我反思优化
如果还原度 < 98%：
- **问题分析**:
  - 布局差异（位置、尺寸、对齐）
  - 样式差异（颜色、字体、效果）
  - 素材问题（缺失、错误、质量）
  - **🆕 素材节点问题**: 检查是否正确识别了所有素材节点
- **优化策略**:
  - 重新分析JSON结构（回到步骤2）
  - **🆕 验证素材节点识别**: 确认所有 `ic`、`ic_`、`素材` 等关键词节点已正确处理
  - 调整CSS样式和布局（**优先使用flex布局优化**）
  - 重新准备或优化素材
  - 修复子组件问题
- **迭代流程**:
  - 最多迭代3次
  - 每次迭代都要重新截图对比
  - 记录改进点和剩余问题

## 🆕 路径配置最佳实践

### ⭐ 分类路径配置（推荐）
- **Figma数据savePath**: **必须使用绝对路径**到组件根目录
- **素材下载localPath**: **必须使用绝对路径**到组件的images目录
- **Figma预期截图**: **必须下载到results目录**（expected.png）
- **截图工具outputPath**: **必须使用绝对路径**到results目录下的actual.png
- **对比工具outputPath**: **必须使用绝对路径**到results目录

**路径格式**:
- **素材路径**: `/Users/yujie_wu/Documents/study/11111/figma-restoration-mcp-vue-tools/src/components/{ComponentName}/images`
- **结果路径**: `/Users/yujie_wu/Documents/study/11111/figma-restoration-mcp-vue-tools/src/components/{ComponentName}/results`

### 🎯 路径规则
- **Figma JSON savePath**: 组件根目录的绝对路径
- **素材下载**: images目录的绝对路径
- **截图对比**: results目录的绝对路径  
- **必须分类存储**: 素材文件在images目录，结果文件在results目录
- **必须保持一致**: 截图和对比工具使用相同的results文件夹

## 质量标准

### 代码质量
- 遵循Vue 3最佳实践
- TypeScript支持
- **优先使用flex布局，避免绝对定位**
- **🆕 CSS盒模型规范**:
  - **任何设置了padding的元素必须设置 `box-sizing: border-box`**
  - 这遵循Figma的实现方式，确保元素尺寸包含padding
  - 推荐在组件根元素设置通用规则：`.component, .component * { box-sizing: border-box; }`
- 响应式设计支持
- 无障碍访问性
- 性能优化


- 及时更新进度和状态
- 遇到问题时主动寻求帮助
