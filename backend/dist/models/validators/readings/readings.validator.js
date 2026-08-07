"use strict";
/**
 * ---------------------------------------------------------
 * File: readings.validator.ts
 * Purpose:
 * Zod schemas for validating readings.validator requests.
 * ---------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReadingsPayloadSchema = void 0;
const zod_1 = require("zod");
// Zod schemas used to validate incoming request payloads.
exports.ReadingsPayloadSchema = zod_1.z.object({
    readings: zod_1.z.array(zod_1.z.object({
        uvIndex: zod_1.z.number().min(0).max(30),
        recordedAt: zod_1.z.string().datetime()
    }))
});
