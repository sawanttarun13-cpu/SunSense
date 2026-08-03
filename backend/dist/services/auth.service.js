"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_repo_1 = require("../repositories/user.repo");
const env_1 = require("../config/env");
const userRepo = new user_repo_1.UserRepository();
class AuthService {
    async register(data) {
        const existingUser = await userRepo.findByEmail(data.email);
        if (existingUser) {
            throw new Error('Email already registered');
        }
        const passwordHash = await bcrypt_1.default.hash(data.password, 10);
        const user = await userRepo.create({
            email: data.email,
            passwordHash,
            name: data.name,
            skinType: 3, // Default fallback
            preferredSpf: 30, // Default fallback
        });
        return { id: user.id, email: user.email, name: user.name };
    }
    async login(data) {
        const user = await userRepo.findByEmail(data.email);
        if (!user) {
            throw new Error('Invalid credentials');
        }
        const isMatch = await bcrypt_1.default.compare(data.password, user.passwordHash);
        if (!isMatch) {
            throw new Error('Invalid credentials');
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, env_1.config.jwtSecret, { expiresIn: '15m' });
        const refreshToken = jsonwebtoken_1.default.sign({ userId: user.id }, env_1.config.jwtSecret, { expiresIn: '7d' });
        return {
            user: { id: user.id, email: user.email, name: user.name },
            token,
            refreshToken
        };
    }
    async refreshToken(token) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, env_1.config.jwtSecret);
            const user = await userRepo.findById(decoded.userId);
            if (!user)
                throw new Error('User not found');
            return jsonwebtoken_1.default.sign({ userId: user.id }, env_1.config.jwtSecret, { expiresIn: '15m' });
        }
        catch {
            throw new Error('Invalid token');
        }
    }
    async getProfile(userId) {
        const user = await userRepo.findById(userId);
        if (!user)
            throw new Error('User not found');
        return { id: user.id, email: user.email, name: user.name, skinType: user.skinType, preferredSpf: user.preferredSpf };
    }
}
exports.AuthService = AuthService;
