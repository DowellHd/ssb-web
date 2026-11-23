# Demo Mode

Demo mode runs the whole frontend locally with no backend, database, Redis or API keys. Every request the app would send to the API is answered in the browser by a deterministic mock layer in `src/lib/demo-api/`.

## Quick start

```bash
cp .env.demo .env.local
npm install
npm run dev
```

Open http://localhost:3000, click **Try It Free — No Signup**, or log in with any email and password.

To return to production behaviour, delete `.env.local` (or set `NEXT_PUBLIC_DEMO_MODE=false`). Nothing else changes: the real API client and every real service integration are still in the code, just bypassed while the flag is on.

## The two flags

| Variable | Demo value | Effect |
|----------|-----------|--------|
| `NEXT_PUBLIC_DEMO_MODE` | `true` | `api-client.ts` answers requests from `demo-api` instead of the network |
| `NEXT_PUBLIC_BACK_SOON` | `false` | Bypasses the "Back Soon" page so the real app renders. It defaults to **on** in production |

`next.config.js` deliberately refuses to build for production with `NEXT_PUBLIC_DEMO_MODE=true`, so demo mode only runs with `npm run dev`. `.env.demo` holds both flags plus blank values for every external service key; do not put real keys in it, because it is committed.

## How it works

```
React components ──> apiClient (axios)
                        │
        NEXT_PUBLIC_DEMO_MODE=true ?
          ├─ yes ─> import('./demo-api')  (lazy, code-split)
          │           ├─ route table: hand-written mocks
          │           └─ catch-all:   empty-but-valid response
          └─ no ──> real HTTP request to the backend
```

- **`src/lib/api-client.ts`** intercepts each request in demo mode. The demo layer is imported lazily, so it is never loaded when the flag is off.
- **No request reaches the network.** Anything without a hand-written mock falls through to the catch-all, which returns a value shaped like the endpoint's declared TypeScript return type (arrays are `[]`, counts are `0`, required objects are filled in). Pages render their empty states instead of failing.
- **Simulated errors.** A route can `throw new DemoHttpError(400, 'Insufficient buying power')`. The client turns it into an axios-style rejection, so the UI's normal error handling runs.

## Layout of `src/lib/demo-api/`

| File | Purpose |
|------|---------|
| `index.ts` | Entry points: `resolveDemoRequest` (no latency, used by tests) and `handleDemoRequest` (adds a short deterministic delay) |
| `router.ts` | Route table: patterns like `/paper/orders/:id`. The match with the fewest `:params` wins |
| `routes/*.ts` | Hand-written mocks, one file per area (see below) |
| `catch-all.ts`, `catch-all-shapes.json` | Fallback responses for every endpoint without a mock |
| `prng.ts` | Seeded random numbers, the demo clock, id helpers |
| `market.ts` | The single source of truth for prices, bars, quotes and correlations |
| `analytics.ts`, `quant.ts` | Real calculations: risk, stress scenarios, correlation, attribution, OLS, efficient frontier, indicators, Monte Carlo, GARCH |
| `fundamentals.ts` | Sample fundamentals table behind the screener (synthetic, tuned so each preset screen has matches) |
| `paper-state.ts`, `portfolio-data.ts`, `signals-data.ts`, `options-math.ts` | Shared state and data for the routes |
| `__tests__/` | Vitest tests |

Areas with detailed mocks: auth, billing and entitlements, settings, market data, signals, trading and paper trading, options, portfolio and stress testing, linked brokers, trade ideas, order prep, compliance, regime, risk, simulation, strategy, crypto, news, learn, analytics (optimisation, technicals, factors, benchmarking, Monte Carlo, sector rotation, DCF, fundamentals, earnings calendar), the stock screener, and predictive analytics (GARCH, anomalies, sentiment, ESG, earnings surprise). Everything else (community, enterprise, backtests, alternatives, fixed income, global markets and so on) uses the catch-all and shows empty states.

## Determinism

Demo data is identical on every run, so screenshots and recordings are repeatable.

