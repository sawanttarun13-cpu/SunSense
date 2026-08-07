"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
/**
 * --------------------------------------------------------
 * File: env.ts
 * Layer: Configuration
 *
 * Purpose:
 * Loads environment variables from the .env file and
 * exports them as a strongly-typed, centralised config
 * object. Every part of the backend reads from this object
 * rather than calling process.env directly, ensuring all
 * required variables are defined in a single place.
 *
 * Usage:
 * import { config } from '../config/env';
 * config.port       → HTTP port the server listens on
 * config.jwtSecret  → Secret used to sign JWT tokens
 * --------------------------------------------------------
 */
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Load variables from backend/.env into process.env
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../.env') });
/**
 * Centralised application configuration.
 *
 * All values fall back to safe defaults so the app can
 * start in a minimal state without a .env file (useful
 * for CI pipelines and Docker environments where variables
 * are injected at runtime rather than from a file).
 *
 * WARNING: Default secrets ('secret') must NEVER be used
 * in production. Always set strong values in .env.
 */
exports.config = {
    /** HTTP port the Express server will bind to. */
    port: parseInt(process.env.PORT || '5000', 10),
    /** Runtime environment: 'development' | 'production' | 'test'. */
    nodeEnv: process.env.NODE_ENV || 'development',
    /** Allowed CORS origin for the React frontend. */
    frontendUrl: process.env.CLIENT_URL || process.env.FRONTEND_URL || 'http://localhost:5173',
    /** Logging verbosity level ('debug' | 'info' | 'warn' | 'error'). */
    logLevel: process.env.LOG_LEVEL || 'debug',
    /** Full PostgreSQL connection string consumed by Prisma. */
    databaseUrl: process.env.DATABASE_URL || '',
    /** Secret used to sign and verify user JWT access/refresh tokens. */
    jwtSecret: process.env.JWT_SECRET || 'secret',
    /** Secret used to sign device-specific tokens (reserved for future use). */
    deviceSecret: process.env.DEVICE_SECRET || 'secret',
};
