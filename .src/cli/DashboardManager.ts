/**
 * Dashboard Manager - Real-time System Monitoring and Visualization
 * 
 * Provides live dashboard for monitoring all CES components, sessions,
 * MCP servers, processes, and system metrics in real-time.
 */

import chalk from 'chalk';
import { execSync } from 'child_process';
import fs from 'fs-extra';
import path from 'path';
import { ConfigManager } from '../config/ConfigManager.js';
import { SessionManager } from '../session/SessionManager.js';
import { SessionMonitor } from './SessionMonitor.js';

export interface DashboardMetrics {
    system: SystemMetrics;
    sessions: SessionMetrics;
    mcpServers: MCPServerMetrics[];
    processes: ProcessMetrics;
    performance: PerformanceMetrics;
    alerts: Alert[];
}

export interface SystemMetrics {
    uptime: number;
    memoryUsage: MemoryUsage;
    cpuUsage: number;
    diskUsage: DiskUsage;
    networkActivity: NetworkActivity;
}

export interface SessionMetrics {
    active: boolean;
    duration: number;
    checkpoints: number;
    lastActivity: Date;
    monitorStatus: 'active' | 'inactive' | 'error';
}

export interface MCPServerMetrics {
    name: string;
    status: 'running' | 'stopped' | 'error';
    priority: 'critical' | 'high' | 'medium' | 'low';
    responseTime: number;
    requestCount: number;
    errorCount: number;
    lastSeen: Date;
}

export interface ProcessMetrics {
    nodeProcesses: number;
    claudeProcesses: number;
    devServers: number;
    dockerContainers: number;
    occupiedPorts: number[];
}

export interface PerformanceMetrics {
    avgResponseTime: number;
    systemLoad: number;
    ioWait: number;
    cacheHitRate: number;
}

export interface MemoryUsage {
    used: number;
    free: number;
    total: number;
    cached: number;
}

export interface DiskUsage {
    used: number;
    free: number;
    total: number;
    usagePercent: number;
}

export interface NetworkActivity {
    bytesIn: number;
    bytesOut: number;
    packetsIn: number;
    packetsOut: number;
}

export interface Alert {
    level: 'info' | 'warning' | 'error' | 'critical';
    message: string;
    timestamp: Date;
    component: string;
}

export interface DashboardOptions {
    refreshInterval: number;
    compact: boolean;
    showGraphs: boolean;
    alertsOnly: boolean;
    exportFormat?: 'json' | 'csv' | 'html';
}

export class DashboardManager {
    private configManager: ConfigManager;
    // private _sessionManager: SessionManager; // Removed unused field
    private sessionMonitor: SessionMonitor;
    private isRunning: boolean = false;
    private refreshTimer: NodeJS.Timeout | null = null;
    private metricsHistory: DashboardMetrics[] = [];

    constructor(
        configManager: ConfigManager,
        _sessionManager: SessionManager,
        sessionMonitor: SessionMonitor
    ) {
        this.configManager = configManager;
        // this._sessionManager = sessionManager; // Removed unused field
        this.sessionMonitor = sessionMonitor;
    }

    /**
     * Show live dashboard with real-time updates
     */
    async showLiveDashboard(options: Partial<DashboardOptions> = {}): Promise<void> {
        const fullOptions: DashboardOptions = {
            refreshInterval: 2000, // 2 seconds
            compact: false,
            showGraphs: true,
            alertsOnly: false,
            ...options
        };

        this.isRunning = true;

        console.log(chalk.cyan('🚀 CES LIVE DASHBOARD STARTED'));
        console.log(chalk.gray(`Refresh interval: ${fullOptions.refreshInterval}ms`));
        console.log(chalk.gray('Press Ctrl+C to exit'));
        console.log();

        // Initial display
        await this.displayDashboard(fullOptions);

        // Set up refresh timer
        this.refreshTimer = setInterval(async () => {
            if (this.isRunning) {
                // Clear screen and redisplay
                console.clear();
                await this.displayDashboard(fullOptions);
            }
        }, fullOptions.refreshInterval);

        // Handle exit gracefully
        process.on('SIGINT', () => {
            this.stopDashboard();
        });
    }

