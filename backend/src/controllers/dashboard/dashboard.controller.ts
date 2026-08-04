import { Response } from 'express';
import { DashboardService } from '../../services/dashboard/dashboard.service';
import { sendSuccess, sendError } from '../../utils/apiResponse';
import { AuthRequest } from '../../middleware/requireAuth';

const dashboardService = new DashboardService();

export class DashboardController {
  async get(req: AuthRequest, res: Response) {
    try {
      const result = await dashboardService.getDashboard(req.userId!);
      return sendSuccess(res, result);
    } catch (error: any) {
      return sendError(res, error.message, 400);
    }
  }
}
