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
