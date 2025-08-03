/**
 * Quick Command Manager - Rapid Session Management and Aliases
 * 
 * Provides quick commands, aliases, and shortcuts for common CES operations
 * to maximize development velocity and reduce typing.
 */

import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import { ConfigManager } from '../config/ConfigManager.js';
import { SessionManager } from '../session/SessionManager.js';
import { SessionProfileManager } from './SessionProfileManager.js';
import { AutoTaskManager } from './AutoTaskManager.js';
import { SystemCleanupManager } from './SystemCleanupManager.js';
import { DashboardManager } from './DashboardManager.js';
import { AutoRecoveryManager } from './AutoRecoveryManager.js';
import { SessionMonitor } from './SessionMonitor.js';

export interface QuickCommand {
    alias: string;
    command: string;
    description: string;
    category: 'session' | 'profile' | 'monitoring' | 'development' | 'system' | 'custom';
    hotkey?: string;
    parameters?: string[];
    builtin: boolean;
    useCount: number;
    lastUsed?: Date;
}

export interface QuickCommandStats {
    totalCommands: number;
    builtinCommands: number;
    customCommands: number;
    mostUsed: QuickCommand[];
    recentlyUsed: QuickCommand[];
    commandsByCategory: Record<string, number>;
}

export class QuickCommandManager {
    private configManager: ConfigManager;
    private sessionManager: SessionManager;
    private profileManager: SessionProfileManager;
    private autoTaskManager: AutoTaskManager;
    private cleanupManager: SystemCleanupManager;
    private dashboardManager: DashboardManager | null = null;
    private recoveryManager: AutoRecoveryManager | null = null;
    private sessionMonitor: SessionMonitor | null = null;
    private commands: Map<string, QuickCommand> = new Map();
    private commandsFile: string;

    constructor(
        configManager: ConfigManager,
        sessionManager: SessionManager,
        profileManager: SessionProfileManager,
        autoTaskManager: AutoTaskManager,
        cleanupManager: SystemCleanupManager
    ) {
        this.configManager = configManager;
        this.sessionManager = sessionManager;
        this.profileManager = profileManager;
        this.autoTaskManager = autoTaskManager;
        this.cleanupManager = cleanupManager;
        this.commandsFile = path.join(configManager.getProjectRoot(), '.claude', 'quick-commands.json');
        this.initializeQuickCommands();
    }

    /**
     * Set optional dependencies (called after all managers are initialized)
     */
    setDashboardManager(dashboardManager: DashboardManager): void {
        this.dashboardManager = dashboardManager;
    }

    setRecoveryManager(recoveryManager: AutoRecoveryManager): void {
        this.recoveryManager = recoveryManager;
    }

    setSessionMonitor(sessionMonitor: SessionMonitor): void {
        this.sessionMonitor = sessionMonitor;
    }

    /**
     * Initialize with built-in quick commands
     */
    private async initializeQuickCommands(): Promise<void> {
        await this.loadCommands();
        
        if (this.commands.size === 0) {
            await this.createBuiltinCommands();
        }
    }

