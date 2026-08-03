# REST API Design (Versioned `v1`)

## Authentication (`/api/v1/auth`)
- `POST /api/v1/auth/register` - Creates a new user and default settings.
- `POST /api/v1/auth/login` - Authenticates user, returns Access Token, sets Refresh Token cookie.
- `POST /api/v1/auth/logout` - Clears refresh token cookie.
- `POST /api/v1/auth/refresh` - Issues new access token using refresh token.
- `GET /api/v1/auth/profile` - Returns logged-in user's basic info.

## Server / System (`/api/v1/server`)
- `GET /api/v1/server/time` - **Purpose:** Provide trusted server time (UTC) for ESP8266 when reconnecting after offline operation to ensure accurate timestamping of queued readings.

## Devices (`/api/v1/devices`)
- `POST /api/v1/devices/register` - Registers a new ESP8266 device, returning Device ID & Secret.
- `POST /api/v1/devices/heartbeat` - **Purpose:** Allow ESP8266 to periodically send Battery percentage, Charging state, Wi-Fi RSSI, Firmware version, Device uptime, Last sync, and Sensor health. Powers the frontend Device page.
- `GET /api/v1/devices` - Lists all devices owned by user.
- `GET /api/v1/devices/{id}` - Gets specific device status.
- `PATCH /api/v1/devices/{id}` - Updates device name.
- `DELETE /api/v1/devices/{id}` - Unpairs/deletes device and cascades data.
- `GET /api/v1/devices/firmware/latest` - **[Future Feature / Phase 6]** Returns latest firmware binary for Over-The-Air (OTA) updates. Not implemented in Phase 3B.

## Readings (`/api/v1/readings`)
- `POST /api/v1/readings` - **[ESP8266 Endpoint]** Ingests one or more UV readings. (Requires Device Auth).
- `GET /api/v1/readings/latest` - Returns the most recent UV reading.
- `GET /api/v1/readings/history` - Returns paginated list of historical readings.

## Dashboard (`/api/v1/dashboard`)
- `GET /api/v1/dashboard` - Aggregated data for the dashboard.

## Analytics (`/api/v1/analytics`)
- `GET /api/v1/analytics/hourly` - UV timeline for the current day.
- `GET /api/v1/analytics/daily` - Daily SED/Peak over the last 7 days.
- `GET /api/v1/analytics/weekly` - Weekly averages for the last 4 weeks.
- `GET /api/v1/analytics/monthly` - Monthly aggregates.

## Alerts (`/api/v1/alerts`)
- `GET /api/v1/alerts` - Returns unread/recent smart alerts (Paginated).
- `PATCH /api/v1/alerts/{id}` - Marks alert as read.
- `DELETE /api/v1/alerts/{id}` - Dismisses alert permanently.

## Sunscreen (`/api/v1/sunscreen`)
- `POST /api/v1/sunscreen/apply` - Records a new sunscreen application.
- `PATCH /api/v1/sunscreen/reapply` - Updates the expiration window.
- `GET /api/v1/sunscreen/status` - Returns current protection status.

## Settings & Notifications (`/api/v1/settings`)
- `GET /api/v1/settings` - Gets user preferences (including Notification Preferences).
- `PATCH /api/v1/settings` - Updates preferred SPF, thresholds, and notification toggles.

## Live Updates (WebSockets)
- **Phase 6 Feature:** The system will implement WebSockets (or SSE) to stream live data directly to the frontend. The REST API handles all stateful, transactional, and historical queries, while WebSockets broadcast live UV readings, alerts, battery updates, and device statuses.
