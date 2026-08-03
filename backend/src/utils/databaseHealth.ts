import { prisma } from '../config/prisma';
import { logger } from './logger';

export const checkDatabaseHealth = async (): Promise<boolean> => {
  try {
    // Attempt a very simple, fast query that doesn't hit any specific table
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    logger.error('Database health check failed', error);
    return false;
  }
};
