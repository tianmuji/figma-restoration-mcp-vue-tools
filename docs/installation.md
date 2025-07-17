# Installation Guide

This guide covers different installation methods for the Figma Restoration Kit.

## Prerequisites

- Node.js 18.0.0 or higher
- Yarn or npm package manager
- Google Chrome browser (for Puppeteer)
- Git (for submodule installation)

## Installation Methods

### Method 1: Git Submodule (Recommended)

This method integrates the kit into your existing project as a submodule.

```bash
# Navigate to your project root
cd your-project

# Add as submodule
git submodule add https://github.com/your-org/figma-restoration-kit.git mcp-vue-tools

# Initialize submodule
git submodule update --init --recursive

# Install dependencies
cd mcp-vue-tools
yarn install

# Run setup script
chmod +x scripts/install.sh
./scripts/install.sh
```

### Method 2: Standalone Installation

For standalone use or development of the kit itself.

```bash
# Clone the repository
git clone https://github.com/your-org/figma-restoration-kit.git
cd figma-restoration-kit

# Install dependencies
yarn install

# Run setup
yarn setup
```

### Method 3: NPM Package (Future)

```bash
# Install as npm package (when published)
npm install figma-restoration-kit

# Or with yarn
yarn add figma-restoration-kit
```

## Configuration Setup

### 1. MCP Server Configuration

Copy the configuration template:

```bash
cp config/mcp-config.template.json config/mcp-config.json
```

Edit the configuration file:

```json
{
  "mcpServers": {
    "figma-restoration-kit": {
      "command": "node",
      "args": ["src/server.js"],
      "cwd": "/absolute/path/to/your/project/mcp-vue-tools",
      "env": {
        "PUPPETEER_EXECUTABLE_PATH": "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
        "NODE_ENV": "development",
        "PROJECT_ROOT": "/absolute/path/to/your/project"
      }
    },
    "figma": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-figma"],
      "env": {
        "FIGMA_PERSONAL_ACCESS_TOKEN": "your-figma-token-here"
      }
    }
  }
}
```

### 2. IDE Configuration

#### For VSCode/Cursor

1. Copy the generated configuration to your MCP client settings
2. Restart VSCode/Cursor
3. Verify MCP tools are available

#### For Other IDEs

Follow your IDE's MCP integration documentation and use the generated configuration.

### 3. Environment Variables

Create a `.env` file in the mcp-vue-tools directory:

```bash
# Chrome executable path (adjust for your system)
PUPPETEER_EXECUTABLE_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

# Development mode
NODE_ENV=development

# Project root (absolute path)
PROJECT_ROOT="/absolute/path/to/your/project"

# Optional: Figma token for direct API access
FIGMA_PERSONAL_ACCESS_TOKEN="your-figma-token"
```

## Platform-Specific Setup

### macOS

```bash
# Chrome path is usually:
PUPPETEER_EXECUTABLE_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

# Make scripts executable
chmod +x scripts/*.sh
```

### Windows

```bash
# Chrome path is usually:
PUPPETEER_EXECUTABLE_PATH="C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"

# Use PowerShell for scripts
```

### Linux

```bash
# Chrome path varies by distribution
PUPPETEER_EXECUTABLE_PATH="/usr/bin/google-chrome"

# Or for Chromium:
PUPPETEER_EXECUTABLE_PATH="/usr/bin/chromium-browser"
```

## Verification

### Test Installation

```bash
# Run installation test
yarn test

# Or manually test MCP server
yarn mcp
```

### Test MCP Tools

In your IDE with MCP enabled:

```javascript
// Test basic functionality
await vue_dev_server({ action: "status" });

// Test component saving
await save_vue_component({
  componentName: "TestComponent",
  vueCode: `
    <template>
      <div>Hello World</div>
    </template>
  `
});
```

## Troubleshooting

### Common Issues

1. **Chrome not found**
   - Update `PUPPETEER_EXECUTABLE_PATH` in configuration
   - Install Google Chrome if not present

2. **Permission denied on scripts**
   ```bash
   chmod +x scripts/*.sh
   ```

3. **Node version issues**
   ```bash
   node --version  # Should be 18.0.0+
   ```

4. **MCP server not starting**
   - Check configuration paths are absolute
   - Verify all dependencies are installed
   - Check console for error messages

### Getting Help

1. Check the [troubleshooting guide](troubleshooting.md)
2. Review [examples](../examples/) for working configurations
3. Open an issue on GitHub with:
   - Your operating system
   - Node.js version
   - Installation method used
   - Error messages

## Next Steps

After successful installation:

1. Read the [workflow documentation](workflow.md)
2. Try the [examples](../examples/)
3. Configure your [cursor rules](../config/cursor-rules.template.md)
4. Start restoring Figma designs!

## Updating

### For Submodule Installation

```bash
cd mcp-vue-tools
git pull origin main
yarn install
```

### For Standalone Installation

```bash
git pull origin main
yarn install
```

## Uninstallation

### Remove Submodule

```bash
# Remove submodule
git submodule deinit mcp-vue-tools
git rm mcp-vue-tools
rm -rf .git/modules/mcp-vue-tools
```

### Remove Standalone

```bash
# Simply delete the directory
rm -rf figma-restoration-kit
```
