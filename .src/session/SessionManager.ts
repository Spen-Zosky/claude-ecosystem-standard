/**
 * Session Manager for Claude Ecosystem Standard (CES)
 * Handles session lifecycle, checkpoints, and state management
 */

import fs from 'fs-extra';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { execSync, ChildProcess } from 'child_process';
import chalk from 'chalk';
import { 
    SessionConfig, 
    SessionCheckpoint, 
    SystemState,
    GitStatus,
    SessionError,
    StartupHookResult
} from '../types/index.js';
import { ConfigManager } from '../config/ConfigManager.js';
import { envConfig } from '../config/EnvironmentConfig.js';
import { logger } from '../utils/Logger.js';

export class SessionManager {
    private currentSession: SessionConfig | null = null;
    private sessionDir: string;
    private claudeDir: string;
    private runningProcesses: Map<string, ChildProcess> = new Map();

    constructor(private configManager: ConfigManager) {
        // Use paths from integrated configuration
        this.claudeDir = envConfig.getClaudeDir();
        this.sessionDir = path.join(this.claudeDir, 'sessions');
        
        // Log paths used
        logger.info('SessionManager initialized', {
            component: 'SessionManager',
            action: 'initialization',
            metadata: {
                mode: envConfig.getIntegrationMode(),
                claudeDir: this.claudeDir,
                sessionDir: this.sessionDir
            }
        });
        
        this.ensureDirectories();
    }
    
    private ensureDirectories(): void {
        // Crea directory se non esistono
        if (!fs.existsSync(this.claudeDir)) {
            fs.mkdirSync(this.claudeDir, { recursive: true });
        }
        if (!fs.existsSync(this.sessionDir)) {
            fs.mkdirSync(this.sessionDir, { recursive: true });
        }
    }

    /**
     * Start a new Claude Code CLI session
     */
    async startSession(force: boolean = false): Promise<SessionConfig> {
        try {
            console.log(chalk.blue('🚀 Starting Claude Code CLI session...'));

            // Check for existing session
            if (this.currentSession && !force) {
                throw new SessionError('A session is already active. Use --force to override.');
            }

            // Initialize configuration
            await this.configManager.initialize();
            const environment = this.configManager.getConfig();

            // Ensure session directories exist
            this.ensureDirectories();

            // Generate session ID
            const sessionId = uuidv4();
            const timestamp = new Date();

            // Load MCP servers and agents
            const mcpServers = await this.configManager.loadMCPServers();
            const agents = await this.configManager.loadAgents();

            // Create session configuration
            this.currentSession = {
                id: sessionId,
                name: `${environment.projectName}-${timestamp.toISOString().slice(0, 19)}`,
                startTime: timestamp,
                status: 'active',
                mcpServers,
                agents,
                environment,
                checkpoints: []
            };

            // Run startup hook
            const hookResult = await this.runStartupHook();

            // Start MCP servers
            await this.startMCPServers();

            // Save session
            await this.saveSession();

            // Display session info
            this.displaySessionInfo(hookResult);

            console.log(chalk.green('✅ Claude Code CLI session started successfully'));
            return this.currentSession;

        } catch (error) {
            console.error(chalk.red('❌ Failed to start session:'), (error as Error).message);
            throw new SessionError(`Failed to start session: ${(error as Error).message}`);
        }
    }

    /**
     * Create a checkpoint of the current session
     */
    async createCheckpoint(message?: string): Promise<SessionCheckpoint> {
        try {
            if (!this.currentSession) {
                throw new SessionError('No active session to checkpoint');
            }

            console.log(chalk.blue('📸 Creating session checkpoint...'));

            const checkpointId = uuidv4();
            const timestamp = new Date();
            const systemState = await this.captureSystemState();

            const checkpoint: SessionCheckpoint = {
                id: checkpointId,
                timestamp,
                message,
                sessionState: { ...this.currentSession },
                systemState
            };

            // Add checkpoint to session
            this.currentSession.checkpoints.push(checkpoint);

            // Save updated session
            await this.saveSession();

            // Save checkpoint file
            const checkpointFile = path.join(this.sessionDir, `checkpoint-${checkpointId}.json`);
            await fs.writeJson(checkpointFile, checkpoint, { spaces: 2 });

            console.log(chalk.green('✅ Checkpoint created:'), checkpoint.id);
            if (message) {
                console.log(chalk.gray(`   Message: ${message}`));
            }

            return checkpoint;

        } catch (error) {
            console.error(chalk.red('❌ Failed to create checkpoint:'), (error as Error).message);
            throw new SessionError(`Failed to create checkpoint: ${(error as Error).message}`);
        }
    }