- No `Math.random()` in demo data. Values come from a PRNG seeded by a string key (`seededRng('bars:AAPL')`).
- Dates are anchored to the **start of the current UTC day**, so relative timestamps are stable within a day and never in the future. Values do not change; date labels roll forward daily.
- **Prices:** `market.ts` pins each symbol's current price (the `UNIVERSE` table) and synthesises history backwards from it with a factor model: market + sector + idiosyncratic noise. A symbol therefore has one price in quotes, charts, positions and orders, and correlations and betas behave like real markets.
- **`SERIES_SEED`** in `market.ts` selects *how* history got to today's prices. It was chosen so the demo account tells a presentable story (positive paper return, mixed winners and losers, a bull regime). Changing it changes every chart and the paper account's P&L. The numbers are fictional.
- **State.** Paper trading, watchlists, journals, trade ideas and similar records are mutable in memory and reset on page reload. Newly created records get sequential ids (`order-1001`, …).

## Customising

**Change the demo plan.** `DEMO_PLAN` in `routes/account.ts` sets the plan labels (default `pro`). The entitlement values in that file are hardcoded as Pro, so showing gated states also means editing them.

**Change prices or add a symbol.** Edit the `UNIVERSE` table in `market.ts`. Unknown symbols a user types still get a stable synthetic profile.

**Give an endpoint real data.** Add a route; real routes always win over the catch-all:

```ts
// src/lib/demo-api/routes/community.ts
import { get, type DemoRoute } from '../router';

export const communityRoutes: DemoRoute[] = [
  get('/community/ideas', () => ({ ideas: [/* … */], total: 0, page: 1, page_size: 20 })),
];
```

Then spread it into `ROUTES` in `routes/index.ts`. Match the shape declared in `src/lib/api/*.ts` — the TypeScript return type is the contract.

**Regenerate the catch-all shapes.** `catch-all-shapes.json` was produced by a one-off script that walks `src/lib/api/*.ts` with the TypeScript compiler and emits an empty value for each endpoint's return type. The file is safe to edit by hand. New endpoints added to the API client need a new entry (or a real route); until then the catch-all returns `{}` for reads. Every catch-all response logs a `[demo] empty response: GET /path` line (or `no mock at all` when not even a shape exists) at debug level in the dev console, so you can see exactly which endpoints a click-through still serves empty.

## External services in demo mode

| Service | Behaviour |
|---------|-----------|
| Backend API | Replaced by `demo-api` |
| Plaid Link | The brokers page renders a "Connect a broker (demo)" button that adds a sample account. `usePlaidLink` is never called, because it loads Plaid's script from its CDN even without a token |
| Stripe | `/billing/checkout` returns an on-site success URL; the billing portal link points back to the billing page |
| Sentry, PostHog, GA4 | Explicitly off when the demo flag is set, even if keys exist in the environment |
| WebSocket | `NEXT_PUBLIC_WS_URL` is not used anywhere in `src/`, so there is nothing to disable |
| MFA setup QR code | Rendered locally with `qrcode.react` (in production as well) |

Still network-dependent: the Inter font is fetched from Google Fonts by `next/font` when the dev server starts, and YouTube embeds on learn module pages load only when such a page is opened.

## Testing

```bash
npx vitest run src/lib/demo-api
```

The tests check that every known endpoint resolves, that no mock calls `Math.random`, that reads are deterministic, that prices agree across quotes, bars and positions, and that the paper ledger, analytics and market model behave. There is no `test` script in `package.json`.

## Troubleshooting

| Symptom | Cause / fix |
|---------|-------------|
| The "Back Soon" page appears for every route | `NEXT_PUBLIC_BACK_SOON` is not `false`. Copy `.env.demo` to `.env.local` and restart `npm run dev` |
| Real network requests / CORS errors | `NEXT_PUBLIC_DEMO_MODE` is not `true`. Next.js reads env files at startup, so restart after editing |
| Build fails with a demo-mode error | Expected: production builds refuse demo mode. Use `npm run dev` |
| A page is empty | It uses the catch-all. Add a route as shown above |
| `[demo] empty response: …` / `no mock at all: …` in the console (debug level) | The endpoint is served by the catch-all. Add a route to give it real data |

## Security

Demo mode is client-side only. Its tokens are placeholders that no backend validates; never enable it in an environment that handles real users or data.
