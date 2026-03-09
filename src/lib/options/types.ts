/**
 * Options domain types.
 *
 * All types in this file describe the options data model used across the
 * chain viewer, paper trading, and analytics layers.
 *
 * Phase 1 is simulation-only. The `isSimulated` discriminant is a required
 * literal `true` on data types that contain generated values, ensuring
 * UI layers cannot accidentally render live-looking data without explicit
 * labeling.
 */

// ============================================================================
// Enumerations
// ============================================================================

export type OptionType = 'call' | 'put';

export type OptionSide = 'buy' | 'sell';

/**
 * Opening/closing action for paper options orders.
 * Phase 1 supports buy_to_open and sell_to_close only.
 * sell_to_open is deferred to a later phase with explicit risk controls.
 */
export type OptionAction = 'buy_to_open' | 'sell_to_close';

/**
 * Where a strike sits relative to the current underlying price.
 * ATM threshold: within 0.5% of the underlying price.
 */
export type Moneyness = 'itm' | 'atm' | 'otm';

export type OptionsPaperOrderStatus = 'pending' | 'filled' | 'canceled' | 'rejected';

export type OptionsPaperPositionStatus = 'open' | 'closed' | 'expired';

/** Tier access level for options features. */
export type OptionsAccessTier = 'none' | 'basic' | 'full';

// ============================================================================
// Greeks
// ============================================================================

/**
 * Standard first-order options Greeks.
 *
 * All values are per-share, per standard convention:
 * - delta: rate of change of option price per $1 move in underlying
 * - gamma: rate of change of delta per $1 move in underlying
 * - theta: daily time decay (negative for long options)
 * - vega:  sensitivity to 1% change in implied volatility
 * - rho:   sensitivity to 1% change in risk-free rate
 */
export interface Greeks {
  delta: number;
  gamma: number;
  /** Per calendar day (negative for long calls and puts). */
  theta: number;
  /** Per 1 percentage-point change in IV. */
  vega: number;
  rho?: number;
}

// ============================================================================
// Options contract
// ============================================================================

/**
 * A single options contract (one row in the chain).
 *
 * The `isSimulated: true` literal ensures this type cannot be confused
 * with future live-data contract types. Swap by adding a separate
 * LiveOptionsContract type in a provider that sets isSimulated to false.
 */
export interface OptionsContract {
  /** Underlying ticker symbol. */
  symbol: string;
  /** OCC-style option identifier, e.g. "SPY240119C00450000". */
  optionSymbol: string;
  /** ISO date string "YYYY-MM-DD". */
  expiration: string;
  strike: number;
  optionType: OptionType;

  // Market data
  bid: number;
  ask: number;
  last: number;
  volume: number;
  openInterest: number;

  /**
   * Annualized implied volatility, expressed as a decimal.
   * e.g. 0.25 = 25% IV.
   */
  impliedVolatility: number;

  greeks: Greeks;
  moneyness: Moneyness;
  underlyingPrice: number;

  /** Theoretical intrinsic value (max(S-K, 0) for calls, max(K-S, 0) for puts). */
  intrinsicValue: number;
  /** Extrinsic (time) value = premium - intrinsic. */
  extrinsicValue: number;

  /** Discriminant: always true in Phase 1. */
  isSimulated: true;
  /** ISO timestamp when this data was generated. */
  dataTimestamp: string;
}

// ============================================================================
// Options chain
// ============================================================================

/**
 * A complete options chain for a symbol and expiration date.
 * Contracts are sorted by strike ascending within calls and puts arrays.
 */
export interface OptionsChain {
  symbol: string;
  underlyingPrice: number;
  /** ISO date string of the expiration in this chain slice. */
  expiration: string;
  calls: OptionsContract[];
  puts: OptionsContract[];
  /** Discriminant: always true in Phase 1. */
  isSimulated: true;
  /** ISO timestamp when this chain was generated. */
  dataTimestamp: string;
}

// ============================================================================
// Paper options positions and orders
// ============================================================================

/**
 * An open (or closed) paper options position.
 *
 * 1 contract = 100 shares equivalent.
 * Premium and values are always expressed per share.
 * Contract value = premium * 100 * contracts.
 */
export interface OptionsPaperPosition {
  id: string;
  accountId: string;
  symbol: string;
  optionType: OptionType;
  /** ISO date "YYYY-MM-DD". */
  expiration: string;
  strike: number;
  /** Number of contracts. Each contract represents 100 shares. */
  contracts: number;
  /** Opening action that created this position. */
  openAction: OptionAction;
  /** Premium paid/received per share at entry. */
  entryPremium: number;
  /** Current mark price per share. Null until first mark update. */
  currentPremium: number | null;
  /** Total cost basis: entryPremium * 100 * contracts. */
  entryContractValue: number;
  /** Current mark value: currentPremium * 100 * contracts. Null if no mark. */
  currentContractValue: number | null;
  unrealizedPl: number | null;
  unrealizedPlPct: number | null;
  daysToExpiration: number;
  /** ISO datetime of expiration. */
  expiresAt: string;
  status: OptionsPaperPositionStatus;
  openedAt: string;
  closedAt: string | null;
  isSimulated: true;
}

/**
 * A paper options order (filled or pending).
 */
export interface OptionsPaperOrder {
  id: string;
  accountId: string;
  symbol: string;
  optionType: OptionType;
  /** ISO date "YYYY-MM-DD". */
  expiration: string;
  strike: number;
  contracts: number;
  action: OptionAction;
  /** Estimated per-share premium at order creation. */
  estimatedPremium: number;
  /** Estimated total contract value at order creation. */
  estimatedContractValue: number;
  status: OptionsPaperOrderStatus;
  /** Actual filled per-share premium. Null until filled. */
  filledPremium: number | null;
  createdAt: string;
  filledAt: string | null;
  canceledAt: string | null;
  isSimulated: true;
}

// ============================================================================
// Entitlements
// ============================================================================

/**
 * Options feature entitlements resolved from the user's plan.
 */
export interface OptionsEntitlements {
  /** Starter+: can view options chain. */
  chainViewerEnabled: boolean;
  /** Pro+: can open paper options positions. */
  paperTradingEnabled: boolean;
  /** Pro+: can view analytics panel and payoff chart. */
  analyticsEnabled: boolean;
  /** Maximum number of contracts per position. */
  maxContracts: number;
  /** Summarized access level for UI gating. */
  accessTier: OptionsAccessTier;
}

// ============================================================================
// Request/response shapes (used by API client)
// ============================================================================

export interface OptionsChainRequest {
  symbol: string;
  expiration?: string;
}

export interface OptionsExpirationsResponse {
  symbol: string;
  expirations: string[];
}

export interface OptionsEntitlementsResponse {
  chain_viewer_enabled: boolean;
  paper_trading_enabled: boolean;
  analytics_enabled: boolean;
  max_contracts: number;
  access_tier: OptionsAccessTier;
}
