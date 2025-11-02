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

export interface UpdateCartItemInput {
  productId: string;
  quantity: number;
}
