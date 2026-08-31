/**
 * ---------------------------------------------------------
 * File: SettingsPage.tsx
 * Purpose:
 * React page component for SettingsPage.
 * ---------------------------------------------------------
 */

import { useState, useEffect, useRef } from 'react';
import { ChevronRight, Check, Sliders, Volume2, Mail, Smartphone as SmartphoneIcon, Bell, ShieldAlert, Zap, TrendingUp, Flame, Droplets } from 'lucide-react';
import { settingsService } from '../services/settings.service';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';

// ─── Toggle switch ────────────────────────────────────────────────────────────
function Toggle({ on, onChange, disabled }: { on: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      onClick={() => { if (!disabled) onChange(!on); }}
      role="switch"
      aria-checked={on}
      disabled={disabled}
      style={{
        position: 'relative',
        display: 'inline-flex',
        flexShrink: 0,
        width: 48,
        height: 26,
        borderRadius: 999,
        border: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        padding: 0,
        outline: 'none',
        background: on ? '#2563EB' : '#CBD5E1',
        transition: 'background-color 0.3s ease',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: 3,
          left: 3,
          width: 20,
          height: 20,
          borderRadius: '50%',
          background: '#ffffff',
          boxShadow: '0 2px 4px rgba(0,0,0,0.25)',
          transform: on ? 'translateX(22px)' : 'translateX(0px)',
          transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
          willChange: 'transform',
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
  icon: Icon, iconBg, iconColor, label, sub, on, onChange, disabled
}: {
  icon: React.ElementType; iconBg: string; iconColor: string;
  label: string; sub?: string; on: boolean; onChange: (v: boolean) => void; disabled?: boolean;
}) {
  return (
    <div 
      className="flex items-center gap-3 px-5 py-4" 
      style={{ 
        borderBottom: '1px solid #F8FAFF',
        opacity: disabled ? 0.6 : 1,
        transition: 'opacity 0.2s ease'
      }}
    >
      <div className="rounded-xl p-2.5 flex-shrink-0" style={{ background: iconBg }}>
        <Icon size={14} style={{ color: iconColor }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-slate-700 font-medium" style={{ fontSize: '0.82rem' }}>{label}</div>
        {sub && <div className="text-slate-400 mt-0.5" style={{ fontSize: '0.7rem' }}>{sub}</div>}
      </div>
      <Toggle on={on} onChange={onChange} disabled={disabled} />
    </div>
  );
}

// SettingsPage page shown to the user.
export function SettingsPage() {
  const [threshold, setThreshold] = useState(6);
  const [saved, setSaved] = useState(false);
  
  const [smartAlertsEnabled, setSmartAlertsEnabled] = useState(true);
  const [smartAlertPreferences, setSmartAlertPreferences] = useState({
    highRisk: true,
    extremeUv: true,
    rapidUvIncrease: true,
    burnWarning: true,
    reapplySunscreen: true,
  });

  const [notifs, setNotifs] = useState({
    emailNotifications: true,
    pushNotifications: true,
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
        if (settingsData.alertThreshold != null) setThreshold(settingsData.alertThreshold);
        setNotifs({
          emailNotifications: settingsData.emailNotifications ?? true,
          pushNotifications: settingsData.pushNotifications ?? true
        });
        setSmartAlertsEnabled(settingsData.smartAlertsEnabled ?? true);
        if (settingsData.smartAlertPreferences) {
          setSmartAlertPreferences(settingsData.smartAlertPreferences);
        }
        setAbout(aboutData);
        setLoading(false);
        setTimeout(() => { initialLoadDone.current = true; }, 100);
      })
      .catch(() => setError(true));
  }, []);

  const initialLoadDone = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!initialLoadDone.current) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    
    timeoutRef.current = setTimeout(() => {
      settingsService.updateSettings({
        alertThreshold: threshold,
        smartAlertsEnabled,
        smartAlertPreferences,
        ...notifs
      }).then(() => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }).catch(() => setError(true));
    }, 600);
  }, [threshold, smartAlertsEnabled, smartAlertPreferences, notifs]);

  const toggleNotif = (key: keyof typeof notifs) => setNotifs(n => ({ ...n, [key]: !n[key] }));
  const toggleSmartAlertPref = (key: keyof typeof smartAlertPreferences) => setSmartAlertPreferences(p => ({ ...p, [key]: !p[key] }));

  const handleSave = () => {
    settingsService.updateSettings({
      alertThreshold: threshold,
      smartAlertsEnabled,
      smartAlertPreferences,
      ...notifs
    }).then(() => {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }).catch(() => setError(true));
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

      {/* Smart Alerts */}
      <Section title="Smart Alerts" subtitle="Choose which personalized UV alerts you want to receive.">
        <NotifRow 
          icon={Bell} iconBg="#F3F4F6" iconColor="#4B5563" 
          label="Smart Alerts" 
          sub="Master toggle for all automatic UV alerts" 
          on={smartAlertsEnabled} 
          onChange={setSmartAlertsEnabled} 
        />
        
        <div style={{ paddingLeft: '1rem' }}>
          <NotifRow 
            icon={ShieldAlert} iconBg="#FEFCE8" iconColor="#CA8A04" 
            label="High Risk UV" 
            on={smartAlertPreferences.highRisk} 
            onChange={() => toggleSmartAlertPref('highRisk')} 
            disabled={!smartAlertsEnabled}
          />
          <NotifRow 
            icon={Zap} iconBg="#FAF5FF" iconColor="#9333EA" 
            label="Extreme UV" 
            on={smartAlertPreferences.extremeUv} 
            onChange={() => toggleSmartAlertPref('extremeUv')} 
            disabled={!smartAlertsEnabled}
          />
          <NotifRow 
            icon={TrendingUp} iconBg="#FEF2F2" iconColor="#DC2626" 
            label="Rapid UV Increase" 
            on={smartAlertPreferences.rapidUvIncrease} 
            onChange={() => toggleSmartAlertPref('rapidUvIncrease')} 
            disabled={!smartAlertsEnabled}
          />
          <NotifRow 
            icon={Flame} iconBg="#FFF7ED" iconColor="#EA580C" 
            label="Burn Warning" 
            on={smartAlertPreferences.burnWarning} 
            onChange={() => toggleSmartAlertPref('burnWarning')} 
            disabled={!smartAlertsEnabled}
          />
          <NotifRow 
            icon={Droplets} iconBg="#F0FDF4" iconColor="#16A34A" 
            label="Sunscreen Reapplication" 
            on={smartAlertPreferences.reapplySunscreen} 
            onChange={() => toggleSmartAlertPref('reapplySunscreen')} 
            disabled={!smartAlertsEnabled}
          />
        </div>
      </Section>

      {/* Notifications */}
      <Section title="Notification Delivery" subtitle="Choose how you receive alerts">
        <NotifRow icon={Mail} iconBg="#EFF6FF" iconColor="#2563EB" label="Email Notifications" sub="Receive critical alerts via email" on={notifs.emailNotifications} onChange={() => toggleNotif('emailNotifications')} />
        <NotifRow icon={SmartphoneIcon} iconBg="#F0FDF4" iconColor="#16A34A" label="Push Notifications" sub="Receive real-time alerts on your device" on={notifs.pushNotifications} onChange={() => toggleNotif('pushNotifications')} />
      </Section>

      {/* About */}
      <div
        className="rounded-2xl p-4 text-center"
        style={{ background: '#F8FAFF', border: '1px solid #E8F0FE' }}
      >
        <div className="text-slate-400 space-y-1" style={{ fontSize: '0.72rem' }}>
          <div>SunSense {about?.appVersion} · Build {about?.build} · Firmware {about?.firmware}</div>
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
