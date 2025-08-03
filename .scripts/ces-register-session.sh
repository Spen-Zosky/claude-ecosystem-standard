#!/bin/bash

# CES Register Session Helper
# Simulates the **register session coordination with CES checkpoint

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

echo "🔄 CES Register Session Coordinator"
echo "=================================="

# Check if we're in a CES project using portable paths
if [ ! -f "$CES_ROOT/package.json" ] || [ ! -d "$CES_ROOT/src/session" ]; then
    echo "❌ This doesn't appear to be a CES project"
    echo "💡 CES Root: $CES_ROOT"
    echo "💡 Make sure this script is run from a valid CES installation"
    exit 1
fi

echo "📋 Triggering CES checkpoint..."

# Try to trigger checkpoint via monitor system
if npm run dev -- monitor --trigger-checkpoint 2>/dev/null; then
    echo "✅ CES checkpoint triggered via monitor system"
    echo "💡 This simulates what happens when you run **register session"
    echo ""
    echo "🔍 Monitor Status:"
    npm run dev -- monitor --status 2>/dev/null || echo "⚠️ Monitor not active"
else
    echo "⚠️ Monitor system not available, trying direct checkpoint..."
    
    # Fallback to direct checkpoint
    if npm run dev -- checkpoint-session --message "Manual register session simulation" 2>/dev/null; then
        echo "✅ CES checkpoint completed via direct command"
    else
        echo "❌ CES checkpoint failed - SessionManager may not be running"
        echo "💡 Try: npm run dev -- start-session"
    fi
fi

echo ""
echo "📚 Usage Guide:"
echo "  1. **start session        # Start everything (automatic)"
echo "  2. **register session     # Claude checkpoint + CES checkpoint (automatic)"
echo "  3. Work on your project..."
echo "  4. **close session        # Close everything (coordinated)"
echo ""
echo "🔧 Manual Controls:"
echo "  npm run dev -- monitor --status              # Check monitor"
echo "  npm run dev -- monitor --trigger-checkpoint  # Manual checkpoint"
echo "  npm run dev -- monitor --trigger-close       # Manual close"