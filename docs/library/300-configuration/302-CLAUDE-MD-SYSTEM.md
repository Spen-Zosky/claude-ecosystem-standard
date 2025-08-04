## CLAUDE.md

# 🏢 Claude Ecosystem Standard (CES) v2.7.0 - Enterprise Edition with Anthropic SDK

This is an **enterprise-grade TypeScript foundation project** with integrated Claude Code CLI automation and **direct Anthropic SDK integration**, featuring dynamic configuration, structured logging, AI-powered capabilities, and production-ready architecture.

**🚀 UNIFIED CLAUDE ECOSYSTEM v2.7.0** - Complete enterprise Claude Code CLI integration with advanced session management, analytics, auto-recovery systems, and **native Anthropic API access**.

## ⚡ UNIFIED ACTIVE WORKFLOW

### **Automatic Session Start:**
```bash
**start session
```
**Now automatically executes:**
1. ✅ Claude Code CLI Session + 14 MCP servers
2. ✅ Universal multi-language startup hook  
3. ✅ **AUTOMATIC**: `npm run dev -- start-session`
4. ✅ Custom TypeScript SessionManager
5. ✅ **NEW**: Anthropic SDK integration ready

### **Coordinated Session Registration:**
```bash
**register session                        # Claude CLI + automatically CES checkpoint
# OR manually:
npm run dev -- monitor --trigger-checkpoint
```

### **Coordinated Session Close:**
```bash
# 1. First close the CES SessionManager
npm run dev -- close-session
# OR via monitor:
npm run dev -- monitor --trigger-close

# 2. Then close Claude Code CLI
**close session
```

### **Coordinated Clean Reset:**
```bash
**clean reset                            # Complete coordinated reset
**clean reset --dry-run                  # Preview coordinated reset
# OR manually:
npm run dev -- monitor --trigger-clean-reset
npm run dev -- monitor --trigger-clean-reset-dry
```

### **Setup Validation:**
```bash
# Complete CES installation verification
npm run dev -- validate

# Verbose validation with details
npm run dev -- validate --verbose
```

## 🤖 ANTHROPIC AI INTEGRATION - NEW v2.7.0

### **🎯 Direct Claude API Access**
```bash
# Ask Claude directly via API
npm run dev -- ai ask "Explain TypeScript interfaces"

# Stream responses in real-time
npm run dev -- ai ask --stream "Write a function to validate emails"

# Use specific models
npm run dev -- ai ask --model claude-3-opus-20240229 "Complex analysis task"
```

### **🔍 Code Analysis**
```bash
# Comprehensive code analysis
npm run dev -- ai analyze src/index.ts --type security
npm run dev -- ai analyze src/config/ --type performance
npm run dev -- ai analyze . --type quality

# Multi-file project analysis
npm run dev -- ai analyze src/cli/*.ts src/config/*.ts --type all
```

### **⚡ Code Generation**
```bash
# Interactive code generation
npm run dev -- ai generate --language typescript --with-tests

# Generate with automatic review
npm run dev -- ai generate --with-review --language javascript

# Framework-specific generation
npm run dev -- ai generate --framework react --style functional
```

### **💬 Interactive AI Chat**
```bash
# Start conversational AI session
npm run dev -- ai chat

# Example conversation:
# You: "I need help with error handling in TypeScript"
# Claude: [Provides detailed TypeScript error handling guidance]
# You: "Show me an example with async/await"
# Claude: [Provides code examples with context awareness]
```

### **📊 AI Usage Analytics**
```bash
# View API usage statistics
npm run dev -- ai stats

# Shows:
# - Total tokens used
# - Conversation history length  
# - Estimated costs
# - Model usage breakdown
```

### **⚙️ AI Configuration**
```bash
# Set your Anthropic API key
export ANTHROPIC_API_KEY=your-api-key-here

# Configure via .env file
echo "ANTHROPIC_API_KEY=your-key" >> .env
echo "CES_ANTHROPIC_MODEL=claude-3-sonnet-20240229" >> .env
echo "CES_ANTHROPIC_MAX_TOKENS=4096" >> .env
```

## 🎯 ENTERPRISE FEATURES v2.7.0

