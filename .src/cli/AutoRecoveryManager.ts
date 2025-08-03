/**
 * Auto-Recovery Manager - Self-Healing System for CES
 * 
 * Provides continuous health monitoring, automatic restart of failed services,
 * crash detection and recovery, and intelligent system self-healing.
 */

import chalk from 'chalk';
import { execSync, spawn, ChildProcess } from 'child_process';
import fs from 'fs-extra';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { envConfig } from '../config/EnvironmentConfig.js';
import { createLogger, ComponentLogger } from '../utils/Logger.js';
import { ConfigManager } from '../config/ConfigManager.js';
import { SessionManager } from '../session/SessionManager.js';
import { SystemCleanupManager } from './SystemCleanupManager.js';

export interface RecoveryConfig {
    enabled: boolean;
    monitoringInterval: number;
    healthCheckTimeout: number;
    maxRestartAttempts: number;
    backoffMultiplier: number;
    criticalServices: string[];
    autoRestartServices: boolean;
    autoCleanupOnFailure: boolean;
    notificationEnabled: boolean;
}

export interface ServiceHealth {
    name: string;
    status: 'healthy' | 'degraded' | 'critical' | 'failed' | 'unknown';
    lastCheck: Date;
    uptime: number;
    restartCount: number;
    lastError?: string;
    pid?: number;
    port?: number;
    responseTime?: number;
}

export interface RecoveryAction {
    id: string;
    timestamp: Date;
    service: string;
    action: 'restart' | 'cleanup' | 'repair' | 'escalate';
    success: boolean;
    duration: number;
    details: string;
    error?: string;
}

export interface SystemHealth {
    overall: 'healthy' | 'degraded' | 'critical' | 'emergency' | 'unknown';
    services: ServiceHealth[];
    actions: RecoveryAction[];
    lastFullCheck: Date;
    recoveryMode: boolean;
}

export class AutoRecoveryManager {
    private configManager: ConfigManager;
    private sessionManager: SessionManager;
    private cleanupManager: SystemCleanupManager;
    private isMonitoring: boolean = false;
    private monitoringProcess: ChildProcess | null = null;
    private recoveryConfig: RecoveryConfig;
    private serviceHealth: Map<string, ServiceHealth> = new Map();
    private recoveryActions: RecoveryAction[] = [];
    private recoveryMode: boolean = false;
    
    // Enterprise configuration and logging
    private logger: ComponentLogger;
    private sessionId: string;
    // private _startTime: Date; // Removed unused field

    constructor(
        configManager: ConfigManager,
        sessionManager: SessionManager,
        cleanupManager: SystemCleanupManager
    ) {
        this.configManager = configManager;
        this.sessionManager = sessionManager;
        this.cleanupManager = cleanupManager;
        
        // Initialize enterprise components
        this.sessionId = uuidv4();
        // this._startTime = new Date(); // Removed unused field
        this.logger = createLogger('AutoRecoveryManager', { sessionId: this.sessionId });
        
        this.recoveryConfig = this.loadRecoveryConfig();
    }

    /**
     * Start continuous auto-recovery monitoring
     */
    async startAutoRecovery(): Promise<void> {
        if (this.isMonitoring) {
            this.logger.warn('Auto-recovery is already running');
            return;
        }

        const startTime = Date.now();
        this.logger.system('Starting Auto-Recovery System');
        this.logger.info(`Monitoring configuration`, {
            interval: this.recoveryConfig.monitoringInterval,
            timeout: this.recoveryConfig.healthCheckTimeout,
            criticalServices: this.recoveryConfig.criticalServices
        });

        this.isMonitoring = true;
        await this.logRecoveryAction('system', 'start', true, 0, 'Auto-recovery system started');

        // Start monitoring loop
        this.startMonitoringLoop();

        // Initial health check
        await this.performFullHealthCheck();

        this.logger.performance('auto-recovery system startup', Date.now() - startTime, true);
        this.logger.system('Auto-recovery system is now active');
    }

    /**
     * Stop auto-recovery monitoring
     */
    async stopAutoRecovery(): Promise<void> {
        if (!this.isMonitoring) {
            this.logger.warn('Auto-recovery is not running');
            return;
        }

        const stopTime = Date.now();
        this.logger.system('Stopping Auto-Recovery System');

        this.isMonitoring = false;
        if (this.monitoringProcess) {
            this.monitoringProcess.kill();
            this.monitoringProcess = null;
        }

        await this.logRecoveryAction('system', 'stop', true, 0, 'Auto-recovery system stopped');
        this.logger.performance('auto-recovery system stop', Date.now() - stopTime, true);
        this.logger.system('Auto-recovery system stopped successfully');
    }

