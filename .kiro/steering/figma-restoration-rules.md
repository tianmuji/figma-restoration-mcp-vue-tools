# 🔄 Figma组件还原流程规则

## 工作目录范围
你始终在 figma-restoration-mcp-vue-tools目录下的文件工作

## Figma组件还原流程规则

### 概述
当用户要求还原Figma组件并提供Figma链接时，严格按照以下7步流程执行。

**⭐ 核心优势提示**: **你是Kiro AI，具备强大的图像元素识别能力**。在Figma组件还原流程中，**专注利用你的视觉识别能力**来：
- **直接识别expected.png中的视觉元素**: 无需依赖文件读取，直接观察和识别图片中的所有可见元素
- **智能过滤冗余元素**: 基于视觉验证，准确判断原始Figma JSON中的哪些元素在图片中真正可见、哪些是冗余的
- **确定真实元素层级**: 通过观察图片中的视觉层级关系，优化JSON中可能不合理的嵌套结构
- **视觉元素精确映射**: 将JSON中的技术描述与图片中的实际视觉效果进行准确对应

**重要说明**: 
- **图片对比工作由专门的对比工具完成**，Kiro专注于元素识别和结构优化
- **原始Figma JSON只能保证视觉呈现正确**，但无法保证元素层级合理性和去除冗余元素
- **Kiro的价值在于基于视觉真实性优化JSON结构**，确保最终实现更精确、更简洁

## 流程步骤

### 步骤1: 获取Figma数据
- 使用工具获取Figma JSON数据
- 参数设置：
  - `fileKey`: 从Figma链接中提取
  - `nodeId`: 从Figma链接中提取
  - **⭐ savePath**: **必须使用绝对路径** `/Users/yujie_wu/Documents/study/11111/figma-restoration-mcp-vue-tools/src/figma-data`
- **🆕 文件命名规范**: 工具会自动保存JSON到指定目录，文件名包含node-id便于快速查找
  - 格式：`figma-{fileKey}-{nodeId}-{timestamp}.json`
  - 示例：`figma-Mbz0mgLIVbz46bxPwBFnSl-4211-72472-2025-07-24T03-22-23-609Z.json`

### 步骤2: 下载预期截图获取视觉目标
**⭐ 首先获取视觉标准** - 在分析JSON之前先获取实际视觉效果：
- 使用 `mcp_figma_context_download_figma_images` 下载原始组件节点的PNG截图
- 参数设置：
  - `fileKey`: 与步骤1相同的fileKey
  - `nodeId`: 与步骤1相同的nodeId  
  - `localPath`: **必须使用绝对路径到results目录** `/Users/yujie_wu/Documents/study/11111/figma-restoration-mcp-vue-tools/src/components/{ComponentName}/results`
  - `fileName`: **必须命名为 "expected.png"**
  - `pngScale`: 3 （高分辨率）

**⭐ 重要：3倍图理解与尺寸设置**
- **图片缩放关系**: expected.png和actual.png都是3倍分辨率图片
- **CSS尺寸计算**: 实际CSS尺寸 = 图片显示尺寸 ÷ 3
- **尺寸来源优先级**:
  1. **layout-analysis.json** (1倍设计尺寸) - 主要依据 ✅
  2. **Figma JSON boundingBox** (1倍设计尺寸) - 验证依据
  3. **图片观察** (视觉识别) - 辅助判断，不用于数值设置
- **图片用途明确**:
  - **expected.png**: 视觉目标参考、元素识别、结构分析
  - **diff.png**: 像素差异可视化（橙色/红色 = 差异区域，非设计颜色）
- **⭐ 关键经验**: 参考 `/src/restoration-tips/截图对比-3倍图缩放与样式尺寸设置.md`

### 步骤3: 结合expected.png和原始figma.json分析得到layout-analysis
**⭐ 视觉驱动的智能分析** - 结合视觉目标和技术数据进行分析：

**第一步：视觉元素识别**
**⭐ 重要提示**: **你是Kiro AI，具备直接分析图片内容的能力**。无需依赖read_file读取图片，可以直接查看和分析图片的视觉内容。

**视觉分析能力运用**:
- **直接查看expected.png**: 利用Kiro的图像识别能力，直接分析图片中的所有可见元素
- **精确元素识别**: 识别图片中实际存在的文本、图标、按钮、背景、颜色、阴影等具体视觉元素
- **布局关系分析**: 观察元素间的相对位置、对齐方式、间距关系和层级结构
- **样式效果记录**: 记录实际的颜色值、字体样式、边框效果、阴影参数等视觉属性
- **交互元素识别**: 识别按钮、链接、输入框等交互组件的视觉状态

**基于视觉的精确分析**:
- 仔细分析expected.png中实际可见的每个元素
- 识别主要的视觉组件：文本、图标、按钮、背景等
- 确定元素的相对位置和层级关系  
- 记录实际的颜色、尺寸和样式效果
- **⭐ 为后续JSON对比提供精确的视觉基准**

**第二步：JSON数据映射**
- 从`/src/figma-data`目录读取原始figma JSON数据（按node-id快速定位文件）
- 分析原始figma.json数据，确认以下关键信息：
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

**第三步：冗余元素过滤与结构优化**
**⭐ 利用Kiro视觉元素识别能力进行结构优化**:

