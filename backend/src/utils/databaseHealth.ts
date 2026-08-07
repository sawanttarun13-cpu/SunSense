/**
 * --------------------------------------------------------
 * File: databaseHealth.ts
 * Layer: Utility
 *
 * Purpose:
 * Provides a single async function that checks whether the
 * PostgreSQL database is reachable. Used by the health
 * endpoint (GET /api/v1/health) to report the live
 * database connection status.
 *
 * Design:
 * The check runs a `SELECT 1` raw query — the lightest
 * possible query that validates TCP connectivity, TLS
 * handshake, authentication, and Prisma pool availability
 * without reading any application data or locking tables.
 * --------------------------------------------------------
 */
import { prisma } from '../config/prisma';
import { logger } from './logger';

/**
 * Checks whether the PostgreSQL database connection is healthy.
 *
 * Executes a `SELECT 1` raw query via Prisma. If the query
 * succeeds, the database is reachable. If it throws, the
 * connection is unavailable (down, misconfigured, or the
 * credentials in DATABASE_URL are incorrect).
 *
 * @returns `true` if the database responded successfully, `false` otherwise.
 *
 * @example
 * const isHealthy = await checkDatabaseHealth();
 * // Returns: true | false
 */
export const checkDatabaseHealth = async (): Promise<boolean> => {
  try {
    // The lightest possible query — no table scans, no row locks.
    // Validates the full connection path: TCP → Auth → Prisma pool.
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    logger.error('Database health check failed', error);
    return false;
  }
};
