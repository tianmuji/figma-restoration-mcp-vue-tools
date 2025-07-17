# Installation Guide

This guide covers installation methods for the Figma Restoration MCP Vue Tools.

## Prerequisites

- Node.js 18.0.0 or higher
- npm or yarn package manager
- Google Chrome browser (for screenshot functionality)

## Installation Methods

### Method 1: Global npm Installation (Recommended)

Install the package globally for system-wide access:

```bash
# Install globally via npm
npm install -g figma-restoration-mcp-vue-tools

# Or install globally via yarn
yarn global add figma-restoration-mcp-vue-tools

# Verify installation
npx figma-restoration-mcp-vue-tools --version
```

### Method 2: Project-specific Installation

Install in your project directory:

```bash
# Navigate to your project root
cd your-project

# Install as project dependency
npm install figma-restoration-mcp-vue-tools

# Or with yarn
yarn add figma-restoration-mcp-vue-tools

# Initialize configuration
npx figma-restoration-mcp-vue-tools init
```

### Method 3: Direct npx Usage

Use without installation (downloads on demand):

```bash
# Initialize project configuration
npx figma-restoration-mcp-vue-tools init

# Start MCP server
npx figma-restoration-mcp-vue-tools start
```

## Configuration Setup

### 1. Initialize Configuration

After installation, initialize the configuration files:

```bash
# Initialize configuration in your project
npx figma-restoration-mcp-vue-tools init
```

This creates:
- `mcp-config.json` - MCP server configuration
- `cursor-rules.md` - Cursor IDE rules (optional)
- `vscode-settings.json` - VS Code settings (optional)

### 2. MCP Server Configuration

The generated `mcp-config.json` will look like this:

```json
{
  "mcpServers": {
    "figma-restoration-mcp-vue-tools": {
      "command": "npx",
      "args": ["figma-restoration-mcp-vue-tools", "start"],
      "env": {
        "NODE_ENV": "production"
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
