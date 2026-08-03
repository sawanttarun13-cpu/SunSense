# Security

## 1. Authentication Security
- **Passwords**: Hashed securely using `bcrypt` (minimum 10 rounds). Passwords are never logged or returned.
- **JWTs**: Signed using a strong `JWT_SECRET`. Access tokens are short-lived.
- **Refresh Tokens**: Stored in `HttpOnly`, `Secure`, `SameSite=Strict` cookies to completely eliminate Cross-Site Scripting (XSS) theft vectors.

## 2. Device Security
- **API Keys**: Secrets generated on the server are returned to the user ONLY ONCE. The backend stores a `bcrypt` hash of the key. Even if the database is breached, devices cannot be spoofed.
- **Replay Protection**: The `recorded_at` timestamps protect against replay attacks, combined with HTTPS.

## 3. Rate Limiting
- Use `express-rate-limit` to prevent brute forcing and denial of service.
- **Global**: ~100 requests / minute per IP.
- **Auth Routes**: Stricter limits (e.g., 5 requests / 15 minutes) on `/auth/login` and `/auth/register`.
- **Device Ingestion**: Limited to expected sync frequency to prevent database spamming.

## 4. Input Validation & Injection Prevention
- All incoming inputs are strictly validated against `Zod` schemas.
- Using an ORM (Prisma) naturally protects against SQL Injection by using prepared statements underneath.

## 5. Web Headers & CORS
- **Helmet**: Implement `helmet` to set secure HTTP headers (HSTS, NoSniff, XSS-Protection).
- **CORS**: Strictly configure Cross-Origin Resource Sharing. Only allow the specific frontend origin domain to make browser requests. Device endpoints (`POST /readings`) are excluded from CORS restrictions but protected by API keys.

## 6. Environment Configuration
- Use `.env` for all secrets (`DATABASE_URL`, `JWT_SECRET`, port numbers).
- Never commit `.env` files to source control. Use `.env.example` as a template.
