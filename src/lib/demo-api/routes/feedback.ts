/**
 * NPS / feedback. These endpoints are called straight from components (not via
 * src/lib/api), so the generated catch-all shapes do not describe them.
 */
import { daysAgo, iso, seedId, round, hashString } from '../prng';
import { get, post, type DemoRoute } from '../router';

const COMMENTS = [
  'The risk dashboard is exactly what I was missing.',
  'Stress tests are great. I would love more custom scenarios.',
  'Clean interface. Paper trading helped me learn order types.',
  'Wish the signal feed had more filters.',
  'Regime analysis is easy to understand, no jargon.',
  null,
  'Took me a while to find the portfolio tools.',
  'Great educational content.',
  null,
  'Would pay for real-time alerts.',
];

const SCORES = [10, 9, 8, 10, 9, 7, 6, 9, 10, 4, 8, 9];

const category = (s: number) => (s >= 9 ? 'promoter' : s >= 7 ? 'passive' : 'detractor');

const rows = () =>
  SCORES.map((score, i) => ({
    id: seedId('nps', i + 1),
    email: `user${i + 1}@example.com`,
    score,
    category: category(score),
    feedback: COMMENTS[i % COMMENTS.length],
    user_plan: (['pro', 'free', 'starter'] as const)[hashString(`np:${i}`) % 3],
    dismissed: false,
    submitted_at: iso(daysAgo(1 + i * 2)),
  }));

export const feedbackRoutes: DemoRoute[] = [
  get('/feedback/nps/admin/summary', () => {
    const all = rows();
    const p = all.filter((r) => r.category === 'promoter').length;
    const d = all.filter((r) => r.category === 'detractor').length;
    const n = all.length;
    return {
      nps_score: Math.round(((p - d) / n) * 100),
      total_responses: n,
      promoters: p,
      passives: n - p - d,
      detractors: d,
      promoter_pct: round((p / n) * 100, 1),
      detractor_pct: round((d / n) * 100, 1),
      average_score: round(all.reduce((s, r) => s + r.score, 0) / n, 1),
      responses_last_30_days: n,
    };
  }),
  get('/feedback/nps/admin/responses', ({ query }) => {
    const limit = Number(query.limit) || 100;
    const list = rows().filter((r) => !query.category || query.category === 'all' || r.category === query.category);
    return { responses: list.slice(0, limit), total: list.length };
  }),
  // Never prompt for NPS in a demo; it would pop up mid-recording.
  get('/feedback/nps/eligibility', () => ({ eligible: false })),
  post('/feedback/nps', () => ({ success: true, message: 'Thanks for the feedback (demo).' })),
  post('/auth/resend-verification-me', () => ({ message: 'Verification email sent (demo: nothing was sent)', success: true })),
];
