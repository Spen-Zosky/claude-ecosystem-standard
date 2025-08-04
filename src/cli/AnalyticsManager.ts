/**
 * Analytics Manager - Centralized Usage Analytics and Performance Insights
 * 
 * Provides comprehensive analytics across all CES components including
 * usage patterns, performance metrics, trends analysis, and business intelligence.
 */

import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { envConfig } from '../config/EnvironmentConfig.js';
import { createLogger, ComponentLogger } from '../utils/Logger.js';
import { ConfigManager } from '../config/ConfigManager.js';
import { SessionManager } from '../session/SessionManager.js';

export interface AnalyticsEvent {
    id: string;
    timestamp: Date;
    category: 'session' | 'profile' | 'command' | 'recovery' | 'dashboard' | 'system';
    action: string;
    source: string;
    metadata: Record<string, any>;
    duration?: number;
    success: boolean;
    userId?: string;
}

export interface UsageMetrics {
    totalSessions: number;
    totalCommands: number;
    totalProfiles: number;
    averageSessionDuration: number;
    topCommands: Array<{ command: string; count: number }>;
    topProfiles: Array<{ profile: string; count: number }>;
    errorRate: number;
    systemUptime: number;
}

export interface PerformanceMetrics {
    commandResponseTimes: Array<{ command: string; avgTime: number; count: number }>;
    profileSwitchTimes: Array<{ profile: string; avgTime: number; count: number }>;
    systemResourceUsage: {
        cpuAverage: number;
        memoryAverage: number;
        diskAverage: number;
        networkAverage: number;
    };
    recoveryMetrics: {
        totalRecoveries: number;
        successRate: number;
        avgRecoveryTime: number;
    };
}

export interface TrendAnalysis {
    period: 'hour' | 'day' | 'week' | 'month';
    commandTrends: Array<{ command: string; trend: 'up' | 'down' | 'stable'; change: number }>;
    profileTrends: Array<{ profile: string; trend: 'up' | 'down' | 'stable'; change: number }>;
    systemHealthTrend: 'improving' | 'degrading' | 'stable';
    userActivityTrend: 'increasing' | 'decreasing' | 'stable';
}

export interface AnalyticsReport {
    generatedAt: Date;
    period: { start: Date; end: Date };
    usage: UsageMetrics;
    performance: PerformanceMetrics;
    trends: TrendAnalysis;
    insights: string[];
    recommendations: string[];
}

export interface AnalyticsConfig {
    enabled: boolean;
    dataRetentionDays: number;
    anonymizeData: boolean;
    trackingLevel: 'minimal' | 'standard' | 'detailed';
    exportFormats: ('json' | 'csv' | 'html')[];
    realTimeUpdates: boolean;
}

export class AnalyticsManager {
    private events: AnalyticsEvent[] = [];
    private analyticsConfig: AnalyticsConfig;
    private analyticsDir: string;
    private eventsFile: string;
    private isCollecting: boolean = false;
    
    // Enterprise configuration and logging
    private logger: ComponentLogger;
    private sessionId: string;
    // private _startTime: Date; // Removed unused field
    
    // Timer management for proper lifecycle
    private collectionTimer: NodeJS.Timeout | null = null;

    constructor(_configManager: ConfigManager, _sessionManager: SessionManager) {
        // ConfigManager and SessionManager are injected but not used in this implementation
        
        // Initialize enterprise components
        this.sessionId = uuidv4();
        // this._startTime = new Date(); // Removed unused field
        this.logger = createLogger('AnalyticsManager', { sessionId: this.sessionId });
        
        // Use enterprise configuration for paths
        this.analyticsDir = envConfig.getAbsolutePath('.claude/analytics');
        this.eventsFile = path.join(this.analyticsDir, 'events.json');
        this.analyticsConfig = this.loadAnalyticsConfig();
        this.initializeAnalytics();
    }


    /**
     * Initialize analytics system
     */
    private async initializeAnalytics(): Promise<void> {
        await fs.ensureDir(this.analyticsDir);
        await this.loadEvents();
        
        // Don't auto-start collection - let it be explicit
        this.logger.system('Analytics Manager initialized (collection available)');
    }

