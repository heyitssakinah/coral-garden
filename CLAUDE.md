# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Run Commands

```bash
# Install all dependencies (run both)
npm install
cd client && npm install

# Development (requires Vercel CLI: npm i -g vercel)
npm run dev                 # Runs vercel dev — serves frontend + API locally

# Production build
npm run build               # Builds React into client/dist/

# Lint the client
npm run lint
```

## Deployment

Deployed on **Vercel** (free tier). Configuration in `vercel.json`.

- **Frontend**: Vite builds `client/dist/`, served as static files by Vercel
- **API**: Vercel Serverless Functions in `api/` directory
- **Database**: **Turso** (libSQL) — cloud-hosted SQLite-compatible database
- **Environment variables** (set in Vercel dashboard):
  - `TURSO_DATABASE_URL` — Turso database URL
  - `TURSO_AUTH_TOKEN` — Turso auth token

## Architecture

This is a two-package monorepo: a React frontend in `client/` and Vercel Serverless Functions in `api/`.

### Backend (`api/`)
- **Vercel Serverless Functions** handling `/api/corals` (GET + POST in one file)
- **Turso** via `@libsql/client` — cloud SQLite database, persistent across deploys
- Input validation on image data (must be `data:image/png;base64,...`, max 500KB), author name sanitization (HTML entity stripping, 30 char limit)
- Security headers configured in `vercel.json`

### Frontend (`client/`)
- **React 19** + **Vite 6** + **Tailwind CSS 4** (via `@tailwindcss/vite` plugin)
- Icons from **lucide-react** (not inline SVGs)
- API calls use relative `/api` paths — `vercel dev` routes these to local serverless functions

### Key Components
- `App.jsx` — state management, API calls, orchestration
- `DrawingStudio.jsx` — HTML5 canvas drawing tool with brush/eraser/undo, exports PNG data URL
- `CoralReef.jsx` — ocean floor scene where corals are randomly scattered (seeded random from coral ID for stable positions)
- `Bubbles.jsx` — ambient CSS-animated background bubbles

### API Endpoints
- `GET /api/corals?page=1&limit=20` — paginated coral list (newest first)
- `POST /api/corals` — submit `{ image_data, author_name }`

## Version Constraints

`@tailwindcss/vite` does not support Vite 8. The client must use `vite@^6.0.0` and `@vitejs/plugin-react@^4.3.0`. Do not upgrade these without checking `@tailwindcss/vite` compatibility.
