"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateProfileSchema = void 0;
const zod_1 = require("zod");
exports.UpdateProfileSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).optional(),
    skinType: zod_1.z.number().min(1).max(6).optional(),
    preferredSpf: zod_1.z.number().min(1).max(100).optional(),
});
