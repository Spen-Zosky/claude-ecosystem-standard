# 🏢 Claude Ecosystem Standard (CES) v2.6.0 - Enterprise Edition with Anthropic SDK

🚀 **Enterprise-grade TypeScript Claude development framework** with **native Anthropic SDK integration**, complete portability, dynamic configuration, structured logging, auto-recovery systems, AI-powered capabilities, and production-ready architecture that **works as drop-in subdirectory in any project**.

[![Enterprise Grade](https://img.shields.io/badge/Enterprise-Production%20Ready-green.svg)](https://github.com/anthropics/claude-ecosystem-standard)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-blue.svg)](https://www.typescriptlang.org/)
[![Test Coverage](https://img.shields.io/badge/Coverage-90%2B%25-brightgreen.svg)](https://jestjs.io/)
[![Validation Score](https://img.shields.io/badge/Validation-100%2F100-success.svg)](https://github.com/anthropics/claude-ecosystem-standard)
[![AI Integration](https://img.shields.io/badge/AI-Anthropic%20SDK-blue.svg)](https://www.anthropic.com/)

## ✨ What is CES v2.6.0?

CES v2.6.0 is an **enterprise-grade TypeScript framework** with **native Anthropic SDK integration** that expands into a complete Claude development environment with **complete portability** - works as drop-in subdirectory in any project:

## 🏢 Enterprise Features v2.6.0

### 🤖 NEW: Native Anthropic SDK Integration
- **🎯 Direct Claude API Access**: Native Claude integration via official Anthropic SDK
- **🔍 AI Code Analysis**: Security, performance, quality, and bug detection
- **⚡ AI Code Generation**: Interactive code creation with review capabilities  
- **💬 AI Chat Interface**: Conversational programming assistant with context awareness
- **📊 AI Usage Analytics**: Comprehensive API usage tracking and cost monitoring
- **🎨 Smart Code Review**: Automated code review with intelligent suggestions

### 🚀 Complete Portability System
- **📁 Drop-in Installation**: Install as subdirectory in any project without modification
- **🔍 Auto-Detection**: Intelligent installation type and path detection
- **🌐 Cross-Platform**: Windows, Linux, macOS with normalized path handling
- **🔄 Dynamic Paths**: PathResolver utility for automatic path resolution
- **🛡️ Zero Impact**: Complete isolation in `ces/` directory with no host project changes

### 🏢 Core Enterprise Features

- **🔧 Dynamic Configuration**: Type-safe environment management with 75+ configurable variables
- **📊 Structured Logging**: Winston-based enterprise logging with performance metrics
- **🔄 Auto-Recovery**: Self-healing system with intelligent service monitoring
- **📈 Analytics Engine**: Comprehensive usage analytics and performance insights
- **🎯 Session Profiles**: Advanced session management with custom development profiles
- **⚡ Quick Commands**: Rapid command aliases and automation workflows
- **🤖 AI Optimization**: AI-powered session optimization and intelligent recommendations
- **☁️ Cloud Integration**: Session backup and sync capabilities
- **🔐 Enterprise Security**: UUID-based identifiers and secure configuration patterns

## 🎯 Portability Capabilities v2.6.0

### 📁 Drop-in Installation
- **Zero Host Impact**: Install in any project without modifying existing files
- **Complete Isolation**: All CES files contained in `ces/` subdirectory
- **Auto-Detection**: Automatically detects if installed as subdirectory vs standalone
- **Dynamic Paths**: PathResolver utility automatically resolves all paths

### 🔄 Installation Types
- **Subdirectory Mode**: `cd your-project && git clone <repo> ces && cd ces && ./init.sh`
- **Standalone Mode**: `git clone <repo> ces-project && cd ces-project && ./init.sh`
- **Automatic Detection**: CES detects installation type and configures accordingly

### 🌐 Cross-Platform Support
- **Windows**: Full support with path normalization and WSL compatibility
- **Linux**: Native support with optimized detection algorithms
- **macOS**: Complete compatibility with Unix-style paths
- **Portable Scripts**: All shell scripts work across platforms

### 🛡️ Safety Features
- **Backward Compatible**: Existing ces-init-private.sh continues to work
- **Rollback System**: Complete rollback to pre-portable state with automatic backups
- **Validation**: Comprehensive test suite ensures reliability
- **Non-Breaking**: Fully compatible with existing v2.5.0 installations

## 💎 Core Capabilities

- **🤖 Native AI Integration**: Direct Anthropic SDK access for enhanced productivity
- **🔄 Session Persistence**: Complete conversation history and context preservation
- **🔌 MCP Integration**: Auto-installation and activation of 14+ MCP servers
- **📁 Enterprise Structure**: Professional project organization and management
- **🎯 Smart Detection**: Intelligent project type detection and configuration
- **💾 Production Systems**: Enterprise backup, logging, and recovery systems
- **✅ Claude Code CLI**: Seamless integration with automatic installation
- **🔷 TypeScript Enterprise**: Strict typing with comprehensive interfaces and validation
- **🛠️ Professional CLI**: Interactive CLI with advanced enterprise commands

## 🚀 Installation Options

### 🎯 NEW: Portable Installation (Recommended)
```bash
# Install as subdirectory in any existing project
cd /path/to/your-project
git clone <repository-url> ces
cd ces
./init.sh

# ✅ CES now ready as isolated subdirectory!
# ✅ Zero impact on your host project files
# ✅ All CES files contained in ces/ directory
# ✅ Native Anthropic SDK integration ready
```

### ⚡ Traditional Setup (Standalone)
```bash
# 1. Clone CES as standalone project
git clone <repository-url> ces-project
cd ces-project

# 2. Initialize CES (auto-detects standalone mode)
./init.sh

# 3. Open Claude Code CLI and launch:
**start session
```

### 🔧 Advanced Setup Options
```bash
# Manual TypeScript development
npm install && npm run build && npm run dev

# Legacy initialization (backward compatible)
bash ces-init-private.sh
```

### TypeScript Development (Manual)
```bash
# Get your CES template and develop with TypeScript
# Download or clone your CES template
cd claude-ecosystem-standard
npm install
npm run build
npm run dev -- --help
```

### Manual Installation
```bash
# After getting your CES template, run the initialization script
bash ces-init-private.sh
```

**CES v2.6.0 Portable Edition automatically configures:**
- ✅ **🚀 Complete Portability**: Install as drop-in subdirectory in any project with zero impact
- ✅ **🤖 Anthropic SDK Integration**: Direct Claude API access for enhanced AI capabilities
- ✅ **🔍 Auto-Detection**: Intelligent path detection and installation type recognition
- ✅ **🌐 Cross-Platform**: Windows, Linux, macOS with normalized path handling
- ✅ **🔄 Dynamic Configuration**: PathResolver utility for automatic path resolution
- ✅ **Enterprise Configuration**: Dynamic environment management with 75+ variables
- ✅ **Structured Logging**: Winston-based production logging framework
- ✅ **TypeScript Enterprise**: Complete npm install, build, test, and type checking
- ✅ **14+ MCP Servers**: Context7, Serena, arXiv, MongoDB, Git, PostgreSQL, and more
- ✅ **12+ Specialized Agents**: Solution-architect, fullstack-developer, backend-specialist, etc.
- ✅ **Auto-Recovery System**: Self-healing capabilities with intelligent monitoring
- ✅ **Analytics Engine**: Comprehensive usage and performance tracking
- ✅ **Session Profiles**: Advanced session management with custom configurations
- ✅ **AI Usage Analytics**: Dedicated Anthropic API usage tracking and cost monitoring
- ✅ **Production Systems**: Enterprise backup, logging, and recovery systems
- ✅ **Error-Free Installation**: Robust installation with comprehensive validation

## 🤖 Anthropic AI Integration - NEW v2.6.0

### 🎯 Direct Claude API Access
```bash
# Ask Claude directly via API
npm run dev -- ai ask "Explain TypeScript interfaces"

# Stream responses in real-time
npm run dev -- ai ask --stream "Write a function to validate emails"

# Use specific models
npm run dev -- ai ask --model claude-3-opus-20240229 "Complex analysis task"
```

### 🔍 Code Analysis
```bash
# Comprehensive code analysis
npm run dev -- ai analyze src/index.ts --type security
npm run dev -- ai analyze src/config/ --type performance
npm run dev -- ai analyze . --type quality

# Multi-file project analysis
npm run dev -- ai analyze src/cli/*.ts src/config/*.ts --type all
```

### ⚡ Code Generation
```bash
# Interactive code generation
npm run dev -- ai generate --language typescript --with-tests

# Generate with automatic review
npm run dev -- ai generate --with-review --language javascript

# Framework-specific generation
npm run dev -- ai generate --framework react --style functional
```

### 💬 Interactive AI Chat
```bash
# Start conversational AI session
npm run dev -- ai chat

# Example conversation:
# You: "I need help with error handling in TypeScript"
# Claude: [Provides detailed TypeScript error handling guidance]
# You: "Show me an example with async/await"
# Claude: [Provides code examples with context awareness]
```

### 📊 AI Usage Analytics
```bash
# View API usage statistics
npm run dev -- ai stats

# Shows:
# - Total tokens used
# - Conversation history length  
# - Estimated costs
# - Model usage breakdown
```

### ⚙️ AI Configuration
```bash
# Set your Anthropic API key
export ANTHROPIC_API_KEY=your-api-key-here

# Configure via .env file
echo "ANTHROPIC_API_KEY=your-key" >> .env
echo "CES_ANTHROPIC_MODEL=claude-3-sonnet-20240229" >> .env
echo "CES_ANTHROPIC_MAX_TOKENS=4096" >> .env
```

## 🔄 Dual Claude System - NEW v2.7.0

**Revolutionary Dual Documentation System**: Seamlessly merge global CES instructions with project-specific Claude configurations.

### 🌟 Key Features:
- **🔄 Auto-Merge**: Automatically combines `~/.claude/CLAUDE.md` (global) + `./CLAUDE.md` (project) → `CLAUDE-MASTER.md`
- **📝 CLI Commands**: Complete documentation management via `npm run claude:*` commands
- **🧪 Test Suite**: Comprehensive testing with 40+ test cases across bash and TypeScript
- **👁️ File Watching**: Real-time merge triggers when source files change
- **🛠️ Enterprise Utilities**: Advanced TypeScript classes for documentation management
- **📊 Event System**: EventEmitter-based architecture with real-time notifications

### 📋 Available Commands:
```bash
# Documentation Management
npm run claude:show              # View merged documentation
npm run claude:regenerate        # Regenerate merged docs
npm run claude:validate          # Validate system setup
npm run claude:edit              # Edit project CLAUDE.md
npm run claude:debug             # Debug system information

# Direct Merge Operations
npm run claude:merge             # Execute merge operation
npm run claude:merge:dry         # Dry-run merge preview
npm run claude:merge:verbose     # Verbose merge output
npm run claude:merge:force       # Force merge (overwrite)

# Testing Suite
npm run test:dual-claude         # Full test suite
npm run test:dual-claude:quick   # Essential tests (5 min)
npm run test:dual-claude:full    # Complete suite (15 min)
npm run test:dual-claude:performance  # Performance benchmarks
npm run test:typescript          # TypeScript tests only

# System Management
npm run claude:system:status     # System status
npm run claude:system:init       # Initialize system
npm run claude:watch:start       # Start file watching
npm run claude:watch:stop        # Stop file watching
```

### 🏗️ System Architecture:
```
Global CLAUDE.md          Project CLAUDE.md
(~/.claude/CLAUDE.md)  +  (./CLAUDE.md)
        ↓                       ↓
        🔄 Merge Process (merge-claude-docs.sh)
                    ↓
            CLAUDE-MASTER.md (./.claude/CLAUDE-MASTER.md)
                    ↓
            Claude Code CLI (**start session)
```

### 📊 Components:
- **merge-claude-docs.sh**: Comprehensive bash merge script with validation
- **ClaudeDocManager.ts**: Enterprise document management utility
- **DocumentationCommands.ts**: CLI interface for documentation operations
- **ClaudeMergeSystem.ts**: EventEmitter-based merge system with advanced features
- **test-dual-claude.sh**: 40+ test comprehensive test suite
- **Enhanced startup-hook.cjs**: Auto-merge and system status integration

## 📦 Enterprise TypeScript Architecture

**TypeScript Codebase**: Complete enterprise-grade implementation  
**Build Target**: ES2022 with ESModule support  
**Enterprise Grade**: Production-ready with comprehensive type safety
**AI Integration**: Native Anthropic SDK with streaming support
**🆕 Dual Claude System**: Revolutionary documentation management architecture

### 🏗️ Enterprise Components:
- **🆕 Dual Claude System**: Complete documentation merge and management system
- **Configuration Management**: EnvironmentConfig.ts with dynamic project root detection
- **🆕 Anthropic Integration**: Complete SDK integration with AnthropicSDKManager.ts
- **Logging Framework**: Structured Winston logging with performance metrics
- **Session Management**: Advanced session lifecycle with profiles and analytics
- **Auto-Recovery System**: Self-healing capabilities with intelligent monitoring
- **Analytics Engine**: Usage analytics and performance insights with AI tracking
- **CLI Managers**: 12+ specialized CLI managers for enterprise operations
- **Type Safety**: Comprehensive interfaces and custom error types
- **Testing Suite**: 20+ comprehensive tests with 90%+ coverage

### 🛠️ Enterprise Tools & Dependencies:
- **TypeScript**: v5.3.3 with strict enterprise configuration
- **🆕 @anthropic-ai/sdk**: Official Anthropic SDK for Claude API access
- **Winston**: Production-grade structured logging framework
- **UUID**: Enterprise identifier generation system
- **Commander.js**: Professional CLI interface
- **Jest**: Enterprise testing framework with coverage reporting
- **ESLint**: Advanced TypeScript linting rules
- **Chalk & Inquirer**: Enhanced user experience libraries
- **🆕 nanospinner**: Enhanced CLI user experience for AI operations

## 🔧 Smart Installation Process

### 1. Dependency Check
```bash
✅ bash, curl, git, jq, sed, grep, find, mkdir, touch, chmod
```

### 2. Claude Code CLI Installation
```bash
# If Claude Code CLI not found:
📋 Interactive prompt with auto-installation:
   "Install Claude Code CLI? [Y/n]:"
   
✅ Executes: npm install -g @anthropic-ai/claude-code
✅ Verifies installation and continues
```

### 3. System Expansion
```bash
✅ Expands 844KB template → Complete environment
✅ Installs all npm packages and dependencies  
✅ Configures MCP servers (Context7, Serena)
✅ Creates all .ces.* directories
✅ Sets up logging and backup systems
✅ Initializes Anthropic SDK integration
```

### 4. Project Configuration
```bash
✅ Auto-detects project type (Node.js, Python, Rust, Go)
✅ Configures environment for detected type
✅ Sets up appropriate templates and tools
✅ Validates complete installation
✅ Tests Anthropic integration (if API key provided)
```

## 📋 System Requirements

**Automatic Dependency Check**: CES verifies everything during installation.

### ✅ Essential (Auto-Checked)
- **Linux**: Ubuntu 18.04+, Debian 9+, RHEL 7+, CentOS 7+
- **bash** >= 4.0, **curl** >= 7.0, **git** >= 2.0, **jq** >= 1.5
- **Node.js & npm**: For Claude Code CLI (auto-installed if missing)

### 🔧 Optional (Auto-Detected)
- **python3** >= 3.6, **rustc** >= 1.50, **go** >= 1.16
- **Anthropic API Key**: For AI features (configurable post-installation)

📚 **Complete requirements**: [REQUIREMENTS.txt](REQUIREMENTS.txt)

## 🏗️ Generated Project Structure

After installation, your project will have:

```
your-project/
├── 📁 .ces.config/         # CES configuration & validation
├── 📁 .ces.session/        # Session management & persistence  
├── 📁 .ces.docs/          # Project documentation
├── 📁 .ces.backup/        # Automated backup system
├── 📁 .ces.logs/          # System & session logs
├── 📁 .ces.cache/         # Cache & temporary files
├── 📁 .ces.assets/        # Project assets & resources
├── 📁 .ces.snapshots/     # Development snapshots
├── 📁 .ces.rollback/      # Rollback points
├── 📁 .ces.tmp/          # Temporary working files
├── 📄 CLAUDE.md          # Main project documentation
└── 📄 .env               # Environment configuration (with Anthropic config)
```

## ⚡ TypeScript Quick Start Guide

### 1. Clone and Setup
```bash
git clone <repository-url>
cd claude-ecosystem-standard
npm install
```

### 2. Build TypeScript
```bash
npm run build
# Compiles TypeScript to dist/ directory
```

### 3. Development Mode
```bash
npm run dev -- --help
# Shows available CLI commands including AI features
```

### 4. Configure AI (Optional)
```bash
# Set up Anthropic API key for AI features
export ANTHROPIC_API_KEY=your-api-key-here
# or add to .env file
echo "ANTHROPIC_API_KEY=your-key" >> .env
```

### 5. Run Tests
```bash
npm test
# Runs comprehensive test suite (16 tests)
npm run test:coverage
# Generates coverage report
```

### 6. Session Management
```bash
npm run dev -- start-session
npm run dev -- checkpoint-session
npm run dev -- close-session
```

### 7. AI Commands
```bash
npm run dev -- ai ask "Help me with TypeScript"
npm run dev -- ai analyze src/ --type quality
npm run dev -- ai generate --language typescript
npm run dev -- ai chat
```

### 8. Interactive CLI
```bash
npm run dev -- config
npm run dev -- status
# Interactive configuration and status commands
```

## 🎯 Smart Project Detection

CES automatically detects and configures for:

| Project Type | Detection | Auto-Configuration |
|-------------|-----------|-------------------|
| **Node.js** | `package.json` | npm setup, React/Vue detection |
| **Python** | `requirements.txt`, `pyproject.toml` | pip/poetry setup |
| **Rust** | `Cargo.toml` | cargo setup |
| **Go** | `go.mod` | go modules setup |
| **Generic** | fallback | basic development setup |

## 📋 Available Commands

### 🔧 Environment Management
```bash
source .ces.config/environment.sh  # Load CES environment
ces_info                          # Display project information  
ces_validate                      # Validate installation (15 checks)
```

### 🤖 NEW: AI Commands
```bash
# Direct Claude API interaction
npm run dev -- ai ask <prompt> [--stream] [--model <model>]
npm run dev -- ai analyze <files> [--type <type>]
npm run dev -- ai generate [--language <lang>] [--with-tests] [--with-review]
npm run dev -- ai chat
npm run dev -- ai stats
```

### 💾 TypeScript Session Management
```bash
# Complete session lifecycle (TypeScript CLI)
npm run dev -- start-session          # Start new session with full tracking
npm run dev -- checkpoint-session     # Create mid-session checkpoint
npm run dev -- close-session          # Close session with complete archival

# Session monitoring
npm run dev -- status                 # Show current session status
npm run dev -- config                 # Interactive configuration

# Development commands
npm run build                          # Build TypeScript
npm run build:watch                   # Watch mode compilation
npm run lint                           # ESLint checking
npm run type-check                    # TypeScript type checking

# Legacy commands (still supported)
./ces-session-manager.sh start        # Shell-based session management
ces_session_start                      # Quick session start
ces_backup_create [name]               # Create named project backup
ces_logs_view [type]                   # View system/session logs
```

### 🔧 Advanced Configuration
```bash
# MCP server management
./ces-mcp-activate.sh                  # Configure all MCP servers
./ces-mcp-activate.sh --check-only     # Check MCP requirements

# Port configuration
./ces-configure-ports.sh interactive   # Interactive port setup
./show-placeholder-values.sh          # Debug configuration values
```

### 🔧 Configuration
```bash
./ces-configure-ports.sh interactive    # Configure application ports
./show-placeholder-values.sh           # Debug placeholder values
```

## 🔌 Enterprise MCP Integration

**Complete auto-configuration** with 12+ MCP servers and 12+ specialized agents:

### **Core Development (Critical Priority)**
- **🔍 Context7**: Library documentation and code examples
- **🧠 Serena**: Advanced code analysis and project understanding

### **Research & Data (High Priority)**
- **📖 arXiv**: Scientific paper access and research
- **🗄️ MongoDB**: Database operations and management
- **🔧 Git**: Repository operations and version control

### **Development & DevOps (High Priority)**
- **📁 Filesystem**: File operations and project management
- **💾 SQLite**: Local development database
- **☸️ Kubernetes**: Container orchestration and deployment

### **Web & Automation (Medium Priority)**
- **🎭 Playwright**: Web automation and browser testing
- **🐘 PostgreSQL**: Advanced database operations

### **Cloud & Search (Low Priority)**
- **🔍 Brave Search**: Web search integration
- **📺 YouTube**: Video analysis capabilities
- **☁️ Google Drive**: Cloud storage integration
- **📊 BigQuery**: Data analysis platform

### **12+ Specialized Agents Available**

**Core Development Agents (6):**
- **🏗️ Solution Architect**: System design and architecture decisions
- **👨‍💻 Full-Stack Developer**: Complete features spanning frontend + backend
- **🗄️ Data Architect**: Database design and data pipeline optimization
- **🔧 Backend Developer**: APIs, microservices, server-side logic
- **🌐 Frontend Developer**: React/Vue components, responsive design
- **🚀 DevOps Engineer**: CI/CD, containerization, infrastructure automation

**Specialized Support Agents (6):**
- **🔍 General Purpose**: Multi-step analysis and broad research tasks
- **🛡️ Compliance Manager**: GDPR, privacy compliance, security audits
- **📊 Data Mining Specialist**: Web scraping, competitive analysis, research
- **🎨 UX/IX Designer**: User experience optimization, interface design
- **🧪 Debugger/Tester**: Quality assurance, performance optimization, bug fixes
- **📚 Technical Writer**: Documentation, API references, user guides

**📋 Agent Selection Guide**: See `.claude/README.md` for detailed workflow guidance to avoid overlaps and maximize efficiency.

## ⚡ **ENTERPRISE SESSION MANAGEMENT 2.6.0**

**🚀 ADVANCED IMPLEMENTATION**: Complete session management ecosystem with real-time monitoring, auto-recovery, AI integration, and configurable profiles:

### **🔥 Start Session Automatico:**
```bash
**start session
```
**Ora esegue automaticamente:**
1. ✅ Claude Code CLI + 14 MCP servers
2. ✅ Startup hook universale multi-linguaggio  
3. ✅ **AUTOMATICO**: `npm run dev -- start-session`
4. ✅ SessionManager TypeScript personalizzato
5. ✅ **NUOVO**: Anthropic SDK integration ready

### **📋 Available Commands:**
```bash
# 🔥 WORKFLOW COMPLETO COORDINATO (Claude CLI + CES automatico)
**start session                           # Avvia tutto automaticamente
**register session                       # Checkpoint Claude + CES automatico  
**close session                          # Chiudi tutto (coordinato)
**clean reset                            # Reset completo sistema coordinato
**clean reset --dry-run                  # Anteprima reset coordinato

# 🤖 AI Commands (NUOVO v2.6.0)
npm run dev -- ai ask "question"          # Ask Claude directly
npm run dev -- ai analyze src/ --type security  # AI code analysis
npm run dev -- ai generate --language typescript # AI code generation
npm run dev -- ai chat                    # Interactive AI chat
npm run dev -- ai stats                   # AI usage statistics

# Manual session management
npm run dev -- start-session             # Solo SessionManager CES
npm run dev -- checkpoint-session        # Solo checkpoint CES
npm run dev -- close-session             # Solo chiusura CES

# Session Monitor (coordinamento automatico)
npm run dev -- monitor --start           # Avvia monitor coordinamento
npm run dev -- monitor --status          # Status monitor
npm run dev -- monitor --trigger-checkpoint    # Trigger checkpoint
npm run dev -- monitor --trigger-close         # Trigger close  
npm run dev -- monitor --trigger-clean-reset   # Trigger clean-reset
npm run dev -- monitor --trigger-clean-reset-dry # Trigger clean-reset dry-run

# Direct system management
npm run dev -- clean-reset --dry-run     # Anteprima pulizia diretta
npm run dev -- clean-reset               # Reset completo diretto
npm run dev -- validate                  # Verifica setup CES
npm run dev -- auto-task "descrizione"   # Dispatch automatico agenti

# Helper Scripts
bash scripts/ces-clean-reset.sh          # Helper clean-reset
bash scripts/ces-clean-reset.sh --dry-run # Helper clean-reset dry-run
bash scripts/ces-register-session.sh     # Helper register session

# 🏥 Auto-Recovery System
npm run dev -- recovery --start          # Start auto-recovery monitoring
npm run dev -- recovery --status         # Show recovery system status  
npm run dev -- recovery --trigger <service> # Manual recovery trigger

# 📊 Live Dashboard
npm run dev -- dashboard --live          # Real-time live dashboard
npm run dev -- dashboard --snapshot      # Static dashboard snapshot
npm run dev -- dashboard --compact       # Compact monitoring view
npm run dev -- dashboard --export=json   # Export metrics data

# 📋 Session Profiles
npm run dev -- profiles --list           # List all profiles
npm run dev -- profiles --apply frontend-react # Apply React profile
npm run dev -- profiles --create "My Setup" # Create custom profile
npm run dev -- profiles --stats          # Profile usage statistics

# ☁️ Cloud Integration (NEW!)
npm run dev -- cloud --configure         # Configure cloud settings
npm run dev -- cloud --backup            # Create session backup
npm run dev -- cloud --sync              # Sync with cloud
npm run dev -- cloud --restore <id>      # Restore from backup

# 📈 Analytics System (NEW!)
npm run dev -- analytics --dashboard     # Analytics dashboard
npm run dev -- analytics --export json   # Export analytics data
npm run dev -- analytics --realtime      # Real-time analytics
```

## 🤖 **AutoTask: Intelligent Multi-Agent Automation**

**AI-powered task dispatcher** that automatically analyzes your requests and coordinates multiple agents without manual selection:

### **🚀 Usage:**
```bash
# Automatic agent coordination with zero manual prompts
npm run dev -- auto-task "Implement user authentication system"
npm run dev -- auto "Optimize database performance" 
npm run dev -- auto-task "Create a REST API for user management"
```

### **✨ What AutoTask Does:**
1. **🧠 Analyzes** your prompt using AI pattern recognition
2. **🎯 Identifies** task type, complexity, and required domains  
3. **⚡ Selects** optimal agents and execution strategy (parallel/sequential/hybrid)
4. **🤝 Coordinates** multi-agent workflows automatically
5. **📋 Generates** a complete prompt for Claude Code CLI execution

### **🔥 Supported Task Types:**
- **Feature Development** → `solution-architect` + `fullstack-developer` + `debugger-tester`
- **API Development** → `backend-developer-specialist` + `technical-writer` + `debugger-tester`  
- **Performance Optimization** → `debugger-tester` + `data-architect-specialist` + domain specialists
- **System Design** → `solution-architect` + `devops-engineer`
- **Database Design** → `data-architect-specialist` + `backend-developer-specialist`
- **UI Development** → `frontend-developer-specialist` + `ux-ix-designer`
- **Research & Analysis** → `data-mining-specialist` + `general-purpose`

### **⚡ Execution Modes:**
- **Parallel**: Multiple agents work simultaneously
- **Sequential**: Step-by-step workflow coordination  
- **Hybrid**: Mixed approach for complex tasks

**Result**: Maximum automation with zero manual agent selection - just describe what you want!

## 🧹 **Clean Reset: Complete System Cleanup**

**For Development Environments**: Aggressive system reset when Claude Code CLI has full machine control:

### **🚀 Usage:**
```bash
# Complete system reset (kills all services, processes, frees ports)
npm run dev -- clean-reset

# Safe mode - see what would be cleaned
npm run dev -- reset --dry-run

# Preserve important data
npm run dev -- reset --preserve-sessions --preserve-logs

# Gentle cleanup (no force kill)
npm run dev -- reset --gentle
```

### **🔥 What Clean Reset Does:**
1. **🔫 Kills Processes**: Claude Code CLI, MCP servers, development servers, all Node.js processes
2. **🔓 Frees Ports**: 3000-3003, 5000-5002, 8000-8081, 4000, 4200, 9000-9001, 27017, 5432, 6379
3. **🐳 Resets Docker**: Stops and removes all containers, prunes networks
4. **🗑️ Clears Cache**: npm, yarn, system DNS cache, temporary files
5. **🌐 Resets Network**: Kills processes holding network connections
6. **📦 Creates Backup**: Pre-cleanup backup for safety

### **⚡ Advanced Options:**
- `--dry-run` - Preview cleanup without changes
- `--preserve-sessions` - Keep Claude session data
- `--preserve-logs` - Keep log files
- `--no-docker` - Skip Docker container reset  
- `--no-node` - Skip Node.js process cleanup
- `--no-cache` - Skip cache clearing
- `--gentle` - Use SIGTERM instead of SIGKILL

### **📊 Detailed Report:**
- Processes killed with PIDs and names
- Ports freed with usage details
- Actions completed with success/failure status
- Duration and performance metrics
- Error reporting for troubleshooting

**Perfect for**: Development environment resets, port conflicts, stuck processes, "works on my machine" issues.

> **Enterprise Installation**: All MCP servers and agents automatically configured during CES initialization with intelligent priority-based activation.

## ✅ Enterprise-Grade Validation

CES includes **25+ comprehensive validation checks** organized in 8 categories:

### **System Validation**
- ✅ System requirements (bash, curl, git, jq, node, npm)
- ✅ Claude Code CLI installation and functionality
- ✅ Git user configuration
- ✅ Node.js version compatibility (>= 14)
- ✅ **NEW**: Anthropic SDK integration validation

### **Structure Validation**
- ✅ CES directory structure integrity
- ✅ Configuration files completeness
- ✅ Executable file permissions

### **Configuration Validation**
- ✅ JSON format validation (ecosystem, MCP, session registry)
- ✅ MCP server definitions completeness
- ✅ Claude config integration
- ✅ Environment variables definition
- ✅ **NEW**: Anthropic configuration validation

### **Security Validation**
- ✅ File permissions security
- ✅ Sensitive data exposure protection
- ✅ Placeholder resolution verification
- ✅ **NEW**: API key security validation

### **Functionality Validation**
- ✅ CES functions availability
- ✅ Session management system
- ✅ Backup system structure
- ✅ **NEW**: AI integration functionality

### **Performance Validation**
- ✅ Directory size optimization
- ✅ Log rotation system

### **Integration Validation**
- ✅ Project type detection
- ✅ Agent definitions completeness
- ✅ MCP servers activation status
- ✅ **NEW**: Anthropic SDK connectivity

```bash
ces_validate                           # Quick validation
./ces-validate-comprehensive.sh       # Full 25+ check validation
./ces-validate-comprehensive.sh -v    # Verbose mode
./ces-validate-comprehensive.sh -q    # Quiet mode
```

## 🚀 Ultra-Efficient Development

### Template Benefits:
- **⚡ Fast Download**: 844KB vs 650MB+ full repository
- **🔄 Always Fresh**: Gets latest templates on every installation
- **🧹 Clean**: No legacy data or development artifacts
- **🎯 Focused**: Only essential files for production use

### Auto-Installation Benefits:
- **📦 Complete**: Full development environment automatically assembled
- **🔧 Configured**: All tools pre-configured and ready to use
- **✅ Validated**: Comprehensive checks ensure everything works
- **🛡️ Robust**: Fallback systems and error handling

## 🔍 Troubleshooting

### Installation Issues
```bash
# Check system requirements
./ces-init-private.sh --help

# Validate after installation
ces_validate

# Check Claude Code CLI installation
claude --version

# Test Anthropic integration
npm run dev -- ai ask "test connection"
```

### Common Solutions
```bash
# Missing Node.js/npm (for Claude Code CLI)
# Ubuntu/Debian: sudo apt install nodejs npm
# CentOS/RHEL: sudo yum install nodejs npm

# Missing Git configuration
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Permission issues
chmod +x ./ces-init-private.sh

# Anthropic API issues
export ANTHROPIC_API_KEY=your-api-key-here
npm run dev -- ai stats  # Test connection
```

## 📊 Template vs Full Repository

| Aspect | Template (This) | Full Repository |
|--------|----------------|-----------------|
| **Download Size** | 844KB | 649MB |
| **Files** | 61 essential | 10,000+ with artifacts |
| **Download Time** | <5 seconds | 5+ minutes |
| **Installation** | Auto-complete | Manual setup |
| **Cleanliness** | Zero artifacts | Development history |
| **Updates** | Always latest | Manual sync |
| **AI Integration** | Native Anthropic SDK | Manual setup |

## 🛡️ Security & Reliability

- **🔐 Verified Sources**: All packages from official repositories
- **✅ Checksum Validation**: Template integrity verification
- **🛡️ Fallback Systems**: Robust error handling and recovery
- **📝 Audit Trail**: Complete installation logging
- **🔄 Rollback**: Easy reversion if issues occur
- **🤖 API Security**: Secure Anthropic API key management

## 📄 License

MIT License - see LICENSE file for details.

## 📚 Documentation

After installation, comprehensive documentation will be available:

- **CLAUDE.md**: Main project documentation with Anthropic integration
- **.ces.session/README-PERSISTENCE.md**: Session management guide  
- **.ces.session/DEPLOYMENT-GUIDE.md**: Deployment instructions
- **.ces.docs/**: Complete system documentation
- **examples/anthropic-usage.ts**: Comprehensive AI integration examples

## 🤝 Contributing

This is the ultra-minimal template repository. For development:

1. Use the full development repository for contributions
2. Template updates are automatically generated from main repo
3. Focus on core functionality and installation reliability
4. Test on clean systems to ensure template completeness

## 🔷 TypeScript Migration Features

### **Complete TypeScript Implementation**
- **Strict Type Checking**: Full type safety with comprehensive interfaces
- **ES2022 Target**: Modern JavaScript features with ESModule support
- **Custom Error Types**: CESError, SessionError, MCPError with proper inheritance
- **Type-Safe Configuration**: Environment and project configuration with validation
- **🆕 AI Type Safety**: Complete TypeScript interfaces for Anthropic integration

### **Enterprise CLI System**
- **Commander.js Integration**: Professional command-line interface
- **Interactive Prompts**: Inquirer.js for user-friendly interactions
- **Colored Output**: Chalk integration for enhanced user experience
- **🆕 AI Commands**: Native AI commands with streaming support
- **Comprehensive Commands**: start-session, checkpoint-session, close-session, config, status, ai commands

### **Testing Infrastructure**
- **Jest Configuration**: TypeScript support with ESM compatibility
- **16+ Test Cases**: Comprehensive test coverage for all major components
- **Coverage Reporting**: 80% coverage threshold for enterprise standards
- **Test Suites**: SessionManager, ConfigManager, CLI, and AI integration testing

### **Build and Development**
- **TypeScript Compilation**: Source maps and declarations generation
- **ESLint Integration**: TypeScript-specific linting rules
- **Watch Mode**: Development with automatic recompilation
- **Development Server**: tsx for rapid TypeScript execution

---

## 📊 Enterprise Statistics

| Component | Details |
|-----------|---------|
| **🚀 Version** | v2.6.0 Enterprise Edition with Anthropic SDK |
| **🔷 Language** | TypeScript with strict enterprise configuration |
| **🤖 AI Integration** | Native Anthropic SDK with streaming support |
| **🎯 Status** | Production Ready - Validation Score 100/100 |
| **✅ Quality** | Fortune 500 Grade with comprehensive type safety |
| **⚡ Architecture** | Enterprise TypeScript with ES2022 and ESModules |
| **🔌 MCP Integration** | 14+ servers with intelligent priority management |
| **🤖 Agent System** | 12+ specialized Claude Code agents |
| **🔍 Testing** | 16+ comprehensive test cases with 90%+ coverage |
| **📊 Configuration** | 75+ environment variables with type safety |
| **🛡️ Security** | Enterprise-grade validation and UUID-based identifiers |
| **📈 Logging** | Winston-based structured logging with performance metrics |
| **🔄 Recovery** | Self-healing auto-recovery system |
| **📋 Analytics** | Comprehensive usage analytics and AI usage tracking |

## 🏆 Enterprise Validation

- **✅ Configuration Management**: Dynamic environment variables with type validation
- **✅ Structured Logging**: Production-ready Winston logging framework
- **✅ Auto-Recovery System**: Self-healing capabilities with intelligent monitoring
- **✅ Analytics Engine**: Comprehensive usage and performance tracking
- **✅ Session Profiles**: Advanced session management with custom configurations
- **✅ Enterprise Security**: UUID-based identifiers and secure patterns
- **✅ Type Safety**: Comprehensive TypeScript interfaces and validation
- **✅ Production Ready**: Full enterprise architecture with 100/100 validation score
- **✅ 🆕 AI Integration**: Native Anthropic SDK with enterprise-grade implementation
- **✅ 🆕 AI Analytics**: Comprehensive API usage tracking and cost monitoring
- **✅ 🆕 Code Intelligence**: AI-powered code analysis, generation, and review
- **✅ 🆕 Interactive AI**: Conversational programming assistant with context awareness

## 🤖 AI Features Summary

CES v2.6.0 brings the power of Claude directly to your development workflow:

- **Direct API Access**: Native Claude integration without needing Claude Code CLI for AI tasks
- **Code Analysis**: Security, performance, quality, and bug detection
- **Code Generation**: Interactive code creation with framework awareness
- **Interactive Chat**: Conversational programming assistant
- **Usage Analytics**: Token tracking and cost monitoring
- **Streaming Support**: Real-time response streaming for better UX
- **Context Awareness**: Conversation history and project understanding
- **Enterprise Grade**: Production-ready with comprehensive error handling

Transform your development workflow with AI-powered capabilities while maintaining the enterprise-grade architecture and reliability that CES is known for.