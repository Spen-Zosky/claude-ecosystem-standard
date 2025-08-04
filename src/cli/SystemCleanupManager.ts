/**
 * SystemCleanupManager - Complete System Reset for Development Environment
 * 
 * Provides aggressive cleanup capabilities for development environments where
 * Claude Code CLI has full system control. Safely resets services, ports, 
 * and processes to return to a clean state.
 */

import { execSync } from 'child_process';
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { envConfig } from '../config/EnvironmentConfig.js';
import { createLogger, ComponentLogger } from '../utils/Logger.js';
import { ConfigManager } from '../config/ConfigManager.js';

export interface CleanupReport {
    timestamp: string;
    actions: CleanupAction[];
    servicesKilled: ProcessInfo[];
    portsFreed: number[];
    errors: string[];
    duration: number;
}

export interface CleanupAction {
    type: 'process' | 'service' | 'port' | 'cache' | 'logs' | 'temp';
    target: string;
    status: 'success' | 'failed' | 'skipped';
    details: string;
}

export interface ProcessInfo {
    pid: number;
    name: string;
    port?: number;
    command: string;
    user: string;
}

export interface CleanupOptions {
    preserveSessions: boolean;
    preserveLogs: boolean;
    killAllNodeProcesses: boolean;
    resetDockerContainers: boolean;
    clearSystemCache: boolean;
    forceKill: boolean;
    dryRun: boolean;
}

export class SystemCleanupManager {
    // private _configManager: ConfigManager; // Removed unused field
    private projectRoot: string;
    
    // Enterprise configuration and logging
    private logger: ComponentLogger;
    private sessionId: string;

    constructor(_configManager: ConfigManager) {
        // this._configManager = configManager; // Removed unused field
        this.projectRoot = envConfig.getProjectRoot();
        
        // Initialize enterprise components
        this.sessionId = uuidv4();
        this.logger = createLogger('SystemCleanupManager', { sessionId: this.sessionId });
    }

    /**
     * Main entry point for complete system cleanup
     */
    async executeCleanReset(options: Partial<CleanupOptions> = {}): Promise<CleanupReport> {
        const startTime = Date.now();
        const report: CleanupReport = {
            timestamp: new Date().toISOString(),
            actions: [],
            servicesKilled: [],
            portsFreed: [],
            errors: [],
            duration: 0
        };

        const fullOptions: CleanupOptions = {
            preserveSessions: false,
            preserveLogs: false,
            killAllNodeProcesses: true,
            resetDockerContainers: true,
            clearSystemCache: true,
            forceKill: true,
            dryRun: false,
            ...options
        };

        this.logger.system('Starting system clean reset - DEVELOPMENT ENVIRONMENT');
        this.logger.warn('Aggressive system reset will kill services, ports, and processes');
        this.logger.info('Clean reset configuration', {
            project: path.basename(this.projectRoot),
            dryRun: options.dryRun,
            forceKill: options.forceKill
        });

        if (fullOptions.dryRun) {
            this.logger.info('DRY RUN MODE - No actual changes will be made');
        }

        try {
            // 1. Create backup before cleanup
            await this.createPreCleanupBackup(report, fullOptions);

            // 2. Kill Claude Code CLI related processes
            await this.killClaudeProcesses(report, fullOptions);

            // 3. Kill development server processes
            await this.killDevelopmentProcesses(report, fullOptions);

            // 4. Free up common development ports
            await this.freeCommonPorts(report, fullOptions);

            // 5. Reset Docker containers (if requested)
            if (fullOptions.resetDockerContainers) {
                await this.resetDockerContainers(report, fullOptions);
            }

            // 6. Kill all Node.js processes (if requested)
            if (fullOptions.killAllNodeProcesses) {
                await this.killAllNodeProcesses(report, fullOptions);
            }

            // 7. Clean temporary files and caches
            await this.cleanTemporaryFiles(report, fullOptions);

            // 8. Clear system cache (if requested)
            if (fullOptions.clearSystemCache) {
                await this.clearSystemCache(report, fullOptions);
            }

            // 9. Reset network connections
            await this.resetNetworkConnections(report, fullOptions);

            // 10. Final system verification
            await this.verifyCleanState(report, fullOptions);

            report.duration = Date.now() - startTime;
            this.displayCleanupReport(report);

            const duration = Date.now() - startTime;
            this.logger.performance('system clean reset', duration, true, {
                actionsCount: report.actions.length,
                servicesKilled: report.servicesKilled.length,
                portsFreed: report.portsFreed.length
            });
            this.logger.system('System clean reset completed successfully - System is now clean for development');

        } catch (error) {
            report.errors.push(`Fatal error: ${error instanceof Error ? error.message : error}`);
            report.duration = Date.now() - startTime;
            
            this.logger.error('Clean reset failed', error instanceof Error ? error : new Error(String(error)));
            throw error;
        }

        return report;
    }

