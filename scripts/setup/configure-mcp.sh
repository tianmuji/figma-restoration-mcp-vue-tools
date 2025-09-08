#!/bin/bash

# Figma Restoration MCP Vue Tools - MCP Configuration Script
# 自动配置MCP服务器，让用户无需手动配置

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# 获取项目根目录
PROJECT_ROOT=$(pwd)
CURSOR_CONFIG_DIR="$HOME/.cursor"

log_info "🚀 开始配置 Figma Restoration MCP Vue Tools..."

# 检查 Cursor 是否安装
if [ ! -d "$CURSOR_CONFIG_DIR" ]; then
    log_error "Cursor 未安装或配置目录不存在: $CURSOR_CONFIG_DIR"
    log_info "请先安装 Cursor IDE: https://cursor.sh/"
    exit 1
fi

# 创建项目级 MCP 配置
log_info "📁 创建项目级 MCP 配置..."

# 确保 .cursor 目录存在
mkdir -p "$PROJECT_ROOT/.cursor"

# 复制项目级配置到用户配置
log_info "📋 复制 MCP 配置到用户目录..."

# 备份现有配置
if [ -f "$CURSOR_CONFIG_DIR/mcp.json" ]; then
    log_info "💾 备份现有 MCP 配置..."
    cp "$CURSOR_CONFIG_DIR/mcp.json" "$CURSOR_CONFIG_DIR/mcp.json.backup.$(date +%Y%m%d_%H%M%S)"
fi

# 复制项目配置
cp "$PROJECT_ROOT/.cursor/mcp.json" "$CURSOR_CONFIG_DIR/mcp.json"

log_success "MCP 配置已复制到: $CURSOR_CONFIG_DIR/mcp.json"

# 创建环境变量文件
log_info "🔧 创建环境变量配置..."
cat > "$PROJECT_ROOT/.env.local" << EOF
# Figma Restoration MCP Vue Tools - 环境配置
# 此文件由 configure-mcp.sh 自动生成

# 项目根目录
PROJECT_ROOT=$PROJECT_ROOT

# MCP 服务器配置
MCP_SERVER_PATH=$PROJECT_ROOT/src/server.js
MCP_CONFIG_PATH=$PROJECT_ROOT/.cursor/mcp.json

# Figma API 配置 (可选)
# FIGMA_PERSONAL_ACCESS_TOKEN=your_token_here

# 开发环境配置
NODE_ENV=development
PUPPETEER_EXECUTABLE_PATH=""

# 自动批准的工具列表
AUTO_APPROVE_TOOLS="add_observations,delete_entities,read_graph,search_nodes,create_entities,create_relations,open_nodes"
EOF

log_success "环境变量文件已创建: $PROJECT_ROOT/.env.local"

# 创建快速启动脚本
log_info "⚡ 创建快速启动脚本..."
cat > "$PROJECT_ROOT/start-mcp.sh" << 'EOF'
#!/bin/bash
# Figma Restoration MCP Vue Tools - 快速启动脚本

echo "🚀 启动 Figma Restoration MCP Vue Tools..."

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装，请先安装 Node.js 18+"
    exit 1
fi

# 检查依赖
if [ ! -d "node_modules" ]; then
    echo "📦 安装依赖..."
    npm install
fi

# 启动 MCP 服务器
echo "🔧 启动 MCP 服务器..."
node src/server.js
EOF

chmod +x "$PROJECT_ROOT/start-mcp.sh"

# 创建验证脚本
log_info "🔍 创建配置验证脚本..."
cat > "$PROJECT_ROOT/verify-mcp-config.sh" << 'EOF'
#!/bin/bash
# MCP 配置验证脚本

echo "🔍 验证 MCP 配置..."

# 检查配置文件
if [ -f ".cursor/mcp.json" ]; then
    echo "✅ 项目级 MCP 配置存在"
else
    echo "❌ 项目级 MCP 配置缺失"
    exit 1
fi

if [ -f "$HOME/.cursor/mcp.json" ]; then
    echo "✅ 用户级 MCP 配置存在"
else
    echo "❌ 用户级 MCP 配置缺失"
    exit 1
fi

# 检查服务器文件
if [ -f "src/server.js" ]; then
    echo "✅ MCP 服务器文件存在"
