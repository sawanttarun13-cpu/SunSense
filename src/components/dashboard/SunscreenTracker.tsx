/**
 * ---------------------------------------------------------
 * File: SunscreenTracker.tsx
 * Purpose:
 * React component for SunscreenTracker.
 * ---------------------------------------------------------
 */

import { Shield, Clock, Plus } from 'lucide-react';

interface Props {
  onApplyClick: () => void;
  onCancelClick?: () => void;
  activeProtection: boolean;
  protectionRemaining: number;
}

// Reusable SunscreenTracker component.
export function SunscreenTracker({ onApplyClick, onCancelClick, activeProtection, protectionRemaining }: Props) {
  const isProtected = activeProtection;
  const isExpired = !activeProtection;

  // Format remaining time
  const formatRemaining = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${String(m).padStart(2, '0')}m remaining`;
  };

  // Calculate progress (assuming 2h max = 120 mins)
  const MAX_MINS = 120;
  const progress = isProtected ? (protectionRemaining / MAX_MINS) * 100 : 0;

  // Determine UI colors based on status
  let statusColor = '#94A3B8'; // default grey
  let statusBg = '#F1F5F9';
  let statusText = 'No Sunscreen Applied';
  let statusIconColor = '#64748B';
  let progressColor = '#E2E8F0';

  if (isProtected) {
    statusColor = '#22C55E';
    statusBg = '#F0FDF4';
    statusText = 'Protected';
    statusIconColor = '#16A34A';
    
    if (progress > 50) {
      progressColor = '#22C55E'; // Green
    } else if (progress > 15) {
      progressColor = '#F59E0B'; // Amber/Orange
    } else {
      progressColor = '#EF4444'; // Red
    }
  } else if (isExpired) {
    statusColor = '#EF4444';
    statusBg = '#FEF2F2';
    statusText = 'Protection Expired or None';
    statusIconColor = '#DC2626';
  }

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm" style={{ border: '1px solid #E8F0FE' }}>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <span className="text-xl">🧴</span>
          <h3 className="text-slate-800 font-semibold tracking-tight" style={{ fontSize: '0.95rem' }}>
            Sunscreen Tracker
          </h3>
        </div>
        <div 
          className="px-2.5 py-1 rounded-lg flex items-center gap-1.5"
          style={{ background: statusBg, border: `1px solid ${statusBg}` }}
        >
          {isProtected && <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse block" />}
          {isExpired && <span className="w-1.5 h-1.5 rounded-full bg-red-500 block" />}
          <span style={{ color: statusIconColor, fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.02em' }}>
            {statusText}
          </span>
        </div>
      </div>

      <p className="text-slate-400 mb-5" style={{ fontSize: '0.75rem', lineHeight: 1.4 }}>
        Track your sunscreen application and protection status.
      </p>

      {/* Progress Bar Area */}
      <div className="mb-5">
        <div className="flex justify-between text-slate-600 mb-2 font-medium" style={{ fontSize: '0.75rem' }}>
          <span>Time Remaining</span>
          <span>
            {isProtected ? formatRemaining(protectionRemaining) : 'Not Active'}
          </span>
        </div>
        <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
          <div 
            className="h-full rounded-full transition-all duration-1000 ease-linear"
            style={{ width: `${progress}%`, background: progressColor }}
          />
        </div>
        <div className="mt-2 text-slate-400 font-medium" style={{ fontSize: '0.7rem' }}>
          {isProtected ? 'Reapply when timer runs out.' : 'Apply sunscreen for protection.'}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        {isProtected && onCancelClick && (
          <button
            onClick={onCancelClick}
            className="flex-shrink-0 flex items-center justify-center px-4 py-3 rounded-xl transition-colors shadow-sm"
            style={{ background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA' }}
            title="Cancel Application"
          >
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Cancel</span>
          </button>
        )}
        <button
          onClick={onApplyClick}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-colors shadow-sm"
          style={{
            background: isProtected ? '#F8FAFF' : '#2563EB',
            color: isProtected ? '#2563EB' : '#fff',
            border: isProtected ? '1px solid #BFDBFE' : 'none',
            fontSize: '0.85rem'
          }}
        >
          <Plus size={16} />
          {isProtected ? 'Reapply Sunscreen' : 'Apply Sunscreen'}
        </button>
      </div>
    </div>
  );
}
