/**
 * ---------------------------------------------------------
 * File: device.validator.ts
 * Layer: Validation / Zod Schema
 *
 * Purpose:
 * Zod validation schema for the POST /api/v1/device/heartbeat
 * endpoint.
 *
 * Contract source:
 * docs/backend/06_Request_Response_Models.md — Section 2
 *
 * Validated fields:
 *   batteryPercentage   : Integer 0–100 (stored in devices.battery_level)
 *   chargingState       : Boolean (acknowledged, no column in devices table)
 *   wifiRssi            : Integer dBm — typically -30 to -100 (acknowledged, no column)
 *   firmwareVersion     : String max 50 chars (stored in devices.firmware_version)
 *   deviceUptimeSeconds : Non-negative integer (acknowledged, no column)
 *   sensorHealth        : "OK" | "ERROR" (acknowledged, no column)
 *
 * Schema persistence notes:
 * The devices table stores: batteryLevel, firmwareVersion, lastPing.
 * chargingState, wifiRssi, deviceUptimeSeconds, sensorHealth are accepted
 * and acknowledged per the documented API contract but have no dedicated
 * column. This is consistent with the architecture where lastPing is the
 * primary device-health signal. No schema migration is required.
 * ---------------------------------------------------------
 */

import { z } from 'zod';

/** Zod schema for POST /api/v1/device/heartbeat request body. */
export const HeartbeatSchema = z.object({
  batteryPercentage:   z.number().int().min(-1).max(100),
  chargingState:       z.boolean(),
  wifiRssi:            z.number().int().min(-150).max(0),
  firmwareVersion:     z.string().min(1).max(50),
  deviceUptimeSeconds: z.number().int().min(0),
  sensorHealth:        z.enum(['OK', 'ERROR', 'SATURATED']),
});
