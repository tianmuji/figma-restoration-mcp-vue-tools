# figma-restoration-mcp-vue-tools

[![npm version](https://badge.fury.io/js/figma-restoration-mcp-vue-tools.svg)](https://badge.fury.io/js/figma-restoration-mcp-vue-tools)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)

Professional Figma component restoration toolkit with snapDOM-powered high-quality screenshots, intelligent shadow detection, and smart debugging for Vue component restoration.

## 🚀 Quick Start

### Installation

```bash
# Install via npm (recommended)
npm install -g figma-restoration-mcp-vue-tools

# Or install locally in your project
npm install figma-restoration-mcp-vue-tools

# Using yarn
yarn global add figma-restoration-mcp-vue-tools
# or
yarn add figma-restoration-mcp-vue-tools
```

> **✅ No More Installation Issues!** Version 1.0.4+ automatically handles Puppeteer configuration and prevents download issues. The package will automatically configure itself during installation.

### Basic Usage

```bash
# Initialize in your Vue project
npx figma-restoration-mcp-vue-tools init

# Install Puppeteer safely (optional, for screenshot features)
npx figma-restoration-mcp-vue-tools install-puppeteer

# Start the MCP server
npx figma-restoration-mcp-vue-tools start
```

## ✨ Key Features

### 🎯 Smart Shadow Detection
- **Automatic Shadow Calculation**: Intelligently calculates padding based on Figma shadow data
- **No Fixed Values**: Dynamic padding calculation prevents hardcoded values
- **98%+ Accuracy**: Achieves high restoration accuracy with proper shadow capture

### 📸 High-Quality Screenshots
- **snapDOM Integration**: Professional DOM-to-image capture with 3x scaling
- **Shadow Support**: Proper box-shadow rendering and capture
- **Font Embedding**: Consistent typography across different environments

### 🔍 Intelligent Comparison
- **Pixel-Perfect Analysis**: Advanced image comparison with region detection
- **Smart Debugging**: Three-tier priority system for issue resolution
- **Quality Assessment**: Five-level quality grading system

### 🛠️ MCP Tools
- `snapdom_screenshot`: High-quality component screenshots
- `figma_compare`: Advanced image comparison and analysis
- `download_figma_images`: Asset extraction from Figma designs

## 📖 Documentation

### snapDOM Screenshot Tool

```javascript
{
  "tool": "snapdom_screenshot",
  "arguments": {
    "componentName": "MyComponent",
    "snapDOMOptions": {
      "scale": 3,
      "compress": true,
      "embedFonts": true,
      "includeBoxShadow": true,
      "padding": 0  // Auto-calculated for shadows
    }
  }
}
```

### Figma Comparison Tool

```javascript
{
  "tool": "figma_compare", 
  "arguments": {
    "componentName": "MyComponent",
    "generateReport": true,
    "threshold": 0.1
  }
}
```

## 🔧 Configuration

### snapDOMOptions Best Practices

For components **with shadows**:
```javascript
"snapDOMOptions": {
  "scale": 3,
  "compress": true,
  "embedFonts": true,
  "padding": 0,  // Will auto-calculate from shadow data
  "figmaEffects": [...]  // Pass Figma shadow data
}
```

For components **without shadows**:
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
| `padding: fixed` | ❌ Not recommended | Hardcoded values |

## 📚 Advanced Usage

### Custom Shadow Calculation

```javascript
// Automatic shadow padding calculation
const figmaEffects = [
  {"type": "DROP_SHADOW", "offset": {"x": 0, "y": 5}, "radius": 30, "spread": 0},
  {"type": "DROP_SHADOW", "offset": {"x": 0, "y": 2}, "radius": 8, "spread": 0}
];

// Tool automatically calculates: padding = max(blur + spread + offset) + buffer
```

### Quality Assessment

- 🎯 **Perfect** (99%+): Production ready
- ✅ **Excellent** (95-99%): Minor adjustments needed  
- 👍 **Good** (90-95%): Optimization required
- ⚠️ **Needs Improvement** (<90%): Major fixes needed

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- [GitHub Repository](https://github.com/yujie-wu/figma-restoration-mcp-vue-tools)
- [npm Package](https://www.npmjs.com/package/@figma-restoration/mcp-vue-tools)
- [Documentation](https://github.com/yujie-wu/figma-restoration-mcp-vue-tools#readme)
- [Issues](https://github.com/yujie-wu/figma-restoration-mcp-vue-tools/issues)

## 🙏 Acknowledgments

- [snapDOM](https://github.com/zumer/snapdom) - High-quality DOM screenshots
- [Model Context Protocol](https://modelcontextprotocol.io/) - MCP framework
- [Vue.js](https://vuejs.org/) - Progressive JavaScript framework
