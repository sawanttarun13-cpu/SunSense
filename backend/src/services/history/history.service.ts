/**
 * --------------------------------------------------------
 * File: history.service.ts
 * Layer: Service / Business Logic
 *
 * Purpose:
 * Provides paginated access to the user's historical
 * exposure sessions with optional date range filtering.
 * Computes pagination metadata (total pages, has-next,
 * has-previous) so the frontend can render a paginated list.
 *
 * Layer:
 * Business Logic
 *
 * Uses:
 * HistoryRepository — Queries exposure_sessions table
 *
 * Does NOT:
 * Access Prisma directly.
 * --------------------------------------------------------
 */
import { HistoryRepository } from '../../repositories/history/history.repo';

const historyRepo = new HistoryRepository();

export class HistoryService {

  /**
   * Returns a paginated list of the user's exposure sessions.
   *
   * Pagination is 1-indexed (page=1 is the first page).
   * Results are ordered by start_time descending (most recent first).
   *
   * @param userId       - UUID of the authenticated user.
   * @param page         - 1-indexed page number.
   * @param limit        - Number of sessions per page. Capped at 100 to prevent
   *                       overly large payloads that could strain the database.
   * @param startDateStr - Optional ISO 8601 start date string for filtering.
   * @param endDateStr   - Optional ISO 8601 end date string for filtering.
   * @returns            { data: ExposureSession[], pagination: PaginationMeta }
   */
  async getHistory(userId: string, page: number, limit: number, startDateStr?: string, endDateStr?: string) {
    // Hard cap to prevent unbounded queries
    if (limit > 100) limit = 100;
    const skip = (page - 1) * limit;

    // Convert optional string dates to Date objects for Prisma
    const startDate = startDateStr ? new Date(startDateStr) : undefined;
    const endDate = endDateStr ? new Date(endDateStr) : undefined;

    const { data, total } = await historyRepo.findMany(userId, skip, limit, startDate, endDate);
    const totalPages = Math.ceil(total / limit);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrevious: page > 1
      }
    };
  }

  /**
   * Returns a single exposure session by its session ID.
   *
   * Scoped to the authenticated user so that users cannot
   * read other users' session data by guessing a UUID.
   *
   * @param userId - UUID of the authenticated user.
   * @param id     - UUID of the exposure session to retrieve.
   * @returns      The exposure session record.
   * @throws       'Session not found' if the session does not exist or belongs to another user.
   */
  async getSession(userId: string, id: string) {
    const session = await historyRepo.findById(userId, id);
    if (!session) throw new Error('Session not found');
    return session;
  }
}
