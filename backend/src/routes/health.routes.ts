import { Router } from 'express';
import { sendSuccess } from '../utils/apiResponse';
import { config } from '../config/env';

const router = Router();

router.get('/health', (req, res) => {
  sendSuccess(res, {
    message: 'SunSense Backend Running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
  });
});

export default router;
