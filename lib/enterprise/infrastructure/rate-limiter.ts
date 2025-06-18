/**
 * Rate Limiter Implementation
 * Provides rate limiting functionality for API calls and other operations
 * Uses sliding window algorithm for accurate rate limiting
 */

import { logger } from '../monitoring/logging';
import { cache } from './cache';

/**
 * Rate limiter configuration
 */
export interface RateLimiterOptions {
  /**
   * Time window in milliseconds
   */
  windowMs: number;

  /**
   * Maximum number of requests in the window
   */
  max: number;

  /**
   * Function to generate cache key for the request
   */
  keyGenerator: (context?: any) => string;

  /**
   * Custom message when rate limit is exceeded
   */
  message?: string;

  /**
   * Whether to use sliding window (true) or fixed window (false)
   */
  sliding?: boolean;

  /**
   * Skip rate limiting if this function returns true
   */
  skip?: (context?: any) => boolean;

  /**
   * Custom handler when rate limit is exceeded
   */
  onLimitReached?: (key: string, limit: number, window: number) => void;
}

/**
 * Rate limit exceeded error
 */
export class RateLimitExceededError extends Error {
  constructor(
    message: string,
    public limit: number,
    public window: number,
    public retryAfter?: number
  ) {
    super(message);
    this.name = 'RateLimitExceededError';
  }
}

/**
 * Rate limiter implementation using sliding window algorithm
 */
export class RateLimiter {
  private options: Required<RateLimiterOptions>;

  constructor(options: RateLimiterOptions) {
    this.options = {
      windowMs: options.windowMs,
      max: options.max,
      keyGenerator: options.keyGenerator,
      message: options.message || 'Rate limit exceeded',
      sliding: options.sliding !== false,
      skip: options.skip || (() => false),
      onLimitReached: options.onLimitReached || (() => {})
    };
  }

  /**
   * Check if request is within rate limit
   */
  async checkLimit(context?: any): Promise<void> {
    // Skip rate limiting if configured to do so
    if (this.options.skip(context)) {
      return;
    }

    const key = this.options.keyGenerator(context);
    const now = Date.now();

    if (this.options.sliding) {
      await this.checkSlidingWindow(key, now);
    } else {
      await this.checkFixedWindow(key, now);
    }
  }

  /**
   * Get current rate limit status
   */
  async getStatus(context?: any): Promise<{
    limit: number;
    remaining: number;
    resetTime: number;
    retryAfter?: number;
  }> {
    const key = this.options.keyGenerator(context);
    const now = Date.now();

    if (this.options.sliding) {
      return this.getSlidingWindowStatus(key, now);
    } else {
      return this.getFixedWindowStatus(key, now);
    }
  }

  /**
   * Reset rate limit for a specific key
   */
  async reset(context?: any): Promise<void> {
    const key = this.options.keyGenerator(context);
    await cache.del(key);
    
    if (this.options.sliding) {
      await cache.del(`${key}:requests`);
    }
  }

  /**
   * Sliding window rate limiting
   */
  private async checkSlidingWindow(key: string, now: number): Promise<void> {
    const requestsKey = `${key}:requests`;
    
    // Get existing requests in the window
    const requests = await this.getRequestsInWindow(requestsKey, now);
    
    if (requests.length >= this.options.max) {
      const oldestRequest = requests[0];
      const retryAfter = Math.ceil((oldestRequest + this.options.windowMs - now) / 1000);
      
      this.options.onLimitReached(key, this.options.max, this.options.windowMs);
      
      logger.warn('Rate limit exceeded', {
        key,
        limit: this.options.max,
        window: this.options.windowMs,
        retryAfter
      });
      
      throw new RateLimitExceededError(
        this.options.message,
        this.options.max,
        this.options.windowMs,
        retryAfter
      );
    }

    // Add current request
    requests.push(now);
    
    // Store updated requests list
    await cache.set(
      requestsKey,
      requests,
      Math.ceil(this.options.windowMs / 1000)
    );
  }

  /**
   * Fixed window rate limiting
   */
  private async checkFixedWindow(key: string, now: number): Promise<void> {
    const windowStart = Math.floor(now / this.options.windowMs) * this.options.windowMs;
    const windowKey = `${key}:${windowStart}`;
    
    const currentCount = await cache.get(windowKey) as number || 0;
    
    if (currentCount >= this.options.max) {
      const retryAfter = Math.ceil((windowStart + this.options.windowMs - now) / 1000);
      
      this.options.onLimitReached(key, this.options.max, this.options.windowMs);
      
      logger.warn('Rate limit exceeded', {
        key,
        limit: this.options.max,
        window: this.options.windowMs,
        retryAfter
      });
      
      throw new RateLimitExceededError(
        this.options.message,
        this.options.max,
        this.options.windowMs,
        retryAfter
      );
    }

    // Increment counter
    await cache.set(
      windowKey,
      currentCount + 1,
      Math.ceil(this.options.windowMs / 1000)
    );
  }

