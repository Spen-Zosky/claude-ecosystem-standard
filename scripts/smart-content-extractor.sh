#!/bin/bash
# smart-content-extractor.sh - Enhanced content extraction helper for CES v2.7.0
# Intelligently extracts and organizes content from codebase for documentation

set -e

# Configuration
CES_ROOT="${CES_ROOT:-$(pwd)}"
OUTPUT_DIR="docs/library/extracted"
TEMP_DIR="/tmp/ces-extraction-$$"
LOG_FILE="$OUTPUT_DIR/extraction.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
}

# Initialize extraction environment
init_extraction() {
    log "🚀 Initializing Smart Content Extractor for CES v2.7.0"
    
    # Create directories
    mkdir -p "$OUTPUT_DIR" "$TEMP_DIR"
    
    # Clear previous log
    > "$LOG_FILE"
    
    log "📁 Output directory: $OUTPUT_DIR"
    log "🏠 CES Root: $CES_ROOT"
}

# Extract CLI command documentation
extract_cli_documentation() {
    log "🔧 Extracting CLI command documentation..."
    
    local cli_output="$OUTPUT_DIR/cli-commands.md"
    cat > "$cli_output" << 'EOF'
# CES v2.7.0 CLI Commands Documentation

*Auto-extracted from codebase*

## Available Commands

EOF
    
    # Extract from CLIManager.ts
    if [ -f "src/cli/CLIManager.ts" ]; then
        log "  📋 Analyzing CLIManager.ts..."
        
        # Extract command definitions
        grep -n "addCommand\|setDescription\|setAlias" src/cli/CLIManager.ts | while read line; do
            echo "- $line" >> "$cli_output"
        done
        
        # Extract usage examples
        if grep -q "example\|Example" src/cli/CLIManager.ts; then
            echo -e "\n## Usage Examples\n" >> "$cli_output"
            grep -A 5 -B 1 "example\|Example" src/cli/CLIManager.ts >> "$cli_output"
        fi
    fi
    
    # Extract from individual CLI managers
    for manager in src/cli/*Manager.ts; do
        if [ -f "$manager" ]; then
            local manager_name=$(basename "$manager" .ts)
            log "  🔍 Analyzing $manager_name..."
            
            echo -e "\n## $manager_name\n" >> "$cli_output"
            
            # Extract class documentation
            grep -A 10 "class.*$manager_name" "$manager" | head -15 >> "$cli_output" || true
            
            # Extract method signatures
            echo -e "\n### Methods:\n" >> "$cli_output"
            grep -n "async.*(" "$manager" | head -10 >> "$cli_output" || true
        fi
    done
    
    log "✅ CLI documentation extracted to: $cli_output"
}

# Extract configuration documentation
extract_configuration_docs() {
    log "⚙️ Extracting configuration documentation..."
    
    local config_output="$OUTPUT_DIR/configuration-guide.md"
    cat > "$config_output" << 'EOF'
# CES v2.7.0 Configuration Guide

*Auto-extracted from codebase*

## Environment Variables

EOF
    
    # Extract from EnvironmentConfig.ts
    if [ -f "src/config/EnvironmentConfig.ts" ]; then
        log "  🔧 Analyzing EnvironmentConfig.ts..."
        
        # Extract environment variable definitions
        grep -n "process.env\|CES_.*=" src/config/EnvironmentConfig.ts | while read line; do
            echo "- $line" >> "$config_output"
        done
        
        # Extract configuration interfaces
        echo -e "\n## Configuration Interfaces\n" >> "$config_output"
        grep -A 20 "interface.*Config" src/config/EnvironmentConfig.ts >> "$config_output" || true
    fi
    
    # Extract from .env.template
    if [ -f ".env.template" ]; then
        echo -e "\n## Environment Template\n" >> "$config_output"
        echo '```bash' >> "$config_output"
        cat .env.template >> "$config_output"
        echo '```' >> "$config_output"
    fi
    
    log "✅ Configuration documentation extracted to: $config_output"
}

# Extract API and integration documentation
extract_api_documentation() {
    log "🔌 Extracting API and integration documentation..."
    
    local api_output="$OUTPUT_DIR/api-integrations.md"
    cat > "$api_output" << 'EOF'
# CES v2.7.0 API & Integrations

*Auto-extracted from codebase*

## Anthropic Integration

EOF
    
    # Extract Anthropic integration details
    if [ -d "src/integrations/anthropic" ]; then
        log "  🤖 Analyzing Anthropic integration..."
        
        find src/integrations/anthropic -name "*.ts" | while read file; do
            local filename=$(basename "$file" .ts)
            echo -e "\n### $filename\n" >> "$api_output"
            
            # Extract class and interface definitions
            grep -A 5 "export.*class\|export.*interface" "$file" >> "$api_output" || true
            
            # Extract method signatures
            echo -e "\n#### Methods:\n" >> "$api_output"
            grep -n "async.*(\|public.*(\|private.*(" "$file" | head -10 >> "$api_output" || true
        done
    fi
    
    # Extract MCP server configurations
    if [ -f ".claude/claude_desktop_config.json" ]; then
        echo -e "\n## MCP Server Configuration\n" >> "$api_output"
        echo '```json' >> "$api_output"
        cat .claude/claude_desktop_config.json >> "$api_output"
        echo '```' >> "$api_output"
    fi
    
    log "✅ API documentation extracted to: $api_output"
}

# Extract architectural documentation
extract_architecture_docs() {
    log "🏗️ Extracting architectural documentation..."
    
    local arch_output="$OUTPUT_DIR/architecture-overview.md"
    cat > "$arch_output" << 'EOF'
# CES v2.7.0 Architecture Overview

*Auto-extracted from codebase*

## Project Structure

EOF
    
    # Generate directory tree
    echo '```' >> "$arch_output"
    tree -I 'node_modules|dist|.git|.backups' -L 3 >> "$arch_output" 2>/dev/null || {
        log "  📁 Generating manual directory structure..."
        find . -type d -not -path './node_modules*' -not -path './dist*' -not -path './.git*' -not -path './.backups*' | head -50 >> "$arch_output"
    }
    echo '```' >> "$arch_output"
    
    # Extract TypeScript interfaces and types
    echo -e "\n## Core Types and Interfaces\n" >> "$arch_output"
    find src -name "*.ts" -exec grep -H "^export interface\|^interface\|^export type\|^type" {} \; | head -30 >> "$arch_output" || true
    
    # Extract package.json information
    if [ -f "package.json" ]; then
        echo -e "\n## Dependencies\n" >> "$arch_output"
        echo '```json' >> "$arch_output"
        grep -A 20 '"dependencies"' package.json >> "$arch_output"
        echo '```' >> "$arch_output"
    fi
    
    log "✅ Architecture documentation extracted to: $arch_output"
}

# Extract usage examples and tutorials
extract_usage_examples() {
    log "📚 Extracting usage examples and tutorials..."
    
    local examples_output="$OUTPUT_DIR/usage-examples.md"
    cat > "$examples_output" << 'EOF'
# CES v2.7.0 Usage Examples

*Auto-extracted from codebase*

## Code Examples

EOF
    
    # Extract from examples directory
    if [ -d "examples" ]; then
        log "  💡 Analyzing examples directory..."
        
        find examples -name "*.ts" -o -name "*.js" -o -name "*.md" | while read file; do
            local filename=$(basename "$file")
            echo -e "\n### $filename\n" >> "$examples_output"
            
            if [[ $file == *.md ]]; then
                cat "$file" >> "$examples_output"
            else
                echo '```typescript' >> "$examples_output"
                head -50 "$file" >> "$examples_output"
                echo '```' >> "$examples_output"
            fi
        done
    fi
    
    # Extract test examples
    echo -e "\n## Test Examples\n" >> "$examples_output"
    find src -name "*.test.ts" -o -name "*.spec.ts" | head -5 | while read file; do
        echo -e "\n### $(basename "$file")\n" >> "$examples_output"
        grep -A 10 "describe\|it\|test" "$file" | head -20 >> "$examples_output" || true
    done
    
    log "✅ Usage examples extracted to: $examples_output"
}

# Extract troubleshooting information
extract_troubleshooting() {
    log "🔧 Extracting troubleshooting information..."
    
    local trouble_output="$OUTPUT_DIR/troubleshooting-guide.md"
    cat > "$trouble_output" << 'EOF'
# CES v2.7.0 Troubleshooting Guide

*Auto-extracted from codebase*

## Common Issues and Solutions

EOF
    
    # Extract error handling patterns
    echo -e "### Error Handling Patterns\n" >> "$trouble_output"
    grep -r "try.*catch\|throw new Error\|console.error" src/ | head -20 >> "$trouble_output" || true
    
    # Extract TODO and FIXME comments
    echo -e "\n### Known Issues (TODO/FIXME)\n" >> "$trouble_output"
    grep -r "TODO\|FIXME\|BUG\|HACK" --include="*.ts" --include="*.js" src/ | head -30 >> "$trouble_output" || true
    
    # Extract validation patterns
    echo -e "\n### Validation Patterns\n" >> "$trouble_output"
    grep -r "validate\|check\|verify" --include="*.ts" src/ | head -20 >> "$trouble_output" || true
    
    log "✅ Troubleshooting guide extracted to: $trouble_output"
}

# Generate comprehensive index
generate_extraction_index() {
    log "📋 Generating extraction index..."
    
    local index_output="$OUTPUT_DIR/README.md"
    cat > "$index_output" << EOF
# CES v2.7.0 Smart Content Extraction

*Generated on $(date)*

## 📊 Extraction Summary

- **Total files analyzed**: $(find . -name "*.ts" -o -name "*.js" -o -name "*.json" | grep -v node_modules | wc -l)
- **Documentation files created**: $(find "$OUTPUT_DIR" -name "*.md" | wc -l)
- **Extraction time**: $(date)

## 📁 Extracted Content

EOF
    
    # List all generated files
    find "$OUTPUT_DIR" -name "*.md" -not -name "README.md" | while read file; do
        local filename=$(basename "$file" .md)
        local title=$(head -1 "$file" | sed 's/^# //')
        echo "- [$title](./$filename.md)" >> "$index_output"
    done
    
    cat >> "$index_output" << 'EOF'

## 🎯 Usage

This directory contains auto-extracted documentation from the CES v2.7.0 codebase. Use these files as:

1. **Reference Material**: Quick lookup for API signatures and configurations
2. **Documentation Seed**: Starting point for writing comprehensive documentation
3. **Code Analysis**: Understanding project structure and patterns
4. **Troubleshooting**: Common issues and error patterns

## 🔄 Regeneration

To regenerate this content, run:

```bash
./scripts/smart-content-extractor.sh
```

## 📝 Manual Review Needed

The extracted content should be reviewed and refined before being incorporated into the main documentation. Key areas for review:

- API documentation completeness
- Configuration examples accuracy
- Usage examples clarity
- Troubleshooting steps validation

EOF
    
    log "✅ Extraction index generated: $index_output"
}

# Generate statistics report
generate_statistics() {
    log "📊 Generating extraction statistics..."
    
    local stats_output="$OUTPUT_DIR/extraction-stats.json"
    cat > "$stats_output" << EOF
{
    "extraction_date": "$(date -Iseconds)",
    "ces_version": "2.7.0",
    "extractor_version": "1.0.0",
    "statistics": {
        "source_files": {
            "typescript": $(find src -name "*.ts" | wc -l),
            "javascript": $(find src -name "*.js" | wc -l),
            "configuration": $(find . -name "*.json" -o -name "*.yaml" | grep -v node_modules | wc -l),
            "documentation": $(find docs -name "*.md" 2>/dev/null | wc -l || echo 0)
        },
        "extracted_files": {
            "markdown": $(find "$OUTPUT_DIR" -name "*.md" | wc -l),
            "total_size": "$(du -sh "$OUTPUT_DIR" | cut -f1)"
        },
        "content_analysis": {
            "cli_commands": $(grep -r "addCommand\|setDescription" src/cli/ 2>/dev/null | wc -l || echo 0),
            "config_variables": $(grep -r "CES_.*=" src/config/ 2>/dev/null | wc -l || echo 0),
            "api_methods": $(grep -r "async.*(\|public.*(" src/ 2>/dev/null | wc -l || echo 0),
            "interfaces": $(grep -r "^export interface\|^interface" src/ 2>/dev/null | wc -l || echo 0)
        }
    }
}
EOF
    
    log "✅ Statistics generated: $stats_output"
}

# Main execution function
main() {
    init_extraction
    
    log "🔍 Starting smart content extraction..."
    
    # Run extraction functions
    extract_cli_documentation
    extract_configuration_docs
    extract_api_documentation
    extract_architecture_docs
    extract_usage_examples
    extract_troubleshooting
    
    # Generate final outputs
    generate_extraction_index
    generate_statistics
    
    # Cleanup
    rm -rf "$TEMP_DIR"
    
    log "🎉 Smart content extraction completed successfully!"
    log "📁 Results available in: $OUTPUT_DIR"
    log "📊 View extraction-stats.json for detailed metrics"
    
    # Display summary
    echo
    echo -e "${GREEN}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                   EXTRACTION COMPLETE                       ║${NC}"
    echo -e "${GREEN}╠══════════════════════════════════════════════════════════════╣${NC}"
    echo -e "${GREEN}║${NC} Generated Files: $(find "$OUTPUT_DIR" -name "*.md" | wc -l) markdown documents                     ${GREEN}║${NC}"
    echo -e "${GREEN}║${NC} Total Size: $(du -sh "$OUTPUT_DIR" | cut -f1)                                        ${GREEN}║${NC}"
    echo -e "${GREEN}║${NC} Output Directory: $OUTPUT_DIR          ${GREEN}║${NC}"
    echo -e "${GREEN}╚══════════════════════════════════════════════════════════════╝${NC}"
}

# Execute main function
main "$@"