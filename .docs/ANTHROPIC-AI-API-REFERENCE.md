# 🤖 Anthropic AI Integration - API Reference

**CES v2.6.0 Enterprise Edition** - Complete API documentation for native Anthropic SDK integration

## Table of Contents

- [Overview](#overview)
- [Core Classes](#core-classes)
- [API Methods](#api-methods)
- [Configuration](#configuration)
- [Types & Interfaces](#types--interfaces)
- [CLI Commands](#cli-commands)
- [Error Handling](#error-handling)
- [Usage Examples](#usage-examples)
- [Best Practices](#best-practices)

## Overview

The Anthropic AI integration provides direct access to Claude models through the official `@anthropic-ai/sdk`. This enterprise-grade implementation includes:

- **Direct API Access**: Native Claude integration without Claude Code CLI dependency
- **Streaming Support**: Real-time response streaming with AsyncGenerator
- **Code Analysis**: Security, performance, quality, and bug detection
- **Code Generation**: Interactive code creation with review capabilities
- **Chat Interface**: Conversational programming assistant
- **Usage Analytics**: Token tracking and cost monitoring
- **Session Integration**: All AI interactions logged to CES session system

## Core Classes

### AnthropicSDKManager

**File**: `src/integrations/anthropic/AnthropicSDKManager.ts`

Main class for direct Anthropic API interactions.

```typescript
export class AnthropicSDKManager extends EventEmitter {
    constructor(
        configManager: ConfigManager,
        sessionManager: SessionManager,
        config?: AnthropicConfig
    )
}
```

**Events Emitted**:
- `completion` - When a completion request finishes
- `stream-chunk` - For each chunk in streaming responses
- `error` - When API errors occur

### AnthropicIntegrationHelper

**File**: `src/integrations/anthropic/AnthropicIntegrationHelper.ts`

High-level helper for complex AI workflows.

```typescript
export class AnthropicIntegrationHelper {
    constructor(
        configManager: ConfigManager,
        sessionManager: SessionManager
    )
}
```

### AnthropicCLI

**File**: `src/cli/AnthropicCLI.ts`

CLI interface for interactive AI commands.

```typescript
export class AnthropicCLI {
    constructor(
        configManager: ConfigManager,
        sessionManager: SessionManager
    )
}
```

## API Methods

### Basic Completion

#### `complete(prompt: string, options?: CompletionOptions): Promise<CompletionResponse>`

Send a single completion request to Claude.

**Parameters**:
- `prompt` (string): The prompt to send to Claude
- `options` (CompletionOptions, optional): Configuration options

**Returns**: `Promise<CompletionResponse>`

**Example**:
```typescript
const response = await anthropicSDK.complete(
    "Explain TypeScript interfaces",
    {
        model: "claude-3-sonnet-20240229",
        temperature: 0.7,
        maxTokens: 2048
    }
);

console.log(response.content);
console.log(`Tokens used: ${response.usage.totalTokens}`);
console.log(`Cost: $${response.usage.cost}`);
```

### Streaming Completion

#### `streamComplete(prompt: string, options?: CompletionOptions): AsyncGenerator<StreamChunk>`

Stream a completion response in real-time.

**Parameters**:
- `prompt` (string): The prompt to send to Claude
- `options` (CompletionOptions, optional): Configuration options

**Returns**: `AsyncGenerator<StreamChunk, void, unknown>`

**Example**:
```typescript
console.log("Claude:");
for await (const chunk of anthropicSDK.streamComplete(prompt)) {
    if (!chunk.isComplete) {
        process.stdout.write(chunk.content);
    } else {
        console.log(`\nCompleted in ${chunk.metadata?.duration}ms`);
    }
}
```

### Conversational Interface

#### `continueConversation(prompt: string, options?: CompletionOptions): Promise<CompletionResponse>`

Continue a conversation with context from previous messages.

**Parameters**:
- `prompt` (string): The new message to send
- `options` (CompletionOptions, optional): Configuration options

**Returns**: `Promise<CompletionResponse>`

**Example**:
```typescript
// First message
await anthropicSDK.complete("Hello, I'm working on a React app");

// Continue conversation with context
const response = await anthropicSDK.continueConversation(
    "Can you help me with state management?"
);
```

### Code Analysis

#### `analyzeCode(request: CodeAnalysisRequest): Promise<CompletionResponse>`

Analyze code for various issues and improvements.

**Parameters**:
- `request` (CodeAnalysisRequest): Analysis configuration

**Returns**: `Promise<CompletionResponse>`

**Example**:
```typescript
const analysis = await anthropicSDK.analyzeCode({
    code: sourceCode,
    language: "typescript",
    analysisType: "security" // "security" | "performance" | "quality" | "bugs" | "all"
});

console.log("Security Analysis:", analysis.content);
```

### Code Generation

#### `generateCode(request: CodeGenerationRequest): Promise<CompletionResponse>`

Generate code based on specifications.

**Parameters**:
- `request` (CodeGenerationRequest): Generation configuration

**Returns**: `Promise<CompletionResponse>`

**Example**:
```typescript
const generated = await anthropicSDK.generateCode({
    specification: "Create a React component for user authentication",
    language: "typescript",
    framework: "react",
    style: "functional",
    includeTests: true,
    includeComments: true
});

console.log("Generated Code:", generated.content);
```

### Project Analysis

#### `analyzeProject(files: string[], analysisType?: string): Promise<AnalysisResult[]>`

Analyze multiple files in a project.

**Parameters**:
- `files` (string[]): Array of file paths to analyze
- `analysisType` (string, optional): Type of analysis ("security", "performance", "quality", "all")

**Returns**: `Promise<AnalysisResult[]>`

**Example**:
```typescript
const results = await helper.analyzeProject(
    ["src/index.ts", "src/config.ts", "src/utils.ts"],
    "all"
);

for (const result of results) {
    if (result.summary) {
        console.log("Summary:", result.summary);
    } else {
        console.log(`${result.file}:`, result.analysis);
    }
}
```

### Generate and Review

#### `generateAndReview(request: CodeGenerationRequest): Promise<{code: string; review: string; improved: string;}>`

Generate code, review it, and provide an improved version.

**Parameters**:
- `request` (CodeGenerationRequest): Generation configuration

**Returns**: Promise with `code`, `review`, and `improved` properties

**Example**:
```typescript
const result = await helper.generateAndReview({
    specification: "Create a data validation utility",
    language: "typescript",
    includeTests: true
});

console.log("Original:", result.code);
console.log("Review:", result.review);
console.log("Improved:", result.improved);
```

### Utility Methods

#### `getConversationHistory(): ConversationMessage[]`

Get the current conversation history.

#### `clearConversation(): void`

Clear the conversation history.

#### `getTotalTokensUsed(): number`

Get total tokens used in the session.

#### `calculateCost(usage: UsageStats): number`

Calculate cost for given token usage.

## Configuration

### Environment Variables

```bash
# Required
ANTHROPIC_API_KEY=your-api-key-here

# Optional Configuration
CES_ANTHROPIC_MODEL=claude-3-sonnet-20240229
CES_ANTHROPIC_MAX_TOKENS=4096
CES_ANTHROPIC_TEMPERATURE=0.7
CES_ANTHROPIC_TIMEOUT=30000
CES_ANTHROPIC_MAX_RETRIES=2
```

### AnthropicConfig Interface

```typescript
interface AnthropicConfig {
    apiKey?: string;
    baseURL?: string;
    timeout?: number;
    maxRetries?: number;
    defaultModel?: string;
}
```

### CompletionOptions Interface

```typescript
interface CompletionOptions {
    model?: string;
    maxTokens?: number;
    temperature?: number;
    system?: string;
    stopSequences?: string[];
}
```

## Types & Interfaces

### CompletionResponse

```typescript
interface CompletionResponse {
    content: string;
    model: string;
    usage: UsageStats;
    stopReason?: string;
    metadata: {
        messageId: string;
        duration: number;
    };
}
```

### UsageStats

```typescript
interface UsageStats {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    cost?: number;
}
```

### StreamChunk

```typescript
interface StreamChunk {
    content: string;
    index: number;
    isComplete: boolean;
    metadata?: {
        duration?: number;
    };
}
```

### ConversationMessage

```typescript
interface ConversationMessage {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}
```

### CodeAnalysisRequest

```typescript
interface CodeAnalysisRequest {
    code: string;
    language: string;
    analysisType: 'security' | 'performance' | 'quality' | 'bugs' | 'all';
}
```

### CodeGenerationRequest

```typescript
interface CodeGenerationRequest {
    specification: string;
    language: string;
    framework?: string;
    style?: 'functional' | 'oop' | 'procedural';
    includeTests?: boolean;
    includeComments?: boolean;
}
```

## CLI Commands

### Quick Ask

```bash
npm run dev -- ai ask "How do I implement error handling in TypeScript?"
npm run dev -- ai ask --stream "Explain async/await"
npm run dev -- ai ask --model claude-3-opus-20240229 "Complex analysis task"
```

### Code Analysis

```bash
npm run dev -- ai analyze src/index.ts --type security
npm run dev -- ai analyze src/config/ --type performance
npm run dev -- ai analyze . --type quality
npm run dev -- ai analyze src/cli/*.ts src/config/*.ts --type all
```

### Code Generation

```bash
npm run dev -- ai generate --language typescript --with-tests
npm run dev -- ai generate --with-review --language javascript
npm run dev -- ai generate --framework react --style functional
```

### Interactive Chat

```bash
npm run dev -- ai chat
```

### Usage Statistics

```bash
npm run dev -- ai stats
```

## Error Handling

### Common Errors

#### API Key Missing

```typescript
// Error: Anthropic API key not found
// Solution: Set ANTHROPIC_API_KEY environment variable
export ANTHROPIC_API_KEY=your-api-key-here
```

#### Rate Limiting

```typescript
// Error: Rate limit exceeded
// The SDK automatically retries with exponential backoff
// Configure maxRetries in AnthropicConfig for custom retry behavior
```

#### Token Limits

```typescript
// Error: Token limit exceeded
// Reduce maxTokens in CompletionOptions or split large requests
const options: CompletionOptions = {
    maxTokens: 2048 // Reduce from default 4096
};
```

### Error Event Handling

```typescript
anthropicSDK.on('error', (error) => {
    console.error('Anthropic API Error:', error.message);
    
    if (error.message.includes('rate limit')) {
        // Handle rate limiting
        console.log('Rate limited, waiting...');
    } else if (error.message.includes('token')) {
        // Handle token issues
        console.log('Token limit exceeded');
    }
});
```

## Usage Examples

### 1. Basic Code Analysis

```typescript
import { AnthropicSDKManager } from './integrations/anthropic/AnthropicSDKManager.js';

const anthropic = new AnthropicSDKManager(configManager, sessionManager);

// Analyze a TypeScript file for security issues
const code = await fs.readFile('src/auth.ts', 'utf-8');
const analysis = await anthropic.analyzeCode({
    code,
    language: 'typescript',
    analysisType: 'security'
});

console.log('Security Analysis:', analysis.content);
console.log('Tokens used:', analysis.usage.totalTokens);
console.log('Cost:', `$${analysis.usage.cost}`);
```

### 2. Interactive Code Generation

```typescript
import { AnthropicIntegrationHelper } from './integrations/anthropic/AnthropicIntegrationHelper.js';

const helper = new AnthropicIntegrationHelper(configManager, sessionManager);

const result = await helper.generateAndReview({
    specification: "Create a REST API endpoint for user registration with validation",
    language: "typescript",
    framework: "express",
    style: "functional",
    includeTests: true,
    includeComments: true
});

console.log("Generated Code:\n", result.code);
console.log("\nReview:\n", result.review);
console.log("\nImproved Version:\n", result.improved);
```

### 3. Streaming Response

```typescript
import { AnthropicSDKManager } from './integrations/anthropic/AnthropicSDKManager.js';

const anthropic = new AnthropicSDKManager(configManager, sessionManager);

console.log("Claude:");
for await (const chunk of anthropic.streamComplete(
    "Explain the SOLID principles with examples",
    { temperature: 0.7 }
)) {
    if (!chunk.isComplete) {
        process.stdout.write(chunk.content);
    } else {
        console.log(`\n\nCompleted in ${chunk.metadata?.duration}ms`);
    }
}
```

### 4. Project-wide Analysis

```typescript
import { AnthropicIntegrationHelper } from './integrations/anthropic/AnthropicIntegrationHelper.js';
import { glob } from 'glob';

const helper = new AnthropicIntegrationHelper(configManager, sessionManager);

// Find all TypeScript files
const files = await glob('src/**/*.ts');

// Analyze all files for quality issues
const results = await helper.analyzeProject(files, 'quality');

// Print summary
const summary = results.find(r => r.summary);
if (summary) {
    console.log("Project Analysis Summary:");
    console.log(summary.summary);
}

// Print individual file results
results.filter(r => !r.summary).forEach(result => {
    if (result.error) {
        console.error(`❌ ${result.file}: ${result.error}`);
    } else {
        console.log(`✅ ${result.file}: Analysis complete`);
        console.log(result.analysis);
    }
});
```

### 5. Conversational Programming Session

```typescript
const anthropic = new AnthropicSDKManager(configManager, sessionManager);

// Start with context
await anthropic.complete(
    "I'm building a TypeScript REST API with Express and need help with error handling"
);

// Continue conversation with context
const response1 = await anthropic.continueConversation(
    "How should I structure custom error classes?"
);

const response2 = await anthropic.continueConversation(
    "Can you show me an example middleware for error handling?"
);

console.log("Error Classes:", response1.content);
console.log("Middleware Example:", response2.content);

// Get conversation history
const history = anthropic.getConversationHistory();
console.log(`Conversation length: ${history.length} messages`);
```

## Best Practices

### 1. API Key Security

- Never commit API keys to version control
- Use environment variables or secure configuration management
- Rotate API keys regularly in production environments

```typescript
// ✅ Good: Use environment variable
const apiKey = process.env.ANTHROPIC_API_KEY;

// ❌ Bad: Hardcoded API key
const apiKey = "sk-ant-api03-..."; // Never do this!
```

### 2. Error Handling

- Always wrap API calls in try-catch blocks
- Implement retry logic for transient failures
- Log errors with appropriate context

```typescript
try {
    const response = await anthropic.complete(prompt);
    return response;
} catch (error) {
    logger.error('API request failed', error);
    
    if (error.message.includes('rate limit')) {
        // Implement exponential backoff
        await new Promise(resolve => setTimeout(resolve, 2000));
        return this.retryRequest(prompt);
    }
    
    throw error;
}
```

### 3. Token Management

- Monitor token usage to control costs
- Use appropriate maxTokens for different use cases
- Clear conversation history periodically

```typescript
// Monitor usage
const totalTokens = anthropic.getTotalTokensUsed();
if (totalTokens > 50000) {
    console.warn('High token usage detected');
    anthropic.clearConversation(); // Reset to save context tokens
}
```

### 4. Performance Optimization

- Use streaming for long responses to improve UX
- Cache results for repeated analyses when appropriate
- Use lower temperature for more consistent results in code analysis

```typescript
// ✅ Use streaming for better UX
for await (const chunk of anthropic.streamComplete(prompt)) {
    updateUI(chunk.content);
}

// ✅ Lower temperature for code analysis
const analysis = await anthropic.analyzeCode({
    code,
    language: 'typescript',
    analysisType: 'security'
}, { temperature: 0.3 }); // More focused, consistent results
```

### 5. Session Integration

- Log important AI interactions to CES session system
- Track costs and usage for budgeting
- Use appropriate log levels for different operations

```typescript
// The SDK automatically logs to session, but you can add custom logging
logger.info('Code analysis completed', {
    component: 'AI',
    action: 'analyze',
    files: files.length,
    totalTokens: response.usage.totalTokens,
    cost: response.usage.cost
});
```

---

## Support and Troubleshooting

For issues with the Anthropic integration:

1. **Check API Key**: Ensure `ANTHROPIC_API_KEY` is correctly set
2. **Verify Network**: Confirm internet connectivity to Anthropic API
3. **Review Logs**: Check CES logs in `.ces.logs/` directory
4. **Token Limits**: Monitor usage with `npm run dev -- ai stats`
5. **Model Availability**: Verify the model specified exists and is accessible

**Log Files**:
- `ces-combined.log`: All AI integration logs
- `ces-error.log`: Error-specific logs
- `ces-performance.log`: Performance metrics

**Debug Commands**:
```bash
# Test API connectivity
npm run dev -- ai ask "test connection"

# View usage statistics
npm run dev -- ai stats

# Check CES validation
npm run dev -- validate
```

---

*CES v2.6.0 Enterprise Edition - Anthropic AI Integration*  
*Generated: $(date)*