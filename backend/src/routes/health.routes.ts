import { Router } from 'express';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { config } from '../config/env';
import { checkDatabaseHealth } from '../utils/databaseHealth';

const router = Router();

router.get('/health', async (req, res) => {
  const isDbConnected = await checkDatabaseHealth();
  
  if (!isDbConnected) {
    return sendError(res, 'Database connection failed', 503, {
      server: 'running',
      database: 'disconnected',
      timestamp: new Date().toISOString(),
      version: 'v1'
    });
  }

  return sendSuccess(res, {
    server: 'running',
    database: 'connected',
    timestamp: new Date().toISOString(),
    version: 'v1',
    environment: config.nodeEnv,
  });
});

export default router;
