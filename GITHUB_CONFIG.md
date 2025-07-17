# GitHub Repository Configuration

## Repository Settings

After creating the repository, configure these settings on GitHub:

### Basic Information
- **Repository name**: `figma-restoration-mcp-vue-tools`
- **Description**: `Professional Figma Component Restoration Kit - Complete MCP tools with snapDOM-powered high-quality screenshots, intelligent shadow detection, and smart debugging for Vue component restoration`
- **Website**: `https://www.npmjs.com/package/figma-restoration-mcp-vue-tools`
- **Visibility**: Public

### Topics/Tags
Add these topics to help users discover your repository:
```
figma
restoration
vue
component
mcp
screenshot
snapdom
design-to-code
ui-testing
visual-regression
shadow-detection
image-comparison
model-context-protocol
figma-to-code
component-testing
```

### Repository Features
Enable these features in Settings:
- ✅ Issues
- ✅ Projects  
- ✅ Wiki
- ✅ Discussions (optional)
- ✅ Sponsorships (optional)

### Branch Protection (Optional)
For the `main` branch:
- ✅ Require pull request reviews before merging
- ✅ Require status checks to pass before merging
- ✅ Require branches to be up to date before merging

### GitHub Pages (Optional)
If you want to host documentation:
- Source: Deploy from a branch
- Branch: `main`
- Folder: `/docs` (if you create a docs folder)

## Repository Structure Verification

After pushing, verify these files are visible on GitHub:

### Root Files
- ✅ README.md (main documentation)
- ✅ LICENSE (MIT license)
- ✅ package.json (npm configuration)
- ✅ .gitignore (git ignore rules)
- ✅ .npmignore (npm ignore rules)

### Key Directories
- ✅ `src/` - Source code
- ✅ `bin/` - CLI executable
- ✅ `docs/` - Documentation
- ✅ `config/` - Configuration templates
- ✅ `scripts/` - Utility scripts
- ✅ `examples/` - Usage examples

### Important Files
- ✅ `src/server.js` - MCP server
- ✅ `src/tools/snapdom-screenshot.js` - Screenshot tool
- ✅ `src/tools/figma-compare.js` - Comparison tool
- ✅ `bin/cli.js` - CLI interface

## README.md Display

Ensure your README.md displays correctly with:
- ✅ Package badges (npm version, license, etc.)
- ✅ Installation instructions
- ✅ Usage examples
- ✅ Feature descriptions
- ✅ Links to npm package

## Release Management

### Creating Releases
1. Go to repository > Releases
2. Click "Create a new release"
3. Tag version: `v1.0.1` (should already exist)
4. Release title: `v1.0.1 - Initial Release`
5. Description: Describe the features and changes

### Release Notes Template
```markdown
## 🚀 Features
- ✅ Smart shadow detection with automatic padding calculation
- ✅ snapDOM-powered high-quality screenshots (3x scaling)
- ✅ Intelligent image comparison with 98%+ accuracy
- ✅ Complete MCP tool integration
- ✅ CLI support for easy project initialization

## 📦 Installation
```bash
npm install -g figma-restoration-mcp-vue-tools
```

## 🔗 Links
- npm: https://www.npmjs.com/package/figma-restoration-mcp-vue-tools
- Documentation: [README.md](./README.md)
```

## Verification Checklist

After setup, verify:
- [ ] Repository is public and accessible
- [ ] README.md displays correctly
- [ ] All files and directories are present
- [ ] npm badge shows correct version
- [ ] Links to npm package work
- [ ] CLI installation instructions are clear
- [ ] License is properly displayed
- [ ] Topics/tags are set for discoverability
