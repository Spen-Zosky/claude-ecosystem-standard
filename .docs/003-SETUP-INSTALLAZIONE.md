# 003 - SETUP E INSTALLAZIONE

## 🚀 Guida Completa Installazione CES v2.6.0 Enterprise

**Leggi dopo la configurazione enterprise** - Procedura pratica per installazione e setup completo.

### ⚡ Quick Setup (1 Minuto)

```bash
# 1. Clone del repository
git clone https://github.com/anthropics/claude-ecosystem-standard.git
cd claude-ecosystem-standard

# 2. Setup automatico enterprise
bash quick-setup.sh

# 3. Validazione sistema
npm run dev -- validate

# 4. Avvio sessione enterprise
**start session
```

### 🔧 Prerequisiti Sistema

#### 1. Ambiente Base

| Componente | Versione Minima | Versione Consigliata |
|------------|-----------------|---------------------|
| **Node.js** | 18.0.0 | 20.19.0+ |
| **npm** | 8.0.0 | 11.5.0+ |
| **Sistema** | Ubuntu 18.04+ | Ubuntu 22.04+ |
| **Memoria** | 2GB RAM | 4GB+ RAM |
| **Spazio** | 1GB libero | 5GB+ libero |

#### 2. Verifica Prerequisiti

```bash
# Controllo versioni
node --version    # >= v18.0.0
npm --version     # >= 8.0.0

# Controllo sistema
whoami           # utente corrente
pwd              # directory di lavoro
df -h .          # spazio disponibile
free -h          # memoria disponibile
```

### 📦 Installazione Node.js

#### Opzione 1: NodeSource (Raccomandato)

```bash
# 1. Setup repository NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# 2. Installazione Node.js 20 LTS
sudo apt install -y nodejs

# 3. Verifica installazione
node --version    # v20.x.x
npm --version     # 10.x.x+
```

#### Opzione 2: Node Version Manager (NVM)

```bash
# 1. Installazione NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# 2. Ricarica shell
source ~/.bashrc

# 3. Installazione Node.js
nvm install 20
nvm use 20
nvm alias default 20
```

#### Opzione 3: Snap Package

```bash
# Installazione via snap
sudo snap install node --classic
```

### 🏗️ Setup Progetto CES

#### 1. Clone Repository

```bash
# Metodo HTTPS
git clone https://github.com/anthropics/claude-ecosystem-standard.git

# Metodo SSH (per sviluppatori)
git clone git@github.com:anthropics/claude-ecosystem-standard.git

# Entra nella directory
cd claude-ecosystem-standard
```

#### 2. Installazione Dipendenze

```bash
# Installazione standard
npm install

# Se si verificano errori, utilizzare:
npm install --no-package-lock --force

# Installazione dipendenze development
npm install --include=dev
```

#### 3. Configurazione Ambiente

```bash
# Copia template configurazione
cp .env.template .env

# Genera configurazione enterprise
npm run dev -- config generate --enterprise

# Valida configurazione
npm run dev -- config validate
```

### 🔨 Compilazione e Build

#### Compilazione TypeScript

```bash
# Build completo
npm run build

# Build con watch mode
npm run build:watch

# Verifica build
ls dist/    # Dovrebbe contenere file .js compilati
```

#### Test Funzionalità

```bash
# Test sistema completo
npm test

# Test specifici
npm run test:unit
npm run test:integration

# Coverage test
npm run test:coverage
```

### ⚙️ Configurazione Enterprise

#### 1. Variabili Ambiente Core

```bash
# Configurazione minima enterprise
NODE_ENV=production
CES_VERSION=2.5.0
CES_PROJECT_NAME=claude-ecosystem-standard
CES_INSTANCE_ID=ces-prod-001

# Configurazione sicurezza
CES_ENABLE_AUTH=true
CES_JWT_SECRET=auto-generated-uuid
CES_CORS_ENABLED=true
```

#### 2. Configurazione Logging

```bash
# Logging enterprise
CES_LOG_LEVEL=info
CES_LOG_FORMAT=json
CES_LOG_MAX_FILES=10
CES_LOG_MAX_SIZE=50MB
```

#### 3. Configurazione Analytics

```bash
# Analytics enterprise
CES_ANALYTICS_ENABLED=true
CES_ANALYTICS_RETENTION_DAYS=90
CES_ANALYTICS_EXPORT_FORMAT=json
```

