import { getDatabase } from '../config/database.js';
import { inMemoryStorage, isUsingMemoryStorage } from '../config/storage.js';
import {
  SalesforceAccount,
  CreateSalesforceAccountInput,
  UpdateSalesforceAccountInput,
} from './salesforceAccount.js';
import { randomUUID } from 'crypto';

const COLLECTION_NAME = 'salesforce_accounts';

export class AccountRepository {
  async create(
    input: CreateSalesforceAccountInput
  ): Promise<SalesforceAccount> {
    const now = new Date();
    const account: SalesforceAccount = {
      id: randomUUID(),
      ...input,
      createdAt: now,
      updatedAt: now,
    };

    if (isUsingMemoryStorage()) {
      const store = inMemoryStorage.getStore(COLLECTION_NAME);
      store.set(account.id, account);
    } else {
      const db = getDatabase();
      await db.collection(COLLECTION_NAME).insertOne(account as any);
    }

    return account;
  }

  async findById(id: string): Promise<SalesforceAccount | null> {
    if (isUsingMemoryStorage()) {
      const store = inMemoryStorage.getStore(COLLECTION_NAME);
      return store.get(id) || null;
    } else {
      const db = getDatabase();
      const doc: any = await db
        .collection(COLLECTION_NAME)
        .findOne({ id } as any);
      if (!doc) return null;

      return {
        id: doc.id,
        name: doc.name,
        industry: doc.industry,
        accountNumber: doc.accountNumber,
        website: doc.website,
        phone: doc.phone,
        billingAddress: doc.billingAddress,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
      };
    }
  }

  async findAll(limit = 100, offset = 0): Promise<SalesforceAccount[]> {
    if (isUsingMemoryStorage()) {
      const store = inMemoryStorage.getStore(COLLECTION_NAME);
      const accounts = Array.from(store.values());
      return accounts.slice(offset, offset + limit);
    } else {
      const db = getDatabase();
      const docs: any[] = await db
        .collection(COLLECTION_NAME)
        .find()
        .skip(offset)
        .limit(limit)
        .toArray();

      return docs.map((doc) => ({
        id: doc.id,
        name: doc.name,
        industry: doc.industry,
        accountNumber: doc.accountNumber,
        website: doc.website,
        phone: doc.phone,
        billingAddress: doc.billingAddress,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
      }));
    }
  }

  async update(
    id: string,
    input: UpdateSalesforceAccountInput
  ): Promise<SalesforceAccount | null> {
    const existing = await this.findById(id);
    if (!existing) return null;

    const updated: SalesforceAccount = {
      ...existing,
      ...input,
      updatedAt: new Date(),
    };

    if (isUsingMemoryStorage()) {
      const store = inMemoryStorage.getStore(COLLECTION_NAME);
      store.set(id, updated);
    } else {
      const db = getDatabase();
      await db.collection(COLLECTION_NAME).updateOne({ id } as any, {
        $set: {
          ...input,
          updatedAt: updated.updatedAt,
        },
      });
    }

    return updated;
  }

  async delete(id: string): Promise<boolean> {
    if (isUsingMemoryStorage()) {
      const store = inMemoryStorage.getStore(COLLECTION_NAME);
      return store.delete(id);
    } else {
      const db = getDatabase();
      const result = await db
        .collection(COLLECTION_NAME)
        .deleteOne({ id } as any);
      return result.deletedCount > 0;
    }
  }
}
