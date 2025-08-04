/**
 * Comprehensive TypeScript test suite for Dual Claude System
 * Tests all TypeScript components including ClaudeDocManager and DocumentationCommands
 */

import { ClaudeDocManager } from '../utils/ClaudeDocManager';
import { DocumentationCommands } from '../cli/DocumentationCommands';
import * as fs from 'fs/promises';
import * as fsSync from 'fs';
import * as path from 'path';
import { spawn } from 'child_process';

// Mock file system for testing
jest.mock('fs/promises');
jest.mock('fs');
jest.mock('child_process');

const mockFs = fs as jest.Mocked<typeof fs>;
const mockFsSync = fsSync as jest.Mocked<typeof fsSync>;
const mockSpawn = spawn as jest.MockedFunction<typeof spawn>;

describe('Dual Claude System - TypeScript Components', () => {
    let testWorkspace: string;
    let claudeDocManager: ClaudeDocManager;
    let documentationCommands: DocumentationCommands;

    beforeAll(async () => {
        testWorkspace = '/tmp/ces-ts-test';
        claudeDocManager = ClaudeDocManager.getInstance();
        documentationCommands = new DocumentationCommands();
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        
        // Reset singleton state
        await claudeDocManager.cleanup();
        
        // Setup common mocks
        mockFsSync.existsSync.mockReturnValue(true);
        mockFs.mkdir.mockResolvedValue(undefined);
        mockFs.stat.mockResolvedValue({
            size: 1000,
            mtime: new Date(),
            isFile: () => true,
            isDirectory: () => false
        } as any);
    });

    afterAll(async () => {
        await claudeDocManager.cleanup();
    });

    describe('ClaudeDocManager', () => {
        describe('Singleton Pattern', () => {
            test('should return same instance', () => {
                const instance1 = ClaudeDocManager.getInstance();
                const instance2 = ClaudeDocManager.getInstance();
                expect(instance1).toBe(instance2);
            });

            test('should initialize only once', async () => {
                const instance = ClaudeDocManager.getInstance();
                await instance.initialize();
                
                // Second initialization should not throw
                await expect(instance.initialize()).resolves.not.toThrow();
            });
        });

        describe('File Operations', () => {
            test('should get file metadata', async () => {
                const testFile = '/test/path/CLAUDE.md';
                mockFsSync.existsSync.mockReturnValue(true);
                mockFs.stat.mockResolvedValue({
                    size: 1500,
                    mtime: new Date('2025-01-01'),
                    isFile: () => true
                } as any);

                const metadata = await claudeDocManager.getMetadata(testFile);
                
                expect(metadata).not.toBeNull();
                expect(metadata?.size).toBe(1500);
                expect(metadata?.source).toBe('project');
            });

            test('should return null for non-existent files', async () => {
                mockFsSync.existsSync.mockReturnValue(false);
                
                const metadata = await claudeDocManager.getMetadata('/non/existent/file');
                
                expect(metadata).toBeNull();
            });

            test('should determine correct source type', async () => {
                const testCases = [
                    { path: '/.claude/CLAUDE.md', expected: 'ces' },
                    { path: '/project/CLAUDE.md', expected: 'project' },
                    { path: '/.claude/CLAUDE-MASTER.md', expected: 'master' }
                ];

                for (const testCase of testCases) {
                    mockFsSync.existsSync.mockReturnValue(true);
                    const metadata = await claudeDocManager.getMetadata(testCase.path);
                    expect(metadata?.source).toBe(testCase.expected);
                }
            });
        });

        describe('Search Functionality', () => {
            test('should search content in files', async () => {
                const testContent = `
# Test Document
This is test content with keywords.
Another line with different content.
                `;
                
                mockFsSync.existsSync.mockReturnValue(true);
                mockFs.readFile.mockResolvedValue(testContent);
                mockFs.stat.mockResolvedValue({
                    size: testContent.length,
                    mtime: new Date()
                } as any);

                const results = await claudeDocManager.searchContent('test', ['/test/file.md']);
                
                expect(results).toHaveLength(1);
                expect(results[0].matches).toHaveLength(2); // "Test Document" and "test content"
                expect(results[0].matches[0].line).toBe(2); // "# Test Document"
            });

            test('should handle search with no matches', async () => {
                mockFsSync.existsSync.mockReturnValue(true);
                mockFs.readFile.mockResolvedValue('No matching content here');
                
                const results = await claudeDocManager.searchContent('nonexistent', ['/test/file.md']);
                
                expect(results).toHaveLength(0);
            });
        });

        describe('Backup Operations', () => {
            test('should create backup successfully', async () => {
                const testFile = '/test/CLAUDE.md';
                mockFsSync.existsSync.mockReturnValue(true);
                mockFs.copyFile.mockResolvedValue(undefined);
                mockFs.mkdir.mockResolvedValue(undefined);
                mockFs.stat.mockResolvedValue({
                    size: 500,
                    mtime: new Date()
                } as any);

                const backup = await claudeDocManager.createBackup(testFile, 'Test backup');
                
                expect(backup).not.toBeNull();
                expect(backup?.description).toBe('Test backup');
                expect(backup?.originalPath).toContain(testFile);
                expect(mockFs.copyFile).toHaveBeenCalled();
            });

            test('should handle backup of non-existent file', async () => {
                mockFsSync.existsSync.mockReturnValue(false);
                
                const backup = await claudeDocManager.createBackup('/non/existent/file');
                
                expect(backup).toBeNull();
            });

            test('should restore from backup', async () => {
                const backupInfo = {
                    originalPath: '/test/original.md',
                    backupPath: '/test/.backups/original.md.backup.123',
                    timestamp: new Date(),
                    size: 500
                };

                mockFsSync.existsSync.mockReturnValue(true);
                mockFs.copyFile.mockResolvedValue(undefined);

                const success = await claudeDocManager.restoreFromBackup(backupInfo);
                
                expect(success).toBe(true);
                expect(mockFs.copyFile).toHaveBeenCalledWith(
                    backupInfo.backupPath,
                    backupInfo.originalPath
                );
            });
        });

        describe('File Watching', () => {
            test('should start watching files', async () => {
                const mockWatcher = {
                    on: jest.fn(),
                    close: jest.fn().mockResolvedValue(undefined)
                };
                
                // Mock chokidar watch
                const mockWatch = jest.fn().mockReturnValue(mockWatcher);
                jest.doMock('chokidar', () => ({ watch: mockWatch }));

                const callback = jest.fn();
                await claudeDocManager.startWatching(['/test/file1.md', '/test/file2.md'], callback);
                
                expect(mockWatch).toHaveBeenCalledWith(
                    ['/test/file1.md', '/test/file2.md'],
                    expect.objectContaining({
                        persistent: true,
                        ignoreInitial: true,
                        followSymlinks: false
                    })
                );
            });

            test('should stop watching files', async () => {
                const mockWatcher = {
                    on: jest.fn(),
                    close: jest.fn().mockResolvedValue(undefined)
                };
                
                const mockWatch = jest.fn().mockReturnValue(mockWatcher);
                jest.doMock('chokidar', () => ({ watch: mockWatch }));

                const callback = jest.fn();
                await claudeDocManager.startWatching(['/test/file.md'], callback);
                await claudeDocManager.stopWatching(['/test/file.md']);
                
                expect(mockWatcher.close).toHaveBeenCalled();
            });
        });

        describe('Validation', () => {
            test('should validate complete setup', async () => {
                mockFsSync.existsSync.mockImplementation((path: string) => {
                    return path.includes('CLAUDE-MASTER.md') || 
                           path.includes('.claude/CLAUDE.md') || 
                           path.includes('/CLAUDE.md');
                });
                
                mockFs.readFile.mockResolvedValue('Valid content with reasonable length');
                
                const validation = await claudeDocManager.validateSetup();
                
                expect(validation.isValid).toBe(true);
                expect(validation.cesFound).toBe(true);
                expect(validation.projectFound).toBe(true);
                expect(validation.masterGenerated).toBe(true);
                expect(validation.errors).toHaveLength(0);
            });

            test('should detect missing files', async () => {
                mockFsSync.existsSync.mockReturnValue(false);
                
                const validation = await claudeDocManager.validateSetup();
                
                expect(validation.isValid).toBe(false);
                expect(validation.cesFound).toBe(false);
                expect(validation.projectFound).toBe(false);
                expect(validation.masterGenerated).toBe(false);
                expect(validation.errors.length).toBeGreaterThan(0);
            });

            test('should detect corrupted master file', async () => {
                mockFsSync.existsSync.mockImplementation((path: string) => {
                    return path.includes('CLAUDE-MASTER.md');
                });
                
                mockFs.readFile.mockResolvedValue(''); // Empty content
                
                const validation = await claudeDocManager.validateSetup();
                
                expect(validation.isValid).toBe(false);
                expect(validation.errors.some(e => e.includes('empty or corrupted'))).toBe(true);
            });
        });

        describe('Merge Operations', () => {
            test('should execute merge script successfully', async () => {
                mockFsSync.existsSync.mockReturnValue(true);
                
                const mockProcess = {
                    on: jest.fn((event, callback) => {
                        if (event === 'close') {
                            callback(0); // Success exit code
                        }
                    })
                };
                
                mockSpawn.mockReturnValue(mockProcess as any);
                
                const success = await claudeDocManager.executeMerge({ verbose: true });
                
                expect(success).toBe(true);
                expect(mockSpawn).toHaveBeenCalledWith(
                    'bash',
                    expect.arrayContaining(['--merge', '--verbose']),
                    expect.any(Object)
                );
            });

            test('should handle merge script failure', async () => {
                mockFsSync.existsSync.mockReturnValue(true);
                
                const mockProcess = {
                    on: jest.fn((event, callback) => {
                        if (event === 'close') {
                            callback(1); // Error exit code
                        }
                    })
                };
                
                mockSpawn.mockReturnValue(mockProcess as any);
                
                const success = await claudeDocManager.executeMerge();
                
                expect(success).toBe(false);
            });

            test('should handle missing merge script', async () => {
                mockFsSync.existsSync.mockReturnValue(false);
                
                const success = await claudeDocManager.executeMerge();
                
                expect(success).toBe(false);
            });
        });

        describe('Performance Metrics', () => {
            test('should return performance metrics', () => {
                const metrics = claudeDocManager.getMetrics();
                
                expect(metrics).toHaveProperty('initialized');
                expect(metrics).toHaveProperty('cachedFiles');
                expect(metrics).toHaveProperty('activeWatchers');
                expect(metrics).toHaveProperty('totalBackups');
                expect(metrics).toHaveProperty('memoryUsage');
            });
        });

        describe('Cache Management', () => {
            test('should cache file metadata', async () => {
                const testFile = '/test/CLAUDE.md';
                mockFsSync.existsSync.mockReturnValue(true);
                mockFs.stat.mockResolvedValue({
                    size: 1000,
                    mtime: new Date('2025-01-01')
                } as any);

                // First call
                const metadata1 = await claudeDocManager.getMetadata(testFile);
                // Second call should use cache
                const metadata2 = await claudeDocManager.getMetadata(testFile);
                
                expect(metadata1).toEqual(metadata2);
                expect(mockFs.stat).toHaveBeenCalledTimes(1); // Only called once due to caching
            });

            test('should invalidate cache when file changes', async () => {
                const testFile = '/test/CLAUDE.md';
                const oldDate = new Date('2025-01-01');
                const newDate = new Date('2025-01-02');
                
                mockFsSync.existsSync.mockReturnValue(true);
                
                // First call with old date
                mockFs.stat.mockResolvedValueOnce({
                    size: 1000,
                    mtime: oldDate
                } as any);
                
                await claudeDocManager.getMetadata(testFile);
                
                // Second call with new date (file changed)
                mockFs.stat.mockResolvedValueOnce({
                    size: 1100,
                    mtime: newDate
                } as any);
                
                await claudeDocManager.getMetadata(testFile);
                
                expect(mockFs.stat).toHaveBeenCalledTimes(2); // Called twice due to cache invalidation
            });
        });
    });

    describe('DocumentationCommands', () => {
        describe('Command Handling', () => {
            test('should handle show command', async () => {
                mockFsSync.existsSync.mockReturnValue(true);
                mockFs.readFile.mockResolvedValue('# Test Documentation\\nContent here');
                
                const result = await documentationCommands.handleDocsCommand(['show']);
                
                expect(result).toBe(0);
                expect(mockFs.readFile).toHaveBeenCalled();
            });

            test('should handle missing master file in show command', async () => {
                mockFsSync.existsSync.mockReturnValue(false);
                
                const result = await documentationCommands.handleDocsCommand(['show']);
                
                expect(result).toBe(1);
            });

            test('should handle validate command', async () => {
                mockFsSync.existsSync.mockReturnValue(true);
                mockFs.stat.mockResolvedValue({
                    size: 1000,
                    mtime: new Date()
                } as any);
                
                const result = await documentationCommands.handleDocsCommand(['validate']);
                
                expect(result).toBe(0);
            });

            test('should handle regenerate command with script', async () => {
                mockFsSync.existsSync.mockReturnValue(true);
                
                const mockProcess = {
                    stdout: { on: jest.fn() },
                    stderr: { on: jest.fn() },
                    on: jest.fn((event, callback) => {
                        if (event === 'close') {
                            callback(0);
                        }
                    })
                };
                
                mockSpawn.mockReturnValue(mockProcess as any);
                
                const result = await documentationCommands.handleDocsCommand(['regenerate']);
                
                expect(result).toBe(0);
            });

            test('should handle unknown command', async () => {
                const result = await documentationCommands.handleDocsCommand(['unknown']);
                
                expect(result).toBe(1);
            });

            test('should handle empty command array', async () => {
                const result = await documentationCommands.handleDocsCommand([]);
                
                expect(result).toBe(1);
            });
        });

        describe('Editor Integration', () => {
            test('should handle edit command with existing file', async () => {
                mockFsSync.existsSync.mockReturnValue(true);
                
                const mockProcess = {
                    on: jest.fn((event, callback) => {
                        if (event === 'close') {
                            callback(0);
                        }
                    })
                };
                
                mockSpawn.mockReturnValue(mockProcess as any);
                
                // Mock regenerate call after edit
                jest.spyOn(documentationCommands as any, 'regenerateDocs')
                    .mockResolvedValue(0);
                
                const result = await documentationCommands.handleDocsCommand(['edit']);
                
                expect(result).toBe(0);
            });

            test('should create template for missing project file', async () => {
                mockFsSync.existsSync.mockReturnValue(false);
                mockFs.writeFile.mockResolvedValue(undefined);
                
                const mockProcess = {
                    on: jest.fn((event, callback) => {
                        if (event === 'close') {
                            callback(0);
                        }
                    })
                };
                
                mockSpawn.mockReturnValue(mockProcess as any);
                
                jest.spyOn(documentationCommands as any, 'regenerateDocs')
                    .mockResolvedValue(0);
                
                const result = await documentationCommands.handleDocsCommand(['edit']);
                
                expect(mockFs.writeFile).toHaveBeenCalled();
                expect(result).toBe(0);
            });
        });

        describe('Debug Information', () => {
            test('should gather debug information', async () => {
                mockFsSync.existsSync.mockReturnValue(true);
                mockFs.stat.mockResolvedValue({
                    size: 1000,
                    mtime: new Date()
                } as any);
                
                const result = await documentationCommands.handleDocsCommand(['debug']);
                
                expect(result).toBe(0);
            });
        });

        describe('Validation Logic', () => {
            test('should validate complete setup', async () => {
                mockFsSync.existsSync.mockReturnValue(true);
                mockFs.stat.mockResolvedValue({
                    size: 1000,
                    mtime: new Date()
                } as any);
                
                // Access private method for testing
                const validation = await (documentationCommands as any).performValidation();
                
                expect(validation.isValid).toBe(true);
                expect(validation.globalExists).toBe(true);
                expect(validation.projectExists).toBe(true);
                expect(validation.masterExists).toBe(true);
            });

            test('should detect invalid setup', async () => {
                mockFsSync.existsSync.mockReturnValue(false);
                
                const validation = await (documentationCommands as any).performValidation();
                
                expect(validation.isValid).toBe(false);
                expect(validation.issues.length).toBeGreaterThan(0);
            });
        });
    });

    describe('Integration Tests', () => {
        test('should work together - manager and commands', async () => {
            // Setup mocks for successful operation
            mockFsSync.existsSync.mockReturnValue(true);
            mockFs.readFile.mockResolvedValue('# Test Content\\nValid documentation');
            mockFs.stat.mockResolvedValue({
                size: 1000,
                mtime: new Date()
            } as any);
            
            await claudeDocManager.initialize();
            const validation = await claudeDocManager.validateSetup();
            const commandResult = await documentationCommands.handleDocsCommand(['validate']);
            
            expect(validation.isValid).toBe(true);
            expect(commandResult).toBe(0);
        });

        test('should handle error conditions gracefully', async () => {
            // Setup mocks for error conditions
            mockFsSync.existsSync.mockReturnValue(false);
            mockFs.readFile.mockRejectedValue(new Error('File not found'));
            
            const validation = await claudeDocManager.validateSetup();
            const commandResult = await documentationCommands.handleDocsCommand(['show']);
            
            expect(validation.isValid).toBe(false);
            expect(commandResult).toBe(1);
        });
    });

    describe('Error Handling', () => {
        test('should handle file system errors gracefully', async () => {
            mockFs.stat.mockRejectedValue(new Error('Permission denied'));
            
            const metadata = await claudeDocManager.getMetadata('/test/file.md');
            
            expect(metadata).toBeNull();
        });

        test('should handle process spawn errors', async () => {
            mockFsSync.existsSync.mockReturnValue(true);
            
            const mockProcess = {
                on: jest.fn((event, callback) => {
                    if (event === 'error') {
                        callback(new Error('Spawn failed'));
                    }
                })
            };
            
            mockSpawn.mockReturnValue(mockProcess as any);
            
            const success = await claudeDocManager.executeMerge();
            
            expect(success).toBe(false);
        });

        test('should handle validation errors', async () => {
            mockFsSync.existsSync.mockImplementation(() => {
                throw new Error('File system error');
            });
            
            const validation = await claudeDocManager.validateSetup();
            
            expect(validation.isValid).toBe(false);
            expect(validation.errors.some(e => e.includes('Validation error'))).toBe(true);
        });
    });

    describe('Performance Tests', () => {
        test('should handle large file operations efficiently', async () => {
            const largeContent = 'x'.repeat(1000000); // 1MB content
            
            mockFsSync.existsSync.mockReturnValue(true);
            mockFs.readFile.mockResolvedValue(largeContent);
            mockFs.stat.mockResolvedValue({
                size: largeContent.length,
                mtime: new Date()
            } as any);
            
            const startTime = Date.now();
            const results = await claudeDocManager.searchContent('x', ['/test/large-file.md']);
            const endTime = Date.now();
            
            expect(endTime - startTime).toBeLessThan(5000); // Should complete in under 5 seconds
            expect(results).toHaveLength(1);
        });

        test('should cache repeated operations', async () => {
            const testFile = '/test/CLAUDE.md';
            mockFsSync.existsSync.mockReturnValue(true);
            mockFs.stat.mockResolvedValue({
                size: 1000,
                mtime: new Date('2025-01-01')
            } as any);

            // Multiple calls to same file
            await Promise.all([
                claudeDocManager.getMetadata(testFile),
                claudeDocManager.getMetadata(testFile),
                claudeDocManager.getMetadata(testFile)
            ]);
            
            expect(mockFs.stat).toHaveBeenCalledTimes(1); // Only one actual file system call
        });
    });
});

