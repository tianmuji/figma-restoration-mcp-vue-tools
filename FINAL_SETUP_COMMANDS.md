# Final GitHub Setup Commands

## Prerequisites
1. ✅ npm package published: `figma-restoration-mcp-vue-tools@1.0.1`
2. ✅ Local git repository ready
3. ⚠️  **MUST CREATE** GitHub repository first at: https://github.com/new

## Step 1: Create GitHub Repository
1. Go to https://github.com/new
2. Repository name: `figma-restoration-mcp-vue-tools`
3. Description: `Professional Figma Component Restoration Kit - Complete MCP tools with snapDOM-powered high-quality screenshots, intelligent shadow detection, and smart debugging for Vue component restoration`
4. Set to **Public**
5. **DO NOT** initialize with README/license/gitignore
6. Click "Create repository"

## Step 2: Run These Commands

```bash
# Navigate to project directory
cd /Users/yujie_wu/Documents/work/camscanner-cloud-vue3/figma-restoration-mcp-vue-tools

# Verify we're in the right place
pwd
ls -la package.json

# Check git status
git status
git log --oneline -3

# Add GitHub remote (remove existing if needed)
git remote remove origin 2>/dev/null || true
git remote add origin https://github.com/yujie-wu/figma-restoration-mcp-vue-tools.git

# Verify remote
git remote -v

# Set main branch and push
git branch -M main
git push -u origin main

# Push all tags
git push origin --tags
```

## Step 3: Verify Setup

```bash
# Check remote branches
git branch -r

# Verify latest commit
git log --oneline -1

# Check tags
git tag -l

# Test repository access
curl -s https://api.github.com/repos/yujie-wu/figma-restoration-mcp-vue-tools | grep -E '"name"|"description"|"html_url"'
```

## Step 4: Configure Repository on GitHub

After successful push, go to your repository settings:

### Repository Settings
- **About section**: Add description and website URL
- **Website**: `https://www.npmjs.com/package/figma-restoration-mcp-vue-tools`
- **Topics**: Add these tags:
  ```
  figma, restoration, vue, component, mcp, screenshot, snapdom, design-to-code, ui-testing, visual-regression, shadow-detection, image-comparison
  ```

### Enable Features
- ✅ Issues
- ✅ Projects
- ✅ Wiki
- ✅ Discussions (optional)

## Expected Results

After successful setup:
- ✅ Repository: https://github.com/yujie-wu/figma-restoration-mcp-vue-tools
- ✅ README.md displays correctly
- ✅ All 99+ files uploaded
- ✅ npm badge shows v1.0.1
- ✅ License file visible
- ✅ CLI documentation clear

## Troubleshooting

### If push fails:
```bash
# Check if repository exists
curl -s https://api.github.com/repos/yujie-wu/figma-restoration-mcp-vue-tools

# If 404, create repository first on GitHub
# If authentication error, check GitHub credentials
```

### If remote already exists:
```bash
git remote set-url origin https://github.com/yujie-wu/figma-restoration-mcp-vue-tools.git
```

### If authentication fails:
```bash
# Use GitHub CLI (if installed)
gh auth login

# Or check your GitHub credentials in system keychain
```

## Success Verification

Repository should show:
- 📦 Package name: `figma-restoration-mcp-vue-tools`
- 🔢 Version: `1.0.1` 
- 📊 Files: 99+ files
- 📝 README with installation instructions
- 🏷️ Tags: `v1.0.1`
- 🔗 Links to npm package working

## Final Links

After setup completion:
- **GitHub**: https://github.com/yujie-wu/figma-restoration-mcp-vue-tools
- **npm**: https://www.npmjs.com/package/figma-restoration-mcp-vue-tools
- **Installation**: `npm install -g figma-restoration-mcp-vue-tools`
