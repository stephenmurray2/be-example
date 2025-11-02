import { createApp } from './app.js';
import {
  connectToDatabase,
  closeDatabaseConnection,
} from './config/database.js';
import { connectToRedis, closeRedisConnection } from './config/redis.js';
import { config } from './config/env.js';

async function startServer() {
  try {
    // Connect to databases
    if (config.storage.backend === 'database') {
      await connectToDatabase();
      await connectToRedis();
    }

    // Create Express app
    const app = createApp();

    // Start server
    const server = app.listen(config.port, () => {
      console.log(
        `Server running on port ${config.port} in ${config.env} mode`
      );
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      console.log(`\n${signal} received. Starting graceful shutdown...`);

      server.close(async () => {
        console.log('HTTP server closed');

        try {
          await closeDatabaseConnection();
          await closeRedisConnection();
          console.log('Database connections closed');
          process.exit(0);
        } catch (error) {
          console.error('Error during shutdown:', error);
          process.exit(1);
        }
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        console.error('Forcing shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
