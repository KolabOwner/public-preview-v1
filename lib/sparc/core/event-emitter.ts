import { EventEmitter } from 'events';
import { SparcEvent } from '../types';
import { EventType } from '../constants';
import { Logger } from '../utils/logger';

export class SparcEventEmitter extends EventEmitter {
  private logger: Logger;
  private eventHistory: SparcEvent[] = [];
  private maxHistorySize: number = 1000;

  constructor() {
    super();
    this.logger = new Logger('SparcEventEmitter');
    this.setMaxListeners(50); // Increase max listeners for complex workflows
  }

  emit(event: string | symbol, ...args: any[]): boolean {
    // Log event
    this.logger.debug(`Event emitted: ${String(event)}`, args[0]);

    // Store in history
    this.addToHistory({
      type: String(event),
      timestamp: new Date(),
      phase: args[0]?.phase,
      agent: args[0]?.agent,
      data: args[0]
    });

    // Call parent emit
    return super.emit(event, ...args);
  }

  emitTyped(eventType: EventType, data: any): boolean {
    return this.emit(eventType, data);
  }

  onAny(listener: (event: string, data: any) => void): void {
    // Listen to all events
    const allEvents = Object.values(EventType);
    
    allEvents.forEach(event => {
      this.on(event, (data) => listener(event, data));
    });
  }

  offAny(listener: (event: string, data: any) => void): void {
    const allEvents = Object.values(EventType);
    
    allEvents.forEach(event => {
      this.off(event, listener);
    });
  }

  private addToHistory(event: SparcEvent): void {
    this.eventHistory.push(event);
    
    // Trim history if it exceeds max size
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory = this.eventHistory.slice(-this.maxHistorySize);
    }
  }

  getHistory(filter?: {
    type?: string;
    phase?: string;
    agent?: string;
    since?: Date;
  }): SparcEvent[] {
    let history = [...this.eventHistory];

    if (filter) {
      if (filter.type) {
        history = history.filter(e => e.type === filter.type);
      }
      if (filter.phase) {
        history = history.filter(e => e.phase === filter.phase);
      }
      if (filter.agent) {
        history = history.filter(e => e.agent === filter.agent);
      }
      if (filter.since) {
        history = history.filter(e => e.timestamp >= filter.since);
      }
    }

    return history;
  }

  clearHistory(): void {
    this.eventHistory = [];
    this.logger.debug('Event history cleared');
  }

  getEventStats(): Record<string, number> {
    const stats: Record<string, number> = {};
    
    this.eventHistory.forEach(event => {
      stats[event.type] = (stats[event.type] || 0) + 1;
    });

    return stats;
  }

  setMaxHistorySize(size: number): void {
    this.maxHistorySize = size;
    
    // Trim existing history if needed
    if (this.eventHistory.length > size) {
      this.eventHistory = this.eventHistory.slice(-size);
    }
  }

  // Convenience methods for common events
  emitPhaseStart(phase: string, progress: number): void {
    this.emitTyped(EventType.PHASE_START, { phase, progress });
  }

  emitPhaseComplete(phase: string, result: any, progress: number): void {
    this.emitTyped(EventType.PHASE_COMPLETE, { phase, result, progress });
  }

  emitPhaseFailed(phase: string, error: Error, progress: number): void {
    this.emitTyped(EventType.PHASE_FAILED, { phase, error, progress });
  }

  emitTaskStart(task: any): void {
    this.emitTyped(EventType.TASK_START, { task });
  }

  emitTaskComplete(task: any, result: any): void {
    this.emitTyped(EventType.TASK_COMPLETE, { task, result });
  }

  emitTaskFailed(task: any, error: Error): void {
    this.emitTyped(EventType.TASK_FAILED, { task, error });
  }

  emitAgentDecision(agent: string, decision: any, taskId: string): void {
    this.emitTyped(EventType.AGENT_DECISION, { agent, decision, taskId });
  }

  emitProgress(message: string, progress: number, details?: any): void {
    this.emitTyped(EventType.PROGRESS_UPDATE, { message, progress, ...details });
  }

  emitError(error: Error, context: string): void {
    this.emitTyped(EventType.ERROR_OCCURRED, { error, context });
  }
}