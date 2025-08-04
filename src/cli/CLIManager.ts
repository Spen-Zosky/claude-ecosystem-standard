/**
 * CLI Manager for Claude Ecosystem Standard (CES)
 * Handles interactive CLI, status display, and user interactions
 */

import chalk from 'chalk';
import inquirer from 'inquirer';
import { SessionManager } from '../session/SessionManager.js';
import { ConfigManager } from '../config/ConfigManager.js';
import { 
    ProjectHealth, 
    EnvironmentConfig
} from '../types/index.js';
import { DocumentationCommands } from './DocumentationCommands.js';

export class CLIManager {
    private documentationCommands: DocumentationCommands;

    constructor(
        private sessionManager: SessionManager,
        private configManager: ConfigManager
    ) {
        this.documentationCommands = new DocumentationCommands();
    }

    /**
     * Show current system and session status
     */
    async showStatus(): Promise<void> {
        try {
            console.log(chalk.cyan('\n╔══════════════════════════════════════════════════════════╗'));
            console.log(chalk.cyan('║           CLAUDE ECOSYSTEM STANDARD - STATUS             ║'));
            console.log(chalk.cyan('╚══════════════════════════════════════════════════════════╝\n'));

            // Initialize configuration if needed
            await this.configManager.initialize();
            const config = this.configManager.getConfig();
            const health = await this.configManager.performHealthCheck();

            // Project Information
            this.displayProjectInfo(config);

            // Session Information
            this.displaySessionInfo();

            // Health Check
            this.displayHealthCheck(health);

            // MCP Servers
            await this.displayMCPServers();

            // Agents
            await this.displayAgents();

            console.log(chalk.cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'));

        } catch (error) {
            console.error(chalk.red('❌ Error displaying status:'), (error as Error).message);
        }
    }

    /**
     * Handle configuration commands
     */
    async handleConfig(options: any): Promise<void> {
        try {
            if (options.show) {
                await this.showConfiguration();
            } else if (options.reset) {
                await this.resetConfiguration();
            } else {
                console.log(chalk.yellow('Use --show to display configuration or --reset to reset to defaults'));
            }
        } catch (error) {
            console.error(chalk.red('❌ Error handling configuration:'), (error as Error).message);
        }
    }

    /**
     * Handle documentation commands for Dual Claude System
     */
    async handleDocs(args: string[]): Promise<number> {
        try {
            return await this.documentationCommands.handleDocsCommand(args);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error(chalk.red('❌ Error handling documentation command:'), errorMessage);
            return 1;
        }
    }

    /**
     * Start interactive CLI mode
     */
    async startInteractive(): Promise<void> {
        try {
            console.log(chalk.cyan('\n🎮 Claude Ecosystem Standard - Interactive Mode\n'));

            while (true) {
                const { action } = await inquirer.prompt([{
                    type: 'list',
                    name: 'action',
                    message: 'What would you like to do?',
                    choices: [
                        { name: '🚀 Start new session', value: 'start' },
                        { name: '📸 Create checkpoint', value: 'checkpoint' },
                        { name: '🔄 Close session', value: 'close' },
                        { name: '📊 Show status', value: 'status' },
                        { name: '⚙️ Show configuration', value: 'config' },
                        { name: '📚 Documentation commands', value: 'docs' },
                        { name: '🧹 Clean history', value: 'clean' },
                        { name: '❌ Exit', value: 'exit' }
                    ]
                }]);

                try {
                    switch (action) {
                        case 'start':
                            await this.interactiveStartSession();
                            break;
                        case 'checkpoint':
                            await this.interactiveCreateCheckpoint();
                            break;
                        case 'close':
                            await this.interactiveCloseSession();
                            break;
                        case 'status':
                            await this.showStatus();
                            break;
                        case 'config':
                            await this.showConfiguration();
                            break;
                        case 'docs':
                            await this.interactiveDocsMenu();
                            break;
                        case 'clean':
                            await this.interactiveCleanHistory();
                            break;
                        case 'exit':
                            console.log(chalk.blue('👋 Goodbye!'));
                            return;
                    }
                } catch (error) {
                    console.error(chalk.red('❌ Error:'), (error as Error).message);
                }

                // Wait for user to continue
                await inquirer.prompt([{
                    type: 'input',
                    name: 'continue',
                    message: 'Press Enter to continue...'
                }]);
            }

        } catch (error) {
            console.error(chalk.red('❌ Error in interactive mode:'), (error as Error).message);
        }
    }

    /**
     * Display project information
     */
    private displayProjectInfo(config: EnvironmentConfig): void {
        console.log(chalk.blue('📁 PROJECT INFORMATION'));
        console.log(chalk.gray('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
        console.log(chalk.white('   Name:'), config.projectName);
        console.log(chalk.white('   Path:'), config.projectRoot);

        if (config.languages.length > 0) {
            const languageDisplay = config.languages
                .map(l => `${l.emoji} ${l.name} (${l.confidence}%)`)
                .join(', ');
            console.log(chalk.white('   Languages:'), languageDisplay);
        }

        if (config.frameworks.length > 0) {
            console.log(chalk.white('   Frameworks:'), config.frameworks.join(', '));
        }

        if (config.tools.length > 0) {
            console.log(chalk.white('   Tools:'), config.tools.join(', '));
        }

        console.log(chalk.white('   Git Repository:'), config.hasGit ? chalk.green('✅ Yes') : chalk.gray('❌ No'));
        console.log();
    }

    /**
     * Display session information
     */
    private displaySessionInfo(): void {
        const session = this.sessionManager.getCurrentSession();
        
        console.log(chalk.blue('📊 SESSION INFORMATION'));
        console.log(chalk.gray('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));

        if (session) {
            console.log(chalk.white('   Status:'), chalk.green('🟢 Active'));
            console.log(chalk.white('   ID:'), session.id);
            console.log(chalk.white('   Name:'), session.name);
            console.log(chalk.white('   Started:'), session.startTime.toLocaleString());
            console.log(chalk.white('   Checkpoints:'), session.checkpoints.length);
        } else {
            console.log(chalk.white('   Status:'), chalk.gray('⚫ No active session'));
        }
        console.log();
    }

    /**
     * Display health check results
     */
    private displayHealthCheck(health: ProjectHealth): void {
        console.log(chalk.blue('🏥 HEALTH CHECK'));
        console.log(chalk.gray('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));

        const overallEmoji = health.overall === 'healthy' ? '✅' : 
                            health.overall === 'warning' ? '⚠️' : '❌';
        const overallColor = health.overall === 'healthy' ? chalk.green : 
                            health.overall === 'warning' ? chalk.yellow : chalk.red;
        
        console.log(chalk.white('   Overall:'), overallColor(`${overallEmoji} ${health.overall.toUpperCase()}`));

        const checks = [
            { name: 'Languages', check: health.languages },
            { name: 'MCP Config', check: health.mcp },
            { name: 'Agents', check: health.agents },
            { name: 'Git Repository', check: health.git },
            { name: 'Environment', check: health.environment }
        ];

        for (const { name, check } of checks) {
            const statusEmoji = check.status === 'pass' ? '✅' : 
                               check.status === 'warning' ? '⚠️' : '❌';
            const statusColor = check.status === 'pass' ? chalk.green : 
                               check.status === 'warning' ? chalk.yellow : chalk.red;
            
            console.log(chalk.white(`   ${name}:`), statusColor(`${statusEmoji} ${check.message}`));
        }
        console.log();
    }

    /**
     * Display MCP servers
     */
    private async displayMCPServers(): Promise<void> {
        try {
            const servers = await this.configManager.loadMCPServers();
            
            console.log(chalk.blue('🔌 MCP SERVERS'));
            console.log(chalk.gray('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));

            if (servers.length === 0) {
                console.log(chalk.gray('   No MCP servers configured'));
            } else {
                const categories = {
                    critical: servers.filter(s => s.priority === 'critical'),
                    high: servers.filter(s => s.priority === 'high'),
                    medium: servers.filter(s => s.priority === 'medium'),
                    low: servers.filter(s => s.priority === 'low')
                };

                for (const [priority, categoryServers] of Object.entries(categories)) {
                    if (categoryServers.length > 0) {
                        const priorityColor = priority === 'critical' ? chalk.red :
                                            priority === 'high' ? chalk.yellow :
                                            priority === 'medium' ? chalk.blue : chalk.gray;
                        
                        console.log(chalk.white(`   ${priority.toUpperCase()} (${categoryServers.length}):`));
                        for (const server of categoryServers) {
                            const statusEmoji = server.status === 'connected' ? '🟢' : 
                                              server.status === 'disconnected' ? '🔴' : '⚠️';
                            console.log(priorityColor(`     ${statusEmoji} ${server.name}`));
                        }
                    }
                }
            }
            console.log();
        } catch (error) {
            console.log(chalk.red('   ❌ Error loading MCP servers:'), (error as Error).message);
            console.log();
        }
    }

    /**
     * Display agents
     */
    private async displayAgents(): Promise<void> {
        try {
            const agents = await this.configManager.loadAgents();
            
            console.log(chalk.blue('🤖 SPECIALIZED AGENTS'));
            console.log(chalk.gray('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));

            if (agents.length === 0) {
                console.log(chalk.gray('   No specialized agents found'));
            } else {
                const categories = {
                    'Core Development': ['solution-architect', 'fullstack-developer', 'backend-developer-specialist', 'frontend-developer-specialist'],
                    'Infrastructure': ['devops-engineer', 'data-architect-specialist'],
                    'Quality & Compliance': ['debugger-tester', 'compliance-manager'],
                    'Specialized': ['data-mining-specialist', 'ux-ix-designer', 'technical-writer'],
                    'General': ['general-purpose']
                };

                for (const [category, agentNames] of Object.entries(categories)) {
                    const categoryAgents = agents.filter(a => agentNames.includes(a.name));
                    
                    if (categoryAgents.length > 0) {
                        console.log(chalk.white(`   ${category} (${categoryAgents.length}):`));
                        for (const agent of categoryAgents) {
                            const priorityEmoji = agent.priority === 'high' ? '🔥' : 
                                                agent.priority === 'medium' ? '📋' : '📝';
                            const enabledEmoji = agent.enabled ? '✅' : '❌';
                            console.log(chalk.cyan(`     ${enabledEmoji} ${priorityEmoji} ${agent.name}`));
                        }
                    }
                }

                console.log(chalk.white(`   Total: ${agents.length} agents available`));
            }
            console.log();
        } catch (error) {
            console.log(chalk.red('   ❌ Error loading agents:'), (error as Error).message);
            console.log();
        }
    }

    /**
     * Show configuration
     */
    private async showConfiguration(): Promise<void> {
        try {
            const config = this.configManager.getConfig();
            
            console.log(chalk.cyan('\n🔧 CONFIGURATION\n'));
            console.log(chalk.yellow('Project Configuration:'));
            console.log(JSON.stringify(config, null, 2));

        } catch (error) {
            console.error(chalk.red('❌ Error showing configuration:'), (error as Error).message);
        }
    }

    /**
     * Reset configuration
     */
    private async resetConfiguration(): Promise<void> {
        try {
            const { confirm } = await inquirer.prompt([{
                type: 'confirm',
                name: 'confirm',
                message: 'Are you sure you want to reset configuration to defaults?',
                default: false
            }]);

            if (confirm) {
                await this.configManager.resetToDefaults();
                console.log(chalk.green('✅ Configuration reset to defaults'));
            } else {
                console.log(chalk.blue('Configuration reset cancelled'));
            }

        } catch (error) {
            console.error(chalk.red('❌ Error resetting configuration:'), (error as Error).message);
        }
    }

    /**
     * Interactive start session
     */
    private async interactiveStartSession(): Promise<void> {
        const session = this.sessionManager.getCurrentSession();
        
        if (session) {
            const { force } = await inquirer.prompt([{
                type: 'confirm',
                name: 'force',
                message: 'A session is already active. Force start new session?',
                default: false
            }]);

            if (!force) {
                console.log(chalk.blue('Session start cancelled'));
                return;
            }
        }

        await this.sessionManager.startSession(true);
    }

    /**
     * Interactive create checkpoint
     */
    private async interactiveCreateCheckpoint(): Promise<void> {
        const session = this.sessionManager.getCurrentSession();
        
        if (!session) {
            console.log(chalk.yellow('⚠️ No active session to checkpoint'));
            return;
        }

        const { message } = await inquirer.prompt([{
            type: 'input',
            name: 'message',
            message: 'Enter checkpoint message (optional):'
        }]);

        await this.sessionManager.createCheckpoint(message || undefined);
    }

    /**
     * Interactive close session
     */
    private async interactiveCloseSession(): Promise<void> {
        const session = this.sessionManager.getCurrentSession();
        
        if (!session) {
            console.log(chalk.yellow('⚠️ No active session to close'));
            return;
        }

        const { save } = await inquirer.prompt([{
            type: 'confirm',
            name: 'save',
            message: 'Save session data before closing?',
            default: true
        }]);

        await this.sessionManager.closeSession(save);
    }

    /**
     * Interactive clean history
     */
    private async interactiveCleanHistory(): Promise<void> {
        const { confirm } = await inquirer.prompt([{
            type: 'confirm',
            name: 'confirm',
            message: 'This will clean all session history (backup will be created). Continue?',
            default: false
        }]);

        if (confirm) {
            await this.sessionManager.cleanHistory(true);
        } else {
            console.log(chalk.blue('History cleaning cancelled'));
        }
    }

    /**
     * Interactive documentation commands menu
     */
    private async interactiveDocsMenu(): Promise<void> {
        const { action } = await inquirer.prompt([{
            type: 'list',
            name: 'action',
            message: 'Choose documentation command:',
            choices: [
                { name: '📖 Show merged documentation', value: 'show' },
                { name: '🔄 Regenerate documentation', value: 'regenerate' },
                { name: '✅ Validate documentation', value: 'validate' },
                { name: '✏️ Edit project documentation', value: 'edit' },
                { name: '🔧 Debug documentation system', value: 'debug' },
                { name: '⬅️ Back to main menu', value: 'back' }
            ]
        }]);

        if (action === 'back') {
            return;
        }

        const result = await this.handleDocs([action]);
        
        if (result !== 0) {
            console.log(chalk.red(`\n❌ Documentation command '${action}' completed with errors.`));
        } else {
            console.log(chalk.green(`\n✅ Documentation command '${action}' completed successfully.`));
        }
    }

    /**
     * Comprehensive validation of CES setup and Claude Code CLI integration
     */
    async validateSetup(_verbose: boolean = false): Promise<void> {
        try {
            console.log(chalk.cyan('\n╔══════════════════════════════════════════════════════════╗'));
            console.log(chalk.cyan('║           CES VALIDATION - COMPREHENSIVE CHECK           ║'));
            console.log(chalk.cyan('╚══════════════════════════════════════════════════════════╝\n'));

            let score = 0;
            let maxScore = 0;

            // 1. TypeScript Environment
            console.log(chalk.blue('🔷 TypeScript Environment'));
            maxScore += 20;
            
            const hasPackageJson = await this.configManager.fileExists('package.json');
            const hasTsConfig = await this.configManager.fileExists('tsconfig.json');
            const hasSourceDir = await this.configManager.fileExists('src');
            const hasDistDir = await this.configManager.fileExists('dist');
            
            if (hasPackageJson) {
                console.log(chalk.green('   ✅ package.json found'));
                score += 5;
            } else {
                console.log(chalk.red('   ❌ package.json missing'));
            }
            
            if (hasTsConfig) {
                console.log(chalk.green('   ✅ tsconfig.json found'));
                score += 5;
            } else {
                console.log(chalk.red('   ❌ tsconfig.json missing'));
            }
            
            if (hasSourceDir) {
                console.log(chalk.green('   ✅ src/ directory found'));
                score += 5;
            } else {
                console.log(chalk.red('   ❌ src/ directory missing'));
            }
            
            if (hasDistDir) {
                console.log(chalk.green('   ✅ dist/ directory found (compiled)'));
                score += 5;
            } else {
                console.log(chalk.yellow('   ⚠️  dist/ directory missing (run npm run build)'));
            }

            // 2. CES Core Components  
            console.log(chalk.blue('\n🎯 CES Core Components'));
            maxScore += 25;
            
            const hasSessionManager = await this.configManager.fileExists('src/session/SessionManager.ts');
            const hasConfigManager = await this.configManager.fileExists('src/config/ConfigManager.ts');
            const hasCLIManager = await this.configManager.fileExists('src/cli/CLIManager.ts');
            const hasAutoTask = await this.configManager.fileExists('src/cli/AutoTaskManager.ts');
            const hasCleanup = await this.configManager.fileExists('src/cli/SystemCleanupManager.ts');
            
            if (hasSessionManager) {
                console.log(chalk.green('   ✅ SessionManager.ts found'));
                score += 5;
            } else {
                console.log(chalk.red('   ❌ SessionManager.ts missing'));
            }
            
            if (hasConfigManager) {
                console.log(chalk.green('   ✅ ConfigManager.ts found'));
                score += 5;
            } else {
                console.log(chalk.red('   ❌ ConfigManager.ts missing'));
            }
            
            if (hasCLIManager) {
                console.log(chalk.green('   ✅ CLIManager.ts found'));
                score += 5;
            } else {
                console.log(chalk.red('   ❌ CLIManager.ts missing'));
            }
            
            if (hasAutoTask) {
                console.log(chalk.green('   ✅ AutoTaskManager.ts found'));
                score += 5;
            } else {
                console.log(chalk.red('   ❌ AutoTaskManager.ts missing'));
            }
            
            if (hasCleanup) {
                console.log(chalk.green('   ✅ SystemCleanupManager.ts found'));
                score += 5;
            } else {
                console.log(chalk.red('   ❌ SystemCleanupManager.ts missing'));
            }

            // 3. Claude Code CLI Integration
            console.log(chalk.blue('\n🤖 Claude Code CLI Integration'));
            maxScore += 30;
            
            const hasClaudeDir = await this.configManager.fileExists('.claude');
            const hasMCPConfig = await this.configManager.fileExists('.claude/claude_desktop_config.json');
            const hasStartupHook = await this.configManager.fileExists('.claude/startup-hook.cjs');
            const hasAgentsDir = await this.configManager.fileExists('.claude/agents');
            const hasTemplatesDir = await this.configManager.fileExists('.claude/templates');
            const hasReadme = await this.configManager.fileExists('.claude/README.md');
            
            if (hasClaudeDir) {
                console.log(chalk.green('   ✅ .claude/ directory found'));
                score += 5;
            } else {
                console.log(chalk.red('   ❌ .claude/ directory missing'));
            }
            
            if (hasMCPConfig) {
                console.log(chalk.green('   ✅ MCP configuration found'));
                score += 10;
            } else {
                console.log(chalk.red('   ❌ MCP configuration missing'));
            }
            
            if (hasStartupHook) {
                console.log(chalk.green('   ✅ Startup hook found'));
                score += 5;
            } else {
                console.log(chalk.red('   ❌ Startup hook missing'));
            }
            
            if (hasAgentsDir) {
                console.log(chalk.green('   ✅ Agents directory found'));
                score += 5;
            } else {
                console.log(chalk.yellow('   ⚠️  Agents directory missing (optional)'));
            }
            
            if (hasTemplatesDir) {
                console.log(chalk.green('   ✅ Templates directory found'));
                score += 3;
            } else {
                console.log(chalk.yellow('   ⚠️  Templates directory missing'));
            }
            
            if (hasReadme) {
                console.log(chalk.green('   ✅ Agent selection guide found'));
                score += 2;
            } else {
                console.log(chalk.yellow('   ⚠️  Agent selection guide missing'));
            }

            // 4. Development Infrastructure
            console.log(chalk.blue('\n🔧 Development Infrastructure'));
            maxScore += 15;
            
            const hasJest = await this.configManager.fileExists('jest.config.js');
            const hasTests = await this.configManager.fileExists('src/__tests__');
            const hasLint = this.configManager.hasScript('lint');
            
            if (hasJest) {
                console.log(chalk.green('   ✅ Jest configuration found'));
                score += 5;
            } else {
                console.log(chalk.yellow('   ⚠️  Jest configuration missing'));
            }
            
            if (hasTests) {
                console.log(chalk.green('   ✅ Test directory found'));
                score += 5;
            } else {
                console.log(chalk.yellow('   ⚠️  Test directory missing'));
            }
            
            if (hasLint) {
                console.log(chalk.green('   ✅ Linting configured'));
                score += 5;
            } else {
                console.log(chalk.yellow('   ⚠️  Linting not configured'));
            }

            // 5. Workflow Integration
            console.log(chalk.blue('\n⚡ Workflow Integration'));
            maxScore += 10;
            
            const hasClaudemd = await this.configManager.fileExists('CLAUDE.md');
            const hasCleanReset = this.configManager.hasScript('dev');
            
            if (hasClaudemd) {
                console.log(chalk.green('   ✅ CLAUDE.md documentation found'));
                score += 5;
            } else {
                console.log(chalk.yellow('   ⚠️  CLAUDE.md documentation missing'));
            }
            
            if (hasCleanReset) {
                console.log(chalk.green('   ✅ Development commands available'));
                score += 5;
            } else {
                console.log(chalk.red('   ❌ Development commands missing'));
            }

            // Final Score
            const percentage = Math.round((score / maxScore) * 100);
            console.log(chalk.cyan('\n╔══════════════════════════════════════════════════════════╗'));
            console.log(chalk.cyan('║                    VALIDATION RESULTS                    ║'));
            console.log(chalk.cyan('╚══════════════════════════════════════════════════════════╝'));
            
            console.log(chalk.white(`\n📊 Score: ${score}/${maxScore} (${percentage}%)`));
            
            if (percentage >= 90) {
                console.log(chalk.green('🏆 EXCELLENT - Production ready CES setup'));
            } else if (percentage >= 75) {
                console.log(chalk.blue('✅ GOOD - CES setup mostly complete'));
            } else if (percentage >= 50) {
                console.log(chalk.yellow('⚠️  PARTIAL - CES setup needs improvements'));
            } else {
                console.log(chalk.red('❌ INCOMPLETE - Major setup issues detected'));
            }
            
            console.log(chalk.cyan('\n🚀 Quick Setup Commands:'));
            console.log(chalk.gray('   npm install && npm run build'));
            console.log(chalk.gray('   npm run dev -- validate --verbose'));
            console.log(chalk.gray('   **start session'));
            
        } catch (error) {
            console.error(chalk.red('❌ Validation failed:'), error instanceof Error ? error.message : error);
        }
    }
}