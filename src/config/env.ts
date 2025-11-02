import dotenv from 'dotenv';

dotenv.config();

export type StorageBackend = 'database' | 'memory';

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  storage: {
    backend: (process.env.STORAGE_BACKEND || 'database') as StorageBackend,
  },
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/be-example',
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiry: process.env.JWT_EXPIRY || '7d',
  },
  timeout: {
    request: parseInt(process.env.REQUEST_TIMEOUT || '30000', 10),
  },
};
