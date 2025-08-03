/**
 * Anthropic CLI Commands - Interactive AI Integration
 * CES v2.6.0 Enterprise Edition
 */

import { Command } from 'commander';
import { AnthropicIntegrationHelper } from '../integrations/anthropic/AnthropicIntegrationHelper.js';
import { ConfigManager } from '../config/ConfigManager.js';
import { SessionManager } from '../session/SessionManager.js';
import { createLogger, ComponentLogger } from '../utils/Logger.js';
import chalk from 'chalk';

export class AnthropicCLI {
    private logger: ComponentLogger;
    private integration: AnthropicIntegrationHelper | null = null;
    private configManager: ConfigManager;
    private sessionManager: SessionManager;

    constructor(
        configManager: ConfigManager,
        sessionManager: SessionManager
    ) {
        this.logger = createLogger('AnthropicCLI');
        this.configManager = configManager;
        this.sessionManager = sessionManager;
    }

    private getIntegration(): AnthropicIntegrationHelper {
        if (!this.integration) {
            this.integration = new AnthropicIntegrationHelper(
                this.configManager,
                this.sessionManager
            );
        }
        return this.integration;
    }

    setupCommands(program: Command): void {
        const anthropic = program
            .command('ai')
            .alias('anthropic')
            .description('Anthropic AI integration commands');

        // Quick prompt command
        anthropic
            .command('ask <prompt...>')
            .description('Ask Claude a question')
            .option('-m, --model <model>', 'Model to use')
            .option('-t, --temperature <temp>', 'Temperature (0-1)', parseFloat)
            .option('-s, --stream', 'Stream the response')
            .action(async (promptParts, options) => {
                const prompt = promptParts.join(' ');

                try {
                    if (options.stream) {
                        console.log(chalk.cyan('Claude:'));
                        
                        const sdk = this.getIntegration().getAnthropicSDK();
                        for await (const chunk of sdk.streamComplete(prompt, options)) {
                            if (!chunk.isComplete) {
                                process.stdout.write(chunk.content);
                            }
                        }
                        console.log('\n');
                    } else {
                        console.log(chalk.cyan('Claude is thinking...'));
                        const response = await this.getIntegration().getAnthropicSDK()
                            .complete(prompt, options);
                        
                        console.log(chalk.cyan('\nClaude:'));
                        console.log(response.content);
                        console.log(chalk.gray(`\nTokens: ${response.usage.totalTokens} | Cost: $${response.usage.cost}`));
                    }
                } catch (error) {
                    console.error(chalk.red('❌ Failed to get response:'), (error as Error).message);
                    this.logger.error('Command failed', error instanceof Error ? error : new Error(String(error)));
                }
            });

        // Code analysis command
        anthropic
            .command('analyze <files...>')
            .description('Analyze code files')
            .option('-t, --type <type>', 'Analysis type (security/performance/quality/bugs/all)', 'all')
            .action(async (files, options) => {
                console.log(chalk.cyan('Analyzing code...'));

                try {
                    const results = await this.getIntegration().analyzeProject(
                        files,
                        options.type
                    );

                    console.log(chalk.green('✅ Analysis complete'));

                    for (const result of results) {
                        if (result.summary) {
                            console.log(chalk.yellow('\n=== Summary ==='));
                            console.log(result.summary);
                        } else if (result.error) {
                            console.log(chalk.red(`\n=== ${result.file} - ERROR ===`));
                            console.log(result.error);
                        } else {
                            console.log(chalk.green(`\n=== ${result.file} ===`));
                            console.log(result.analysis);
                            console.log(chalk.gray(`Tokens: ${result.usage.totalTokens}`));
                        }
                    }
                } catch (error) {
                    console.error(chalk.red('❌ Analysis failed:'), (error as Error).message);
                    this.logger.error('Analysis failed', error instanceof Error ? error : new Error(String(error)));
                }
            });

        // Code generation command
        anthropic
            .command('generate')
            .description('Generate code from specification')
            .option('-l, --language <lang>', 'Programming language', 'typescript')
            .option('-f, --framework <framework>', 'Framework to use')
            .option('-s, --style <style>', 'Code style (functional/oop/procedural)')
            .option('--with-tests', 'Include unit tests')
            .option('--with-review', 'Review and improve generated code')
            .action(async (options) => {
                try {
                    // Simple prompt for specification
                    const readline = await import('readline');
                    const rl = readline.createInterface({
                        input: process.stdin,
                        output: process.stdout
                    });

                    const specification = await new Promise<string>((resolve) => {
                        rl.question('Enter your code specification: ', (answer) => {
                            rl.close();
                            resolve(answer);
                        });
                    });

                    console.log(chalk.cyan('Generating code...'));

                    if (options.withReview) {
                        const result = await this.getIntegration().generateAndReview({
                            specification,
                            language: options.language,
                            framework: options.framework,
                            style: options.style,
                            includeTests: options.withTests
                        });

                        console.log(chalk.green('✅ Code generated and reviewed'));
                        
                        console.log(chalk.green('\n=== Generated Code ==='));
                        console.log(result.code);
                        
                        console.log(chalk.yellow('\n=== Review ==='));
                        console.log(result.review);
                        
                        console.log(chalk.cyan('\n=== Improved Version ==='));
                        console.log(result.improved);
                    } else {
                        const response = await this.getIntegration().getAnthropicSDK()
                            .generateCode({
                                specification,
                                language: options.language,
                                framework: options.framework,
                                style: options.style,
                                includeTests: options.withTests,
                                includeComments: true
                            });

                        console.log(chalk.green('✅ Code generated'));
                        console.log(chalk.green('\n=== Generated Code ==='));
                        console.log(response.content);
                    }
                } catch (error) {
                    console.error(chalk.red('❌ Generation failed:'), (error as Error).message);
                    this.logger.error('Generation failed', error instanceof Error ? error : new Error(String(error)));
                }
            });

        // Interactive session
        anthropic
            .command('chat')
            .description('Start interactive chat with Claude')
            .action(async () => {
                console.log(chalk.cyan('Starting chat with Claude...'));
                console.log(chalk.gray('Type "exit" to quit\n'));

                const readline = await import('readline');
                const rl = readline.createInterface({
                    input: process.stdin,
                    output: process.stdout
                });

                const sdk = this.getIntegration().getAnthropicSDK();

                const chat = async (): Promise<void> => {
                    rl.question(chalk.green('You: '), async (message) => {
                        if (message.toLowerCase() === 'exit') {
                            console.log(chalk.yellow('Goodbye!'));
                            rl.close();
                            return;
                        }

                        try {
                            console.log(chalk.cyan('Claude is thinking...'));
                            const response = await sdk.continueConversation(message);
                            console.log(chalk.cyan('Claude:'), response.content);
                            console.log(chalk.gray(`(Tokens: ${response.usage.totalTokens})\n`));
                        } catch (error) {
                            console.error(chalk.red('❌ Failed to get response:'), (error as Error).message);
                            this.logger.error('Chat error', error instanceof Error ? error : new Error(String(error)));
                        }

                        // Continue the chat
                        chat();
                    });
                };

                chat();
            });

        // Show usage stats
        anthropic
            .command('stats')
            .description('Show API usage statistics')
            .action(async () => {
                try {
                    const sdk = this.getIntegration().getAnthropicSDK();
                    const tokens = sdk.getTotalTokensUsed();
                    const history = sdk.getConversationHistory();

                    console.log(chalk.cyan('=== Anthropic API Usage ==='));
                    console.log(`Total tokens used: ${tokens}`);
                    console.log(`Conversation messages: ${history.length}`);
                    console.log(`Estimated cost: $${(tokens * 0.003 / 1000).toFixed(4)}`);
                } catch (error) {
                    console.error(chalk.red('❌ Failed to get stats:'), (error as Error).message);
                    this.logger.error('Stats error', error instanceof Error ? error : new Error(String(error)));
                }
            });
    }
}