/**
 * --------------------------------------------------------
 * File: errorHandler.ts
 * Layer: Middleware / Error Handling
 *
 * Purpose:
 * Global Express error-handling middleware that catches any
 * error thrown or passed to next(error) within the request
 * pipeline. It formats the error into a consistent JSON
 * response and ensures that unhandled exceptions never
 * leak raw stack traces to the client in production.
 *
 * Express Error Handler Convention:
 * Express identifies error-handling middleware by the
 * four-argument signature (err, req, res, next).
 * This middleware MUST be registered LAST in app.ts,
 * after all routes, for Express to route errors to it.
 *
 * Security:
 * Stack traces are only included in the response when
 * NODE_ENV=development. In production, only the message
 * is returned to prevent internal implementation details
 * from being exposed to external callers.
 * --------------------------------------------------------
 */
import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/apiResponse';
import { logger } from '../utils/logger';
import { config } from '../config/env';

/**
 * Global Express error-handling middleware.
 *
 * Catches all errors passed via next(error) in any route
 * or middleware earlier in the pipeline. Logs the full
 * error (including stack) server-side, then sends a clean
 * JSON response to the caller.
 *
 * @param err   - The error object thrown or passed to next().
 *                May be a standard Error, a custom AppError, or an unknown value.
 * @param req   - The Express Request (not used but required by Express for the 4-arg signature).
 * @param res   - The Express Response used to send the error JSON.
 * @param _next - Express NextFunction (unused; prefixed with _ to satisfy linting rules).
 */
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  // Always log the full error server-side for debugging
  logger.error('Unhandled Exception:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // In development, include the stack trace in the response body
  // to speed up debugging. Never expose stack traces in production.
  sendError(
    res,
    message,
    statusCode,
    config.nodeEnv === 'development' ? err.stack : undefined
  );
};
