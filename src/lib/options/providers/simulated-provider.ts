/**
 * Simulated options data provider.
 *
 * Generates deterministic, educational options chains using an
 * approximation of the Black-Scholes pricing model. All output is
 * explicitly marked as simulated and must never be presented to users
 * as real market data.
 *
 * Educational purpose only. Not investment advice.
 * Values do not represent real market prices or real trading conditions.
 */

import type { OptionsProvider, OptionsChainRequest } from './base-provider';
import type {
  OptionsChain,
  OptionsContract,
  Greeks,
  Moneyness,
  OptionType,
} from '../types';

// ============================================================================
// Math utilities
// ============================================================================

/**
 * Standard normal cumulative distribution function.
 * Abramowitz & Stegun approximation (rational form), max error 7.5e-8.
 */
function normCdf(x: number): number {
  const a1 =  0.254829592;
  const a2 = -0.284496736;
  const a3 =  1.421413741;
  const a4 = -1.453152027;
  const a5 =  1.061405429;
  const p  =  0.3275911;

  const sign = x < 0 ? -1 : 1;
  const absX = Math.abs(x);
  const t = 1.0 / (1.0 + p * absX);
  const y =
    1.0 -
    (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) *
      t *
      Math.exp(-absX * absX);
  return 0.5 * (1.0 + sign * y);
}

/** Standard normal probability density function. */
function normPdf(x: number): number {
  return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
}

// ============================================================================
// Black-Scholes engine (educational approximation)
// ============================================================================

interface BSResult {
  price: number;
  delta: number;
  gamma: number;
  /** Per calendar day. */
  theta: number;
  /** Per 1 percentage-point move in IV. */
  vega: number;
  rho: number;
  d1: number;
  d2: number;
}

/**
 * Compute Black-Scholes price and Greeks for a European option.
 *
 * @param S   Underlying price
 * @param K   Strike price
 * @param T   Time to expiration in years
 * @param r   Risk-free rate (annualized decimal, e.g. 0.05 = 5%)
 * @param σ   Implied volatility (annualized decimal, e.g. 0.25 = 25%)
 * @param type  'call' | 'put'
 */
function blackScholes(
  S: number,
  K: number,
  T: number,
  r: number,
  σ: number,
  type: OptionType,
): BSResult {
  // Guard: floor T to avoid division by zero at expiration
  const safeT = Math.max(T, 1 / 365);
  const sqrtT = Math.sqrt(safeT);

  const d1 = (Math.log(S / K) + (r + 0.5 * σ * σ) * safeT) / (σ * sqrtT);
  const d2 = d1 - σ * sqrtT;

  const discount = Math.exp(-r * safeT);

  let price: number;
  let delta: number;
  let thetaAnnual: number;
  let rho: number;

  if (type === 'call') {
    price = S * normCdf(d1) - K * discount * normCdf(d2);
    delta = normCdf(d1);
    thetaAnnual =
      -(S * normPdf(d1) * σ) / (2 * sqrtT) -
      r * K * discount * normCdf(d2);
    rho = K * safeT * discount * normCdf(d2) / 100;
  } else {
    price = K * discount * normCdf(-d2) - S * normCdf(-d1);
    delta = normCdf(d1) - 1;
    thetaAnnual =
      -(S * normPdf(d1) * σ) / (2 * sqrtT) +
      r * K * discount * normCdf(-d2);
    rho = -K * safeT * discount * normCdf(-d2) / 100;
  }

  // Ensure price is non-negative (can be slightly negative due to floating point)
  price = Math.max(price, 0);

  const gamma = normPdf(d1) / (S * σ * sqrtT);
  const vegaAnnual = S * normPdf(d1) * sqrtT;

  return {
    price,
    delta,
    gamma,
    theta: thetaAnnual / 365, // convert to per-day
    vega: vegaAnnual / 100,   // convert to per 1% move
    rho,
    d1,
    d2,
  };
}

// ============================================================================
// IV smile model (educational)
// ============================================================================

/**
 * Simulate an implied volatility surface with a realistic smile/skew.
 *
 * - ATM IV is anchored at baseIv
 * - IV increases for OTM and ITM strikes (smile)
 * - Puts have a slight extra skew (equity put skew)
 * - Longer-dated options have flatter smiles (term structure)
 *
 * Returns annualized IV as a decimal (e.g. 0.28 = 28%).
 */
function simulatedIV(
  S: number,
  K: number,
  T: number,
  type: OptionType,
  baseIv: number,
): number {
  const moneyness = (K - S) / S; // positive = OTM call / ITM put

  // Smile: IV rises symmetrically for deep OTM/ITM
  const smile = 0.15 * moneyness * moneyness;

  // Put skew: OTM puts (moneyness < 0) have higher IV
  const skew = type === 'put' ? -0.04 * moneyness : 0.02 * moneyness;

  // Term structure: smile flattens slightly for longer dates
  const termFactor = Math.max(0.7, 1 - 0.1 * Math.sqrt(T));

  const iv = baseIv + (smile + skew) * termFactor;
  return Math.max(0.05, Math.min(2.0, iv)); // clamp to [5%, 200%]
}

