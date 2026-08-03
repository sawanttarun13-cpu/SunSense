"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("../services/auth.service");
const apiResponse_1 = require("../utils/apiResponse");
const authService = new auth_service_1.AuthService();
class AuthController {
    async register(req, res) {
        try {
            const result = await authService.register(req.body);
            return (0, apiResponse_1.sendSuccess)(res, result, 201);
        }
        catch (error) {
            if (error.message === 'Email already registered') {
                return (0, apiResponse_1.sendError)(res, error.message, 409);
            }
            return (0, apiResponse_1.sendError)(res, error.message, 400);
        }
    }
    async login(req, res) {
        try {
            const { user, token, refreshToken } = await authService.login(req.body);
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            });
            return (0, apiResponse_1.sendSuccess)(res, { user, token });
        }
        catch (error) {
            return (0, apiResponse_1.sendError)(res, error.message, 401);
        }
    }
    async refresh(req, res) {
        try {
            const refreshToken = req.cookies.refreshToken;
            if (!refreshToken) {
                return (0, apiResponse_1.sendError)(res, 'No refresh token provided', 401);
            }
            const token = await authService.refreshToken(refreshToken);
            return (0, apiResponse_1.sendSuccess)(res, { token });
        }
        catch {
            return (0, apiResponse_1.sendError)(res, 'Invalid refresh token', 401);
        }
    }
    async logout(req, res) {
        res.clearCookie('refreshToken');
        return (0, apiResponse_1.sendSuccess)(res, { message: 'Logged out successfully' });
    }
    async getMe(req, res) {
        try {
            const profile = await authService.getProfile(req.userId);
            return (0, apiResponse_1.sendSuccess)(res, profile);
        }
        catch (error) {
            return (0, apiResponse_1.sendError)(res, error.message, 404);
        }
    }
}
exports.AuthController = AuthController;
