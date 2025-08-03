# 🔧 Enterprise Configuration System - CES v2.6.0

The Claude Ecosystem Standard v2.6.0 features a comprehensive enterprise configuration management system designed for production environments.

## 🏗️ Configuration Architecture

### Core Components

1. **EnvironmentConfig.ts** - Type-safe configuration manager
2. **.env / .env.template** - Environment variable management  
3. **Dynamic Project Root Detection** - Portable installation system
4. **Configuration Validation** - Automated validation and error reporting
5. **Hot-Reloading** - Runtime configuration updates

## 📊 Configuration Categories

### 1. Core System Configuration

```bash
# Core system identity and environment
NODE_ENV=development                    # Environment: development/staging/production
CES_VERSION=2.5.0                      # CES version identifier
CES_PROJECT_NAME=claude-ecosystem-standard  # Project identifier
CES_INSTANCE_ID=ces-dev-001            # Unique instance identifier
```

### 2. Session Management

```bash
# Session lifecycle management
CES_SESSION_TIMEOUT=3600000            # Session timeout (1 hour)
CES_MAX_SESSIONS=10                    # Maximum concurrent sessions
CES_SESSION_CLEANUP_INTERVAL=300000    # Cleanup interval (5 minutes)
```

### 3. Timer and Monitoring

```bash
# System monitoring intervals
CES_CONTEXT_ANALYSIS_INTERVAL=30000    # Context analysis (30 seconds)
CES_RECOMMENDATIONS_INTERVAL=300000    # Recommendations (5 minutes)  
CES_HEALTH_CHECK_INTERVAL=60000        # Health checks (1 minute)
CES_METRICS_COLLECTION_INTERVAL=60000  # Metrics collection (1 minute)
```

### 4. Retry and Recovery

```bash
# System resilience configuration
CES_MAX_RETRIES=3                      # Maximum retry attempts
CES_RETRY_DELAY=5000                   # Retry delay (5 seconds)
CES_RECOVERY_TIMEOUT=10000             # Recovery timeout (10 seconds)
CES_MAX_RECOVERY_ATTEMPTS=3            # Maximum recovery attempts
```

### 5. Analytics Configuration

```bash
# Usage analytics and tracking
CES_ANALYTICS_ENABLED=true             # Enable analytics collection
CES_ANALYTICS_BATCH_SIZE=50            # Batch processing size
CES_ANALYTICS_MAX_BUFFER_SIZE=1000     # Maximum buffer size
CES_ANALYTICS_RETENTION_DAYS=30        # Data retention period
CES_ANALYTICS_EXPORT_FORMAT=json       # Export format (json/csv/html)
```

### 6. AI Session Configuration

```bash
# AI-powered session optimization
CES_AI_SESSION_ENABLED=true            # Enable AI session features
CES_AI_LEARNING_MODE=standard          # Learning mode (passive/active/aggressive)
CES_AI_ADAPTATION_LEVEL=standard       # Adaptation level (minimal/standard/maximum)
CES_AI_PREDICTION_ACCURACY=80          # Prediction accuracy threshold
CES_AI_AUTO_OPTIMIZATION=true          # Auto-optimization enabled
CES_AI_SMART_RECOMMENDATIONS=true      # Smart recommendations enabled
CES_AI_CONTEXT_AWARENESS=true          # Context awareness enabled
```

### 7. Cloud Integration

```bash
# Cloud services configuration
CES_CLOUD_ENABLED=false                # Enable cloud integration
CES_CLOUD_PROVIDER=github              # Cloud provider (github/aws/azure)
CES_CLOUD_ENCRYPTION_ENABLED=true      # Enable encryption
CES_CLOUD_AUTO_SYNC=false              # Auto-sync enabled
CES_CLOUD_SYNC_INTERVAL=1800000        # Sync interval (30 minutes)
CES_CLOUD_BACKUP_RETENTION=7           # Backup retention (days)
```

### 8. Logging Configuration

