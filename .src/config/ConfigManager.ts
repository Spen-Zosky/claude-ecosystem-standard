/**
 * Configuration Manager for Claude Ecosystem Standard (CES)
 * Handles environment detection, project configuration, and MCP/Agent setup
 */

import fs from 'fs-extra';
import path from 'path';
import { 
    EnvironmentConfig, 
    MCPServerConfig, 
    AgentConfig, 
    DetectedLanguage, 
    ProjectHealth,
    HealthCheck,
    ConfigError,
    LANGUAGE_PATTERNS
} from '../types/index.js';

export class ConfigManager {
    private projectRoot: string;
    private projectName: string;
    private config: EnvironmentConfig | null = null;

    constructor(projectRoot?: string) {
        this.projectRoot = projectRoot || process.cwd();
        this.projectName = path.basename(this.projectRoot);
    }

    /**
     * Initialize configuration by detecting environment
     */
    async initialize(): Promise<EnvironmentConfig> {
        try {
            const languages = await this.detectLanguages();
            const frameworks = await this.detectFrameworks(languages);
            const tools = await this.detectTools();
            const hasGit = await this.checkGitRepository();
            const hasMCP = await this.checkMCPConfig();
            const hasAgents = await this.checkAgents();

            this.config = {
                projectRoot: this.projectRoot,
                projectName: this.projectName,
                languages,
                frameworks,
                tools,
                hasGit,
                hasMCP,
                hasAgents
            };

            return this.config;
        } catch (error) {
            throw new ConfigError(`Failed to initialize configuration: ${(error as Error).message}`, { projectRoot: this.projectRoot });
        }
    }

    /**
     * Get current configuration
     */
    getConfig(): EnvironmentConfig {
        if (!this.config) {
            throw new ConfigError('Configuration not initialized. Call initialize() first.');
        }
        return this.config;
    }

    /**
     * Detect programming languages in the project
     */
    private async detectLanguages(): Promise<DetectedLanguage[]> {
        const detected: DetectedLanguage[] = [];
        
        try {
            const files = await fs.readdir(this.projectRoot);
            
            for (const [, langConfig] of Object.entries(LANGUAGE_PATTERNS)) {
                let confidence = 0;
                const foundFiles: string[] = [];
                
                // Check for language-specific files
                for (const file of langConfig.files) {
                    if (files.some(f => f.includes(file) || f.endsWith(file))) {
                        foundFiles.push(file);
                        confidence += 30;
                    }
                }
                
                // Check for source files by extension
                for (const ext of langConfig.extensions) {
                    const extFiles = files.filter(f => f.endsWith(ext));
                    if (extFiles.length > 0) {
                        foundFiles.push(...extFiles.slice(0, 3)); // Limit to first 3 files
                        confidence += Math.min(extFiles.length * 10, 50);
                    }
                }
                
                if (confidence > 0) {
                    detected.push({
                        name: langConfig.name,
                        emoji: langConfig.emoji,
                        files: foundFiles,
                        extensions: [...langConfig.extensions],
                        confidence: Math.min(confidence, 100)
                    });
                }
            }
            
            // Sort by confidence
            return detected.sort((a, b) => b.confidence - a.confidence);
        } catch (error) {
            console.warn(`Warning: Could not detect languages: ${(error as Error).message}`);
            return [];
        }
    }

    /**
     * Detect frameworks based on detected languages
     */
    private async detectFrameworks(languages: DetectedLanguage[]): Promise<string[]> {
        const frameworks: Set<string> = new Set();
        
        try {
            // JavaScript/TypeScript frameworks
            if (languages.some(l => ['JavaScript', 'TypeScript'].includes(l.name))) {
                const packageJsonPath = path.join(this.projectRoot, 'package.json');
                if (await fs.pathExists(packageJsonPath)) {
                    const packageJson = await fs.readJson(packageJsonPath);
                    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
                    
                    const jsFrameworks = {
                        'react': 'React',
                        'vue': 'Vue.js',
                        'angular': 'Angular',
                        'next': 'Next.js',
                        'nuxt': 'Nuxt.js',
                        'express': 'Express.js',
                        'fastify': 'Fastify',
                        'nest': 'NestJS',
                        'svelte': 'Svelte',
                        'solid-js': 'SolidJS',
                        'remix': 'Remix'
                    };
                    
                    for (const [dep, name] of Object.entries(jsFrameworks)) {
                        if (Object.keys(deps).some(d => d.includes(dep))) {
                            frameworks.add(name);
                        }
                    }
                }
            }
            
            // Python frameworks
            if (languages.some(l => l.name === 'Python')) {
                const reqFiles = ['requirements.txt', 'pyproject.toml', 'Pipfile'];
                for (const reqFile of reqFiles) {
                    const reqPath = path.join(this.projectRoot, reqFile);
                    if (await fs.pathExists(reqPath)) {
                        const content = await fs.readFile(reqPath, 'utf8');
                        const pythonFrameworks = {
                            'django': 'Django',
                            'flask': 'Flask',
                            'fastapi': 'FastAPI',
                            'tornado': 'Tornado',
                            'pyramid': 'Pyramid',
                            'starlette': 'Starlette'
                        };
                        
                        for (const [dep, name] of Object.entries(pythonFrameworks)) {
                            if (content.toLowerCase().includes(dep)) {
                                frameworks.add(name);
                            }
                        }
                    }
                }
            }
            
            // Java frameworks
            if (languages.some(l => l.name === 'Java')) {
                const pomPath = path.join(this.projectRoot, 'pom.xml');
                if (await fs.pathExists(pomPath)) {
                    const pomContent = await fs.readFile(pomPath, 'utf8');
                    if (pomContent.includes('spring-boot')) {
                        frameworks.add('Spring Boot');
                    }
                    if (pomContent.includes('springframework')) {
                        frameworks.add('Spring Framework');
                    }
                }
            }
            
        } catch (error) {
            console.warn(`Warning: Could not detect frameworks: ${(error as Error).message}`);
        }
        
        return Array.from(frameworks);
    }

