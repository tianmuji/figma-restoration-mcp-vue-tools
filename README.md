# Figma Restoration MCP Vue Tools

[![npm version](https://badge.fury.io/js/figma-restoration-mcp-vue-tools.svg)](https://badge.fury.io/js/figma-restoration-mcp-vue-tools)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)

🛠️ Professional Figma Component Restoration Kit - A comprehensive MCP (Model Context Protocol) server for Vue component development and Figma design restoration. Features snapDOM-powered high-quality screenshots, intelligent visual comparison, and automated SVG optimization.

## 🚀 Features

- **🎯 High-Quality Screenshots**: snapDOM technology with 3x scaling, font embedding, and intelligent shadow detection
- **🔍 Advanced Visual Comparison**: Pixel-perfect analysis with smart difference detection and quality assessment  
- **🎨 SVG Optimization**: Built-in SVGO integration with customizable configuration
- **🤖 MCP Integration**: Seamless integration with AI coding assistants (Cursor, Claude, etc.)

## 📦 Quick Start

### 🌐 Remote Version (Recommended)

Use the published npm package for easy setup and automatic updates:

**Step 1**: Add the MCP server to your Cursor configuration (`~/.cursor/mcp.json`):

```json
{
  "mcpServers": {
    "figma-restoration-mcp-vue-tools": {
      "command": "npx",
      "args": [
        "-y",
        "figma-restoration-mcp-vue-tools",
        "start"
      ],
      "env": {
        "PUPPETEER_EXECUTABLE_PATH": "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
        "NODE_ENV": "production"
      }
    }
  }
}
```

**Step 2**: **Restart Cursor** after adding the configuration.

**Step 3**: Use the MCP tools in Cursor:
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
        "PUPPETEER_EXECUTABLE_PATH": "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
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
      "backgroundColor": "transparent",
      "padding": 0
    },
    "outputPath": "/custom/output/path.png"
  }
}
```

**Features:**
- 3x scaling for high-resolution output
- Intelligent shadow and effect capture
- Font embedding support
- Transparent background support
- Custom viewport and output settings

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
- Advanced SVG optimization
- Customizable SVGO configuration
- Batch processing support
- Size reduction reports

## ⚙️ Configuration

### Environment Variables

- `PUPPETEER_EXECUTABLE_PATH`: Path to Chrome/Chromium executable
- `NODE_ENV`: Environment mode (development/production)

### Shadow Detection

For components with shadows, the tool automatically calculates optimal padding based on effect data:

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

| Threshold | Sensitivity | Use Case |
|-----------|-------------|----------|
| 0.0-0.05  | Very Strict | Pixel-perfect matching |
| 0.05-0.1  | Strict      | High-quality components |
| 0.1-0.2   | Moderate    | General comparison |
| 0.2+      | Loose       | Rough similarity check |

## 🎯 Typical Workflow

1. **Setup**: Configure MCP server in Cursor
2. **Screenshot**: Use `snapdom_screenshot` to capture component
3. **Compare**: Use `figma_compare` to analyze differences
4. **Optimize**: Use `optimize_svg` for asset optimization
5. **Iterate**: Refine component based on analysis results

## 📋 Requirements

- **Node.js**: ≥ 18.0.0
- **Chrome/Chromium**: For screenshot generation
- **Vue.js project**: For component restoration
- **MCP-compatible client**: Cursor IDE, Claude Desktop, etc.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -m 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **GitHub**: [tianmuji/figma-restoration-mcp-vue-tools](https://github.com/tianmuji/figma-restoration-mcp-vue-tools)
- **npm**: [figma-restoration-mcp-vue-tools](https://www.npmjs.com/package/figma-restoration-mcp-vue-tools)
- **Issues**: [Report bugs & feature requests](https://github.com/tianmuji/figma-restoration-mcp-vue-tools/issues)

## 🙏 Acknowledgments

- **[snapDOM](https://github.com/zumer/snapdom)**: High-quality DOM screenshots
- **[Model Context Protocol](https://modelcontextprotocol.io/)**: MCP framework
- **[Vue.js](https://vuejs.org/)**: Progressive JavaScript framework
- **[SVGO](https://github.com/svg/svgo)**: SVG optimization library

---

🎨 **Built for developers who demand pixel-perfect component restoration** 🎨
