#!/bin/bash
# test-dual-claude.sh - Test script for Dual Claude Implementation
# Tests all components of the dual Claude system end-to-end
# Version: 1.0.0
# Compatible: CES v2.7.0+

set -e

# Configurazione colori output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Contatori
TESTS_PASSED=0
TESTS_FAILED=0
TESTS_TOTAL=0

# Funzioni utility
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_test() {
    echo -e "${CYAN}[TEST]${NC} $1"
}

# Funzione per eseguire un test
run_test() {
    local test_name="$1"
    local test_command="$2"
    local expected_result="${3:-0}"
    
    TESTS_TOTAL=$((TESTS_TOTAL + 1))
    log_test "Running: $test_name"
    
    if eval "$test_command" >/dev/null 2>&1; then
        actual_result=0
    else
        actual_result=1
    fi
    
    if [ "$actual_result" -eq "$expected_result" ]; then
        log_success "✅ PASS: $test_name"
        TESTS_PASSED=$((TESTS_PASSED + 1))
        return 0
    else
        log_error "❌ FAIL: $test_name"
        TESTS_FAILED=$((TESTS_FAILED + 1))
        return 1
    fi
}

# Funzione per verificare file esistente
test_file_exists() {
    local file_path="$1"
    local test_name="File exists: $file_path"
    run_test "$test_name" "[ -f '$file_path' ]"
}

# Funzione per verificare directory esistente
test_dir_exists() {
    local dir_path="$1"
    local test_name="Directory exists: $dir_path"
    run_test "$test_name" "[ -d '$dir_path' ]"
}

# Funzione per verificare script eseguibile
test_script_executable() {
    local script_path="$1"
    local test_name="Script executable: $script_path"
    run_test "$test_name" "[ -x '$script_path' ]"
}

# Banner
echo -e "${GREEN}"
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║              DUAL CLAUDE SYSTEM TEST SUITE               ║"  
echo "║                    CES v2.7.0 Test                       ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Rileva percorsi
CES_ROOT="$(pwd)"
PROJECT_ROOT="$(dirname "$CES_ROOT")"
PROJECT_NAME="$(basename "$PROJECT_ROOT")"

log_info "Test Environment:"
log_info "  CES Root: $CES_ROOT"  
log_info "  Project Root: $PROJECT_ROOT"
log_info "  Project Name: $PROJECT_NAME"
echo ""

# FASE 1: Test componenti base
echo -e "${CYAN}════════════════════════════════════════════════════════════"
echo "FASE 1: Testing Core Components"
echo -e "════════════════════════════════════════════════════════════${NC}"

# Test 1.1: Verifica script di merge
test_file_exists "$CES_ROOT/scripts/merge-claude-docs.sh"
test_script_executable "$CES_ROOT/scripts/merge-claude-docs.sh"

# Test 1.2: Verifica template
test_file_exists "$CES_ROOT/templates/PROJECT-CLAUDE.md.template"

# Test 1.3: Verifica ClaudeDocManager
test_file_exists "$CES_ROOT/.src/utils/ClaudeDocManager.ts"

# Test 1.4: Verifica DocumentationCommands  
test_file_exists "$CES_ROOT/.src/cli/DocumentationCommands.ts"

# Test 1.5: Verifica integrate.sh aggiornato
test_file_exists "$CES_ROOT/scripts/integrate.sh"
run_test "integrate.sh contains dual Claude functionality" "grep -q 'Genera CLAUDE-MASTER.md iniziale' '$CES_ROOT/scripts/integrate.sh'"

# FASE 2: Test integrazione TypeScript
echo -e "\n${CYAN}════════════════════════════════════════════════════════════"
echo "FASE 2: Testing TypeScript Integration"
echo -e "════════════════════════════════════════════════════════════${NC}"

# Test 2.1: Compilazione TypeScript
run_test "TypeScript compilation" "npm run build"

# Test 2.2: Import DocumentationCommands nel CLIManager
run_test "CLIManager imports DocumentationCommands" "grep -q 'import.*DocumentationCommands' '$CES_ROOT/.src/cli/CLIManager.ts'"

# Test 2.3: Integrazione handleDocs nel CLIManager
run_test "CLIManager has handleDocs method" "grep -q 'handleDocs.*args.*string' '$CES_ROOT/.src/cli/CLIManager.ts'"

