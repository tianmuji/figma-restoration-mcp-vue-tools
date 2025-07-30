#!/bin/bash

# Auto-start script for Figma Restoration MCP Vue Tools
# This script is called by VSCode when the workspace is opened

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
CONFIG_MANAGER="$SCRIPT_DIR/utils/config-manager.js"
STATUS_MANAGER="$SCRIPT_DIR/utils/status-manager.js"
ENV_CHECKER="$SCRIPT_DIR/utils/env-checker.js"
PORT_CHECKER="$SCRIPT_DIR/utils/port-checker.js"

# Logging function
log() {
    echo -e "${BLUE}[Auto-Start]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[Auto-Start]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[Auto-Start]${NC} $1"
}

log_error() {
    echo -e "${RED}[Auto-Start]${NC} $1"
}

# Error handling function
handle_error() {
    local error_code=$1
    local error_message="$2"
    local suggestion="$3"
    
    log_error "Error ($error_code): $error_message"
    
    if [[ -n "$suggestion" ]]; then
        echo -e "${CYAN}💡 Suggestion:${NC} $suggestion"
    fi
    
    # Update status with error
    local status_file="$PROJECT_ROOT/.vscode/auto-start-status.json"
    if [[ -f "$status_file" ]]; then
        node -e "
            try {
                const status = JSON.parse(require('fs').readFileSync('$status_file', 'utf8'));
                status.isRunning = false;
                status.pid = null;
                status.lastError = '$error_message';
                require('fs').writeFileSync('$status_file', JSON.stringify(status, null, 2));
            } catch (e) {
                // Ignore errors in error handler
            }
        " 2>/dev/null || true
    fi
    
    echo ""
    log_error "❌ Auto-start failed. You can:"
    echo -e "${BLUE}  • Run manually: yarn dev${NC}"
    echo -e "${BLUE}  • Check logs: cat .vscode/dev-server.log${NC}"
    echo -e "${BLUE}  • Disable auto-start: node $CONFIG_MANAGER set enabled false${NC}"
    echo ""
    
    exit $error_code
}

# Check if auto-start is enabled
check_enabled() {
    local enabled=$(node "$CONFIG_MANAGER" get enabled 2>/dev/null || echo "true")
    
    if [[ "$enabled" == "false" ]]; then
        log_warning "Auto-start is disabled in configuration"
        echo -e "${CYAN}💡 To enable: node $CONFIG_MANAGER set enabled true${NC}"
        return 1
    fi
    
    return 0
}

