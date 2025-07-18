# Figma Restoration MCP Vue Tools

[![npm version](https://badge.fury.io/js/figma-restoration-mcp-vue-tools.svg)](https://badge.fury.io/js/figma-restoration-mcp-vue-tools)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen.svg)](https://nodejs.org/)

A professional toolkit for Figma-to-Vue component restoration using Model Context Protocol (MCP). Features high-quality DOM screenshots, intelligent shadow detection, and automated visual comparison for pixel-perfect component restoration.

## Features

- **High-Quality Screenshots**: snapDOM-powered 3x scaling with shadow support and font embedding
- **Intelligent Shadow Detection**: Automatic padding calculation based on Figma shadow data
- **Advanced Image Comparison**: Pixel-perfect analysis with smart debugging and quality assessment
- **SVG Optimization**: SVGO integration with customizable configuration
- **MCP Integration**: Seamless integration with AI coding assistants via Model Context Protocol

## Quick Start

Add the MCP server to your Cursor settings:

```json
{
  "mcp": {
    "servers": {
      "figma-restoration": {
        "command": "npx",
        "args": ["figma-restoration-mcp-vue-tools", "start"]
      }
    }
  }
}
```

**Restart Cursor** after adding the configuration, then ask Cursor to use the tools:
- `snapdom_screenshot` - Take high-quality component screenshots
- `figma_compare` - Compare components with Figma designs
- `optimize_svg` - Optimize SVG assets

## MCP Tools

### snapdom_screenshot

Captures high-quality DOM screenshots with intelligent shadow detection.

```json
{
  "tool": "snapdom_screenshot",
  "arguments": {
    "componentName": "MyComponent",
    "snapDOMOptions": {
      "scale": 3,
      "compress": true,
      "embedFonts": true,
      "padding": 0
    }
  }
}
```

### figma_compare

Performs advanced image comparison and generates detailed analysis reports.

```json
{
  "tool": "figma_compare",
  "arguments": {
    "componentName": "MyComponent",
    "generateReport": true,
    "threshold": 0.1
  }
}
```

### optimize_svg

Optimizes SVG files using SVGO with customizable configuration.

```json
{
  "tool": "optimize_svg",
  "arguments": {
    "inputPath": "path/to/input.svg",
    "outputPath": "path/to/optimized.svg",
    "svgoConfig": {
      "plugins": ["preset-default"],
      "multipass": true,
      "floatPrecision": 2
    }
  }
}
```

## Configuration

### Shadow Detection

For components with shadows, the tool automatically calculates optimal padding:

```json
{
  "snapDOMOptions": {
    "scale": 3,
    "padding": 0,
    "figmaEffects": [
      {"type": "DROP_SHADOW", "offset": {"x": 0, "y": 5}, "radius": 30, "spread": 0}
    ]
  }
}
```

### Accuracy Benchmarks

| Configuration | Accuracy | Use Case |
|---------------|----------|----------|
| Auto-calculated padding | 98.33% | Components with shadows |
| Zero padding | 92.66% | Clean components |
| Fixed padding | Not recommended | Hardcoded values |

## Requirements

- Node.js ≥ 20.0.0
- Vue.js project (for component restoration)
- MCP-compatible AI coding assistant (Cursor IDE, Claude, etc.)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -m 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Links

- [GitHub Repository](https://github.com/tianmuji/figma-restoration-mcp-vue-tools)
- [npm Package](https://www.npmjs.com/package/figma-restoration-mcp-vue-tools)
- [Issues](https://github.com/tianmuji/figma-restoration-mcp-vue-tools/issues)

## Acknowledgments

- [snapDOM](https://github.com/zumer/snapdom) - High-quality DOM screenshots
- [Model Context Protocol](https://modelcontextprotocol.io/) - MCP framework
- [Vue.js](https://vuejs.org/) - Progressive JavaScript framework
