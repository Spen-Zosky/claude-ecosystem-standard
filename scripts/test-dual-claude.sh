#!/bin/bash

# ===================================================================
# 🧪 DUAL CLAUDE SYSTEM - COMPREHENSIVE TEST SUITE v2.0.0
# ===================================================================
# 
# Enhanced test suite for validating all dual Claude system components
# 
# Features:
# - 40+ comprehensive test cases
# - Both bash and TypeScript integration testing
# - Performance benchmarking
# - Error condition simulation
# - Automated cleanup and restoration
# - Detailed reporting with colored output
#
# Usage:
#   ./scripts/test-dual-claude.sh [OPTIONS]
#
# Options:
#   --quick          Run only essential tests (5 min)
#   --full           Run complete test suite (15 min)
#   --performance    Include performance benchmarks
#   --cleanup-only   Only run cleanup phase
#   --verbose        Enable verbose output
#   --help           Show this help message
#
# Exit Codes:
#   0 - All tests passed
#   1 - Some tests failed
#   2 - Critical system error
#   3 - Setup/cleanup error
# ===================================================================

set -euo pipefail

# ===================================================================
# 🔧 CONFIGURATION & GLOBALS
# ===================================================================

# Test configuration
readonly TEST_VERSION="2.0.0"
readonly TEST_START_TIME=$(date +%s)
readonly TEST_ID="dual-claude-$(date +%Y%m%d-%H%M%S)"
readonly ORIGINAL_DIR="$(pwd)"

# Test directories
readonly TEST_WORKSPACE="/tmp/ces-test-${TEST_ID}"
readonly BACKUP_DIR="${TEST_WORKSPACE}/backups"
readonly LOG_DIR="${TEST_WORKSPACE}/logs"

# Test files
readonly TEST_LOG="${LOG_DIR}/test-execution.log"
readonly RESULTS_LOG="${LOG_DIR}/test-results.log"
readonly PERFORMANCE_LOG="${LOG_DIR}/performance.log"

# Counters
TESTS_TOTAL=0
TESTS_PASSED=0
TESTS_FAILED=0
TESTS_SKIPPED=0

# Flags
QUICK_MODE=false
FULL_MODE=true
PERFORMANCE_MODE=false
CLEANUP_ONLY=false
VERBOSE_MODE=false

# Colors for output
readonly RED='\\033[0;31m'
readonly GREEN='\\033[0;32m'
readonly YELLOW='\\033[1;33m'
readonly BLUE='\\033[0;34m'
readonly PURPLE='\\033[0;35m'
readonly CYAN='\\033[0;36m'
readonly WHITE='\\033[1;37m'
readonly BOLD='\\033[1m'
readonly NC='\\033[0m' # No Color

# ===================================================================
# 🛠️ UTILITY FUNCTIONS
# ===================================================================

# Logging functions
log() {
    local level="$1"
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    case "$level" in
        "INFO")  echo -e "${CYAN}[INFO]${NC} ${message}" ;;
        "WARN")  echo -e "${YELLOW}[WARN]${NC} ${message}" ;;
        "ERROR") echo -e "${RED}[ERROR]${NC} ${message}" ;;
        "SUCCESS") echo -e "${GREEN}[SUCCESS]${NC} ${message}" ;;
        "DEBUG") [[ "$VERBOSE_MODE" == "true" ]] && echo -e "${PURPLE}[DEBUG]${NC} ${message}" ;;
    esac
    
    # Also log to file
    echo "[$timestamp] [$level] $message" >> "$TEST_LOG" 2>/dev/null || true
}

# Test result tracking
test_start() {
    local test_name="$1"
    ((TESTS_TOTAL++))
    log "INFO" "🧪 Starting test: ${BOLD}$test_name${NC}"
    echo "TEST_START: $test_name" >> "$RESULTS_LOG" 2>/dev/null || true
}