    /**
     * Get current system health status
     */
    async getSystemHealth(): Promise<SystemHealth> {
        const services = Array.from(this.serviceHealth.values());
        const overall = this.calculateOverallHealth(services);

        return {
            overall,
            services,
            actions: this.recoveryActions.slice(-50), // Last 50 actions
            lastFullCheck: new Date(),
            recoveryMode: this.recoveryMode
        };
    }

    /**
     * Manually trigger recovery for a specific service
     */
    async triggerRecovery(serviceName: string, action: 'restart' | 'cleanup' | 'repair' = 'restart'): Promise<boolean> {
        const startTime = Date.now();
        this.logger.info(`Manually triggering ${action} for ${serviceName}`, { serviceName, action });
        let success = false;
        let details = '';
        let error = '';

        try {
            switch (action) {
                case 'restart':
                    success = await this.restartService(serviceName);
                    details = success ? 'Service restarted successfully' : 'Service restart failed';
                    break;
                case 'cleanup':
                    success = await this.cleanupService(serviceName);
                    details = success ? 'Service cleanup completed' : 'Service cleanup failed';
                    break;
                case 'repair':
                    success = await this.repairService(serviceName);
                    details = success ? 'Service repair completed' : 'Service repair failed';
                    break;
            }
        } catch (err) {
            error = err instanceof Error ? err.message : String(err);
            success = false;
            details = `${action} failed with error`;
        }

        const duration = Date.now() - startTime;
        await this.logRecoveryAction(serviceName, action, success, duration, details, error);
        this.logger.performance(`${serviceName} ${action}`, duration, success, { serviceName, action, details: success ? details : error });
        
        if (success) {
            this.logger.info(`${serviceName} ${action} completed successfully`);
        } else {
            this.logger.error(`${serviceName} ${action} failed`, new Error(error || details));
        }

        return success;
    }

    /**
     * Show recovery system status and recent actions
     */
    async showRecoveryStatus(): Promise<void> {
        const health = await this.getSystemHealth();

        console.log(chalk.cyan('🏥 AUTO-RECOVERY SYSTEM STATUS'));
        console.log(chalk.cyan('════════════════════════════════'));
        console.log();

        // Overall status
        const statusColor = this.getStatusColor(health.overall);
        console.log(chalk.blue('📊 OVERALL HEALTH'));
        console.log(chalk.white(`   Status: ${statusColor(health.overall.toUpperCase())}`));
        console.log(chalk.white(`   Monitoring: ${this.isMonitoring ? '🟢 Active' : '🔴 Inactive'}`));
        console.log(chalk.white(`   Recovery Mode: ${health.recoveryMode ? '🟡 Active' : '🟢 Normal'}`));
        console.log(chalk.white(`   Last Check: ${health.lastFullCheck.toLocaleTimeString()}`));
        console.log();

        // Service health
        console.log(chalk.blue('🔧 SERVICE HEALTH'));
        if (health.services.length === 0) {
            console.log(chalk.gray('   No services monitored'));
        } else {
            health.services.forEach(service => {
                const statusIcon = this.getServiceStatusIcon(service.status);
                const uptime = this.formatUptime(service.uptime);
                console.log(chalk.white(`   ${statusIcon} ${service.name}`));
                console.log(chalk.gray(`      Status: ${service.status} | Uptime: ${uptime} | Restarts: ${service.restartCount}`));
                if (service.lastError) {
                    console.log(chalk.red(`      Last Error: ${service.lastError}`));
                }
            });
        }
        console.log();

        // Recent recovery actions
        console.log(chalk.blue('📋 RECENT RECOVERY ACTIONS'));
        const recentActions = health.actions.slice(-5);
        if (recentActions.length === 0) {
            console.log(chalk.gray('   No recent actions'));
        } else {
            recentActions.forEach(action => {
                const statusIcon = action.success ? '✅' : '❌';
                const time = action.timestamp.toLocaleTimeString();
                console.log(chalk.white(`   ${statusIcon} [${time}] ${action.service}: ${action.action}`));
                console.log(chalk.gray(`      Duration: ${action.duration}ms | ${action.details}`));
                if (action.error) {
                    console.log(chalk.red(`      Error: ${action.error}`));
                }
            });
        }
        console.log();

        // Configuration
        console.log(chalk.blue('⚙️ CONFIGURATION'));
        console.log(chalk.white(`   Auto-restart: ${this.recoveryConfig.autoRestartServices ? '✅ Enabled' : '❌ Disabled'}`));
        console.log(chalk.white(`   Auto-cleanup: ${this.recoveryConfig.autoCleanupOnFailure ? '✅ Enabled' : '❌ Disabled'}`));
        console.log(chalk.white(`   Max Restarts: ${this.recoveryConfig.maxRestartAttempts}`));
        console.log(chalk.white(`   Check Interval: ${this.recoveryConfig.monitoringInterval}ms`));
        console.log(chalk.white(`   Critical Services: ${this.recoveryConfig.criticalServices.join(', ')}`));
    }