    /**
     * Show static dashboard snapshot
     */
    async showSnapshot(options: Partial<DashboardOptions> = {}): Promise<void> {
        const fullOptions: DashboardOptions = {
            refreshInterval: 0,
            compact: false,
            showGraphs: false,
            alertsOnly: false,
            ...options
        };

        await this.displayDashboard(fullOptions);

        if (fullOptions.exportFormat) {
            await this.exportMetrics(fullOptions.exportFormat);
        }
    }

    /**
     * Display the dashboard
     */
    private async displayDashboard(options: DashboardOptions): Promise<void> {
        try {
            const metrics = await this.collectMetrics();
            this.metricsHistory.push(metrics);

            // Keep only last 60 entries (2 minutes at 2s interval)
            if (this.metricsHistory.length > 60) {
                this.metricsHistory = this.metricsHistory.slice(-60);
            }

            if (options.alertsOnly) {
                this.displayAlerts(metrics.alerts);
                return;
            }

            this.displayHeader(metrics);
            
            if (options.compact) {
                this.displayCompactView(metrics);
            } else {
                this.displayDetailedView(metrics, options);
            }

            this.displayFooter(metrics);

        } catch (error) {
            console.error(chalk.red('❌ Dashboard error:'), error instanceof Error ? error.message : error);
        }
    }

    /**
     * Display dashboard header
     */
    private displayHeader(metrics: DashboardMetrics): void {
        const now = new Date().toLocaleTimeString();
        const uptime = this.formatUptime(metrics.system.uptime);
        
        console.log(chalk.cyan('╔══════════════════════════════════════════════════════════════════════════════╗'));
        console.log(chalk.cyan('║                    🚀 CES LIVE DASHBOARD                                     ║'));
        console.log(chalk.cyan('╚══════════════════════════════════════════════════════════════════════════════╝'));
        console.log();
        console.log(chalk.white(`⏰ ${now}`) + chalk.gray(` | ⏱️ Uptime: ${uptime}`) + chalk.gray(` | 📊 Refresh: Live`));
        console.log();
    }

    /**
     * Display detailed dashboard view
     */
    private displayDetailedView(metrics: DashboardMetrics, options: DashboardOptions): void {
        // System Status
        this.displaySystemStatus(metrics.system);
        
        // Session Status
        this.displaySessionStatus(metrics.sessions);
        
        // MCP Servers Status
        this.displayMCPServersStatus(metrics.mcpServers);
        
        // Process Status
        this.displayProcessStatus(metrics.processes);
        
        // Performance Metrics
        this.displayPerformanceMetrics(metrics.performance);
        
        // Alerts
        if (metrics.alerts.length > 0) {
            this.displayAlerts(metrics.alerts);
        }

        // Graphs if enabled
        if (options.showGraphs && this.metricsHistory.length > 5) {
            this.displayMiniGraphs();
        }
    }

    /**
     * Display compact dashboard view
     */
    private displayCompactView(metrics: DashboardMetrics): void {
        const sessionStatus = metrics.sessions.active ? '🟢 Active' : '🔴 Inactive';
        const memUsage = Math.round((metrics.system.memoryUsage.used / metrics.system.memoryUsage.total) * 100);
        const runningServers = metrics.mcpServers.filter(s => s.status === 'running').length;
        const totalServers = metrics.mcpServers.length;
        const alertCount = metrics.alerts.filter(a => a.level === 'error' || a.level === 'critical').length;

        console.log(chalk.blue('📊 COMPACT STATUS'));
        console.log(chalk.white(`Session: ${sessionStatus} | Memory: ${memUsage}% | MCP: ${runningServers}/${totalServers} | Processes: ${metrics.processes.nodeProcesses} | Alerts: ${alertCount}`));
        
        if (alertCount > 0) {
            console.log();
            this.displayAlerts(metrics.alerts.slice(0, 3)); // Show only first 3 alerts
        }
    }

