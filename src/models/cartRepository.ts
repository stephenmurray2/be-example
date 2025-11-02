import { getDatabase } from '../config/database.js';
import { inMemoryStorage, isUsingMemoryStorage } from '../config/storage.js';
import {
  SalesforceCart,
  CreateSalesforceCartInput,
  AddToCartInput,
  RemoveFromCartInput,
  CartItem,
} from './salesforceCart.js';
import { randomUUID } from 'crypto';

const COLLECTION_NAME = 'salesforce_carts';

export class CartRepository {
  async create(input: CreateSalesforceCartInput): Promise<SalesforceCart> {
    const now = new Date();
    const cart: SalesforceCart = {
      id: randomUUID(),
      accountId: input.accountId,
      items: [],
      subtotal: 0,
      createdAt: now,
      updatedAt: now,
    };

    if (isUsingMemoryStorage()) {
      const store = inMemoryStorage.getStore(COLLECTION_NAME);
      store.set(cart.id, cart);
    } else {
      const db = getDatabase();
      await db.collection(COLLECTION_NAME).insertOne(cart as any);
    }

    return cart;
  }

  async findById(id: string): Promise<SalesforceCart | null> {
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
        items: doc.items,
        subtotal: doc.subtotal,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
      };
    }
  }

  async findByAccountId(accountId: string): Promise<SalesforceCart[]> {
    if (isUsingMemoryStorage()) {
      const store = inMemoryStorage.getStore(COLLECTION_NAME);
      const carts = Array.from(store.values());
      return carts.filter((cart) => cart.accountId === accountId);
    } else {
      const db = getDatabase();
      const docs: any[] = await db
        .collection(COLLECTION_NAME)
        .find({ accountId } as any)
        .toArray();

      return docs.map((doc) => ({
        id: doc.id,
        accountId: doc.accountId,
        items: doc.items,
        subtotal: doc.subtotal,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
      }));
    }
  }

  async findAll(limit = 100, offset = 0): Promise<SalesforceCart[]> {
    if (isUsingMemoryStorage()) {
      const store = inMemoryStorage.getStore(COLLECTION_NAME);
      const carts = Array.from(store.values());
      return carts.slice(offset, offset + limit);
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
        items: doc.items,
        subtotal: doc.subtotal,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
      }));
    }
  }

  async addItem(
    cartId: string,
    input: AddToCartInput
  ): Promise<SalesforceCart | null> {
    const existing = await this.findById(cartId);
    if (!existing) return null;

    // Check if product already exists in cart
    const existingItemIndex = existing.items.findIndex(
      (item) => item.productId === input.productId
    );

    let updatedItems: CartItem[];
    if (existingItemIndex >= 0) {
      // Update quantity of existing item
      updatedItems = [...existing.items];
      updatedItems[existingItemIndex] = {
        ...updatedItems[existingItemIndex],
        quantity: updatedItems[existingItemIndex].quantity + input.quantity,
        total:
          (updatedItems[existingItemIndex].quantity + input.quantity) *
          updatedItems[existingItemIndex].price,
      };
    } else {
      // Add new item
      const newItem: CartItem = {
        productId: input.productId,
        productName: input.productName,
        quantity: input.quantity,
        price: input.price,
        total: input.quantity * input.price,
      };
      updatedItems = [...existing.items, newItem];
    }

    const subtotal = updatedItems.reduce((sum, item) => sum + item.total, 0);

    const updated: SalesforceCart = {
      ...existing,
      items: updatedItems,
      subtotal,
      updatedAt: new Date(),
    };

    if (isUsingMemoryStorage()) {
      const store = inMemoryStorage.getStore(COLLECTION_NAME);
      store.set(cartId, updated);
    } else {
      const db = getDatabase();
      await db.collection(COLLECTION_NAME).updateOne({ id: cartId } as any, {
        $set: {
          items: updated.items,
          subtotal: updated.subtotal,
          updatedAt: updated.updatedAt,
        },
      });
    }

    return updated;
  }

  async removeItem(
    cartId: string,
    input: RemoveFromCartInput
  ): Promise<SalesforceCart | null> {
    const existing = await this.findById(cartId);
    if (!existing) return null;

    const updatedItems = existing.items.filter(
      (item) => item.productId !== input.productId
    );

    const subtotal = updatedItems.reduce((sum, item) => sum + item.total, 0);

    const updated: SalesforceCart = {
      ...existing,
      items: updatedItems,
      subtotal,
      updatedAt: new Date(),
    };

    if (isUsingMemoryStorage()) {
      const store = inMemoryStorage.getStore(COLLECTION_NAME);
      store.set(cartId, updated);
    } else {
      const db = getDatabase();
      await db.collection(COLLECTION_NAME).updateOne({ id: cartId } as any, {
        $set: {
          items: updated.items,
          subtotal: updated.subtotal,
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
