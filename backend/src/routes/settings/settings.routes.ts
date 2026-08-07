/**
 * ---------------------------------------------------------
 * File: settings.routes.ts
 * Purpose:
 * API route definitions for settings.routes.
 * ---------------------------------------------------------
 */

import { Router } from 'express';
import { SettingsController } from '../../controllers/settings/settings.controller';
import { validateRequest } from '../../middleware/validateRequest';
import { UpdateSettingsSchema } from '../../models/validators/settings/settings.validator';
import { requireAuth } from '../../middleware/requireAuth';

const router = Router();
const controller = new SettingsController();

router.use(requireAuth);
router.get('/', controller.get.bind(controller));
router.put('/', validateRequest(UpdateSettingsSchema), controller.update.bind(controller));

export default router;