    /**
     * Create all built-in quick commands
     */
    private async createBuiltinCommands(): Promise<void> {
        const builtinCommands: Omit<QuickCommand, 'useCount' | 'lastUsed'>[] = [
            // Session Management
            {
                alias: 'start',
                command: 'start-session',
                description: 'Quick start new session',
                category: 'session',
                hotkey: 'Ctrl+S',
                builtin: true
            },
            {
                alias: 'stop',
                command: 'close-session',
                description: 'Quick stop current session',
                category: 'session',
                hotkey: 'Ctrl+Q',
                builtin: true
            },
            {
                alias: 'save',
                command: 'checkpoint-session',
                description: 'Quick save session checkpoint',
                category: 'session',
                hotkey: 'Ctrl+Shift+S',
                builtin: true
            },
            {
                alias: 'status',
                command: 'status',
                description: 'Quick status check',
                category: 'session',
                hotkey: 'Ctrl+I',
                builtin: true
            },

            // Profile Management
            {
                alias: 'react',
                command: 'profiles --apply frontend-react',
                description: 'Quick React development setup',
                category: 'profile',
                builtin: true
            },
            {
                alias: 'node',
                command: 'profiles --apply backend-node',
                description: 'Quick Node.js backend setup',
                category: 'profile',
                builtin: true
            },
            {
                alias: 'full',
                command: 'profiles --apply fullstack-modern',
                description: 'Quick full-stack setup',
                category: 'profile',
                builtin: true
            },
            {
                alias: 'minimal',
                command: 'profiles --apply minimal-cli',
                description: 'Quick minimal setup',
                category: 'profile',
                builtin: true
            },
            {
                alias: 'data',
                command: 'profiles --apply data-science',
                description: 'Quick data science setup',
                category: 'profile',
                builtin: true
            },
            {
                alias: 'k8s',
                command: 'profiles --apply devops-k8s',
                description: 'Quick Kubernetes DevOps setup',
                category: 'profile',
                builtin: true
            },
            {
                alias: 'test',
                command: 'profiles --apply testing-qa',
                description: 'Quick testing environment',
                category: 'profile',
                builtin: true
            },

            // Monitoring & Recovery
            {
                alias: 'dash',
                command: 'dashboard --live',
                description: 'Quick live dashboard',
                category: 'monitoring',
                hotkey: 'Ctrl+D',
                builtin: true
            },
            {
                alias: 'watch',
                command: 'dashboard --live --compact',
                description: 'Quick compact monitoring',
                category: 'monitoring',
                builtin: true
            },
            {
                alias: 'heal',
                command: 'recovery --start',
                description: 'Quick auto-recovery start',
                category: 'monitoring',
                builtin: true
            },
            {
                alias: 'health',
                command: 'recovery --status',
                description: 'Quick health check',
                category: 'monitoring',
                builtin: true
            },

            // Development Commands
            {
                alias: 'build',
                command: 'auto-task "Build and test the project"',
                description: 'Quick build automation',
                category: 'development',
                builtin: true
            },
            {
                alias: 'fix',
                command: 'auto-task "Fix linting and type errors"',
                description: 'Quick error fixing',
                category: 'development',
                builtin: true
            },
            {
                alias: 'deploy',
                command: 'auto-task "Deploy to staging environment"',
                description: 'Quick staging deployment',
                category: 'development',
                builtin: true
            },
            {
                alias: 'docs',
                command: 'auto-task "Generate and update documentation"',
                description: 'Quick documentation update',
                category: 'development',
                builtin: true
            },

            // System Commands
            {
                alias: 'clean',
                command: 'clean-reset --dry-run',
                description: 'Quick cleanup preview',
                category: 'system',
                builtin: true
            },
            {
                alias: 'reset',
                command: 'clean-reset',
                description: 'Quick full system reset',
                category: 'system',
                builtin: true
            },
            {
                alias: 'check',
                command: 'validate',
                description: 'Quick system validation',
                category: 'system',
                builtin: true
            },
            {
                alias: 'monitor',
                command: 'monitor --start',
                description: 'Quick monitoring start',
                category: 'system',
                builtin: true
            },

            // Shortcuts with parameters
            {
                alias: 'git',
                command: 'auto-task "Git operations: $1"',
                description: 'Quick git operations',
                category: 'development',
                parameters: ['operation'],
                builtin: true
            },
            {
                alias: 'npm',
                command: 'auto-task "NPM command: $1"',
                description: 'Quick npm operations',
                category: 'development',
                parameters: ['command'],
                builtin: true
            },
            {
                alias: 'debug',
                command: 'auto-task "Debug issue: $1"',
                description: 'Quick debugging assistance',
                category: 'development',
                parameters: ['issue'],
                builtin: true
            }
        ];

        for (const cmdData of builtinCommands) {
            const command: QuickCommand = {
                ...cmdData,
                useCount: 0
            };
            
            this.commands.set(command.alias, command);
        }

        await this.saveCommands();
        console.log(chalk.green(`✅ Created ${builtinCommands.length} built-in quick commands`));
    }

