import { AccountRepository } from '../models/accountRepository.js';
import { ContactRepository } from '../models/contactRepository.js';
import { CartRepository } from '../models/cartRepository.js';
import {
  SalesforceAccount,
  CreateSalesforceAccountInput,
  UpdateSalesforceAccountInput,
} from '../models/salesforceAccount.js';
import {
  SalesforceContact,
  CreateSalesforceContactInput,
  UpdateSalesforceContactInput,
} from '../models/salesforceContact.js';
import {
  SalesforceCart,
  CreateSalesforceCartInput,
  AddToCartInput,
  RemoveFromCartInput,
} from '../models/salesforceCart.js';

export class SalesforceService {
  private accountRepository: AccountRepository;
  private contactRepository: ContactRepository;
  private cartRepository: CartRepository;

  constructor() {
    this.accountRepository = new AccountRepository();
    this.contactRepository = new ContactRepository();
    this.cartRepository = new CartRepository();
  }

  // Account operations
  async createAccount(
    input: CreateSalesforceAccountInput
  ): Promise<SalesforceAccount> {
    return this.accountRepository.create(input);
  }

  async getAccount(id: string): Promise<SalesforceAccount | null> {
    return this.accountRepository.findById(id);
  }

  async listAccounts(limit = 100, offset = 0): Promise<SalesforceAccount[]> {
    return this.accountRepository.findAll(limit, offset);
  }

  async updateAccount(
    id: string,
    input: UpdateSalesforceAccountInput
  ): Promise<SalesforceAccount | null> {
    return this.accountRepository.update(id, input);
  }

  async deleteAccount(id: string): Promise<boolean> {
    return this.accountRepository.delete(id);
  }

  // Contact operations
  async createContact(
    input: CreateSalesforceContactInput
  ): Promise<SalesforceContact> {
    return this.contactRepository.create(input);
  }

  async getContact(id: string): Promise<SalesforceContact | null> {
    return this.contactRepository.findById(id);
  }

  async listContacts(limit = 100, offset = 0): Promise<SalesforceContact[]> {
    return this.contactRepository.findAll(limit, offset);
  }

  async getContactsByAccount(accountId: string): Promise<SalesforceContact[]> {
    return this.contactRepository.findByAccountId(accountId);
  }

  async updateContact(
    id: string,
    input: UpdateSalesforceContactInput
  ): Promise<SalesforceContact | null> {
    return this.contactRepository.update(id, input);
  }

  async deleteContact(id: string): Promise<boolean> {
    return this.contactRepository.delete(id);
  }

  // Cart operations
  async createCart(input: CreateSalesforceCartInput): Promise<SalesforceCart> {
    return this.cartRepository.create(input);
  }

  async getCart(id: string): Promise<SalesforceCart | null> {
    return this.cartRepository.findById(id);
  }

  async getCartsByAccount(accountId: string): Promise<SalesforceCart[]> {
    return this.cartRepository.findByAccountId(accountId);
  }

  async listCarts(limit = 100, offset = 0): Promise<SalesforceCart[]> {
    return this.cartRepository.findAll(limit, offset);
  }

  async addToCart(
    cartId: string,
    input: AddToCartInput
  ): Promise<SalesforceCart | null> {
    return this.cartRepository.addItem(cartId, input);
  }

  async removeFromCart(
    cartId: string,
    input: RemoveFromCartInput
  ): Promise<SalesforceCart | null> {
    return this.cartRepository.removeItem(cartId, input);
  }

  async deleteCart(id: string): Promise<boolean> {
    return this.cartRepository.delete(id);
  }
}

// Singleton instance
export const salesforceService = new SalesforceService();
