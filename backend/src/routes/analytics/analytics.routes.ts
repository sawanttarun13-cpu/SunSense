import { Router } from 'express';
import { AnalyticsController } from '../../controllers/analytics/analytics.controller';
import { requireAuth } from '../../middleware/requireAuth';

const router = Router();
const controller = new AnalyticsController();

router.use(requireAuth);
router.get('/', controller.get.bind(controller));

export default router;
