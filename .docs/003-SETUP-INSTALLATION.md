# 003 - SETUP AND INSTALLATION

## 🚀 Complete Installation Guide CES v2.7.0 Enterprise

**Read after enterprise configuration** - Practical procedure for complete installation and setup.

### ⚡ Quick Setup (1 Minute)

```bash
# 1. Repository clone
git clone https://github.com/anthropics/claude-ecosystem-standard.git
cd claude-ecosystem-standard

# 2. Automatic enterprise setup
bash quick-setup.sh

# 3. System validation
npm run dev -- validate

# 4. Enterprise session startup
**start session
```

### 🔧 System Prerequisites

#### 1. Base Environment

| Component | Minimum Version | Recommended Version |
|-----------|----------------|---------------------|
| **Node.js** | 18.0.0 | 20.19.0+ |
| **npm** | 8.0.0 | 11.5.0+ |
| **System** | Ubuntu 18.04+ | Ubuntu 22.04+ |
| **Memory** | 2GB RAM | 4GB+ RAM |
| **Space** | 1GB free | 5GB+ free |

#### 2. Prerequisites Verification

```bash
# Version check
node --version    # >= v18.0.0
npm --version     # >= 8.0.0

# System check
whoami           # current user
pwd              # working directory
df -h .          # available space
free -h          # available memory
```

### 📦 Node.js Installation

#### Option 1: NodeSource (Recommended)

```bash
# 1. Setup NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# 2. Node.js 20 LTS installation
sudo apt install -y nodejs

# 3. Installation verification
node --version    # v20.x.x
npm --version     # 10.x.x+
```

#### Option 2: Node Version Manager (NVM)

```bash
# 1. NVM installation
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# 2. Reload shell
source ~/.bashrc

# 3. Node.js installation
nvm install 20
nvm use 20
nvm alias default 20
```

#### Option 3: Snap Package

```bash
# Installation via snap
sudo snap install node --classic
```

### 🏗️ CES Project Setup

#### 1. Repository Clone

```bash
# HTTPS method
git clone https://github.com/anthropics/claude-ecosystem-standard.git

# SSH method (for developers)
git clone git@github.com:anthropics/claude-ecosystem-standard.git

# Enter directory
cd claude-ecosystem-standard
```

#### 2. Dependencies Installation

```bash
# Standard installation
npm install

# If errors occur, use:
npm install --no-package-lock --force

# Development dependencies installation
npm install --include=dev
```

#### 3. Environment Configuration

```bash
# Copy configuration template
cp .env.template .env

# Generate enterprise configuration
npm run dev -- config generate --enterprise

# Validate configuration
npm run dev -- config validate
```

### 🔨 Compilation and Build

#### TypeScript Compilation

```bash
# Complete build
npm run build

# Build with watch mode
npm run build:watch

# Build verification
ls dist/    # Should contain compiled .js files
```

#### Functionality Testing

```bash
# Complete system test
npm test

# Specific tests
npm run test:unit
npm run test:integration

# Test coverage
npm run test:coverage
```

### ⚙️ Enterprise Configuration

#### 1. Core Environment Variables

```bash
# Minimum enterprise configuration
NODE_ENV=production
CES_VERSION=2.7.0
CES_PROJECT_NAME=claude-ecosystem-standard
CES_INSTANCE_ID=ces-prod-001

# Security configuration
CES_ENABLE_AUTH=true
CES_JWT_SECRET=auto-generated-uuid
CES_CORS_ENABLED=true
```

#### 2. Logging Configuration

```bash
# Enterprise logging
CES_LOG_LEVEL=info
CES_LOG_FORMAT=json
CES_LOG_MAX_FILES=10
CES_LOG_MAX_SIZE=50MB
```

#### 3. Analytics Configuration

```bash
# Enterprise analytics
CES_ANALYTICS_ENABLED=true
CES_ANALYTICS_RETENTION_DAYS=90
CES_ANALYTICS_EXPORT_FORMAT=json
```

### 🧪 Installation Validation

#### 1. Base Tests

```bash
# Command help
npm run dev -- --help

# System version
npm run dev -- version

# System status
npm run dev -- status
```

#### 2. Component Tests

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

#### 3. Complete Validation

```bash
# Complete enterprise validation
npm run dev -- validate --comprehensive

# Validation report
npm run dev -- validate --report

# System diagnostics
npm run dev -- diagnose
```

### 🐳 Container Setup (Optional)

#### Docker Setup

```bash
# Build Docker image
docker build -t ces-enterprise .

# Run container
docker run -d --name ces \
  -p 3000:3000 \
  -v $(pwd)/.claude:/app/.claude \
  ces-enterprise

# Verify container
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
      - CES_VERSION=2.7.0
```

### 🚀 First Usage Startup

#### 1. System Initialization

```bash
# Initial enterprise setup
npm run dev -- init --enterprise

# User profile creation
npm run dev -- profile create --name "enterprise-user"

# Development environment setup
npm run dev -- env setup --type development
```

#### 2. Claude Code Session Startup

```bash
# Enterprise session startup
**start session

# MCP integration verification
**status mcp

# Integration test
**test connection
```

#### 3. Dashboard Configuration

```bash
# Dashboard monitoring startup
npm run dev -- dashboard --start

# Dashboard configuration
npm run dev -- dashboard --configure --port 3000

# Dashboard access
# Browser: http://localhost:3000
```

### 🔧 Troubleshooting

#### Common Issues

**1. "tsx: not found"**
```bash
npm install -g tsx
# or
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
# Debug mode startup
DEBUG=ces:* npm run dev -- --debug

# Verbose logging
npm run dev -- --verbose --log-level debug

# Problem diagnostics
npm run dev -- diagnose --full
```

### 📊 Complete Setup Verification

#### Installation Checklist

- [ ] **Node.js 18+** installed and working
- [ ] **npm 8+** installed and configured
- [ ] **Repository cloned** and dependencies installed
- [ ] **Build TypeScript** completed without errors
- [ ] **Test sistema** all pass
- [ ] **Configurazione .env** created and validated
- [ ] **Claude Code CLI** correctly integrated
- [ ] **MCP servers** configured and working
- [ ] **Dashboard** accessible and operational

#### Final Test

```bash
# Complete functionality test
npm run dev -- test-all

# System status report
npm run dev -- system-report

# Configuration backup
npm run dev -- backup create --name "post-installation"
```

### 🎯 Next Steps

After setup completion:

1. **004-CLI-REFERENCE** - Complete CLI commands reference
2. **005-LOGGING-MONITORING** - Advanced logging and monitoring setup
3. **006-DEPLOYMENT-PRODUZIONE** - Production environment configuration

### 📞 Support

For installation issues:

- **GitHub Issues**: [Repository Issues](https://github.com/anthropics/claude-ecosystem-standard/issues)
- **Documentation**: Check file `TROUBLESHOOTING.md`
- **Logs**: Check `.claude/logs/` for detailed errors

---

**📌 Setup Complete**: The CES v2.7.0 Enterprise system is now ready for production-ready usage.