#!/bin/bash

# Figma Restoration Kit - Installation Script
# This script sets up the Figma Restoration Kit for use as a standalone package or submodule

set -e  # Exit on any error

echo "🚀 Figma Restoration Kit - Installation Script"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if we're in the correct directory
if [ ! -f "package.json" ]; then
    log_error "Please run this script from the mcp-vue-tools directory"
    exit 1
fi

# Check Node.js version
log_info "Checking Node.js version..."
NODE_VERSION=$(node --version | cut -d'v' -f2)
REQUIRED_VERSION="18.0.0"

if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" != "$REQUIRED_VERSION" ]; then
    log_error "Node.js version $REQUIRED_VERSION or higher is required. Current version: $NODE_VERSION"
    exit 1
fi
log_success "Node.js version check passed: $NODE_VERSION"

# Check if yarn is available, fallback to npm
if command -v yarn &> /dev/null; then
    PACKAGE_MANAGER="yarn"
    log_info "Using Yarn package manager"
else
    PACKAGE_MANAGER="npm"
    log_info "Using NPM package manager"
fi

# Install dependencies
log_info "Installing dependencies..."
if [ "$PACKAGE_MANAGER" = "yarn" ]; then
    yarn install
else
    npm install
fi
log_success "Dependencies installed successfully"

# Detect Chrome installation
log_info "Detecting Chrome installation..."
CHROME_PATH=""

if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    if [ -f "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" ]; then
        CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
    fi
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    if command -v google-chrome &> /dev/null; then
        CHROME_PATH=$(which google-chrome)
    elif command -v chromium-browser &> /dev/null; then
        CHROME_PATH=$(which chromium-browser)
    fi
elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
    # Windows
    if [ -f "/c/Program Files/Google/Chrome/Application/chrome.exe" ]; then
        CHROME_PATH="C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
    fi
fi

if [ -n "$CHROME_PATH" ]; then
    log_success "Chrome found at: $CHROME_PATH"
else
    log_warning "Chrome not found automatically. You may need to set PUPPETEER_EXECUTABLE_PATH manually."
    CHROME_PATH="CHROME_PATH_NOT_FOUND"
fi

# Get absolute path of current directory
CURRENT_DIR=$(pwd)
PROJECT_ROOT=$(dirname "$CURRENT_DIR")

# Create configuration from template
log_info "Creating MCP configuration..."
if [ -f "config/mcp-config.template.json" ]; then
    # Replace placeholders in template
    sed "s|{{PROJECT_ROOT}}|$PROJECT_ROOT|g; s|{{CHROME_PATH}}|$CHROME_PATH|g; s|{{FIGMA_TOKEN}}|YOUR_FIGMA_TOKEN_HERE|g" \
        config/mcp-config.template.json > config/mcp-config.json
    log_success "MCP configuration created at config/mcp-config.json"
else
    log_warning "MCP configuration template not found, creating basic config..."
    cat > config/mcp-config.json << EOF
{
  "mcpServers": {
    "figma-restoration-kit": {
      "command": "node",
      "args": ["src/server.js"],
      "cwd": "$CURRENT_DIR",
      "env": {
        "PUPPETEER_EXECUTABLE_PATH": "$CHROME_PATH",
        "NODE_ENV": "development",
        "PROJECT_ROOT": "$PROJECT_ROOT"
      }
    }
  }
}
EOF
    log_success "Basic MCP configuration created"
fi

# Create environment file
log_info "Creating environment configuration..."
cat > .env << EOF
# Figma Restoration Kit Environment Configuration
PUPPETEER_EXECUTABLE_PATH="$CHROME_PATH"
NODE_ENV=development
PROJECT_ROOT="$PROJECT_ROOT"

# Optional: Add your Figma token for direct API access
# FIGMA_PERSONAL_ACCESS_TOKEN=your_token_here
EOF
log_success "Environment file created at .env"

# Create cursor rules if template exists
if [ -f "config/cursor-rules.template.md" ]; then
    log_info "Creating cursor rules..."
    cp config/cursor-rules.template.md ../cursor-rules-figma-kit.md
    log_success "Cursor rules created at ../cursor-rules-figma-kit.md"
fi

# Test installation
log_info "Testing installation..."
if [ "$PACKAGE_MANAGER" = "yarn" ]; then
    yarn test > /dev/null 2>&1 || log_warning "Installation test failed - this may be normal if no test components exist"
else
    npm test > /dev/null 2>&1 || log_warning "Installation test failed - this may be normal if no test components exist"
fi

# Create necessary directories
log_info "Creating necessary directories..."
mkdir -p output results temp assets/icons assets/images examples/components examples/workflows
log_success "Directory structure created"

# Make scripts executable
chmod +x scripts/*.sh 2>/dev/null || true

echo ""
echo "🎉 Installation completed successfully!"
echo "======================================"
echo ""
log_info "Next steps:"
echo "1. Copy the MCP configuration to your IDE:"
echo "   📁 config/mcp-config.json"
echo ""
echo "2. Start the MCP server:"
echo "   🚀 yarn mcp (or npm run mcp)"
echo ""
echo "3. Configure your IDE with the MCP settings and restart"
echo ""
echo "4. Optional: Set up Figma token in .env file for direct API access"
echo ""
log_info "Documentation:"
echo "📖 README-EN.md - English documentation"
echo "📖 docs/installation.md - Detailed installation guide"
echo "📖 docs/workflow.md - Figma restoration workflow"
echo ""
log_info "Configuration files created:"
echo "⚙️  config/mcp-config.json - MCP server configuration"
echo "🌍 .env - Environment variables"
echo "📋 ../cursor-rules-figma-kit.md - Cursor rules (if template existed)"
echo ""
log_success "Ready to start restoring Figma designs! 🎨"