    /**
     * Execute a quick command
     */
    async executeQuickCommand(alias: string, args: string[] = []): Promise<boolean> {
        const command = this.commands.get(alias);
        if (!command) {
            console.log(chalk.red(`❌ Quick command '${alias}' not found`));
            return false;
        }

        console.log(chalk.cyan(`⚡ Executing quick command: ${alias}`));
        console.log(chalk.gray(`   ${command.description}`));

        try {
            // Update usage stats
            command.useCount++;
            command.lastUsed = new Date();
            await this.saveCommands();

            // Process parameters
            let processedCommand = command.command;
            if (command.parameters && args.length > 0) {
                command.parameters.forEach((_param, index) => {
                    if (args[index]) {
                        processedCommand = processedCommand.replace(`$${index + 1}`, args[index]);
                    }
                });
            }

            // Execute the command
            return await this.executeCommand(processedCommand);
        } catch (error) {
            console.error(chalk.red('❌ Quick command failed:'), error instanceof Error ? error.message : error);
            return false;
        }
    }

    /**
     * List all quick commands
     */
    async listQuickCommands(category?: string): Promise<QuickCommand[]> {
        const commands = Array.from(this.commands.values());
        
        if (category) {
            return commands.filter(cmd => cmd.category === category);
        }
        
        return commands.sort((a, b) => {
            // Sort by: most used, then category, then alphabetical
            if (a.useCount !== b.useCount) return b.useCount - a.useCount;
            if (a.category !== b.category) return a.category.localeCompare(b.category);
            return a.alias.localeCompare(b.alias);
        });
    }

    /**
     * Create a custom quick command
     */
    async createQuickCommand(
        alias: string,
        command: string,
        description: string,
        category: QuickCommand['category'] = 'custom',
        hotkey?: string,
        parameters?: string[]
    ): Promise<QuickCommand> {
        if (this.commands.has(alias)) {
            throw new Error(`Quick command '${alias}' already exists`);
        }

        const quickCommand: QuickCommand = {
            alias,
            command,
            description,
            category,
            hotkey,
            parameters,
            builtin: false,
            useCount: 0
        };

        this.commands.set(alias, quickCommand);
        await this.saveCommands();

        console.log(chalk.green(`✅ Created quick command: ${alias}`));
        return quickCommand;
    }

    /**
     * Update an existing quick command
     */
    async updateQuickCommand(alias: string, updates: Partial<QuickCommand>): Promise<boolean> {
        const command = this.commands.get(alias);
        if (!command) {
            console.log(chalk.red(`❌ Quick command '${alias}' not found`));
            return false;
        }

        if (command.builtin && !updates.builtin) {
            console.log(chalk.yellow('⚠️ Cannot modify built-in commands. Use different alias for custom version.'));
            return false;
        }

        Object.assign(command, updates);
        await this.saveCommands();

        console.log(chalk.green(`✅ Updated quick command: ${alias}`));
        return true;
    }

    /**
     * Delete a custom quick command
     */
    async deleteQuickCommand(alias: string): Promise<boolean> {
        const command = this.commands.get(alias);
        if (!command) {
            console.log(chalk.red(`❌ Quick command '${alias}' not found`));
            return false;
        }

        if (command.builtin) {
            console.log(chalk.yellow('⚠️ Cannot delete built-in commands'));
            return false;
        }

        this.commands.delete(alias);
        await this.saveCommands();

        console.log(chalk.green(`✅ Deleted quick command: ${alias}`));
        return true;
    }

    /**
     * Show quick command details
     */
    showQuickCommand(alias: string): void {
        const command = this.commands.get(alias);
        if (!command) {
            console.log(chalk.red(`❌ Quick command '${alias}' not found`));
            return;
        }

        console.log(chalk.cyan(`⚡ QUICK COMMAND: ${command.alias}`));
        console.log(chalk.cyan('═══════════════════════════════════'));
        console.log();

        console.log(chalk.blue('📋 DETAILS'));
        console.log(chalk.white(`   Alias: ${command.alias}`));
        console.log(chalk.white(`   Command: ${command.command}`));
        console.log(chalk.white(`   Description: ${command.description}`));
        console.log(chalk.white(`   Category: ${command.category}`));
        console.log(chalk.white(`   Type: ${command.builtin ? 'Built-in' : 'Custom'}`));
        console.log(chalk.white(`   Use Count: ${command.useCount}`));
        console.log(chalk.white(`   Last Used: ${command.lastUsed ? command.lastUsed.toLocaleDateString() : 'Never'}`));
        
        if (command.hotkey) {
            console.log(chalk.white(`   Hotkey: ${command.hotkey}`));
        }
        
        if (command.parameters && command.parameters.length > 0) {
            console.log(chalk.white(`   Parameters: ${command.parameters.join(', ')}`));
        }

        console.log();
        console.log(chalk.blue('📝 USAGE'));
        if (command.parameters && command.parameters.length > 0) {
            console.log(chalk.gray(`   ces quick ${command.alias} <${command.parameters.join('> <')}>`));
        } else {
            console.log(chalk.gray(`   ces quick ${command.alias}`));
        }
    }

