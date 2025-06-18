/**
 * Simple in-memory cache implementation for enterprise features
 */

interface CacheEntry<T> {
  value: T;
  expires: number;
}

class SimpleCache {
  private store: Map<string, CacheEntry<any>> = new Map();
  private cleanupInterval: NodeJS.Timer;

  constructor() {
    // Run cleanup every 5 minutes
    this.cleanupInterval = setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  /**
   * Get a value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    const entry = this.store.get(key);
    
    if (!entry) {
      return null;
    }

    if (Date.now() > entry.expires) {
      this.store.delete(key);
      return null;
    }

    return entry.value;
  }

  /**
   * Set a value in cache with TTL
   */
  async set<T>(key: string, value: T, ttl: number = 3600): Promise<void> {
    const expires = Date.now() + (ttl * 1000);
    this.store.set(key, { value, expires });
  }

  /**
   * Delete a value from cache
   */
  async del(key: string): Promise<void> {
    this.store.delete(key);
  }

  /**
   * Clear all cache entries
   */
  async clear(): Promise<void> {
    this.store.clear();
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.store.size;
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.expires) {
        this.store.delete(key);
      }
    }
  }

  /**
   * Destroy cache and cleanup
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.store.clear();
  }
}

// Export singleton instance
export const cache = new SimpleCache();

// Export class for testing
export { SimpleCache };