"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
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
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const logger_1 = require("./utils/logger");
const errorHandler_1 = require("./middleware/errorHandler");
const notFoundHandler_1 = require("./middleware/notFoundHandler");
const health_routes_1 = __importDefault(require("./routes/health.routes"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const device_routes_1 = __importDefault(require("./routes/device.routes"));
const readings_routes_1 = __importDefault(require("./routes/readings/readings.routes"));
const sunscreen_routes_1 = __importDefault(require("./routes/sunscreen/sunscreen.routes"));
const dashboard_routes_1 = __importDefault(require("./routes/dashboard/dashboard.routes"));
const analytics_routes_1 = __importDefault(require("./routes/analytics/analytics.routes"));
const history_routes_1 = __importDefault(require("./routes/history/history.routes"));
const alerts_routes_1 = __importDefault(require("./routes/alerts/alerts.routes"));
const profile_routes_1 = __importDefault(require("./routes/profile/profile.routes"));
const settings_routes_1 = __importDefault(require("./routes/settings/settings.routes"));
const env_1 = require("./config/env");
const rateLimiter_1 = require("./middleware/rateLimiter");
const app = (0, express_1.default)();
// ─── Global Security Middleware ───────────────────────────────────────────────
/** helmet: Automatically sets security headers (Content-Security-Policy, HSTS, etc.) */
app.use((0, helmet_1.default)());
/**
 * cors: Configures Cross-Origin Resource Sharing.
 * Only allows requests from the configured frontend URL (CLIENT_URL in .env).
 * credentials:true is required so the browser sends the refreshToken HttpOnly cookie.
 */
app.use((0, cors_1.default)({
    origin: env_1.config.frontendUrl,
    credentials: true,
}));
/** compression: Gzip-compresses responses to reduce bandwidth for large payloads. */
app.use((0, compression_1.default)());
/** express.json: Parses application/json request bodies into req.body. */
app.use(express_1.default.json());
/** cookieParser: Parses cookie header and populates req.cookies. Required for refresh token. */
app.use((0, cookie_parser_1.default)());
/** morganMiddleware: Logs method, URL, status, and response time for every request. */
app.use(logger_1.morganMiddleware);
/** globalLimiter: Caps all IPs at 100 requests per minute to prevent abuse. */
app.use(rateLimiter_1.globalLimiter);
// ─── API Route Groups ────────────────────────────────────────────────────────
app.use('/api/v1/auth', auth_routes_1.default);
app.use('/api/v1/device', device_routes_1.default);
app.use('/api/v1/readings', readings_routes_1.default);
app.use('/api/v1/sunscreen', sunscreen_routes_1.default);
app.use('/api/v1/dashboard', dashboard_routes_1.default);
app.use('/api/v1/analytics', analytics_routes_1.default);
app.use('/api/v1/history', history_routes_1.default);
app.use('/api/v1/alerts', alerts_routes_1.default);
app.use('/api/v1/profile', profile_routes_1.default);
app.use('/api/v1/settings', settings_routes_1.default);
app.use('/api/v1', health_routes_1.default); // GET /api/v1/health
// ─── Error Handling (must be last) ───────────────────────────────────────────
/** Returns a 404 JSON error for any URL that did not match a route above. */
app.use(notFoundHandler_1.notFoundHandler);
/** Catches all errors thrown/passed to next(err) anywhere in the pipeline. */
app.use(errorHandler_1.errorHandler);
exports.default = app;
