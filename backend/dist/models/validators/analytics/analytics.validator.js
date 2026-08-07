"use strict";
/**
 * ---------------------------------------------------------
 * File: analytics.validator.ts
 * Purpose:
 * Zod schemas for validating analytics.validator requests.
 * ---------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsFilterSchema = void 0;
const zod_1 = require("zod");
// Zod schemas used to validate incoming request payloads.
exports.AnalyticsFilterSchema = zod_1.z.object({
    timeframe: zod_1.z.enum(['daily', 'weekly', 'monthly']).optional(),
});