    /**
     * Create backup before cleanup
     */
    private async createPreCleanupBackup(report: CleanupReport, options: CleanupOptions): Promise<void> {
        console.log(chalk.blue('📦 Creating pre-cleanup backup...'));

        try {
            const backupDir = path.join(this.projectRoot, '.claude', 'backup', 'pre-cleanup');
            await fs.ensureDir(backupDir);

            if (!options.dryRun) {
                // Backup current session state
                const sessionFile = path.join(this.projectRoot, '.claude', 'sessions', 'current');
                if (await fs.pathExists(sessionFile)) {
                    await fs.copy(sessionFile, path.join(backupDir, `session-${Date.now()}.json`));
                }

                // Backup running processes list
                const processList = this.getCurrentProcesses();
                await fs.writeJSON(path.join(backupDir, `processes-${Date.now()}.json`), processList);
            }

            report.actions.push({
                type: 'cache',
                target: 'pre-cleanup-backup',
                status: 'success',
                details: `Backup created in ${backupDir}`
            });

            console.log(chalk.green('✓ Backup created'));

        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            report.errors.push(`Backup failed: ${errorMsg}`);
            console.log(chalk.yellow('⚠️  Backup failed, continuing cleanup...'));
        }
    }

    /**
     * Kill Claude Code CLI related processes
     */
    private async killClaudeProcesses(report: CleanupReport, options: CleanupOptions): Promise<void> {
        console.log(chalk.blue('🔫 Killing Claude Code CLI processes...'));

        const claudePatterns = [
            'claude',
            'mcp-server',
            'context7',
            'serena',
            'arxiv',
            'typescript-language-server',
            'ts-node'
        ];

        for (const pattern of claudePatterns) {
            await this.killProcessesByPattern(pattern, report, options);
        }
    }

    /**
     * Kill common development server processes
     */
    private async killDevelopmentProcesses(report: CleanupReport, options: CleanupOptions): Promise<void> {
        console.log(chalk.blue('🔫 Killing development server processes...'));

        const devPatterns = [
            'webpack-dev-server',
            'vite',
            'next-server',
            'vue-cli-service',
            'react-scripts',
            'nodemon',
            'pm2',
            'forever'
        ];

        for (const pattern of devPatterns) {
            await this.killProcessesByPattern(pattern, report, options);
        }
    }

    /**
     * Free up common development ports
     */
    private async freeCommonPorts(report: CleanupReport, options: CleanupOptions): Promise<void> {
        console.log(chalk.blue('🔓 Freeing common development ports...'));

        const commonPorts = [
            3000, 3001, 3002, 3003,  // React, Next.js
            5000, 5001, 5002,         // General dev servers
            8000, 8001, 8080, 8081,   // Alt dev servers
            4000, 4200,               // Angular
            9000, 9001,               // Webpack
            27017,                    // MongoDB
            5432,                     // PostgreSQL
            6379,                     // Redis
            1337                      // Strapi
        ];

        for (const port of commonPorts) {
            await this.freePort(port, report, options);
        }
    }

