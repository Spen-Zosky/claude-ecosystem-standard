/**
 * Anthropic Integration Helper - Smart Execution and Project Analysis
 * CES v2.6.0 Enterprise Edition
 */

import { AnthropicSDKManager } from './AnthropicSDKManager.js';
import { ConfigManager } from '../../config/ConfigManager.js';
import { SessionManager } from '../../session/SessionManager.js';
import { createLogger, ComponentLogger } from '../../utils/Logger.js';
import fs from 'fs-extra';
import {
    CodeGenerationRequest,
    CompletionOptions
} from './types/anthropic.types.js';

/**
 * Helper to integrate both Anthropic SDK and Claude Code CLI
 */
export class AnthropicIntegrationHelper {
    private logger: ComponentLogger;
    private anthropicSDK: AnthropicSDKManager;

    constructor(
        configManager: ConfigManager,
        sessionManager: SessionManager
    ) {
        this.logger = createLogger('AnthropicIntegrationHelper');
        
        // Initialize Anthropic SDK
        this.anthropicSDK = new AnthropicSDKManager(
            configManager,
            sessionManager
        );

        this.logger.system('Anthropic Integration Helper initialized');
    }

    /**
     * Smart execution - uses best tool for the job
     */
    async smartExecute(
        prompt: string,
        options: CompletionOptions & { preferCLI?: boolean } = {}
    ): Promise<any> {
        // For this implementation, we'll use the SDK for general completions
        // In a future enhancement, this could route to Claude Code CLI for file operations
        return await this.anthropicSDK.complete(prompt, options);
    }

    /**
     * Analyze entire project
     */
    async analyzeProject(
        files: string[],
        analysisType: 'security' | 'performance' | 'quality' | 'all' = 'all'
    ): Promise<any[]> {
        const results = [];
        
        for (const file of files) {
            try {
                const code = await this.readFile(file);
                const language = this.detectLanguage(file);
                
                const analysis = await this.anthropicSDK.analyzeCode({
                    code,
                    language,
                    analysisType
                });

                results.push({
                    file,
                    language,
                    analysis: analysis.content,
                    usage: analysis.usage
                });

                this.logger.info('Analyzed file', { 
                    component: 'AnthropicIntegrationHelper',
                    action: 'analyzeProject'
                });

            } catch (error) {
                this.logger.error(`Failed to analyze ${file}`, error instanceof Error ? error : new Error(String(error)));
                results.push({
                    file,
                    error: (error as Error).message
                });
            }
        }

        // Generate summary report
        const summary = await this.generateAnalysisSummary(results);
        
        return [...results, { summary }];
    }

    /**
     * Generate code with review
     */
    async generateAndReview(
        request: CodeGenerationRequest
    ): Promise<{
        code: string;
        review: string;
        improved: string;
    }> {
        // Generate initial code
        const generated = await this.anthropicSDK.generateCode(request);
        const code = this.extractCode(generated.content);

        // Review the generated code
        const review = await this.anthropicSDK.analyzeCode({
            code,
            language: request.language,
            analysisType: 'all'
        });

        // Generate improved version based on review
        const improvementPrompt = `Based on this review:
${review.content}

Improve this code:
\`\`\`${request.language}
${code}
\`\`\`

Provide only the improved code without explanation.`;

        const improved = await this.anthropicSDK.complete(improvementPrompt, {
            temperature: 0.3
        });

        return {
            code,
            review: review.content,
            improved: this.extractCode(improved.content)
        };
    }

    /**
     * Interactive coding session
     */
    async startCodingSession(
        projectContext: string
    ): Promise<any> {
        this.logger.info('Starting interactive coding session');
        
        const systemPrompt = `You are an AI pair programmer working on this project:
${projectContext}

Provide helpful, concise responses. When writing code, use markdown code blocks with language specification.`;

        // Set system prompt for the session
        this.anthropicSDK.clearConversation();
        
        // Initial greeting
        const greeting = await this.anthropicSDK.complete(
            'Hello! I\'m ready to help with the project. What would you like to work on?',
            { system: systemPrompt }
        );

        this.logger.info('Coding session started', {
            component: 'AnthropicIntegrationHelper',
            action: 'startCodingSession'
        });

        return greeting;
    }

    /**
     * Utility methods
     */
    private async readFile(path: string): Promise<string> {
        return await fs.readFile(path, 'utf-8');
    }

    private detectLanguage(filename: string): string {
        const extension = filename.split('.').pop()?.toLowerCase();
        const languageMap: Record<string, string> = {
            'ts': 'typescript',
            'js': 'javascript',
            'py': 'python',
            'java': 'java',
            'cpp': 'cpp',
            'c': 'c',
            'cs': 'csharp',
            'go': 'go',
            'rs': 'rust',
            'rb': 'ruby',
            'php': 'php',
            'swift': 'swift',
            'kt': 'kotlin',
            'scala': 'scala',
            'r': 'r',
            'sql': 'sql',
            'sh': 'bash'
        };
        
        return languageMap[extension || ''] || 'text';
    }

    private extractCode(content: string): string {
        const codeBlockRegex = /```[\w]*\n([\s\S]*?)```/g;
        const matches = [...content.matchAll(codeBlockRegex)];
        
        if (matches.length > 0) {
            return matches.map(match => match[1]).join('\n\n');
        }
        
        return content;
    }

    private extractIssueCount(analysis: string): number {
        const matches = analysis.match(
            /issue|problem|vulnerability|bug|error|warning/gi
        );
        return matches ? matches.length : 0;
    }

    private async generateAnalysisSummary(results: any[]): Promise<string> {
        const fileResults = results.filter(r => !r.summary);
        const totalIssues = fileResults.reduce((sum, r) => {
            return sum + (r.analysis ? this.extractIssueCount(r.analysis) : 0);
        }, 0);

        const prompt = `Generate a concise executive summary for this code analysis:
- Files analyzed: ${fileResults.length}
- Total potential issues found: ${totalIssues}
- Failed analyses: ${fileResults.filter(r => r.error).length}

Focus on the most critical findings and actionable recommendations.`;

        const summary = await this.anthropicSDK.complete(prompt, {
            temperature: 0.3,
            maxTokens: 1000
        });

        return summary.content;
    }

    /**
     * Get managers for direct access
     */
    getAnthropicSDK(): AnthropicSDKManager {
        return this.anthropicSDK;
    }
}