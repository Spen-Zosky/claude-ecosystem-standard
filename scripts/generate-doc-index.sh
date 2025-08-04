#!/bin/bash
# generate-doc-index.sh - Generate master documentation index

set -e

DOCS_DIR="docs/library"
INDEX_FILE="$DOCS_DIR/000-overview/001-INDEX-DOCUMENTATION.md"

# Create index header
cat > "$INDEX_FILE" << 'EOF'
# 📚 Complete Documentation Index - CES v2.7.0

> **Last Updated**: $(date +%Y-%m-%d)  
> **Total Documents**: [TOTAL_COUNT]  
> **Completion**: [COMPLETION_PERCENT]%  
> **Version**: 2.7.0

## 🎯 Quick Navigation

### By Role
- 👶 [Beginners](#beginners)
- 🧑‍💻 [Developers](#developers)
- 🏢 [DevOps/Admins](#devops-administrators)
- 🔬 [Contributors](#contributors)

### By Urgency
- 🔥 [Quick Setup](#quick-setup)
- ⚡ [Quick References](#quick-references)
- 🆘 [Troubleshooting](#troubleshooting)

---

## 📖 Complete Documentation by Series

EOF

# Function to process a series
process_series() {
    local series_dir="$1"
    local series_name="$2"
    local series_desc="$3"
    
    echo "### $series_name" >> "$INDEX_FILE"
    echo "" >> "$INDEX_FILE"
    echo "$series_desc" >> "$INDEX_FILE"
    echo "" >> "$INDEX_FILE"
    
    # List files in series
    if [ -d "$DOCS_DIR/$series_dir" ]; then
        for file in "$DOCS_DIR/$series_dir"/*.md; do
            if [ -f "$file" ]; then
                filename=$(basename "$file")
                # Extract title from file
                title=$(grep -m1 "^# " "$file" | sed 's/^# //' || echo "$filename")
                # Check if placeholder
                if grep -q "TO BE COMPLETED" "$file"; then
                    status="📝"
                else
                    status="✅"
                fi
                echo "- $status [$filename](../$series_dir/$filename) - $title" >> "$INDEX_FILE"
            fi
        done
    fi
    echo "" >> "$INDEX_FILE"
}

# Generate index for each series
process_series "000-overview" "📋 SERIES 000: Overview and Indices" "General project documentation and indices"
process_series "100-introduction" "📘 SERIES 100: Introduction and Concepts" "Core concepts and CES architecture"
process_series "200-installation" "🛠️ SERIES 200: Installation and Setup" "Installation and initial configuration guides"
process_series "300-configuration" "⚙️ SERIES 300: Configuration" "Detailed system configuration"
process_series "400-operations" "🔧 SERIES 400: Operations" "Operational guides and command references"
process_series "500-monitoring" "📊 SERIES 500: Monitoring and Debugging" "Monitoring systems and troubleshooting"
process_series "600-integrations" "🔄 SERIES 600: Integrations and Extensions" "External service integrations"
process_series "700-deployment" "🚀 SERIES 700: Deployment and Production" "Production deployment guides"
process_series "800-testing" "🧪 SERIES 800: Testing and Quality" "Testing frameworks and guides"
process_series "900-maintenance" "🔧 SERIES 900: Maintenance and Troubleshooting" "Maintenance and problem resolution"
process_series "1000-reference" "📖 SERIES 1000: Technical References" "Technical reference documentation"
process_series "1100-tutorials" "🎓 SERIES 1100: Tutorials and Examples" "Practical tutorials and examples"
process_series "1200-special" "📋 SERIES 1200: Special Documentation" "Specialized documentation"

# Add reading paths sections
cat >> "$INDEX_FILE" << 'EOF'

---

## 🎯 Recommended Reading Paths

### 👶 Beginners

1. [100-INTRODUCTION-CES.md](../100-introduction/100-INTRODUCTION-CES.md)
2. [200-SYSTEM-REQUIREMENTS.md](../200-installation/200-SYSTEM-REQUIREMENTS.md)
3. [203-QUICK-SETUP.md](../200-installation/203-QUICK-SETUP.md)
4. [1100-TUTORIAL-QUICKSTART.md](../1100-tutorials/1100-TUTORIAL-QUICKSTART.md)

### 🧑‍💻 Developers

1. [101-ARCHITECTURE-OVERVIEW.md](../100-introduction/101-ARCHITECTURE-OVERVIEW.md)
2. [300-CONFIGURATION-OVERVIEW.md](../300-configuration/300-CONFIGURATION-OVERVIEW.md)
3. [400-CLI-REFERENCE-COMPLETE.md](../400-operations/400-CLI-REFERENCE-COMPLETE.md)
4. Complete 600 series for integrations

### 🏢 DevOps/Administrators

1. Complete 200 series (installation)
2. Complete 500 series (monitoring)
3. Complete 700 series (deployment)
4. 900 series (maintenance)

### 🔬 Contributors

1. [004-CONTRIBUTING.md](../000-overview/004-CONTRIBUTING.md)
2. Complete 800 series (testing)
3. 1000 series (technical references)
4. [1202-INTEGRATION-PATTERNS.md](../1200-special/1202-INTEGRATION-PATTERNS.md)

---

## ⚡ Quick References

### Quick Setup
- [203-QUICK-SETUP.md](../200-installation/203-QUICK-SETUP.md)
- [1100-TUTORIAL-QUICKSTART.md](../1100-tutorials/1100-TUTORIAL-QUICKSTART.md)

### Common Commands
- [400-CLI-REFERENCE-COMPLETE.md](../400-operations/400-CLI-REFERENCE-COMPLETE.md)
- [402-QUICK-COMMANDS.md](../400-operations/402-QUICK-COMMANDS.md)

### Troubleshooting
- [208-TROUBLESHOOTING-SETUP.md](../200-installation/208-TROUBLESHOOTING-SETUP.md)
- [900-TROUBLESHOOTING-MASTER.md](../900-maintenance/900-TROUBLESHOOTING-MASTER.md)

---

## 📊 Documentation Statistics

EOF

# Calculate statistics
TOTAL_DOCS=$(find "$DOCS_DIR" -name "*.md" | wc -l)
COMPLETED_DOCS=$(find "$DOCS_DIR" -name "*.md" -exec grep -L "TO BE COMPLETED" {} \; | wc -l)
COMPLETION_PERCENT=$((COMPLETED_DOCS * 100 / TOTAL_DOCS))

# Update placeholders
sed -i "s/\[TOTAL_COUNT\]/$TOTAL_DOCS/g" "$INDEX_FILE"
sed -i "s/\[COMPLETION_PERCENT\]/$COMPLETION_PERCENT/g" "$INDEX_FILE"

# Add detailed statistics
cat >> "$INDEX_FILE" << EOF

- **Total Documents**: $TOTAL_DOCS
- **Completed Documents**: $COMPLETED_DOCS ✅
- **To Be Completed**: $((TOTAL_DOCS - COMPLETED_DOCS)) 📝
- **Completion Percentage**: $COMPLETION_PERCENT%

### Priority Missing Documents

#### 🔥 High Priority
EOF

# List high priority documents to complete
grep -r "Priority.*High" "$DOCS_DIR" --include="*.md" | while read line; do
    file=$(echo "$line" | cut -d: -f1)
    filename=$(basename "$file")
    series=$(basename $(dirname "$file"))
    echo "- [$filename](../$series/$filename)" >> "$INDEX_FILE"
done

cat >> "$INDEX_FILE" << 'EOF'

---

## 📝 Content Sources

This documentation was compiled from:
- Existing markdown files throughout the project
- Code comments and inline documentation
- Configuration files and examples
- Test files and patterns
- Context and memory from development sessions

---

*This index is automatically generated. To update, run: `./scripts/generate-doc-index.sh`*
EOF

echo "✅ Index generated: $INDEX_FILE"