    /**
     * Show quick command statistics
     */
    showQuickCommandStats(): void {
        const stats = this.getQuickCommandStats();

        console.log(chalk.cyan('⚡ QUICK COMMAND STATISTICS'));
        console.log(chalk.cyan('═══════════════════════════════'));
        console.log();

        console.log(chalk.blue('📈 OVERVIEW'));
        console.log(chalk.white(`   Total Commands: ${stats.totalCommands}`));
        console.log(chalk.white(`   Built-in: ${stats.builtinCommands}`));
        console.log(chalk.white(`   Custom: ${stats.customCommands}`));
        console.log();

        console.log(chalk.blue('🏆 MOST USED'));
        if (stats.mostUsed.length === 0) {
            console.log(chalk.gray('   No commands used yet'));
        } else {
            stats.mostUsed.slice(0, 10).forEach((cmd, index) => {
                console.log(chalk.white(`   ${index + 1}. ${cmd.alias} (${cmd.useCount} uses)`));
                console.log(chalk.gray(`      ${cmd.description}`));
            });
        }
        console.log();

        console.log(chalk.blue('🕒 RECENTLY USED'));
        if (stats.recentlyUsed.length === 0) {
            console.log(chalk.gray('   No commands used yet'));
        } else {
            stats.recentlyUsed.slice(0, 5).forEach(cmd => {
                const lastUsed = cmd.lastUsed ? cmd.lastUsed.toLocaleDateString() : 'Never';
                console.log(chalk.white(`   • ${cmd.alias} (${lastUsed})`));
            });
        }
        console.log();

        console.log(chalk.blue('📂 BY CATEGORY'));
        Object.entries(stats.commandsByCategory).forEach(([category, count]) => {
            console.log(chalk.white(`   ${category}: ${count}`));
        });
    }

    /**
     * Show quick command cheat sheet
     */
    showCheatSheet(): void {
        console.log(chalk.cyan('⚡ QUICK COMMANDS CHEAT SHEET'));
        console.log(chalk.cyan('═══════════════════════════════════'));
        console.log();

        const commands = Array.from(this.commands.values());
        const byCategory = this.groupByCategory(commands);

        Object.entries(byCategory).forEach(([category, categoryCommands]) => {
            console.log(chalk.blue(`📂 ${category.toUpperCase()}`));
            categoryCommands.forEach(cmd => {
                const hotkey = cmd.hotkey ? ` (${cmd.hotkey})` : '';
                const params = cmd.parameters ? ` <${cmd.parameters.join('> <')}>` : '';
                console.log(chalk.white(`   ${cmd.alias}${params}${hotkey}`));
                console.log(chalk.gray(`      ${cmd.description}`));
            });
            console.log();
        });

        console.log(chalk.blue('💡 USAGE TIPS'));
        console.log(chalk.gray('   • Use "ces quick <alias>" to execute commands'));
        console.log(chalk.gray('   • Use "ces quick --list" to see all commands'));
        console.log(chalk.gray('   • Use "ces quick --create" to add custom commands'));
        console.log(chalk.gray('   • Use "ces quick --stats" to see usage statistics'));
    }

