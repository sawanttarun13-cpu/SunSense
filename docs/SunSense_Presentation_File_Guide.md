# SunSense Presentation — File-by-File Guide

# 1. Frontend

## `src/` (Root)

### `src/main.tsx`
**One-line purpose:** Mounts the React application to the browser DOM.

**What I can say:** "This is the entry point for the frontend app. It connects our React code to the HTML page."

### `src/App.tsx`
**One-line purpose:** Sets up the main routing and global context providers.

**What I can say:** "This file wraps the app with necessary contexts like Authentication and Socket.IO. It also defines all the page routes."

## `src/components/`

### `src/components/PrivateRoute.tsx`
**One-line purpose:** Protects specific pages from unauthenticated users.

**What I can say:** "This ensures you must be logged in to see certain pages. If you aren't, it redirects you to the login screen."

## `src/context/`

### `src/context/AuthContext.tsx`
**One-line purpose:** Manages the user's login state globally across the frontend.

**What I can say:** "This keeps track of who is logged in. It handles storing tokens and provides user data to any component that needs it."

### `src/context/SocketContext.tsx`
**One-line purpose:** Makes the active Socket.IO connection available to React components.

**What I can say:** "This wraps the application so that any page can easily listen for live updates from the server."

## `src/hooks/`

### `src/hooks/useSocketEvent.ts`
**One-line purpose:** A custom React hook to listen for specific real-time events.

**What I can say:** "This provides a simple way for components to react to live events. For example, updating the dashboard when a new UV reading arrives."

## `src/lib/`

### `src/lib/apiClient.ts`
**One-line purpose:** Handles all outgoing HTTP requests to the backend API.

**What I can say:** "This is our central tool for talking to the backend. It automatically adds the user's access token to every request."

### `src/lib/socketClient.ts`
**One-line purpose:** Manages the low-level Socket.IO connection to the server.

**What I can say:** "This establishes the real-time websocket connection. It handles connecting, disconnecting, and passing authentication."

## `src/pages/`

### `src/pages/Alerts.tsx`
**One-line purpose:** Shows a timeline of all smart alerts triggered for the user.

**What I can say:** "This page acts as an inbox for warnings. It displays historical notifications for things like extreme UV or sunscreen reapplication."

### `src/pages/Analytics.tsx`
**One-line purpose:** Displays long-term trends and historical exposure charts.

**What I can say:** "This page visualizes the user's exposure over time. It provides charts and metrics for weekly and monthly UV doses."

### `src/pages/Dashboard.tsx`
**One-line purpose:** Shows the user's current UV exposure and live monitoring information.

**What I can say:** "This is the main screen of SunSense. It shows the live UV Index, exposure information, sunscreen status, alerts, and device information."

### `src/pages/Device.tsx`
**One-line purpose:** Displays the status of the connected physical sensor.

**What I can say:** "This lets the user check on their hardware. It shows battery level, firmware version, and connection status."

### `src/pages/History.tsx`
**One-line purpose:** Lists all recorded UV exposure minutes.

**What I can say:** "This is a detailed log of the sensor data. It shows minute-by-minute averages and allows exporting to CSV."

### `src/pages/Login.tsx`
**One-line purpose:** Provides the user interface for authenticating into the app.

**What I can say:** "This is the login screen. It collects credentials and passes them to the authentication service."

### `src/pages/Profile.tsx`
**One-line purpose:** Manages the user's account details and skin type.

**What I can say:** "This manages personal information. The user's skin type here directly affects how quickly burn warnings are triggered."

### `src/pages/Register.tsx`
**One-line purpose:** Provides the user interface for creating a new account.

**What I can say:** "This handles new user onboarding. It collects basic info to set up a new SunSense profile."

### `src/pages/SettingsPage.tsx`
**One-line purpose:** Allows users to configure smart alert thresholds and preferences.

**What I can say:** "This is where the user customizes their experience. They can enable or disable specific alerts like burn warnings."

## `src/services/`

### `src/services/alerts.service.ts`
**One-line purpose:** Retrieves and manages user notifications.

**What I can say:** "This fetches the user's alert history. It also handles marking alerts as read or dismissing them."

### `src/services/analytics.service.ts`
**One-line purpose:** Requests aggregated exposure statistics for charts.

**What I can say:** "This retrieves the processed data needed for our graphs. It handles getting weekly or monthly summaries from the backend."

