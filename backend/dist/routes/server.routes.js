"use strict";
/**
 * ---------------------------------------------------------
 * File: server.routes.ts
 * Purpose:
 * API route definitions for server-level utility endpoints.
 *
 * Route map:
 * GET /time → Returns current server UTC time and Unix timestamp.
 *             Used by ESP8266 firmware for accurate timestamping of
 *             UV readings, especially after offline periods.
 *
 * Contract source:
 * docs/backend/05_REST_API.md       — "GET /api/v1/server/time"
 * docs/backend/06_Request_Response_Models.md — Section 3
 *
 * Response (200 OK):
 * {
 *   "utcTime":       "2026-08-03T12:05:00Z",
 *   "unixTimestamp": 1785758700
 * }
 *
 * Authentication:
 * None required. The ESP8266 calls this endpoint before authenticating
 * in order to obtain accurate time for timestamp generation.
 * ---------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const apiResponse_1 = require("../utils/apiResponse");
const router = (0, express_1.Router)();
/**
 * GET /api/v1/server/time
 *
 * Returns the current server UTC time as both an ISO 8601 string
 * and a Unix epoch timestamp (seconds since 1970-01-01T00:00:00Z).
 *
 * The ESP8266 firmware uses this to:
 * 1. Synchronise its internal clock on boot and after reconnect.
 * 2. Accurately timestamp UV readings after an offline period.
 *
 * No authentication required — the firmware may call this
 * before completing device authentication.
 */
router.get('/time', (_req, res) => {
    const now = new Date();
    return (0, apiResponse_1.sendSuccess)(res, {
        utcTime: now.toISOString().replace(/\.\d{3}Z$/, 'Z'), // Strip milliseconds: "2026-08-03T12:05:00Z"
        unixTimestamp: Math.floor(now.getTime() / 1000),
    });
});
exports.default = router;
