"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const sunscreen_controller_1 = require("../../controllers/sunscreen/sunscreen.controller");
const requireAuth_1 = require("../../middleware/requireAuth");
const validateRequest_1 = require("../../middleware/validateRequest");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
const controller = new sunscreen_controller_1.SunscreenController();
const ApplySchema = zod_1.z.object({
    appliedSpf: zod_1.z.number().min(1).max(100),
    appliedAt: zod_1.z.string().datetime().optional()
});
router.post('/', requireAuth_1.requireAuth, (0, validateRequest_1.validateRequest)(ApplySchema), controller.apply.bind(controller));
exports.default = router;
