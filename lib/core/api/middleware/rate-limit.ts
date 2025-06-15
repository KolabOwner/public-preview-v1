// lib/core/api/middleware/rate-limit.ts

import { NextRequest, NextResponse } from 'next/server';
import admin from 'firebase-admin';
import Redis from 'ioredis';
import { ERROR_MESSAGES, RATE_LIMITS, REDIS_CONFIG } from '@/lib/config/constants';


// Initialize Redis client
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0'),
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  keepAlive: 30000,
  connectTimeout: 10000,
  commandTimeout: 5000,
  family: 4,
  retryStrategy: (times) => {
    return Math.min(times * 100, 2000);
  },
});

redis.on('connect', () => {
  console.log('Connected to Redis');
});

redis.on('error', (err) => {
  console.error('Redis connection error:', err);
});

redis.on('ready', () => {
  console.log('Redis ready');
});

redis.on('reconnecting', () => {
  console.log('Reconnecting to Redis');
});

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (request: NextRequest) => Promise<string>;
  keyPrefix?: string;
}

interface RateLimitResult {
  totalHits: number;
  totalTime: number;
  remainingPoints: number;
  msBeforeNext: number;
}

async function getClientId(request: NextRequest): Promise<string> {
  // Try to get authenticated user ID first (most accurate)
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.split('Bearer ')[1];
      const decodedToken = await admin.auth().verifyIdToken(token);
      return `user:${decodedToken.uid}`;
    } catch {
      // Token invalid, fall back to IP
    }
  }

  // Fall back to IP address with proper header handling
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const remoteAddr = request.headers.get('remote-addr');
  
  let ip = 'unknown';
  if (forwarded) {
    ip = forwarded.split(',')[0].trim();
  } else if (realIp) {
    ip = realIp.trim();
  } else if (remoteAddr) {
    ip = remoteAddr.trim();
  }
  
  return `ip:${ip}`;
}

export function createRateLimit(config: RateLimitConfig) {
  const {
    maxRequests,
    windowMs,
    skipSuccessfulRequests = false,
    skipFailedRequests = false,
    keyGenerator = getClientId,
    keyPrefix = 'rate_limit',
  } = config;

  // Lua script for atomic rate limiting operations
  const luaScript = `
    local key = KEYS[1]
    local window = tonumber(ARGV[1])
    local limit = tonumber(ARGV[2])
    local current_time = tonumber(ARGV[3])
    
    -- Remove expired entries
    redis.call('ZREMRANGEBYSCORE', key, 0, current_time - window)
    
    -- Count current requests
    local current_requests = redis.call('ZCARD', key)
    
    if current_requests < limit then
        -- Add current request
        redis.call('ZADD', key, current_time, current_time .. ':' .. math.random())
        redis.call('EXPIRE', key, math.ceil(window / 1000))
        return {current_requests + 1, limit - current_requests - 1, 0}
    else
        -- Get the oldest request time
        local oldest = redis.call('ZRANGE', key, 0, 0, 'WITHSCORES')
        local reset_time = 0
        if oldest[2] then
            reset_time = math.max(0, (tonumber(oldest[2]) + window) - current_time)
        end
        return {current_requests, 0, reset_time}
    end
  `;

  return async function rateLimitMiddleware(
    request: NextRequest,
    response?: NextResponse
  ): Promise<{ success: true; result: RateLimitResult } | { success: false; response: NextResponse }> {
    try {
      const key = await keyGenerator(request);
      const fullKey = `${keyPrefix}:${key}`;
      const now = Date.now();

      // Check if request should be counted
      let shouldCount = true;
      
      if (response) {
        const status = response.status;
        if (skipSuccessfulRequests && status >= 200 && status < 300) {
          shouldCount = false;
        }
        if (skipFailedRequests && (status >= 400 || status < 200)) {
          shouldCount = false;
        }
      }

      if (!shouldCount) {
        // Don't count this request, just return current status
        const currentCount = await redis.zcard(fullKey);
        return {
          success: true,
          result: {
            totalHits: currentCount,
            totalTime: windowMs,
            remainingPoints: Math.max(0, maxRequests - currentCount),
            msBeforeNext: 0,
          },
        };
      }

      // Execute rate limiting logic atomically
      const result = await redis.eval(
        luaScript,
        1,
        fullKey,
        windowMs.toString(),
        maxRequests.toString(),
        now.toString()
      ) as [number, number, number];

      const [totalHits, remainingPoints, msBeforeNext] = result;

      const rateLimitResult: RateLimitResult = {
        totalHits,
        totalTime: windowMs,
        remainingPoints,
        msBeforeNext,
      };

      // Check if limit exceeded
      if (remainingPoints <= 0) {
        const retryAfter = Math.ceil(msBeforeNext / 1000);
        
        return {
          success: false,
          response: NextResponse.json(
            {
              success: false,
              error: ERROR_MESSAGES.RATE_LIMITED,
              code: 'RATE_LIMITED',
              limit: maxRequests,
              window: windowMs,
              retryAfter,
              remaining: 0,
            },
            {
              status: 429,
              headers: {
                'Retry-After': retryAfter.toString(),
                'X-RateLimit-Limit': maxRequests.toString(),
                'X-RateLimit-Remaining': '0',
                'X-RateLimit-Reset': (now + msBeforeNext).toString(),
                'X-RateLimit-Window': windowMs.toString(),
              },
            }
          ),
        };
      }

      return { success: true, result: rateLimitResult };
    } catch (error) {
      console.error('Rate limit error:', error);
      // On Redis error, allow the request but log the issue
      return {
        success: true,
        result: {
          totalHits: 0,
          totalTime: windowMs,
          remainingPoints: maxRequests,
          msBeforeNext: 0,
        },
      };
    }
  };
}