```bash
# Enterprise logging framework
CES_LOG_LEVEL=info                     # Log level (error/warn/info/debug)
CES_LOG_FORMAT=json                    # Log format (json/simple)
CES_LOG_MAX_FILES=5                    # Maximum log files
CES_LOG_MAX_SIZE=10MB                  # Maximum log file size
CES_LOG_DATE_PATTERN=YYYY-MM-DD        # Date pattern for log rotation
```

### 9. Network Configuration

```bash
# Network and port management
CES_DEFAULT_PORT=3000                  # Default application port
CES_MONITOR_PORT=3001                  # Monitoring port
CES_DASHBOARD_PORT=3002                # Dashboard port
CES_HOST=localhost                     # Default host
```

### 10. Security Configuration

```bash
# Enterprise security settings
CES_ENABLE_AUTH=false                  # Enable authentication
CES_JWT_SECRET=ces-jwt-secret-uuid     # JWT secret (auto-generated)
CES_JWT_EXPIRY=24h                     # JWT expiry time
CES_CORS_ENABLED=true                  # Enable CORS
CES_RATE_LIMIT_WINDOW=900000           # Rate limit window (15 minutes)
CES_RATE_LIMIT_MAX=100                 # Rate limit maximum requests
```

### 11. Storage Paths

```bash
# Dynamic path management (relative to project root)
CES_DATA_DIR=.ces-data                 # Data directory
CES_LOGS_DIR=.ces-logs                 # Logs directory
CES_CACHE_DIR=.ces-cache               # Cache directory
CES_TEMP_DIR=.ces-temp                 # Temporary directory
CES_BACKUP_DIR=.ces-backups            # Backup directory
```

### 12. Development Configuration

```bash
# Development-specific settings
CES_DEBUG_ENABLED=true                 # Enable debug mode
CES_VERBOSE_LOGGING=false              # Enable verbose logging
CES_PERFORMANCE_MONITORING=true        # Enable performance monitoring
CES_ERROR_STACK_TRACE=true             # Include error stack traces
```

### 13. 🤖 Anthropic AI Integration Configuration (NEW v2.6.0)

```bash
# Anthropic API configuration
ANTHROPIC_API_KEY=your-api-key-here     # Anthropic API key (required)
CES_ANTHROPIC_MODEL=claude-3-sonnet-20240229  # Default Claude model
CES_ANTHROPIC_MAX_TOKENS=4096           # Maximum tokens per request
CES_ANTHROPIC_TEMPERATURE=0.7           # Response creativity (0.0-1.0)
CES_ANTHROPIC_TIMEOUT=30000             # API timeout (30 seconds)
CES_ANTHROPIC_MAX_RETRIES=2             # Maximum retry attempts
CES_ANTHROPIC_BASE_URL=                 # Custom API base URL (optional)

# AI Feature toggles
CES_AI_CODE_ANALYSIS_ENABLED=true       # Enable AI code analysis
CES_AI_CODE_GENERATION_ENABLED=true     # Enable AI code generation
CES_AI_CHAT_ENABLED=true                # Enable AI chat interface
CES_AI_STREAMING_ENABLED=true           # Enable streaming responses
CES_AI_CONVERSATION_HISTORY_LIMIT=20    # Max conversation messages
CES_AI_USAGE_TRACKING_ENABLED=true      # Enable usage analytics

# AI Performance settings
CES_AI_BATCH_ANALYSIS_SIZE=5            # Files to analyze per batch
CES_AI_COST_ALERT_THRESHOLD=10.00       # Cost alert threshold (USD)
CES_AI_TOKEN_BUDGET_DAILY=100000        # Daily token budget
CES_AI_AUTO_CLEAR_CONVERSATION=false    # Auto-clear conversation history
```

### 14. MCP Servers Configuration

```bash
# MCP server management
CES_MCP_SERVERS_ENABLED=true           # Enable MCP servers
CES_MCP_SERVERS_TIMEOUT=30000          # MCP server timeout (30 seconds)
CES_MCP_SERVERS_RETRY_ATTEMPTS=3       # MCP retry attempts
```

