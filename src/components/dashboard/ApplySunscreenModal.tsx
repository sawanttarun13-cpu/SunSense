import { useState } from 'react';
import { Shield } from 'lucide-react';

interface Props {
  onClose: () => void;
  onApply: (spf: number, time: Date) => void;
}

export function ApplySunscreenModal({ onClose, onApply }: Props) {
  const [spf, setSpf] = useState<number>(50);
  // Default to current time, formatted for an <input type="time" />
  const now = new Date();
  const defaultTime = now.toTimeString().substring(0, 5);
  const [timeStr, setTimeStr] = useState<string>(defaultTime);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Parse time string back to Date for today
    const applyDate = new Date();
    const [hours, minutes] = timeStr.split(':').map(Number);
    applyDate.setHours(hours, minutes, 0, 0);

    onApply(spf, applyDate);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div 
        className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-xl"
        style={{ animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}
      >
        <div className="p-5 flex items-center gap-3 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
            <Shield size={20} className="text-orange-500" />
          </div>
          <div>
            <h2 className="text-slate-800 font-semibold" style={{ fontSize: '1.05rem' }}>Apply Sunscreen</h2>
            <p className="text-slate-400" style={{ fontSize: '0.75rem' }}>Record your protection.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* SPF Selection */}
          <div>
            <label className="block text-slate-700 font-medium mb-2" style={{ fontSize: '0.8rem' }}>
              Select SPF
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[15, 30, 50, 100].map(v => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setSpf(v)}
                  className="py-2.5 rounded-xl font-semibold transition-all"
                  style={{
                    fontSize: '0.8rem',
                    background: spf === v ? '#2563EB' : '#F8FAFF',
                    color: spf === v ? '#fff' : '#94A3B8',
                    border: `1px solid ${spf === v ? '#2563EB' : '#E2E8F0'}`,
                  }}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* Time Selection */}
          <div>
            <label className="block text-slate-700 font-medium mb-2" style={{ fontSize: '0.8rem' }}>
              Application Time
            </label>
            <input
              type="time"
              required
              value={timeStr}
              onChange={e => setTimeStr(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
              style={{ fontSize: '0.9rem' }}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
              style={{ fontSize: '0.85rem' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm"
              style={{ fontSize: '0.85rem' }}
            >
              Apply
            </button>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
