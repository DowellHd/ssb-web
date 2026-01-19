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

## Local Login Debug

If you're having trouble with authentication during local development, follow these steps:

### Prerequisites

1. **Backend running** at `http://localhost:8000`
2. **Frontend running** at `http://localhost:3000`
3. **`.env.local`** configured (see below)

### Required `.env.local` Configuration

```bash
# Create .env.local from example
cp .env.example .env.local

# Verify these values are set:
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_API_PREFIX=/api/v1
NEXT_PUBLIC_DEMO_MODE=false
```

### Testing the Connection

```bash
# 1. Check backend is running and CORS is configured
curl -i http://localhost:8000/api/v1/docs

# 2. Test login endpoint directly
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Common Failure Cases

| Symptom | Cause | Fix |
|---------|-------|-----|
| `Network Error` / `ERR_CONNECTION_REFUSED` | Backend not running | Start backend: `cd ssb-api && uvicorn app.main:app --reload` |
| `CORS error` in browser console | Backend CORS misconfigured | Ensure `ALLOWED_ORIGINS=http://localhost:3000` in backend `.env` |
| `401 Unauthorized` on `/auth/me` | Token not being sent | Check localStorage has `access_token`; verify `withCredentials: true` in api-client |
| `401` on token refresh | Refresh cookie not sent | Browser may block third-party cookies; ensure same-site context |
| Login succeeds but redirects fail | Missing token storage | Check browser console for errors in login response handling |

### Auth Flow Summary

1. **Login**: `POST /api/v1/auth/login` → returns `access_token` (stored in localStorage) + sets `refresh_token` cookie (httpOnly)
2. **Authenticated requests**: Send `Authorization: Bearer <access_token>` header (handled by api-client)
3. **Token refresh**: `POST /api/v1/auth/refresh` uses the httpOnly cookie to get a new access token

### Debug Tips

- Open browser DevTools → Network tab → check request/response headers
- Look for `Set-Cookie` header in login response
- Verify `Authorization` header is sent on subsequent requests
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
