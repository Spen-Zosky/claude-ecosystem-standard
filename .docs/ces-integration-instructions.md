# 📋 ISTRUZIONI IMPLEMENTAZIONE ARCHITETTURA CES ISOLATA

## 🎯 Obiettivo e Contesto

Questo documento guida l'implementazione di un'architettura che permette a CES (Claude Ecosystem Standard) di operare come subdirectory isolata all'interno di progetti utente, mantenendo piena funzionalità mentre preserva la pulizia del progetto ospite.

### Requisiti Architetturali
- CES deve risiedere in una subdirectory `ces/` del progetto utente
- La directory `.claude/` deve essere accessibile dalla root del progetto ospite
- CES deve mantenere tutte le sue funzionalità
- L'integrazione deve essere pulita e reversibile
- Git del progetto ospite deve ignorare CES

## 📂 Struttura Target

```
my-project-01/                 # Progetto utente
├── .claude/                   # Symlink → ces/.claude
├── .gitignore                 # Include esclusioni CES
├── ces-cli                    # Wrapper script
├── src/                       # Codice progetto utente
├── package.json              # Progetto utente
└── ces/                      # CES isolato
    ├── .claude/              # Directory reale CES
    ├── .src/
    ├── .dist/
    ├── scripts/
    │   └── integrate.sh      # Script integrazione
    ├── node_modules/
    └── [resto struttura CES]
```

## 🛠️ TASK 1: Creazione Script di Integrazione

### 1.1 Crea il file `scripts/integrate.sh`

