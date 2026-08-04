"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
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
const dashboard_routes_1 = __importDefault(require("./routes/dashboard/dashboard.routes"));
const analytics_routes_1 = __importDefault(require("./routes/analytics/analytics.routes"));
const history_routes_1 = __importDefault(require("./routes/history/history.routes"));
const alerts_routes_1 = __importDefault(require("./routes/alerts/alerts.routes"));
const profile_routes_1 = __importDefault(require("./routes/profile/profile.routes"));
const settings_routes_1 = __importDefault(require("./routes/settings/settings.routes"));
const env_1 = require("./config/env");
const rateLimiter_1 = require("./middleware/rateLimiter");
const app = (0, express_1.default)();
// Global Middlewares
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: env_1.config.frontendUrl,
    credentials: true,
}));
app.use((0, compression_1.default)());
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use(logger_1.morganMiddleware);
app.use(rateLimiter_1.globalLimiter);
// API Routes
app.use('/api/v1/auth', auth_routes_1.default);
app.use('/api/v1/device', device_routes_1.default);
app.use('/api/v1/dashboard', dashboard_routes_1.default);
app.use('/api/v1/analytics', analytics_routes_1.default);
app.use('/api/v1/history', history_routes_1.default);
app.use('/api/v1/alerts', alerts_routes_1.default);
app.use('/api/v1/profile', profile_routes_1.default);
app.use('/api/v1/settings', settings_routes_1.default);
app.use('/api/v1', health_routes_1.default);
// 404 Handler
app.use(notFoundHandler_1.notFoundHandler);
// Global Error Handler
app.use(errorHandler_1.errorHandler);
exports.default = app;
