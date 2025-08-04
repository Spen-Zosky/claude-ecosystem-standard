/**
 * Session Monitor - Monitors Claude Code CLI commands and coordinates CES actions
 * 
 * Provides intelligent coordination between Claude Code CLI native commands
 * and CES SessionManager for unified workflow experience.
 */

import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import { spawn, ChildProcess } from 'child_process';
import { ConfigManager } from '../config/ConfigManager.js';
import { SessionManager } from '../session/SessionManager.js';

export interface MonitorOptions {
    autoCheckpoint: boolean;
    autoClose: boolean;
    autoCleanReset: boolean;
    pollInterval: number;
    logLevel: 'debug' | 'info' | 'warn' | 'error';
}

export class SessionMonitor {
    private configManager: ConfigManager;
    // private _sessionManager: SessionManager; // Removed unused field
    private isMonitoring: boolean = false;
    private monitorProcess: ChildProcess | null = null;
    private logFile: string;

    constructor(configManager: ConfigManager, _sessionManager: SessionManager) {
        this.configManager = configManager;
        // this._sessionManager = sessionManager; // Removed unused field
        this.logFile = path.join(configManager.getProjectRoot(), '.claude', 'session-monitor.log');
    }

    /**
     * Start monitoring Claude Code CLI session commands
     */
    async startMonitoring(options: Partial<MonitorOptions> = {}): Promise<void> {
        const fullOptions: MonitorOptions = {
            autoCheckpoint: true,
            autoClose: true,
            autoCleanReset: true,
            pollInterval: 5000, // 5 seconds
            logLevel: 'info',
            ...options
        };

        if (this.isMonitoring) {
            this.log('⚠️ Session monitor already running', 'warn');
            return;
        }

        this.isMonitoring = true;
        this.log('🔍 Starting Claude Code CLI session monitor...', 'info');

        try {
            // Create monitoring script
            await this.createMonitoringScript();
            
            // Start background monitoring
            this.startBackgroundMonitor(fullOptions);
            
            this.log('✅ Session monitor started successfully', 'info');
            
        } catch (error) {
            this.isMonitoring = false;
            this.log(`❌ Failed to start session monitor: ${error}`, 'error');
            throw error;
        }
    }

    /**
     * Stop monitoring
     */
    async stopMonitoring(): Promise<void> {
        if (!this.isMonitoring) {
            return;
        }

        this.isMonitoring = false;
        
        if (this.monitorProcess) {
            this.monitorProcess.kill();
            this.monitorProcess = null;
        }

        this.log('⏹️ Session monitor stopped', 'info');
    }

    /**
     * Create monitoring script that watches for Claude commands
     */
    private async createMonitoringScript(): Promise<void> {
        const scriptPath = path.join(this.configManager.getProjectRoot(), '.claude', 'monitor-script.sh');
        
        const script = `#!/bin/bash

# Claude Code CLI Session Monitor Script
# Watches for Claude commands and triggers CES actions

CLAUDE_LOG_FILE="$HOME/.claude/logs/session.log"
CLAUDE_HOOK_LOG=".claude/hook.log"
CES_TRIGGER_FILE=".claude/ces-trigger"

# Function to log messages
monitor_log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') [MONITOR] $1" >> ".claude/session-monitor.log"
}

# Function to trigger CES checkpoint
trigger_checkpoint() {
    monitor_log "🔄 Triggering CES checkpoint..."
    if npm run dev -- checkpoint-session --message "Auto checkpoint from **register session" 2>/dev/null; then
        monitor_log "✅ CES checkpoint completed"
    else
        monitor_log "⚠️ CES checkpoint failed or not available"
    fi
}

# Function to trigger CES close
trigger_close() {
    monitor_log "🔄 Triggering CES close..."
    if npm run dev -- close-session --save 2>/dev/null; then
        monitor_log "✅ CES session closed"
    else
        monitor_log "⚠️ CES close failed or not available"
    fi
}

# Function to trigger CES clean-reset
trigger_clean_reset() {
    monitor_log "🧹 Triggering CES clean-reset..."
    
    # Check if dry-run mode
    if [ -f "$CES_TRIGGER_FILE.clean-reset-dry" ]; then
        monitor_log "🔍 Dry-run mode detected"
        if npm run dev -- clean-reset --dry-run 2>/dev/null; then
            monitor_log "✅ CES clean-reset dry-run completed"
        else
            monitor_log "⚠️ CES clean-reset dry-run failed"
        fi
        rm -f "$CES_TRIGGER_FILE.clean-reset-dry"
    else
        # Full clean-reset
        if npm run dev -- clean-reset 2>/dev/null; then
            monitor_log "✅ CES clean-reset completed"
        else
            monitor_log "⚠️ CES clean-reset failed or not available"
        fi
    fi
}

# Main monitoring loop
monitor_log "🚀 Claude session monitor started"

while true; do
    # Check for register session trigger
    if [ -f "$CES_TRIGGER_FILE.checkpoint" ]; then
        trigger_checkpoint
        rm -f "$CES_TRIGGER_FILE.checkpoint"
    fi
    
    # Check for close session trigger
    if [ -f "$CES_TRIGGER_FILE.close" ]; then
        trigger_close
        rm -f "$CES_TRIGGER_FILE.close"
    fi
    
    # Check for clean-reset trigger
    if [ -f "$CES_TRIGGER_FILE.clean-reset" ]; then
        trigger_clean_reset
        rm -f "$CES_TRIGGER_FILE.clean-reset"
    fi
    
    # Check for clean-reset dry-run trigger
    if [ -f "$CES_TRIGGER_FILE.clean-reset-dry" ]; then
        trigger_clean_reset
        # Note: clean-reset-dry file is removed inside trigger_clean_reset function
    fi
    
    # Check if monitoring should stop
    if [ -f "$CES_TRIGGER_FILE.stop" ]; then
        monitor_log "⏹️ Stop signal received"
        rm -f "$CES_TRIGGER_FILE.stop"
        break
    fi
    
    sleep 5
done

monitor_log "⏹️ Claude session monitor stopped"
`;

        await fs.writeFile(scriptPath, script);
        await fs.chmod(scriptPath, '755');
    }

