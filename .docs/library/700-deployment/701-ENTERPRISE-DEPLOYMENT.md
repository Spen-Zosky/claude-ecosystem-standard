# 🚀 Enterprise Deployment Guide - CES v2.6.0

Comprehensive deployment guide for Claude Ecosystem Standard v2.6.0 Enterprise Edition in production environments.

## 🏢 Deployment Overview

CES v2.6.0 Enterprise Edition is designed for production deployment with enterprise-grade features including:

- **🤖 Native Anthropic AI Integration** with Claude SDK and streaming support (NEW v2.6.0)
- **Dynamic Configuration Management** with environment-specific settings
- **Structured Logging** with Winston and log rotation
- **Auto-Recovery Systems** with intelligent monitoring
- **Performance Analytics** with comprehensive metrics including AI usage tracking
- **Security Hardening** with UUID-based identifiers and API key management
- **Scalable Architecture** with modular components

## 📋 Pre-Deployment Checklist

### System Requirements

```bash
✅ Node.js >= 18.0.0
✅ npm >= 8.0.0
✅ TypeScript >= 5.3.3
✅ Git >= 2.0
✅ Claude Code CLI installed
✅ 🆕 Anthropic API key configured
✅ 2GB+ RAM available
✅ 10GB+ disk space
✅ Network connectivity for MCP servers
✅ 🆕 HTTPS connectivity to api.anthropic.com
```

### Security Requirements

```bash
✅ SSL/TLS certificates configured
✅ Firewall rules configured
✅ User permissions configured
✅ Environment variables secured
✅ 🆕 Anthropic API key secured (not logged/exposed)
✅ Log directory permissions set
✅ Backup storage configured
✅ 🆕 AI usage monitoring configured
```

## 🏗️ Deployment Architectures

### 1. Single Server Deployment

**Recommended for**: Development, staging, small teams

```
┌─────────────────────────┐
│     Application Server  │
├─────────────────────────┤
│ ┌─────────────────────┐ │
│ │ CES v2.6.0 Instance │ │
│ │ - All components    │ │
│ │ - Local logging     │ │
│ │ - Local storage     │ │
│ └─────────────────────┘ │
└─────────────────────────┘
```

### 2. Multi-Server Deployment

**Recommended for**: Production, large teams, high availability

```
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│ Load Balancer   │  │ Monitoring      │  │ Log Aggregation │
│ - HAProxy/Nginx │  │ - Prometheus    │  │ - ELK Stack     │
└─────────────────┘  └─────────────────┘  └─────────────────┘
         │                      │                      │
┌─────────────────────────────────────────────────────────────┐
│                    Application Cluster                     │
├─────────────────┬─────────────────┬─────────────────────────┤
│ CES Instance 1  │ CES Instance 2  │ CES Instance 3          │
│ - Primary       │ - Secondary     │ - Analytics Worker      │
│ - Session Mgmt  │ - Auto-Recovery │ - Background Processing │
└─────────────────┴─────────────────┴─────────────────────────┘
         │                      │                      │
┌─────────────────────────────────────────────────────────────┐
│                   Shared Services                          │
├─────────────────┬─────────────────┬─────────────────────────┤
│ Database        │ Redis Cache     │ File Storage            │
│ - PostgreSQL    │ - Session Store │ - Shared Volumes        │
└─────────────────┴─────────────────┴─────────────────────────┘
```

### 3. Container Deployment

**Recommended for**: Kubernetes, Docker Swarm, cloud platforms

