# Figma Restoration MCP Vue Tools

[![npm version](https://badge.fury.io/js/figma-restoration-mcp-vue-tools.svg)](https://badge.fury.io/js/figma-restoration-mcp-vue-tools)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)

🛠️ **Professional Figma Component Restoration Kit** - A comprehensive MCP (Model Context Protocol) server for Vue component development and Figma design restoration. Features snapDOM-powered high-quality screenshots, intelligent visual comparison, and automated SVG optimization with **zero-configuration browser setup**.

## 🚀 What's New in v4.2.0

- ✅ **Simplified Puppeteer Integration**: Now uses bundled Chromium automatically - no Chrome installation required
- ✅ **Enhanced Error Handling**: Intelligent error classification with specific solution suggestions
- ✅ **Performance Optimization**: Browser instance reuse and page pooling for faster operations
- ✅ **Zero Configuration**: Completely eliminated complex browser path detection and configuration files
- ✅ **Cross-Platform Reliability**: Guaranteed compatibility across macOS, Linux, and Windows

## 🌟 Features

- **🎯 High-Quality Screenshots**: snapDOM technology with 3x scaling, font embedding, and intelligent shadow detection
- **🔍 Advanced Visual Comparison**: Pixel-perfect analysis with smart difference detection and quality assessment  
- **🎨 SVG Optimization**: Built-in SVGO integration with customizable configuration
- **🤖 MCP Integration**: Seamless integration with AI coding assistants (Cursor, Claude, etc.)
- **🔧 Zero Configuration**: Automatic browser installation and dependency management
- **🛡️ Security First**: No external CDN dependencies, all assets served locally

## 📦 Quick Start

### 🌐 Remote Version (Recommended)

The simplest way to get started - zero configuration required!

**Step 1**: Add the MCP server to your Cursor configuration (`~/.cursor/mcp.json`):

```json
{
  "mcpServers": {
    "figma-restoration-mcp-vue-tools": {
      "command": "npx",
      "args": [
        "-y",
        "figma-restoration-mcp-vue-tools@^4.2.0",
        "start"
      ],
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
```

**Step 2**: **Restart Cursor** after adding the configuration.

**Step 3**: Ready to use! The package automatically:
- Downloads and uses Puppeteer's bundled Chromium
- Sets up all dependencies with zero configuration
- Provides intelligent error handling with solution suggestions

**Step 4**: Use the MCP tools in Cursor:
- `figma_compare` - Compare components with Figma designs
- `snapdom_screenshot` - Take high-quality component screenshots  
- `optimize_svg` - Optimize SVG assets

### 🔧 Local Development Version

For contributors or advanced users who need to modify the source code:

**Step 1**: Clone and setup the repository:

```bash
git clone https://github.com/tianmuji/figma-restoration-mcp-vue-tools.git
cd figma-restoration-mcp-vue-tools
npm install

# Puppeteer with bundled Chromium is automatically installed
# No browser configuration needed!
```

**Step 2**: Add the local MCP server to your Cursor configuration:

```json
{
  "mcpServers": {
    "figma-restoration-mcp-vue-tools": {
      "command": "node",
      "args": [
        "/absolute/path/to/figma-restoration-mcp-vue-tools/src/server.js"
      ],
      "cwd": "/absolute/path/to/figma-restoration-mcp-vue-tools",
      "env": {
        "NODE_ENV": "development"
      }
    }
  }
}
```

## 🛠️ MCP Tools

### figma_compare

Advanced component comparison tool that analyzes differences between expected and actual screenshots.

**Parameters:**
```json
{
  "tool": "figma_compare",
  "arguments": {
    "componentName": "MyComponent",
    "projectPath": "/path/to/your/vue/project",
    "threshold": 0.1,
    "outputPath": "/custom/output/directory"
  }
}
```

**Features:**
- Pixel-perfect difference detection
- Quality assessment scoring  
- Detailed analysis reports (JSON & Markdown)
- Customizable comparison threshold
- Smart region-based analysis

### snapdom_screenshot

High-quality DOM screenshot tool using snapDOM technology for precise component capture.

**Parameters:**
```json
{
  "tool": "snapdom_screenshot", 
  "arguments": {
    "componentName": "MyComponent",
    "projectPath": "/path/to/your/vue/project",
    "port": 3000,
    "viewport": {
      "width": 1440,
      "height": 800
    },
    "snapDOMOptions": {
      "scale": 3,
      "compress": true,
      "embedFonts": true,
      "backgroundColor": "transparent"
    },
    "outputPath": "/custom/output/path.png"
  }
}
```

**Features:**
- 3x scaling for high-resolution output
- Intelligent shadow and effect capture with auto-padding calculation
- Font embedding support with local fallbacks
- Transparent background support
- Custom viewport and output settings
- Smart element detection and targeting

### optimize_svg

SVG optimization tool powered by SVGO with customizable configuration.

**Parameters:**
```json
{
  "tool": "optimize_svg",
  "arguments": {
    "inputPath": "/path/to/input.svg",
    "outputPath": "/path/to/optimized.svg",
    "svgoConfig": {
      "plugins": ["preset-default"],
      "multipass": true,
      "floatPrecision": 2
    }
  }
}
```

**Features:**
- Advanced SVG optimization with size reduction reports
- Customizable SVGO configuration
- Batch processing support  
- Preservation of important metadata

## ⚙️ Configuration

### Environment Variables

- `NODE_ENV`: Environment mode (development/production)

> 🎉 **Zero configuration required!** Puppeteer automatically uses its bundled Chromium - no browser installation or path configuration needed.

### Deprecated Environment Variables

The following environment variables are no longer needed and will be ignored:
- ~~`PUPPETEER_EXECUTABLE_PATH`~~ - Puppeteer now uses bundled Chromium
- ~~`CHROME_EXECUTABLE_PATH`~~ - No longer required
- ~~`PUPPETEER_SKIP_CHROMIUM_DOWNLOAD`~~ - Handled automatically

If you have these set, you'll see a warning message during installation, but they won't affect functionality.

### Shadow Detection & Smart Padding

For components with shadows, the tool automatically calculates optimal padding based on CSS box-shadow or Figma effect data:

```json
{
  "snapDOMOptions": {
    "scale": 3,
    "padding": 0,
    "figmaEffects": [
      {
        "type": "DROP_SHADOW", 
        "offset": {"x": 0, "y": 5}, 
        "radius": 30, 
        "spread": 0
      }
    ]
  }
}
```

### Comparison Thresholds

| Threshold | Sensitivity | Use Case | Match Quality |
|-----------|-------------|----------|---------------|
| 0.0-0.02  | Ultra Strict | Pixel-perfect matching | 98-100% |
| 0.02-0.05 | Very Strict | High-quality components | 95-98% |
| 0.05-0.1  | Strict      | Production components | 90-95% |
| 0.1-0.2   | Moderate    | General comparison | 80-90% |
| 0.2+      | Loose       | Rough similarity check | <80% |

## 🎯 Typical Workflow

1. **Setup**: Configure MCP server in Cursor (automatic browser installation)
2. **Extract**: Fetch Figma component data and assets
3. **Screenshot**: Use `snapdom_screenshot` to capture component with optimal settings
4. **Compare**: Use `figma_compare` to analyze pixel differences and quality
5. **Optimize**: Use `optimize_svg` for asset optimization and size reduction
6. **Iterate**: Refine component based on detailed analysis results

## 🚀 Performance Features

- **🔄 Smart Caching**: Reuses browser instances for better performance
- **⚡ Timeout Management**: Intelligent timeout handling with fallbacks
- **🎯 Precise Targeting**: Advanced element selector strategies
- **📦 Local Assets**: All dependencies served locally for faster loading
- **🛡️ Error Recovery**: Robust error handling and retry mechanisms

## 📋 Requirements

- **Node.js**: ≥ 18.0.0
- **npm**: ≥ 8.0.0
- **Vue.js project**: For component restoration (Vue 3 recommended)
- **MCP-compatible client**: Cursor IDE, Claude Desktop, etc.

> 📝 **Note**: No browser installation required! Puppeteer automatically downloads and uses its bundled Chromium.

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes and test thoroughly
4. Commit your changes (`git commit -m 'Add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request with detailed description

### Development Setup

```bash
git clone https://github.com/tianmuji/figma-restoration-mcp-vue-tools.git
cd figma-restoration-mcp-vue-tools
npm install
npm run dev  # Start development server
npm test     # Run tests
```

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **GitHub**: [tianmuji/figma-restoration-mcp-vue-tools](https://github.com/tianmuji/figma-restoration-mcp-vue-tools)
- **npm**: [figma-restoration-mcp-vue-tools](https://www.npmjs.com/package/figma-restoration-mcp-vue-tools)
- **Issues**: [Report bugs & feature requests](https://github.com/tianmuji/figma-restoration-mcp-vue-tools/issues)
- **Discussions**: [Community discussions](https://github.com/tianmuji/figma-restoration-mcp-vue-tools/discussions)

## 🙏 Acknowledgments

- **[snapDOM](https://github.com/zumer/snapdom)**: High-quality DOM-to-image conversion
- **[Model Context Protocol](https://modelcontextprotocol.io/)**: MCP framework for AI integration
- **[Vue.js](https://vuejs.org/)**: Progressive JavaScript framework
- **[SVGO](https://github.com/svg/svgo)**: SVG optimization library
- **[Puppeteer](https://pptr.dev/)**: Browser automation platform

## 📈 Version History

### v4.2.0 (Latest)
- ✅ **Simplified Puppeteer Integration**: Uses bundled Chromium automatically
- ✅ **Enhanced Error Handling**: Intelligent error classification with specific solutions
- ✅ **Performance Optimization**: Browser instance reuse and page pooling
- ✅ **Zero Configuration**: Eliminated browser path detection and config files
- ✅ **Cross-Platform Reliability**: Guaranteed compatibility across all platforms

### v4.1.0
- ✅ Zero-configuration browser setup
- ✅ Enhanced security with local-only dependencies  
- ✅ Improved performance and error handling
- ✅ Better snapDOM integration
- ✅ Cleaner package structure

### v4.0.0
- 🎯 snapDOM integration for high-quality screenshots
- 🔍 Advanced visual comparison tools
- 🎨 Built-in SVG optimization
- 🤖 Full MCP integration

---

🎨 **Built for developers who demand pixel-perfect component restoration** 🎨

*Automate your design-to-code workflow with confidence.*
