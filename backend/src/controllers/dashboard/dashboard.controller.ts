/**
 * ---------------------------------------------------------
 * File: dashboard.controller.ts
 * Purpose:
 * Handles all HTTP requests for dashboard.controller.
 * ---------------------------------------------------------
 */

import { Response } from 'express';
import { DashboardService } from '../../services/dashboard/dashboard.service';
import { sendSuccess, sendError } from '../../utils/apiResponse';
import { AuthRequest } from '../../middleware/requireAuth';

const dashboardService = new DashboardService();

// Handles dashboard.controller-related HTTP requests.
// Calls the respective service and returns API responses.
export class DashboardController {
  async get(req: AuthRequest, res: Response) {
    try {
      const tzOffset = req.query.tzOffset ? parseInt(req.query.tzOffset as string, 10) : 0;
      const result = await dashboardService.getDashboard(req.userId!, tzOffset);
      return sendSuccess(res, result);
    } catch (error: any) {
      return sendError(res, error.message, 400);
    }
  }
}