    /**
     * Enable or disable recovery mode
     */
    async setRecoveryMode(enabled: boolean): Promise<void> {
        this.recoveryMode = enabled;
        const action = enabled ? 'enabled' : 'disabled';
        
        console.log(chalk.cyan(`🚑 Recovery mode ${action}`));
        await this.logRecoveryAction('system', enabled ? 'enable-recovery' : 'disable-recovery', true, 0, `Recovery mode ${action}`);

        if (enabled) {
            console.log(chalk.yellow('⚠️ System is now in recovery mode - enhanced monitoring active'));
            // Reduce monitoring interval in recovery mode
            this.recoveryConfig.monitoringInterval = Math.min(this.recoveryConfig.monitoringInterval, 5000);
        } else {
            console.log(chalk.green('✅ System returned to normal monitoring'));
            // Restore normal monitoring interval
            this.loadRecoveryConfig();
        }
    }

    /**
     * Export recovery logs and health data
     */
    async exportRecoveryData(format: 'json' | 'csv' | 'html' = 'json'): Promise<string> {
        const health = await this.getSystemHealth();
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `ces-recovery-${timestamp}.${format}`;
        const filepath = path.join(this.configManager.getProjectRoot(), '.claude', 'exports', filename);

        await fs.ensureDir(path.dirname(filepath));

        const exportData = {
            timestamp: new Date().toISOString(),
            systemHealth: health,
            configuration: this.recoveryConfig,
            serviceHealth: Array.from(this.serviceHealth.entries()),
            recoveryActions: this.recoveryActions
        };

        switch (format) {
            case 'json':
                await fs.writeJSON(filepath, exportData, { spaces: 2 });
                break;
            case 'csv':
                const csv = this.exportToCSV(exportData);
                await fs.writeFile(filepath, csv);
                break;
            case 'html':
                const html = this.exportToHTML(exportData);
                await fs.writeFile(filepath, html);
                break;
        }

        console.log(chalk.green(`✅ Recovery data exported to: ${filepath}`));
        return filepath;
    }

    /**
     * Start monitoring loop
     */
    private startMonitoringLoop(): void {
        const monitor = async () => {
            if (!this.isMonitoring) return;

            try {
                await this.performHealthChecks();
                await this.executeAutoRecovery();
            } catch (error) {
                console.error(chalk.red('❌ Monitoring error:'), error instanceof Error ? error.message : error);
            }

            // Schedule next check
            setTimeout(monitor, this.recoveryConfig.monitoringInterval);
        };

        // Start monitoring
        setTimeout(monitor, 1000); // Start after 1 second
    }

    /**
     * Perform comprehensive health checks
     */
    private async performFullHealthCheck(): Promise<void> {
        console.log(chalk.cyan('🔍 Performing full health check...'));

        // Check critical services
        for (const serviceName of this.recoveryConfig.criticalServices) {
            await this.checkServiceHealth(serviceName);
        }

        // Check Claude Code CLI
        await this.checkClaudeCodeCLI();

        // Check MCP servers
        await this.checkMCPServers();

        // Check session system
        await this.checkSessionSystem();

        // Check development servers
        await this.checkDevelopmentServers();

        console.log(chalk.green('✅ Full health check completed'));
    }

    /**
     * Perform regular health checks
     */
    private async performHealthChecks(): Promise<void> {
        // Quick checks for critical services
        for (const serviceName of this.recoveryConfig.criticalServices) {
            await this.checkServiceHealth(serviceName);
        }
    }

