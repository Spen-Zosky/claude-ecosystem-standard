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
        console.log('Security Analysis:');
        console.log(analysis.content.substring(0, 300) + '...');
        console.log(`Usage: ${analysis.usage.totalTokens} tokens\n`);

        // Example 4: Code generation
        console.log('⚡ Example 4: Code generation');
        const generated = await integration.getAnthropicSDK().generateCode({
            specification: 'Create a function to validate email addresses using regex',
            language: 'typescript',
            includeTests: true,
            includeComments: true
        });
        console.log('Generated Code:');
        console.log(generated.content.substring(0, 400) + '...');
        console.log(`Usage: ${generated.usage.totalTokens} tokens\n`);

        // Example 5: Generate and review
        console.log('🔄 Example 5: Generate with automatic review');
        const generatedWithReview = await integration.generateAndReview({
            specification: 'Create a simple password strength validator',
            language: 'typescript',
            includeTests: true
        });
        
        console.log('Original Code:');
        console.log(generatedWithReview.code.substring(0, 200) + '...\n');
        
        console.log('Code Review:');
        console.log(generatedWithReview.review.substring(0, 200) + '...\n');
        
        console.log('Improved Code:');
        console.log(generatedWithReview.improved.substring(0, 200) + '...\n');

        // Example 6: Project analysis
        console.log('📊 Example 6: Multi-file project analysis');
        const projectFiles = [
            'src/index.ts',
            'src/config/ConfigManager.ts'
        ];
        
        const projectAnalysis = await integration.analyzeProject(
            projectFiles,
            'quality'
        );
        
        console.log(`Analyzed ${projectFiles.length} files:`);
        projectAnalysis.forEach((result, index) => {
            if (result.summary) {
                console.log('\nProject Summary:');
                console.log(result.summary.substring(0, 200) + '...');
            } else if (result.error) {
                console.log(`❌ ${result.file}: ${result.error}`);
            } else {
                console.log(`✅ ${result.file}: Analysis completed (${result.usage.totalTokens} tokens)`);
            }
        });

        // Example 7: Conversation context
        console.log('\n💬 Example 7: Conversation with context');
        await integration.getAnthropicSDK().complete('My name is John and I am a TypeScript developer');
        
        const contextResponse = await integration.getAnthropicSDK().continueConversation(
            'What programming language do I work with?'
        );
        console.log('Claude (with context):', contextResponse.content.substring(0, 100) + '...');

        // Example 8: Usage statistics
        console.log('\n📈 Example 8: Usage statistics');
        const sdk = integration.getAnthropicSDK();
        const totalTokens = sdk.getTotalTokensUsed();
        const conversationHistory = sdk.getConversationHistory();
        
        console.log(`Total tokens used in this session: ${totalTokens}`);
        console.log(`Conversation messages: ${conversationHistory.length}`);
        console.log(`Estimated total cost: $${(totalTokens * 0.003 / 1000).toFixed(4)}`);

        console.log('\n✅ All examples completed successfully!');
        
    } catch (error) {
        console.error('❌ Error running examples:', (error as Error).message);
        
        if ((error as Error).message.includes('API key')) {
            console.log('\n💡 To run these examples:');
            console.log('1. Set your Anthropic API key: export ANTHROPIC_API_KEY=your-key-here');
            console.log('2. Run: npx tsx examples/anthropic-usage.ts');
        }
    }
}

// Run examples if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    examples().catch(console.error);
}

export { examples };