"use strict";
/**
 * ---------------------------------------------------------
 * File: profile.validator.ts
 * Purpose:
 * Zod schemas for validating profile.validator requests.
 * ---------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateProfileSchema = void 0;
const zod_1 = require("zod");
// Zod schemas used to validate incoming request payloads.
exports.UpdateProfileSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).optional(),
    skinType: zod_1.z.number().min(1).max(6).optional(),
    preferredSpf: zod_1.z.number().min(1).max(100).optional(),
});
