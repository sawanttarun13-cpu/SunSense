/**
 * --------------------------------------------------------
 * File: apiResponse.ts
 * Layer: Utility
 *
 * Purpose:
 * Provides two helper functions that standardise every JSON
 * response sent by the Express API. All controllers use
 * these helpers instead of calling res.json() directly,
 * guaranteeing a consistent response envelope across the
 * entire API surface.
 *
 * Response Envelope Format:
 *
 * Success:
 * {
 *   "success": true,
 *   "data": { ... }
 * }
 *
 * Error:
 * {
 *   "success": false,
 *   "error": {
 *     "message": "Human-readable error message",
 *     "details": [ ... ]   // Optional – only included when details are provided
 *   }
 * }
 * --------------------------------------------------------
 */
import { Response } from 'express';

/**
 * Sends a standardised success response.
 *
 * @param res        - Express Response object.
 * @param data       - The payload to include in the `data` field.
 * @param statusCode - HTTP status code. Defaults to 200 (OK).
 *                     Use 201 for resource creation endpoints.
 * @returns          The Express response object (allows `return sendSuccess(...)`).
 */
export const sendSuccess = (res: Response, data: any, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    data,
  });
};

/**
 * Sends a standardised error response.
 *
 * @param res        - Express Response object.
 * @param message    - Human-readable description of the error.
 * @param statusCode - HTTP status code. Defaults to 500 (Internal Server Error).
 * @param details    - Optional extra context (e.g., Zod validation issues).
 *                     Omitted from the response when not provided.
 * @returns          The Express response object.
 */
export const sendError = (res: Response, message: string, statusCode = 500, details?: any) => {
  return res.status(statusCode).json({
    success: false,
    error: {
      message,
      ...(details && { details }),
    },
  });
};