// Helper functions for test setup
export const setupTestEnvironment = async () => {
    // Mock environment setup
    process.env.NODE_ENV = 'test';
    process.env.CES_VERSION = '2.7.0';
};

export const cleanupTestEnvironment = async () => {
    // Clean up test environment
    jest.clearAllMocks();
};

// Test utilities
export const createMockFile = (path: string, content: string, size?: number) => {
    mockFsSync.existsSync.mockImplementation((filePath: string) => filePath === path);
    mockFs.readFile.mockImplementation((filePath: string) => 
        filePath === path ? Promise.resolve(content) : Promise.reject(new Error('File not found'))
    );
    mockFs.stat.mockImplementation((filePath: string) =>
        filePath === path ? Promise.resolve({
            size: size || content.length,
            mtime: new Date(),
            isFile: () => true,
            isDirectory: () => false
        }) : Promise.reject(new Error('File not found'))
    );
};

export const createMockProcess = (exitCode: number = 0, stdout: string = '', stderr: string = '') => {
    return {
        stdout: {
            on: jest.fn((event, callback) => {
                if (event === 'data' && stdout) {
                    callback(stdout);
                }
            })
        },
        stderr: {
            on: jest.fn((event, callback) => {
                if (event === 'data' && stderr) {
                    callback(stderr);
                }
            })
        },
        on: jest.fn((event, callback) => {
            if (event === 'close') {
                callback(exitCode);
            }
        })
    };
};