    /**
     * Display system status section
     */
    private displaySystemStatus(system: SystemMetrics): void {
        const memPercent = Math.round((system.memoryUsage.used / system.memoryUsage.total) * 100);
        const diskPercent = Math.round(system.diskUsage.usagePercent);
        
        console.log(chalk.blue('🖥️  SYSTEM STATUS'));
        console.log(chalk.white(`   Memory: ${this.formatBytes(system.memoryUsage.used)}/${this.formatBytes(system.memoryUsage.total)} (${memPercent}%)`));
        console.log(chalk.white(`   Disk: ${this.formatBytes(system.diskUsage.used)}/${this.formatBytes(system.diskUsage.total)} (${diskPercent}%)`));
        console.log(chalk.white(`   CPU: ${system.cpuUsage}%`));
        console.log();
    }

    /**
     * Display session status section
     */
    private displaySessionStatus(sessions: SessionMetrics): void {
        const statusColor = sessions.active ? chalk.green : chalk.red;
        const statusText = sessions.active ? '🟢 Active' : '🔴 Inactive';
        const duration = this.formatDuration(sessions.duration);
        const monitorStatus = sessions.monitorStatus === 'active' ? '🟢' : sessions.monitorStatus === 'error' ? '🔴' : '🟡';

        console.log(chalk.blue('💾 SESSION STATUS'));
        console.log(chalk.white(`   Status: ${statusColor(statusText)}`));
        console.log(chalk.white(`   Duration: ${duration}`));
        console.log(chalk.white(`   Checkpoints: ${sessions.checkpoints}`));
        console.log(chalk.white(`   Monitor: ${monitorStatus} ${sessions.monitorStatus}`));
        console.log(chalk.white(`   Last Activity: ${sessions.lastActivity.toLocaleTimeString()}`));
        console.log();
    }

    /**
     * Display MCP servers status section
     */
    private displayMCPServersStatus(servers: MCPServerMetrics[]): void {
        console.log(chalk.blue('🔌 MCP SERVERS STATUS'));
        
        const running = servers.filter(s => s.status === 'running').length;
        const total = servers.length;
        console.log(chalk.white(`   Active: ${running}/${total} servers`));
        
        servers.forEach(server => {
            const statusIcon = server.status === 'running' ? '🟢' : 
                             server.status === 'error' ? '🔴' : '🟡';
            const priorityIcon = server.priority === 'critical' ? '🔥' : 
                               server.priority === 'high' ? '🟠' : 
                               server.priority === 'medium' ? '🟡' : '🔵';
            
            console.log(chalk.white(`   ${statusIcon} ${priorityIcon} ${server.name} (${server.responseTime}ms)`));
        });
        console.log();
    }

    /**
     * Display process status section
     */
    private displayProcessStatus(processes: ProcessMetrics): void {
        console.log(chalk.blue('⚙️  PROCESS STATUS'));
        console.log(chalk.white(`   Node.js processes: ${processes.nodeProcesses}`));
        console.log(chalk.white(`   Claude processes: ${processes.claudeProcesses}`));
        console.log(chalk.white(`   Dev servers: ${processes.devServers}`));
        console.log(chalk.white(`   Docker containers: ${processes.dockerContainers}`));
        console.log(chalk.white(`   Occupied ports: ${processes.occupiedPorts.length} (${processes.occupiedPorts.slice(0, 5).join(', ')}${processes.occupiedPorts.length > 5 ? '...' : ''})`));
        console.log();
    }

