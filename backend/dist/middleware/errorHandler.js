"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const apiResponse_1 = require("../utils/apiResponse");
const logger_1 = require("../utils/logger");
const env_1 = require("../config/env");
/**
 * Global Express error-handling middleware.
 *
 * Catches all errors passed via next(error) in any route
 * or middleware earlier in the pipeline. Logs the full
 * error (including stack) server-side, then sends a clean
 * JSON response to the caller.
 *
 * @param err   - The error object thrown or passed to next().
 *                May be a standard Error, a custom AppError, or an unknown value.
 * @param req   - The Express Request (not used but required by Express for the 4-arg signature).
 * @param res   - The Express Response used to send the error JSON.
 * @param _next - Express NextFunction (unused; prefixed with _ to satisfy linting rules).
 */
const errorHandler = (err, req, res, _next) => {
    // Always log the full error server-side for debugging
    logger_1.logger.error('Unhandled Exception:', err);
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    // In development, include the stack trace in the response body
    // to speed up debugging. Never expose stack traces in production.
    (0, apiResponse_1.sendError)(res, message, statusCode, env_1.config.nodeEnv === 'development' ? err.stack : undefined);
};
exports.errorHandler = errorHandler;
