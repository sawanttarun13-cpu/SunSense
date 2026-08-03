# Database Design (PostgreSQL)

## Tables & Schema

### 1. `users`
**Purpose**: Stores user account details and base preferences.
- `id` (UUID, PK)
- `email` (VARCHAR, Unique, Index)
- `password_hash` (VARCHAR)
- `name` (VARCHAR)
- `skin_type` (INT 1-6) - Fitzpatrick scale.
- `preferred_spf` (INT)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### 2. `devices`
**Purpose**: Stores the registered ESP8266 device for the user (MVP: One device per user).
- `id` (UUID, PK)
- `user_id` (UUID, Unique, FK -> users.id)
- `name` (VARCHAR) - e.g., "Backpack Keychain"
- `firmware_version` (VARCHAR)
- `battery_level` (INT 0-100)
- `wifi_ssid` (VARCHAR)
- `ip_address` (VARCHAR)
- `last_ping` (TIMESTAMP)
- `created_at` (TIMESTAMP)

### 3. `device_tokens`
**Purpose**: Securely stores API keys for device authentication.
- `device_id` (UUID, PK, FK -> devices.id)
- `api_key_hash` (VARCHAR) - Hashed version of the secret key.
- `created_at` (TIMESTAMP)
- `last_used_at` (TIMESTAMP)

### 4. `uv_readings`
**Purpose**: Primary time-series table for sensor data (raw data layer).
- `id` (UUID, PK)
- `device_id` (UUID, FK -> devices.id, Index)
- `uv_index` (DECIMAL 4,2)
- `recorded_at` (TIMESTAMP, Index) - Exact time reading was taken.
- `created_at` (TIMESTAMP) - Time received by server.
- **Constraints**: UNIQUE(`device_id`, `recorded_at`) to prevent duplicates.

### 5. `exposure_sessions`
**Purpose**: Store completed exposure sessions as an analytics layer instead of calculating them repeatedly from raw readings.
- `session_id` (UUID, PK)
- `user_id` (UUID, FK -> users.id, Index)
- `device_id` (UUID, FK -> devices.id)
- `start_time` (TIMESTAMP)
- `end_time` (TIMESTAMP)
- `duration_seconds` (INT)
- `average_uv_index` (DECIMAL 4,2)
- `accumulated_sed` (DECIMAL 6,2)
- `calculated_risk` (VARCHAR)
- `created_at` (TIMESTAMP)

### 6. `sunscreen_applications`
**Purpose**: Tracks when a user applies sunscreen.
- `id` (UUID, PK)
- `user_id` (UUID, FK -> users.id, Index)
- `applied_spf` (INT)
- `applied_at` (TIMESTAMP)
- `expires_at` (TIMESTAMP)
- `created_at` (TIMESTAMP)

### 7. `alerts`
**Purpose**: Stores generated smart alerts for users.
- `id` (UUID, PK)
- `user_id` (UUID, FK -> users.id, Index)
- `type` (VARCHAR)
- `message` (TEXT)
- `triggered_at` (TIMESTAMP)
- `is_read` (BOOLEAN, default: false)
- `is_dismissed` (BOOLEAN, default: false)

### 8. `settings`
**Purpose**: User-specific dashboard configuration.
- `user_id` (UUID, PK, FK -> users.id)
- `alert_threshold` (DECIMAL 4,2)
- `updated_at` (TIMESTAMP)

### 9. `notification_preferences`
**Purpose**: Controls how and when the user receives alerts.
- `user_id` (UUID, PK, FK -> users.id)
- `email_notifications` (BOOLEAN)
- `push_notifications` (BOOLEAN)
- `smart_alert_preferences` (JSONB) - Fine-grained toggles for specific alert types.
- `reminder_preferences` (JSONB)
- `quiet_hours_start` (TIME)
- `quiet_hours_end` (TIME)
- `updated_at` (TIMESTAMP)

### 10. `device_sync_logs`
**Purpose**: Audit logs for offline synchronization bursts.
- `id` (UUID, PK)
- `device_id` (UUID, FK -> devices.id)
- `sync_time` (TIMESTAMP)
- `records_uploaded` (INT)
- `status` (VARCHAR)
