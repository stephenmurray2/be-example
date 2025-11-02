import timeout from 'connect-timeout';
import { Request, Response, NextFunction } from 'express';
import { config } from '../config/env.js';

export const timeoutMiddleware = timeout(config.timeout.request);

export const haltOnTimedout = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.timedout) {
    next();
  } else {
    res.status(408).json({
      error: 'Request timeout',
      message: 'The request took too long to process',
    });
  }
};
