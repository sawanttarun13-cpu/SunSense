/**
 * --------------------------------------------------------
 * File: prisma.ts
 * Layer: Configuration / Database
 *
 * Purpose:
 * Creates and exports a singleton instance of PrismaClient.
 * Every repository in the backend imports `prisma` from
 * this file to ensure a single database connection pool is
 * shared across the entire application.
 *
 * Why Singleton?
 * In development, ts-node-dev hot-reloads modules on every
 * file change. Without the global guard below, each reload
 * would instantiate a fresh PrismaClient, eventually
 * exhausting the PostgreSQL connection limit.
 * Storing the instance on the `global` object prevents
 * duplicate instances from being created across reloads.
 *
 * In production, module-level caching already ensures only
 * one instance is created, so the guard is a no-op.
 * --------------------------------------------------------
 */
import { PrismaClient } from '@prisma/client';

// The global object persists across hot-reloads in development.
const globalForPrisma = global as unknown as { prisma: PrismaClient };

/**
 * The shared PrismaClient instance.
 *
 * Re-uses the instance stored on `global` if it exists
 * (development hot-reload scenario), otherwise creates a
 * new client with full query/info/warn/error logging enabled.
 */
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  });

// Cache the instance globally so hot-reloads do not create duplicates.
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