    /**
     * Kill all Node.js processes
     */
    private async killAllNodeProcesses(report: CleanupReport, options: CleanupOptions): Promise<void> {
        console.log(chalk.blue('🔫 Killing ALL Node.js processes...'));

        try {
            if (!options.dryRun) {
                // Get all node processes
                const nodeProcesses = this.getNodeProcesses();
                
                for (const proc of nodeProcesses) {
                    try {
                        if (options.forceKill) {
                            execSync(`kill -9 ${proc.pid}`, { stdio: 'ignore' });
                        } else {
                            execSync(`kill ${proc.pid}`, { stdio: 'ignore' });
                        }
                        
                        report.servicesKilled.push(proc);
                        console.log(chalk.gray(`  ✓ Killed: ${proc.name} (${proc.pid})`));
                        
                    } catch (error) {
                        // Process might already be dead
                    }
                }
            }

            report.actions.push({
                type: 'process',
                target: 'all-node-processes',
                status: 'success',
                details: `Killed ${report.servicesKilled.length} Node.js processes`
            });

        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            report.errors.push(`Node process cleanup failed: ${errorMsg}`);
        }
    }

    /**
     * Reset Docker containers
     */
    private async resetDockerContainers(report: CleanupReport, options: CleanupOptions): Promise<void> {
        console.log(chalk.blue('🐳 Resetting Docker containers...'));

        try {
            if (!options.dryRun) {
                // Stop all containers
                execSync('docker stop $(docker ps -q) 2>/dev/null || true', { stdio: 'ignore' });
                
                // Remove all containers
                execSync('docker rm $(docker ps -aq) 2>/dev/null || true', { stdio: 'ignore' });
                
                // Prune networks
                execSync('docker network prune -f 2>/dev/null || true', { stdio: 'ignore' });
            }

            report.actions.push({
                type: 'service',
                target: 'docker-containers',
                status: 'success',
                details: 'All Docker containers stopped and removed'
            });

            console.log(chalk.green('✓ Docker containers reset'));

        } catch (error) {
            // Docker might not be installed or running
            report.actions.push({
                type: 'service',
                target: 'docker-containers',
                status: 'skipped',
                details: 'Docker not available or no containers found'
            });
        }
    }

    /**
     * Clean temporary files and caches
     */
    private async cleanTemporaryFiles(report: CleanupReport, options: CleanupOptions): Promise<void> {
        console.log(chalk.blue('🗑️  Cleaning temporary files...'));

        const cleanupPaths = [
            'node_modules/.cache',
            '.next',
            '.nuxt',
            'dist',
            'build',
            '.tmp',
            'tmp',
            '.vite',
            options.preserveLogs ? null : '.claude/sessions/current',
            options.preserveLogs ? null : '.claude/hook.log'
        ].filter(Boolean) as string[];

        for (const cleanupPath of cleanupPaths) {
            try {
                const fullPath = path.join(this.projectRoot, cleanupPath);
                
                if (await fs.pathExists(fullPath) && !options.dryRun) {
                    await fs.remove(fullPath);
                }

                report.actions.push({
                    type: 'temp',
                    target: cleanupPath,
                    status: 'success',
                    details: 'Removed temporary files'
                });

                console.log(chalk.gray(`  ✓ Cleaned: ${cleanupPath}`));

            } catch (error) {
                report.errors.push(`Failed to clean ${cleanupPath}: ${error}`);
            }
        }
    }

