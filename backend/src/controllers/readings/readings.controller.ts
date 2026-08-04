import { Response } from 'express';
import { DeviceIngestionService } from '../../services/ingestion/device-ingestion.service';
import { sendError } from '../../utils/apiResponse';
import { AuthRequest } from '../../middleware/requireAuth';

const ingestionService = new DeviceIngestionService();

export class ReadingsController {
  async process(req: AuthRequest, res: Response) {
    try {
      const deviceId = req.headers['x-device-id'] as string;
      if (!deviceId) return sendError(res, 'x-device-id header is required', 400);
      
      const result = await ingestionService.processPayload(req.userId!, deviceId, req.body.readings);
      return res.status(200).json({ success: true, status: 'success', ...result });
    } catch (error: any) {
      return sendError(res, error.message, 400);
    }
  }
}
