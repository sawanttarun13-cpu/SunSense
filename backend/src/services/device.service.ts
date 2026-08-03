import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { DeviceRepository } from '../repositories/device.repo';

const deviceRepo = new DeviceRepository();

export class DeviceService {
  async registerDevice(userId: string, name: string) {
    // Enforce MVP Hard Limit: 1 Device per User
    const existingDevice = await deviceRepo.findByUserId(userId);
    if (existingDevice) {
      throw new Error('MVP Limit: Users may only have one active device.');
    }

    // Create Device
    const device = await deviceRepo.create({
      userId,
      name,
    });

    // Generate Secure API Key
    const plainApiKey = crypto.randomBytes(32).toString('hex');
    const apiKeyHash = await bcrypt.hash(plainApiKey, 10);

    await deviceRepo.saveToken(device.id, apiKeyHash);

    return {
      deviceId: device.id,
      apiKey: plainApiKey, // Return only once
      name: device.name
    };
  }

  async authenticateDevice(deviceId: string) {
    const device = await deviceRepo.findById(deviceId);
    if (!device) throw new Error('Device not found');
    return device;
  }
  
  async getDevice(userId: string) {
    const device = await deviceRepo.findByUserId(userId);
    if (!device) throw new Error('No device found for this user');
    return device;
  }
}