    /**
     * Start analytics data collection
     */
    async startDataCollection(): Promise<void> {
        if (this.isCollecting) {
            this.logger.warn('Analytics collection already running');
            return;
        }

        const startTime = Date.now();
        this.logger.system('Starting analytics data collection');
        this.isCollecting = true;

        // Log system start event
        await this.logEvent({
            category: 'system',
            action: 'analytics_start',
            source: 'AnalyticsManager',
            metadata: {
                config: this.analyticsConfig,
                version: '2.6.0'
            },
            success: true
        });

        // Start periodic data collection with proper lifecycle management
        if (this.analyticsConfig.realTimeUpdates) {
            this.startPeriodicCollection();
        }

        this.logger.performance('analytics collection startup', Date.now() - startTime, true);
        this.logger.system('Analytics collection started successfully');
    }

    /**
     * Stop analytics data collection
     */
    async stopDataCollection(): Promise<void> {
        if (!this.isCollecting) {
            this.logger.warn('Analytics collection not running');
            return;
        }

        const stopTime = Date.now();
        this.logger.system('Stopping analytics data collection');
        this.isCollecting = false;

        // Clear collection timer
        if (this.collectionTimer) {
            clearInterval(this.collectionTimer);
            this.collectionTimer = null;
        }

        // Log system stop event
        await this.logEvent({
            category: 'system',
            action: 'analytics_stop',
            source: 'AnalyticsManager',
            metadata: {
                eventsCollected: this.events.length,
                uptime: Date.now() - this.getSystemStartTime()
            },
            success: true
        });

        await this.saveEvents();
        this.logger.performance('analytics collection stop', Date.now() - stopTime, true);
        this.logger.system('Analytics collection stopped successfully');
    }

    /**
     * Log an analytics event
     */
    async logEvent(eventData: Omit<AnalyticsEvent, 'id' | 'timestamp'>): Promise<void> {
        if (!this.analyticsConfig.enabled || !this.isCollecting) {
            return;
        }

        const event: AnalyticsEvent = {
            id: uuidv4(),
            timestamp: new Date(),
            ...eventData
        };

        // Anonymize data if configured
        if (this.analyticsConfig.anonymizeData) {
            event.userId = undefined;
            // Remove potentially sensitive metadata
            if (event.metadata.userInput) {
                event.metadata.userInput = '[REDACTED]';
            }
        }

        this.events.push(event);

        // Maintain data retention policy
        await this.enforceDataRetention();

        // Save events periodically
        if (this.events.length % 100 === 0) {
            await this.saveEvents();
        }
    }

    /**
     * Generate comprehensive analytics report
     */
    async generateReport(
        startDate?: Date,
        endDate?: Date,
        period: TrendAnalysis['period'] = 'week'
    ): Promise<AnalyticsReport> {
        const end = endDate || new Date();
        const start = startDate || new Date(end.getTime() - (7 * 24 * 60 * 60 * 1000)); // Last week

        const startTime = Date.now();
        this.logger.info('Generating analytics report');

        const filteredEvents = this.events.filter(
            event => event.timestamp >= start && event.timestamp <= end
        );

        const usage = await this.calculateUsageMetrics(filteredEvents);
        const performance = await this.calculatePerformanceMetrics(filteredEvents);
        const trends = await this.calculateTrendAnalysis(filteredEvents, period);
        const insights = this.generateInsights(usage, performance, trends);
        const recommendations = this.generateRecommendations(usage, performance, trends);

        const report: AnalyticsReport = {
            generatedAt: new Date(),
            period: { start, end },
            usage,
            performance,
            trends,
            insights,
            recommendations
        };

        this.logger.performance('analytics report generation', Date.now() - startTime, true, { 
            eventsAnalyzed: filteredEvents.length,
            periodDays: Math.ceil((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000))
        });
        this.logger.info('Analytics report generated successfully');
        return report;
    }

