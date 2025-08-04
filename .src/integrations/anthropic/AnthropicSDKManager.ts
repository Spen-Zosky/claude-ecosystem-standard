/**
 * Anthropic SDK Manager - Direct API Integration with Claude
 * CES v2.7.0 Enterprise Edition
 */

import Anthropic from '@anthropic-ai/sdk';
import { createLogger, ComponentLogger } from '../../utils/Logger.js';
import { ConfigManager } from '../../config/ConfigManager.js';
import { SessionManager } from '../../session/SessionManager.js';
import { EventEmitter } from 'events';
import {
    AnthropicConfig,
    ConversationMessage,
    CompletionOptions,
    CompletionResponse,
    StreamChunk,
    UsageStats,
    CodeAnalysisRequest,
    CodeGenerationRequest
} from './types/anthropic.types.js';

export class AnthropicSDKManager extends EventEmitter {
    private anthropic: Anthropic;
    private logger: ComponentLogger;
    private conversationHistory: ConversationMessage[] = [];
    private defaultModel = 'claude-3-sonnet-20240229';
    private totalTokensUsed = 0;

    constructor(
        _configManager: ConfigManager,
        _sessionManager: SessionManager,
        config?: AnthropicConfig
    ) {
        super();
        this.logger = createLogger('AnthropicSDKManager');
        
        // Initialize Anthropic SDK
        const apiKey = config?.apiKey || 
                      process.env.ANTHROPIC_API_KEY;
        
        if (!apiKey) {
            throw new Error(
                'Anthropic API key not found. Set ANTHROPIC_API_KEY environment variable or provide in config.'
            );
        }

        this.anthropic = new Anthropic({
            apiKey,
            baseURL: config?.baseURL,
            timeout: config?.timeout || 30000,
            maxRetries: config?.maxRetries || 2
        });

        this.defaultModel = config?.defaultModel || this.defaultModel;
        this.logger.system('Anthropic SDK initialized', { 
            component: 'AnthropicSDKManager',
            action: 'initialize'
        });
    }

    /**
     * Send a completion request to Anthropic API
     */
    async complete(
        prompt: string, 
        options: CompletionOptions = {}
    ): Promise<CompletionResponse> {
        const startTime = Date.now();
        
        try {
            this.logger.info('Sending completion request', {
                component: 'AnthropicSDKManager',
                action: 'complete'
            });

            const message = await this.anthropic.messages.create({
                model: options.model || this.defaultModel,
                max_tokens: options.maxTokens || 4096,
                temperature: options.temperature || 0.7,
                system: options.system,
                messages: [{ role: 'user', content: prompt }],
                stop_sequences: options.stopSequences
            });

            const response = this.parseResponse(message, Date.now() - startTime);
            
            // Track conversation
            this.addToHistory('user', prompt);
            this.addToHistory('assistant', response.content);
            
            // Log to session
            await this.logToSession('completion', {
                prompt: prompt.substring(0, 100) + '...',
                response: response.content.substring(0, 100) + '...',
                usage: response.usage,
                duration: Date.now() - startTime
            });

            this.emit('completion', response);
            return response;

        } catch (error) {
            this.logger.error('Completion request failed', error instanceof Error ? error : new Error(String(error)));
            this.emit('error', error);
            throw error;
        }
    }

