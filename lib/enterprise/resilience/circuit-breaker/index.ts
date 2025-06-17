/**
 * Circuit Breaker Pattern Implementation
 * Prevents cascading failures by monitoring and controlling service calls
 */

export enum CircuitState {
  CLOSED = 'CLOSED',     // Normal operation
  OPEN = 'OPEN',         // Failure threshold reached, rejecting calls
  HALF_OPEN = 'HALF_OPEN' // Testing if service recovered
}

export interface CircuitBreakerConfig {
  failureThreshold?: number;      // Number of failures before opening
  successThreshold?: number;      // Number of successes to close from half-open
  timeout?: number;               // Time in ms before trying half-open
  resetTimeout?: number;          // Time to reset failure count
  volumeThreshold?: number;       // Minimum calls before evaluating
  errorThresholdPercentage?: number; // Error percentage to open
  fallback?: () => Promise<any>; // Fallback function when open
}

export interface CircuitBreakerStats {
  state: CircuitState;
  failures: number;
  successes: number;
  totalCalls: number;
  lastFailureTime?: Date;
  lastSuccessTime?: Date;
  errorRate: number;
}

export class CircuitBreaker<T = any> {
  private state: CircuitState = CircuitState.CLOSED;
  private failures = 0;
  private successes = 0;
  private totalCalls = 0;
  private lastFailureTime?: Date;
  private lastSuccessTime?: Date;
  private nextAttempt?: Date;
  private readonly config: Required<CircuitBreakerConfig>;

  constructor(
    private readonly name: string,
    config: CircuitBreakerConfig = {}
  ) {
    this.config = {
      failureThreshold: config.failureThreshold ?? 5,
      successThreshold: config.successThreshold ?? 2,
      timeout: config.timeout ?? 60000, // 1 minute
      resetTimeout: config.resetTimeout ?? 120000, // 2 minutes
      volumeThreshold: config.volumeThreshold ?? 10,
      errorThresholdPercentage: config.errorThresholdPercentage ?? 50,
      fallback: config.fallback ?? (() => Promise.reject(new Error('Circuit breaker is OPEN')))
    };
  }

