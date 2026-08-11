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

import { Router } from 'express';
import { DeviceController } from '../controllers/device.controller';
import { validateRequest } from '../middleware/validateRequest';
import { DeviceRegisterSchema } from '../models/validators';
import { HeartbeatSchema } from '../models/validators/device/device.validator';
import { requireAuth } from '../middleware/requireAuth';
import { requireDeviceAuth } from '../middleware/requireDeviceAuth';

const router = Router();
const deviceController = new DeviceController();

// User APIs for Device Management
router.post('/register', requireAuth, validateRequest(DeviceRegisterSchema), deviceController.register);
router.get('/', requireAuth, deviceController.getDevice);

// Device-facing APIs
router.post('/authenticate', requireDeviceAuth, deviceController.authenticate);
router.post('/heartbeat', requireDeviceAuth, validateRequest(HeartbeatSchema), deviceController.heartbeat.bind(deviceController));

export default router;
