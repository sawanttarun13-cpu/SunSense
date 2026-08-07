"use strict";
/**
 * ---------------------------------------------------------
 * File: alerts.routes.ts
 * Purpose:
 * API route definitions for alerts.routes.
 * ---------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const alerts_controller_1 = require("../../controllers/alerts/alerts.controller");
const requireAuth_1 = require("../../middleware/requireAuth");
const router = (0, express_1.Router)();
const controller = new alerts_controller_1.AlertsController();
router.use(requireAuth_1.requireAuth);
router.get('/', controller.get.bind(controller));
router.patch('/:id/read', controller.markRead.bind(controller));
exports.default = router;
