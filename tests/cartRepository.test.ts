// IMPORTANT: Set environment variables BEFORE any other imports
process.env.STORAGE_BACKEND = 'memory';
process.env.NODE_ENV = 'test';

import { describe, it, expect, beforeEach } from '@jest/globals';
import { CartRepository } from '../src/models/cartRepository.js';
import { inMemoryStorage } from '../src/config/storage.js';

describe('CartRepository', () => {
  let repository: CartRepository;

  beforeEach(() => {
    // Clear in-memory storage before each test
    inMemoryStorage.clear();
    repository = new CartRepository();
  });

  describe('create', () => {
    it('should create a new cart with no items', async () => {
      const input = { accountId: 'account-123' };
      const cart = await repository.create(input);

      expect(cart.id).toBeDefined();
      expect(cart.accountId).toBe('account-123');
      expect(cart.items).toEqual([]);
      expect(cart.subtotal).toBe(0);
      expect(cart.createdAt).toBeInstanceOf(Date);
      expect(cart.updatedAt).toBeInstanceOf(Date);
    });

    it('should create a cart without an accountId', async () => {
      const input = {};
      const cart = await repository.create(input);

      expect(cart.id).toBeDefined();
      expect(cart.accountId).toBeUndefined();
      expect(cart.items).toEqual([]);
      expect(cart.subtotal).toBe(0);
    });
  });

  describe('findById', () => {
    it('should return a cart by id', async () => {
      const created = await repository.create({ accountId: 'account-123' });
      const found = await repository.findById(created.id);

      expect(found).not.toBeNull();
      expect(found?.id).toBe(created.id);
      expect(found?.accountId).toBe('account-123');
    });

    it('should return null for non-existent cart', async () => {
      const found = await repository.findById('non-existent-id');
      expect(found).toBeNull();
    });
  });

  describe('findByAccountId', () => {
    it('should return all carts for an account', async () => {
      await repository.create({ accountId: 'account-1' });
      await repository.create({ accountId: 'account-1' });
      await repository.create({ accountId: 'account-2' });

      const account1Carts = await repository.findByAccountId('account-1');
      expect(account1Carts.length).toBe(2);
      expect(account1Carts.every((c) => c.accountId === 'account-1')).toBe(true);
    });

    it('should return empty array for account with no carts', async () => {
      const carts = await repository.findByAccountId('no-carts-account');
      expect(carts).toEqual([]);
    });
  });

  describe('findAll', () => {
    it('should return all carts', async () => {
      await repository.create({ accountId: 'account-1' });
      await repository.create({ accountId: 'account-2' });
      await repository.create({});

      const carts = await repository.findAll();
      expect(carts.length).toBe(3);
    });

    it('should respect limit and offset', async () => {
      await repository.create({ accountId: 'account-1' });
      await repository.create({ accountId: 'account-2' });
      await repository.create({ accountId: 'account-3' });
      await repository.create({ accountId: 'account-4' });
      await repository.create({ accountId: 'account-5' });

      const page1 = await repository.findAll(2, 0);
      expect(page1.length).toBe(2);

      const page2 = await repository.findAll(2, 2);
      expect(page2.length).toBe(2);

      const page3 = await repository.findAll(2, 4);
      expect(page3.length).toBe(1);
    });
  });

  describe('addItem', () => {
    it('should add a new item to an empty cart', async () => {
      const cart = await repository.create({ accountId: 'account-123' });
      const itemInput = {
        productId: 'prod-1',
        productName: 'Product 1',
        quantity: 2,
        price: 10.0,
      };

      const updated = await repository.addItem(cart.id, itemInput);

      expect(updated).not.toBeNull();
      expect(updated?.items.length).toBe(1);
      expect(updated?.items[0].productId).toBe('prod-1');
      expect(updated?.items[0].productName).toBe('Product 1');
      expect(updated?.items[0].quantity).toBe(2);
      expect(updated?.items[0].price).toBe(10.0);
      expect(updated?.items[0].total).toBe(20.0);
      expect(updated?.subtotal).toBe(20.0);
    });

    it('should add multiple different items to cart', async () => {
      const cart = await repository.create({});

      await repository.addItem(cart.id, {
        productId: 'prod-1',
        productName: 'Product 1',
        quantity: 2,
        price: 10.0,
      });

      const updated = await repository.addItem(cart.id, {
        productId: 'prod-2',
        productName: 'Product 2',
        quantity: 1,
        price: 15.0,
      });

      expect(updated?.items.length).toBe(2);
      expect(updated?.subtotal).toBe(35.0);
    });

    it('should increase quantity when adding existing item', async () => {
      const cart = await repository.create({});

      await repository.addItem(cart.id, {
        productId: 'prod-1',
        productName: 'Product 1',
        quantity: 2,
        price: 10.0,
      });

      const updated = await repository.addItem(cart.id, {
        productId: 'prod-1',
        productName: 'Product 1',
        quantity: 3,
        price: 10.0,
      });

      expect(updated?.items.length).toBe(1);
      expect(updated?.items[0].quantity).toBe(5);
      expect(updated?.items[0].total).toBe(50.0);
      expect(updated?.subtotal).toBe(50.0);
    });

    it('should return null for non-existent cart', async () => {
      const result = await repository.addItem('non-existent-id', {
        productId: 'prod-1',
        productName: 'Product 1',
        quantity: 1,
        price: 10.0,
      });

      expect(result).toBeNull();
    });

    it('should update the updatedAt timestamp', async () => {
      const cart = await repository.create({});
      const originalUpdatedAt = cart.updatedAt;

      // Wait a bit to ensure timestamp difference
      await new Promise((resolve) => setTimeout(resolve, 10));

      const updated = await repository.addItem(cart.id, {
        productId: 'prod-1',
        productName: 'Product 1',
        quantity: 1,
        price: 10.0,
      });

      expect(updated?.updatedAt.getTime()).toBeGreaterThanOrEqual(
        originalUpdatedAt.getTime()
      );
    });
  });

  describe('removeItem', () => {
    it('should remove an item from cart', async () => {
      const cart = await repository.create({});

      await repository.addItem(cart.id, {
        productId: 'prod-1',
        productName: 'Product 1',
        quantity: 2,
        price: 10.0,
      });

      await repository.addItem(cart.id, {
        productId: 'prod-2',
        productName: 'Product 2',
        quantity: 1,
        price: 15.0,
      });

      const updated = await repository.removeItem(cart.id, {
        productId: 'prod-1',
      });

      expect(updated?.items.length).toBe(1);
      expect(updated?.items[0].productId).toBe('prod-2');
      expect(updated?.subtotal).toBe(15.0);
    });

    it('should handle removing non-existent item gracefully', async () => {
      const cart = await repository.create({});

      await repository.addItem(cart.id, {
        productId: 'prod-1',
        productName: 'Product 1',
        quantity: 2,
        price: 10.0,
      });

      const updated = await repository.removeItem(cart.id, {
        productId: 'prod-999',
      });

      expect(updated?.items.length).toBe(1);
      expect(updated?.items[0].productId).toBe('prod-1');
      expect(updated?.subtotal).toBe(20.0);
    });

    it('should set subtotal to 0 when removing all items', async () => {
      const cart = await repository.create({});

      await repository.addItem(cart.id, {
        productId: 'prod-1',
        productName: 'Product 1',
        quantity: 2,
        price: 10.0,
      });

      const updated = await repository.removeItem(cart.id, {
        productId: 'prod-1',
      });

      expect(updated?.items.length).toBe(0);
      expect(updated?.subtotal).toBe(0);
    });

    it('should return null for non-existent cart', async () => {
      const result = await repository.removeItem('non-existent-id', {
        productId: 'prod-1',
      });

      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete a cart', async () => {
      const cart = await repository.create({ accountId: 'account-123' });
      const deleted = await repository.delete(cart.id);

      expect(deleted).toBe(true);

      const found = await repository.findById(cart.id);
      expect(found).toBeNull();
    });

    it('should return false for non-existent cart', async () => {
      const deleted = await repository.delete('non-existent-id');
      expect(deleted).toBe(false);
    });
  });
});