// ============================================================================
// Strike generation
// ============================================================================

function strikeInterval(underlyingPrice: number): number {
  if (underlyingPrice < 25)  return 0.5;
  if (underlyingPrice < 50)  return 1;
  if (underlyingPrice < 100) return 2.5;
  if (underlyingPrice < 200) return 5;
  if (underlyingPrice < 500) return 10;
  return 25;
}

/**
 * Generate a sorted list of strikes centered around the underlying price.
 * Returns NUM_STRIKES_EACH_SIDE strikes on each side of ATM plus the ATM strike.
 */
function generateStrikes(underlyingPrice: number): number[] {
  const interval = strikeInterval(underlyingPrice);
  const atm = Math.round(underlyingPrice / interval) * interval;
  const NUM_EACH_SIDE = 10;
  const strikes: number[] = [];
  for (let i = -NUM_EACH_SIDE; i <= NUM_EACH_SIDE; i++) {
    const strike = Math.round((atm + i * interval) * 100) / 100;
    if (strike > 0) strikes.push(strike);
  }
  return strikes;
}

// ============================================================================
// Moneyness classification
// ============================================================================

function classifyMoneyness(S: number, K: number, type: OptionType): Moneyness {
  const pct = Math.abs((K - S) / S);
  if (pct <= 0.005) return 'atm';
  if (type === 'call') return K < S ? 'itm' : 'otm';
  return K > S ? 'itm' : 'otm';
}

// ============================================================================
// Bid/ask spread simulation
// ============================================================================

/**
 * Simulate a realistic bid/ask spread.
 * Spreads widen for deep OTM, very cheap options, and short-dated contracts.
 */
function simulateSpread(
  mid: number,
  moneyness: Moneyness,
  daysToExpiry: number,
): { bid: number; ask: number } {
  const baseSpreadPct =
    moneyness === 'atm' ? 0.04
    : moneyness === 'itm' ? 0.06
    : 0.12; // OTM is wider

  // Widen for very short-dated options
  const timeFactor = daysToExpiry < 7 ? 1.5 : daysToExpiry < 14 ? 1.2 : 1.0;
  const minSpread = 0.05;

  const spread = Math.max(minSpread, mid * baseSpreadPct * timeFactor);
  const half = spread / 2;

  return {
    bid: Math.max(0, Math.round((mid - half) * 100) / 100),
    ask: Math.round((mid + half) * 100) / 100,
  };
}

// ============================================================================
// Volume / open interest simulation
// ============================================================================

/**
 * Simulate volume and open interest with a bell-curve distribution
 * centered on ATM, consistent with typical equity options markets.
 *
 * Values are deterministic given the same inputs (seeded by strike/expiry).
 */
function simulateVolumeOI(
  S: number,
  K: number,
  daysToExpiry: number,
): { volume: number; openInterest: number } {
  const moneynessRatio = Math.abs((K - S) / S);
  const decay = Math.exp(-8 * moneynessRatio * moneynessRatio);

  // Use a deterministic "seed" from the strike to avoid random variation
  const seed = Math.sin(K * 137.508) * 0.5 + 0.5; // 0..1, deterministic

  const baseVolume = Math.round(decay * 5000 * (0.5 + seed * 0.5));
  const baseOI = Math.round(baseVolume * (8 + seed * 12)); // OI = 8–20x volume

  // Volume trails off for longer-dated options
  const timeFactor = Math.max(0.1, 1 - daysToExpiry / 365);
  const vol = Math.max(0, Math.round(baseVolume * (0.3 + timeFactor * 0.7)));
  const oi = Math.max(0, Math.round(baseOI * (0.5 + seed * 0.5)));

  return { volume: vol, openInterest: oi };
}

// ============================================================================
// OCC option symbol builder
// ============================================================================

/**
 * Build an OCC-style option symbol: {symbol}{YYMMDD}{C|P}{8-digit-strike}
 * Strike is encoded as: strike_price * 1000, zero-padded to 8 digits.
 */
function buildOptionSymbol(
  symbol: string,
  expiration: string, // YYYY-MM-DD
  type: OptionType,
  strike: number,
): string {
  const [year, month, day] = expiration.split('-');
  const yy = year.slice(2);
  const typeChar = type === 'call' ? 'C' : 'P';
  const strikeStr = String(Math.round(strike * 1000)).padStart(8, '0');
  return `${symbol.toUpperCase()}${yy}${month}${day}${typeChar}${strikeStr}`;
}

// ============================================================================
// Expiration generation
// ============================================================================

/**
 * Generate the next N monthly expiration dates (3rd Friday of each month).
 * Returns ISO date strings sorted ascending.
 */
