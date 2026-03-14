/**
 * Static cryptocurrency category mapping.
 *
 * CoinGecko's free-tier /coins/markets endpoint does not include category
 * metadata, so categories are mapped client-side by coin_id.  A coin may
 * belong to multiple categories.
 */

export type CryptoCategory =
  | 'meme'
  | 'defi'
  | 'proof-of-work'
  | 'proof-of-stake'
  | 'layer-1'
  | 'layer-2'
  | 'stablecoin'
  | 'exchange-token';

export interface CategoryInfo {
  id: CryptoCategory;
  label: string;
  color: string;
}

export const CATEGORIES: CategoryInfo[] = [
  { id: 'meme',           label: 'Meme',     color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
  { id: 'defi',           label: 'DeFi',     color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
  { id: 'proof-of-work',  label: 'PoW',      color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
  { id: 'proof-of-stake', label: 'PoS',      color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  { id: 'layer-1',        label: 'L1',       color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  { id: 'layer-2',        label: 'L2',       color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400' },
  { id: 'stablecoin',     label: 'Stable',   color: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' },
  { id: 'exchange-token', label: 'Exchange', color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' },
];

/** Map coin_id → categories[].  Coins absent from this map have no category. */
export const COIN_CATEGORIES: Record<string, CryptoCategory[]> = {
  // ── Layer 1 / Proof of Work ───────────────────────────────────────────────
  'bitcoin':            ['proof-of-work', 'layer-1'],
  'litecoin':           ['proof-of-work'],
  'bitcoin-cash':       ['proof-of-work'],
  'bitcoin-sv':         ['proof-of-work'],
  'ethereum-classic':   ['proof-of-work'],
  'monero':             ['proof-of-work'],
  'zcash':              ['proof-of-work'],
  'dogecoin':           ['proof-of-work', 'meme'],

  // ── Layer 1 / Proof of Stake ──────────────────────────────────────────────
  'ethereum':           ['proof-of-stake', 'layer-1'],
  'solana':             ['proof-of-stake', 'layer-1'],
  'cardano':            ['proof-of-stake', 'layer-1'],
  'avalanche-2':        ['proof-of-stake', 'layer-1'],
  'polkadot':           ['proof-of-stake', 'layer-1'],
  'tron':               ['proof-of-stake', 'layer-1'],
  'near':               ['proof-of-stake', 'layer-1'],
  'cosmos':             ['proof-of-stake', 'layer-1'],
  'aptos':              ['proof-of-stake', 'layer-1'],
  'sui':                ['proof-of-stake', 'layer-1'],
  'fantom':             ['proof-of-stake', 'layer-1'],
  'tezos':              ['proof-of-stake'],
  'vechain':            ['proof-of-stake'],
  'hedera-hashgraph':   ['proof-of-stake'],
  'internet-computer':  ['proof-of-stake', 'layer-1'],
  'the-open-network':   ['proof-of-stake', 'layer-1'],
  'sei-network':        ['proof-of-stake', 'layer-1'],
  'celestia':           ['layer-1'],
  'staked-ether':       ['proof-of-stake'],
  'injective-protocol': ['proof-of-stake', 'layer-1'],

  // ── Layer 2 ───────────────────────────────────────────────────────────────
  'matic-network':              ['proof-of-stake', 'layer-2'],
  'polygon-ecosystem-token':    ['proof-of-stake', 'layer-2'],
  'optimism':                   ['layer-2'],
  'arbitrum':                   ['layer-2'],
  'zksync':                     ['layer-2'],
  'mantle':                     ['layer-2'],
  'immutable-x':                ['layer-2'],
  'blockstack':                 ['layer-2'],
  'metis-token':                ['layer-2'],

  // ── Stablecoins ───────────────────────────────────────────────────────────
  'tether':             ['stablecoin'],
  'usd-coin':           ['stablecoin'],
  'dai':                ['stablecoin', 'defi'],
  'frax':               ['stablecoin'],
  'usds':               ['stablecoin'],
  'first-digital-usd':  ['stablecoin'],
  'true-usd':           ['stablecoin'],
  'paxos-standard':     ['stablecoin'],
  'gemini-dollar':      ['stablecoin'],
  'usdd':               ['stablecoin'],
  'ethena-usde':        ['stablecoin', 'defi'],

  // ── DeFi ──────────────────────────────────────────────────────────────────
  'uniswap':                    ['defi'],
  'aave':                       ['defi'],
  'maker':                      ['defi'],
  'compound-governance-token':  ['defi'],
  'sushi':                      ['defi'],
  'curve-dao-token':            ['defi'],
  'pancakeswap-token':          ['defi'],
  'yearn-finance':               ['defi'],
  'the-graph':                  ['defi'],
  '1inch':                      ['defi'],
  'balancer':                   ['defi'],
  'lido-dao':                   ['defi'],
  'rocket-pool':                ['defi'],
  'gmx':                        ['defi'],
  'dydx':                       ['defi'],
  'dydx-chain':                 ['defi', 'layer-1'],
  'synthetix-network-token':    ['defi'],
  'osmosis':                    ['defi', 'layer-1'],
  'thorchain':                  ['defi', 'layer-1'],
  'ethena':                     ['defi'],
  'jupiter-ag':                 ['defi'],
  'raydium':                    ['defi'],

  // ── Exchange tokens ───────────────────────────────────────────────────────
  'binancecoin':        ['exchange-token', 'layer-1'],
  'okb':                ['exchange-token'],
  'crypto-com-chain':   ['exchange-token'],
  'huobi-token':        ['exchange-token'],
  'kucoin-shares':      ['exchange-token'],
  'gate-2':             ['exchange-token'],

  // ── Meme ──────────────────────────────────────────────────────────────────
  'shiba-inu':          ['meme'],
  'pepe':               ['meme'],
  'dogwifhat':          ['meme'],
  'bonk':               ['meme'],
  'floki':              ['meme'],
  'baby-doge-coin':     ['meme'],
  'brett-based':        ['meme'],
  'popcat':             ['meme'],
  'turbo':              ['meme'],
  'mog-coin':           ['meme'],
  'book-of-meme':       ['meme'],
  'cat-in-a-dogs-world':['meme'],
  'neiro-on-eth':       ['meme'],
};

/** Return the categories for a given coin_id (empty array if unknown). */
export function getCoinCategories(coinId: string): CryptoCategory[] {
  return COIN_CATEGORIES[coinId] ?? [];
}

/** Return the CategoryInfo for a given category id. */
export function getCategoryInfo(id: CryptoCategory): CategoryInfo {
  return CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[0];
}
