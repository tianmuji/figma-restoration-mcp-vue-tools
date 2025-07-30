#!/bin/bash

# Figma Restoration Kit - MCP Server Startup Script

echo "🚀 Starting Figma Restoration Kit MCP Server..."

# Get the absolute path of the script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo "📁 Project directory: $PROJECT_DIR"

# Check if server file exists
if [ ! -f "$PROJECT_DIR/src/server.js" ]; then
    echo "❌ Error: server.js not found at $PROJECT_DIR/src/server.js"
    exit 1
fi

echo "✅ Server file found"

# Set environment variables
export CHROME_EXECUTABLE_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
export NODE_ENV="development"
export PROJECT_ROOT="$(dirname "$PROJECT_DIR")"

echo "🌍 Environment variables set:"
echo "   CHROME_EXECUTABLE_PATH: $CHROME_EXECUTABLE_PATH"
echo "   NODE_ENV: $NODE_ENV"
echo "   PROJECT_ROOT: $PROJECT_ROOT"

# Change to project directory
cd "$PROJECT_DIR"

echo "📂 Working directory: $(pwd)"
echo "🔧 Starting MCP server..."

# Start the server
node src/server.js
