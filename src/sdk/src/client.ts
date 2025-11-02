import axios, { AxiosInstance, AxiosError } from 'axios';
import {
  SalesforceAccount,
  SalesforceContact,
  SalesforceCart,
  CreateSalesforceAccountInput,
  UpdateSalesforceAccountInput,
  CreateSalesforceContactInput,
  UpdateSalesforceContactInput,
  CreateSalesforceCartInput,
  AddToCartInput,
  RemoveFromCartInput,
  ListResponse,
  SDKConfig,
} from './types.js';

export class SalesforceCartClient {
  private client: AxiosInstance;

  constructor(config: SDKConfig) {
    this.client = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
        ...(config.apiKey && { Authorization: `Bearer ${config.apiKey}` }),
      },
    });

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response) {
          throw new Error(
            `API Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`
          );
        } else if (error.request) {
          throw new Error('Network Error: No response received from server');
        } else {
          throw new Error(`Request Error: ${error.message}`);
        }
      }
    );
  }

  // Account methods
  async createAccount(
    input: CreateSalesforceAccountInput
  ): Promise<SalesforceAccount> {
    const response = await this.client.post<SalesforceAccount>(
      '/api/salesforce/accounts',
      input
    );
    return response.data;
  }

  async getAccount(id: string): Promise<SalesforceAccount> {
    const response = await this.client.get<SalesforceAccount>(
      `/api/salesforce/accounts/${id}`
    );
    return response.data;
  }

  async listAccounts(
    limit = 100,
    offset = 0
  ): Promise<ListResponse<SalesforceAccount>> {
    const response = await this.client.get<ListResponse<SalesforceAccount>>(
      '/api/salesforce/accounts',
      {
        params: { limit, offset },
      }
    );
    return response.data;
  }

  async updateAccount(
    id: string,
    input: UpdateSalesforceAccountInput
  ): Promise<SalesforceAccount> {
    const response = await this.client.put<SalesforceAccount>(
      `/api/salesforce/accounts/${id}`,
      input
    );
    return response.data;
  }

  async deleteAccount(id: string): Promise<void> {
    await this.client.delete(`/api/salesforce/accounts/${id}`);
  }

  // Contact methods
  async createContact(
    input: CreateSalesforceContactInput
  ): Promise<SalesforceContact> {
    const response = await this.client.post<SalesforceContact>(
      '/api/salesforce/contacts',
      input
    );
    return response.data;
  }

  async getContact(id: string): Promise<SalesforceContact> {
    const response = await this.client.get<SalesforceContact>(
      `/api/salesforce/contacts/${id}`
    );
    return response.data;
  }

  async listContacts(
    limit = 100,
    offset = 0,
    accountId?: string
  ): Promise<ListResponse<SalesforceContact>> {
    const response = await this.client.get<ListResponse<SalesforceContact>>(
      '/api/salesforce/contacts',
      {
        params: { limit, offset, accountId },
      }
    );
    return response.data;
  }

  async getContactsByAccount(
    accountId: string
  ): Promise<ListResponse<SalesforceContact>> {
    return this.listContacts(100, 0, accountId);
  }

  async updateContact(
    id: string,
    input: UpdateSalesforceContactInput
  ): Promise<SalesforceContact> {
    const response = await this.client.put<SalesforceContact>(
      `/api/salesforce/contacts/${id}`,
      input
    );
    return response.data;
  }

  async deleteContact(id: string): Promise<void> {
    await this.client.delete(`/api/salesforce/contacts/${id}`);
  }

  // Cart methods
  async createCart(input: CreateSalesforceCartInput): Promise<SalesforceCart> {
    const response = await this.client.post<SalesforceCart>(
      '/api/salesforce/carts',
      input
    );
    return response.data;
  }

  async getCart(id: string): Promise<SalesforceCart> {
    const response = await this.client.get<SalesforceCart>(
      `/api/salesforce/carts/${id}`
    );
    return response.data;
  }

  async listCarts(
    limit = 100,
    offset = 0,
    accountId?: string
  ): Promise<ListResponse<SalesforceCart>> {
    const params: Record<string, string | number> = { limit, offset };
    if (accountId) {
      params.accountId = accountId;
    }

    const response = await this.client.get<ListResponse<SalesforceCart>>(
      '/api/salesforce/carts',
      { params }
    );
    return response.data;
  }

  async getCartsByAccount(
    accountId: string
  ): Promise<ListResponse<SalesforceCart>> {
    return this.listCarts(100, 0, accountId);
  }

  async addToCart(
    cartId: string,
    input: AddToCartInput
  ): Promise<SalesforceCart> {
    const response = await this.client.post<SalesforceCart>(
      `/api/salesforce/carts/${cartId}/items`,
      input
    );
    return response.data;
  }

  async removeFromCart(
    cartId: string,
    input: RemoveFromCartInput
  ): Promise<SalesforceCart> {
    const response = await this.client.delete<SalesforceCart>(
      `/api/salesforce/carts/${cartId}/items`,
      { data: input }
    );
    return response.data;
  }

  async deleteCart(id: string): Promise<void> {
    await this.client.delete(`/api/salesforce/carts/${id}`);
  }
}
