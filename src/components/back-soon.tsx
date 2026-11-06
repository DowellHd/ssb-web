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

// Decorative market line, drawn in on load (motion only when the user allows it).
const LINE =
  'M0 150 C 40 140, 60 100, 100 110 S 160 160, 200 120 S 260 50, 310 70 S 370 120, 420 60 S 500 10, 560 20';

export function BackSoon() {
  return (
    <main className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-16">
      <style>{`
        @keyframes bs-draw { to { stroke-dashoffset: 0; } }
        @keyframes bs-rise { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }
        @keyframes bs-pulse { 0%,100% { opacity: .55; } 50% { opacity: 1; } }
        .bs-line { stroke-dasharray: 1; stroke-dashoffset: 0; }
        @media (prefers-reduced-motion: no-preference) {
          .bs-line { stroke-dashoffset: 1; animation: bs-draw 2.4s ease-out .3s forwards; }
          .bs-rise { opacity: 0; animation: bs-rise .7s ease-out forwards; }
          .bs-d1 { animation-delay: .1s; } .bs-d2 { animation-delay: .25s; }
          .bs-d3 { animation-delay: .4s; } .bs-d4 { animation-delay: .6s; }
          .bs-dot { animation: bs-pulse 2.2s ease-in-out infinite; }
        }
      `}</style>

      {/* Ambient glow + faint grid */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-[-10%] h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-emerald-500/15 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] h-[420px] w-[560px] rounded-full bg-sky-500/15 blur-[120px]" />
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
            maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 75%)',
            WebkitMaskImage: 'radial-gradient(ellipse at center, black 30%, transparent 75%)',
          }}
        />
      </div>

      <section className="mx-auto w-full max-w-3xl text-center">
        <div className="bs-rise bs-d1 flex items-center justify-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary shadow-[0_0_24px_hsl(160_84%_45%/0.45)]">
            <TrendingUp className="h-6 w-6 text-primary-foreground" aria-hidden="true" />
          </div>
          <span className="text-xl font-bold tracking-tight">SSB</span>
        </div>

        <h1 className="bs-rise bs-d2 mt-8 text-5xl font-extrabold leading-[1.1] tracking-tight sm:text-6xl">
          <span className="bg-gradient-to-r from-emerald-300 via-sky-300 to-emerald-300 bg-clip-text text-transparent">
            We&apos;ll be back soon
          </span>
        </h1>
        <p className="bs-rise bs-d3 mt-4 text-lg text-foreground">
          Smart Strategies Builder is temporarily unavailable. Thanks for your patience.
        </p>

        {/* Animated market line */}
        <div aria-hidden="true" className="bs-rise bs-d3 mx-auto mt-10 w-full max-w-xl">
          <svg viewBox="0 0 560 170" className="h-auto w-full overflow-visible" fill="none">
            <defs>
              <linearGradient id="bs-stroke" x1="0" x2="1" y1="0" y2="0">
                <stop offset="0" stopColor="#38bdf8" />
                <stop offset="1" stopColor="#34d399" />
              </linearGradient>
            </defs>
            <path
              className="bs-line"
              d={LINE}
              pathLength={1}
              stroke="url(#bs-stroke)"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <circle className="bs-dot" cx="560" cy="20" r="5" fill="#34d399" />
          </svg>
        </div>

        <p className="bs-rise bs-d4 mx-auto mt-8 max-w-xl text-base text-muted-foreground">
          A risk-first financial intelligence platform, built so you can understand the market
          before you act.
        </p>

        <ul className="bs-rise bs-d4 mt-8 grid gap-3 text-left sm:grid-cols-2">
          {CAPABILITIES.map(({ icon: Icon, title, text }) => (
            <li
              key={title}
              className="flex gap-3 rounded-xl border border-border bg-card/70 p-4 backdrop-blur"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-400/10 text-emerald-300">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-sm font-semibold">{title}</h2>
                <p className="mt-0.5 text-sm text-muted-foreground">{text}</p>
              </div>
            </li>
          ))}
        </ul>

        <a
          href={PORTFOLIO_URL}
          className="bs-rise bs-d4 mt-10 inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          Visit my portfolio
        </a>
      </section>
    </main>
  );
}
