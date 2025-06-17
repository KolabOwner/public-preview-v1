/**
 * Structured Logging Framework
 * Enterprise-grade logging with structured data, correlation IDs, and multiple transports
 */

export enum LogLevel {
  TRACE = 0,
  DEBUG = 1,
  INFO = 2,
  WARN = 3,
  ERROR = 4,
  FATAL = 5
}

export interface LogContext {
  correlationId?: string;
  userId?: string;
  sessionId?: string;
  requestId?: string;
  service?: string;
  environment?: string;
  version?: string;
  [key: string]: any;
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context: LogContext;
  metadata?: Record<string, any>;
  error?: {
    message: string;
    stack?: string;
    code?: string;
  };
  duration?: number;
  tags?: string[];
}

export interface LogTransport {
  name: string;
  log(entry: LogEntry): Promise<void>;
  flush?(): Promise<void>;
}

export class StructuredLogger {
  private static instance: StructuredLogger;
  private transports: LogTransport[] = [];
  private globalContext: LogContext = {};
  private level: LogLevel = LogLevel.INFO;
  private buffer: LogEntry[] = [];
  private bufferSize = 100;
  private flushInterval = 5000;
  private flushTimer?: NodeJS.Timeout;

  private constructor() {
    // Start flush timer
    this.startFlushTimer();
  }

  static getInstance(): StructuredLogger {
    if (!this.instance) {
      this.instance = new StructuredLogger();
    }
    return this.instance;
  }

  /**
   * Sets the minimum log level
   */
  setLevel(level: LogLevel): void {
    this.level = level;
  }

  /**
   * Adds a transport
   */
  addTransport(transport: LogTransport): void {
    this.transports.push(transport);
  }

  /**
   * Sets global context that will be included in all logs
   */
  setGlobalContext(context: LogContext): void {
    this.globalContext = { ...this.globalContext, ...context };
  }

  /**
   * Creates a child logger with additional context
   */
  child(context: LogContext): ContextualLogger {
    return new ContextualLogger(this, context);
  }

  /**
   * Core logging method
   */
  log(
    level: LogLevel,
    message: string,
    metadata?: Record<string, any>,
    context?: LogContext
  ): void {
    if (level < this.level) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: {
        ...this.globalContext,
        ...context,
        correlationId: context?.correlationId || this.generateCorrelationId()
      },
      metadata
    };

    // Extract error if present
    if (metadata?.error || metadata?.err) {
      const error = metadata.error || metadata.err;
      entry.error = {
        message: error.message || String(error),
        stack: error.stack,
        code: error.code
      };
    }

    // Add to buffer
    this.buffer.push(entry);

    // Flush if buffer is full
    if (this.buffer.length >= this.bufferSize) {
      this.flush();
    }
  }

  // Convenience methods
  trace(message: string, metadata?: Record<string, any>, context?: LogContext): void {
    this.log(LogLevel.TRACE, message, metadata, context);
  }

  debug(message: string, metadata?: Record<string, any>, context?: LogContext): void {
    this.log(LogLevel.DEBUG, message, metadata, context);
  }

  info(message: string, metadata?: Record<string, any>, context?: LogContext): void {
    this.log(LogLevel.INFO, message, metadata, context);
  }

  warn(message: string, metadata?: Record<string, any>, context?: LogContext): void {
    this.log(LogLevel.WARN, message, metadata, context);
  }

  error(message: string, error?: any, metadata?: Record<string, any>, context?: LogContext): void {
    this.log(LogLevel.ERROR, message, { ...metadata, error }, context);
  }

  fatal(message: string, error?: any, metadata?: Record<string, any>, context?: LogContext): void {
    this.log(LogLevel.FATAL, message, { ...metadata, error }, context);
    // Immediately flush on fatal
    this.flush();
  }

  /**
   * Logs performance metrics
   */
  perf(operation: string, duration: number, metadata?: Record<string, any>, context?: LogContext): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: LogLevel.INFO,
      message: `Performance: ${operation}`,
      context: { ...this.globalContext, ...context },
      duration,
      metadata: {
        ...metadata,
        operation,
        performance: true
      },
      tags: ['performance']
    };

    this.buffer.push(entry);
  }

  /**
   * Flushes buffered logs to transports
   */
  async flush(): Promise<void> {
    if (this.buffer.length === 0) return;

    const entriesToFlush = [...this.buffer];
    this.buffer = [];

    // Send to all transports
    await Promise.all(
      this.transports.map(async transport => {
        try {
          for (const entry of entriesToFlush) {
            await transport.log(entry);
          }
          if (transport.flush) {
            await transport.flush();
          }
        } catch (error) {
          console.error(`Failed to flush logs to transport ${transport.name}:`, error);
        }
      })
    );
  }

  /**
   * Generates a correlation ID
   */
  private generateCorrelationId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Starts the flush timer
   */
  private startFlushTimer(): void {
    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.flushInterval);
  }

  /**
   * Stops the flush timer
   */
  stopFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
  }
}

