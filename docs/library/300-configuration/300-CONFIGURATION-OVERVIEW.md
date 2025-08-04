# 002 - ENTERPRISE CONFIGURATION

## 🔧 CES v2.7.0 Enterprise Configuration System

**Read after general introduction** - Essential technical document for understanding the configuration system.

### 🏗️ Configuration Architecture

The enterprise configuration system is designed for production environments with:

1. **EnvironmentConfig.ts** - Type-safe configuration manager
2. **.env / .env.template** - Environment variable management  
3. **Dynamic Project Root Detection** - Portable installation system
4. **Configuration Validation** - Automatic validation and error reporting
5. **Hot-Reloading** - Runtime configuration updates
6. **🆕 Integration Mode Detection** - Standalone vs integrated operation

### 📊 75+ Configuration Variables

#### 1. Core System (System Identity)

```bash
NODE_ENV=development                     # Environment: development/staging/production
CES_VERSION=2.7.0                       # CES version identifier
CES_PROJECT_NAME=claude-ecosystem-standard  # Project identifier
CES_INSTANCE_ID=ces-dev-001             # Unique instance identifier
CES_OPERATION_MODE=standalone           # 🆕 Operation mode: standalone/integrated
```

#### 2. Session Management

```bash
CES_SESSION_TIMEOUT=3600000             # Session timeout (1 hour)
CES_MAX_SESSIONS=10                     # Maximum concurrent sessions
CES_SESSION_CLEANUP_INTERVAL=300000     # Cleanup interval (5 minutes)
```

#### 3. Timer and Monitoring

```bash
CES_CONTEXT_ANALYSIS_INTERVAL=30000     # Context analysis (30 seconds)
CES_RECOMMENDATIONS_INTERVAL=300000     # Recommendations (5 minutes)  
CES_HEALTH_CHECK_INTERVAL=60000         # Health check (1 minute)
CES_METRICS_COLLECTION_INTERVAL=60000   # Metrics collection (1 minute)
```

#### 4. Analytics System

```bash
CES_ANALYTICS_ENABLED=true              # Enable analytics collection
CES_ANALYTICS_BATCH_SIZE=50             # Batch processing size
CES_ANALYTICS_MAX_BUFFER_SIZE=1000      # Maximum buffer size
CES_ANALYTICS_RETENTION_DAYS=30         # Data retention period
CES_ANALYTICS_EXPORT_FORMAT=json        # Export format (json/csv/html)
```

#### 5. AI Session Management

```bash
CES_AI_SESSION_ENABLED=true             # Enable AI session features
CES_AI_LEARNING_MODE=standard           # Learning mode (passive/active/aggressive)
CES_AI_ADAPTATION_LEVEL=standard        # Adaptation level (minimal/standard/maximum)
CES_AI_PREDICTION_ACCURACY=80           # Prediction accuracy threshold
CES_AI_AUTO_OPTIMIZATION=true           # Auto-optimization enabled
CES_AI_SMART_RECOMMENDATIONS=true       # Smart recommendations enabled
CES_AI_CONTEXT_AWARENESS=true           # Context awareness enabled
```

#### 6. 🆕 Anthropic SDK Configuration ✨ NEW in v2.7.0

```bash
ANTHROPIC_API_KEY=your-api-key-here     # Anthropic API key (required for AI features)
CES_ANTHROPIC_MODEL=claude-3-sonnet-20240229  # Default Claude model
CES_ANTHROPIC_MAX_TOKENS=4096           # Maximum tokens per request
CES_ANTHROPIC_TEMPERATURE=0.7           # Response creativity (0.0-1.0)
CES_ANTHROPIC_TIMEOUT=30000             # Request timeout (30 seconds)
CES_ANTHROPIC_MAX_RETRIES=2             # Maximum retry attempts
```

#### 7. Enterprise Logging

```bash
CES_LOG_LEVEL=info                      # Log level (error/warn/info/debug)
CES_LOG_FORMAT=json                     # Log format (json/simple)
CES_LOG_MAX_FILES=5                     # Maximum log files
CES_LOG_MAX_SIZE=10MB                   # Maximum log file size
CES_LOG_DATE_PATTERN=YYYY-MM-DD         # Log rotation date pattern
```

#### 8. Enterprise Security

