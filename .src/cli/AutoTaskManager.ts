/**
 * AutoTaskManager - Intelligent Multi-Agent Task Dispatcher
 * 
 * Automatically analyzes user prompts and coordinates multiple agents
 * for optimal parallel/sequential execution without manual agent selection.
 */

import chalk from 'chalk';
import { ConfigManager } from '../config/ConfigManager.js';

export interface TaskAnalysis {
    taskType: TaskType;
    complexity: 'simple' | 'medium' | 'complex';
    domain: TaskDomain[];
    keywords: string[];
    confidence: number;
}

export interface AgentConfig {
    name: string;
    role: 'primary' | 'secondary' | 'support';
    priority: number;
    dependencies?: string[];
}

export interface ExecutionStrategy {
    mode: 'sequential' | 'parallel' | 'hybrid';
    phases: ExecutionPhase[];
    coordination: CoordinationStrategy;
    estimatedDuration: string;
}

export interface ExecutionPhase {
    name: string;
    agents: AgentConfig[];
    mode: 'parallel' | 'sequential';
    description: string;
    deliverables: string[];
}

export interface CoordinationStrategy {
    coordinator?: string;
    syncPoints: string[];
    outputFormat: 'unified' | 'separate' | 'summary';
}

export type TaskType = 
    | 'feature-development'
    | 'system-design'
    | 'performance-optimization'
    | 'database-design'
    | 'api-development'
    | 'ui-development'
    | 'testing-qa'
    | 'documentation'
    | 'research-analysis'
    | 'compliance-audit'
    | 'deployment-devops'
    | 'bug-investigation';

export type TaskDomain = 
    | 'architecture'
    | 'backend'
    | 'frontend'
    | 'database'
    | 'devops'
    | 'testing'
    | 'design'
    | 'documentation'
    | 'compliance'
    | 'research';

export class AutoTaskManager {
    // private _configManager: ConfigManager; // Removed unused field
    private taskPatterns: Map<TaskType, TaskPattern>;

    constructor(_configManager: ConfigManager) {
        // this._configManager = configManager; // Removed unused field
        this.taskPatterns = this.initializeTaskPatterns();
    }

    /**
     * Main entry point for automatic task dispatch
     */
    async executeAutoTask(prompt: string): Promise<void> {
        console.log(chalk.cyan('🤖 AutoTask: Analyzing your request...'));
        console.log(chalk.gray(`Input: "${prompt}"`));
        console.log();

        try {
            // 1. Analyze the prompt
            const analysis = this.analyzePrompt(prompt);
            this.displayAnalysis(analysis);

            // 2. Select execution strategy
            const strategy = this.selectExecutionStrategy(analysis);
            this.displayStrategy(strategy);

            // 3. Generate coordinated prompt for agents
            const coordinatedPrompt = this.generateCoordinatedPrompt(prompt, analysis, strategy);
            this.displayCoordinatedPrompt(coordinatedPrompt);

            console.log(chalk.green('✅ AutoTask analysis complete. Use the generated prompt above with Claude Code CLI.'));

        } catch (error) {
            console.error(chalk.red('❌ AutoTask Error:'), error instanceof Error ? error.message : error);
            console.log(chalk.yellow('💡 Fallback: Use manual agent selection with the Task tool.'));
        }
    }

    /**
     * Analyze user prompt using pattern matching and keyword analysis
     */
    private analyzePrompt(prompt: string): TaskAnalysis {
        const lowerPrompt = prompt.toLowerCase();
        const words = lowerPrompt.split(/\s+/);
        
        let bestMatch: { type: TaskType; confidence: number } | null = null;
        const domains: Set<TaskDomain> = new Set();
        const keywords: string[] = [];

        // Pattern matching for task types
        for (const [taskType, pattern] of this.taskPatterns.entries()) {
            const confidence = this.calculateConfidence(lowerPrompt, words, pattern);
            
            if (confidence > 0.3 && (!bestMatch || confidence > bestMatch.confidence)) {
                bestMatch = { type: taskType, confidence };
            }

            // Collect domains based on pattern matches
            if (confidence > 0.2) {
                pattern.domains.forEach(domain => domains.add(domain));
                keywords.push(...pattern.keywords.filter(k => lowerPrompt.includes(k)));
            }
        }

        // Determine complexity
        const complexity = this.determineComplexity(prompt, Array.from(domains));

        return {
            taskType: bestMatch?.type || 'feature-development',
            complexity,
            domain: Array.from(domains),
            keywords: [...new Set(keywords)],
            confidence: bestMatch?.confidence || 0.5
        };
    }

