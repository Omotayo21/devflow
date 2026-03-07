import redis from '../config/redis.js';
import { logger } from './logger.js';

export async function getOrSet(key, fetchFn, ttlSeconds = 3600) {
  try {
    const cached = await redis.get(key);
    if (cached) {
      logger.debug({ key }, 'Cache hit');
      return JSON.parse(cached);
    }

    logger.debug({ key }, 'Cache miss');
    const fresh = await fetchFn();
    await redis.setEx(key, ttlSeconds, JSON.stringify(fresh));
    return fresh;
  } catch (err) {
    // If Redis is down, fall through to DB — never crash because of cache
    logger.error({ err }, 'Cache error, falling back to DB');
    return fetchFn();
  }
}

export async function invalidate(key) {
  try {
    await redis.del(key);
    logger.debug({ key }, 'Cache invalidated');
  } catch (err) {
    logger.error({ err }, 'Cache invalidation error');
  }
}

export async function invalidatePattern(pattern) {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(keys);
      logger.debug({ pattern, count: keys.length }, 'Cache pattern invalidated');
    }
  } catch (err) {
    logger.error({ err }, 'Cache pattern invalidation error');
  }
}