/**
 * Enterprise Logging System for CES v2.6.0
 * 
 * Provides structured, configurable logging with:
 * - Multiple transports (file, console)
 * - Log rotation and archival
 * - Environment-based configuration
 * - Structured JSON logging
 * - Performance metrics integration
 */

import winston from 'winston';
import * as path from 'path';
import { envConfig } from '../config/EnvironmentConfig.js';
import type { LogContext, LogMetrics } from '../types/index.js';

class LoggerService {
  private logger!: winston.Logger;
  private metricsBuffer: LogMetrics[] = [];
  private isInitialized: boolean = false;

  constructor() {
    this.initializeLogger();
  }

  private initializeLogger(): void {
    const config = envConfig.getConfig();
    
    // Ensure logs directory exists
    envConfig.ensureDir(config.paths.logsDir);

    // Create winston logger with enterprise configuration
    this.logger = winston.createLogger({
      level: config.logging.level,
      format: this.createLogFormat(),
      defaultMeta: {
        service: 'claude-ecosystem-standard',
        version: config.cesVersion,
        instanceId: config.instanceId,
        environment: config.nodeEnv,
      },
      transports: this.createTransports(),
      exitOnError: false,
    });

    // Add console transport for non-production
    if (config.nodeEnv !== 'production') {
      this.logger.add(new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple()
        )
      }));
    }

    this.isInitialized = true;
  }

  private createLogFormat(): winston.Logform.Format {
    const config = envConfig.getConfig();
    
    if (config.logging.format === 'json') {
      return winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: config.development.errorStackTrace }),
        winston.format.json()
      );
    } else {
      return winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: config.development.errorStackTrace }),
        winston.format.printf((info) => {
          const { timestamp, level, message, component, ...meta } = info;
          const metaString = Object.keys(meta).length ? JSON.stringify(meta) : '';
          const componentString = component ? `[${component}]` : '';
          const durationStr = meta['duration'] ? ` (${meta['duration']}ms)` : '';
          return `${timestamp} [${level.toUpperCase()}] ${componentString} ${message}${durationStr} ${metaString}`;
        })
      );
    }
  }

  private createTransports(): winston.transport[] {
    const config = envConfig.getConfig();
    const transports: winston.transport[] = [];

    // File transport for all logs
    transports.push(new winston.transports.File({
      filename: path.join(config.paths.logsDir, 'ces-combined.log'),
      maxsize: this.parseSize(config.logging.maxSize),
      maxFiles: config.logging.maxFiles,
      tailable: true,
    }));

    // Separate file for errors
    transports.push(new winston.transports.File({
      filename: path.join(config.paths.logsDir, 'ces-error.log'),
      level: 'error',
      maxsize: this.parseSize(config.logging.maxSize),
      maxFiles: config.logging.maxFiles,
      tailable: true,
    }));

    // Performance logs
    transports.push(new winston.transports.File({
      filename: path.join(config.paths.logsDir, 'ces-performance.log'),
      level: 'info',
      maxsize: this.parseSize(config.logging.maxSize),
      maxFiles: config.logging.maxFiles,
      tailable: true,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
        winston.format((info) => {
          // Only log performance-related entries
          return info.duration !== undefined ? info : false;
        })()
      ),
    }));

    return transports;
  }

  private parseSize(sizeString: string): number {
    const units = { KB: 1024, MB: 1024 * 1024, GB: 1024 * 1024 * 1024 };
    const match = sizeString.match(/^(\d+)(KB|MB|GB)$/i);
    
    if (!match || match.length < 3) {
      return 10 * 1024 * 1024; // Default 10MB
    }
    
    const size = match[1];
    const unit = match[2];
    if (!size || !unit) {
      return 10 * 1024 * 1024; // Default 10MB
    }
    return parseInt(size) * units[unit.toUpperCase() as keyof typeof units];
  }

  /**
   * Log info message with optional context
   */
  public info(message: string, context?: LogContext): void {
    this.log('info', message, context);
  }

  /**
   * Log warning message with optional context
   */
  public warn(message: string, context?: LogContext): void {
    this.log('warn', message, context);
  }

  /**
   * Log error message with optional context
   */
  public error(message: string, error?: Error, context?: LogContext): void {
    const logContext: LogContext = {
      ...context,
      error: error ? `${error.name}: ${error.message}${error.stack ? '\n' + error.stack : ''}` : undefined,
    };
    
    this.log('error', message, logContext);
  }

  /**
   * Log debug message with optional context
   */
  public debug(message: string, context?: LogContext): void {
    this.log('debug', message, context);
  }

  /**
   * Log performance metrics
   */
  public performance(action: string, duration: number, success: boolean, context?: LogContext): void {
    const perfContext = {
      ...context,
      action,
      duration,
      success,
      type: 'performance',
    };
    
    this.log('info', `Performance: ${action} ${success ? 'completed' : 'failed'} in ${duration}ms`, perfContext);
    
    // Add to metrics buffer
    const metrics: LogMetrics = {
      timestamp: new Date(),
      level: 'info',
      component: context?.component || 'unknown',
      duration,
      success,
      errorCode: success ? undefined : 'PERFORMANCE_FAILURE',
    };
    this.metricsBuffer.push(metrics);
    
    // Limit buffer size
    if (this.metricsBuffer.length > 1000) {
      this.metricsBuffer.splice(0, 500);
    }
  }

  /**
   * Log session events
   */
  public session(event: string, sessionId: string, context?: LogContext): void {
    this.log('info', `Session ${event}`, {
      ...context,
      sessionId,
      type: 'session',
    });
  }

  /**
   * Log system events
   */
  public system(event: string, context?: LogContext): void {
    this.log('info', `System ${event}`, {
      ...context,
      type: 'system',
    });
  }

  /**
   * Log security events
   */
  public security(event: string, context?: LogContext): void {
    this.log('warn', `Security: ${event}`, {
      ...context,
      type: 'security',
    });
  }

  /**
   * Generic log method
   */
  private log(level: string, message: string, context?: LogContext): void {
    if (!this.isInitialized) {
      console.log(`[Logger not initialized] ${level}: ${message}`);
      return;
    }

    const logEntry = {
      message,
      component: context?.component || 'system',
      sessionId: context?.sessionId,
      userId: context?.userId,
      action: context?.action,
      duration: context?.duration,
      metadata: context?.metadata,
      timestamp: new Date().toISOString(),
    };

    this.logger.log(level, message, logEntry);
  }

  /**
   * Create child logger with default context
   */
  public child(defaultContext: LogContext): ComponentLogger {
    return new ComponentLogger(this, defaultContext);
  }

  /**
   * Get recent metrics for monitoring
   */
  public getMetrics(): LogMetrics[] {
    return [...this.metricsBuffer];
  }

  /**
   * Clear metrics buffer
   */
  public clearMetrics(): void {
    this.metricsBuffer = [];
  }

  /**
   * Flush all logs
   */
  public async flush(): Promise<void> {
    return new Promise((resolve) => {
      this.logger.on('finish', resolve);
      this.logger.end();
    });
  }

  /**
   * Graceful shutdown
   */
  public async shutdown(): Promise<void> {
    this.system('Logger shutdown initiated');
    await this.flush();
  }
}

