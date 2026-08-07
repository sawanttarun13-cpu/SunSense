"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
/**
 * --------------------------------------------------------
 * File: auth.service.ts
 * Layer: Service / Business Logic
 *
 * Purpose:
 * Implements all user authentication business logic including
 * registration, login, JWT token refresh, and profile retrieval.
 * Sits between the auth controller and the UserRepository,
 * enforcing business rules (unique email, password hashing,
 * token generation) without directly touching the database.
 *
 * Layer:
 * Business Logic
 *
 * Uses:
 * UserRepository (via user.repo.ts)
 *
 * Does NOT:
 * Access Prisma directly. All database operations are
 * delegated to UserRepository.
 * --------------------------------------------------------
 */
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_repo_1 = require("../repositories/user.repo");
const env_1 = require("../config/env");
const userRepo = new user_repo_1.UserRepository();
class AuthService {
    /**
     * Registers a new user account.
     *
     * Steps:
     * 1. Check if the email is already in use.
     * 2. Hash the password using bcrypt (10 salt rounds).
     * 3. Create the user record with default skin type (3) and SPF (30).
     * 4. Return the new user's public fields (no password hash exposed).
     *
     * @param data            - Registration payload from the request body.
     * @param data.email      - User's email address (must be unique).
     * @param data.password   - Plaintext password (will be hashed before storage).
     * @param data.name       - User's display name.
     * @returns               Newly created user object (id, email, name).
     * @throws                'Email already registered' if a duplicate email is found.
     */
    async register(data) {
        const existingUser = await userRepo.findByEmail(data.email);
        if (existingUser) {
            throw new Error('Email already registered');
        }
        // bcrypt with 10 rounds provides a good security/performance balance.
        // Each additional round doubles computation time.
        const passwordHash = await bcrypt_1.default.hash(data.password, 10);
        const user = await userRepo.create({
            email: data.email,
            passwordHash,
            name: data.name,
            skinType: 3, // Fitzpatrick Type 3 — sensible default until the user updates their profile
            preferredSpf: 30, // SPF 30 is the WHO minimum recommendation for outdoor activities
        });
        return { id: user.id, email: user.email, name: user.name };
    }
    /**
     * Authenticates a user and issues JWT tokens.
     *
     * Steps:
     * 1. Look up the user by email.
     * 2. Compare the provided password against the stored bcrypt hash.
     * 3. Issue a short-lived access token (15m) for API calls.
     * 4. Issue a long-lived refresh token (7d) stored in an HttpOnly cookie.
     * 5. Return user info and both tokens.
     *
     * Security Note:
     * Both 'user not found' and 'password mismatch' return the same
     * 'Invalid credentials' error to prevent user enumeration attacks.
     *
     * @param data           - Login payload from the request body.
     * @param data.email     - The user's registered email.
     * @param data.password  - Plaintext password to verify.
     * @returns              User info, JWT access token, and refresh token.
     * @throws               'Invalid credentials' if email or password is incorrect.
     */
    async login(data) {
        const user = await userRepo.findByEmail(data.email);
        if (!user) {
            throw new Error('Invalid credentials');
        }
        const isMatch = await bcrypt_1.default.compare(data.password, user.passwordHash);
        if (!isMatch) {
            throw new Error('Invalid credentials');
        }
        // Access token: short-lived (15 min), sent in response body
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, env_1.config.jwtSecret, { expiresIn: '15m' });
        // Refresh token: long-lived (7 days), stored in HttpOnly cookie by the controller
        const refreshToken = jsonwebtoken_1.default.sign({ userId: user.id }, env_1.config.jwtSecret, { expiresIn: '7d' });
        return {
            user: { id: user.id, email: user.email, name: user.name },
            token,
            refreshToken
        };
    }
    /**
     * Issues a new access token using a valid refresh token.
     *
     * Used by the frontend to silently renew the access token
     * when it expires (every 15 minutes) without forcing the user
     * to log in again.
     *
     * @param token - The refresh token extracted from the HttpOnly cookie.
     * @returns     A new JWT access token valid for 15 minutes.
     * @throws      'Invalid token' if the token is expired, malformed, or the user no longer exists.
     */
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
    /**
     * Returns the public profile of the authenticated user.
     *
     * Called by the frontend after login to display the user's
     * name, email, skin type, and preferred SPF in the profile page.
     *
     * @param userId - The UUID of the authenticated user (from req.userId).
     * @returns      User's public profile fields (no password hash).
     * @throws       'User not found' if the user ID is invalid.
     */
    async getProfile(userId) {
        const user = await userRepo.findById(userId);
        if (!user)
            throw new Error('User not found');
        return { id: user.id, email: user.email, name: user.name, skinType: user.skinType, preferredSpf: user.preferredSpf };
    }
}
exports.AuthService = AuthService;
