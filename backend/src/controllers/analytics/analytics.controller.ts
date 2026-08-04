import { Response } from 'express';
import { AnalyticsService } from '../../services/analytics/analytics.service';
import { sendSuccess, sendError } from '../../utils/apiResponse';
import { AuthRequest } from '../../middleware/requireAuth';

const analyticsService = new AnalyticsService();

export class AnalyticsController {
  async get(req: AuthRequest, res: Response) {
    try {
      const timeframe = (req.query.timeframe as string) || 'daily';
      const result = await analyticsService.getAnalytics(req.userId!, timeframe);
      return sendSuccess(res, result);
    } catch (error: any) {
      return sendError(res, error.message, 400);
    }
  }
}
