# GitHub Setup Commands

## Manual Setup Commands

Run these commands in order from the project directory:
`/Users/yujie_wu/Documents/work/camscanner-cloud-vue3/figma-restoration-mcp-vue-tools`

### 1. Verify Current Status
```bash
# Check current directory and git status
pwd
git status
git log --oneline -5
```

### 2. Add GitHub Remote
```bash
# Remove existing remote if it exists
git remote remove origin 2>/dev/null || true

# Add GitHub remote
git remote add origin https://github.com/yujie-wu/figma-restoration-mcp-vue-tools.git

# Verify remote was added
git remote -v
```

### 3. Push to GitHub
```bash
# Set main branch
git branch -M main

# Push main branch (first time)
git push -u origin main

# Push all tags
git push origin --tags
```

### 4. Verify Setup
```bash
# Check remote branches
git branch -r

# Verify latest commit
git log --oneline -1

# Check tags
git tag -l
```

## Expected Output

After successful setup, you should see:
- ✅ Remote origin pointing to GitHub
- ✅ Main branch pushed to GitHub
- ✅ All tags (like v1.0.1) pushed to GitHub
- ✅ Repository accessible at https://github.com/yujie-wu/figma-restoration-mcp-vue-tools

## Troubleshooting

### If remote already exists:
```bash
git remote set-url origin https://github.com/yujie-wu/figma-restoration-mcp-vue-tools.git
```

### If push fails due to authentication:
```bash
# Use GitHub CLI (if installed)
gh auth login

# Or use personal access token
# Go to GitHub Settings > Developer settings > Personal access tokens
```

### If repository doesn't exist on GitHub:
1. Go to https://github.com/new
2. Create repository named: `figma-restoration-mcp-vue-tools`
3. Set to Public
4. Don't initialize with README/license/gitignore
5. Then run the push commands above
