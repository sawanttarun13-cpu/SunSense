"use strict";
/**
 * ---------------------------------------------------------
 * File: pagination.validator.ts
 * Purpose:
 * Zod schemas for validating pagination.validator requests.
 * ---------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaginationSchema = void 0;
const zod_1 = require("zod");
// Zod schemas used to validate incoming request payloads.
exports.PaginationSchema = zod_1.z.object({
    page: zod_1.z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: zod_1.z.string().regex(/^\d+$/).transform(Number).optional(),
});
