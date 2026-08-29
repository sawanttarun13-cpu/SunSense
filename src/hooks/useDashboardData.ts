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

/** How often (ms) to poll the backend for fresh dashboard data. */
const POLL_INTERVAL_MS = 10_000; // 10 seconds — matches firmware reading interval

export function useDashboardData() {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(true);

  const fetchDashboard = useCallback(async (isInitial = false) => {
    try {
      // Only show loading spinner on the very first fetch
      if (isInitial) {
        setLoading(true);
      }
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

  useEffect(() => {
    isMounted.current = true;

    // Initial fetch (shows loading spinner)
    fetchDashboard(true);

    // Start polling every 10 seconds (silent background updates)
    const intervalId = setInterval(() => {
      fetchDashboard(false);
    }, POLL_INTERVAL_MS);

    return () => {
      isMounted.current = false;
      clearInterval(intervalId);
    };
  }, [fetchDashboard]);

  return {
    data,
    loading,
    error,
    refetch: () => fetchDashboard(false),
  };
}
