/**
 * ---------------------------------------------------------
 * File: analytics.controller.ts
 * Purpose:
 * Handles all HTTP requests for analytics.controller.
 * ---------------------------------------------------------
 */

import { Response } from 'express';
import { AnalyticsService } from '../../services/analytics/analytics.service';
import { sendSuccess, sendError } from '../../utils/apiResponse';
import { AuthRequest } from '../../middleware/requireAuth';

const analyticsService = new AnalyticsService();

// Handles analytics.controller-related HTTP requests.
// Calls the respective service and returns API responses.
export class AnalyticsController {
  async get(req: AuthRequest, res: Response) {
    try {
      const timeframe = (req.query.timeframe as string) || 'daily';
      // tzOffset is in minutes (e.g., new Date().getTimezoneOffset()). Default to 0 (UTC).
      const tzOffset = req.query.tzOffset ? parseInt(req.query.tzOffset as string, 10) : 0;
      const result = await analyticsService.getAnalytics(req.userId!, timeframe, tzOffset);
      return sendSuccess(res, result);
    } catch (error: any) {
      return sendError(res, error.message, 400);
    }
  }
}