### 15. Auto Recovery Configuration

```bash
# Self-healing system configuration
CES_AUTO_RECOVERY_ENABLED=true         # Enable auto-recovery
CES_AUTO_RESTART_ENABLED=true          # Enable auto-restart
CES_AUTO_CLEANUP_ENABLED=true          # Enable auto-cleanup
CES_RECOVERY_CHECK_INTERVAL=10000      # Recovery check interval (10 seconds)
CES_MAX_RESTART_ATTEMPTS=3             # Maximum restart attempts
```

### 16. Dashboard Configuration

```bash
# Real-time dashboard settings
CES_DASHBOARD_ENABLED=true             # Enable dashboard
CES_DASHBOARD_REFRESH_INTERVAL=2000    # Refresh interval (2 seconds)
CES_DASHBOARD_COMPACT_MODE=false       # Compact mode
CES_DASHBOARD_SHOW_GRAPHS=true         # Show performance graphs
```

## 🛠️ Configuration Management API

### Accessing Configuration

```typescript
import { envConfig } from '../config/EnvironmentConfig.js';

// Get specific configuration value
const sessionTimeout = envConfig.get<number>('sessionTimeout');
const analyticsEnabled = envConfig.get<boolean>('analytics.enabled');
const logLevel = envConfig.get<string>('logging.level');

// Get Anthropic AI configuration (NEW v2.6.0)
const anthropicConfig = envConfig.get('anthropic');
const apiKey = anthropicConfig.apiKey;
const defaultModel = anthropicConfig.defaultModel;
const maxTokens = anthropicConfig.maxTokens;

// Get project paths
const projectRoot = envConfig.getProjectRoot();
const absolutePath = envConfig.getAbsolutePath('src/components');
const relativePath = envConfig.getRelativePath('/full/path/to/file');
```

### Configuration Validation

```typescript
// Validate current configuration
const validation = envConfig.validateConfig();
if (!validation.valid) {
    console.error('Configuration errors:', validation.errors);
}

// Get configuration metadata
const metadata = envConfig.getMetadata();
console.log('Config loaded at:', metadata.loadTime);
console.log('Project root:', metadata.projectRoot);
```

### Hot-Reloading Configuration

```typescript
// Reload configuration at runtime
await envConfig.reloadConfig();
console.log('Configuration reloaded successfully');
```

## 🔧 CLI Configuration Commands

### View Configuration

```bash
# Show current configuration
npm run dev -- config show

# Show specific configuration section
npm run dev -- config show --section=analytics
npm run dev -- config show --section=logging
```

### Edit Configuration

```bash
# Interactive configuration editor
npm run dev -- config edit

# Edit specific configuration file
npm run dev -- config edit .env
```

### Validate Configuration

```bash
# Validate current configuration
npm run dev -- config validate

# Validate with detailed output
npm run dev -- config validate --verbose
```

## 🚀 Dynamic Project Root Detection

The configuration system automatically detects the project root directory regardless of installation location:

### Detection Logic

1. **Search for package.json** with project name
2. **Walk up directory tree** until project root found
3. **Fallback to current directory** if not found
4. **Cache result** for performance

### Benefits

- **Portable Installation**: Works in any directory
- **No Hardcoded Paths**: All paths relative to detected root
- **Cross-Platform**: Works on Windows, macOS, Linux
- **Container-Friendly**: Works in Docker and other containers

## 🔐 Security Considerations

### Environment Variables

- **No sensitive data in .env**: Use secure credential management
- **UUID-based identifiers**: Enterprise-grade unique identifiers
- **Automatic secret generation**: JWT secrets auto-generated
- **Configuration validation**: Prevents invalid or dangerous settings

### Best Practices

