"use strict";
/**
 * ---------------------------------------------------------
 * File: history.routes.ts
 * Purpose:
 * API route definitions for history.routes.
 * ---------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const history_controller_1 = require("../../controllers/history/history.controller");
const requireAuth_1 = require("../../middleware/requireAuth");
const router = (0, express_1.Router)();
const controller = new history_controller_1.HistoryController();
router.use(requireAuth_1.requireAuth);
router.get('/', controller.get.bind(controller));
router.get('/:id', controller.getById.bind(controller));
exports.default = router;
