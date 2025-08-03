# 003 - SETUP AND INSTALLATION

## 🚀 Complete CES v2.7.0 Enterprise Installation Guide

**Read after enterprise configuration** - Practical procedure for complete installation and setup.

### ⚡ Quick Setup (1 Minute)

```bash
# 1. Clone repository
git clone https://github.com/anthropics/claude-ecosystem-standard.git
cd claude-ecosystem-standard

# 2. Enterprise automatic setup
bash quick-setup.sh

# 3. System validation
npm run dev -- validate

# 4. 🆕 Configure Anthropic API (optional but recommended)
echo "ANTHROPIC_API_KEY=your-api-key-here" >> .env

# 5. Start enterprise session
**start session
```

### 🔧 System Prerequisites

#### 1. Base Environment

| Component | Minimum Version | Recommended Version |
|-----------|----------------|-------------------|
| **Node.js** | 18.0.0 | 20.19.0+ |
| **npm** | 8.0.0 | 11.5.0+ |
| **System** | Ubuntu 18.04+ | Ubuntu 22.04+ |
| **Memory** | 2GB RAM | 4GB+ RAM |
| **Storage** | 1GB free | 5GB+ free |

#### 2. Prerequisites Verification

```bash
# Version checks
node --version    # >= v18.0.0
npm --version     # >= 8.0.0

# System checks
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

# 2. Install Node.js 20 LTS
sudo apt install -y nodejs

# 3. Verify installation
node --version    # v20.x.x
npm --version     # 10.x.x+
```

#### Option 2: Node Version Manager (NVM)

```bash
# 1. Install NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# 2. Reload shell
source ~/.bashrc

# 3. Install Node.js
nvm install 20
nvm use 20
nvm alias default 20
```

#### Option 3: Snap Package

```bash
# Install via snap
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

# Install development dependencies
npm install --include=dev
```

#### 3. Environment Configuration

```bash
# Copy configuration template
cp .env.template .env

# Generate enterprise configuration
npm run dev -- config generate --enterprise

# 🆕 Add Anthropic API key (recommended)
echo "ANTHROPIC_API_KEY=your-anthropic-api-key" >> .env
echo "CES_ANTHROPIC_MODEL=claude-3-sonnet-20240229" >> .env

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

# Verify build
ls .dist/    # Should contain compiled .js files
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
# Minimal enterprise configuration
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

#### 4. 🆕 Anthropic SDK Configuration ✨ NEW in v2.7.0

```bash
# Anthropic AI configuration
ANTHROPIC_API_KEY=your-api-key-here          # Required for AI features
CES_ANTHROPIC_MODEL=claude-3-sonnet-20240229 # Default Claude model
CES_ANTHROPIC_MAX_TOKENS=4096                # Maximum tokens per request
CES_ANTHROPIC_TEMPERATURE=0.7                # Response creativity (0.0-1.0)
CES_ANTHROPIC_TIMEOUT=30000                  # Request timeout (30 seconds)
CES_ANTHROPIC_MAX_RETRIES=2                  # Maximum retry attempts
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

# 🆕 Test Anthropic integration
npm run dev -- ai ask "Hello, can you help me test the integration?"

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

### 🆕 Anthropic API Setup ✨ NEW in v2.7.0

#### 1. Get API Key