    /**
     * Select optimal execution strategy based on analysis
     */
    private selectExecutionStrategy(analysis: TaskAnalysis): ExecutionStrategy {
        const { taskType, complexity, domain } = analysis;

        // Get strategy template based on task type
        const strategyTemplate = this.getStrategyTemplate(taskType);
        
        // Adapt strategy based on complexity and domains
        const adaptedStrategy = this.adaptStrategy(strategyTemplate, complexity, domain);

        return adaptedStrategy;
    }

    /**
     * Generate coordinated multi-agent prompt
     */
    private generateCoordinatedPrompt(
        originalPrompt: string, 
        _analysis: TaskAnalysis, 
        strategy: ExecutionStrategy
    ): string {
        const { mode, phases, coordination } = strategy;

        let prompt = `I need to accomplish this task with multiple agents working ${mode}ly:\n\n`;
        prompt += `"${originalPrompt}"\n\n`;

        if (mode === 'parallel') {
            prompt += this.generateParallelPrompt(phases, coordination);
        } else if (mode === 'sequential') {
            prompt += this.generateSequentialPrompt(phases, coordination);
        } else {
            prompt += this.generateHybridPrompt(phases, coordination);
        }

        prompt += this.generateCoordinationInstructions(coordination);

        return prompt;
    }

    /**
     * Generate parallel execution prompt
     */
    private generateParallelPrompt(phases: ExecutionPhase[], _coordination: CoordinationStrategy): string {
        let prompt = '🔄 **PARALLEL EXECUTION REQUIRED**\n\n';
        
        const allAgents = phases.flatMap(phase => phase.agents);
        const primaryAgents = allAgents.filter(agent => agent.role === 'primary');

        prompt += 'Execute these agents **concurrently** in a single response:\n\n';

        primaryAgents.forEach((agent, index) => {
            const phase = phases.find(p => p.agents.includes(agent));
            prompt += `${index + 1}. **Use the ${agent.name} agent** to ${phase?.description}\n`;
            prompt += `   Deliverables: ${phase?.deliverables.join(', ')}\n\n`;
        });

        return prompt;
    }

    /**
     * Generate sequential execution prompt
     */
    private generateSequentialPrompt(phases: ExecutionPhase[], _coordination: CoordinationStrategy): string {
        let prompt = '📋 **SEQUENTIAL EXECUTION WORKFLOW**\n\n';
        prompt += 'Follow this step-by-step workflow:\n\n';

        phases.forEach((phase, index) => {
            const primaryAgent = phase.agents.find(agent => agent.role === 'primary');
            if (primaryAgent) {
                prompt += `**Step ${index + 1}: ${phase.name}**\n`;
                prompt += `Use the ${primaryAgent.name} agent to ${phase.description}\n`;
                prompt += `Expected deliverables: ${phase.deliverables.join(', ')}\n\n`;
            }
        });

        return prompt;
    }

    /**
     * Generate hybrid execution prompt
     */
    private generateHybridPrompt(phases: ExecutionPhase[], _coordination: CoordinationStrategy): string {
        let prompt = '🔀 **HYBRID EXECUTION STRATEGY**\n\n';
        
        phases.forEach((phase, index) => {
            prompt += `**Phase ${index + 1}: ${phase.name}** (${phase.mode})\n`;
            
            if (phase.mode === 'parallel') {
                const primaryAgents = phase.agents.filter(agent => agent.role === 'primary');
                prompt += `Execute concurrently:\n`;
                primaryAgents.forEach(agent => {
                    prompt += `- Use ${agent.name} agent for ${phase.description}\n`;
                });
            } else {
                const primaryAgent = phase.agents.find(agent => agent.role === 'primary');
                if (primaryAgent) {
                    prompt += `Use ${primaryAgent.name} agent to ${phase.description}\n`;
                }
            }
            
            prompt += `Deliverables: ${phase.deliverables.join(', ')}\n\n`;
        });

        return prompt;
    }

