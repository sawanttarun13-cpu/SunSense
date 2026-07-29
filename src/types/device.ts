export interface DeviceInfo {
  model: string;
  serialNumber: string;
  uptime: string;
  readingsToday: string;
  accuracy: string;
  range: string;
}

export interface BatteryInfo {
  level: number; // percentage
  type: string;
  charging: string;
  cycles: string;
}

export interface WifiInfo {
  bars: 1 | 2 | 3 | 4;
  ssid: string;
  ip: string;
  mac: string;
}

export interface SystemInfo {
  firmware: string;
  hardwareRev: string;
  lastUpdate: string;
}

export interface SensorHealth {
  ml8511: { ok: boolean; val: string };
  thermometer: { ok: boolean; val: string };
  cpu: { ok: boolean; val: string };
}
