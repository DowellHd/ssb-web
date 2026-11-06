import { Activity, BarChart3, Layers, ShieldCheck, TrendingUp } from 'lucide-react';

const PORTFOLIO_URL = 'https://dowellstandley.com';

const CAPABILITIES = [
  {
    icon: Activity,
    title: 'Market regime detection',
    text: 'See whether the market is bullish, bearish, sideways, or in crisis mode.',
  },
  {
    icon: ShieldCheck,
    title: 'Portfolio risk analytics',
    text: 'VaR, CVaR, drawdown analysis, and correlation matrices at a glance.',
  },
  {
    icon: Layers,
    title: 'Stress testing',
    text: 'Run your portfolio through historical crises like 2008 and COVID.',
  },
  {
    icon: BarChart3,
    title: 'Strategy backtesting',
    text: 'Replay ideas against history, with explainable, confidence-scored insights.',
  },
];

// rgb triplets: --c is the pill accent, --t the lighter text shade
const REGIMES = [
  { label: 'Bullish', c: '52 211 153', t: '110 231 183' },
  { label: 'Sideways', c: '251 191 36', t: '252 211 77' },
  { label: 'Bearish', c: '251 146 60', t: '253 186 116' },
  { label: 'Crisis', c: '248 113 113', t: '252 165 165' },
];

const STRESS = [
  { label: '2008', width: '86%' },
  { label: 'COVID', width: '64%' },
  { label: 'Rate shock', width: '42%' },
  { label: 'Custom', width: '55%' },
];

// Decorative market line + filled area (illustrative shape only, not data).
const LINE =
  'M0 150 C 40 140, 60 100, 100 110 S 160 160, 200 120 S 260 50, 310 70 S 370 120, 420 60 S 500 10, 560 20';
const AREA = `${LINE} L 560 180 L 0 180 Z`;

