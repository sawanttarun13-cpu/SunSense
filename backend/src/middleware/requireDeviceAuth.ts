import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import { sendError } from '../utils/apiResponse';
import { prisma } from '../config/prisma';

export interface DeviceAuthRequest extends Request {
  deviceId?: string;
}

export const requireDeviceAuth = async (req: DeviceAuthRequest, res: Response, next: NextFunction) => {
  try {
    const deviceId = req.headers['x-device-id'] as string;
    const apiKey = req.headers['x-api-key'] as string;

    if (!deviceId || !apiKey) {
      return sendError(res, 'Unauthorized - Missing device credentials', 401);
    }

    const tokenRecord = await prisma.deviceToken.findUnique({ where: { deviceId } });
    if (!tokenRecord) {
      return sendError(res, 'Unauthorized - Invalid device', 401);
    }

    const isValid = await bcrypt.compare(apiKey, tokenRecord.apiKeyHash);
    if (!isValid) {
      return sendError(res, 'Unauthorized - Invalid API key', 401);
    }

    // Update last used at
    await prisma.deviceToken.update({
      where: { deviceId },
      data: { lastUsedAt: new Date() }
    });

    req.deviceId = deviceId;
    next();
  } catch {
    return sendError(res, 'Unauthorized - Internal Error', 500);
  }
};
