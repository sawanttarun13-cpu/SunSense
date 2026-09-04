# ☀️ SunSense IoT UV Tracking Platform

Welcome to the **SunSense** project! This repository contains the complete source code for the SunSense ecosystem, a full-stack IoT platform designed to track real-time UV exposure, calculate sun safety metrics, and manage physical UV sensor devices.

This README serves as the primary developer handover guide to get you up and running quickly.

---

## 🏗️ System Architecture

The project is divided into three main pillars:

1. **Frontend (`/src`)**: A responsive, modern web application built with React (Vite), Tailwind CSS, and Framer Motion. It provides dashboards, historical charts, real-time device control, and sun safety analytics.
2. **Backend (`/backend`)**: A robust Node.js + Express REST API. It handles authentication, IoT device data ingestion, complex UV exposure calculations (using the Sunscreen Engine), and database management via Prisma ORM (backed by Supabase/PostgreSQL).
3. **Firmware (`/firmware`)**: C++ source code designed for ESP8266/ESP32 microcontrollers. It reads analog data from the GUVA-S12SD UV sensor, manages WiFi connectivity, and securely syncs data to the backend via HTTPS and WebSockets.

> 📚 **Note:** For deep technical details on database schemas, business logic, and API endpoints, please review the documentation in the `/docs` directory.

---

## 🚀 Getting Started

### 1. Prerequisites
Ensure you have the following installed on your machine:
- **Node.js** (v18 or higher recommended)
- **npm** or **pnpm**
- **PlatformIO** (VS Code Extension - *only required if you are flashing the firmware*)

### 2. Environment Configuration
You need to set up environment variables for both the frontend and backend.

**Frontend:**
Create a `.env` file in the root directory:
```bash
cp .env.example .env
```
Ensure it contains:
```env
VITE_API_URL=http://localhost:5000/api/v1
```

**Backend:**
Navigate to the `backend/` folder and create a `.env` file:
```bash
cd backend
cp .env.example .env
```
*You will need to request the Supabase Database URL (DATABASE_URL) and JWT Secret from the project owner to populate this file.*

---

## 💻 Running the Application Locally

You will need to run the frontend and backend simultaneously in two separate terminal windows.

### Starting the Backend Server
```bash
cd backend
# Install dependencies
npm install

# Generate Prisma Client (required before running)
npx prisma generate

# Start the development server
npm run dev
```
The backend will run on `http://localhost:5000`.

### Starting the Frontend Client
Open a new terminal window at the root of the project:
```bash
# Install dependencies
npm install

# Start the Vite development server
npm run dev
```
The frontend will run on `http://localhost:5173`.

---

## 🔐 Authentication & API Architecture

### Token System
The application uses a dual-token security model:
- **Refresh Token (7 days):** Stored securely as an `HttpOnly` cookie. Never accessible to JavaScript. Automatically sent with backend requests.
- **Access Token (15 min):** A JWT kept purely in-memory in the frontend.

### Axios API Client
All API requests in the frontend are routed through a single, configured Axios instance located at `src/lib/apiClient.ts`. 
- **Silent Refresh:** If an API call fails with a `401 Unauthorized`, the client automatically attempts to refresh the token in the background using the HttpOnly cookie and retries the original request seamlessly.

---

## 📡 Hardware (Firmware) Setup

If you are working on the physical UV sensor device:

1. Open the `/firmware/SunSense_Firmware` folder in VS Code with the **PlatformIO** extension installed.
2. Edit `src/config/firmware_config.h` to update your WiFi credentials and `DEVICE_API_KEY`.
3. Connect your ESP8266 board via USB.
4. Click the **PlatformIO: Upload** button (the right-arrow icon in the bottom status bar) to compile and flash the firmware.

---

## 🤝 Handover Notes & Maintenance

- **UI/UX Components:** We heavily utilize `lucide-react` for icons, `framer-motion` for animations (including the beautiful splash screen and loading states), and `recharts` for historical data visualization.
- **Database Changes:** If you modify `backend/prisma/schema.prisma`, you MUST run `npx prisma generate` and `npx prisma db push` (or `migrate dev`) to sync the changes.
- **Deployments:** The frontend is configured for deployment on Vercel, and the backend is configured for deployment on Render. Ensure environment variables are mirrored in those deployment environments.

Good luck, and enjoy working on SunSense by sameer sir ! ☀️