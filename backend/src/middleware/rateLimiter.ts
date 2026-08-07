/**
 * --------------------------------------------------------
 * File: rateLimiter.ts
 * Layer: Middleware / Security
 *
 * Purpose:
 * Provides two rate-limiting middleware instances that
 * protect the API from abuse, brute-force attacks, and
 * denial-of-service attempts.
 *
 * Two limiters are defined with different thresholds:
 *
 * 1. globalLimiter  — Applied to every API route.
 *    Allows burst usage from legitimate users/ESP8266 devices
 *    while preventing automated scraping or flooding.
 *
 * 2. authLimiter    — Applied only to auth routes (login, register).
 *    Much stricter to prevent brute-force password attacks.
 *    5 failed login attempts per 15-minute window will trigger a 429.
 *
 * Implementation:
 * Uses `express-rate-limit` which tracks requests in-memory
 * by IP address. In a horizontally scaled production environment,
 * consider replacing the in-memory store with Redis to share
 * rate limit counters across multiple server instances.
 * --------------------------------------------------------
 */
import rateLimit from 'express-rate-limit';

/**
 * Global API rate limiter.
 *
 * Allows up to 100 requests per IP per minute.
 * Applied to all API routes via app.use(globalLimiter) in app.ts.
 *
 * This threshold comfortably accommodates:
 * - Normal frontend usage (page loads, dashboard polls)
 * - ESP8266 readings ingested every 30–60 seconds
 * - Automated tests
 *
 * Returns HTTP 429 (Too Many Requests) when exceeded.
 */
export const globalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1-minute sliding window
  limit: 100, // Max requests per IP per window
  message: 'Too many requests from this IP, please try again after a minute',
});

/**
 * Strict authentication rate limiter.
 *
 * Allows a maximum of 5 attempts per IP per 15-minute window.
 * Applied to POST /auth/login and POST /auth/register.
 *
 * Security reasoning:
 * A standard dictionary attack can try thousands of passwords
 * per minute. Limiting to 5 attempts per 15 minutes reduces
 * that attack surface to ~480 attempts per day — manageable
 * for alerting systems to detect and block.
 *
 * Returns HTTP 429 when exceeded.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15-minute sliding window
  limit: 5, // Limit each IP to 5 auth attempts per windowMs
  message: 'Too many authentication attempts, please try again after 15 minutes',
});