```
┌─────────────────────────────────────────────────────────────┐
│                    Kubernetes Cluster                      │
├─────────────────┬─────────────────┬─────────────────────────┤
│ CES Pod 1       │ CES Pod 2       │ CES Pod 3               │
│ - Replica 1     │ - Replica 2     │ - Analytics Worker      │
│ - Auto-scaling  │ - Auto-scaling  │ - Background Jobs       │
└─────────────────┴─────────────────┴─────────────────────────┘
         │                      │                      │
┌─────────────────────────────────────────────────────────────┐
│                    Persistent Storage                      │
├─────────────────┬─────────────────┬─────────────────────────┤
│ Config Maps     │ Secrets         │ Persistent Volumes      │
│ - Environment   │ - API Keys      │ - Logs & Data           │
└─────────────────┴─────────────────┴─────────────────────────┘
```

## 🔧 Environment Configuration

### Production Environment Setup

#### 1. Create Production Environment File

```bash
# Create .env.production
cp .env.template .env.production
```

#### 2. Configure Production Settings

```bash
# .env.production
NODE_ENV=production
CES_VERSION=2.5.0
CES_PROJECT_NAME=your-project-name
CES_INSTANCE_ID=ces-prod-$(uuidgen | cut -d- -f1)

# Performance Optimization
CES_CONTEXT_ANALYSIS_INTERVAL=60000
CES_RECOMMENDATIONS_INTERVAL=600000
CES_HEALTH_CHECK_INTERVAL=30000
CES_METRICS_COLLECTION_INTERVAL=30000

# Logging Configuration
CES_LOG_LEVEL=warn
CES_LOG_FORMAT=json
CES_LOG_MAX_FILES=10
CES_LOG_MAX_SIZE=50MB
CES_LOG_DATE_PATTERN=YYYY-MM-DD-HH

# Security Configuration
CES_ENABLE_AUTH=true
CES_JWT_SECRET=$(openssl rand -base64 32)
CES_JWT_EXPIRY=1h
CES_CORS_ENABLED=false

# Performance Monitoring
CES_PERFORMANCE_MONITORING=true
CES_DEBUG_ENABLED=false
CES_VERBOSE_LOGGING=false
CES_ERROR_STACK_TRACE=false

# Analytics
CES_ANALYTICS_ENABLED=true
CES_ANALYTICS_RETENTION_DAYS=90
CES_ANALYTICS_EXPORT_FORMAT=json

# Auto-Recovery
CES_AUTO_RECOVERY_ENABLED=true
CES_AUTO_RESTART_ENABLED=true
CES_AUTO_CLEANUP_ENABLED=true
CES_MAX_RESTART_ATTEMPTS=5

# 🤖 Anthropic AI Integration (NEW v2.6.0)
ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
CES_ANTHROPIC_MODEL=claude-3-sonnet-20240229
CES_ANTHROPIC_MAX_TOKENS=2048
CES_ANTHROPIC_TEMPERATURE=0.5
CES_ANTHROPIC_TIMEOUT=30000
CES_ANTHROPIC_MAX_RETRIES=3

# AI Feature Configuration
CES_AI_CODE_ANALYSIS_ENABLED=true
CES_AI_CODE_GENERATION_ENABLED=true
CES_AI_CHAT_ENABLED=false
CES_AI_STREAMING_ENABLED=false
CES_AI_USAGE_TRACKING_ENABLED=true

# AI Performance & Cost Controls
CES_AI_BATCH_ANALYSIS_SIZE=3
CES_AI_COST_ALERT_THRESHOLD=50.00
CES_AI_TOKEN_BUDGET_DAILY=100000
CES_AI_AUTO_CLEAR_CONVERSATION=true
CES_AI_CONVERSATION_HISTORY_LIMIT=10

# Resource Management
CES_SESSION_TIMEOUT=7200000
CES_MAX_SESSIONS=50
CES_SESSION_CLEANUP_INTERVAL=300000
```

### Staging Environment Setup

