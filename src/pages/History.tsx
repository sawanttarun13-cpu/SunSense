/**
 * ---------------------------------------------------------
 * File: History.tsx
 * Purpose:
 * React page component for History.
 * ---------------------------------------------------------
 */

import { useState, useEffect } from 'react';
import { Download, ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react';
import {
  PAGE_SIZE,
  fmtDate, fmtTime, exportCSV,
} from '../mockData/history';
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

  useEffect(() => {
    setLoading(true);
    historyService.getLogs(page, PAGE_SIZE)
      .then(res => {
        let rows = [...res.data];
        // Sort locally in case backend doesn't sort the way user requested
        rows.sort((a, b) => sortDir === 'desc'
          ? b.date.getTime() - a.date.getTime()
          : a.date.getTime() - b.date.getTime());
        
        setLogs(rows);
        setPaginationMeta(res.pagination);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [page, sortDir]);

  const totalPages = paginationMeta?.totalPages || 1;
  const totalEntries = paginationMeta?.total || 0;

  // Summary counts for current page (no global aggregates on backend yet)
  const highCount = logs.filter(r => r.uv > 6).length;
  const avgUV = logs.length > 0 ? (logs.reduce((s, r) => s + r.uv, 0) / logs.length).toFixed(1) : '0.0';

  if (loading && logs.length === 0) return <LoadingState />;
  if (error) return <ErrorState onRetry={() => window.location.reload()} />;

  return (
    <div className="p-5 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-slate-800 font-semibold" style={{ fontSize: '1.2rem' }}>History</h1>
          <p className="text-slate-400 mt-0.5" style={{ fontSize: '0.8rem' }}>{totalEntries} UV log entries recorded</p>
        </div>
        <button
          onClick={() => exportCSV(logs)}
          className="flex items-center gap-2 rounded-xl px-4 py-2 text-white shadow-sm transition-colors"
          style={{ background: '#2563EB', fontSize: '0.8rem', fontWeight: 500 }}
          onMouseEnter={e => (e.currentTarget.style.background = '#1D4ED8')}
          onMouseLeave={e => (e.currentTarget.style.background = '#2563EB')}
        >
          <Download size={14} />
          Export CSV
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 xl:grid-cols-3 gap-3 mb-5">
        {[
          { label: 'Total Logs', value: totalEntries, color: '#2563EB' },
          { label: 'Page High UV Events', value: highCount, color: '#EF4444' },
          { label: 'Page Average UV', value: avgUV, color: '#F97316' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-2xl p-4 shadow-sm" style={{ border: '1px solid #E8F0FE' }}>
            <div className="text-slate-400 mb-1" style={{ fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 500, letterSpacing: '0.04em' }}>{label}</div>
            <div className="font-bold" style={{ fontSize: '1.6rem', color }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Note on filters */}
      <div className="bg-white rounded-2xl p-4 shadow-sm mb-4" style={{ border: '1px solid #E8F0FE' }}>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="text-slate-400" style={{ fontSize: '0.8rem' }}>
            Search and Filtering are disabled while we transition to server-side paginated queries.
            <br/>
            Showing page <strong className="text-slate-600">{page}</strong> of <strong className="text-slate-600">{totalPages}</strong>.
          </div>
        </div>
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
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-12 text-slate-400" style={{ fontSize: '0.85rem' }}>
                    No results found
                  </td>
                </tr>
              ) : logs.map((log, i) => {
                const z = getUVZone(log.uv);
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
                    <td className="px-4 py-3 font-medium" style={{ fontSize: '0.8rem', color: '#1E293B' }}>{fmtDate(log.date)}</td>
                    <td className="px-4 py-3" style={{ fontSize: '0.8rem', color: '#64748B' }}>{fmtTime(log.date)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ background: z.color }} />
                        <span className="font-bold" style={{ fontSize: '0.88rem', color: '#1E293B' }}>{log.uv.toFixed(1)}</span>
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
