import { Shield, Clock, Plus } from 'lucide-react';
import { useSunscreen } from '../../hooks/useSunscreen';

interface Props {
  onApplyClick: () => void;
}

export function SunscreenTracker({ onApplyClick }: Props) {
  const { status, appliedSPF, appliedAt, expiresAt, remainingMs } = useSunscreen();

  const isProtected = status === 'protected';
  const isExpired = status === 'expired';
  const isUnprotected = status === 'unprotected';

  // Format times
  const fmtTime = (d: Date | null) => 
    d ? d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : 'Not Applied';

  // Format remaining time
  const formatRemaining = (ms: number) => {
    const totalMins = Math.floor(ms / 60000);
    const h = Math.floor(totalMins / 60);
    const m = totalMins % 60;
    return `${h}h ${String(m).padStart(2, '0')}m remaining`;
  };

  // Calculate progress (assuming 2h max)
  const MAX_MS = 2 * 60 * 60 * 1000;
  const progress = isProtected ? (remainingMs / MAX_MS) * 100 : 0;

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
    progressColor = '#22C55E';
  } else if (isExpired) {
    statusColor = '#EF4444';
    statusBg = '#FEF2F2';
    statusText = 'Protection Expired';
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

      {/* Grid Stats */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
          <div className="flex items-center gap-1.5 mb-1 text-slate-500">
            <Shield size={12} />
            <span style={{ fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase' }}>Applied SPF</span>
          </div>
          <div className="font-bold text-slate-800" style={{ fontSize: '1.1rem' }}>
            {appliedSPF ? `SPF ${appliedSPF}` : '—'}
          </div>
        </div>
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
          <div className="flex items-center gap-1.5 mb-1 text-slate-500">
            <Clock size={12} />
            <span style={{ fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase' }}>Last Applied</span>
          </div>
          <div className="font-bold text-slate-800" style={{ fontSize: '1.1rem' }}>
            {fmtTime(appliedAt)}
          </div>
        </div>
      </div>

      {/* Progress Bar Area */}
      <div className="mb-5">
        <div className="flex justify-between text-slate-600 mb-2 font-medium" style={{ fontSize: '0.75rem' }}>
          <span>Time Remaining</span>
          <span>
            {isProtected ? formatRemaining(remainingMs) : (isExpired ? 'Expired' : 'Not Started')}
          </span>
        </div>
        <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
          <div 
            className="h-full rounded-full transition-all duration-1000 ease-linear"
            style={{ width: `${progress}%`, background: progressColor }}
          />
        </div>
        <div className="mt-2 text-slate-400 font-medium" style={{ fontSize: '0.7rem' }}>
          Next Reapplication: {isProtected ? fmtTime(expiresAt) : 'Waiting for first application'}
        </div>
      </div>

      {/* Action Button */}
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
  );
}
