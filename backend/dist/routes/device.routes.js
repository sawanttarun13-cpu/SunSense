"use strict";
/**
 * ---------------------------------------------------------
 * File: device.routes.ts
 * Purpose:
 * API route definitions for device management.
 *
 * Route map:
 * POST /register       → Register new ESP8266 device (user JWT required)
 * GET  /               → Get registered device status (user JWT required)
 * POST /authenticate   → Verify device credentials (device auth headers)
 * POST /heartbeat      → Receive device telemetry (device auth headers)
 * ---------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const device_controller_1 = require("../controllers/device.controller");
const validateRequest_1 = require("../middleware/validateRequest");
const validators_1 = require("../models/validators");
const device_validator_1 = require("../models/validators/device/device.validator");
const requireAuth_1 = require("../middleware/requireAuth");
const requireDeviceAuth_1 = require("../middleware/requireDeviceAuth");
const router = (0, express_1.Router)();
const deviceController = new device_controller_1.DeviceController();
// User APIs for Device Management
router.post('/register', requireAuth_1.requireAuth, (0, validateRequest_1.validateRequest)(validators_1.DeviceRegisterSchema), deviceController.register);
router.get('/', requireAuth_1.requireAuth, deviceController.getDevice);
// Device-facing APIs
router.post('/authenticate', requireDeviceAuth_1.requireDeviceAuth, deviceController.authenticate);
router.post('/heartbeat', requireDeviceAuth_1.requireDeviceAuth, (0, validateRequest_1.validateRequest)(device_validator_1.HeartbeatSchema), deviceController.heartbeat.bind(deviceController));
exports.default = router;
