/**
 * ---------------------------------------------------------
 * File: device.routes.ts
 * Purpose:
 * API route definitions for device.routes.
 * ---------------------------------------------------------
 */

import { Router } from 'express';
import { DeviceController } from '../controllers/device.controller';
import { validateRequest } from '../middleware/validateRequest';
import { DeviceRegisterSchema } from '../models/validators';
import { requireAuth } from '../middleware/requireAuth';
import { requireDeviceAuth } from '../middleware/requireDeviceAuth';

const router = Router();
const deviceController = new DeviceController();

// User APIs for Device Management
router.post('/register', requireAuth, validateRequest(DeviceRegisterSchema), deviceController.register);
router.get('/', requireAuth, deviceController.getDevice);

// Device-facing APIs
router.post('/authenticate', requireDeviceAuth, deviceController.authenticate);

export default router;