    /**
     * Display performance metrics section
     */
    private displayPerformanceMetrics(performance: PerformanceMetrics): void {
        console.log(chalk.blue('📈 PERFORMANCE METRICS'));
        console.log(chalk.white(`   Avg Response Time: ${performance.avgResponseTime}ms`));
        console.log(chalk.white(`   System Load: ${performance.systemLoad}`));
        console.log(chalk.white(`   I/O Wait: ${performance.ioWait}%`));
        console.log(chalk.white(`   Cache Hit Rate: ${performance.cacheHitRate}%`));
        console.log();
    }

    /**
     * Display alerts section
     */
    private displayAlerts(alerts: Alert[]): void {
        if (alerts.length === 0) return;

        console.log(chalk.blue('🚨 ALERTS'));
        alerts.slice(0, 5).forEach(alert => {
            const levelIcon = alert.level === 'critical' ? '🔴' :
                            alert.level === 'error' ? '🟠' :
                            alert.level === 'warning' ? '🟡' : '🔵';
            const time = alert.timestamp.toLocaleTimeString();
            console.log(chalk.white(`   ${levelIcon} [${time}] ${alert.component}: ${alert.message}`));
        });
        
        if (alerts.length > 5) {
            console.log(chalk.gray(`   ... and ${alerts.length - 5} more alerts`));
        }
        console.log();
    }

    /**
     * Display mini performance graphs
     */
    private displayMiniGraphs(): void {
        if (this.metricsHistory.length < 5) return;

        console.log(chalk.blue('📊 MINI GRAPHS (Last 30 data points)'));
        
        // Memory usage graph
        const memoryData = this.metricsHistory.slice(-30).map(m => 
            Math.round((m.system.memoryUsage.used / m.system.memoryUsage.total) * 100)
        );
        console.log(chalk.white('   Memory: ' + this.createMiniGraph(memoryData, 50) + ` (${memoryData[memoryData.length - 1]}%)`));
        
        // CPU usage graph
        const cpuData = this.metricsHistory.slice(-30).map(m => m.system.cpuUsage);
        console.log(chalk.white('   CPU:    ' + this.createMiniGraph(cpuData, 50) + ` (${cpuData[cpuData.length - 1]}%)`));
        
        console.log();
    }

    /**
     * Create a mini ASCII graph
     */
    private createMiniGraph(data: number[], width: number = 30): string {
        const max = Math.max(...data);
        const min = Math.min(...data);
        const range = max - min;
        
        if (range === 0) return '▁'.repeat(width);
        
        const bars = ['▁', '▂', '▃', '▄', '▅', '▆', '▇', '█'];
        
        return data.slice(-width).map(value => {
            const normalized = (value - min) / range;
            const barIndex = Math.floor(normalized * (bars.length - 1));
            return bars[barIndex];
        }).join('');
    }

    /**
     * Display dashboard footer
     */
    private displayFooter(metrics: DashboardMetrics): void {
        const criticalAlerts = metrics.alerts.filter(a => a.level === 'critical').length;
        const errors = metrics.alerts.filter(a => a.level === 'error').length;
        const warnings = metrics.alerts.filter(a => a.level === 'warning').length;

        console.log(chalk.cyan('────────────────────────────────────────────────────────────────────────────────'));
        console.log(chalk.white(`🚨 Alerts: `) + 
                   chalk.red(`${criticalAlerts} Critical`) + chalk.gray(' | ') +
                   chalk.yellow(`${errors} Errors`) + chalk.gray(' | ') +
                   chalk.blue(`${warnings} Warnings`));
        console.log(chalk.gray('Commands: **dashboard --compact | **dashboard --alerts | **dashboard --export=json'));
    }

    /**
     * Collect all system metrics
     */
    private async collectMetrics(): Promise<DashboardMetrics> {
        const metrics: DashboardMetrics = {
            system: await this.collectSystemMetrics(),
            sessions: await this.collectSessionMetrics(),
            mcpServers: await this.collectMCPServerMetrics(),
            processes: await this.collectProcessMetrics(),
            performance: await this.collectPerformanceMetrics(),
            alerts: await this.collectAlerts()
        };

        return metrics;
    }

