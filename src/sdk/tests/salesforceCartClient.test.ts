import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import MockAdapter from 'axios-mock-adapter';
import { SalesforceCartClient } from '../src/client.js';
import {
  SalesforceAccount,
  SalesforceContact,
  CreateSalesforceAccountInput,
  CreateSalesforceContactInput,
} from '../src/types.js';

describe('SalesforceCartClient', () => {
  let client: SalesforceCartClient;
  let mock: MockAdapter;

  beforeEach(() => {
    client = new SalesforceCartClient({
      baseURL: 'http://localhost:3000',
      timeout: 5000,
    });
    // @ts-ignore - accessing private property for testing
    mock = new MockAdapter(client.client);
  });

  afterEach(() => {
    mock.restore();
  });

  describe('Constructor', () => {
    it('should create client with default timeout', () => {
      const testClient = new SalesforceCartClient({
        baseURL: 'http://test.com',
      });

      expect(testClient).toBeInstanceOf(SalesforceCartClient);
    });

    it('should create client with custom timeout', () => {
      const testClient = new SalesforceCartClient({
        baseURL: 'http://test.com',
        timeout: 10000,
      });

      expect(testClient).toBeInstanceOf(SalesforceCartClient);
    });

    it('should create client with API key', () => {
      const testClient = new SalesforceCartClient({
        baseURL: 'http://test.com',
        apiKey: 'test-api-key',
      });

      expect(testClient).toBeInstanceOf(SalesforceCartClient);
    });
  });

  describe('Account Operations', () => {
    describe('createAccount', () => {
      it('should create a new account', async () => {
        const input: CreateSalesforceAccountInput = {
          name: 'Acme Corporation',
          industry: 'Technology',
          website: 'https://acme.com',
        };

        const mockResponse: SalesforceAccount = {
          id: '123',
          ...input,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        mock.onPost('/api/salesforce/accounts').reply(200, mockResponse);

        const result = await client.createAccount(input);

        expect(result.id).toBe('123');
        expect(result.name).toBe(input.name);
        expect(result.industry).toBe(input.industry);
      });

      it('should handle API errors when creating account', async () => {
        const input: CreateSalesforceAccountInput = {
          name: 'Test Account',
        };

        mock.onPost('/api/salesforce/accounts').reply(500, {
          error: 'Internal server error',
        });

        await expect(client.createAccount(input)).rejects.toThrow(
          /API Error: 500/
        );
      });

      it('should handle network errors when creating account', async () => {
        const input: CreateSalesforceAccountInput = {
          name: 'Test Account',
        };

        mock.onPost('/api/salesforce/accounts').networkError();

        await expect(client.createAccount(input)).rejects.toThrow(
          /Network Error/
        );
      });
    });

    describe('getAccount', () => {
      it('should retrieve an account by id', async () => {
        const mockAccount: SalesforceAccount = {
          id: '123',
          name: 'Test Company',
          industry: 'Technology',
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        mock.onGet('/api/salesforce/accounts/123').reply(200, mockAccount);

        const result = await client.getAccount('123');

        expect(result.id).toBe('123');
        expect(result.name).toBe('Test Company');
      });

      it('should handle 404 when account not found', async () => {
        mock.onGet('/api/salesforce/accounts/999').reply(404, {
          error: 'Account not found',
        });

        await expect(client.getAccount('999')).rejects.toThrow(
          /API Error: 404/
        );
      });
    });

    describe('listAccounts', () => {
      it('should list accounts with default pagination', async () => {
        const mockResponse = {
          data: [
            {
              id: '1',
              name: 'Company A',
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            {
              id: '2',
              name: 'Company B',
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ],
          pagination: {
            limit: 100,
            offset: 0,
            count: 2,
          },
        };

        mock
          .onGet('/api/salesforce/accounts', {
            params: { limit: 100, offset: 0 },
          })
          .reply(200, mockResponse);

        const result = await client.listAccounts();

        expect(result.data).toHaveLength(2);
        expect(result.pagination.limit).toBe(100);
      });

      it('should list accounts with custom pagination', async () => {
        const mockResponse = {
          data: [
            {
              id: '3',
              name: 'Company C',
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ],
          pagination: {
            limit: 10,
            offset: 20,
            count: 1,
          },
        };

        mock
          .onGet('/api/salesforce/accounts', {
            params: { limit: 10, offset: 20 },
          })
          .reply(200, mockResponse);

        const result = await client.listAccounts(10, 20);

        expect(result.data).toHaveLength(1);
        expect(result.pagination.limit).toBe(10);
        expect(result.pagination.offset).toBe(20);
      });
    });

    describe('updateAccount', () => {
      it('should update an account', async () => {
        const mockUpdated: SalesforceAccount = {
          id: '123',
          name: 'Updated Name',
          website: 'https://updated.com',
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        mock.onPut('/api/salesforce/accounts/123').reply(200, mockUpdated);

        const result = await client.updateAccount('123', {
          name: 'Updated Name',
          website: 'https://updated.com',
        });

        expect(result.name).toBe('Updated Name');
        expect(result.website).toBe('https://updated.com');
      });

      it('should handle errors when updating account', async () => {
        mock.onPut('/api/salesforce/accounts/999').reply(404, {
          error: 'Account not found',
        });

        await expect(
          client.updateAccount('999', { name: 'New Name' })
        ).rejects.toThrow(/API Error: 404/);
      });
    });

    describe('deleteAccount', () => {
      it('should delete an account', async () => {
        mock.onDelete('/api/salesforce/accounts/123').reply(204);

        await expect(client.deleteAccount('123')).resolves.not.toThrow();
      });

      it('should handle errors when deleting account', async () => {
        mock.onDelete('/api/salesforce/accounts/999').reply(404, {
          error: 'Account not found',
        });

        await expect(client.deleteAccount('999')).rejects.toThrow(
          /API Error: 404/
        );
      });
    });
  });

  describe('Contact Operations', () => {
    describe('createContact', () => {
      it('should create a new contact', async () => {
        const input: CreateSalesforceContactInput = {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          title: 'CEO',
        };

        const mockResponse: SalesforceContact = {
          id: '456',
          ...input,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        mock.onPost('/api/salesforce/contacts').reply(200, mockResponse);

        const result = await client.createContact(input);

        expect(result.id).toBe('456');
        expect(result.firstName).toBe(input.firstName);
        expect(result.lastName).toBe(input.lastName);
        expect(result.email).toBe(input.email);
      });

      it('should create a contact with account association', async () => {
        const input: CreateSalesforceContactInput = {
          accountId: '123',
          firstName: 'Jane',
          lastName: 'Smith',
        };

        const mockResponse: SalesforceContact = {
          id: '789',
          ...input,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        mock.onPost('/api/salesforce/contacts').reply(200, mockResponse);

        const result = await client.createContact(input);

        expect(result.accountId).toBe('123');
      });

      it('should handle errors when creating contact', async () => {
        mock.onPost('/api/salesforce/contacts').reply(400, {
          error: 'Bad request',
        });

        await expect(
          client.createContact({ firstName: 'Test', lastName: 'User' })
        ).rejects.toThrow(/API Error: 400/);
      });
    });

    describe('getContact', () => {
      it('should retrieve a contact by id', async () => {
        const mockContact: SalesforceContact = {
          id: '456',
          firstName: 'Alice',
          lastName: 'Brown',
          email: 'alice@example.com',
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        mock.onGet('/api/salesforce/contacts/456').reply(200, mockContact);

        const result = await client.getContact('456');

        expect(result.id).toBe('456');
        expect(result.firstName).toBe('Alice');
        expect(result.lastName).toBe('Brown');
      });

      it('should handle 404 when contact not found', async () => {
        mock.onGet('/api/salesforce/contacts/999').reply(404, {
          error: 'Contact not found',
        });

        await expect(client.getContact('999')).rejects.toThrow(
          /API Error: 404/
        );
      });
    });

    describe('listContacts', () => {
      it('should list contacts with default pagination', async () => {
        const mockResponse = {
          data: [
            {
              id: '1',
              firstName: 'Contact',
              lastName: 'One',
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            {
              id: '2',
              firstName: 'Contact',
              lastName: 'Two',
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ],
          pagination: {
            limit: 100,
            offset: 0,
            count: 2,
          },
        };

        mock.onGet(/\/api\/salesforce\/contacts/).reply(200, mockResponse);

        const result = await client.listContacts();

        expect(result.data).toHaveLength(2);
        expect(result.pagination.limit).toBe(100);
      });

      it('should list contacts with account filter', async () => {
        const mockResponse = {
          data: [
            {
              id: '1',
              accountId: '123',
              firstName: 'Contact',
              lastName: 'One',
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ],
          pagination: {
            limit: 100,
            offset: 0,
            count: 1,
          },
        };

        mock
          .onGet('/api/salesforce/contacts', {
            params: { limit: 100, offset: 0, accountId: '123' },
          })
          .reply(200, mockResponse);

        const result = await client.listContacts(100, 0, '123');

        expect(result.data).toHaveLength(1);
        expect(result.data[0].accountId).toBe('123');
      });
    });

    describe('getContactsByAccount', () => {
      it('should get contacts for a specific account', async () => {
        const mockResponse = {
          data: [
            {
              id: '1',
              accountId: '123',
              firstName: 'Contact',
              lastName: 'One',
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            {
              id: '2',
              accountId: '123',
              firstName: 'Contact',
              lastName: 'Two',
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ],
          pagination: {
            limit: 100,
            offset: 0,
            count: 2,
          },
        };

        mock
          .onGet('/api/salesforce/contacts', {
            params: { limit: 100, offset: 0, accountId: '123' },
          })
          .reply(200, mockResponse);

        const result = await client.getContactsByAccount('123');

        expect(result.data).toHaveLength(2);
        expect(result.data.every((c) => c.accountId === '123')).toBe(true);
      });
    });

    describe('updateContact', () => {
      it('should update a contact', async () => {
        const mockUpdated: SalesforceContact = {
          id: '456',
          firstName: 'Updated',
          lastName: 'Name',
          title: 'Manager',
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        mock.onPut('/api/salesforce/contacts/456').reply(200, mockUpdated);

        const result = await client.updateContact('456', {
          firstName: 'Updated',
          title: 'Manager',
        });

        expect(result.firstName).toBe('Updated');
        expect(result.title).toBe('Manager');
      });

      it('should handle errors when updating contact', async () => {
        mock.onPut('/api/salesforce/contacts/999').reply(404, {
          error: 'Contact not found',
        });

        await expect(
          client.updateContact('999', { firstName: 'New Name' })
        ).rejects.toThrow(/API Error: 404/);
      });
    });

    describe('deleteContact', () => {
      it('should delete a contact', async () => {
        mock.onDelete('/api/salesforce/contacts/456').reply(204);

        await expect(client.deleteContact('456')).resolves.not.toThrow();
      });

      it('should handle errors when deleting contact', async () => {
        mock.onDelete('/api/salesforce/contacts/999').reply(404, {
          error: 'Contact not found',
        });

        await expect(client.deleteContact('999')).rejects.toThrow(
          /API Error: 404/
        );
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle timeout errors', async () => {
      mock.onGet('/api/salesforce/accounts/123').timeout();

      await expect(client.getAccount('123')).rejects.toThrow();
    });

    it('should handle request errors', async () => {
      // Create a client that will fail on request setup
      const badClient = new SalesforceCartClient({
        baseURL: '', // Invalid base URL
      });

      // The error will be caught by the interceptor
      await expect(badClient.createAccount({ name: 'Test' })).rejects.toThrow();
    });

    it('should include error details in error message', async () => {
      mock.onPost('/api/salesforce/accounts').reply(400, {
        error: 'Validation failed',
        details: 'Name is required',
      });

      await expect(client.createAccount({ name: '' })).rejects.toThrow(
        /Validation failed/
      );
    });
  });

  describe('Integration Scenarios', () => {
    it('should handle multiple operations in sequence', async () => {
      // Create account
      const accountResponse: SalesforceAccount = {
        id: '123',
        name: 'Tech Inc',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mock.onPost('/api/salesforce/accounts').reply(200, accountResponse);

      const account = await client.createAccount({ name: 'Tech Inc' });

      // Create contact for account
      const contactResponse: SalesforceContact = {
        id: '456',
        accountId: account.id,
        firstName: 'John',
        lastName: 'Doe',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mock.onPost('/api/salesforce/contacts').reply(200, contactResponse);

      const contact = await client.createContact({
        accountId: account.id,
        firstName: 'John',
        lastName: 'Doe',
      });

      expect(contact.accountId).toBe(account.id);
    });

    it('should handle parallel requests', async () => {
      const account1: SalesforceAccount = {
        id: '1',
        name: 'Company A',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const account2: SalesforceAccount = {
        id: '2',
        name: 'Company B',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mock.onGet('/api/salesforce/accounts/1').reply(200, account1);
      mock.onGet('/api/salesforce/accounts/2').reply(200, account2);

      const results = await Promise.all([
        client.getAccount('1'),
        client.getAccount('2'),
      ]);

      expect(results).toHaveLength(2);
      expect(results[0].id).toBe('1');
      expect(results[1].id).toBe('2');
    });
  });

  describe('Cart Operations', () => {
    describe('createCart', () => {
      it('should create a new cart', async () => {
        const input = { accountId: 'account-123' };

        const mockResponse = {
          id: 'cart-1',
          accountId: 'account-123',
          items: [],
          subtotal: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        mock.onPost('/api/salesforce/carts').reply(201, mockResponse);

        const result = await client.createCart(input);

        expect(result.id).toBe('cart-1');
        expect(result.accountId).toBe('account-123');
        expect(result.items).toEqual([]);
        expect(result.subtotal).toBe(0);
      });

      it('should create a cart without accountId', async () => {
        const mockResponse = {
          id: 'cart-2',
          items: [],
          subtotal: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        mock.onPost('/api/salesforce/carts').reply(201, mockResponse);

        const result = await client.createCart({});

        expect(result.id).toBe('cart-2');
        expect(result.accountId).toBeUndefined();
      });
    });

    describe('getCart', () => {
      it('should retrieve a cart by id', async () => {
        const mockCart = {
          id: 'cart-1',
          accountId: 'account-123',
          items: [
            {
              productId: 'prod-1',
              productName: 'Product 1',
              quantity: 2,
              price: 10.0,
              total: 20.0,
            },
          ],
          subtotal: 20.0,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        mock.onGet('/api/salesforce/carts/cart-1').reply(200, mockCart);

        const result = await client.getCart('cart-1');

        expect(result.id).toBe('cart-1');
        expect(result.items.length).toBe(1);
        expect(result.subtotal).toBe(20.0);
      });

      it('should handle 404 when cart not found', async () => {
        mock.onGet('/api/salesforce/carts/999').reply(404, {
          error: 'Cart not found',
        });

        await expect(client.getCart('999')).rejects.toThrow(/API Error: 404/);
      });
    });

    describe('listCarts', () => {
      it('should list all carts', async () => {
        const mockResponse = {
          data: [
            {
              id: 'cart-1',
              items: [],
              subtotal: 0,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            {
              id: 'cart-2',
              items: [],
              subtotal: 0,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ],
          pagination: {
            limit: 100,
            offset: 0,
            count: 2,
          },
        };

        mock.onGet(/\/api\/salesforce\/carts/).reply(200, mockResponse);

        const result = await client.listCarts();

        expect(result.data.length).toBe(2);
        expect(result.pagination.count).toBe(2);
      });

      it('should filter carts by accountId', async () => {
        const mockResponse = {
          data: [
            {
              id: 'cart-1',
              accountId: 'account-123',
              items: [],
              subtotal: 0,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ],
          pagination: {
            limit: 100,
            offset: 0,
            count: 1,
          },
        };

        mock.onGet(/\/api\/salesforce\/carts/).reply(200, mockResponse);

        const result = await client.listCarts(100, 0, 'account-123');

        expect(result.data.length).toBe(1);
        expect(result.data[0].accountId).toBe('account-123');
      });
    });

    describe('addToCart', () => {
      it('should add an item to cart', async () => {
        const input = {
          productId: 'prod-1',
          productName: 'Product 1',
          quantity: 2,
          price: 10.0,
        };

        const mockResponse = {
          id: 'cart-1',
          items: [
            {
              productId: 'prod-1',
              productName: 'Product 1',
              quantity: 2,
              price: 10.0,
              total: 20.0,
            },
          ],
          subtotal: 20.0,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        mock
          .onPost('/api/salesforce/carts/cart-1/items')
          .reply(200, mockResponse);

        const result = await client.addToCart('cart-1', input);

        expect(result.items.length).toBe(1);
        expect(result.items[0].productId).toBe('prod-1');
        expect(result.items[0].quantity).toBe(2);
        expect(result.subtotal).toBe(20.0);
      });

      it('should handle adding item to non-existent cart', async () => {
        mock.onPost('/api/salesforce/carts/999/items').reply(404, {
          error: 'Cart not found',
        });

        await expect(
          client.addToCart('999', {
            productId: 'prod-1',
            productName: 'Product 1',
            quantity: 1,
            price: 10.0,
          })
        ).rejects.toThrow(/API Error: 404/);
      });
    });

    describe('removeFromCart', () => {
      it('should remove an item from cart', async () => {
        const input = { productId: 'prod-1' };

        const mockResponse = {
          id: 'cart-1',
          items: [],
          subtotal: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        mock
          .onDelete('/api/salesforce/carts/cart-1/items')
          .reply(200, mockResponse);

        const result = await client.removeFromCart('cart-1', input);

        expect(result.items.length).toBe(0);
        expect(result.subtotal).toBe(0);
      });

      it('should handle removing item from non-existent cart', async () => {
        mock.onDelete('/api/salesforce/carts/999/items').reply(404, {
          error: 'Cart not found',
        });

        await expect(
          client.removeFromCart('999', { productId: 'prod-1' })
        ).rejects.toThrow(/API Error: 404/);
      });
    });

    describe('deleteCart', () => {
      it('should delete a cart', async () => {
        mock.onDelete('/api/salesforce/carts/cart-1').reply(204);

        await expect(client.deleteCart('cart-1')).resolves.not.toThrow();
      });

      it('should handle 404 when deleting non-existent cart', async () => {
        mock.onDelete('/api/salesforce/carts/999').reply(404, {
          error: 'Cart not found',
        });

        await expect(client.deleteCart('999')).rejects.toThrow(
          /API Error: 404/
        );
      });
    });
  });
});
