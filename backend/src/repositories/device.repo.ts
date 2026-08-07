/**
 * --------------------------------------------------------
 * File: device.repo.ts (root repositories)
 * Layer: Repository / Data Access
 *
 * Purpose:
 * The primary data access layer for the `devices` and
 * `device_tokens` tables. Provides create, lookup, and
 * token management operations used by the DeviceService.
 *
 * Note: There is also a device.repo.ts inside repositories/device/
 * which handles only the `updateLastPing` operation used by the
 * ingestion pipeline. This root-level repo handles registration
 * and authentication concerns.
 *
 * Table Managed:
 * devices, device_tokens
 *
 * Used By:
 * DeviceService — Register, Lookup, Save API key hash
 *
 * Does NOT:
 * Contain any business logic. Queries only.
 * --------------------------------------------------------
 */
import { prisma } from '../config/prisma';
import { Prisma } from '@prisma/client';

export class DeviceRepository {

  /**
   * Creates a new device record for the given user.
   *
   * MVP Constraint: The `userId` field has a UNIQUE database constraint,
   * so attempting to create a second device for the same user will throw
   * a Prisma unique constraint violation. The DeviceService checks this
   * at the application level first (for a friendlier error message).
   *
   * @param data - Prisma DeviceUncheckedCreateInput (requires userId and name at minimum).
   * @returns    The newly created Device record with its generated UUID.
   */
  async create(data: Prisma.DeviceUncheckedCreateInput) {
    return prisma.device.create({ data });
  }

  /**
   * Retrieves the device associated with the given user.
   *
   * The devices.user_id column has a UNIQUE constraint (MVP: 1 user → 1 device),
   * so this query returns at most one record.
   *
   * @param userId - UUID of the user whose device to look up.
   * @returns      The Device record, or null if the user has no registered device.
   */
  async findByUserId(userId: string) {
    return prisma.device.findUnique({ where: { userId } });
  }

  /**
   * Retrieves a device by its primary key UUID.
   *
   * Used internally after device authentication to access device details.
   *
   * @param id - UUID of the device to retrieve.
   * @returns  The Device record, or null if not found.
   */
  async findById(id: string) {
    return prisma.device.findUnique({ where: { id } });
  }

  /**
   * Creates or updates the API key hash for a device.
   *
   * Uses upsert so this method safely handles both initial
   * token creation (at registration) and key rotation (if implemented).
   *
   * IMPORTANT: Only the bcrypt hash of the API key is stored here.
   * The plaintext key is NEVER persisted in the database.
   *
   * @param deviceId   - UUID of the device to associate the token with.
   * @param apiKeyHash - bcrypt hash of the device's plaintext API key.
   * @returns          The created/updated DeviceToken record.
   */
  async saveToken(deviceId: string, apiKeyHash: string) {
    return prisma.deviceToken.upsert({
      where: { deviceId },
      update: { apiKeyHash },
      create: { deviceId, apiKeyHash }
    });
  }
}
