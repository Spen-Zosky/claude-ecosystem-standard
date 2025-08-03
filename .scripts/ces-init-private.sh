#!/bin/bash
# Legacy wrapper for backward compatibility
# DEPRECATED: This script is deprecated. Using new portable init.sh instead...

echo "⚠️  ces-init-private.sh is deprecated. Using new portable init.sh instead..."
echo ""

# Auto-detect CES location for backward compatibility
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Delegate to new portable initializer
echo "🔄 Forwarding to portable initialization system..."
exec "$SCRIPT_DIR/init.sh" "$@"