# Phase 7A — Real-Time Communication Architecture

## 1. Official Phase 7 Scope
According to `docs/SUNSENSE_FINAL_ROADMAP.md`, Phase 7 focuses exclusively on **Real-time Communication (WebSockets)** to allow the dashboard to update instantly as the physical ESP8266 device sends new readings to the server, without needing to refresh the page or rely on aggressive HTTP polling.

## 2. Current Polling Architecture
| Domain | Current Method | Interval | Real-time Needed? | Proposed Phase 7 Behavior |
|---|---|---|---|---|
| Dashboard | GET /dashboard | 10 seconds | YES | Push events + REST fallback |
| History | GET /history | 30 seconds | NO (Aggregate) | Invalidation signal + REST |
| Analytics | GET /analytics | 30 seconds | NO (Aggregate) | Invalidation signal + REST |
| Alerts | GET /alerts | None | YES (Future) | Push new alerts |
| Device Status | GET /device | On Mount | YES | Push online/offline state |
| Sunscreen | POST /sunscreen | On Mount | NO (Local timer)| Frontend interpolation |

## 3. WebSocket Scope
WebSockets will be strictly used as a one-way (Server → Client) notification and data-push mechanism for authenticated browser clients. The ESP8266 hardware will **not** use WebSockets. Data flow remains:
`ESP8266 → REST POST → PostgreSQL → WebSocket Event → React UI`.

## 4. Recommended Technology
**Socket.IO** is highly recommended over native `ws`. 
**Why?**
- **Built-in Reconnection:** Automatic backoff and reconnect on network loss.
- **Rooms:** Native support for isolating users (`user:<userId>`) easily.
- **Express Integration:** Attaches seamlessly to the existing HTTP server.
- **Fallbacks:** Automatically handles environments where pure WebSockets are blocked (falling back to long-polling).

## 5. Backend Integration Point
Currently, the HTTP server is started in `backend/src/server.ts` using `app.listen()`. 
**Refactor required:** The bootstrap must be modified to create an explicit HTTP server that both Express and Socket.IO can share.
```typescript
import http from 'http';
import { Server } from 'socket.io';

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: config.frontendUrl, credentials: true } });
server.listen(config.port, ...);
```

## 6. Authentication Design
**Strategy:** `AccessToken` Handshake.
1. The frontend already stores a short-lived, memory-only JWT access token.
2. During the Socket.IO connection handshake, the frontend passes this token: `io(url, { auth: { token: accessToken } })`.
3. A Socket.IO middleware on the backend verifies the JWT signature.
4. If the token is valid, the connection is allowed. If expired, the socket connection fails. The frontend must catch this, use the existing REST `refreshToken` flow (via HttpOnly cookie) to get a new access token, and then reconnect the socket.

## 7. Multi-User Isolation
**Strategy:** Server-Assigned User Rooms.
- The frontend **never** requests to join a room.
- Upon successful JWT verification in the socket middleware, the backend automatically extracts the `userId` from the token and forces the socket into a dedicated room: `socket.join(\`user:${decoded.userId}\`)`.
- All user-specific events are emitted exclusively to that room: `io.to(\`user:${userId}\`).emit(...)`.
- This guarantees absolute data isolation.

## 8. Event Contract
| Event | Trigger | Payload | Consumer | Scope |
|---|---|---|---|---|
| `dashboard:update` | New UV reading processed | `{ currentUv, ...DashboardData }` | Dashboard | `user:<userId>` |
| `exposure:updated` | Session aggregated/closed | `{ sessionId }` (Signal only) | History/Analytics | `user:<userId>` |
| `device:status` | Device heartbeat/ping | `{ deviceId, status, batteryLevel }` | Device/Dashboard | `user:<userId>` |
| `alert:new` | Smart Alert generated | `Alert` DTO | Alerts/Toast | `user:<userId>` |

## 9. Event Emission Points
Events must **only** be emitted after PostgreSQL transactions successfully commit. 
**Implementation:** Create a new `RealtimeEventService` (e.g., `backend/src/services/events/realtime.service.ts`). 
- `DeviceIngestionService` and `ExposureLogicService` will call `RealtimeEventService.emitDashboardUpdate(userId, data)` **after** database writes. 
- This decouples the database repositories from Socket.IO logic.

## 10. ESP8266 Interaction
**ESP8266 Transport: REST.**
The firmware will continue using the existing `POST /api/v1/readings` and `POST /api/v1/device/heartbeat` REST endpoints. Implementing WebSockets on the ESP8266 adds unnecessary complexity, consumes more memory, and complicates the offline queue. The backend will bridge the REST ingestion to WebSocket UI emission.

