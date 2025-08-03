/**
 * Tests for ConfigManager
 */

import { ConfigManager } from '../config/ConfigManager';

describe('ConfigManager', () => {
    let configManager: ConfigManager;

    beforeEach(() => {
        configManager = new ConfigManager();
    });

    describe('initialization', () => {
        it('should initialize successfully', async () => {
            const config = await configManager.initialize();
            
            expect(config).toBeDefined();
            expect(config.projectRoot).toBeDefined();
            expect(config.projectName).toBeDefined();
            expect(Array.isArray(config.languages)).toBe(true);
            expect(Array.isArray(config.frameworks)).toBe(true);
            expect(Array.isArray(config.tools)).toBe(true);
            expect(typeof config.hasGit).toBe('boolean');
            expect(typeof config.hasMCP).toBe('boolean');
            expect(typeof config.hasAgents).toBe('boolean');
        });

        it('should detect TypeScript in current project', async () => {
            const config = await configManager.initialize();
            
            const hasTypeScript = config.languages.some(lang => lang.name === 'TypeScript');
            expect(hasTypeScript).toBe(true);
        });
    });

    describe('configuration management', () => {
        it('should get configuration after initialization', async () => {
            await configManager.initialize();
            const config = configManager.getConfig();
            
            expect(config).toBeDefined();
            expect(config.projectName).toBeDefined();
        });

        it('should throw error when getting config before initialization', () => {
            expect(() => {
                configManager.getConfig();
            }).toThrow('Configuration not initialized');
        });
    });

    describe('health check', () => {
        it('should perform health check', async () => {
            const health = await configManager.performHealthCheck();
            
            expect(health).toBeDefined();
            expect(health.overall).toMatch(/healthy|warning|error/);
            expect(health.languages).toBeDefined();
            expect(health.mcp).toBeDefined();
            expect(health.agents).toBeDefined();
            expect(health.git).toBeDefined();
            expect(health.environment).toBeDefined();
            expect(Array.isArray(health.issues)).toBe(true);
        });
    });

    describe('MCP servers', () => {
        it('should load MCP servers when config exists', async () => {
            try {
                const servers = await configManager.loadMCPServers();
                expect(Array.isArray(servers)).toBe(true);
            } catch (error) {
                // Expected if MCP config doesn't exist
                expect((error as Error).message).toContain('MCP configuration file not found');
            }
        });
    });

    describe('agents', () => {
        it('should load agents', async () => {
            const agents = await configManager.loadAgents();
            expect(Array.isArray(agents)).toBe(true);
        });
    });
});