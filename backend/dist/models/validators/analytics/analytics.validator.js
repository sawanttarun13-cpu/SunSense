"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsFilterSchema = void 0;
const zod_1 = require("zod");
exports.AnalyticsFilterSchema = zod_1.z.object({
    timeframe: zod_1.z.enum(['daily', 'weekly', 'monthly']).optional(),
});
