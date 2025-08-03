#!/bin/bash

# Clean Reset Dry-Run Test - Bash Version
# Simulates what the SystemCleanupManager would analyze and clean

# Auto-detect CES location for portability
if [[ -n "${CES_ROOT}" ]]; then
    # Already set by environment
    echo "Using CES_ROOT from environment: $CES_ROOT"
else
    # Auto-detect based on script location
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    
    # Check if we're in ces/scripts/ or just ces/
    if [[ "$(basename "$(dirname "$SCRIPT_DIR")")" == "ces" ]]; then
        CES_ROOT="$(dirname "$SCRIPT_DIR")"
    else
        CES_ROOT="$SCRIPT_DIR"
    fi
fi

PROJECT_ROOT="$(dirname "$CES_ROOT")"
export CES_ROOT PROJECT_ROOT

echo "🧹 CLEAN RESET TEST - DRY RUN MODE"
echo "=================================================="
echo "📁 Project: $(basename $(pwd))"
echo "⏰ Time: $(date +%T)"
echo ""
echo "🔍 DRY RUN MODE - No actual changes will be made"
echo ""

# Function to safely check commands
safe_check() {
    local description="$1"
    local command="$2"
    echo "🔍 Checking: $description"
    
    if eval "$command" >/dev/null 2>&1; then
        local result=$(eval "$command" 2>/dev/null | head -5)
        if [ -n "$result" ]; then
            echo "   ✓ $description: Found"
            echo "$result" | sed 's/^/      /'
        else
            echo "   ✅ $description: Clean"
        fi
    else
        echo "   ⚠️  $description: Not available or no results"
    fi
    echo ""
}

echo "📊 ANALYSIS: Current System State"
echo ""

# Check for Node.js processes
echo "🔧 NODE.JS PROCESSES:"
if command -v pgrep >/dev/null 2>&1; then
    node_count=$(pgrep -f node 2>/dev/null | wc -l)
    echo "   📡 Node.js processes running: $node_count"
    if [ "$node_count" -gt 0 ]; then
        echo "   🔍 Active Node processes:"
        pgrep -f node 2>/dev/null | head -5 | while read pid; do
            if ps -p "$pid" -o comm= 2>/dev/null; then
                echo "      • PID $pid: $(ps -p "$pid" -o comm= 2>/dev/null)"
            fi
        done
    fi
else
    echo "   ⚠️  pgrep not available - cannot check Node processes"
fi
echo ""

# Check common development ports
echo "🔓 PORT ANALYSIS:"
common_ports=(3000 3001 5000 8000 8080 27017 5432)

for port in "${common_ports[@]}"; do
    if command -v lsof >/dev/null 2>&1; then
        port_check=$(lsof -ti:$port 2>/dev/null | wc -l)
        if [ "$port_check" -gt 0 ]; then
            echo "   🟡 Port $port: IN USE ($port_check processes)"
            lsof -ti:$port 2>/dev/null | head -3 | while read pid; do
                process_name=$(ps -p "$pid" -o comm= 2>/dev/null || echo "unknown")
                echo "      • PID $pid: $process_name"
            done
        else
            echo "   🟢 Port $port: FREE"
        fi
    else
        echo "   ⚠️  lsof not available - cannot check port $port"
    fi
done
echo ""

# Check for Claude/MCP related processes
echo "🤖 CLAUDE ECOSYSTEM ANALYSIS:"
claude_patterns=("claude" "mcp-server" "context7" "serena")

for pattern in "${claude_patterns[@]}"; do
    if command -v pgrep >/dev/null 2>&1; then
        process_count=$(pgrep -f "$pattern" 2>/dev/null | wc -l)
        echo "   📡 $pattern: $process_count processes"
        if [ "$process_count" -gt 0 ]; then
            pgrep -f "$pattern" 2>/dev/null | head -2 | while read pid; do
                echo "      • PID $pid"
            done
        fi
    else
        echo "   ⚠️  Cannot check $pattern processes"
    fi
done
echo ""

# Check for development servers
echo "🚀 DEVELOPMENT SERVERS ANALYSIS:"
dev_patterns=("webpack-dev-server" "vite" "next-server" "nodemon" "pm2")