### `src/services/dashboard.service.ts`
**One-line purpose:** Fetches the initial dashboard data from the backend.

**What I can say:** "This pulls the latest exposure data when the dashboard first loads. It ensures the screen is populated before real-time updates begin."

### `src/services/device.service.ts`
**One-line purpose:** Fetches hardware status and configuration.

**What I can say:** "This retrieves the latest known state of the sensor. It gets information like battery level and last ping time."

### `src/services/history.service.ts`
**One-line purpose:** Fetches paginated UV history records.

**What I can say:** "This loads the history table data. It handles pagination so we don't load thousands of records at once."

### `src/services/profile.service.ts`
**One-line purpose:** Fetches and updates user account information.

**What I can say:** "This handles reading and updating the user's profile. It's used to save changes to things like skin type."

### `src/services/settings.service.ts`
**One-line purpose:** Gets and updates the user's notification preferences.

**What I can say:** "This synchronizes the user's settings with the database. It ensures their alert preferences are saved correctly."

### `src/services/sunscreen.service.ts`
**One-line purpose:** Manages sunscreen application and expiry.

**What I can say:** "This tells the backend when the user applies sunscreen. It's crucial for the reapplication smart alerts."

### Frontend Flow

Login
→ API services
→ React pages
→ Socket.IO updates
→ UI refresh

---

# 2. Backend

## `backend/prisma/`

### `backend/prisma/schema.prisma`
**One-line purpose:** Defines the PostgreSQL database structure and tables.

**What I can say:** "This is the blueprint for our database. It defines exactly how users, devices, readings, and alerts are stored relationally."

## `backend/src/` (Root)

### `backend/src/server.ts`
**One-line purpose:** The main entry point that starts the Node.js server.

**What I can say:** "This file boots up the backend. It starts the HTTP server, connects to the database, and initializes WebSockets."

### `backend/src/app.ts`
**One-line purpose:** Configures the Express application and all its routes.

**What I can say:** "This sets up the core web framework. It defines the API endpoints, handles security headers, and manages errors."

## `backend/src/controllers/`

### `backend/src/controllers/analytics.controller.ts`
**One-line purpose:** Handles requests for weekly and monthly exposure statistics.

**What I can say:** "This answers the frontend's request for chart data. It formats the database results for easy graphing."

### `backend/src/controllers/auth.controller.ts`
**One-line purpose:** Handles incoming HTTP requests for login and registration.

**What I can say:** "This receives the user's login details from the frontend. It passes them to the service layer and returns the access token."

### `backend/src/controllers/readings.controller.ts`
**One-line purpose:** Receives raw UV readings from the hardware via a POST request.

**What I can say:** "This is the endpoint the ESP8266 talks to. It securely receives the sensor data over the internet."

## `backend/src/repositories/`

### `backend/src/repositories/alerts/alerts.repo.ts`
**One-line purpose:** Saves triggered alerts to the PostgreSQL database.

**What I can say:** "This ensures alerts are permanently stored. It saves them so the user can review their notification history later."

## `backend/src/services/`

### `backend/src/services/alerts/smart-alert-engine.service.ts`
**One-line purpose:** Evaluates exposure data to trigger personalized safety warnings.

**What I can say:** "This acts as an intelligent safety monitor. It analyzes incoming data and triggers alerts if the UV rises too fast or sunscreen wears off."

### `backend/src/services/analytics/analytics.service.ts`
**One-line purpose:** Computes aggregated trends and statistics from past exposure sessions.

**What I can say:** "This analyzes the user's history to find patterns. It calculates things like total weekly dose and peak UV days."

### `backend/src/services/auth.service.ts`
**One-line purpose:** Contains the business logic for verifying passwords and issuing JWTs.

**What I can say:** "This is where the actual security happens. It verifies passwords securely and creates the tokens used for authentication."

### `backend/src/services/events/realtime.service.ts`
**One-line purpose:** Emits live WebSocket events to specific connected users.

**What I can say:** "This pushes live updates to the frontend. When new sensor data arrives, this instantly tells the user's dashboard to refresh."

### `backend/src/services/exposure/exposure-logic.service.ts`
**One-line purpose:** Calculates standard erythemal dose (SED) and manages exposure sessions.

**What I can say:** "This is the core scientific engine. It groups continuous readings into sessions and calculates the total UV dose the user has received."

