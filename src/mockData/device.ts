import type { DeviceInfo, BatteryInfo, WifiInfo, SystemInfo, SensorHealth } from '../types/device';

export const MOCK_DEVICE = {
  info: {
    model: 'UV Shield Pro (UVK-2001)',
    serialNumber: 'UV24-8842-XK',
    uptime: '14h 22m',
    readingsToday: '1,440',
    accuracy: '±0.2 UV',
    range: '0–20 UV'
  },
  battery: {
    level: 82,
    type: 'Li-Po 380 mAh',
    charging: 'Not connected',
    cycles: '142 / 500'
  },
  wifi: {
    bars: 3 as const,
    ssid: 'HomeNetwork_5G',
    ip: '192.168.1.142',
    mac: 'A4:C1:38:22:90:F1'
  },
  system: {
    firmware: 'v2.1.4 (Stable)',
    hardwareRev: 'Rev B.2',
    lastUpdate: '14 days ago'
  },
  sensors: {
    ml8511: { ok: true, val: 'Normal (1.2V)' },
    thermometer: { ok: true, val: '24.2°C' },
    cpu: { ok: false, val: 'High (68°C)' }
  }
};
