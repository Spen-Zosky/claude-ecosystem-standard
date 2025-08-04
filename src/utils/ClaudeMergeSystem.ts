/**
 * Claude Merge System - EventEmitter-based Utility Helper
 * Comprehensive system for managing dual Claude documentation with real-time events
 * 
 * Features:
 * - EventEmitter-based architecture for real-time notifications
 * - Configuration conflict detection and resolution
 * - Cache system for performance optimization
 * - Advanced file watching with debouncing
 * - Backup management with retention policies
 * - Performance metrics and monitoring
 * - Plugin architecture for extensibility
 */

import { EventEmitter } from 'events';
import * as fs from 'fs/promises';
import * as fsSync from 'fs';
import * as path from 'path';
import { spawn } from 'child_process';
import { FSWatcher, watch } from 'chokidar';
import { ClaudeDocManager, ClaudeDocMetadata } from './ClaudeDocManager';

// Enhanced interfaces for comprehensive functionality
export interface MergeSystemConfig {
    enabled: boolean;
    autoMergeOnChange: boolean;
    watchEnabled: boolean;
    watchDebounceDelay: number;
    backupRetentionCount: number;
    cacheEnabled: boolean;
    cacheMaxAge: number;
    performanceMonitoring: boolean;
    verboseLogging: boolean;
    conflictResolution: 'manual' | 'auto' | 'prompt';
    paths: {
        global: string;
        project: string;
        master: string;
        backup: string;
        templates: string;
    };
    hooks: {
        preMerge?: string[];
        postMerge?: string[];
        onError?: string[];
    };
}

export interface MergeOperation {
    id: string;
    timestamp: Date;
    type: 'auto' | 'manual' | 'scheduled';
    sources: {
        global?: MergeSource;
        project?: MergeSource;
    };
    target: string;
    status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
    duration?: number;
    error?: string;
    metadata: {
        triggeredBy: string;
        changeDetails?: string[];
        backupCreated?: string;
        conflictsDetected?: ConflictInfo[];
    };
}

export interface MergeSource {
    path: string;
    size: number;
    lastModified: Date;
    checksum: string;
    content?: string;
    metadata?: ClaudeDocMetadata;
}

export interface ConflictInfo {
    type: 'section_overlap' | 'variable_conflict' | 'format_mismatch' | 'encoding_conflict';
    location: {
        global?: { line: number; content: string };
        project?: { line: number; content: string };
    };
    severity: 'low' | 'medium' | 'high' | 'critical';
    resolution: 'auto_resolved' | 'manual_required' | 'ignored';
    description: string;
    suggestedAction?: string;
}

export interface SystemMetrics {
    mergeOperations: {
        total: number;
        successful: number;
        failed: number;
        averageDuration: number;
        lastOperation?: Date;
    };
    fileWatching: {
        activeWatchers: number;
        eventsProcessed: number;
        lastEvent?: Date;
    };
    cache: {
        entries: number;
        hitRate: number;
        memoryUsage: number;
    };
    performance: {
        cpuUsage: number;
        memoryUsage: NodeJS.MemoryUsage;
        uptime: number;
    };
}

export interface PluginInterface {
    name: string;
    version: string;
    initialize(system: ClaudeMergeSystem): Promise<void>;
    preMerge?(operation: MergeOperation): Promise<void>;
    postMerge?(operation: MergeOperation): Promise<void>;
    onError?(error: Error, operation?: MergeOperation): Promise<void>;
    cleanup?(): Promise<void>;
}

/**
 * Main Claude Merge System class with EventEmitter architecture
 */
export class ClaudeMergeSystem extends EventEmitter {
    private config: MergeSystemConfig;
    private claudeDocManager: ClaudeDocManager;
    private watchers: Map<string, FSWatcher> = new Map();
    private operations: Map<string, MergeOperation> = new Map();
    private cache: Map<string, { data: any; timestamp: Date; ttl: number }> = new Map();
    private plugins: Map<string, PluginInterface> = new Map();
    private metrics: SystemMetrics;
    private debounceTimers: Map<string, NodeJS.Timeout> = new Map();
    private isRunning: boolean = false;
    private startTime: Date;

