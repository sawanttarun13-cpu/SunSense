"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateSettingsSchema = void 0;
const zod_1 = require("zod");
exports.UpdateSettingsSchema = zod_1.z.object({
    alertThreshold: zod_1.z.number().min(0.1).max(20.0).optional(),
    emailNotifications: zod_1.z.boolean().optional(),
    pushNotifications: zod_1.z.boolean().optional(),
});
