/**
 * Claude Documentation Manager for Dual Claude System
 * Manages Claude documentation files, merging, watching, and utilities
 */

import * as fs from 'fs/promises';
import * as fsSync from 'fs';
import * as path from 'path';
import { spawn } from 'child_process';
import { FSWatcher, watch } from 'chokidar';
// import { logger } from './Logger.js';

// Interfaces for comprehensive type safety
export interface ClaudeDocMetadata {
    filePath: string;
    size: number;
    lastModified: Date;
    checksum?: string;
    version?: string;
    source: 'ces' | 'project' | 'master';
}

export interface ClaudeDocSearchResult {
    filePath: string;
    matches: {
        line: number;
        content: string;
        context?: string[];
    }[];
    metadata: ClaudeDocMetadata;
}

export interface ClaudeDocWatchEvent {
    eventType: 'add' | 'change' | 'unlink';
    filePath: string;
    timestamp: Date;
    metadata?: ClaudeDocMetadata;
}

export interface ClaudeDocBackupInfo {
    originalPath: string;
    backupPath: string;
    timestamp: Date;
    size: number;
    description?: string;
}

export interface ClaudeDocValidation {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    suggestions: string[];
    cesFound: boolean;
    projectFound: boolean;
    masterGenerated: boolean;
}

/**
 * Main Claude Documentation Manager Class
 * Singleton pattern for enterprise-grade document management
 */
export class ClaudeDocManager {
    private static instance: ClaudeDocManager;
    private watchers: Map<string, FSWatcher> = new Map();
    private backups: Map<string, ClaudeDocBackupInfo[]> = new Map();
    private cache: Map<string, ClaudeDocMetadata> = new Map();
    private isInitialized: boolean = false;

    private constructor() {
        // Simplified implementation for initial release
    }

    private log(message: string) {
        // Simple console logging for now
        console.log(`[ClaudeDocManager] ${message}`);
    }

    /**
     * Get singleton instance
     */
    public static getInstance(): ClaudeDocManager {
        if (!ClaudeDocManager.instance) {
            ClaudeDocManager.instance = new ClaudeDocManager();
        }
        return ClaudeDocManager.instance;
    }

    /**
     * Initialize the document manager
     */
    public async initialize(): Promise<void> {
        if (this.isInitialized) {
            return;
        }

        try {
            this.log('Initializing ClaudeDocManager...');
            
            // Setup default directories
            await this.ensureDirectories();
            
            // Clear any existing cache
            this.cache.clear();
            
            this.isInitialized = true;
            this.log('ClaudeDocManager initialized successfully');
        } catch (error) {
            this.log('Failed to initialize ClaudeDocManager');
            throw error;
        }
    }

    /**
     * Get file metadata
     */
    public async getMetadata(filePath: string): Promise<ClaudeDocMetadata | null> {
        try {
            // Check cache first
            const cacheKey = path.resolve(filePath);
            if (this.cache.has(cacheKey)) {
                const cached = this.cache.get(cacheKey)!;
                // Verify cache is still valid
                if (fsSync.existsSync(filePath)) {
                    const stats = await fs.stat(filePath);
                    if (stats.mtime.getTime() === cached.lastModified.getTime()) {
                        return cached;
                    }
                }
            }

            if (!fsSync.existsSync(filePath)) {
                return null;
            }

            const stats = await fs.stat(filePath);
            const source = this.determineSource(filePath);
            
            const metadata: ClaudeDocMetadata = {
                filePath: path.resolve(filePath),
                size: stats.size,
                lastModified: stats.mtime,
                source
            };

            // Cache the metadata
            this.cache.set(cacheKey, metadata);
            
            return metadata;
        } catch (error) {
            this.log('Failed to get metadata');
            return null;
        }
    }

    /**
     * Search content in Claude documentation files
     */
    public async searchContent(pattern: string, searchPaths?: string[]): Promise<ClaudeDocSearchResult[]> {
        const paths = searchPaths || await this.getDefaultPaths();
        const results: ClaudeDocSearchResult[] = [];

        for (const filePath of paths) {
            try {
                if (!fsSync.existsSync(filePath)) {
                    continue;
                }

                const content = await fs.readFile(filePath, 'utf-8');
                const lines = content.split('\n');
                const matches: { line: number; content: string; context?: string[] }[] = [];
                
                const regex = new RegExp(pattern, 'gi');
                
                lines.forEach((line, index) => {
                    if (regex.test(line)) {
                        const context = this.getLineContext(lines, index, 2);
                        matches.push({
                            line: index + 1,
                            content: line,
                            context
                        });
                    }
                });

                if (matches.length > 0) {
                    const metadata = await this.getMetadata(filePath);
                    if (metadata) {
                        results.push({
                            filePath,
                            matches,
                            metadata
                        });
                    }
                }
            } catch (error) {
                this.log('Failed to search in file');
            }
        }

        return results;
    }

