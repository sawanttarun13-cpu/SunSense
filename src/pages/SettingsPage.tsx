import { useState, useEffect } from 'react';
import { Bell, Sun, Smartphone, Shield, Moon, Bluetooth, ChevronRight, Check, Sliders, Wifi, Volume2 } from 'lucide-react';
import { SPF_OPTS, THEME_OPTS } from '../constants/settings';
import { settingsService } from '../services/settings.service';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';

// ─── Toggle switch ────────────────────────────────────────────────────────────
function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!on)}
      className="relative flex-shrink-0 rounded-full transition-colors duration-200 focus:outline-none"
      style={{ width: 44, height: 24, background: on ? '#2563EB' : '#CBD5E1' }}
      role="switch"
      aria-checked={on}
    >
      <span
        className="absolute rounded-full bg-white shadow-sm transition-transform duration-200"
        style={{
          top: 3, width: 18, height: 18,
          transform: on ? 'translateX(23px)' : 'translateX(3px)',
        }}
      />
    </button>
  );
}

// ─── Section wrapper ──────────────────────────────────────────────────────────
function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-4" style={{ border: '1px solid #E8F0FE' }}>
      <div className="px-5 py-4" style={{ borderBottom: '1px solid #F1F5F9', background: '#FAFCFF' }}>
        <div className="font-semibold text-slate-700" style={{ fontSize: '0.85rem' }}>{title}</div>
        {subtitle && <div className="text-slate-400 mt-0.5" style={{ fontSize: '0.72rem' }}>{subtitle}</div>}
      </div>
      {children}
    </div>
  );
}

// ─── Notification row ─────────────────────────────────────────────────────────
function NotifRow({
  icon: Icon, iconBg, iconColor, label, sub, on, onChange,
}: {
  icon: React.ElementType; iconBg: string; iconColor: string;
  label: string; sub: string; on: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: '1px solid #F8FAFF' }}>
      <div className="rounded-xl p-2.5 flex-shrink-0" style={{ background: iconBg }}>
        <Icon size={14} style={{ color: iconColor }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-slate-700 font-medium" style={{ fontSize: '0.82rem' }}>{label}</div>
        <div className="text-slate-400 mt-0.5" style={{ fontSize: '0.7rem' }}>{sub}</div>
      </div>
      <Toggle on={on} onChange={onChange} />
    </div>
  );
}

// SPF_OPTS and THEME_OPTS imported from constants/settings

