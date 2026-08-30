import type { DashboardResponse } from './dashboard';
import type { Alert } from './alerts';

// Events that the server emits to the client
export interface ServerToClientEvents {
  'dashboard:update': (payload: { timestamp: string }) => void;
  'exposure:updated': (payload: { timestamp: string }) => void;
  'device:status': (status: { 
    deviceId: string;
    isOnline: boolean; 
    lastPing: string; 
    batteryLevel: number | null; 
    firmwareVersion: string | null; 
  }) => void;
  'alert:new': (alert: Alert) => void;
}

// Events that the client can emit to the server (none specified for Phase 7C)
export interface ClientToServerEvents {
  // Reserved for future use
}