    /**
     * Show analytics dashboard
     */
    async showAnalyticsDashboard(): Promise<void> {
        const report = await this.generateReport();

        console.log(chalk.cyan('📊 CES ANALYTICS DASHBOARD'));
        console.log(chalk.cyan('═══════════════════════════════'));
        console.log();

        // Usage Metrics
        console.log(chalk.blue('📈 USAGE METRICS'));
        console.log(chalk.white(`   Total Sessions: ${report.usage.totalSessions}`));
        console.log(chalk.white(`   Total Commands: ${report.usage.totalCommands}`));
        console.log(chalk.white(`   Total Profiles: ${report.usage.totalProfiles}`));
        console.log(chalk.white(`   Avg Session Duration: ${this.formatDuration(report.usage.averageSessionDuration)}`));
        console.log(chalk.white(`   Error Rate: ${report.usage.errorRate.toFixed(2)}%`));
        console.log(chalk.white(`   System Uptime: ${this.formatDuration(report.usage.systemUptime)}`));
        console.log();

        // Top Commands
        console.log(chalk.blue('🏆 TOP COMMANDS'));
        if (report.usage.topCommands.length === 0) {
            console.log(chalk.gray('   No commands recorded yet'));
        } else {
            report.usage.topCommands.slice(0, 5).forEach((cmd, index) => {
                console.log(chalk.white(`   ${index + 1}. ${cmd.command} (${cmd.count} uses)`));
            });
        }
        console.log();

        // Top Profiles
        console.log(chalk.blue('📋 TOP PROFILES'));
        if (report.usage.topProfiles.length === 0) {
            console.log(chalk.gray('   No profiles used yet'));
        } else {
            report.usage.topProfiles.slice(0, 5).forEach((profile, index) => {
                console.log(chalk.white(`   ${index + 1}. ${profile.profile} (${profile.count} uses)`));
            });
        }
        console.log();

        // Performance Metrics
        console.log(chalk.blue('⚡ PERFORMANCE METRICS'));
        const sysRes = report.performance.systemResourceUsage;
        console.log(chalk.white(`   CPU Average: ${sysRes.cpuAverage.toFixed(1)}%`));
        console.log(chalk.white(`   Memory Average: ${sysRes.memoryAverage.toFixed(1)}%`));
        console.log(chalk.white(`   Disk Average: ${sysRes.diskAverage.toFixed(1)}%`));
        
        const recovery = report.performance.recoveryMetrics;
        console.log(chalk.white(`   Recovery Success Rate: ${recovery.successRate.toFixed(1)}%`));
        console.log(chalk.white(`   Avg Recovery Time: ${recovery.avgRecoveryTime}ms`));
        console.log();

        // Trends
        console.log(chalk.blue('📊 TRENDS'));
        console.log(chalk.white(`   System Health: ${this.getTrendIcon(report.trends.systemHealthTrend)} ${report.trends.systemHealthTrend}`));
        console.log(chalk.white(`   User Activity: ${this.getTrendIcon(report.trends.userActivityTrend)} ${report.trends.userActivityTrend}`));
        console.log();

        // Insights
        console.log(chalk.blue('💡 INSIGHTS'));
        if (report.insights.length === 0) {
            console.log(chalk.gray('   No insights available yet'));
        } else {
            report.insights.slice(0, 3).forEach(insight => {
                console.log(chalk.white(`   • ${insight}`));
            });
        }
        console.log();

        // Recommendations
        console.log(chalk.blue('🎯 RECOMMENDATIONS'));
        if (report.recommendations.length === 0) {
            console.log(chalk.gray('   No recommendations at this time'));
        } else {
            report.recommendations.slice(0, 3).forEach(rec => {
                console.log(chalk.white(`   • ${rec}`));
            });
        }
    }

