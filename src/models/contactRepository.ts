import { getDatabase } from '../config/database.js';
import { inMemoryStorage, isUsingMemoryStorage } from '../config/storage.js';
import {
  SalesforceContact,
  CreateSalesforceContactInput,
  UpdateSalesforceContactInput,
} from './salesforceContact.js';
import { randomUUID } from 'crypto';

const COLLECTION_NAME = 'salesforce_contacts';

export class ContactRepository {
  async create(
    input: CreateSalesforceContactInput
  ): Promise<SalesforceContact> {
    const now = new Date();
    const contact: SalesforceContact = {
      id: randomUUID(),
      ...input,
      createdAt: now,
      updatedAt: now,
    };

    if (isUsingMemoryStorage()) {
      const store = inMemoryStorage.getStore(COLLECTION_NAME);
      store.set(contact.id, contact);
    } else {
      const db = getDatabase();
      await db.collection(COLLECTION_NAME).insertOne(contact as any);
    }

    return contact;
  }

  async findById(id: string): Promise<SalesforceContact | null> {
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
        accountId: doc.accountId,
        firstName: doc.firstName,
        lastName: doc.lastName,
        email: doc.email,
        phone: doc.phone,
        title: doc.title,
        department: doc.department,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
      };
    }
  }

  async findByAccountId(accountId: string): Promise<SalesforceContact[]> {
    if (isUsingMemoryStorage()) {
      const store = inMemoryStorage.getStore(COLLECTION_NAME);
      return Array.from(store.values()).filter(
        (contact) => contact.accountId === accountId
      );
    } else {
      const db = getDatabase();
      const docs: any[] = await db
        .collection(COLLECTION_NAME)
        .find({ accountId } as any)
        .toArray();

      return docs.map((doc) => ({
        id: doc.id,
        accountId: doc.accountId,
        firstName: doc.firstName,
        lastName: doc.lastName,
        email: doc.email,
        phone: doc.phone,
        title: doc.title,
        department: doc.department,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
      }));
    }
  }

  async findAll(limit = 100, offset = 0): Promise<SalesforceContact[]> {
    if (isUsingMemoryStorage()) {
      const store = inMemoryStorage.getStore(COLLECTION_NAME);
      const contacts = Array.from(store.values());
      return contacts.slice(offset, offset + limit);
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
        accountId: doc.accountId,
        firstName: doc.firstName,
        lastName: doc.lastName,
        email: doc.email,
        phone: doc.phone,
        title: doc.title,
        department: doc.department,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
      }));
    }
  }

  async update(
    id: string,
    input: UpdateSalesforceContactInput
  ): Promise<SalesforceContact | null> {
    const existing = await this.findById(id);
    if (!existing) return null;

    const updated: SalesforceContact = {
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