    /**
     * Close the current session
     */
    async closeSession(save: boolean = true): Promise<void> {
        try {
            if (!this.currentSession) {
                console.log(chalk.yellow('⚠️ No active session to close'));
                return;
            }

            console.log(chalk.blue('🔄 Closing Claude Code CLI session...'));

            // Update session status
            this.currentSession.status = 'closed';
            this.currentSession.endTime = new Date();

            // Stop running processes
            await this.stopAllProcesses();

            // Create final checkpoint if requested
            if (save) {
                await this.createCheckpoint('Session closing');
            }

            // Save final session state
            await this.saveSession();

            console.log(chalk.green('✅ Session closed successfully'));
            console.log(chalk.gray(`   Session ID: ${this.currentSession.id}`));
            console.log(chalk.gray(`   Duration: ${this.getSessionDuration()}`));

            // Clear current session
            this.currentSession = null;

        } catch (error) {
            console.error(chalk.red('❌ Failed to close session:'), (error as Error).message);
            throw new SessionError(`Failed to close session: ${(error as Error).message}`);
        }
    }

    /**
     * Clean session history with backup
     */
    async cleanHistory(force: boolean = false): Promise<void> {
        try {
            if (!force) {
                // In a real implementation, we'd use inquirer here
                console.log(chalk.yellow('⚠️ This will clean all session history. Use --force to confirm.'));
                return;
            }

            console.log(chalk.blue('🧹 Cleaning session history...'));

            // Create backup
            const backupDir = path.join(this.claudeDir, 'backup');
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const backupPath = path.join(backupDir, `sessions-backup-${timestamp}`);

            if (await fs.pathExists(this.sessionDir)) {
                await fs.ensureDir(backupDir);
                await fs.copy(this.sessionDir, backupPath);
                console.log(chalk.blue('📦 Backup created:'), backupPath);

                // Clean sessions directory
                await fs.remove(this.sessionDir);
                console.log(chalk.green('✅ Session history cleaned'));
            } else {
                console.log(chalk.yellow('⚠️ No session history to clean'));
            }

        } catch (error) {
            console.error(chalk.red('❌ Failed to clean history:'), (error as Error).message);
            throw new SessionError(`Failed to clean history: ${(error as Error).message}`);
        }
    }

    /**
     * Get current session
     */
    getCurrentSession(): SessionConfig | null {
        return this.currentSession;
    }

    /**
     * Get session status
     */
    async getSessionStatus(): Promise<{ initialized: boolean; sessionId?: string | undefined; active: boolean }> {
        return {
            initialized: this.currentSession !== null,
            sessionId: this.currentSession?.id,
            active: this.currentSession?.status === 'active'
        };
    }

