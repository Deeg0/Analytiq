import crypto from 'crypto';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

// In-memory cache (for server-side)
const cache = new Map<string, CacheEntry<any>>();

// Cache TTL: 24 hours
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

/**
 * Generate a cache key from analysis request
 */
export function generateCacheKey(
  inputType: string,
  content: string,
  metadata?: any
): string {
  // Create a hash of the input content
  const contentHash = crypto
    .createHash('sha256')
    .update(`${inputType}:${content}`)
    .digest('hex');
  
  return `analysis:${contentHash}`;
}

/**
 * Get cached analysis result
 */
export function getCachedAnalysis<T>(key: string): T | null {
  const entry = cache.get(key);
  
  if (!entry) {
    return null;
  }
  
  // Check if expired
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  
  return entry.data as T;
}

/**
 * Cache analysis result
 */
export function setCachedAnalysis<T>(key: string, data: T): void {
  cache.set(key, {
    data,
    timestamp: Date.now(),
    expiresAt: Date.now() + CACHE_TTL_MS,
  });
}

/**
 * Clear expired cache entries
 */
export function clearExpiredCache(): void {
  const now = Date.now();
  for (const [key, entry] of cache.entries()) {
    if (now > entry.expiresAt) {
      cache.delete(key);
    }
  }
}

/**
 * Clear all cache
 */
export function clearCache(): void {
  cache.clear();
}
