# Authentication Design

## 1. User Authentication (JWT)
- **Login/Register**: Upon successful login, the server issues two tokens:
  - `access_token` (JWT): Short-lived (e.g., 15 minutes). Sent in the `Authorization: Bearer <token>` header. Contains `userId`.
  - `refresh_token` (HttpOnly Cookie): Long-lived (e.g., 7 days). Used against the `/auth/refresh` endpoint to obtain a new `access_token` securely without exposing the refresh token to XSS.
- **Authorization**: Middleware verifies the JWT signature. Endpoints validate that `req.user.id` matches the resource being requested (e.g., fetching devices belonging to the logged-in user).

## 2. Device Authentication (API Keys)
- Devices **do not** use JWTs. They use API Keys.
- During device registration, the backend generates a random `API Key`.
  - The plaintext key is returned **once** to the client (to be flashed onto the ESP8266).
  - An HMAC/bcrypt hash of the key is stored in `device_tokens.api_key_hash`.
- The ESP8266 sends two headers with every request:
  - `x-device-id`: The UUID of the device.
  - `x-api-key`: The plaintext secret key.
- **Verification**: Middleware extracts `x-device-id`, fetches the hash from DB, and verifies `x-api-key`. If successful, the request is authenticated as `req.device`.

## 3. Device Ownership & Pairing
- Devices belong exclusively to one user.
- The user registers a device in the dashboard, generating the ID and Secret.
- All readings ingested from a device automatically roll up to the user who owns that device via the `devices.user_id` foreign key.

## 4. Multi-User & Multi-Device
- The API is strictly scoped. A user querying `GET /readings` will hit a service layer that enforces `WHERE devices.user_id = <jwt.user_id>`. Users cannot read or write data for devices they do not own.
