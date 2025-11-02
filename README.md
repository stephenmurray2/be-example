# A simple SalesforceCart application

A simple "SalesforceCart" application. As instructed, this is a minimal implementation of a "Salesforce" functionality, and does not rely on any real requests to third-party services. The source code for the client (or sdk) is given in src/. Since the client application is also a node package, it is more appropriately defined as a subfolder within src. Please note that the tests for this `SalesforceCartClient` are given in src/sdk/tests.

The prompts used for Claude Code are given in PROMPTS.md

## Known unresolved issues

- During code creation in Claude Code, many generic "escape hatch" steps were taken to quickly resolve type issues (eg. casting as `any`), these should be properly resolved.
- Some warnings arising from jest config should be resolved (or another test framework should be used)
- ESLint config isn't setup properly
- There isn't 100% unit test coverage (according to the lcov reports). Unit tests should be added (both for api and sdk)

Everything hereafter is auto-generated documentation from Claude Code.

## Features

- **TypeScript**: Full TypeScript support with strict type checking
- **Express.js**: RESTful API framework
- **MongoDB**: NoSQL database with native driver
- **Redis**: In-memory caching layer
- **JWT Authentication**: Secure token-based authentication
- **Request Timeout**: Automatic request timeout handling with connect-timeout
- **Docker**: Multi-stage Docker build with docker-compose for local development
- **AWS Deployment**: Support for both ECS and Lambda (API Gateway) deployments
- **Serverless Framework**: Infrastructure as code for AWS Lambda
- **Code Quality**: ESLint and Prettier for code formatting and linting

## Project Structure

```
be-example/
├── src/
│   ├── config/          # Configuration files (env, database, redis, storage)
│   ├── controllers/     # Request handlers (health, auth, salesforce)
│   ├── middlewares/     # Express middlewares (auth, timeout, error handling)
│   ├── routes/          # API route definitions (health, auth, salesforce)
│   ├── services/        # Business logic layer (SalesforceService)
│   ├── models/          # Data models (accounts, contacts, repositories)
│   ├── utils/           # Utility functions (cache service)
│   ├── sdk/             # TypeScript SDK package
│   │   ├── src/         # SDK source code
│   │   │   ├── client.ts    # SDK client implementation
│   │   │   ├── types.ts     # Type definitions
│   │   │   └── index.ts     # SDK exports
│   │   ├── tests/         # Tests for SDK
│   │   │   └── salesforceCartClient.ts # Jest tests
│   │   ├── package.json     # SDK package configuration
│   │   ├── tsconfig.json    # SDK TypeScript config
│   │   └── README.md        # SDK documentation
│   ├── app.ts           # Express app setup
│   ├── index.ts         # Standalone server entry point
│   └── lambda.ts        # AWS Lambda handler
├── docker-compose.yml   # Local development setup
├── Dockerfile           # Production Docker image
├── serverless.yml       # Serverless Framework configuration
└── ecs-task-definition.json  # AWS ECS task definition
```

## Prerequisites

- Node.js >= 18.0.0
- Docker and Docker Compose (for local development)
- AWS CLI (for AWS deployments)
- Serverless Framework CLI (for Lambda deployments)

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

Copy the example environment file and configure your settings:

```bash
cp .env.example .env
```

Edit `.env` with your configuration.

### 3. Local Development

#### Option A: Using Docker Compose (Recommended)

```bash
docker-compose up
```

This will start the API, MongoDB, and Redis containers.

#### Option B: Running Locally

Ensure MongoDB and Redis are running, then:

```bash
npm run dev
```

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript (API + SDK)
- `npm run build:api` - Build only the API
- `npm run build:sdk` - Build only the SDK package
- `npm start` - Start production server
- `npm test` - Run Jest tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

## Storage Backend

The application supports two storage backends that can be configured via the `STORAGE_BACKEND` environment variable:

- **database** (default): Uses MongoDB for persistent storage
- **memory**: Uses in-memory Map storage (useful for testing, data lost on restart)

Set in your `.env` file:
```bash
STORAGE_BACKEND=database  # or 'memory'
```

