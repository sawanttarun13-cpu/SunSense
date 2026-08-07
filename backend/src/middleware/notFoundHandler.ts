/**
 * --------------------------------------------------------
 * File: notFoundHandler.ts
 * Layer: Middleware / Error Handling
 *
 * Purpose:
 * Handles all requests that do not match any registered
 * Express route. Returns a standardised 404 JSON error
 * that includes the attempted URL, making it easy for
 * API consumers to diagnose routing mistakes.
 *
 * Placement:
 * This middleware must be registered AFTER all route
 * definitions in app.ts but BEFORE the global error
 * handler (errorHandler.ts).
 * --------------------------------------------------------
 */
import { Request, Response } from 'express';
import { sendError } from '../utils/apiResponse';

/**
 * Catch-all 404 handler for unmatched routes.
 *
 * Called by Express when no prior route matched the
 * incoming request. Returns a JSON 404 response with
 * the unrecognised URL so the client knows exactly
 * which path it requested.
 *
 * @param req - The Express Request (used to read req.originalUrl).
 * @param res - The Express Response used to send the 404 JSON.
 */
export const notFoundHandler = (req: Request, res: Response) => {
  sendError(res, `Route not found: ${req.originalUrl}`, 404);
};