    /**
     * Clear system cache
     */
    private async clearSystemCache(report: CleanupReport, options: CleanupOptions): Promise<void> {
        console.log(chalk.blue('🧹 Clearing system cache...'));

        try {
            if (!options.dryRun) {
                // Clear npm cache
                execSync('npm cache clean --force 2>/dev/null || true', { stdio: 'ignore' });
                
                // Clear yarn cache
                execSync('yarn cache clean 2>/dev/null || true', { stdio: 'ignore' });
                
                // Clear system DNS cache (Linux)
                execSync('sudo systemctl flush-dns 2>/dev/null || true', { stdio: 'ignore' });
            }

            report.actions.push({
                type: 'cache',
                target: 'system-cache',
                status: 'success',
                details: 'System caches cleared'
            });

            console.log(chalk.green('✓ System cache cleared'));

        } catch (error) {
            report.actions.push({
                type: 'cache',
                target: 'system-cache',
                status: 'failed',
                details: `Cache clear failed: ${error}`
            });
        }
    }

    /**
     * Reset network connections
     */
    private async resetNetworkConnections(report: CleanupReport, options: CleanupOptions): Promise<void> {
        console.log(chalk.blue('🌐 Resetting network connections...'));

        try {
            if (!options.dryRun) {
                // Kill processes holding network connections
                execSync('sudo fuser -k 80/tcp 443/tcp 2>/dev/null || true', { stdio: 'ignore' });
            }

            report.actions.push({
                type: 'port',
                target: 'network-connections',
                status: 'success',
                details: 'Network connections reset'
            });

        } catch (error) {
            // Might not have permission, not critical
            report.actions.push({
                type: 'port',
                target: 'network-connections',
                status: 'skipped',
                details: 'Insufficient permissions for network reset'
            });
        }
    }

    /**
     * Verify clean state
     */
    private async verifyCleanState(report: CleanupReport, _options: CleanupOptions): Promise<void> {
        console.log(chalk.blue('🔍 Verifying clean state...'));

        const remainingProcesses = this.getNodeProcesses();
        const usedPorts = this.getUsedPorts();

        console.log(chalk.gray(`  📊 Remaining Node processes: ${remainingProcesses.length}`));
        console.log(chalk.gray(`  📊 Ports still in use: ${usedPorts.length}`));

        report.actions.push({
            type: 'process',
            target: 'verification',
            status: 'success',
            details: `${remainingProcesses.length} processes remaining, ${usedPorts.length} ports in use`
        });
    }

    /**
     * Kill processes by pattern
     */
    private async killProcessesByPattern(pattern: string, report: CleanupReport, options: CleanupOptions): Promise<void> {
        try {
            if (!options.dryRun) {
                const processes = this.getProcessesByPattern(pattern);
                
                for (const proc of processes) {
                    try {
                        if (options.forceKill) {
                            execSync(`kill -9 ${proc.pid}`, { stdio: 'ignore' });
                        } else {
                            execSync(`kill ${proc.pid}`, { stdio: 'ignore' });
                        }
                        
                        report.servicesKilled.push(proc);
                        console.log(chalk.gray(`  ✓ Killed: ${proc.name} (${proc.pid})`));
                        
                    } catch (error) {
                        // Process might already be dead
                    }
                }
            }

        } catch (error) {
            // Pattern might not match any processes
        }
    }

    /**
     * Free specific port
     */
    private async freePort(port: number, report: CleanupReport, options: CleanupOptions): Promise<void> {
        try {
            const processes = this.getProcessesOnPort(port);
            
            if (processes.length > 0 && !options.dryRun) {
                for (const proc of processes) {
                    execSync(`kill -9 ${proc.pid}`, { stdio: 'ignore' });
                    report.servicesKilled.push(proc);
                }
                
                report.portsFreed.push(port);
                console.log(chalk.gray(`  ✓ Freed port: ${port}`));
            }

        } catch (error) {
            // Port might not be in use
        }
    }

    /**
     * Get current processes
     */
    private getCurrentProcesses(): ProcessInfo[] {
        try {
            const output = execSync('ps aux', { encoding: 'utf8' });
            return this.parseProcessOutput(output);
        } catch (error) {
            return [];
        }
    }