### `backend/src/services/ingestion/device-ingestion.service.ts`
**One-line purpose:** Processes UV readings sent by the ESP8266.

**What I can say:** "This service receives sensor data, validates it, stores it, and starts the business logic required for exposure tracking."

### `backend/src/services/readings/readings.service.ts`
**One-line purpose:** Queries the database for 1-minute aggregated UV history.

**What I can say:** "This pulls historical sensor data for the frontend. It aggregates raw readings into clean minute-by-minute buckets."

### `backend/src/services/settings/settings.service.ts`
**One-line purpose:** Manages the user's alert toggles and notification preferences.

**What I can say:** "This handles reading and writing the user's configuration. It checks these preferences before the Smart Alert Engine sends any warnings."

### Backend Flow

REST request
→ Route
→ Controller
→ Service
→ Repository
→ PostgreSQL
→ Socket.IO event

---

# 3. Firmware

## `firmware/SunSense_Firmware/src/` (Root)

### `firmware/SunSense_Firmware/src/SunSense_Firmware.ino`
**One-line purpose:** Main firmware program that connects all ESP8266 modules together.

**What I can say:** "This is the main program running on the NodeMCU. It reads UV data, updates the OLED, sends readings to the backend, handles offline storage, heartbeat, and OTA updates."

## `firmware/SunSense_Firmware/src/api/`

### `firmware/SunSense_Firmware/src/api/ApiClient.cpp`
**One-line purpose:** Packages UV readings into JSON and sends them securely to the backend.

**What I can say:** "This acts as the messenger. It formats the sensor data and securely transmits it over Wi-Fi to our cloud server."

## `firmware/SunSense_Firmware/src/config/`

### `firmware/SunSense_Firmware/src/config/firmware_config.h`
**One-line purpose:** Centralizes all hardware pins, API endpoints, and system constants.

**What I can say:** "This is the master settings file for the device. It defines which pins connect to the sensor and screen, and where the backend server is."

## `firmware/SunSense_Firmware/src/display/`

### `firmware/SunSense_Firmware/src/display/Display.cpp`
**One-line purpose:** Controls the I2C OLED screen to show live UV data and status icons.

**What I can say:** "This manages the physical screen on the device. It draws the current UV Index, battery level, and Wi-Fi connection status for the user."

## `firmware/SunSense_Firmware/src/network/`

### `firmware/SunSense_Firmware/src/network/OTAManager.cpp`
**One-line purpose:** Downloads and installs new firmware updates wirelessly.

**What I can say:** "This allows us to upgrade the device remotely. It checks the server for new code and safely installs it without needing a USB cable."

## `firmware/SunSense_Firmware/src/sensors/`

### `firmware/SunSense_Firmware/src/sensors/GUVAS12SD/GUVAS12SD.cpp`
**One-line purpose:** Reads raw analog voltage from the sensor and converts it to a UV Index.

**What I can say:** "This directly interacts with the physical sensor hardware. It applies mathematical calibration to turn raw electrical signals into an accurate UV Index."

## `firmware/SunSense_Firmware/src/storage/`

### `firmware/SunSense_Firmware/src/storage/OfflineQueue.cpp`
**One-line purpose:** Temporarily saves readings to flash memory if Wi-Fi disconnects.

**What I can say:** "This prevents data loss when the user goes out of Wi-Fi range. It saves readings locally and uploads them in a batch when the connection returns."

### Firmware Flow

GUVA-S12SD
→ ADC
→ voltage
→ UVI calculation
→ EMA filter
→ OLED
→ REST upload
→ offline queue if disconnected

---

# 4. Complete SunSense Flow

GUVA-S12SD
→ ESP8266
→ REST API
→ Node.js/Express
→ PostgreSQL
→ Socket.IO
→ React Dashboard

# 5. Presentation Summary Table

| Layer | Main Technology | Main Responsibility |
|---|---|---|
| Frontend | React + TypeScript | Displays data and user controls |
| Backend | Node.js + Express | Processes data and business logic |
| Database | PostgreSQL + Prisma | Stores users, readings, sessions, alerts |
| Realtime | Socket.IO | Updates frontend instantly |
| Firmware | ESP8266 C++ | Reads sensor and communicates with backend |
| Sensor | GUVA-S12SD | Measures UV light |