  /**
   * Get sliding window status
   */
  private async getSlidingWindowStatus(key: string, now: number): Promise<{
    limit: number;
    remaining: number;
    resetTime: number;
    retryAfter?: number;
  }> {
    const requestsKey = `${key}:requests`;
    const requests = await this.getRequestsInWindow(requestsKey, now);
    
    const remaining = Math.max(0, this.options.max - requests.length);
    const oldestRequest = requests.length > 0 ? requests[0] : now;
    const resetTime = oldestRequest + this.options.windowMs;
    
    return {
      limit: this.options.max,
      remaining,
      resetTime,
      retryAfter: remaining === 0 ? Math.ceil((resetTime - now) / 1000) : undefined
    };
  }

  /**
   * Get fixed window status
   */
  private async getFixedWindowStatus(key: string, now: number): Promise<{
    limit: number;
    remaining: number;
    resetTime: number;
    retryAfter?: number;
  }> {
    const windowStart = Math.floor(now / this.options.windowMs) * this.options.windowMs;
    const windowKey = `${key}:${windowStart}`;
    const resetTime = windowStart + this.options.windowMs;
    
    const currentCount = await cache.get(windowKey) as number || 0;
    const remaining = Math.max(0, this.options.max - currentCount);
    
    return {
      limit: this.options.max,
      remaining,
      resetTime,
      retryAfter: remaining === 0 ? Math.ceil((resetTime - now) / 1000) : undefined
    };
  }

  /**
   * Get requests within the current window for sliding window algorithm
   */
  private async getRequestsInWindow(requestsKey: string, now: number): Promise<number[]> {
    const requests = await cache.get(requestsKey) as number[] || [];
    const windowStart = now - this.options.windowMs;
    
    // Filter out requests outside the window
    return requests.filter(timestamp => timestamp > windowStart);
  }
}

/**
 * Create a rate limiter with common API patterns
 */
export function createAPIRateLimiter(
  name: string,
  maxRequests: number,
  windowMs: number = 60000
): RateLimiter {
  return new RateLimiter({
    windowMs,
    max: maxRequests,
    keyGenerator: () => `api:${name}`,
    message: `API rate limit exceeded for ${name}`,
    sliding: true,
    onLimitReached: (key, limit, window) => {
      logger.warn(`API rate limit exceeded`, {
        api: name,
        key,
        limit,
        window: window / 1000
      });
    }
  });
}

/**
 * Create a user-specific rate limiter
 */
export function createUserRateLimiter(
  operation: string,
  maxRequests: number,
  windowMs: number = 60000
): RateLimiter {
  return new RateLimiter({
    windowMs,
    max: maxRequests,
    keyGenerator: (userId: string) => `user:${userId}:${operation}`,
    message: `Rate limit exceeded for ${operation}`,
    sliding: true,
    onLimitReached: (key, limit, window) => {
      logger.warn(`User rate limit exceeded`, {
        operation,
        key,
        limit,
        window: window / 1000
      });
    }
  });
}

/**
 * Create an IP-based rate limiter
 */
export function createIPRateLimiter(
  maxRequests: number,
  windowMs: number = 60000
): RateLimiter {
  return new RateLimiter({
    windowMs,
    max: maxRequests,
    keyGenerator: (ip: string) => `ip:${ip}`,
    message: 'Rate limit exceeded',
    sliding: true,
    onLimitReached: (key, limit, window) => {
      logger.warn(`IP rate limit exceeded`, {
        key,
        limit,
        window: window / 1000
      });
    }
  });
}

/**
 * Global rate limiters for common use cases
 */
export const commonRateLimiters = {
  // General API rate limiter
  api: createAPIRateLimiter('general', 1000, 60000), // 1000 requests per minute
  
  // Authentication attempts
  auth: createUserRateLimiter('auth', 5, 60000), // 5 attempts per minute per user
  
  // File uploads
  upload: createUserRateLimiter('upload', 10, 60000), // 10 uploads per minute per user
  
  // Search operations
  search: createUserRateLimiter('search', 100, 60000), // 100 searches per minute per user
  
  // External API calls
  external: createAPIRateLimiter('external', 500, 60000), // 500 external calls per minute
};