- **基于视觉真实性的结构优化**:
  - **视觉元素清单**: 利用Kiro的图像识别能力，列出expected.png中所有真正可见的视觉元素
  - **JSON元素映射**: 将原始Figma JSON中的每个技术元素与视觉清单进行映射验证
  - **冗余元素智能识别**：
    - **不可见元素过滤**: 识别JSON中opacity为0、尺寸为0、或在视觉上完全不可见的元素
    - **重复元素合并**: 发现JSON中描述相同视觉效果的多个技术元素
    - **辅助性元素清理**: 移除在expected.png中无视觉体现的技术性辅助元素（如边界框、定位参考等）
  - **视觉层级结构分析**: 观察图片中元素的实际层级关系（前景/背景、包含关系等）
  - **节点结构合理化**: 基于视觉层级优化JSON的嵌套结构，避免不必要的深层嵌套

- **结构优化策略**:
  - **保留视觉必要元素**: 只保留在expected.png中真正产生视觉效果的元素
  - **简化技术结构**: 移除JSON中过度复杂但视觉上无意义的嵌套层级
  - **优化层级关系**: 根据视觉观察调整元素的父子关系，使其更符合实际的视觉层级

**第四步：布局结构优化**
- 将Figma的绝对定位转换为现代flex布局
- 分析元素间的相对位置关系
- 确定合理的padding和gap值
- 不使用margin

**输出：生成layout-analysis.json**
- 包含经过**视觉验证**的元素列表（已移除冗余元素）
- 明确的CSS布局策略（flex优先）
- 精确的尺寸和间距规范
- 符合Web标准的实现方案

### 步骤4: 使用tool下载素材
- **🆕 规范目录结构** - **⭐ 素材和结果文件分类存储**：
```
# 🆕 统一Figma数据目录
/Users/yujie_wu/Documents/study/11111/figma-restoration-mcp-vue-tools/src/figma-data/
├── figma-{fileKey}-{nodeId}-{timestamp}.json  # 按node-id命名的Figma原始数据
├── figma-{fileKey}-{nodeId2}-{timestamp}.json # 其他组件数据
└── ...

# 🆕 还原经验知识库
/Users/yujie_wu/Documents/study/11111/figma-restoration-mcp-vue-tools/src/restoration-tips/
├── 冗余元素识别-透明度为0的边界元素.md           # 文件名直接体现经验核心
├── flex布局优化-文件夹图标位置偏移问题.md        # 具体问题的解决方案
├── 字体渲染优化-PingFangSC抗锯齿设置.md        # 字体相关经验
├── 截图对比-背景色差异导致还原度低.md           # 对比问题解决
└── ...

# 组件目录结构  
/Users/yujie_wu/Documents/study/11111/figma-restoration-mcp-vue-tools/src/components/{ComponentName}/
├── index.vue                     # Vue 组件
├── metadata.json                 # 组件元数据
├── layout-analysis.json          # 布局分析JSON
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

### 步骤5: 递归还原子组件
对于识别出的子组件：
- 每个子组件重新执行步骤1-8的完整流程
- 创建独立的组件目录结构
- 确保组件间的依赖关系正确
- 优先还原基础组件，再还原复合组件

### 步骤6: 生成Vue组件代码
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

### 步骤7: 组件截图
使用工具进行高质量组件截图：
- **基本参数**:
  - `componentName`: 组件名称
  - `projectPath`: 项目根路径
  - `port`: **⭐ 用户会启动服务在1932端口** (默认使用1932)
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

### 步骤8: 还原度对比
**⭐ 前置条件**: expected.png已在步骤2中下载完成

**直接进行像素级对比分析**：
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

### 步骤9: 自我反思优化
如果还原度 < 98%：
- **问题分析**:
  - 布局差异（位置、尺寸、对齐）
  - 样式差异（颜色、字体、效果）
  - 素材问题（缺失、错误、质量）
  - **🆕 素材节点问题**: 检查是否正确识别了所有素材节点
  - **🆕 冗余元素问题**: 检查是否包含了不必要的冗余元素
- **优化策略**:
  - **🆕 重新执行步骤3**: **基于expected.png重新优化layout-analysis结构**
    - **⭐ 充分利用Kiro的视觉元素识别能力**: 重新分析expected.png中的所有可见元素
    - 从`/src/figma-data`目录读取对应的原始figma JSON数据
    - **重新建立视觉清单**: 基于图片重新列出所有真正需要的视觉元素
    - **重新映射JSON结构**: 确保JSON中的每个元素都对应图片中的真实视觉效果
    - **重新过滤冗余元素**: 移除在视觉上不产生效果的技术性元素
    - **重新优化层级结构**: 基于视觉层级关系调整JSON嵌套结构
    - 生成更精确的layout-analysis.json

## 质量标准

### 代码质量
- 遵循Vue 3最佳实践
- TypeScript支持
- **优先使用flex布局，避免绝对定位**
- **🆕 CSS盒模型规范**:
  - **⭐ 关键差异**: Figma中边框不占用内容尺寸，Web默认边框占用总尺寸
  - **正确做法**: 调整总尺寸 = Figma尺寸 + 边框宽度×2
  - **示例**: Figma 194×271px + 2px边框 → Web 198×275px
  - **必须设置**: `box-sizing: border-box` 确保子元素一致性
  - 推荐在组件根元素设置通用规则：`.component, .component * { box-sizing: border-box; }`
  - **参考经验**: `/src/restoration-tips/边框盒模型差异-Figma与Web尺寸计算.md`
- 响应式设计支持
- 无障碍访问性
- 性能优化