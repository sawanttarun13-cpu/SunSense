/**
 * ---------------------------------------------------------
 * File: History.tsx
 * Purpose:
 * React page component for History.
 * ---------------------------------------------------------
 */

import { useState, useMemo, useEffect } from 'react';
import { Search, Download, SlidersHorizontal, ChevronLeft, ChevronRight, MapPin, ArrowUpDown } from 'lucide-react';
import {
  PAGE_SIZE, LEVEL_OPTS,
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

  useEffect(() => {
    historyService.getLogs()
      .then(data => {
        setLogs(data);
        setLoading(false);
      })
      .catch(() => setError(true));
  }, []);

  const [search, setSearch] = useState('');
  const [level, setLevel] = useState('All');
  const [page, setPage] = useState(1);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const filtered = useMemo(() => {
    let rows = logs.filter(r => {
      const z = getUVZone(r.uv);
      const matchLevel = level === 'All' || z.label === level;
      const q = search.toLowerCase();
      const matchSearch = !q || fmtDate(r.date).toLowerCase().includes(q) ||
        fmtTime(r.date).toLowerCase().includes(q) || r.uv.toString().includes(q);
      return matchLevel && matchSearch;
    });
    rows = [...rows].sort((a, b) => sortDir === 'desc'
      ? b.date.getTime() - a.date.getTime()
      : a.date.getTime() - b.date.getTime());
    return rows;
  }, [search, level, sortDir, logs]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleFilter = (v: string) => { setLevel(v); setPage(1); };
  const handleSearch = (v: string) => { setSearch(v); setPage(1); };

  // Summary counts
  const highCount = logs.filter(r => r.uv > 6).length;
  const avgUV = logs.length > 0 ? (logs.reduce((s, r) => s + r.uv, 0) / logs.length).toFixed(1) : '0.0';

  if (loading) return <LoadingState />;
  if (error) return <ErrorState onRetry={() => window.location.reload()} />;

  return (
    <div className="p-5 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-slate-800 font-semibold" style={{ fontSize: '1.2rem' }}>History</h1>
          <p className="text-slate-400 mt-0.5" style={{ fontSize: '0.8rem' }}>{logs.length} UV log entries recorded</p>
        </div>
        <button
          onClick={() => exportCSV(filtered)}
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
          { label: 'Total Logs', value: logs.length, color: '#2563EB' },
          { label: 'High UV Events', value: highCount, color: '#EF4444' },
          { label: 'Average UV', value: avgUV, color: '#F97316' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-2xl p-4 shadow-sm" style={{ border: '1px solid #E8F0FE' }}>
            <div className="text-slate-400 mb-1" style={{ fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 500, letterSpacing: '0.04em' }}>{label}</div>
            <div className="font-bold" style={{ fontSize: '1.6rem', color }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-sm mb-4" style={{ border: '1px solid #E8F0FE' }}>
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={e => handleSearch(e.target.value)}
              placeholder="Search by date, time or UV Index..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl outline-none transition-all"
              style={{
                background: '#F8FAFF', border: '1.5px solid #E2E8F0', fontSize: '0.8rem', color: '#1E293B',
              }}
              onFocus={e => (e.currentTarget.style.border = '1.5px solid #3B82F6')}
              onBlur={e => (e.currentTarget.style.border = '1.5px solid #E2E8F0')}
            />
          </div>
          {/* Level filter */}
          <div className="relative">
            <SlidersHorizontal size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              value={level}
              onChange={e => handleFilter(e.target.value)}
              className="pl-8 pr-8 py-2.5 rounded-xl appearance-none cursor-pointer outline-none"
              style={{ background: '#F8FAFF', border: '1.5px solid #E2E8F0', fontSize: '0.8rem', color: '#1E293B' }}
            >
              {LEVEL_OPTS.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          {(search || level !== 'All') && (
            <button
              onClick={() => { setSearch(''); setLevel('All'); setPage(1); }}
              className="px-4 py-2.5 rounded-xl transition-colors"
              style={{ border: '1.5px solid #E2E8F0', fontSize: '0.8rem', color: '#64748B', background: '#fff' }}
            >
              Clear
            </button>
          )}
        </div>
        <div className="mt-2 text-slate-400" style={{ fontSize: '0.7rem' }}>
          Showing <strong className="text-slate-600">{filtered.length}</strong> results
          {level !== 'All' && <> · Level: <strong className="text-slate-600">{level}</strong></>}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden" style={{ border: '1px solid #E8F0FE' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid #F1F5F9', background: '#FAFBFF' }}>
                {['Date', 'Time', 'UV Index', 'Level'].map((col, ci) => (
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
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400" style={{ fontSize: '0.85rem' }}>
                    No results found
                  </td>
                </tr>
              ) : paginated.map((log, i) => {
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
            Page {page} of {totalPages} · {filtered.length} entries
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
