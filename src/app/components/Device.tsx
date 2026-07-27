import { useState } from 'react';
import {
  Battery, Wifi, Cpu, Clock, Zap, Activity, RefreshCw,
  CheckCircle, AlertCircle, Shield, Thermometer, Radio,
} from 'lucide-react';

// ─── Battery visual ───────────────────────────────────────────────────────────
function BatteryVisual({ pct }: { pct: number }) {
  const color = pct > 50 ? '#22C55E' : pct > 20 ? '#EAB308' : '#EF4444';
  return (
    <div className="flex items-center gap-3 mt-3">
      {/* Battery icon */}
      <div className="relative flex items-center" style={{ width: 52, height: 26 }}>
        <div className="w-12 h-6 rounded-md flex-shrink-0" style={{ border: `2px solid ${color}`, position: 'relative' }}>
          <div
            className="absolute inset-0.5 rounded-sm transition-all duration-700"
            style={{ width: `${pct}%`, background: color, borderRadius: 2 }}
          />
        </div>
        <div className="w-1.5 h-3 rounded-r-sm flex-shrink-0" style={{ background: color, marginLeft: 1 }} />
      </div>
      <div>
        <span className="font-bold" style={{ color, fontSize: '1.5rem' }}>{pct}%</span>
        <div className="text-slate-400" style={{ fontSize: '0.7rem' }}>
          {pct > 50 ? '~' + Math.round(pct / 6) + 'h remaining' : pct > 20 ? 'Low — consider charging' : 'Critical!'}
        </div>
      </div>
    </div>
  );
}

// ─── Wi-Fi bars ───────────────────────────────────────────────────────────────
function WifiStrength({ bars }: { bars: 1 | 2 | 3 | 4 }) {
  const labels = ['', 'Weak', 'Fair', 'Good', 'Excellent'];
  return (
    <div className="flex items-end gap-1 mt-3">
      <div className="flex items-end gap-0.5 mr-2">
        {[1, 2, 3, 4].map(b => (
          <div
            key={b}
            className="w-3 rounded-sm transition-all"
            style={{
              height: b * 6,
              background: b <= bars ? '#3B82F6' : '#E2E8F0',
            }}
          />
        ))}
      </div>
      <div>
        <span className="font-bold text-slate-800" style={{ fontSize: '1.3rem' }}>{labels[bars]}</span>
        <div className="text-slate-400" style={{ fontSize: '0.7rem' }}>-65 dBm · 5 GHz</div>
      </div>
    </div>
  );
}

// ─── Info block ───────────────────────────────────────────────────────────────
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2.5" style={{ borderBottom: '1px solid #F1F5F9' }}>
      <span className="text-slate-400" style={{ fontSize: '0.78rem' }}>{label}</span>
      <span className="text-slate-700 font-medium" style={{ fontSize: '0.78rem' }}>{value}</span>
    </div>
  );
}

// ─── Sensor health row ────────────────────────────────────────────────────────
function SensorRow({ name, ok, value }: { name: string; ok: boolean; value: string }) {
  return (
    <div className="flex items-center gap-3 py-2.5" style={{ borderBottom: '1px solid #F1F5F9' }}>
      {ok
        ? <CheckCircle size={15} style={{ color: '#22C55E', flexShrink: 0 }} />
        : <AlertCircle size={15} style={{ color: '#EF4444', flexShrink: 0 }} />
      }
      <span className="flex-1 text-slate-600" style={{ fontSize: '0.8rem' }}>{name}</span>
      <span className={`font-medium`} style={{ fontSize: '0.75rem', color: ok ? '#16A34A' : '#DC2626' }}>{value}</span>
    </div>
  );
}