### **🔧 Configuration Management**
```bash
# Dynamic configuration with 75+ environment variables
npm run dev -- config --show              # View current configuration
npm run dev -- config --reset             # Reset to defaults
npm run dev -- validate                   # Validate complete setup
```

### **📊 Analytics & Monitoring**
```bash
# Comprehensive usage analytics
npm run dev -- analytics --dashboard      # Real-time analytics dashboard
npm run dev -- analytics --export         # Export analytics data
npm run dev -- analytics --realtime       # Live monitoring
npm run dev -- analytics --report week    # Weekly usage reports
```

### **🔄 Auto-Recovery System**
```bash
# Self-healing system management
npm run dev -- recovery --status          # Recovery system status
npm run dev -- recovery --start           # Start auto-recovery
npm run dev -- recovery --trigger <service> # Manual service recovery
npm run dev -- recovery --export json     # Export recovery data
```

### **📋 Session Profiles**
```bash
# Advanced session management
npm run dev -- profiles --list            # Available session profiles
npm run dev -- profiles --create <name>   # Create custom profile
npm run dev -- profiles --apply <name>    # Apply session profile
npm run dev -- profiles --stats           # Profile usage statistics
```

### **⚡ Quick Commands**
```bash
# Rapid development aliases
npm run dev -- quick --list               # Available quick commands
npm run dev -- quick --create <alias> --command <cmd>  # Create quick alias
npm run dev -- quick <alias>              # Execute quick command
npm run dev -- quick --cheat              # Quick commands cheat sheet
```

### **🤖 AI Session Optimization**
```bash
# AI-powered session management
npm run dev -- ai-session --start         # Start AI optimization
npm run dev -- ai-session --recommendations # Get AI recommendations
npm run dev -- ai-session --insights      # Session insights
npm run dev -- ai-session --optimize      # Optimize current session
```

### **☁️ Cloud Integration**
```bash
# Session backup and sync
npm run dev -- cloud --configure          # Configure cloud integration
npm run dev -- cloud --backup             # Create session backup
npm run dev -- cloud --sync               # Sync with cloud
npm run dev -- cloud --restore <id>       # Restore from backup
```

### **📈 Live Dashboard**
```bash
# Real-time system monitoring
npm run dev -- dashboard --live           # Live dashboard with real-time updates
npm run dev -- dashboard --snapshot       # Static dashboard snapshot
npm run dev -- dashboard --compact        # Compact view mode
npm run dev -- dashboard --graphs         # Enable performance graphs
```

# 1. PROJECT FOUNDATION

This is an **enterprise-grade TypeScript foundation** designed for production environments with **native Anthropic API integration**.

## Core Principles
- **Enterprise Architecture**: Type-safe, scalable, maintainable
- **AI-First Development**: Integrated Anthropic SDK for enhanced productivity
- **Dynamic Configuration**: Environment-based configuration management (75+ variables)
- **Structured Logging**: Winston-based enterprise logging framework
- **Auto-Recovery**: Self-healing system capabilities
- **Analytics**: Comprehensive usage and performance tracking
- **Security**: Enterprise-grade security patterns
- **Cloud-Ready**: Built-in cloud integration and backup capabilities

# 2. GETTING STARTED

## Installation
```bash
npm install
npm run build
npm test
```

## Quick Setup
```bash
# 1. Copy environment template
cp .env.template .env

# 2. Configure Anthropic API (optional but recommended)
echo "ANTHROPIC_API_KEY=your-api-key-here" >> .env

# 3. Build and validate
npm run build
npm run dev -- validate

# 4. Start your first session
npm run dev -- start-session
```

## Development
```bash
npm run dev          # Development mode
npm run build:watch  # Watch mode compilation
npm run lint         # Code linting
npm run type-check   # TypeScript checking
```

