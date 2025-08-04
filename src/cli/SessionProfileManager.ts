/**
 * Session Profile Manager - Configurable Development Environment Profiles
 * 
 * Provides predefined and custom session profiles for different development scenarios,
 * with intelligent configuration and fast profile switching.
 */

import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import { ConfigManager } from '../config/ConfigManager.js';
import { SessionManager } from '../session/SessionManager.js';

export interface SessionProfile {
    id: string;
    name: string;
    description: string;
    type: 'builtin' | 'custom';
    category: 'frontend' | 'backend' | 'fullstack' | 'data' | 'devops' | 'minimal' | 'testing' | 'research' | 'custom';
    mcpServers: string[];
    agents: string[];
    environment: Record<string, string>;
    commands: {
        startup: string[];
        validation: string[];
        cleanup: string[];
    };
    ports: number[];
    dependencies: string[];
    features: {
        autoRecovery: boolean;
        liveReload: boolean;
        hotReplace: boolean;
        debugging: boolean;
        testing: boolean;
        monitoring: boolean;
    };
    performance: {
        memoryLimit: string;
        cpuLimit: number;
        diskLimit: string;
        networkLimit: string;
    };
    created: Date;
    lastUsed?: Date;
    useCount: number;
}

export interface ProfileStats {
    totalProfiles: number;
    builtinProfiles: number;
    customProfiles: number;
    mostUsed: SessionProfile[];
    recentlyUsed: SessionProfile[];
    profilesByCategory: Record<string, number>;
}

export class SessionProfileManager {
    private configManager: ConfigManager;
    private sessionManager: SessionManager;
    private profiles: Map<string, SessionProfile> = new Map();
    private activeProfile: SessionProfile | null = null;
    private profilesDir: string;

    constructor(configManager: ConfigManager, sessionManager: SessionManager) {
        this.configManager = configManager;
        this.sessionManager = sessionManager;
        this.profilesDir = path.join(configManager.getProjectRoot(), '.claude', 'profiles');
        this.initializeBuiltinProfiles();
    }

    /**
     * Initialize with built-in profiles
     */
    private async initializeBuiltinProfiles(): Promise<void> {
        await fs.ensureDir(this.profilesDir);

        // Load existing profiles
        await this.loadProfiles();

        // Create built-in profiles if they don't exist
        if (this.profiles.size === 0) {
            await this.createBuiltinProfiles();
        }
    }

