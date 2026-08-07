/**
 * ---------------------------------------------------------
 * File: history.routes.ts
 * Purpose:
 * API route definitions for history.routes.
 * ---------------------------------------------------------
 */

import { Router } from 'express';
import { HistoryController } from '../../controllers/history/history.controller';
import { requireAuth } from '../../middleware/requireAuth';

const router = Router();
const controller = new HistoryController();

router.use(requireAuth);
router.get('/', controller.get.bind(controller));
router.get('/:id', controller.getById.bind(controller));

export default router;
