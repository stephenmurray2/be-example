import express, { Express } from 'express';
import { timeoutMiddleware, haltOnTimedout } from './middlewares/timeout.js';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';
import healthRoutes from './routes/healthRoutes.js';
import authRoutes from './routes/authRoutes.js';
import salesforceRoutes from './routes/salesforceRoutes.js';

export function createApp(): Express {
  const app = express();

  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(timeoutMiddleware);
  app.use(haltOnTimedout);

  // CORS (optional, configure as needed)
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, DELETE, OPTIONS'
    );
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
    } else {
      next();
    }
  });

  // Routes
  app.use('/', healthRoutes);
  app.use('/api', authRoutes);
  app.use('/api/salesforce', salesforceRoutes);

  // Example protected route
  // import { authMiddleware } from './middlewares/auth.js';
  // app.use('/api/protected', authMiddleware, protectedRoutes);

  // Error handlers (must be last)
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
