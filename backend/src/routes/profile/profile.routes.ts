/**
 * ---------------------------------------------------------
 * File: profile.routes.ts
 * Purpose:
 * API route definitions for profile.routes.
 * ---------------------------------------------------------
 */

import { Router } from 'express';
import { ProfileController } from '../../controllers/profile/profile.controller';
import { validateRequest } from '../../middleware/validateRequest';
import { UpdateProfileSchema } from '../../models/validators/profile/profile.validator';
import { requireAuth } from '../../middleware/requireAuth';

const router = Router();
const controller = new ProfileController();

router.use(requireAuth);
router.get('/', controller.get.bind(controller));
router.put('/', validateRequest(UpdateProfileSchema), controller.update.bind(controller));

export default router;
