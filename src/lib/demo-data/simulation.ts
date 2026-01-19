/**
 * Demo data for simulation results.
 * Matches API response shape from /api/v1/simulations
 *
 * DEMO DATA - FOR DEMONSTRATION PURPOSES ONLY
 */

export interface SimulationMetrics {
  total_return: number;
  cagr: number;
  sharpe_ratio: number;
  sortino_ratio: number;
  max_drawdown: number;
  volatility_annual: number;
  win_rate: number;
  profit_factor: number;
  total_trades: number;
}

export interface EquityPoint {
  date: string;
  value: number;
  benchmark?: number;
}

export interface Trade {
  id: string;
  symbol: string;
  side: 'buy' | 'sell';
  quantity: number;
  price: number;
  timestamp: string;
  pnl?: number;
}

export interface SimulationResult {
  id: string;
  name: string;
  status: 'completed' | 'running' | 'failed';
  start_date: string;
  end_date: string;
  initial_capital: number;
  final_value: number;
  metrics: SimulationMetrics;
  equity_curve: EquityPoint[];
  trades: Trade[];
  strategy_type: string;
  created_at: string;
}

// Generate equity curve data (252 trading days = 1 year)
function generateEquityCurve(
  startDate: Date,
  initialValue: number,
  finalValue: number,
  days: number
): EquityPoint[] {
  const points: EquityPoint[] = [];
  const growthRate = (finalValue / initialValue) ** (1 / days) - 1;
  const benchmarkGrowthRate = 0.0004; // ~10% annual for SPY

  let currentValue = initialValue;
  let benchmarkValue = initialValue;
  const currentDate = new Date(startDate);

  for (let i = 0; i < days; i++) {
    // Add some volatility
    const dailyReturn = growthRate + (Math.random() - 0.5) * 0.02;
    const benchmarkReturn = benchmarkGrowthRate + (Math.random() - 0.5) * 0.015;

    currentValue *= 1 + dailyReturn;
    benchmarkValue *= 1 + benchmarkReturn;

    points.push({
      date: currentDate.toISOString().split('T')[0],
      value: Math.round(currentValue * 100) / 100,
      benchmark: Math.round(benchmarkValue * 100) / 100,
    });

    // Move to next trading day (skip weekends)
    currentDate.setDate(currentDate.getDate() + 1);
    while (currentDate.getDay() === 0 || currentDate.getDay() === 6) {
      currentDate.setDate(currentDate.getDate() + 1);
    }
  }

  return points;
}

// Generate sample trades
function generateTrades(count: number): Trade[] {
  const symbols = ['AAPL', 'MSFT', 'GOOGL', 'JPM', 'XOM', 'JNJ'];
  const trades: Trade[] = [];
  const baseDate = new Date('2024-01-01');

  for (let i = 0; i < count; i++) {
    const symbol = symbols[Math.floor(Math.random() * symbols.length)];
    const side = Math.random() > 0.5 ? 'buy' : 'sell';
    const quantity = Math.floor(Math.random() * 50) + 10;
    const price = 100 + Math.random() * 200;
    const pnl = side === 'sell' ? (Math.random() - 0.4) * 1000 : undefined;

    const tradeDate = new Date(baseDate);
    tradeDate.setDate(tradeDate.getDate() + i * 3);

    trades.push({
      id: `trade-${i}`,
      symbol,
      side,
      quantity,
      price: Math.round(price * 100) / 100,
      timestamp: tradeDate.toISOString(),
      pnl: pnl ? Math.round(pnl * 100) / 100 : undefined,
    });
  }

  return trades;
}

export const demoSimulation: SimulationResult = {
  id: 'sim-demo-001',
  name: 'Momentum Strategy Backtest',
  status: 'completed',
  start_date: '2023-01-01',
  end_date: '2023-12-31',
  initial_capital: 100000,
  final_value: 118500,
  metrics: {
    total_return: 18.5,
    cagr: 18.5,
    sharpe_ratio: 1.24,
    sortino_ratio: 1.58,
    max_drawdown: 12.3,
    volatility_annual: 15.2,
    win_rate: 58.5,
    profit_factor: 1.65,
    total_trades: 156,
  },
  equity_curve: generateEquityCurve(new Date('2023-01-01'), 100000, 118500, 252),
  trades: generateTrades(50),
  strategy_type: 'momentum',
  created_at: '2024-01-15T10:30:00Z',
};

export const demoSimulationsList: SimulationResult[] = [
  demoSimulation,
  {
    id: 'sim-demo-002',
    name: 'Mean Reversion Strategy',
    status: 'completed',
    start_date: '2023-01-01',
    end_date: '2023-12-31',
    initial_capital: 100000,
    final_value: 112800,
    metrics: {
      total_return: 12.8,
      cagr: 12.8,
      sharpe_ratio: 0.95,
      sortino_ratio: 1.12,
      max_drawdown: 8.5,
      volatility_annual: 12.1,
      win_rate: 62.3,
      profit_factor: 1.42,
      total_trades: 234,
    },
    equity_curve: generateEquityCurve(new Date('2023-01-01'), 100000, 112800, 252),
    trades: generateTrades(50),
    strategy_type: 'mean_reversion',
    created_at: '2024-01-10T14:15:00Z',
  },
  {
    id: 'sim-demo-003',
    name: 'Trend Following Portfolio',
    status: 'completed',
    start_date: '2023-06-01',
    end_date: '2023-12-31',
    initial_capital: 50000,
    final_value: 54250,
    metrics: {
      total_return: 8.5,
      cagr: 14.8,
      sharpe_ratio: 1.05,
      sortino_ratio: 1.28,
      max_drawdown: 6.2,
      volatility_annual: 11.5,
      win_rate: 55.0,
      profit_factor: 1.35,
      total_trades: 89,
    },
    equity_curve: generateEquityCurve(new Date('2023-06-01'), 50000, 54250, 126),
    trades: generateTrades(30),
    strategy_type: 'trend_following',
    created_at: '2024-01-05T09:00:00Z',
  },
];
