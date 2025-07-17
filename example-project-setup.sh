#!/bin/bash

# 示例项目设置脚本
# 为 Figma Restoration MCP 创建标准项目结构

PROJECT_NAME=${1:-"my-figma-project"}

echo "🏗️  创建示例项目: $PROJECT_NAME"
echo "=================================================="

# 创建项目目录
mkdir -p "$PROJECT_NAME"
cd "$PROJECT_NAME"

# 创建标准目录结构
mkdir -p src/components
mkdir -p results
mkdir -p public/images

echo "📁 创建目录结构..."

# 创建示例 Vue 组件
cat > src/components/ExampleButton.vue << 'EOF'
<template>
  <button class="example-button" @click="handleClick">
    <span class="button-text">{{ text }}</span>
  </button>
</template>

<script>
export default {
  name: 'ExampleButton',
  props: {
    text: {
      type: String,
      default: 'Click me'
    }
  },
  methods: {
    handleClick() {
      this.$emit('click');
    }
  }
}
</script>

<style scoped>
.example-button {
  background: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 123, 255, 0.2);
}

.example-button:hover {
  background: #0056b3;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 123, 255, 0.3);
}

.example-button:active {
  transform: translateY(0);
}

.button-text {
  display: inline-block;
}
</style>
EOF

# 创建 package.json
cat > package.json << 'EOF'
{
  "name": "figma-restoration-example",
  "version": "1.0.0",
  "description": "Example project for Figma Restoration MCP",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "mcp": "npx figma-restoration-mcp-vue-tools start"
  },
  "dependencies": {
    "vue": "^3.3.0"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^4.0.0",
    "vite": "^4.0.0",
    "figma-restoration-mcp-vue-tools": "^1.3.0"
  }
}
EOF

# 创建 vite.config.js
cat > vite.config.js << 'EOF'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 3000,
    host: true
  }
})
EOF

# 创建 index.html
cat > index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Figma Restoration Example</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
EOF

# 创建 main.js
cat > src/main.js << 'EOF'
import { createApp } from 'vue'
import ExampleButton from './components/ExampleButton.vue'

const app = createApp({
  components: {
    ExampleButton
  },
  template: `
    <div style="padding: 50px; background: #f5f5f5; min-height: 100vh;">
      <h1>Figma Restoration Example</h1>
      <div style="margin: 20px 0;">
        <ExampleButton text="Primary Button" @click="handleClick" />
      </div>
    </div>
  `,
  methods: {
    handleClick() {
      alert('Button clicked!');
    }
  }
})

app.mount('#app')
EOF

# 复制 MCP 配置文件
cp ../mcp-config.json ./
cp ../MCP_INTEGRATION_GUIDE.md ./

# 创建 README
cat > README.md << 'EOF'
# Figma Restoration Example Project

这是一个使用 Figma Restoration MCP 工具的示例项目。

## 快速开始

1. 安装依赖：
   ```bash
   npm install
   ```

2. 启动开发服务器：
   ```bash
   npm run dev
   ```

3. 启动 MCP 服务器：
   ```bash
   npm run mcp
   ```

## 使用 MCP 工具

### 截图工具
```javascript
{
  "tool": "snapdom_screenshot",
  "arguments": {
    "componentName": "ExampleButton",
    "snapDOMOptions": {
      "scale": 3,
      "compress": true,
      "embedFonts": true
    }
  }
}
```

### 对比工具
```javascript
{
  "tool": "figma_compare",
  "arguments": {
    "componentName": "ExampleButton",
    "threshold": 0.1,
    "generateReport": true
  }
}
```

## 项目结构

```
├── src/
│   ├── components/
│   │   └── ExampleButton.vue
│   └── main.js
├── results/                 # MCP 工具输出
├── public/images/          # 静态图片资源
├── mcp-config.json         # MCP 配置
└── package.json
```

## 文档

- [MCP 集成指南](./MCP_INTEGRATION_GUIDE.md)
EOF

echo ""
echo "✅ 项目创建完成！"
echo "=================================================="
echo "📁 项目位置: $(pwd)"
echo "📚 下一步:"
echo "   1. cd $PROJECT_NAME"
echo "   2. npm install"
echo "   3. npm run dev"
echo "   4. npm run mcp (在新终端中)"
echo "=================================================="
