# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Run Commands

```bash
# Install all dependencies (run both)
npm install
cd client && npm install

# Development (two terminals)
npm run dev:server          # Express API on :3000
npm run dev:client          # Vite dev server on :5173 (proxies /api to :3000)

# Production build & run
npm run build               # Builds React into client/dist/
npm start                   # Serves everything on :3000

# Lint the client
cd client && npm run lint
```

## Architecture

This is a two-package monorepo: a CommonJS Express backend at the root and an ES module React frontend in `client/`.

### Backend (`server.js`)
- **Express 5** with `/{*splat}` wildcard syntax (not Express 4's `*`)
- **SQLite** via `better-sqlite3` — database file is `corals.db` in project root, auto-created on first run
- **Security**: helmet (CSP), express-rate-limit (5 submissions/min), input validation on image data (must be `data:image/png;base64,...`, max 500KB), author name sanitization (HTML entity stripping, 30 char limit)
- Serves `client/dist/` as static files in production with SPA catch-all fallback

### Frontend (`client/`)
- **React 19** + **Vite 6** + **Tailwind CSS 4** (via `@tailwindcss/vite` plugin)
- Icons from **lucide-react** (not inline SVGs)
- Vite proxies `/api` to `localhost:3000` during development

### Key Components
- `App.jsx` — state management, API calls, orchestration
- `DrawingStudio.jsx` — HTML5 canvas drawing tool with brush/eraser/undo, exports PNG data URL
- `CoralReef.jsx` — ocean floor scene where corals are randomly scattered (seeded random from coral ID for stable positions)
- `Bubbles.jsx` — ambient CSS-animated background bubbles

### API Endpoints
- `GET /api/corals?page=1&limit=20` — paginated coral list (newest first)
- `POST /api/corals` — submit `{ image_data, author_name }`, rate-limited

## Version Constraints

`@tailwindcss/vite` does not support Vite 8. The client must use `vite@^6.0.0` and `@vitejs/plugin-react@^4.3.0`. Do not upgrade these without checking `@tailwindcss/vite` compatibility.
