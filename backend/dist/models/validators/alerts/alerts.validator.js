"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlertFilterSchema = void 0;
const zod_1 = require("zod");
const pagination_validator_1 = require("../common/pagination.validator");
exports.AlertFilterSchema = pagination_validator_1.PaginationSchema.extend({
    status: zod_1.z.enum(['read', 'unread', 'all']).optional(),
});
