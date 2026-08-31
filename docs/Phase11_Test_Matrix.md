# Phase 11 Test Matrix

| Test ID | Area | Scenario | Expected Result | Actual Result | Status | Evidence | Defect ID | Fix Required |
|---------|------|----------|-----------------|---------------|--------|----------|-----------|--------------|
| T01 | Runtime | Verify processes & DB | 1 FE, 1 BE, 1 DB | | | | | |
| T02 | Auth | Register/Login/Logout | Success, token memory only | | | | | |
| T03 | Auth | Multi-user isolation | User A cannot access User B data | | | | | |
| T04 | Device Auth | Valid / invalid api key | POST /api/v1/readings auth working | | | | | |
| T05 | Ingestion | Valid reading ingestion | Payload -> DB -> Session -> Realtime | | | | | |
| T06 | Ingestion | Alert engine call order | Persist reading -> session -> alerts | | | | | |
| T07 | Ingestion | Idempotency | Duplicate reading safely rejected | | | | | |
| T08 | DB | Timestamp consistency | UTC timestamp preserved everywhere | | | | | |
| T09 | History | 1-minute aggregation | 6 readings in same min = 1 row | | | | | |
| T10 | History | Multi-device aggregation | 2 devices in same min = 2 rows | | | | | |
| T11 | History | Pagination | Buckets used for count, not raw rows | | | | | |
| T12 | History | Realtime update | Current minute row updates silently | | | | | |
| T13 | History | Offline backfill | Backfilled data aggregates properly | | | | | |
| T14 | History | CSV export | Includes Avg/Min/Max/Samples | | | | | |
| T15 | Dashboard | Initial load & realtime | Shows latest raw reading, updates without polling | | | | | |
| T16 | Dashboard | Dashboard vs History | Dashboard shows raw, History shows avg | | | | | |
| T17 | Analytics | UI and Realtime | Charts update based on sessions, no polling | | | | | |
| T18 | Sessions | Exposure Session rules | Disconnect doesn't split without time gap | | | | | |
| T19 | Alerts | Engine logic tests | HIGH_RISK, EXTREME_UV trigger and dedupe | | | | | |
| T20 | Alerts | Settings respect | Turning off Master stops alerts | | | | | |
| T21 | Alerts | Settings persistence | Values persisted correctly in DB | | | | | |
| T22 | Alerts | Realtime UI | Alert emitted to correct room, UI updates | | | | | |
| T23 | Sunscreen | Apply & active state | Sunscreen applies and counts down | | | | | |
| T24 | Device | Battery & Heartbeat | Battery renders correctly, heartbeat updates | | | | | |
| T25 | Sockets | Global architecture | JWT handshake, user isolation | | | | | |
| T26 | Sockets | Polling audit | No setInterval polling in UI | | | | | |
| T27 | DB | Database integrity | No orphans, no duplicates, clean tables | | | | | |
| T28 | Error | 400/500 Handling | Safe states, no infinite loops | | | | | |
| T29 | OTA | Software OTA endpoint | Auth endpoint, 304 logic, binary stream | | | | | |
| T30 | Physical | S12SD Calibration | Direct sun saturation, final gain | | PENDING PHYSICAL | | | |
| T31 | Physical | Firmware Compile | ESP8266 compiles | | PENDING PHYSICAL | | | |
| T32 | Physical | OTA Flash Space | Space check | | PENDING PHYSICAL | | | |
| T33 | Physical | OTA Update Cycle | Actual device flashes successfully | | PENDING PHYSICAL | | | |
| T34 | Frontend| Page regression | All routes load without crashing | | | | | |
| T35 | Builds | Backend & Frontend | `npm run build` / `pnpm run build` | | | | | |
