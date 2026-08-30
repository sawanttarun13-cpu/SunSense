/**
 * ---------------------------------------------------------
 * File: readings.routes.ts
 * Purpose:
 * API route definitions for readings.routes.
 * ---------------------------------------------------------
 */

import { Router } from 'express';
import { ReadingsController } from '../../controllers/readings/readings.controller';
import { validateRequest } from '../../middleware/validateRequest';
import { ReadingsPayloadSchema } from '../../models/validators/readings/readings.validator';
import { requireDeviceAuth } from '../../middleware/requireDeviceAuth';
import { requireAuth } from '../../middleware/requireAuth';

const router = Router();
const controller = new ReadingsController();

router.post('/', requireDeviceAuth, validateRequest(ReadingsPayloadSchema), controller.process.bind(controller));
router.get('/history', requireAuth, controller.getHistory.bind(controller));

export default router;
