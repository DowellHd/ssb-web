/**
 * Live options data provider backed by the SSB API (Alpaca Markets).
 *
 * Enabled when NEXT_PUBLIC_OPTIONS_PROVIDER=alpaca. Maps backend
 * OptionSnapshot responses to the OptionsChain/OptionsContract domain types.
 *
 * The `isSimulated` discriminant on OptionsContract and OptionsChain is
 * typed as `true` in the shared interface to preserve Phase 1 safety.
 * Live data is annotated via `providerName` and `isLive = true`; the UI
 * should check `provider.isLive` rather than the `isSimulated` flag on
 * individual contracts when deciding how to label the data source.
 */

import type { OptionsChain, OptionsContract, Greeks, Moneyness, OptionType } from '../types';
import type { OptionsProvider, OptionsChainRequest } from './base-provider';
import { getOptionsChain, getOptionExpirations } from '@/lib/api/market-data';
import type { OptionSnapshot } from '@/lib/api/market-data';

// ============================================================================
// Helpers
// ============================================================================

function classifyMoneyness(underlyingPrice: number, strike: number, type: OptionType): Moneyness {
  const pct = Math.abs((strike - underlyingPrice) / underlyingPrice);
  if (pct <= 0.005) return 'atm';
  if (type === 'call') return strike < underlyingPrice ? 'itm' : 'otm';
  return strike > underlyingPrice ? 'itm' : 'otm';
}

function mapSnapshot(
  snap: OptionSnapshot,
  underlyingPrice: number,
  dataTimestamp: string,
): OptionsContract {
  const optionType = snap.right as OptionType;

  const bid = snap.bid ?? 0;
  const ask = snap.ask ?? 0;
  const mid = snap.mid ?? snap.last ?? 0;
  const last = snap.last ?? mid;
  const volume = snap.volume ?? 0;
  const openInterest = snap.open_interest ?? 0;
  const impliedVolatility = snap.iv ?? 0;

  const greeks: Greeks = {
    delta: snap.delta ?? 0,
    gamma: snap.gamma ?? 0,
    theta: snap.theta ?? 0,
    vega: snap.vega ?? 0,
  };

  const moneyness = classifyMoneyness(underlyingPrice, snap.strike, optionType);

  const intrinsicValue =
    optionType === 'call'
      ? Math.max(0, underlyingPrice - snap.strike)
      : Math.max(0, snap.strike - underlyingPrice);
  const extrinsicValue = Math.max(0, mid - intrinsicValue);

  return {
    symbol: snap.symbol,
    optionSymbol: snap.occ_symbol,
    expiration: snap.expiry,
    strike: snap.strike,
    optionType,
    bid,
    ask,
    last,
    volume,
    openInterest,
    impliedVolatility,
    greeks,
    moneyness,
    underlyingPrice,
    intrinsicValue: Math.round(intrinsicValue * 100) / 100,
    extrinsicValue: Math.round(extrinsicValue * 100) / 100,
    // The shared OptionsContract interface requires isSimulated: true as a literal.
    // This is a Phase 1 constraint. Live data is identified via provider.isLive.
    isSimulated: true,
    dataTimestamp,
  };
}

// ============================================================================
// Provider
// ============================================================================

export class ApiOptionsProvider implements OptionsProvider {
  readonly providerName = 'Alpaca Markets';
  readonly isLive = true;

  async getExpirations(symbol: string): Promise<string[]> {
    return getOptionExpirations(symbol);
  }

  async getOptionsChain(request: OptionsChainRequest): Promise<OptionsChain> {
    const { symbol } = request;

    const expirations = await this.getExpirations(symbol);
    const expiry = request.expiration ?? expirations[0];

    if (!expiry) {
      return {
        symbol,
        underlyingPrice: 0,
        expiration: '',
        calls: [],
        puts: [],
        isSimulated: true,
        dataTimestamp: new Date().toISOString(),
      };
    }

    const snapshots = await getOptionsChain(symbol, expiry);
    const dataTimestamp = new Date().toISOString();

    // Derive underlying price from ATM mid price (approximate from call/put
    // mid average near-the-money). Fall back to 0 if no data.
    let underlyingPrice = 0;
    if (snapshots.length > 0) {
      // Use the first available delta-laden call as a rough underlying proxy.
      // Alpaca provides delta; underlying ≈ strike when delta ≈ 0.5 for calls.
      const atmCalls = snapshots
        .filter(s => s.right === 'call' && s.delta !== null && Math.abs((s.delta ?? 0) - 0.5) < 0.15)
        .sort((a, b) => Math.abs((a.delta ?? 0) - 0.5) - Math.abs((b.delta ?? 0) - 0.5));
      if (atmCalls.length > 0) {
        underlyingPrice = atmCalls[0].strike;
      } else {
        // Fallback: median strike of all contracts
        const strikes = snapshots.map(s => s.strike).sort((a, b) => a - b);
        underlyingPrice = strikes[Math.floor(strikes.length / 2)] ?? 0;
      }
    }

    const calls: OptionsContract[] = snapshots
      .filter(s => s.right === 'call')
      .sort((a, b) => a.strike - b.strike)
      .map(s => mapSnapshot(s, underlyingPrice, dataTimestamp));

    const puts: OptionsContract[] = snapshots
      .filter(s => s.right === 'put')
      .sort((a, b) => a.strike - b.strike)
      .map(s => mapSnapshot(s, underlyingPrice, dataTimestamp));

    return {
      symbol: symbol.toUpperCase(),
      underlyingPrice,
      expiration: expiry,
      calls,
      puts,
      isSimulated: true,
      dataTimestamp,
    };
  }
}
