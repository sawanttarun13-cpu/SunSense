"use strict";
/**
 * ---------------------------------------------------------
 * File: readings.routes.ts
 * Purpose:
 * API route definitions for readings.routes.
 * ---------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const readings_controller_1 = require("../../controllers/readings/readings.controller");
const validateRequest_1 = require("../../middleware/validateRequest");
const readings_validator_1 = require("../../models/validators/readings/readings.validator");
const requireDeviceAuth_1 = require("../../middleware/requireDeviceAuth");
const requireAuth_1 = require("../../middleware/requireAuth");
const router = (0, express_1.Router)();
const controller = new readings_controller_1.ReadingsController();
router.post('/', requireDeviceAuth_1.requireDeviceAuth, (0, validateRequest_1.validateRequest)(readings_validator_1.ReadingsPayloadSchema), controller.process.bind(controller));
router.get('/history', requireAuth_1.requireAuth, controller.getHistory.bind(controller));
exports.default = router;