/**
 * Component-specific logger with default context
 */
export class ComponentLogger {
  constructor(
    private parentLogger: LoggerService,
    private defaultContext: LogContext
  ) {}

  public info(message: string, context?: LogContext): void {
    this.parentLogger.info(message, { ...this.defaultContext, ...context });
  }

  public warn(message: string, context?: LogContext): void {
    this.parentLogger.warn(message, { ...this.defaultContext, ...context });
  }

  public error(message: string, error?: Error, context?: LogContext): void {
    this.parentLogger.error(message, error, { ...this.defaultContext, ...context });
  }

  public debug(message: string, context?: LogContext): void {
    this.parentLogger.debug(message, { ...this.defaultContext, ...context });
  }

  public performance(action: string, duration: number, success: boolean, context?: LogContext): void {
    this.parentLogger.performance(action, duration, success, { ...this.defaultContext, ...context });
  }

  public session(event: string, sessionId: string, context?: LogContext): void {
    this.parentLogger.session(event, sessionId, { ...this.defaultContext, ...context });
  }

  public system(event: string, context?: LogContext): void {
    this.parentLogger.system(event, { ...this.defaultContext, ...context });
  }

  public security(event: string, context?: LogContext): void {
    this.parentLogger.security(event, { ...this.defaultContext, ...context });
  }
}

// Export singleton logger instance
export const logger = new LoggerService();

// Convenience function to create component loggers
export function createLogger(component: string, defaultContext?: Partial<LogContext>): ComponentLogger {
  return logger.child({
    component,
    ...defaultContext,
  });
}