```bash
#!/bin/bash
# integrate.sh - Integrazione CES in progetti ospite
# Versione: 1.0.0
# Compatibilità: CES v2.5.0+

set -e

# Configurazione colori output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Banner
echo -e "${GREEN}"
echo "╔═══════════════════════════════════════════╗"
echo "║     CES Integration Setup v1.0.0          ║"
echo "║     Claude Ecosystem Standard             ║"
echo "╚═══════════════════════════════════════════╝"
echo -e "${NC}"

# Verifica prerequisiti
log_info "Verificando prerequisiti..."

if [ ! -f "package.json" ]; then
    log_error "Questo script deve essere eseguito dalla directory ces/"
    exit 1
fi

if ! grep -q '"name": "claude-ecosystem-standard"' package.json; then
    log_error "Directory non riconosciuta come installazione CES valida"
    exit 1
fi

# Rileva percorsi
CES_ROOT="$(pwd)"
PROJECT_ROOT="$(dirname "$CES_ROOT")"
PROJECT_NAME="$(basename "$PROJECT_ROOT")"

log_info "Configurazione rilevata:"
log_info "  Project root: $PROJECT_ROOT"
log_info "  Project name: $PROJECT_NAME"
log_info "  CES root: $CES_ROOT"

# Conferma con utente
echo ""
read -p "Procedere con l'integrazione in '$PROJECT_NAME'? [Y/n] " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]] && [ ! -z "$REPLY" ]; then
    log_warning "Integrazione annullata"
    exit 0
fi

# 1. Creazione symlink .claude
log_info "Configurando symlink .claude..."

if [ -e "$PROJECT_ROOT/.claude" ]; then
    if [ -L "$PROJECT_ROOT/.claude" ]; then
        current_target=$(readlink "$PROJECT_ROOT/.claude")
        if [ "$current_target" = "ces/.claude" ]; then
            log_success ".claude symlink già configurato correttamente"
        else
            log_warning ".claude symlink esistente punta a: $current_target"
            read -p "Sovrascrivere? [y/N] " -n 1 -r
            echo ""
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                rm "$PROJECT_ROOT/.claude"
                ln -s "ces/.claude" "$PROJECT_ROOT/.claude"
                log_success ".claude symlink aggiornato"
            fi
        fi
    else
        log_error ".claude esiste già come directory/file normale"
        log_error "Rinominare o rimuovere manualmente prima di procedere"
        exit 1
    fi
else
    ln -s "ces/.claude" "$PROJECT_ROOT/.claude"
    log_success ".claude symlink creato"
fi

# 2. Aggiornamento .gitignore
log_info "Configurando .gitignore..."

GITIGNORE_PATH="$PROJECT_ROOT/.gitignore"
GITIGNORE_MARKER="# CES Integration"

if [ -f "$GITIGNORE_PATH" ]; then
    if grep -q "$GITIGNORE_MARKER" "$GITIGNORE_PATH"; then
        log_success ".gitignore già configurato per CES"
    else
        log_info "Aggiornando .gitignore esistente..."
        cat >> "$GITIGNORE_PATH" << EOF

$GITIGNORE_MARKER
ces/
.claude/
ces-cli
*.ces.backup
.ces-*
EOF
        log_success ".gitignore aggiornato"
    fi
else
    log_info "Creando nuovo .gitignore..."
    cat > "$GITIGNORE_PATH" << EOF
$GITIGNORE_MARKER
ces/
.claude/
ces-cli
*.ces.backup
.ces-*

# Common ignores
node_modules/
.env
.env.local
*.log
.DS_Store
EOF
    log_success ".gitignore creato"
fi

# 3. Creazione wrapper script
log_info "Creando wrapper script..."

WRAPPER_PATH="$PROJECT_ROOT/ces-cli"
cat > "$WRAPPER_PATH" << 'EOF'
#!/bin/bash
# CES CLI Wrapper - Esegue CES dal progetto ospite
# Auto-generato da integrate.sh

# Rileva se siamo in modalità debug
if [ "$CES_DEBUG" = "true" ]; then
    set -x
fi

# Salva directory corrente
ORIGINAL_DIR="$(pwd)"

# Vai nella directory CES
cd "$(dirname "$0")/ces" || {
    echo "Errore: impossibile accedere alla directory ces/"
    exit 1
}

# Verifica che npm sia installato
if ! command -v npm &> /dev/null; then
    echo "Errore: npm non trovato. Installare Node.js prima di procedere."
    exit 1
fi

# Esegui comando CES
npm run dev -- "$@"
EXIT_CODE=$?

# Torna alla directory originale
cd "$ORIGINAL_DIR"

exit $EXIT_CODE
EOF

chmod +x "$WRAPPER_PATH"
log_success "Wrapper script creato: ces-cli"

# 4. Configurazione ambiente CES
log_info "Configurando ambiente CES..."

ENV_LOCAL_PATH="$CES_ROOT/.env.local"
cat > "$ENV_LOCAL_PATH" << EOF
# Configurazione locale per integrazione CES
# Auto-generata da integrate.sh
# Data: $(date)

# Modalità operativa
CES_OPERATION_MODE=integrated

# Percorsi progetto
CES_PROJECT_ROOT=$PROJECT_ROOT
CES_PROJECT_NAME=$PROJECT_NAME
CES_INTEGRATED_PATH=ces

# Directory Claude
CES_CLAUDE_DIR=$PROJECT_ROOT/.claude

# Logging
CES_LOG_PREFIX=[$PROJECT_NAME]

# Features integrate
CES_WATCH_PROJECT_FILES=true
CES_INCLUDE_PROJECT_CONTEXT=true
EOF

log_success "Configurazione ambiente creata"

# 5. Verifica installazione CES
log_info "Verificando installazione CES..."

if [ ! -d "$CES_ROOT/node_modules" ]; then
    log_warning "Dipendenze CES non installate"
    read -p "Installare ora? [Y/n] " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]] || [ -z "$REPLY" ]; then
        npm install
        log_success "Dipendenze installate"
    fi
fi

if [ ! -d "$CES_ROOT/.dist" ]; then
    log_warning "CES non compilato"
    read -p "Compilare ora? [Y/n] " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]] || [ -z "$REPLY" ]; then
        npm run build
        log_success "CES compilato"
    fi
fi

# 6. Test integrazione
log_info "Testando integrazione..."

cd "$PROJECT_ROOT"
if ./ces-cli --version > /dev/null 2>&1; then
    log_success "Test wrapper: OK"
else
    log_error "Test wrapper: FALLITO"
fi

if [ -L ".claude" ] && [ -e ".claude" ]; then
    log_success "Test symlink: OK"
else
    log_error "Test symlink: FALLITO"
fi

# 7. Istruzioni finali
echo ""
echo -e "${GREEN}════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Integrazione completata con successo!${NC}"
echo -e "${GREEN}════════════════════════════════════════════${NC}"
echo ""
echo "📚 Utilizzo:"
echo "   Dalla root del progetto ($PROJECT_NAME):"
echo "   ./ces-cli --help              # Mostra aiuto"
echo "   ./ces-cli start-session       # Avvia sessione"
echo "   ./ces-cli status              # Verifica stato"
echo ""
echo "🔧 Comandi utili:"
echo "   ./ces-cli config show         # Mostra configurazione"
echo "   ./ces-cli validate            # Valida installazione"
echo ""
echo "📁 Struttura:"
echo "   .claude/   → Symlink a ces/.claude/"
echo "   ces/       → Installazione CES isolata"
echo "   ces-cli    → Script wrapper per comandi"
echo ""
echo "🔄 Per disinstallare:"
echo "   rm .claude ces-cli"
echo "   rm -rf ces/"
echo "   # Rimuovere manualmente le righe CES da .gitignore"
echo ""
```

