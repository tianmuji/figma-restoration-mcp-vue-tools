# Figma Restoration MCP Tools Overview

## 🎯 Current Tool Configuration

This project provides **2 core MCP tools** for Figma component restoration:

### 1. `figma_compare` 🔍
**Complete Figma component comparison and analysis solution**

**Features:**
- 📸 High-quality snapDOM screenshots (3x scaling)
- 🔍 Pixel-perfect image comparison
- 📊 Detailed quality assessment reports
- 💡 Smart optimization suggestions
- 📋 Markdown + JSON dual-format reports

**Usage:**
```javascript
{
  "tool": "figma_compare",
  "arguments": {
    "componentName": "MyComponent",
    "threshold": 0.1,
    "generateReport": true
  }
}
```

### 2. `snapdom_screenshot` 📸
**Professional DOM-to-image screenshot tool**

**Features:**
- ⚡ snapDOM-powered high-quality capture (150x faster than traditional methods)
- 🎨 Perfect CSS styles, fonts, and pseudo-elements preservation
- 🔧 Shadow DOM and Web Components support
- 📐 3x scaling for high-resolution screenshots
- 🌟 Box-shadow capture with automatic padding

**Usage:**
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
      "padding": 0
    }
  }
}
```

## 🚫 Removed Tools

**`download_figma_images`** - This tool has been removed to simplify the project. 

**Why removed:**
- Reduces complexity and dependencies
- Focuses on core comparison and screenshot functionality
- Manual asset preparation provides better control over quality
- Eliminates potential Figma API rate limiting issues

## 🔄 Workflow Changes

### Previous Workflow:
1. Get Figma data → 2. Download assets → 3. Generate component → 4. Compare

### Current Workflow:
1. Get Figma data → 2. **Manually prepare assets** → 3. Generate component → 4. Compare

### Asset Preparation:
- Export images from Figma manually at appropriate resolutions
- Place assets in the component's `images/` folder
- Reference assets using relative paths in Vue components

## 📊 Quality Standards

- 🏆 **Perfect** (99%+): Production ready
- ✅ **Excellent** (95-99%): Minor adjustments needed  
- 👍 **Good** (90-95%): Optimization required
- ⚠️ **Needs Improvement** (<90%): Major fixes needed

## 🛠️ Configuration

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

## 📚 Documentation

- [snapDOM Best Practices](./docs/snapdom-best-practices.md)
- [3x Screenshot Guide](./docs/3x-screenshot-guide.md)
- [Complete Workflow](./docs/workflow.md)

## 🔗 Dependencies

- `@zumer/snapdom`: High-quality DOM screenshots
- `pixelmatch`: Image comparison
- `sharp`: Image processing
- `@modelcontextprotocol/sdk`: MCP framework
