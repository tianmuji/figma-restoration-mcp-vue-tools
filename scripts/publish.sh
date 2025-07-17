#!/bin/bash

# Figma Restoration MCP Vue Tools - 发布脚本
# 自动发布到 npm 和 GitHub 仓库

set -e

echo "🚀 Figma Restoration MCP Vue Tools - 发布脚本"
echo "=================================================="

# 检查是否在正确的目录
if [ ! -f "package.json" ]; then
    echo "❌ 错误: 请在项目根目录运行此脚本"
    exit 1
fi

# 检查是否已登录 npm
echo "📦 检查 npm 登录状态..."
if ! npm whoami > /dev/null 2>&1; then
    echo "❌ 请先登录 npm: npm login"
    exit 1
fi

# 检查 git 状态
echo "📋 检查 git 状态..."
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  工作目录有未提交的更改，是否继续? (y/N)"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        echo "❌ 发布已取消"
        exit 1
    fi
fi

# 获取当前版本
CURRENT_VERSION=$(node -p "require('./package.json').version")
echo "📌 当前版本: $CURRENT_VERSION"

# 询问新版本
echo "🔢 请选择版本更新类型:"
echo "1) patch (1.0.0 -> 1.0.1)"
echo "2) minor (1.0.0 -> 1.1.0)"  
echo "3) major (1.0.0 -> 2.0.0)"
echo "4) 自定义版本"

read -p "请选择 (1-4): " version_choice

case $version_choice in
    1)
        NEW_VERSION=$(npm version patch --no-git-tag-version)
        ;;
    2)
        NEW_VERSION=$(npm version minor --no-git-tag-version)
        ;;
    3)
        NEW_VERSION=$(npm version major --no-git-tag-version)
        ;;
    4)
        read -p "请输入新版本号: " custom_version
        NEW_VERSION=$(npm version $custom_version --no-git-tag-version)
        ;;
    *)
        echo "❌ 无效选择"
        exit 1
        ;;
esac

echo "✅ 版本已更新为: $NEW_VERSION"

# 运行测试
echo "🧪 运行测试..."
if ! npm test; then
    echo "❌ 测试失败，发布已取消"
    exit 1
fi

# 构建项目
echo "🔨 构建项目..."
if ! npm run build; then
    echo "❌ 构建失败，发布已取消"
    exit 1
fi

# Git 提交和标签
echo "📝 提交更改到 git..."
git add .
git commit -m "chore: release $NEW_VERSION

- Updated package version to $NEW_VERSION
- Ready for npm publication
- All tests passing"

git tag -a "$NEW_VERSION" -m "Release $NEW_VERSION"

# 推送到 GitHub
echo "⬆️  推送到 GitHub..."
git push origin main
git push origin "$NEW_VERSION"

# 发布到 npm
echo "📦 发布到 npm..."
if npm publish --access public; then
    echo "✅ 成功发布到 npm!"
    echo "📦 包名: @figma-restoration/mcp-vue-tools"
    echo "🔢 版本: $NEW_VERSION"
    echo "🔗 npm: https://www.npmjs.com/package/@figma-restoration/mcp-vue-tools"
else
    echo "❌ npm 发布失败"
    exit 1
fi

echo ""
echo "🎉 发布完成!"
echo "=================================================="
echo "📦 npm 包: @figma-restoration/mcp-vue-tools@$NEW_VERSION"
echo "🔗 GitHub: https://github.com/yujie-wu/figma-restoration-mcp-vue-tools"
echo "📚 安装命令: npm install @figma-restoration/mcp-vue-tools"
echo "=================================================="