## Project Structure
```
src/
├── cli/                         # CLI managers and components
│   ├── AISessionManager.ts     # AI-powered session optimization
│   ├── AnalyticsManager.ts     # Usage analytics and insights
│   ├── AnthropicCLI.ts         # 🆕 Anthropic AI commands
│   ├── AutoRecoveryManager.ts  # Self-healing system
│   ├── CLIManager.ts           # Main CLI interface
│   ├── CloudIntegrationManager.ts # Cloud backup and sync
│   ├── DashboardManager.ts     # Real-time monitoring
│   ├── QuickCommandManager.ts  # Rapid command aliases
│   ├── SessionProfileManager.ts # Session profiles
│   └── SystemCleanupManager.ts # System reset and cleanup
├── config/                      # Configuration management
│   ├── ConfigManager.ts        # Core configuration
│   └── EnvironmentConfig.ts    # Enterprise environment config
├── integrations/                # 🆕 External service integrations
│   └── anthropic/              # 🆕 Anthropic SDK integration
│       ├── types/              # TypeScript type definitions
│       ├── AnthropicSDKManager.ts        # Core SDK manager
│       └── AnthropicIntegrationHelper.ts # Smart execution helper
├── session/                     # Session management
│   └── SessionManager.ts       # Session lifecycle
├── utils/                       # Enterprise utilities
│   ├── Logger.ts               # Structured logging framework
│   └── PathResolver.ts         # Portable path resolution
├── types/                       # TypeScript definitions
└── __tests__/                   # Test suites

.claude/
├── claude_desktop_config.json  # MCP servers configuration (14 servers)
├── startup-hook.cjs            # Universal startup hook
├── agents/                     # Custom agents directory
└── ecosystem.json              # Ecosystem metadata

examples/
└── anthropic-usage.ts          # 🆕 Comprehensive Anthropic usage examples

Configuration Files:
├── .env                        # Environment variables (75+)
├── .env.template              # Configuration template with Anthropic
├── package.json               # Project metadata v2.7.0
├── tsconfig.json              # TypeScript configuration
└── jest.config.js             # Testing configuration
```

## Enterprise Portability
This enterprise Claude ecosystem is designed for **cross-platform deployment**:
- **Dynamic Project Root Detection**: Works in any directory
- **Relative Path Management**: No hardcoded absolute paths
- **Environment-Based Configuration**: 75+ configurable variables
- **UUID-Based System IDs**: Enterprise-grade unique identifiers
- **Structured Logging**: Production-ready Winston logging
- **Auto-Discovery**: MCP servers and hooks auto-detect project
- **Type-Safe Configuration**: Validated environment management
- **🆕 API Key Management**: Secure Anthropic API key handling

# 3. ENTERPRISE ARCHITECTURE

## 🏗️ Core Components

### **🆕 Anthropic SDK Integration**
- **AnthropicSDKManager.ts**: Direct API access with streaming support
- **AnthropicIntegrationHelper.ts**: Smart execution and project analysis
- **Event-Driven Architecture**: Real-time response handling
- **Token Usage Tracking**: Cost monitoring and usage analytics
- **Error Handling**: Graceful API error management
- **Session Integration**: All AI activities logged to CES session system

### **Configuration Management**
- **EnvironmentConfig.ts**: Type-safe configuration with dynamic project root detection
- **75+ Environment Variables**: Complete system configuration through .env files
- **🆕 Anthropic Configuration**: Dedicated API key and model configuration
- **Configuration Validation**: Automated validation and error reporting
- **Hot-Reloading**: Dynamic configuration updates without restart

### **Logging Framework**
- **Winston Integration**: Enterprise-grade structured logging
- **Performance Metrics**: Built-in performance tracking and reporting
- **Component Loggers**: Context-aware logging for each system component
- **🆕 AI Activity Logging**: Dedicated logging for Anthropic API interactions
- **Log Rotation**: Automatic log archival and retention management

### **Session Management**
- **Advanced Lifecycle**: Sophisticated session state management
- **Profile System**: Multiple development environment configurations
- **Auto-Recovery**: Self-healing session capabilities
- **Analytics Integration**: Usage pattern analysis and optimization
- **🆕 AI Session Tracking**: Track AI usage within sessions

### **Monitoring & Analytics**
- **Real-Time Dashboard**: Live system monitoring and metrics
- **Usage Analytics**: Comprehensive usage pattern analysis
- **🆕 AI Usage Analytics**: Dedicated Anthropic API usage tracking
- **Performance Insights**: System performance optimization recommendations
- **Export Capabilities**: Data export in JSON, CSV, and HTML formats

