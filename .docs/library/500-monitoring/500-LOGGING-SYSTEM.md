# 005 - LOGGING E MONITORING

## 📊 Sistema Logging e Monitoring CES v2.7.0 Enterprise

**Leggi dopo il CLI Reference** - Sistema enterprise di logging strutturato e monitoring avanzato.

### 🏗️ Architettura Logging Enterprise

Il sistema CES v2.7.0 implementa un framework di logging enterprise-grade basato su **Winston** con funzionalità avanzate:

#### Componenti Principali

```typescript
// Struttura logging enterprise
.src/utils/Logger.ts              # Framework logging principale
.claude/logs/                    # Directory log centralizzata
├── ces-combined.log             # Log completi sistema
├── ces-error.log                # Log errori dedicati
├── ces-performance.log          # Metriche performance
├── ces-security.log             # Eventi sicurezza
└── ces-analytics.log            # Dati analytics
```

#### 🎯 Caratteristiche Enterprise

- **📝 Structured Logging**: Formato JSON strutturato per parsing automatico
- **🔄 Log Rotation**: Rotazione automatica con retention policy
- **🎨 Multiple Transports**: File, console, e transport esterni
- **🏷️ Context Enrichment**: Metadata automatici per ogni log entry
- **⚡ Performance Tracking**: Metriche performance integrate
- **🔐 Security Auditing**: Log eventi sicurezza e accessi

### 📋 Logging Configuration

#### 1. Variabili Ambiente Logging

```bash
# Livello logging (error/warn/info/debug)
CES_LOG_LEVEL=info

# Formato output (json/simple)
CES_LOG_FORMAT=json

# Log file management
CES_LOG_MAX_FILES=10            # File massimi per rotazione
CES_LOG_MAX_SIZE=50MB           # Dimensione massima per file
CES_LOG_DATE_PATTERN=YYYY-MM-DD # Pattern rotazione giornaliera

# Performance logging
CES_LOG_PERFORMANCE=true        # Abilita logging performance
CES_LOG_METRICS_BUFFER=1000     # Dimensione buffer metriche

# Security logging
CES_LOG_SECURITY_EVENTS=true    # Log eventi sicurezza
CES_LOG_FAILED_AUTH=true        # Log tentativi auth falliti
```

#### 2. TypeScript Configuration

```typescript
import { logger, createLogger } from '../utils/Logger.js';

// Logger globale sistema
logger.info('System initialized', { 
  component: 'startup',
  version: '2.5.0'
});

// Logger componente specifico
const aiLogger = createLogger('AISessionManager', {
  sessionId: 'session-123',
  userId: 'user-456'
});

aiLogger.info('AI optimization started', {
  action: 'optimize',
  duration: 1250,
  success: true
});
```

### 🔍 Tipi di Log Enterprise

#### 1. **System Logs** - Eventi Sistema

```typescript
// Eventi lifecycle sistema
logger.system('CES v2.7.0 startup completed', {
  startupTime: 2340,
  servicesLoaded: 12,
  configValidation: true
});

logger.system('Auto-recovery triggered', {
  service: 'claude-code-cli',
  action: 'restart',
  attempts: 1
});
```

#### 2. **Session Logs** - Session Management

```typescript
// Eventi sessione Claude Code
logger.session('Session started', 'session-uuid-123', {
  profile: 'frontend-react',
  analyticsEnabled: true,
  autoRecovery: true
});

logger.session('Checkpoint created', 'session-uuid-123', {
  checkpointName: 'feature-complete',
  filesModified: 23,
  duration: 1800000
});
```

#### 3. **Performance Logs** - Metriche Performance

```typescript
// Performance tracking operations
logger.performance('AI optimization', 1250, true, {
  component: 'AISessionManager',
  performanceGain: 85,
  optimizationsApplied: 7
});

logger.performance('Analytics report generation', 850, true, {
  component: 'AnalyticsManager',
  eventsAnalyzed: 1500,
  reportSize: '2.3MB'
});
```

#### 4. **Security Logs** - Eventi Sicurezza

```typescript
// Eventi sicurezza e accessi
logger.security('JWT token validation', {
  userId: 'user-123',
  success: true,
  ipAddress: '192.168.1.100'
});

logger.security('Configuration access attempt', {
  action: 'config-edit',
  authorized: true,
  adminLevel: true
});
```

