# 🔧 Troubleshooting Guide - CES v2.7.0

**Claude Ecosystem Standard v2.7.0 Enterprise Edition** - Comprehensive troubleshooting guide with Anthropic AI integration support

## Table of Contents

- [Quick Diagnosis](#quick-diagnosis)
- [System Issues](#system-issues)
- [AI Integration Issues](#ai-integration-issues)
- [Configuration Problems](#configuration-problems)
- [Performance Issues](#performance-issues)
- [Network & Connectivity](#network--connectivity)
- [Session Management](#session-management)
- [Error Reference](#error-reference)
- [Recovery Procedures](#recovery-procedures)

## Quick Diagnosis

### 🚀 Fast Health Check

```bash
# Quick system status
npm run dev -- status

# Comprehensive validation
npm run dev -- validate --verbose

# AI integration check (NEW v2.7.0)
npm run dev -- ai config test

# View recent errors
tail -50 .ces.logs/ces-error.log
```

### 🎯 Common Quick Fixes

```bash
# Restart with fresh state
npm run dev -- clean-reset --preserve-sessions

# Clear caches
rm -rf .ces.cache/* node_modules/.cache/*

# Rebuild TypeScript
npm run build

# Reset configuration
npm run dev -- config reset
```

## System Issues

### 1. Installation Problems

#### CES Won't Install

**Symptoms**: Installation script fails, missing dependencies

**Diagnosis**:
```bash
# Check system requirements
node --version    # Should be >= 18.0.0
npm --version     # Should be >= 8.0.0
git --version     # Should be >= 2.0.0

# Check permissions
ls -la ./
whoami
```

**Solutions**:
```bash
# Update Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Fix permissions
sudo chown -R $USER:$USER ./
chmod +x *.sh

# Clean install
rm -rf node_modules package-lock.json
npm install
```

#### Claude Code CLI Missing

**Symptoms**: `claude` command not found

**Diagnosis**:
```bash
which claude
claude --version
echo $PATH
```

**Solutions**:
```bash
# Install Claude Code CLI
npm install -g @anthropic-ai/claude-code

# Verify installation
claude --version

# Add to PATH if needed
echo 'export PATH=$PATH:/usr/local/bin' >> ~/.bashrc
source ~/.bashrc
```

### 2. TypeScript Build Issues

#### Compilation Errors

**Symptoms**: `npm run build` fails, TypeScript errors

**Diagnosis**:
```bash
# Check TypeScript version
npx tsc --version

# Run type checking
npm run type-check

# Check for conflicting versions
npm ls typescript
```

**Solutions**:
```bash
# Clean build
rm -rf dist/
npm run build

# Fix version conflicts
npm install typescript@5.3.3 --save-dev

# Check tsconfig.json
npm run dev -- config validate
```

#### Import/Export Issues

**Symptoms**: Module resolution errors, import failures

**Diagnosis**:
```bash
# Check module resolution
node -e "console.log(require.resolve('./dist/index.js'))"

# Verify file extensions
find .src/ -name "*.ts" -exec grep -l "from.*\.js'" {} \;
```

**Solutions**:
```bash
# Ensure .js extensions in imports
# Bad:  import { foo } from './utils'
# Good: import { foo } from './utils.js'

# Check tsconfig.json module settings
cat tsconfig.json | jq '.compilerOptions.module'
```

### 3. Runtime Errors

#### Application Won't Start

**Symptoms**: Process exits immediately, startup failures

**Diagnosis**:
```bash
# Check startup logs
npm run dev 2>&1 | tee startup.log

# Check port conflicts
lsof -i :3000
lsof -i :3001
lsof -i :3002

# Check environment
env | grep CES_
```

**Solutions**:
```bash
# Kill conflicting processes
pkill -f "node.*ces"

# Use different ports
export CES_DEFAULT_PORT=3010
export CES_MONITOR_PORT=3011
export CES_DASHBOARD_PORT=3012

# Check configuration
npm run dev -- config show
```

## AI Integration Issues (NEW v2.7.0)

### 1. API Key Problems

#### API Key Not Found

**Symptoms**: "Anthropic API key not found" error

**Diagnosis**:
```bash
# Check environment variable
echo $ANTHROPIC_API_KEY

# Check .env file
grep ANTHROPIC_API_KEY .env

# Verify key format
if [[ $ANTHROPIC_API_KEY =~ ^sk-ant-api03- ]]; then
    echo "✅ Key format valid"
else
    echo "❌ Invalid key format"
fi
```

**Solutions**:
```bash
# Set environment variable
export ANTHROPIC_API_KEY=your-api-key-here

# Add to .env file
echo "ANTHROPIC_API_KEY=your-api-key-here" >> .env

# Restart application
npm run dev -- start-session
```

#### Invalid API Key

**Symptoms**: "Invalid API key" errors from Anthropic API

**Diagnosis**:
```bash
# Test API key directly
curl -H "Authorization: Bearer $ANTHROPIC_API_KEY" \
     -H "Content-Type: application/json" \
     https://api.anthropic.com/v1/messages

# Check key permissions
npm run dev -- ai config test
```

**Solutions**:
```bash
# Get new API key from Anthropic Console
# Visit: https://console.anthropic.com/

# Verify key in different environment
ANTHROPIC_API_KEY=new-key npm run dev -- ai ask "test"

# Update key in all environments
# Update .env, .env.production, etc.
```

### 2. API Connectivity Issues

#### Network Connection Failed

**Symptoms**: "Network request failed", timeouts, connection errors

**Diagnosis**:
```bash
# Check internet connectivity
ping -c 4 api.anthropic.com

# Check DNS resolution
nslookup api.anthropic.com

# Test HTTPS connectivity
curl -I https://api.anthropic.com

# Check proxy settings
echo $HTTP_PROXY
echo $HTTPS_PROXY
```

**Solutions**:
```bash
# Configure proxy if needed
export HTTPS_PROXY=http://proxy.company.com:8080

# Increase timeout
export CES_ANTHROPIC_TIMEOUT=60000

# Check firewall rules
sudo ufw status
```

#### Rate Limiting

**Symptoms**: "Rate limit exceeded" errors

**Diagnosis**:
```bash
# Check current usage
npm run dev -- ai stats

# Monitor request rate
grep "AnthropicSDK" .ces.logs/ces-combined.log | grep -c "$(date +%Y-%m-%d)"
```

**Solutions**:
```bash
# Reduce batch size
export CES_AI_BATCH_ANALYSIS_SIZE=2

# Add request delays
export CES_AI_REQUEST_DELAY=2000

# Implement exponential backoff
export CES_ANTHROPIC_MAX_RETRIES=5
```

### 3. Token and Cost Issues

#### Token Limit Exceeded

**Symptoms**: "Token limit exceeded" errors

**Diagnosis**:
```bash
# Check token usage
npm run dev -- ai stats

# Check model limits
npm run dev -- ai config models

# Review recent requests
grep "totalTokens" .ces.logs/ces-combined.log | tail -10
```

**Solutions**:
```bash
# Reduce max tokens per request
export CES_ANTHROPIC_MAX_TOKENS=2048

# Clear conversation history
npm run dev -- ai chat --clear-history

# Use more efficient model
export CES_ANTHROPIC_MODEL=claude-3-haiku-20240307
```

#### High Costs

**Symptoms**: Unexpected high API costs

**Diagnosis**:
```bash
# Review cost breakdown
npm run dev -- ai stats --format json | jq '.costBreakdown'

# Check daily usage
grep "cost" .ces.logs/ces-combined.log | grep "$(date +%Y-%m-%d)"

# Monitor token usage by command
grep -E "(ai ask|ai analyze|ai generate)" .ces.logs/ces-combined.log
```

**Solutions**:
```bash
# Set daily budget
export CES_AI_TOKEN_BUDGET_DAILY=50000

# Enable cost alerts
export CES_AI_COST_ALERT_THRESHOLD=25.00

# Use auto-clear conversation
export CES_AI_AUTO_CLEAR_CONVERSATION=true
```

### 4. AI Response Issues

#### No Response or Timeout

**Symptoms**: Commands hang, no response from AI

**Diagnosis**:
```bash
# Check API status
curl -s https://status.anthropic.com/api/v2/status.json | jq '.status.indicator'

# Test with minimal request
npm run dev -- ai ask "test" --max-tokens 1

# Check request logs
grep "AnthropicSDK.*complete" .ces.logs/ces-combined.log | tail -5
```

**Solutions**:
```bash
# Increase timeout
export CES_ANTHROPIC_TIMEOUT=120000

# Try different model
npm run dev -- ai ask "test" --model claude-3-haiku-20240307

# Restart AI integration
npm run dev -- start-session
```

#### Poor Response Quality

**Symptoms**: Inconsistent or low-quality AI responses

**Diagnosis**:
```bash
# Check temperature setting
npm run dev -- config show | grep TEMPERATURE

# Review conversation history
npm run dev -- ai chat
# Type: history
```

**Solutions**:
```bash
# Adjust temperature for more focused responses
export CES_ANTHROPIC_TEMPERATURE=0.3

# Use higher-capability model
export CES_ANTHROPIC_MODEL=claude-3-opus-20240229

# Clear conversation history for fresh context
npm run dev -- ai chat --clear-history
```

## Configuration Problems

### 1. Environment Variables

#### Missing Configuration

**Symptoms**: Default values used, features not working

**Diagnosis**:
```bash
# Check all CES environment variables
env | grep CES_ | sort

# Validate configuration
npm run dev -- config validate

# Check configuration source
npm run dev -- config show --verbose
```

**Solutions**:
```bash
# Copy template
cp .env.template .env

# Set required variables
export NODE_ENV=development
export CES_PROJECT_NAME=your-project

# Reload configuration
npm run dev -- config reload
```

#### Configuration Conflicts

**Symptoms**: Unexpected behavior, overridden settings

**Diagnosis**:
```bash
# Check configuration precedence
npm run dev -- config show --section all --verbose

# Find duplicate variables
env | grep CES_ | cut -d= -f1 | sort | uniq -d

# Check multiple .env files
ls -la .env*
```

**Solutions**:
```bash
# Remove conflicting files
mv .env.local .env.local.backup

# Check .bashrc/.zshrc for conflicting exports
grep CES_ ~/.bashrc ~/.zshrc

# Reset to defaults
npm run dev -- config reset
```

### 2. Path Resolution

#### Project Root Not Found

**Symptoms**: "Project root not detected", path errors

**Diagnosis**:
```bash
# Check current directory
pwd
ls -la package.json

# Test path detection
node -e "console.log(require('./dist/utils/PathResolver.js').getProjectRoot())"
```

**Solutions**:
```bash
# Run from correct directory
cd /path/to/claude-ecosystem-standard

# Verify package.json
grep '"name".*claude-ecosystem-standard' package.json

# Force project root
export CES_PROJECT_ROOT=$(pwd)
```

#### Permission Issues

**Symptoms**: "Permission denied" errors, can't create directories

**Diagnosis**:
```bash
# Check permissions
ls -la .ces-*
whoami
groups

# Check directory creation
mkdir -p .ces-test && rm -rf .ces-test
```

**Solutions**:
```bash
# Fix ownership
sudo chown -R $USER:$USER .

# Fix permissions
chmod 755 .
chmod -R 755 .ces-*

# Create missing directories
mkdir -p .ces-logs .ces-data .ces-cache .ces-temp
```

## Performance Issues

### 1. Slow Startup

#### Long Initialization Time

**Symptoms**: Slow `npm run dev` startup

**Diagnosis**:
```bash
# Profile startup time
time npm run dev -- --help

# Check dependency loading
npm run dev -- --verbose 2>&1 | grep -E "(Loading|Initializing)"

# Check disk I/O
iotop -a -o -d 1
```

**Solutions**:
```bash
# Clear caches
npm run dev -- clean-reset --preserve-sessions

# Optimize TypeScript compilation
export TS_NODE_TRANSPILE_ONLY=true

# Reduce log level
export CES_LOG_LEVEL=warn
```

### 2. Memory Issues

#### High Memory Usage

**Symptoms**: Out of memory errors, system slowness

**Diagnosis**:
```bash
# Monitor memory usage
ps aux | grep node
top -p $(pgrep -f "ces")

# Check Node.js memory
node --max-old-space-size=4096 dist/index.js
```

**Solutions**:
```bash
# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"

# Clear conversation history
export CES_AI_AUTO_CLEAR_CONVERSATION=true

# Reduce session cache
export CES_SESSION_CLEANUP_INTERVAL=60000
```

#### Memory Leaks

**Symptoms**: Gradual memory increase, eventual crashes

**Diagnosis**:
```bash
# Monitor memory over time
while true; do
    ps -o pid,vsz,rss,comm -p $(pgrep -f "ces")
    sleep 60
done

# Use memory profiling
node --inspect --inspect-brk dist/index.js
```

**Solutions**:
```bash
# Restart periodically
# Add to crontab: 0 */6 * * * pm2 restart ces

# Limit conversation history
export CES_AI_CONVERSATION_HISTORY_LIMIT=10

# Enable garbage collection logging
export NODE_OPTIONS="--gc-interval"
```

### 3. AI Performance

#### Slow AI Responses

**Symptoms**: Long wait times for AI commands

**Diagnosis**:
```bash
# Check response times
grep "duration" .ces.logs/ces-performance.log | grep "AnthropicSDK"

# Test with different models
npm run dev -- ai ask "test" --model claude-3-haiku-20240307

# Check network latency
ping -c 10 api.anthropic.com
```

**Solutions**:
```bash
# Use faster model for simple tasks
export CES_ANTHROPIC_MODEL=claude-3-haiku-20240307

# Reduce token count
export CES_ANTHROPIC_MAX_TOKENS=1024

# Enable streaming for better UX
npm run dev -- ai ask "question" --stream
```

## Network & Connectivity

### 1. Port Conflicts

#### Ports Already in Use

**Symptoms**: "Port already in use" errors

**Diagnosis**:
```bash
# Check port usage
lsof -i :3000
lsof -i :3001
lsof -i :3002

# Find CES processes
ps aux | grep ces
```

**Solutions**:
```bash
# Kill conflicting processes
pkill -f "node.*ces"

# Use different ports
export CES_DEFAULT_PORT=3010
export CES_MONITOR_PORT=3011
export CES_DASHBOARD_PORT=3012

# Auto-find free ports
npm run dev -- --auto-port
```

### 2. Proxy Issues

#### Corporate Proxy

**Symptoms**: Network requests fail in corporate environment

**Diagnosis**:
```bash
# Check proxy settings
echo $HTTP_PROXY
echo $HTTPS_PROXY
echo $NO_PROXY

# Test direct connection
curl --noproxy '*' https://api.anthropic.com
```

**Solutions**:
```bash
# Configure proxy
export HTTPS_PROXY=http://proxy.company.com:8080
export HTTP_PROXY=http://proxy.company.com:8080

# Add exceptions
export NO_PROXY=localhost,127.0.0.1,.local

# Configure npm proxy
npm config set proxy http://proxy.company.com:8080
npm config set https-proxy http://proxy.company.com:8080
```

### 3. Firewall Issues

#### Blocked Connections

**Symptoms**: Connection timeouts, blocked requests

**Diagnosis**:
```bash
# Check firewall status
sudo ufw status
sudo iptables -L

# Test connectivity
telnet api.anthropic.com 443
```

**Solutions**:
```bash
# Allow required ports
sudo ufw allow out 443
sudo ufw allow out 80

# Allow specific domains
# Configure firewall to allow api.anthropic.com

# Test with different network
# Try mobile hotspot to isolate network issues
```

## Session Management

### 1. Session State Issues

#### Corrupted Session

**Symptoms**: Session won't start, state inconsistencies

**Diagnosis**:
```bash
# Check session files
ls -la .ces.session/
cat .ces.session/current-session.json

# Validate session structure
npm run dev -- status --detailed
```

**Solutions**:
```bash
# Reset session state
rm -f .ces.session/current-session.json

# Clean session directory
npm run dev -- clean-reset --preserve-logs

# Start fresh session
npm run dev -- start-session
```

#### Session Won't Close

**Symptoms**: `close-session` hangs or fails

**Diagnosis**:
```bash
# Check session processes
ps aux | grep "session"

# Check lock files
ls -la .ces.session/*.lock

# Review session logs
grep "close-session" .ces.logs/ces-combined.log
```

**Solutions**:
```bash
# Force close
npm run dev -- close-session --force

# Remove lock files
rm -f .ces.session/*.lock

# Kill session processes
pkill -f "session-manager"
```

### 2. Checkpoint Issues

#### Checkpoint Creation Failed

**Symptoms**: Checkpoint commands fail, no checkpoint created

**Diagnosis**:
```bash
# Check disk space
df -h .

# Check permissions
ls -la .ces.session/checkpoints/

# Review checkpoint logs
grep "checkpoint" .ces.logs/ces-combined.log
```

**Solutions**:
```bash
# Free disk space
npm run dev -- clean-reset --preserve-sessions

# Fix permissions
chmod -R 755 .ces.session/

# Create checkpoint manually
npm run dev -- checkpoint-session --name "manual-$(date +%s)"
```

## Error Reference

### 1. System Errors

#### `ENOENT: no such file or directory`

**Cause**: Missing files or directories
**Solution**:
```bash
# Reinstall dependencies
rm -rf node_modules
npm install

# Rebuild project
npm run build

# Create missing directories
mkdir -p .ces-logs .ces-data .ces-cache
```

#### `EACCES: permission denied`

**Cause**: Insufficient file permissions
**Solution**:
```bash
# Fix ownership
sudo chown -R $USER:$USER .

# Fix permissions
chmod -R 755 .ces-*
```

#### `EADDRINUSE: address already in use`

**Cause**: Port conflicts
**Solution**:
```bash
# Find and kill conflicting process
lsof -ti:3000 | xargs kill -9

# Use different port
export CES_DEFAULT_PORT=3010
```

### 2. TypeScript Errors

#### `Cannot find module` or `Module not found`

**Cause**: Import path issues, missing dependencies
**Solution**:
```bash
# Check import paths use .js extension
# Fix: import { foo } from './utils.js'

# Reinstall dependencies
npm install

# Check tsconfig.json module resolution
```

#### `Type 'X' is not assignable to type 'Y'`

**Cause**: Type mismatches
**Solution**:
```bash
# Check type definitions
npm run type-check

# Update @types packages
npm update @types/*

# Check interface definitions
```

### 3. AI Integration Errors

#### `Anthropic API key not found`

**Cause**: Missing API key configuration
**Solution**:
```bash
export ANTHROPIC_API_KEY=your-api-key-here
echo "ANTHROPIC_API_KEY=your-key" >> .env
```

#### `Rate limit exceeded`

**Cause**: Too many API requests
**Solution**:
```bash
# Reduce request frequency
export CES_AI_BATCH_ANALYSIS_SIZE=2

# Implement delays
export CES_AI_REQUEST_DELAY=2000
```

#### `Token limit exceeded`

**Cause**: Request exceeds model token limits
**Solution**:
```bash
# Reduce max tokens
export CES_ANTHROPIC_MAX_TOKENS=2048

# Split large requests
# Use smaller code chunks for analysis
```

## Recovery Procedures

### 1. Emergency Reset

#### Complete System Reset

```bash
#!/bin/bash
# emergency-reset.sh

echo "🚨 Emergency CES Reset"

# Stop all processes
pkill -f "ces"
pkill -f "node.*claude"

# Backup current state
mkdir -p /tmp/ces-emergency-backup
cp -r .ces-* /tmp/ces-emergency-backup/ 2>/dev/null

# Clean all state
rm -rf .ces-*
rm -f .env.local

# Recreate essential directories
mkdir -p .ces-logs .ces-data .ces-cache .ces-temp .ces-session

# Reset configuration
cp .env.template .env

# Rebuild application
npm install
npm run build

# Validate installation
npm run dev -- validate

echo "✅ Emergency reset complete"
echo "💾 Backup saved to: /tmp/ces-emergency-backup"
```

### 2. Selective Recovery

#### Configuration Recovery

```bash
# Backup current config
cp .env .env.backup

# Reset to template
cp .env.template .env

# Restore specific settings
grep "ANTHROPIC_API_KEY" .env.backup >> .env
grep "CES_PROJECT_NAME" .env.backup >> .env
```

#### Session Recovery

```bash
# Restore from checkpoint
ls .ces.session/checkpoints/
npm run dev -- restore-checkpoint checkpoint-name

# Or restore from backup
tar -xzf /path/to/backup.tar.gz -C .ces.session/
```

#### AI Integration Recovery

```bash
# Reset AI configuration
npm run dev -- ai config reset

# Test connectivity
npm run dev -- ai config test

# Verify with simple request
npm run dev -- ai ask "test connection" --max-tokens 10
```

### 3. Data Recovery

#### Log Recovery

```bash
# Restore logs from backup
cp /tmp/ces-emergency-backup/.ces-logs/* .ces-logs/

# Extract important information
grep "ERROR" .ces-logs/ces-error.log > critical-errors.log
grep "AnthropicSDK" .ces-logs/ces-combined.log > ai-activity.log
```

#### Session Data Recovery

```bash
# Find latest valid checkpoint
find .ces.session/checkpoints/ -name "*.json" -exec ls -lt {} + | head -1

# Restore session metadata
cp backup/current-session.json .ces.session/

# Verify session integrity
npm run dev -- status --detailed
```

---

## 📞 Support Resources

### Documentation
- **API Reference**: `docs/ANTHROPIC-AI-API-REFERENCE.md`
- **Configuration Guide**: `docs/ENTERPRISE-CONFIGURATION.md`
- **CLI Commands**: `docs/CLI-COMMANDS-REFERENCE.md`
- **Deployment Guide**: `docs/ENTERPRISE-DEPLOYMENT-GUIDE.md`

### Log Files
- **Combined Logs**: `.ces.logs/ces-combined.log`
- **Error Logs**: `.ces.logs/ces-error.log`
- **Performance Logs**: `.ces.logs/ces-performance.log`
- **AI Logs**: Search for "AnthropicSDK" in combined logs

### Diagnostic Commands
```bash
# Quick health check
npm run dev -- validate --verbose

# System status
npm run dev -- status --detailed

# AI integration status
npm run dev -- ai config test
npm run dev -- ai stats

# Configuration review
npm run dev -- config show

# Recent errors
tail -50 .ces.logs/ces-error.log
```

### Community Resources
- **GitHub Issues**: Report bugs and feature requests
- **Anthropic Documentation**: [docs.anthropic.com](https://docs.anthropic.com)
- **Claude Code CLI**: Official Claude development tools

---

*CES v2.7.0 Enterprise Edition - Troubleshooting Guide*  
*Last Updated: $(date)*