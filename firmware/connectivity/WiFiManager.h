/**
 * =============================================================================
 * File: WiFiManager.h
 * Project: SunSense Firmware
 * Layer: Connectivity
 *
 * Purpose:
 * Non-blocking Wi-Fi connection management for the ESP8266.
 * Handles initial connection, disconnection detection, and
 * automatic reconnection without blocking the main firmware loop.
 *
 * Design Principles:
 * - NEVER blocks indefinitely. Uses a state machine with timeouts.
 * - Reconnection attempts are spaced by WIFI_RECONNECT_DELAY_MS.
 * - The main loop can continue (reading sensor, updating display)
 *   even while Wi-Fi is disconnected.
 * - Credentials (SSID/password) are read from firmware_config.h only.
 *   They are NEVER printed to Serial.
 * =============================================================================
 */

#ifndef WIFI_MANAGER_H
#define WIFI_MANAGER_H

#include <Arduino.h>
#include <ESP8266WiFi.h>
#include "../config/firmware_config.h"
#include "../utils/Logger.h"

/** Wi-Fi connection state machine states */
enum class WiFiState {
  DISCONNECTED,   // Not connected — no active attempt
  CONNECTING,     // Connection attempt in progress
  CONNECTED,      // Successfully connected to AP
  RECONNECTING    // Lost connection — attempting to reconnect
};

class WiFiManager {
public:
  /**
   * Initializes Wi-Fi in station mode (STA).
   * Does NOT connect immediately — call connect() to start.
   * Call once in setup().
   */
  void begin();

  /**
   * Initiates a Wi-Fi connection attempt using credentials from firmware_config.h.
   * Non-blocking — sets state to CONNECTING and returns.
   * Call loop() repeatedly to drive the connection process.
   */
  void connect();

  /**
   * Main update function — drives the Wi-Fi state machine.
   * MUST be called repeatedly in loop().
   * Handles: connection progress, timeout, reconnection scheduling.
   */
  void loop();

  /**
   * Returns true if Wi-Fi is currently connected.
   * Safe to call from anywhere in the firmware.
   */
  bool isConnected() const;

  /**
   * Returns the current Wi-Fi state for status display.
   */
  WiFiState getState() const;

  /**
   * Returns the current RSSI (signal strength) in dBm.
   * Returns 0 if not connected.
   */
  int getRSSI() const;

  /**
   * Returns the device's local IP address as a string.
   * Returns "0.0.0.0" if not connected.
   */
  String getLocalIP() const;

  /**
   * Forces an immediate reconnection attempt.
   * Useful after waking from deep sleep or after a long offline period.
   */
  void forceReconnect();

private:
  WiFiState _state          = WiFiState::DISCONNECTED;
  uint32_t  _connectStart   = 0;  // millis() timestamp when connection was initiated
  uint32_t  _lastRetryTime  = 0;  // millis() timestamp of last reconnection attempt
  int       _retryCount     = 0;  // Current reconnection attempt count

  /** Internal: transitions to CONNECTING state and calls WiFi.begin(). */
  void _startConnection();

  /** Internal: called when a connection is confirmed (WL_CONNECTED). */
  void _onConnected();

  /** Internal: called when connection is lost or timed out. */
  void _onDisconnected();
};

#endif // WIFI_MANAGER_H
