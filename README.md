# Smart Strategies Builder (SSB) — Frontend

**AI-Powered Financial Decision Intelligence Platform**

SSB is a risk-first, explainable financial intelligence platform. This repository contains the web frontend.

> **Note:** SSB does NOT execute trades, generate buy/sell recommendations, or promise returns. It provides educational insights and risk analytics only.

## Demo

**[▶ Watch Demo Video](#)** <!-- TODO: replace # with the demo video URL -->

![Next.js](https://img.shields.io/badge/Next.js-14-000000?logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss&logoColor=white)
![Zustand](https://img.shields.io/badge/State-Zustand-433E38)
![React Query](https://img.shields.io/badge/Data-React_Query-FF4154?logo=reactquery&logoColor=white)
![Playwright](https://img.shields.io/badge/E2E-Playwright-2EAD33?logo=playwright&logoColor=white)

The whole app runs locally with **no backend, database, Redis or API keys**. In demo mode every API request is answered in the browser by a deterministic mock layer, so the app looks the same on every run.

### Run the demo

```bash
# 1. Clone
git clone https://github.com/DowellHd/ssb-web.git
cd ssb-web

# 2. Install (Node.js 20+)
cp .env.demo .env.local && npm install

# 3. Run
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), click **Try It Free — No Signup** (or log in with any email and password) and explore.

**What you get**

- Market regime detection, portfolio risk analytics (VaR, CVaR, drawdown, correlation) and stress testing, computed from the holdings you enter
- A linked-brokerage portfolio, trade ideas, tax-loss harvesting and an order-prep workflow
- A paper-trading account with a live ledger: place, cancel and reset orders, plus options paper trading
- A signal feed, news, crypto prices, and the learning library
- The account is on the Pro plan so every feature is visible

**What demo mode is, and isn't**

- All data is synthetic and deterministic. Prices are consistent across charts, quotes and positions, but they are not real market data and the "performance" shown is fictional.
- Changes you make (orders, watchlists, journal entries) live in memory and reset when the page reloads.
- Community, enterprise, backtesting and a few other areas return valid but empty responses rather than detailed data.
- Plaid, Stripe, analytics and error reporting are switched off. "Connect a broker" adds a sample account instead of opening Plaid, and checkout stays on-site.
- Demo mode works with `npm run dev` only. Production builds refuse to start with it enabled.

**Switching back to production:** delete `.env.local` (or set `NEXT_PUBLIC_DEMO_MODE=false`). No code changes are needed; the real API client and services are untouched, just bypassed. See [docs/DEMO_MODE.md](docs/DEMO_MODE.md) for how it works and how to extend the mock data.

## Features

- **Market Regime Detection** — Understand if the market is bullish, bearish, sideways, or in crisis mode
- **Portfolio Risk Analytics** — VaR, CVaR, drawdown analysis, and correlation matrices
- **Stress Testing** — Simulate your portfolio against historical crises (2008, COVID) or custom scenarios
- **Explainable AI** — Every insight comes with confidence scores and clear explanations
- **Demo Mode** — Experience the platform without a backend connection

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** TailwindCSS + shadcn/ui
- **State:** Zustand + React Query
- **Charts:** TradingView Lightweight Charts, Recharts

## Quick Start

### Prerequisites

- Node.js 20+
- npm 9+

### Local Development

```bash
# Clone the repository
git clone https://github.com/DowellHd/ssb-web.git
cd ssb-web

# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### Demo Mode (No Backend Required)

See the [Demo](#demo) section above: `cp .env.demo .env.local && npm install && npm run dev`.

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript type checking |

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | Yes (unless demo mode) |
| `NEXT_PUBLIC_API_PREFIX` | API path prefix | Yes (unless demo mode) |
| `NEXT_PUBLIC_DEMO_MODE` | Serve mock data locally (dev only) | No |
| `NEXT_PUBLIC_BACK_SOON` | Show the "Back Soon" page for every route (defaults to on; set `false` to render the app) | No |
| `NEXT_PUBLIC_GA_ID` | Google Analytics ID | No |

See `.env.example` for all available options.

## Project Structure

```
ssb-web/
├── src/
│   ├── app/              # Next.js App Router pages
│   │   ├── auth/         # Authentication pages
│   │   └── dashboard/    # Dashboard pages
│   ├── components/       # Reusable UI components
│   │   └── ui/           # shadcn/ui components
│   └── lib/
│       ├── api/          # API client utilities
│       ├── demo-api/     # Demo mode: route table, mock data, catch-all, tests
│       └── mock-data.ts  # Demo mode data generators
├── docs/                 # Documentation
└── public/               # Static assets
```

## Local Auth Setup

### Prerequisites

1. **Backend running** via Docker at `http://localhost:8000`
2. **Database migrations applied** (required for login to work)
3. **Frontend** `.env.local` configured

### Step-by-Step Setup

```bash
# 1. Start backend (from ssb-api directory)
cd ../ssb-api
docker compose up -d

# 2. Run database migrations (first time only)
docker compose exec api alembic upgrade head

# 3. Create .env.local in ssb-web
cd ../ssb-web
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

# 4. Start frontend
npm run dev
```

### Allowed Dev Ports

The backend CORS is configured to allow:
- `http://localhost:3000`
- `http://localhost:3001`

If port 3000 is busy, Next.js will use 3001 automatically.

### Testing the Connection

```bash
# 1. Verify backend health
curl http://localhost:8000/healthz

# 2. Test login endpoint (register a user first via /auth/signup page)
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  --data-raw '{"email":"youruser@example.com","password":"YourPass123@"}'

# 3. Test /me with the returned token
curl http://localhost:8000/api/v1/auth/me \
  -H "Authorization: Bearer <access_token_from_login>"
```

### Common Failure Modes

| Symptom | Cause | Fix |
|---------|-------|-----|
| `Network Error` / `ERR_CONNECTION_REFUSED` | Backend not running | `docker compose up -d` in ssb-api |
| `500 Internal Server Error` on login | Database migrations not applied | `docker compose exec api alembic upgrade head` |
| `CORS error` in browser console | Origin not in ALLOWED_ORIGINS | Add your port to `ALLOWED_ORIGINS` in ssb-api/.env |
| `401 Unauthorized` on `/auth/me` | Token not being sent | Check localStorage has `access_token` |
| Login works but page doesn't redirect | Frontend routing issue | Check browser console for JS errors |

### Auth Flow Summary

1. **Login**: `POST /api/v1/auth/login` → returns `access_token` (stored in localStorage) + sets `refresh_token` cookie (httpOnly)
2. **Authenticated requests**: `Authorization: Bearer <access_token>` header (handled by api-client)
3. **Token refresh**: `POST /api/v1/auth/refresh` uses the httpOnly cookie to get a new access token

### Debug Tips

- Browser DevTools → Network tab → verify request/response headers
- Check for `Set-Cookie: refresh_token=...` in login response
- Verify `Authorization` header is present on subsequent requests
- Use Demo Mode (`NEXT_PUBLIC_DEMO_MODE=true`) to test UI without backend

## Documentation

- [Architecture Overview](docs/architecture-overview.md) — System design and data flow
- [Demo Mode](docs/DEMO_MODE.md) — How to use demo mode
- [OpenAPI Specification](docs/openapi.md) — API documentation

## Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Docker

```bash
# Build image
docker build -t ssb-web .

# Run container
docker run -p 3000:3000 ssb-web
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Legal Disclaimer

Smart Strategies Builder is designed for educational and research purposes only. It is NOT financial advice. The platform does not execute trades, provide investment recommendations, or guarantee any returns. Users are responsible for their own investment decisions. Always consult with a qualified financial advisor before making investment decisions.

## License

This project is licensed under the MIT License — see [LICENSE](LICENSE) for details.

## Security

For security vulnerabilities, please see [SECURITY.md](SECURITY.md).
