#!/bin/bash

# GitHub Repository Setup Script for figma-restoration-mcp-vue-tools
# This script connects your local repository to GitHub and pushes all content

set -e

echo "🚀 Setting up GitHub repository for figma-restoration-mcp-vue-tools"
echo "=================================================================="

# Check if we're in the correct directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    echo "Expected location: /Users/yujie_wu/Documents/work/camscanner-cloud-vue3/figma-restoration-mcp-vue-tools"
    exit 1
fi

# Verify package name
PACKAGE_NAME=$(node -p "require('./package.json').name")
if [ "$PACKAGE_NAME" != "figma-restoration-mcp-vue-tools" ]; then
    echo "❌ Error: Wrong package. Expected 'figma-restoration-mcp-vue-tools', got '$PACKAGE_NAME'"
    exit 1
fi

echo "✅ Verified: In correct directory with correct package"

# Check git status
echo ""
echo "📋 Checking git status..."
git status --porcelain

# Add remote repository
echo ""
echo "🔗 Adding GitHub remote repository..."
if git remote get-url origin >/dev/null 2>&1; then
    echo "⚠️  Remote 'origin' already exists. Removing and re-adding..."
    git remote remove origin
fi

git remote add origin https://github.com/yujie-wu/figma-restoration-mcp-vue-tools.git
echo "✅ Added remote: https://github.com/yujie-wu/figma-restoration-mcp-vue-tools.git"

# Verify remote
echo ""
echo "🔍 Verifying remote configuration..."
git remote -v

# Set main branch
echo ""
echo "🌿 Setting up main branch..."
git branch -M main

# Push main branch
echo ""
echo "⬆️  Pushing main branch to GitHub..."
git push -u origin main

# Push all tags
echo ""
echo "🏷️  Pushing all tags to GitHub..."
git push origin --tags

# Verify push
echo ""
echo "✅ Repository setup completed successfully!"
echo ""
echo "📊 Repository Information:"
echo "  📦 Package: figma-restoration-mcp-vue-tools@$(node -p "require('./package.json').version")"
echo "  🔗 GitHub: https://github.com/yujie-wu/figma-restoration-mcp-vue-tools"
echo "  📚 npm: https://www.npmjs.com/package/figma-restoration-mcp-vue-tools"
echo ""
echo "🎉 Your repository is now live on GitHub!"
