#!/bin/bash

# Verification Script for figma-restoration-mcp-vue-tools GitHub Setup
# Run this after creating the GitHub repository and pushing code

set -e

echo "🔍 Verifying figma-restoration-mcp-vue-tools Setup"
echo "================================================="

# Check local setup
echo ""
echo "📁 Local Repository Check:"
echo "  Directory: $(pwd)"
echo "  Package: $(node -p "require('./package.json').name")"
echo "  Version: $(node -p "require('./package.json').version")"

# Check git configuration
echo ""
echo "🔧 Git Configuration:"
git remote -v
echo "  Current branch: $(git branch --show-current)"
echo "  Latest commit: $(git log --oneline -1)"

# Check tags
echo ""
echo "🏷️  Git Tags:"
git tag -l | head -5

# Check GitHub repository
echo ""
echo "🌐 GitHub Repository Check:"
REPO_URL="https://api.github.com/repos/yujie-wu/figma-restoration-mcp-vue-tools"

if curl -s "$REPO_URL" | grep -q '"name"'; then
    echo "  ✅ Repository exists on GitHub"
    
    # Get repository info
    REPO_INFO=$(curl -s "$REPO_URL")
    echo "  📊 Stars: $(echo "$REPO_INFO" | grep -o '"stargazers_count":[0-9]*' | cut -d':' -f2)"
    echo "  🍴 Forks: $(echo "$REPO_INFO" | grep -o '"forks_count":[0-9]*' | cut -d':' -f2)"
    echo "  📝 Description: $(echo "$REPO_INFO" | grep -o '"description":"[^"]*' | cut -d'"' -f4)"
    
    # Check if README exists
    if curl -s "https://raw.githubusercontent.com/yujie-wu/figma-restoration-mcp-vue-tools/main/README.md" | grep -q "figma-restoration-mcp-vue-tools"; then
        echo "  ✅ README.md accessible"
    else
        echo "  ❌ README.md not accessible"
    fi
    
else
    echo "  ❌ Repository not found on GitHub"
    echo "  💡 Create repository at: https://github.com/new"
fi

# Check npm package
echo ""
echo "📦 npm Package Check:"
if npm info figma-restoration-mcp-vue-tools >/dev/null 2>&1; then
    echo "  ✅ Package exists on npm"
    NPM_VERSION=$(npm info figma-restoration-mcp-vue-tools version)
    echo "  🔢 npm version: $NPM_VERSION"
    echo "  🔗 npm URL: https://www.npmjs.com/package/figma-restoration-mcp-vue-tools"
else
    echo "  ❌ Package not found on npm"
fi

# Test CLI installation
echo ""
echo "🖥️  CLI Test:"
if command -v npx >/dev/null 2>&1; then
    echo "  ✅ npx available"
    echo "  💡 Test command: npx figma-restoration-mcp-vue-tools help"
else
    echo "  ❌ npx not available"
fi

# File structure check
echo ""
echo "📋 File Structure Check:"
REQUIRED_FILES=(
    "README.md"
    "package.json"
    "LICENSE"
    "src/server.js"
    "bin/cli.js"
    "src/tools/snapdom-screenshot.js"
    "src/tools/figma-compare.js"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✅ $file"
    else
        echo "  ❌ $file (missing)"
    fi
done

# Summary
echo ""
echo "📊 Setup Summary:"
echo "  📦 Package: figma-restoration-mcp-vue-tools"
echo "  🔢 Version: $(node -p "require('./package.json').version")"
echo "  🔗 GitHub: https://github.com/yujie-wu/figma-restoration-mcp-vue-tools"
echo "  📚 npm: https://www.npmjs.com/package/figma-restoration-mcp-vue-tools"

echo ""
echo "🎉 Verification completed!"
echo ""
echo "📋 Next Steps:"
echo "  1. Visit your GitHub repository to verify files are uploaded"
echo "  2. Add repository description and topics on GitHub"
echo "  3. Test installation: npm install -g figma-restoration-mcp-vue-tools"
echo "  4. Test CLI: npx figma-restoration-mcp-vue-tools help"
