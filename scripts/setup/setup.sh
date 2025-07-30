#!/bin/bash

# Figma Restoration Kit - Setup Script
# This script provides additional setup options and configuration

set -e

echo "🔧 Figma Restoration Kit - Setup Script"
echo "======================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

# Function to prompt for user input
prompt_user() {
    local prompt="$1"
    local default="$2"
    local result
    
    if [ -n "$default" ]; then
        read -p "$prompt [$default]: " result
        result=${result:-$default}
    else
        read -p "$prompt: " result
    fi
    
    echo "$result"
}

# Function to validate Figma token
validate_figma_token() {
    local token="$1"
    if [ ${#token} -lt 10 ]; then
        return 1
    fi
    return 0
}

echo ""
log_info "This script will help you configure the Figma Restoration Kit"
echo ""

# Ask for setup type
echo "Setup Options:"
echo "1. Basic setup (use existing configuration)"
echo "2. Custom setup (configure paths and tokens)"
echo "3. Development setup (additional dev tools)"
echo ""

SETUP_TYPE=$(prompt_user "Choose setup type (1-3)" "1")

case $SETUP_TYPE in
    1)
        log_info "Using basic setup..."
        ;;
    2)
        log_info "Starting custom setup..."
        
        # Get project root
        CURRENT_DIR=$(pwd)
        DEFAULT_PROJECT_ROOT=$(dirname "$CURRENT_DIR")
        PROJECT_ROOT=$(prompt_user "Project root directory" "$DEFAULT_PROJECT_ROOT")
        
        # Get Chrome path
        if [[ "$OSTYPE" == "darwin"* ]]; then
            DEFAULT_CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
        elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
            DEFAULT_CHROME=$(which google-chrome 2>/dev/null || which chromium-browser 2>/dev/null || echo "/usr/bin/google-chrome")
        else
            DEFAULT_CHROME="C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
        fi
        
        CHROME_PATH=$(prompt_user "Chrome executable path" "$DEFAULT_CHROME")
        
        # Get Figma token
        echo ""
        log_info "Figma Personal Access Token (optional but recommended)"
        echo "Get your token from: https://www.figma.com/developers/api#access-tokens"
        FIGMA_TOKEN=$(prompt_user "Figma token (leave empty to skip)" "")
        
        if [ -n "$FIGMA_TOKEN" ] && ! validate_figma_token "$FIGMA_TOKEN"; then
            log_warning "Figma token seems invalid (too short), but continuing..."
        fi
        
        # Update configuration
        log_info "Updating configuration files..."
        
        # Update MCP config
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
    }$([ -n "$FIGMA_TOKEN" ] && echo ",
    \"figma\": {
      \"command\": \"npx\",
      \"args\": [\"-y\", \"@modelcontextprotocol/server-figma\"],
      \"env\": {
        \"FIGMA_PERSONAL_ACCESS_TOKEN\": \"$FIGMA_TOKEN\"
      }
    }")
  }
}
EOF
        
        # Update .env file
        cat > .env << EOF
PUPPETEER_EXECUTABLE_PATH="$CHROME_PATH"
NODE_ENV=development
PROJECT_ROOT="$PROJECT_ROOT"
$([ -n "$FIGMA_TOKEN" ] && echo "FIGMA_PERSONAL_ACCESS_TOKEN=\"$FIGMA_TOKEN\"")
EOF
        
        log_success "Configuration updated with custom settings"
        ;;
    3)
        log_info "Setting up development environment..."
        
        # Install additional dev dependencies
        if command -v yarn &> /dev/null; then
            yarn add --dev @types/node typescript eslint prettier
        else
            npm install --save-dev @types/node typescript eslint prettier
        fi
        
        # Create development scripts
        cat > scripts/dev-server.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting development server with hot reload..."
export NODE_ENV=development
nodemon --watch src --ext js,mjs src/server.js
EOF
        
        chmod +x scripts/dev-server.sh
        
        log_success "Development environment configured"
        ;;
    *)
        log_error "Invalid setup type selected"
        exit 1
        ;;
esac

# Test MCP server
echo ""
log_info "Testing MCP server configuration..."

# Start server in background for testing
node src/server.js &
SERVER_PID=$!
sleep 3

# Check if server is running
if kill -0 $SERVER_PID 2>/dev/null; then
    log_success "MCP server test passed"
    kill $SERVER_PID
else
    log_warning "MCP server test failed - check configuration"
fi

# Create example component if requested
echo ""
read -p "Create example component for testing? (y/n) [y]: " CREATE_EXAMPLE
CREATE_EXAMPLE=${CREATE_EXAMPLE:-y}

if [[ "$CREATE_EXAMPLE" =~ ^[Yy]$ ]]; then
    log_info "Creating example component..."
    
    mkdir -p examples/components
    cat > examples/components/HelloWorld.vue << 'EOF'
<template>
  <div class="hello-world">
    <h1>{{ title }}</h1>
    <p>{{ message }}</p>
    <el-button type="primary" @click="handleClick">
      Click me!
    </el-button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElButton } from 'element-plus'

const title = ref('Hello World')
const message = ref('This is an example component for testing the Figma Restoration Kit.')

const handleClick = () => {
  message.value = 'Button clicked! The kit is working correctly.'
}
</script>

<style scoped>
.hello-world {
  padding: 20px;
  text-align: center;
  font-family: Arial, sans-serif;
}

h1 {
  color: #2c3e50;
  margin-bottom: 16px;
}

p {
  color: #7f8c8d;
  margin-bottom: 20px;
  line-height: 1.6;
}
</style>
EOF
    
    log_success "Example component created at examples/components/HelloWorld.vue"
fi

# Generate usage instructions
echo ""
log_info "Generating usage instructions..."

cat > USAGE.md << EOF
# Figma Restoration Kit - Usage Instructions

## Quick Start

1. **Start the MCP server:**
   \`\`\`bash
   yarn mcp
   \`\`\`

2. **In your IDE with MCP enabled, test the tools:**
   \`\`\`javascript
   // Test server status
   await vue_dev_server({ action: "status" });
   
   // Save a test component
   await save_vue_component({
     componentName: "TestComponent",
     vueCode: "your-vue-code-here"
   });
   \`\`\`

## Configuration Files

- **config/mcp-config.json** - MCP server configuration
- **.env** - Environment variables
- **examples/** - Example components and workflows

## Next Steps

1. Read the documentation in docs/
2. Try the example component in examples/components/
3. Start restoring your Figma designs!

## Support

- Check docs/troubleshooting.md for common issues
- Review examples/ for working code samples
- Open an issue on GitHub for help
EOF

echo ""
log_success "Setup completed successfully!"
echo "=========================="
echo ""
log_info "Configuration summary:"
echo "📁 MCP config: config/mcp-config.json"
echo "🌍 Environment: .env"
echo "📖 Usage guide: USAGE.md"
echo ""
log_info "To start using the kit:"
echo "1. Start MCP server: yarn mcp"
echo "2. Configure your IDE with the MCP settings"
echo "3. Restart your IDE"
echo "4. Start restoring Figma designs!"
echo ""
log_success "Happy designing! 🎨"