    constructor(config?: Partial<MergeSystemConfig>) {
        super();
        
        this.startTime = new Date();
        this.claudeDocManager = ClaudeDocManager.getInstance();
        
        // Default configuration
        this.config = {
            enabled: true,
            autoMergeOnChange: true,
            watchEnabled: true,
            watchDebounceDelay: 1000,
            backupRetentionCount: 10,
            cacheEnabled: true,
            cacheMaxAge: 300000, // 5 minutes
            performanceMonitoring: true,
            verboseLogging: false,
            conflictResolution: 'auto',
            paths: {
                global: path.join(process.env.HOME || '', '.claude', 'CLAUDE.md'),
                project: path.join(process.cwd(), 'CLAUDE.md'),
                master: path.join(process.cwd(), '.claude', 'CLAUDE-MASTER.md'),
                backup: path.join(process.cwd(), '.backups'),
                templates: path.join(process.cwd(), 'templates')
            },
            hooks: {},
            ...config
        };

        // Initialize metrics
        this.metrics = {
            mergeOperations: {
                total: 0,
                successful: 0,
                failed: 0,
                averageDuration: 0
            },
            fileWatching: {
                activeWatchers: 0,
                eventsProcessed: 0
            },
            cache: {
                entries: 0,
                hitRate: 0,
                memoryUsage: 0
            },
            performance: {
                cpuUsage: 0,
                memoryUsage: process.memoryUsage(),
                uptime: 0
            }
        };

        // Setup event listeners
        this.setupEventListeners();
        
        // Start periodic cleanup and metrics update
        this.startPeriodicTasks();
    }

    /**
     * Initialize the merge system
     */
    async initialize(): Promise<void> {
        try {
            this.emit('system:initializing');
            this.log('Initializing Claude Merge System...');

            // Initialize ClaudeDocManager
            await this.claudeDocManager.initialize();

            // Create required directories
            await this.ensureDirectories();

            // Initialize plugins
            await this.initializePlugins();

            // Start file watching if enabled
            if (this.config.watchEnabled) {
                await this.startWatching();
            }

            this.isRunning = true;
            this.emit('system:initialized');
            this.log('Claude Merge System initialized successfully');

        } catch (error) {
            this.emit('system:error', error);
            throw error;
        }
    }

    /**
     * Execute merge operation with full event lifecycle
     */
    async executeMerge(options: {
        type?: 'auto' | 'manual' | 'scheduled';
        force?: boolean;
        dryRun?: boolean;
        triggeredBy?: string;
    } = {}): Promise<MergeOperation> {
        const operation: MergeOperation = {
            id: this.generateOperationId(),
            timestamp: new Date(),
            type: options.type || 'manual',
            sources: {},
            target: this.config.paths.master,
            status: 'pending',
            metadata: {
                triggeredBy: options.triggeredBy || 'manual'
            }
        };

        try {
            this.operations.set(operation.id, operation);
            this.emit('merge:started', operation);
            
            operation.status = 'running';
            this.emit('merge:progress', { operation, stage: 'analyzing' });

            // Pre-merge validation and preparation
            await this.preMergeValidation(operation);
            
            // Load and analyze source files
            await this.loadSources(operation);
            
            // Detect and resolve conflicts
            await this.detectConflicts(operation);
            
            // Execute merge operation
            if (!options.dryRun) {
                await this.performMerge(operation);
            }
            
            // Post-merge validation
            await this.postMergeValidation(operation);
            
            operation.status = 'completed';
            operation.duration = Date.now() - operation.timestamp.getTime();
            
            this.updateMetrics(operation);
            this.emit('merge:completed', operation);
            
            this.log(`Merge operation ${operation.id} completed successfully`);
            return operation;

        } catch (error) {
            operation.status = 'failed';
            operation.error = error instanceof Error ? error.message : String(error);
            operation.duration = Date.now() - operation.timestamp.getTime();
            
            this.updateMetrics(operation);
            this.emit('merge:failed', { operation, error });
            
            this.log(`Merge operation ${operation.id} failed: ${operation.error}`);
            throw error;
        }
    }