// ─── Resource bar ─────────────────────────────────────────────────────────────
function ResourceBar({ label, pct, color }: { label: string; pct: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between mb-1.5" style={{ fontSize: '0.72rem' }}>
        <span className="text-slate-500">{label}</span>
        <span className="text-slate-700 font-semibold">{pct}%</span>
      </div>
      <div className="h-1.5 rounded-full" style={{ background: '#F1F5F9' }}>
        <div className="h-1.5 rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

// ─── Device page ──────────────────────────────────────────────────────────────
export function Device() {
  const [syncing, setSyncing] = useState(false);

  const handleSync = () => {
    setSyncing(true);
    setTimeout(() => setSyncing(false), 2200);
  };

  return (
    <div className="p-5 md:p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-slate-800 font-semibold" style={{ fontSize: '1.2rem' }}>Device</h1>
          <p className="text-slate-400 mt-0.5" style={{ fontSize: '0.8rem' }}>UV Shield Keychain · UVK-2001</p>
        </div>
        <button
          onClick={handleSync}
          className="flex items-center gap-2 rounded-xl px-4 py-2 shadow-sm transition-all"
          style={{ background: '#fff', border: '1px solid #E2E8F0', fontSize: '0.8rem', fontWeight: 500, color: '#374151' }}
          onMouseEnter={e => (e.currentTarget.style.background = '#F8FAFF')}
          onMouseLeave={e => (e.currentTarget.style.background = '#fff')}
        >
          <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} style={{ color: syncing ? '#2563EB' : '#64748B' }} />
          {syncing ? 'Syncing…' : 'Sync Now'}
        </button>
      </div>

      {/* Device hero banner */}
      <div
        className="rounded-2xl p-6 mb-5 text-white relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1E3A8A 0%, #1D4ED8 50%, #0F172A 100%)' }}
      >
        {/* Decorative blobs */}
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full opacity-10" style={{ background: '#60A5FA' }} />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full opacity-10" style={{ background: '#93C5FD' }} />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.15)' }}>
                <Cpu size={22} />
              </div>
              <div>
                <div className="font-bold" style={{ fontSize: '1.05rem' }}>UV Shield Pro</div>
                <div style={{ color: '#93C5FD', fontSize: '0.75rem' }}>Model UVK-2001 · S/N: UV24-8842-XK</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-400" />
              </span>
              <span style={{ color: '#4ADE80', fontSize: '0.8rem', fontWeight: 600 }}>Connected & Recording</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-x-8 gap-y-2">
            {[
              { label: 'Uptime', value: '14h 22m' },
              { label: 'Readings Today', value: '1,440' },
              { label: 'Accuracy', value: '±0.2 UV' },
              { label: 'Range', value: '0–20 UV' },
            ].map(({ label, value }) => (
              <div key={label}>
                <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.68rem' }}>{label}</div>
                <div className="font-bold" style={{ fontSize: '1.05rem' }}>{value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Grid of device cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
        {/* Battery */}
        <div className="bg-white rounded-2xl p-5 shadow-sm" style={{ border: '1px solid #E8F0FE' }}>
          <div className="flex items-center gap-2 mb-1">
            <div className="rounded-xl p-2.5" style={{ background: '#F0FDF4' }}>
              <Battery size={15} style={{ color: '#16A34A' }} />
            </div>
            <span className="font-semibold text-slate-600" style={{ fontSize: '0.8rem' }}>Battery Level</span>
          </div>
          <BatteryVisual pct={82} />
          <div className="mt-3 pt-3" style={{ borderTop: '1px solid #F1F5F9' }}>
            <InfoRow label="Type" value="Li-Po 380 mAh" />
            <InfoRow label="Charging" value="Not connected" />
            <div className="flex items-center justify-between pt-2.5" style={{ fontSize: '0.78rem' }}>
              <span className="text-slate-400">Cycles used</span>
              <span className="text-slate-700 font-medium">142 / 500</span>
            </div>
          </div>
        </div>

        {/* Wi-Fi */}
        <div className="bg-white rounded-2xl p-5 shadow-sm" style={{ border: '1px solid #E8F0FE' }}>
          <div className="flex items-center gap-2 mb-1">
            <div className="rounded-xl p-2.5" style={{ background: '#EFF6FF' }}>
              <Wifi size={15} style={{ color: '#2563EB' }} />
            </div>
            <span className="font-semibold text-slate-600" style={{ fontSize: '0.8rem' }}>Wi-Fi Signal</span>
          </div>
          <WifiStrength bars={3} />
          <div className="mt-3 pt-3" style={{ borderTop: '1px solid #F1F5F9' }}>
            <InfoRow label="SSID" value="HomeNetwork_5G" />
            <InfoRow label="Protocol" value="802.11ac (Wi-Fi 5)" />
            <InfoRow label="IP Address" value="192.168.1.47" />
          </div>
        </div>

        {/* Last Sync */}
        <div className="bg-white rounded-2xl p-5 shadow-sm" style={{ border: '1px solid #E8F0FE' }}>
          <div className="flex items-center gap-2 mb-1">
            <div className="rounded-xl p-2.5" style={{ background: '#FFFBEB' }}>
              <Clock size={15} style={{ color: '#D97706' }} />
            </div>
            <span className="font-semibold text-slate-600" style={{ fontSize: '0.8rem' }}>Last Sync</span>
          </div>
          <div className="mt-3">
            <div className="font-bold text-slate-800" style={{ fontSize: '1.3rem' }}>2 min ago</div>
            <div className="text-slate-400" style={{ fontSize: '0.72rem' }}>Jul 13, 2026 · 3:48 PM</div>
          </div>
          <div className="mt-3 pt-3" style={{ borderTop: '1px solid #F1F5F9' }}>
            <InfoRow label="Sync interval" value="Every 60 sec" />
            <InfoRow label="Data transferred" value="2.4 KB" />
            <InfoRow label="Readings synced" value="1,440 today" />
          </div>
        </div>
      </div>

      {/* Firmware + Sensor health */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        {/* Firmware */}
        <div className="bg-white rounded-2xl p-5 shadow-sm" style={{ border: '1px solid #E8F0FE' }}>
          <div className="flex items-center gap-2 mb-3">
            <div className="rounded-xl p-2.5" style={{ background: '#FFF7ED' }}>
              <Zap size={15} style={{ color: '#EA580C' }} />
            </div>
            <span className="font-semibold text-slate-600" style={{ fontSize: '0.8rem' }}>Firmware</span>
          </div>
          <div className="flex items-center gap-3 mb-3">
            <span className="font-bold text-slate-800" style={{ fontSize: '1.5rem' }}>v2.3.1</span>
            <span className="rounded-full px-2.5 py-1 font-medium" style={{ background: '#DCFCE7', color: '#16A34A', fontSize: '0.7rem' }}>Up to date</span>
          </div>
          <InfoRow label="Hardware rev" value="REV-C" />
          <InfoRow label="Bootloader" value="v1.2.0" />
          <InfoRow label="MCU" value="ESP32-S3 @ 240 MHz" />
          <div className="flex items-center justify-between pt-2.5" style={{ fontSize: '0.78rem' }}>
            <span className="text-slate-400">Last update</span>
            <span className="text-slate-700 font-medium">Jun 28, 2026</span>
          </div>
        </div>

        {/* Sensor health */}
        <div className="bg-white rounded-2xl p-5 shadow-sm" style={{ border: '1px solid #E8F0FE' }}>
          <div className="flex items-center gap-2 mb-3">
            <div className="rounded-xl p-2.5" style={{ background: '#FAF5FF' }}>
              <Activity size={15} style={{ color: '#9333EA' }} />
            </div>
            <span className="font-semibold text-slate-600" style={{ fontSize: '0.8rem' }}>Sensor Health</span>
            <span className="ml-auto rounded-full px-2.5 py-1 font-semibold" style={{ background: '#DCFCE7', color: '#16A34A', fontSize: '0.68rem' }}>Excellent</span>
          </div>
          <SensorRow name="UV-A Sensor (VEML6070)" ok={true} value="Calibrated" />
          <SensorRow name="UV-B Sensor (ML8511)" ok={true} value="Nominal" />
          <SensorRow name="Temperature Probe" ok={true} value="34.2°C" />
          <SensorRow name="Ambient Light Sensor" ok={true} value="Active" />
          <div className="flex items-center justify-between pt-2.5" style={{ fontSize: '0.78rem' }}>
            <span className="text-slate-400">Last calibration</span>
            <span className="text-slate-700 font-medium">Jul 1, 2026</span>
          </div>
        </div>
      </div>

    </div>
  );
}
