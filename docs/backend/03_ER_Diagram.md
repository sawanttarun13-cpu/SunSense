# Entity Relationship Diagram

```mermaid
erDiagram
    users ||--|o devices : owns
    users ||--o{ sunscreen_applications : logs
    users ||--o{ alerts : receives
    users ||--|| settings : configures
    users ||--|| notification_preferences : configures
    users ||--o{ exposure_sessions : accumulates
    
    devices ||--|| device_tokens : secures
    devices ||--o{ uv_readings : records
    devices ||--o{ exposure_sessions : generates
    devices ||--o{ device_sync_logs : audits
    
    users {
        uuid id PK
        string email
        string password_hash
        int skin_type
        int preferred_spf
    }
    
    devices {
        uuid id PK
        uuid user_id FK
        string name
        int battery_level
        datetime last_ping
    }
    
    device_tokens {
        uuid device_id PK, FK
        string api_key_hash
    }
    
    uv_readings {
        uuid id PK
        uuid device_id FK
        decimal uv_index
        datetime recorded_at
    }
    
    exposure_sessions {
        uuid session_id PK
        uuid user_id FK
        uuid device_id FK
        datetime start_time
        datetime end_time
        int duration_seconds
        decimal average_uv_index
        decimal accumulated_sed
    }
    
    sunscreen_applications {
        uuid id PK
        uuid user_id FK
        int applied_spf
        datetime applied_at
        datetime expires_at
    }
    
    alerts {
        uuid id PK
        uuid user_id FK
        string type
        string message
        boolean is_read
        datetime triggered_at
    }
    
    settings {
        uuid user_id PK, FK
        decimal alert_threshold
    }
    
    notification_preferences {
        uuid user_id PK, FK
        boolean email_notifications
        boolean push_notifications
        time quiet_hours_start
        time quiet_hours_end
    }
    
    device_sync_logs {
        uuid id PK
        uuid device_id FK
        datetime sync_time
        int records_uploaded
    }
```

## Relationship Rules
- **Cascade Deletes**: Deleting a User cascades to Devices, Settings, Notification Preferences, Alerts, Exposure Sessions, and Sunscreen Applications.
- **One-to-Many**: One Device has many UV Readings and Exposure Sessions.
- **One-to-One**: Users have strictly one Device (MVP Hard Limit), one Settings profile, and one Notification Preferences profile. Devices have exactly one Device Token.