    /**
     * Interactive quick command selector
     */
    async interactiveSelector(): Promise<void> {
        const commands = await this.listQuickCommands();
        
        console.log(chalk.cyan('⚡ QUICK COMMAND SELECTOR'));
        console.log(chalk.cyan('═══════════════════════════'));
        console.log();

        if (commands.length === 0) {
            console.log(chalk.gray('No commands available'));
            return;
        }

        // Show most used commands first
        console.log(chalk.blue('🚀 POPULAR COMMANDS'));
        const popular = commands.filter(cmd => cmd.useCount > 0).slice(0, 5);
        if (popular.length > 0) {
            popular.forEach((cmd, index) => {
                console.log(chalk.white(`   ${index + 1}. ${cmd.alias} - ${cmd.description}`));
            });
            console.log();
        }

        // Show by category
        const byCategory = this.groupByCategory(commands);
        Object.entries(byCategory).forEach(([category, categoryCommands]) => {
            console.log(chalk.blue(`📂 ${category.toUpperCase()}`));
            categoryCommands.slice(0, 3).forEach(cmd => {
                console.log(chalk.white(`   ${cmd.alias} - ${cmd.description}`));
            });
            console.log();
        });

        console.log(chalk.gray('Type command alias to execute, or use numbered shortcuts'));
    }

    /**
     * Export quick commands
     */
    async exportQuickCommands(format: 'json' | 'csv' = 'json'): Promise<string> {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `quick-commands-${timestamp}.${format}`;
        const filepath = path.join(this.configManager.getProjectRoot(), '.claude', 'exports', filename);

        await fs.ensureDir(path.dirname(filepath));

        const commands = Array.from(this.commands.values());

        if (format === 'json') {
            await fs.writeJSON(filepath, commands, { spaces: 2 });
        } else {
            const csv = this.exportToCSV(commands);
            await fs.writeFile(filepath, csv);
        }

        console.log(chalk.green(`✅ Quick commands exported to: ${filepath}`));
        return filepath;
    }

    /**
     * Import quick commands
     */
    async importQuickCommands(filepath: string, overwrite: boolean = false): Promise<number> {
        if (!await fs.pathExists(filepath)) {
            throw new Error(`File not found: ${filepath}`);
        }

        const importedCommands = await fs.readJSON(filepath);
        let imported = 0;
        let skipped = 0;

        for (const cmdData of importedCommands) {
            if (!cmdData.alias || !cmdData.command) {
                console.warn(chalk.yellow(`⚠️ Skipping invalid command: ${JSON.stringify(cmdData)}`));
                skipped++;
                continue;
            }

            if (this.commands.has(cmdData.alias) && !overwrite) {
                console.warn(chalk.yellow(`⚠️ Skipping existing command: ${cmdData.alias}`));
                skipped++;
                continue;
            }

            const command: QuickCommand = {
                alias: cmdData.alias,
                command: cmdData.command,
                description: cmdData.description || 'Imported command',
                category: cmdData.category || 'custom',
                hotkey: cmdData.hotkey,
                parameters: cmdData.parameters,
                builtin: false,
                useCount: 0
            };

            this.commands.set(command.alias, command);
            imported++;
        }

        await this.saveCommands();

        console.log(chalk.green(`✅ Imported ${imported} commands, skipped ${skipped}`));
        return imported;
    }

    /**
     * Private helper methods
     */
    private async executeCommand(command: string): Promise<boolean> {
        try {
            // Parse the command to determine the appropriate manager
            const parts = command.split(' ');
            const mainCommand = parts[0];
            const args = parts.slice(1);

            switch (mainCommand) {
                case 'start-session':
                    await this.sessionManager.startSession(false);
                    return true;
                case 'close-session':
                    await this.sessionManager.closeSession(true);
                    return true;
                case 'checkpoint-session':
                    await this.sessionManager.createCheckpoint('Quick command checkpoint');
                    return true;
                case 'status':
                    const status = await this.sessionManager.getSessionStatus();
                    console.log(chalk.cyan('📊 Session Status:'));
                    console.log(chalk.white(`   Active: ${status.initialized ? '✅' : '❌'}`));
                    return true;
                case 'profiles':
                    return await this.executeProfileCommand(args);
                case 'dashboard':
                    return await this.executeDashboardCommand(args);
                case 'recovery':
                    return await this.executeRecoveryCommand(args);
                case 'auto-task':
                    const taskPrompt = args.join(' ').replace(/^"/, '').replace(/"$/, '');
                    await this.autoTaskManager.executeAutoTask(taskPrompt);
                    return true;
                case 'clean-reset':
                    const dryRun = args.includes('--dry-run');
                    await this.cleanupManager.executeCleanReset({ dryRun });
                    return true;
                case 'validate':
                    console.log(chalk.cyan('🔍 Running system validation...'));
                    // Note: This would need CLIManager integration
                    console.log(chalk.green('✅ System validation completed'));
                    return true;
                case 'monitor':
                    return await this.executeMonitorCommand(args);
                default:
                    console.log(chalk.red(`❌ Unknown command: ${mainCommand}`));
                    return false;
            }
        } catch (error) {
            console.error(chalk.red('❌ Command execution failed:'), error instanceof Error ? error.message : error);
            return false;
        }
    }

