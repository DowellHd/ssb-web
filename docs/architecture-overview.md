# Architecture Overview

## System Design

Smart Strategies Builder (SSB) is built as a decoupled architecture with a clear separation between the frontend and backend services.

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (ssb-web)                      │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    Next.js Application                    │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐   │  │
│  │  │ Auth Pages  │  │ Dashboard   │  │ Intelligence UI │   │  │
│  │  └─────────────┘  └─────────────┘  └─────────────────┘   │  │
│  │                           │                               │  │
│  │  ┌────────────────────────▼────────────────────────────┐ │  │
│  │  │              API Client Layer                        │ │  │
│  │  │  ┌──────────────────┐  ┌─────────────────────────┐  │ │  │
│  │  │  │  Demo Mode       │  │  Production Mode        │  │ │  │
│  │  │  │  (Mock Data)     │  │  (Real API Calls)       │  │ │  │
│  │  │  └──────────────────┘  └─────────────────────────┘  │ │  │
│  │  └─────────────────────────────────────────────────────┘ │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                                │
                                │ HTTPS/REST
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Backend (ssb-api)                          │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    FastAPI Application                    │  │
│  │  ┌─────────────┐  ┌──────────────┐  ┌─────────────────┐  │  │
│  │  │ Auth Routes │  │ Intelligence │  │ Billing Routes  │  │  │
│  │  └─────────────┘  └──────────────┘  └─────────────────┘  │  │
│  │                           │                               │  │
│  │  ┌────────────────────────▼────────────────────────────┐ │  │
│  │  │              Service Layer                           │ │  │
│  │  │  ┌────────────┐  ┌────────────┐  ┌──────────────┐   │ │  │
│  │  │  │ Auth Svc   │  │ Intel Svc  │  │ Billing Svc  │   │ │  │
│  │  │  └────────────┘  └────────────┘  └──────────────┘   │ │  │
│  │  └─────────────────────────────────────────────────────┘ │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                │                                │
│  ┌─────────────────────────────▼───────────────────────────┐   │
│  │                   Data Layer                             │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │   │
│  │  │  PostgreSQL  │  │    Redis     │  │ Market Data  │   │   │
│  │  │  (Primary)   │  │   (Cache)    │  │  Providers   │   │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘   │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## Frontend Architecture

### Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Framework | Next.js 14 | Server-side rendering, routing |
| Language | TypeScript | Type safety |
| Styling | TailwindCSS | Utility-first CSS |
| Components | shadcn/ui | Accessible UI components |
| State | Zustand | Client state management |
| Server State | React Query | API caching & synchronization |
| Charts | TradingView, Recharts | Financial visualizations |

### Data Flow

```
User Action
    │
    ▼
React Component
    │
    ▼
Zustand Store ◄──────────────► React Query Cache
    │                              │
    ▼                              ▼
API Client ─────────────────► REST API
    │
    ├── Demo Mode? ──► Mock Data Generator
    │
    └── Production? ──► Backend API
```

### Key Directories

| Directory | Purpose |
|-----------|---------|
| `src/app/` | Next.js App Router pages |
| `src/components/ui/` | Reusable UI components |
| `src/lib/api/` | API client and utilities |
| `src/lib/` | Shared utilities and hooks |

## API Communication

### Endpoints (v1)

| Endpoint | Description |
|----------|-------------|
| `/api/v1/auth/*` | Authentication, MFA, sessions |
| `/api/v1/billing/*` | Subscriptions, payments |
| `/api/v1/intelligence/*` | Risk analytics, regime detection |
| `/api/v1/privacy/*` | GDPR export, deletion |

### Authentication Flow

```
1. User logs in ──► POST /auth/login
                        │
                        ▼
2. Server validates ──► Returns JWT + Refresh Token
                        │
                        ▼
3. Client stores ──► HTTP-only cookies (refresh)
                     Memory (access token)
                        │
                        ▼
4. API calls ──► Authorization: Bearer <token>
                        │
                        ▼
5. Token expired? ──► POST /auth/refresh
```

## Intelligence Components

### Market Regime Detection

The platform detects four market regimes:
- **Bull** — Sustained uptrend with low volatility
- **Bear** — Sustained downtrend
- **Sideways** — Range-bound, no clear direction
- **Crisis** — High volatility, correlation breakdown

### Risk Analytics

| Metric | Description |
|--------|-------------|
| VaR | Value at Risk — potential loss at confidence level |
| CVaR | Conditional VaR — expected loss beyond VaR |
| Max Drawdown | Largest peak-to-trough decline |
| Correlation | Asset relationship matrix |

### Explainability

Every insight includes:
- Confidence score (0-100%)
- Key drivers
- Model version
- Data freshness timestamp

## Demo Mode

Demo mode allows the frontend to run standalone without a backend:

1. Set `NEXT_PUBLIC_DEMO_MODE=true`
2. All API calls are intercepted
3. Mock data generators provide realistic responses
4. No network requests made to backend

This is ideal for:
- Portfolio showcases
- Development without backend
- Presentations

## Deployment Options

### Frontend Deployment

| Platform | Recommended For |
|----------|-----------------|
| Vercel | Production (recommended) |
| Netlify | Alternative |
| Docker | Self-hosted |

### Environment Configuration

The frontend connects to the backend via environment variables:

```
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_API_PREFIX=/api/v1
```

## Security Considerations

- JWT tokens stored in memory (not localStorage)
- Refresh tokens in HTTP-only cookies
- CSRF protection enabled
- Content Security Policy recommended
- No sensitive data in client bundle

## Further Reading

- [Demo Mode Guide](DEMO_MODE.md)
- [OpenAPI Specification](openapi.md)
