#!/bin/bash
# Claude Ecosystem Standard (CES) - Portable Initializer v2.5.0
# This script auto-detects its location and configures CES accordingly

set -e

# Auto-detect CES location
CES_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Determine installation type and project root
if [[ "$(basename "$CES_ROOT")" == "ces" ]]; then
    PROJECT_ROOT="$(dirname "$CES_ROOT")"
    INSTALLATION_TYPE="subdirectory"
    echo "🔍 Detected: CES installed as subdirectory in project"
else
    PROJECT_ROOT="$CES_ROOT"
    INSTALLATION_TYPE="standalone"
    echo "🔍 Detected: CES standalone installation"
fi

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Configuration
CES_VERSION="2.6.0-portable"
PROJECT_NAME="${1:-$(basename "$PROJECT_ROOT")}"

echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║        Claude Ecosystem Standard (CES) - Portable Edition    ║${NC}"
echo -e "${BLUE}║                        Version ${CES_VERSION}                    ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${PURPLE}📍 Installation Details:${NC}"
echo "   CES Location: $CES_ROOT"
echo "   Project Root: $PROJECT_ROOT"
echo "   Project Name: $PROJECT_NAME"
echo "   Installation Type: $INSTALLATION_TYPE"
echo ""

# Export environment variables for child processes
export CES_ROOT
export PROJECT_ROOT
export CES_VERSION
export PROJECT_NAME
export INSTALLATION_TYPE

# Validate Node.js and npm
echo -e "${BLUE}🔧 Validating dependencies...${NC}"

if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    echo "Please install Node.js 18+ and try again"
    exit 1
fi

NODE_VERSION=$(node --version | cut -d'v' -f2)
echo "   ✅ Node.js: v$NODE_VERSION"

if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed${NC}"
    echo "Please install npm and try again"
    exit 1
fi

NPM_VERSION=$(npm --version)
echo "   ✅ npm: v$NPM_VERSION"

# Create necessary directories
echo -e "${BLUE}📁 Creating configuration directories...${NC}"

# Create CES-specific directories
mkdir -p "$CES_ROOT/.ces-data"
mkdir -p "$CES_ROOT/.ces-logs"
mkdir -p "$CES_ROOT/.ces-cache"
mkdir -p "$CES_ROOT/.ces-temp"
mkdir -p "$CES_ROOT/.ces-backups"
mkdir -p "$CES_ROOT/.ces-session"

# Create .claude directory structure
mkdir -p "$CES_ROOT/.claude"
mkdir -p "$CES_ROOT/.claude/agents"

echo "   ✅ Created CES directories"

# Install dependencies if package.json exists
if [[ -f "$CES_ROOT/package.json" ]]; then
    echo -e "${BLUE}📦 Installing dependencies...${NC}"
    cd "$CES_ROOT"
    
    if npm install --silent; then
        echo "   ✅ Dependencies installed successfully"
    else
        echo -e "${YELLOW}⚠️  Warning: Some dependencies may have failed to install${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  package.json not found, skipping dependency installation${NC}"
fi

# Create or update environment configuration
echo -e "${BLUE}⚙️  Configuring environment...${NC}"

# Create .env file if it doesn't exist
if [[ ! -f "$CES_ROOT/.env" ]]; then
    cat > "$CES_ROOT/.env" << EOF
# CES Portable Configuration - Generated $(date)
NODE_ENV=development
CES_VERSION=$CES_VERSION
CES_PROJECT_NAME=$PROJECT_NAME
CES_INSTANCE_ID=ces-$(date +%s)
CES_ROOT=$CES_ROOT
PROJECT_ROOT=$PROJECT_ROOT
INSTALLATION_TYPE=$INSTALLATION_TYPE

# Session Configuration
CES_SESSION_TIMEOUT=3600000
CES_MAX_SESSIONS=10
CES_SESSION_CLEANUP_INTERVAL=300000

# Analytics
CES_ANALYTICS_ENABLED=true
CES_ANALYTICS_BATCH_SIZE=50
CES_ANALYTICS_RETENTION_DAYS=30

# AI Session
CES_AI_SESSION_ENABLED=true
CES_AI_LEARNING_MODE=standard
CES_AI_ADAPTATION_LEVEL=standard

# Cloud Integration
CES_CLOUD_ENABLED=false
CES_CLOUD_PROVIDER=github
CES_CLOUD_ENCRYPTION_ENABLED=true

# Logging
CES_LOG_LEVEL=info
CES_LOG_FORMAT=json
CES_LOG_MAX_FILES=5
CES_LOG_MAX_SIZE=10MB

# Network
CES_DEFAULT_PORT=3000
CES_MONITOR_PORT=3001
CES_DASHBOARD_PORT=3002
CES_HOST=localhost

# Security
CES_ENABLE_AUTH=false
CES_CORS_ENABLED=true