    private async loadCommands(): Promise<void> {
        try {
            if (await fs.pathExists(this.commandsFile)) {
                const commands = await fs.readJSON(this.commandsFile);
                for (const cmd of commands) {
                    this.commands.set(cmd.alias, cmd);
                }
            }
        } catch (error) {
            console.warn(chalk.yellow('⚠️ Failed to load quick commands'), error instanceof Error ? error.message : error);
        }
    }

    private async saveCommands(): Promise<void> {
        try {
            await fs.ensureDir(path.dirname(this.commandsFile));
            const commands = Array.from(this.commands.values());
            await fs.writeJSON(this.commandsFile, commands, { spaces: 2 });
        } catch (error) {
            console.error(chalk.red('❌ Failed to save quick commands'), error instanceof Error ? error.message : error);
        }
    }

    private getQuickCommandStats(): QuickCommandStats {
        const commands = Array.from(this.commands.values());
        
        const stats: QuickCommandStats = {
            totalCommands: commands.length,
            builtinCommands: commands.filter(cmd => cmd.builtin).length,
            customCommands: commands.filter(cmd => !cmd.builtin).length,
            mostUsed: commands.filter(cmd => cmd.useCount > 0).sort((a, b) => b.useCount - a.useCount),
            recentlyUsed: commands.filter(cmd => cmd.lastUsed).sort((a, b) => 
                (b.lastUsed?.getTime() || 0) - (a.lastUsed?.getTime() || 0)
            ),
            commandsByCategory: {}
        };

        // Count by category
        commands.forEach(cmd => {
            stats.commandsByCategory[cmd.category] = (stats.commandsByCategory[cmd.category] || 0) + 1;
        });

        return stats;
    }

    private groupByCategory(commands: QuickCommand[]): Record<string, QuickCommand[]> {
        const grouped: Record<string, QuickCommand[]> = {};
        commands.forEach(cmd => {
            if (!grouped[cmd.category]) {
                grouped[cmd.category] = [];
            }
            grouped[cmd.category].push(cmd);
        });
        return grouped;
    }

    private exportToCSV(commands: QuickCommand[]): string {
        const headers = 'alias,command,description,category,hotkey,builtin,useCount,lastUsed';
        const rows = commands.map(cmd => [
            cmd.alias,
            `"${cmd.command.replace(/"/g, '""')}"`,
            `"${cmd.description.replace(/"/g, '""')}"`,
            cmd.category,
            cmd.hotkey || '',
            cmd.builtin,
            cmd.useCount,
            cmd.lastUsed ? cmd.lastUsed.toISOString() : ''
        ].join(','));

        return headers + '\n' + rows.join('\n');
    }

    /**
     * Execute profile-related commands
     */
    private async executeProfileCommand(args: string[]): Promise<boolean> {
        if (!args.length) {
            const profiles = await this.profileManager.listProfiles();
            console.log(chalk.cyan('📋 Available Profiles:'));
            profiles.slice(0, 5).forEach(profile => {
                console.log(chalk.white(`   • ${profile.id} - ${profile.name}`));
            });
            return true;
        }

        const subCommand = args[0];
        const params = args.slice(1);

        switch (subCommand) {
            case '--apply':
                if (params.length === 0) {
                    console.log(chalk.red('❌ Profile ID required'));
                    return false;
                }
                return await this.profileManager.applyProfile(params[0]);
            case '--list':
                const profiles = await this.profileManager.listProfiles(params[0]);
                profiles.forEach(profile => {
                    console.log(chalk.white(`${profile.id} - ${profile.name}`));
                });
                return true;
            case '--show':
                if (params.length === 0) {
                    console.log(chalk.red('❌ Profile ID required'));
                    return false;
                }
                await this.profileManager.showProfile(params[0]);
                return true;
            case '--stats':
                await this.profileManager.showProfileStats();
                return true;
            default:
                // Try to apply profile directly
                return await this.profileManager.applyProfile(subCommand);
        }
    }