```bash
# Production environment
NODE_ENV=production
CES_DEBUG_ENABLED=false
CES_VERBOSE_LOGGING=false
CES_ERROR_STACK_TRACE=false

# Development environment
NODE_ENV=development
CES_DEBUG_ENABLED=true
CES_VERBOSE_LOGGING=true
CES_ERROR_STACK_TRACE=true
```

## 📊 Configuration Templates

### Development Template (.env.development)

```bash
NODE_ENV=development
CES_DEBUG_ENABLED=true
CES_VERBOSE_LOGGING=true
CES_ANALYTICS_ENABLED=true
CES_AI_SESSION_ENABLED=true
CES_AUTO_RECOVERY_ENABLED=true
CES_DASHBOARD_ENABLED=true

# Anthropic AI Integration (v2.6.0)
ANTHROPIC_API_KEY=your-development-api-key
CES_ANTHROPIC_MODEL=claude-3-sonnet-20240229
CES_ANTHROPIC_MAX_TOKENS=4096
CES_ANTHROPIC_TEMPERATURE=0.7
CES_AI_CODE_ANALYSIS_ENABLED=true
CES_AI_CODE_GENERATION_ENABLED=true
CES_AI_CHAT_ENABLED=true
CES_AI_STREAMING_ENABLED=true
CES_AI_USAGE_TRACKING_ENABLED=true
```

### Production Template (.env.production)

```bash
NODE_ENV=production
CES_DEBUG_ENABLED=false
CES_VERBOSE_LOGGING=false
CES_ANALYTICS_ENABLED=true
CES_AI_SESSION_ENABLED=true
CES_AUTO_RECOVERY_ENABLED=true
CES_DASHBOARD_ENABLED=false

# Anthropic AI Integration (v2.6.0)
ANTHROPIC_API_KEY=your-production-api-key
CES_ANTHROPIC_MODEL=claude-3-sonnet-20240229
CES_ANTHROPIC_MAX_TOKENS=2048
CES_ANTHROPIC_TEMPERATURE=0.5
CES_AI_CODE_ANALYSIS_ENABLED=true
CES_AI_CODE_GENERATION_ENABLED=true
CES_AI_CHAT_ENABLED=false
CES_AI_STREAMING_ENABLED=false
CES_AI_USAGE_TRACKING_ENABLED=true
CES_AI_COST_ALERT_THRESHOLD=5.00
CES_AI_TOKEN_BUDGET_DAILY=50000
```

### Staging Template (.env.staging)

```bash
NODE_ENV=staging
CES_DEBUG_ENABLED=false
CES_VERBOSE_LOGGING=true
CES_ANALYTICS_ENABLED=true
CES_AI_SESSION_ENABLED=true
CES_AUTO_RECOVERY_ENABLED=true
CES_DASHBOARD_ENABLED=true

# Anthropic AI Integration (v2.6.0)
ANTHROPIC_API_KEY=your-staging-api-key
CES_ANTHROPIC_MODEL=claude-3-sonnet-20240229
CES_ANTHROPIC_MAX_TOKENS=3072
CES_ANTHROPIC_TEMPERATURE=0.6
CES_AI_CODE_ANALYSIS_ENABLED=true
CES_AI_CODE_GENERATION_ENABLED=true
CES_AI_CHAT_ENABLED=true
CES_AI_STREAMING_ENABLED=true
CES_AI_USAGE_TRACKING_ENABLED=true
CES_AI_COST_ALERT_THRESHOLD=7.50
```

## 🔄 Configuration Migration

When upgrading CES versions, configuration migration is handled automatically:

1. **Backup current configuration**
2. **Load new configuration template**
3. **Migrate existing values**
4. **Validate migrated configuration**
5. **Report migration results**

## 📚 Configuration Reference

For complete configuration reference, see:

- **`.env.template`** - Complete configuration template with all variables
- **`src/config/EnvironmentConfig.ts`** - TypeScript configuration interface
- **CLI help** - `npm run dev -- config --help`

The enterprise configuration system provides the foundation for a robust, scalable, and maintainable Claude development environment.