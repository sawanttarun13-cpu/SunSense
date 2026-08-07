/**
 * ---------------------------------------------------------
 * File: history.controller.ts
 * Purpose:
 * Handles all HTTP requests for history.controller.
 * ---------------------------------------------------------
 */

import { Response } from 'express';
import { HistoryService } from '../../services/history/history.service';
import { sendSuccess, sendError } from '../../utils/apiResponse';
import { AuthRequest } from '../../middleware/requireAuth';

const historyService = new HistoryService();

// Handles history.controller-related HTTP requests.
// Calls the respective service and returns API responses.
export class HistoryController {
  async get(req: AuthRequest, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const startDate = typeof req.query.startDate === 'string' ? req.query.startDate : undefined;
      const endDate = typeof req.query.endDate === 'string' ? req.query.endDate : undefined;
      
      const result = await historyService.getHistory(req.userId!, page, limit, startDate, endDate);
      return res.status(200).json({ success: true, data: result.data, pagination: result.pagination });
    } catch (error: any) {
      return sendError(res, error.message, 400);
    }
  }
  async getById(req: AuthRequest, res: Response) {
    try {
      const result = await historyService.getSession(req.userId!, req.params.id as string);
      return sendSuccess(res, result);
    } catch (error: any) {
      return sendError(res, error.message, 404);
    }
  }
}
