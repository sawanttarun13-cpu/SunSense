# Backend Folder Structure

The project follows a modular, feature-based architecture utilizing Controller-Service-Repository patterns.

```text
src/
├── config/             # Environment variables and database config
├── controllers/        # Express route handlers (Req/Res logic)
│   ├── auth.controller.ts
│   ├── device.controller.ts
│   ├── reading.controller.ts
│   └── dashboard.controller.ts
├── database/           # Prisma schema, migrations, seeders
│   ├── schema.prisma
│   └── migrations/
├── middleware/         # Auth, Error handling, Rate limiting
│   ├── requireAuth.ts
│   ├── requireDeviceAuth.ts
│   └── validateRequest.ts
├── models/             # Interfaces and Type definitions
├── repositories/       # Database access layer (Prisma abstractions)
│   ├── uvReading.repo.ts
│   └── alert.repo.ts
├── routes/             # Express router definitions
│   ├── auth.routes.ts
│   └── api.routes.ts
├── services/           # Business logic and complex calculations
│   ├── calculation.service.ts
│   ├── smartAlert.service.ts
│   └── sync.service.ts
├── utils/              # Helper functions (Math, Timestamps)
├── app.ts              # Express application setup
└── server.ts           # HTTP server initialization
```

## Layer Responsibilities
1. **Routes**: Define HTTP methods and paths. Forward to Controllers.
2. **Controllers**: Parse input, call Services, return formatted JSON. No business logic.
3. **Services**: Core business logic (SED math, burn time, smart alert trigger). Calls Repositories.
4. **Repositories**: Direct database interaction via Prisma. Isolates DB logic from Services.
