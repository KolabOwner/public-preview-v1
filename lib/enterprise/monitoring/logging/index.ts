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
 * Browser-compatible file transport for structured logging
 * Uses IndexedDB for persistence in browser environments
 */
export class BrowserFileTransport implements LogTransport {
  name = 'file';
  private db: IDBDatabase | null = null;
  private dbName = 'EnterpriseLogsDB';
  private storeName = 'logs';
  private maxEntries = 10000;
  
  constructor(
    private options: {
      maxEntries?: number;
    } = {}
  ) {
    this.maxEntries = options.maxEntries || 10000;
    this.initializeStorage();
  }

  private initializeStorage(): void {
    if (typeof window === 'undefined' || !('indexedDB' in window)) {
      console.warn('IndexedDB not available');
      return;
    }
    
    const dbRequest = indexedDB.open(this.dbName, 1);
    
    dbRequest.onupgradeneeded = (event: any) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(this.storeName)) {
        const store = db.createObjectStore(this.storeName, { 
          keyPath: 'id', 
          autoIncrement: true 
        });
        store.createIndex('timestamp', 'timestamp');
        store.createIndex('level', 'level');
        store.createIndex('component', 'context.component');
      }
    };
    
    dbRequest.onsuccess = (event: any) => {
      this.db = event.target.result;
      // Clean old logs on initialization
      this.cleanOldLogs();
    };
    
    dbRequest.onerror = (event: any) => {
      console.error('Failed to open IndexedDB:', event.target.error);
    };
  }

  async log(entry: LogEntry): Promise<void> {
    if (!this.db) {
      console.warn('IndexedDB not initialized');
      return;
    }
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      
      // Add entry with additional metadata
      const entryWithId = {
        ...entry,
        id: Date.now() + Math.random(),
        browserTimestamp: new Date().toISOString()
      };
      
      const request = store.add(entryWithId);
      
      request.onsuccess = () => {
        // Periodically clean old entries
        if (Math.random() < 0.1) { // 10% chance
          this.cleanOldLogs();
        }
        resolve();
      };
      
      request.onerror = () => {
        console.error('Failed to write log to IndexedDB');
        resolve(); // Don't fail logging
      };
    });
  }

  private async cleanOldLogs(): Promise<void> {
    if (!this.db) return;
    
    const transaction = this.db.transaction([this.storeName], 'readwrite');
    const store = transaction.objectStore(this.storeName);
    const countRequest = store.count();
    
    countRequest.onsuccess = () => {
      const count = countRequest.result;
      
      if (count > this.maxEntries) {
        // Delete oldest entries
        const deleteCount = count - this.maxEntries;
        const index = store.index('timestamp');
        const request = index.openCursor();
        let deleted = 0;
        
        request.onsuccess = (event: any) => {
          const cursor = event.target.result;
          if (cursor && deleted < deleteCount) {
            cursor.delete();
            deleted++;
            cursor.continue();
          }
        };
      }
    };
  }

  async flush(): Promise<void> {
    // IndexedDB writes are already flushed
    return Promise.resolve();
  }
  
  /**
   * Export logs from IndexedDB
   */
  async exportLogs(options?: {
    startDate?: Date;
    endDate?: Date;
    level?: LogLevel;
    component?: string;
  }): Promise<LogEntry[]> {
    if (!this.db) {
      return [];
    }
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const logs: LogEntry[] = [];
      
      const request = store.openCursor();
      
      request.onsuccess = (event: any) => {
        const cursor = event.target.result;
        if (cursor) {
          const entry = cursor.value;
          
          // Apply filters
          let include = true;
          
          if (options?.startDate && new Date(entry.timestamp) < options.startDate) {
            include = false;
          }
          if (options?.endDate && new Date(entry.timestamp) > options.endDate) {
            include = false;
          }
          if (options?.level !== undefined && entry.level < options.level) {
            include = false;
          }
          if (options?.component && entry.context?.component !== options.component) {
            include = false;
          }
          
          if (include) {
            logs.push(entry);
          }
          
          cursor.continue();
        } else {
          resolve(logs);
        }
      };
      
      request.onerror = () => {
        reject(new Error('Failed to export logs'));
      };
    });
  }
}

/**
 * Firestore transport for structured logging
 */