    /**
     * Generate coordination instructions
     */
    private generateCoordinationInstructions(coordination: CoordinationStrategy): string {
        let instructions = '🤝 **COORDINATION REQUIREMENTS**\n\n';
        
        if (coordination.coordinator) {
            instructions += `- **Coordinator**: Use ${coordination.coordinator} agent to orchestrate and synthesize results\n`;
        }
        
        if (coordination.syncPoints.length > 0) {
            instructions += `- **Sync Points**: Coordinate at: ${coordination.syncPoints.join(', ')}\n`;
        }
        
        instructions += `- **Output Format**: Provide ${coordination.outputFormat} results\n`;
        instructions += `- **Integration**: Ensure all agent outputs work together cohesively\n`;

        return instructions;
    }

    /**
     * Initialize task pattern database
     */
    private initializeTaskPatterns(): Map<TaskType, TaskPattern> {
        const patterns = new Map<TaskType, TaskPattern>();

        patterns.set('feature-development', {
            keywords: ['feature', 'implement', 'create', 'build', 'develop', 'add'],
            domains: ['architecture', 'backend', 'frontend', 'testing'],
            complexity: 'complex',
            agents: ['solution-architect', 'fullstack-developer', 'debugger-tester'],
            executionMode: 'hybrid'
        });

        patterns.set('system-design', {
            keywords: ['design', 'architecture', 'system', 'structure', 'plan', 'organize'],
            domains: ['architecture', 'backend', 'devops'],
            complexity: 'complex',
            agents: ['solution-architect', 'devops-engineer'],
            executionMode: 'sequential'
        });

        patterns.set('api-development', {
            keywords: ['api', 'endpoint', 'rest', 'graphql', 'service', 'microservice'],
            domains: ['backend', 'documentation', 'testing'],
            complexity: 'medium',
            agents: ['backend-developer-specialist', 'technical-writer', 'debugger-tester'],
            executionMode: 'sequential'
        });

        patterns.set('ui-development', {
            keywords: ['ui', 'interface', 'component', 'react', 'vue', 'frontend', 'design'],
            domains: ['frontend', 'design'],
            complexity: 'medium',
            agents: ['frontend-developer-specialist', 'ux-ix-designer'],
            executionMode: 'parallel'
        });

        patterns.set('database-design', {
            keywords: ['database', 'schema', 'model', 'table', 'query', 'sql', 'nosql'],
            domains: ['database', 'backend'],
            complexity: 'medium',
            agents: ['data-architect-specialist', 'backend-developer-specialist'],
            executionMode: 'sequential'
        });

        patterns.set('performance-optimization', {
            keywords: ['performance', 'optimize', 'speed', 'slow', 'bottleneck', 'scale'],
            domains: ['backend', 'frontend', 'database', 'testing'],
            complexity: 'complex',
            agents: ['debugger-tester', 'data-architect-specialist', 'backend-developer-specialist'],
            executionMode: 'parallel'
        });

        patterns.set('testing-qa', {
            keywords: ['test', 'testing', 'qa', 'quality', 'bug', 'debug', 'fix'],
            domains: ['testing'],
            complexity: 'medium',
            agents: ['debugger-tester'],
            executionMode: 'sequential'
        });

        patterns.set('documentation', {
            keywords: ['document', 'docs', 'guide', 'manual', 'readme', 'api docs'],
            domains: ['documentation'],
            complexity: 'simple',
            agents: ['technical-writer'],
            executionMode: 'sequential'
        });

        patterns.set('research-analysis', {
            keywords: ['research', 'analyze', 'investigate', 'study', 'compare', 'evaluate'],
            domains: ['research'],
            complexity: 'medium',
            agents: ['data-mining-specialist', 'general-purpose'],
            executionMode: 'parallel'
        });

        patterns.set('deployment-devops', {
            keywords: ['deploy', 'deployment', 'ci/cd', 'docker', 'kubernetes', 'infrastructure'],
            domains: ['devops'],
            complexity: 'complex',
            agents: ['devops-engineer', 'solution-architect'],
            executionMode: 'sequential'
        });

        patterns.set('compliance-audit', {
            keywords: ['compliance', 'gdpr', 'security', 'audit', 'privacy', 'regulation'],
            domains: ['compliance'],
            complexity: 'medium',
            agents: ['compliance-manager', 'solution-architect'],
            executionMode: 'sequential'
        });

        patterns.set('bug-investigation', {
            keywords: ['bug', 'error', 'issue', 'problem', 'broken', 'crash', 'fix'],
            domains: ['testing', 'backend', 'frontend'],
            complexity: 'medium',
            agents: ['debugger-tester'],
            executionMode: 'sequential'
        });

        return patterns;
    }