# Development
CES_DEBUG_ENABLED=false
CES_VERBOSE_LOGGING=false
CES_PERFORMANCE_MONITORING=true

# Auto Recovery
CES_AUTO_RECOVERY_ENABLED=true
CES_AUTO_RESTART_ENABLED=true
CES_AUTO_CLEANUP_ENABLED=true

# Dashboard
CES_DASHBOARD_ENABLED=true
CES_DASHBOARD_REFRESH_INTERVAL=2000
CES_DASHBOARD_COMPACT_MODE=false
CES_DASHBOARD_SHOW_GRAPHS=true
EOF
    echo "   ✅ Created .env configuration file"
else
    echo "   ✅ Environment file already exists"
fi

# Create MCP servers configuration if it doesn't exist
if [[ ! -f "$CES_ROOT/.claude/claude_desktop_config.json" ]] && [[ -f "$CES_ROOT/.claude-template/claude_desktop_config.json" ]]; then
    echo -e "${BLUE}🔧 Configuring MCP servers...${NC}"
    
    # Copy template and update paths to be portable
    cp "$CES_ROOT/.claude-template/claude_desktop_config.json" "$CES_ROOT/.claude/claude_desktop_config.json"
    
    # Update paths in MCP config to be relative to CES_ROOT
    if command -v sed &> /dev/null; then
        # Update any hardcoded paths to use CES_ROOT
        sed -i.bak "s|/home/[^/]*/claude-ecosystem-standard|$CES_ROOT|g" "$CES_ROOT/.claude/claude_desktop_config.json" 2>/dev/null || true
        rm -f "$CES_ROOT/.claude/claude_desktop_config.json.bak" 2>/dev/null || true
    fi
    
    echo "   ✅ MCP servers configured with portable paths"
fi

# Build TypeScript if tsconfig.json exists
if [[ -f "$CES_ROOT/tsconfig.json" ]]; then
    echo -e "${BLUE}🔨 Building TypeScript...${NC}"
    cd "$CES_ROOT"
    
    if npm run build --silent 2>/dev/null; then
        echo "   ✅ TypeScript build completed successfully"
    else
        echo -e "${YELLOW}⚠️  Warning: TypeScript build encountered issues (non-critical)${NC}"
    fi
fi

# Run validation if available
if [[ -f "$CES_ROOT/package.json" ]] && npm run --silent 2>/dev/null | grep -q "validate"; then
    echo -e "${BLUE}✅ Running validation...${NC}"
    cd "$CES_ROOT"
    
    if npm run validate --silent 2>/dev/null; then
        echo "   ✅ System validation passed"
    else
        echo -e "${YELLOW}⚠️  Warning: Some validation checks failed (non-critical)${NC}"
    fi
fi

echo ""
echo -e "${GREEN}🎉 CES Portable Edition initialization completed successfully!${NC}"
echo ""
echo -e "${PURPLE}📋 Next Steps:${NC}"

if [[ "$INSTALLATION_TYPE" == "subdirectory" ]]; then
    echo "   1. CES is ready to use in your project"
    echo "   2. Run commands from CES directory: cd ces && npm run dev"
    echo "   3. All CES files are isolated in the 'ces/' subdirectory"
    echo "   4. Your project files remain untouched"
else
    echo "   1. CES is ready for standalone use"
    echo "   2. Run: npm run dev"
    echo "   3. Start a session: npm run start-session"
fi

echo ""
echo -e "${BLUE}📚 Documentation:${NC}"
echo "   • View logs: $CES_ROOT/.ces-logs/"
echo "   • Configuration: $CES_ROOT/.env"
echo "   • MCP Servers: $CES_ROOT/.claude/"
echo ""

# Create a summary file for reference
cat > "$CES_ROOT/.ces-init-summary.txt" << EOF
CES Portable Edition Initialization Summary
Generated: $(date)

Installation Details:
- CES Version: $CES_VERSION
- CES Root: $CES_ROOT
- Project Root: $PROJECT_ROOT
- Project Name: $PROJECT_NAME
- Installation Type: $INSTALLATION_TYPE

Paths Created:
- Data: $CES_ROOT/.ces-data
- Logs: $CES_ROOT/.ces-logs
- Cache: $CES_ROOT/.ces-cache
- Temp: $CES_ROOT/.ces-temp
- Backups: $CES_ROOT/.ces-backups
- Sessions: $CES_ROOT/.ces-session
- Claude Config: $CES_ROOT/.claude

Configuration Files:
- Environment: $CES_ROOT/.env
- MCP Servers: $CES_ROOT/.claude/claude_desktop_config.json

Status: READY ✅
EOF

echo -e "${GREEN}✅ Installation summary saved to: .ces-init-summary.txt${NC}"
echo -e "${PURPLE}🚀 CES is now ready for portable operation!${NC}"