1. Visit [Anthropic Console](https://console.anthropic.com/)
2. Create account or sign in
3. Generate API key
4. Copy the key for configuration

#### 2. Configure API Key

```bash
# Method 1: Environment variable
export ANTHROPIC_API_KEY=your-api-key-here

# Method 2: Add to .env file
echo "ANTHROPIC_API_KEY=your-api-key-here" >> .env

# Method 3: Interactive configuration
npm run dev -- config edit
```

#### 3. Test Anthropic Integration

```bash
# Test basic API connection
npm run dev -- ai ask "Hello from CES v2.7.0!"

# Test streaming responses
npm run dev -- ai ask --stream "Explain TypeScript interfaces"

# Test code analysis
npm run dev -- ai analyze src/index.ts --type security

# Test interactive chat
npm run dev -- ai chat
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
  -e ANTHROPIC_API_KEY=your-api-key \
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
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
```

### 🚀 First Use Startup

#### 1. System Initialization

```bash
# Enterprise initial setup
npm run dev -- init --enterprise

# Create user profile
npm run dev -- profile create --name "enterprise-user"

# Setup development environment
npm run dev -- env setup --type development
```

#### 2. Claude Code Session Startup

```bash
# Start enterprise session
**start session

# Verify MCP integration
**status mcp

# Test integration
**test connection
```

#### 3. Dashboard Configuration

```bash
# Start monitoring dashboard
npm run dev -- dashboard --start

# Configure dashboard
npm run dev -- dashboard --configure --port 3000

# Access dashboard
# Browser: http://localhost:3000
```

### 🔧 Troubleshooting

#### Common Problems

**1. "tsx: not found"**
```bash
npm install -g tsx
# or
npx tsx .src/index.ts --help
```

**2. "Permission denied"**
```bash
sudo chown -R $USER:$USER ~/.npm
npm config set prefix '~/.npm-global'
export PATH=~/.npm-global/bin:$PATH
```

**3. "Module not found"**
```bash
rm -rf .node_modules package-lock.json
npm cache clean --force
npm install
```

**4. "TypeScript errors"**
```bash
npx tsc --noEmit --skipLibCheck
npm run build:force
```

**5. 🆕 "Anthropic API errors"**
```bash
# Check API key
npm run dev -- config show --section=anthropic

# Test API connection
npm run dev -- ai stats

# Verify model availability
npm run dev -- ai ask --model claude-3-haiku-20240307 "Test"
```

#### Debug Mode

```bash
# Start in debug mode
DEBUG=ces:* npm run dev -- --debug

# Verbose logging
npm run dev -- --verbose --log-level debug

# Full diagnostics
npm run dev -- diagnose --full
```

### 📊 Complete Setup Verification

#### Installation Checklist

- [ ] **Node.js 18+** installed and working
- [ ] **npm 8+** installed and configured
- [ ] **Repository cloned** and dependencies installed
- [ ] **TypeScript build** completed without errors
- [ ] **System tests** all passing
- [ ] **Configuration .env** created and validated
- [ ] **🆕 Anthropic API** configured and tested
- [ ] **Claude Code CLI** integrated correctly
- [ ] **MCP servers** configured and working
- [ ] **Dashboard** accessible and operational

#### Final Test

```bash
# Complete functionality test
npm run dev -- test-all

# System status report
npm run dev -- system-report

# 🆕 AI functionality test
npm run dev -- ai ask "Generate a simple TypeScript function"

# Configuration backup
npm run dev -- backup create --name "post-installation"
```

### 🎯 Next Steps

After setup completion:

1. **004-CLI-REFERENCE** - Complete CLI commands reference
2. **005-LOGGING-MONITORING** - Advanced logging and monitoring setup
3. **006-DEPLOYMENT-PRODUCTION** - Production environment configuration
4. **🆕 Anthropic Usage Examples** - See examples/anthropic-usage.ts

### 📞 Support

For installation problems:

- **GitHub Issues**: [Repository Issues](https://github.com/anthropics/claude-ecosystem-standard/issues)
- **Documentation**: Check `TROUBLESHOOTING.md` file
- **Logs**: Check `.claude/logs/` for detailed errors
- **🆕 Anthropic Support**: [Anthropic Documentation](https://docs.anthropic.com/)

### 🆕 Integration Mode Setup ✨ NEW in v2.7.0

#### Installing CES as Subdirectory

```bash
# In your existing project
mkdir ces
cd ces
git clone https://github.com/anthropics/claude-ecosystem-standard.git .

# Set integration mode
echo "CES_OPERATION_MODE=integrated" >> .env
echo "CES_PROJECT_ROOT=$(dirname $(pwd))" >> .env

# Install and configure
npm install
npm run build
npm run dev -- validate
```

#### Standalone Installation

```bash
# Traditional standalone installation
git clone https://github.com/anthropics/claude-ecosystem-standard.git
cd claude-ecosystem-standard

# Standalone mode is automatic
npm install
npm run build
npm run dev -- validate
```

---

**📌 Setup Complete**: The CES v2.7.0 Enterprise system is now ready for production-ready use with **🆕 native Anthropic AI capabilities**.