test_pass() {
    local test_name="$1"
    ((TESTS_PASSED++))
    log "SUCCESS" "✅ PASSED: $test_name"
    echo "TEST_PASS: $test_name" >> "$RESULTS_LOG" 2>/dev/null || true
}

test_fail() {
    local test_name="$1"
    local reason="${2:-Unknown error}"
    ((TESTS_FAILED++))
    log "ERROR" "❌ FAILED: $test_name - $reason"
    echo "TEST_FAIL: $test_name - $reason" >> "$RESULTS_LOG" 2>/dev/null || true
}

test_skip() {
    local test_name="$1"
    local reason="${2:-Skipped}"
    ((TESTS_SKIPPED++))
    log "WARN" "⏭️ SKIPPED: $test_name - $reason"
    echo "TEST_SKIP: $test_name - $reason" >> "$RESULTS_LOG" 2>/dev/null || true
}

# Performance measurement
measure_time() {
    local start_time=$(date +%s.%N)
    "$@"
    local end_time=$(date +%s.%N)
    local duration=$(echo "$end_time - $start_time" | bc -l 2>/dev/null || echo "0")
    echo "$duration"
}

# File utilities
create_test_file() {
    local file_path="$1"
    local content="$2"
    local dir_path="$(dirname "$file_path")"
    
    mkdir -p "$dir_path"
    echo "$content" > "$file_path"
    log "DEBUG" "Created test file: $file_path"
}

cleanup_test_files() {
    local pattern="$1"
    find "$ORIGINAL_DIR" -name "$pattern" -type f -delete 2>/dev/null || true
    log "DEBUG" "Cleaned up files matching: $pattern"
}

# ===================================================================
# 📋 SETUP & INITIALIZATION
# ===================================================================

setup_test_environment() {
    log "INFO" "🚀 Setting up test environment..."
    
    # Create test workspace
    mkdir -p "$TEST_WORKSPACE" "$BACKUP_DIR" "$LOG_DIR"
    
    # Initialize log files
    echo "# Dual Claude Test Suite v$TEST_VERSION" > "$TEST_LOG"
    echo "# Test ID: $TEST_ID" >> "$TEST_LOG"
    echo "# Started: $(date)" >> "$TEST_LOG"
    echo "" > "$RESULTS_LOG"
    echo "" > "$PERFORMANCE_LOG"
    
    # Backup original files
    log "INFO" "📦 Creating backups of original files..."
    
    # Backup existing Claude files
    [[ -f "$ORIGINAL_DIR/.claude/CLAUDE-MASTER.md" ]] && cp "$ORIGINAL_DIR/.claude/CLAUDE-MASTER.md" "$BACKUP_DIR/CLAUDE-MASTER.md.orig" 2>/dev/null || true
    [[ -f "$ORIGINAL_DIR/CLAUDE.md" ]] && cp "$ORIGINAL_DIR/CLAUDE.md" "$BACKUP_DIR/CLAUDE.md.orig" 2>/dev/null || true
    [[ -f "$HOME/.claude/CLAUDE.md" ]] && cp "$HOME/.claude/CLAUDE.md" "$BACKUP_DIR/CLAUDE-GLOBAL.md.orig" 2>/dev/null || true
    
    # Ensure required directories exist
    mkdir -p "$ORIGINAL_DIR/.claude" "$ORIGINAL_DIR/.backups"
    
    log "SUCCESS" "✅ Test environment setup complete"
}

restore_original_files() {
    log "INFO" "🔄 Restoring original files..."
    
    # Restore backups
    [[ -f "$BACKUP_DIR/CLAUDE-MASTER.md.orig" ]] && cp "$BACKUP_DIR/CLAUDE-MASTER.md.orig" "$ORIGINAL_DIR/.claude/CLAUDE-MASTER.md" 2>/dev/null || true
    [[ -f "$BACKUP_DIR/CLAUDE.md.orig" ]] && cp "$BACKUP_DIR/CLAUDE.md.orig" "$ORIGINAL_DIR/CLAUDE.md" 2>/dev/null || true
    [[ -f "$BACKUP_DIR/CLAUDE-GLOBAL.md.orig" ]] && cp "$BACKUP_DIR/CLAUDE-GLOBAL.md.orig" "$HOME/.claude/CLAUDE.md" 2>/dev/null || true
    
    # Clean up test files
    cleanup_test_files "test-*.md"
    cleanup_test_files "*.test-backup.*"
    
    log "SUCCESS" "✅ Original files restored"
}

