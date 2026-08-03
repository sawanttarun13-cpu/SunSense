import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { AuthRequest } from '../middleware/requireAuth';

const authService = new AuthService();

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const result = await authService.register(req.body);
      return sendSuccess(res, result, 201);
    } catch (error: any) {
      if (error.message === 'Email already registered') {
        return sendError(res, error.message, 409);
      }
      return sendError(res, error.message, 400);
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { user, token, refreshToken } = await authService.login(req.body);
      
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      return sendSuccess(res, { user, token });
    } catch (error: any) {
      return sendError(res, error.message, 401);
    }
  }

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

  async logout(req: Request, res: Response) {
    res.clearCookie('refreshToken');
    return sendSuccess(res, { message: 'Logged out successfully' });
  }

  async getMe(req: AuthRequest, res: Response) {
    try {
      const profile = await authService.getProfile(req.userId!);
      return sendSuccess(res, profile);
    } catch (error: any) {
      return sendError(res, error.message, 404);
    }
  }
}