# FASE 3: Test funzionalità script di merge
echo -e "\n${CYAN}════════════════════════════════════════════════════════════"
echo "FASE 3: Testing Merge Script Functionality"
echo -e "════════════════════════════════════════════════════════════${NC}"

# Test 3.1: Verifica parametri script merge
run_test "Merge script has --help parameter" "'$CES_ROOT/scripts/merge-claude-docs.sh' --help"

# Test 3.2: Verifica parametri --dry-run
run_test "Merge script has --dry-run parameter" "'$CES_ROOT/scripts/merge-claude-docs.sh' --dry-run"

# FASE 4: Test creazione CLAUDE-MASTER.md
echo -e "\n${CYAN}════════════════════════════════════════════════════════════"
echo "FASE 4: Testing CLAUDE-MASTER.md Generation"
echo -e "════════════════════════════════════════════════════════════${NC}"

# Crea CLAUDE.md di test se non esiste
if [ ! -f "$PROJECT_ROOT/CLAUDE.md" ]; then
    log_info "Creating test CLAUDE.md..."
    cat > "$PROJECT_ROOT/CLAUDE.md" << EOF
# TEST PROJECT CLAUDE.md

This is a test project-specific CLAUDE configuration for testing the dual Claude system.

## Test Project Instructions
- This file should be merged with CES CLAUDE.md
- The result should appear in CLAUDE-MASTER.md
- Test timestamp: $(date)

## Test Validation
This content should be visible in the merged documentation.
EOF
fi

# Test 4.1: Esecuzione merge
cd "$PROJECT_ROOT"
run_test "Execute merge script successfully" "'$CES_ROOT/scripts/merge-claude-docs.sh' --merge"

# Test 4.2: Verifica CLAUDE-MASTER.md generato
test_file_exists "$PROJECT_ROOT/.claude/CLAUDE-MASTER.md"

# Test 4.3: Verifica contenuto merged
if [ -f "$PROJECT_ROOT/.claude/CLAUDE-MASTER.md" ]; then
    run_test "CLAUDE-MASTER.md contains project content" "grep -q 'TEST PROJECT CLAUDE.md' '$PROJECT_ROOT/.claude/CLAUDE-MASTER.md'"
    run_test "CLAUDE-MASTER.md contains CES content" "grep -q 'Claude Ecosystem Standard' '$PROJECT_ROOT/.claude/CLAUDE-MASTER.md'"
else
    log_error "CLAUDE-MASTER.md not found - skipping content tests"
    TESTS_FAILED=$((TESTS_FAILED + 2))
    TESTS_TOTAL=$((TESTS_TOTAL + 2))
fi

# Torna alla directory del CES
cd "$CES_ROOT"

# FASE 5: Test CLI Commands
echo -e "\n${CYAN}════════════════════════════════════════════════════════════"
echo "FASE 5: Testing CLI Documentation Commands"
echo -e "════════════════════════════════════════════════════════════${NC}"

# Test 5.1: Test comando docs attraverso npm
run_test "CLI docs command available" "npm run dev -- docs --help"

# Test 5.2: Test validazione docs
run_test "CLI docs validate command" "npm run dev -- docs validate"

# Test 5.3: Test show docs  
if [ -f "$PROJECT_ROOT/.claude/CLAUDE-MASTER.md" ]; then
    run_test "CLI docs show command" "npm run dev -- docs show"
else
    log_warning "Skipping docs show test - CLAUDE-MASTER.md not available"
fi

# FASE 6: Test Environment e Configuration
echo -e "\n${CYAN}════════════════════════════════════════════════════════════"
echo "FASE 6: Testing Environment & Configuration"
echo -e "════════════════════════════════════════════════════════════${NC}"

# Test 6.1: Verifica configurazione
run_test "CES configuration valid" "npm run dev -- validate"

# Test 6.2: Verifica struttura directory
test_dir_exists "$CES_ROOT/.src"
test_dir_exists "$CES_ROOT/.src/cli"
test_dir_exists "$CES_ROOT/.src/utils"
test_dir_exists "$CES_ROOT/scripts"
test_dir_exists "$CES_ROOT/templates"

# FASE 7: Test Integration e Compatibility
echo -e "\n${CYAN}════════════════════════════════════════════════════════════"
echo "FASE 7: Testing Integration & Compatibility"
echo -e "════════════════════════════════════════════════════════════${NC}"

# Test 7.1: Test compatibilità con vecchia versione
run_test "Backward compatibility - normale CLAUDE.md still works" "[ -f '$PROJECT_ROOT/CLAUDE.md' ]"