    /**
     * Stream a completion response
     */
    async *streamComplete(
        prompt: string,
        options: CompletionOptions = {}
    ): AsyncGenerator<StreamChunk, void, unknown> {
        const startTime = Date.now();
        
        try {
            this.logger.info('Starting stream completion', {
                component: 'AnthropicSDKManager',
                action: 'streamComplete'
            });

            const stream = await this.anthropic.messages.create({
                model: options.model || this.defaultModel,
                max_tokens: options.maxTokens || 4096,
                temperature: options.temperature || 0.7,
                system: options.system,
                messages: [{ role: 'user', content: prompt }],
                stop_sequences: options.stopSequences,
                stream: true
            });

            let fullContent = '';
            let chunkIndex = 0;

            for await (const chunk of stream) {
                if (chunk.type === 'content_block_delta' && 
                    chunk.delta.type === 'text_delta') {
                    
                    const content = chunk.delta.text;
                    fullContent += content;
                    
                    const streamChunk: StreamChunk = {
                        content,
                        index: chunkIndex++,
                        isComplete: false
                    };
                    
                    this.emit('stream-chunk', streamChunk);
                    yield streamChunk;
                }
            }

            // Final chunk
            yield {
                content: '',
                index: chunkIndex,
                isComplete: true,
                metadata: { duration: Date.now() - startTime }
            };

            // Track conversation
            this.addToHistory('user', prompt);
            this.addToHistory('assistant', fullContent);

            // Log to session
            await this.logToSession('stream-completion', {
                prompt: prompt.substring(0, 100) + '...',
                responseLength: fullContent.length,
                chunks: chunkIndex,
                duration: Date.now() - startTime
            });

        } catch (error) {
            this.logger.error('Stream completion failed', error instanceof Error ? error : new Error(String(error)));
            this.emit('error', error);
            throw error;
        }
    }

    /**
     * Continue a conversation with context
     */
    async continueConversation(
        prompt: string,
        options: CompletionOptions = {}
    ): Promise<CompletionResponse> {
        const messages = [
            ...this.conversationHistory.map(msg => ({
                role: msg.role as 'user' | 'assistant',
                content: msg.content
            })),
            { role: 'user' as const, content: prompt }
        ];

        try {
            const message = await this.anthropic.messages.create({
                model: options.model || this.defaultModel,
                max_tokens: options.maxTokens || 4096,
                temperature: options.temperature || 0.7,
                system: options.system,
                messages,
                stop_sequences: options.stopSequences
            });

            const response = this.parseResponse(message, 0);
            
            this.addToHistory('user', prompt);
            this.addToHistory('assistant', response.content);
            
            return response;

        } catch (error) {
            this.logger.error('Conversation continuation failed', error instanceof Error ? error : new Error(String(error)));
            throw error;
        }
    }

    /**
     * Analyze code with specific focus
     */
    async analyzeCode(request: CodeAnalysisRequest): Promise<CompletionResponse> {
        const prompts = {
            security: `Analyze this ${request.language} code for security vulnerabilities. Focus on:
- Injection vulnerabilities (SQL, command, etc.)
- Authentication and authorization issues
- Data exposure risks
- Input validation problems
- Cryptographic weaknesses

Code:
\`\`\`${request.language}
${request.code}
\`\`\`

Provide specific vulnerabilities found, their severity, and remediation suggestions.`,

            performance: `Analyze this ${request.language} code for performance issues. Focus on:
- Time complexity problems
- Memory usage inefficiencies
- Database query optimization
- Caching opportunities
- Algorithmic improvements

Code:
\`\`\`${request.language}
${request.code}
\`\`\`

Provide specific performance issues, their impact, and optimization suggestions.`,

            quality: `Analyze this ${request.language} code for quality issues. Focus on:
- Code maintainability
- Readability and clarity
- Design patterns and best practices
- Code duplication
- Testing coverage

Code:
\`\`\`${request.language}
${request.code}
\`\`\`

Provide specific quality issues and improvement suggestions.`,

            bugs: `Analyze this ${request.language} code for potential bugs. Focus on:
- Logic errors
- Edge cases not handled
- Null/undefined reference errors
- Race conditions
- Error handling issues

Code:
\`\`\`${request.language}
${request.code}
\`\`\`

Provide specific bugs found and fixes.`,

            all: `Provide a comprehensive analysis of this ${request.language} code covering security, performance, quality, and potential bugs.

Code:
\`\`\`${request.language}
${request.code}
\`\`\`

Structure your analysis with sections for each concern type.`
        };

        const prompt = prompts[request.analysisType];
        const system = `You are an expert ${request.language} developer and code reviewer. 
Provide specific, actionable feedback with code examples where applicable.`;

        const response = await this.complete(prompt, { 
            system,
            temperature: 0.3, // Lower temperature for more focused analysis
            maxTokens: 4096
        });

        // Log code analysis to session
        await this.logToSession('code-analysis', {
            language: request.language,
            analysisType: request.analysisType,
            codeLength: request.code.length,
            issuesFound: this.extractIssueCount(response.content)
        });

        return response;
    }