    /**
     * Calculate confidence score for pattern matching
     */
    private calculateConfidence(prompt: string, words: string[], pattern: TaskPattern): number {
        let score = 0;
        let matches = 0;

        for (const keyword of pattern.keywords) {
            if (prompt.includes(keyword)) {
                matches++;
                score += 1;
            }
            
            // Partial word matches
            for (const word of words) {
                if (word.includes(keyword) || keyword.includes(word)) {
                    score += 0.5;
                }
            }
        }

        // Normalize score
        return Math.min(score / pattern.keywords.length, 1);
    }

    /**
     * Determine task complexity
     */
    private determineComplexity(prompt: string, domains: TaskDomain[]): 'simple' | 'medium' | 'complex' {
        const wordCount = prompt.split(/\s+/).length;
        const domainCount = domains.length;

        if (wordCount > 50 || domainCount > 3) return 'complex';
        if (wordCount > 20 || domainCount > 2) return 'medium';
        return 'simple';
    }

    /**
     * Get strategy template for task type
     */
    private getStrategyTemplate(taskType: TaskType): ExecutionStrategy {
        const templates: Record<TaskType, ExecutionStrategy> = {
            'feature-development': {
                mode: 'hybrid',
                phases: [
                    {
                        name: 'Architecture & Design',
                        agents: [
                            { name: 'solution-architect', role: 'primary', priority: 1 },
                            { name: 'ux-ix-designer', role: 'secondary', priority: 2 }
                        ],
                        mode: 'parallel',
                        description: 'design system architecture and user experience',
                        deliverables: ['system architecture', 'UI/UX design', 'technical specifications']
                    },
                    {
                        name: 'Implementation',
                        agents: [
                            { name: 'fullstack-developer', role: 'primary', priority: 1 }
                        ],
                        mode: 'sequential',
                        description: 'implement the complete feature',
                        deliverables: ['working feature', 'integration tests', 'code documentation']
                    },
                    {
                        name: 'Quality Assurance',
                        agents: [
                            { name: 'debugger-tester', role: 'primary', priority: 1 },
                            { name: 'technical-writer', role: 'secondary', priority: 2 }
                        ],
                        mode: 'parallel',
                        description: 'test and document the feature',
                        deliverables: ['test results', 'user documentation', 'deployment guide']
                    }
                ],
                coordination: {
                    coordinator: 'solution-architect',
                    syncPoints: ['design completion', 'implementation completion'],
                    outputFormat: 'unified'
                },
                estimatedDuration: '2-4 hours'
            },
            
            'api-development': {
                mode: 'sequential',
                phases: [
                    {
                        name: 'API Design',
                        agents: [{ name: 'backend-developer-specialist', role: 'primary', priority: 1 }],
                        mode: 'sequential',
                        description: 'design API endpoints and data models',
                        deliverables: ['API specification', 'data models', 'endpoint definitions']
                    },
                    {
                        name: 'Implementation & Testing',
                        agents: [
                            { name: 'backend-developer-specialist', role: 'primary', priority: 1 },
                            { name: 'debugger-tester', role: 'secondary', priority: 2 }
                        ],
                        mode: 'sequential',
                        description: 'implement and test API endpoints',
                        deliverables: ['working API', 'unit tests', 'integration tests']
                    },
                    {
                        name: 'Documentation',
                        agents: [{ name: 'technical-writer', role: 'primary', priority: 1 }],
                        mode: 'sequential',
                        description: 'create comprehensive API documentation',
                        deliverables: ['API documentation', 'usage examples', 'changelog']
                    }
                ],
                coordination: {
                    syncPoints: ['design approval', 'implementation completion'],
                    outputFormat: 'separate'
                },
                estimatedDuration: '1-2 hours'
            },

            'performance-optimization': {
                mode: 'parallel',
                phases: [
                    {
                        name: 'Performance Analysis',
                        agents: [
                            { name: 'debugger-tester', role: 'primary', priority: 1 },
                            { name: 'data-architect-specialist', role: 'secondary', priority: 2 },
                            { name: 'backend-developer-specialist', role: 'secondary', priority: 2 }
                        ],
                        mode: 'parallel',
                        description: 'analyze performance bottlenecks across all layers',
                        deliverables: ['performance report', 'bottleneck analysis', 'optimization recommendations']
                    }
                ],
                coordination: {
                    coordinator: 'debugger-tester',
                    syncPoints: ['analysis completion'],
                    outputFormat: 'unified'
                },
                estimatedDuration: '1-3 hours'
            },
            
            'system-design': {
                mode: 'sequential',
                phases: [{
                    name: 'System Design',
                    agents: [{ name: 'solution-architect', role: 'primary', priority: 1 }],
                    mode: 'sequential',
                    description: 'design system architecture',
                    deliverables: ['system design']
                }],
                coordination: { syncPoints: [], outputFormat: 'summary' },
                estimatedDuration: '1-2 hours'
            },
            
            'database-design': {
                mode: 'sequential',
                phases: [{
                    name: 'Database Design',
                    agents: [{ name: 'data-architect-specialist', role: 'primary', priority: 1 }],
                    mode: 'sequential',
                    description: 'design database schema',
                    deliverables: ['database schema']
                }],
                coordination: { syncPoints: [], outputFormat: 'summary' },
                estimatedDuration: '1-2 hours'
            },
            
            'ui-development': {
                mode: 'sequential',
                phases: [{
                    name: 'UI Development',
                    agents: [{ name: 'frontend-developer-specialist', role: 'primary', priority: 1 }],
                    mode: 'sequential',
                    description: 'develop user interface',
                    deliverables: ['UI components']
                }],
                coordination: { syncPoints: [], outputFormat: 'summary' },
                estimatedDuration: '1-2 hours'
            },
            
            'testing-qa': {
                mode: 'sequential',
                phases: [{
                    name: 'Testing',
                    agents: [{ name: 'debugger-tester', role: 'primary', priority: 1 }],
                    mode: 'sequential',
                    description: 'test application',
                    deliverables: ['test results']
                }],
                coordination: { syncPoints: [], outputFormat: 'summary' },
                estimatedDuration: '1-2 hours'
            },
            
            'documentation': {
                mode: 'sequential',
                phases: [{
                    name: 'Documentation',
                    agents: [{ name: 'technical-writer', role: 'primary', priority: 1 }],
                    mode: 'sequential',
                    description: 'create documentation',
                    deliverables: ['documentation']
                }],
                coordination: { syncPoints: [], outputFormat: 'summary' },
                estimatedDuration: '1-2 hours'
            },
            
            'research-analysis': {
                mode: 'sequential',
                phases: [{
                    name: 'Research',
                    agents: [{ name: 'data-mining-specialist', role: 'primary', priority: 1 }],
                    mode: 'sequential',
                    description: 'conduct research analysis',
                    deliverables: ['research findings']
                }],
                coordination: { syncPoints: [], outputFormat: 'summary' },
                estimatedDuration: '1-2 hours'
            },
            
            'compliance-audit': {
                mode: 'sequential',
                phases: [{
                    name: 'Compliance Audit',
                    agents: [{ name: 'compliance-manager', role: 'primary', priority: 1 }],
                    mode: 'sequential',
                    description: 'conduct compliance audit',
                    deliverables: ['audit report']
                }],
                coordination: { syncPoints: [], outputFormat: 'summary' },
                estimatedDuration: '1-2 hours'
            },
            
            'deployment-devops': {
                mode: 'sequential',
                phases: [{
                    name: 'Deployment',
                    agents: [{ name: 'devops-engineer', role: 'primary', priority: 1 }],
                    mode: 'sequential',
                    description: 'handle deployment',
                    deliverables: ['deployment plan']
                }],
                coordination: { syncPoints: [], outputFormat: 'summary' },
                estimatedDuration: '1-2 hours'
            },
            
            'bug-investigation': {
                mode: 'sequential',
                phases: [{
                    name: 'Bug Investigation',
                    agents: [{ name: 'debugger-tester', role: 'primary', priority: 1 }],
                    mode: 'sequential',
                    description: 'investigate and fix bugs',
                    deliverables: ['bug fix']
                }],
                coordination: { syncPoints: [], outputFormat: 'summary' },
                estimatedDuration: '1-2 hours'
            }
        };

        // Default template for unspecified task types
        const defaultTemplate: ExecutionStrategy = {
            mode: 'sequential',
            phases: [
                {
                    name: 'Analysis & Planning',
                    agents: [{ name: 'general-purpose', role: 'primary', priority: 1 }],
                    mode: 'sequential',
                    description: 'analyze the task and create an execution plan',
                    deliverables: ['task analysis', 'execution plan', 'resource requirements']
                }
            ],
            coordination: {
                syncPoints: [],
                outputFormat: 'summary'
            },
            estimatedDuration: '30-60 minutes'
        };

        return templates[taskType] || defaultTemplate;
    }