else
    echo "❌ MCP 服务器文件缺失"
    exit 1
fi

# 检查依赖
if [ -d "node_modules" ]; then
    echo "✅ 依赖已安装"
else
    echo "⚠️  依赖未安装，运行: npm install"
fi

echo "🎉 MCP 配置验证完成！"
EOF

chmod +x "$PROJECT_ROOT/verify-mcp-config.sh"

# 更新 package.json 脚本
log_info "📝 更新 package.json 脚本..."
if [ -f "package.json" ]; then
    # 添加 MCP 相关脚本
    npm pkg set scripts."mcp:configure"="./scripts/setup/configure-mcp.sh"
    npm pkg set scripts."mcp:verify"="./verify-mcp-config.sh"
    npm pkg set scripts."mcp:start"="./start-mcp.sh"
    log_success "package.json 脚本已更新"
fi

# 创建使用说明
log_info "📚 创建使用说明..."
cat > "$PROJECT_ROOT/MCP-SETUP.md" << EOF
# 🚀 Figma Restoration MCP Vue Tools - 快速配置指南

## 自动配置 (推荐)

\`\`\`bash
# 1. 克隆项目
git clone <repository-url>
cd figma-restoration-mcp-vue-tools

# 2. 自动配置 MCP
npm run mcp:configure

# 3. 验证配置
npm run mcp:verify

# 4. 启动 MCP 服务器
npm run mcp:start
\`\`\`

## 手动配置

如果自动配置失败，可以手动配置：

### 1. 复制 MCP 配置
\`\`\`bash
# 复制项目配置到 Cursor
cp .cursor/mcp.json ~/.cursor/mcp.json
\`\`\`

### 2. 重启 Cursor IDE
配置完成后需要重启 Cursor IDE 才能生效。

### 3. 验证配置
\`\`\`bash
npm run mcp:verify
\`\`\`

## 可用的 MCP 工具

- **figma-context**: Figma 数据提取
- **figma-restoration-mcp-vue-tools**: 在线版本
- **figma-restoration-mcp-vue-tools-local**: 本地版本 (推荐)
- **memory**: 知识库管理

## 故障排除

### 问题: MCP 服务器无法启动
\`\`\`bash
# 检查 Node.js 版本
node --version  # 需要 18+

# 重新安装依赖
rm -rf node_modules package-lock.json
npm install
\`\`\`

### 问题: Cursor 无法识别 MCP 配置
1. 确保配置文件在正确位置: \`~/.cursor/mcp.json\`
2. 重启 Cursor IDE
3. 检查 Cursor 设置中的 MCP 选项是否启用

### 问题: 权限错误
\`\`\`bash
# 给脚本添加执行权限
chmod +x scripts/setup/configure-mcp.sh
chmod +x start-mcp.sh
chmod +x verify-mcp-config.sh
\`\`\`

## 支持

- 📖 文档: [README.md](./README.md)
- 🐛 问题: [GitHub Issues](https://github.com/tianmuji/figma-restoration-mcp-vue-tools/issues)
- 💬 讨论: [GitHub Discussions](https://github.com/tianmuji/figma-restoration-mcp-vue-tools/discussions)
EOF

log_success "使用说明已创建: MCP-SETUP.md"

# 最终验证
log_info "🔍 执行最终验证..."
if [ -f "$PROJECT_ROOT/.cursor/mcp.json" ] && [ -f "$CURSOR_CONFIG_DIR/mcp.json" ]; then
    log_success "🎉 MCP 配置完成！"
    echo ""
    echo "📋 配置摘要:"
    echo "   • 项目级配置: $PROJECT_ROOT/.cursor/mcp.json"
    echo "   • 用户级配置: $CURSOR_CONFIG_DIR/mcp.json"
    echo "   • 环境变量: $PROJECT_ROOT/.env.local"
    echo "   • 快速启动: npm run mcp:start"
    echo "   • 配置验证: npm run mcp:verify"
    echo ""
    echo "🚀 下一步:"
    echo "   1. 重启 Cursor IDE"
    echo "   2. 运行: npm run mcp:verify"
    echo "   3. 开始使用 MCP 工具！"
    echo ""
    log_info "📚 详细说明请查看: MCP-SETUP.md"
else
    log_error "配置过程中出现错误，请检查日志"
    exit 1
fi