export class FirestoreTransport implements LogTransport {
  name = 'firestore';
  private batchSize = 50;
  private batch: LogEntry[] = [];
  private batchTimeout?: NodeJS.Timeout;
  private batchInterval = 1000; // 1 second
  
  constructor(
    private collectionName: string = 'enterprise_logs',
    private options: {
      batchSize?: number;
      batchInterval?: number;
      ttlDays?: number; // Time to live for logs
    } = {}
  ) {
    this.batchSize = options.batchSize || 50;
    this.batchInterval = options.batchInterval || 1000;
  }

  async log(entry: LogEntry): Promise<void> {
    this.batch.push(entry);
    
    if (this.batch.length >= this.batchSize) {
      await this.flushBatch();
    } else {
      this.scheduleBatchFlush();
    }
  }

  private scheduleBatchFlush(): void {
    if (this.batchTimeout) return;
    
    this.batchTimeout = setTimeout(() => {
      this.flushBatch();
    }, this.batchInterval);
  }

  private async flushBatch(): Promise<void> {
    if (this.batch.length === 0) return;
    
    const entriesToFlush = [...this.batch];
    this.batch = [];
    
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
      this.batchTimeout = undefined;
    }
    
    try {
      // Dynamic import to avoid issues in non-Firebase environments
      const { getFirestore, collection, doc, writeBatch, serverTimestamp } = await import('firebase/firestore');
      const db = getFirestore();
      const logsCollection = collection(db, this.collectionName);
      const batch = writeBatch(db);
      
      for (const entry of entriesToFlush) {
        const docRef = doc(logsCollection);
        const data = {
          ...entry,
          serverTimestamp: serverTimestamp(),
          ttl: this.options.ttlDays 
            ? new Date(Date.now() + this.options.ttlDays * 24 * 60 * 60 * 1000)
            : null
        };
        batch.set(docRef, data);
      }
      
      await batch.commit();
    } catch (error) {
      console.error('Failed to write logs to Firestore:', error);
      // Fallback to console
      for (const entry of entriesToFlush) {
        console.log(JSON.stringify(entry));
      }
    }
  }

  async flush(): Promise<void> {
    await this.flushBatch();
  }
}

// Export singleton logger instance
export const logger = StructuredLogger.getInstance();

// Export browser file transport as FileTransport for compatibility
export { BrowserFileTransport as FileTransport };

// Configure transports based on environment
if (typeof window !== 'undefined') {
  // Browser environment
  logger.addTransport(new ConsoleTransport());
  
  if (process.env.NODE_ENV === 'production') {
    // Add browser file transport (IndexedDB)
    logger.addTransport(new BrowserFileTransport({
      maxEntries: 50000
    }));
    
    // Add Firestore transport for cloud logging
    logger.addTransport(new FirestoreTransport());
  }
} else {
  // Server environment
  if (process.env.NODE_ENV === 'production') {
    // Production: Console + Firestore (server file transport loaded separately if needed)
    logger.addTransport(new ConsoleTransport());
    logger.addTransport(new FirestoreTransport('enterprise_logs', {
      batchSize: 100,
      batchInterval: 5000,
      ttlDays: 30
    }));
    
    // Server-side file logging can be added via a separate server-only module
  } else {
    // Development: Console only
    logger.addTransport(new ConsoleTransport());
  }
}

/**
 * Component-specific logger wrapper
 * Provides a familiar interface while using the singleton logger with context
 */
export class ComponentLogger {
  private contextLogger: ContextualLogger;
  
  constructor(component: string) {
    this.contextLogger = logger.child({ component });
  }
  
  async trace(message: string, metadata?: Record<string, any>): Promise<void> {
    this.contextLogger.trace(message, metadata);
  }
  
  async debug(message: string, metadata?: Record<string, any>): Promise<void> {
    this.contextLogger.debug(message, metadata);
  }
  
  async info(message: string, metadata?: Record<string, any>): Promise<void> {
    this.contextLogger.info(message, metadata);
  }
  
  async warn(message: string, metadata?: Record<string, any>): Promise<void> {
    this.contextLogger.warn(message, metadata);
  }
  
  async error(message: string, metadata?: Record<string, any>): Promise<void> {
    this.contextLogger.error(message, metadata?.error, metadata);
  }
  
  async fatal(message: string, metadata?: Record<string, any>): Promise<void> {
    this.contextLogger.fatal(message, metadata?.error, metadata);
  }
}