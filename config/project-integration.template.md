# Project Integration Guide

This template helps you integrate the Figma Restoration Kit into your existing project.

## Integration Steps

### 1. Add as Submodule

```bash
# In your project root
git submodule add https://github.com/your-org/figma-restoration-kit.git mcp-vue-tools
cd mcp-vue-tools
yarn install
./scripts/install.sh
```

### 2. Update Your Project Configuration

#### package.json Scripts (Optional)

Add these scripts to your main project's package.json:

```json
{
  "scripts": {
    "figma:start": "cd mcp-vue-tools && yarn mcp",
    "figma:test": "cd mcp-vue-tools && yarn test",
    "figma:clean": "cd mcp-vue-tools && yarn clean"
  }
}
```

#### .gitignore Updates

Add these entries to your .gitignore:

```
# Figma Restoration Kit
mcp-vue-tools/node_modules/
mcp-vue-tools/.env
mcp-vue-tools/temp/
mcp-vue-tools/results/
mcp-vue-tools/output/
```

### 3. IDE Configuration

#### VSCode/Cursor

1. Copy MCP configuration from `mcp-vue-tools/config/mcp-config.json`
2. Add to your IDE's MCP settings
3. Restart IDE

#### Project-specific Settings

Create `.vscode/settings.json` in your project root:

```json
{
  "mcp": {
    "mcpServers": {
      "figma-restoration-kit": {
        "command": "node",
        "args": ["src/server.js"],
        "cwd": "{{ABSOLUTE_PATH_TO_YOUR_PROJECT}}/mcp-vue-tools",
        "env": {
          "PUPPETEER_EXECUTABLE_PATH": "{{YOUR_CHROME_PATH}}",
          "NODE_ENV": "development"
        }
      }
    }
  }
}
```

### 4. Team Setup

#### Documentation

Create `docs/figma-restoration.md` in your project:

```markdown
# Figma Restoration Process

## Setup
1. Initialize submodule: `git submodule update --init --recursive`
2. Install dependencies: `cd mcp-vue-tools && yarn install`
3. Configure MCP in your IDE

## Usage
1. Start MCP server: `yarn figma:start`
2. Use MCP tools in IDE for Figma restoration
3. Generated components will be in `mcp-vue-tools/output/`

## Integration
- Copy restored components to `src/components/`
- Update imports and styling as needed
- Test components in your application
```

#### Team Onboarding

Add to your project's README.md:

```markdown
## Figma Restoration

This project includes the Figma Restoration Kit for converting Figma designs to Vue components.

### Quick Start
1. `git submodule update --init --recursive`
2. `cd mcp-vue-tools && yarn install && ./scripts/install.sh`
3. Configure MCP in your IDE
4. Start restoring: `yarn figma:start`

See [docs/figma-restoration.md](docs/figma-restoration.md) for detailed instructions.
```

### 5. CI/CD Integration (Optional)

#### GitHub Actions

Create `.github/workflows/figma-restoration-test.yml`:

```yaml
name: Test Figma Restoration Kit

on:
  push:
    paths:
      - 'mcp-vue-tools/**'
  pull_request:
    paths:
      - 'mcp-vue-tools/**'

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          submodules: recursive
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: |
          cd mcp-vue-tools
          yarn install
          
      - name: Test installation
        run: |
          cd mcp-vue-tools
          ./scripts/test-installation.sh
```

### 6. Development Workflow

#### Component Development

1. **Extract Figma Data**
   ```javascript
   // In IDE with MCP
   await getFigmaData({
     fileKey: "your-figma-file-key",
     nodeId: "component-node-id"
   });
   ```

2. **Generate Component**
   ```javascript
   await save_vue_component({
     componentName: "NewComponent",
     vueCode: "generated-vue-code"
   });
   ```

3. **Test and Validate**
   ```javascript
   await validate_restoration({
     componentName: "NewComponent",
     vueCode: "component-code",
     expectedImageUrl: "figma-design-url"
   });
   ```

4. **Integrate into Project**
   - Copy from `mcp-vue-tools/output/NewComponent/`
   - Move to `src/components/`
   - Update imports and styling
   - Test in application

#### Quality Assurance

- Target 99%+ visual accuracy
- Test responsive behavior
- Validate accessibility
- Document component usage

### 7. Maintenance

#### Updates

```bash
# Update the kit
cd mcp-vue-tools
git pull origin main
yarn install
```

#### Cleanup

```bash
# Clean temporary files
yarn figma:clean

# Reset to clean state
cd mcp-vue-tools
git clean -fd
yarn install
```

## Troubleshooting

### Common Issues

1. **MCP server not starting**
   - Check Chrome path in configuration
   - Verify Node.js version (>=18.0.0)
   - Check file permissions on scripts

2. **Components not rendering**
   - Verify Vue syntax
   - Check Element Plus imports
   - Test component in isolation

3. **Low accuracy scores**
   - Check box-sizing property
   - Verify font loading
   - Ensure 3x scale consistency

### Getting Help

- Check `mcp-vue-tools/docs/troubleshooting.md`
- Review examples in `mcp-vue-tools/examples/`
- Open issue on GitHub

## Best Practices

1. **Version Control**
   - Commit submodule updates separately
   - Document component changes
   - Tag stable releases

2. **Team Collaboration**
   - Share MCP configurations
   - Document restoration decisions
   - Review component quality

3. **Performance**
   - Clean up temporary files regularly
   - Optimize generated components
   - Monitor bundle size impact