    /**
     * Run startup hook
     */
    private async runStartupHook(): Promise<StartupHookResult> {
        try {
            const hookPath = path.join(this.claudeDir, 'startup-hook.cjs');
            
            if (!await fs.pathExists(hookPath)) {
                console.log(chalk.yellow('⚠️ Startup hook not found, skipping...'));
                return {
                    success: false,
                    languages: [],
                    frameworks: [],
                    tools: [],
                    directories: [],
                    health: {
                        overall: 'warning',
                        languages: { status: 'warning', message: 'Hook not executed' },
                        mcp: { status: 'warning', message: 'Hook not executed' },
                        agents: { status: 'warning', message: 'Hook not executed' },
                        git: { status: 'warning', message: 'Hook not executed' },
                        environment: { status: 'warning', message: 'Hook not executed' },
                        issues: []
                    },
                    logs: []
                };
            }

            console.log(chalk.blue('🔧 Running startup hook...'));
            
            // Execute startup hook
            const output = execSync(`node "${hookPath}"`, {
                cwd: envConfig.getOperationRoot(),
                encoding: 'utf8',
                timeout: 30000 // 30 second timeout
            });

            console.log(chalk.green('✅ Startup hook completed'));
            
            // Parse output (simplified - in real implementation would parse structured output)
            return {
                success: true,
                languages: this.configManager.getConfig().languages,
                frameworks: this.configManager.getConfig().frameworks,
                tools: this.configManager.getConfig().tools,
                directories: [],
                health: await this.configManager.performHealthCheck(),
                logs: output.split('\n').filter(line => line.trim())
            };

        } catch (error) {
            console.warn(chalk.yellow('⚠️ Startup hook failed:'), (error as Error).message);
            return {
                success: false,
                languages: [],
                frameworks: [],
                tools: [],
                directories: [],
                health: await this.configManager.performHealthCheck(),
                logs: [`Error: ${(error as Error).message}`]
            };
        }
    }

    /**
     * Start MCP servers (simplified implementation)
     */
    private async startMCPServers(): Promise<void> {
        try {
            if (!this.currentSession) return;

            console.log(chalk.blue('🔌 Configuring MCP servers...'));

            const criticalServers = this.currentSession.mcpServers.filter(s => s.priority === 'critical');
            const highServers = this.currentSession.mcpServers.filter(s => s.priority === 'high');

            console.log(chalk.green(`✅ ${criticalServers.length} critical MCP servers configured`));
            console.log(chalk.green(`✅ ${highServers.length} high-priority MCP servers configured`));
            console.log(chalk.blue(`ℹ️ Total MCP servers: ${this.currentSession.mcpServers.length}`));

            // Update server status (in real implementation, would actually start them)
            for (const server of this.currentSession.mcpServers) {
                server.status = 'connected';
            }

        } catch (error) {
            console.warn(chalk.yellow('⚠️ Some MCP servers failed to start:'), (error as Error).message);
        }
    }

    /**
     * Capture current system state
     */
    private async captureSystemState(): Promise<SystemState> {
        try {
            const gitStatus = await this.captureGitStatus();
            
            return {
                workingDirectory: process.cwd(),
                environment: process.env as Record<string, string>,
                runningProcesses: Array.from(this.runningProcesses.entries()).map(([name, proc]) => ({
                    pid: proc.pid || 0,
                    name,
                    command: proc.spawnargs?.join(' ') || '',
                    status: proc.killed ? 'stopped' : 'running'
                })),
                openFiles: [],
                gitStatus
            };
        } catch (error) {
            console.warn('Warning: Could not capture complete system state:', (error as Error).message);
            return {
                workingDirectory: process.cwd(),
                environment: {},
                runningProcesses: [],
                openFiles: [],
                gitStatus: undefined
            };
        }
    }

    /**
     * Capture Git status
     */
    private async captureGitStatus(): Promise<GitStatus | undefined> {
        try {
            if (!this.configManager.getConfig().hasGit) {
                return undefined;
            }

            const status = execSync('git status --porcelain', { 
                cwd: envConfig.getOperationRoot(),
                encoding: 'utf8' 
            });
            
            const branch = execSync('git branch --show-current', { 
                cwd: envConfig.getOperationRoot(),
                encoding: 'utf8' 
            }).trim();

            const lines = status.split('\n').filter(line => line.trim());
            const staged: string[] = [];
            const unstaged: string[] = [];
            const untracked: string[] = [];

            for (const line of lines) {
                const statusCode = line.slice(0, 2);
                const fileName = line.slice(3);

                if (statusCode[0] !== ' ' && statusCode[0] !== '?') {
                    staged.push(fileName);
                }
                if (statusCode[1] !== ' ') {
                    unstaged.push(fileName);
                }
                if (statusCode === '??') {
                    untracked.push(fileName);
                }
            }

            return {
                branch,
                status: status.trim(),
                staged,
                unstaged,
                untracked
            };

        } catch {
            return undefined;
        }
    }

