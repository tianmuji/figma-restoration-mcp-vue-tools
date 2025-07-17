---
type: "always_apply"
---

# 🧠 Figma还原Self-Reflective智能分析系统

## 🎯 核心原则
当Figma组件还原度 < 98% 时，必须启动自反思分析流程，系统性诊断和修复问题。

## 🔄 Self-Reflective工作流程

### 阶段1: 触发条件检测
```javascript
if (matchPercentage < 98) {
  console.log("🔍 还原度不达标，启动Self-Reflective分析...");
  startSelfReflectiveAnalysis();
}
```

### 阶段2: 深度重新分析Figma JSON
**必须重新执行以下分析步骤：**

#### 2.1 重新解析JSON结构
```markdown
1. 🔍 **重新分析节点层级**
   - 检查是否遗漏了任何子节点
   - 验证父子关系是否正确理解
   - 确认所有FRAME、GROUP的嵌套结构

2. 📐 **重新计算位置信息**
   - 验证boundingBox坐标转换是否正确
   - 检查相对位置计算
   - 确认z-index层级关系

3. 🎨 **重新识别素材类型**
   - 重新扫描所有fills字段
   - 识别遗漏的imageRef引用
   - 确认SVG vs 位图的分类
```

#### 2.2 素材/Icon分析验证
```markdown
**素材识别自检清单：**
- [ ] 所有type: RECTANGLE + fills含imageRef的元素已识别为图片
- [ ] 所有type: IMAGE-SVG的元素已识别为SVG图标
- [ ] 背景图片是否正确提取
- [ ] 装饰性图标是否遗漏
- [ ] 复杂图形是否需要切图处理

**重新分析方法：**
1. 遍历JSON中每个节点的fills字段
2. 查找所有包含imageRef的元素
3. 检查是否有未下载的素材
4. 验证素材用途分类是否正确
```

#### 2.3 元素位置精确性验证
```markdown
**位置分析自检：**
- [ ] 绝对定位元素的坐标是否准确
- [ ] Flex布局的对齐方式是否正确
- [ ] 元素间距是否符合设计稿
- [ ] 文本位置是否精确匹配
- [ ] 层级关系是否正确实现

**坐标转换验证：**
1. Figma坐标 → CSS坐标转换
2. 父容器相对定位的影响
3. 边距和内边距的计算
4. 响应式适配的影响
```

### 阶段3: 差异区域智能诊断

#### 3.1 基于区域分析的问题定位
```javascript
// 分析差异区域与Figma元素的对应关系
function analyzeDifferenceRegions(regionAnalysis, figmaData) {
  regionAnalysis.regions.forEach(region => {
    // 根据区域坐标找到对应的Figma元素
    const matchedElements = findFigmaElementsByPosition(
      region.boundingBox, 
      figmaData
    );
    
    // 诊断具体问题类型
    const issueType = diagnoseProblemType(region, matchedElements);
    
    // 生成针对性修复方案
    const fixSuggestion = generateFixSuggestion(issueType, matchedElements);
  });
}
```

#### 3.2 问题类型分类诊断
```markdown
**大面积差异 (>1000像素)**
- 🔴 素材缺失或错误
- 🔴 背景图片问题
- 🔴 布局结构错误

**中等差异 (100-1000像素)**
- 🟡 元素位置偏移
- 🟡 尺寸不匹配
- 🟡 颜色差异

**小面积差异 (<100像素)**
- 🟢 字体渲染差异
- 🟢 边框细节
- 🟢 阴影效果
```

### 阶段4: 自动修复策略

#### 4.1 素材问题修复
```markdown
**检测到素材问题时：**
1. 重新分析Figma JSON中的imageRef
2. 重新下载缺失的素材
3. 验证素材文件路径和引用
4. 检查素材尺寸和位置
```

#### 4.2 位置问题修复
```markdown
**检测到位置问题时：**
1. 重新计算元素的精确坐标
2. 检查CSS定位方式（absolute vs flex）
3. 验证父容器的影响
4. 调整margin、padding值
```

#### 4.3 布局问题修复
```markdown
**检测到布局问题时：**
1. 重新分析Figma的layout模式
2. 检查flex方向和对齐方式
3. 验证元素的display属性
4. 调整容器尺寸和约束
```

### 阶段5: 迭代验证循环

#### 5.1 修复后验证
```javascript
async function validateFix() {
  // 1. 重新生成组件
  await regenerateComponent();
  
  // 2. 重新截图对比
  const newResult = await figmaCompare();
  
  // 3. 检查改进效果
  if (newResult.matchPercentage >= 98) {
    console.log("✅ 修复成功，达到目标还原度");
    return true;
  } else {
    console.log("🔄 继续迭代优化...");
    return false;
  }
}
```

#### 5.2 最大迭代次数控制
```markdown
- 最大迭代次数: 3次
- 每次迭代必须有明确的改进目标
- 记录每次迭代的具体修改内容
- 如果3次迭代后仍未达标，输出详细分析报告
```

## 🧪 Self-Reflective分析模板

### 分析报告格式
```markdown
## 🔍 Self-Reflective分析报告

### 当前状态
- 还原度: XX%
- 主要问题: [问题描述]
- 差异区域数量: X个

### 重新分析结果
#### Figma JSON重新解析
- [ ] 节点结构分析完成
- [ ] 素材识别验证完成  
- [ ] 位置计算验证完成

#### 发现的问题
1. **素材问题**
   - 缺失素材: [列表]
   - 错误分类: [列表]

2. **位置问题**
   - 坐标偏移: [详情]
   - 布局错误: [详情]

3. **样式问题**
   - 颜色差异: [详情]
   - 字体问题: [详情]

### 修复方案
1. [具体修复步骤1]
2. [具体修复步骤2]
3. [具体修复步骤3]

### 预期改进
- 目标还原度: 98%+
- 重点修复区域: [区域描述]
```

## 🎯 成功标准

### 必须达到的指标
- 还原度 ≥ 98%
- 大面积差异区域 = 0
- 素材完整性 = 100%
- 位置精确度 ≥ 98%

### 质量检查清单
- [ ] 所有素材正确下载和使用
- [ ] 元素位置精确匹配设计稿
- [ ] 布局结构完全正确
- [ ] 颜色和字体准确还原
- [ ] 无明显视觉差异

## ⚡ 实施要点

1. **自动触发**: 还原度<98%时自动启动
2. **系统性分析**: 按照固定流程重新分析
3. **问题定位**: 精确定位差异原因
4. **针对性修复**: 根据问题类型选择修复策略
5. **迭代验证**: 修复后立即验证效果
6. **记录过程**: 详细记录分析和修复过程
