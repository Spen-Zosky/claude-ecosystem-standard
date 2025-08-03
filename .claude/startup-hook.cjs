#!/usr/bin/env node

/**
 * Claude Code CLI Startup Hook - Universal Multi-Language Version
 * Automatically detects and validates any programming language project structure
 * 
 * Features:
 * - Dynamic path detection using process.cwd()
 * - Multi-language detection (TypeScript, JavaScript, Python, Java, Rust, Go, C#/.NET)
 * - Framework and tool detection across all languages
 * - Adaptive health checks based on detected languages
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Dynamic project detection
const PROJECT_ROOT = process.cwd();
const PROJECT_NAME = path.basename(PROJECT_ROOT);

// Language detection patterns
const LANGUAGE_PATTERNS = {
    typescript: {
        files: ['tsconfig.json', 'tsconfig.build.json'],
        extensions: ['.ts', '.tsx'],
        emoji: '🟦',
        name: 'TypeScript'
    },
    javascript: {
        files: ['package.json', 'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml'],
        extensions: ['.js', '.jsx', '.mjs', '.cjs'],
        emoji: '🟨',
        name: 'JavaScript'
    },
    python: {
        files: ['requirements.txt', 'pyproject.toml', 'setup.py', 'Pipfile', 'poetry.lock'],
        extensions: ['.py', '.pyx', '.pyi'],
        emoji: '🐍',
        name: 'Python'
    },
    java: {
        files: ['pom.xml', 'build.gradle', 'build.gradle.kts', 'gradlew'],
        extensions: ['.java', '.scala', '.kt'],
        emoji: '☕',
        name: 'Java'
    },
    rust: {
        files: ['Cargo.toml', 'Cargo.lock'],
        extensions: ['.rs'],
        emoji: '🦀',
        name: 'Rust'
    },
    go: {
        files: ['go.mod', 'go.sum', 'go.work'],
        extensions: ['.go'],
        emoji: '🐹',
        name: 'Go'
    },
    csharp: {
        files: ['.csproj', '.sln', '.vbproj', '.fsproj', 'global.json'],
        extensions: ['.cs', '.vb', '.fs'],
        emoji: '🔵',
        name: 'C#/.NET'
    }
};

// Logging with timestamps
function log(message) {
    const timestamp = new Date().toISOString();
    console.log(`${timestamp} [CLAUDE-HOOK] ${message}`);
    
    // Also log to file for debugging
    const logFile = path.join(PROJECT_ROOT, '.claude', 'hook.log');
    try {
        fs.appendFileSync(logFile, `${timestamp} [CLAUDE-HOOK] ${message}\n`);
    } catch (error) {
        // Silent fail for logging
    }
}

function detectLanguages() {
    const detectedLanguages = new Set();
    const allFiles = fs.readdirSync(PROJECT_ROOT);
    
    // Check for language-specific files
    for (const [lang, config] of Object.entries(LANGUAGE_PATTERNS)) {
        for (const file of config.files) {
            if (allFiles.some(f => f.includes(file) || f.endsWith(file))) {
                detectedLanguages.add(lang);
                log(`✅ ${config.emoji} ${config.name} detected (${file} found)`);
            }
        }
    }
    
    // Check for source files by extension
    for (const [lang, config] of Object.entries(LANGUAGE_PATTERNS)) {
        for (const ext of config.extensions) {
            if (allFiles.some(f => f.endsWith(ext))) {
                if (!detectedLanguages.has(lang)) {
                    detectedLanguages.add(lang);
                    log(`✅ ${config.emoji} ${config.name} detected (${ext} files found)`);
                }
            }
        }
    }
    
    return Array.from(detectedLanguages);
}

function checkCommand(command, successMessage, errorMessage) {
    try {
        const output = execSync(`${command} 2>&1`, { encoding: 'utf8' }).trim();
        log(`✅ ${successMessage}: ${output.split('\n')[0]}`);
        return true;
    } catch (error) {
        if (errorMessage) {
            log(`⚠️ ${errorMessage}`);
        }
        return false;
    }
}

function performLanguageSpecificChecks(languages) {
    const results = {};
    
    for (const lang of languages) {
        results[lang] = {};
        
        switch (lang) {
            case 'typescript':
                results[lang].compiler = checkCommand('tsc --version', 'TypeScript compiler', null);
                break;
                
            case 'javascript':
                results[lang].node = checkCommand('node --version', 'Node.js', null);
                results[lang].npm = checkCommand('npm --version', 'npm', null);
                break;
                
            case 'python':
                results[lang].python = checkCommand('python --version || python3 --version', 'Python', null);
                results[lang].pip = checkCommand('pip --version || pip3 --version', 'pip', null);
                break;
                
            case 'java':
                results[lang].java = checkCommand('java -version', 'Java Runtime', null);
                results[lang].javac = checkCommand('javac -version', 'Java Compiler', null);
                results[lang].maven = checkCommand('mvn --version', 'Maven', null);
                results[lang].gradle = checkCommand('gradle --version', 'Gradle', null);
                break;
                
            case 'rust':
                results[lang].rustc = checkCommand('rustc --version', 'Rust compiler', null);
                results[lang].cargo = checkCommand('cargo --version', 'Cargo', null);
                break;
                
            case 'go':
                results[lang].go = checkCommand('go version', 'Go', null);
                break;
                
            case 'csharp':
                results[lang].dotnet = checkCommand('dotnet --version', '.NET SDK', null);
                break;
        }
    }
    
    return results;
}

function detectFrameworks(languages) {
    const frameworks = [];
    
    try {
        // Read package.json for JS/TS frameworks
        if ((languages.includes('javascript') || languages.includes('typescript')) && 
            fs.existsSync(path.join(PROJECT_ROOT, 'package.json'))) {
            const packageJson = JSON.parse(fs.readFileSync(path.join(PROJECT_ROOT, 'package.json'), 'utf8'));
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
                'solid-js': 'SolidJS'
            };
            
            for (const [dep, name] of Object.entries(jsFrameworks)) {
                if (Object.keys(deps).some(d => d.includes(dep))) {
                    frameworks.push(name);
                }
            }
        }
        
        // Check for Python frameworks
        if (languages.includes('python')) {
            const reqFiles = ['requirements.txt', 'pyproject.toml'];
            for (const reqFile of reqFiles) {
                if (fs.existsSync(path.join(PROJECT_ROOT, reqFile))) {
                    const content = fs.readFileSync(path.join(PROJECT_ROOT, reqFile), 'utf8');
                    const pythonFrameworks = {
                        'django': 'Django',
                        'flask': 'Flask',
                        'fastapi': 'FastAPI',
                        'tornado': 'Tornado',
                        'pyramid': 'Pyramid'
                    };
                    
                    for (const [dep, name] of Object.entries(pythonFrameworks)) {
                        if (content.toLowerCase().includes(dep)) {
                            frameworks.push(name);
                        }
                    }
                }
            }
        }
        
        // Check for Spring Boot (Java)
        if (languages.includes('java') && fs.existsSync(path.join(PROJECT_ROOT, 'pom.xml'))) {
            const pomContent = fs.readFileSync(path.join(PROJECT_ROOT, 'pom.xml'), 'utf8');
            if (pomContent.includes('spring-boot')) {
                frameworks.push('Spring Boot');
            }
        }
        
    } catch (error) {
        // Silent fail for framework detection
    }
    
    return frameworks;
}

function checkCommonDirectories() {
    const commonDirs = [
        'src', 'lib', 'app', 'server', 'client', 'api', 'web',
        'tests', 'test', '__tests__', 'spec',
        'docs', 'documentation',
        'scripts', 'bin', 'build', 'dist',
        'config', 'configs', 'settings'
    ];
    
    const foundDirs = [];
    for (const dir of commonDirs) {
        if (fs.existsSync(path.join(PROJECT_ROOT, dir))) {
            foundDirs.push(dir);
        }
    }
    
    return foundDirs;
}

function checkDevelopmentTools() {
    const tools = [];
    
    // Check for common development tools
    const toolFiles = {
        '.gitignore': 'Git',
        'Dockerfile': 'Docker',
        'docker-compose.yml': 'Docker Compose',
        'docker-compose.yaml': 'Docker Compose',
        'Makefile': 'Make',
        '.editorconfig': 'EditorConfig',
        '.prettierrc': 'Prettier',
        '.eslintrc.js': 'ESLint',
        '.eslintrc.json': 'ESLint',
        'jest.config.js': 'Jest',
        'webpack.config.js': 'Webpack',
        'vite.config.js': 'Vite',
        'rollup.config.js': 'Rollup'
    };
    
    for (const [file, tool] of Object.entries(toolFiles)) {
        if (fs.existsSync(path.join(PROJECT_ROOT, file))) {
            tools.push(tool);
        }
    }
    
    // Check for CI/CD
    const ciDirs = ['.gitlab-ci.yml', 'azure-pipelines.yml'];
    for (const ci of ciDirs) {
        if (fs.existsSync(path.join(PROJECT_ROOT, ci))) {
            tools.push('CI/CD');
            break;
        }
    }
    
    return tools;
}

function main() {
    try {
        log('🚀 Claude Code CLI startup hook started');
        log(`✅ Project verified: ${PROJECT_NAME}`);
        log(`📁 Working directory: ${PROJECT_ROOT}`);
        
        // Universal health checks
        const healthChecks = {
            languages: [],
            tools: [],
            sourceDir: false,
            mcpConfig: false,
            gitRepo: false,
            agents: 0
        };
        
        // Detect programming languages
        const detectedLanguages = detectLanguages();
        healthChecks.languages = detectedLanguages;
        
        if (detectedLanguages.length === 0) {
            log('⚠️ No specific programming language detected');
            log('💡 This appears to be a generic project');
        } else {
            log(`✅ Detected ${detectedLanguages.length} programming language(s)`);
        }
        
        // Perform language-specific checks
        if (detectedLanguages.length > 0) {
            log('📋 Checking development environment...');
            performLanguageSpecificChecks(detectedLanguages);
        }
        
        // Detect frameworks
        const frameworks = detectFrameworks(detectedLanguages);
        if (frameworks.length > 0) {
            log(`✅ Frameworks detected: ${frameworks.join(', ')}`);
        }
        
        // Check common directories
        const directories = checkCommonDirectories();
        if (directories.length > 0) {
            log(`✅ Source directories found: ${directories.join(', ')}`);
            healthChecks.sourceDir = true;
        }
        
        // Check development tools
        const tools = checkDevelopmentTools();
        if (tools.length > 0) {
            log(`✅ Development tools: ${tools.join(', ')}`);
            healthChecks.tools = tools;
        }
        
        // Check for Git repository
        if (fs.existsSync(path.join(PROJECT_ROOT, '.git'))) {
            log('✅ Git repository detected');
            healthChecks.gitRepo = true;
        }
        
        // Check for Claude Code CLI configuration
        const mcpConfigPath = path.join(PROJECT_ROOT, '.claude', 'claude_desktop_config.json');
        if (fs.existsSync(mcpConfigPath)) {
            log('✅ MCP config found');
            healthChecks.mcpConfig = true;
        }
        
        // Check for Claude Code CLI agents
        const agentsPath = path.join(PROJECT_ROOT, '.claude', 'agents');
        if (fs.existsSync(agentsPath)) {
            const agentFiles = fs.readdirSync(agentsPath).filter(file => file.endsWith('.md'));
            if (agentFiles.length > 0) {
                log(`✅ Found ${agentFiles.length} specialized agents:`);
                
                // Group agents by category for better display
                const agentCategories = {
                    'Core Development': ['solution-architect', 'fullstack-developer', 'backend-developer-specialist', 'frontend-developer-specialist'],
                    'Infrastructure': ['devops-engineer', 'data-architect-specialist'],
                    'Quality & Compliance': ['debugger-tester', 'compliance-manager'],
                    'Specialized': ['data-mining-specialist', 'ux-ix-designer', 'technical-writer'],
                    'General': ['general-purpose']
                };
                
                const availableAgents = agentFiles.map(f => f.replace('.md', ''));
                
                for (const [category, agents] of Object.entries(agentCategories)) {
                    const categoryAgents = agents.filter(agent => availableAgents.includes(agent));
                    if (categoryAgents.length > 0) {
                        log(`   📋 ${category}: ${categoryAgents.length} agents`);
                        categoryAgents.forEach(agent => {
                            log(`      🤖 ${agent}`);
                        });
                    }
                }
                
                healthChecks.agents = agentFiles.length;
            }
        }
        
        // Environment files check
        const envFiles = ['.env', '.env.local', '.env.development', '.env.production'];
        const foundEnvFiles = envFiles.filter(file => fs.existsSync(path.join(PROJECT_ROOT, file)));
        if (foundEnvFiles.length > 0) {
            log(`✅ Environment files: ${foundEnvFiles.join(', ')}`);
        }
        
        // Overall health check
        const hasLanguages = detectedLanguages.length > 0;
        const hasMcp = healthChecks.mcpConfig;
        const hasAgents = healthChecks.agents > 0;
        
        if (hasLanguages && hasMcp && hasAgents) {
            log('✅ Project health check passed - Full Claude Code CLI ecosystem ready');
        } else if (hasMcp && hasAgents) {
            log('✅ Project health check passed - Claude Code CLI ecosystem ready');
            if (!hasLanguages) log('   Info: No specific programming language detected (generic project)');
        } else {
            log('⚠️ Project health check: Some components missing');
            if (!hasLanguages) log('   Info: No specific programming language detected');
            if (!hasMcp) log('   Missing: Claude MCP configuration');
            if (!hasAgents) log('   Missing: Claude specialized agents');
        }
        
        // Generate language-specific emoji summary
        const languageEmojis = detectedLanguages.map(lang => 
            LANGUAGE_PATTERNS[lang]?.emoji || '📄'
        ).join(' ');
        
        // Project summary
        log(`📁 Working in: ${PROJECT_NAME}`);
        log('🔧 MCP servers configured locally');
        if (hasAgents) {
            log(`🤖 ${healthChecks.agents} specialized agents available`);
        }
        if (languageEmojis) {
            log(`${languageEmojis} Multi-language environment ready`);
        } else {
            log('📄 Generic project environment ready');
        }
        log('✨ Startup hook completed successfully');
        
        // ⚡ INTEGRAZIONE CES: Avvio automatico SessionManager
        if (fs.existsSync(path.join(PROJECT_ROOT, 'package.json')) && 
            fs.existsSync(path.join(PROJECT_ROOT, 'src', 'session', 'SessionManager.ts'))) {
            try {
                log('🔄 Avvio CES SessionManager...');
                execSync('npm run dev -- start-session', { 
                    stdio: 'inherit', 
                    cwd: PROJECT_ROOT,
                    timeout: 30000 
                });
                log('✅ CES SessionManager attivato automaticamente');
                
                // Avvio automatico Session Monitor per coordinamento **register session
                try {
                    log('🔍 Avvio Session Monitor...');
                    execSync('npm run dev -- monitor --start', { 
                        stdio: 'ignore', 
                        cwd: PROJECT_ROOT,
                        timeout: 10000 
                    });
                    log('✅ Session Monitor attivato per coordinamento **register session');
                } catch (error) {
                    log('⚠️ Session Monitor non disponibile (opzionale)');
                }
                
            } catch (error) {
                log(`⚠️ CES SessionManager non disponibile: ${error.message}`);
                log('💡 Puoi avviarlo manualmente con: npm run dev -- start-session');
            }
        }
        
    } catch (error) {
        log(`❌ Error in startup hook: ${error.message}`);
        process.exit(1);
    }
}

// Execute the main function
main();