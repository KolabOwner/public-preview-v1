// Quick test for Redis rate limiting
const Redis = require('ioredis');

const redis = new Redis({
  host: 'localhost',
  port: 6379,
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
});

// Lua script for testing rate limiting
const luaScript = `
  local key = KEYS[1]
  local window = tonumber(ARGV[1])
  local limit = tonumber(ARGV[2])
  local current_time = tonumber(ARGV[3])
  
  redis.call('ZREMRANGEBYSCORE', key, 0, current_time - window)
  local current_requests = redis.call('ZCARD', key)
  
  if current_requests < limit then
      redis.call('ZADD', key, current_time, current_time .. ':' .. math.random())
      redis.call('EXPIRE', key, math.ceil(window / 1000))
      return {current_requests + 1, limit - current_requests - 1, 0}
  else
      local oldest = redis.call('ZRANGE', key, 0, 0, 'WITHSCORES')
      local reset_time = 0
      if oldest[2] then
          reset_time = math.max(0, (tonumber(oldest[2]) + window) - current_time)
      end
      return {current_requests, 0, reset_time}
  end
`;

async function testRateLimit() {
  console.log('🧪 Testing Redis Rate Limiting System...\n');
  
  try {
    // Test connection
    const ping = await redis.ping();
    console.log(`✅ Redis connection: ${ping}`);
    
    const testKey = 'test:rate_limit:ip:127.0.0.1';
    const windowMs = 60000; // 1 minute
    const maxRequests = 5; // 5 requests max
    
    console.log(`📊 Testing rate limit: ${maxRequests} requests per ${windowMs/1000}s\n`);
    
    // Clean up any existing test data
    await redis.del(testKey);
    
    // Test multiple requests
    for (let i = 1; i <= 7; i++) {
      const now = Date.now();
      const result = await redis.eval(
        luaScript,
        1,
        testKey,
        windowMs.toString(),
        maxRequests.toString(),
        now.toString()
      );
      
      const [totalHits, remainingPoints, msBeforeNext] = result;
      const status = remainingPoints > 0 ? '✅ ALLOWED' : '❌ BLOCKED';
      
      console.log(`Request ${i}: ${status} (${totalHits}/${maxRequests}) - Remaining: ${remainingPoints}`);
      
      if (msBeforeNext > 0) {
        console.log(`   ⏰ Reset in: ${Math.ceil(msBeforeNext/1000)}s`);
      }
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('\n🧹 Cleaning up test data...');
    await redis.del(testKey);
    
    console.log('\n✅ Rate limiting test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await redis.disconnect();
  }
}

testRateLimit();