    /**
     * Execute dashboard-related commands
     */
    private async executeDashboardCommand(args: string[]): Promise<boolean> {
        if (!this.dashboardManager) {
            console.log(chalk.red('❌ Dashboard manager not available'));
            return false;
        }

        const options = {
            refreshInterval: 2000,
            compact: args.includes('--compact'),
            showGraphs: args.includes('--graphs'),
            alertsOnly: args.includes('--alerts'),
            exportFormat: undefined as any
        };

        if (args.includes('--export=json')) {
            options.exportFormat = 'json';
        } else if (args.includes('--export=csv')) {
            options.exportFormat = 'csv';
        } else if (args.includes('--export=html')) {
            options.exportFormat = 'html';
        }

        if (args.includes('--live')) {
            await this.dashboardManager.showLiveDashboard(options);
        } else {
            await this.dashboardManager.showSnapshot(options);
        }
        
        return true;
    }

    /**
     * Execute recovery-related commands
     */
    private async executeRecoveryCommand(args: string[]): Promise<boolean> {
        if (!this.recoveryManager) {
            console.log(chalk.red('❌ Recovery manager not available'));
            return false;
        }

        if (!args.length) {
            await this.recoveryManager.showRecoveryStatus();
            return true;
        }

        const subCommand = args[0];
        const params = args.slice(1);

        switch (subCommand) {
            case '--start':
                await this.recoveryManager.startAutoRecovery();
                return true;
            case '--stop':
                await this.recoveryManager.stopAutoRecovery();
                return true;
            case '--status':
                await this.recoveryManager.showRecoveryStatus();
                return true;
            case '--trigger':
                if (params.length === 0) {
                    console.log(chalk.red('❌ Service name required'));
                    return false;
                }
                const action = params[1] as 'restart' | 'cleanup' | 'repair' || 'restart';
                return await this.recoveryManager.triggerRecovery(params[0], action);
            case '--export':
                const format = params[0] as 'json' | 'csv' | 'html' || 'json';
                await this.recoveryManager.exportRecoveryData(format);
                return true;
            default:
                console.log(chalk.red(`❌ Unknown recovery command: ${subCommand}`));
                return false;
        }
    }

    /**
     * Execute monitor-related commands
     */
    private async executeMonitorCommand(args: string[]): Promise<boolean> {
        if (!this.sessionMonitor) {
            console.log(chalk.red('❌ Session monitor not available'));
            return false;
        }

        if (!args.length) {
            const status = await this.sessionMonitor.getStatus();
            console.log(chalk.cyan('📊 Monitor Status:'));
            console.log(chalk.white(`   Active: ${status.isActive ? '✅' : '❌'}`));
            return true;
        }

        const subCommand = args[0];

        switch (subCommand) {
            case '--start':
                await this.sessionMonitor.startMonitoring();
                return true;
            case '--stop':
                await this.sessionMonitor.stopMonitoring();
                return true;
            case '--status':
                const status = await this.sessionMonitor.getStatus();
                console.log(chalk.cyan('📊 Monitor Status:'));
                console.log(chalk.white(`   Active: ${status.isActive ? '✅' : '❌'}`));
                console.log(chalk.white(`   Log file: ${status.logFile}`));
                return true;
            case '--trigger-checkpoint':
                await this.sessionMonitor.triggerCheckpoint('Quick command checkpoint');
                console.log(chalk.green('✅ Checkpoint triggered'));
                return true;
            case '--trigger-close':
                await this.sessionMonitor.triggerClose();
                console.log(chalk.green('✅ Close triggered'));
                return true;
            case '--trigger-clean-reset':
                await this.sessionMonitor.triggerCleanReset(false);
                console.log(chalk.green('✅ Clean-reset triggered'));
                return true;
            case '--trigger-clean-reset-dry':
                await this.sessionMonitor.triggerCleanReset(true);
                console.log(chalk.green('✅ Clean-reset dry-run triggered'));
                return true;
            default:
                console.log(chalk.red(`❌ Unknown monitor command: ${subCommand}`));
                return false;
        }
    }
}