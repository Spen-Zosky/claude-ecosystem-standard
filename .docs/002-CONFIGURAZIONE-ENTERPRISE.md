# 002 - CONFIGURAZIONE ENTERPRISE

## 🔧 Sistema di Configurazione Enterprise CES v2.6.0

**Leggi dopo l'introduzione generale** - Documento tecnico fondamentale per comprendere il sistema di configurazione.

### 🏗️ Architettura Configurazione

Il sistema di configurazione enterprise è progettato per ambienti production con:

1. **EnvironmentConfig.ts** - Manager configurazione type-safe
2. **.env / .env.template** - Gestione variabili ambiente  
3. **Dynamic Project Root Detection** - Sistema installazione portabile
4. **Configuration Validation** - Validazione automatica e error reporting
5. **Hot-Reloading** - Aggiornamenti configurazione runtime

### 📊 69+ Variabili di Configurazione

#### 1. Core System (Identità Sistema)

```bash
NODE_ENV=development                    # Ambiente: development/staging/production
CES_VERSION=2.5.0                      # Identificatore versione CES
CES_PROJECT_NAME=claude-ecosystem-standard  # Identificatore progetto
CES_INSTANCE_ID=ces-dev-001            # Identificatore univoco istanza
```

#### 2. Session Management (Gestione Sessioni)

```bash
CES_SESSION_TIMEOUT=3600000            # Timeout sessione (1 ora)
CES_MAX_SESSIONS=10                    # Sessioni concorrenti max
CES_SESSION_CLEANUP_INTERVAL=300000    # Intervallo cleanup (5 minuti)
```

#### 3. Timer and Monitoring (Timer e Monitoraggio)

```bash
CES_CONTEXT_ANALYSIS_INTERVAL=30000    # Analisi contesto (30 secondi)
CES_RECOMMENDATIONS_INTERVAL=300000    # Raccomandazioni (5 minuti)  
CES_HEALTH_CHECK_INTERVAL=60000        # Health check (1 minuto)
CES_METRICS_COLLECTION_INTERVAL=60000  # Raccolta metriche (1 minuto)
```

#### 4. Analytics (Sistema Analytics)

```bash
CES_ANALYTICS_ENABLED=true             # Abilita raccolta analytics
CES_ANALYTICS_BATCH_SIZE=50            # Dimensione batch processing
CES_ANALYTICS_MAX_BUFFER_SIZE=1000     # Dimensione massima buffer
CES_ANALYTICS_RETENTION_DAYS=30        # Periodo retention dati
CES_ANALYTICS_EXPORT_FORMAT=json       # Formato export (json/csv/html)
```

#### 5. AI Session (Sessioni AI)

```bash
CES_AI_SESSION_ENABLED=true            # Abilita funzionalità AI session
CES_AI_LEARNING_MODE=standard          # Modalità learning (passive/active/aggressive)
CES_AI_ADAPTATION_LEVEL=standard       # Livello adattamento (minimal/standard/maximum)
CES_AI_PREDICTION_ACCURACY=80          # Soglia accuratezza predizione
CES_AI_AUTO_OPTIMIZATION=true          # Auto-ottimizzazione abilitata
CES_AI_SMART_RECOMMENDATIONS=true      # Raccomandazioni smart abilitate
CES_AI_CONTEXT_AWARENESS=true          # Context awareness abilitata
```

#### 6. Logging Enterprise (Sistema Logging)

```bash
CES_LOG_LEVEL=info                     # Livello log (error/warn/info/debug)
CES_LOG_FORMAT=json                    # Formato log (json/simple)
CES_LOG_MAX_FILES=5                    # File log massimi
CES_LOG_MAX_SIZE=10MB                  # Dimensione massima file log
CES_LOG_DATE_PATTERN=YYYY-MM-DD        # Pattern data rotazione log
```

#### 7. Security Enterprise (Sicurezza)

```bash
CES_ENABLE_AUTH=false                  # Abilita autenticazione
CES_JWT_SECRET=ces-jwt-secret-uuid     # Secret JWT (auto-generato)
CES_JWT_EXPIRY=24h                     # Tempo scadenza JWT
CES_CORS_ENABLED=true                  # Abilita CORS
CES_RATE_LIMIT_WINDOW=900000           # Finestra rate limit (15 minuti)
CES_RATE_LIMIT_MAX=100                 # Richieste massime rate limit
```

#### 8. Auto Recovery (Sistema Auto-Recovery)

```bash
CES_AUTO_RECOVERY_ENABLED=true         # Abilita auto-recovery
CES_AUTO_RESTART_ENABLED=true          # Abilita auto-restart
CES_AUTO_CLEANUP_ENABLED=true          # Abilita auto-cleanup
CES_RECOVERY_CHECK_INTERVAL=10000      # Intervallo check recovery (10 secondi)
CES_MAX_RESTART_ATTEMPTS=3             # Tentativi restart massimi
```

