# SDK Test Suite

Comprehensive Jest tests for the SalesforceCartClient SDK.

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## Test Structure

### Test Files

- **setup.ts** - Test environment setup
- **salesforceCartClient.test.ts** - Comprehensive tests for the SDK client

### Test Coverage

The test suite includes **31 tests** covering:

#### Constructor Tests (3 tests)
- ✓ Creating client with default timeout
- ✓ Creating client with custom timeout
- ✓ Creating client with API key authentication

#### Account Operations Tests (11 tests)
- ✓ Creating accounts with various configurations
- ✓ Retrieving accounts by ID
- ✓ Listing accounts with pagination
- ✓ Updating account information
- ✓ Deleting accounts
- ✓ Error handling for all operations

#### Contact Operations Tests (11 tests)
- ✓ Creating contacts with minimal and complete fields
- ✓ Associating contacts with accounts
- ✓ Retrieving contacts by ID
- ✓ Listing contacts with pagination and filters
- ✓ Getting contacts by account ID
- ✓ Updating contacts
- ✓ Deleting contacts
- ✓ Error handling for all operations

#### Error Handling Tests (3 tests)
- ✓ Handling timeout errors
- ✓ Handling request configuration errors
- ✓ Including error details in error messages

#### Integration Scenarios (3 tests)
- ✓ Sequential operations (create account → create contact)
- ✓ Parallel requests handling
- ✓ Complex workflows

## Test Implementation

### Mocking Strategy

Tests use **axios-mock-adapter** to mock HTTP responses:

```typescript
import MockAdapter from 'axios-mock-adapter';

let mock: MockAdapter;

beforeEach(() => {
  client = new SalesforceCartClient({ baseURL: 'http://localhost:3000' });
  mock = new MockAdapter(client.client);
});

afterEach(() => {
  mock.restore();
});
```

### Example Test

```typescript
it('should create a new account', async () => {
  const input = {
    name: 'Acme Corporation',
    industry: 'Technology',
  };

  const mockResponse = {
    id: '123',
    ...input,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  mock.onPost('/api/salesforce/accounts').reply(200, mockResponse);

  const result = await client.createAccount(input);

  expect(result.id).toBe('123');
  expect(result.name).toBe(input.name);
});
```

## Coverage Statistics

- **Statement Coverage**: 96.29%
- **Branch Coverage**: 91.66%
- **Function Coverage**: 100%
- **Line Coverage**: 96.29%

View detailed coverage report:
```bash
npm run test:coverage
open coverage/index.html
```

## Test Categories

### Happy Path Tests
Tests that verify correct behavior under normal conditions:
- Creating resources
- Retrieving resources
- Updating resources
- Deleting resources
- Listing with pagination

### Error Handling Tests
Tests that verify proper error handling:
- API errors (4xx, 5xx responses)
- Network errors
- Timeout errors
- Request configuration errors

### Edge Cases
Tests for boundary conditions:
- Empty responses
- Missing optional parameters
- Custom configurations

### Integration Tests
Tests that verify multiple operations work together:
- Sequential operations
- Parallel requests
- Complex workflows

## Writing New Tests

When adding new tests:

1. Import required utilities:
```typescript
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import MockAdapter from 'axios-mock-adapter';
```

2. Set up mocks in beforeEach:
```typescript
beforeEach(() => {
  client = new SalesforceCartClient({ baseURL: 'http://localhost:3000' });
  mock = new MockAdapter(client.client);
});
```

3. Clean up in afterEach:
```typescript
afterEach(() => {
  mock.restore();
});
```

4. Write descriptive tests:
```typescript
describe('Feature', () => {
  it('should behave correctly in specific scenario', async () => {
    // Setup mock
    mock.onGet('/api/endpoint').reply(200, mockData);

    // Execute
    const result = await client.method();

    // Assert
    expect(result).toBe(expected);
  });
});
```

## Dependencies

- **jest** - Testing framework
- **ts-jest** - TypeScript support
- **axios-mock-adapter** - HTTP mocking
- **@jest/globals** - Jest utilities

## Current Status

✅ All 31 tests passing
✅ 96% code coverage
✅ 100% function coverage
✅ Comprehensive error handling
✅ Integration test scenarios