    /**
     * Execute automatic recovery actions
     */
    private async executeAutoRecovery(): Promise<void> {
        if (!this.recoveryConfig.autoRestartServices) return;

        for (const [serviceName, health] of this.serviceHealth) {
            if (health.status === 'failed' || health.status === 'critical') {
                if (health.restartCount < this.recoveryConfig.maxRestartAttempts) {
                    console.log(chalk.yellow(`🔄 Auto-recovering ${serviceName} (attempt ${health.restartCount + 1})`));
                    await this.triggerRecovery(serviceName, 'restart');
                } else {
                    console.log(chalk.red(`❌ ${serviceName} exceeded max restart attempts, escalating...`));
                    await this.escalateRecovery(serviceName);
                }
            }
        }
    }

    /**
     * Check health of a specific service
     */
    private async checkServiceHealth(serviceName: string): Promise<ServiceHealth> {
        const startTime = Date.now();
        let status: ServiceHealth['status'] = 'unknown';
        let lastError: string | undefined;
        let pid: number | undefined;
        let port: number | undefined;

        try {
            switch (serviceName) {
                case 'claude-code-cli':
                    status = await this.checkClaudeCodeCLI() ? 'healthy' : 'failed';
                    break;
                case 'mcp-servers':
                    status = await this.checkMCPServers() ? 'healthy' : 'degraded';
                    break;
                case 'session-system':
                    status = await this.checkSessionSystem() ? 'healthy' : 'critical';
                    break;
                case 'dev-servers':
                    status = await this.checkDevelopmentServers() ? 'healthy' : 'degraded';
                    break;
                default:
                    // Generic process check
                    const processInfo = await this.checkGenericProcess(serviceName);
                    status = processInfo.running ? 'healthy' : 'failed';
                    pid = processInfo.pid;
                    port = processInfo.port;
            }
        } catch (error) {
            status = 'failed';
            lastError = error instanceof Error ? error.message : String(error);
        }

        const responseTime = Date.now() - startTime;
        const existing = this.serviceHealth.get(serviceName);
        
        const health: ServiceHealth = {
            name: serviceName,
            status,
            lastCheck: new Date(),
            uptime: existing?.uptime || 0,
            restartCount: existing?.restartCount || 0,
            lastError,
            pid,
            port,
            responseTime
        };

        // Update uptime if service is healthy
        if (status === 'healthy' && existing) {
            health.uptime = existing.uptime + this.recoveryConfig.monitoringInterval;
        } else if (status !== 'healthy') {
            health.uptime = 0;
        }

        this.serviceHealth.set(serviceName, health);
        return health;
    }

    /**
     * Check Claude Code CLI status
     */
    private async checkClaudeCodeCLI(): Promise<boolean> {
        try {
            const result = execSync('claude --version 2>/dev/null', { encoding: 'utf8', timeout: 5000 });
            return result.includes('claude');
        } catch {
            return false;
        }
    }

    /**
     * Check MCP servers status
     */
    private async checkMCPServers(): Promise<boolean> {
        try {
            // Check if MCP config exists and has servers
            const mcpConfigPath = path.join(this.configManager.getProjectRoot(), '.claude', 'ecosystem.json');
            if (!await fs.pathExists(mcpConfigPath)) return false;
            
            const config = await fs.readJSON(mcpConfigPath);
            return config.mcpServers && Object.keys(config.mcpServers).length > 0;
        } catch {
            return false;
        }
    }

    /**
     * Check session system status
     */
    private async checkSessionSystem(): Promise<boolean> {
        try {
            const sessionStatus = await this.sessionManager.getSessionStatus();
            return sessionStatus.initialized;
        } catch {
            return false;
        }
    }

    /**
     * Check development servers status
     */
    private async checkDevelopmentServers(): Promise<boolean> {
        try {
            // Check for common dev server ports
            const commonPorts = [3000, 3001, 4200, 5000, 8000, 8080];
            for (const port of commonPorts) {
                const result = execSync(`netstat -tuln 2>/dev/null | grep :${port} || echo "not_found"`, { encoding: 'utf8' });
                if (!result.includes('not_found')) {
                    return true; // At least one dev server is running
                }
            }
            return false;
        } catch {
            return false;
        }
    }

