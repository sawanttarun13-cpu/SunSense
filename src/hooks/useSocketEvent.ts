import { useEffect } from 'react';
import { socket } from '../lib/socketClient';
import { ServerToClientEvents } from '../types/realtime';

/**
 * A safe React hook to subscribe to strongly-typed Socket.IO events.
 * 
 * Guarantees that:
 * - Only the exact listener passed is removed on cleanup.
 * - `socket.removeAllListeners()` is NEVER called (preventing side effects).
 * - Event names and payloads are fully type-safe.
 * 
 * @param eventName The event to listen for
 * @param handler The callback function
 */
export function useSocketEvent<Ev extends keyof ServerToClientEvents>(
  eventName: Ev,
  handler: ServerToClientEvents[Ev]
) {
  useEffect(() => {
    // Register the listener
    // Note: The `socket.on` types require some casting internally 
    // because the handler signature must perfectly match the event map.
    socket.on(eventName, handler as any);

    // Cleanup exactly this listener on unmount or re-render
    return () => {
      socket.off(eventName, handler as any);
    };
  }, [eventName, handler]);
}