    /**
     * Adapt strategy based on complexity and domains
     */
    private adaptStrategy(
        template: ExecutionStrategy, 
        complexity: 'simple' | 'medium' | 'complex', 
        domains: TaskDomain[]
    ): ExecutionStrategy {
        const adapted = { ...template };

        // Adjust based on complexity
        if (complexity === 'simple') {
            adapted.phases = adapted.phases.slice(0, 1); // Only first phase
            adapted.coordination.outputFormat = 'summary';
        } else if (complexity === 'complex') {
            // Add additional coordination for complex tasks
            adapted.coordination.syncPoints.push('mid-point review');
        }

        // Adjust based on domains
        if (domains.includes('compliance')) {
            adapted.phases.push({
                name: 'Compliance Review',
                agents: [{ name: 'compliance-manager', role: 'primary', priority: 1 }],
                mode: 'sequential',
                description: 'review solution for compliance requirements',
                deliverables: ['compliance report', 'recommendations', 'risk assessment']
            });
        }

        return adapted;
    }

    /**
     * Display analysis results
     */
    private displayAnalysis(analysis: TaskAnalysis): void {
        console.log(chalk.blue('📊 Task Analysis:'));
        console.log(chalk.white(`  Task Type: ${analysis.taskType}`));
        console.log(chalk.white(`  Complexity: ${analysis.complexity}`));
        console.log(chalk.white(`  Domains: ${analysis.domain.join(', ')}`));
        console.log(chalk.white(`  Keywords: ${analysis.keywords.join(', ')}`));
        console.log(chalk.white(`  Confidence: ${(analysis.confidence * 100).toFixed(1)}%`));
        console.log();
    }

