"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendError = exports.sendSuccess = void 0;
/**
 * Sends a standardised success response.
 *
 * @param res        - Express Response object.
 * @param data       - The payload to include in the `data` field.
 * @param statusCode - HTTP status code. Defaults to 200 (OK).
 *                     Use 201 for resource creation endpoints.
 * @returns          The Express response object (allows `return sendSuccess(...)`).
 */
const sendSuccess = (res, data, statusCode = 200) => {
    return res.status(statusCode).json({
        success: true,
        data,
    });
};
exports.sendSuccess = sendSuccess;
/**
 * Sends a standardised error response.
 *
 * @param res        - Express Response object.
 * @param message    - Human-readable description of the error.
 * @param statusCode - HTTP status code. Defaults to 500 (Internal Server Error).
 * @param details    - Optional extra context (e.g., Zod validation issues).
 *                     Omitted from the response when not provided.
 * @returns          The Express response object.
 */
const sendError = (res, message, statusCode = 500, details) => {
    return res.status(statusCode).json({
        success: false,
        error: {
            message,
            ...(details && { details }),
        },
    });
};
exports.sendError = sendError;
