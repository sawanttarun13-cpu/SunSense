Axios configuration# SunSense -- Master Project Reference

## Overview

SunSense is a production-ready IoT UV monitoring keychain for a client.

## Architecture

``` text
ML8511 UV Sensor
        │
        ▼
ESP8266 NodeMCU
 ├── Read Analog Voltage
 ├── Calculate UV Intensity
 ├── Calculate UV Index
 ├── Display on 1.3" OLED
 ├── Read Battery
 ├── Monitor Wi-Fi
 └── If Wi-Fi Available
        │
        ▼
Node.js + Express
        │
   PostgreSQL
        │
 React Dashboard
```

## Hardware

-   ESP8266 NodeMCU
-   ML8511 UV Sensor
-   1.3" OLED Display
-   3.3--3.7V Li-Ion Battery (50--200mAh)
-   TP4056 Charging Module (5V 1A)

## Tech Stack

### Frontend

-   React
-   TypeScript
-   Vite
-   Tailwind CSS
-   React Router
-   Axios
-   Recharts

### Backend

-   Node.js
-   Express.js

### Database

-   PostgreSQL

### Firmware

-   ESP8266 Arduino Framework

## Project Rules

-   Keep UI identical to Figma.
-   Use reusable components.
-   Use TypeScript interfaces.
-   No hardcoded UI data.
-   Production-ready architecture.
-   Frontend, backend and firmware remain modular.

# Development Phases

## Phase 1 ✅

Clone Figma project, install dependencies, fix build errors.

## Phase 1.5 ✅

Refactor folders, reusable components, services, hooks, context,
constants, types.

## Phase 2

Replace hardcoded values with centralized mock JSON. Add loading, empty
and error states.

## Phase 3

Design REST API contract. - GET /dashboard - GET /analytics - GET
/history - GET /alerts - GET /settings - GET /profile - POST
/device/readings

## Phase 4

Build Node.js + Express backend with routes, controllers, middleware and
validation. Return mock responses first.

## Phase 5

Design PostgreSQL schema. Tables: - devices - uv_readings - alerts -
settings - users (optional)

## Phase 6

Connect React to backend using Axios. Replace mock data with API calls.

## Phase 7

Implement WebSockets/Socket.IO for live updates.

## Phase 8

Firmware: - Read ML8511 - Calculate UV Intensity - Calculate UV Index -
Display on OLED - Monitor battery - Sync to backend when Wi-Fi is
available

## Phase 9

Backend Analytics:
- Risk Level
- SPF Recommendation
- Daily/Weekly/Monthly Reports
- Trends
- **Important Calculation Note**: The backend will calculate User UV Exposure Duration and Total UV Dose (SED) by analyzing the timestamps and values of incoming readings. Because the device is wearable/portable, if it records UV > 0, we assume active exposure and integrate these readings over time to generate duration and SED metrics.

## Phase 10

Alerts: - High UV - Extreme UV - Battery Low - Device Offline - SPF
Reminder

## Phase 11

Testing: - Frontend - Backend - Database - Firmware - Offline Sync

## Phase 12

Deployment: - React - Express - PostgreSQL - Environment Variables -
Security - Backups

## Folder Structure

``` text
src/
├── assets/
├── components/
├── pages/
├── services/
├── hooks/
├── context/
├── constants/
├── mockData/
├── types/
├── utils/
├── App.tsx
└── main.tsx
```
