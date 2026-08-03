# Coding Standards

## 1. Naming Conventions
- **Files/Folders**: camelCase (e.g., `uvReading.repo.ts`, `auth.controller.ts`).
- **Classes**: PascalCase (e.g., `class SmartAlertService`).
- **Variables/Functions**: camelCase (e.g., `calculateUvDose`, `currentReading`).
- **Database Tables/Columns**: snake_case (e.g., `uv_readings`, `recorded_at`).
- **Interfaces**: PascalCase, often prefixed with 'I' or clearly named (e.g., `CreateReadingDTO`).

## 2. Response Format
All REST API endpoints must return a standardized JSON envelope:
**Success**:
```json
{
  "success": true,
  "data": { ... }
}
```
**Error**:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid UV Index value."
  }
}
```

## 3. HTTP Status Codes
- `200 OK`: Successful GET, PATCH, DELETE.
- `201 Created`: Successful POST (resource created).
- `400 Bad Request`: Validation failure or malformed payload.
- `401 Unauthorized`: Missing or invalid JWT / API Key.
- `403 Forbidden`: Authenticated, but lacks ownership permission.
- `404 Not Found`: Resource does not exist.
- `500 Internal Server Error`: Unhandled backend exception.

## 4. Error Handling
- Use a global error handling middleware in Express (`app.use((err, req, res, next) => {...})`).
- Throw custom `AppError` classes containing HTTP status codes and logical error codes in the Service layer.

## 5. Logging
- Use a structured logger (e.g., `winston` or `pino`).
- Log format should include timestamp, level, context, and message.
- Do not log sensitive data (passwords, JWTs, API Keys).

## 6. Validation
- Use `zod` or `joi` schemas mapped inside middleware to validate all incoming requests before they reach controllers.
