"use strict";
/**
 * ---------------------------------------------------------
 * File: dashboard.routes.ts
 * Purpose:
 * API route definitions for dashboard.routes.
 * ---------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dashboard_controller_1 = require("../../controllers/dashboard/dashboard.controller");
const requireAuth_1 = require("../../middleware/requireAuth");
const router = (0, express_1.Router)();
const controller = new dashboard_controller_1.DashboardController();
router.use(requireAuth_1.requireAuth);
router.get('/', controller.get.bind(controller));
exports.default = router;