## 11. Offline Queue Compatibility
When the ESP8266 comes back online, it may flush 50 offline readings at once.
- The backend ingestion service must process the batch transactionally.
- **CRITICAL:** Do not emit 50 `dashboard:update` events. Emit a **single** consolidated `dashboard:update` and `exposure:updated` event at the end of the batch processing to prevent frontend flooding.

## 12. Dashboard Strategy
**Strategy:** WebSocket Push + REST Hydration.
1. On page mount, Dashboard calls `GET /api/v1/dashboard` for initial hydration.
2. It subscribes to `dashboard:update`.
3. The 10-second polling interval is **completely removed**.
4. If the socket disconnects and reconnects, the Dashboard must perform one silent `GET /api/v1/dashboard` to catch any data missed during the downtime.

## 13. History Strategy
**Strategy:** WebSocket Invalidation + REST.
History data is large and paginated. Instead of pushing historical session lists over WebSockets, the backend emits a lightweight `exposure:updated` signal. The History page listens for this signal and executes a background `GET /api/v1/history` request. The 30-second polling is removed.

## 14. Analytics Strategy
**Strategy:** WebSocket Invalidation + REST.
Similar to History. The Analytics page listens for `exposure:updated` and triggers a silent refetch of `GET /api/v1/analytics`. The 30-second polling is removed.

## 15. Alerts Strategy
**Strategy:** Push New Alerts.
Future Smart Alerts will be emitted via `alert:new`. The frontend will append the new alert to the UI state and optionally display a toast notification. The REST `GET /api/v1/alerts` remains the source of truth on initial load.

## 16. Device Status Strategy
**Strategy:** Push Status.
When `POST /api/v1/device/heartbeat` is received from the hardware, the backend updates the database and emits `device:status` to update the "Connected" indicator instantly.

## 17. Sunscreen Strategy
**Strategy:** Local Interpolation.
The frontend handles the timer countdown locally based on the authoritative `protectionEndTime` provided by the backend. No specific high-frequency WebSocket events are needed for sunscreen interpolation.

## 18. Frontend Socket Architecture
Create `src/lib/socketClient.ts` to instantiate the Socket.IO client.
Create `src/context/SocketContext.tsx` to manage the connection lifecycle.
- Connects automatically when `AuthContext` has a valid user.
- Disconnects automatically on logout.
- Custom hooks (e.g., `useSocketEvent`) for individual pages to subscribe safely.

## 19. Failure & Recovery
- **Database Consistency Rule:** PostgreSQL is the absolute source of truth. WebSockets only notify the UI of state changes.
- **Reconnect Logic:** Upon any Socket.IO reconnection event, the active page must invalidate its local state and execute its standard REST `GET` (e.g., `dashboard`, `history`) to ensure no events were missed during the connection drop.

## 20. Security
- Sockets are restricted by CORS (matching the REST API).
- Authentication enforces JWT validation.
- Rooms are hard-assigned by the server based on cryptographic JWT identity; clients cannot spoof room joins.
- Event payloads are sanitized DTOs, containing no sensitive DB internals.

## 21. Deployment Considerations
- If deployed to a multi-node environment (e.g., clustered Node.js or multiple containers), a Redis adapter (`@socket.io/redis-adapter`) may be required to share events across instances. 
- For a single-instance deployment (current scope), in-memory Socket.IO is sufficient.
- Sticky sessions must be enabled at the load balancer level if falling back to HTTP long-polling.

## 22. Polling Migration Matrix
| Endpoint | Current | Phase 7 Final |
|---|---|---|
| Dashboard | 10s poll | WebSocket Push + REST Reconnect |
| History | 30s poll | WebSocket Invalidation + REST Reconnect |
| Analytics | 30s poll | WebSocket Invalidation + REST Reconnect |

## 23. Implementation Milestones
- **Phase 7A:** Architecture & event contract (This document)
- **Phase 7B:** Backend Socket foundation (Socket.IO + Auth Middleware)
- **Phase 7C:** Frontend Socket Context & Connection Lifecycle
- **Phase 7D:** Dashboard Realtime Migration (Removal of 10s poll)
- **Phase 7E:** History/Analytics Invalidation Migration (Removal of 30s poll)
- **Phase 7F:** Device Heartbeat Realtime
- **Phase 7G:** Full End-to-End WebSocket Testing

## 24. Test Plan
1. Connect two browsers logged into the same account; verify both update simultaneously on new reading.
2. Connect a second user account; verify they DO NOT receive the first user's events.
3. Turn off Wi-Fi on browser; wait 10s; turn on Wi-Fi; verify silent REST resynchronization upon socket reconnect.
4. Simulate ESP8266 offline queue flush; verify UI updates smoothly without event flooding.
5. Force JWT expiry; verify socket disconnects, triggers REST refresh, and reconnects with new token.

## 25. Risks / Blockers
- **None.** The system is structurally sound and ready for Socket.IO integration.
