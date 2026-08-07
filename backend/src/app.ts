/**
 * --------------------------------------------------------
 * File: app.ts
 * Layer: Application Bootstrap
 *
 * Purpose:
 * Creates and configures the Express application instance.
 * Registers all global middleware in the correct order,
 * mounts all API route groups under the /api/v1 prefix,
 * and attaches the 404 and global error handlers.
 *
 * This file exports the configured `app` for use by server.ts
 * (which actually starts listening on the port) and by test
 * suites (which can import app without starting the server).
 *
 * Middleware Stack (top → bottom = first → last):
 * 1. helmet       → Sets security HTTP headers
 * 2. cors         → Allows requests from the React frontend origin
 * 3. compression  → Gzip compresses responses > ~1kb
 * 4. express.json → Parses JSON request bodies
 * 5. cookieParser → Parses the refreshToken cookie
 * 6. morgan       → Logs each HTTP request to stdout
 * 7. globalLimiter → Rate-limits all routes (100 req/min/IP)
 * 8. [routes]     → All API routes
 * 9. notFoundHandler → Returns 404 for unmatched paths
 * 10. errorHandler   → Catches all unhandled errors
 *
 * Route Prefix Map:
 * /api/v1/auth       → Authentication (register, login, refresh, logout, me)
 * /api/v1/device     → Device management (register, status, auth)
 * /api/v1/readings   → UV reading ingestion (ESP8266 endpoint)
 * /api/v1/sunscreen  → Sunscreen tracker (apply, status)
 * /api/v1/dashboard  → Dashboard metrics aggregation
 * /api/v1/analytics  → Time-series analytics
 * /api/v1/history    → Paginated exposure session history
 * /api/v1/alerts     → Smart alerts list and mark-as-read
 * /api/v1/profile    → User profile (read/update)
 * /api/v1/settings   → App settings and notification preferences
 * /api/v1/health     → Health check (GET /api/v1/health)
 * --------------------------------------------------------
 */
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { morganMiddleware } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';
import healthRoutes from './routes/health.routes';
import authRoutes from './routes/auth.routes';
import deviceRoutes from './routes/device.routes';
import readingsRoutes from './routes/readings/readings.routes';
import sunscreenRoutes from './routes/sunscreen/sunscreen.routes';
import dashboardRoutes from './routes/dashboard/dashboard.routes';
import analyticsRoutes from './routes/analytics/analytics.routes';
import historyRoutes from './routes/history/history.routes';
import alertsRoutes from './routes/alerts/alerts.routes';
import profileRoutes from './routes/profile/profile.routes';
import settingsRoutes from './routes/settings/settings.routes';
import { config } from './config/env';
import { globalLimiter } from './middleware/rateLimiter';

const app = express();

// ─── Global Security Middleware ───────────────────────────────────────────────

/** helmet: Automatically sets security headers (Content-Security-Policy, HSTS, etc.) */
app.use(helmet());

/**
 * cors: Configures Cross-Origin Resource Sharing.
 * Only allows requests from the configured frontend URL (CLIENT_URL in .env).
 * credentials:true is required so the browser sends the refreshToken HttpOnly cookie.
 */
app.use(
  cors({
    origin: config.frontendUrl,
    credentials: true,
  })
);

/** compression: Gzip-compresses responses to reduce bandwidth for large payloads. */
app.use(compression());

/** express.json: Parses application/json request bodies into req.body. */
app.use(express.json());

/** cookieParser: Parses cookie header and populates req.cookies. Required for refresh token. */
app.use(cookieParser());

/** morganMiddleware: Logs method, URL, status, and response time for every request. */
app.use(morganMiddleware);

/** globalLimiter: Caps all IPs at 100 requests per minute to prevent abuse. */
app.use(globalLimiter);

// ─── API Route Groups ────────────────────────────────────────────────────────

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/device', deviceRoutes);
app.use('/api/v1/readings', readingsRoutes);
app.use('/api/v1/sunscreen', sunscreenRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/history', historyRoutes);
app.use('/api/v1/alerts', alertsRoutes);
app.use('/api/v1/profile', profileRoutes);
app.use('/api/v1/settings', settingsRoutes);
app.use('/api/v1', healthRoutes); // GET /api/v1/health

// ─── Error Handling (must be last) ───────────────────────────────────────────

/** Returns a 404 JSON error for any URL that did not match a route above. */
app.use(notFoundHandler);

/** Catches all errors thrown/passed to next(err) anywhere in the pipeline. */
app.use(errorHandler);

export default app;
