"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequest = void 0;
const zod_1 = require("zod");
const apiResponse_1 = require("../utils/apiResponse");
/**
 * Creates an Express middleware that validates `req.body` against a Zod schema.
 *
 * The middleware is a higher-order function (factory pattern) so each route
 * can pass its own schema:
 *
 * @param schema - A Zod schema instance describing the expected request body shape.
 * @returns      Express middleware function that either calls next() on success
 *               or sends a 400 JSON error with the Zod validation issues.
 *
 * @example
 * const LoginSchema = z.object({
 *   email: z.string().email(),
 *   password: z.string().min(8),
 * });
 * router.post('/login', validateRequest(LoginSchema), loginController);
 */
const validateRequest = (schema) => {
    return async (req, res, next) => {
        try {
            // parseAsync handles both sync and async Zod refinements.
            // It throws a ZodError on failure.
            await schema.parseAsync(req.body);
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                console.error("[VALIDATION ERROR]", JSON.stringify(error.issues));
                return (0, apiResponse_1.sendError)(res, 'Validation Error', 400, error.issues);
            }
            // Unexpected error (not a validation failure)
            return (0, apiResponse_1.sendError)(res, 'Internal Server Error', 500);
        }
    };
};
exports.validateRequest = validateRequest;
