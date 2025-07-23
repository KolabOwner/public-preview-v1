import { NextResponse } from 'next/server';
import { unstable_cache } from 'next/cache';

export function withCache<T>(
  fn: (...args: any[]) => Promise<T>,
  keyParts: string[],
  options: { revalidate?: number; tags?: string[] } = {}
) {
  return unstable_cache(
    fn,
    keyParts,
    {
      revalidate: options.revalidate || 300, // 5 minutes default
      tags: options.tags || [],
    }
  );
}

export function createCachedResponse<T>(
  data: T,
  options: {
    maxAge?: number;
    staleWhileRevalidate?: number;
    tags?: string[];
  } = {}
) {
  const response = NextResponse.json(data);
  
  const cacheControl = [
    `max-age=${options.maxAge || 300}`,
    `stale-while-revalidate=${options.staleWhileRevalidate || 86400}`,
    'public'
  ].join(', ');
  
  response.headers.set('Cache-Control', cacheControl);
  
  if (options.tags) {
    response.headers.set('Cache-Tags', options.tags.join(','));
  }
  
  return response;
}

// Request deduplication
const pendingRequests = new Map<string, Promise<any>>();

export function deduplicate<T>(
  key: string,
  fn: () => Promise<T>
): Promise<T> {
  const existing = pendingRequests.get(key);
  if (existing) {
    return existing;
  }

  const promise = fn().finally(() => {
    pendingRequests.delete(key);
  });

  pendingRequests.set(key, promise);
  return promise;
}