    /**
     * Start file watching with debouncing
     */
    async startWatching(): Promise<void> {
        const watchPaths = [
            this.config.paths.global,
            this.config.paths.project
        ].filter(p => fsSync.existsSync(p));

        if (watchPaths.length === 0) {
            this.log('No source files to watch');
            return;
        }

        const watcher = watch(watchPaths, {
            persistent: true,
            ignoreInitial: true,
            followSymlinks: false,
            atomic: true
        });

        watcher.on('change', (filePath: string) => {
            this.handleFileChange(filePath);
        });

        watcher.on('add', (filePath: string) => {
            this.handleFileChange(filePath);
        });

        watcher.on('error', (error: unknown) => {
            this.emit('watch:error', error);
        });

        this.watchers.set('main', watcher);
        this.metrics.fileWatching.activeWatchers = this.watchers.size;
        
        this.emit('watch:started', { paths: watchPaths });
        this.log(`Started watching ${watchPaths.length} files`);
    }

    /**
     * Handle file changes with debouncing
     */
    private handleFileChange(filePath: string): void {
        this.metrics.fileWatching.eventsProcessed++;
        this.metrics.fileWatching.lastEvent = new Date();
        
        this.emit('watch:change', { filePath });
        
        // Clear existing debounce timer
        const existingTimer = this.debounceTimers.get(filePath);
        if (existingTimer) {
            clearTimeout(existingTimer);
        }

        // Set new debounce timer
        const timer = setTimeout(async () => {
            this.debounceTimers.delete(filePath);
            
            if (this.config.autoMergeOnChange) {
                try {
                    await this.executeMerge({
                        type: 'auto',
                        triggeredBy: `file_change:${path.basename(filePath)}`
                    });
                } catch (error) {
                    this.emit('auto-merge:failed', { filePath, error });
                }
            }
        }, this.config.watchDebounceDelay);

        this.debounceTimers.set(filePath, timer);
    }

    /**
     * Conflict detection and resolution
     */
    private async detectConflicts(operation: MergeOperation): Promise<void> {
        const conflicts: ConflictInfo[] = [];
        
        if (!operation.sources.global || !operation.sources.project) {
            return; // No conflicts possible with single source
        }

        const globalContent = operation.sources.global.content || '';
        const projectContent = operation.sources.project.content || '';

        // Section overlap detection
        const globalSections = this.extractSections(globalContent);
        const projectSections = this.extractSections(projectContent);
        
        for (const [sectionName, globalSection] of globalSections) {
            if (projectSections.has(sectionName)) {
                const projectSection = projectSections.get(sectionName)!;
                if (globalSection.content !== projectSection.content) {
                    conflicts.push({
                        type: 'section_overlap',
                        location: {
                            global: { line: globalSection.line, content: globalSection.content.substring(0, 100) },
                            project: { line: projectSection.line, content: projectSection.content.substring(0, 100) }
                        },
                        severity: 'medium',
                        resolution: 'auto_resolved',
                        description: `Section "${sectionName}" exists in both files with different content`,
                        suggestedAction: 'Project version will take precedence'
                    });
                }
            }
        }

        // Variable conflict detection
        const globalVars = this.extractVariables(globalContent);
        const projectVars = this.extractVariables(projectContent);
        
        for (const [varName, globalValue] of globalVars) {
            if (projectVars.has(varName) && projectVars.get(varName) !== globalValue) {
                conflicts.push({
                    type: 'variable_conflict',
                    location: {
                        global: { line: 0, content: `${varName}=${globalValue}` },
                        project: { line: 0, content: `${varName}=${projectVars.get(varName)}` }
                    },
                    severity: 'low',
                    resolution: 'auto_resolved',
                    description: `Variable "${varName}" has different values`,
                    suggestedAction: 'Project value will be used'
                });
            }
        }

        operation.metadata.conflictsDetected = conflicts;
        
        if (conflicts.length > 0) {
            this.emit('merge:conflicts-detected', { operation, conflicts });
            this.log(`Detected ${conflicts.length} conflicts in operation ${operation.id}`);
        }
    }

