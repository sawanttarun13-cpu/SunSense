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
const requireAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return (0, apiResponse_1.sendError)(res, 'Unauthorized - No token provided', 401);
        }
        const token = authHeader.split(' ')[1];
        const decoded = jsonwebtoken_1.default.verify(token, env_1.config.jwtSecret);
        const user = await prisma_1.prisma.user.findUnique({ where: { id: decoded.userId } });
        if (!user) {
            return (0, apiResponse_1.sendError)(res, 'Unauthorized - User not found', 401);
        }
        req.userId = user.id;
        next();
    }
    catch (_) {
        return (0, apiResponse_1.sendError)(res, 'Unauthorized - Invalid token', 401);
    }
};
exports.requireAuth = requireAuth;
