# SunSense Backend

## Project Overview
This is the backend API for the SunSense UV monitoring system. It provides REST APIs for devices, analytics, smart alerts, and dashboard features.

## Folder Structure
Matches the official architecture documented in `docs/backend/10_Backend_Folder_Structure.md`.

## Installation
```bash
npm install
```

## Environment Variables
Copy `.env.example` to `.env` and fill in the values.

## Available Scripts
- `npm run dev`: Starts the development server using ts-node-dev.
- `npm run build`: Compiles TypeScript to JavaScript in the `/dist` folder.
- `npm start`: Runs the compiled production code.
- `npm run lint`: Runs ESLint to check for code issues.
- `npm run format`: Formats code using Prettier.
