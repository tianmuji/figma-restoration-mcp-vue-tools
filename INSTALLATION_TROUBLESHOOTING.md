# Installation Troubleshooting Guide

## 🚨 Common Installation Issues

### Issue 1: Puppeteer TLS Certificate Error

**Error Message:**
```
ERR_TLS_CERT_ALTNAME_INVALID: Hostname/IP does not match certificate's altnames: Host: npm.taobao.org. is not in the cert's altnames
```

**Root Cause:**
- npm/yarn configured to use Taobao registry (`npm.taobao.org`)
- TLS certificate mismatch between registry and hostname
- Puppeteer trying to download Chrome during installation

**Solutions:**

#### Solution 1: Skip Puppeteer Download (Recommended)
```bash
# Set environment variable and install
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true yarn add -D figma-restoration-mcp-vue-tools

# Or for npm
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true npm install --save-dev figma-restoration-mcp-vue-tools
```

#### Solution 2: Use Official Registry
```bash
# Yarn with official registry
yarn add -D figma-restoration-mcp-vue-tools --registry https://registry.npmjs.org/

# npm with official registry
npm install --save-dev figma-restoration-mcp-vue-tools --registry https://registry.npmjs.org/
```

#### Solution 3: Use Safe Installation Script
```bash
# Use the provided safe installation script
./scripts/install-safe.sh -D

# For global installation
./scripts/install-safe.sh -g
```

#### Solution 4: Configure Registry Permanently
```bash
# Switch to official npm registry
yarn config set registry https://registry.npmjs.org/
# or
npm config set registry https://registry.npmjs.org/

# Then install normally
yarn add -D figma-restoration-mcp-vue-tools
```

### Issue 2: Self-Installation Problem

**Problem:** Installing the package as a dev dependency to itself

**Solution:** Don't install the package as a dependency to itself. Instead:

```bash
# For development, use local files
npm run dev

# For testing the published package, create a separate test project
mkdir test-project
cd test-project
npm init -y
npm install figma-restoration-mcp-vue-tools
```

### Issue 3: Chrome/Chromium Not Found

**Error Message:**
```
Error: Could not find Chrome (ver. xxx.x.xxxx.x). This can occur if either:
```

**Solutions:**

#### Option 1: Install Chrome/Chromium
```bash
# macOS
brew install --cask google-chrome

# Ubuntu/Debian
sudo apt-get install google-chrome-stable

# CentOS/RHEL
sudo yum install google-chrome-stable
```

#### Option 2: Set Chrome Path
```bash
# Set environment variable
export PUPPETEER_EXECUTABLE_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

# Or in your shell profile
echo 'export PUPPETEER_EXECUTABLE_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"' >> ~/.bashrc
```

#### Option 3: Use System Chrome
The package is configured to automatically detect system Chrome installations.

## 🛠️ Environment Configuration

### Required Environment Variables

```bash
# Skip Puppeteer Chrome download (recommended)
export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# Set Chrome executable path (if needed)
export PUPPETEER_EXECUTABLE_PATH="/path/to/chrome"

# Use official npm registry for Puppeteer downloads
export PUPPETEER_DOWNLOAD_HOST=https://registry.npmjs.org
```

### Add to Shell Profile

```bash
# Add to ~/.bashrc, ~/.zshrc, or ~/.profile
echo 'export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true' >> ~/.bashrc
echo 'export PUPPETEER_EXECUTABLE_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"' >> ~/.bashrc
```

## 📋 Registry Configuration

### Check Current Registry
```bash
# Yarn
yarn config get registry

# npm
npm config get registry

# pnpm
pnpm config get registry
```

### Switch to Official Registry
```bash
# Yarn
yarn config set registry https://registry.npmjs.org/

# npm
npm config set registry https://registry.npmjs.org/

# pnpm
pnpm config set registry https://registry.npmjs.org/
```

### Temporary Registry Override
```bash
# Use official registry for single command
yarn add package-name --registry https://registry.npmjs.org/
npm install package-name --registry https://registry.npmjs.org/
```

## 🔧 Advanced Troubleshooting

### Clear Package Manager Cache
```bash
# Yarn
yarn cache clean

# npm
npm cache clean --force

# pnpm
pnpm store prune
```

### Reset Package Manager Configuration
```bash
# Yarn
yarn config delete registry

# npm
npm config delete registry

# pnpm
pnpm config delete registry
```

### Manual Chrome Installation for Puppeteer
```bash
# Download Chrome manually (if needed)
npx puppeteer browsers install chrome
```

## ✅ Verification Steps

After successful installation, verify everything works:

```bash
# Check if package is installed
npm list figma-restoration-mcp-vue-tools

# Test CLI
npx figma-restoration-mcp-vue-tools --version

# Initialize configuration
npx figma-restoration-mcp-vue-tools init

# Test MCP server startup
npx figma-restoration-mcp-vue-tools start
```

## 🆘 Getting Help

If you're still experiencing issues:

1. **Check the logs** for detailed error messages
2. **Create an issue** on GitHub with:
   - Your operating system
   - Node.js version (`node --version`)
   - Package manager and version
   - Complete error message
   - Steps to reproduce

3. **Common workarounds**:
   - Use Docker for consistent environment
   - Try different Node.js versions with nvm
   - Use CI/CD environment for testing

## 📚 Additional Resources

- [Puppeteer Troubleshooting](https://pptr.dev/troubleshooting)
- [npm Registry Configuration](https://docs.npmjs.com/cli/v7/using-npm/config)
- [Yarn Registry Configuration](https://yarnpkg.com/configuration/yarnrc)
- [Package GitHub Repository](https://github.com/tianmuji/figma-restoration-mcp-vue-tools)