#### 5. **Error Logs** - Error Management

```typescript
// Errori con stack trace completo
try {
  await riskyOperation();
} catch (error) {
  logger.error('Operation failed', error, {
    component: 'CloudIntegration',
    operation: 'sync',
    retryAttempt: 3
  });
}
```

### 📊 Dashboard Monitoring

#### 1. Dashboard Live

```bash
# Avvia dashboard monitoring
npm run dev -- dashboard live --refresh 1000

# Dashboard con theme specifico
npm run dev -- dashboard live --theme dark --port 3001

# Dashboard compact per mobile
npm run dev -- dashboard compact --auto-open
```

**Metriche Dashboard:**

- **🎯 Status Sistema**: CPU, memoria, disk usage
- **⚡ Performance**: Tempi risposta, throughput
- **📊 Analytics**: Eventi recenti, trending
- **🔄 Recovery**: Status auto-recovery, alert
- **👥 Sessioni**: Sessioni attive, profili utilizzati

#### 2. Real-time Monitoring

```bash
# Monitoring tempo reale
npm run dev -- analytics realtime --summary

# Monitoring con filtri
npm run dev -- monitor start --interval 5000 --auto-checkpoint
```

**Monitoring Features:**

- **📈 Live Metrics**: Aggiornamento real-time metriche
- **🚨 Alert System**: Notifiche soglie performance
- **📱 Mobile Dashboard**: Dashboard responsive
- **🔍 Log Streaming**: Stream live dei log
- **📊 Visual Charts**: Grafici performance interattivi

### 🎨 Formati Log Avanzati

#### 1. Formato JSON Strutturato

```json
{
  "timestamp": "2024-08-02T10:30:45.123Z",
  "level": "info",
  "message": "AI optimization completed",
  "service": "claude-ecosystem-standard",
  "version": "2.5.0",
  "instanceId": "ces-prod-001",
  "environment": "production",
  "component": "AISessionManager",
  "sessionId": "session-uuid-123",
  "action": "optimize",
  "duration": 1250,
  "success": true,
  "performanceGain": 85,
  "optimizationsApplied": 7,
  "metadata": {
    "learningMode": "active",
    "accuracyThreshold": 80
  }
}
```

#### 2. Formato Console Development

```
2024-08-02T10:30:45.123Z [INFO] [AISessionManager] AI optimization completed {
  "sessionId": "session-uuid-123",
  "duration": 1250,
  "success": true,
  "performanceGain": 85
}
```

### 📈 Analytics e Metriche

#### 1. Raccolta Dati Analytics

```bash
# Avvia raccolta analytics
npm run dev -- analytics start --buffer-size 2000

# Report analytics completo
npm run dev -- analytics report --period week --include-events

# Export dati per analisi
npm run dev -- analytics export --format csv --period month
```

#### 2. Metriche Performance

**Metriche Automatiche:**

- **⏱️ Response Time**: Operations response time
- **🎯 Success Rate**: Operations success rate
- **💾 Memory Usage**: Utilizzo memoria per componente
- **🔄 Operation Count**: Operation count by type
- **📊 User Satisfaction**: Score soddisfazione utente (AI-powered)

**Custom Metrics:**

```typescript
// Metriche personalizzate
logger.performance('custom-operation', duration, success, {
  component: 'CustomComponent',
  customMetric1: 'value1',
  customMetric2: 123,
  businessImpact: 'high'
});
```

### 🔍 Query e Analisi Log

#### 1. CLI Log Analysis

```bash
# Cerca log per componente
npm run dev -- logs search --component AISessionManager --last 24h

# Filtra log per livello
npm run dev -- logs filter --level error --since "2024-08-01"

# Analisi performance
npm run dev -- logs analyze --type performance --duration-threshold 1000
```

#### 2. Log Aggregation

```bash
# Aggregazione per componente
npm run dev -- logs aggregate --group component --period day

# Top errori
npm run dev -- logs top-errors --count 10 --period week

# Trend performance
npm run dev -- logs trend --metric duration --component all
```

### 🔧 Strumenti Debugging

