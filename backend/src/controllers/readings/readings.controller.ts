/**
 * --------------------------------------------------------
 * File: readings.controller.ts
 * Layer: Controller / HTTP Handler
 *
 * Purpose:
 * Handles the UV reading ingestion endpoint exclusively
 * called by the ESP8266 device. Accepts a batch of readings
 * and delegates processing to DeviceIngestionService.
 *
 * Endpoint served:
 * POST /api/v1/readings
 *
 * Authentication:
 * Requires BOTH user JWT (Authorization: Bearer) AND device API key
 * (x-device-id + x-api-key headers) so that:
 * 1. The user identity is known (for session scoping)
 * 2. The device identity is verified (for data integrity)
 *
 * Layer:
 * Controller (HTTP only — no business logic)
 *
 * Uses:
 * DeviceIngestionService — Orchestrates reading storage and session updates
 * --------------------------------------------------------
 */
import { Response } from 'express';
import { DeviceIngestionService } from '../../services/ingestion/device-ingestion.service';
import { sendError } from '../../utils/apiResponse';
import { AuthRequest } from '../../middleware/requireAuth';

const ingestionService = new DeviceIngestionService();

export class ReadingsController {

  /**
   * POST /api/v1/readings
   *
   * Protected (User JWT + Device API Key)
   *
   * Ingests a batch of UV readings from the ESP8266.
   * The device ID is extracted from the x-device-id header
   * (already validated by requireDeviceAuth middleware).
   *
   * Request Body:
   * {
   *   "readings": [
   *     { "uvIndex": 7.4, "recordedAt": "2026-08-07T10:30:00Z" },
   *     { "uvIndex": 8.1, "recordedAt": "2026-08-07T10:31:00Z" }
   *   ]
   * }
   *
   * Responses:
   * 200 → { success: true, status: 'success', inserted: N, duplicates: M }
   * 400 → Missing x-device-id header or processing error
   */
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
