"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const apiResponse_1 = require("../utils/apiResponse");
const prisma_1 = require("../config/prisma");
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
const requireAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return (0, apiResponse_1.sendError)(res, 'Unauthorized - No token provided', 401);
        }
        // Extract the raw token after the "Bearer " prefix
        const token = authHeader.split(' ')[1];
        const decoded = jsonwebtoken_1.default.verify(token, env_1.config.jwtSecret);
        // Confirm the user still exists — tokens are not invalidated on deletion
        // so this check protects against deleted-user scenarios.
        const user = await prisma_1.prisma.user.findUnique({ where: { id: decoded.userId } });
        if (!user) {
            return (0, apiResponse_1.sendError)(res, 'Unauthorized - User not found', 401);
        }
        // Attach the verified user ID for use by downstream controllers
        req.userId = user.id;
        next();
    }
    catch {
        // Covers jwt.verify throwing (expired, bad signature, malformed token)
        return (0, apiResponse_1.sendError)(res, 'Unauthorized - Invalid token', 401);
    }
};
exports.requireAuth = requireAuth;