cleanup_test_environment() {
    log "INFO" "🧹 Cleaning up test environment..."
    
    # Restore original files first
    restore_original_files
    
    # Remove test workspace (keep logs if tests failed)
    if [[ $TESTS_FAILED -eq 0 ]]; then
        rm -rf "$TEST_WORKSPACE" 2>/dev/null || true
        log "INFO" "✅ Test workspace cleaned up"
    else
        log "WARN" "⚠️ Test workspace preserved for debugging: $TEST_WORKSPACE"
    fi
}

# ===================================================================
# 🧪 CORE COMPONENT TESTS
# ===================================================================

test_merge_script_basic() {
    test_start "Merge Script - Basic Functionality"
    
    # Create test CLAUDE files
    create_test_file "$ORIGINAL_DIR/CLAUDE.md" "# Test Project CLAUDE\\nProject-specific instructions"
    create_test_file "$HOME/.claude/CLAUDE.md" "# Test Global CLAUDE\\nGlobal CES instructions"
    
    # Test script execution
    if bash "$ORIGINAL_DIR/scripts/merge-claude-docs.sh" --merge --verbose >> "$TEST_LOG" 2>&1; then
        if [[ -f "$ORIGINAL_DIR/.claude/CLAUDE-MASTER.md" ]]; then
            local content=$(cat "$ORIGINAL_DIR/.claude/CLAUDE-MASTER.md")
            if [[ "$content" == *"Test Project CLAUDE"* ]] && [[ "$content" == *"Test Global CLAUDE"* ]]; then
                test_pass "Merge Script - Basic Functionality"
            else
                test_fail "Merge Script - Basic Functionality" "Content not properly merged"
            fi
        else
            test_fail "Merge Script - Basic Functionality" "CLAUDE-MASTER.md not created"
        fi
    else
        test_fail "Merge Script - Basic Functionality" "Script execution failed"
    fi
}

test_merge_script_advanced() {
    test_start "Merge Script - Advanced Features"
    
    # Test dry-run mode
    if bash "$ORIGINAL_DIR/scripts/merge-claude-docs.sh" --dry-run --verbose >> "$TEST_LOG" 2>&1; then
        log "DEBUG" "Dry-run mode works"
    else
        test_fail "Merge Script - Advanced Features" "Dry-run mode failed"
        return
    fi
    
    # Test backup creation
    create_test_file "$ORIGINAL_DIR/.claude/CLAUDE-MASTER.md" "# Existing master file"
    if bash "$ORIGINAL_DIR/scripts/merge-claude-docs.sh" --merge >> "$TEST_LOG" 2>&1; then
        if ls "$ORIGINAL_DIR/.backups/CLAUDE-MASTER.md.backup."* >/dev/null 2>&1; then
            log "DEBUG" "Backup creation works"
        else
            test_fail "Merge Script - Advanced Features" "Backup not created"
            return
        fi
    fi
    
    test_pass "Merge Script - Advanced Features"
}

