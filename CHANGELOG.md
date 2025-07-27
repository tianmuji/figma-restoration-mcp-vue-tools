# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [4.1.0] - 2025-01-25

### 🚀 Added
- **Zero-Configuration Browser Setup**: Automatic Chrome/Chromium installation and management via `puppeteer browsers install chrome`
- **Enhanced snapDOM Integration**: Improved local-only dependency loading with multiple fallback strategies
- **Smart Timeout Management**: Configurable timeout handling with intelligent error recovery
- **Improved Package Structure**: Cleaner dependency organization with proper dev/runtime separation

### 🔧 Changed
- **Dependency Management**: Moved Vue-related packages to devDependencies for better package optimization
- **Browser Configuration**: Removed external browser path requirements - now fully automated
- **snapDOM Loading**: Eliminated external CDN dependencies for improved security and reliability
- **Vite Configuration**: Enhanced optimization settings for better snapDOM integration
- **HTML Template**: Added snapDOM preloading for faster initialization

### 🛡️ Security
- **Local-Only Dependencies**: Removed all external CDN links to prevent security vulnerabilities
- **Bundled Browser**: Packaged browser installation prevents external dependency issues

### 🐛 Fixed
- **Circular Dependency**: Removed self-referencing package dependency
- **Duplicate Bundle Config**: Fixed redundant bundleDependencies entries
- **Import Resolution**: Improved snapDOM module loading with better error handling
- **Network Reliability**: Eliminated network-dependent external resource loading

### ❌ Removed
- External CDN dependency on `https://unpkg.com/@zumer/snapdom@1.9.5/dist/snapdom.mjs`
- Manual browser configuration requirements
- `PUPPETEER_EXECUTABLE_PATH` requirement for basic usage
- Self-referencing package dependency `figma-restoration-mcp-vue-tools@^3.0.4`

## [4.0.0] - 2025-01-20

### 🚀 Added
- **snapDOM Integration**: High-quality DOM-to-image conversion with 3x scaling support
- **MCP Server Architecture**: Full Model Context Protocol implementation for AI assistant integration
- **Visual Comparison Tools**: Advanced pixel-perfect comparison with detailed analysis
- **SVG Optimization**: Built-in SVGO integration with customizable configuration

- **Component Screenshot Tool**: Automated high-quality component capture
- **Figma Integration**: Direct Figma API integration for design data extraction

### 🔧 Core Features
- **figma_compare**: Advanced component comparison with threshold-based analysis
- **snapdom_screenshot**: High-quality DOM screenshot capture
- **optimize_svg**: SVG optimization with size reduction reporting
- **Intelligent Viewport Management**: Automatic viewport configuration
- **Font Embedding**: Embedded font support for accurate text rendering
- **Transparent Backgrounds**: Support for transparent component capture

### 📦 Technical Infrastructure
- **Vue 3 Support**: Full Vue 3 Composition API compatibility
- **TypeScript Support**: Complete TypeScript type definitions
- **Vite Integration**: Modern build system with optimized development server
- **Puppeteer Integration**: Browser automation for reliable screenshot capture
- **Sharp Image Processing**: High-performance image manipulation
- **Pixelmatch Comparison**: Pixel-level image difference detection

### 🛠️ Developer Experience
- **CLI Interface**: Command-line interface for standalone usage
- **Hot Reload**: Development server with live component updates
- **Error Handling**: Comprehensive error reporting and recovery
- **Configuration Options**: Extensive customization capabilities
- **Documentation**: Complete API documentation and examples

---

## Migration Guide

### From v3.x to v4.1.0

1. **Update package.json**: No manual browser configuration needed
   ```json
   {
     "mcpServers": {
       "figma-restoration-mcp-vue-tools": {
         "command": "npx",
         "args": ["-y", "figma-restoration-mcp-vue-tools@^4.1.0", "start"],
         "env": {
           "NODE_ENV": "production"
         }
       }
     }
   }
   ```

2. **Remove manual browser setup**: Delete `PUPPETEER_EXECUTABLE_PATH` environment variable
3. **Update Cursor configuration**: Use simplified configuration without browser paths
4. **Restart services**: Restart Cursor to pick up new configuration

### Breaking Changes in v4.0.0

- **Minimum Node.js**: Now requires Node.js ≥ 18.0.0
- **Package Structure**: Significant reorganization of internal APIs
- **Configuration Format**: Updated MCP server configuration format
- **Tool Parameters**: Enhanced parameter validation and structure

---

## Support

- **Documentation**: [README.md](README.md)
- **Issues**: [GitHub Issues](https://github.com/tianmuji/figma-restoration-mcp-vue-tools/issues)
- **Discussions**: [GitHub Discussions](https://github.com/tianmuji/figma-restoration-mcp-vue-tools/discussions)

---

*For older versions and detailed technical changes, see the [git commit history](https://github.com/tianmuji/figma-restoration-mcp-vue-tools/commits).* 