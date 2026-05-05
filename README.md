# Spark Social (React + Node)

Frontend: Vite + React  
Backend: Node HTTP + WebSocket

## 1) Local Run

```bash
npm install
npm run backend
# new terminal
npm run dev
```

Frontend default: `http://localhost:5173`  
Backend health: `http://localhost:4000/api/health`

## 2) GitHub Upload

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <YOUR_GITHUB_REPO_URL>
git push -u origin main
```

## 3) Backend on Render

This repo includes `render.yaml` for backend service setup.

Render settings:
- Build Command: `npm ci`
- Start Command: `npm run backend`
- Health Check Path: `/api/health`

Environment variables on Render:
- `ACCESS_TOKEN_SECRET`
- `REFRESH_TOKEN_SECRET`
- `RAZORPAY_KEY_ID` (optional)
- `RAZORPAY_KEY_SECRET` (optional)
- `CORS_ALLOWED_ORIGINS` (comma separated; include your Vercel URL)
- `WS_ALLOWED_ORIGINS` (comma separated; usually same as CORS list)
- `MAX_JSON_BODY_BYTES` (optional, default `262144`)
- `MAX_JSON_DEPTH` (optional, default `12`)
- `MAX_JSON_ARRAY_ITEMS` (optional, default `600`)
- `MAX_JSON_TOTAL_KEYS` (optional, default `4000`)
- `SECURITY_AUDIT_MAX_ENTRIES` (optional, default `3000`)

After deploy, note your backend URL:
- Example: `https://spark-social-backend.onrender.com`

## 4) Frontend on Vercel

This repo includes `vercel.json` for Vite + SPA routing.

In Vercel project environment variables, add:
- `VITE_API_BASE_URL=https://<your-render-service>.onrender.com/api`
- `VITE_USE_MOCK_API=false`

Then deploy from GitHub import (recommended) or CLI.

## 5) Important Notes

- `.env` is ignored from git; use `.env.example` as reference.
- `backend/data/local-storage.json` is runtime data and ignored.
- Render free tier can sleep when idle, first API hit can be slow.
- Admin can inspect security events at `GET /api/security/audit?limit=200`.