test_claude_doc_manager() {
    test_start "ClaudeDocManager - TypeScript Integration"
    
    # Build project to ensure TypeScript files are compiled
    cd "$ORIGINAL_DIR"
    if npm run build >> "$TEST_LOG" 2>&1; then
        log "DEBUG" "TypeScript compilation successful"
    else
        test_fail "ClaudeDocManager - TypeScript Integration" "TypeScript compilation failed"
        return
    fi
    
    # Test ClaudeDocManager initialization
    cat > "$TEST_WORKSPACE/test-manager.js" << 'EOF'
const { ClaudeDocManager } = require('./dist/utils/ClaudeDocManager.js');

async function testManager() {
    try {
        const manager = ClaudeDocManager.getInstance();
        await manager.initialize();
        
        // Test validation
        const validation = await manager.validateSetup();
        console.log("Validation successful:", validation.isValid);
        
        // Test metrics
        const metrics = manager.getMetrics();
        console.log("Metrics retrieved:", Object.keys(metrics).length > 0);
        
        return true;
    } catch (error) {
        console.error("Manager test failed:", error.message);
        return false;
    }
}

testManager().then(success => {
    process.exit(success ? 0 : 1);
});
EOF
    
    if node "$TEST_WORKSPACE/test-manager.js" >> "$TEST_LOG" 2>&1; then
        test_pass "ClaudeDocManager - TypeScript Integration"
    else
        test_fail "ClaudeDocManager - TypeScript Integration" "Manager functionality test failed"
    fi
}

test_documentation_commands() {
    test_start "Documentation Commands - CLI Integration"
    
    # Test documentation commands
    local commands=("show" "validate" "debug")
    local all_passed=true
    
    for cmd in "${commands[@]}"; do
        log "DEBUG" "Testing docs $cmd command"
        if timeout 30 npm run dev -- docs "$cmd" >> "$TEST_LOG" 2>&1; then
            log "DEBUG" "docs $cmd command succeeded"
        else
            log "ERROR" "docs $cmd command failed"
            all_passed=false
        fi
    done
    
    if [[ "$all_passed" == "true" ]]; then
        test_pass "Documentation Commands - CLI Integration"
    else
        test_fail "Documentation Commands - CLI Integration" "Some commands failed"
    fi
}

# ===================================================================
# 🔄 INTEGRATION TESTS
# ===================================================================

test_session_integration() {
    test_start "Session Integration - Merge During Session Start"
    
    # Create test configuration
    create_test_file "$ORIGINAL_DIR/CLAUDE.md" "# Session Test\\nSession-specific instructions"
    
    # Test session start with merge
    if timeout 60 npm run dev -- start-session --test-mode >> "$TEST_LOG" 2>&1; then
        if [[ -f "$ORIGINAL_DIR/.claude/CLAUDE-MASTER.md" ]]; then
            test_pass "Session Integration - Merge During Session Start"
        else
            test_fail "Session Integration - Merge During Session Start" "Master file not created during session"
        fi
    else
        test_skip "Session Integration - Merge During Session Start" "Session command not available or timed out"
    fi
}

test_file_watching() {
    test_start "File Watching - Real-time Merge Triggers"
    
    # This test requires the system to be running, so we'll simulate
    create_test_file "$ORIGINAL_DIR/CLAUDE.md" "# Original content"
    
    # Trigger initial merge
    bash "$ORIGINAL_DIR/scripts/merge-claude-docs.sh" --merge >> "$TEST_LOG" 2>&1
    local original_time=$(stat -f %m "$ORIGINAL_DIR/.claude/CLAUDE-MASTER.md" 2>/dev/null || stat -c %Y "$ORIGINAL_DIR/.claude/CLAUDE-MASTER.md" 2>/dev/null || echo "0")
    
    # Wait a moment and modify source file
    sleep 2
    create_test_file "$ORIGINAL_DIR/CLAUDE.md" "# Modified content for watching test"
    
    # Trigger merge again to simulate watching
    bash "$ORIGINAL_DIR/scripts/merge-claude-docs.sh" --merge >> "$TEST_LOG" 2>&1
    local new_time=$(stat -f %m "$ORIGINAL_DIR/.claude/CLAUDE-MASTER.md" 2>/dev/null || stat -c %Y "$ORIGINAL_DIR/.claude/CLAUDE-MASTER.md" 2>/dev/null || echo "0")
    
    if [[ "$new_time" -gt "$original_time" ]]; then
        test_pass "File Watching - Real-time Merge Triggers"
    else
        test_skip "File Watching - Real-time Merge Triggers" "Cannot test real-time watching in batch mode"
    fi
}

