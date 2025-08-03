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

if [ ! -d "$CES_ROOT/.node_modules" ]; then
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