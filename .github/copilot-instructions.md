# Copilot Instructions for this Repo

Purpose: enable AI agents to ship features quickly and safely in this codebase.

## Big Picture
- Full-stack Vite + React SPA with an external Express API and SQLite (via better-sqlite3). Frontend and backend run as separate processes in dev.
- Frontend lives in `client/` (React 18, React Router 6, Tailwind, Radix), backend in `server/`, shared types in `shared/`.
- During `pnpm dev`, Vite proxies `/api/*` to an external Express server (default `http://localhost:4000`).
- Production: build SPA to `dist/spa` and server to `dist/server/node-build.mjs`; `pnpm start` serves SPA + API from a single Node process (`server/node-build.ts`).
- Netlify option: API is also exposed as a serverless function (`netlify/functions/api.ts`) with redirects in `netlify.toml`.

## Commands (pnpm)
- `pnpm dev`: run Vite dev server (proxies `/api` to `http://localhost:4000`).
- `pnpm dev:api`: run backend alone on `http://localhost:4000`.
- `pnpm dev:all`: run backend and frontend together (uses `concurrently`).
- `pnpm dev:all:ps`: PowerShell helper (falls back if `concurrently` missing).
- `pnpm build`: build client and server bundles.
- `pnpm start`: run production server (serves built SPA + Express).
- `pnpm test`: run Vitest; `pnpm typecheck`: TS checks; `pnpm format.fix`: Prettier.

## Env & Secrets
- Client Firebase in `client/lib/firebase.ts`: expects `VITE_FIREBASE_*` vars.
- OpenAI on server: set `OPENAI_API_KEY` (see `server/services/openai.ts`).
- Google Image Search (server-side): set `GOOGLE_API_KEY` and `GOOGLE_CX` (or `VITE_` variants) used by `server/routes/image-search.ts`.
- Stripe Terminal: per-user keys persisted in SQLite (`stripe_keys` table) via `/api/stripe-keys` endpoints. No global env needed, but a key pair must be saved per user.

## Data & Auth Conventions
- SQLite DB path: `server/data/bartender.db`. `server/database-wrapper.ts` auto-creates tables and gracefully falls back to a mock DB if `better-sqlite3` is missing (dev resilience).
- API prefix: all backend routes under `/api/*` and registered in `server/index.ts`.
- Auth in dev is pragmatic: many analytics and Stripe routes gate on `authenticateToken`, which derives a user via `Authorization: Bearer <token>` and optional `x-user-id`/`x-username` headers (see `server/middleware/auth.ts`).
- Frontend session uses localStorage flags: `bartender-auth` = `authenticated`, plus `bartender-user`, `bartender-user-id`, `bartender-username`. `client/components/ProtectedRoute.tsx` uses this to guard routes.

## Frontend Patterns
- Routes are defined in `client/App.tsx` with `react-router-dom` and code-split using `lazy()`; pages live in `client/pages/`.
- UI and styling: Tailwind classes, Radix primitives, and shadcn-like components in `client/components/ui/`; global styles in `client/global.css`.
- i18n: simple context + static dictionaries in `client/contexts/I18nContext.tsx` and `client/lib/i18n.ts`; use `useI18n()` and `t` object to access strings.
- API calls: see `client/services/api.ts` (products/recipes patterns) and `client/services/stripe.ts` for Terminal flows.

## Backend Patterns
- Route structure: one file per concern in `server/routes/*.ts`, all registered in `server/index.ts`.
- DB access: use `server/database.ts` (exports the initialized instance from the wrapper). CRUD examples: `server/routes/products.ts`, `server/routes/recipes.ts`.
- AI features (analytics, insights, pairing) use `callOpenAIJSON` to return JSON-safe payloads; see `server/routes/analytics.ts`.
- Stripe Terminal flow: create connection token, create/confirm/cancel PaymentIntents in `server/routes/stripe.ts`. Keys are retrieved per-user from `stripe_keys` (see `server/routes/stripe-keys.ts`).
- Image search is server-only to keep keys safe; client hits `/api/image-search` with a product name.

### Dev Flow
- Start backend: `pnpm dev:api` (listens on `http://localhost:4000`).
- Start frontend: `pnpm dev` (Vite proxies `/api` to backend). To point elsewhere, set `VITE_API_URL` before running Vite.
  - PowerShell example: `powershell -NoProfile -Command "$env:VITE_API_URL='http://localhost:5000'; pnpm dev"`

## Adding Things Quickly
- New API route:
  1) Add handler in `server/routes/my-route.ts`.
  2) Register it in `server/index.ts` under an `/api/...` path.
  3) Optionally share types via `shared/api.ts` and import on both sides.
- New page route: add `client/pages/MyPage.tsx` and register in `client/App.tsx` above the `*` fallback.
- New DB column/table: add to the schema in `server/database-wrapper.ts`. Prefer additive migrations; keep existing code tolerant.

## Testing & Debugging
- Vitest is configured; example test in `client/lib/utils.spec.ts`. Prefer colocated `*.spec.ts`.
- Dev logs: Vite plugin and server print detailed route loading and request logs; check terminal for `[Vite]`/`[Express]`/feature tags.
- If `/api` returns 500 in dev, it’s usually a TypeScript or import error in `server/index.ts` or a route file; the Vite plugin will surface stack traces.

## Deployment Notes
- Standard Node host: `pnpm build && pnpm start` serves everything.
- Netlify: `netlify.toml` builds SPA and maps `/api/*` to the serverless handler in `netlify/functions/api.ts`.

Reference docs and conventions also live in `md_texte/AGENTS.md`.
