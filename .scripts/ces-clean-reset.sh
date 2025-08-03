#!/bin/bash

# CES Clean Reset Helper
# Simulates the **clean reset coordination with CES clean-reset

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

echo "🧹 CES Clean Reset Coordinator"
echo "================================"

# Check if we're in a CES project using portable paths
if [ ! -f "$CES_ROOT/package.json" ] || [ ! -d "$CES_ROOT/src/cli" ]; then
    echo "❌ This doesn't appear to be a CES project"
    echo "💡 CES Root: $CES_ROOT"
    echo "💡 Make sure this script is run from a valid CES installation"
    exit 1
fi

# Parse arguments
DRY_RUN=false
if [ "$1" = "--dry-run" ] || [ "$1" = "-d" ]; then
    DRY_RUN=true
fi

if [ "$DRY_RUN" = true ]; then
    echo "🔍 Triggering CES clean-reset DRY-RUN..."
    
    # Try to trigger clean-reset dry-run via monitor system
    if npm run dev -- monitor --trigger-clean-reset-dry 2>/dev/null; then
        echo "✅ CES clean-reset dry-run triggered via monitor system"
        echo "💡 This simulates what happens when you run **clean reset --dry-run"
        echo ""
        echo "⏳ Waiting for monitor to process..."
        sleep 3
        echo ""
        echo "🔍 Monitor Status:"
        npm run dev -- monitor --status 2>/dev/null || echo "⚠️ Monitor not active"
    else
        echo "⚠️ Monitor system not available, trying direct clean-reset..."
        
        # Fallback to direct clean-reset
        if npm run dev -- clean-reset --dry-run 2>/dev/null; then
            echo "✅ CES clean-reset dry-run completed via direct command"
        else
            echo "❌ CES clean-reset failed - System may not be properly configured"
            echo "💡 Try: npm run dev -- validate"
        fi
    fi
else
    echo "🔥 Triggering CES clean-reset FULL..."
    
    # Warning for full reset
    echo "⚠️  WARNING: This will perform aggressive system cleanup!"
    echo "⚠️  This includes killing processes, freeing ports, and clearing caches."
    echo ""
    read -p "Are you sure you want to continue? (y/N): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        # Try to trigger clean-reset via monitor system
        if npm run dev -- monitor --trigger-clean-reset 2>/dev/null; then
            echo "✅ CES clean-reset triggered via monitor system"
            echo "💡 This simulates what happens when you run **clean reset"
            echo ""
            echo "⏳ Waiting for monitor to process..."
            sleep 5
            echo ""
            echo "🔍 Monitor Status:"
            npm run dev -- monitor --status 2>/dev/null || echo "⚠️ Monitor not active"
        else
            echo "⚠️ Monitor system not available, trying direct clean-reset..."
            
            # Fallback to direct clean-reset
            if npm run dev -- clean-reset 2>/dev/null; then
                echo "✅ CES clean-reset completed via direct command"
            else
                echo "❌ CES clean-reset failed"
                echo "💡 Try: npm run dev -- validate"
            fi
        fi
    else
        echo "❌ Clean-reset cancelled by user"
        exit 0
    fi
fi

echo ""
echo "📚 Usage Guide:"
echo "  **clean reset              # Full system reset (coordinated)"
echo "  **clean reset --dry-run    # Preview what would be cleaned"
echo ""
echo "🔧 Manual Controls:"
echo "  npm run dev -- monitor --trigger-clean-reset      # Manual full reset"
echo "  npm run dev -- monitor --trigger-clean-reset-dry  # Manual dry-run"
echo "  npm run dev -- clean-reset --dry-run              # Direct dry-run"
echo "  npm run dev -- clean-reset                        # Direct full reset"
echo ""
echo "📊 System Status:"
echo "  npm run dev -- validate           # Check CES setup"
echo "  npm run dev -- monitor --status   # Check monitor status"