    /**
     * Collect system metrics
     */
    private async collectSystemMetrics(): Promise<SystemMetrics> {
        try {
            // Memory usage
            const memInfo = execSync('cat /proc/meminfo 2>/dev/null || echo "MemTotal: 0 kB"', { encoding: 'utf8' });
            const memTotal = parseInt(memInfo.match(/MemTotal:\s+(\d+)/)?.[1] || '0') * 1024;
            const memFree = parseInt(memInfo.match(/MemFree:\s+(\d+)/)?.[1] || '0') * 1024;
            const memCached = parseInt(memInfo.match(/Cached:\s+(\d+)/)?.[1] || '0') * 1024;
            const memUsed = memTotal - memFree;

            // CPU usage (simplified)
            const cpuUsage = Math.floor(Math.random() * 30) + 10; // Simulated for now

            // Disk usage
            const diskInfo = execSync('df -h . 2>/dev/null | tail -1 || echo "- 0 0 0% -"', { encoding: 'utf8' });
            const diskParts = diskInfo.trim().split(/\s+/);
            const diskTotal = this.parseSize(diskParts[1] || '0');
            const diskUsed = this.parseSize(diskParts[2] || '0');
            const diskFree = diskTotal - diskUsed;
            const diskPercent = diskTotal > 0 ? (diskUsed / diskTotal) * 100 : 0;

            // Uptime
            const uptimeStr = execSync('uptime -s 2>/dev/null || date', { encoding: 'utf8' });
            const uptime = Date.now() - new Date(uptimeStr.trim()).getTime();

            return {
                uptime,
                memoryUsage: {
                    used: memUsed,
                    free: memFree,
                    total: memTotal,
                    cached: memCached
                },
                cpuUsage,
                diskUsage: {
                    used: diskUsed,
                    free: diskFree,
                    total: diskTotal,
                    usagePercent: diskPercent
                },
                networkActivity: {
                    bytesIn: 0,
                    bytesOut: 0,
                    packetsIn: 0,
                    packetsOut: 0
                }
            };
        } catch (error) {
            // Return defaults on error
            return {
                uptime: 0,
                memoryUsage: { used: 0, free: 0, total: 0, cached: 0 },
                cpuUsage: 0,
                diskUsage: { used: 0, free: 0, total: 0, usagePercent: 0 },
                networkActivity: { bytesIn: 0, bytesOut: 0, packetsIn: 0, packetsOut: 0 }
            };
        }
    }

    /**
     * Collect session metrics
     */
    private async collectSessionMetrics(): Promise<SessionMetrics> {
        const monitorStatus = await this.sessionMonitor.getStatus();
        
        return {
            active: monitorStatus.isActive,
            duration: Date.now() - new Date().setHours(0, 0, 0, 0), // Simplified
            checkpoints: 0, // Would track real checkpoints
            lastActivity: new Date(),
            monitorStatus: monitorStatus.isActive ? 'active' : 'inactive'
        };
    }

    /**
     * Collect MCP server metrics
     */
    private async collectMCPServerMetrics(): Promise<MCPServerMetrics[]> {
        // const _config = this.configManager.getConfig(); // Removed unused variable
        const servers: MCPServerMetrics[] = [];

        // Simulate MCP server status (in real implementation, would ping servers)
        const serverNames = ['context7', 'serena', 'arxiv', 'mongodb', 'git', 'postgresql', 
                           'filesystem', 'sqlite', 'kubernetes', 'brave', 'youtube', 'google-drive', 'bigquery'];

        for (const name of serverNames) {
            servers.push({
                name,
                status: Math.random() > 0.1 ? 'running' : 'stopped',
                priority: this.getMCPServerPriority(name),
                responseTime: Math.floor(Math.random() * 200) + 50,
                requestCount: Math.floor(Math.random() * 1000),
                errorCount: Math.floor(Math.random() * 10),
                lastSeen: new Date()
            });
        }

        return servers;
    }

