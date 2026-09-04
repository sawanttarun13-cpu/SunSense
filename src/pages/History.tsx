/**
 * ---------------------------------------------------------
 * File: History.tsx
 * Purpose:
 * React page component for History.
 * ---------------------------------------------------------
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSocketEvent } from '../hooks/useSocketEvent';
import { socket } from '../lib/socketClient';
import { Download, ChevronLeft, ChevronRight, ArrowUpDown, Search } from 'lucide-react';
import {
  PAGE_SIZE,
  fmtDate, fmtTime, fmtDuration, exportCSV, isToday
} from '../utils/history';
import type { UVLogEntry } from '../types/history';
import { getUVZone } from '../constants/uv';
import { historyService } from '../services/history.service';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';

// History page shown to the user.
export function History() {
  const [logs, setLogs] = useState<UVLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [page, setPage] = useState(1);
  const [paginationMeta, setPaginationMeta] = useState<any>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const isMounted = useRef(true);
  const fetchTimeout = useRef<NodeJS.Timeout | null>(null);

  const fetchHistory = useCallback(async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    try {
      const res = await historyService.getLogs(page, PAGE_SIZE);
      if (!isMounted.current) return;
      
      let rows = [...res.data];
      rows.sort((a, b) => {
        const timeA = new Date(a.recordedAt).getTime();
        const timeB = new Date(b.recordedAt).getTime();
        return sortDir === 'desc' ? timeB - timeA : timeA - timeB;
      });
      
      setLogs(rows);
      setPaginationMeta(res.pagination);
      if (!isBackground) setLoading(false);
    } catch (err) {
      if (!isMounted.current) return;
      if (!isBackground) {
        setError(true);
        setLoading(false);
      }
    }
  }, [page, sortDir]);

  const debouncedRefetch = useCallback(() => {
    if (fetchTimeout.current) clearTimeout(fetchTimeout.current);
    fetchTimeout.current = setTimeout(() => {
      if (isMounted.current) fetchHistory(true);
    }, 500);
  }, [fetchHistory]);

  const handleExposureUpdated = useCallback(() => {
    debouncedRefetch();
  }, [debouncedRefetch]);

  useSocketEvent('exposure:updated', handleExposureUpdated);

  useEffect(() => {
    isMounted.current = true;
    fetchHistory(false);
    
    return () => {
      isMounted.current = false;
      if (fetchTimeout.current) clearTimeout(fetchTimeout.current);
    };
  }, [fetchHistory]);

  useEffect(() => {
    const handleReconnect = () => debouncedRefetch();
    socket.io.on('reconnect', handleReconnect);
    return () => {
      socket.io.off('reconnect', handleReconnect);
    };
  }, [debouncedRefetch]);

  const totalPages = paginationMeta?.totalPages || 1;
  const totalEntries = paginationMeta?.total || 0;

  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('all');

  const filteredLogs = logs.filter(log => {
    const levelStr = getUVZone(log.uvIndex).label.toLowerCase();
    
    // First apply level filter
    if (filterLevel !== 'all' && levelStr !== filterLevel) {
      return false;
    }

    if (!searchTerm) return true;
    
    const search = searchTerm.toLowerCase();
    const dateStr = fmtDate(log.recordedAt).toLowerCase();
    const timeStr = fmtTime(log.recordedAt).toLowerCase();
    const uvStr = log.uvIndex.toFixed(1);
    
    // Also match "today" if the tag is present
    const isTodayStr = isToday(log.recordedAt) ? 'today' : '';

    return dateStr.includes(search) || 
           timeStr.includes(search) || 
           uvStr.includes(search) || 
           levelStr.includes(search) ||
           isTodayStr.includes(search);
  });

  // Summary counts for current page (no global aggregates on backend yet)
  const pageHighEvents = filteredLogs.filter(l => getUVZone(l.uvIndex).level >= 3).length; // High+ risk
  const avgUv = filteredLogs.length > 0 ? (filteredLogs.reduce((sum, l) => sum + l.uvIndex, 0) / filteredLogs.length).toFixed(1) : '0.0';

  if (loading && logs.length === 0) return <LoadingState />;
  if (error) return <ErrorState onRetry={() => window.location.reload()} />;

  return (
    <div className="p-5 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-slate-800 font-semibold" style={{ fontSize: '1.2rem' }}>History</h1>
            <p className="text-slate-400 mt-0.5" style={{ fontSize: '0.8rem' }}>{totalEntries} minute records</p>
          </div>
          <button
            onClick={() => exportCSV(filteredLogs)}
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-white shadow-sm transition-colors flex-shrink-0"
            style={{ background: '#2563EB', fontSize: '0.8rem', fontWeight: 500 }}
            onMouseEnter={e => (e.currentTarget.style.background = '#1D4ED8')}
            onMouseLeave={e => (e.currentTarget.style.background = '#2563EB')}
          >
            <Download size={14} />
            <span className="hidden sm:inline">Export CSV</span>
            <span className="sm:hidden">CSV</span>
          </button>
        </div>
        {/* Filters row — stacks on mobile, inline on md+ */}
        <div className="flex flex-col sm:flex-row gap-2">
          <select
            value={filterLevel}
            onChange={e => setFilterLevel(e.target.value)}
            className="px-3 py-2 rounded-xl text-sm border focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
            style={{ borderColor: '#E2E8F0', color: '#1E293B', outline: 'none' }}
          >
            <option value="all">All Levels</option>
            <option value="low">Low</option>
            <option value="moderate">Moderate</option>
            <option value="high">High</option>
            <option value="very high">Very High</option>
            <option value="extreme">Extreme</option>
          </select>
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search date, UV, level..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl text-sm border focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              style={{ borderColor: '#E2E8F0', color: '#1E293B' }}
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 xl:grid-cols-3 gap-3 mb-5">
        {[
          { label: 'Total Logs', value: totalEntries, color: '#2563EB', desc: 'Total historical readings available' },
          { label: 'Page High UV Events', value: pageHighEvents, color: '#EF4444', desc: 'Number of readings on this page with UV Index >= 6 (High+)' },
          { label: 'Page Average UV', value: avgUv, color: '#F97316', desc: 'Average UV Index of the readings currently visible on this page' },
        ].map(({ label, value, color, desc }) => (
          <div key={label} className="bg-white rounded-2xl p-4 shadow-sm flex flex-col justify-between" style={{ border: '1px solid #E8F0FE' }}>
            <div>
              <div className="text-slate-400 mb-1" style={{ fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 500, letterSpacing: '0.04em' }}>{label}</div>
              <div className="font-bold" style={{ fontSize: '1.6rem', color }}>{value}</div>
            </div>
            <div className="text-slate-400 mt-2" style={{ fontSize: '0.65rem', lineHeight: '1.2' }}>{desc}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden" style={{ border: '1px solid #E8F0FE' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid #F1F5F9', background: '#FAFBFF' }}>
                {['Date', 'Time', 'UV Index', 'Level'].map((col) => (
                  <th
                    key={col}
                    className="text-left px-4 py-3"
                    style={{ fontSize: '0.68rem', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                  >
                    {col === 'Date' ? (
                      <button
                        className="flex items-center gap-1"
                        onClick={() => setSortDir(d => d === 'desc' ? 'asc' : 'desc')}
                      >
                        {col} <ArrowUpDown size={11} />
                      </button>
                    ) : col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="relative">
              {loading && logs.length > 0 && (
                <tr className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center">
                  <td>Loading...</td>
                </tr>
              )}
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400" style={{ fontSize: '0.85rem' }}>
                    No results found
                  </td>
                </tr>
              ) : filteredLogs.map((log, i) => {
                const z = getUVZone(log.uvIndex);
                return (
                  <tr
                    key={log.id}
                    style={{
                      borderBottom: '1px solid #F8FAFF',
                      background: i % 2 === 0 ? '#fff' : '#FAFCFF',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#EFF6FF')}
                    onMouseLeave={e => (e.currentTarget.style.background = i % 2 === 0 ? '#fff' : '#FAFCFF')}
                  >
                    <td className="px-4 py-3 font-medium" style={{ fontSize: '0.8rem', color: '#1E293B' }}>
                      <div className="flex items-center gap-2">
                        {fmtDate(log.recordedAt)}
                        {isToday(log.recordedAt) && (
                          <span className="bg-blue-100 text-blue-700 font-semibold rounded px-1.5 py-0.5 text-[0.65rem] tracking-wide uppercase">
                            Today
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3" style={{ fontSize: '0.8rem', color: '#64748B' }}>{fmtTime(log.recordedAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ background: z.color }} />
                        <span className="font-bold" style={{ fontSize: '0.88rem', color: '#1E293B' }}>{log.uvIndex.toFixed(1)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="rounded-full px-2.5 py-1 font-medium"
                        style={{ background: z.bg, color: z.text, border: `1px solid ${z.border}`, fontSize: '0.7rem' }}
                      >
                        {z.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-3.5" style={{ borderTop: '1px solid #F1F5F9' }}>
          <span className="text-slate-400" style={{ fontSize: '0.75rem' }}>
            Page {page} of {totalPages} · {totalEntries} total entries
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors disabled:opacity-35 disabled:cursor-not-allowed"
              style={{ border: '1px solid #E2E8F0' }}
            >
              <ChevronLeft size={15} className="text-slate-500" />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const start = Math.max(1, Math.min(page - 2, totalPages - 4));
              const p = start + i;
              if (p > totalPages) return null;
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className="w-8 h-8 rounded-lg text-xs font-medium transition-colors"
                  style={{
                    background: page === p ? '#2563EB' : '#fff',
                    color: page === p ? '#fff' : '#64748B',
                    border: page === p ? 'none' : '1px solid #E2E8F0',
                  }}
                >
                  {p}
                </button>
              );
            })}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors disabled:opacity-35 disabled:cursor-not-allowed"
              style={{ border: '1px solid #E2E8F0' }}
            >
              <ChevronRight size={15} className="text-slate-500" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
