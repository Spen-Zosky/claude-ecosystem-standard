/**
 * Type definitions for Anthropic SDK integration
 * CES v2.6.0 Enterprise Edition
 */

export interface AnthropicConfig {
    apiKey?: string;
    baseURL?: string;
    timeout?: number;
    maxRetries?: number;
    defaultModel?: string;
}

export interface ConversationMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp?: Date;
    metadata?: Record<string, any>;
}

export interface CompletionOptions {
    model?: string;
    maxTokens?: number;
    temperature?: number;
    topP?: number;
    topK?: number;
    system?: string;
    stream?: boolean;
    stopSequences?: string[];
    metadata?: Record<string, any>;
}

export interface StreamChunk {
    content: string;
    index: number;
    isComplete: boolean;
    metadata?: Record<string, any>;
}

export interface UsageStats {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    cost?: number;
}

export interface CompletionResponse {
    content: string;
    model: string;
    usage: UsageStats;
    stopReason?: string;
    metadata?: Record<string, any>;
}

export interface CodeAnalysisRequest {
    code: string;
    language: string;
    analysisType: 'security' | 'performance' | 'quality' | 'bugs' | 'all';
    context?: string;
}

export interface CodeGenerationRequest {
    specification: string;
    language: string;
    framework?: string;
    style?: 'functional' | 'oop' | 'procedural';
    includeTests?: boolean;
    includeComments?: boolean;
}