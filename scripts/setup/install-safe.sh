#!/bin/bash

# Safe Installation Script for figma-restoration-mcp-vue-tools
# Handles Puppeteer installation issues and registry problems

set -e

echo "🚀 Safe Installation Script for figma-restoration-mcp-vue-tools"
echo "================================================================"

# Function to detect package manager
detect_package_manager() {
    if command -v yarn >/dev/null 2>&1 && [ -f "yarn.lock" ]; then
        echo "yarn"
    elif command -v pnpm >/dev/null 2>&1 && [ -f "pnpm-lock.yaml" ]; then
        echo "pnpm"
    else
        echo "npm"
    fi
}

# Function to check registry
check_registry() {
    local pm=$1
    case $pm in
        yarn)
            yarn config get registry
            ;;
        pnpm)
            pnpm config get registry
            ;;
        npm)
            npm config get registry
            ;;
    esac
}

# Function to set registry
set_registry() {
    local pm=$1
    local registry=$2
    case $pm in
        yarn)
            yarn config set registry "$registry"
            ;;
        pnpm)
            pnpm config set registry "$registry"
            ;;
        npm)
            npm config set registry "$registry"
            ;;
    esac
}

# Function to install with safe settings
safe_install() {
    local pm=$1
    local package=$2
    local flags=$3
    
    echo "📦 Installing $package with $pm..."
    
    # Set Puppeteer environment variables
    export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
    export PUPPETEER_DOWNLOAD_HOST=https://registry.npmjs.org
    export PUPPETEER_CHROMIUM_REVISION=""
    
    case $pm in
        yarn)
            yarn add $flags "$package" --registry https://registry.npmjs.org/
            ;;
        pnpm)
            pnpm add $flags "$package" --registry https://registry.npmjs.org/
            ;;
        npm)
            npm install $flags "$package" --registry https://registry.npmjs.org/
            ;;
    esac
}

# Main installation logic
main() {
    local package_name="figma-restoration-mcp-vue-tools"
    local install_flags=""
    local global_install=false
    
    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            -g|--global)
                global_install=true
                install_flags="-g"
                shift
                ;;
            -D|--save-dev)
                install_flags="--save-dev"
                shift
                ;;
            -S|--save)
                install_flags="--save"
                shift
                ;;
            *)
                echo "Unknown option: $1"
                echo "Usage: $0 [-g|--global] [-D|--save-dev] [-S|--save]"
                exit 1
                ;;
        esac
    done
    
    # Detect package manager
    local pm=$(detect_package_manager)
    echo "📋 Detected package manager: $pm"
    
    # Check current registry
    local current_registry=$(check_registry $pm)
    echo "🔍 Current registry: $current_registry"
    
    # Check if using problematic registry
    if [[ "$current_registry" == *"taobao"* ]] || [[ "$current_registry" == *"cnpm"* ]]; then
        echo "⚠️  Detected Chinese registry that may cause Puppeteer issues"
        echo "🔄 Using official npm registry for this installation..."
    fi
    
    # Perform safe installation
    if safe_install "$pm" "$package_name" "$install_flags"; then
        echo "✅ Installation successful!"
        
        if [ "$global_install" = true ]; then
            echo "🎉 You can now use: npx figma-restoration-mcp-vue-tools"
        else
            echo "🎉 Package added to your project dependencies"
        fi
        
        echo ""
        echo "📚 Next steps:"
        echo "1. Initialize configuration: npx figma-restoration-mcp-vue-tools init"
        echo "2. Start MCP server: npx figma-restoration-mcp-vue-tools start"
        echo "3. Check documentation: https://github.com/tianmuji/figma-restoration-mcp-vue-tools"
        
    else
        echo "❌ Installation failed"
        echo ""
        echo "🔧 Troubleshooting:"
        echo "1. Try clearing cache: $pm cache clean"
        echo "2. Check network connection"
        echo "3. Try with different registry: $pm config set registry https://registry.npmjs.org/"
        echo "4. Manual install: PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true $pm add $install_flags $package_name"
        exit 1
    fi
}

# Run main function with all arguments
main "$@"