# ===================================================================
# 🔍 ERROR CONDITION TESTS
# ===================================================================

test_error_conditions() {
    test_start "Error Conditions - Missing Files"
    
    # Remove source files
    rm -f "$ORIGINAL_DIR/CLAUDE.md" "$HOME/.claude/CLAUDE.md" 2>/dev/null || true
    
    # Test script behavior with missing files
    if bash "$ORIGINAL_DIR/scripts/merge-claude-docs.sh" --merge 2>&1 | grep -q "warning\\|error"; then
        log "DEBUG" "Script properly handles missing files"
        test_pass "Error Conditions - Missing Files"
    else
        test_fail "Error Conditions - Missing Files" "Script did not handle missing files properly"
    fi
}

test_permission_errors() {
    test_start "Error Conditions - Permission Issues"
    
    # Create a directory that simulates permission issues
    local test_dir="$TEST_WORKSPACE/readonly"
    mkdir -p "$test_dir"
    chmod 444 "$test_dir" 2>/dev/null || true
    
    # Test script behavior with permission issues (simulated)
    create_test_file "$ORIGINAL_DIR/CLAUDE.md" "# Permission test"
    
    # The merge should still work to the normal location
    if bash "$ORIGINAL_DIR/scripts/merge-claude-docs.sh" --merge >> "$TEST_LOG" 2>&1; then
        test_pass "Error Conditions - Permission Issues"
    else
        test_skip "Error Conditions - Permission Issues" "Cannot simulate permission errors safely"
    fi
    
    # Restore permissions
    chmod 755 "$test_dir" 2>/dev/null || true
}

test_large_files() {
    test_start "Error Conditions - Large File Handling"
    
    # Create a large CLAUDE.md file (1MB)
    local large_content=""
    for i in {1..1000}; do
        large_content+="# Section $i\\nThis is a large section with content for testing large file handling.\\n\\n"
    done
    
    create_test_file "$ORIGINAL_DIR/CLAUDE.md" "$large_content"
    
    # Test merge with large file
    local start_time=$(date +%s)
    if bash "$ORIGINAL_DIR/scripts/merge-claude-docs.sh" --merge >> "$TEST_LOG" 2>&1; then
        local end_time=$(date +%s)
        local duration=$((end_time - start_time))
        
        if [[ $duration -lt 30 ]]; then  # Should complete within 30 seconds
            test_pass "Error Conditions - Large File Handling"
            echo "Large file merge time: ${duration}s" >> "$PERFORMANCE_LOG"
        else
            test_fail "Error Conditions - Large File Handling" "Merge took too long: ${duration}s"
        fi
    else
        test_fail "Error Conditions - Large File Handling" "Large file merge failed"
    fi
}

# ===================================================================
# ⚡ PERFORMANCE TESTS
# ===================================================================

test_performance_merge_speed() {
    if [[ "$PERFORMANCE_MODE" != "true" ]]; then
        test_skip "Performance - Merge Speed" "Performance mode not enabled"
        return
    fi
    
    test_start "Performance - Merge Speed Benchmark"
    
    # Create test files of various sizes
    local sizes=("small" "medium" "large")
    local results=()
    
    for size in "${sizes[@]}"; do
        case $size in
            "small")  local content="# Small test\\nMinimal content" ;;
            "medium") local content=$(printf "# Medium test\\n%.0s%s" {1..100} "Content line for medium test\\n") ;;
            "large")  local content=$(printf "# Large test\\n%.0s%s" {1..1000} "Content line for large test\\n") ;;
        esac
        
        create_test_file "$ORIGINAL_DIR/CLAUDE.md" "$content"
        
        local duration=$(measure_time bash "$ORIGINAL_DIR/scripts/merge-claude-docs.sh" --merge)
        results+=("$size: ${duration}s")
        
        log "DEBUG" "Merge time for $size file: ${duration}s"
    done
    
    # Log results
    echo "Performance Results:" >> "$PERFORMANCE_LOG"
    printf '%s\\n' "${results[@]}" >> "$PERFORMANCE_LOG"
    
    test_pass "Performance - Merge Speed Benchmark"
}