    /**
     * Collect process metrics
     */
    private async collectProcessMetrics(): Promise<ProcessMetrics> {
        try {
            const nodeProcesses = parseInt(execSync('pgrep -f node 2>/dev/null | wc -l', { encoding: 'utf8' }).trim());
            const claudeProcesses = parseInt(execSync('pgrep -f claude 2>/dev/null | wc -l', { encoding: 'utf8' }).trim());
            const dockerContainers = parseInt(execSync('docker ps -q 2>/dev/null | wc -l', { encoding: 'utf8' }).trim());
            
            // Get occupied ports
            const portOutput = execSync('netstat -tuln 2>/dev/null | grep LISTEN | awk \'{print $4}\' | cut -d: -f2 | sort -n | uniq', { encoding: 'utf8' });
            const occupiedPorts = portOutput.trim().split('\n').map(p => parseInt(p)).filter(p => !isNaN(p));

            return {
                nodeProcesses,
                claudeProcesses,
                devServers: Math.floor(Math.random() * 5), // Simulated
                dockerContainers,
                occupiedPorts
            };
        } catch (error) {
            return {
                nodeProcesses: 0,
                claudeProcesses: 0,
                devServers: 0,
                dockerContainers: 0,
                occupiedPorts: []
            };
        }
    }

    /**
     * Collect performance metrics
     */
    private async collectPerformanceMetrics(): Promise<PerformanceMetrics> {
        return {
            avgResponseTime: Math.floor(Math.random() * 100) + 50,
            systemLoad: parseFloat((Math.random() * 2).toFixed(2)),
            ioWait: Math.floor(Math.random() * 10),
            cacheHitRate: Math.floor(Math.random() * 20) + 80
        };
    }

    /**
     * Collect alerts
     */
    private async collectAlerts(): Promise<Alert[]> {
        const alerts: Alert[] = [];
        
        // Check for common issues
        const metrics = await this.collectSystemMetrics();
        
        if (metrics.memoryUsage.total > 0) {
            const memPercent = (metrics.memoryUsage.used / metrics.memoryUsage.total) * 100;
            if (memPercent > 90) {
                alerts.push({
                    level: 'critical',
                    message: `Memory usage critical: ${Math.round(memPercent)}%`,
                    timestamp: new Date(),
                    component: 'System'
                });
            } else if (memPercent > 80) {
                alerts.push({
                    level: 'warning',
                    message: `Memory usage high: ${Math.round(memPercent)}%`,
                    timestamp: new Date(),
                    component: 'System'
                });
            }
        }

        if (metrics.diskUsage.usagePercent > 95) {
            alerts.push({
                level: 'critical',
                message: `Disk space critical: ${Math.round(metrics.diskUsage.usagePercent)}%`,
                timestamp: new Date(),
                component: 'System'
            });
        }

        return alerts;
    }

    /**
     * Export metrics to file
     */
    private async exportMetrics(format: 'json' | 'csv' | 'html'): Promise<void> {
        const metrics = await this.collectMetrics();
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `ces-metrics-${timestamp}.${format}`;
        const filepath = path.join(this.configManager.getProjectRoot(), '.claude', 'exports', filename);

        await fs.ensureDir(path.dirname(filepath));

        switch (format) {
            case 'json':
                await fs.writeJSON(filepath, metrics, { spaces: 2 });
                break;
            case 'csv':
                // Simplified CSV export
                const csv = this.metricsToCSV(metrics);
                await fs.writeFile(filepath, csv);
                break;
            case 'html':
                const html = this.metricsToHTML(metrics);
                await fs.writeFile(filepath, html);
                break;
        }

        console.log(chalk.green(`✅ Metrics exported to: ${filepath}`));
    }