    /**
     * Display execution strategy
     */
    private displayStrategy(strategy: ExecutionStrategy): void {
        console.log(chalk.blue('⚡ Execution Strategy:'));
        console.log(chalk.white(`  Mode: ${strategy.mode}`));
        console.log(chalk.white(`  Phases: ${strategy.phases.length}`));
        console.log(chalk.white(`  Estimated Duration: ${strategy.estimatedDuration}`));
        console.log();

        strategy.phases.forEach((phase, index) => {
            const primaryAgent = phase.agents.find(agent => agent.role === 'primary');
            console.log(chalk.gray(`    ${index + 1}. ${phase.name} (${phase.mode})`));
            console.log(chalk.gray(`       Primary: ${primaryAgent?.name}`));
        });
        console.log();
    }

    /**
     * Display the generated coordinated prompt
     */
    private displayCoordinatedPrompt(prompt: string): void {
        console.log(chalk.green('🚀 Generated Multi-Agent Prompt:'));
        console.log(chalk.cyan('=' .repeat(60)));
        console.log(prompt);
        console.log(chalk.cyan('=' .repeat(60)));
        console.log();
    }
}

interface TaskPattern {
    keywords: string[];
    domains: TaskDomain[];
    complexity: 'simple' | 'medium' | 'complex';
    agents: string[];
    executionMode: 'sequential' | 'parallel' | 'hybrid';
}