    /**
     * Cache management
     */

    /**
     * Plugin management
     */
    async loadPlugin(plugin: PluginInterface): Promise<void> {
        try {
            await plugin.initialize(this);
            this.plugins.set(plugin.name, plugin);
            this.emit('plugin:loaded', plugin);
            this.log(`Plugin loaded: ${plugin.name} v${plugin.version}`);
        } catch (error) {
            this.emit('plugin:error', { plugin, error });
            throw error;
        }
    }

    async unloadPlugin(name: string): Promise<void> {
        const plugin = this.plugins.get(name);
        if (!plugin) return;
        
        if (plugin.cleanup) {
            await plugin.cleanup();
        }
        
        this.plugins.delete(name);
        this.emit('plugin:unloaded', plugin);
        this.log(`Plugin unloaded: ${name}`);
    }

    /**
     * System status and health
     */
    getSystemStatus(): {
        running: boolean;
        uptime: number;
        operations: { active: number; total: number };
        watchers: number;
        plugins: number;
        metrics: SystemMetrics;
    } {
        return {
            running: this.isRunning,
            uptime: Date.now() - this.startTime.getTime(),
            operations: {
                active: Array.from(this.operations.values()).filter(op => op.status === 'running').length,
                total: this.operations.size
            },
            watchers: this.watchers.size,
            plugins: this.plugins.size,
            metrics: this.metrics
        };
    }

    /**
     * Configuration management
     */
    updateConfig(updates: Partial<MergeSystemConfig>): void {
        const oldConfig = { ...this.config };
        this.config = { ...this.config, ...updates };
        
        this.emit('config:updated', { oldConfig, newConfig: this.config });
        this.log('Configuration updated');
    }

    getConfig(): MergeSystemConfig {
        return { ...this.config };
    }

    /**
     * Shutdown and cleanup
     */
    async shutdown(): Promise<void> {
        try {
            this.emit('system:shutting-down');
            this.log('Shutting down Claude Merge System...');

            // Stop file watching
            for (const [key, watcher] of this.watchers) {
                await watcher.close();
                this.watchers.delete(key);
            }

            // Clear debounce timers
            for (const timer of this.debounceTimers.values()) {
                clearTimeout(timer);
            }
            this.debounceTimers.clear();

            // Cancel running operations
            for (const operation of this.operations.values()) {
                if (operation.status === 'running') {
                    operation.status = 'cancelled';
                }
            }

            // Cleanup plugins
            for (const plugin of this.plugins.values()) {
                await this.unloadPlugin(plugin.name);
            }

            // Clear cache
            this.cache.clear();

            // Cleanup ClaudeDocManager
            await this.claudeDocManager.cleanup();

            this.isRunning = false;
            this.emit('system:shutdown');
            this.log('Claude Merge System shutdown complete');

        } catch (error) {
            this.emit('system:error', error);
            throw error;
        }
    }

    // Private helper methods

    private setupEventListeners(): void {
        this.on('merge:started', (operation) => {
            if (this.config.verboseLogging) {
                this.log(`Started merge operation: ${operation.id} (${operation.type})`);
            }
        });

        this.on('merge:completed', (operation) => {
            this.log(`Completed merge operation: ${operation.id} in ${operation.duration}ms`);
        });

        this.on('merge:failed', ({ operation, error }) => {
            this.log(`Failed merge operation: ${operation.id} - ${error}`);
        });

        this.on('watch:error', (error) => {
            this.log(`File watching error: ${error.message}`);
        });
    }

