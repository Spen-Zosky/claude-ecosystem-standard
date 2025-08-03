#!/bin/bash

# Quick Setup Script for Claude Ecosystem Standard (CES)
# Automated initialization with intelligent dependency handling

set -e  # Exit on any error

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

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Project information
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_NAME="$(basename "$PROJECT_ROOT")"

# Success/failure tracking
STEPS_COMPLETED=0
TOTAL_STEPS=8
WARNINGS=()
ERRORS=()

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%H:%M:%S')] $1${NC}"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
    ((STEPS_COMPLETED++))
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
    WARNINGS+=("$1")
}

error() {
    echo -e "${RED}❌ $1${NC}"
    ERRORS+=("$1")
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Smart dependency installation
install_dependencies() {
    log "Checking system dependencies..."
    
    local deps_needed=()
    
    # Check for required tools
    if ! command_exists jq; then
        deps_needed+=("jq")
    fi
    
    if ! command_exists curl; then
        deps_needed+=("curl")
    fi
    
    if ! command_exists git; then
        deps_needed+=("git")
    fi
    
    if [ ${#deps_needed[@]} -eq 0 ]; then
        success "All system dependencies are installed"
        return 0
    fi
    
    log "Installing missing dependencies: ${deps_needed[*]}"
    
    # Detect package manager and install
    if command_exists apt-get; then
        # Ubuntu/Debian
        if [ "$EUID" -eq 0 ]; then
            apt-get update && apt-get install -y "${deps_needed[@]}"
        elif command_exists sudo; then
            sudo apt-get update && sudo apt-get install -y "${deps_needed[@]}"
        else
            warning "Cannot install dependencies without sudo. Please install manually: ${deps_needed[*]}"
            return 1
        fi
    elif command_exists yum; then
        # RHEL/CentOS
        if [ "$EUID" -eq 0 ]; then
            yum install -y "${deps_needed[@]}"
        elif command_exists sudo; then
            sudo yum install -y "${deps_needed[@]}"
        else
            warning "Cannot install dependencies without sudo. Please install manually: ${deps_needed[*]}"
            return 1
        fi
    elif command_exists brew; then
        # macOS
        brew install "${deps_needed[@]}"
    else
        warning "Package manager not detected. Please install manually: ${deps_needed[*]}"
        echo "  Ubuntu/Debian: sudo apt-get install ${deps_needed[*]}"
        echo "  RHEL/CentOS:   sudo yum install ${deps_needed[*]}"
        echo "  macOS:         brew install ${deps_needed[*]}"
        return 1
    fi
    
    success "System dependencies installed"
}

# Setup Node.js project
setup_nodejs() {
    log "Setting up Node.js project..."
    
    if ! command_exists node; then
        error "Node.js not found. Please install Node.js 18+ first"
        echo "  Visit: https://nodejs.org/"
        echo "  Or use: curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash - && sudo apt-get install -y nodejs"
        return 1
    fi
    
    # Check Node.js version
    local node_version=$(node --version | sed 's/v//')
    local major_version=$(echo "$node_version" | cut -d. -f1)
    
    if [ "$major_version" -lt 18 ]; then
        warning "Node.js version $node_version detected. Recommended: 18+"
    fi
    
    log "Installing npm dependencies..."
    if npm install; then
        success "npm dependencies installed"
    else
        error "Failed to install npm dependencies"
        return 1
    fi
}

# Build TypeScript
build_typescript() {
    log "Building TypeScript project..."
    
    if npm run build; then
        success "TypeScript build completed"
    else
        error "TypeScript build failed"
        return 1
    fi
}

# Run tests
run_tests() {
    log "Running test suite..."
    
    if npm test; then
        success "All tests passed"
    else
        warning "Some tests failed, but continuing setup"
    fi
}

# Setup Claude ecosystem
setup_claude_ecosystem() {
    log "Setting up Claude Code CLI ecosystem..."
    
    # Verify .claude directory structure
    local claude_dir="$PROJECT_ROOT/.claude"
    
    if [ ! -d "$claude_dir" ]; then
        error "Claude ecosystem directory not found: $claude_dir"
        return 1
    fi
    
    # Check for essential files
    local essential_files=(
        "$claude_dir/claude_desktop_config.json"
        "$claude_dir/startup-hook.cjs"
        "$claude_dir/agents"
    )
    
    for file in "${essential_files[@]}"; do
        if [ ! -e "$file" ]; then
            error "Essential Claude file missing: $(basename "$file")"
            return 1
        fi
    done
    
    # Count MCP servers
    local mcp_count=0
    if [ -f "$claude_dir/claude_desktop_config.json" ]; then
        mcp_count=$(jq '.mcpServers | length' "$claude_dir/claude_desktop_config.json" 2>/dev/null || echo "0")
    fi
    
    # Count agents
    local agent_count=0
    if [ -d "$claude_dir/agents" ]; then
        agent_count=$(find "$claude_dir/agents" -name "*.md" | wc -l)
    fi
    
    log "Claude ecosystem verified:"
    log "  📁 Project: $PROJECT_NAME"
    log "  🔌 MCP Servers: $mcp_count"
    log "  🤖 Agents: $agent_count"
    
    success "Claude Code CLI ecosystem ready"
}

# Setup global dynamic hook
setup_global_hook() {
    log "Setting up global dynamic hook..."
    
    local global_hook="$HOME/.claude/dynamic-hook.cjs"
    local settings_file="$HOME/.claude/settings.local.json"
    
    # Create global .claude directory
    mkdir -p "$HOME/.claude"
    
    # Check if global hook exists
    if [ -f "$global_hook" ]; then
        log "Global dynamic hook already exists"
    else
        log "Global dynamic hook not found - CES may need full installation"
    fi
    
    # Check settings
    if [ -f "$settings_file" ]; then
        log "Claude settings found"
    else
        log "Claude settings not found - may need configuration"
    fi
    
    success "Global hook verification completed"
}

# Validate installation
validate_installation() {
    log "Validating installation..."
    
    local validation_errors=()
    
    # Check if project builds
    if [ ! -f "$PROJECT_ROOT/dist/index.js" ]; then
        validation_errors+=("TypeScript build output missing")
    fi
    
    # Check if scripts are executable
    local scripts=("start-session.js" "checkpoint-session.js" "close-session.js")
    for script in "${scripts[@]}"; do
        if [ ! -f "$PROJECT_ROOT/$script" ]; then
            validation_errors+=("Script missing: $script")
        fi
    done
    
    # Check Claude ecosystem
    if [ ! -d "$PROJECT_ROOT/.claude/agents" ]; then
        validation_errors+=("Agents directory missing")
    fi
    
    if [ ${#validation_errors[@]} -eq 0 ]; then
        success "Installation validation passed"
        return 0
    else
        error "Validation failed:"
        for err in "${validation_errors[@]}"; do
            echo "  • $err"
        done
        return 1
    fi
}

# Final summary
show_summary() {
    echo ""
    echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${CYAN}🚀 CLAUDE ECOSYSTEM STANDARD - SETUP COMPLETE${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
    echo ""
    echo -e "${GREEN}✅ Setup Progress: $STEPS_COMPLETED/$TOTAL_STEPS steps completed${NC}"
    echo ""
    echo -e "${BLUE}📁 Project: ${NC}$PROJECT_NAME"
    echo -e "${BLUE}📂 Location: ${NC}$PROJECT_ROOT"
    echo ""
    
    if [ ${#WARNINGS[@]} -gt 0 ]; then
        echo -e "${YELLOW}⚠️  Warnings (${#WARNINGS[@]}):${NC}"
        for warning in "${WARNINGS[@]}"; do
            echo "  • $warning"
        done
        echo ""
    fi
    
    if [ ${#ERRORS[@]} -gt 0 ]; then
        echo -e "${RED}❌ Errors (${#ERRORS[@]}):${NC}"
        for error in "${ERRORS[@]}"; do
            echo "  • $error"
        done
        echo ""
    fi
    
    echo -e "${CYAN}🎯 Ready to use:${NC}"
    echo -e "${GREEN}  **start session${NC}     # Start Claude Code CLI session"
    echo -e "${GREEN}  **register session${NC}  # Create session checkpoint"
    echo -e "${GREEN}  **close session${NC}     # Close and cleanup session"
    echo ""
    echo -e "${BLUE}💡 Alternative commands:${NC}"
    echo -e "${GRAY}  node start-session.js${NC}        # Direct session start"
    echo -e "${GRAY}  npm run dev -- status${NC}         # Show system status"
    echo -e "${GRAY}  npm run dev -- interactive${NC}    # Interactive CLI mode"
    echo ""
    echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
}

# Main execution
main() {
    echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${CYAN}🚀 CLAUDE ECOSYSTEM STANDARD - QUICK SETUP${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
    echo ""
    echo -e "${BLUE}📁 Project: ${NC}$PROJECT_NAME"
    echo -e "${BLUE}📂 Location: ${NC}$PROJECT_ROOT"
    echo -e "${BLUE}⏰ Started: ${NC}$(date)"
    echo ""
    
    # Change to project directory
    cd "$PROJECT_ROOT"
    
    # Execute setup steps
    install_dependencies || true
    setup_nodejs || exit 1
    build_typescript || exit 1
    run_tests || true
    setup_claude_ecosystem || exit 1
    setup_global_hook || true
    validate_installation || true
    
    # Show final summary
    show_summary
    
    # Exit with appropriate code
    if [ ${#ERRORS[@]} -eq 0 ]; then
        exit 0
    else
        exit 1
    fi
}

# Execute main function
main "$@"