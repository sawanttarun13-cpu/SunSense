import { Response } from 'express';
import { DeviceService } from '../services/device.service';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { AuthRequest } from '../middleware/requireAuth';
import { DeviceAuthRequest } from '../middleware/requireDeviceAuth';

const deviceService = new DeviceService();

export class DeviceController {
  async register(req: AuthRequest, res: Response) {
    try {
      const { name } = req.body;
      const result = await deviceService.registerDevice(req.userId!, name);
      return sendSuccess(res, result, 201);
    } catch (error: any) {
      return sendError(res, error.message, 409); // Conflict
    }
  }

  async getDevice(req: AuthRequest, res: Response) {
    try {
      const result = await deviceService.getDevice(req.userId!);
      return sendSuccess(res, result);
    } catch (error: any) {
      return sendError(res, error.message, 404);
    }
  }

  async authenticate(req: DeviceAuthRequest, res: Response) {
    // If middleware passes, it's authenticated
    try {
      const result = await deviceService.authenticateDevice(req.deviceId!);
      return sendSuccess(res, { message: 'Device authenticated', deviceId: result.id });
    } catch (error: any) {
      return sendError(res, error.message, 401);
    }
  }
}