// Production-ready rate limiters with Redis backend
export const apiRateLimit = createRateLimit({
  maxRequests: RATE_LIMITS.API.REQUESTS,
  windowMs: RATE_LIMITS.API.WINDOW_MS,
  keyPrefix: REDIS_CONFIG.KEY_PREFIXES.RATE_LIMIT + ':api',
});

export const fileUploadRateLimit = createRateLimit({
  maxRequests: RATE_LIMITS.FILE_UPLOAD.REQUESTS,
  windowMs: RATE_LIMITS.FILE_UPLOAD.WINDOW_MS,
  keyPrefix: REDIS_CONFIG.KEY_PREFIXES.RATE_LIMIT + ':upload',
});

export const authRateLimit = createRateLimit({
  maxRequests: RATE_LIMITS.AUTH.REQUESTS,
  windowMs: RATE_LIMITS.AUTH.WINDOW_MS,
  skipSuccessfulRequests: true, // Only count failed auth attempts
  keyPrefix: REDIS_CONFIG.KEY_PREFIXES.RATE_LIMIT + ':auth',
});

export const aiProcessingRateLimit = createRateLimit({
  maxRequests: RATE_LIMITS.AI_PROCESSING.REQUESTS,
  windowMs: RATE_LIMITS.AI_PROCESSING.WINDOW_MS,
  keyPrefix: REDIS_CONFIG.KEY_PREFIXES.RATE_LIMIT + ':ai',
});

export const strictRateLimit = createRateLimit({
  maxRequests: RATE_LIMITS.STRICT.REQUESTS,
  windowMs: RATE_LIMITS.STRICT.WINDOW_MS,
  keyPrefix: REDIS_CONFIG.KEY_PREFIXES.RATE_LIMIT + ':strict',
});

export function withRateLimit(
  handler: (request: NextRequest) => Promise<NextResponse>,
  rateLimiter = apiRateLimit
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    // Apply rate limiting before processing
    const rateLimitResult = await rateLimiter(request);
    
    if (!rateLimitResult.success) {
      return rateLimitResult.response;
    }

    try {
      const response = await handler(request);
      
      // Update rate limit with response status for proper counting
      await rateLimiter(request, response);
      
      // Add rate limit headers to successful responses
      const { result } = rateLimitResult;
      response.headers.set('X-RateLimit-Limit', '100');
      response.headers.set('X-RateLimit-Remaining', result.remainingPoints.toString());
      response.headers.set('X-RateLimit-Window', result.totalTime.toString());
      
      return response;
    } catch (error) {
      console.error('Handler error in rate-limited endpoint:', error);
      
      const errorResponse = NextResponse.json(
        {
          success: false,
          error: ERROR_MESSAGES.GENERIC,
          code: 'HANDLER_ERROR',
        },
        { status: 500 }
      );

      // Update rate limit with error response
      await rateLimiter(request, errorResponse);
      
      return errorResponse;
    }
  };
}