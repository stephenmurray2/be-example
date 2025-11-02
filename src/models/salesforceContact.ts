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