### **🆕 AI-Powered Features**
- **Code Analysis**: Security, performance, quality, and bug detection
- **Code Generation**: AI-powered code creation with review capabilities
- **Interactive Chat**: Conversational AI interface with context awareness
- **Project Analysis**: Multi-file analysis with intelligent summarization
- **Smart Suggestions**: AI-powered workflow optimization recommendations

## 🛠️ Available Tools

- **TypeScript**: Enterprise-grade type checking with strict mode
- **Jest**: Comprehensive testing framework with coverage reporting
- **ESLint**: Advanced code linting and formatting rules
- **Winston**: Structured enterprise logging framework
- **UUID**: Enterprise identifier generation system
- **tsx**: Development execution environment
- **🆕 @anthropic-ai/sdk**: Official Anthropic SDK for Claude API access
- **🆕 nanospinner**: Enhanced CLI user experience for AI operations

## 🚀 Production Readiness

This is an **enterprise-ready foundation** designed for:
- **High Availability**: Auto-recovery and self-healing capabilities
- **Scalability**: Modular architecture supporting growth
- **Maintainability**: Clean code patterns and comprehensive documentation
- **Observability**: Full logging, monitoring, and analytics coverage
- **Security**: Enterprise security patterns and best practices
- **Compliance**: Structured audit trails and data governance
- **🆕 AI Integration**: Production-ready Anthropic API integration
- **🆕 Cost Management**: Token usage tracking and cost optimization

# 4. 🆕 ANTHROPIC SDK CAPABILITIES

## Direct API Access
- **Native Claude Integration**: Direct access to Claude models via Anthropic API
- **Model Selection**: Support for Claude 3 Sonnet, Opus, and Haiku models
- **Streaming Responses**: Real-time response streaming for better user experience
- **Context Management**: Conversation history and context preservation

## Code Intelligence
- **Security Analysis**: Automated security vulnerability detection
- **Performance Analysis**: Code performance optimization recommendations
- **Quality Assessment**: Code quality metrics and improvement suggestions
- **Bug Detection**: Intelligent bug identification and resolution suggestions

## Development Assistance
- **Code Generation**: AI-powered code creation with framework awareness
- **Code Review**: Automated code review with improvement suggestions
- **Project Analysis**: Multi-file project understanding and documentation
- **Interactive Coding**: Conversational programming assistant

## Enterprise Features
- **Usage Analytics**: Comprehensive API usage tracking and cost monitoring
- **Session Integration**: Full integration with CES session management
- **Error Handling**: Robust error handling and retry mechanisms
- **Configuration Management**: Environment-based API configuration

# 5. CONFIGURATION REFERENCE

## Environment Variables

### Core System (12 variables)
```bash
NODE_ENV=development
CES_VERSION=2.7.0
CES_PROJECT_NAME=claude-ecosystem-standard
CES_INSTANCE_ID=auto-generated
# ... [additional core variables]
```

### 🆕 Anthropic Configuration (6 variables)
```bash
ANTHROPIC_API_KEY=your-api-key-here
CES_ANTHROPIC_MODEL=claude-3-sonnet-20240229
CES_ANTHROPIC_MAX_TOKENS=4096
CES_ANTHROPIC_TEMPERATURE=0.7
CES_ANTHROPIC_TIMEOUT=30000
CES_ANTHROPIC_MAX_RETRIES=2
```

### Analytics & Monitoring (15 variables)
```bash
CES_ANALYTICS_ENABLED=true
CES_ANALYTICS_BATCH_SIZE=50
CES_DASHBOARD_ENABLED=true
CES_DASHBOARD_REFRESH_INTERVAL=2000
# ... [additional analytics variables]
```

### Session Management (12 variables)
```bash
CES_SESSION_TIMEOUT=3600000
CES_MAX_SESSIONS=10
CES_SESSION_CLEANUP_INTERVAL=300000
# ... [additional session variables]
```

