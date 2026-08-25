/**
 * --------------------------------------------------------
 * File: validateRequest.ts
 * Layer: Middleware / Validation
 *
 * Purpose:
 * Provides a higher-order middleware factory that validates
 * the incoming request body against a Zod schema before
 * the request reaches the controller. If validation fails,
 * a structured 400 error is returned immediately and the
 * controller is never called.
 *
 * Why Zod?
 * Zod schemas serve as a single source of truth for both
 * TypeScript types (via inference) and runtime validation.
 * This eliminates the need for separate type definitions and
 * manual type checks in controllers.
 *
 * Usage:
 * router.post('/login', validateRequest(LoginSchema), controller.login);
 *
 * Error Response Format (400 Bad Request):
 * {
 *   "success": false,
 *   "error": {
 *     "message": "Validation Error",
 *     "details": [ { "path": ["email"], "message": "Invalid email" } ]
 *   }
 * }
 * --------------------------------------------------------
 */
import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { sendError } from '../utils/apiResponse';

/**
 * Creates an Express middleware that validates `req.body` against a Zod schema.
 *
 * The middleware is a higher-order function (factory pattern) so each route
 * can pass its own schema:
 *
 * @param schema - A Zod schema instance describing the expected request body shape.
 * @returns      Express middleware function that either calls next() on success
 *               or sends a 400 JSON error with the Zod validation issues.
 *
 * @example
 * const LoginSchema = z.object({
 *   email: z.string().email(),
 *   password: z.string().min(8),
 * });
 * router.post('/login', validateRequest(LoginSchema), loginController);
 */
export const validateRequest = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // parseAsync handles both sync and async Zod refinements.
      // It throws a ZodError on failure.
      await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        console.error("[VALIDATION ERROR]", JSON.stringify(error.issues));
        return sendError(res, 'Validation Error', 400, error.issues);
      }
      // Unexpected error (not a validation failure)
      return sendError(res, 'Internal Server Error', 500);
    }
  };
};