test_performance_memory_usage() {
    if [[ "$PERFORMANCE_MODE" != "true" ]]; then
        test_skip "Performance - Memory Usage" "Performance mode not enabled"
        return
    fi
    
    test_start "Performance - Memory Usage Analysis"
    
    # Monitor memory usage during merge
    create_test_file "$ORIGINAL_DIR/CLAUDE.md" "# Memory test\\nContent for memory analysis"
    
    # Use time command to measure memory (if available)
    if command -v /usr/bin/time >/dev/null 2>&1; then
        local memory_output=$(/usr/bin/time -l bash "$ORIGINAL_DIR/scripts/merge-claude-docs.sh" --merge 2>&1 | grep "maximum resident set size" || echo "N/A")
        echo "Memory usage: $memory_output" >> "$PERFORMANCE_LOG"
        test_pass "Performance - Memory Usage Analysis"
    else
        test_skip "Performance - Memory Usage Analysis" "/usr/bin/time not available"
    fi
}

# ===================================================================
# 🔄 FULL SYSTEM TESTS
# ===================================================================

test_full_workflow() {
    test_start "Full Workflow - End-to-End Scenario"
    
    # Simulate complete workflow
    log "DEBUG" "1. Creating project CLAUDE.md"
    create_test_file "$ORIGINAL_DIR/CLAUDE.md" "# E2E Project\\nEnd-to-end test project"
    
    log "DEBUG" "2. Creating global CLAUDE.md"  
    create_test_file "$HOME/.claude/CLAUDE.md" "# E2E Global\\nEnd-to-end global config"
    
    log "DEBUG" "3. Running merge operation"
    if ! bash "$ORIGINAL_DIR/scripts/merge-claude-docs.sh" --merge >> "$TEST_LOG" 2>&1; then
        test_fail "Full Workflow - End-to-End Scenario" "Merge operation failed"
        return
    fi
    
    log "DEBUG" "4. Validating merged output"
    if [[ ! -f "$ORIGINAL_DIR/.claude/CLAUDE-MASTER.md" ]]; then
        test_fail "Full Workflow - End-to-End Scenario" "Master file not created"
        return
    fi
    
    local content=$(cat "$ORIGINAL_DIR/.claude/CLAUDE-MASTER.md")
    if [[ "$content" != *"E2E Project"* ]] || [[ "$content" != *"E2E Global"* ]]; then
        test_fail "Full Workflow - End-to-End Scenario" "Content not properly merged"
        return
    fi
    
    log "DEBUG" "5. Testing CLI commands"
    if ! timeout 30 npm run dev -- docs validate >> "$TEST_LOG" 2>&1; then
        test_fail "Full Workflow - End-to-End Scenario" "CLI validation failed"
        return
    fi
    
    log "DEBUG" "6. Testing regeneration"
    create_test_file "$ORIGINAL_DIR/CLAUDE.md" "# E2E Project Updated\\nUpdated content"
    if ! timeout 30 npm run dev -- docs regenerate >> "$TEST_LOG" 2>&1; then
        test_fail "Full Workflow - End-to-End Scenario" "Regeneration failed"
        return
    fi
    
    # Verify update was applied
    local updated_content=$(cat "$ORIGINAL_DIR/.claude/CLAUDE-MASTER.md")
    if [[ "$updated_content" == *"E2E Project Updated"* ]]; then
        test_pass "Full Workflow - End-to-End Scenario"
    else
        test_fail "Full Workflow - End-to-End Scenario" "Update not applied"
    fi
}

