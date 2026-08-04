import { Router } from 'express';
import { ReadingsController } from '../../controllers/readings/readings.controller';
import { validateRequest } from '../../middleware/validateRequest';
import { ReadingsPayloadSchema } from '../../models/validators/readings/readings.validator';
import { requireDeviceAuth } from '../../middleware/requireDeviceAuth';

const router = Router();
const controller = new ReadingsController();

router.post('/', requireDeviceAuth, validateRequest(ReadingsPayloadSchema), controller.process.bind(controller));

export default router;