```bash
# .env.staging
NODE_ENV=staging
CES_DEBUG_ENABLED=false
CES_VERBOSE_LOGGING=true
CES_LOG_LEVEL=info
CES_ANALYTICS_ENABLED=true
CES_PERFORMANCE_MONITORING=true

# 🤖 Anthropic AI Integration (Staging)
ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY_STAGING}
CES_ANTHROPIC_MODEL=claude-3-sonnet-20240229
CES_ANTHROPIC_MAX_TOKENS=3072
CES_ANTHROPIC_TEMPERATURE=0.6
CES_AI_CODE_ANALYSIS_ENABLED=true
CES_AI_CODE_GENERATION_ENABLED=true
CES_AI_CHAT_ENABLED=true
CES_AI_STREAMING_ENABLED=true
CES_AI_USAGE_TRACKING_ENABLED=true
CES_AI_COST_ALERT_THRESHOLD=25.00
CES_AI_TOKEN_BUDGET_DAILY=75000
```

### Development Environment Setup

```bash
# .env.development (already configured)
NODE_ENV=development
CES_DEBUG_ENABLED=true
CES_VERBOSE_LOGGING=true
CES_LOG_LEVEL=debug
```

## 🐳 Container Deployment

### Docker Setup

#### 1. Create Dockerfile

```dockerfile
# Dockerfile
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache git curl bash

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Build TypeScript
RUN npm run build

# Create non-root user
RUN addgroup -g 1001 -S ces && \
    adduser -S ces -u 1001

# Create necessary directories
RUN mkdir -p .ces-logs .ces-data .ces-cache .ces-temp && \
    chown -R ces:ces .ces-*

# Switch to non-root user
USER ces

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD npm run dev -- status --quick || exit 1

# Start application
CMD ["npm", "start"]
```

#### 2. Create Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  ces-app:
    build: .
    container_name: ces-production
    restart: unless-stopped
    ports:
      - "3000:3000"
      - "3001:3001"  # Monitoring port
      - "3002:3002"  # Dashboard port
    environment:
      - NODE_ENV=production
    env_file:
      - .env.production
    volumes:
      - ./logs:/app/.ces-logs
      - ./data:/app/.ces-data
      - ./cache:/app/.ces-cache
    networks:
      - ces-network
    depends_on:
      - redis
      - postgres
    healthcheck:
      test: ["CMD", "npm", "run", "dev", "--", "status", "--quick"]
      interval: 30s
      timeout: 10s
      retries: 3

  redis:
    image: redis:7-alpine
    container_name: ces-redis
    restart: unless-stopped
    volumes:
      - redis-data:/data
    networks:
      - ces-network

  postgres:
    image: postgres:15-alpine
    container_name: ces-postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: ces_production
      POSTGRES_USER: ces_user
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres-data:/var/lib/postgresql/data
    networks:
      - ces-network

volumes:
  redis-data:
  postgres-data:

networks:
  ces-network:
    driver: bridge
```

### Kubernetes Deployment

#### 1. Create Kubernetes Manifests

```yaml
# k8s/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: ces-production

---
# k8s/configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: ces-config
  namespace: ces-production
data:
  NODE_ENV: "production"
  CES_VERSION: "2.5.0"
  CES_LOG_LEVEL: "warn"
  CES_LOG_FORMAT: "json"

---
# k8s/secret.yaml
apiVersion: v1
kind: Secret
metadata:
  name: ces-secrets
  namespace: ces-production
type: Opaque
data:
  CES_JWT_SECRET: <base64-encoded-secret>
  POSTGRES_PASSWORD: <base64-encoded-password>
  ANTHROPIC_API_KEY: <base64-encoded-anthropic-key>

---
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ces-deployment
  namespace: ces-production
spec:
  replicas: 3
  selector:
    matchLabels:
      app: ces
  template:
    metadata:
      labels:
        app: ces
    spec:
      containers:
      - name: ces
        image: ces:2.5.0
        ports:
        - containerPort: 3000
        - containerPort: 3001
        - containerPort: 3002
        env:
        - name: NODE_ENV
          valueFrom:
            configMapKeyRef:
              name: ces-config
              key: NODE_ENV
        envFrom:
        - configMapRef:
            name: ces-config
        - secretRef:
            name: ces-secrets
        volumeMounts:
        - name: logs
          mountPath: /app/.ces-logs
        - name: data
          mountPath: /app/.ces-data
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
      volumes:
      - name: logs
        persistentVolumeClaim:
          claimName: ces-logs-pvc
      - name: data
        persistentVolumeClaim:
          claimName: ces-data-pvc

