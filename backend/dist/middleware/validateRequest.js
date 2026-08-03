"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequest = void 0;
const zod_1 = require("zod");
const apiResponse_1 = require("../utils/apiResponse");
const validateRequest = (schema) => {
    return async (req, res, next) => {
        try {
            await schema.parseAsync(req.body);
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                return (0, apiResponse_1.sendError)(res, 'Validation Error', 400, error.issues);
            }
            return (0, apiResponse_1.sendError)(res, 'Internal Server Error', 500);
        }
    };
};
exports.validateRequest = validateRequest;