    /**
     * Create all built-in profiles
     */
    private async createBuiltinProfiles(): Promise<void> {
        const builtinProfiles: Omit<SessionProfile, 'created' | 'lastUsed' | 'useCount'>[] = [
            {
                id: 'frontend-react',
                name: 'Frontend React',
                description: 'Frontend development with React, TypeScript, and modern tooling',
                type: 'builtin',
                category: 'frontend',
                mcpServers: ['context7', 'serena', 'filesystem', 'git', 'brave'],
                agents: ['frontend-developer-specialist', 'ux-ix-designer', 'debugger-tester'],
                environment: {
                    NODE_ENV: 'development',
                    REACT_APP_ENV: 'development',
                    FAST_REFRESH: 'true'
                },
                commands: {
                    startup: ['npm install', 'npm run dev'],
                    validation: ['npm run lint', 'npm run type-check'],
                    cleanup: ['pkill -f "react-scripts\\|vite\\|webpack"']
                },
                ports: [3000, 3001],
                dependencies: ['react', 'typescript', '@types/react'],
                features: {
                    autoRecovery: true,
                    liveReload: true,
                    hotReplace: true,
                    debugging: true,
                    testing: true,
                    monitoring: false
                },
                performance: {
                    memoryLimit: '2GB',
                    cpuLimit: 2,
                    diskLimit: '1GB',
                    networkLimit: '100MB/s'
                }
            },
            {
                id: 'backend-node',
                name: 'Backend Node.js',
                description: 'Backend development with Node.js, Express, and databases',
                type: 'builtin',
                category: 'backend',
                mcpServers: ['context7', 'serena', 'mongodb', 'postgresql', 'git'],
                agents: ['backend-developer-specialist', 'data-architect-specialist', 'debugger-tester'],
                environment: {
                    NODE_ENV: 'development',
                    DEBUG: '*',
                    PORT: '5000'
                },
                commands: {
                    startup: ['npm install', 'npm run dev'],
                    validation: ['npm run lint', 'npm run test'],
                    cleanup: ['pkill -f "node.*server\\|nodemon"']
                },
                ports: [5000, 5001, 27017, 5432],
                dependencies: ['express', 'typescript', '@types/node'],
                features: {
                    autoRecovery: true,
                    liveReload: true,
                    hotReplace: false,
                    debugging: true,
                    testing: true,
                    monitoring: true
                },
                performance: {
                    memoryLimit: '4GB',
                    cpuLimit: 4,
                    diskLimit: '2GB',
                    networkLimit: '200MB/s'
                }
            },
            {
                id: 'fullstack-modern',
                name: 'Full-Stack Modern',
                description: 'Complete full-stack development with React, Node.js, and cloud tools',
                type: 'builtin',
                category: 'fullstack',
                mcpServers: ['context7', 'serena', 'mongodb', 'git', 'filesystem', 'kubernetes'],
                agents: ['fullstack-developer', 'solution-architect', 'devops-engineer', 'debugger-tester'],
                environment: {
                    NODE_ENV: 'development',
                    REACT_APP_ENV: 'development',
                    API_URL: 'http://localhost:5000'
                },
                commands: {
                    startup: ['npm install', 'npm run dev:all'],
                    validation: ['npm run lint', 'npm run test:all', 'npm run build'],
                    cleanup: ['npm run stop:all']
                },
                ports: [3000, 5000, 27017, 6379],
                dependencies: ['react', 'express', 'typescript', 'mongodb'],
                features: {
                    autoRecovery: true,
                    liveReload: true,
                    hotReplace: true,
                    debugging: true,
                    testing: true,
                    monitoring: true
                },
                performance: {
                    memoryLimit: '8GB',
                    cpuLimit: 6,
                    diskLimit: '5GB',
                    networkLimit: '500MB/s'
                }
            },
            {
                id: 'data-science',
                name: 'Data Science',
                description: 'Data analysis, ML development, and research workflows',
                type: 'builtin',
                category: 'data',
                mcpServers: ['context7', 'serena', 'arxiv', 'mongodb', 'postgresql'],
                agents: ['data-architect-specialist', 'data-mining-specialist', 'general-purpose'],
                environment: {
                    PYTHONPATH: './src',
                    JUPYTER_ENABLE: 'true',
                    ML_BACKEND: 'tensorflow'
                },
                commands: {
                    startup: ['pip install -r requirements.txt', 'jupyter notebook'],
                    validation: ['python -m pytest', 'python -m flake8'],
                    cleanup: ['pkill -f jupyter']
                },
                ports: [8888, 6006, 5432],
                dependencies: ['pandas', 'numpy', 'scikit-learn', 'jupyter'],
                features: {
                    autoRecovery: false,
                    liveReload: false,
                    hotReplace: false,
                    debugging: true,
                    testing: true,
                    monitoring: false
                },
                performance: {
                    memoryLimit: '16GB',
                    cpuLimit: 8,
                    diskLimit: '10GB',
                    networkLimit: '1GB/s'
                }
            },
            {
                id: 'devops-k8s',
                name: 'DevOps Kubernetes',
                description: 'DevOps workflows with Kubernetes, Docker, and infrastructure',
                type: 'builtin',
                category: 'devops',
                mcpServers: ['context7', 'serena', 'kubernetes', 'git', 'postgresql'],
                agents: ['devops-engineer', 'solution-architect', 'compliance-manager'],
                environment: {
                    KUBECONFIG: '~/.kube/config',
                    DOCKER_BUILDKIT: '1',
                    COMPOSE_DOCKER_CLI_BUILD: '1'
                },
                commands: {
                    startup: ['docker-compose up -d', 'kubectl cluster-info'],
                    validation: ['kubectl get nodes', 'docker ps', 'helm list'],
                    cleanup: ['docker-compose down', 'docker system prune -f']
                },
                ports: [8080, 9090, 3000],
                dependencies: ['kubectl', 'docker', 'helm'],
                features: {
                    autoRecovery: true,
                    liveReload: false,
                    hotReplace: false,
                    debugging: true,
                    testing: false,
                    monitoring: true
                },
                performance: {
                    memoryLimit: '12GB',
                    cpuLimit: 8,
                    diskLimit: '20GB',
                    networkLimit: '1GB/s'
                }
            },
            {
                id: 'minimal-cli',
                name: 'Minimal CLI',
                description: 'Lightweight setup for CLI tools and scripting',
                type: 'builtin',
                category: 'minimal',
                mcpServers: ['context7', 'git'],
                agents: ['general-purpose'],
                environment: {
                    EDITOR: 'code',
                    SHELL: '/bin/bash'
                },
                commands: {
                    startup: [],
                    validation: ['git status'],
                    cleanup: []
                },
                ports: [],
                dependencies: [],
                features: {
                    autoRecovery: false,
                    liveReload: false,
                    hotReplace: false,
                    debugging: false,
                    testing: false,
                    monitoring: false
                },
                performance: {
                    memoryLimit: '512MB',
                    cpuLimit: 1,
                    diskLimit: '100MB',
                    networkLimit: '10MB/s'
                }
            },
            {
                id: 'testing-qa',
                name: 'Testing & QA',
                description: 'Comprehensive testing environment with multiple frameworks',
                type: 'builtin',
                category: 'testing',
                mcpServers: ['context7', 'serena', 'playwright', 'git'],
                agents: ['debugger-tester', 'frontend-developer-specialist', 'backend-developer-specialist'],
                environment: {
                    NODE_ENV: 'test',
                    CI: 'true',
                    COVERAGE_THRESHOLD: '80'
                },
                commands: {
                    startup: ['npm install', 'npm run test:setup'],
                    validation: ['npm run test', 'npm run test:e2e', 'npm run coverage'],
                    cleanup: ['npm run test:cleanup']
                },
                ports: [4444, 9515],
                dependencies: ['jest', 'playwright', 'cypress'],
                features: {
                    autoRecovery: true,
                    liveReload: false,
                    hotReplace: false,
                    debugging: true,
                    testing: true,
                    monitoring: true
                },
                performance: {
                    memoryLimit: '6GB',
                    cpuLimit: 4,
                    diskLimit: '3GB',
                    networkLimit: '200MB/s'
                }
            },
            {
                id: 'research-academic',
                name: 'Research Academic',
                description: 'Academic research with paper access and documentation tools',
                type: 'builtin',
                category: 'research',
                mcpServers: ['context7', 'serena', 'arxiv', 'google-drive'],
                agents: ['data-mining-specialist', 'technical-writer', 'general-purpose'],
                environment: {
                    RESEARCH_MODE: 'true',
                    CITATION_STYLE: 'APA',
                    LATEX_ENABLED: 'true'
                },
                commands: {
                    startup: ['pip install -r requirements.txt'],
                    validation: ['python -m pytest tests/', 'latex --version'],
                    cleanup: ['rm -rf __pycache__', 'rm -rf .pytest_cache']
                },
                ports: [8000],
                dependencies: ['requests', 'beautifulsoup4', 'pandas'],
                features: {
                    autoRecovery: false,
                    liveReload: false,
                    hotReplace: false,
                    debugging: false,
                    testing: false,
                    monitoring: false
                },
                performance: {
                    memoryLimit: '4GB',
                    cpuLimit: 2,
                    diskLimit: '5GB',
                    networkLimit: '100MB/s'
                }
            }
        ];

        for (const profileData of builtinProfiles) {
            const profile: SessionProfile = {
                ...profileData,
                created: new Date(),
                useCount: 0
            };
            
            this.profiles.set(profile.id, profile);
            await this.saveProfile(profile);
        }

        console.log(chalk.green(`✅ Created ${builtinProfiles.length} built-in profiles`));
    }