/**
 * Contextual logger that includes additional context
 */
export class ContextualLogger {
  constructor(
    private parent: StructuredLogger,
    private context: LogContext
  ) {}

  log(level: LogLevel, message: string, metadata?: Record<string, any>): void {
    this.parent.log(level, message, metadata, this.context);
  }

  trace(message: string, metadata?: Record<string, any>): void {
    this.log(LogLevel.TRACE, message, metadata);
  }

  debug(message: string, metadata?: Record<string, any>): void {
    this.log(LogLevel.DEBUG, message, metadata);
  }

  info(message: string, metadata?: Record<string, any>): void {
    this.log(LogLevel.INFO, message, metadata);
  }

  warn(message: string, metadata?: Record<string, any>): void {
    this.log(LogLevel.WARN, message, metadata);
  }

  error(message: string, error?: any, metadata?: Record<string, any>): void {
    this.log(LogLevel.ERROR, message, { ...metadata, error });
  }

  fatal(message: string, error?: any, metadata?: Record<string, any>): void {
    this.log(LogLevel.FATAL, message, { ...metadata, error });
  }

  perf(operation: string, duration: number, metadata?: Record<string, any>): void {
    this.parent.perf(operation, duration, metadata, this.context);
  }

  child(additionalContext: LogContext): ContextualLogger {
    return new ContextualLogger(this.parent, { ...this.context, ...additionalContext });
  }
}

/**
 * Console transport for structured logging
 */
export class ConsoleTransport implements LogTransport {
  name = 'console';
  private colors = {
    [LogLevel.TRACE]: '\x1b[90m',  // Gray
    [LogLevel.DEBUG]: '\x1b[36m',  // Cyan
    [LogLevel.INFO]: '\x1b[32m',   // Green
    [LogLevel.WARN]: '\x1b[33m',   // Yellow
    [LogLevel.ERROR]: '\x1b[31m',  // Red
    [LogLevel.FATAL]: '\x1b[35m'   // Magenta
  };
  private reset = '\x1b[0m';

  async log(entry: LogEntry): Promise<void> {
    const levelName = LogLevel[entry.level];
    const color = this.colors[entry.level];
    const timestamp = new Date(entry.timestamp).toLocaleTimeString();
    
    let message = `${color}[${timestamp}] [${levelName}]${this.reset} ${entry.message}`;
    
    if (entry.context.correlationId) {
      message += ` ${color}[${entry.context.correlationId}]${this.reset}`;
    }
    
    console.log(message);
    
    if (entry.metadata && Object.keys(entry.metadata).length > 0) {
      console.log('  Metadata:', JSON.stringify(entry.metadata, null, 2));
    }
    
    if (entry.error) {
      console.error('  Error:', entry.error.message);
      if (entry.error.stack) {
        console.error('  Stack:', entry.error.stack);
      }
    }
  }
}

/**
 * File transport for structured logging
 */
export class FileTransport implements LogTransport {
  name = 'file';
  
  constructor(
    private filePath: string,
    private options?: {
      maxSize?: number;
      maxFiles?: number;
      compress?: boolean;
    }
  ) {}

  async log(entry: LogEntry): Promise<void> {
    // In a real implementation, this would write to a file
    // with rotation, compression, etc.
    const line = JSON.stringify(entry) + '\n';
    // await fs.appendFile(this.filePath, line);
  }
}

// Export singleton logger instance
export const logger = StructuredLogger.getInstance();

// Add default console transport in development
if (process.env.NODE_ENV !== 'production') {
  logger.addTransport(new ConsoleTransport());
}