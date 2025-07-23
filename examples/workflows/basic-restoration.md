# Figma组件还原基础工作流程

## 🎯 概述
本文档介绍如何使用MCP工具进行Figma组件的像素级还原对比分析。

## 📋 工作流程

### 1. 准备工作
确保您有：
- Figma设计稿的PNG导出（推荐3x分辨率）
- 已实现的Vue组件
- 运行的Vue开发服务器

### 2. 使用默认路径（组件目录）

#### 步骤一：截图
```javascript
{
  "tool": "snapdom_screenshot",
  "arguments": {
    "componentName": "MyButton",
    "snapDOMOptions": {
      "scale": 3,
      "compress": true,
      "embedFonts": true
    }
  }
}
```

#### 步骤二：对比分析
```javascript
{
  "tool": "figma_compare",
  "arguments": {
    "componentName": "MyButton",
    "threshold": 0.1,
    "generateReport": true
  }
}
```

**结果存储位置**：`src/components/MyButton/`

### 3. 🆕 使用自定义路径（更灵活）

#### 步骤一：截图到自定义位置
```javascript
{
  "tool": "snapdom_screenshot",
  "arguments": {
    "componentName": "MyButton",
    "outputPath": "/Users/username/project/figma-analysis/MyButton-v1.0",
    "snapDOMOptions": {
      "scale": 3,
      "compress": true,
      "embedFonts": true
  }
  }
}
```

#### 步骤二：对比分析（同样的自定义路径）
```javascript
{
  "tool": "figma_compare",
  "arguments": {
    "componentName": "MyButton",
    "outputPath": "/Users/username/project/figma-analysis/MyButton-v1.0",
    "threshold": 0.1,
    "generateReport": true
  }
}
```

**结果存储位置**：`/Users/username/project/figma-analysis/MyButton-v1.0/`

### 4. 自定义路径的使用场景

#### 场景一：版本管理
```javascript
// 不同版本的对比分析
{
  "outputPath": "/project/analysis/MyButton-v1.0"
}
{
  "outputPath": "/project/analysis/MyButton-v2.0"
}
```

#### 场景二：多环境测试
```javascript
// 开发环境
{
  "outputPath": "/project/qa/dev/MyButton"
}
// 测试环境
{
  "outputPath": "/project/qa/test/MyButton"
}
```

#### 场景三：团队协作
```javascript
// 设计师目录
{
  "outputPath": "/shared/design-review/MyButton"
}
// 开发者目录
{
  "outputPath": "/shared/dev-review/MyButton"
}
```

### 5. 输出文件结构

无论使用默认路径还是自定义路径，都会产生以下文件：

```
指定路径/
├── actual.png                    # 组件截图
├── expected.png                  # Figma原图（需手动放置）
├── diff.png                      # 差异对比图
├── figma-analysis-report.json    # JSON格式报告
├── figma-analysis-report.md      # Markdown格式报告
└── region-analysis.json          # 区域差异分析
```

### 6. 最佳实践

1. **路径规范**：使用绝对路径避免相对路径问题
2. **文件组织**：为不同版本、环境创建独立目录
3. **命名约定**：在路径中包含组件名称和版本信息
4. **团队协作**：使用共享路径便于团队成员访问结果

### 7. 注意事项

- 确保自定义路径的目录存在写权限
- expected.png需要手动放置到指定路径
- 两个工具的outputPath参数必须保持一致
- 路径中避免使用特殊字符和空格