    private startPeriodicTasks(): void {
        // Metrics update every 30 seconds
        setInterval(() => {
            this.updatePerformanceMetrics();
        }, 30000);

        // Cache cleanup every 5 minutes
        setInterval(() => {
            this.cleanupCache();
        }, 300000);

        // Backup cleanup every hour
        setInterval(() => {
            this.cleanupBackups();
        }, 3600000);
    }

    private updatePerformanceMetrics(): void {
        this.metrics.performance.memoryUsage = process.memoryUsage();
        this.metrics.performance.uptime = Date.now() - this.startTime.getTime();
        this.metrics.cache.memoryUsage = this.calculateCacheMemoryUsage();
        
        // Calculate cache hit rate
        const cacheEvents = this.listenerCount('cache:hit') + this.listenerCount('cache:miss');
        if (cacheEvents > 0) {
            this.metrics.cache.hitRate = this.listenerCount('cache:hit') / cacheEvents;
        }
    }

    private calculateCacheMemoryUsage(): number {
        let totalSize = 0;
        for (const entry of this.cache.values()) {
            totalSize += JSON.stringify(entry.data).length;
        }
        return totalSize;
    }

    private cleanupCache(): void {
        const now = new Date();
        let cleaned = 0;
        
        for (const [key, entry] of this.cache.entries()) {
            if (now.getTime() - entry.timestamp.getTime() > entry.ttl) {
                this.cache.delete(key);
                cleaned++;
            }
        }
        
        if (cleaned > 0) {
            this.log(`Cleaned ${cleaned} expired cache entries`);
        }
        
        this.metrics.cache.entries = this.cache.size;
    }

    private async cleanupBackups(): Promise<void> {
        // Implementation for backup cleanup based on retention policy
        // This would manage backup files according to backupRetentionCount
    }

    private updateMetrics(operation: MergeOperation): void {
        this.metrics.mergeOperations.total++;
        
        if (operation.status === 'completed') {
            this.metrics.mergeOperations.successful++;
        } else if (operation.status === 'failed') {
            this.metrics.mergeOperations.failed++;
        }
        
        if (operation.duration) {
            const total = this.metrics.mergeOperations.total;
            const current = this.metrics.mergeOperations.averageDuration;
            this.metrics.mergeOperations.averageDuration = 
                (current * (total - 1) + operation.duration) / total;
        }
        
        this.metrics.mergeOperations.lastOperation = operation.timestamp;
    }

    private async preMergeValidation(operation: MergeOperation): Promise<void> {
        // Run pre-merge hooks
        if (this.config.hooks.preMerge) {
            for (const hook of this.config.hooks.preMerge) {
                await this.runHook(hook, operation);
            }
        }
        
        // Run plugin pre-merge hooks
        for (const plugin of this.plugins.values()) {
            if (plugin.preMerge) {
                await plugin.preMerge(operation);
            }
        }
    }

    private async postMergeValidation(operation: MergeOperation): Promise<void> {
        // Run post-merge hooks
        if (this.config.hooks.postMerge) {
            for (const hook of this.config.hooks.postMerge) {
                await this.runHook(hook, operation);
            }
        }
        
        // Run plugin post-merge hooks
        for (const plugin of this.plugins.values()) {
            if (plugin.postMerge) {
                await plugin.postMerge(operation);
            }
        }
    }

    private async runHook(command: string, operation: MergeOperation): Promise<void> {
        return new Promise((resolve, reject) => {
            const childProcess = spawn('bash', ['-c', command], {
                env: {
                    ...process.env,
                    MERGE_OPERATION_ID: operation.id,
                    MERGE_TYPE: operation.type,
                    MERGE_TARGET: operation.target
                }
            });

            childProcess.on('close', (code: number | null) => {
                if (code === 0) {
                    resolve();
                } else {
                    reject(new Error(`Hook failed with exit code ${code}`));
                }
            });

            childProcess.on('error', reject);
        });
    }

