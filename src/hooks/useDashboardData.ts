/**
 * ─────────────────────────────────────────────────────────────────────────────
 * File: useDashboardData.ts
 * Layer: Frontend / Custom Hook
 *
 * Purpose:
 * Fetches dashboard data from the real backend API (Phase 6D integration).
 * Polls every 10 seconds to stay in sync with the firmware's sensor
 * reading interval (READING_INTERVAL_MS = 10000 in firmware_config.h).
 *
 * Polling behaviour:
 * - The initial fetch shows a loading spinner via `loading: true`.
 * - Subsequent background polls update `data` silently without
 *   flashing a loading state, so the UI feels smooth and live.
 * - Polling stops automatically when the component unmounts
 *   (e.g., user navigates away from the dashboard).
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { dashboardService } from '../services/dashboard.service';
import type { DashboardResponse } from '../types/dashboard';
import { useSocketEvent } from './useSocketEvent';
import { socket } from '../lib/socketClient';

export function useDashboardData() {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(true);
  const fetchTimeout = useRef<NodeJS.Timeout | null>(null);

  const fetchDashboard = useCallback(async (isInitial = false) => {
    try {
      // Only show loading spinner on the very first fetch
      if (isInitial) setLoading(true);
      setError(null);
      
      const tzOffset = new Date().getTimezoneOffset();
      const dashboardData = await dashboardService.getDashboard(tzOffset);
      
      if (isMounted.current) {
        setData(dashboardData);
      }
    } catch (err: any) {
      if (isMounted.current) {
        setError(err.message || 'Failed to load dashboard data');
      }
    } finally {
      if (isMounted.current && isInitial) {
        setLoading(false);
      }
    }
  }, []);

  // Request coalescing to avoid fetch storms when multiple events arrive quickly
  const debouncedRefetch = useCallback(() => {
    if (fetchTimeout.current) clearTimeout(fetchTimeout.current);
    fetchTimeout.current = setTimeout(() => {
      if (isMounted.current) {
        fetchDashboard(false);
      }
    }, 500); // 500ms debounce window
  }, [fetchDashboard]);

  // Listen to realtime invalidation events
  const handleDashboardUpdate = useCallback(() => {
    debouncedRefetch();
  }, [debouncedRefetch]);

  useSocketEvent('dashboard:update', handleDashboardUpdate);

  // Initial fetch on mount
  useEffect(() => {
    isMounted.current = true;
    
    // Initial fetch (shows loading spinner)
    fetchDashboard(true);

    return () => {
      isMounted.current = false;
      if (fetchTimeout.current) clearTimeout(fetchTimeout.current);
    };
  }, [fetchDashboard]);

  // Listen for socket reconnection to resync missed events
  useEffect(() => {
    const handleReconnect = () => {
      debouncedRefetch();
    };
    
    // 'reconnect' is emitted by the manager only after a successful recovery, 
    // not on the initial connection. This prevents a duplicate fetch on mount.
    socket.io.on('reconnect', handleReconnect);
    
    return () => {
      socket.io.off('reconnect', handleReconnect);
    };
  }, [debouncedRefetch]);

  return {
    data,
    loading,
    error,
    refetch: () => fetchDashboard(false),
  };
}