### 1.2 Rendi eseguibile lo script

```bash
chmod +x scripts/integrate.sh
```

## 🛠️ TASK 2: Modifica EnvironmentConfig.ts

### 2.1 Aggiorna `src/config/EnvironmentConfig.ts`

Sostituisci o modifica la classe esistente per supportare la modalità integrata:

```typescript
import * as path from 'path';
import * as fs from 'fs';
import { config } from 'dotenv';

export interface IntegrationConfig {
  mode: 'standalone' | 'integrated';
  projectRoot: string;
  cesRoot: string;
  operationRoot: string;
  claudeDir: string;
}

export class EnvironmentConfig {
  private static instance: EnvironmentConfig;
  private config: Record<string, any> = {};
  private integrationConfig: IntegrationConfig;
  
  private constructor() {
    this.loadEnvironment();
    this.detectIntegrationMode();
    this.loadConfiguration();
  }
  
  private loadEnvironment(): void {
    // Carica .env standard
    config({ path: '.env' });
    
    // Carica .env.local se in modalità integrata
    if (fs.existsSync('.env.local')) {
      config({ path: '.env.local', override: true });
    }
  }
  
  private detectIntegrationMode(): void {
    const mode = process.env.CES_OPERATION_MODE || 'standalone';
    const cesRoot = this.findCesRoot();
    
    if (mode === 'integrated') {
      // Modalità integrata
      const projectRoot = process.env.CES_PROJECT_ROOT || path.dirname(cesRoot);
      this.integrationConfig = {
        mode: 'integrated',
        cesRoot,
        projectRoot,
        operationRoot: projectRoot,
        claudeDir: process.env.CES_CLAUDE_DIR || path.join(projectRoot, '.claude')
      };
    } else {
      // Modalità standalone
      this.integrationConfig = {
        mode: 'standalone',
        cesRoot,
        projectRoot: cesRoot,
        operationRoot: cesRoot,
        claudeDir: path.join(cesRoot, '.claude')
      };
    }
    
    // Log modalità rilevata
    console.log(`[CES] Modalità operativa: ${this.integrationConfig.mode}`);
    if (this.integrationConfig.mode === 'integrated') {
      console.log(`[CES] Progetto ospite: ${path.basename(this.integrationConfig.projectRoot)}`);
    }
  }
  
  private findCesRoot(): string {
    let currentDir = __dirname;
    
    // Risali fino a trovare package.json con nome CES
    while (currentDir !== path.dirname(currentDir)) {
      const packagePath = path.join(currentDir, 'package.json');
      if (fs.existsSync(packagePath)) {
        try {
          const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
          if (pkg.name === 'claude-ecosystem-standard') {
            return currentDir;
          }
        } catch {}
      }
      currentDir = path.dirname(currentDir);
    }
    
    // Fallback
    return process.cwd();
  }
  
  // Metodi pubblici per accesso configurazione
  
  public getIntegrationMode(): 'standalone' | 'integrated' {
    return this.integrationConfig.mode;
  }
  
  public getProjectRoot(): string {
    return this.integrationConfig.projectRoot;
  }
  
  public getCesRoot(): string {
    return this.integrationConfig.cesRoot;
  }
  
  public getOperationRoot(): string {
    return this.integrationConfig.operationRoot;
  }
  
  public getClaudeDir(): string {
    return this.integrationConfig.claudeDir;
  }
  
  public getProjectPath(relativePath: string): string {
    // Risolve percorsi relativi al progetto ospite/operativo
    return path.join(this.integrationConfig.operationRoot, relativePath);
  }
  
  public getCesPath(relativePath: string): string {
    // Risolve percorsi relativi a CES
    return path.join(this.integrationConfig.cesRoot, relativePath);
  }
  
  public resolveWorkspacePath(inputPath: string): string {
    // Risolve percorsi intelligentemente basandosi sul contesto
    if (path.isAbsolute(inputPath)) {
      return inputPath;
    }
    
    // Se siamo in modalità integrata, i percorsi relativi sono relativi al progetto ospite
    if (this.integrationConfig.mode === 'integrated') {
      return path.join(this.integrationConfig.projectRoot, inputPath);
    }
    
    // Altrimenti relativi a CES
    return path.join(this.integrationConfig.cesRoot, inputPath);
  }
  
  // Metodo singleton
  public static getInstance(): EnvironmentConfig {
    if (!EnvironmentConfig.instance) {
      EnvironmentConfig.instance = new EnvironmentConfig();
    }
    return EnvironmentConfig.instance;
  }
  
  // Retrocompatibilità
  public get<T = any>(key: string): T {
    return this.config[key] as T;
  }
  
  public getConfig(): Record<string, any> {
    return { ...this.config };
  }
}

// Export singleton
export const envConfig = EnvironmentConfig.getInstance();
```