export function BackSoon() {
  return (
    <main className="relative isolate min-h-screen bg-background px-4 py-16 sm:py-20">
      <style>{`
        @keyframes bs-draw { to { stroke-dashoffset: 0; } }
        @keyframes bs-reveal { from { clip-path: inset(0 100% 0 0); } to { clip-path: inset(0 0 0 0); } }
        @keyframes bs-rise { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
        @keyframes bs-bar { from { transform: scaleX(0); } to { transform: scaleX(1); } }
        @keyframes bs-pulse { 0%,100% { opacity: .5; transform: scale(1); } 50% { opacity: 1; transform: scale(1.4); } }
        @keyframes bs-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
        @keyframes bs-regime {
          0%, 22% { background-color: rgb(var(--c) / .18); border-color: rgb(var(--c) / .7); color: rgb(var(--t)); }
          28%, 100% { background-color: transparent; border-color: hsl(var(--border)); color: hsl(var(--muted-foreground)); }
        }
        .bs-line { stroke-dasharray: 1; stroke-dashoffset: 0; }
        .bs-bar { transform-origin: left; }
        .bs-regime { border-color: hsl(var(--border)); }
        @media (prefers-reduced-motion: no-preference) {
          .bs-line { stroke-dashoffset: 1; animation: bs-draw 2.6s ease-out .6s forwards; }
          .bs-area { animation: bs-reveal 2.6s ease-out .6s both; }
          .bs-rise { opacity: 0; animation: bs-rise .8s ease-out forwards; }
          .bs-d1 { animation-delay: .1s; } .bs-d2 { animation-delay: .25s; }
          .bs-d3 { animation-delay: .4s; } .bs-d4 { animation-delay: .6s; } .bs-d5 { animation-delay: .8s; }
          .bs-bar { animation: bs-bar 1.1s cubic-bezier(.2,.8,.2,1) both; }
          .bs-dot { transform-box: fill-box; transform-origin: center; animation: bs-pulse 2s ease-in-out 3s infinite; }
          .bs-float { animation: bs-float 7s ease-in-out infinite; }
          .bs-regime { animation: bs-regime 8s ease-in-out infinite; }
        }
      `}</style>

      {/* Ambient glow + fading grid */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-[-12%] h-[560px] w-[900px] -translate-x-1/2 rounded-full bg-emerald-500/20 blur-[130px]" />
        <div className="absolute right-[-12%] top-[30%] h-[460px] w-[560px] rounded-full bg-sky-500/20 blur-[130px]" />
        <div className="absolute bottom-[-15%] left-[-10%] h-[420px] w-[520px] rounded-full bg-violet-500/15 blur-[130px]" />
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
            maskImage: 'radial-gradient(ellipse at 50% 30%, black 20%, transparent 70%)',
            WebkitMaskImage: 'radial-gradient(ellipse at 50% 30%, black 20%, transparent 70%)',
          }}
        />
      </div>

      <section className="mx-auto w-full max-w-5xl text-center">
        <div className="bs-rise bs-d1 flex items-center justify-center gap-2.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary shadow-[0_0_32px_hsl(160_84%_45%/0.55)]">
            <TrendingUp className="h-6 w-6 text-primary-foreground" aria-hidden="true" />
          </div>
          <span className="text-2xl font-bold tracking-tight">SSB</span>
        </div>

        <p className="bs-rise bs-d2 mt-8 text-sm font-medium uppercase tracking-[0.2em] text-emerald-300">
          Smart Strategies Builder
        </p>
        <h1 className="bs-rise bs-d2 mt-3 text-5xl font-extrabold leading-[1.05] tracking-tight sm:text-7xl">
          <span className="bg-gradient-to-r from-emerald-300 via-sky-300 to-emerald-300 bg-clip-text text-transparent">
            We&apos;ll be back soon
          </span>
        </h1>
        <p className="bs-rise bs-d3 mt-5 text-lg text-foreground sm:text-xl">
          Smart Strategies Builder is temporarily unavailable. Thanks for your patience.
        </p>
        <p className="bs-rise bs-d3 mx-auto mt-3 max-w-2xl text-base text-muted-foreground">
          A risk-first financial intelligence platform, built so you can understand the market
          before you act.
        </p>

        {/* Decorative dashboard preview */}
        <div aria-hidden="true" className="bs-rise bs-d4 mx-auto mt-12 w-full max-w-3xl">
          <div className="bs-float overflow-hidden rounded-2xl border border-border bg-card/80 text-left shadow-[0_30px_80px_-20px_hsl(160_84%_45%/0.35)] backdrop-blur">
            <div className="flex items-center gap-2 border-b border-border px-4 py-3">
              <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
              <span className="ml-3 text-xs font-medium text-muted-foreground">Market regime</span>
            </div>

            <div className="grid gap-6 p-5 sm:grid-cols-5">
              <div className="sm:col-span-3">
                <div className="flex flex-wrap gap-2">
                  {REGIMES.map((r, i) => (
                    <span
                      key={r.label}
                      className="bs-regime inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold text-muted-foreground"
                      style={
                        { animationDelay: `${i * 2}s`, '--c': r.c, '--t': r.t } as React.CSSProperties
                      }
                    >
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: `rgb(${r.c})` }}
                      />
                      {r.label}
                    </span>
                  ))}
                </div>
                <svg viewBox="0 0 560 180" className="mt-4 h-auto w-full overflow-visible" fill="none">
                  <defs>
                    <linearGradient id="bs-stroke" x1="0" x2="1" y1="0" y2="0">
                      <stop offset="0" stopColor="#38bdf8" />
                      <stop offset="1" stopColor="#34d399" />
                    </linearGradient>
                    <linearGradient id="bs-fill" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0" stopColor="#34d399" stopOpacity="0.35" />
                      <stop offset="1" stopColor="#34d399" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <g stroke="hsl(var(--border))" strokeWidth="1">
                    <line x1="0" x2="560" y1="45" y2="45" />
                    <line x1="0" x2="560" y1="95" y2="95" />
                    <line x1="0" x2="560" y1="145" y2="145" />
                  </g>
                  <path className="bs-area" d={AREA} fill="url(#bs-fill)" />
                  <path
                    className="bs-line"
                    d={LINE}
                    pathLength={1}
                    stroke="url(#bs-stroke)"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                  <circle className="bs-dot" cx="560" cy="20" r="5.5" fill="#34d399" />
                </svg>
              </div>

              <div className="sm:col-span-2">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Stress scenarios
                </p>
                <div className="mt-3 space-y-3">
                  {STRESS.map(({ label, width }, i) => (
                    <div key={label}>
                      <div className="mb-1 text-xs text-foreground/80">{label}</div>
                      <div className="h-2 rounded-full bg-secondary">
                        <div
                          className="bs-bar h-2 rounded-full bg-gradient-to-r from-sky-400 to-emerald-400"
                          style={{ width, animationDelay: `${1 + i * 0.2}s` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <ul className="bs-rise bs-d5 mt-10 grid gap-3 text-left sm:grid-cols-2 lg:grid-cols-4">
          {CAPABILITIES.map(({ icon: Icon, title, text }) => (
            <li
              key={title}
              className="rounded-xl border border-border bg-card/70 p-4 backdrop-blur transition-colors hover:border-emerald-400/50"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-400/10 text-emerald-300">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <h2 className="mt-3 text-sm font-semibold">{title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{text}</p>
            </li>
          ))}
        </ul>

        <a
          href={PORTFOLIO_URL}
          className="bs-rise bs-d5 mt-10 inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          Visit my portfolio
        </a>

        <p className="mx-auto mt-8 max-w-xl text-xs text-muted-foreground">
          SSB is an educational analytics tool. It does not execute trades, generate buy/sell
          recommendations, or promise returns.
        </p>
      </section>
    </main>
  );
}