export function SettingsPage() {
  const [spf, setSpf] = useState(30);
  const [threshold, setThreshold] = useState(6);
  const [theme, setTheme] = useState('Light');
  const [saved, setSaved] = useState(false);
  const [notifs, setNotifs] = useState({
    extreme: true, high: true, spfReminder: true,
    dailySummary: false, batteryLow: true, disconnect: true, sound: true,
  });
  const [about, setAbout] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    Promise.all([
      settingsService.getSettings(),
      settingsService.getAbout()
    ])
      .then(([settingsData, aboutData]) => {
        setSpf(settingsData.spfLevel);
        setThreshold(settingsData.uvThreshold);
        setTheme(settingsData.theme);
        setNotifs(settingsData.notifications);
        setAbout(aboutData);
        setLoading(false);
      })
      .catch(() => setError(true));
  }, []);

  const toggle = (key: keyof typeof notifs) => setNotifs(n => ({ ...n, [key]: !n[key] }));

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const thresholdZone = threshold <= 2 ? { color: '#16A34A', bg: '#F0FDF4' }
    : threshold <= 5 ? { color: '#CA8A04', bg: '#FEFCE8' }
    : threshold <= 7 ? { color: '#EA580C', bg: '#FFF7ED' }
    : threshold <= 10 ? { color: '#DC2626', bg: '#FEF2F2' }
    : { color: '#9333EA', bg: '#FAF5FF' };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState onRetry={() => window.location.reload()} />;

  return (
    <div className="p-5 md:p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-slate-800 font-semibold" style={{ fontSize: '1.2rem' }}>Settings</h1>
          <p className="text-slate-400 mt-0.5" style={{ fontSize: '0.8rem' }}>Configure your UV monitoring preferences</p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 rounded-xl px-4 py-2 shadow-sm transition-all"
          style={{
            background: saved ? '#22C55E' : '#2563EB',
            color: '#fff', fontSize: '0.8rem', fontWeight: 600,
          }}
        >
          {saved ? <><Check size={14} /> Saved!</> : 'Save Changes'}
        </button>
      </div>

      {/* UV Protection */}
      <Section title="UV Protection Thresholds" subtitle="Control when alerts are triggered">
        <div className="px-5 py-5 space-y-5">
          {/* SPF selector */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sun size={14} style={{ color: '#EA580C' }} />
              <span className="font-medium text-slate-700" style={{ fontSize: '0.82rem' }}>Recommended SPF Level</span>
            </div>
            <div className="flex gap-2">
              {SPF_OPTS.map(v => (
                <button
                  key={v}
                  onClick={() => setSpf(v)}
                  className="flex-1 py-2.5 rounded-xl font-semibold transition-all"
                  style={{
                    fontSize: '0.82rem',
                    background: spf === v ? '#2563EB' : '#F8FAFF',
                    color: spf === v ? '#fff' : '#94A3B8',
                    border: `1.5px solid ${spf === v ? '#2563EB' : '#E2E8F0'}`,
                    boxShadow: spf === v ? '0 2px 8px rgba(37,99,235,0.25)' : 'none',
                  }}
                >
                  SPF {v}
                </button>
              ))}
            </div>
            <p className="text-slate-400 mt-2" style={{ fontSize: '0.72rem' }}>
              App will recommend SPF {spf} when UV exceeds the alert threshold below.
            </p>
          </div>

          {/* UV Threshold slider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Sliders size={14} style={{ color: '#3B82F6' }} />
                <span className="font-medium text-slate-700" style={{ fontSize: '0.82rem' }}>Alert Threshold</span>
              </div>
              <span
                className="rounded-full px-2.5 py-0.5 font-bold"
                style={{ fontSize: '0.78rem', background: thresholdZone.bg, color: thresholdZone.color }}
              >
                UV {threshold}
              </span>
            </div>

            {/* Custom styled range */}
            <div className="relative py-2">
              {/* Track gradient */}
              <div className="h-2 rounded-full" style={{
                background: 'linear-gradient(to right, #22C55E 0%, #EAB308 25%, #F97316 50%, #EF4444 75%, #9333EA 100%)',
                opacity: 0.3,
              }} />
              <input
                type="range" min={1} max={12} value={threshold}
                onChange={e => setThreshold(Number(e.target.value))}
                className="absolute inset-0 w-full opacity-0 cursor-pointer"
                style={{ height: '100%' }}
              />
              {/* Filled track */}
              <div
                className="absolute top-2 left-0 h-2 rounded-full"
                style={{ width: `${((threshold - 1) / 11) * 100}%`, background: thresholdZone.color }}
              />
              {/* Thumb */}
              <div
                className="absolute top-0 w-6 h-6 rounded-full bg-white shadow-md -translate-x-1/2"
                style={{
                  left: `${((threshold - 1) / 11) * 100}%`,
                  border: `3px solid ${thresholdZone.color}`,
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  pointerEvents: 'none',
                }}
              />
            </div>

            <div className="flex justify-between mt-1" style={{ fontSize: '0.65rem', color: '#94A3B8' }}>
              <span>1 (Low)</span><span>6 (High)</span><span>11 (Extreme)</span>
            </div>
            <p className="text-slate-400 mt-2" style={{ fontSize: '0.72rem' }}>
              You'll be alerted when UV reaches <strong style={{ color: thresholdZone.color }}>{threshold}</strong> or above.
            </p>
          </div>
        </div>
      </Section>

      {/* Notifications */}
      <Section title="Notification Preferences" subtitle="Choose what alerts you receive">
        <NotifRow icon={Sun} iconBg="#FAF5FF" iconColor="#9333EA" label="Extreme UV Events" sub="Alert when UV index exceeds 11" on={notifs.extreme} onChange={() => toggle('extreme')} />
        <NotifRow icon={Shield} iconBg="#FFF7ED" iconColor="#EA580C" label="High UV Warnings" sub={`Alert when UV exceeds your threshold (UV ${threshold})`} on={notifs.high} onChange={() => toggle('high')} />
        <NotifRow icon={Bell} iconBg="#FEF2F2" iconColor="#DC2626" label="SPF Reapplication" sub="Reminder every 2 hours during high UV" on={notifs.spfReminder} onChange={() => toggle('spfReminder')} />
        <NotifRow icon={Sun} iconBg="#EFF6FF" iconColor="#2563EB" label="Daily UV Summary" sub="Evening report of today's UV data" on={notifs.dailySummary} onChange={() => toggle('dailySummary')} />
        <NotifRow icon={Smartphone} iconBg="#F0FDF4" iconColor="#16A34A" label="Battery Low Alert" sub="When device battery drops below 20%" on={notifs.batteryLow} onChange={() => toggle('batteryLow')} />
        <NotifRow icon={Wifi} iconBg="#FFFBEB" iconColor="#D97706" label="Disconnect Alert" sub="When keychain goes out of range" on={notifs.disconnect} onChange={() => toggle('disconnect')} />
        <div className="flex items-center gap-3 px-5 py-4">
          <div className="rounded-xl p-2.5 flex-shrink-0" style={{ background: '#F8FAFF' }}>
            <Volume2 size={14} style={{ color: '#64748B' }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-slate-700 font-medium" style={{ fontSize: '0.82rem' }}>Sound & Vibration</div>
            <div className="text-slate-400 mt-0.5" style={{ fontSize: '0.7rem' }}>Play alert sounds on device</div>
          </div>
          <Toggle on={notifs.sound} onChange={() => toggle('sound')} />
        </div>
      </Section>

      {/* Appearance */}
      <Section title="Appearance">
        <div className="px-5 py-4 flex items-center gap-3">
          <div className="rounded-xl p-2.5 flex-shrink-0" style={{ background: '#F1F5F9' }}>
            <Moon size={14} className="text-slate-500" />
          </div>
          <div className="flex-1">
            <div className="text-slate-700 font-medium" style={{ fontSize: '0.82rem' }}>Interface Theme</div>
            <div className="text-slate-400 mt-0.5" style={{ fontSize: '0.7rem' }}>Affects dashboard appearance</div>
          </div>
          <div className="flex rounded-xl overflow-hidden" style={{ border: '1px solid #E2E8F0' }}>
            {THEME_OPTS.map(t => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className="px-3.5 py-1.5 transition-colors"
                style={{
                  fontSize: '0.75rem', fontWeight: 500,
                  background: theme === t ? '#2563EB' : '#fff',
                  color: theme === t ? '#fff' : '#64748B',
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </Section>


      {/* About */}
      <div
        className="rounded-2xl p-4 text-center"
        style={{ background: '#F8FAFF', border: '1px solid #E8F0FE' }}
      >
        <div className="text-slate-400 space-y-1" style={{ fontSize: '0.72rem' }}>
          <div>UV Shield App {about?.appVersion} · Build {about?.build} · Firmware {about?.firmware}</div>
          <div className="flex justify-center gap-5 mt-2">
            {['Privacy Policy', 'Terms of Use', 'Support', 'Licenses'].map(l => (
              <button key={l} className="text-blue-500 hover:underline">{l}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
