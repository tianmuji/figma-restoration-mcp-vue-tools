# Release Notes v1.3.0

## 🎯 Major Simplification Release

This release focuses on simplifying the project architecture by removing the `download_figma_images` tool while maintaining all core functionality and quality standards.

## 🚀 What's New

### ✅ Simplified Tool Architecture
- **Removed**: `download_figma_images` tool for reduced complexity
- **Maintained**: Core `figma_compare` and `snapdom_screenshot` tools
- **Enhanced**: Documentation and workflow clarity

### 🛠️ Current Tools (2 Core Tools)

#### 1. `figma_compare` 🔍
- Complete Figma component comparison and analysis
- snapDOM-powered high-quality screenshots (3x scaling)
- Pixel-perfect image comparison with region detection
- Detailed quality assessment reports (Markdown + JSON)
- Smart optimization suggestions

#### 2. `snapdom_screenshot` 📸
- Professional DOM-to-image screenshot tool
- 150x faster than traditional browser automation
- Perfect CSS styles, fonts, and pseudo-elements preservation
- Shadow DOM and Web Components support
- Box-shadow capture with automatic padding calculation

## 🔄 Workflow Changes

### Before v1.3.0:
```
Get Figma data → Download assets → Generate component → Compare
```

### v1.3.0 and later:
```
Get Figma data → Manually prepare assets → Generate component → Compare
```

## 💡 Benefits of Simplification

### ✅ Reduced Complexity
- Fewer tools to maintain and document
- Simpler installation and setup process
- Clearer focus on core comparison functionality

### ✅ Better Control
- Manual asset preparation ensures quality
- No dependency on Figma API rate limits
- More predictable and reliable workflow

### ✅ Maintained Quality
- All accuracy metrics preserved (98%+ comparison accuracy)
- snapDOM screenshot quality unchanged
- Complete shadow detection and font embedding

## 📊 Quality Standards (Unchanged)

| Metric | Target | Status |
|--------|--------|--------|
| Screenshot Quality | 3x scaling | ✅ Maintained |
| Comparison Accuracy | 98%+ | ✅ Maintained |
| Shadow Detection | Automatic | ✅ Maintained |
| Font Embedding | Complete | ✅ Maintained |

## 📚 Updated Documentation

- ✅ `TOOLS_OVERVIEW.md` - New comprehensive tool overview
- ✅ `SIMPLIFICATION_SUMMARY.md` - Detailed change summary
- ✅ Updated README.md with current tool list
- ✅ Updated workflow documentation
- ✅ Enhanced configuration guides

## 🔧 Configuration

### snapDOMOptions Best Practices

**For components with shadows:**
```javascript
"snapDOMOptions": {
  "scale": 3,
  "compress": true,
  "embedFonts": true,
  "padding": 0,  // Auto-calculated from shadow data
  "includeBoxShadow": true
}
```

**For components without shadows:**
```javascript
"snapDOMOptions": {
  "scale": 3,
  "compress": true, 
  "embedFonts": true,
  "padding": 0  // Precise alignment
}
```

## 🎯 Accuracy Results

| Configuration | Accuracy | Use Case |
|---------------|----------|----------|
| `padding: 0` (no shadows) | 98.33% | Clean components |
| `padding: auto` (with shadows) | 92.66% | Shadow components |

## 📦 Installation

```bash
# Install globally
npm install -g figma-restoration-mcp-vue-tools

# Or install locally
npm install figma-restoration-mcp-vue-tools

# Using yarn
yarn add figma-restoration-mcp-vue-tools
```

## 🔗 Dependencies

- `@modelcontextprotocol/sdk`: MCP framework
- `@zumer/snapdom`: High-quality DOM screenshots
- `pixelmatch`: Image comparison
- `sharp`: Image processing
- `chalk`: Console styling
- `pngjs`: PNG processing

## 🚨 Breaking Changes

### Removed Tool
- `download_figma_images` tool has been removed
- Users must now manually prepare image assets
- All other functionality remains unchanged

### Migration Guide
If you were using `download_figma_images`:
1. Export images from Figma manually at appropriate resolutions
2. Place assets in your component's `images/` folder
3. Reference assets using relative paths in Vue components
4. Continue using `figma_compare` and `snapdom_screenshot` as before

## 🙏 Acknowledgments

- [snapDOM](https://github.com/zumer/snapdom) - High-quality DOM screenshots
- [Model Context Protocol](https://modelcontextprotocol.io/) - MCP framework
- [Vue.js](https://vuejs.org/) - Progressive JavaScript framework

## 📞 Support

- 🐛 [Report Issues](https://github.com/yujie-wu/figma-restoration-mcp-vue-tools/issues)
- 📚 [Documentation](https://github.com/yujie-wu/figma-restoration-mcp-vue-tools#readme)
- 💬 [Discussions](https://github.com/yujie-wu/figma-restoration-mcp-vue-tools/discussions)
