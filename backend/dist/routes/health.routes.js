"use strict";
/**
 * ---------------------------------------------------------
 * File: health.routes.ts
 * Purpose:
 * API route definitions for health.routes.
 * ---------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const apiResponse_1 = require("../utils/apiResponse");
const env_1 = require("../config/env");
const databaseHealth_1 = require("../utils/databaseHealth");
const router = (0, express_1.Router)();
router.get('/health', async (req, res) => {
    const isDbConnected = await (0, databaseHealth_1.checkDatabaseHealth)();
    if (!isDbConnected) {
        return (0, apiResponse_1.sendError)(res, 'Database connection failed', 503, {
            server: 'running',
            database: 'disconnected',
            timestamp: new Date().toISOString(),
            version: 'v1'
        });
    }
    return (0, apiResponse_1.sendSuccess)(res, {
        server: 'running',
        database: 'connected',
        timestamp: new Date().toISOString(),
        version: 'v1',
        environment: env_1.config.nodeEnv,
    });
});
exports.default = router;