```bash
CES_ENABLE_AUTH=false                   # Enable authentication
CES_JWT_SECRET=ces-jwt-secret-uuid      # JWT secret (auto-generated)
CES_JWT_EXPIRY=24h                      # JWT expiry time
CES_CORS_ENABLED=true                   # Enable CORS
CES_RATE_LIMIT_WINDOW=900000            # Rate limit window (15 minutes)
CES_RATE_LIMIT_MAX=100                  # Maximum rate limit requests
```

#### 9. Auto Recovery System

```bash
CES_AUTO_RECOVERY_ENABLED=true          # Enable auto-recovery
CES_AUTO_RESTART_ENABLED=true           # Enable auto-restart
CES_AUTO_CLEANUP_ENABLED=true           # Enable auto-cleanup
CES_RECOVERY_CHECK_INTERVAL=10000       # Recovery check interval (10 seconds)
CES_MAX_RESTART_ATTEMPTS=3              # Maximum restart attempts
```

#### 10. Cloud Integration

```bash
CES_CLOUD_ENABLED=false                 # Enable cloud integration
CES_CLOUD_PROVIDER=github               # Cloud provider (github/aws/azure)
CES_CLOUD_ENCRYPTION_ENABLED=true       # Enable cloud encryption
CES_CLOUD_AUTO_SYNC=false               # Enable automatic synchronization
CES_CLOUD_SYNC_INTERVAL=1800000         # Sync interval (30 minutes)
CES_CLOUD_BACKUP_RETENTION=7            # Backup retention days
```

#### 11. Dashboard Configuration

```bash
CES_DASHBOARD_ENABLED=true              # Enable dashboard
CES_DASHBOARD_REFRESH_INTERVAL=2000     # Refresh interval (2 seconds)
CES_DASHBOARD_COMPACT_MODE=false        # Enable compact mode
CES_DASHBOARD_SHOW_GRAPHS=true          # Show performance graphs
```

### 🛠️ Configuration Management API

#### TypeScript Configuration Access

```typescript
import { envConfig } from '../config/EnvironmentConfig.js';

// Get specific configuration value
const sessionTimeout = envConfig.get<number>('sessionTimeout');
const analyticsEnabled = envConfig.get<boolean>('analytics.enabled');
const logLevel = envConfig.get<string>('logging.level');

// 🆕 Get Anthropic configuration
const anthropicConfig = envConfig.get('anthropic');
const apiKey = anthropicConfig.apiKey;
const defaultModel = anthropicConfig.defaultModel;

// Get project paths
const projectRoot = envConfig.getProjectRoot();
const absolutePath = envConfig.getAbsolutePath('src/components');
const relativePath = envConfig.getRelativePath('/full/path/to/file');

// 🆕 Integration mode detection
const operationMode = envConfig.getIntegrationMode(); // 'standalone' | 'integrated'
const cesRoot = envConfig.getCesRoot();
const operationRoot = envConfig.getOperationRoot();
```

#### Configuration Validation

```typescript
// Validate current configuration
const validation = envConfig.validateConfig();
if (!validation.valid) {
    console.error('Configuration errors:', validation.errors);
}

// Get configuration metadata
const metadata = envConfig.getMetadata();
console.log('Config loaded:', metadata.loadTime);
console.log('Project root:', metadata.projectRoot);
console.log('Operation mode:', metadata.operationMode); // 🆕
console.log('Installation type:', metadata.installationType); // 🆕
```

### 🔧 Configuration CLI Commands

#### View Configuration

```bash
# Show current configuration
npm run dev -- config show

# Show specific configuration section
npm run dev -- config show --section=analytics
npm run dev -- config show --section=logging
npm run dev -- config show --section=anthropic  # 🆕
```

#### Modify Configuration

```bash
# Interactive configuration editor
npm run dev -- config edit

# Edit specific configuration file
npm run dev -- config edit .env
```

#### Validate Configuration

```bash
# Validate current configuration
npm run dev -- config validate

# Validate with detailed output
npm run dev -- config validate --verbose
```

### 🚀 Dynamic Project Root Detection

The configuration system automatically detects the project root directory regardless of installation location:

#### Detection Logic

1. **Search for package.json** with project name
2. **Traverse directory tree** upward until project root found
3. **Fallback to current directory** if not found
4. **Cache result** for performance

#### Benefits

- **Portable Installation**: Works in any directory
- **No Hardcoded Paths**: All paths relative to detected root
- **Cross-Platform**: Works on Windows, macOS, Linux
- **Container-Friendly**: Works in Docker and other containers
- **🆕 Integration Support**: Detects when installed as subdirectory

