#!/bin/bash
# remap-documentation.sh - Remap existing documents to new structure

set -e

# Destination directory
DEST_DIR="docs/library"

# Function to move and rename
move_doc() {
    local src="$1"
    local dest="$2"
    local series="$3"
    
    if [ -f "$src" ]; then
        mkdir -p "$DEST_DIR/$series"
        cp "$src" "$DEST_DIR/$series/$dest"
        echo "✓ Moved: $src → $series/$dest"
    else
        echo "⚠ Not found: $src (searching alternatives...)"
        # Try to find file with similar name
        local basename=$(basename "$src" .md)
        local found=$(find . -name "*$basename*" -type f ! -path "*/node_modules/*" ! -path "*/.backups/*" | head -1)
        if [ -n "$found" ]; then
            echo "  Found alternative: $found"
            cp "$found" "$DEST_DIR/$series/$dest"
            echo "  ✓ Moved: $found → $series/$dest"
        fi
    fi
}

echo "🔄 Starting documentation remapping for CES v2.7.0..."
echo "================================================="

# SERIES 000: Overview and Indices
move_doc "README.md" "000-README-MASTER.md" "000-overview"
move_doc "CHANGELOG.md" "002-CHANGELOG.md" "000-overview"
move_doc "LICENSE" "003-LICENSE.md" "000-overview"
move_doc "LICENSE.md" "003-LICENSE.md" "000-overview"

# SERIES 100: Introduction and Concepts  
move_doc "docs/001-INTRODUZIONE-GENERALE.md" "100-INTRODUCTION-CES.md" "100-introduction"
move_doc "docs/001-GENERAL-INTRODUCTION.md" "100-INTRODUCTION-CES.md" "100-introduction"
move_doc "docs/ARCHITECTURE-OVERVIEW.md" "101-ARCHITECTURE-OVERVIEW.md" "100-introduction"

# SERIES 200: Installation and Setup
move_doc "docs/NODEJS-SETUP-GUIDE.md" "201-NODEJS-SETUP.md" "200-installation"
move_doc "docs/003-SETUP-INSTALLAZIONE.md" "203-QUICK-SETUP.md" "200-installation"
move_doc "docs/003-SETUP-INSTALLATION.md" "203-QUICK-SETUP.md" "200-installation"
move_doc "docs/PORTABLE-INSTALLATION.md" "204-MANUAL-INSTALLATION.md" "200-installation"

# SERIES 300: Configuration
move_doc "docs/002-CONFIGURAZIONE-ENTERPRISE.md" "300-CONFIGURATION-OVERVIEW.md" "300-configuration"
move_doc "docs/002-ENTERPRISE-CONFIGURATION.md" "300-CONFIGURATION-OVERVIEW.md" "300-configuration"
move_doc "CLAUDE.md" "302-CLAUDE-MD-SYSTEM.md" "300-configuration"

# SERIES 400: Operations
move_doc "docs/004-CLI-REFERENCE.md" "400-CLI-REFERENCE-COMPLETE.md" "400-operations"
move_doc "docs/CLI-COMMANDS-REFERENCE.md" "400-CLI-REFERENCE-COMPLETE.md" "400-operations"

# SERIES 500: Monitoring and Debugging
move_doc "docs/005-LOGGING-MONITORING.md" "500-LOGGING-SYSTEM.md" "500-monitoring"
move_doc "docs/ENTERPRISE-LOGGING-MONITORING.md" "501-MONITORING-DASHBOARD.md" "500-monitoring"

# SERIES 600: Integrations and Extensions
move_doc "docs/ANTHROPIC-INTEGRATION-GUIDE.md" "600-ANTHROPIC-INTEGRATION.md" "600-integrations"
move_doc "docs/ces-integration-instructions.md" "601-CES-INTEGRATION.md" "600-integrations"

# SERIES 700: Deployment and Production
move_doc "docs/006-DEPLOYMENT-PRODUZIONE.md" "700-DEPLOYMENT-OVERVIEW.md" "700-deployment"
move_doc "docs/ENTERPRISE-DEPLOYMENT-GUIDE.md" "701-ENTERPRISE-DEPLOYMENT.md" "700-deployment"

# SERIES 800: Testing and Quality
move_doc "docs/TESTING-GUIDE.md" "800-TESTING-FRAMEWORK.md" "800-testing"

# SERIES 900: Maintenance and Troubleshooting
move_doc "docs/TROUBLESHOOTING-GUIDE.md" "900-TROUBLESHOOTING-MASTER.md" "900-maintenance"
move_doc "docs/CLEAN-RESET-INTEGRATION.md" "901-CLEAN-RESET-PROCEDURES.md" "900-maintenance"

# SERIES 1000: Technical References
move_doc "docs/ANTHROPIC-AI-API-REFERENCE.md" "1000-ANTHROPIC-API-REFERENCE.md" "1000-reference"

# SERIES 1100: Tutorials and Examples
move_doc "docs/QUICK-TEST-COMMANDS.md" "1100-QUICK-START-TUTORIAL.md" "1100-tutorials"

# SERIES 1200: Special Documentation
move_doc "docs/dual-claude-completion-instructions.md" "1200-DUAL-CLAUDE-INSTRUCTIONS.md" "1200-special"
move_doc "docs/CES-COMPREHENSIVE-IMPROVEMENTS.md" "1201-CES-IMPROVEMENTS.md" "1200-special"

echo ""
echo "🔍 Searching for additional documentation files..."
echo ""

# Find all markdown files not yet processed
find . -name "*.md" -type f ! -path "*/docs/library/*" ! -path "*/node_modules/*" ! -path "*/.backups/*" | while read file; do
    echo "📄 Found unmapped: $file"
done

echo "================================================="
echo "✅ Remapping completed!"
echo ""
echo "⚠️  IMPORTANT: Review found files above and manually map any missing documentation"