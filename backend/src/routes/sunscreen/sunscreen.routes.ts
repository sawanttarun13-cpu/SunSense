/**
 * ---------------------------------------------------------
 * File: sunscreen.routes.ts
 * Purpose:
 * API route definitions for sunscreen.routes.
 * ---------------------------------------------------------
 */

import { Router } from 'express';
import { SunscreenController } from '../../controllers/sunscreen/sunscreen.controller';
import { requireAuth } from '../../middleware/requireAuth';
import { validateRequest } from '../../middleware/validateRequest';
import { z } from 'zod';

const router = Router();
const controller = new SunscreenController();

const ApplySchema = z.object({
  appliedSpf: z.number().min(1).max(100),
  appliedAt: z.string().datetime().optional()
});

router.post('/', requireAuth, validateRequest(ApplySchema), controller.apply.bind(controller));

export default router;
