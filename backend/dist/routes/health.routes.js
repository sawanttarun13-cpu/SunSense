"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const apiResponse_1 = require("../utils/apiResponse");
const env_1 = require("../config/env");
const router = (0, express_1.Router)();
router.get('/health', (req, res) => {
    (0, apiResponse_1.sendSuccess)(res, {
        message: 'SunSense Backend Running',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        environment: env_1.config.nodeEnv,
    });
});
exports.default = router;
