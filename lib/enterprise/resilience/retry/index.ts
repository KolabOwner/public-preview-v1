/**
 * Advanced Retry Strategies
 * Implements various retry patterns with backoff strategies
 */

export interface RetryConfig {
  maxAttempts?: number;
  initialDelay?: number;
  maxDelay?: number;
  factor?: number;
  jitter?: boolean;
  timeout?: number;
  retryIf?: (error: any) => boolean;
  onRetry?: (error: any, attempt: number) => void;
}

export enum BackoffStrategy {
  FIXED = 'FIXED',
  LINEAR = 'LINEAR',
  EXPONENTIAL = 'EXPONENTIAL',
  FIBONACCI = 'FIBONACCI',
  CUSTOM = 'CUSTOM'
}

export interface RetryResult<T> {
  success: boolean;
  result?: T;
  error?: any;
  attempts: number;
  totalTime: number;
}

export class RetryPolicy {
  private readonly config: Required<RetryConfig>;
  private fibonacciSequence = [1, 1];

  constructor(config: RetryConfig = {}) {
    this.config = {
      maxAttempts: config.maxAttempts ?? 3,
      initialDelay: config.initialDelay ?? 1000,
      maxDelay: config.maxDelay ?? 30000,
      factor: config.factor ?? 2,
      jitter: config.jitter ?? true,
      timeout: config.timeout ?? 120000,
      retryIf: config.retryIf ?? (() => true),
      onRetry: config.onRetry ?? (() => {})
    };
  }

  /**
   * Executes a function with retry logic
   */
  async execute<T>(
    fn: () => Promise<T>,
    strategy: BackoffStrategy = BackoffStrategy.EXPONENTIAL
  ): Promise<RetryResult<T>> {
    const startTime = Date.now();
    let lastError: any;

    for (let attempt = 1; attempt <= this.config.maxAttempts; attempt++) {
      try {
        // Add timeout wrapper
        const result = await this.withTimeout(fn(), this.config.timeout);
        
        return {
          success: true,
          result,
          attempts: attempt,
          totalTime: Date.now() - startTime
        };
      } catch (error) {
        lastError = error;
        
        // Check if we should retry
        if (!this.config.retryIf(error)) {
          break;
        }

        // Don't retry on last attempt
        if (attempt < this.config.maxAttempts) {
          const delay = this.calculateDelay(attempt, strategy);
          this.config.onRetry(error, attempt);
          
          console.log(
            `Retry attempt ${attempt}/${this.config.maxAttempts} after ${delay}ms delay. ` +
            `Error: ${error instanceof Error ? error.message : String(error)}`
          );
          
          await this.sleep(delay);
        }
      }
    }

    return {
      success: false,
      error: lastError,
      attempts: this.config.maxAttempts,
      totalTime: Date.now() - startTime
    };
  }

  /**
   * Calculates delay based on strategy
   */
  private calculateDelay(attempt: number, strategy: BackoffStrategy): number {
    let baseDelay: number;

    switch (strategy) {
      case BackoffStrategy.FIXED:
        baseDelay = this.config.initialDelay;
        break;
      
      case BackoffStrategy.LINEAR:
        baseDelay = this.config.initialDelay * attempt;
        break;
      
      case BackoffStrategy.EXPONENTIAL:
        baseDelay = this.config.initialDelay * Math.pow(this.config.factor, attempt - 1);
        break;
      
      case BackoffStrategy.FIBONACCI:
        baseDelay = this.config.initialDelay * this.getFibonacci(attempt);
        break;
      
      default:
        baseDelay = this.config.initialDelay;
    }

    // Apply max delay cap
    baseDelay = Math.min(baseDelay, this.config.maxDelay);

    // Apply jitter if enabled
    if (this.config.jitter) {
      const jitterAmount = baseDelay * 0.1 * (Math.random() * 2 - 1); // ±10%
      baseDelay += jitterAmount;
    }

    return Math.round(baseDelay);
  }

