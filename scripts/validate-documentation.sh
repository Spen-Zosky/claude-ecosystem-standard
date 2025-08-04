#!/bin/bash
# validate-documentation.sh - Validate documentation structure and completeness

set -e

DOCS_DIR="docs/library"
ERRORS=0
WARNINGS=0

echo "🔍 Validating CES v2.7.0 documentation structure..."
echo "=================================================="

# Check series existence
for series in 000-overview 100-introduction 200-installation 300-configuration \
              400-operations 500-monitoring 600-integrations 700-deployment \
              800-testing 900-maintenance 1000-reference 1100-tutorials \
              1200-special; do
    if [ ! -d "$DOCS_DIR/$series" ]; then
        echo "❌ ERROR: Missing series directory: $series"
        ((ERRORS++))
    else
        echo "✅ Found series: $series"
    fi
done

# Check critical files
CRITICAL_FILES=(
    "000-overview/000-README-MASTER.md"
    "000-overview/001-INDEX-DOCUMENTATION.md"
    "100-introduction/100-INTRODUCTION-CES.md"
    "200-installation/203-QUICK-SETUP.md"
    "400-operations/400-CLI-REFERENCE-COMPLETE.md"
)

for file in "${CRITICAL_FILES[@]}"; do
    if [ ! -f "$DOCS_DIR/$file" ]; then
        echo "❌ ERROR: Missing critical file: $file"
        ((ERRORS++))
    else
        echo "✅ Critical file exists: $file"
    fi
done

# Check for broken links in index
if [ -f "$DOCS_DIR/000-overview/001-INDEX-DOCUMENTATION.md" ]; then
    echo ""
    echo "Checking links in index..."
    grep -oE '\[.*\]\(.*\.md\)' "$DOCS_DIR/000-overview/001-INDEX-DOCUMENTATION.md" | while read link; do
        filepath=$(echo "$link" | sed 's/.*](//' | sed 's/).*//')
        checkpath="$DOCS_DIR/000-overview/$filepath"
        checkpath=$(realpath "$checkpath" 2>/dev/null || echo "")
        
        if [ ! -f "$checkpath" ]; then
            echo "⚠️  WARNING: Broken link: $filepath"
            ((WARNINGS++))
        fi
    done
fi

# Check documentation completeness
echo ""
echo "Documentation completion status:"
TOTAL=$(find "$DOCS_DIR" -name "*.md" | wc -l)
INCOMPLETE=$(find "$DOCS_DIR" -name "*.md" -exec grep -l "TO BE COMPLETED" {} \; | wc -l)
COMPLETE=$((TOTAL - INCOMPLETE))

echo "📊 Total documents: $TOTAL"
echo "✅ Completed: $COMPLETE"
echo "📝 To complete: $INCOMPLETE"

# Check for content that might have been missed
echo ""
echo "Checking for potentially missed content..."
MISSED_CONTENT=0

# Check if important files exist in project but not in documentation
for pattern in "INSTALL" "SETUP" "CONFIG" "DEPLOY" "TEST" "API" "SECURITY"; do
    found_in_project=$(find . -name "*$pattern*" -type f ! -path "*/docs/library/*" ! -path "*/node_modules/*" ! -path "*/.backups/*" | wc -l)
    found_in_docs=$(find "$DOCS_DIR" -name "*$pattern*" -type f | wc -l)
    
    if [ $found_in_project -gt $found_in_docs ]; then
        echo "⚠️  WARNING: Found $found_in_project files with '$pattern' in project but only $found_in_docs in docs"
        ((WARNINGS++))
    fi
done

# Final report
echo ""
echo "=================================================="
echo "Validation Summary:"
echo "❌ Errors: $ERRORS"
echo "⚠️  Warnings: $WARNINGS"
echo "📝 Documents to complete: $INCOMPLETE"

if [ $ERRORS -eq 0 ]; then
    echo "✅ Documentation structure is valid!"
    exit 0
else
    echo "❌ Documentation structure has errors!"
    exit 1
fi