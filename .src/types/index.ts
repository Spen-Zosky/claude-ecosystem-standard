/**
 * TypeScript type definitions for Claude Ecosystem Standard (CES)
 */

export interface SessionConfig {
    id: string;
    name: string;
    startTime: Date;
    endTime?: Date;
    status: SessionStatus;
    mcpServers: MCPServerConfig[];
    agents: AgentConfig[];
    environment: EnvironmentConfig;
    checkpoints: SessionCheckpoint[];
}

export type SessionStatus = 'active' | 'suspended' | 'closed' | 'error';

export interface MCPServerConfig {
    name: string;
    enabled: boolean;
    priority: 'critical' | 'high' | 'medium' | 'low';
    config: {
        command: string;
        args?: string[];
        env?: Record<string, string>;
    };
    status?: 'connected' | 'disconnected' | 'error';
}

export interface AgentConfig {
    name: string;
    description: string;
    tools: string[];
    priority: 'high' | 'medium' | 'low';
    color?: string;
    filePath: string;
    enabled: boolean;
}

export interface EnvironmentConfig {
    projectRoot: string;
    projectName: string;
    languages: DetectedLanguage[];
    frameworks: string[];
    tools: string[];
    hasGit: boolean;
    hasMCP: boolean;
    hasAgents: boolean;
}

export interface DetectedLanguage {
    name: string;
    emoji: string;
    files: string[];
    extensions: string[];
    confidence: number;
}

export interface SessionCheckpoint {
    id: string;
    timestamp: Date;
    message: string | undefined;
    sessionState: Partial<SessionConfig>;
    systemState: SystemState;
}

export interface SystemState {
    workingDirectory: string;
    environment: Record<string, string>;
    runningProcesses: ProcessInfo[];
    openFiles: string[];
    gitStatus: GitStatus | undefined;
}

export interface ProcessInfo {
    pid: number;
    name: string;
    command: string;
    status: 'running' | 'stopped' | 'error';
}

export interface GitStatus {
    branch: string;
    status: string;
    staged: string[];
    unstaged: string[];
    untracked: string[];
}

export interface CLICommand {
    name: string;
    description: string;
    handler: (args: any) => Promise<void>;
    options?: CLIOption[];
}

export interface CLIOption {
    name: string;
    description: string;
    required?: boolean;
    type: 'string' | 'boolean' | 'number';
    default?: any;
}

export interface ProjectHealth {
    overall: 'healthy' | 'warning' | 'error';
    languages: HealthCheck;
    mcp: HealthCheck;
    agents: HealthCheck;
    git: HealthCheck;
    environment: HealthCheck;
    issues: HealthIssue[];
}

export interface HealthCheck {
    status: 'pass' | 'warning' | 'fail';
    message: string;
    details?: any;
}

export interface HealthIssue {
    level: 'error' | 'warning' | 'info';
    category: string;
    message: string;
    suggestion?: string;
}

export interface StartupHookResult {
    success: boolean;
    languages: DetectedLanguage[];
    frameworks: string[];
    tools: string[];
    directories: string[];
    health: ProjectHealth;
    logs: string[];
}

// Error types
export class CESError extends Error {
    constructor(
        message: string,
        public code: string,
        public context?: any
    ) {
        super(message);
        this.name = 'CESError';
    }
}

export class SessionError extends CESError {
    constructor(message: string, context?: any) {
        super(message, 'SESSION_ERROR', context);
        this.name = 'SessionError';
    }
}

export class ConfigError extends CESError {
    constructor(message: string, context?: any) {
        super(message, 'CONFIG_ERROR', context);
        this.name = 'ConfigError';
    }
}

export class MCPError extends CESError {
    constructor(message: string, context?: any) {
        super(message, 'MCP_ERROR', context);
        this.name = 'MCPError';
    }
}

// Utility types
export type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Constants
export const DEFAULT_MCP_SERVERS = [
    'context7',
    'serena', 
    'arxiv',
    'mongodb',
    'git',
    'postgresql',
    'playwright',
    'brave',
    'youtube',
    'google-drive',
    'bigquery',
    'filesystem',
    'sqlite',
    'kubernetes'
] as const;

export const DEFAULT_AGENT_CATEGORIES = {
    'Core Development': ['solution-architect', 'fullstack-developer', 'backend-developer-specialist', 'frontend-developer-specialist'],
    'Infrastructure': ['devops-engineer', 'data-architect-specialist'],
    'Quality & Compliance': ['debugger-tester', 'compliance-manager'],
    'Specialized': ['data-mining-specialist', 'ux-ix-designer', 'technical-writer'],
    'General': ['general-purpose']
} as const;

export const LANGUAGE_PATTERNS = {
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
} as const;

// Additional types for CLI managers
export interface SessionProfile {
    id: string;
    name: string;
    description?: string;
    settings: Record<string, any>;
    createdAt: Date;
    lastUsed?: Date | undefined;
}

export interface SessionContext {
    currentProfile?: SessionProfile | undefined;
    projectType?: string | undefined;
    resourceUsage: {
        cpu: number;
        memory: number;
        disk: number;
    };
    timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
    workingDirectory: string;
    recentCommands: string[];
    sessionDuration: number;
    userBehavior: {
        commandFrequency: Record<string, number>;
        preferredAgents: string[];
        workingPatterns: string[];
    };
}

export interface ServiceHealth {
    name: string;
    status: 'healthy' | 'degraded' | 'failed' | 'critical';
    lastCheck: Date;
    uptime: number;
    restartCount: number;
    lastError?: string | undefined;
    pid?: number | undefined;
    port?: number | undefined;
    responseTime: number;
}

export interface LogContext {
    component?: string;
    sessionId?: string;
    userId?: string;
    action?: string;
    duration?: number;
    metadata?: Record<string, any>;
    // Enterprise logging extensions
    type?: string;
    success?: boolean;
    error?: string | undefined;
    performanceGain?: number;
    userSatisfaction?: number;
    optimizationsApplied?: number;
    updatedConfig?: Record<string, any>;
    recommendationsCount?: number;
    context?: any;
    // Additional analytics fields
    eventsAnalyzed?: number;
    periodDays?: number;
    originalLength?: number;
    newLength?: number;
    retentionDays?: number;
    // AutoRecovery fields
    interval?: number;
    timeout?: number;
    criticalServices?: string[];
    serviceName?: string;
    // SystemCleanup fields
    actionsCount?: number;
    servicesKilled?: number;
    portsFreed?: number;
    // Standard logging fields
    requestId?: string;
    correlationId?: string;
    sourceFile?: string;
    lineNumber?: number;
    functionName?: string;
    errorCode?: string;
    severity?: string;
    tags?: string[];
    timestamp?: Date;
    environment?: string;
    version?: string;
    buildInfo?: string;
    performanceMetrics?: Record<string, number>;
    memoryUsage?: number;
    cpuUsage?: number;
    networkLatency?: number;
    // Additional fields used in CLI managers
    details?: any;
    project?: string;
    dryRun?: boolean;
    forceKill?: boolean;
}

export interface LogMetrics {
    timestamp: Date;
    level: string;
    component: string;
    duration?: number;
    success: boolean;
    errorCode?: string | undefined;
}

export interface ProcessService {
    running: boolean;
    pid?: number | undefined;
    port?: number | undefined;
}

export interface QuickCommand {
    alias: string;
    command: string;
    description: string;
    category: 'system' | 'development' | 'session' | 'custom' | 'profile' | 'monitoring';
    hotkey?: string | undefined;
    parameters?: string[] | undefined;
    builtin: boolean;
    useCount: number;
}