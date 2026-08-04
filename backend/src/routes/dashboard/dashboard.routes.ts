import { Router } from 'express';
import { DashboardController } from '../../controllers/dashboard/dashboard.controller';
import { requireAuth } from '../../middleware/requireAuth';

const router = Router();
const controller = new DashboardController();

router.use(requireAuth);
router.get('/', controller.get.bind(controller));

export default router;
