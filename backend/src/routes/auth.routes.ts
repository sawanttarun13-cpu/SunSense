/**
 * --------------------------------------------------------
 * File: auth.routes.ts
 * Layer: Routes
 *
 * Purpose:
 * Defines all Express routes for the authentication domain.
 * Maps HTTP methods and URL paths to controller handlers,
 * and chains middleware (rate limiting, validation, auth)
 * in the correct order.
 *
 * Base Path: /api/v1/auth (mounted in app.ts)
 *
 * Middleware chain (per route, left to right):
 * 1. authLimiter       → Throttle brute-force attempts
 * 2. validateRequest() → Reject malformed request bodies early
 * 3. requireAuth       → Verify JWT (protected routes only)
 * 4. controller.method → Execute the business logic
 * --------------------------------------------------------
 */
import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validateRequest } from '../middleware/validateRequest';
import { RegisterSchema, LoginSchema } from '../models/validators';
import { requireAuth } from '../middleware/requireAuth';
import { authLimiter } from '../middleware/rateLimiter';

const router = Router();
const authController = new AuthController();

/**
 * POST /api/v1/auth/register
 *
 * Public Route | Rate-limited (5 req / 15 min)
 * Creates a new user account.
 * Body: { email, password, name }
 */
router.post('/register', authLimiter, validateRequest(RegisterSchema), authController.register);

/**
 * POST /api/v1/auth/login
 *
 * Public Route | Rate-limited (5 req / 15 min)
 * Authenticates user and sets refreshToken cookie.
 * Body: { email, password }
 */
router.post('/login', authLimiter, validateRequest(LoginSchema), authController.login);

/**
 * POST /api/v1/auth/refresh
 *
 * Public Route
 * Issues a new access token using the HttpOnly refreshToken cookie.
 * No body required.
 */
router.post('/refresh', authController.refresh);

/**
 * POST /api/v1/auth/logout
 *
 * Public Route
 * Clears the refreshToken cookie.
 * No body required.
 */
router.post('/logout', authController.logout);

/**
 * GET /api/v1/auth/me
 *
 * Protected Route | Requires: Authorization: Bearer <token>
 * Returns the authenticated user's public profile.
 */
router.get('/me', requireAuth, authController.getMe);

export default router;
