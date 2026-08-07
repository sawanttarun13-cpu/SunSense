/**
 * --------------------------------------------------------
 * File: requireAuth.ts
 * Layer: Middleware / Security
 *
 * Purpose:
 * Protects routes that require a logged-in user.
 * Validates the JWT access token provided in the
 * Authorization request header, verifies the token
 * signature, confirms the user still exists in the
 * database, and attaches the user ID to the request
 * object so downstream controllers can identify the caller.
 *
 * Authentication Flow:
 * 1. Extract the Bearer token from the Authorization header.
 * 2. Verify the token signature and expiry using JWT_SECRET.
 * 3. Look up the user by the ID encoded in the token payload.
 * 4. Reject the request with 401 if any step fails.
 * 5. Attach req.userId and call next() on success.
 *
 * Usage:
 * router.get('/profile', requireAuth, profileController.get);
 * --------------------------------------------------------
 */
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { sendError } from '../utils/apiResponse';
import { prisma } from '../config/prisma';

/**
 * Extended Express Request that carries the authenticated user's ID.
 *
 * Controllers that sit behind `requireAuth` can safely read
 * `req.userId` without checking for undefined — the middleware
 * guarantees it is populated before next() is called.
 */
export interface AuthRequest extends Request {
  /** The UUID of the authenticated user. Set by requireAuth middleware. */
  userId?: string;
}

/**
 * Express middleware that enforces user JWT authentication.
 *
 * Rejects requests with:
 * - 401 if no Authorization header or Bearer token is present.
 * - 401 if the token signature is invalid or the token has expired.
 * - 401 if the user encoded in the token no longer exists in the database.
 *   (Handles cases where a user was deleted after their token was issued.)
 *
 * @param req  - Express request (extended with optional userId).
 * @param res  - Express response.
 * @param next - Express next function; called only when auth passes.
 */
export const requireAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 'Unauthorized - No token provided', 401);
    }

    // Extract the raw token after the "Bearer " prefix
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwtSecret) as { userId: string };

    // Confirm the user still exists — tokens are not invalidated on deletion
    // so this check protects against deleted-user scenarios.
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user) {
      return sendError(res, 'Unauthorized - User not found', 401);
    }

    // Attach the verified user ID for use by downstream controllers
    req.userId = user.id;
    next();
  } catch {
    // Covers jwt.verify throwing (expired, bad signature, malformed token)
    return sendError(res, 'Unauthorized - Invalid token', 401);
  }
};
