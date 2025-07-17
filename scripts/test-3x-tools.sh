#!/bin/bash

# 测试三倍图截图和对比工具
# Test 3x screenshot and comparison tools

echo "🧪 Testing 3x Screenshot and Box-shadow Support"
echo "================================================"

# 检查Node.js版本
echo "📋 Checking Node.js version..."
node --version

# 检查依赖
echo "📦 Checking dependencies..."
if ! npm list sharp > /dev/null 2>&1; then
    echo "❌ Sharp not found, installing..."
    npm install sharp
fi

if ! npm list puppeteer > /dev/null 2>&1; then
    echo "❌ Puppeteer not found, installing..."
    npm install puppeteer
fi

# 运行测试脚本
echo "🚀 Running 3x screenshot tests..."
node test-3x-screenshot.js

# 检查生成的文件
echo "📁 Checking generated files..."
RESULTS_DIR="results/TestComponent"

if [ -d "$RESULTS_DIR" ]; then
    echo "✅ Results directory exists: $RESULTS_DIR"
    
    if [ -f "$RESULTS_DIR/snapdom-screenshot.png" ]; then
        echo "✅ Screenshot file generated"
        
        # 使用ImageMagick检查图片信息（如果可用）
        if command -v identify > /dev/null 2>&1; then
            echo "📐 Image information:"
            identify "$RESULTS_DIR/snapdom-screenshot.png"
        fi
    else
        echo "❌ Screenshot file not found"
    fi
    
    if [ -f "$RESULTS_DIR/figma-analysis-report.md" ]; then
        echo "✅ Analysis report generated"
        echo "📄 Report preview:"
        head -20 "$RESULTS_DIR/figma-analysis-report.md"
    else
        echo "⚠️  Analysis report not found (expected.png may be missing)"
    fi
else
    echo "❌ Results directory not found"
fi

echo ""
echo "🎉 Test completed!"
echo "Check the results directory for generated files."
echo "For manual testing, use the MCP tools directly."