#### 1. Debug Mode Avanzato

```bash
# Debug completo con verbose logging
DEBUG=ces:* npm run dev -- start-session --verbose

# Debug specifico per componente
DEBUG=ces:ai-session npm run dev -- ai-session --insights

# Debug con profiling
NODE_ENV=development CES_PROFILING=true npm run dev -- optimize
```

#### 2. Log Inspection Tools

```bash
# Tail log in tempo reale
npm run dev -- logs tail --follow --filter error

# Log viewer interattivo
npm run dev -- logs view --interactive --since 1h

# Export log per debugging
npm run dev -- logs export --format json --component all --last 6h
```

### 📊 Monitoring Configuration

#### 1. Soglie e Alert

```bash
# Performance thresholds configuration
CES_PERF_WARNING_THRESHOLD=1000     # Warning sopra 1 secondo
CES_PERF_CRITICAL_THRESHOLD=5000    # Critical sopra 5 secondi
CES_MEMORY_WARNING_THRESHOLD=80     # Warning sopra 80% memoria
CES_ERROR_RATE_THRESHOLD=5          # Warning sopra 5% errori

# Notifications configuration
CES_NOTIFICATIONS_ENABLED=true      # Abilita notifiche
CES_NOTIFICATIONS_EMAIL=admin@company.com
CES_NOTIFICATIONS_WEBHOOK=https://hooks.slack.com/...
```

#### 2. Health Checks

```bash
# Health check completo
npm run dev -- health-check --comprehensive

# Health check specifico
npm run dev -- health-check --component logging --verbose

# Health check con auto-fix
npm run dev -- health-check --fix-issues --report
```

### 🔄 Retention e Archiving

#### 1. Politiche Retention

```bash
# Retention configuration
CES_LOG_RETENTION_DAYS=90           # Mantieni log 90 giorni
CES_LOG_ARCHIVE_ENABLED=true        # Abilita archiving
CES_LOG_COMPRESSION=gzip            # Compressione archivi

# Cleanup manuale
npm run dev -- logs cleanup --older-than 30d --compress
```

#### 2. Backup Log

```bash
# Backup log correnti
npm run dev -- logs backup --name "pre-deployment"

# Backup con compressione
npm run dev -- logs backup --compress --encryption

# Restore da backup
npm run dev -- logs restore --backup-id "2024-08-01-backup"
```

### 🚨 Monitoring Alerts

#### 1. Sistema Alert

**Alert Automatici:**

- **🔥 High CPU Usage**: CPU > 85% per 5 minuti
- **💾 Memory Leak**: Memoria crescente > 10MB/minuto  
- **⚠️ Error Rate**: Errori > 5% in 15 minuti
- **🐌 Slow Performance**: Response time > 2 secondi
- **🚫 Service Down**: Servizio non risponde per 1 minuto

#### 2. Custom Alerts

```typescript
// Alert personalizzati
logger.alert('Business metric threshold exceeded', {
  component: 'BusinessLogic',
  metric: 'conversionRate',
  current: 2.1,
  threshold: 5.0,
  severity: 'warning'
});
```

### 📚 Best Practices Logging

#### 1. Structured Logging

```typescript
// ✅ Buona pratica - Strutturato
logger.info('User operation completed', {
  component: 'UserManager',
  operation: 'update-profile',
  userId: '123',
  duration: 150,
  success: true
});

// ❌ Cattiva pratica - Non strutturato
logger.info('User 123 updated profile in 150ms successfully');
```

#### 2. Context Enrichment

```typescript
// Logger con context default
const userLogger = createLogger('UserManager', {
  userId: '123',
  sessionId: 'session-456'
});

// All operations will automatically have userId and sessionId
userLogger.info('Profile updated', { operation: 'update-email' });
```

#### 3. Performance Logging

```typescript
// Tracking performance con timing
const startTime = Date.now();
await performOperation();
const duration = Date.now() - startTime;

logger.performance('operation-name', duration, true, {
  component: 'ServiceName',
  operationType: 'database-write'
});
```

---

**📌 Il sistema di logging e monitoring CES v2.7.0 fornisce visibilità completa enterprise-grade con analytics avanzate e alerting intelligente.**