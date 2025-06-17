/**
 * Monitoring utilities for Cloud Functions
 * Provides consistent logging and metrics collection
 */

import { logger as functionsLogger } from 'firebase-functions';

export interface LogContext {
  [key: string]: any;
}

class Logger {
  private defaultContext: LogContext = {};

  setDefaultContext(context: LogContext): void {
    this.defaultContext = { ...this.defaultContext, ...context };
  }

  private formatContext(context?: LogContext): LogContext {
    return {
      ...this.defaultContext,
      ...context,
      timestamp: new Date().toISOString()
    };
  }

  info(message: string, context?: LogContext): void {
    functionsLogger.info(message, this.formatContext(context));
  }

  warn(message: string, context?: LogContext): void {
    functionsLogger.warn(message, this.formatContext(context));
  }

  error(message: string, context?: LogContext): void {
    functionsLogger.error(message, this.formatContext(context));
  }

  debug(message: string, context?: LogContext): void {
    functionsLogger.debug(message, this.formatContext(context));
  }
}

export const logger = new Logger();