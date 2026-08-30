import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { socket } from '../lib/socketClient';
import { useAuth } from './AuthContext';
import { getAccessToken, refreshAccessToken } from '../lib/apiClient';

export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'authentication_error';

interface SocketContextValue {
  connectionState: ConnectionState;
}

const SocketContext = createContext<SocketContextValue | null>(null);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
  
  // Guard against infinite refresh loops when token is consistently rejected
  const hasAttemptedRefreshRef = useRef(false);

  useEffect(() => {
    // Wait until AuthContext finishes its initial loading
    if (isLoading) return;

    if (!isAuthenticated) {
      if (socket.connected || connectionState !== 'disconnected') {
        socket.disconnect();
      }
      setConnectionState('disconnected');
      return;
    }

    // Connect immediately if we have a token
    const token = getAccessToken();
    if (token) {
      socket.auth = { token };
      if (!socket.connected) {
        setConnectionState('connecting');
        socket.connect();
      }
    }

    const onConnect = () => {
      setConnectionState('connected');
      // Reset refresh protection on successful connection
      hasAttemptedRefreshRef.current = false;
    };

    const onDisconnect = (reason: string) => {
      if (reason === 'io server disconnect' || reason === 'io client disconnect') {
        // Disconnected explicitly
        setConnectionState('disconnected');
      } else {
        // Network drop or similar
        setConnectionState('reconnecting');
      }
    };

    const onConnectError = async (err: Error) => {
      if (err.message.includes('Unauthorized') || err.message.includes('token')) {
        if (hasAttemptedRefreshRef.current) {
          // We already tried refreshing and failed. Stop the infinite loop.
          setConnectionState('authentication_error');
          socket.disconnect(); // Stop automatic reconnect attempts
          return;
        }

        hasAttemptedRefreshRef.current = true;
        setConnectionState('reconnecting');

        try {
          // Attempt to fetch a new token via the shared helper
          const newToken = await refreshAccessToken();
          
          // Update socket auth and reconnect
          socket.auth = { token: newToken };
          socket.connect();
        } catch (refreshErr) {
          // Refresh totally failed. 
          // AuthContext will handle clearing the session globally.
          setConnectionState('authentication_error');
          socket.disconnect();
        }
      } else {
        // Other errors (like network unavailable)
        setConnectionState('reconnecting');
      }
    };

    // Attach listeners
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onConnectError);
      // We don't disconnect on unmount of the Provider, unless it's genuinely being destroyed.
      // Typically Provider wraps the whole app, so this only runs on full unmount.
    };
  }, [isAuthenticated, isLoading]);

  // Hook for keeping the token up-to-date even while already connected
  // Wait, if REST refreshes the token independently, we should ensure the next reconnect uses the new token.
  useEffect(() => {
    // We can intercept the socket reconnect attempt (via manager) to update token
    const onReconnectAttempt = () => {
      const currentToken = getAccessToken();
      if (currentToken) {
        socket.auth = { token: currentToken };
      }
    };

    socket.io.on('reconnect_attempt', onReconnectAttempt);
    return () => {
      socket.io.off('reconnect_attempt', onReconnectAttempt);
    };
  }, []);

  return (
    <SocketContext.Provider value={{ connectionState }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}
