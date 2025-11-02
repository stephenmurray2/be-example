export interface SalesforceAccount {
  id: string;
  name: string;
  industry?: string;
  accountNumber?: string;
  website?: string;
  phone?: string;
  billingAddress?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSalesforceAccountInput {
  name: string;
  industry?: string;
  accountNumber?: string;
  website?: string;
  phone?: string;
  billingAddress?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
}

export interface UpdateSalesforceAccountInput {
  name?: string;
  industry?: string;
  accountNumber?: string;
  website?: string;
  phone?: string;
  billingAddress?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
}

export interface SalesforceContact {
  id: string;
  accountId?: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  title?: string;
  department?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSalesforceContactInput {
  accountId?: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  title?: string;
  department?: string;
}

export interface UpdateSalesforceContactInput {
  accountId?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  title?: string;
  department?: string;
}

export interface CartItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
}

export interface SalesforceCart {
  id: string;
  accountId?: string;
  items: CartItem[];
  subtotal: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSalesforceCartInput {
  accountId?: string;
}

export interface AddToCartInput {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export interface RemoveFromCartInput {
  productId: string;
}

export interface ListResponse<T> {
  data: T[];
  pagination: {
    limit: number;
    offset: number;
    count: number;
  };
}

export interface SDKConfig {
  baseURL: string;
  apiKey?: string;
  timeout?: number;
}
