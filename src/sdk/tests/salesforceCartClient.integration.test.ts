// IMPORTANT: Set environment variables BEFORE any other imports
process.env.STORAGE_BACKEND = 'memory';
process.env.NODE_ENV = 'test';

import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
} from '@jest/globals';
import axios from 'axios';
import { SalesforceCartClient } from '../src/client.js';
import { startTestServer, stopTestServer } from './integration-setup.js';
import { inMemoryStorage } from '../../config/storage.js';

describe('SalesforceCartClient Integration Tests', () => {
  let client: SalesforceCartClient;
  let baseURL: string;

  beforeAll(async () => {
    // Start the test server
    baseURL = await startTestServer();
    client = new SalesforceCartClient({
      baseURL,
      timeout: 5000,
    });
  }, 30000);

  afterAll(async () => {
    // Stop the test server
    await stopTestServer();
  }, 10000);

  beforeEach(() => {
    // Clear in-memory storage before each test
    inMemoryStorage.clear();
  });

  describe('Account Operations - End-to-End', () => {
    it('should create, retrieve, update, and delete an account', async () => {
      // Create an account
      const createInput = {
        name: 'Integration Test Corp',
        industry: 'Technology',
        website: 'https://integration-test.com',
        phone: '+1-555-1234',
        billingAddress: {
          street: '123 Test St',
          city: 'Test City',
          state: 'TS',
          postalCode: '12345',
          country: 'USA',
        },
      };

      const created = await client.createAccount(createInput);

      expect(created.id).toBeDefined();
      expect(created.name).toBe(createInput.name);
      expect(created.industry).toBe(createInput.industry);
      expect(created.website).toBe(createInput.website);
      expect(created.billingAddress?.city).toBe(
        createInput.billingAddress.city
      );

      // Retrieve the account
      const retrieved = await client.getAccount(created.id);

      expect(retrieved.id).toBe(created.id);
      expect(retrieved.name).toBe(created.name);

      // Update the account
      const updateInput = {
        name: 'Updated Test Corp',
        phone: '+1-555-9999',
      };

      const updated = await client.updateAccount(created.id, updateInput);

      expect(updated.id).toBe(created.id);
      expect(updated.name).toBe(updateInput.name);
      expect(updated.phone).toBe(updateInput.phone);
      expect(updated.industry).toBe(createInput.industry); // Should retain original value

      // Delete the account
      await client.deleteAccount(created.id);

      // Verify deletion - should throw 404
      await expect(client.getAccount(created.id)).rejects.toThrow(/404/);
    });

    it('should list accounts with pagination', async () => {
      // Create multiple accounts
      await Promise.all([
        client.createAccount({ name: 'Account 1' }),
        client.createAccount({ name: 'Account 2' }),
        client.createAccount({ name: 'Account 3' }),
        client.createAccount({ name: 'Account 4' }),
        client.createAccount({ name: 'Account 5' }),
      ]);

      // List all accounts
      const allAccounts = await client.listAccounts();
      expect(allAccounts.data.length).toBe(5);

      // List with limit
      const limitedAccounts = await client.listAccounts(3, 0);
      expect(limitedAccounts.data.length).toBe(3);
      expect(limitedAccounts.pagination.limit).toBe(3);

      // List with offset
      const offsetAccounts = await client.listAccounts(2, 2);
      expect(offsetAccounts.data.length).toBe(2);
      expect(offsetAccounts.pagination.offset).toBe(2);
    });

    it('should handle non-existent account gracefully', async () => {
      await expect(client.getAccount('non-existent-id')).rejects.toThrow(/404/);
    });
  });

  describe('Contact Operations - End-to-End', () => {
    it('should create, retrieve, update, and delete a contact', async () => {
      // Create a contact
      const createInput = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@integration-test.com',
        phone: '+1-555-1111',
        title: 'Software Engineer',
        department: 'Engineering',
      };

      const created = await client.createContact(createInput);

      expect(created.id).toBeDefined();
      expect(created.firstName).toBe(createInput.firstName);
      expect(created.lastName).toBe(createInput.lastName);
      expect(created.email).toBe(createInput.email);

      // Retrieve the contact
      const retrieved = await client.getContact(created.id);

      expect(retrieved.id).toBe(created.id);
      expect(retrieved.firstName).toBe(created.firstName);

      // Update the contact
      const updateInput = {
        title: 'Senior Software Engineer',
        phone: '+1-555-2222',
      };

      const updated = await client.updateContact(created.id, updateInput);

      expect(updated.id).toBe(created.id);
      expect(updated.title).toBe(updateInput.title);
      expect(updated.phone).toBe(updateInput.phone);
      expect(updated.firstName).toBe(createInput.firstName); // Should retain original

      // Delete the contact
      await client.deleteContact(created.id);

      // Verify deletion
      await expect(client.getContact(created.id)).rejects.toThrow(/404/);
    });

    it('should list contacts with pagination', async () => {
      // Create multiple contacts
      await Promise.all([
        client.createContact({ firstName: 'Contact', lastName: '1' }),
        client.createContact({ firstName: 'Contact', lastName: '2' }),
        client.createContact({ firstName: 'Contact', lastName: '3' }),
      ]);

      // List all contacts
      const allContacts = await client.listContacts();
      expect(allContacts.data.length).toBe(3);

      // List with limit
      const limitedContacts = await client.listContacts(2, 0);
      expect(limitedContacts.data.length).toBe(2);
    });

    it('should handle non-existent contact gracefully', async () => {
      await expect(client.getContact('non-existent-id')).rejects.toThrow(/404/);
    });
  });

  describe('Account-Contact Relationship - End-to-End', () => {
    it('should create contacts associated with an account', async () => {
      // Create an account
      const account = await client.createAccount({
        name: 'Relationship Test Corp',
      });

      // Create contacts for this account
      const contact1 = await client.createContact({
        accountId: account.id,
        firstName: 'Employee',
        lastName: 'One',
        email: 'employee1@test.com',
      });

      const contact2 = await client.createContact({
        accountId: account.id,
        firstName: 'Employee',
        lastName: 'Two',
        email: 'employee2@test.com',
      });

      expect(contact1.accountId).toBe(account.id);
      expect(contact2.accountId).toBe(account.id);

      // Get contacts by account
      const accountContacts = await client.getContactsByAccount(account.id);

      expect(accountContacts.data.length).toBe(2);
      expect(
        accountContacts.data.every((c) => c.accountId === account.id)
      ).toBe(true);
    });

    it('should filter contacts by account ID', async () => {
      // Create two accounts
      const account1 = await client.createAccount({ name: 'Account 1' });
      const account2 = await client.createAccount({ name: 'Account 2' });

      // Create contacts for each account
      await client.createContact({
        accountId: account1.id,
        firstName: 'Account1',
        lastName: 'Contact',
      });
      await client.createContact({
        accountId: account2.id,
        firstName: 'Account2',
        lastName: 'Contact',
      });

      // Get contacts for account 1
      const account1Contacts = await client.listContacts(100, 0, account1.id);
      expect(account1Contacts.data.length).toBe(1);
      expect(account1Contacts.data[0].accountId).toBe(account1.id);

      // Get contacts for account 2
      const account2Contacts = await client.getContactsByAccount(account2.id);
      expect(account2Contacts.data.length).toBe(1);
      expect(account2Contacts.data[0].accountId).toBe(account2.id);
    });

    it('should handle moving contact between accounts', async () => {
      // Create two accounts
      const account1 = await client.createAccount({ name: 'Account A' });
      const account2 = await client.createAccount({ name: 'Account B' });

      // Create contact for account1
      const contact = await client.createContact({
        accountId: account1.id,
        firstName: 'Mobile',
        lastName: 'Contact',
      });

      expect(contact.accountId).toBe(account1.id);

      // Move contact to account2
      const movedContact = await client.updateContact(contact.id, {
        accountId: account2.id,
      });

      expect(movedContact.accountId).toBe(account2.id);

      // Verify in account2's contacts
      const account2Contacts = await client.getContactsByAccount(account2.id);
      expect(account2Contacts.data.length).toBe(1);
      expect(account2Contacts.data[0].id).toBe(contact.id);
    });
  });

  describe('Complex Workflows - End-to-End', () => {
    it('should handle complete CRM workflow', async () => {
      // 1. Create a company account
      const company = await client.createAccount({
        name: 'TechStart Inc',
        industry: 'Software',
        website: 'https://techstart.com',
        phone: '+1-555-1000',
        billingAddress: {
          street: '100 Innovation Drive',
          city: 'San Francisco',
          state: 'CA',
          postalCode: '94105',
          country: 'USA',
        },
      });

      expect(company.id).toBeDefined();

      // 2. Add key employees
      await client.createContact({
        accountId: company.id,
        firstName: 'Alice',
        lastName: 'Johnson',
        email: 'alice@techstart.com',
        title: 'CEO',
        department: 'Executive',
      });

      const cto = await client.createContact({
        accountId: company.id,
        firstName: 'Bob',
        lastName: 'Smith',
        email: 'bob@techstart.com',
        title: 'CTO',
        department: 'Engineering',
      });

      const salesLead = await client.createContact({
        accountId: company.id,
        firstName: 'Carol',
        lastName: 'Davis',
        email: 'carol@techstart.com',
        title: 'VP of Sales',
        department: 'Sales',
      });

      // 3. Verify all contacts are associated
      const companyContacts = await client.getContactsByAccount(company.id);
      expect(companyContacts.data.length).toBe(3);

      // 4. Update company information
      const updatedCompany = await client.updateAccount(company.id, {
        phone: '+1-555-2000',
        accountNumber: 'ACC-001',
      });

      expect(updatedCompany.phone).toBe('+1-555-2000');
      expect(updatedCompany.accountNumber).toBe('ACC-001');

      // 5. Promote an employee
      const promotedCTO = await client.updateContact(cto.id, {
        title: 'Chief Technology Officer',
      });

      expect(promotedCTO.title).toBe('Chief Technology Officer');

      // 6. Remove a contact
      await client.deleteContact(salesLead.id);

      const remainingContacts = await client.getContactsByAccount(company.id);
      expect(remainingContacts.data.length).toBe(2);

      // 7. List all companies
      const allCompanies = await client.listAccounts();
      expect(allCompanies.data.length).toBeGreaterThanOrEqual(1);

      // 8. Clean up
      await client.deleteAccount(company.id);

      // Verify deletion cascaded (in this implementation, contacts remain)
      const deletedCompany = client.getAccount(company.id);
      await expect(deletedCompany).rejects.toThrow(/404/);
    });

    it('should handle concurrent operations correctly', async () => {
      // Create multiple accounts concurrently
      const accountPromises = Array.from({ length: 10 }, (_, i) =>
        client.createAccount({ name: `Concurrent Account ${i + 1}` })
      );

      const accounts = await Promise.all(accountPromises);

      expect(accounts.length).toBe(10);
      expect(new Set(accounts.map((a) => a.id)).size).toBe(10); // All unique IDs

      // Create contacts for each account concurrently
      const contactPromises = accounts.map((account, i) =>
        client.createContact({
          accountId: account.id,
          firstName: `Contact`,
          lastName: `${i + 1}`,
        })
      );

      const contacts = await Promise.all(contactPromises);

      expect(contacts.length).toBe(10);

      // Verify each account has one contact
      for (const account of accounts) {
        const accountContacts = await client.getContactsByAccount(account.id);
        expect(accountContacts.data.length).toBe(1);
      }
    });

    it('should maintain data consistency across operations', async () => {
      // Create an account
      const account = await client.createAccount({
        name: 'Consistency Test',
        industry: 'Testing',
      });

      // Retrieve it multiple times
      const [retrieval1, retrieval2, retrieval3] = await Promise.all([
        client.getAccount(account.id),
        client.getAccount(account.id),
        client.getAccount(account.id),
      ]);

      // All retrievals should have the same data
      expect(retrieval1.name).toBe(account.name);
      expect(retrieval2.name).toBe(account.name);
      expect(retrieval3.name).toBe(account.name);
      expect(retrieval1.id).toBe(retrieval2.id);
      expect(retrieval2.id).toBe(retrieval3.id);

      // Update the account
      await client.updateAccount(account.id, {
        name: 'Updated Consistency Test',
      });

      // Retrieve again
      const afterUpdate = await client.getAccount(account.id);
      expect(afterUpdate.name).toBe('Updated Consistency Test');
    });
  });

  describe('Error Handling - End-to-End', () => {
    it('should return 404 for non-existent resources', async () => {
      await expect(client.getAccount('does-not-exist')).rejects.toThrow(/404/);
      await expect(client.getContact('does-not-exist')).rejects.toThrow(/404/);
    });

    it('should return 404 when updating non-existent resources', async () => {
      await expect(
        client.updateAccount('does-not-exist', { name: 'New Name' })
      ).rejects.toThrow(/404/);

      await expect(
        client.updateContact('does-not-exist', { firstName: 'New Name' })
      ).rejects.toThrow(/404/);
    });

    it('should return 404 when deleting non-existent resources', async () => {
      await expect(client.deleteAccount('does-not-exist')).rejects.toThrow(
        /404/
      );
      await expect(client.deleteContact('does-not-exist')).rejects.toThrow(
        /404/
      );
    });

    it('should throw appropriate error when request times out', async () => {
      // Create an axios client with a 100ms timeout
      const timeoutClient = axios.create({
        baseURL,
        timeout: 100,
      });

      // Request a 500ms delay - should timeout
      await expect(timeoutClient.get('/test-delay?ms=500')).rejects.toThrow(
        /timeout/i
      );
    });
  });

  describe('Data Persistence - In-Memory Storage', () => {
    it('should persist data across multiple operations', async () => {
      // Create data
      const account1 = await client.createAccount({ name: 'Persistent 1' });
      const account2 = await client.createAccount({ name: 'Persistent 2' });

      // List should show both
      let accounts = await client.listAccounts();
      expect(accounts.data.length).toBe(2);

      // Add more data
      const account3 = await client.createAccount({ name: 'Persistent 3' });

      // List should show all three
      accounts = await client.listAccounts();
      expect(accounts.data.length).toBe(3);

      // Delete one
      await client.deleteAccount(account2.id);

      // List should show two
      accounts = await client.listAccounts();
      expect(accounts.data.length).toBe(2);
      expect(accounts.data.find((a) => a.id === account1.id)).toBeDefined();
      expect(accounts.data.find((a) => a.id === account3.id)).toBeDefined();
      expect(accounts.data.find((a) => a.id === account2.id)).toBeUndefined();
    });
  });

  describe('Cart Operations - End-to-End', () => {
    it('should create, retrieve, and delete a cart', async () => {
      // Create account
      const account = await client.createAccount({ name: 'Cart Test Account' });

      // Create cart
      const createInput = { accountId: account.id };
      const created = await client.createCart(createInput);

      expect(created.id).toBeDefined();
      expect(created.accountId).toBe(account.id);
      expect(created.items).toEqual([]);
      expect(created.subtotal).toBe(0);

      // Retrieve the cart
      const retrieved = await client.getCart(created.id);

      expect(retrieved.id).toBe(created.id);
      expect(retrieved.accountId).toBe(account.id);

      // Delete the cart
      await client.deleteCart(created.id);

      // Verify deletion
      await expect(client.getCart(created.id)).rejects.toThrow(/404/);
    });

    it('should add items to cart and calculate subtotal', async () => {
      // Create cart
      const cart = await client.createCart({});

      // Add first item
      const addItem1 = {
        productId: 'prod-1',
        productName: 'Product 1',
        quantity: 2,
        price: 10.0,
      };

      const cart1 = await client.addToCart(cart.id, addItem1);

      expect(cart1.items.length).toBe(1);
      expect(cart1.items[0].productId).toBe('prod-1');
      expect(cart1.items[0].quantity).toBe(2);
      expect(cart1.items[0].total).toBe(20.0);
      expect(cart1.subtotal).toBe(20.0);

      // Add second item
      const addItem2 = {
        productId: 'prod-2',
        productName: 'Product 2',
        quantity: 1,
        price: 15.0,
      };

      const cart2 = await client.addToCart(cart.id, addItem2);

      expect(cart2.items.length).toBe(2);
      expect(cart2.subtotal).toBe(35.0);
    });

    it('should increase quantity when adding existing item', async () => {
      // Create cart
      const cart = await client.createCart({});

      // Add item
      await client.addToCart(cart.id, {
        productId: 'prod-1',
        productName: 'Product 1',
        quantity: 2,
        price: 10.0,
      });

      // Add same item again
      const updated = await client.addToCart(cart.id, {
        productId: 'prod-1',
        productName: 'Product 1',
        quantity: 3,
        price: 10.0,
      });

      expect(updated.items.length).toBe(1);
      expect(updated.items[0].quantity).toBe(5);
      expect(updated.items[0].total).toBe(50.0);
      expect(updated.subtotal).toBe(50.0);
    });

    it('should remove items from cart', async () => {
      // Create cart with items
      const cart = await client.createCart({});

      await client.addToCart(cart.id, {
        productId: 'prod-1',
        productName: 'Product 1',
        quantity: 2,
        price: 10.0,
      });

      await client.addToCart(cart.id, {
        productId: 'prod-2',
        productName: 'Product 2',
        quantity: 1,
        price: 15.0,
      });

      // Remove first item
      const updated = await client.removeFromCart(cart.id, {
        productId: 'prod-1',
      });

      expect(updated.items.length).toBe(1);
      expect(updated.items[0].productId).toBe('prod-2');
      expect(updated.subtotal).toBe(15.0);
    });

    it('should list carts with pagination', async () => {
      // Create multiple carts
      await Promise.all([
        client.createCart({ accountId: 'account-1' }),
        client.createCart({ accountId: 'account-2' }),
        client.createCart({}),
      ]);

      // List all carts
      const allCarts = await client.listCarts();
      expect(allCarts.data.length).toBeGreaterThanOrEqual(3);

      // List with limit
      const limitedCarts = await client.listCarts(2, 0);
      expect(limitedCarts.data.length).toBe(2);
      expect(limitedCarts.pagination.limit).toBe(2);
    });

    it('should filter carts by accountId', async () => {
      // Create carts for different accounts
      const account1 = await client.createAccount({ name: 'Account 1' });
      const account2 = await client.createAccount({ name: 'Account 2' });

      await client.createCart({ accountId: account1.id });
      await client.createCart({ accountId: account1.id });
      await client.createCart({ accountId: account2.id });

      // Get carts for account 1
      const account1Carts = await client.listCarts(100, 0, account1.id);
      expect(account1Carts.data.length).toBe(2);
      expect(account1Carts.data.every((c) => c.accountId === account1.id)).toBe(
        true
      );

      // Get carts for account 2
      const account2Carts = await client.getCartsByAccount(account2.id);
      expect(account2Carts.data.length).toBe(1);
      expect(account2Carts.data[0].accountId).toBe(account2.id);
    });

    it('should handle complete shopping workflow', async () => {
      // 1. Create account
      const account = await client.createAccount({
        name: 'Shopping Customer',
      });

      // 2. Create cart for account
      const cart = await client.createCart({ accountId: account.id });

      expect(cart.accountId).toBe(account.id);
      expect(cart.items).toEqual([]);

      // 3. Add multiple items
      await client.addToCart(cart.id, {
        productId: 'laptop-1',
        productName: 'Gaming Laptop',
        quantity: 1,
        price: 1200.0,
      });

      await client.addToCart(cart.id, {
        productId: 'mouse-1',
        productName: 'Wireless Mouse',
        quantity: 2,
        price: 25.0,
      });

      const cartWithItems = await client.addToCart(cart.id, {
        productId: 'keyboard-1',
        productName: 'Mechanical Keyboard',
        quantity: 1,
        price: 80.0,
      });

      expect(cartWithItems.items.length).toBe(3);
      expect(cartWithItems.subtotal).toBe(1330.0);

      // 4. Change mind - remove one item
      const updatedCart = await client.removeFromCart(cart.id, {
        productId: 'keyboard-1',
      });

      expect(updatedCart.items.length).toBe(2);
      expect(updatedCart.subtotal).toBe(1250.0);

      // 5. Verify cart still exists and has correct data
      const finalCart = await client.getCart(cart.id);
      expect(finalCart.items.length).toBe(2);
      expect(finalCart.subtotal).toBe(1250.0);

      // 6. Clean up
      await client.deleteCart(cart.id);
      await expect(client.getCart(cart.id)).rejects.toThrow(/404/);
    });

    it('should handle errors gracefully', async () => {
      // Test 404 for non-existent cart
      await expect(client.getCart('non-existent-cart')).rejects.toThrow(/404/);

      // Test adding item to non-existent cart
      await expect(
        client.addToCart('non-existent-cart', {
          productId: 'prod-1',
          productName: 'Product 1',
          quantity: 1,
          price: 10.0,
        })
      ).rejects.toThrow(/404/);

      // Test removing item from non-existent cart
      await expect(
        client.removeFromCart('non-existent-cart', { productId: 'prod-1' })
      ).rejects.toThrow(/404/);

      // Test deleting non-existent cart
      await expect(client.deleteCart('non-existent-cart')).rejects.toThrow(
        /404/
      );
    });
  });
});
