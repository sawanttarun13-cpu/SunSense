import { getIO } from '../../realtime/socket.server';
import { Alert } from '@prisma/client';

/**
 * Realtime Event Service
 * 
 * Provides a strongly-typed abstraction layer over Socket.IO emissions.
 * Business services use this to emit events to clients safely, without
 * needing direct access to the Socket.IO instance or managing room names.
 */
export class RealtimeEventService {
  /**
   * Notifies a specific user that their dashboard data needs invalidation.
   * Sends the timestamp of the latest successfully processed reading or event.
   */
  emitDashboardUpdate(userId: string, payload: { timestamp: string }) {
    getIO().to(`user:${userId}`).emit('dashboard:update', payload);
  }

  /**
   * Notifies a specific user that their exposure data (e.g. session length, dose) has updated.
   * This is a lightweight invalidation signal.
   */
  emitExposureUpdated(userId: string, payload: { timestamp: string }) {
    getIO().to(`user:${userId}`).emit('exposure:updated', payload);
  }

  /**
   * Pushes the online/offline status of a device to the user.
   */
  emitDeviceStatus(userId: string, status: { 
    deviceId: string;
    isOnline: boolean; 
    lastPing: Date; 
    batteryLevel: number | null; 
    firmwareVersion: string | null; 
  }) {
    getIO().to(`user:${userId}`).emit('device:status', status);
  }

  /**
   * Notifies a specific user of a newly generated alert (e.g., sunburn warning, device offline).
   */
  emitNewAlert(userId: string, alert: Alert) {
    getIO().to(`user:${userId}`).emit('alert:new', alert);
  }
}