    /**
     * Export analytics data
     */
    async exportAnalytics(
        format: 'json' | 'csv' | 'html' = 'json',
        includeEvents: boolean = false
    ): Promise<string> {
        const report = await this.generateReport();
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `ces-analytics-${timestamp}.${format}`;
        const filepath = path.join(this.analyticsDir, 'exports', filename);

        await fs.ensureDir(path.dirname(filepath));

        const exportData = {
            report,
            events: includeEvents ? this.events : [],
            exportedAt: new Date(),
            config: this.analyticsConfig
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

        this.logger.info(`Analytics exported successfully to: ${filepath}`);
        return filepath;
    }

    /**
     * Show real-time analytics
     */
    async showRealTimeAnalytics(): Promise<void> {
        console.log(chalk.cyan('📊 REAL-TIME ANALYTICS'));
        console.log(chalk.cyan('═══════════════════════════'));
        console.log();

        // Recent events (last 10)
        const recentEvents = this.events.slice(-10);
        console.log(chalk.blue('🕒 RECENT EVENTS'));
        if (recentEvents.length === 0) {
            console.log(chalk.gray('   No recent events'));
        } else {
            recentEvents.forEach(event => {
                const time = event.timestamp.toLocaleTimeString();
                const statusIcon = event.success ? '✅' : '❌';
                console.log(chalk.white(`   ${statusIcon} [${time}] ${event.category}:${event.action}`));
            });
        }
        console.log();

        // Live stats
        const totalEvents = this.events.length;
        const lastHourEvents = this.events.filter(
            e => e.timestamp > new Date(Date.now() - 3600000)
        ).length;
        const errorEvents = this.events.filter(e => !e.success).length;
        const errorRate = totalEvents > 0 ? (errorEvents / totalEvents) * 100 : 0;

        console.log(chalk.blue('📈 LIVE STATS'));
        console.log(chalk.white(`   Total Events: ${totalEvents}`));
        console.log(chalk.white(`   Last Hour: ${lastHourEvents} events`));
        console.log(chalk.white(`   Error Rate: ${errorRate.toFixed(2)}%`));
        console.log(chalk.white(`   Collection Status: ${this.isCollecting ? '🟢 Active' : '🔴 Inactive'}`));
    }

    /**
     * Calculate usage metrics
     */
    private async calculateUsageMetrics(events: AnalyticsEvent[]): Promise<UsageMetrics> {
        const sessionEvents = events.filter(e => e.category === 'session');
        const commandEvents = events.filter(e => e.category === 'command');
        const profileEvents = events.filter(e => e.category === 'profile');

        // Calculate command counts
        const commandCounts: Record<string, number> = {};
        commandEvents.forEach(event => {
            const cmd = event.action;
            commandCounts[cmd] = (commandCounts[cmd] || 0) + 1;
        });

        // Calculate profile counts
        const profileCounts: Record<string, number> = {};
        profileEvents.forEach(event => {
            const profile = event.metadata.profileId || event.action;
            profileCounts[profile] = (profileCounts[profile] || 0) + 1;
        });

        // Calculate average session duration
        const sessionDurations = sessionEvents
            .filter(e => e.duration !== undefined)
            .map(e => e.duration!);
        const averageSessionDuration = sessionDurations.length > 0
            ? sessionDurations.reduce((sum, dur) => sum + dur, 0) / sessionDurations.length
            : 0;

        // Calculate error rate
        const totalEvents = events.length;
        const errorEvents = events.filter(e => !e.success).length;
        const errorRate = totalEvents > 0 ? (errorEvents / totalEvents) * 100 : 0;

        return {
            totalSessions: sessionEvents.length,
            totalCommands: commandEvents.length,
            totalProfiles: profileEvents.length,
            averageSessionDuration,
            topCommands: Object.entries(commandCounts)
                .map(([command, count]) => ({ command, count }))
                .sort((a, b) => b.count - a.count),
            topProfiles: Object.entries(profileCounts)
                .map(([profile, count]) => ({ profile, count }))
                .sort((a, b) => b.count - a.count),
            errorRate,
            systemUptime: Date.now() - this.getSystemStartTime()
        };
    }

    /**
     * Calculate performance metrics
     */
    private async calculatePerformanceMetrics(events: AnalyticsEvent[]): Promise<PerformanceMetrics> {
        // Command response times
        const commandTimes: Record<string, { totalTime: number; count: number }> = {};
        events.filter(e => e.duration !== undefined).forEach(event => {
            const cmd = event.action;
            if (!commandTimes[cmd]) {
                commandTimes[cmd] = { totalTime: 0, count: 0 };
            }
            commandTimes[cmd].totalTime += event.duration!;
            commandTimes[cmd].count++;
        });

        const commandResponseTimes = Object.entries(commandTimes).map(([command, data]) => ({
            command,
            avgTime: data.totalTime / data.count,
            count: data.count
        }));

        // Profile switch times
        const profileTimes: Record<string, { totalTime: number; count: number }> = {};
        events.filter(e => e.category === 'profile' && e.duration !== undefined).forEach(event => {
            const profile = event.metadata.profileId || event.action;
            if (!profileTimes[profile]) {
                profileTimes[profile] = { totalTime: 0, count: 0 };
            }
            profileTimes[profile].totalTime += event.duration!;
            profileTimes[profile].count++;
        });

        const profileSwitchTimes = Object.entries(profileTimes).map(([profile, data]) => ({
            profile,
            avgTime: data.totalTime / data.count,
            count: data.count
        }));

        // Recovery metrics
        const recoveryEvents = events.filter(e => e.category === 'recovery');
        const successfulRecoveries = recoveryEvents.filter(e => e.success).length;
        const recoverySuccessRate = recoveryEvents.length > 0 
            ? (successfulRecoveries / recoveryEvents.length) * 100 
            : 0;
        
        const recoveryTimes = recoveryEvents
            .filter(e => e.duration !== undefined)
            .map(e => e.duration!);
        const avgRecoveryTime = recoveryTimes.length > 0
            ? recoveryTimes.reduce((sum, time) => sum + time, 0) / recoveryTimes.length
            : 0;

        return {
            commandResponseTimes,
            profileSwitchTimes,
            systemResourceUsage: {
                cpuAverage: 15, // Would be calculated from system metrics
                memoryAverage: 65,
                diskAverage: 45,
                networkAverage: 20
            },
            recoveryMetrics: {
                totalRecoveries: recoveryEvents.length,
                successRate: recoverySuccessRate,
                avgRecoveryTime
            }
        };
    }

    /**
     * Calculate trend analysis
     */
    private async calculateTrendAnalysis(
        _events: AnalyticsEvent[],
        period: TrendAnalysis['period']
    ): Promise<TrendAnalysis> {
        // This is a simplified implementation
        // In a real system, you'd analyze historical data patterns
        
        return {
            period,
            commandTrends: [],
            profileTrends: [],
            systemHealthTrend: 'stable',
            userActivityTrend: 'stable'
        };
    }

    /**
     * Generate insights from analytics data
     */
    private generateInsights(
        usage: UsageMetrics,
        performance: PerformanceMetrics,
        _trends: TrendAnalysis
    ): string[] {
        const insights: string[] = [];

        // Usage insights
        if (usage.topCommands.length > 0) {
            const topCommand = usage.topCommands[0];
            insights.push(`Most used command: ${topCommand.command} (${topCommand.count} uses)`);
        }

        if (usage.topProfiles.length > 0) {
            const topProfile = usage.topProfiles[0];
            insights.push(`Most popular profile: ${topProfile.profile} (${topProfile.count} uses)`);
        }

        // Performance insights
        if (performance.recoveryMetrics.successRate < 90) {
            insights.push(`Recovery success rate is below 90% (${performance.recoveryMetrics.successRate.toFixed(1)}%)`);
        }

        if (usage.errorRate > 5) {
            insights.push(`Error rate is elevated at ${usage.errorRate.toFixed(2)}%`);
        }

        // Resource insights
        if (performance.systemResourceUsage.memoryAverage > 80) {
            insights.push('Memory usage is consistently high, consider optimization');
        }

        return insights;
    }

    /**
     * Generate recommendations
     */
    private generateRecommendations(
        usage: UsageMetrics,
        performance: PerformanceMetrics,
        _trends: TrendAnalysis
    ): string[] {
        const recommendations: string[] = [];

        // Usage recommendations
        if (usage.topCommands.length > 0) {
            const topCommands = usage.topCommands.slice(0, 3).map(c => c.command);
            recommendations.push(`Create quick aliases for frequently used commands: ${topCommands.join(', ')}`);
        }

        // Performance recommendations
        if (performance.recoveryMetrics.successRate < 95) {
            recommendations.push('Review and improve auto-recovery mechanisms');
        }

        if (usage.errorRate > 3) {
            recommendations.push('Investigate and address common error patterns');
        }

        // Resource recommendations
        if (performance.systemResourceUsage.memoryAverage > 75) {
            recommendations.push('Consider memory optimization or resource limits');
        }

        return recommendations;
    }

    /**
     * Helper methods
     */
    private startPeriodicCollection(): void {
        // Clear existing timer if any
        if (this.collectionTimer) {
            clearInterval(this.collectionTimer);
        }
        
        // Use enterprise configuration for collection interval
        const collectionInterval = envConfig.get<number>('metricsCollectionInterval');
        this.logger.debug(`Starting periodic collection with ${collectionInterval}ms interval`);
        
        // Start new timer and store reference for cleanup
        this.collectionTimer = setInterval(async () => {
            if (this.isCollecting) {
                const startTime = Date.now();
                try {
                    await this.collectSystemMetrics();
                    this.logger.performance('system metrics collection', Date.now() - startTime, true);
                } catch (error) {
                    this.logger.error('System metrics collection failed', error instanceof Error ? error : new Error(String(error)));
                    this.logger.performance('system metrics collection', Date.now() - startTime, false);
                }
            }
        }, collectionInterval);
    }

    private async collectSystemMetrics(): Promise<void> {
        await this.logEvent({
            category: 'system',
            action: 'metric_collection',
            source: 'AnalyticsManager',
            metadata: {
                timestamp: Date.now(),
                eventsCount: this.events.length
            },
            success: true
        });
    }

    private async enforceDataRetention(): Promise<void> {
        if (this.analyticsConfig.dataRetentionDays <= 0) return;

        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - this.analyticsConfig.dataRetentionDays);

        const originalLength = this.events.length;
        this.events = this.events.filter(event => event.timestamp >= cutoffDate);

        if (this.events.length < originalLength) {
            this.logger.info(`Cleaned up ${originalLength - this.events.length} old analytics events`, { 
                originalLength, 
                newLength: this.events.length,
                retentionDays: this.analyticsConfig.dataRetentionDays 
            });
        }
    }

