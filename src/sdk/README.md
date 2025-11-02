# Salesforce Client SDK

TypeScript SDK for interacting with the SalesforceService API.

## Installation

```bash
npm install @be-example/salesforce-sdk axios
```

## Usage

```typescript
import { SalesforceCartClient } from '@be-example/salesforce-sdk';

// Initialize the SDK
const client = new SalesforceCartClient({
  baseURL: 'http://localhost:3000',
  apiKey: 'your-api-key', // Optional, if using authentication
  timeout: 30000, // Optional, defaults to 30000ms
});

// Create an account
const account = await client.createAccount({
  name: 'Acme Corporation',
  industry: 'Technology',
  website: 'https://acme.com',
  phone: '+1-555-0123',
  billingAddress: {
    street: '123 Main St',
    city: 'San Francisco',
    state: 'CA',
    postalCode: '94105',
    country: 'USA',
  },
});

// Get an account
const fetchedAccount = await client.getAccount(account.id);

// List accounts
const accounts = await client.listAccounts(50, 0);
console.log(accounts.data);

// Update an account
const updatedAccount = await client.updateAccount(account.id, {
  phone: '+1-555-9999',
});

// Delete an account
await client.deleteAccount(account.id);

// Create a contact
const contact = await client.createContact({
  accountId: account.id,
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@acme.com',
  phone: '+1-555-0124',
  title: 'CEO',
  department: 'Executive',
});

// Get contacts for an account
const accountContacts = await client.getContactsByAccount(account.id);

// List all contacts
const contacts = await client.listContacts(50, 0);

// Update a contact
const updatedContact = await client.updateContact(contact.id, {
  title: 'Chief Executive Officer',
});

// Delete a contact
await client.deleteContact(contact.id);
```

## API Reference

### Configuration

```typescript
interface SDKConfig {
  baseURL: string; // Base URL of the API
  apiKey?: string; // Optional API key for authentication
  timeout?: number; // Request timeout in milliseconds (default: 30000)
}
```

### Account Methods

- `createAccount(input: CreateSalesforceAccountInput): Promise<SalesforceAccount>`
- `getAccount(id: string): Promise<SalesforceAccount>`
- `listAccounts(limit?: number, offset?: number): Promise<ListResponse<SalesforceAccount>>`
- `updateAccount(id: string, input: UpdateSalesforceAccountInput): Promise<SalesforceAccount>`
- `deleteAccount(id: string): Promise<void>`

### Contact Methods

- `createContact(input: CreateSalesforceContactInput): Promise<SalesforceContact>`
- `getContact(id: string): Promise<SalesforceContact>`
- `listContacts(limit?: number, offset?: number, accountId?: string): Promise<ListResponse<SalesforceContact>>`
- `getContactsByAccount(accountId: string): Promise<ListResponse<SalesforceContact>>`
- `updateContact(id: string, input: UpdateSalesforceContactInput): Promise<SalesforceContact>`
- `deleteContact(id: string): Promise<void>`

## Error Handling

The SDK throws errors with descriptive messages for:
- API errors (4xx, 5xx responses)
- Network errors (no response)
- Request configuration errors

```typescript
try {
  const account = await client.getAccount('invalid-id');
} catch (error) {
  console.error('Failed to fetch account:', error.message);
}
```

## TypeScript Support

The SDK is written in TypeScript and includes full type definitions.

## Testing

The SDK includes comprehensive Jest tests with 96% code coverage.

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

### Test Coverage

- **31 tests** covering all SDK functionality
- **96% statement coverage**
- **100% function coverage**
- All operations tested (CRUD for accounts and contacts)
- Error handling scenarios
- Integration tests

See `test/README.md` for detailed testing documentation.

## Development

```bash
# Install dependencies
npm install

# Build the SDK
npm run build

# Run tests
npm test
```

## License

ISC
