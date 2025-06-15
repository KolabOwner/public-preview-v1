import chalk from 'chalk';

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
  TRACE = 4
}

export interface LoggerOptions {
  level?: LogLevel;
  prefix?: string;
  colors?: boolean;
  timestamp?: boolean;
  verbose?: boolean;
}

export class Logger {
  private level: LogLevel;
  private prefix: string;
  private colors: boolean;
  private timestamp: boolean;
  private static globalLevel: LogLevel = LogLevel.INFO;

  constructor(name: string, options: LoggerOptions = {}) {
    this.prefix = options.prefix || name;
    this.level = options.level ?? Logger.globalLevel;
    this.colors = options.colors ?? true;
    this.timestamp = options.timestamp ?? true;

    if (options.verbose) {
      this.level = LogLevel.DEBUG;
    }
  }

  static setGlobalLevel(level: LogLevel): void {
    Logger.globalLevel = level;
  }

  setLevel(level: LogLevel): void {
    this.level = level;
  }

  error(message: string, error?: any): void {
    if (this.level >= LogLevel.ERROR) {
      const formatted = this.format(message, 'error');
      console.error(formatted);
      
      if (error) {
        if (error instanceof Error) {
          console.error(this.colorize(error.stack || error.message, 'error'));
        } else {
          console.error(this.colorize(JSON.stringify(error, null, 2), 'error'));
        }
      }
    }
  }

  warn(message: string, data?: any): void {
    if (this.level >= LogLevel.WARN) {
      const formatted = this.format(message, 'warn');
      console.warn(formatted);
      
      if (data) {
        console.warn(this.colorize(this.stringify(data), 'warn'));
      }
    }
  }

  info(message: string, data?: any): void {
    if (this.level >= LogLevel.INFO) {
      const formatted = this.format(message, 'info');
      console.log(formatted);
      
      if (data) {
        console.log(this.colorize(this.stringify(data), 'info'));
      }
    }
  }

  debug(message: string, data?: any): void {
    if (this.level >= LogLevel.DEBUG) {
      const formatted = this.format(message, 'debug');
      console.log(formatted);
      
      if (data) {
        console.log(this.colorize(this.stringify(data), 'debug'));
      }
    }
  }

  trace(message: string, data?: any): void {
    if (this.level >= LogLevel.TRACE) {
      const formatted = this.format(message, 'trace');
      console.log(formatted);
      
      if (data) {
        console.log(this.colorize(this.stringify(data), 'trace'));
      }
    }
  }

  private format(message: string, level: string): string {
    const parts: string[] = [];

    if (this.timestamp) {
      const time = new Date().toISOString();
      parts.push(this.colorize(`[${time}]`, 'timestamp'));
    }

    parts.push(this.colorize(`[${level.toUpperCase()}]`, level));
    parts.push(this.colorize(`[${this.prefix}]`, 'prefix'));
    parts.push(message);

    return parts.join(' ');
  }

  private colorize(text: string, type: string): string {
    if (!this.colors) {
      return text;
    }

    switch (type) {
      case 'error':
        return chalk.red(text);
      case 'warn':
        return chalk.yellow(text);
      case 'info':
        return chalk.blue(text);
      case 'debug':
        return chalk.green(text);
      case 'trace':
        return chalk.gray(text);
      case 'timestamp':
        return chalk.gray(text);
      case 'prefix':
        return chalk.cyan(text);
      default:
        return text;
    }
  }

  private stringify(data: any): string {
    if (typeof data === 'string') {
      return data;
    }
    
    try {
      return JSON.stringify(data, null, 2);
    } catch (error) {
      return String(data);
    }
  }

  // Utility methods for common logging patterns
  logPhase(phase: string, status: 'start' | 'complete' | 'failed'): void {
    const icon = status === 'start' ? '🚀' : 
                 status === 'complete' ? '✅' : '❌';
    
    this.info(`${icon} Phase ${phase} - ${status}`);
  }

  logTask(taskId: string, taskName: string, status: 'start' | 'complete' | 'failed'): void {
    const icon = status === 'start' ? '▶️' : 
                 status === 'complete' ? '✓' : '✗';
    
    this.debug(`  ${icon} Task ${taskId}: ${taskName} - ${status}`);
  }

  logAgent(agent: string, action: string, details?: any): void {
    this.debug(`🤖 [${agent}] ${action}`, details);
  }

  logMetric(name: string, value: number, unit?: string): void {
    const unitStr = unit ? ` ${unit}` : '';
    this.info(`📊 ${name}: ${value}${unitStr}`);
  }

  logProgress(progress: number, message?: string): void {
    const bar = this.createProgressBar(progress);
    const msg = message ? ` - ${message}` : '';
    this.info(`Progress: ${bar} ${progress.toFixed(0)}%${msg}`);
  }

  private createProgressBar(progress: number, width: number = 20): string {
    const filled = Math.round((progress / 100) * width);
    const empty = width - filled;
    
    return '[' + '█'.repeat(filled) + '░'.repeat(empty) + ']';
  }

  // Child logger creation
  child(name: string, options?: LoggerOptions): Logger {
    return new Logger(`${this.prefix}:${name}`, {
      level: options?.level ?? this.level,
      colors: options?.colors ?? this.colors,
      timestamp: options?.timestamp ?? this.timestamp,
      ...options
    });
  }
}

// Create a default logger instance
export const defaultLogger = new Logger('SPARC');