## API Endpoints

### Health Check
- `GET /health` - Check API and service health

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and receive JWT token

### Salesforce API

#### Accounts
- `POST /api/salesforce/accounts` - Create a new account
- `GET /api/salesforce/accounts` - List accounts (query params: limit, offset)
- `GET /api/salesforce/accounts/:id` - Get account by ID
- `PUT /api/salesforce/accounts/:id` - Update account
- `PATCH /api/salesforce/accounts/:id` - Partially update account
- `DELETE /api/salesforce/accounts/:id` - Delete account

#### Contacts
- `POST /api/salesforce/contacts` - Create a new contact
- `GET /api/salesforce/contacts` - List contacts (query params: limit, offset, accountId)
- `GET /api/salesforce/contacts/:id` - Get contact by ID
- `PUT /api/salesforce/contacts/:id` - Update contact
- `PATCH /api/salesforce/contacts/:id` - Partially update contact
- `DELETE /api/salesforce/contacts/:id` - Delete contact

### Protected Routes
Add `Authorization: Bearer <token>` header to access protected routes.

## SDK Package

The project includes a TypeScript SDK for consuming the Salesforce API. The SDK is located in `src/sdk/` and can be built independently.

### Installing the SDK

```bash
npm install @be-example/salesforce-sdk axios
```

### Using the SDK

```typescript
import { SalesforceCartClient } from '@be-example/salesforce-sdk';

const client = new SalesforceCartClient({
  baseURL: 'http://localhost:3000',
  apiKey: 'your-api-key', // optional
  timeout: 30000,
});

// Create an account
const account = await client.createAccount({
  name: 'Acme Corporation',
  industry: 'Technology',
  website: 'https://acme.com',
});

// List accounts
const accounts = await client.listAccounts(50, 0);

// Create a contact
const contact = await client.createContact({
  accountId: account.id,
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@acme.com',
});
```

See `src/sdk/README.md` for complete SDK documentation.

## Deployment

### Docker (Local/ECS)

Build and run with Docker:

```bash
docker build -t be-example .
docker run -p 3000:3000 --env-file .env be-example
```

### AWS ECS

1. Build and push image to ECR:
```bash
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_ECR_URI
docker build -t be-example .
docker tag be-example:latest YOUR_ECR_URI:latest
docker push YOUR_ECR_URI:latest
```

2. Register task definition:
```bash
aws ecs register-task-definition --cli-input-json file://ecs-task-definition.json
```

3. Create/update service (configure as needed).

### AWS Lambda (Serverless)

1. Configure AWS credentials:
```bash
aws configure
```

2. Store secrets in SSM Parameter Store:
```bash
aws ssm put-parameter --name "/be-example/dev/mongodb-uri" --value "YOUR_MONGODB_URI" --type "String"
aws ssm put-parameter --name "/be-example/dev/redis-host" --value "YOUR_REDIS_HOST" --type "String"
aws ssm put-parameter --name "/be-example/dev/redis-port" --value "6379" --type "String"
aws ssm put-parameter --name "/be-example/dev/jwt-secret" --value "YOUR_SECRET" --type "SecureString"
```

3. Deploy with Serverless Framework:
```bash
npx serverless deploy --stage dev
```

4. Test locally:
```bash
npx serverless offline
```

## Architecture

### Middleware Stack
1. JSON body parser
2. Request timeout (30s default)
3. CORS headers
4. Routes
5. 404 handler
6. Error handler

### Storage Layer
- Configurable storage backend (database or in-memory)
- MongoDB: Persistent connection with automatic reconnection (when using database backend)
- In-memory: Map-based storage for testing (when using memory backend)
- Redis: Connection pooling for caching

### Authentication Flow
1. User logs in with credentials
2. Server validates and returns JWT token
3. Client includes token in Authorization header
4. Auth middleware validates token on protected routes

## Security Notes

- Change JWT_SECRET in production
- Use environment variables for sensitive data
- Implement password hashing (bcrypt) for production
- Configure CORS appropriately
- Use HTTPS in production
- Store AWS secrets in Secrets Manager or Parameter Store

## License

ISC
