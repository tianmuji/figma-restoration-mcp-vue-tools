# 测试文档

本目录包含了 figma-restoration-mcp-vue-tools 项目的测试套件，验证重构后的功能和性能。

## 测试结构

### 基础测试 (`basic.test.js`)
- 验证测试环境配置
- 检查 Node.js 版本要求
- 基本功能验证

### 集成测试 (`integration.test.js`)
- **PuppeteerManager 集成测试**
  - 模块导入和实例化
  - 单例模式验证
  - 可用性检查
- **错误处理类集成测试**
  - 所有错误类的导入和创建
  - 解决方案生成验证
  - 错误分类功能
- **SnapDOMScreenshotTool 集成测试**
  - 工具初始化和配置
  - 阴影填充计算功能
  - 输入模式验证
- **包结构测试**
  - package.json 结构验证
  - 安装脚本存在性检查

### 性能测试 (`performance.test.js`)
- **初始化性能**
  - PuppeteerManager 快速初始化
  - SnapDOMScreenshotTool 快速创建
- **运行时性能**
  - 可用性检查速度
  - 错误创建和解决方案生成效率
  - 阴影填充计算性能
- **内存使用**
  - 内存泄漏检测
  - 单例模式内存效率

## 运行测试

### 运行所有测试
```bash
npm test
```

### 运行特定测试文件
```bash
npm test tests/basic.test.js
npm test tests/integration.test.js
npm test tests/performance.test.js
```

### 运行测试并生成覆盖率报告
```bash
npm run test:coverage
```

### 监视模式运行测试
```bash
npm run test:watch
```

## 测试配置

### Jest 配置 (`jest.config.js`)
- 使用 Node.js 测试环境
- 支持 ES 模块
- 30秒测试超时
- 详细输出模式

### 测试设置 (`setup.js`)
- 基本的 ES 模块测试设置
- 测试环境初始化

## 重构验证

这些测试验证了以下重构改进：

### ✅ 简化的 Puppeteer 集成
- 验证使用内置 Chromium 而不是系统 Chrome
- 确认移除了复杂的路径检测逻辑
- 测试废弃环境变量的警告机制

### ✅ 增强的错误处理
- 验证智能错误分类功能
- 测试针对性解决方案生成
- 确认错误继承结构正确

### ✅ 性能优化
- 验证浏览器实例复用机制
- 测试页面池管理功能
- 确认内存使用效率

### ✅ 向后兼容性
- 验证 API 接口保持不变
- 测试现有功能继续工作
- 确认配置简化不影响功能

## 测试覆盖范围

### 核心模块
- ✅ PuppeteerManager 类
- ✅ 所有错误处理类
- ✅ SnapDOMScreenshotTool 类

### 功能验证
- ✅ 模块导入和初始化
- ✅ 错误处理和解决方案生成
- ✅ 性能和内存使用
- ✅ 包结构和配置

### 边界情况
- ✅ 空值和无效输入处理
- ✅ 超时和错误恢复
- ✅ 内存泄漏预防

## 持续集成

这些测试设计为在 CI/CD 环境中运行：
- 无需外部依赖（如浏览器安装）
- 快速执行（大部分测试在毫秒级完成）
- 稳定可靠（避免网络依赖和时间敏感测试）

## 故障排除

### 常见问题

1. **ES 模块导入错误**
   - 确保使用 `--experimental-vm-modules` 标志
   - 检查 Jest 配置是否正确

2. **测试超时**
   - 检查网络连接
   - 增加测试超时时间

3. **性能测试失败**
   - 性能测试可能因系统负载而变化
   - 可以调整性能期望值

### 调试测试
```bash
# 运行单个测试文件进行调试
npm test tests/integration.test.js

# 使用详细输出
npm test -- --verbose

# 运行特定测试用例
npm test -- --testNamePattern="should initialize quickly"
```

## 贡献指南

添加新测试时请遵循：
1. 使用描述性的测试名称
2. 包含适当的断言
3. 清理测试资源
4. 保持测试独立性
5. 添加必要的注释