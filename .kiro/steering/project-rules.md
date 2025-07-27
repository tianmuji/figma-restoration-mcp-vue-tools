# 项目开发规则

## 🚫 禁止修改的文件
以下文件由自动化系统维护，请勿手动修改：

### 组件自动注册文件
- `src/components/index.ts` - 此文件使用 Vite glob import 自动扫描和注册所有组件
- **规则**: 当需要添加新组件时，只需在 `src/components/` 下创建新的组件目录，无需修改此文件

### 自动生成的配置文件
- `*.generated.ts` - 任何以 `.generated.ts` 结尾的文件
- `package-lock.json` - NPM依赖锁定文件
- `yarn.lock` - Yarn依赖锁定文件

## ✅ 添加新组件的正确方式

### 1. 创建组件目录结构
```
src/components/NewComponent/
├── index.vue           # Vue组件文件
├── metadata.json       # 组件元数据
└── images/            # 组件素材目录
```

### 2. 组件会自动被注册
- `src/components/index.ts` 会自动发现并导出新组件
- 无需手动添加 import 语句
- 无需手动添加到导出列表

## 开发最佳实践

### Vue 3 组件开发
- 使用 Composition API
- 支持 TypeScript
- 优先使用 flex 布局
- 避免绝对定位
- 遵循响应式设计原则

### 代码质量要求
- 遵循 Vue 3 最佳实践
- 确保 TypeScript 类型安全
- 实现无障碍访问性
- 注重性能优化