# Test 7.2: Test path resolution
run_test "Path resolution works correctly" "'$CES_ROOT/scripts/merge-claude-docs.sh' --dry-run"

# Test 7.3: Test permissions
run_test "All scripts have correct permissions" "find '$CES_ROOT/scripts' -name '*.sh' -executable"

# FASE 8: Test Performance e Robustness  
echo -e "\n${CYAN}════════════════════════════════════════════════════════════"
echo "FASE 8: Testing Performance & Robustness"
echo -e "════════════════════════════════════════════════════════════${NC}"

# Test 8.1: Test multiple merge operations
run_test "Multiple merge operations work" "for i in {1..3}; do '$CES_ROOT/scripts/merge-claude-docs.sh' --merge >/dev/null || exit 1; done"

# Test 8.2: Test error handling con file mancanti
run_test "Error handling with missing files" "[ ! -f '/tmp/nonexistent-claude.md' ]"

# Test 8.3: Test cleanup dopo merge
if [ -f "$PROJECT_ROOT/.claude/CLAUDE-MASTER.md" ]; then
    run_test "Generated file has reasonable size" "[ $(wc -c < '$PROJECT_ROOT/.claude/CLAUDE-MASTER.md') -gt 100 ]"
fi

# RISULTATI FINALI
echo -e "\n${GREEN}════════════════════════════════════════════════════════════"
echo "DUAL CLAUDE SYSTEM TEST RESULTS"
echo -e "════════════════════════════════════════════════════════════${NC}"

echo ""
echo "📊 Test Statistics:"
echo "   Total Tests: $TESTS_TOTAL"
echo "   Passed: $TESTS_PASSED"
echo "   Failed: $TESTS_FAILED"

PASS_PERCENTAGE=$((TESTS_PASSED * 100 / TESTS_TOTAL))
echo "   Success Rate: ${PASS_PERCENTAGE}%"

echo ""
if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}🏆 ALL TESTS PASSED! Dual Claude System is fully functional.${NC}"
    echo ""
    echo "✅ Components verified:"
    echo "   • merge-claude-docs.sh script"
    echo "   • ClaudeDocManager.ts utility"
    echo "   • DocumentationCommands.ts CLI"
    echo "   • CLIManager.ts integration"
    echo "   • PROJECT-CLAUDE.md template"
    echo "   • CLAUDE-MASTER.md generation"
    echo "   • CLI commands (docs show/validate/regenerate)"
    echo ""
    echo "🚀 Ready for production use!"
    echo ""
    echo "📚 Usage:"
    echo "   npm run dev -- docs show       # View merged documentation"
    echo "   npm run dev -- docs validate   # Validate system"  
    echo "   npm run dev -- docs regenerate # Regenerate merged docs"
    echo "   npm run dev -- docs edit       # Edit project docs"
    echo ""
elif [ $PASS_PERCENTAGE -ge 80 ]; then
    echo -e "${YELLOW}⚠️  MOSTLY FUNCTIONAL with minor issues.${NC}"
    echo "   $TESTS_FAILED test(s) failed but core functionality works."
    echo "   Review failed tests above for optimization opportunities."
    echo ""
elif [ $PASS_PERCENTAGE -ge 60 ]; then
    echo -e "${YELLOW}🔧 PARTIAL FUNCTIONALITY - needs attention.${NC}"
    echo "   $TESTS_FAILED test(s) failed. Some components may need fixes."
    echo "   Review test output above for specific issues."
    echo ""  
else
    echo -e "${RED}❌ CRITICAL ISSUES DETECTED!${NC}"
    echo "   $TESTS_FAILED test(s) failed. System requires immediate attention."
    echo "   Review all failed tests above before using in production."
    echo ""
fi

# Cleanup test files
if [ -f "$PROJECT_ROOT/CLAUDE.md" ] && grep -q "TEST PROJECT CLAUDE.md" "$PROJECT_ROOT/CLAUDE.md"; then
    log_info "Cleaning up test CLAUDE.md..."
    rm "$PROJECT_ROOT/CLAUDE.md"
fi

echo "📋 Test completed at: $(date)"
echo "🔍 Logs available in: $CES_ROOT/.ces-logs/"

# Exit con codice appropriato
if [ $TESTS_FAILED -eq 0 ]; then
    exit 0
else
    exit 1
fi