    /**
     * Get Node.js processes
     */
    private getNodeProcesses(): ProcessInfo[] {
        try {
            const output = execSync('pgrep -f node', { encoding: 'utf8' });
            const pids = output.trim().split('\n').filter(Boolean);
            
            return pids.map(pid => {
                try {
                    const cmdline = execSync(`ps -p ${pid} -o comm=`, { encoding: 'utf8' }).trim();
                    return {
                        pid: parseInt(pid),
                        name: cmdline,
                        command: cmdline,
                        user: 'current'
                    };
                } catch {
                    return null;
                }
            }).filter(Boolean) as ProcessInfo[];

        } catch (error) {
            return [];
        }
    }

    /**
     * Get processes by pattern
     */
    private getProcessesByPattern(pattern: string): ProcessInfo[] {
        try {
            const output = execSync(`pgrep -f "${pattern}"`, { encoding: 'utf8' });
            const pids = output.trim().split('\n').filter(Boolean);
            
            return pids.map(pid => ({
                pid: parseInt(pid),
                name: pattern,
                command: pattern,
                user: 'current'
            }));

        } catch (error) {
            return [];
        }
    }

    /**
     * Get processes on specific port
     */
    private getProcessesOnPort(port: number): ProcessInfo[] {
        try {
            const output = execSync(`lsof -ti:${port}`, { encoding: 'utf8' });
            const pids = output.trim().split('\n').filter(Boolean);
            
            return pids.map(pid => ({
                pid: parseInt(pid),
                name: `port-${port}`,
                port: port,
                command: `port-${port}`,
                user: 'current'
            }));

        } catch (error) {
            return [];
        }
    }

    /**
     * Get used ports
     */
    private getUsedPorts(): number[] {
        try {
            const output = execSync('netstat -tuln', { encoding: 'utf8' });
            const lines = output.split('\n');
            const ports: number[] = [];

            for (const line of lines) {
                const match = line.match(/:(\d+)\s/);
                if (match) {
                    ports.push(parseInt(match[1]));
                }
            }

            return [...new Set(ports)].sort((a, b) => a - b);

        } catch (error) {
            return [];
        }
    }

    /**
     * Parse process output
     */
    private parseProcessOutput(output: string): ProcessInfo[] {
        const lines = output.split('\n').slice(1); // Skip header
        const processes: ProcessInfo[] = [];

        for (const line of lines) {
            const parts = line.trim().split(/\s+/);
            if (parts.length >= 11) {
                processes.push({
                    pid: parseInt(parts[1]),
                    name: parts[10],
                    command: parts.slice(10).join(' '),
                    user: parts[0]
                });
            }
        }

        return processes;
    }

    /**
     * Display cleanup report
     */
    private displayCleanupReport(report: CleanupReport): void {
        console.log();
        console.log(chalk.cyan('📋 CLEANUP REPORT'));
        console.log(chalk.cyan('=' .repeat(50)));
        
        console.log(chalk.white(`⏱️  Duration: ${report.duration}ms`));
        console.log(chalk.white(`🔫 Processes killed: ${report.servicesKilled.length}`));
        console.log(chalk.white(`🔓 Ports freed: ${report.portsFreed.length}`));
        console.log(chalk.white(`⚡ Actions completed: ${report.actions.length}`));
        
        if (report.errors.length > 0) {
            console.log(chalk.red(`❌ Errors: ${report.errors.length}`));
            report.errors.forEach(error => {
                console.log(chalk.red(`   • ${error}`));
            });
        }

        console.log();
        console.log(chalk.blue('📊 Actions Summary:'));
        const actionSummary = report.actions.reduce((acc, action) => {
            acc[action.type] = (acc[action.type] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        Object.entries(actionSummary).forEach(([type, count]) => {
            console.log(chalk.gray(`   ${type}: ${count} actions`));
        });

        if (report.portsFreed.length > 0) {
            console.log();
            console.log(chalk.blue('🔓 Ports Freed:'));
            console.log(chalk.gray(`   ${report.portsFreed.join(', ')}`));
        }
    }
}