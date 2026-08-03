# Smart Alert Engine

The Smart Alert Engine evaluates rules synchronously on incoming telemetry and readings.

## Rule Definitions

### 1. Rapid UV Increase
- **Trigger**: New UV reading ingested.
- **Condition**: Current UV > Previous UV + 2.5 within a 10-minute window.
- **Action**: Generate alert. Save alert. Show on dashboard.

### 2. Sunscreen Expiry
- **Trigger**: Cron job or evaluation on fetch.
- **Condition**: Sunscreen expires within 15 minutes AND current UV > 3.0.
- **Action**: Generate alert. Save alert. Show on dashboard.

### 3. Daily Dose Limit
- **Trigger**: New UV reading ingested, recalculating SED.
- **Condition**: SED exceeds safe threshold based on user's Skin Type.
- **Action**: Generate alert. Save alert. Show on dashboard.

### 4. Peak UV
- **Trigger**: Time matches historical peak time.
- **Condition**: Peak UV time approaching within 30 minutes.
- **Action**: Generate alert. Save alert. Show on dashboard.

### 5. Sensor Covered
- **Trigger**: New UV reading ingested.
- **Condition**: Abrupt drop to 0.0 UV during high sun hours.
- **Action**: Generate alert. Save alert. Show on dashboard.

### 6. Device Offline
- **Trigger**: Cron job.
- **Condition**: Device missed expected heartbeat/sync window.
- **Action**: Generate alert. Save alert. Show on dashboard.

### 7. Battery Low
- **Trigger**: Incoming `POST /api/v1/devices/heartbeat`.
- **Condition**: Battery below configurable threshold (e.g., 20%).
- **Action**: Generate alert. Save alert. Show on dashboard.

### 8. High Risk
- **Trigger**: Incoming UV reading.
- **Condition**: Risk reaches High (UV 6.0+) or Extreme (UV 11.0+).
- **Action**: Generate alert. Recommend shade. Recommend SPF. Save alert. Show on dashboard.