# Check if we should skip auto-start using status manager
should_skip() {
    # Check current status
    local status_output=$(node "$STATUS_MANAGER" status 2>/dev/null)
    
    # Check if already running
    if echo "$status_output" | grep -q "Status: Running"; then
        local pid=$(echo "$status_output" | grep "PID:" | awk '{print $2}' | head -1)
        
        log_warning "Development server is already running"
        if [[ -n "$pid" ]]; then
            echo -e "${CYAN}💡 Running process PID: $pid${NC}"
            echo -e "${CYAN}💡 To stop: ./scripts/stop-dev-server.sh${NC}"
        fi
        return 0
    fi
    
    # Check if started very recently (basic check)
    local status_file="$PROJECT_ROOT/.vscode/auto-start-status.json"
    if [[ -f "$status_file" ]]; then
        local start_time=$(node -e "
            try {
                const status = JSON.parse(require('fs').readFileSync('$status_file', 'utf8'));
                if (status.startTime) {
                    const start = new Date(status.startTime);
                    const now = new Date();
                    const seconds = (now - start) / 1000;
                    console.log(seconds);
                } else {
                    console.log('999');
                }
            } catch (e) {
                console.log('999');
            }
        " 2>/dev/null || echo "999")
        
        if [[ $(echo "$start_time < 30" | bc -l 2>/dev/null || echo "0") == "1" ]]; then
            log_warning "Development server was started recently (${start_time%.*} seconds ago)"
            return 0
        fi
    fi
    
    return 1
}

# Acquire startup lock to prevent concurrent starts
acquire_lock() {
    local lock_result=$(node "$STATUS_MANAGER" lock 2>&1)
    local lock_exit_code=$?
    
    if [[ $lock_exit_code -ne 0 ]]; then
        log_warning "$(echo "$lock_result" | grep -v "Lock not acquired" || echo "Lock acquisition failed")"
        return 1
    fi
    
    return 0
}

# Release startup lock
release_lock() {
    node "$STATUS_MANAGER" unlock 2>/dev/null || true
}

# Main auto-start function
main() {
    echo -e "${PURPLE}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${PURPLE}║                    🚀 Auto-Start System                     ║${NC}"
    echo -e "${PURPLE}║              Figma Restoration MCP Vue Tools                ║${NC}"
    echo -e "${PURPLE}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    log "Starting auto-start process..."
    
    # Change to project directory
    cd "$PROJECT_ROOT" || handle_error 1 "Failed to change to project directory" "Check if the project path exists"
    
    # Acquire startup lock
    if ! acquire_lock; then
        log "Another instance is already starting. Exiting."
        exit 0
    fi
    
    # Ensure lock is released on exit
    trap 'release_lock' EXIT
    
    # Check if auto-start is enabled
    if ! check_enabled; then
        log "Auto-start is disabled. Exiting."
        exit 0
    fi
    
    # Check if we should skip
    if should_skip; then
        log "Skipping auto-start"
        exit 0
    fi
    
    log "🔍 Checking environment..."
    
    # Run environment check
    if ! node "$ENV_CHECKER" 2>/dev/null; then
        handle_error 2 "Environment check failed" "Run 'node $ENV_CHECKER' to see detailed issues"
    fi
    
    log_success "✅ Environment check passed"
    
    # Get configuration values
    local preferred_port=$(node "$CONFIG_MANAGER" get port 2>/dev/null || echo "1932")
    local dev_command=$(node "$CONFIG_MANAGER" get command 2>/dev/null || echo "yarn dev")
    local timeout=$(node "$CONFIG_MANAGER" get timeout 2>/dev/null || echo "30000")
    
    log "🔍 Checking port availability (preferred: $preferred_port)..."
    
    # Use port checker to find available port
    local port_result=$(node "$PORT_CHECKER" "$preferred_port" 2>&1)
    local port_exit_code=$?
    
    # Extract selected port from port checker output
    local selected_port=$(echo "$port_result" | grep -o "Port [0-9]*: Available" | grep -o "[0-9]*" | head -1)
    if [[ -z "$selected_port" ]]; then
        selected_port="$preferred_port"
    fi
    
    if [[ $port_exit_code -ne 0 ]]; then
        log_warning "⚠️  Port check completed with warnings"
        echo "$port_result" | grep -E "(Port|Process|Suggestion)" || true
    else
        log_success "✅ Port $selected_port is available"
    fi
    
    log "🚀 Starting development server..."
    log "   Command: $dev_command"
    log "   Port: $selected_port"
    log "   Timeout: ${timeout}ms"
    
    # Initialize status tracking
    local status_file="$PROJECT_ROOT/.vscode/auto-start-status.json"
    mkdir -p "$(dirname "$status_file")"
    
    node -e "
        const status = {
            isRunning: false,
            pid: null,
            port: $selected_port,
            command: '$dev_command',
            startTime: new Date().toISOString(),
            lastError: null,
            retryCount: 0,
            version: '1.0.0'
        };
        require('fs').writeFileSync('$status_file', JSON.stringify(status, null, 2));
    " 2>/dev/null || true
    
    # Start the development server in the background
    local log_file="$PROJECT_ROOT/.vscode/dev-server.log"
    
    # Clear previous log
    > "$log_file"
    
    # Start server with nohup
    nohup $dev_command > "$log_file" 2>&1 &
    local dev_pid=$!
    
    log "   PID: $dev_pid"
    log "   Log: $log_file"
    
    # Wait a moment to see if the process started successfully
    sleep 3
    
    # Check if the process is still running
    if kill -0 $dev_pid 2>/dev/null; then
        # Update status with successful start
        node -e "
            const status = {
                isRunning: true,
                pid: $dev_pid,
                port: $selected_port,
                command: '$dev_command',
                startTime: new Date().toISOString(),
                lastError: null,
                retryCount: 0,
                version: '1.0.0'
            };
            require('fs').writeFileSync('$status_file', JSON.stringify(status, null, 2));
        " 2>/dev/null || true
        
        echo ""
        echo -e "${GREEN}╔══════════════════════════════════════════════════════════════╗${NC}"
        echo -e "${GREEN}║                   ✅ SUCCESS!                               ║${NC}"
        echo -e "${GREEN}║              Development server started                     ║${NC}"
        echo -e "${GREEN}╚══════════════════════════════════════════════════════════════╝${NC}"
        echo ""
        
        log_success "🚀 Development server is running!"
        echo -e "${CYAN}   📊 Process ID: $dev_pid${NC}"
        echo -e "${CYAN}   🌐 Server URL: http://localhost:$selected_port${NC}"
        echo -e "${CYAN}   📝 Log file: $log_file${NC}"
        echo -e "${CYAN}   ⏹️  Stop command: ./scripts/stop-dev-server.sh${NC}"
        echo ""
        
        # Show first few lines of log to confirm startup
        if [[ -f "$log_file" ]] && [[ -s "$log_file" ]]; then
            log "📋 Server startup output:"
            echo -e "${BLUE}$(head -n 5 "$log_file")${NC}"
            echo ""
        fi
        
        log_success "🎉 Auto-start completed successfully!"
        
    else
        # Server failed to start
        handle_error 3 "Development server failed to start" "Check the log file: $log_file"
    fi
}

# Handle script interruption
cleanup() {
    log "Auto-start script interrupted"
    exit 1
}

trap cleanup INT TERM

# Run main function
main "$@"