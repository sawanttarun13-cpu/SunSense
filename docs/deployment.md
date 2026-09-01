# SunSense Deployment Guide

This guide walks through deploying the SunSense project using the specialized stack: **Neon** (Database), **Render** (Backend), and **Vercel** (Frontend).

---

## 1. Database: Neon (PostgreSQL)

1. **Create a Project**: Go to your Neon console and create a new project (e.g., `sunsense-db`).
2. **Get Connection String**: Once created, go to the **Dashboard** and copy the Postgres connection string. It will look something like this:
   `postgresql://username:password@ep-cool-sun-123456.us-east-2.aws.neon.tech/neondb?sslmode=require`
3. **Save it**: Keep this string handy. We will need it for the backend in the next step.

> **Tip:** You do not need to manually create tables in Neon. The backend will automatically push the schema using Prisma during deployment.

---

## 2. Backend: Render (Node.js + WebSockets)

1. **Create Web Service**: Go to the Render dashboard, click **New +**, and select **Web Service**.
2. **Connect Repository**: Connect your GitHub account and select the `SunSense` repository.
3. **Configure Settings**:
   - **Name**: `sunsense-backend`
   - **Root Directory**: `backend` (This is crucial, as our backend is in a subfolder).
   - **Environment**: `Node`
   - **Build Command**: `npm install && npx prisma generate`
   - **Start Command**: `npm run start` (or `npx ts-node src/app.ts` depending on your setup).
4. **Environment Variables**: Scroll down to the Environment section and add the following variables:
   - `DATABASE_URL` = *(Paste the Neon connection string from Step 1)*
   - `PORT` = `5000`
   - `JWT_SECRET` = *(Generate a random long string, e.g. `your-super-secret-key-123`)*
   - `NODE_ENV` = `production`
5. **Deploy**: Click **Create Web Service**. 

> **Important:** Once Render finishes deploying, it will give you a public URL (e.g., `https://sunsense-backend.onrender.com`). Copy this URL—you will need it for the frontend!

---

## 3. Frontend: Vercel (React + Vite)

1. **Add New Project**: Go to your Vercel dashboard and click **Add New -> Project**.
2. **Import Repository**: Import the `SunSense` repository from GitHub.
3. **Configure Settings**:
   - **Framework Preset**: Vercel should automatically detect **Vite**.
   - **Root Directory**: Leave it as the default (root folder) since the React app is at the root.
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. **Environment Variables**: Open the Environment Variables section and add your backend URL:
   - `VITE_API_URL` = *(Paste your Render backend URL here, e.g., `https://sunsense-backend.onrender.com`)*
5. **Deploy**: Click **Deploy**. Vercel will build the React app and give you a live public URL.

---

## 4. Final Verification

1. Go to your new **Vercel** URL in the browser.
2. The dashboard should load and successfully connect to the Render backend (and through that, to the Neon database).
3. **Firmware Update**: For the actual IoT devices, you will need to update the `API_URL` in the firmware code (`SunSense_Firmware/src/config/firmware_config.h`) to point to your new **Render** URL so the physical device knows where to send data.
