# CES v2.7.0 Usage Examples

*Auto-extracted from codebase*

## Code Examples


### anthropic-usage.ts

```typescript
/**
 * Anthropic SDK Integration Usage Examples
 * CES v2.6.0 Enterprise Edition
 */

import { ConfigManager } from '../src/config/ConfigManager.js';
import { SessionManager } from '../src/session/SessionManager.js';
import { AnthropicIntegrationHelper } from '../src/integrations/anthropic/AnthropicIntegrationHelper.js';

async function examples() {
    console.log('🤖 Anthropic SDK Integration Examples\n');

    const configManager = new ConfigManager();
    const sessionManager = new SessionManager(configManager);
    const integration = new AnthropicIntegrationHelper(configManager, sessionManager);

    try {
        // Example 1: Simple completion
        console.log('📝 Example 1: Simple completion');
        const response1 = await integration.getAnthropicSDK().complete(
            'What are the benefits of TypeScript over JavaScript?'
        );
        console.log('Claude:', response1.content.substring(0, 200) + '...');
        console.log(`Usage: ${response1.usage.totalTokens} tokens, $${response1.usage.cost}\n`);

        // Example 2: Stream response
        console.log('🌊 Example 2: Streaming response');
        console.log('Claude (streaming): ');
        let fullResponse = '';
        for await (const chunk of integration.getAnthropicSDK().streamComplete(
            'Write a haiku about programming'
        )) {
            if (!chunk.isComplete) {
                process.stdout.write(chunk.content);
                fullResponse += chunk.content;
            }
        }
        console.log('\n');

        // Example 3: Code analysis
        console.log('🔍 Example 3: Code security analysis');
        const analysis = await integration.getAnthropicSDK().analyzeCode({
            code: `
function processUser(user) {
    const query = "SELECT * FROM users WHERE id = " + user.id;
    return database.query(query);
}`,
            language: 'javascript',
            analysisType: 'security'
        });
```

## Test Examples


### example.test.ts

describe('CES Basic Tests', () => {
  test('should pass basic test', () => {
    expect(true).toBe(true);
  });
  
  test('environment is set correctly', () => {
    expect(process.env.NODE_ENV).toBeDefined();
  });
});

### PathResolver.test.ts

 * Tests for the portable path resolution utility
 */

import * as path from 'path';
import * as fs from 'fs';
import { PathResolver, getPathResolver } from '../utils/PathResolver';

describe('PathResolver', () => {
  let resolver: PathResolver;

  beforeEach(() => {
    resolver = PathResolver.getInstance();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = PathResolver.getInstance();
      const instance2 = PathResolver.getInstance();
      const instance3 = getPathResolver();
      

### ConfigManager.test.ts

describe('ConfigManager', () => {
    let configManager: ConfigManager;

    beforeEach(() => {
        configManager = new ConfigManager();
    });

    describe('initialization', () => {
        it('should initialize successfully', async () => {
            const config = await configManager.initialize();
            
            expect(config).toBeDefined();
            expect(config.projectRoot).toBeDefined();
            expect(config.projectName).toBeDefined();
            expect(Array.isArray(config.languages)).toBe(true);
            expect(Array.isArray(config.frameworks)).toBe(true);
            expect(Array.isArray(config.tools)).toBe(true);
            expect(typeof config.hasGit).toBe('boolean');
            expect(typeof config.hasMCP).toBe('boolean');
            expect(typeof config.hasAgents).toBe('boolean');
