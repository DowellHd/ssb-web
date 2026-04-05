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

export async function listBrokerConnections(): Promise<BrokerConnection[]> {
  const res = await apiClient.get('/brokers/');
  return res.data;
}

export async function connectBroker(data: { broker_name: string; display_name?: string }): Promise<BrokerConnection> {
  const res = await apiClient.post('/brokers/connect', data);
  return res.data;
}

export async function removeBrokerConnection(id: string): Promise<void> {
  await apiClient.delete(`/brokers/${id}`);
}

export async function getBrokerAccountSummary(id: string): Promise<Record<string, unknown>> {
  const res = await apiClient.get(`/brokers/${id}/summary`);
  return res.data;
}

export async function syncBrokerAccount(id: string): Promise<void> {
  await apiClient.post(`/brokers/${id}/sync`);
}

export async function getSupportedBrokers(): Promise<{ brokers: { key: string; name: string; status: string }[]; disclaimer: string }> {
  const res = await apiClient.get('/brokers/supported');
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
