# Migration Guide - v4.1.x to v4.2.0

This guide helps you migrate from v4.1.x to v4.2.0, which introduces simplified Puppeteer integration with bundled Chromium.

## 🎯 What Changed

### ✅ Improvements
- **Simplified Browser Management**: No more Chrome path detection or configuration
- **Enhanced Error Handling**: Better error messages with specific solution suggestions
- **Performance Optimization**: Browser instance reuse and page pooling
- **Zero Configuration**: Eliminated complex setup requirements

### 🗑️ Removed
- Chrome path detection logic
- `.puppeteerrc.cjs` configuration file generation
- Complex environment variable requirements
- System Chrome dependency

## 🚀 Migration Steps

### Step 1: Update Package Version

```bash
npm update figma-restoration-mcp-vue-tools
```

Or if using npx:
```bash
# No action needed - npx will automatically use the latest version
```

### Step 2: Clean Up Deprecated Files

The new version will automatically clean up deprecated files during installation, but you can manually remove them if needed:

```bash
# Remove deprecated Puppeteer configuration (if exists)
rm .puppeteerrc.cjs
```

### Step 3: Update Environment Variables

Remove or ignore these deprecated environment variables:

```bash
# These are no longer needed and will be ignored:
unset PUPPETEER_EXECUTABLE_PATH
unset CHROME_EXECUTABLE_PATH  
unset PUPPETEER_SKIP_CHROMIUM_DOWNLOAD
unset PUPPETEER_SKIP_DOWNLOAD
```

### Step 4: Update MCP Configuration

Update your Cursor MCP configuration to use the latest version:

**Before (v4.1.x)**:
```json
{
  "mcpServers": {
    "figma-restoration-mcp-vue-tools": {
      "command": "npx",
      "args": ["-y", "figma-restoration-mcp-vue-tools@^4.1.0", "start"],
      "env": {
        "PUPPETEER_EXECUTABLE_PATH": "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
        "NODE_ENV": "production"
      }
    }
  }
}
```

**After (v4.2.0)**:
```json
{
  "mcpServers": {
    "figma-restoration-mcp-vue-tools": {
      "command": "npx",
      "args": ["-y", "figma-restoration-mcp-vue-tools@^4.2.0", "start"],
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
```

## 🔧 Breaking Changes

### None! 
This is a **non-breaking update**. All existing APIs and functionality remain the same.

### What You'll Notice
- **Faster startup**: No more Chrome path detection delays
- **Better error messages**: More helpful error information with solution suggestions
- **Cleaner logs**: Simplified installation and startup messages
- **Improved reliability**: Consistent behavior across all platforms

## 🚨 Troubleshooting

### Issue: "Chrome executable not found" errors
**Solution**: This error should no longer occur. If you still see it, ensure you're using v4.2.0:
```bash
npm list figma-restoration-mcp-vue-tools
```

### Issue: Deprecated environment variable warnings
**Expected behavior**: You'll see warnings like:
```
⚠️  PUPPETEER_EXECUTABLE_PATH is deprecated and will be ignored
   Puppeteer now uses bundled Chromium automatically
```
**Solution**: Remove these environment variables from your configuration.

### Issue: Performance seems slower
**Solution**: The new version uses browser instance reuse. Performance should actually be better after the first use.

### Issue: Screenshots look different
**Solution**: The new version uses Puppeteer's bundled Chromium, which may have slight rendering differences. This ensures consistency across all environments.

## 📞 Getting Help

If you encounter issues during migration:

1. **Check the version**: Ensure you're running v4.2.0
   ```bash
   npm list figma-restoration-mcp-vue-tools
   ```

2. **Clear npm cache**: 
   ```bash
   npm cache clean --force
   ```

3. **Reinstall the package**:
   ```bash
   npm uninstall figma-restoration-mcp-vue-tools
   npm install figma-restoration-mcp-vue-tools
   ```

4. **Report issues**: [GitHub Issues](https://github.com/tianmuji/figma-restoration-mcp-vue-tools/issues)

## 🎉 Benefits After Migration

- ✅ **Zero Configuration**: No browser setup required
- ✅ **Cross-Platform Consistency**: Same behavior on all operating systems  
- ✅ **Better Error Handling**: Clear error messages with actionable solutions
- ✅ **Improved Performance**: Browser instance reuse and page pooling
- ✅ **Enhanced Reliability**: No more browser path or permission issues
- ✅ **Simplified Maintenance**: Fewer configuration files and environment variables

---

**Migration complete!** 🎊 You're now ready to enjoy the simplified and more reliable v4.2.0 experience.