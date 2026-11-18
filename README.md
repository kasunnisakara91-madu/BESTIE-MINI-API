# BESTIE MINI API

Production-ready API proxy gateway, developer documentation portal, and interactive testing console built with **Node.js**, **Express.js**, **React**, and **Tailwind CSS**, ready for Railway deployment.

## Architecture

- **Backend (`backend/` + `server.ts`)**
  - `backend/config/env.ts` — Environment configuration (`PORT`, `LAKIYA_API_BASE_URL`, `LAKIYA_API_KEY`, rate limit & timeout settings).
  - `backend/config/endpoints.ts` — Registry of all 17 endpoints across 6 categories.
  - `backend/middleware/` — Express rate limiting (`express-rate-limit`), query parameter validation, API 404, and global error handler with key redaction.
  - `backend/services/` — Upstream HTTP proxy (`?api_key=` authentication strictly on server) and live upstream health prober.
  - `backend/controllers/` & `backend/routes/` — Express route handlers for all 17 proxy routes plus `/health` and `/api/system/*`.
  - `server.ts` — Unified Express entry point serving Vite middleware in development and the built `dist/` bundle in production with graceful `SIGINT`/`SIGTERM` shutdown.
- **Frontend (`src/`)**
  - Overview dashboard with live `ONLINE` / `OFFLINE` status, real backend metrics, and API categories.
  - Complete API documentation with search, category filters, parameter tables, multi-language examples (JSON, JavaScript, Node.js Axios, Python, cURL), and inline live testing.
  - Interactive API Testing Console with category/endpoint selection, dynamic query parameters, syntax-highlighted JSON output, and persistent request history.
  - Health & Error Logs view for real-time gateway diagnostics.

## Integrated Endpoints (17 Total)

- **Sinhalasub API**: `/sinhalasub/search`, `/sinhalasub/tvshow`, `/sinhalasub/episode-info`, `/sinhalasub/info`, `/sinhalasub/download2`
- **Cinesubz API**: `/cinesubz/search`, `/cinesubz/details`, `/api/tvshow`, `/api/episode`, `/dl/cinesubz`
- **Chithrapata API**: `/chithrapata/search`, `/chithrapata/info`
- **Past Papers API**: `/pastpapers/search`, `/pastpapers/info`
- **Tinkiri API**: `/tinkiri/search`, `/tinkiri/details`
- **YouTube MP3 API**: `/api/ytmp3`

## Local Development

1. Copy `.env.example` to `.env` and set your `LAKIYA_API_KEY`.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run development server:
   ```bash
   npm run dev
   ```

## Railway Deployment

1. Connect your repository to Railway.
2. Configure Railway **Variables**:
   - `NODE_ENV=production`
   - `LAKIYA_API_BASE_URL=https://zara.laksidu.site`
   - `LAKIYA_API_KEY=your_private_api_key`
3. Railway uses `npm run build` (`vite build`) and `Procfile` (`web: npm start`, running `node server.ts` on `process.env.PORT`).
4. Health check endpoint: `GET /health`.
