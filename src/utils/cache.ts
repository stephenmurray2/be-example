import { getRedisClient } from '../config/redis.js';

export class CacheService {
  private static DEFAULT_TTL = 3600; // 1 hour in seconds

  static async get<T>(key: string): Promise<T | null> {
    try {
      const redis = getRedisClient();
      const value = await redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  static async set(
    key: string,
    value: any,
    ttl: number = this.DEFAULT_TTL
  ): Promise<void> {
    try {
      const redis = getRedisClient();
      await redis.setEx(key, ttl, JSON.stringify(value));
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  static async del(key: string): Promise<void> {
    try {
      const redis = getRedisClient();
      await redis.del(key);
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }

  static async delPattern(pattern: string): Promise<void> {
    try {
      const redis = getRedisClient();
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(keys);
      }
    } catch (error) {
      console.error('Cache delete pattern error:', error);
    }
  }
}
