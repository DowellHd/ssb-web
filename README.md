# Smart Strategies Builder (SSB) — Frontend

**AI-Powered Financial Decision Intelligence Platform**

SSB is a risk-first, explainable financial intelligence platform. This repository contains the web frontend.

> **Note:** SSB does NOT execute trades, generate buy/sell recommendations, or promise returns. It provides educational insights and risk analytics only.

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

Perfect for showcasing the UI without any infrastructure:

```bash
# Set demo mode in .env.local
echo "NEXT_PUBLIC_DEMO_MODE=true" >> .env.local

# Start the app
npm run dev
```

All API calls will return realistic mock data. See [docs/DEMO_MODE.md](docs/DEMO_MODE.md) for details.

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
| `NEXT_PUBLIC_DEMO_MODE` | Enable demo mode | No |
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
