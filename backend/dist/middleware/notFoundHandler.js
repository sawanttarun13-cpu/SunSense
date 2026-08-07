"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = void 0;
const apiResponse_1 = require("../utils/apiResponse");
/**
 * Catch-all 404 handler for unmatched routes.
 *
 * Called by Express when no prior route matched the
 * incoming request. Returns a JSON 404 response with
 * the unrecognised URL so the client knows exactly
 * which path it requested.
 *
 * @param req - The Express Request (used to read req.originalUrl).
 * @param res - The Express Response used to send the 404 JSON.
 */
const notFoundHandler = (req, res) => {
    (0, apiResponse_1.sendError)(res, `Route not found: ${req.originalUrl}`, 404);
};
exports.notFoundHandler = notFoundHandler;