### 🆕 Integration Mode Detection ✨ NEW in v2.7.0

CES v2.7.0 introduces intelligent operation mode detection:

#### Standalone Mode
- Traditional installation as primary project
- Full control over directory structure
- Complete feature access
- Ideal for CES-focused development

#### Integrated Mode
- Install CES as subdirectory in existing projects
- Clean integration without contaminating host project
- Maintains full functionality while staying isolated
- Perfect for adding CES capabilities to existing codebases

#### Automatic Detection

```typescript
// Automatic mode detection based on installation context
const mode = envConfig.getIntegrationMode();

if (mode === 'integrated') {
    // CES is installed as subdirectory
    console.log('Host project:', envConfig.getProjectRoot());
    console.log('CES location:', envConfig.getCesRoot());
} else {
    // CES is standalone installation
    console.log('CES project root:', envConfig.getProjectRoot());
}
```

### 🔐 Security Considerations

#### Environment Variables

- **No sensitive data in .env**: Use secure credential management
- **UUID-based identifiers**: Enterprise-grade unique identifiers
- **Automatic secret generation**: Auto-generated JWT secrets
- **Configuration validation**: Prevents invalid or dangerous settings
- **🆕 API Key Security**: Secure Anthropic API key handling

#### Environment Best Practices

```bash
# Production environment
NODE_ENV=production
CES_DEBUG_ENABLED=false
CES_VERBOSE_LOGGING=false
CES_ERROR_STACK_TRACE=false
ANTHROPIC_API_KEY=secure-production-key  # 🆕

# Development environment
NODE_ENV=development
CES_DEBUG_ENABLED=true
CES_VERBOSE_LOGGING=true
CES_ERROR_STACK_TRACE=true
ANTHROPIC_API_KEY=development-key  # 🆕
```

### 📊 Configuration Templates

#### Development Template (.env.development)

```bash
NODE_ENV=development
CES_VERSION=2.7.0
CES_DEBUG_ENABLED=true
CES_VERBOSE_LOGGING=true
CES_ANALYTICS_ENABLED=true
CES_AI_SESSION_ENABLED=true
CES_AUTO_RECOVERY_ENABLED=true
CES_DASHBOARD_ENABLED=true

# 🆕 Anthropic Configuration
ANTHROPIC_API_KEY=your-development-key
CES_ANTHROPIC_MODEL=claude-3-sonnet-20240229
CES_ANTHROPIC_MAX_TOKENS=4096
CES_ANTHROPIC_TEMPERATURE=0.7
```

#### Production Template (.env.production)

```bash
NODE_ENV=production
CES_VERSION=2.7.0
CES_DEBUG_ENABLED=false
CES_VERBOSE_LOGGING=false
CES_ANALYTICS_ENABLED=true
CES_AI_SESSION_ENABLED=true
CES_AUTO_RECOVERY_ENABLED=true
CES_DASHBOARD_ENABLED=false

# 🆕 Anthropic Configuration
ANTHROPIC_API_KEY=your-production-key
CES_ANTHROPIC_MODEL=claude-3-sonnet-20240229
CES_ANTHROPIC_MAX_TOKENS=2048
CES_ANTHROPIC_TEMPERATURE=0.5
```

### 🔄 Configuration Migration

During CES version upgrades, configuration migration is handled automatically:

1. **Backup current configuration**
2. **Load new configuration template**
3. **Migrate existing values**
4. **Validate migrated configuration**
5. **Report migration results**
6. **🆕 Migrate Anthropic settings** - New in v2.7.0

### 📚 Complete References

For complete configuration reference:

- **`.env.template`** - Complete configuration template with all variables
- **`src/config/EnvironmentConfig.ts`** - TypeScript configuration interface
- **CLI Help** - `npm run dev -- config --help`
- **🆕 Anthropic Setup Guide** - See examples/anthropic-usage.ts

### 🧪 Configuration Testing

```bash
# Test configuration validity
npm run dev -- validate

# Test with specific environment
NODE_ENV=production npm run dev -- validate

# Test Anthropic integration  # 🆕
npm run dev -- ai stats
```

---

**📌 Next**: After understanding configuration, proceed with **003-SETUP-INSTALLATION** for practical system installation and **🆕 Anthropic API setup**.