    /**
     * Check generic process status
     */
    private async checkGenericProcess(processName: string): Promise<{ running: boolean; pid?: number; port?: number }> {
        try {
            const result = execSync(`pgrep -f "${processName}" 2>/dev/null || echo ""`, { encoding: 'utf8' });
            const pids = result.trim().split('\n').filter(p => p).map(p => parseInt(p));
            
            if (pids.length > 0) {
                return { running: true, pid: pids[0] };
            }
            return { running: false };
        } catch {
            return { running: false };
        }
    }

    /**
     * Restart a service
     */
    private async restartService(serviceName: string): Promise<boolean> {
        try {
            console.log(chalk.cyan(`🔄 Restarting ${serviceName}...`));

            switch (serviceName) {
                case 'claude-code-cli':
                    // Claude Code CLI restart logic
                    return await this.restartClaudeCodeCLI();
                case 'mcp-servers':
                    // MCP servers restart logic
                    return await this.restartMCPServers();
                case 'session-system':
                    // Session system restart logic
                    return await this.restartSessionSystem();
                case 'dev-servers':
                    // Dev servers restart logic
                    return await this.restartDevelopmentServers();
                default:
                    // Generic process restart
                    return await this.restartGenericProcess(serviceName);
            }
        } catch (error) {
            console.error(chalk.red(`❌ Failed to restart ${serviceName}:`), error instanceof Error ? error.message : error);
            return false;
        }
    }

    /**
     * Cleanup a service
     */
    private async cleanupService(serviceName: string): Promise<boolean> {
        try {
            console.log(chalk.cyan(`🧹 Cleaning up ${serviceName}...`));
            
            // Use SystemCleanupManager for thorough cleanup
            await this.cleanupManager.executeCleanReset({
                dryRun: false,
                preserveSessions: true,
                preserveLogs: true,
                resetDockerContainers: false,
                killAllNodeProcesses: serviceName.includes('node'),
                clearSystemCache: true,
                forceKill: false
            });
            
            return true;
        } catch (error) {
            console.error(chalk.red(`❌ Failed to cleanup ${serviceName}:`), error instanceof Error ? error.message : error);
            return false;
        }
    }

    /**
     * Repair a service
     */
    private async repairService(serviceName: string): Promise<boolean> {
        try {
            console.log(chalk.cyan(`🔧 Repairing ${serviceName}...`));
            
            // Service-specific repair logic
            switch (serviceName) {
                case 'claude-code-cli':
                    return await this.repairClaudeCodeCLI();
                case 'mcp-servers':
                    return await this.repairMCPServers();
                case 'session-system':
                    return await this.repairSessionSystem();
                default:
                    // Generic repair: cleanup + restart
                    await this.cleanupService(serviceName);
                    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
                    return await this.restartService(serviceName);
            }
        } catch (error) {
            console.error(chalk.red(`❌ Failed to repair ${serviceName}:`), error instanceof Error ? error.message : error);
            return false;
        }
    }

    /**
     * Escalate recovery when automatic recovery fails
     */
    private async escalateRecovery(serviceName: string): Promise<void> {
        console.log(chalk.red(`🚨 Escalating recovery for ${serviceName}`));
        
        // Enter recovery mode
        await this.setRecoveryMode(true);
        
        // Log escalation
        await this.logRecoveryAction(serviceName, 'escalate', true, 0, 'Recovery escalated - entering recovery mode');
        
        // Notify user
        if (this.recoveryConfig.notificationEnabled) {
            console.log(chalk.red(`🚨 CRITICAL: ${serviceName} requires manual intervention`));
            console.log(chalk.yellow('Recommended actions:'));
            console.log(chalk.gray('  1. Check service logs'));
            console.log(chalk.gray('  2. Verify system resources'));
            console.log(chalk.gray('  3. Consider manual restart'));
            console.log(chalk.gray('  4. Contact system administrator if issues persist'));
        }
    }

    /**
     * Service-specific restart methods
     */
    private async restartClaudeCodeCLI(): Promise<boolean> {
        try {
            // Kill existing Claude processes
            execSync('pkill -f claude 2>/dev/null || true');
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Verify Claude Code CLI is working
            execSync('claude --version', { timeout: 10000 });
            return true;
        } catch {
            return false;
        }
    }

