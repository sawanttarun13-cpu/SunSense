"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HistoryFilterSchema = void 0;
const zod_1 = require("zod");
const pagination_validator_1 = require("../common/pagination.validator");
exports.HistoryFilterSchema = pagination_validator_1.PaginationSchema.extend({
    startDate: zod_1.z.string().datetime().optional(),
    endDate: zod_1.z.string().datetime().optional(),
});
