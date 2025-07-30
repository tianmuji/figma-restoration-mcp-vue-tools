#!/bin/bash

set -e

echo "🚀 Starting release process for v4.1.0..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Check if git working directory is clean
if [ -n "$(git status --porcelain)" ]; then
    echo "❌ Error: Git working directory is not clean. Please commit or stash your changes."
    exit 1
fi

echo "✅ Git working directory is clean"

# Verify package.json version
PACKAGE_VERSION=$(node -p "require('./package.json').version")
echo "📦 Current package version: $PACKAGE_VERSION"

if [ "$PACKAGE_VERSION" != "4.1.0" ]; then
    echo "❌ Error: Package version is not 4.1.0. Please update package.json."
    exit 1
fi

# Run tests
echo "🧪 Running tests..."
npm test || {
    echo "❌ Tests failed. Please fix them before releasing."
    exit 1
}

echo "✅ Tests passed"

# Build if needed
echo "🔨 Building project..."
npm run build || echo "ℹ️  No build step configured"

# Verify installation works
echo "🔍 Verifying installation..."
npm pack --dry-run > /dev/null || {
    echo "❌ npm pack failed"
    exit 1
}

echo "✅ Package structure verified"

# Tag the release
echo "🏷️  Creating git tag..."
git tag -a "v4.1.0" -m "Release version 4.1.0

🚀 What's New in v4.1.0:
- ✅ Zero-Configuration Browser Setup
- ✅ Local-Only Dependencies  
- ✅ Enhanced snapDOM Integration
- ✅ Improved Error Handling
- ✅ Cleaner Dependencies

See CHANGELOG.md for full details."

echo "✅ Git tag created"

# Push to GitHub
echo "📤 Pushing to GitHub..."
git push origin main --tags

echo "✅ Pushed to GitHub"

# Publish to npm
echo "📦 Publishing to npm..."
npm publish --access public

echo "✅ Published to npm"

echo ""
echo "🎉 Release v4.1.0 completed successfully!"
echo ""
echo "📝 Next steps:"
echo "   1. Update GitHub release notes: https://github.com/tianmuji/figma-restoration-mcp-vue-tools/releases"
echo "   2. Announce the release to users"
echo "   3. Update documentation if needed"
echo ""
echo "🔗 Package URL: https://www.npmjs.com/package/figma-restoration-mcp-vue-tools" 