---
# k8s/service.yaml
apiVersion: v1
kind: Service
metadata:
  name: ces-service
  namespace: ces-production
spec:
  selector:
    app: ces
  ports:
  - name: app
    port: 3000
    targetPort: 3000
  - name: monitor
    port: 3001
    targetPort: 3001
  - name: dashboard
    port: 3002
    targetPort: 3002
  type: ClusterIP

---
# k8s/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: ces-ingress
  namespace: ces-production
  annotations:
    kubernetes.io/ingress.class: "nginx"
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
spec:
  tls:
  - hosts:
    - ces.yourdomain.com
    secretName: ces-tls
  rules:
  - host: ces.yourdomain.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: ces-service
            port:
              number: 3000
```

## 🔐 Security Hardening

### 1. Environment Security

```bash
# Set proper file permissions
chmod 600 .env.production
chmod 700 .ces-logs
chmod 700 .ces-data

# Set up log rotation
sudo logrotate -f /etc/logrotate.d/ces

# Configure firewall
sudo ufw allow 22/tcp
sudo ufw allow 3000/tcp
sudo ufw allow 3001/tcp
sudo ufw allow 3002/tcp
sudo ufw enable
```

### 2. AI Security Configuration (NEW v2.6.0)

```bash
# Secure API key storage
echo "ANTHROPIC_API_KEY=your-key" | sudo tee -a /etc/environment
sudo chmod 600 /etc/environment

# Validate API key format
if [[ $ANTHROPIC_API_KEY =~ ^sk-ant-api03- ]]; then
    echo "✅ API key format valid"
else
    echo "❌ Invalid API key format"
    exit 1
fi

# Test API connectivity
npm run dev -- ai config test
```

### 3. SSL/TLS Configuration

```bash
# Generate SSL certificates
sudo certbot --nginx -d ces.yourdomain.com

# Configure Nginx
sudo nano /etc/nginx/sites-available/ces
```

#### Nginx Configuration

```nginx
server {
    listen 443 ssl http2;
    server_name ces.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/ces.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/ces.yourdomain.com/privkey.pem;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /monitoring {
        proxy_pass http://localhost:3001;
        # Additional monitoring-specific configuration
    }

    location /dashboard {
        proxy_pass http://localhost:3002;
        # Additional dashboard-specific configuration
    }
}