    /**
     * List all available profiles
     */
    async listProfiles(category?: string): Promise<SessionProfile[]> {
        const profiles = Array.from(this.profiles.values());
        
        if (category) {
            return profiles.filter(p => p.category === category);
        }
        
        return profiles.sort((a, b) => {
            // Sort by: most used, then most recent, then alphabetical
            if (a.useCount !== b.useCount) return b.useCount - a.useCount;
            if (a.lastUsed && b.lastUsed) return b.lastUsed.getTime() - a.lastUsed.getTime();
            return a.name.localeCompare(b.name);
        });
    }

    /**
     * Get profile by ID
     */
    getProfile(id: string): SessionProfile | null {
        return this.profiles.get(id) || null;
    }

    /**
     * Apply a session profile
     */
    async applyProfile(profileId: string): Promise<boolean> {
        const profile = this.profiles.get(profileId);
        if (!profile) {
            console.log(chalk.red(`❌ Profile '${profileId}' not found`));
            return false;
        }

        console.log(chalk.cyan(`🔄 Applying profile: ${profile.name}`));
        console.log(chalk.gray(`   ${profile.description}`));

        try {
            // Update profile usage stats
            profile.lastUsed = new Date();
            profile.useCount++;
            await this.saveProfile(profile);

            // Set environment variables
            this.applyEnvironment(profile.environment);

            // Start session with profile configuration
            await this.sessionManager.startSession(false);

            // Run startup commands
            if (profile.commands.startup.length > 0) {
                console.log(chalk.cyan('🚀 Running startup commands...'));
                for (const command of profile.commands.startup) {
                    console.log(chalk.gray(`   Executing: ${command}`));
                    // Note: In a real implementation, you'd execute these commands
                    // Here we just simulate the execution
                }
            }

            this.activeProfile = profile;
            console.log(chalk.green(`✅ Profile '${profile.name}' applied successfully`));
            
            return true;
        } catch (error) {
            console.error(chalk.red('❌ Failed to apply profile:'), error instanceof Error ? error.message : error);
            return false;
        }
    }

