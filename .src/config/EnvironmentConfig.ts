/**
 * Enterprise Environment Configuration Manager for CES v2.7.0
 * 
 * Provides type-safe, validated configuration management with:
 * - Dynamic project root detection
 * - Environment variable loading and validation
 * - Relative path management
 * - Default value fallbacks
 * - Configuration hot-reloading
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs-extra';
import { v4 as uuidv4 } from 'uuid';
import { getPathResolver, PathResolver } from '../utils/PathResolver';

// Load environment variables
dotenv.config();

export interface IntegrationConfig {
  mode: 'standalone' | 'integrated';
  projectRoot: string;
  cesRoot: string;
  operationRoot: string;
  claudeDir: string;
}

export interface CESEnvironmentConfig {
  // Core System
  nodeEnv: 'development' | 'staging' | 'production';
  cesVersion: string;
  projectName: string;
  instanceId: string;

  // Session Management
  sessionTimeout: number;
  maxSessions: number;
  sessionCleanupInterval: number;

  // Timer and Monitoring
  contextAnalysisInterval: number;
  recommendationsInterval: number;
  healthCheckInterval: number;
  metricsCollectionInterval: number;

  // Retry and Recovery
  maxRetries: number;
  retryDelay: number;
  recoveryTimeout: number;
  maxRecoveryAttempts: number;

  // Analytics
  analytics: {
    enabled: boolean;
    batchSize: number;
    maxBufferSize: number;
    retentionDays: number;
    exportFormat: 'json' | 'csv' | 'html';
  };

  // AI Session
  aiSession: {
    enabled: boolean;
    learningMode: 'passive' | 'active' | 'aggressive';
    adaptationLevel: 'minimal' | 'standard' | 'maximum';
    predictionAccuracy: number;
    autoOptimization: boolean;
    smartRecommendations: boolean;
    contextAwareness: boolean;
  };

  // Cloud Integration
  cloud: {
    enabled: boolean;
    provider: string;
    encryptionEnabled: boolean;
    autoSync: boolean;
    syncInterval: number;
    backupRetention: number;
  };

  // Logging
  logging: {
    level: 'error' | 'warn' | 'info' | 'debug';
    format: 'json' | 'simple';
    maxFiles: number;
    maxSize: string;
    datePattern: string;
  };

  // Network
  network: {
    defaultPort: number;
    monitorPort: number;
    dashboardPort: number;
    host: string;
  };

  // Security
  security: {
    enableAuth: boolean;
    jwtSecret: string;
    jwtExpiry: string;
    corsEnabled: boolean;
    rateLimitWindow: number;
    rateLimitMax: number;
  };

  // Storage Paths (dynamically resolved for portability)
  paths: {
    projectRoot: string;
    cesRoot: string;
    operationRoot: string;
    cesRelative: string;
    srcDir: string;
    distDir: string;
    nodeModulesDir: string;
    claudeDir: string;
    dataDir: string;
    logsDir: string;
    cacheDir: string;
    tempDir: string;
    backupDir: string;
  };

  // Development
  development: {
    debugEnabled: boolean;
    verboseLogging: boolean;
    performanceMonitoring: boolean;
    errorStackTrace: boolean;
  };

  // MCP Servers
  mcpServers: {
    enabled: boolean;
    timeout: number;
    retryAttempts: number;
  };

  // Auto Recovery
  autoRecovery: {
    enabled: boolean;
    autoRestartEnabled: boolean;
    autoCleanupEnabled: boolean;
    checkInterval: number;
    maxRestartAttempts: number;
  };

  // Dashboard
  dashboard: {
    enabled: boolean;
    refreshInterval: number;
    compactMode: boolean;
    showGraphs: boolean;
  };

  // Anthropic SDK
  anthropic: {
    apiKey?: string;
    defaultModel: string;
    maxTokens: number;
    temperature: number;
    timeout: number;
    maxRetries: number;
  };
}

export class EnvironmentConfigManager {
  private static instance: EnvironmentConfigManager;
  private config: CESEnvironmentConfig;
  private pathResolver: PathResolver;
  private configLoadTime: Date;
  private integrationConfig!: IntegrationConfig;

  private constructor() {
    this.loadEnvironment();
    this.detectIntegrationMode();
    this.pathResolver = getPathResolver();
    this.config = this.loadConfiguration();
    this.configLoadTime = new Date();
  }

  private loadEnvironment(): void {
    // Load standard .env
    dotenv.config({ path: '.env' });
    
    // Load .env.local if in integrated mode
    if (fs.existsSync('.env.local')) {
      dotenv.config({ path: '.env.local', override: true });
    }
  }

  private detectIntegrationMode(): void {
    const mode = process.env.CES_OPERATION_MODE || 'standalone';
    const cesRoot = this.findCesRoot();
    
    if (mode === 'integrated') {
      // Integrated mode
      const projectRoot = process.env.CES_PROJECT_ROOT || path.dirname(cesRoot);
      this.integrationConfig = {
        mode: 'integrated',
        cesRoot,
        projectRoot,
        operationRoot: projectRoot,
        claudeDir: process.env.CES_CLAUDE_DIR || path.join(projectRoot, '.claude')
      };
    } else {
      // Standalone mode
      this.integrationConfig = {
        mode: 'standalone',
        cesRoot,
        projectRoot: cesRoot,
        operationRoot: cesRoot,
        claudeDir: path.join(cesRoot, '.claude')
      };
    }
    
    // Log detected mode
    console.log(`[CES] Operation mode: ${this.integrationConfig.mode}`);
    if (this.integrationConfig.mode === 'integrated') {
      console.log(`[CES] Host project: ${path.basename(this.integrationConfig.projectRoot)}`);
    }
  }

  private findCesRoot(): string {
    let currentDir = __dirname;
    
    // Traverse up until finding package.json with CES name
    while (currentDir !== path.dirname(currentDir)) {
      const packagePath = path.join(currentDir, 'package.json');
      if (fs.existsSync(packagePath)) {
        try {
          const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
          if (pkg.name === 'claude-ecosystem-standard') {
            return currentDir;
          }
        } catch {}
      }
      currentDir = path.dirname(currentDir);
    }
    
    // Fallback
    return process.cwd();
  }

  public static getInstance(): EnvironmentConfigManager {
    if (!EnvironmentConfigManager.instance) {
      EnvironmentConfigManager.instance = new EnvironmentConfigManager();
    }
    return EnvironmentConfigManager.instance;
  }


  /**
   * Load and validate configuration from environment variables
   */
  private loadConfiguration(): CESEnvironmentConfig {

    return {
      // Core System
      nodeEnv: this.getEnvValue('NODE_ENV', 'development') as 'development' | 'staging' | 'production',
      cesVersion: this.getEnvValue('CES_VERSION', '2.7.0'),
      projectName: this.getEnvValue('CES_PROJECT_NAME', 'claude-ecosystem-standard'),
      instanceId: this.getEnvValue('CES_INSTANCE_ID', this.generateInstanceId()),

      // Session Management
      sessionTimeout: this.getEnvNumber('CES_SESSION_TIMEOUT', 3600000),
      maxSessions: this.getEnvNumber('CES_MAX_SESSIONS', 10),
      sessionCleanupInterval: this.getEnvNumber('CES_SESSION_CLEANUP_INTERVAL', 300000),

      // Timer and Monitoring
      contextAnalysisInterval: this.getEnvNumber('CES_CONTEXT_ANALYSIS_INTERVAL', 30000),
      recommendationsInterval: this.getEnvNumber('CES_RECOMMENDATIONS_INTERVAL', 300000),
      healthCheckInterval: this.getEnvNumber('CES_HEALTH_CHECK_INTERVAL', 60000),
      metricsCollectionInterval: this.getEnvNumber('CES_METRICS_COLLECTION_INTERVAL', 60000),

      // Retry and Recovery
      maxRetries: this.getEnvNumber('CES_MAX_RETRIES', 3),
      retryDelay: this.getEnvNumber('CES_RETRY_DELAY', 5000),
      recoveryTimeout: this.getEnvNumber('CES_RECOVERY_TIMEOUT', 10000),
      maxRecoveryAttempts: this.getEnvNumber('CES_MAX_RECOVERY_ATTEMPTS', 3),

      // Analytics
      analytics: {
        enabled: this.getEnvBoolean('CES_ANALYTICS_ENABLED', true),
        batchSize: this.getEnvNumber('CES_ANALYTICS_BATCH_SIZE', 50),
        maxBufferSize: this.getEnvNumber('CES_ANALYTICS_MAX_BUFFER_SIZE', 1000),
        retentionDays: this.getEnvNumber('CES_ANALYTICS_RETENTION_DAYS', 30),
        exportFormat: this.getEnvValue('CES_ANALYTICS_EXPORT_FORMAT', 'json') as 'json' | 'csv' | 'html',
      },

      // AI Session
      aiSession: {
        enabled: this.getEnvBoolean('CES_AI_SESSION_ENABLED', true),
        learningMode: this.getEnvValue('CES_AI_LEARNING_MODE', 'standard') as 'passive' | 'active' | 'aggressive',
        adaptationLevel: this.getEnvValue('CES_AI_ADAPTATION_LEVEL', 'standard') as 'minimal' | 'standard' | 'maximum',
        predictionAccuracy: this.getEnvNumber('CES_AI_PREDICTION_ACCURACY', 80),
        autoOptimization: this.getEnvBoolean('CES_AI_AUTO_OPTIMIZATION', true),
        smartRecommendations: this.getEnvBoolean('CES_AI_SMART_RECOMMENDATIONS', true),
        contextAwareness: this.getEnvBoolean('CES_AI_CONTEXT_AWARENESS', true),
      },

      // Cloud Integration
      cloud: {
        enabled: this.getEnvBoolean('CES_CLOUD_ENABLED', false),
        provider: this.getEnvValue('CES_CLOUD_PROVIDER', 'github'),
        encryptionEnabled: this.getEnvBoolean('CES_CLOUD_ENCRYPTION_ENABLED', true),
        autoSync: this.getEnvBoolean('CES_CLOUD_AUTO_SYNC', false),
        syncInterval: this.getEnvNumber('CES_CLOUD_SYNC_INTERVAL', 1800000),
        backupRetention: this.getEnvNumber('CES_CLOUD_BACKUP_RETENTION', 7),
      },

      // Logging
      logging: {
        level: this.getEnvValue('CES_LOG_LEVEL', 'info') as 'error' | 'warn' | 'info' | 'debug',
        format: this.getEnvValue('CES_LOG_FORMAT', 'json') as 'json' | 'simple',
        maxFiles: this.getEnvNumber('CES_LOG_MAX_FILES', 5),
        maxSize: this.getEnvValue('CES_LOG_MAX_SIZE', '10MB'),
        datePattern: this.getEnvValue('CES_LOG_DATE_PATTERN', 'YYYY-MM-DD'),
      },

      // Network
      network: {
        defaultPort: this.getEnvNumber('CES_DEFAULT_PORT', 3000),
        monitorPort: this.getEnvNumber('CES_MONITOR_PORT', 3001),
        dashboardPort: this.getEnvNumber('CES_DASHBOARD_PORT', 3002),
        host: this.getEnvValue('CES_HOST', 'localhost'),
      },

      // Security
      security: {
        enableAuth: this.getEnvBoolean('CES_ENABLE_AUTH', false),
        jwtSecret: this.getEnvValue('CES_JWT_SECRET', this.generateJwtSecret()),
        jwtExpiry: this.getEnvValue('CES_JWT_EXPIRY', '24h'),
        corsEnabled: this.getEnvBoolean('CES_CORS_ENABLED', true),
        rateLimitWindow: this.getEnvNumber('CES_RATE_LIMIT_WINDOW', 900000),
        rateLimitMax: this.getEnvNumber('CES_RATE_LIMIT_MAX', 100),
      },

      // Storage Paths (dynamically resolved for portability)
      paths: {
        projectRoot: this.integrationConfig.projectRoot,
        cesRoot: this.integrationConfig.cesRoot,
        operationRoot: this.integrationConfig.operationRoot,
        cesRelative: this.pathResolver.getCesRelativePath(),
        srcDir: this.pathResolver.getCesPath('.src'),
        distDir: this.pathResolver.getCesPath('.dist'),
        nodeModulesDir: this.pathResolver.getCesPath('.node_modules'),
        claudeDir: this.integrationConfig.claudeDir,
        dataDir: this.pathResolver.getCesPath(this.getEnvValue('CES_DATA_DIR', '.ces-data')),
        logsDir: this.pathResolver.getCesPath(this.getEnvValue('CES_LOGS_DIR', '.ces-logs')),
        cacheDir: this.pathResolver.getCesPath(this.getEnvValue('CES_CACHE_DIR', '.ces-cache')),
        tempDir: this.pathResolver.getCesPath(this.getEnvValue('CES_TEMP_DIR', '.ces-temp')),
        backupDir: this.pathResolver.getCesPath(this.getEnvValue('CES_BACKUP_DIR', '.ces-backups')),
      },

      // Development
      development: {
        debugEnabled: this.getEnvBoolean('CES_DEBUG_ENABLED', false),
        verboseLogging: this.getEnvBoolean('CES_VERBOSE_LOGGING', false),
        performanceMonitoring: this.getEnvBoolean('CES_PERFORMANCE_MONITORING', true),
        errorStackTrace: this.getEnvBoolean('CES_ERROR_STACK_TRACE', true),
      },

      // MCP Servers
      mcpServers: {
        enabled: this.getEnvBoolean('CES_MCP_SERVERS_ENABLED', true),
        timeout: this.getEnvNumber('CES_MCP_SERVERS_TIMEOUT', 30000),
        retryAttempts: this.getEnvNumber('CES_MCP_SERVERS_RETRY_ATTEMPTS', 3),
      },

      // Auto Recovery
      autoRecovery: {
        enabled: this.getEnvBoolean('CES_AUTO_RECOVERY_ENABLED', true),
        autoRestartEnabled: this.getEnvBoolean('CES_AUTO_RESTART_ENABLED', true),
        autoCleanupEnabled: this.getEnvBoolean('CES_AUTO_CLEANUP_ENABLED', true),
        checkInterval: this.getEnvNumber('CES_RECOVERY_CHECK_INTERVAL', 10000),
        maxRestartAttempts: this.getEnvNumber('CES_MAX_RESTART_ATTEMPTS', 3),
      },

      // Dashboard
      dashboard: {
        enabled: this.getEnvBoolean('CES_DASHBOARD_ENABLED', true),
        refreshInterval: this.getEnvNumber('CES_DASHBOARD_REFRESH_INTERVAL', 2000),
        compactMode: this.getEnvBoolean('CES_DASHBOARD_COMPACT_MODE', false),
        showGraphs: this.getEnvBoolean('CES_DASHBOARD_SHOW_GRAPHS', true),
      },

      // Anthropic SDK
      anthropic: {
        apiKey: process.env.ANTHROPIC_API_KEY,
        defaultModel: this.getEnvValue('CES_ANTHROPIC_MODEL', 'claude-3-sonnet-20240229'),
        maxTokens: this.getEnvNumber('CES_ANTHROPIC_MAX_TOKENS', 4096),
        temperature: this.getEnvNumber('CES_ANTHROPIC_TEMPERATURE', 0.7),
        timeout: this.getEnvNumber('CES_ANTHROPIC_TIMEOUT', 30000),
        maxRetries: this.getEnvNumber('CES_ANTHROPIC_MAX_RETRIES', 2),
      },
    };
  }

  /**
   * Get environment variable value with fallback
   */
  private getEnvValue(key: string, defaultValue: string): string {
    return process.env[key] || defaultValue;
  }

  /**
   * Get environment variable as number with validation
   */
  private getEnvNumber(key: string, defaultValue: number): number {
    const value = process.env[key];
    if (!value) return defaultValue;
    
    const parsed = parseInt(value, 10);
    if (isNaN(parsed)) {
      console.warn(`Invalid number value for ${key}: ${value}, using default: ${defaultValue}`);
      return defaultValue;
    }
    
    return parsed;
  }

  /**
   * Get environment variable as boolean with validation
   */
  private getEnvBoolean(key: string, defaultValue: boolean): boolean {
    const value = process.env[key];
    if (!value) return defaultValue;
    
    return value.toLowerCase() === 'true' || value === '1';
  }

  /**
   * Generate unique instance ID
   */
  private generateInstanceId(): string {
    // UUID is already imported
    return `ces-${this.config?.nodeEnv || 'dev'}-${uuidv4().substring(0, 8)}`;
  }

  /**
   * Generate JWT secret for development
   */
  private generateJwtSecret(): string {
    // UUID is already imported
    return `ces-jwt-secret-${uuidv4()}`;
  }

  /**
   * Get current configuration
   */
  public getConfig(): CESEnvironmentConfig {
    return { ...this.config }; // Return copy to prevent mutation
  }

  /**
   * Get specific configuration value by path
   */
  public get<T>(path: string): T {
    const keys = path.split('.');
    let current: any = this.config;
    
    for (const key of keys) {
      if (current[key] === undefined) {
        throw new Error(`Configuration path not found: ${path}`);
      }
      current = current[key];
    }
    
    return current as T;
  }

  // Public methods for integration configuration access
  
  public getIntegrationMode(): 'standalone' | 'integrated' {
    return this.integrationConfig.mode;
  }
  
  public getProjectRoot(): string {
    return this.integrationConfig.projectRoot;
  }
  
  public getCesRoot(): string {
    return this.integrationConfig.cesRoot;
  }
  
  public getOperationRoot(): string {
    return this.integrationConfig.operationRoot;
  }
  
  public getClaudeDir(): string {
    return this.integrationConfig.claudeDir;
  }
  
  public getProjectPath(relativePath: string): string {
    // Resolve paths relative to host/operation project
    return path.join(this.integrationConfig.operationRoot, relativePath);
  }
  
  public getCesPath(...segments: string[]): string {
    // Resolve paths relative to CES
    return path.join(this.integrationConfig.cesRoot, ...segments);
  }
  
  public resolveWorkspacePath(inputPath: string): string {
    // Resolve paths intelligently based on context
    if (path.isAbsolute(inputPath)) {
      return inputPath;
    }
    
    // If in integrated mode, relative paths are relative to host project
    if (this.integrationConfig.mode === 'integrated') {
      return path.join(this.integrationConfig.projectRoot, inputPath);
    }
    
    // Otherwise relative to CES
    return path.join(this.integrationConfig.cesRoot, inputPath);
  }

  /**
   * Get relative path from project root
   */
  public getRelativePath(fullPath: string): string {
    return this.pathResolver.getRelativePath(this.pathResolver.getProjectRoot(), fullPath);
  }

  /**
   * Get absolute path from project-relative path
   */
  public getAbsolutePath(relativePath: string): string {
    return this.pathResolver.resolvePath(relativePath);
  }


  /**
   * Ensure directory exists
   */
  public async ensureDir(dirPath: string): Promise<void> {
    const absolutePath = path.isAbsolute(dirPath) ? dirPath : this.getAbsolutePath(dirPath);
    await fs.ensureDir(absolutePath);
  }

  /**
   * Reload configuration (for hot-reloading)
   */
  public async reloadConfig(): Promise<void> {
    // Re-read .env file
    dotenv.config({ override: true });
    
    // Reload configuration
    this.config = this.loadConfiguration();
    this.configLoadTime = new Date();
    
    console.log('Configuration reloaded successfully');
  }

  /**
   * Validate configuration
   */
  public validateConfig(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate required values
    if (!this.config.projectName) {
      errors.push('Project name is required');
    }

    if (!this.config.instanceId) {
      errors.push('Instance ID is required');
    }

    // Validate numeric ranges
    if (this.config.sessionTimeout < 1000) {
      errors.push('Session timeout must be at least 1000ms');
    }

    if (this.config.maxSessions < 1) {
      errors.push('Max sessions must be at least 1');
    }

    if (this.config.network.defaultPort < 1024 || this.config.network.defaultPort > 65535) {
      errors.push('Default port must be between 1024 and 65535');
    }

    // Validate paths exist
    if (!fs.existsSync(this.config.paths.projectRoot)) {
      errors.push('Project root directory does not exist');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Get configuration metadata
   */
  public getMetadata(): {
    loadTime: Date;
    projectRoot: string;
    cesRoot: string;
    operationMode: 'standalone' | 'integrated';
    nodeEnv: string;
    cesVersion: string;
    pathDetection: any;
    installationType: 'subdirectory' | 'standalone';
  } {
    return {
      loadTime: this.configLoadTime,
      projectRoot: this.integrationConfig.projectRoot,
      cesRoot: this.integrationConfig.cesRoot,
      operationMode: this.integrationConfig.mode,
      nodeEnv: this.config.nodeEnv,
      cesVersion: this.config.cesVersion,
      pathDetection: this.pathResolver.getDetectionInfo(),
      installationType: this.pathResolver.isSubdirectoryInstallation() ? 'subdirectory' : 'standalone',
    };
  }

  /**
   * Get path resolution information for debugging
   */
  public getPathInfo(): any {
    return {
      paths: this.pathResolver.getPaths(),
      detection: this.pathResolver.getDetectionInfo(),
      isSubdirectory: this.pathResolver.isSubdirectoryInstallation(),
      isStandalone: this.pathResolver.isStandaloneInstallation(),
    };
  }
}

// Export singleton instance
export const envConfig = EnvironmentConfigManager.getInstance();