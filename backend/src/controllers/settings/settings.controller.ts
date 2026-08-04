import { Response } from 'express';
import { SettingsService } from '../../services/settings/settings.service';
import { sendSuccess, sendError } from '../../utils/apiResponse';
import { AuthRequest } from '../../middleware/requireAuth';

const settingsService = new SettingsService();

export class SettingsController {
  async get(req: AuthRequest, res: Response) {
    try {
      const result = await settingsService.getSettings(req.userId!);
      return sendSuccess(res, result);
    } catch (error: any) {
      return sendError(res, error.message, 404);
    }
  }
  async update(req: AuthRequest, res: Response) {
    try {
      const result = await settingsService.updateSettings(req.userId!, req.body);
      return sendSuccess(res, result);
    } catch (error: any) {
      return sendError(res, error.message, 400);
    }
  }
}