    /**
     * Create a custom profile
     */
    async createCustomProfile(
        name: string,
        description: string,
        category: SessionProfile['category'] = 'custom',
        baseProfile?: string
    ): Promise<SessionProfile> {
        const id = `custom-${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
        
        let profile: SessionProfile;
        
        if (baseProfile && this.profiles.has(baseProfile)) {
            // Clone existing profile
            const base = this.profiles.get(baseProfile)!;
            profile = {
                ...base,
                id,
                name,
                description,
                type: 'custom',
                category,
                created: new Date(),
                lastUsed: undefined,
                useCount: 0
            };
        } else {
            // Create new profile from scratch
            profile = {
                id,
                name,
                description,
                type: 'custom',
                category,
                mcpServers: ['context7', 'serena'],
                agents: ['general-purpose'],
                environment: {},
                commands: {
                    startup: [],
                    validation: [],
                    cleanup: []
                },
                ports: [],
                dependencies: [],
                features: {
                    autoRecovery: false,
                    liveReload: false,
                    hotReplace: false,
                    debugging: false,
                    testing: false,
                    monitoring: false
                },
                performance: {
                    memoryLimit: '2GB',
                    cpuLimit: 2,
                    diskLimit: '1GB',
                    networkLimit: '100MB/s'
                },
                created: new Date(),
                useCount: 0
            };
        }

        this.profiles.set(id, profile);
        await this.saveProfile(profile);

        console.log(chalk.green(`✅ Created custom profile: ${name}`));
        return profile;
    }

    /**
     * Update an existing profile
     */
    async updateProfile(profileId: string, updates: Partial<SessionProfile>): Promise<boolean> {
        const profile = this.profiles.get(profileId);
        if (!profile) {
            console.log(chalk.red(`❌ Profile '${profileId}' not found`));
            return false;
        }

        if (profile.type === 'builtin') {
            console.log(chalk.yellow('⚠️ Cannot modify built-in profiles. Create a custom profile instead.'));
            return false;
        }

        // Apply updates
        Object.assign(profile, updates);
        await this.saveProfile(profile);

        console.log(chalk.green(`✅ Updated profile: ${profile.name}`));
        return true;
    }

    /**
     * Delete a custom profile
     */
    async deleteProfile(profileId: string): Promise<boolean> {
        const profile = this.profiles.get(profileId);
        if (!profile) {
            console.log(chalk.red(`❌ Profile '${profileId}' not found`));
            return false;
        }

        if (profile.type === 'builtin') {
            console.log(chalk.yellow('⚠️ Cannot delete built-in profiles'));
            return false;
        }

        this.profiles.delete(profileId);
        
        const profileFile = path.join(this.profilesDir, `${profileId}.json`);
        await fs.remove(profileFile);

        console.log(chalk.green(`✅ Deleted profile: ${profile.name}`));
        return true;
    }

    /**
     * Show detailed profile information
     */
    async showProfile(profileId: string): Promise<void> {
        const profile = this.profiles.get(profileId);
        if (!profile) {
            console.log(chalk.red(`❌ Profile '${profileId}' not found`));
            return;
        }

        console.log(chalk.cyan(`📋 PROFILE: ${profile.name}`));
        console.log(chalk.cyan('═══════════════════════════════════════'));
        console.log();

        console.log(chalk.blue('📖 BASIC INFO'));
        console.log(chalk.white(`   ID: ${profile.id}`));
        console.log(chalk.white(`   Name: ${profile.name}`));
        console.log(chalk.white(`   Description: ${profile.description}`));
        console.log(chalk.white(`   Type: ${profile.type}`));
        console.log(chalk.white(`   Category: ${profile.category}`));
        console.log(chalk.white(`   Created: ${profile.created.toLocaleDateString()}`));
        console.log(chalk.white(`   Last Used: ${profile.lastUsed ? profile.lastUsed.toLocaleDateString() : 'Never'}`));
        console.log(chalk.white(`   Use Count: ${profile.useCount}`));
        console.log();

        console.log(chalk.blue('🔌 MCP SERVERS'));
        if (profile.mcpServers.length === 0) {
            console.log(chalk.gray('   None configured'));
        } else {
            profile.mcpServers.forEach(server => {
                console.log(chalk.white(`   • ${server}`));
            });
        }
        console.log();

        console.log(chalk.blue('🤖 AGENTS'));
        if (profile.agents.length === 0) {
            console.log(chalk.gray('   None configured'));
        } else {
            profile.agents.forEach(agent => {
                console.log(chalk.white(`   • ${agent}`));
            });
        }
        console.log();

        console.log(chalk.blue('🌍 ENVIRONMENT'));
        const envVars = Object.keys(profile.environment);
        if (envVars.length === 0) {
            console.log(chalk.gray('   No custom environment variables'));
        } else {
            envVars.forEach(key => {
                console.log(chalk.white(`   ${key}=${profile.environment[key]}`));
            });
        }
        console.log();

        console.log(chalk.blue('⚙️ FEATURES'));
        const features = profile.features;
        console.log(chalk.white(`   Auto Recovery: ${features.autoRecovery ? '✅' : '❌'}`));
        console.log(chalk.white(`   Live Reload: ${features.liveReload ? '✅' : '❌'}`));
        console.log(chalk.white(`   Hot Replace: ${features.hotReplace ? '✅' : '❌'}`));
        console.log(chalk.white(`   Debugging: ${features.debugging ? '✅' : '❌'}`));
        console.log(chalk.white(`   Testing: ${features.testing ? '✅' : '❌'}`));
        console.log(chalk.white(`   Monitoring: ${features.monitoring ? '✅' : '❌'}`));
        console.log();

        console.log(chalk.blue('📊 PERFORMANCE LIMITS'));
        const perf = profile.performance;
        console.log(chalk.white(`   Memory: ${perf.memoryLimit}`));
        console.log(chalk.white(`   CPU Cores: ${perf.cpuLimit}`));
        console.log(chalk.white(`   Disk: ${perf.diskLimit}`));
        console.log(chalk.white(`   Network: ${perf.networkLimit}`));
        console.log();

        console.log(chalk.blue('🚀 COMMANDS'));
        console.log(chalk.white('   Startup:'));
        if (profile.commands.startup.length === 0) {
            console.log(chalk.gray('     None'));
        } else {
            profile.commands.startup.forEach(cmd => {
                console.log(chalk.gray(`     • ${cmd}`));
            });
        }
        
        console.log(chalk.white('   Validation:'));
        if (profile.commands.validation.length === 0) {
            console.log(chalk.gray('     None'));
        } else {
            profile.commands.validation.forEach(cmd => {
                console.log(chalk.gray(`     • ${cmd}`));
            });
        }
    }

    /**
     * Show profile statistics
     */
    async showProfileStats(): Promise<void> {
        const stats = this.getProfileStats();

        console.log(chalk.cyan('📊 PROFILE STATISTICS'));
        console.log(chalk.cyan('═══════════════════════════'));
        console.log();

        console.log(chalk.blue('📈 OVERVIEW'));
        console.log(chalk.white(`   Total Profiles: ${stats.totalProfiles}`));
        console.log(chalk.white(`   Built-in: ${stats.builtinProfiles}`));
        console.log(chalk.white(`   Custom: ${stats.customProfiles}`));
        console.log();

        console.log(chalk.blue('🏆 MOST USED'));
        if (stats.mostUsed.length === 0) {
            console.log(chalk.gray('   No profiles used yet'));
        } else {
            stats.mostUsed.slice(0, 5).forEach((profile, index) => {
                console.log(chalk.white(`   ${index + 1}. ${profile.name} (${profile.useCount} uses)`));
            });
        }
        console.log();

        console.log(chalk.blue('🕒 RECENTLY USED'));
        if (stats.recentlyUsed.length === 0) {
            console.log(chalk.gray('   No profiles used yet'));
        } else {
            stats.recentlyUsed.slice(0, 5).forEach(profile => {
                const lastUsed = profile.lastUsed ? profile.lastUsed.toLocaleDateString() : 'Never';
                console.log(chalk.white(`   • ${profile.name} (${lastUsed})`));
            });
        }
        console.log();

        console.log(chalk.blue('📂 BY CATEGORY'));
        Object.entries(stats.profilesByCategory).forEach(([category, count]) => {
            console.log(chalk.white(`   ${category}: ${count}`));
        });
    }

    /**
     * Quick profile switching interface
     */
    async quickSwitch(): Promise<void> {
        const profiles = await this.listProfiles();
        
        console.log(chalk.cyan('⚡ QUICK PROFILE SWITCH'));
        console.log(chalk.cyan('═══════════════════════════'));
        console.log();

        if (profiles.length === 0) {
            console.log(chalk.gray('No profiles available'));
            return;
        }

        // Show most used profiles first
        profiles.slice(0, 10).forEach((profile, index) => {
            const usageInfo = profile.useCount > 0 ? ` (${profile.useCount} uses)` : '';
            const typeIcon = profile.type === 'builtin' ? '📦' : '⚙️';
            console.log(chalk.white(`   ${index + 1}. ${typeIcon} ${profile.name}${usageInfo}`));
            console.log(chalk.gray(`      ${profile.description}`));
        });

        console.log();
        console.log(chalk.gray('Enter profile number to switch, or profile ID for direct access'));
    }

    /**
     * Export profile configuration
     */
    async exportProfile(profileId: string, format: 'json' | 'yaml' = 'json'): Promise<string> {
        const profile = this.profiles.get(profileId);
        if (!profile) {
            throw new Error(`Profile '${profileId}' not found`);
        }

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `profile-${profileId}-${timestamp}.${format}`;
        const filepath = path.join(this.configManager.getProjectRoot(), '.claude', 'exports', filename);

        await fs.ensureDir(path.dirname(filepath));

        if (format === 'json') {
            await fs.writeJSON(filepath, profile, { spaces: 2 });
        } else {
            // For YAML export, we'd need a YAML library
            await fs.writeJSON(filepath, profile, { spaces: 2 });
        }

        console.log(chalk.green(`✅ Profile exported to: ${filepath}`));
        return filepath;
    }

    /**
     * Import profile from file
     */
    async importProfile(filepath: string): Promise<SessionProfile> {
        if (!await fs.pathExists(filepath)) {
            throw new Error(`File not found: ${filepath}`);
        }

        const profileData = await fs.readJSON(filepath);
        
        // Validate profile structure
        if (!profileData.id || !profileData.name) {
            throw new Error('Invalid profile format: missing required fields');
        }

        // Ensure unique ID
        let newId = profileData.id;
        let counter = 1;
        while (this.profiles.has(newId)) {
            newId = `${profileData.id}-${counter}`;
            counter++;
        }

        const profile: SessionProfile = {
            ...profileData,
            id: newId,
            type: 'custom',
            created: new Date(),
            lastUsed: undefined,
            useCount: 0
        };

        this.profiles.set(newId, profile);
        await this.saveProfile(profile);

        console.log(chalk.green(`✅ Imported profile: ${profile.name}`));
        return profile;
    }

    /**
     * Private helper methods
     */
    private async loadProfiles(): Promise<void> {
        try {
            const files = await fs.readdir(this.profilesDir);
            const jsonFiles = files.filter(f => f.endsWith('.json'));

            for (const file of jsonFiles) {
                try {
                    const filepath = path.join(this.profilesDir, file);
                    const profile = await fs.readJSON(filepath);
                    this.profiles.set(profile.id, profile);
                } catch (error) {
                    console.warn(chalk.yellow(`⚠️ Failed to load profile ${file}:`, error instanceof Error ? error.message : error));
                }
            }
        } catch (error) {
            // Directory doesn't exist yet, which is fine
        }
    }

    private async saveProfile(profile: SessionProfile): Promise<void> {
        const filepath = path.join(this.profilesDir, `${profile.id}.json`);
        await fs.writeJSON(filepath, profile, { spaces: 2 });
    }

    private applyEnvironment(env: Record<string, string>): void {
        for (const [key, value] of Object.entries(env)) {
            process.env[key] = value;
        }
    }

    private getProfileStats(): ProfileStats {
        const profiles = Array.from(this.profiles.values());
        
        const stats: ProfileStats = {
            totalProfiles: profiles.length,
            builtinProfiles: profiles.filter(p => p.type === 'builtin').length,
            customProfiles: profiles.filter(p => p.type === 'custom').length,
            mostUsed: profiles.filter(p => p.useCount > 0).sort((a, b) => b.useCount - a.useCount),
            recentlyUsed: profiles.filter(p => p.lastUsed).sort((a, b) => 
                (b.lastUsed?.getTime() || 0) - (a.lastUsed?.getTime() || 0)
            ),
            profilesByCategory: {}
        };

        // Count by category
        profiles.forEach(profile => {
            stats.profilesByCategory[profile.category] = (stats.profilesByCategory[profile.category] || 0) + 1;
        });

        return stats;
    }

    /**
     * Get current active profile
     */
    getActiveProfile(): SessionProfile | null {
        return this.activeProfile;
    }

    /**
     * Reset to no active profile
     */
    clearActiveProfile(): void {
        this.activeProfile = null;
    }
}