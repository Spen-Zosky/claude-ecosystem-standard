# 🚀 Anthropic AI Integration Guide

**CES v2.7.0 Enterprise Edition** - Complete guide for integrating and using native Anthropic SDK capabilities

## Table of Contents

- [Quick Start](#quick-start)
- [Installation & Setup](#installation--setup)
- [Configuration](#configuration)
- [Basic Usage](#basic-usage)
- [Advanced Features](#advanced-features)
- [Workflows & Best Practices](#workflows--best-practices)
- [Integration Patterns](#integration-patterns)
- [Performance Optimization](#performance-optimization)
- [Security Guidelines](#security-guidelines)
- [Troubleshooting](#troubleshooting)

## Quick Start

### 1. Get Your API Key

1. Visit [Anthropic Console](https://console.anthropic.com/)
2. Create an account or sign in
3. Navigate to API Keys section
4. Generate a new API key
5. Copy the key (starts with `sk-ant-api03-`)

### 2. Configure CES

```bash
# Set API key
export ANTHROPIC_API_KEY=your-api-key-here

# Or add to .env file
echo "ANTHROPIC_API_KEY=your-api-key-here" >> .env
```

### 3. Test Integration

```bash
# Quick test
npm run dev -- ai ask "Hello Claude!"

# View usage stats
npm run dev -- ai stats
```

## Installation & Setup

### Prerequisites

- **CES v2.7.0+**: Ensure you have the latest version
- **Node.js 18+**: Required for Anthropic SDK
- **Active Internet**: API connectivity required
- **Valid API Key**: From Anthropic Console

### Automatic Installation

The Anthropic SDK is automatically installed with CES v2.7.0:

```bash
# SDK is included in package.json
"@anthropic-ai/sdk": "^0.28.0"
```

### Manual Installation (if needed)

```bash
npm install @anthropic-ai/sdk
```

### Verify Installation

```bash
# Check SDK installation
npm list @anthropic-ai/sdk

# Test AI integration
npm run dev -- ai ask "Test connection" --stream
```

## Configuration

### Environment Variables

#### Required Configuration

```bash
# Essential API key
ANTHROPIC_API_KEY=your-api-key-here
```

#### Optional Configuration

```bash
# Model selection
CES_ANTHROPIC_MODEL=claude-3-sonnet-20240229

# Token limits
CES_ANTHROPIC_MAX_TOKENS=4096

# Response creativity (0.0 = focused, 1.0 = creative)
CES_ANTHROPIC_TEMPERATURE=0.7

# Network settings
CES_ANTHROPIC_TIMEOUT=30000
CES_ANTHROPIC_MAX_RETRIES=2

# Custom API endpoint (advanced)
CES_ANTHROPIC_BASE_URL=https://custom-endpoint.com/api
```

#### Feature Toggles

```bash
# Enable/disable features
CES_AI_CODE_ANALYSIS_ENABLED=true
CES_AI_CODE_GENERATION_ENABLED=true
CES_AI_CHAT_ENABLED=true
CES_AI_STREAMING_ENABLED=true
CES_AI_USAGE_TRACKING_ENABLED=true

# Performance limits
CES_AI_CONVERSATION_HISTORY_LIMIT=20
CES_AI_BATCH_ANALYSIS_SIZE=5

# Cost controls
CES_AI_COST_ALERT_THRESHOLD=10.00
CES_AI_TOKEN_BUDGET_DAILY=100000
CES_AI_AUTO_CLEAR_CONVERSATION=false
```

### Configuration Validation

```bash
# Validate AI configuration
npm run dev -- config validate

# Test API connectivity
npm run dev -- ai ask "Configuration test"
```

### Model Selection Guide

| Model | Use Case | Speed | Cost | Max Tokens |
|-------|----------|-------|------|------------|
| **claude-3-haiku-20240307** | Quick tasks, simple analysis | ⚡ Fastest | 💰 Lowest | 200K |
| **claude-3-sonnet-20240229** | Balanced performance | ⚡ Fast | 💰 Medium | 200K |
| **claude-3-opus-20240229** | Complex analysis, creativity | ⚡ Slower | 💰 Highest | 200K |

**Recommendation**: Start with `claude-3-sonnet-20240229` for balanced performance and cost.

## Basic Usage

### 1. Quick Questions

```bash
# Simple question
npm run dev -- ai ask "What is TypeScript?"

# Streaming response
npm run dev -- ai ask --stream "Explain async/await in JavaScript"

# Specific model
npm run dev -- ai ask --model claude-3-opus-20240229 "Complex analysis task"

# Custom temperature
npm run dev -- ai ask --temperature 0.9 "Creative coding ideas"
```

### 2. Code Analysis

```bash
# Analyze single file
npm run dev -- ai analyze src/index.ts

# Analyze multiple files
npm run dev -- ai analyze src/config.ts src/utils.ts

# Specific analysis type
npm run dev -- ai analyze src/auth.ts --type security
npm run dev -- ai analyze src/api.ts --type performance
npm run dev -- ai analyze src/components.ts --type quality

# Comprehensive analysis
npm run dev -- ai analyze src/ --type all
```

### 3. Code Generation

```bash
# Interactive generation
npm run dev -- ai generate

# Language-specific
npm run dev -- ai generate --language typescript

# With framework
npm run dev -- ai generate --framework react --style functional

# Include tests
npm run dev -- ai generate --language typescript --with-tests

# Generate and review
npm run dev -- ai generate --with-review --language javascript
```

### 4. Interactive Chat

```bash
# Start chat session
npm run dev -- ai chat

# Example conversation:
# You: "I need help with error handling in TypeScript"
# Claude: [Provides guidance on TypeScript error handling]
# You: "Show me an example with try-catch"
# Claude: [Provides code examples with context awareness]
# You: "exit"  # To quit
```

### 5. Usage Analytics

```bash
# View statistics
npm run dev -- ai stats

# Example output:
# === Anthropic API Usage ===
# Total tokens used: 15,432
# Conversation messages: 8
# Estimated cost: $0.0463
```

## Advanced Features

### 1. Programmatic Usage

#### Basic Completion

```typescript
import { AnthropicSDKManager } from './integrations/anthropic/AnthropicSDKManager.js';

const anthropic = new AnthropicSDKManager(configManager, sessionManager);

const response = await anthropic.complete(
    "Explain the Observer pattern in TypeScript",
    {
        model: "claude-3-sonnet-20240229",
        temperature: 0.7,
        maxTokens: 2048
    }
);

console.log(response.content);
console.log(`Cost: $${response.usage.cost}`);
```

#### Streaming Responses

```typescript
console.log("Claude:");
for await (const chunk of anthropic.streamComplete(prompt)) {
    if (!chunk.isComplete) {
        process.stdout.write(chunk.content);
    } else {
        console.log(`\nCompleted in ${chunk.metadata?.duration}ms`);
    }
}
```

#### Conversation Context

```typescript
// Start conversation
await anthropic.complete("I'm building a TypeScript API");

// Continue with context
const response = await anthropic.continueConversation(
    "How should I structure my error handling?"
);

// Get conversation history
const history = anthropic.getConversationHistory();
console.log(`Messages: ${history.length}`);
```

### 2. Advanced Analysis

#### Multi-file Analysis

```typescript
import { AnthropicIntegrationHelper } from './integrations/anthropic/AnthropicIntegrationHelper.js';

const helper = new AnthropicIntegrationHelper(configManager, sessionManager);

const results = await helper.analyzeProject(
    ["src/auth.ts", "src/api.ts", "src/utils.ts"],
    "security"
);

// Process results
for (const result of results) {
    if (result.summary) {
        console.log("Summary:", result.summary);
    } else if (result.error) {
        console.error(`Error in ${result.file}:`, result.error);
    } else {
        console.log(`${result.file}:`, result.analysis);
        console.log(`Tokens: ${result.usage.totalTokens}`);
    }
}
```

#### Generate and Review Workflow

```typescript
const result = await helper.generateAndReview({
    specification: "Create a TypeScript utility for data validation",
    language: "typescript",
    style: "functional",
    includeTests: true,
    includeComments: true
});

console.log("Generated:", result.code);
console.log("Review:", result.review);
console.log("Improved:", result.improved);
```

### 3. Event-Driven Integration

```typescript
import { AnthropicSDKManager } from './integrations/anthropic/AnthropicSDKManager.js';

const anthropic = new AnthropicSDKManager(configManager, sessionManager);

// Listen for events
anthropic.on('completion', (response) => {
    console.log(`Completion finished: ${response.usage.totalTokens} tokens`);
});

anthropic.on('stream-chunk', (chunk) => {
    if (!chunk.isComplete) {
        updateUI(chunk.content);
    }
});

anthropic.on('error', (error) => {
    console.error('API Error:', error.message);
    handleError(error);
});
```

## Workflows & Best Practices

### 1. Code Review Workflow

```bash
# 1. Analyze for issues
npm run dev -- ai analyze src/new-feature.ts --type all

# 2. Generate improvements
npm run dev -- ai ask "Based on this analysis, how can I improve the code?"

# 3. Interactive discussion
npm run dev -- ai chat
# Discuss specific issues and solutions
```

### 2. Development Workflow

```bash
# 1. Planning
npm run dev -- ai ask "Best practices for implementing user authentication in TypeScript"

# 2. Generation
npm run dev -- ai generate --language typescript --framework express

# 3. Review and improve
npm run dev -- ai generate --with-review --language typescript

# 4. Security check
npm run dev -- ai analyze generated-code.ts --type security
```

### 3. Learning Workflow

```bash
# 1. Start conversation
npm run dev -- ai chat

# 2. Ask questions with context
# You: "I'm learning TypeScript generics"
# Claude: [Explains generics]
# You: "Show me a practical example"
# Claude: [Provides code example]
# You: "How does this compare to Java generics?"
# Claude: [Compares with context awareness]
```

### 4. Project Analysis Workflow

```typescript
// 1. Full project scan
const files = await glob('src/**/*.ts');
const results = await helper.analyzeProject(files, 'all');

// 2. Filter critical issues
const criticalIssues = results.filter(r => 
    r.analysis && r.analysis.includes('critical')
);

// 3. Generate action plan
const actionPlan = await anthropic.complete(
    `Based on these analysis results, create an action plan: ${JSON.stringify(criticalIssues)}`
);
```

## Integration Patterns

### 1. CI/CD Integration

#### GitHub Actions Example

```yaml
name: AI Code Analysis
on: [push, pull_request]

jobs:
  ai-analysis:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      
      - name: Install dependencies
        run: npm install
      
      - name: AI Security Analysis
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: |
          npm run dev -- ai analyze src/ --type security > analysis.txt
          cat analysis.txt
      
      - name: Upload Analysis
        uses: actions/upload-artifact@v3
        with:
          name: ai-analysis
          path: analysis.txt
```

### 2. Pre-commit Hook

```bash
#!/bin/bash
# .git/hooks/pre-commit

echo "Running AI code analysis..."

# Analyze staged files
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(ts|js)$')

if [ ! -z "$STAGED_FILES" ]; then
    npm run dev -- ai analyze $STAGED_FILES --type security
    
    if [ $? -ne 0 ]; then
        echo "AI analysis found issues. Please review before committing."
        exit 1
    fi
fi
```

### 3. VS Code Integration

```json
{
    "tasks": [
        {
            "label": "AI Analyze Current File",
            "type": "shell",
            "command": "npm",
            "args": ["run", "dev", "--", "ai", "analyze", "${file}", "--type", "all"],
            "group": "test",
            "presentation": {
                "echo": true,
                "reveal": "always",
                "focus": false,
                "panel": "new"
            }
        },
        {
            "label": "AI Generate Code",
            "type": "shell",
            "command": "npm",
            "args": ["run", "dev", "--", "ai", "generate", "--language", "typescript"],
            "group": "build"
        }
    ]
}
```

### 4. Custom Middleware

```typescript
// Express middleware for AI-powered error analysis
export const aiErrorAnalyzer = async (err: Error, req: Request, res: Response, next: NextFunction) => {
    if (process.env.NODE_ENV === 'development') {
        try {
            const analysis = await anthropic.complete(
                `Analyze this error and suggest fixes: ${err.stack}`,
                { temperature: 0.3 }
            );
            
            console.log('AI Error Analysis:', analysis.content);
        } catch (aiError) {
            console.warn('AI analysis failed:', aiError.message);
        }
    }
    
    next(err);
};
```

## Performance Optimization

### 1. Token Management

```typescript
// Monitor and optimize token usage
class TokenManager {
    private dailyUsage = 0;
    private readonly dailyLimit = 100000;
    
    async checkBudget(): Promise<boolean> {
        return this.dailyUsage < this.dailyLimit;
    }
    
    async optimizePrompt(prompt: string): Promise<string> {
        // Truncate long prompts
        if (prompt.length > 8000) {
            return prompt.substring(0, 8000) + "...";
        }
        return prompt;
    }
}
```

### 2. Caching Strategy

```typescript
// Cache analysis results
class AnalysisCache {
    private cache = new Map<string, any>();
    
    async getOrAnalyze(code: string, type: string): Promise<any> {
        const key = this.generateKey(code, type);
        
        if (this.cache.has(key)) {
            return this.cache.get(key);
        }
        
        const result = await anthropic.analyzeCode({ code, language: 'typescript', analysisType: type });
        this.cache.set(key, result);
        
        return result;
    }
    
    private generateKey(code: string, type: string): string {
        const hash = crypto.createHash('md5').update(code + type).digest('hex');
        return `${type}-${hash}`;
    }
}
```

### 3. Batch Processing

```typescript
// Process multiple files efficiently
async function batchAnalyze(files: string[], batchSize = 5): Promise<any[]> {
    const results = [];
    
    for (let i = 0; i < files.length; i += batchSize) {
        const batch = files.slice(i, i + batchSize);
        
        const batchPromises = batch.map(async (file) => {
            const code = await fs.readFile(file, 'utf-8');
            return helper.analyzeFile(file, code);
        });
        
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
        
        // Rate limiting delay
        if (i + batchSize < files.length) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
    
    return results;
}
```

## Security Guidelines

### 1. API Key Security

```typescript
// ✅ Good: Environment variable
const apiKey = process.env.ANTHROPIC_API_KEY;

// ✅ Good: Secure configuration
const config = {
    apiKey: process.env.ANTHROPIC_API_KEY,
    // Never log the API key
    toString() { return '[REDACTED]'; }
};

// ❌ Bad: Hardcoded key
const apiKey = "sk-ant-api03-..."; // Never do this!
```

### 2. Data Sanitization

```typescript
// Sanitize code before sending to API
function sanitizeCode(code: string): string {
    return code
        .replace(/(?:password|secret|key|token)\s*[:=]\s*["']([^"']+)["']/gi, 
                'password: "[REDACTED]"')
        .replace(/\b(?:\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4})\b/g, 
                '[CARD-REDACTED]')
        .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, 
                '[EMAIL-REDACTED]');
}
```

### 3. Request Validation

```typescript
// Validate requests before sending
function validateAnalysisRequest(request: CodeAnalysisRequest): boolean {
    // Check file size
    if (request.code.length > 50000) {
        throw new Error('Code too large for analysis');
    }
    
    // Check for sensitive patterns
    const sensitivePatterns = [
        /password\s*[:=]/i,
        /secret\s*[:=]/i,
        /api[_-]?key\s*[:=]/i
    ];
    
    for (const pattern of sensitivePatterns) {
        if (pattern.test(request.code)) {
            console.warn('Sensitive data detected in code');
            request.code = sanitizeCode(request.code);
        }
    }
    
    return true;
}
```

### 4. Network Security

```typescript
// Configure secure HTTP client
const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
    timeout: 30000,
    maxRetries: 2,
    // Use custom fetch with security headers
    fetch: (url, init) => {
        return fetch(url, {
            ...init,
            headers: {
                ...init?.headers,
                'User-Agent': 'CES-v2.7.0',
                'X-Request-ID': generateRequestId()
            }
        });
    }
});
```

## Troubleshooting

### Common Issues

#### 1. API Key Not Found

**Error**: `Anthropic API key not found`

**Solutions**:
```bash
# Check environment variable
echo $ANTHROPIC_API_KEY

# Set environment variable
export ANTHROPIC_API_KEY=your-api-key-here

# Add to .env file
echo "ANTHROPIC_API_KEY=your-key" >> .env

# Restart terminal/IDE after setting
```

#### 2. Rate Limiting

**Error**: `Rate limit exceeded`

**Solutions**:
```bash
# Check usage
npm run dev -- ai stats

# Reduce batch size
CES_AI_BATCH_ANALYSIS_SIZE=2

# Add delays between requests
CES_AI_REQUEST_DELAY=1000
```

#### 3. Token Limit Exceeded

**Error**: `Token limit exceeded`

**Solutions**:
```bash
# Reduce max tokens
CES_ANTHROPIC_MAX_TOKENS=2048

# Split large analysis into smaller chunks
npm run dev -- ai analyze file1.ts file2.ts  # Instead of analyzing whole directory
```

#### 4. Network Connectivity

**Error**: `Network request failed`

**Solutions**:
```bash
# Test connectivity
curl -I https://api.anthropic.com

# Check proxy settings
echo $HTTP_PROXY
echo $HTTPS_PROXY

# Configure timeout
CES_ANTHROPIC_TIMEOUT=60000
```

#### 5. Streaming Issues

**Error**: `Stream interrupted`

**Solutions**:
```bash
# Disable streaming temporarily
CES_AI_STREAMING_ENABLED=false

# Use non-streaming commands
npm run dev -- ai ask "question" # Without --stream flag

# Check network stability
ping api.anthropic.com
```

### Debugging Commands

```bash
# Debug mode
CES_DEBUG_ENABLED=true npm run dev -- ai ask "test"

# Verbose logging
CES_VERBOSE_LOGGING=true npm run dev -- ai stats

# Check configuration
npm run dev -- config show --section=anthropic

# Validate setup
npm run dev -- validate
```

### Log Analysis

```bash
# Check AI-specific logs
grep "AnthropicSDK" .ces.logs/ces-combined.log

# Check error logs
grep "ERROR" .ces.logs/ces-error.log | grep -i anthropic

# Check performance logs
grep "performance" .ces.logs/ces-performance.log | grep -i anthropic
```

### Support Resources

- **Anthropic Documentation**: [docs.anthropic.com](https://docs.anthropic.com)
- **API Status**: [status.anthropic.com](https://status.anthropic.com)
- **CES API Reference**: `docs/ANTHROPIC-AI-API-REFERENCE.md`
- **Configuration Guide**: `docs/ENTERPRISE-CONFIGURATION.md`

---

## Next Steps

1. **Complete Setup**: Follow the quick start guide
2. **Explore Examples**: Check `examples/anthropic-usage.ts`
3. **Read API Reference**: Review `docs/ANTHROPIC-AI-API-REFERENCE.md`
4. **Configure for Production**: Follow security guidelines
5. **Monitor Usage**: Set up cost alerts and budgets

**Happy AI-powered development with CES v2.7.0!** 🚀

---

*CES v2.7.0 Enterprise Edition - Anthropic AI Integration Guide*  
*Last Updated: $(date)*