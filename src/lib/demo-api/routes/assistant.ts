/** AI assistant endpoints — canned, on-topic educational replies. */
import { daysAgo, iso, daysFromNow, newId } from '../prng';
import { del, get, post, type DemoRoute } from '../router';

const DISCLAIMER =
  'Educational information only — not financial advice. SSB does not execute trades or recommend securities.';

const TOPICS: Array<{ match: RegExp; reply: string }> = [
  {
    match: /regime/,
    reply:
      'A **market regime** is the prevailing state of the market over a period. SSB classifies four:\n\n• **Bull** — sustained rising prices, low-to-moderate volatility\n• **Bear** — sustained declines, rising correlations\n• **Sideways** — range-bound, mean-reverting\n• **Crisis** — volatility spikes and liquidity stress\n\nRegimes help frame risk, but they describe the past and present, not the future.',
  },
  {
    match: /\bvar\b|value at risk/,
    reply:
      '**Value at Risk (VaR)** estimates the loss a portfolio is unlikely to exceed over a period at a given confidence level.\n\nExample: a 1-day 95% VaR of $10,000 means that on 95% of days the loss should be smaller than $10,000.\n\nLimits: it says nothing about how bad the worst 5% can get (that is what **CVaR** measures) and it leans on historical data.',
  },
  {
    match: /stress/,
    reply:
      '**Stress testing** replays your portfolio through historical crises (2008, COVID-19, 2022 rate shock) or custom shocks to see how it might behave in extreme conditions. Look at the *scenario ranking* first — it shows which events your holdings are most sensitive to.',
  },
  {
    match: /correlat|diversif/,
    reply:
      '**Diversification** works only when holdings do not move together. A correlation matrix shows pairwise co-movement: values near +1 mean assets move in lockstep, near 0 are independent, and negative values offset each other. In stress periods correlations tend to rise, which is why diversification can feel weaker exactly when you need it.',
  },
  {
    match: /drawdown|sharpe|sortino/,
    reply:
      '**Max drawdown** is the largest peak-to-trough decline. **Sharpe** divides excess return by total volatility; **Sortino** only penalises downside volatility. Use them together — a high Sharpe with a deep drawdown still means a rough ride.',
  },
  {
    match: /paper/,
    reply:
      '**Paper trading** lets you place simulated orders with virtual cash against live-style prices. It is a safe way to practise order types and test ideas before risking real money. Open **Paper Trading** from the sidebar to start.',
  },
  {
    match: /plan|entitle|billing|upgrade/,
    reply:
      'SSB has **Free**, **Starter**, **Pro** and **Institutional** plans. Higher tiers unlock real-time signals, full risk analytics, stress testing and backtesting. This demo runs with the Pro plan so you can see everything.',
  },
];

const FALLBACK =
  "I can help you understand markets and the tools in SSB — try asking about market regimes, value at risk, stress testing, diversification, drawdown, or paper trading.";

export const assistantRoutes: DemoRoute[] = [
  post('/assistant/chat', ({ body }) => {
    const message = String(body?.message ?? '').toLowerCase();
    const topic = TOPICS.find((t) => t.match.test(message));
    return {
      reply: topic ? topic.reply : FALLBACK,
      thread_id: body?.thread_id || newId('demo-thread'),
      citations: [],
      safety_flags: [],
      disclaimer: DISCLAIMER,
    };
  }),
  del('/assistant/thread/:id', () => ({ success: true, message: 'Conversation cleared' })),
  get('/assistant/account-summary', () => ({
    plan_name: 'pro',
    plan_display_name: 'Pro',
    billing_portal_url: '/app/billing',
    last_invoice_date: iso(daysAgo(7)),
    last_invoice_amount: 79,
    subscription_status: 'active',
    current_period_end: iso(daysFromNow(23)),
  })),
];
