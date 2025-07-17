#!/bin/bash

# Figma Restoration MCP 启动脚本
# 用于快速启动 MCP 服务器

echo "🚀 启动 Figma Restoration MCP 服务器..."
echo "=================================================="

# 检查是否安装了包
if ! command -v figma-restoration-mcp-vue-tools &> /dev/null; then
    echo "❌ figma-restoration-mcp-vue-tools 未安装"
    echo "请运行: npm install -g figma-restoration-mcp-vue-tools"
    exit 1
fi

# 检查 Chrome 是否存在
CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
if [ ! -f "$CHROME_PATH" ]; then
    echo "⚠️  Chrome 未找到在标准位置: $CHROME_PATH"
    echo "请确认 Chrome 已安装或更新配置文件中的路径"
fi

# 设置环境变量
export PUPPETEER_EXECUTABLE_PATH="$CHROME_PATH"
export NODE_ENV="production"

echo "✅ 环境配置完成"
echo "📍 Chrome 路径: $CHROME_PATH"
echo "🔧 Node 环境: $NODE_ENV"
echo ""

# 启动 MCP 服务器
echo "🎯 启动 MCP 服务器..."
npx figma-restoration-mcp-vue-tools start

echo ""
echo "🎉 MCP 服务器已启动！"
echo "=================================================="
echo "📚 使用指南: ./MCP_INTEGRATION_GUIDE.md"
echo "🛠️  可用工具: figma_compare, snapdom_screenshot"
echo "=================================================="
