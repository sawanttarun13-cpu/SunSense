"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = void 0;
const apiResponse_1 = require("../utils/apiResponse");
const notFoundHandler = (req, res) => {
    (0, apiResponse_1.sendError)(res, `Route not found: ${req.originalUrl}`, 404);
};
exports.notFoundHandler = notFoundHandler;