### 🛠️ API Gestione Configurazione

#### Accesso Configurazione TypeScript

```typescript
import { envConfig } from '../config/EnvironmentConfig.js';

// Ottenere valore configurazione specifico
const sessionTimeout = envConfig.get<number>('sessionTimeout');
const analyticsEnabled = envConfig.get<boolean>('analytics.enabled');
const logLevel = envConfig.get<string>('logging.level');

// Ottenere percorsi progetto
const projectRoot = envConfig.getProjectRoot();
const absolutePath = envConfig.getAbsolutePath('src/components');
const relativePath = envConfig.getRelativePath('/full/path/to/file');
```

#### Validazione Configurazione

```typescript
// Validare configurazione corrente
const validation = envConfig.validateConfig();
if (!validation.valid) {
    console.error('Errori configurazione:', validation.errors);
}

// Ottenere metadata configurazione
const metadata = envConfig.getMetadata();
console.log('Config caricata:', metadata.loadTime);
console.log('Project root:', metadata.projectRoot);
```

### 🔧 Comandi CLI Configurazione

#### Visualizzare Configurazione

```bash
# Mostrare configurazione corrente
npm run dev -- config show

# Mostrare sezione configurazione specifica
npm run dev -- config show --section=analytics
npm run dev -- config show --section=logging
```

#### Modificare Configurazione

```bash
# Editor configurazione interattivo
npm run dev -- config edit

# Modificare file configurazione specifico
npm run dev -- config edit .env
```

#### Validare Configurazione

```bash
# Validare configurazione corrente
npm run dev -- config validate

# Validare con output dettagliato
npm run dev -- config validate --verbose
```

### 🚀 Dynamic Project Root Detection

Il sistema di configurazione rileva automaticamente la directory root del progetto indipendentemente dalla posizione di installazione:

#### Logica Rilevamento

1. **Ricerca package.json** con nome progetto
2. **Risalita directory tree** fino a trovare project root
3. **Fallback a directory corrente** se non trovato
4. **Cache risultato** per performance

#### Benefici

- **Installazione Portabile**: Funziona in qualsiasi directory
- **No Percorsi Hardcoded**: Tutti i percorsi relativi al root rilevato
- **Cross-Platform**: Funziona su Windows, macOS, Linux
- **Container-Friendly**: Funziona in Docker e altri container

### 🔐 Considerazioni Sicurezza

#### Variabili Ambiente

- **Nessun dato sensibile in .env**: Usare gestione credenziali sicura
- **Identificatori basati UUID**: Identificatori univoci enterprise-grade
- **Generazione automatica secret**: Secret JWT auto-generati
- **Validazione configurazione**: Previene impostazioni invalide o pericolose

#### Best Practices per Ambiente

```bash
# Ambiente production
NODE_ENV=production
CES_DEBUG_ENABLED=false
CES_VERBOSE_LOGGING=false
CES_ERROR_STACK_TRACE=false

# Ambiente development
NODE_ENV=development
CES_DEBUG_ENABLED=true
CES_VERBOSE_LOGGING=true
CES_ERROR_STACK_TRACE=true
```

### 📊 Template Configurazione

#### Template Development (.env.development)

```bash
NODE_ENV=development
CES_DEBUG_ENABLED=true
CES_VERBOSE_LOGGING=true
CES_ANALYTICS_ENABLED=true
CES_AI_SESSION_ENABLED=true
CES_AUTO_RECOVERY_ENABLED=true
CES_DASHBOARD_ENABLED=true
```

#### Template Production (.env.production)

```bash
NODE_ENV=production
CES_DEBUG_ENABLED=false
CES_VERBOSE_LOGGING=false
CES_ANALYTICS_ENABLED=true
CES_AI_SESSION_ENABLED=true
CES_AUTO_RECOVERY_ENABLED=true
CES_DASHBOARD_ENABLED=false
```

### 🔄 Migrazione Configurazione

Durante l'upgrade delle versioni CES, la migrazione configurazione è gestita automaticamente:

1. **Backup configurazione corrente**
2. **Caricamento nuovo template configurazione**
3. **Migrazione valori esistenti**
4. **Validazione configurazione migrata**
5. **Report risultati migrazione**

### 📚 Riferimenti Completi

Per riferimento configurazione completo:

- **`.env.template`** - Template configurazione completo con tutte le variabili
- **`src/config/EnvironmentConfig.ts`** - Interface configurazione TypeScript
- **Aiuto CLI** - `npm run dev -- config --help`

---

**📌 Prossimo**: Dopo aver compreso la configurazione, procedere con **003-SETUP-INSTALLAZIONE** per installazione pratica del sistema.