server {
    listen 80;
    server_name ces.yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

## 📊 Monitoring & Observability

### 1. System Monitoring Setup

```bash
# Install monitoring tools
npm install -g pm2
npm install -g prometheus-node-exporter

# Configure PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

#### PM2 Configuration

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'ces-production',
    script: 'dist/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production'
    },
    env_file: '.env.production',
    log_file: '.ces-logs/pm2-combined.log',
    out_file: '.ces-logs/pm2-out.log',
    error_file: '.ces-logs/pm2-error.log',
    merge_logs: true,
    time: true,
    max_memory_restart: '2G',
    node_args: '--max-old-space-size=2048'
  }]
};
```

### 2. Log Aggregation

```bash
# Configure Logstash for log aggregation
sudo nano /etc/logstash/conf.d/ces.conf
```

```ruby
input {
  file {
    path => "/app/.ces-logs/ces-combined.log"
    codec => json
    tags => ["ces", "application"]
  }
  file {
    path => "/app/.ces-logs/ces-performance.log"
    codec => json
    tags => ["ces", "performance"]
  }
}

filter {
  if "ces" in [tags] {
    date {
      match => [ "timestamp", "ISO8601" ]
    }
  }
}

output {
  elasticsearch {
    hosts => ["localhost:9200"]
    index => "ces-logs-%{+YYYY.MM.dd}"
  }
}
```

### 3. Metrics Collection

```bash
# Configure Prometheus metrics
sudo nano /etc/prometheus/prometheus.yml
```

```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'ces-application'
    static_configs:
      - targets: ['localhost:3001']
    metrics_path: '/metrics'
    scrape_interval: 30s

  - job_name: 'ces-ai-metrics'
    static_configs:
      - targets: ['localhost:3001']
    metrics_path: '/ai-metrics'
    scrape_interval: 60s

  - job_name: 'node-exporter'
    static_configs:
      - targets: ['localhost:9100']
```

### 4. AI Usage Monitoring (NEW v2.6.0)

```bash
# Setup AI usage alerts
cat > /etc/prometheus/rules/ces-ai-alerts.yml << EOF
groups:
- name: ces-ai-alerts
  rules:
  - alert: HighAIUsageCost
    expr: ces_ai_daily_cost > 50
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "High AI usage cost detected"
      description: "Daily AI costs have exceeded $50"

  - alert: AITokenLimitApproaching
    expr: ces_ai_daily_tokens > 80000
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "AI token limit approaching"
      description: "Daily token usage is approaching the limit"

  - alert: AIAPIErrors
    expr: rate(ces_ai_api_errors[5m]) > 0.1
    for: 2m
    labels:
      severity: critical
    annotations:
      summary: "High AI API error rate"
      description: "AI API error rate is above 10%"
EOF
```

## 🔄 Backup & Recovery

### 1. Automated Backup Setup

```bash
#!/bin/bash
# backup-ces.sh

BACKUP_DIR="/var/backups/ces"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="ces-backup-${DATE}"

# Create backup directory
mkdir -p "${BACKUP_DIR}/${BACKUP_NAME}"

# Backup configuration
cp -r .env* "${BACKUP_DIR}/${BACKUP_NAME}/"

# Backup data
tar -czf "${BACKUP_DIR}/${BACKUP_NAME}/data.tar.gz" .ces-data/

# Backup logs (last 7 days)
find .ces-logs -mtime -7 -type f -exec cp {} "${BACKUP_DIR}/${BACKUP_NAME}/" \;

# Create archive
cd "${BACKUP_DIR}"
tar -czf "${BACKUP_NAME}.tar.gz" "${BACKUP_NAME}/"
rm -rf "${BACKUP_NAME}"

# Cleanup old backups (keep 30 days)
find "${BACKUP_DIR}" -name "ces-backup-*.tar.gz" -mtime +30 -delete

echo "Backup completed: ${BACKUP_DIR}/${BACKUP_NAME}.tar.gz"
```

### 2. Automated Recovery Setup

```bash
#!/bin/bash
# recovery-ces.sh

BACKUP_FILE="$1"
RECOVERY_DIR="/tmp/ces-recovery"

if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: $0 <backup-file>"
    exit 1
fi

# Stop application
pm2 stop ces-production

# Create recovery directory
mkdir -p "$RECOVERY_DIR"
cd "$RECOVERY_DIR"

# Extract backup
tar -xzf "$BACKUP_FILE"

# Restore configuration
cp -r */env* /app/

# Restore data
cd /app
tar -xzf "$RECOVERY_DIR"/*/data.tar.gz

# Restart application
pm2 start ces-production

echo "Recovery completed from: $BACKUP_FILE"
```

## 🚀 Deployment Process

### 1. Pre-Deployment Steps

```bash
# 1. Backup current system
./backup-ces.sh

# 2. Run tests
npm test
npm run lint
npm run type-check

# 3. Build application
npm run build

# 4. Validate configuration
npm run dev -- validate --verbose

# 5. Test AI integration (NEW v2.6.0)
npm run dev -- ai config test
npm run dev -- ai ask "Deployment test" --max-tokens 10
```

### 2. Deployment Steps

```bash
# 1. Deploy new version
git pull origin main
npm ci --only=production
npm run build

# 2. Update configuration
cp .env.production.new .env.production

# 3. Run database migrations (if any)
npm run migrate

# 4. Restart application
pm2 reload ces-production --update-env

# 5. Verify deployment
npm run dev -- status --detailed
npm run dev -- validate

# 6. Verify AI integration (NEW v2.6.0)
npm run dev -- ai stats
npm run dev -- ai config test
```

### 3. Post-Deployment Steps

```bash
# 1. Monitor application
pm2 monit

# 2. Check logs
tail -f .ces-logs/ces-combined.log

# 3. Run health checks
npm run dev -- recovery status
npm run dev -- analytics dashboard

# 4. Create deployment checkpoint
npm run dev -- checkpoint-session --name "v2.6.0-deployment"
```

## 📋 Maintenance Tasks

### Daily Tasks

```bash
# Check system health
npm run dev -- status --detailed

# Review error logs
grep "ERROR" .ces-logs/ces-combined.log

# Monitor resource usage
npm run dev -- dashboard snapshot

# 🤖 Monitor AI usage (NEW v2.6.0)
npm run dev -- ai stats
grep "AnthropicSDK" .ces-logs/ces-combined.log | tail -20
```

### Weekly Tasks

```bash
# Update dependencies
npm audit
npm update

# Clean up old logs
find .ces-logs -mtime +7 -delete

# Backup system
./backup-ces.sh
```

### Monthly Tasks

```bash
# Review analytics
npm run dev -- analytics report --period month

# 🤖 Review AI usage analytics (NEW v2.6.0)
npm run dev -- ai stats --period month --export ai-usage-report.csv

# Update security certificates
sudo certbot renew

# System maintenance
npm run dev -- clean-reset --preserve-sessions --preserve-logs

# 🤖 Verify AI integration health (NEW v2.6.0)
npm run dev -- ai config test
npm run dev -- ai ask "Monthly health check" --max-tokens 10
```

## 🔧 Troubleshooting

### Common Issues

#### 1. Application Won't Start

```bash
# Check logs
cat .ces-logs/ces-error.log

# Verify configuration
npm run dev -- config validate

# Check dependencies
npm ls
```

#### 2. Performance Issues

```bash
# Monitor performance
npm run dev -- analytics dashboard

# Check resource usage
top -p $(pgrep -f "ces")

# Review slow queries
grep "duration.*[5-9][0-9][0-9][0-9]" .ces-logs/ces-performance.log
```

#### 3. Memory Leaks

```bash
# Monitor memory usage
pm2 monit

# Restart application
pm2 restart ces-production

# Check for memory leaks
node --inspect dist/index.js
```

#### 4. AI Integration Issues (NEW v2.6.0)

```bash
# Check AI configuration
npm run dev -- ai config show

# Test API connectivity
npm run dev -- ai config test

# Check AI error logs
grep "AnthropicSDK.*ERROR" .ces-logs/ces-error.log

# Monitor AI usage
npm run dev -- ai stats

# Verify API key
if [[ $ANTHROPIC_API_KEY =~ ^sk-ant-api03- ]]; then
    echo "✅ API key format valid"
else
    echo "❌ Invalid API key format"
fi
```

### Emergency Procedures

#### 1. System Recovery

```bash
# Stop all services
pm2 stop all

# Restore from backup
./recovery-ces.sh /var/backups/ces/ces-backup-latest.tar.gz

# Restart services
pm2 start all
```

#### 2. Database Recovery

```bash
# Restore database
psql -U ces_user -d ces_production < /var/backups/ces/database-backup.sql

# Verify data integrity
npm run dev -- validate --fix
```

This deployment guide provides comprehensive instructions for deploying CES v2.6.0 Enterprise Edition in production environments with enterprise-grade security, monitoring, and reliability features.