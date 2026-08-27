#include "Display.h"
#include <Adafruit_GFX.h>
#include <Adafruit_SH110X.h>
#include <Wire.h>

// Initialize the OLED globally within this file scope
static Adafruit_SH1106G oled(OLED_WIDTH, OLED_HEIGHT, &Wire, -1);

void Display::begin() {
  // Start I2C bus
  Wire.begin(OLED_SDA_PIN, OLED_SCL_PIN);
  delay(100); // Allow I2C bus to stabilize

  // ── I2C Bus Scanner ──────────────────────────────────────────────────────
  // Scan the entire I2C address space to find connected devices.
  // This is the standard diagnostic for I2C communication issues.
  Logger::info("DISPLAY", "Scanning I2C bus (SDA=D2, SCL=D1)...");
  int foundCount = 0;
  uint8_t foundAddr = 0;
  for (uint8_t addr = 1; addr < 127; addr++) {
    Wire.beginTransmission(addr);
    uint8_t error = Wire.endTransmission();
    if (error == 0) {
      Logger::info("DISPLAY", "I2C device found at 0x" + String(addr, HEX));
      foundAddr = addr;
      foundCount++;
    }
  }
  if (foundCount == 0) {
    Logger::error("DISPLAY", "No I2C devices found! Check wiring: SDA→D2, SCL→D1, VCC→3V3, GND→GND");
    _initialized = false;
    return;
  }
  Logger::info("DISPLAY", String(foundCount) + " I2C device(s) found on bus");

  // ── OLED Initialization ────────────────────────────────────────────────
  // Try the address found by the scanner first, then configured, then alternate.
  // Use reset=false — some SH1106 clones hang during software reset when
  // there is no physical reset pin connected.
  uint8_t tryAddrs[] = { foundAddr, OLED_I2C_ADDR, (uint8_t)((OLED_I2C_ADDR == 0x3C) ? 0x3D : 0x3C) };

  for (int attempt = 0; attempt < 3; attempt++) {
    uint8_t addr = tryAddrs[attempt];
    Logger::info("DISPLAY", "Trying oled.begin(0x" + String(addr, HEX) + ", reset=false)...");
    if (oled.begin(addr, false)) {
      Logger::info("DISPLAY", "OLED SH1106 initialized at 0x" + String(addr, HEX));
      _initialized = true;
      return;
    }
    delay(100);
  }

  // Last resort: try with reset=true on the scanner-found address
  Logger::warn("DISPLAY", "All reset=false attempts failed, trying reset=true on 0x" + String(foundAddr, HEX));
  if (oled.begin(foundAddr, true)) {
    Logger::info("DISPLAY", "OLED SH1106 initialized at 0x" + String(foundAddr, HEX) + " (with reset)");
    _initialized = true;
    return;
  }

  Logger::error("DISPLAY", "OLED initialization failed after all attempts!");
  _initialized = false;
}

void Display::clear() {
  if (!_initialized) return;
  oledClear();
  oled.display();
}

void Display::oledClear() {
  oled.clearDisplay();
  oled.setTextColor(SH110X_WHITE);
}

void Display::oledText(const String& text, int x, int y, int size) {
  oled.setTextSize(size);
  oled.setCursor(x, y);
  oled.print(text);
}

String Display::getUVRisk(float uvi) {
  if (uvi < 3.0f) return "LOW";
  if (uvi < 6.0f) return "MODERATE";
  if (uvi < 8.0f) return "HIGH";
  if (uvi < 11.0f) return "VERY HIGH";
  return "EXTREME";
}

void Display::showSplash() {
  if (!_initialized) return;
  oledClear();
  oledText("SunSense", 28, 8, 2);
  oledText("UV MONITOR", 23, 32, 1);
  oledText("Initializing...", 15, 50, 1);
  oled.display();
}

void Display::showConnecting() {
  if (!_initialized) return;
  oledClear();
  oledText("SunSense", 32, 0, 1);
  oledText("WiFi", 45, 20, 2);
  oledText("Connecting...", 18, 45, 1);
  oled.display();
}

void Display::showReading(float uvIndex, float voltage, bool isOnline, int queueCount) {
  if (!_initialized) {
    Logger::info("DISPLAY", "UVI:" + String(uvIndex,1) + " | V:" + String(voltage,3) + " | Q:" + String(queueCount));
    return;
  }

  oledClear();
  oledText("SUNSENSE", 34, 0, 1);
  oledText("UV INDEX", 0, 15, 1);

  oled.setTextSize(3);
  oled.setCursor(0, 27);
  oled.print(uvIndex, 1);

  oled.setTextSize(1);
  oled.setCursor(75, 20);
  oled.print(getUVRisk(uvIndex));

  oled.setCursor(75, 38);
  oled.print("V:");
  oled.print(voltage, 3);

  oled.setCursor(0, 55);
  if (isOnline) {
    oled.print("ONLINE");
  } else {
    oled.print("OFFLINE");
  }

  oled.setCursor(76, 55);
  oled.print("Q:");
  oled.print(queueCount);

  oled.display();
}

void Display::showOffline(float uvIndex, int queueCount) {
  if (!_initialized) return;
  oledClear();
  oledText("SUNSENSE", 32, 0, 1);
  oledText("OFFLINE", 31, 15, 2);
  oledText("UVI:", 0, 43, 1);
  oledText(String(uvIndex, 1), 35, 42, 1);
  oledText("Queue:", 70, 43, 1);
  oledText(String(queueCount), 110, 42, 1);
  oled.display();
}

void Display::showUploading(int count) {
  if (!_initialized) return;
  oledClear();
  oledText("SUNSENSE", 34, 0, 1);
  oledText("SYNCING", 35, 20, 2);
  oledText("Uploading data...", 10, 48, 1);
  oled.display();
}

void Display::showError(const String& msg) {
  if (!_initialized) return;
  oledClear();
  oledText("ERROR", 43, 5, 2);
  oledText(msg, 5, 35, 1);
  oled.display();
}
