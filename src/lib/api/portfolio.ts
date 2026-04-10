import { apiClient } from '@/lib/api-client';

// ── Types ──────────────────────────────────────────────────────────────────────

export interface HoldingInput {
  symbol: string;
  weight: number;
  sector?: string;
  return_pct?: number;
}

export interface AttributionResponse {
  portfolio_return: number;
  benchmark_return: number;
  active_return: number;
  allocation_effect: number;
  selection_effect: number;
  interaction_effect: number;
  sector_attribution: {
    sector: string;
    portfolio_weight: number;
    benchmark_weight: number;
    portfolio_return: number;
    benchmark_return: number;
    allocation_effect: number;
    selection_effect: number;
    total_effect: number;
  }[];
  disclaimer: string;
}

export interface RebalanceTrade {
  symbol: string;
  current_weight: number;
  target_weight: number;
  drift: number;
  action: string;
  estimated_shares: number;
  estimated_value: number;
}

export interface RebalanceResponse {
  trades: RebalanceTrade[];
  total_turnover_pct: number;
  estimated_cost: number;
  disclaimer: string;
}

export interface StressScenario {
  scenario: string;
  description: string;
  portfolio_impact_pct: number;
  portfolio_impact_usd: number;
  worst_holding: string;
  best_holding: string;
}

export interface StressTestResponse {
  scenarios: StressScenario[];
  max_drawdown_scenario: string;
  disclaimer: string;
}

export interface TaxLossOpportunity {
  symbol: string;
  unrealized_loss: number;
  unrealized_loss_pct: number;
  cost_basis: number;
  current_price: number;
  quantity: number;
  potential_tax_savings: number;
  wash_sale_risk: boolean;
  wash_sale_window_end: string | null;
  suggested_replacement: string | null;
  holding_days: number | null;
  is_long_term: boolean;
  notes: string;
}

export interface TaxLossResponse {
  opportunities: TaxLossOpportunity[];
  total_harvestable_loss: number;
  total_potential_savings: number;
  disclaimer: string;
}

export interface CorrelationResponse {
  correlation_matrix: Record<string, Record<string, number>>;
  diversification_score: number;
  highly_correlated_pairs: { pair: string[]; correlation: number; warning: string }[];
  concentration_risk: string;
  disclaimer: string;
}

export interface Benchmark {
  id: string;
  name: string;
  description: string | null;
  components: { symbol: string; weight: number }[];
  benchmark_type: string;
  is_active: boolean;
  created_at: string;
}

export interface TradeIdea {
  id: string;
  symbol: string;
  idea_type: string;
  direction: string;
  signal_strength: string;
  thesis: string;
  entry_criteria: Record<string, unknown>;
  risk_parameters: Record<string, unknown>;
  status: string;
  created_at: string;
  expires_at?: string;
}

export interface OrderTicket {
  id: string;
  symbol: string;
  order_type: string;
  direction: string;
  quantity: number;
  limit_price: number | null;
  stop_price: number | null;
  tca_estimate: Record<string, unknown>;
  compliance_check: Record<string, unknown>;
  broker_links: Record<string, string>;
  status: string;
  notes: string | null;
  created_at: string;
}

export interface BrokerConnection {
  id: string;
  broker_name: string;
  display_name: string | null;
  connection_status: string;
  account_ids: string[];
  last_sync_at: string | null;
  error_message: string | null;
  connection_metadata: { logo?: string } | null;
  created_at: string;
}

export interface JournalEntry {
  id: string;
  symbol: string | null;
  entry_type: string;
  emotional_state: string | null;
  technical_notes: string | null;
  emotional_notes: string | null;
  lessons_learned: string | null;
  rating: number | null;
  tags: string[];
  trade_date: string | null;
  created_at: string;
}

// ── Portfolio API ──────────────────────────────────────────────────────────────

export async function getAttribution(data: {
  holdings: HoldingInput[];
  benchmark_symbol?: string;
  period_days?: number;
}): Promise<AttributionResponse> {
  const res = await apiClient.post('/portfolio/attribution', data);
  return res.data;
}

export async function getRebalance(data: {
  holdings: HoldingInput[];
  target_weights: Record<string, number>;
  portfolio_value: number;
  min_trade_size?: number;
}): Promise<RebalanceResponse> {
  const res = await apiClient.post('/portfolio/rebalance', data);
  return res.data;
}

