import type { LogEntry } from '../../shared/types/domain.types.js';

/**
 * Logger Interface
 */
export interface ILogger {
  debug(message: string, context?: Record<string, unknown>): void;
  info(message: string, context?: Record<string, unknown>): void;
  warn(message: string, context?: Record<string, unknown>): void;
  error(message: string, error?: Error, context?: Record<string, unknown>): void;
  log(level: LogEntry['level'], message: string, context?: Record<string, unknown>): void;
}

/**
 * Console Logger Implementation
 * Simple logger that outputs to console
 */
export class ConsoleLogger implements ILogger {
  constructor(
    private readonly service: string = 'app',
    private readonly enableColors: boolean = true
  ) {}

  debug(message: string, context?: Record<string, unknown>): void {
    this.log('debug', message, context);
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.log('info', message, context);
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.log('warn', message, context);
  }

  error(message: string, error?: Error, context?: Record<string, unknown>): void {
    const errorContext = {
      ...context,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : undefined
    };
    this.log('error', message, errorContext);
  }

  log(level: LogEntry['level'], message: string, context?: Record<string, unknown>): void {
    const timestamp = new Date().toISOString();
    const logEntry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      context: {
        service: this.service,
        ...context
      }
    };

    const formattedMessage = this.formatMessage(logEntry);
    
    switch (level) {
      case 'debug':
        console.debug(formattedMessage);
        break;
      case 'info':
        console.info(formattedMessage);
        break;
      case 'warn':
        console.warn(formattedMessage);
        break;
      case 'error':
        console.error(formattedMessage);
        break;
    }
  }

  private formatMessage(entry: LogEntry): string {
    const timestamp = entry.timestamp.toISOString();
    const level = this.colorize(entry.level.toUpperCase().padEnd(5), entry.level);
    const service = `[${this.service}]`;
    const message = entry.message;
    const context = entry.context && Object.keys(entry.context).length > 0 
      ? JSON.stringify(entry.context, null, 2) 
      : '';

    return `${timestamp} ${level} ${service} ${message}${context ? '\\n' + context : ''}`;
  }

  private colorize(text: string, level: LogEntry['level']): string {
    if (!this.enableColors) return text;

    const colors = {
      debug: '\\x1b[36m', // cyan
      info: '\\x1b[32m',  // green
      warn: '\\x1b[33m',  // yellow
      error: '\\x1b[31m'  // red
    };

    const reset = '\\x1b[0m';
    return `${colors[level]}${text}${reset}`;
  }
}

/**
 * Structured Logger Implementation
 * Outputs structured JSON logs
 */
export class StructuredLogger implements ILogger {
  constructor(private readonly service: string = 'app') {}

  debug(message: string, context?: Record<string, unknown>): void {
    this.log('debug', message, context);
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.log('info', message, context);
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.log('warn', message, context);
  }

  error(message: string, error?: Error, context?: Record<string, unknown>): void {
    const errorContext = {
      ...context,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : undefined
    };
    this.log('error', message, errorContext);
  }

  log(level: LogEntry['level'], message: string, context?: Record<string, unknown>): void {
    const logEntry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      context: {
        service: this.service,
        ...context
      }
    };

    console.log(JSON.stringify(logEntry));
  }
}

/**
 * Logger Factory
 * Creates logger instances based on environment
 */
export class LoggerFactory {
  static create(service: string, type: 'console' | 'structured' = 'console'): ILogger {
    switch (type) {
      case 'structured':
        return new StructuredLogger(service);
      case 'console':
      default:
        return new ConsoleLogger(service);
    }
  }

  static createFromEnv(service: string): ILogger {
    const logFormat = process.env.LOG_FORMAT as 'console' | 'structured' || 'console';
    return this.create(service, logFormat);
  }
}
