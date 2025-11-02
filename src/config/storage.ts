import { config } from './env.js';

// In-memory storage using Map
class InMemoryStorage {
  private stores: Map<string, Map<string, any>> = new Map();

  getStore(collectionName: string): Map<string, any> {
    if (!this.stores.has(collectionName)) {
      this.stores.set(collectionName, new Map());
    }
    return this.stores.get(collectionName)!;
  }

  clear(collectionName?: string): void {
    if (collectionName) {
      this.stores.delete(collectionName);
    } else {
      this.stores.clear();
    }
  }

  getAllStores(): Map<string, Map<string, any>> {
    return this.stores;
  }
}

export const inMemoryStorage = new InMemoryStorage();

export function isUsingMemoryStorage(): boolean {
  return config.storage.backend === 'memory';
}

export function isUsingDatabaseStorage(): boolean {
  return config.storage.backend === 'database';
}