    /**
     * Generate code based on specifications
     */
    async generateCode(request: CodeGenerationRequest): Promise<CompletionResponse> {
        let prompt = `Generate ${request.language} code for the following specification:

${request.specification}

Requirements:
- Language: ${request.language}`;

        if (request.framework) {
            prompt += `\n- Framework: ${request.framework}`;
        }
        if (request.style) {
            prompt += `\n- Programming style: ${request.style}`;
        }
        if (request.includeTests) {
            prompt += `\n- Include comprehensive unit tests`;
        }
        if (request.includeComments) {
            prompt += `\n- Include detailed comments explaining the code`;
        }

        prompt += `\n\nProvide complete, production-ready code that follows best practices.`;

        const system = `You are an expert ${request.language} developer. 
Generate clean, efficient, well-structured code that follows industry best practices and conventions.`;

        const response = await this.complete(prompt, {
            system,
            temperature: 0.5, // Balanced for creativity and consistency
            maxTokens: 4096
        });

        // Log code generation
        await this.logToSession('code-generation', {
            language: request.language,
            framework: request.framework,
            style: request.style,
            specificationLength: request.specification.length,
            generatedLength: response.content.length
        });

        return response;
    }

    /**
     * Calculate cost estimate for usage
     */
    calculateCost(usage: UsageStats): number {
        // Pricing as of 2024 (update as needed)
        const pricing: Record<string, { input: number; output: number }> = {
            'claude-3-opus-20240229': { input: 0.015, output: 0.075 },
            'claude-3-sonnet-20240229': { input: 0.003, output: 0.015 },
            'claude-3-haiku-20240307': { input: 0.00025, output: 0.00125 }
        };

        const modelPricing = pricing[this.defaultModel] || pricing['claude-3-sonnet-20240229'];
        
        const inputCost = (usage.promptTokens / 1000) * modelPricing.input;
        const outputCost = (usage.completionTokens / 1000) * modelPricing.output;
        
        return Math.round((inputCost + outputCost) * 10000) / 10000; // Round to 4 decimals
    }

    /**
     * Get conversation history
     */
    getConversationHistory(): ConversationMessage[] {
        return [...this.conversationHistory];
    }

    /**
     * Clear conversation history
     */
    clearConversation(): void {
        this.conversationHistory = [];
        this.logger.info('Conversation history cleared');
    }

    /**
     * Get total tokens used
     */
    getTotalTokensUsed(): number {
        return this.totalTokensUsed;
    }

    /**
     * Private helper methods
     */
    private parseResponse(message: any, duration: number): CompletionResponse {
        const content = message.content[0].text;
        
        const usage: UsageStats = {
            promptTokens: message.usage.input_tokens,
            completionTokens: message.usage.output_tokens,
            totalTokens: message.usage.input_tokens + message.usage.output_tokens
        };

        this.totalTokensUsed += usage.totalTokens;
        usage.cost = this.calculateCost(usage);

        return {
            content,
            model: message.model,
            usage,
            stopReason: message.stop_reason,
            metadata: {
                messageId: message.id,
                duration
            }
        };
    }

    private addToHistory(role: 'user' | 'assistant', content: string): void {
        this.conversationHistory.push({
            role,
            content,
            timestamp: new Date()
        });

        // Keep history manageable (last 20 messages)
        if (this.conversationHistory.length > 20) {
            this.conversationHistory = this.conversationHistory.slice(-20);
        }
    }

    private async logToSession(action: string, data: any): Promise<void> {
        try {
            // Log the activity using the logger instead
            this.logger.info(`Session activity: ${action}`, {
                component: 'AnthropicSDKManager',
                action: action,
                duration: data.duration
            });
        } catch (error) {
            this.logger.error('Failed to log to session', error instanceof Error ? error : new Error(String(error)));
        }
    }

    private extractIssueCount(analysis: string): number {
        const matches = analysis.match(
            /issue|problem|vulnerability|bug|error|warning|concern/gi
        );
        return matches ? matches.length : 0;
    }
}