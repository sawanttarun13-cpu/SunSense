import { io, Socket } from 'socket.io-client';
import { ServerToClientEvents, ClientToServerEvents } from '../types/realtime';

const VITE_API_URL = import.meta.env.VITE_API_URL as string;

// Parse the backend URL safely to extract just the origin.
// For example: "http://localhost:5000/api/v1" -> "http://localhost:5000"
let socketOrigin = 'http://localhost:5000';
try {
  socketOrigin = new URL(VITE_API_URL).origin;
} catch (e) {
  console.warn('[socketClient] Invalid VITE_API_URL format, using fallback.', e);
}

// Exactly ONE global Socket.IO instance.
// autoConnect is false so we only connect once the user is authenticated.
export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(socketOrigin, {
  autoConnect: false,
  withCredentials: true,
  // Let Socket.IO handle underlying transport reconnections automatically
  reconnection: true,
});