## 🛠️ TASK 3: Aggiorna SessionManager

### 3.1 Modifica `src/session/SessionManager.ts`

Aggiorna i percorsi per utilizzare la nuova configurazione:

```typescript
import { envConfig } from '../config/EnvironmentConfig.js';

export class SessionManager {
  private sessionDir: string;
  private claudeDir: string;
  
  constructor() {
    // Usa i percorsi dalla configurazione integrata
    this.claudeDir = envConfig.getClaudeDir();
    this.sessionDir = path.join(this.claudeDir, 'sessions');
    
    // Log percorsi utilizzati
    logger.info('SessionManager initialized', {
      mode: envConfig.getIntegrationMode(),
      claudeDir: this.claudeDir,
      sessionDir: this.sessionDir
    });
    
    this.ensureDirectories();
  }
  
  private ensureDirectories(): void {
    // Crea directory se non esistono
    if (!fs.existsSync(this.claudeDir)) {
      fs.mkdirSync(this.claudeDir, { recursive: true });
    }
    if (!fs.existsSync(this.sessionDir)) {
      fs.mkdirSync(this.sessionDir, { recursive: true });
    }
  }
  
  // Resto dei metodi aggiornati per usare i percorsi corretti...
}
```

## 🛠️ TASK 4: Test di Integrazione

### 4.1 Crea `scripts/test-integration.sh`

```bash
#!/bin/bash
# test-integration.sh - Test suite per integrazione CES

set -e

echo "🧪 Test Suite Integrazione CES"
echo "=============================="

# Test 1: Verifica struttura
echo -n "Test 1 - Struttura directory... "
if [ -L "../.claude" ] && [ -d ".claude" ]; then
    echo "✅ PASS"
else
    echo "❌ FAIL"
    exit 1
fi

# Test 2: Wrapper script
echo -n "Test 2 - Wrapper script... "
if [ -x "../ces-cli" ]; then
    echo "✅ PASS"
else
    echo "❌ FAIL"
    exit 1
fi

# Test 3: Configurazione ambiente
echo -n "Test 3 - File .env.local... "
if [ -f ".env.local" ] && grep -q "CES_OPERATION_MODE=integrated" .env.local; then
    echo "✅ PASS"
else
    echo "❌ FAIL"
    exit 1
fi

# Test 4: Comando version
echo -n "Test 4 - Comando version... "
if ../ces-cli --version > /dev/null 2>&1; then
    echo "✅ PASS"
else
    echo "❌ FAIL"
    exit 1
fi

# Test 5: Percorsi configurazione
echo -n "Test 5 - Percorsi config... "
OUTPUT=$(../ces-cli config show --section paths 2>/dev/null || true)
if echo "$OUTPUT" | grep -q "projectRoot"; then
    echo "✅ PASS"
else
    echo "❌ FAIL"
    exit 1
fi

echo ""
echo "✅ Tutti i test passati!"
```