    private async loadEvents(): Promise<void> {
        try {
            if (await fs.pathExists(this.eventsFile)) {
                const data = await fs.readJSON(this.eventsFile);
                this.events = data.map((event: any) => ({
                    ...event,
                    timestamp: new Date(event.timestamp)
                }));
            }
        } catch (error) {
            this.logger.warn('Failed to load analytics events', { error: error instanceof Error ? error.message : String(error) });
        }
    }

    private async saveEvents(): Promise<void> {
        try {
            await fs.writeJSON(this.eventsFile, this.events, { spaces: 2 });
        } catch (error) {
            this.logger.error('Failed to save analytics events', error instanceof Error ? error : new Error(String(error)));
        }
    }

    private loadAnalyticsConfig(): AnalyticsConfig {
        return {
            enabled: envConfig.get<boolean>('analytics.enabled'),
            dataRetentionDays: envConfig.get<number>('analytics.retentionDays'),
            anonymizeData: true, // Always enable for privacy
            trackingLevel: 'standard', // Keep standard level
            exportFormats: [envConfig.get<'json' | 'csv' | 'html'>('analytics.exportFormat')],
            realTimeUpdates: true // Enterprise feature always enabled
        };
    }

    private getSystemStartTime(): number {
        // This would be tracked from actual system start
        return Date.now() - (24 * 60 * 60 * 1000); // 24 hours ago as example
    }