    /**
     * Detect development tools
     */
    private async detectTools(): Promise<string[]> {
        const tools: Set<string> = new Set();
        
        try {
            const toolFiles = {
                '.gitignore': 'Git',
                'Dockerfile': 'Docker',
                'docker-compose.yml': 'Docker Compose',
                'docker-compose.yaml': 'Docker Compose',
                'Makefile': 'Make',
                '.editorconfig': 'EditorConfig',
                '.prettierrc': 'Prettier',
                '.prettierrc.json': 'Prettier',
                '.eslintrc.js': 'ESLint',
                '.eslintrc.json': 'ESLint',
                'jest.config.js': 'Jest',
                'jest.config.ts': 'Jest',
                'webpack.config.js': 'Webpack',
                'vite.config.js': 'Vite',
                'vite.config.ts': 'Vite',
                'rollup.config.js': 'Rollup'
            };
            
            for (const [file, tool] of Object.entries(toolFiles)) {
                if (await fs.pathExists(path.join(this.projectRoot, file))) {
                    tools.add(tool);
                }
            }
            
            // Check for CI/CD
            const ciPaths = [
                '.gitlab-ci.yml',
                'azure-pipelines.yml',
                '.circleci/config.yml'
            ];
            
            for (const ciPath of ciPaths) {
                if (await fs.pathExists(path.join(this.projectRoot, ciPath))) {
                    tools.add('CI/CD');
                    break;
                }
            }
            
        } catch (error) {
            console.warn(`Warning: Could not detect tools: ${(error as Error).message}`);
        }
        
        return Array.from(tools);
    }

    /**
     * Check if project is a Git repository
     */
    private async checkGitRepository(): Promise<boolean> {
        try {
            return await fs.pathExists(path.join(this.projectRoot, '.git'));
        } catch {
            return false;
        }
    }

    /**
     * Check for MCP configuration
     */
    private async checkMCPConfig(): Promise<boolean> {
        try {
            const mcpPath = path.join(this.projectRoot, '.claude', 'claude_desktop_config.json');
            return await fs.pathExists(mcpPath);
        } catch {
            return false;
        }
    }

    /**
     * Check for agents
     */
    private async checkAgents(): Promise<boolean> {
        try {
            const agentsPath = path.join(this.projectRoot, '.claude', 'agents');
            if (await fs.pathExists(agentsPath)) {
                const files = await fs.readdir(agentsPath);
                return files.filter(f => f.endsWith('.md')).length > 0;
            }
            return false;
        } catch {
            return false;
        }
    }

    /**
     * Load MCP server configurations
     */
    async loadMCPServers(): Promise<MCPServerConfig[]> {
        try {
            const mcpPath = path.join(this.projectRoot, '.claude', 'claude_desktop_config.json');
            
            if (!await fs.pathExists(mcpPath)) {
                throw new ConfigError('MCP configuration file not found');
            }
            
            const mcpConfig = await fs.readJson(mcpPath);
            const servers: MCPServerConfig[] = [];
            
            if (mcpConfig.mcpServers) {
                for (const [name, config] of Object.entries(mcpConfig.mcpServers)) {
                    const priority = this.getMCPServerPriority(name);
                    servers.push({
                        name,
                        enabled: true,
                        priority,
                        config: config as any,
                        status: 'disconnected'
                    });
                }
            }
            
            return servers.sort((a, b) => this.priorityOrder(a.priority) - this.priorityOrder(b.priority));
        } catch (error) {
            throw new ConfigError(`Failed to load MCP servers: ${(error as Error).message}`);
        }
    }

    /**
     * Load agent configurations
     */
    async loadAgents(): Promise<AgentConfig[]> {
        try {
            const agentsPath = path.join(this.projectRoot, '.claude', 'agents');
            
            if (!await fs.pathExists(agentsPath)) {
                return [];
            }
            
            const files = await fs.readdir(agentsPath);
            const agentFiles = files.filter(f => f.endsWith('.md'));
            const agents: AgentConfig[] = [];
            
            for (const file of agentFiles) {
                try {
                    const filePath = path.join(agentsPath, file);
                    const content = await fs.readFile(filePath, 'utf8');
                    const agent = this.parseAgentFile(content, filePath);
                    if (agent) {
                        agents.push(agent);
                    }
                } catch (error) {
                    console.warn(`Warning: Could not parse agent file ${file}: ${(error as Error).message}`);
                }
            }
            
            return agents;
        } catch (error) {
            throw new ConfigError(`Failed to load agents: ${(error as Error).message}`);
        }
    }