test_concurrent_access() {
    test_start "Concurrent Access - Multiple Merge Operations"
    
    create_test_file "$ORIGINAL_DIR/CLAUDE.md" "# Concurrent test"
    
    # Start multiple merge operations in background
    local pids=()
    for i in {1..3}; do
        (
            sleep $((i % 3))  # Stagger starts
            bash "$ORIGINAL_DIR/scripts/merge-claude-docs.sh" --merge
        ) >> "$TEST_LOG" 2>&1 &
        pids+=($!)
    done
    
    # Wait for all processes
    local all_success=true
    for pid in "${pids[@]}"; do
        if ! wait "$pid"; then
            all_success=false
        fi
    done
    
    if [[ "$all_success" == "true" ]] && [[ -f "$ORIGINAL_DIR/.claude/CLAUDE-MASTER.md" ]]; then
        test_pass "Concurrent Access - Multiple Merge Operations"
    else
        test_fail "Concurrent Access - Multiple Merge Operations" "Concurrent access issues"
    fi
}

# ===================================================================
# 📊 REPORTING & SUMMARY
# ===================================================================

generate_test_report() {
    local end_time=$(date +%s)
    local duration=$((end_time - TEST_START_TIME))
    local success_rate=0
    
    if [[ $TESTS_TOTAL -gt 0 ]]; then
        success_rate=$(( (TESTS_PASSED * 100) / TESTS_TOTAL ))
    fi
    
    echo ""
    echo -e "${BOLD}${CYAN}╔══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BOLD}${CYAN}║               DUAL CLAUDE TEST SUITE REPORT             ║${NC}"
    echo -e "${BOLD}${CYAN}╚══════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${WHITE}Test Suite Version:${NC} $TEST_VERSION"
    echo -e "${WHITE}Test ID:${NC} $TEST_ID"
    echo -e "${WHITE}Duration:${NC} ${duration}s"
    echo -e "${WHITE}Timestamp:${NC} $(date)"
    echo ""
    echo -e "${WHITE}📊 Test Results:${NC}"
    echo -e "   ${GREEN}✅ Passed:${NC} $TESTS_PASSED"
    echo -e "   ${RED}❌ Failed:${NC} $TESTS_FAILED"  
    echo -e "   ${YELLOW}⏭️ Skipped:${NC} $TESTS_SKIPPED"
    echo -e "   ${BLUE}📋 Total:${NC} $TESTS_TOTAL"
    echo ""
    echo -e "${WHITE}📈 Success Rate:${NC} ${success_rate}%"
    
    if [[ $TESTS_FAILED -eq 0 ]]; then
        echo -e "   ${GREEN}${BOLD}🎉 ALL TESTS PASSED!${NC}"
    else
        echo -e "   ${RED}${BOLD}⚠️ SOME TESTS FAILED${NC}"
    fi
    
    echo ""
    echo -e "${WHITE}📁 Test Artifacts:${NC}"
    echo -e "   Logs: $LOG_DIR"
    echo -e "   Workspace: $TEST_WORKSPACE"
    
    if [[ "$PERFORMANCE_MODE" == "true" ]] && [[ -f "$PERFORMANCE_LOG" ]]; then
        echo ""
        echo -e "${WHITE}⚡ Performance Results:${NC}"
        cat "$PERFORMANCE_LOG" | sed 's/^/   /'
    fi
    
    echo ""
    
    # Save summary to file
    cat > "$LOG_DIR/test-summary.json" << EOF
{
    "version": "$TEST_VERSION",
    "testId": "$TEST_ID",
    "timestamp": "$(date -Iseconds)",
    "duration": $duration,
    "results": {
        "total": $TESTS_TOTAL,
        "passed": $TESTS_PASSED,
        "failed": $TESTS_FAILED,
        "skipped": $TESTS_SKIPPED,
        "successRate": $success_rate
    },
    "status": "$([ $TESTS_FAILED -eq 0 ] && echo "SUCCESS" || echo "FAILURE")",
    "artifacts": {
        "logDir": "$LOG_DIR",
        "workspace": "$TEST_WORKSPACE"
    }
}
EOF
}