    /**
     * Start background monitoring process
     */
    private startBackgroundMonitor(_options: MonitorOptions): void {
        const scriptPath = path.join(this.configManager.getProjectRoot(), '.claude', 'monitor-script.sh');
        
        this.monitorProcess = spawn('bash', [scriptPath], {
            detached: true,
            stdio: 'ignore',
            cwd: this.configManager.getProjectRoot()
        });

        this.monitorProcess.unref();
    }

    /**
     * Trigger manual checkpoint (for **register session integration)
     */
    async triggerCheckpoint(message?: string): Promise<void> {
        const triggerFile = path.join(this.configManager.getProjectRoot(), '.claude', 'ces-trigger.checkpoint');
        
        try {
            await fs.writeFile(triggerFile, message || 'Manual trigger from **register session');
            this.log('🔄 Checkpoint trigger created', 'info');
        } catch (error) {
            this.log(`❌ Failed to create checkpoint trigger: ${error}`, 'error');
        }
    }

    /**
     * Trigger manual close (for **close session integration)
     */
    async triggerClose(): Promise<void> {
        const triggerFile = path.join(this.configManager.getProjectRoot(), '.claude', 'ces-trigger.close');
        
        try {
            await fs.writeFile(triggerFile, 'Manual trigger from **close session');
            this.log('🔄 Close trigger created', 'info');
        } catch (error) {
            this.log(`❌ Failed to create close trigger: ${error}`, 'error');
        }
    }

    /**
     * Trigger clean-reset (for **clean reset integration)
     */
    async triggerCleanReset(dryRun: boolean = false): Promise<void> {
        const triggerFile = path.join(
            this.configManager.getProjectRoot(), 
            '.claude', 
            dryRun ? 'ces-trigger.clean-reset-dry' : 'ces-trigger.clean-reset'
        );
        
        try {
            const message = dryRun 
                ? 'Dry-run trigger from **clean reset' 
                : 'Manual trigger from **clean reset';
            await fs.writeFile(triggerFile, message);
            this.log(`🧹 Clean-reset trigger created ${dryRun ? '(dry-run)' : ''}`, 'info');
        } catch (error) {
            this.log(`❌ Failed to create clean-reset trigger: ${error}`, 'error');
        }
    }

    /**
     * Check if monitoring is active
     */
    isActive(): boolean {
        return this.isMonitoring;
    }

    /**
     * Get monitoring status
     */
    async getStatus(): Promise<{
        isActive: boolean;
        logFile: string;
        triggerFiles: string[];
    }> {
        const claudeDir = path.join(this.configManager.getProjectRoot(), '.claude');
        const triggerFiles = [];
        
        try {
            const files = await fs.readdir(claudeDir);
            triggerFiles.push(...files.filter(f => f.startsWith('ces-trigger')));
        } catch {
            // Directory might not exist
        }

        return {
            isActive: this.isMonitoring,
            logFile: this.logFile,
            triggerFiles
        };
    }

    /**
     * Log messages to file and console
     */
    private log(message: string, level: 'debug' | 'info' | 'warn' | 'error' = 'info'): void {
        const timestamp = new Date().toISOString();
        const logEntry = `${timestamp} [${level.toUpperCase()}] ${message}`;
        
        // Log to file
        try {
            fs.appendFileSync(this.logFile, logEntry + '\n');
        } catch {
            // Silent fail for logging
        }
        
        // Log to console based on level
        switch (level) {
            case 'debug':
                console.log(chalk.gray(logEntry));
                break;
            case 'info':
                console.log(chalk.blue(logEntry));
                break;
            case 'warn':
                console.log(chalk.yellow(logEntry));
                break;
            case 'error':
                console.log(chalk.red(logEntry));
                break;
        }
    }
}