export async function runStressTest(data: {
  holdings: HoldingInput[];
  portfolio_value: number;
}): Promise<StressTestResponse> {
  const res = await apiClient.post('/portfolio/stress-test', data);
  return res.data;
}

export async function getTaxLoss(data: {
  positions: {
    symbol: string;
    cost_basis: number;
    current_price: number;
    quantity: number;
    purchase_date?: string;
  }[];
  tax_rate?: number;
}): Promise<TaxLossResponse> {
  const res = await apiClient.post('/portfolio/tax-loss', data);
  return res.data;
}

export async function getCorrelation(symbols: string[]): Promise<CorrelationResponse> {
  const res = await apiClient.post('/portfolio/correlation', { symbols });
  return res.data;
}

export async function getBenchmarks(): Promise<Benchmark[]> {
  const res = await apiClient.get('/portfolio/benchmarks');
  return res.data;
}

export async function createBenchmark(data: {
  name: string;
  description?: string;
  components: { symbol: string; weight: number }[];
}): Promise<Benchmark> {
  const res = await apiClient.post('/portfolio/benchmarks', data);
  return res.data;
}

export async function deleteBenchmark(id: string): Promise<void> {
  await apiClient.delete(`/portfolio/benchmarks/${id}`);
}

// ── Trade Ideas ────────────────────────────────────────────────────────────────

export async function generateTradeIdeas(data: {
  symbols: string[];
  idea_types?: string[];
}): Promise<TradeIdea[]> {
  const res = await apiClient.post('/trade-ideas/generate', data);
  return res.data;
}

export async function listTradeIdeas(): Promise<TradeIdea[]> {
  const res = await apiClient.get('/trade-ideas/');
  return res.data;
}

export async function updateIdeaStatus(id: string, status: string): Promise<void> {
  await apiClient.post(`/trade-ideas/${id}/status`, { status });
}

export async function deleteTradeIdea(id: string): Promise<void> {
  await apiClient.delete(`/trade-ideas/${id}`);
}

// ── Order Prep ─────────────────────────────────────────────────────────────────

export async function createOrderTicket(data: {
  symbol: string;
  order_type: string;
  direction: string;
  quantity: number;
  limit_price?: number;
  stop_price?: number;
  notes?: string;
}): Promise<OrderTicket> {
  const res = await apiClient.post('/order-prep/tickets', data);
  return res.data;
}

export async function listOrderTickets(): Promise<OrderTicket[]> {
  const res = await apiClient.get('/order-prep/tickets');
  return res.data;
}

export async function getBrokerLinks(symbol: string): Promise<{ symbol: string; broker_links: Record<string, string>; disclaimer: string }> {
  const res = await apiClient.get(`/order-prep/broker-links/${symbol}`);
  return res.data;
}

// ── Broker Connections ─────────────────────────────────────────────────────────

export interface PlaidHolding {
  symbol: string;
  name: string;
  quantity: number;
  institution_price: number;
  institution_value: number;
  cost_basis: number | null;
  security_type: string;
}

export interface PlaidAccount {
  account_id: string;
  name: string;
  type: string;
  subtype: string;
  current: number;
  available: number;
  iso_currency_code: string;
}

export async function listBrokerConnections(): Promise<BrokerConnection[]> {
  const res = await apiClient.get('/brokers/');
  return res.data;
}

export async function removeBrokerConnection(id: string): Promise<void> {
  await apiClient.delete(`/brokers/${id}`);
}

export async function syncBrokerAccount(id: string): Promise<{ synced_at: string; total_balance: number; holding_count: number }> {
  const res = await apiClient.post(`/brokers/${id}/sync`);
  return res.data;
}

export async function getBrokerHoldings(id: string): Promise<{ holdings: PlaidHolding[]; accounts: PlaidAccount[]; disclaimer: string }> {
  const res = await apiClient.get(`/brokers/${id}/holdings`);
  return res.data;
}

export async function getBrokerBalances(id: string): Promise<{ total_balance: number; accounts: PlaidAccount[]; disclaimer: string }> {
  const res = await apiClient.get(`/brokers/${id}/balances`);
  return res.data;
}

export async function getSupportedBrokers(): Promise<{ brokers: { key: string; name: string; status: string }[]; disclaimer: string }> {
  const res = await apiClient.get('/brokers/supported');
  return res.data;
}

// ── Portfolio Summary (real holdings aggregated) ───────────────────────────────

