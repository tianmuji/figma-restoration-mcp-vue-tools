#!/bin/bash

# Stop development server script
# This script stops the development server started by auto-start.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
STATUS_FILE="$PROJECT_ROOT/.vscode/auto-start-status.json"

# Logging function
log() {
    echo -e "${BLUE}[Stop-Server]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[Stop-Server]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[Stop-Server]${NC} $1"
}

log_error() {
    echo -e "${RED}[Stop-Server]${NC} $1"
}

# Update status file
update_status() {
    if [[ -f "$STATUS_FILE" ]]; then
        node -e "
            try {
                const status = JSON.parse(require('fs').readFileSync('$STATUS_FILE', 'utf8'));
                status.isRunning = false;
                status.pid = null;
                status.lastError = null;
                require('fs').writeFileSync('$STATUS_FILE', JSON.stringify(status, null, 2));
            } catch (e) {
                console.error('Failed to update status file:', e.message);
            }
        "
    fi
}

# Kill process by PID
kill_process() {
    local pid="$1"
    local process_name="$2"
    
    if kill -0 "$pid" 2>/dev/null; then
        log "Stopping $process_name (PID: $pid)..."
        
        # Try graceful termination first
        if kill -TERM "$pid" 2>/dev/null; then
            # Wait up to 5 seconds for graceful shutdown
            local count=0
            while kill -0 "$pid" 2>/dev/null && [[ $count -lt 5 ]]; do
                sleep 1
                ((count++))
            done
            
            # If still running, force kill
            if kill -0 "$pid" 2>/dev/null; then
                log_warning "Process didn't stop gracefully, force killing..."
                kill -KILL "$pid" 2>/dev/null || true
            fi
            
            log_success "Stopped $process_name"
            return 0
        else
            log_error "Failed to send termination signal to $process_name"
            return 1
        fi
    else
        log_warning "$process_name (PID: $pid) is not running"
        return 0
    fi
}

# Find and kill development server processes
kill_dev_servers() {
    local killed_any=false
    
    # Look for common development server processes
    local pids
    
    # Find Vite processes
    pids=$(pgrep -f "vite" 2>/dev/null || true)
    if [[ -n "$pids" ]]; then
        for pid in $pids; do
            # Check if this is our project's process
            local cmd=$(ps -p "$pid" -o command= 2>/dev/null || true)
            if [[ "$cmd" == *"vite"* ]] && [[ "$cmd" != *"pgrep"* ]]; then
                kill_process "$pid" "Vite server"
                killed_any=true
            fi
        done
    fi
    
    # Find Node processes that might be our dev server
    pids=$(pgrep -f "node.*dev" 2>/dev/null || true)
    if [[ -n "$pids" ]]; then
        for pid in $pids; do
            local cmd=$(ps -p "$pid" -o command= 2>/dev/null || true)
            if [[ "$cmd" == *"yarn dev"* ]] || [[ "$cmd" == *"npm run dev"* ]]; then
                kill_process "$pid" "Node dev server"
                killed_any=true
            fi
        done
    fi
    
    if [[ "$killed_any" == true ]]; then
        return 0
    else
        return 1
    fi
}

# Main function
main() {
    log "Stopping development server..."
    
    cd "$PROJECT_ROOT"
    
    local stopped_any=false
    
    # First, try to stop using the status file
    if [[ -f "$STATUS_FILE" ]]; then
        local pid=$(node -e "
            try {
                const status = JSON.parse(require('fs').readFileSync('$STATUS_FILE', 'utf8'));
                console.log(status.pid || '');
            } catch (e) {
                console.log('');
            }
        ")
        
        if [[ -n "$pid" ]] && [[ "$pid" != "null" ]]; then
            if kill_process "$pid" "Development server"; then
                stopped_any=true
            fi
        fi
    fi
    
    # Also try to find and kill any remaining dev server processes
    if kill_dev_servers; then
        stopped_any=true
    fi
    
    # Kill processes using common development ports
    local common_ports=(1932 3000 5173 8080)
    for port in "${common_ports[@]}"; do
        local port_pids=$(lsof -ti :$port 2>/dev/null || true)
        if [[ -n "$port_pids" ]]; then
            for pid in $port_pids; do
                local cmd=$(ps -p "$pid" -o command= 2>/dev/null || true)
                if [[ "$cmd" == *"node"* ]] || [[ "$cmd" == *"vite"* ]]; then
                    kill_process "$pid" "Process on port $port"
                    stopped_any=true
                fi
            done
        fi
    done
    
    # Update status
    update_status
    
    if [[ "$stopped_any" == true ]]; then
        log_success "Development server stopped successfully"
    else
        log_warning "No running development server found"
    fi
    
    # Clean up log file
    local log_file="$PROJECT_ROOT/.vscode/dev-server.log"
    if [[ -f "$log_file" ]]; then
        rm -f "$log_file"
        log "Cleaned up log file"
    fi
    
    echo ""
    log_success "✅ Stop operation completed"
}

# Handle script interruption
cleanup() {
    log "Stop script interrupted"
    exit 1
}

trap cleanup INT TERM

# Run main function
main "$@"