#!/bin/bash

# Figma Restoration Kit - Installation Test Script
# This script tests the installation and verifies all components are working

set -e

echo "🧪 Figma Restoration Kit - Installation Test"
echo "============================================"

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

# Test counters
TESTS_PASSED=0
TESTS_FAILED=0
TESTS_TOTAL=0

# Function to run a test
run_test() {
    local test_name="$1"
    local test_command="$2"
    
    TESTS_TOTAL=$((TESTS_TOTAL + 1))
    log_info "Testing: $test_name"
    
    if eval "$test_command" > /dev/null 2>&1; then
        log_success "$test_name - PASSED"
        TESTS_PASSED=$((TESTS_PASSED + 1))
        return 0
    else
        log_error "$test_name - FAILED"
        TESTS_FAILED=$((TESTS_FAILED + 1))
        return 1
    fi
}

# Check if we're in the correct directory
if [ ! -f "package.json" ]; then
    log_error "Please run this script from the mcp-vue-tools directory"
    exit 1
fi

echo ""
log_info "Starting installation tests..."
echo ""

# Test 1: Check Node.js version
run_test "Node.js version (>=18.0.0)" "node --version | grep -E 'v(1[8-9]|[2-9][0-9])'"

# Test 2: Check package.json exists and is valid
run_test "Package.json validity" "node -e 'JSON.parse(require(\"fs\").readFileSync(\"package.json\"))'"

# Test 3: Check dependencies are installed
run_test "Node modules installed" "[ -d node_modules ]"

# Test 4: Check main dependencies
run_test "MCP SDK dependency" "[ -d node_modules/@modelcontextprotocol ]"
run_test "Vue dependency" "[ -d node_modules/vue ]"
run_test "Puppeteer dependency" "[ -d node_modules/puppeteer ]"

# Test 5: Check configuration files
run_test "MCP configuration exists" "[ -f config/mcp-config.json ]"
run_test "Environment file exists" "[ -f .env ]"

# Test 6: Check directory structure
run_test "Source directory exists" "[ -d src ]"
run_test "Server file exists" "[ -f src/server.js ]"
run_test "Output directory exists" "[ -d output ]"
run_test "Results directory exists" "[ -d results ]"

# Test 7: Check scripts are executable
run_test "Install script executable" "[ -x scripts/install.sh ]"
run_test "Setup script executable" "[ -x scripts/setup.sh ]"

# Test 8: Test MCP server syntax
run_test "MCP server syntax check" "node --check src/server.js"

# Test 9: Test Chrome/Chromium availability
CHROME_TEST=false
if [ -f "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" ]; then
    CHROME_TEST=true
elif command -v google-chrome &> /dev/null; then
    CHROME_TEST=true
elif command -v chromium-browser &> /dev/null; then
    CHROME_TEST=true
fi

if [ "$CHROME_TEST" = true ]; then
    log_success "Chrome/Chromium availability - PASSED"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    log_warning "Chrome/Chromium availability - WARNING (not found, but may be configured manually)"
fi
TESTS_TOTAL=$((TESTS_TOTAL + 1))

# Test 10: Test MCP server startup (quick test)
log_info "Testing: MCP server startup"
timeout 10s node src/server.js &
SERVER_PID=$!
sleep 3

if kill -0 $SERVER_PID 2>/dev/null; then
    log_success "MCP server startup - PASSED"
    TESTS_PASSED=$((TESTS_PASSED + 1))
    kill $SERVER_PID 2>/dev/null
else
    log_error "MCP server startup - FAILED"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi
TESTS_TOTAL=$((TESTS_TOTAL + 1))

# Test 11: Test example component creation
log_info "Testing: Example component creation"
if [ -f "examples/components/HelloWorld.vue" ]; then
    log_success "Example component creation - PASSED"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    log_warning "Example component creation - SKIPPED (no example component found)"
fi
TESTS_TOTAL=$((TESTS_TOTAL + 1))

# Test 12: Test documentation files
run_test "README documentation exists" "[ -f README-EN.md ]"
run_test "Installation guide exists" "[ -f docs/installation.md ]"
run_test "Workflow guide exists" "[ -f docs/workflow.md ]"

# Test 13: Test package manager commands
if command -v yarn &> /dev/null; then
    run_test "Yarn commands work" "yarn --version"
else
    run_test "NPM commands work" "npm --version"
fi

echo ""
echo "🏁 Test Results Summary"
echo "======================"
echo ""
log_info "Tests completed: $TESTS_TOTAL"
log_success "Tests passed: $TESTS_PASSED"

if [ $TESTS_FAILED -gt 0 ]; then
    log_error "Tests failed: $TESTS_FAILED"
else
    log_success "Tests failed: $TESTS_FAILED"
fi

# Calculate success rate
SUCCESS_RATE=$((TESTS_PASSED * 100 / TESTS_TOTAL))
echo ""
log_info "Success rate: $SUCCESS_RATE%"

# Determine overall result
if [ $SUCCESS_RATE -ge 90 ]; then
    echo ""
    log_success "🎉 Installation test PASSED! The kit is ready to use."
    echo ""
    log_info "Next steps:"
    echo "1. Start the MCP server: yarn mcp"
    echo "2. Configure your IDE with MCP settings"
    echo "3. Start restoring Figma designs!"
    echo ""
    exit 0
elif [ $SUCCESS_RATE -ge 70 ]; then
    echo ""
    log_warning "⚠️  Installation test PARTIALLY PASSED. Some issues detected."
    echo ""
    log_info "The kit should work, but you may encounter some issues."
    log_info "Check the failed tests above and refer to docs/troubleshooting.md"
    echo ""
    exit 1
else
    echo ""
    log_error "❌ Installation test FAILED. Multiple issues detected."
    echo ""
    log_info "Please fix the issues above before using the kit."
    log_info "Refer to docs/installation.md and docs/troubleshooting.md for help."
    echo ""
    exit 2
fi
