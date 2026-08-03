"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authLimiter = exports.globalLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
exports.globalLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000, // 1 minute
    limit: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again after a minute',
});
exports.authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 5, // Limit each IP to 5 auth attempts per windowMs
    message: 'Too many authentication attempts, please try again after 15 minutes',
});
