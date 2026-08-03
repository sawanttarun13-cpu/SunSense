"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const apiResponse_1 = require("../utils/apiResponse");
const logger_1 = require("../utils/logger");
const env_1 = require("../config/env");
const errorHandler = (err, req, res, next) => {
    logger_1.logger.error('Unhandled Exception:', err);
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    (0, apiResponse_1.sendError)(res, message, statusCode, env_1.config.nodeEnv === 'development' ? err.stack : undefined);
};
exports.errorHandler = errorHandler;
