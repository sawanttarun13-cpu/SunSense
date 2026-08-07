/**
 * ---------------------------------------------------------
 * File: alerts.controller.ts
 * Purpose:
 * Handles all HTTP requests for alerts.controller.
 * ---------------------------------------------------------
 */

import { Response } from 'express';
import { AlertsService } from '../../services/alerts/alerts.service';
import { sendSuccess, sendError } from '../../utils/apiResponse';
import { AuthRequest } from '../../middleware/requireAuth';

const alertsService = new AlertsService();

// Handles alerts.controller-related HTTP requests.
// Calls the respective service and returns API responses.
export class AlertsController {
  async get(req: AuthRequest, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const status = typeof req.query.status === 'string' ? req.query.status : 'all';
      
      const result = await alertsService.getAlerts(req.userId!, page, limit, status);
      return res.status(200).json({ success: true, data: result.data, pagination: result.pagination });
    } catch (error: any) {
      return sendError(res, error.message, 400);
    }
  }
  async markRead(req: AuthRequest, res: Response) {
    try {
      const result = await alertsService.markRead(req.userId!, req.params.id as string);
      return sendSuccess(res, result);
    } catch (error: any) {
      return sendError(res, error.message, 404);
    }
  }
}