export interface SectorAllocation {
  sector: string;
  value: number;
  weight: number;
}

export interface ConnectionSummary {
  id: string;
  display_name: string;
  logo: string | null;
  value: number;
  holding_count: number;
  last_sync_at: string | null;
}

export interface PortfolioSummary {
  total_value: number;
  total_cost_basis: number;
  unrealized_pl: number;
  unrealized_pl_pct: number;
  sector_allocation: SectorAllocation[];
  connections: ConnectionSummary[];
  holding_count: number;
  disclaimer: string;
}

export async function getPortfolioSummary(): Promise<PortfolioSummary> {
  const res = await apiClient.get('/brokers/portfolio-summary');
  return res.data;
}

// ── Wash Sale Scan ─────────────────────────────────────────────────────────────

export interface WashSaleFlag {
  symbol: string;
  broker: string;
  quantity: number;
  institution_value: number;
  cost_basis: number;
  unrealized_loss: number;
  unrealized_loss_pct: number;
  wash_sale_risk: boolean;
  notes: string;
}

export interface WashSaleScanResult {
  flagged_holdings: WashSaleFlag[];
  total_flagged: number;
  total_unrealized_loss: number;
  disclaimer: string;
}

export async function getWashSaleScan(): Promise<WashSaleScanResult> {
  const res = await apiClient.get('/brokers/wash-sale-scan');
  return res.data;
}

// ── Benchmark Comparison ───────────────────────────────────────────────────────

export interface BenchmarkComparison {
  symbol: string;
  real_weight: number;
  benchmark_weight: number;
  difference: number;
  status: 'overweight' | 'underweight' | 'aligned';
}

export interface BenchmarkComparisonResult {
  benchmark_name: string;
  benchmark_type: string;
  total_portfolio_value: number;
  comparisons: BenchmarkComparison[];
  disclaimer: string;
}

export async function getBenchmarkComparison(benchmarkId: string): Promise<BenchmarkComparisonResult> {
  const res = await apiClient.get(`/portfolio/benchmarks/${benchmarkId}/comparison`);
  return res.data;
}

// ── Real vs Paper ──────────────────────────────────────────────────────────────

export interface RealVsPaperResult {
  real_portfolio: {
    total_value: number;
    total_cost_basis: number;
    unrealized_pl: number;
    unrealized_pl_pct: number;
    holding_count: number;
  };
  paper_portfolio: {
    total_equity: number;
    total_cost_basis: number;
    unrealized_pl: number;
    unrealized_pl_pct: number;
    position_count: number;
    account_count: number;
  };
  shared_symbols: {
    symbol: string;
    real_value: number;
    real_quantity: number;
    paper_value: number;
    paper_quantity: number;
  }[];
  disclaimer: string;
}

export async function getRealVsPaperComparison(): Promise<RealVsPaperResult> {
  const res = await apiClient.get('/portfolio/real-vs-paper');
  return res.data;
}

// Plaid OAuth
export async function createPlaidLinkToken(): Promise<{ link_token: string }> {
  const res = await apiClient.post('/brokers/plaid/link-token');
  return res.data;
}

export async function exchangePlaidToken(data: {
  public_token: string;
  institution_name: string;
  institution_id: string;
}): Promise<{ id: string; display_name: string; connection_status: string; connected: boolean }> {
  const res = await apiClient.post('/brokers/plaid/exchange', data);
  return res.data;
}

// ── Investment Compliance ──────────────────────────────────────────────────────

export async function checkWashSale(data: {
  symbol: string;
  sold_at: string;
  loss_amount: number;
  repurchased_at?: string;
}): Promise<Record<string, unknown>> {
  const res = await apiClient.post('/investment-compliance/wash-sale', data);
  return res.data;
}

export async function listJournalEntries(): Promise<JournalEntry[]> {
  const res = await apiClient.get('/investment-compliance/journal');
  return res.data;
}

export async function createJournalEntry(data: {
  symbol?: string;
  entry_type: string;
  emotional_state?: string;
  technical_notes?: string;
  emotional_notes?: string;
  lessons_learned?: string;
  rating?: number;
  tags?: string[];
  trade_date?: string;
}): Promise<JournalEntry> {
  const res = await apiClient.post('/investment-compliance/journal', data);
  return res.data;
}

export async function deleteJournalEntry(id: string): Promise<void> {
  await apiClient.delete(`/investment-compliance/journal/${id}`);
}
