/**
 * =============================================================================
 * File: WiFiManager.cpp
 * Project: SunSense Firmware
 * Layer: Connectivity
 *
 * Purpose:
 * Implementation of the non-blocking Wi-Fi state machine.
 *
 * Security:
 * WIFI_SSID is safe to log (it's not secret).
 * WIFI_PASSWORD MUST NEVER be printed to Serial under any circumstances.
 * =============================================================================
 */

#include "WiFiManager.h"

void WiFiManager::begin() {
  WiFi.mode(WIFI_STA);       // Station mode only (not AP or AP+STA)
  WiFi.setAutoReconnect(false); // We handle reconnection manually for full control
  WiFi.persistent(false);    // Do not store credentials in flash — we manage them
  Logger::info("WIFI", "WiFiManager initialized in STA mode");
}

void WiFiManager::connect() {
  if (_state == SunSenseWiFiState::CONNECTED) {
    Logger::debug("WIFI", "Already connected — ignoring connect() call");
    return;
  }
  _startConnection();
}

void WiFiManager::_startConnection() {
  _state = SunSenseWiFiState::CONNECTING;
  _connectStart = millis();
  _retryCount = 0;

  // SECURITY: SSID is safe to log. Password is NEVER logged.
  Logger::info("WIFI", "Connecting to SSID: " + String(WIFI_SSID));

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
}

void WiFiManager::loop() {
  switch (_state) {
    case SunSenseWiFiState::CONNECTING:
    case SunSenseWiFiState::RECONNECTING: {
      if (WiFi.status() == WL_CONNECTED) {
        _onConnected();
      } else if (millis() - _connectStart > WIFI_CONNECT_TIMEOUT_MS) {
        // Connection attempt timed out
        Logger::warn("WIFI", "Connection timeout — will retry in " +
          String(WIFI_RECONNECT_DELAY_MS / 1000) + "s");
        _onDisconnected();
      }
      break;
    }

    case SunSenseWiFiState::CONNECTED: {
      // Monitor for connection drops
      if (WiFi.status() != WL_CONNECTED) {
        Logger::warn("WIFI", "Connection lost — entering reconnect mode");
        _onDisconnected();
      }
      break;
    }

    case SunSenseWiFiState::DISCONNECTED: {
      // Schedule reconnection after delay
      if (millis() - _lastRetryTime > WIFI_RECONNECT_DELAY_MS) {
        if (_retryCount < WIFI_MAX_RETRIES) {
          _retryCount++;
          Logger::info("WIFI", "Reconnect attempt " + String(_retryCount) +
            "/" + String(WIFI_MAX_RETRIES));
          _state = SunSenseWiFiState::RECONNECTING;
          _connectStart = millis();
          WiFi.begin(WIFI_SSID, WIFI_PASSWORD); // Password NEVER logged
          _lastRetryTime = millis();
        } else {
          // Max retries reached — stay disconnected, firmware continues in offline mode
          // Reset counter so it will try again on the next cycle
          if (millis() - _lastRetryTime > (WIFI_RECONNECT_DELAY_MS * 10)) {
            _retryCount = 0;
            Logger::info("WIFI", "Resetting retry counter for next reconnect cycle");
          }
        }
      }
      break;
    }
  }
}

void WiFiManager::_onConnected() {
  _state = SunSenseWiFiState::CONNECTED;
  _retryCount = 0;
  Logger::info("WIFI", "Connected! IP: " + WiFi.localIP().toString() +
    " | RSSI: " + String(WiFi.RSSI()) + " dBm");
}

void WiFiManager::_onDisconnected() {
  _state = SunSenseWiFiState::DISCONNECTED;
  _lastRetryTime = millis();
  WiFi.disconnect();
}

bool WiFiManager::isConnected() const {
  return _state == SunSenseWiFiState::CONNECTED && WiFi.status() == WL_CONNECTED;
}

SunSenseWiFiState WiFiManager::getState() const {
  return _state;
}

int WiFiManager::getRSSI() const {
  if (!isConnected()) return 0;
  return WiFi.RSSI();
}

String WiFiManager::getLocalIP() const {
  if (!isConnected()) return "0.0.0.0";
  return WiFi.localIP().toString();
}

void WiFiManager::forceReconnect() {
  Logger::info("WIFI", "Force reconnect requested");
  WiFi.disconnect();
  _retryCount = 0;
  _startConnection();
}