for pattern in "${dev_patterns[@]}"; do
    if command -v pgrep >/dev/null 2>&1; then
        process_count=$(pgrep -f "$pattern" 2>/dev/null | wc -l)
        if [ "$process_count" -gt 0 ]; then
            echo "   🟡 $pattern: $process_count processes RUNNING"
        else
            echo "   🟢 $pattern: Not running"
        fi
    else
        echo "   ⚠️  Cannot check $pattern"
    fi
done
echo ""

# Check Docker status
echo "🐳 DOCKER ANALYSIS:"
if command -v docker >/dev/null 2>&1; then
    docker_containers=$(docker ps -q 2>/dev/null | wc -l)
    echo "   📦 Running containers: $docker_containers"
    
    docker_images=$(docker images -q 2>/dev/null | wc -l)
    echo "   🖼️  Total images: $docker_images"
    
    if [ "$docker_containers" -gt 0 ]; then
        echo "   🔍 Running containers:"
        docker ps --format "table {{.Names}}\t{{.Status}}" 2>/dev/null | head -3 | tail -n +2 | sed 's/^/      /'
    fi
else
    echo "   ⚠️  Docker not available"
fi
echo ""

# Check temporary files
echo "🗑️  TEMPORARY FILES ANALYSIS:"
temp_dirs=("node_modules/.cache" ".next" "dist" "build" ".tmp")

for dir in "${temp_dirs[@]}"; do
    if [ -d "$dir" ]; then
        size=$(du -sh "$dir" 2>/dev/null | cut -f1)
        echo "   📁 $dir: EXISTS ($size)"
    else
        echo "   ✨ $dir: Clean (not present)"
    fi
done
echo ""

# Check system cache
echo "💾 CACHE ANALYSIS:"
if [ -d "$HOME/.npm" ]; then
    npm_cache_size=$(du -sh "$HOME/.npm" 2>/dev/null | cut -f1)
    echo "   📦 npm cache: $npm_cache_size"
else
    echo "   📦 npm cache: Not found"
fi

if [ -d "$HOME/.yarn" ]; then
    yarn_cache_size=$(du -sh "$HOME/.yarn" 2>/dev/null | cut -f1)
    echo "   📦 yarn cache: $yarn_cache_size"
else
    echo "   📦 yarn cache: Not found"
fi
echo ""

# Summary
echo "📋 CLEANUP SIMULATION SUMMARY:"
echo "=================================================="
echo ""
echo "🔥 ACTIONS THAT WOULD BE PERFORMED:"
echo ""

echo "   1. 🔫 Process Cleanup:"
if command -v pgrep >/dev/null 2>&1; then
    total_node=$(pgrep -f node 2>/dev/null | wc -l)
    if [ "$total_node" -gt 0 ]; then
        echo "      • Kill $total_node Node.js processes"
    else
        echo "      • No Node.js processes to kill"
    fi
else
    echo "      • Process checking not available"
fi

echo "   2. 🔓 Port Liberation:"
ports_to_free=0
if command -v lsof >/dev/null 2>&1; then
    for port in "${common_ports[@]}"; do
        if [ "$(lsof -ti:$port 2>/dev/null | wc -l)" -gt 0 ]; then
            ((ports_to_free++))
        fi
    done
fi
echo "      • Free $ports_to_free occupied ports"

echo "   3. 🐳 Docker Cleanup:"
if command -v docker >/dev/null 2>&1; then
    containers=$(docker ps -q 2>/dev/null | wc -l)
    if [ "$containers" -gt 0 ]; then
        echo "      • Stop and remove $containers containers"
    else
        echo "      • No Docker containers to clean"
    fi
else
    echo "      • Docker not available"
fi

echo "   4. 🗑️  File Cleanup:"
files_to_clean=0
for dir in "${temp_dirs[@]}"; do
    if [ -d "$dir" ]; then
        ((files_to_clean++))
    fi
done
echo "      • Remove $files_to_clean temporary directories"

echo "   5. 💾 Cache Cleanup:"
echo "      • Clear npm cache"
echo "      • Clear yarn cache (if available)"
echo "      • Clear system DNS cache"

echo ""
echo "⚡ SAFETY MEASURES:"
echo "   • Create pre-cleanup backup"
echo "   • Generate detailed cleanup report"
echo "   • Verify clean state after completion"

echo ""
echo "💡 TO EXECUTE ACTUAL CLEANUP:"
echo "   npm run dev -- clean-reset"
echo "   (Remove --dry-run flag)"

echo ""
echo "✅ Dry run analysis completed!"