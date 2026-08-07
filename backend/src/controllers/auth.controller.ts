/**
 * --------------------------------------------------------
 * File: auth.controller.ts
 * Layer: Controller / HTTP Handler
 *
 * Purpose:
 * Handles all HTTP requests for user authentication.
 * Each method extracts data from the request, calls the
 * appropriate AuthService method, and returns a standardised
 * JSON response. Contains no business logic.
 *
 * Endpoints served:
 * POST /api/v1/auth/register
 * POST /api/v1/auth/login
 * POST /api/v1/auth/refresh
 * POST /api/v1/auth/logout
 * GET  /api/v1/auth/me
 *
 * Layer:
 * Controller (HTTP only — no business logic)
 *
 * Uses:
 * AuthService — All authentication business logic
 * --------------------------------------------------------
 */
import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { AuthRequest } from '../middleware/requireAuth';

const authService = new AuthService();

export class AuthController {

  /**
   * POST /api/v1/auth/register
   *
   * Public Route (rate-limited by authLimiter)
   *
   * Creates a new user account.
   *
   * Request Body (validated by RegisterSchema):
   * { email, password, name }
   *
   * Responses:
   * 201 → { id, email, name } — User created successfully
   * 409 → 'Email already registered' — Duplicate email
   * 400 → Other registration error
   */
  async register(req: Request, res: Response) {
    try {
      const result = await authService.register(req.body);
      return sendSuccess(res, result, 201);
    } catch (error: any) {
      // Duplicate email gets a 409 Conflict; all other errors get 400
      if (error.message === 'Email already registered') {
        return sendError(res, error.message, 409);
      }
      return sendError(res, error.message, 400);
    }
  }

  /**
   * POST /api/v1/auth/login
   *
   * Public Route (rate-limited by authLimiter)
   *
   * Authenticates a user and issues JWT tokens.
   *
   * Request Body (validated by LoginSchema):
   * { email, password }
   *
   * Side Effect:
   * Sets the `refreshToken` cookie (HttpOnly, SameSite=Strict, 7 days).
   * The HttpOnly flag prevents JavaScript from reading the cookie,
   * protecting against XSS-based token theft.
   *
   * Responses:
   * 200 → { user: { id, email, name }, token: "jwt..." }
   * 401 → 'Invalid credentials'
   */
  async login(req: Request, res: Response) {
    try {
      const { user, token, refreshToken } = await authService.login(req.body);
      
      // Store refresh token in a secure HttpOnly cookie — not in the response body.
      // This prevents XSS attacks from accessing the long-lived refresh token.
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,                                       // Not accessible via document.cookie
        secure: process.env.NODE_ENV === 'production',        // HTTPS only in production
        sameSite: 'strict',                                   // Prevents CSRF
        maxAge: 7 * 24 * 60 * 60 * 1000                      // 7 days in milliseconds
      });

      return sendSuccess(res, { user, token });
    } catch (error: any) {
      return sendError(res, error.message, 401);
    }
  }

  /**
   * POST /api/v1/auth/refresh
   *
   * Public Route
   *
   * Issues a new access token using the refresh token from the HttpOnly cookie.
   * Called automatically by the frontend every 15 minutes when the access token expires.
   *
   * Request:
   * No body required. The refresh token is read from `req.cookies.refreshToken`.
   *
   * Responses:
   * 200 → { token: "new_jwt..." }
   * 401 → 'No refresh token provided' or 'Invalid refresh token'
   */
  async refresh(req: Request, res: Response) {
    try {
      const refreshToken = req.cookies.refreshToken;
      if (!refreshToken) {
        return sendError(res, 'No refresh token provided', 401);
      }
      const token = await authService.refreshToken(refreshToken);
      return sendSuccess(res, { token });
    } catch {
      return sendError(res, 'Invalid refresh token', 401);
    }
  }

  /**
   * POST /api/v1/auth/logout
   *
   * Public Route
   *
   * Clears the refresh token cookie, effectively ending the user's session.
   * The frontend is responsible for discarding the access token from memory.
   *
   * Responses:
   * 200 → { message: 'Logged out successfully' }
   */
  async logout(req: Request, res: Response) {
    res.clearCookie('refreshToken');
    return sendSuccess(res, { message: 'Logged out successfully' });
  }

  /**
   * GET /api/v1/auth/me
   *
   * Protected Route (requires valid JWT)
   *
   * Returns the authenticated user's public profile.
   * req.userId is populated by the requireAuth middleware.
   *
   * Responses:
   * 200 → { id, email, name, skinType, preferredSpf }
   * 404 → 'User not found'
   */
  async getMe(req: AuthRequest, res: Response) {
    try {
      const profile = await authService.getProfile(req.userId!);
      return sendSuccess(res, profile);
    } catch (error: any) {
      return sendError(res, error.message, 404);
    }
  }
}
