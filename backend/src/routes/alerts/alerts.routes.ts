/**
 * ---------------------------------------------------------
 * File: alerts.routes.ts
 * Purpose:
 * API route definitions for alerts.routes.
 * ---------------------------------------------------------
 */

import { Router } from 'express';
import { AlertsController } from '../../controllers/alerts/alerts.controller';
import { requireAuth } from '../../middleware/requireAuth';

const router = Router();
const controller = new AlertsController();

router.use(requireAuth);
router.get('/', controller.get.bind(controller));
router.patch('/:id/read', controller.markRead.bind(controller));
router.delete('/:id', controller.deleteAlert.bind(controller));

export default router;
