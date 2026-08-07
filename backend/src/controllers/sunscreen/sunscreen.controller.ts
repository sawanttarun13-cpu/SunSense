/**
 * ---------------------------------------------------------
 * File: sunscreen.controller.ts
 * Purpose:
 * Handles all HTTP requests for sunscreen.controller.
 * ---------------------------------------------------------
 */

import { Response } from 'express';
import { SunscreenService } from '../../services/sunscreen/sunscreen.service';
import { sendSuccess, sendError } from '../../utils/apiResponse';
import { AuthRequest } from '../../middleware/requireAuth';

const sunscreenService = new SunscreenService();

// Handles sunscreen.controller-related HTTP requests.
// Calls the respective service and returns API responses.
export class SunscreenController {
  async apply(req: AuthRequest, res: Response) {
    try {
      const { appliedSpf, appliedAt } = req.body;
      const application = await sunscreenService.applySunscreen(
        req.userId!, 
        appliedSpf, 
        appliedAt ? new Date(appliedAt) : new Date()
      );
      return sendSuccess(res, application, 201);
    } catch (error: any) {
      return sendError(res, error.message, 400);
    }
  }
}
