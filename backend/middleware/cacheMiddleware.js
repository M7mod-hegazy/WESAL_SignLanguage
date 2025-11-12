// Simple in-memory cache for posts
const cache = new Map();
const CACHE_DURATION = 30000; // 30 seconds

const cacheMiddleware = (req, res, next) => {
  // Only cache GET requests
  if (req.method !== 'GET') {
    return next();
  }

  const key = req.originalUrl || req.url;
  const cachedResponse = cache.get(key);

  if (cachedResponse && Date.now() - cachedResponse.timestamp < CACHE_DURATION) {
    console.log(`✅ [CACHE] Serving from cache: ${key}`);
    return res.json(cachedResponse.data);
  }

  // Store original res.json
  const originalJson = res.json.bind(res);

  // Override res.json to cache the response
  res.json = (data) => {
    cache.set(key, {
      data,
      timestamp: Date.now()
    });
    console.log(`💾 [CACHE] Cached response: ${key}`);
    return originalJson(data);
  };

  next();
};

// Clear cache function
const clearCache = () => {
  cache.clear();
  console.log('🧹 [CACHE] Cache cleared');
};

module.exports = { cacheMiddleware, clearCache };