### 🧪 Validazione Installazione

#### 1. Test Base

```bash
# Help comandi
npm run dev -- --help

# Versione sistema
npm run dev -- version

# Status sistema
npm run dev -- status
```

#### 2. Test Componenti

```bash
# Test AI Session Management
npm run dev -- ai-session --insights

# Test Analytics System
npm run dev -- analytics --dashboard

# Test Cloud Integration
npm run dev -- cloud --status

# Test Quick Commands
npm run dev -- quick --list
```

#### 3. Validazione Completa

```bash
# Validazione enterprise completa
npm run dev -- validate --comprehensive

# Report validazione
npm run dev -- validate --report

# Diagnostica sistema
npm run dev -- diagnose
```

### 🐳 Setup Container (Opzionale)

#### Docker Setup

```bash
# Build immagine Docker
docker build -t ces-enterprise .

# Run container
docker run -d --name ces \
  -p 3000:3000 \
  -v $(pwd)/.claude:/app/.claude \
  ces-enterprise

# Verifica container
docker logs ces
```

#### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'
services:
  ces-enterprise:
    build: .
    ports:
      - "3000:3000"
    volumes:
      - ./.claude:/app/.claude
    environment:
      - NODE_ENV=production
      - CES_VERSION=2.5.0
```

### 🚀 Avvio Primo Utilizzo

#### 1. Inizializzazione Sistema

```bash
# Setup iniziale enterprise
npm run dev -- init --enterprise

# Creazione profilo utente
npm run dev -- profile create --name "enterprise-user"

# Setup ambiente development
npm run dev -- env setup --type development
```

#### 2. Avvio Sessione Claude Code

```bash
# Avvio sessione enterprise
**start session

# Verifica integrazione MCP
**status mcp

# Test integrazione
**test connection
```

#### 3. Configurazione Dashboard

```bash
# Avvio dashboard monitoring
npm run dev -- dashboard --start

# Configurazione dashboard
npm run dev -- dashboard --configure --port 3000

# Accesso dashboard
# Browser: http://localhost:3000
```

### 🔧 Risoluzione Problemi

#### Problemi Comuni

**1. "tsx: not found"**
```bash
npm install -g tsx
# oppure
npx tsx src/index.ts --help
```

**2. "Permission denied"**
```bash
sudo chown -R $USER:$USER ~/.npm
npm config set prefix '~/.npm-global'
export PATH=~/.npm-global/bin:$PATH
```

**3. "Module not found"**
```bash
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

**4. "TypeScript errors"**
```bash
npx tsc --noEmit --skipLibCheck
npm run build:force
```

#### Debug Mode

```bash
# Avvio in debug mode
DEBUG=ces:* npm run dev -- --debug

# Logging verboso
npm run dev -- --verbose --log-level debug

# Diagnostica problemi
npm run dev -- diagnose --full
```

### 📊 Verifica Setup Completo

#### Checklist Installazione

- [ ] **Node.js 18+** installato e funzionante
- [ ] **npm 8+** installato e configurato
- [ ] **Repository clonato** e dipendenze installate
- [ ] **Build TypeScript** completato senza errori
- [ ] **Test sistema** passano tutti
- [ ] **Configurazione .env** creata e validata
- [ ] **Claude Code CLI** integrato correttamente
- [ ] **MCP servers** configurati e funzionanti
- [ ] **Dashboard** accessibile e operativo

#### Test Finale

```bash
# Test completo funzionalità
npm run dev -- test-all

# Report stato sistema
npm run dev -- system-report

# Backup configurazione
npm run dev -- backup create --name "post-installation"
```

### 🎯 Prossimi Passi

Dopo completamento setup:

1. **004-CLI-REFERENCE** - Riferimento completo comandi CLI
2. **005-LOGGING-MONITORING** - Setup logging e monitoring avanzato
3. **006-DEPLOYMENT-PRODUZIONE** - Configurazione per ambiente production

### 📞 Supporto

Per problemi installazione:

- **GitHub Issues**: [Repository Issues](https://github.com/anthropics/claude-ecosystem-standard/issues)
- **Documentazione**: Controllare file `TROUBLESHOOTING.md`
- **Logs**: Verificare `.claude/logs/` per errori dettagliati

---

**📌 Setup Completato**: Il sistema CES v2.6.0 Enterprise è ora pronto per l'utilizzo production-ready.