/**
 * Demo data for portfolio holdings.
 * Used across intelligence visualizations.
 *
 * DEMO DATA - FOR DEMONSTRATION PURPOSES ONLY
 */

export interface Holding {
  symbol: string;
  name: string;
  quantity: number;
  current_price: number;
  market_value: number;
  weight: number;
  cost_basis: number;
  unrealized_pnl: number;
  unrealized_pnl_pct: number;
  asset_class: string;
  sector?: string;
}

export interface PortfolioSummary {
  portfolio_id: string;
  total_value: number;
  cash: number;
  holdings_value: number;
  total_cost_basis: number;
  total_unrealized_pnl: number;
  total_unrealized_pnl_pct: number;
  holdings: Holding[];
}

export const demoPortfolio: PortfolioSummary = {
  portfolio_id: 'demo-portfolio-001',
  total_value: 125000,
  cash: 5000,
  holdings_value: 120000,
  total_cost_basis: 105000,
  total_unrealized_pnl: 15000,
  total_unrealized_pnl_pct: 14.29,
  holdings: [
    {
      symbol: 'AAPL',
      name: 'Apple Inc.',
      quantity: 150,
      current_price: 208.33,
      market_value: 31250,
      weight: 0.25,
      cost_basis: 27500,
      unrealized_pnl: 3750,
      unrealized_pnl_pct: 13.64,
      asset_class: 'stocks',
      sector: 'technology',
    },
    {
      symbol: 'MSFT',
      name: 'Microsoft Corporation',
      quantity: 60,
      current_price: 416.67,
      market_value: 25000,
      weight: 0.20,
      cost_basis: 21000,
      unrealized_pnl: 4000,
      unrealized_pnl_pct: 19.05,
      asset_class: 'stocks',
      sector: 'technology',
    },
    {
      symbol: 'GOOGL',
      name: 'Alphabet Inc.',
      quantity: 120,
      current_price: 187.50,
      market_value: 22500,
      weight: 0.18,
      cost_basis: 19500,
      unrealized_pnl: 3000,
      unrealized_pnl_pct: 15.38,
      asset_class: 'stocks',
      sector: 'technology',
    },
    {
      symbol: 'JPM',
      name: 'JPMorgan Chase & Co.',
      quantity: 90,
      current_price: 208.33,
      market_value: 18750,
      weight: 0.15,
      cost_basis: 16500,
      unrealized_pnl: 2250,
      unrealized_pnl_pct: 13.64,
      asset_class: 'stocks',
      sector: 'financials',
    },
    {
      symbol: 'XOM',
      name: 'Exxon Mobil Corporation',
      quantity: 125,
      current_price: 120.00,
      market_value: 15000,
      weight: 0.12,
      cost_basis: 14000,
      unrealized_pnl: 1000,
      unrealized_pnl_pct: 7.14,
      asset_class: 'stocks',
      sector: 'energy',
    },
    {
      symbol: 'JNJ',
      name: 'Johnson & Johnson',
      quantity: 75,
      current_price: 100.00,
      market_value: 7500,
      weight: 0.10,
      cost_basis: 6500,
      unrealized_pnl: 1000,
      unrealized_pnl_pct: 15.38,
      asset_class: 'stocks',
      sector: 'healthcare',
    },
  ],
};

// Sector breakdown computed from holdings
export const demoSectorBreakdown = [
  { sector: 'Technology', weight: 0.63, value: 78750 },
  { sector: 'Financials', weight: 0.15, value: 18750 },
  { sector: 'Energy', weight: 0.12, value: 15000 },
  { sector: 'Healthcare', weight: 0.10, value: 7500 },
];