  /**
   * Gets fibonacci number for given position
   */
  private getFibonacci(n: number): number {
    while (this.fibonacciSequence.length < n) {
      const len = this.fibonacciSequence.length;
      this.fibonacciSequence.push(
        this.fibonacciSequence[len - 1] + this.fibonacciSequence[len - 2]
      );
    }
    return this.fibonacciSequence[n - 1];
  }

  /**
   * Wraps a promise with timeout
   */
  private async withTimeout<T>(promise: Promise<T>, timeout: number): Promise<T> {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(`Operation timed out after ${timeout}ms`)), timeout);
    });

    return Promise.race([promise, timeoutPromise]);
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Decorator for retry logic
 */
export function Retry(config?: RetryConfig, strategy?: BackoffStrategy) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const retryPolicy = new RetryPolicy(config);

    descriptor.value = async function (...args: any[]) {
      const result = await retryPolicy.execute(
        () => originalMethod.apply(this, args),
        strategy
      );

      if (!result.success) {
        throw result.error;
      }

      return result.result;
    };

    return descriptor;
  };
}

/**
 * Retry utilities for common scenarios
 */
export class RetryUtils {
  /**
   * Retry for network errors
   */
  static networkRetry(config?: Partial<RetryConfig>): RetryPolicy {
    return new RetryPolicy({
      maxAttempts: 5,
      initialDelay: 1000,
      maxDelay: 10000,
      factor: 2,
      jitter: true,
      retryIf: (error) => {
        // Retry on network errors
        return error.code === 'ECONNREFUSED' ||
               error.code === 'ETIMEDOUT' ||
               error.code === 'ENOTFOUND' ||
               error.message.includes('fetch failed') ||
               error.message.includes('Network request failed');
      },
      ...config
    });
  }

  /**
   * Retry for rate limit errors
   */
  static rateLimitRetry(config?: Partial<RetryConfig>): RetryPolicy {
    return new RetryPolicy({
      maxAttempts: 3,
      initialDelay: 60000, // Start with 1 minute
      factor: 2,
      jitter: false,
      retryIf: (error) => {
        // Retry on 429 or rate limit errors
        return error.status === 429 || 
               error.code === 'RATE_LIMIT_EXCEEDED' ||
               error.message.includes('rate limit');
      },
      onRetry: (error, attempt) => {
        // Check for Retry-After header
        const retryAfter = error.headers?.['retry-after'];
        if (retryAfter) {
          console.log(`Rate limited. Retry after: ${retryAfter} seconds`);
        }
      },
      ...config
    });
  }

  /**
   * Retry for database errors
   */
  static databaseRetry(config?: Partial<RetryConfig>): RetryPolicy {
    return new RetryPolicy({
      maxAttempts: 3,
      initialDelay: 100,
      maxDelay: 5000,
      factor: 2,
      jitter: true,
      retryIf: (error) => {
        // Retry on transient database errors
        return error.code === 'ECONNRESET' ||
               error.code === 'EPIPE' ||
               error.message.includes('deadlock') ||
               error.message.includes('timeout') ||
               error.message.includes('connection lost');
      },
      ...config
    });
  }
}

/**
 * Bulk retry for multiple operations
 */
export class BulkRetry {
  constructor(private retryPolicy: RetryPolicy) {}

  /**
   * Executes multiple operations with retry
   */
  async executeAll<T>(
    operations: Array<() => Promise<T>>,
    options?: {
      concurrency?: number;
      stopOnError?: boolean;
    }
  ): Promise<Array<RetryResult<T>>> {
    const { concurrency = 5, stopOnError = false } = options || {};
    const results: Array<RetryResult<T>> = [];
    
    // Process in batches
    for (let i = 0; i < operations.length; i += concurrency) {
      const batch = operations.slice(i, i + concurrency);
      const batchResults = await Promise.all(
        batch.map(op => this.retryPolicy.execute(op))
      );
      
      results.push(...batchResults);
      
      // Check if we should stop on error
      if (stopOnError && batchResults.some(r => !r.success)) {
        break;
      }
    }
    
    return results;
  }
}
// Export alias for compatibility
export { RetryPolicy as RetryManager };