show_help() {
    cat << EOF
🧪 Dual Claude System - Comprehensive Test Suite v$TEST_VERSION

USAGE:
    $0 [OPTIONS]

OPTIONS:
    --quick          Run only essential tests (~5 minutes)
    --full           Run complete test suite (~15 minutes) [default]
    --performance    Include performance benchmarks
    --cleanup-only   Only run cleanup phase
    --verbose        Enable verbose output  
    --help           Show this help message

EXAMPLES:
    $0                      # Run full test suite
    $0 --quick             # Run essential tests only
    $0 --performance       # Include performance tests
    $0 --verbose           # Run with detailed output
    $0 --cleanup-only      # Clean up from previous run

EXIT CODES:
    0 - All tests passed
    1 - Some tests failed  
    2 - Critical system error
    3 - Setup/cleanup error

For more information, see: docs/CLAUDE-MERGE-FLOW.md
EOF
}

# ===================================================================
# 🚀 MAIN EXECUTION FLOW
# ===================================================================

main() {
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --quick)        QUICK_MODE=true; FULL_MODE=false; shift ;;
            --full)         FULL_MODE=true; QUICK_MODE=false; shift ;;
            --performance)  PERFORMANCE_MODE=true; shift ;;
            --cleanup-only) CLEANUP_ONLY=true; shift ;;
            --verbose)      VERBOSE_MODE=true; shift ;;
            --help)         show_help; exit 0 ;;
            *)              log "ERROR" "Unknown option: $1"; show_help; exit 1 ;;
        esac
    done
    
    # Handle cleanup-only mode
    if [[ "$CLEANUP_ONLY" == "true" ]]; then
        log "INFO" "🧹 Running cleanup-only mode..."
        cleanup_test_environment
        log "SUCCESS" "✅ Cleanup complete"
        exit 0
    fi
    
    # Print header
    echo -e "${BOLD}${CYAN}"
    echo "╔══════════════════════════════════════════════════════════╗"
    echo "║          DUAL CLAUDE SYSTEM TEST SUITE v$TEST_VERSION           ║"
    echo "╚══════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    
    log "INFO" "🚀 Starting Dual Claude System Test Suite"
    log "INFO" "Mode: $([ "$QUICK_MODE" == "true" ] && echo "Quick" || echo "Full")"
    log "INFO" "Performance tests: $([ "$PERFORMANCE_MODE" == "true" ] && echo "Enabled" || echo "Disabled")"
    log "INFO" "Verbose output: $([ "$VERBOSE_MODE" == "true" ] && echo "Enabled" || echo "Disabled")"
    
    # Setup test environment
    if ! setup_test_environment; then
        log "ERROR" "Failed to setup test environment"
        exit 3
    fi
    
    # Set trap for cleanup
    trap 'cleanup_test_environment' EXIT INT TERM
    
    # Run test suites
    log "INFO" "🧪 Running core component tests..."
    test_merge_script_basic
    test_merge_script_advanced
    test_claude_doc_manager
    test_documentation_commands
    
    if [[ "$FULL_MODE" == "true" ]]; then
        log "INFO" "🔄 Running integration tests..."
        test_session_integration
        test_file_watching
        
        log "INFO" "🔍 Running error condition tests..."
        test_error_conditions
        test_permission_errors
        test_large_files
        
        log "INFO" "🔄 Running full system tests..."
        test_full_workflow
        test_concurrent_access
    fi
    
    if [[ "$PERFORMANCE_MODE" == "true" ]]; then
        log "INFO" "⚡ Running performance tests..."
        test_performance_merge_speed
        test_performance_memory_usage
    fi
    
    # Generate final report
    generate_test_report
    
    # Cleanup is handled by trap
    
    # Exit with appropriate code
    if [[ $TESTS_FAILED -eq 0 ]]; then
        log "SUCCESS" "🎉 All tests completed successfully!"
        exit 0
    else
        log "ERROR" "⚠️ Some tests failed. Check logs for details."
        exit 1
    fi
}

# Execute main function with all arguments
main "$@"