import { Response } from 'express';
import { ProfileService } from '../../services/profile/profile.service';
import { sendSuccess, sendError } from '../../utils/apiResponse';
import { AuthRequest } from '../../middleware/requireAuth';

const profileService = new ProfileService();

export class ProfileController {
  async get(req: AuthRequest, res: Response) {
    try {
      const result = await profileService.getProfile(req.userId!);
      return sendSuccess(res, result);
    } catch (error: any) {
      return sendError(res, error.message, 404);
    }
  }
  async update(req: AuthRequest, res: Response) {
    try {
      const result = await profileService.updateProfile(req.userId!, req.body);
      return sendSuccess(res, result);
    } catch (error: any) {
      return sendError(res, error.message, 400);
    }
  }
}