    private async restartMCPServers(): Promise<boolean> {
        try {
            // Restart MCP servers by running activation script
            const projectRoot = this.configManager.getProjectRoot();
            const mcpScript = path.join(projectRoot, 'ces-mcp-activate.sh');
            
            if (await fs.pathExists(mcpScript)) {
                execSync(`bash "${mcpScript}"`, { cwd: projectRoot, timeout: 30000 });
                return true;
            }
            return false;
        } catch {
            return false;
        }
    }

    private async restartSessionSystem(): Promise<boolean> {
        try {
            // Restart session manager
            await this.sessionManager.closeSession(true);
            await new Promise(resolve => setTimeout(resolve, 1000));
            await this.sessionManager.startSession(false);
            return true;
        } catch {
            return false;
        }
    }

    private async restartDevelopmentServers(): Promise<boolean> {
        try {
            // Kill dev servers and restart
            execSync('pkill -f "npm run dev\\|yarn dev\\|pnpm dev" 2>/dev/null || true');
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Try to restart dev server if package.json exists
            const projectRoot = this.configManager.getProjectRoot();
            const packageJson = path.join(projectRoot, 'package.json');
            
            if (await fs.pathExists(packageJson)) {
                const pkg = await fs.readJSON(packageJson);
                if (pkg.scripts?.dev) {
                    // Start in background
                    spawn('npm', ['run', 'dev'], { 
                        detached: true, 
                        stdio: 'ignore',
                        cwd: projectRoot 
                    });
                    return true;
                }
            }
            return false;
        } catch {
            return false;
        }
    }

    private async restartGenericProcess(processName: string): Promise<boolean> {
        try {
            // Kill process
            execSync(`pkill -f "${processName}" 2>/dev/null || true`);
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Note: Generic restart would need specific logic per process type
            // This is a placeholder for process-specific restart logic
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Service-specific repair methods
     */
    private async repairClaudeCodeCLI(): Promise<boolean> {
        try {
            // Reinstall Claude Code CLI
            console.log(chalk.cyan('🔧 Reinstalling Claude Code CLI...'));
            execSync('npm install -g @anthropic-ai/claude-code', { timeout: 60000 });
            
            // Verify installation
            execSync('claude --version', { timeout: 10000 });
            return true;
        } catch {
            return false;
        }
    }

    private async repairMCPServers(): Promise<boolean> {
        try {
            // Repair MCP configuration
            const projectRoot = this.configManager.getProjectRoot();
            const initScript = path.join(projectRoot, 'ces-init-private.sh');
            
            if (await fs.pathExists(initScript)) {
                execSync(`bash "${initScript}" --mcp-only`, { cwd: projectRoot, timeout: 60000 });
                return true;
            }
            return false;
        } catch {
            return false;
        }
    }

    private async repairSessionSystem(): Promise<boolean> {
        try {
            // Clear corrupted session data and reinitialize
            const sessionDir = path.join(this.configManager.getProjectRoot(), '.claude', 'session');
            await fs.remove(sessionDir);
            await fs.ensureDir(sessionDir);
            
            // Reinitialize session system
            await this.sessionManager.startSession(true);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Calculate overall system health
     */
    private calculateOverallHealth(services: ServiceHealth[]): SystemHealth['overall'] {
        if (services.length === 0) return 'unknown';

        const criticalFailed = services.filter(s => 
            this.recoveryConfig.criticalServices.includes(s.name) && 
            (s.status === 'failed' || s.status === 'critical')
        ).length;

        const totalFailed = services.filter(s => s.status === 'failed').length;
        const totalCritical = services.filter(s => s.status === 'critical').length;
        const totalDegraded = services.filter(s => s.status === 'degraded').length;

        if (criticalFailed > 0) return 'emergency';
        if (totalFailed > 0 || totalCritical > 0) return 'critical';
        if (totalDegraded > 0) return 'degraded';
        return 'healthy';
    }

    /**
     * Log recovery action
     */
    private async logRecoveryAction(
        service: string,
        action: string,
        success: boolean,
        duration: number,
        details: string,
        error?: string
    ): Promise<void> {
        const recoveryAction: RecoveryAction = {
            id: uuidv4(),
            timestamp: new Date(),
            service,
            action: action as RecoveryAction['action'],
            success,
            duration,
            details,
            error
        };

        this.recoveryActions.push(recoveryAction);

        // Keep only last 1000 actions
        if (this.recoveryActions.length > 1000) {
            this.recoveryActions = this.recoveryActions.slice(-1000);
        }

        // Log to file
        const logDir = path.join(this.configManager.getProjectRoot(), '.claude', 'logs');
        await fs.ensureDir(logDir);
        
        const logFile = path.join(logDir, 'recovery.log');
        const logEntry = `[${recoveryAction.timestamp.toISOString()}] ${service}:${action} ${success ? 'SUCCESS' : 'FAILED'} (${duration}ms) - ${details}${error ? ` | Error: ${error}` : ''}\n`;
        
        await fs.appendFile(logFile, logEntry);
    }

    /**
     * Load recovery configuration
     */
    private loadRecoveryConfig(): RecoveryConfig {
        return {
            enabled: envConfig.get<boolean>('autoRecovery.enabled'),
            monitoringInterval: envConfig.get<number>('autoRecovery.checkInterval'),
            healthCheckTimeout: envConfig.get<number>('healthCheckInterval'),
            maxRestartAttempts: envConfig.get<number>('autoRecovery.maxRestartAttempts'),
            backoffMultiplier: 2, // Keep static for now
            criticalServices: ['claude-code-cli', 'session-system', 'mcp-servers'], // Keep core services
            autoRestartServices: envConfig.get<boolean>('autoRecovery.autoRestartEnabled'),
            autoCleanupOnFailure: envConfig.get<boolean>('autoRecovery.autoCleanupEnabled'),
            notificationEnabled: true // Always enable notifications
        };
    }

    /**
     * Utility methods
     */
    private getStatusColor(status: string): (text: string) => string {
        switch (status) {
            case 'healthy': return chalk.green;
            case 'degraded': return chalk.yellow;
            case 'critical': return chalk.red;
            case 'emergency': return chalk.redBright;
            default: return chalk.gray;
        }
    }

    private getServiceStatusIcon(status: ServiceHealth['status']): string {
        switch (status) {
            case 'healthy': return '🟢';
            case 'degraded': return '🟡';
            case 'critical': return '🟠';
            case 'failed': return '🔴';
            default: return '⚪';
        }
    }

    private formatUptime(ms: number): string {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days}d ${hours % 24}h`;
        if (hours > 0) return `${hours}h ${minutes % 60}m`;
        if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
        return `${seconds}s`;
    }

    private exportToCSV(data: any): string {
        const headers = 'timestamp,service,action,success,duration,details,error';
        const rows = data.recoveryActions.map((action: RecoveryAction) => [
            action.timestamp.toISOString(),
            action.service,
            action.action,
            action.success,
            action.duration,
            `"${action.details.replace(/"/g, '""')}"`,
            action.error ? `"${action.error.replace(/"/g, '""')}"` : ''
        ].join(','));

