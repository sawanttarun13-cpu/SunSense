"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeviceAuthenticateSchema = exports.DeviceRegisterSchema = exports.LoginSchema = exports.RegisterSchema = void 0;
const zod_1 = require("zod");
exports.RegisterSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8),
    name: zod_1.z.string().optional(),
});
exports.LoginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string(),
});
exports.DeviceRegisterSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(255),
});
exports.DeviceAuthenticateSchema = zod_1.z.object({}); // Authenticates via headers