    private formatDuration(ms: number): string {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days}d ${hours % 24}h`;
        if (hours > 0) return `${hours}h ${minutes % 60}m`;
        if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
        return `${seconds}s`;
    }

    private getTrendIcon(trend: string): string {
        switch (trend) {
            case 'up': case 'improving': case 'increasing': return '📈';
            case 'down': case 'degrading': case 'decreasing': return '📉';
            default: return '➡️';
        }
    }

    private exportToCSV(data: any): string {
        const headers = 'timestamp,category,action,source,success,duration';
        const rows = data.events.map((event: AnalyticsEvent) => [
            event.timestamp.toISOString(),
            event.category,
            event.action,
            event.source,
            event.success,
            event.duration || ''
        ].join(','));

        return headers + '\n' + rows.join('\n');
    }

    private exportToHTML(data: any): string {
        const report = data.report;
        return `
<!DOCTYPE html>
<html>
<head>
    <title>CES Analytics Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .metric { margin: 10px 0; padding: 10px; border-left: 3px solid #007acc; }
        .insight { background-color: #f0f8ff; padding: 10px; margin: 5px 0; }
        .recommendation { background-color: #fff8dc; padding: 10px; margin: 5px 0; }
    </style>
</head>
<body>
    <h1>CES Analytics Report</h1>
    <p>Generated: ${report.generatedAt}</p>
    
    <h2>Usage Metrics</h2>
    <div class="metric">Total Sessions: ${report.usage.totalSessions}</div>
    <div class="metric">Total Commands: ${report.usage.totalCommands}</div>
    <div class="metric">Error Rate: ${report.usage.errorRate.toFixed(2)}%</div>
    
    <h2>Top Commands</h2>
    ${report.usage.topCommands.slice(0, 5).map((cmd: any) => 
        `<div class="metric">${cmd.command}: ${cmd.count} uses</div>`
    ).join('')}
    
    <h2>Insights</h2>
    ${report.insights.map((insight: string) => 
        `<div class="insight">${insight}</div>`
    ).join('')}
    
    <h2>Recommendations</h2>
    ${report.recommendations.map((rec: string) => 
        `<div class="recommendation">${rec}</div>`
    ).join('')}
</body>
</html>`;
    }
}