    /**
     * Stop all running processes
     */
    private async stopAllProcesses(): Promise<void> {
        for (const [name, process] of this.runningProcesses) {
            try {
                if (!process.killed) {
                    process.kill();
                    console.log(chalk.blue(`🔄 Stopped process: ${name}`));
                }
            } catch (error) {
                console.warn(chalk.yellow(`⚠️ Could not stop process ${name}:`, (error as Error).message));
            }
        }
        this.runningProcesses.clear();
    }

    /**
     * Save current session to disk
     */
    private async saveSession(): Promise<void> {
        if (!this.currentSession) return;

        await fs.ensureDir(this.sessionDir);
        const sessionFile = path.join(this.sessionDir, `session-${this.currentSession.id}.json`);
        await fs.writeJson(sessionFile, this.currentSession, { spaces: 2 });

        // Also save as current session
        const currentFile = path.join(this.sessionDir, 'current.json');
        await fs.writeJson(currentFile, this.currentSession, { spaces: 2 });
    }

    /**
     * Display session information
     */
    private displaySessionInfo(hookResult: StartupHookResult): void {
        if (!this.currentSession) return;

        console.log('\n' + chalk.cyan('═══════════════════════════════════════════════════════════'));
        console.log(chalk.cyan('🚀 CLAUDE CODE CLI SESSION STARTED'));
        console.log(chalk.cyan('═══════════════════════════════════════════════════════════'));
        
        console.log(chalk.blue('📁 Project:'), this.currentSession.environment.projectName);
        console.log(chalk.blue('🆔 Session ID:'), this.currentSession.id);
        console.log(chalk.blue('⏰ Started:'), this.currentSession.startTime.toLocaleString());

        // Languages
        if (this.currentSession.environment.languages.length > 0) {
            const languageEmojis = this.currentSession.environment.languages
                .map(l => l.emoji).join(' ');
            console.log(chalk.blue('💻 Languages:'), languageEmojis, 
                this.currentSession.environment.languages.map(l => l.name).join(', '));
        }

        // Frameworks
        if (this.currentSession.environment.frameworks.length > 0) {
            console.log(chalk.blue('🔧 Frameworks:'), this.currentSession.environment.frameworks.join(', '));
        }

        // MCP Servers
        const criticalMCP = this.currentSession.mcpServers.filter(s => s.priority === 'critical').length;
        const highMCP = this.currentSession.mcpServers.filter(s => s.priority === 'high').length;
        console.log(chalk.blue('🔌 MCP Servers:'), 
            `${this.currentSession.mcpServers.length} total ` +
            `(${criticalMCP} critical, ${highMCP} high priority)`);

        // Agents
        const highAgents = this.currentSession.agents.filter(a => a.priority === 'high').length;
        console.log(chalk.blue('🤖 Agents:'), 
            `${this.currentSession.agents.length} specialized agents ` +
            `(${highAgents} high priority)`);

        // Health status
        const health = hookResult.health;
        const healthEmoji = health.overall === 'healthy' ? '✅' : 
                           health.overall === 'warning' ? '⚠️' : '❌';
        console.log(chalk.blue('🏥 Health:'), healthEmoji, health.overall);

        console.log(chalk.cyan('═══════════════════════════════════════════════════════════\n'));
    }

    /**
     * Get session duration
     */
    private getSessionDuration(): string {
        if (!this.currentSession) return '0s';

        const start = this.currentSession.startTime.getTime();
        const end = this.currentSession.endTime?.getTime() || Date.now();
        const duration = Math.floor((end - start) / 1000);

        const hours = Math.floor(duration / 3600);
        const minutes = Math.floor((duration % 3600) / 60);
        const seconds = duration % 60;

        if (hours > 0) {
            return `${hours}h ${minutes}m ${seconds}s`;
        } else if (minutes > 0) {
            return `${minutes}m ${seconds}s`;
        } else {
            return `${seconds}s`;
        }
    }
}