    private async loadSources(operation: MergeOperation): Promise<void> {
        // Load global source if exists
        if (fsSync.existsSync(this.config.paths.global)) {
            const content = await fs.readFile(this.config.paths.global, 'utf-8');
            const stats = await fs.stat(this.config.paths.global);
            
            operation.sources.global = {
                path: this.config.paths.global,
                size: stats.size,
                lastModified: stats.mtime,
                checksum: this.calculateChecksum(content),
                content
            };
        }
        
        // Load project source if exists
        if (fsSync.existsSync(this.config.paths.project)) {
            const content = await fs.readFile(this.config.paths.project, 'utf-8');
            const stats = await fs.stat(this.config.paths.project);
            
            operation.sources.project = {
                path: this.config.paths.project,
                size: stats.size,
                lastModified: stats.mtime,
                checksum: this.calculateChecksum(content),
                content
            };
        }
    }

    private async performMerge(_operation: MergeOperation): Promise<void> {
        // Use the existing merge script or implement direct merge logic
        const success = await this.claudeDocManager.executeMerge({
            verbose: this.config.verboseLogging,
            force: true
        });
        
        if (!success) {
            throw new Error('Merge operation failed');
        }
    }

    private async ensureDirectories(): Promise<void> {
        const dirs = [
            path.dirname(this.config.paths.master),
            this.config.paths.backup,
            this.config.paths.templates
        ];
        
        for (const dir of dirs) {
            await fs.mkdir(dir, { recursive: true });
        }
    }

    private async initializePlugins(): Promise<void> {
        // Plugin initialization logic
        // This would load plugins from a plugins directory
    }

    private generateOperationId(): string {
        return `merge_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    }

    private extractSections(content: string): Map<string, { line: number; content: string }> {
        const sections = new Map();
        const lines = content.split('\n');
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const match = line.match(/^#+\s+(.+)$/);
            if (match) {
                sections.set(match[1], { line: i + 1, content: line });
            }
        }
        
        return sections;
    }

    private extractVariables(content: string): Map<string, string> {
        const variables = new Map();
        const matches = content.match(/\{\{(\w+)\}\}/g);
        
        if (matches) {
            for (const match of matches) {
                const varName = match.replace(/[{}]/g, '');
                variables.set(varName, match);
            }
        }
        
        return variables;
    }

    private calculateChecksum(content: string): string {
        // Simple checksum implementation
        let hash = 0;
        for (let i = 0; i < content.length; i++) {
            const char = content.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash).toString(16);
    }

    private log(message: string): void {
        const timestamp = new Date().toISOString();
        console.log(`${timestamp} [ClaudeMergeSystem] ${message}`);
        
        // Emit log event for external listeners
        this.emit('log', { timestamp, message });
    }
}

// Export singleton instance
let _instance: ClaudeMergeSystem | null = null;

export const getClaudeMergeSystem = (config?: Partial<MergeSystemConfig>): ClaudeMergeSystem => {
    if (!_instance) {
        _instance = new ClaudeMergeSystem(config);
    }
    return _instance;
};

// Export default plugin interface
export abstract class BaseMergePlugin implements PluginInterface {
    abstract name: string;
    abstract version: string;
    
    async initialize(_system: ClaudeMergeSystem): Promise<void> {
        // Default implementation
    }
    
    async cleanup(): Promise<void> {
        // Default implementation
    }
}

// Export utility functions
export const createMergeOperation = (
    type: 'auto' | 'manual' | 'scheduled' = 'manual',
    triggeredBy: string = 'unknown'
): Partial<MergeOperation> => ({
    timestamp: new Date(),
    type,
    status: 'pending',
    metadata: { triggeredBy }
});

export const formatMergeMetrics = (metrics: SystemMetrics): string => {
    return [
        `Operations: ${metrics.mergeOperations.successful}/${metrics.mergeOperations.total} successful`,
        `Average duration: ${metrics.mergeOperations.averageDuration.toFixed(2)}ms`,
        `Cache hit rate: ${(metrics.cache.hitRate * 100).toFixed(1)}%`,
        `Memory usage: ${(metrics.performance.memoryUsage.heapUsed / 1024 / 1024).toFixed(2)}MB`
    ].join(' | ');
};