  /**
   * Executes a function with circuit breaker protection
   */
  async execute<R = T>(fn: () => Promise<R>): Promise<R> {
    // Check if we should reset counters
    this.checkReset();

    // If circuit is open, check if we should try half-open
    if (this.state === CircuitState.OPEN) {
      if (this.shouldAttemptReset()) {
        this.state = CircuitState.HALF_OPEN;
        console.log(`Circuit breaker ${this.name} is HALF_OPEN, testing...`);
      } else {
        console.warn(`Circuit breaker ${this.name} is OPEN, using fallback`);
        return this.config.fallback() as Promise<R>;
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure(error);
      throw error;
    }
  }

  /**
   * Wraps a function with circuit breaker protection
   */
  wrap<F extends (...args: any[]) => Promise<any>>(fn: F): F {
    return (async (...args: Parameters<F>) => {
      return this.execute(() => fn(...args));
    }) as F;
  }

  /**
   * Records a successful call
   */
  private onSuccess(): void {
    this.totalCalls++;
    this.successes++;
    this.lastSuccessTime = new Date();

    if (this.state === CircuitState.HALF_OPEN) {
      if (this.successes >= this.config.successThreshold) {
        this.close();
      }
    }
  }

  /**
   * Records a failed call
   */
  private onFailure(error: any): void {
    this.totalCalls++;
    this.failures++;
    this.lastFailureTime = new Date();

    if (this.state === CircuitState.HALF_OPEN) {
      this.open();
    } else if (this.state === CircuitState.CLOSED) {
      if (this.shouldOpen()) {
        this.open();
      }
    }

    console.error(`Circuit breaker ${this.name} failure:`, error.message);
  }

  /**
   * Opens the circuit
   */
  private open(): void {
    this.state = CircuitState.OPEN;
    this.nextAttempt = new Date(Date.now() + this.config.timeout);
    console.warn(`Circuit breaker ${this.name} is now OPEN`);
  }

  /**
   * Closes the circuit
   */
  private close(): void {
    this.state = CircuitState.CLOSED;
    this.failures = 0;
    this.successes = 0;
    console.log(`Circuit breaker ${this.name} is now CLOSED`);
  }

  /**
   * Checks if circuit should open
   */
  private shouldOpen(): boolean {
    // Not enough calls to evaluate
    if (this.totalCalls < this.config.volumeThreshold) {
      return false;
    }

    // Check failure threshold
    if (this.failures >= this.config.failureThreshold) {
      return true;
    }

    // Check error percentage
    const errorRate = (this.failures / this.totalCalls) * 100;
    return errorRate >= this.config.errorThresholdPercentage;
  }

  /**
   * Checks if we should attempt to reset the circuit
   */
  private shouldAttemptReset(): boolean {
    return this.nextAttempt ? new Date() >= this.nextAttempt : false;
  }

  /**
   * Checks if counters should be reset
   */
  private checkReset(): void {
    const now = Date.now();
    const lastActivity = Math.max(
      this.lastFailureTime?.getTime() || 0,
      this.lastSuccessTime?.getTime() || 0
    );

    if (lastActivity && (now - lastActivity) > this.config.resetTimeout) {
      this.reset();
    }
  }

  /**
   * Resets the circuit breaker
   */
  reset(): void {
    this.state = CircuitState.CLOSED;
    this.failures = 0;
    this.successes = 0;
    this.totalCalls = 0;
    this.lastFailureTime = undefined;
    this.lastSuccessTime = undefined;
    this.nextAttempt = undefined;
    console.log(`Circuit breaker ${this.name} has been reset`);
  }

  /**
   * Gets current statistics
   */
  getStats(): CircuitBreakerStats {
    return {
      state: this.state,
      failures: this.failures,
      successes: this.successes,
      totalCalls: this.totalCalls,
      lastFailureTime: this.lastFailureTime,
      lastSuccessTime: this.lastSuccessTime,
      errorRate: this.totalCalls > 0 ? (this.failures / this.totalCalls) * 100 : 0
    };
  }

  /**
   * Checks if circuit is open
   */
  isOpen(): boolean {
    return this.state === CircuitState.OPEN;
  }

  /**
   * Checks if circuit is closed
   */
  isClosed(): boolean {
    return this.state === CircuitState.CLOSED;
  }

  /**
   * Force opens the circuit
   */
  forceOpen(): void {
    this.open();
  }

  /**
   * Force closes the circuit
   */
  forceClose(): void {
    this.close();
  }
}

/**
 * Circuit Breaker Manager for managing multiple circuit breakers
 */
export class CircuitBreakerManager {
  private readonly breakers = new Map<string, CircuitBreaker>();

  /**
   * Gets or creates a circuit breaker
   */
  getBreaker(name: string, config?: CircuitBreakerConfig): CircuitBreaker {
    if (!this.breakers.has(name)) {
      this.breakers.set(name, new CircuitBreaker(name, config));
    }
    return this.breakers.get(name)!;
  }

  /**
   * Gets all circuit breakers
   */
  getAllBreakers(): Map<string, CircuitBreaker> {
    return new Map(this.breakers);
  }

  /**
   * Gets statistics for all breakers
   */
  getAllStats(): Record<string, CircuitBreakerStats> {
    const stats: Record<string, CircuitBreakerStats> = {};
    for (const [name, breaker] of this.breakers) {
      stats[name] = breaker.getStats();
    }
    return stats;
  }

  /**
   * Resets all circuit breakers
   */
  resetAll(): void {
    for (const breaker of this.breakers.values()) {
      breaker.reset();
    }
  }

  /**
   * Removes a circuit breaker
   */
  remove(name: string): boolean {
    return this.breakers.delete(name);
  }
}

// Global circuit breaker manager instance
export const circuitBreakerManager = new CircuitBreakerManager();