        return headers + '\n' + rows.join('\n');
    }

    private exportToHTML(data: any): string {
        return `
<!DOCTYPE html>
<html>
<head>
    <title>CES Auto-Recovery Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { color: #2c3e50; }
        .status { padding: 10px; margin: 10px 0; border-radius: 5px; }
        .healthy { background-color: #d4edda; }
        .degraded { background-color: #fff3cd; }
        .critical { background-color: #f8d7da; }
        .action { margin: 5px 0; padding: 5px; border-left: 3px solid #ccc; }
        .success { border-left-color: #28a745; }
        .failure { border-left-color: #dc3545; }
    </style>
</head>
<body>
    <h1 class="header">CES Auto-Recovery Report</h1>
    <p>Generated: ${new Date().toLocaleString()}</p>
    
    <h2>System Health</h2>
    <div class="status ${data.systemHealth.overall}">
        Overall Status: ${data.systemHealth.overall.toUpperCase()}
    </div>
    
    <h2>Services</h2>
    ${data.systemHealth.services.map((service: ServiceHealth) => `
        <div class="status ${service.status}">
            <strong>${service.name}</strong>: ${service.status}
            <br>Uptime: ${this.formatUptime(service.uptime)}
            <br>Restarts: ${service.restartCount}
        </div>
    `).join('')}
    
    <h2>Recovery Actions</h2>
    ${data.recoveryActions.slice(-20).map((action: RecoveryAction) => `
        <div class="action ${action.success ? 'success' : 'failure'}">
            <strong>[${action.timestamp.toLocaleTimeString()}]</strong> 
            ${action.service}: ${action.action}
            <br>${action.details}
            ${action.error ? `<br><em>Error: ${action.error}</em>` : ''}
        </div>
    `).join('')}
</body>
</html>`;
    }
}