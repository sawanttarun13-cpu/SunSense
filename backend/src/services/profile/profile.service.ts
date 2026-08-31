/**
 * --------------------------------------------------------
 * File: profile.service.ts
 * Layer: Service / Business Logic
 *
 * Purpose:
 * Handles reading and updating the authenticated user's
 * profile (name, email, skin type, preferred SPF).
 * Skin type and preferred SPF are particularly important
 * as they are used by the CalculationService to personalise
 * burn time and SPF recommendations.
 *
 * Layer:
 * Business Logic
 *
 * Uses:
 * ProfileRepository — Reads/writes the users table
 *
 * Does NOT:
 * Access Prisma directly.
 * --------------------------------------------------------
 */
import { ProfileRepository } from '../../repositories/profile/profile.repo';

const profileRepo = new ProfileRepository();

export class ProfileService {

  /**
   * Returns the authenticated user's profile fields.
   *
   * The returned object contains only safe public fields.
   * The passwordHash field is never selected or returned.
   *
   * @param userId - UUID of the authenticated user.
   * @returns      { id, email, name, skinType, preferredSpf, createdAt }
   * @throws       'Profile not found' if the user record does not exist.
   */
  async getProfile(userId: string) {
    const profile = await profileRepo.findById(userId);
    if (!profile) throw new Error('Profile not found');
    
    const stats = await profileRepo.getStats(userId);
    
    return {
      ...profile,
      stats
    };
  }

  /**
   * Updates the authenticated user's profile fields.
   *
   * Partial updates are supported — only the fields provided
   * in `data` are changed. Prisma will ignore undefined fields.
   *
   * Updatable Fields:
   * - name        → Display name shown in the UI
   * - skinType    → Fitzpatrick scale (1–6), affects burn time calculations
   * - preferredSpf → User's preferred SPF, used as default in sunscreen tracker
   *
   * Note: Email updates require separate email verification logic
   * (not yet implemented — planned for a future phase).
   *
   * @param userId - UUID of the authenticated user.
   * @param data   - Partial update payload (any subset of profile fields).
   * @returns      Updated profile (same fields as getProfile).
   */
  async updateProfile(userId: string, data: any) {
    // Whitelist only the fields that exist in the Prisma User model.
    // This prevents unknown fields (e.g. 'location' from the frontend)
    // from being passed to Prisma and causing a runtime error.
    const allowedFields: Record<string, unknown> = {};
    if (data.name !== undefined) allowedFields.name = data.name;
    if (data.skinType !== undefined) allowedFields.skinType = data.skinType;
    if (data.preferredSpf !== undefined) allowedFields.preferredSpf = data.preferredSpf;

    return profileRepo.update(userId, allowedFields);
  }
}
