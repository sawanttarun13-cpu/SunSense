import { Alert } from '@prisma/client';

/**
 * Strong typing for the socket connection metadata.
 */
export interface SocketData {
  userId: string;
}

/**
 * Server -> Client event mapping
 * Defines all events the server can emit and the client can listen to.
 */
export interface ServerToClientEvents {
  'dashboard:update': (payload: { timestamp: string }) => void;
  'exposure:updated': (payload: { timestamp: string }) => void;
  'device:status': (payload: { 
    deviceId: string;
    isOnline: boolean; 
    lastPing: Date; 
    batteryLevel: number | null; 
    firmwareVersion: string | null; 
  }) => void;
  'alert:new': (payload: Alert) => void;
}

/**
 * Client -> Server event mapping
 * Currently none are defined for Phase 7B.
 */
export interface ClientToServerEvents {}

/**
 * Inter-server events (not used in single node, but required by Socket.io typings)
 */
export interface InterServerEvents {}