### 4.2 Rendi eseguibile

```bash
chmod +x scripts/test-integration.sh
```

## 🛠️ TASK 5: Documentazione Utente

### 5.1 Crea `docs/INTEGRATION-GUIDE.md`

```markdown
# 📚 Guida Integrazione CES nei Progetti

## Installazione Rapida

```bash
# 1. Dal tuo progetto
cd my-awesome-project

# 2. Clona CES come subdirectory
git clone https://github.com/anthropics/claude-ecosystem-standard.git ces

# 3. Setup e integrazione
cd ces
npm install
npm run build
./scripts/integrate.sh

# 4. Inizia a usare CES
cd ..
./ces-cli start-session
```

## Struttura Post-Integrazione

```
your-project/
├── .claude/          → Link a ces/.claude (gestito da CES)
├── .gitignore        → Aggiornato per escludere CES
├── ces-cli           → Comando rapido per CES
├── src/              → Il tuo codice
└── ces/              → CES isolato (ignorato da git)
```

## Comandi Disponibili

Dal tuo progetto, usa `./ces-cli` seguito da qualsiasi comando CES:

- `./ces-cli start-session` - Avvia sessione Claude
- `./ces-cli status` - Verifica stato
- `./ces-cli --help` - Mostra tutti i comandi

## Disinstallazione

```bash
# Rimuovi integrazione
rm .claude ces-cli
rm -rf ces/
# Modifica .gitignore per rimuovere le righe CES
```

## FAQ

**D: Posso usare CES in più progetti?**
R: Sì! Ogni progetto avrà la sua copia isolata di CES.

**D: Come aggiorno CES?**
R: `cd ces && git pull && npm install && npm run build`

**D: Posso committare CES nel mio repo?**
R: No, è escluso automaticamente da .gitignore. CES va clonato separatamente.
```

## 📋 TASK 6: Validazione Finale

### 6.1 Checklist di Verifica

Dopo aver completato tutti i task, verifica:

- [ ] Script `integrate.sh` creato e funzionante
- [ ] `EnvironmentConfig.ts` aggiornato con supporto modalità integrata
- [ ] `SessionManager.ts` utilizza i percorsi corretti
- [ ] Test di integrazione passano tutti
- [ ] Documentazione utente completa
- [ ] `.claude` symlink funziona correttamente
- [ ] `ces-cli` wrapper esegue comandi
- [ ] Git ignora correttamente ces/ e .claude/
- [ ] Logging mostra modalità "integrated"
- [ ] Percorsi file puntano al progetto ospite

## 🚀 Comandi di Test Finali

Esegui questi comandi dalla root del progetto ospite per verificare:

```bash
# Verifica versione
./ces-cli --version

# Mostra configurazione
./ces-cli config show

# Valida installazione
./ces-cli validate

# Test sessione
./ces-cli start-session --dry-run
```

## 📝 Note per l'Implementatore

1. **Ordine di esecuzione**: Segui i task nell'ordine presentato
2. **Test incrementali**: Testa ogni componente dopo l'implementazione
3. **Backup**: Fai backup di EnvironmentConfig.ts prima di modificarlo
4. **Logging**: Aggiungi log per debug durante lo sviluppo
5. **Errori comuni**: 
   - Permessi file → usa chmod appropriati
   - Path relativi → testa da diverse directory
   - Symlink esistenti → gestisci casi di sovrascrittura

## 🎯 Risultato Atteso

Al completamento, CES sarà:
- ✅ Completamente isolato in `ces/`
- ✅ Funzionalmente integrato col progetto ospite
- ✅ Invisibile a Git del progetto ospite
- ✅ Facilmente aggiornabile e rimovibile
- ✅ Utilizzabile con semplice `./ces-cli`

---

**Implementa con cura ogni sezione e verifica i risultati. Buon lavoro! 🚀**