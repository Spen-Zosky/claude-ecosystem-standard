#!/bin/bash
# extract-documentation-from-code.sh - Extract documentation from code and comments

set -e

OUTPUT_DIR="docs/library/extracted"
mkdir -p "$OUTPUT_DIR"

echo "🔍 Extracting documentation from code..."
echo "========================================"

# Extract TODO/FIXME/NOTE comments
echo "Extracting code annotations..."
grep -r "TODO\|FIXME\|NOTE\|IMPORTANT" --include="*.ts" --include="*.js" . | grep -v node_modules | grep -v .backups > "$OUTPUT_DIR/code-annotations.txt" || true

# Extract JSDoc/TSDoc comments
echo "Extracting JSDoc/TSDoc..."
find . -name "*.ts" -o -name "*.js" | grep -v node_modules | grep -v .backups | while read file; do
    if grep -q "/\*\*" "$file"; then
        echo "Found documentation in: $file" >> "$OUTPUT_DIR/jsdoc-files.txt"
        # Extract multiline comments
        perl -0777 -ne 'print "$1\n" while m{/\*\*(.*?)\*/}gs' "$file" >> "$OUTPUT_DIR/jsdoc-content.txt" 2>/dev/null || true
    fi
done

# Extract interface and type definitions
echo "Extracting TypeScript interfaces..."
find . -name "*.ts" -exec grep -H "^export interface\|^interface\|^export type\|^type" {} \; | grep -v node_modules | grep -v .backups > "$OUTPUT_DIR/typescript-definitions.txt" || true

# Extract configuration schemas
echo "Extracting configuration patterns..."
find . -name "*.json" -o -name "*.yaml" -o -name "*.yml" | grep -v node_modules | grep -v .backups | while read file; do
    if [[ $file == *"config"* ]] || [[ $file == *"schema"* ]]; then
        echo "Configuration file: $file" >> "$OUTPUT_DIR/config-files.txt"
    fi
done

# Extract test descriptions for documentation
echo "Extracting test documentation..."
find . -name "*.test.ts" -o -name "*.spec.ts" -o -name "*.test.js" | grep -v node_modules | grep -v .backups | while read file; do
    grep -H "describe\|it\|test" "$file" >> "$OUTPUT_DIR/test-descriptions.txt" || true
done

# Extract README content from subdirectories
echo "Extracting README files..."
find . -name "README*" -type f | grep -v node_modules | grep -v .backups | while read file; do
    echo "=== $file ===" >> "$OUTPUT_DIR/readme-content.txt"
    cat "$file" >> "$OUTPUT_DIR/readme-content.txt"
    echo "" >> "$OUTPUT_DIR/readme-content.txt"
done

# Extract package.json scripts that might contain documentation commands
echo "Extracting package.json scripts..."
if [ -f "package.json" ]; then
    echo "=== Package.json Scripts ===" > "$OUTPUT_DIR/package-scripts.txt"
    grep -A 50 '"scripts"' package.json >> "$OUTPUT_DIR/package-scripts.txt" || true
fi

# Extract environment variable documentation
echo "Extracting environment variables..."
if [ -f ".env.template" ]; then
    echo "=== Environment Variables ===" > "$OUTPUT_DIR/environment-vars.txt"
    cat .env.template >> "$OUTPUT_DIR/environment-vars.txt"
fi

# Create summary report
cat > "$OUTPUT_DIR/EXTRACTION-SUMMARY.md" << EOF
# Documentation Extraction Summary

Generated: $(date)

## Files Analyzed
- TypeScript/JavaScript files: $(find . -name "*.ts" -o -name "*.js" | grep -v node_modules | grep -v .backups | wc -l)
- Configuration files: $(find . -name "*.json" -o -name "*.yaml" | grep -v node_modules | grep -v .backups | wc -l)
- Test files: $(find . -name "*.test.*" -o -name "*.spec.*" | grep -v node_modules | grep -v .backups | wc -l)
- README files: $(find . -name "README*" | grep -v node_modules | grep -v .backups | wc -l)

## Extracted Content
- Code annotations: $(wc -l < "$OUTPUT_DIR/code-annotations.txt" 2>/dev/null || echo 0) lines
- JSDoc comments: $(wc -l < "$OUTPUT_DIR/jsdoc-content.txt" 2>/dev/null || echo 0) lines
- TypeScript definitions: $(wc -l < "$OUTPUT_DIR/typescript-definitions.txt" 2>/dev/null || echo 0) lines
- Test descriptions: $(wc -l < "$OUTPUT_DIR/test-descriptions.txt" 2>/dev/null || echo 0) lines

## Next Steps
1. Review extracted content in $OUTPUT_DIR
2. Identify documentation that should be incorporated into placeholders
3. Update relevant documentation files with discovered content

## Key Findings
- Found JSDoc documentation in: $(cat "$OUTPUT_DIR/jsdoc-files.txt" 2>/dev/null | wc -l || echo 0) files
- Configuration files discovered: $(cat "$OUTPUT_DIR/config-files.txt" 2>/dev/null | wc -l || echo 0) files
- Code annotations found: $(wc -l < "$OUTPUT_DIR/code-annotations.txt" 2>/dev/null || echo 0) lines
EOF

echo "✅ Extraction completed. Results in: $OUTPUT_DIR"
echo "📋 Review EXTRACTION-SUMMARY.md for overview"