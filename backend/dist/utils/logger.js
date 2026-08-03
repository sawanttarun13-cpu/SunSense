"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.morganMiddleware = exports.logger = void 0;
const morgan_1 = __importDefault(require("morgan"));
exports.logger = {
    info: (message, ...meta) => {
        console.log(`[INFO] ${new Date().toISOString()} - ${message}`, ...meta);
    },
    warn: (message, ...meta) => {
        console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, ...meta);
    },
    error: (message, ...meta) => {
        console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, ...meta);
    },
    debug: (message, ...meta) => {
        if (process.env.LOG_LEVEL === 'debug') {
            console.debug(`[DEBUG] ${new Date().toISOString()} - ${message}`, ...meta);
        }
    },
};
exports.morganMiddleware = (0, morgan_1.default)(':method :url :status :res[content-length] - :response-time ms');
