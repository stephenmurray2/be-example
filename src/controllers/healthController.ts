import { Request, Response } from 'express';
import { getRedisClient } from '../config/redis.js';
import { getDatabase } from '../config/database.js';
import { isUsingMemoryStorage } from '../config/storage.js';

export const healthCheck = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const services: Record<string, string> = {};

    if (isUsingMemoryStorage()) {
      // Using in-memory storage - no database/redis to check
      services.storage = 'memory';
    } else {
      // Check database connection
      const db = getDatabase();
      await db.command({ ping: 1 });
      services.database = 'connected';

      // Check Redis connection
      const redis = getRedisClient();
      await redis.ping();
      services.redis = 'connected';
    }

    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services,
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Test-only endpoint that deliberately delays
export const testDelay = async (req: Request, res: Response): Promise<void> => {
  // Only allow in test environment
  if (process.env.NODE_ENV !== 'test') {
    res.status(404).json({ error: 'Not found' });
    return;
  }

  const delayMs = parseInt(req.query.ms as string) || 1000;

  await new Promise((resolve) => setTimeout(resolve, delayMs));

  res.status(200).json({
    message: 'Delayed response',
    delayMs,
    timestamp: new Date().toISOString(),
  });
};
