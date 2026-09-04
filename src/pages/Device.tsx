/**
 * ---------------------------------------------------------
 * File: Device.tsx
 * Purpose:
 * React page component for Device.
 * ---------------------------------------------------------
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSocketEvent } from '../hooks/useSocketEvent';
import { socket } from '../lib/socketClient';
import {
  Battery, Wifi, Cpu, Clock, Zap, Activity, RefreshCw,
  CheckCircle, AlertCircle, Smartphone, AlertTriangle, CheckCircle2,
} from 'lucide-react';
import { deviceService, DeviceData } from '../services/device.service';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';

// ─── Battery visual ───────────────────────────────────────────────────────────
function BatteryVisual({ pct }: { pct: number | null }) {
  if (pct === null) {
    return (
      <div className="flex items-center gap-3 mt-3">
        <div className="font-bold text-slate-400" style={{ fontSize: '1.2rem' }}>Not Available</div>
      </div>
    );
  }
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
          {pct > 50 ? 'Healthy' : pct > 20 ? 'Low — consider charging' : 'Critical!'}
        </div>
      </div>
    </div>
  );
}

// ─── Wi-Fi bars ───────────────────────────────────────────────────────────────
function WifiStrength({ isOnline }: { isOnline: boolean }) {
  if (!isOnline) {
    return (
      <div className="flex items-end gap-1 mt-3">
        <div>
          <span className="font-bold text-slate-800" style={{ fontSize: '1.3rem' }}>Offline</span>
        </div>
      </div>
    );
  }
  return (
    <div className="flex items-end gap-1 mt-3">
      <div className="flex items-end gap-0.5 mr-2">
        {[1, 2, 3, 4].map(b => (
          <div
            key={b}
            className="w-3 rounded-sm transition-all"
            style={{
              height: b * 6,
              background: '#3B82F6',
            }}
          />
        ))}
      </div>
      <div>
        <span className="font-bold text-slate-800" style={{ fontSize: '1.3rem' }}>Connected</span>
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
// Device page shown to the user.
export function Device() {
  const [deviceData, setDeviceData] = useState<DeviceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [error, setError] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [pairing, setPairing] = useState(false);
  const [credentials, setCredentials] = useState<{deviceId: string, apiKey: string} | null>(null);

  const isMounted = useRef(true);
  const fetchTimeout = useRef<NodeJS.Timeout | null>(null);

  const fetchDevice = useCallback(async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    try {
      const data = await deviceService.getDeviceData();
      if (!isMounted.current) return;
      setDeviceData(data);
      if (!isBackground) setLoading(false);
    } catch (err: any) {
      if (!isMounted.current) return;
      if (!isBackground) {
        setErrorMsg(err.message || 'Unknown error');
        setError(true);
        setLoading(false);
      }
    }
  }, []);

  const debouncedRefetch = useCallback(() => {
    if (fetchTimeout.current) clearTimeout(fetchTimeout.current);
    fetchTimeout.current = setTimeout(() => {
      if (isMounted.current) fetchDevice(true);
    }, 500);
  }, [fetchDevice]);

  useSocketEvent('device:status', () => {
    debouncedRefetch();
  });

  useEffect(() => {
    isMounted.current = true;
    fetchDevice(false);
    
    return () => {
      isMounted.current = false;
      if (fetchTimeout.current) clearTimeout(fetchTimeout.current);
    };
  }, [fetchDevice]);

  useEffect(() => {
    const handleReconnect = () => debouncedRefetch();
    socket.io.on('reconnect', handleReconnect);
    return () => {
      socket.io.off('reconnect', handleReconnect);
    };
  }, [debouncedRefetch]);

  const handleSync = async () => {
    setSyncing(true);
    await deviceService.syncDevice();
    setSyncing(false);
  };

  if (loading) return <LoadingState />;
  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] w-full text-slate-500">
      <AlertTriangle size={48} className="mb-4 text-red-400" />
      <h2 className="text-xl font-semibold text-slate-700">Failed to load</h2>
      <p className="mt-2 text-sm text-center max-w-sm mb-6 text-red-500">{errorMsg}</p>
      <button onClick={() => window.location.reload()} className="px-4 py-2 bg-blue-500 text-white rounded">Try Again</button>
    </div>
  );

  const handlePairDevice = async () => {
    setPairing(true);
    try {
      const creds = await deviceService.registerDevice();
      setCredentials(creds);
      debouncedRefetch(); // fetch the newly created device
    } catch (err) {
      alert("Failed to pair device");
    } finally {
      setPairing(false);
    }
  };

  if (!deviceData && !credentials) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] w-full text-slate-500">
        <Smartphone size={48} className="mb-4 text-slate-300" />
        <h2 className="text-xl font-semibold text-slate-700">No Device Paired</h2>
        <p className="mt-2 text-sm text-center max-w-sm mb-6">
          You haven't paired a SunSense device with your account yet. 
          Please pair a device to view its status.
        </p>
        <button
          onClick={handlePairDevice}
          disabled={pairing}
          className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2 shadow-md shadow-blue-500/20"
        >
          {pairing ? <RefreshCw size={18} className="animate-spin" /> : <Smartphone size={18} />}
          {pairing ? 'Pairing...' : 'Pair New Device'}
        </button>
      </div>
    );
  }

  if (credentials) {
    return (
      <div className="p-5 md:p-6 max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={32} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Device Paired Successfully!</h2>
          <p className="text-slate-500 mb-8">
            Please copy these credentials into your ESP8266 `firmware_config.h` file before flashing.
            You will only see the API Key once!
          </p>
          
          <div className="text-left space-y-4 mb-8">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">DEVICE_ID</label>
              <code className="block w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-sm break-all font-mono">
                {credentials.deviceId}
              </code>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">DEVICE_API_KEY</label>
              <code className="block w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-sm break-all font-mono">
                {credentials.apiKey}
              </code>
            </div>
          </div>
          
          <button
            onClick={() => setCredentials(null)}
            className="w-full py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors"
          >
            I have copied the credentials
          </button>
        </div>
      </div>
    );
  }

  const isOnline = deviceData.lastPing ? (new Date().getTime() - new Date(deviceData.lastPing).getTime()) < 300000 : false;

  return (
    <div className="p-5 md:p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
        <div>
          <h1 className="text-slate-800 font-semibold" style={{ fontSize: '1.2rem' }}>Device</h1>
          <p className="text-slate-400 mt-0.5" style={{ fontSize: '0.8rem' }}>SunSense S12SD</p>
        </div>
        <button
          onClick={handleSync}
          className="flex items-center gap-2 rounded-xl px-4 py-2 shadow-sm transition-all flex-shrink-0"
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
                <div className="font-bold" style={{ fontSize: '1.05rem' }}>{deviceData.name}</div>
                <div style={{ color: '#93C5FD', fontSize: '0.75rem' }}>SunSense S12SD</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isOnline ? (
                <>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-green-400" />
                  </span>
                  <span style={{ color: '#4ADE80', fontSize: '0.8rem', fontWeight: 600 }}>Connected</span>
                </>
              ) : (
                <>
                  <span className="relative flex h-2 w-2">
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-red-400" />
                  </span>
                  <span style={{ color: '#F87171', fontSize: '0.8rem', fontWeight: 600 }}>Offline</span>
                </>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-x-8 gap-y-2">
            {[
              { label: 'Accuracy', value: '±0.1 UVI' },
              { label: 'Range', value: '0–15 UVI' },
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
          <BatteryVisual pct={deviceData.batteryLevel} />
        </div>

        {/* Wi-Fi */}
        <div className="bg-white rounded-2xl p-5 shadow-sm" style={{ border: '1px solid #E8F0FE' }}>
          <div className="flex items-center gap-2 mb-1">
            <div className="rounded-xl p-2.5" style={{ background: '#EFF6FF' }}>
              <Wifi size={15} style={{ color: '#2563EB' }} />
            </div>
            <span className="font-semibold text-slate-600" style={{ fontSize: '0.8rem' }}>Wi-Fi Status</span>
          </div>
          <WifiStrength isOnline={isOnline} />
          <div className="mt-3 pt-3" style={{ borderTop: '1px solid #F1F5F9' }}>
            <InfoRow label="SSID" value={deviceData.wifiSsid || 'N/A'} />
            <InfoRow label="IP Address" value={deviceData.ipAddress || 'N/A'} />
          </div>
        </div>

        {/* Last Sync */}
        <div className="bg-white rounded-2xl p-5 shadow-sm" style={{ border: '1px solid #E8F0FE' }}>
          <div className="flex items-center gap-2 mb-1">
            <div className="rounded-xl p-2.5" style={{ background: '#FFFBEB' }}>
              <Clock size={15} style={{ color: '#D97706' }} />
            </div>
            <span className="font-semibold text-slate-600" style={{ fontSize: '0.8rem' }}>Last Ping</span>
          </div>
          <div className="mt-3">
            <div className="font-bold text-slate-800" style={{ fontSize: '1.3rem' }}>
              {deviceData.lastPing ? new Date(deviceData.lastPing).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Unknown'}
            </div>
            <div className="text-slate-400" style={{ fontSize: '0.72rem' }}>
              {deviceData.lastPing ? new Date(deviceData.lastPing).toLocaleDateString() : 'No recent sync'}
            </div>
          </div>
        </div>
      </div>

      {/* Firmware + Sensor health */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">

        {/* Sensor health */}
        <div className="bg-white rounded-2xl p-5 shadow-sm" style={{ border: '1px solid #E8F0FE' }}>
          <div className="flex items-center gap-2 mb-3">
            <div className="rounded-xl p-2.5" style={{ background: '#FAF5FF' }}>
              <Activity size={15} style={{ color: '#9333EA' }} />
            </div>
            <span className="font-semibold text-slate-600" style={{ fontSize: '0.8rem' }}>Sensor Health</span>
            <span className="ml-auto rounded-full px-2.5 py-1 font-semibold" style={{ background: '#DCFCE7', color: '#16A34A', fontSize: '0.68rem' }}>Excellent</span>
          </div>
          <SensorRow name="UV Sensor (S12SD)" ok={true} value="Operational" />
          <div className="flex items-center justify-between pt-2.5 mt-2" style={{ borderTop: '1px solid #F1F5F9', fontSize: '0.78rem' }}>
            <span className="text-slate-400">Firmware</span>
            <span className="text-slate-700 font-medium">{deviceData.firmwareVersion || 'Unknown'}</span>
          </div>
        </div>
      </div>

    </div>
  );
}
