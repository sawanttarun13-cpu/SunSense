# SunSense -- Project Charter, Development Rules & Phase Roadmap

## 1. Project Information

**Project Name:** SunSense

**Project Type:** Professional Internship Project (Client Delivery)

**Project Category:** Full Stack IoT Web Application

**Purpose:** Build a production-ready UV Monitoring System for a real
client. The system consists of a portable keychain device and a React
web application. Every implementation must prioritize maintainability,
scalability, readability, documentation, and professional engineering
practices.

------------------------------------------------------------------------

## 2. Approved Technology Stack

### Frontend

-   React
-  TypeScript + TailwindCS

### Backend

-   Node.js
-   Express.js

### Database

-   PostgreSQL

### Hardware

-   ESP8266 NodeMCU
-   ML8511 UV Sensor
-   1.3-inch Display Module
-   Rechargeable Lithium-Ion Battery (3.3V--3.7V, 50--200mA)
-   5V 1A Charging Module

### Communication

-   HTTP POST
-   REST API
-   WebSockets (Phase 7)

------------------------------------------------------------------------

## 3. Architecture

ESP8266 responsibilities: - Read ML8511 sensor - Read ADC - Convert ADC
to voltage - Calculate UV Intensity - Calculate UV Index - Display ONLY
UV Intensity and UV Index - Send readings to backend using HTTP POST

Backend responsibilities: - Receive readings - Store data in
PostgreSQL - Generate analytics - Generate graphs - Calculate Risk
Level - Generate SPF Recommendation - Expose APIs for React dashboard

React responsibilities: - Live dashboard - Historical data - Graphs -
Analytics - Risk level - SPF recommendation - Device monitoring

------------------------------------------------------------------------

## 4. Development Rules

1.  Never skip phases.
2.  Always state the current phase before starting work.
3.  Work ONLY on the current phase.
4.  Never change architecture or technology stack without approval.
5.  Never invent APIs, database schemas or hardware behavior.
6.  Keep code modular, reusable and production-ready.
7.  Explain important architectural decisions.
8.  Fix root causes instead of workarounds.
9.  Test every completed feature.
10. Treat this as a professional client project.

------------------------------------------------------------------------

## 5. Phase Roadmap

Phase 1 -- Foundation

Phase 2 -- Frontend Completion

Phase 3 -- API Design

Phase 4 -- Backend

Phase 5 -- PostgreSQL

Phase 6 -- Authentication (if required)

Phase 7 -- Real-Time Features

Phase 8 -- Hardware Integration

Phase 9 -- Testing & Deployment

------------------------------------------------------------------------

## 6. Phase Completion Protocol

After completing a phase:

-   Stop immediately.
-   Summarize completed work.
-   Report remaining issues.
-   State: "Phase X has been completed successfully."
-   Wait for the user's next prompt.
-   Never automatically start the next phase.

------------------------------------------------------------------------

## 7. Success Criteria

The final application must be production-ready, scalable, maintainable,
documented, tested and suitable for client handover.
