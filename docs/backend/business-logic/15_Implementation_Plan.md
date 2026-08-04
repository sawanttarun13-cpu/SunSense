# Module 15: Implementation Plan (Milestone 5B Blueprint)

## Purpose
Outline the sequential steps for developers to write the code based on these designs.

## Step 1: Stateless Utilities
- Build `Calculations.ts` containing the pure mathematical formulas from Module 14.
- Write unit tests for SED and Burn Time logic.

## Step 2: The Logic Engine
- Build `ExposureLogicService.ts`.
- Implement chronological sorting and the gap-detection algorithm (15-minute rule).
- Implement session creation, updating, and closure.

## Step 3: Device Ingestion Controller
- Build `/api/v1/readings` POST endpoint.
- Connect it to `ExposureLogicService`.

## Step 4: Dashboard Aggregation
- Update `DashboardService` to replace zeroes with real queries.
- Inject `Calculations.ts` to output Burn Time and SPF recommendations dynamically.

## Step 5: Sunscreen & Alerts
- Build Sunscreen endpoints.
- Set up a Cron job for Smart Alerts checking expiration times.

## Step 6: Analytics & History
- Update respective services with grouping and Prisma queries.