    /**
     * Parse agent markdown file
     */
    private parseAgentFile(content: string, filePath: string): AgentConfig | null {
        try {
            const frontMatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
            if (!frontMatterMatch || !frontMatterMatch[1]) {
                return null;
            }
            
            const frontMatter = frontMatterMatch[1];
            const lines = frontMatter.split('\n');
            const metadata: any = {};
            
            for (const line of lines) {
                const match = line.match(/^(\w+):\s*(.*)$/);
                if (match) {
                    const [, key, value] = match;
                    if (key && value !== undefined) {
                        if (key === 'tools') {
                            metadata[key] = value.split(',').map(t => t.trim());
                        } else {
                            metadata[key] = value.replace(/^["']|["']$/g, '');
                        }
                    }
                }
            }
            
            return {
                name: metadata.name || path.basename(filePath, '.md'),
                description: metadata.description || '',
                tools: metadata.tools || [],
                priority: metadata.priority || 'medium',
                color: metadata.color,
                filePath,
                enabled: true
            };
        } catch {
            return null;
        }
    }

    /**
     * Perform health check
     */
    async performHealthCheck(): Promise<ProjectHealth> {
        const config = await this.initialize();
        
        const languagesCheck: HealthCheck = {
            status: config.languages.length > 0 ? 'pass' : 'warning',
            message: config.languages.length > 0 
                ? `${config.languages.length} programming languages detected`
                : 'No specific programming languages detected',
            details: config.languages
        };
        
        const mcpCheck: HealthCheck = {
            status: config.hasMCP ? 'pass' : 'fail',
            message: config.hasMCP ? 'MCP configuration found' : 'MCP configuration missing',
        };
        
        const agentsCheck: HealthCheck = {
            status: config.hasAgents ? 'pass' : 'warning',
            message: config.hasAgents ? 'Specialized agents available' : 'No specialized agents found',
        };
        
        const gitCheck: HealthCheck = {
            status: config.hasGit ? 'pass' : 'warning',
            message: config.hasGit ? 'Git repository detected' : 'Not a Git repository',
        };
        
        const envCheck: HealthCheck = {
            status: 'pass',
            message: `Project environment: ${config.projectName}`,
            details: {
                frameworks: config.frameworks,
                tools: config.tools
            }
        };
        
        const overall = mcpCheck.status === 'fail' ? 'error' : 
                        (languagesCheck.status === 'warning' || agentsCheck.status === 'warning') ? 'warning' : 'healthy';
        
        return {
            overall,
            languages: languagesCheck,
            mcp: mcpCheck,
            agents: agentsCheck,
            git: gitCheck,
            environment: envCheck,
            issues: []
        };
    }

    /**
     * Get MCP server priority
     */
    private getMCPServerPriority(serverName: string): 'critical' | 'high' | 'medium' | 'low' {
        const priorities = {
            'context7': 'critical',
            'serena': 'critical',
            'arxiv': 'high',
            'mongodb': 'high',
            'git': 'high',
            'postgresql': 'medium',
            'playwright': 'medium',
            'filesystem': 'high',
            'sqlite': 'high',
            'kubernetes': 'medium',
            'brave': 'low',
            'youtube': 'low',
            'google-drive': 'low',
            'bigquery': 'low'
        } as const;
        
        return priorities[serverName as keyof typeof priorities] || 'medium';
    }

    /**
     * Get priority order for sorting
     */
    private priorityOrder(priority: string): number {
        const order = { 'critical': 1, 'high': 2, 'medium': 3, 'low': 4 };
        return order[priority as keyof typeof order] || 3;
    }

    /**
     * Reset configuration to defaults
     */
    async resetToDefaults(): Promise<void> {
        this.config = null;
        await this.initialize();
    }

    /**
     * Get project root directory
     */
    getProjectRoot(): string {
        return this.projectRoot;
    }

    /**
     * Get project name
     */
    getProjectName(): string {
        return this.projectName;
    }

    /**
     * Check if a file exists
     */
    async fileExists(relativePath: string): Promise<boolean> {
        const fullPath = path.join(this.projectRoot, relativePath);
        try {
            await fs.access(fullPath);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Check if a script exists in package.json
     */
    hasScript(scriptName: string): boolean {
        const packageJsonPath = path.join(this.projectRoot, 'package.json');
        try {
            if (fs.existsSync(packageJsonPath)) {
                const packageJson = fs.readJsonSync(packageJsonPath);
                return !!(packageJson.scripts && packageJson.scripts[scriptName]);
            }
        } catch {
            // Silent fail
        }
        return false;
    }
}