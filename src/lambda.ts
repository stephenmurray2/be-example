import serverless from 'serverless-http';
import { createApp } from './app.js';
import { connectToDatabase } from './config/database.js';
import { connectToRedis } from './config/redis.js';

let isInitialized = false;

async function initialize() {
  if (!isInitialized) {
    await connectToDatabase();
    await connectToRedis();
    isInitialized = true;
  }
}

const app = createApp();
const serverlessHandler = serverless(app);

export const handler = async (event: any, context: any) => {
  // AWS Lambda context configuration
  context.callbackWaitsForEmptyEventLoop = false;

  try {
    await initialize();
    return await serverlessHandler(event, context);
  } catch (error) {
    console.error('Lambda handler error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
};
