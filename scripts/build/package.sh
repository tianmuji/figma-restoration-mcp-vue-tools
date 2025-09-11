#!/bin/bash

# Figma Restoration Kit v2.1.0 Packaging Script
# This script packages the enhanced MCP tools for distribution

set -e

echo "📦 Figma Restoration Kit v2.1.0 Packaging"
echo "=========================================="

# Get current directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
PACKAGE_DIR="$PROJECT_DIR/dist"

echo "📁 Project directory: $PROJECT_DIR"
echo "📦 Package directory: $PACKAGE_DIR"

# Clean previous builds
echo ""
echo "🧹 Cleaning previous builds..."
rm -rf "$PACKAGE_DIR"
mkdir -p "$PACKAGE_DIR"

# Create package structure
echo ""
echo "📁 Creating package structure..."
mkdir -p "$PACKAGE_DIR/figma-restoration-kit"

# Copy core files
echo ""
echo "📋 Copying core files..."
cp -r "$PROJECT_DIR/src" "$PACKAGE_DIR/figma-restoration-kit/"
cp -r "$PROJECT_DIR/config" "$PACKAGE_DIR/figma-restoration-kit/"
cp -r "$PROJECT_DIR/docs" "$PACKAGE_DIR/figma-restoration-kit/"
cp -r "$PROJECT_DIR/scripts" "$PACKAGE_DIR/figma-restoration-kit/"
cp -r "$PROJECT_DIR/examples" "$PACKAGE_DIR/figma-restoration-kit/"

# Copy documentation
cp "$PROJECT_DIR/README.md" "$PACKAGE_DIR/figma-restoration-kit/"
cp "$PROJECT_DIR/CHANGELOG.md" "$PACKAGE_DIR/figma-restoration-kit/"
cp "$PROJECT_DIR/LICENSE" "$PACKAGE_DIR/figma-restoration-kit/"
cp "$PROJECT_DIR/package.json" "$PACKAGE_DIR/figma-restoration-kit/"
cp "$PROJECT_DIR/test-installation.js" "$PACKAGE_DIR/figma-restoration-kit/"

# Copy Vue configuration files
cp "$PROJECT_DIR/vite.config.js" "$PACKAGE_DIR/figma-restoration-kit/"
cp "$PROJECT_DIR/index.html" "$PACKAGE_DIR/figma-restoration-kit/"

# Create results directory structure
mkdir -p "$PACKAGE_DIR/figma-restoration-kit/results"
echo "# Results Directory" > "$PACKAGE_DIR/figma-restoration-kit/results/README.md"
echo "This directory will contain component analysis results." >> "$PACKAGE_DIR/figma-restoration-kit/results/README.md"

# Copy sample results (if any exist)
if [ -d "$PROJECT_DIR/results" ]; then
    echo "📊 Copying sample results..."
    # Copy only a few example results to keep package size reasonable
    for dir in "$PROJECT_DIR/results"/*; do
        if [ -d "$dir" ]; then
            dirname=$(basename "$dir")
            if [[ "$dirname" == "ExchangeSuccess" || "$dirname" == "ScanResult" ]]; then
                echo "   Copying $dirname..."
                cp -r "$dir" "$PACKAGE_DIR/figma-restoration-kit/results/"
            fi
        fi
    done
fi

# Run tests to ensure everything works
echo ""
echo "🧪 Running tests..."
cd "$PACKAGE_DIR/figma-restoration-kit"
npm test

# Create installation guide
echo ""
echo "📖 Creating installation guide..."
cat > "$PACKAGE_DIR/figma-restoration-kit/INSTALL.md" << 'EOF'
# Figma Restoration Kit v2.1.0 Installation Guide

## Quick Installation

1. **Extract the package**:
   ```bash
   tar -xzf figma-restoration-kit-v2.1.0.tar.gz
   cd figma-restoration-kit
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run tests**:
   ```bash
   npm test
   ```

4. **Start MCP server**:
   ```bash
   npm run mcp
   ```

## Integration with Existing Project

1. **Copy to your project**:
   ```bash
   cp -r figma-restoration-kit /path/to/your/project/
   ```

2. **Add to .cursorrules**:
   ```
   # Figma Restoration Kit
   - Use MCP tools for Figma component restoration
   - Follow debugging principles: Material > Layout > Font
   - Prefer background images over complex CSS structures
   ```

3. **Configure MCP client** (if using with Cursor/Claude):
   Add to your MCP configuration:
   ```json
   {
     "mcpServers": {
       "figma-restoration-kit": {
         "command": "node",
         "args": ["/path/to/figma-restoration-kit/src/server.js"]
       }
     }
   }
   ```

## New Features in v2.1.0

### Enhanced MCP Tools
- `enhanced_compare_images`: Advanced debugging and analysis
- `figma_diff_analyzer`: Complete restoration workflow

### Debugging Principles
1. **Large area differences** → Material issues (High priority)
2. **Normal element differences** → Layout issues (Medium priority)
3. **Font differences** → Ignorable (Low priority)

### Quality Standards
- **99%+**: Perfect level
- **97-99%**: Excellent level (Production ready) ✨
- **95-97%**: Good level
- **90-95%**: Needs improvement
- **<90%**: Poor level (Check materials)

## Support

- **Documentation**: README.md, CHANGELOG.md
- **Examples**: /examples directory
- **Issues**: Check debugging principles in docs/
EOF

# Create version info
echo ""
echo "📋 Creating version info..."
cat > "$PACKAGE_DIR/figma-restoration-kit/VERSION" << EOF
Figma Restoration Kit v2.1.0
Build Date: $(date)
Features: Enhanced debugging, Smart analysis, Intelligent fixes
Compatibility: MCP 0.4.0+, Vue 3.4+, Node.js 18+
EOF

# Create archive
echo ""
echo "📦 Creating archive..."
cd "$PACKAGE_DIR"
tar -czf "figma-restoration-kit-v2.1.0.tar.gz" figma-restoration-kit/

# Calculate size
ARCHIVE_SIZE=$(du -h "figma-restoration-kit-v2.1.0.tar.gz" | cut -f1)

echo ""
echo "✅ Package created successfully!"
echo "📦 Archive: $PACKAGE_DIR/figma-restoration-kit-v2.1.0.tar.gz"
echo "📏 Size: $ARCHIVE_SIZE"
echo ""
echo "🚀 Ready for distribution!"
echo ""
echo "📋 Package contents:"
echo "   - Enhanced MCP tools with debugging features"
echo "   - Complete documentation and examples"
echo "   - Installation and integration guides"
echo "   - Sample component results"
echo "   - Automated testing suite"
echo ""
echo "🎯 Key improvements in v2.1.0:"
echo "   - Three-priority debugging system"
echo "   - Intelligent diff analysis"
echo "   - Smart fix suggestions"
echo "   - Enhanced reporting"
echo "   - ExchangeSuccess case study validation"