function generateMonthlyExpirations(fromDate: Date, count: number): string[] {
  const expirations: string[] = [];
  const d = new Date(fromDate);

  // Advance to next month start
  d.setDate(1);
  d.setMonth(d.getMonth() + 1);

  while (expirations.length < count) {
    const thirdFriday = getThirdFriday(d.getFullYear(), d.getMonth());
    if (thirdFriday > fromDate) {
      expirations.push(thirdFriday.toISOString().split('T')[0]);
    }
    d.setMonth(d.getMonth() + 1);
  }

  return expirations;
}

function getThirdFriday(year: number, month: number): Date {
  const d = new Date(year, month, 1);
  // Advance to first Friday
  while (d.getDay() !== 5) d.setDate(d.getDate() + 1);
  // Advance to third Friday
  d.setDate(d.getDate() + 14);
  return d;
}

// ============================================================================
// Simulated provider
// ============================================================================

/** Simulated underlying prices keyed by symbol (used when no real price is available). */
const FALLBACK_PRICES: Record<string, number> = {
  SPY:   510,
  QQQ:   430,
  AAPL:  185,
  MSFT:  415,
  TSLA:  185,
  NVDA:  875,
  AMZN:  185,
  GOOGL: 170,
  META:  490,
  AMD:   165,
};

const DEFAULT_FALLBACK_PRICE = 100;
const RISK_FREE_RATE = 0.045; // 4.5% (approximate current fed funds rate for educational model)
const BASE_IV_BY_SYMBOL: Record<string, number> = {
  SPY:   0.16,
  QQQ:   0.20,
  AAPL:  0.26,
  MSFT:  0.24,
  TSLA:  0.55,
  NVDA:  0.50,
  AMZN:  0.30,
  GOOGL: 0.28,
  META:  0.35,
  AMD:   0.48,
};
const DEFAULT_BASE_IV = 0.28;

export class SimulatedOptionsProvider implements OptionsProvider {
  readonly providerName = 'Simulated (Educational)';
  readonly isLive = false;

  async getExpirations(symbol: string): Promise<string[]> {
    const now = new Date();
    return generateMonthlyExpirations(now, 6);
  }

  async getOptionsChain(request: OptionsChainRequest): Promise<OptionsChain> {
    const { symbol } = request;
    const upperSymbol = symbol.toUpperCase();

    const now = new Date();
    const expirations = await this.getExpirations(upperSymbol);
    const expiration = request.expiration ?? expirations[0];

    const underlyingPrice =
      FALLBACK_PRICES[upperSymbol] ?? DEFAULT_FALLBACK_PRICE;
    const baseIv = BASE_IV_BY_SYMBOL[upperSymbol] ?? DEFAULT_BASE_IV;

    // Compute time to expiration in years
    const expiryDate = new Date(expiration + 'T21:00:00Z'); // ~4pm ET close
    const daysToExpiry = Math.max(
      1,
      Math.round((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
    );
    const T = daysToExpiry / 365;

    const strikes = generateStrikes(underlyingPrice);
    const dataTimestamp = now.toISOString();

    const calls: OptionsContract[] = [];
    const puts: OptionsContract[] = [];

    for (const strike of strikes) {
      for (const optionType of ['call', 'put'] as OptionType[]) {
        const iv = simulatedIV(underlyingPrice, strike, T, optionType, baseIv);
        const bs = blackScholes(underlyingPrice, strike, T, RISK_FREE_RATE, iv, optionType);
        const moneyness = classifyMoneyness(underlyingPrice, strike, optionType);
        const { bid, ask } = simulateSpread(bs.price, moneyness, daysToExpiry);
        const last = Math.round(((bid + ask) / 2) * 100) / 100;
        const { volume, openInterest } = simulateVolumeOI(underlyingPrice, strike, daysToExpiry);

        const intrinsicValue =
          optionType === 'call'
            ? Math.max(0, underlyingPrice - strike)
            : Math.max(0, strike - underlyingPrice);
        const extrinsicValue = Math.max(0, bs.price - intrinsicValue);

        const greeks: Greeks = {
          delta: Math.round(bs.delta * 10000) / 10000,
          gamma: Math.round(bs.gamma * 100000) / 100000,
          theta: Math.round(bs.theta * 10000) / 10000,
          vega:  Math.round(bs.vega * 10000) / 10000,
          rho:   Math.round(bs.rho * 10000) / 10000,
        };

        const contract: OptionsContract = {
          symbol: upperSymbol,
          optionSymbol: buildOptionSymbol(upperSymbol, expiration, optionType, strike),
          expiration,
          strike,
          optionType,
          bid,
          ask,
          last,
          volume,
          openInterest,
          impliedVolatility: Math.round(iv * 10000) / 10000,
          greeks,
          moneyness,
          underlyingPrice,
          intrinsicValue: Math.round(intrinsicValue * 100) / 100,
          extrinsicValue: Math.round(extrinsicValue * 100) / 100,
          isSimulated: true,
          dataTimestamp,
        };

        if (optionType === 'call') calls.push(contract);
        else puts.push(contract);
      }
    }

    return {
      symbol: upperSymbol,
      underlyingPrice,
      expiration,
      calls,
      puts,
      isSimulated: true,
      dataTimestamp,
    };
  }
}
