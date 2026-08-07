/**
 * --------------------------------------------------------
 * File: user.repo.ts
 * Layer: Repository / Data Access
 *
 * Purpose:
 * The sole data access layer for the `users` table.
 * Provides create and lookup operations used by the
 * AuthService and ProfileService. All Prisma calls for
 * user records are centralised here.
 *
 * Table Managed:
 * users
 *
 * Used By:
 * AuthService    — Register, Login, Refresh Token, Get Profile
 * requireAuth    — Confirm the user still exists after JWT verification
 *
 * Does NOT:
 * Contain any business logic. Queries only.
 * --------------------------------------------------------
 */
import { prisma } from '../config/prisma';
import { Prisma } from '@prisma/client';

export class UserRepository {

  /**
   * Creates a new user record in the database.
   *
   * Called during registration after the password has been hashed
   * by the AuthService. The `data` object must conform to Prisma's
   * UserCreateInput type to ensure all required fields are provided.
   *
   * @param data - Prisma UserCreateInput containing email, passwordHash, skinType, etc.
   * @returns    The newly created User record (including the generated UUID).
   */
  async create(data: Prisma.UserCreateInput) {
    return prisma.user.create({ data });
  }

  /**
   * Looks up a user by their email address.
   *
   * Used during login to find the user whose credentials are
   * being verified. Also used during registration to enforce
   * the unique email constraint at the application layer before
   * hitting the database constraint.
   *
   * The email column has a database-level UNIQUE index for
   * performance — this query performs a single index scan.
   *
   * @param email - The user's email address to search for.
   * @returns     The User record if found, or null if no match exists.
   */
  async findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  }

  /**
   * Looks up a user by their primary key UUID.
   *
   * Used by the requireAuth middleware to confirm the user
   * encoded in the JWT token still exists, and by the AuthService
   * to return profile data.
   *
   * @param id - The UUID of the user to retrieve.
   * @returns  The User record if found, or null if the UUID is invalid.
   */
  async findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  }
}
