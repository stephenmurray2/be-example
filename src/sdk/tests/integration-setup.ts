// Integration test setup - starts a real server for testing
import { Server } from 'http';
import { createApp } from '../../app.js';
import { config } from '../../config/env.js';

let server: Server | null = null;
const TEST_PORT = 3456;

export async function startTestServer(): Promise<string> {
  // Ensure using memory storage for tests
  process.env.STORAGE_BACKEND = 'memory';
  process.env.NODE_ENV = 'test';

  // Note: When using memory storage, we don't need to connect to MongoDB or Redis
  // The repositories will use in-memory Map storage instead

  return new Promise((resolve, reject) => {
    try {
      const app = createApp();

      server = app.listen(TEST_PORT, () => {
        console.log(
          `Test server started on port ${TEST_PORT} (storage: ${config.storage.backend})`
        );
        resolve(`http://localhost:${TEST_PORT}`);
      });

      server.on('error', (error) => {
        console.error('Failed to start test server:', error);
        reject(error);
      });
    } catch (error) {
      console.error('Error creating app:', error);
      reject(error);
    }
  });
}

export async function stopTestServer(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (server) {
      server.close((error) => {
        if (error) {
          console.error('Error stopping test server:', error);
          reject(error);
        } else {
          console.log('Test server stopped');
          server = null;
          resolve();
        }
      });
    } else {
      resolve();
    }
  });
}

export function getTestServerUrl(): string {
  return `http://localhost:${TEST_PORT}`;
}
