# SunSense Project

This is the main repository for the SunSense IoT UV Tracking Dashboard.

## 🚨 CRITICAL PROJECT ROADMAP
**DO NOT CHANGE THE PHASE ORDER WITHOUT EXPLICIT PROJECT OWNER APPROVAL.**

The single source of truth and authoritative roadmap for this project is located at:
👉 **[docs/SUNSENSE_FINAL_ROADMAP.md](./docs/SUNSENSE_FINAL_ROADMAP.md)**

All future AI agents and developers MUST read the final roadmap before modifying this repository, and MUST strictly follow the designated phase order.

---

## Running the Code

### Frontend
```bash
npm i
npm run dev
```

### Backend
```bash
cd backend
npm i
npx prisma generate
npm run dev
```