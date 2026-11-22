/**
 * Deterministic randomness + clock for demo mode.
 *
 * Nothing in demo-api may call Math.random() or rely on wall-clock time for
 * *values*. Every number is derived from a string key, so the demo renders
 * identically on every run. Dates are anchored to the start of the current UTC
 * day, so relative timestamps ("2h ago") are stable within a day and never in
 * the future.
 */

export type Rng = () => number;

const DAY_MS = 86_400_000;
const HOUR_MS = 3_600_000;

/** 32-bit string hash (xmur3-style). */
export function hashString(input: string): number {
  let h = 1779033703 ^ input.length;
  for (let i = 0; i < input.length; i++) {
    h = Math.imul(h ^ input.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  h = Math.imul(h ^ (h >>> 16), 2246822507);
  h = Math.imul(h ^ (h >>> 13), 3266489909);
  return (h ^ (h >>> 16)) >>> 0;
}

/** mulberry32 — small, fast, good-enough PRNG. Returns floats in [0, 1). */
export function mulberry32(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A fresh deterministic generator for a given key. Same key → same sequence. */
export function seededRng(key: string): Rng {
  return mulberry32(hashString(`ssb-demo:${key}`));
}

/** Standard normal sample via Box–Muller. */
export function gaussian(rng: Rng): number {
  let u = 0;
  while (u === 0) u = rng();
  const v = rng();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

export function randBetween(rng: Rng, min: number, max: number): number {
  return min + rng() * (max - min);
}

export function randInt(rng: Rng, min: number, max: number): number {
  return Math.floor(randBetween(rng, min, max + 1));
}

export function pick<T>(rng: Rng, items: readonly T[]): T {
  return items[Math.floor(rng() * items.length)];
}

export function round(n: number, digits = 2): number {
  const f = 10 ** digits;
  return Math.round(n * f) / f;
}

export function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}

// ── Demo clock ──────────────────────────────────────────────────────────────

/** Start of the current UTC day. The demo's "now". */
export function demoNow(): Date {
  const d = new Date();
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

export function daysAgo(days: number): Date {
  return new Date(demoNow().getTime() - days * DAY_MS);
}

export function hoursAgo(hours: number): Date {
  return new Date(demoNow().getTime() - hours * HOUR_MS);
}

export function daysFromNow(days: number): Date {
  return new Date(demoNow().getTime() + days * DAY_MS);
}

export const iso = (d: Date): string => d.toISOString();
export const isoDay = (d: Date): string => d.toISOString().split('T')[0];

// ── Ids ─────────────────────────────────────────────────────────────────────

const counters = new Map<string, number>();

/** Sequential ids for records created during a demo session (order-1001, …). */
export function newId(prefix: string, start = 1000): string {
  const next = (counters.get(prefix) ?? start) + 1;
  counters.set(prefix, next);
  return `${prefix}-${next}`;
}

/** Stable id for seeded records. */
export function seedId(prefix: string, n: number): string {
  return `${prefix}-${String(n).padStart(3, '0')}`;
}