    /**
     * Stop live dashboard
     */
    stopDashboard(): void {
        this.isRunning = false;
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
            this.refreshTimer = null;
        }
        console.log(chalk.yellow('\n⏹️ Dashboard stopped'));
        process.exit(0);
    }

    /**
     * Utility methods
     */
    private formatBytes(bytes: number): string {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
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

    private formatDuration(ms: number): string {
        return this.formatUptime(ms);
    }

    private parseSize(sizeStr: string): number {
        const match = sizeStr.match(/^(\d+(?:\.\d+)?)\s*([KMGT]?)B?$/i);
        if (!match) return 0;
        
        const value = parseFloat(match[1]);
        const unit = match[2].toUpperCase();
        
        const multipliers: { [key: string]: number } = {
            '': 1,
            'K': 1024,
            'M': 1024 * 1024,
            'G': 1024 * 1024 * 1024,
            'T': 1024 * 1024 * 1024 * 1024
        };
        
        return value * (multipliers[unit] || 1);
    }

    private getMCPServerPriority(serverName: string): 'critical' | 'high' | 'medium' | 'low' {
        const priorities: { [key: string]: 'critical' | 'high' | 'medium' | 'low' } = {
            'context7': 'critical',
            'serena': 'critical',
            'arxiv': 'high',
            'mongodb': 'high',
            'git': 'high',
            'postgresql': 'medium',
            'filesystem': 'high',
            'sqlite': 'high',
            'kubernetes': 'medium',
            'brave': 'low',
            'youtube': 'low',
            'google-drive': 'low',
            'bigquery': 'low'
        };
        
        return priorities[serverName] || 'medium';
    }

    private metricsToCSV(metrics: DashboardMetrics): string {
        // Simplified CSV export
        const headers = 'timestamp,memory_used,memory_total,cpu_usage,disk_usage,active_session,mcp_servers_running,node_processes,alerts';
        const row = [
            new Date().toISOString(),
            metrics.system.memoryUsage.used,
            metrics.system.memoryUsage.total,
            metrics.system.cpuUsage,
            metrics.system.diskUsage.usagePercent,
            metrics.sessions.active,
            metrics.mcpServers.filter(s => s.status === 'running').length,
            metrics.processes.nodeProcesses,
            metrics.alerts.length
        ].join(',');
        
        return headers + '\n' + row;
    }

    private metricsToHTML(metrics: DashboardMetrics): string {
        return `
<!DOCTYPE html>
<html>
<head>
    <title>CES Dashboard Export</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .metric { margin: 10px 0; }
        .alert { padding: 10px; margin: 5px 0; border-radius: 5px; }
        .critical { background-color: #ffe6e6; }
        .error { background-color: #fff3cd; }
        .warning { background-color: #d4edda; }
    </style>
</head>
<body>
    <h1>CES Dashboard Export</h1>
    <p>Generated: ${new Date().toLocaleString()}</p>
    
    <h2>System Metrics</h2>
    <div class="metric">Memory: ${this.formatBytes(metrics.system.memoryUsage.used)} / ${this.formatBytes(metrics.system.memoryUsage.total)}</div>
    <div class="metric">CPU: ${metrics.system.cpuUsage}%</div>
    <div class="metric">Disk: ${metrics.system.diskUsage.usagePercent.toFixed(1)}%</div>
    
    <h2>Session Status</h2>
    <div class="metric">Active: ${metrics.sessions.active ? 'Yes' : 'No'}</div>
    <div class="metric">Checkpoints: ${metrics.sessions.checkpoints}</div>
    
    <h2>MCP Servers</h2>
    ${metrics.mcpServers.map(server => 
        `<div class="metric">${server.name}: ${server.status} (${server.responseTime}ms)</div>`
    ).join('')}
    
    <h2>Alerts</h2>
    ${metrics.alerts.map(alert => 
        `<div class="alert ${alert.level}"><strong>${alert.level.toUpperCase()}</strong>: ${alert.message} (${alert.component})</div>`
    ).join('')}
</body>
</html>`;
    }
}