    /**
     * Create backup of a Claude documentation file
     */
    public async createBackup(filePath: string, description?: string): Promise<ClaudeDocBackupInfo | null> {
        try {
            if (!fsSync.existsSync(filePath)) {
                this.log('Cannot backup non-existent file');
                return null;
            }

            const timestamp = new Date();
            const backupDir = path.join(path.dirname(filePath), '.backups');
            await fs.mkdir(backupDir, { recursive: true });
            
            const fileName = path.basename(filePath);
            const backupFileName = `${fileName}.backup.${timestamp.getTime()}`;
            const backupPath = path.join(backupDir, backupFileName);

            await fs.copyFile(filePath, backupPath);
            
            const stats = await fs.stat(backupPath);
            const backupInfo: ClaudeDocBackupInfo = {
                originalPath: path.resolve(filePath),
                backupPath: path.resolve(backupPath),
                timestamp,
                size: stats.size,
                description
            };

            // Track backup
            const key = path.resolve(filePath);
            if (!this.backups.has(key)) {
                this.backups.set(key, []);
            }
            this.backups.get(key)!.push(backupInfo);

            this.log('Backup created');
            return backupInfo;
        } catch (error) {
            this.log('Failed to create backup');
            return null;
        }
    }

    /**
     * Restore from backup
     */
    public async restoreFromBackup(backupInfo: ClaudeDocBackupInfo): Promise<boolean> {
        try {
            if (!fsSync.existsSync(backupInfo.backupPath)) {
                this.log('Backup file not found');
                return false;
            }

            // Create backup of current file before restore
            if (fsSync.existsSync(backupInfo.originalPath)) {
                await this.createBackup(backupInfo.originalPath, 'Pre-restore backup');
            }

            await fs.copyFile(backupInfo.backupPath, backupInfo.originalPath);
            this.log('File restored from backup');
            
            // Clear cache for restored file
            this.cache.delete(backupInfo.originalPath);
            
            return true;
        } catch (error) {
            this.log('Failed to restore from backup');
            return false;
        }
    }

    /**
     * Get list of backups for a file
     */
    public getBackups(filePath: string): ClaudeDocBackupInfo[] {
        const key = path.resolve(filePath);
        return this.backups.get(key) || [];
    }

    /**
     * Watch Claude documentation files for changes
     */
    public async startWatching(filePaths: string[], callback: (event: ClaudeDocWatchEvent) => void): Promise<void> {
        try {
            const watcherKey = filePaths.join('::');
            
            if (this.watchers.has(watcherKey)) {
                this.log('Already watching these paths');
                return;
            }

            const watcher = watch(filePaths, {
                persistent: true,
                ignoreInitial: true,
                followSymlinks: false
            });

            watcher.on('add', async (filePath: string) => {
                const metadata = await this.getMetadata(filePath);
                callback({
                    eventType: 'add',
                    filePath,
                    timestamp: new Date(),
                    metadata: metadata || undefined
                });
            });

            watcher.on('change', async (filePath: string) => {
                // Clear cache for changed file
                this.cache.delete(path.resolve(filePath));
                
                const metadata = await this.getMetadata(filePath);
                callback({
                    eventType: 'change',
                    filePath,
                    timestamp: new Date(),
                    metadata: metadata || undefined
                });
            });

            watcher.on('unlink', (filePath: string) => {
                // Clear cache for deleted file
                this.cache.delete(path.resolve(filePath));
                
                callback({
                    eventType: 'unlink',
                    filePath,
                    timestamp: new Date()
                });
            });

            this.watchers.set(watcherKey, watcher);
            this.log('Started watching Claude documentation files');
        } catch (error) {
            this.log('Failed to start watching files');
            throw error;
        }
    }

    /**
     * Stop watching files
     */
    public async stopWatching(filePaths?: string[]): Promise<void> {
        try {
            if (filePaths) {
                const watcherKey = filePaths.join('::');
                const watcher = this.watchers.get(watcherKey);
                if (watcher) {
                    await watcher.close();
                    this.watchers.delete(watcherKey);
                    this.log('Stopped watching specific paths');
                }
            } else {
                // Stop all watchers
                for (const [_key, watcher] of this.watchers) {
                    await watcher.close();
                }
                this.watchers.clear();
                this.log('Stopped all file watching');
            }
        } catch (error) {
            this.log('Failed to stop watching files');
        }
    }