### AI Session & Cloud (20 variables)
```bash
CES_AI_SESSION_ENABLED=true
CES_AI_LEARNING_MODE=standard
CES_CLOUD_ENABLED=false
CES_CLOUD_PROVIDER=github
# ... [additional AI and cloud variables]
```

### Auto-Recovery & Security (10 variables)
```bash
CES_AUTO_RECOVERY_ENABLED=true
CES_ENABLE_AUTH=false
CES_JWT_SECRET=auto-generated
# ... [additional security variables]
```

## 📖 Complete CLI Reference

### Session Management
```bash
npm run dev -- start-session [--force]
npm run dev -- checkpoint-session [--message <msg>]
npm run dev -- close-session [--save]
npm run dev -- status
npm run dev -- validate [--verbose]
```

### 🆕 AI Commands
```bash
npm run dev -- ai ask <prompt> [--stream] [--model <model>]
npm run dev -- ai analyze <files> [--type <type>]
npm run dev -- ai generate [--language <lang>] [--with-tests] [--with-review]
npm run dev -- ai chat
npm run dev -- ai stats
```

### Advanced Features
```bash
npm run dev -- auto-task <prompt>
npm run dev -- clean-reset [--dry-run] [--preserve-sessions]
npm run dev -- monitor [--start|--stop|--status]
npm run dev -- recovery [--start|--stop|--status]
npm run dev -- dashboard [--live|--snapshot] [--compact]
npm run dev -- profiles [--list|--apply <id>|--create <name>]
npm run dev -- quick [--list|--create <alias>] [alias]
npm run dev -- ai-session [--start|--insights|--optimize]
npm run dev -- analytics [--dashboard|--export|--realtime]
npm run dev -- cloud [--configure|--backup|--sync|--restore <id>]
```

# 6. EXAMPLES & USAGE

## 🆕 Anthropic Integration Examples

### Basic AI Interaction
```bash
# Simple question
npm run dev -- ai ask "What's the difference between const and let in JavaScript?"

# Streaming response
npm run dev -- ai ask --stream "Explain async/await in TypeScript"

# Use specific model
npm run dev -- ai ask --model claude-3-opus-20240229 "Complex architectural question"
```

### Code Analysis
```bash
# Security analysis
npm run dev -- ai analyze src/auth/ --type security

# Performance analysis  
npm run dev -- ai analyze src/api/routes.ts --type performance

# Complete project analysis
npm run dev -- ai analyze src/ --type all
```

### Code Generation
```bash
# Interactive TypeScript generation
npm run dev -- ai generate --language typescript --with-tests

# React component with review
npm run dev -- ai generate --framework react --with-review

# Generate with specific code style
npm run dev -- ai generate --language python --style functional
```

### Interactive Development
```bash
# Start AI chat session
npm run dev -- ai chat

# Example conversation:
# You: "Help me implement authentication middleware"
# Claude: [Provides detailed middleware implementation]
# You: "Add JWT token validation"  
# Claude: [Extends the solution with JWT validation]
```

## Enterprise Workflow Examples

### Complete Development Session
```bash
# 1. Start enterprise session
npm run dev -- start-session

# 2. Apply development profile
npm run dev -- profiles --apply fullstack-development

# 3. Analyze existing code
npm run dev -- ai analyze src/ --type quality

# 4. Generate new feature
npm run dev -- ai generate --language typescript --with-tests

# 5. Monitor system performance
npm run dev -- dashboard --live

# 6. Create checkpoint
npm run dev -- checkpoint-session --message "Feature implementation complete"

# 7. Export analytics
npm run dev -- analytics --export json

# 8. Close session
npm run dev -- close-session --save
```

### AI-Assisted Development
```bash
# Start AI-optimized session
npm run dev -- ai-session --start

# Get intelligent recommendations
npm run dev -- ai-session --recommendations

# Analyze and optimize workflow
npm run dev -- ai-session --optimize

# Generate code with AI assistance
npm run dev -- ai generate --with-review

# Continuous AI insights
npm run dev -- ai-session --insights
```

This comprehensive enterprise foundation with **native Anthropic SDK integration** provides a complete development ecosystem that combines the power of Claude Code CLI with direct AI capabilities, enterprise-grade architecture, and production-ready features.