    /**
     * Validate Claude documentation setup
     */
    public async validateSetup(): Promise<ClaudeDocValidation> {
        const validation: ClaudeDocValidation = {
            isValid: true,
            errors: [],
            warnings: [],
            suggestions: [],
            cesFound: false,
            projectFound: false,
            masterGenerated: false
        };

        try {
            const paths = await this.getDefaultPaths();
            
            // Check CES CLAUDE.md
            const cesPath = paths.find(p => p.includes('.claude/CLAUDE.md'));
            if (cesPath && fsSync.existsSync(cesPath)) {
                validation.cesFound = true;
            } else {
                validation.warnings.push('CES CLAUDE.md not found in ~/.claude/CLAUDE.md');
                validation.suggestions.push('Install CES globally or create ~/.claude/CLAUDE.md');
            }

            // Check Project CLAUDE.md
            const projectPath = path.join(process.cwd(), 'CLAUDE.md');
            if (fsSync.existsSync(projectPath)) {
                validation.projectFound = true;
            } else {
                validation.warnings.push('Project CLAUDE.md not found');
                validation.suggestions.push('Create CLAUDE.md in project root for project-specific instructions');
            }

            // Check CLAUDE-MASTER.md
            const masterPath = path.join(process.cwd(), '.claude', 'CLAUDE-MASTER.md');
            if (fsSync.existsSync(masterPath)) {
                validation.masterGenerated = true;
                
                // Validate master file content
                const content = await fs.readFile(masterPath, 'utf-8');
                if (content.length < 100) {
                    validation.errors.push('CLAUDE-MASTER.md appears to be empty or corrupted');
                    validation.isValid = false;
                }
            } else {
                validation.errors.push('CLAUDE-MASTER.md not found - run merge operation');
                validation.isValid = false;
            }

            // Additional validations
            if (!validation.cesFound && !validation.projectFound) {
                validation.errors.push('Neither CES nor Project CLAUDE.md found - at least one is required');
                validation.isValid = false;
            }

        } catch (error) {
            validation.errors.push(`Validation error: ${error instanceof Error ? error.message : String(error)}`);
            validation.isValid = false;
        }

        return validation;
    }

    /**
     * Execute merge operation using external script
     */
    public async executeMerge(options: { verbose?: boolean; dryRun?: boolean; force?: boolean } = {}): Promise<boolean> {
        try {
            const scriptPath = path.join(process.cwd(), 'scripts', 'merge-claude-docs.sh');
            
            if (!fsSync.existsSync(scriptPath)) {
                this.log('Merge script not found');
                return false;
            }

            const args = ['--merge'];
            if (options.verbose) args.push('--verbose');
            if (options.dryRun) args.push('--dry-run');
            if (options.force) args.push('--force');

            return new Promise((resolve) => {
                const process = spawn('bash', [scriptPath, ...args], {
                    stdio: options.verbose ? 'inherit' : 'pipe',
                    cwd: path.dirname(scriptPath)
                });

                process.on('close', (code) => {
                    const success = code === 0;
                    if (success) {
                        this.log('Merge operation completed successfully');
                        // Clear cache after successful merge
                        this.cache.clear();
                    } else {
                        this.log('Merge operation failed');
                    }
                    resolve(success);
                });

                process.on('error', (_error) => {
                    this.log('Failed to execute merge script');
                    resolve(false);
                });
            });
        } catch (error) {
            this.log('Failed to execute merge operation');
            return false;
        }
    }

    /**
     * Get performance metrics
     */
    public getMetrics(): Record<string, any> {
        return {
            initialized: this.isInitialized,
            cachedFiles: this.cache.size,
            activeWatchers: this.watchers.size,
            totalBackups: Array.from(this.backups.values()).flat().length,
            memoryUsage: process.memoryUsage()
        };
    }

    /**
     * Cleanup resources
     */
    public async cleanup(): Promise<void> {
        try {
            await this.stopWatching();
            this.cache.clear();
            this.backups.clear();
            this.isInitialized = false;
            this.log('ClaudeDocManager cleanup completed');
        } catch (error) {
            this.log('Failed to cleanup ClaudeDocManager');
        }
    }

    // Private helper methods

    private async ensureDirectories(): Promise<void> {
        const dirs = [
            path.join(process.cwd(), '.claude'),
            path.join(process.cwd(), '.backups')
        ];

        for (const dir of dirs) {
            await fs.mkdir(dir, { recursive: true });
        }
    }

    private determineSource(filePath: string): 'ces' | 'project' | 'master' {
        const resolvedPath = path.resolve(filePath);
        
        if (resolvedPath.includes('.claude/CLAUDE-MASTER.md')) {
            return 'master';
        } else if (resolvedPath.includes('/.claude/CLAUDE.md') || resolvedPath.includes(path.join(process.env.HOME || '', '.claude', 'CLAUDE.md'))) {
            return 'ces';
        } else {
            return 'project';
        }
    }

    private async getDefaultPaths(): Promise<string[]> {
        return [
            path.join(process.env.HOME || '', '.claude', 'CLAUDE.md'),
            path.join(process.cwd(), 'CLAUDE.md'),
            path.join(process.cwd(), '.claude', 'CLAUDE-MASTER.md')
        ];
    }

    private getLineContext(lines: string[], lineIndex: number, contextSize: number): string[] {
        const start = Math.max(0, lineIndex - contextSize);
        const end = Math.min(lines.length, lineIndex + contextSize + 1);
        return lines.slice(start, end);
    }
}

// Export singleton instance
export const claudeDocManager = ClaudeDocManager.getInstance();