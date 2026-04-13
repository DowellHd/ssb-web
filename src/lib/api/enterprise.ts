/**
 * Enterprise API client — Phase 5 features.
 *
 * Covers: Webhooks, API Keys, Advisor Platform,
 *         Alternative Investments, Algorithmic Strategies, Compliance
 */
import { apiClient } from '../api-client';

// ============================================================================
// Webhooks
// ============================================================================

export type WebhookStatus = 'active' | 'paused' | 'failed';
export type WebhookDeliveryStatus = 'pending' | 'success' | 'failed' | 'retrying';

export interface WebhookSubscription {
  id: string;
  url: string;
  description: string | null;
  events: string[];
  status: WebhookStatus;
  consecutive_failures: number;
  last_success_at: string | null;
  last_failure_at: string | null;
  created_at: string;
}

export interface WebhookSubscriptionCreated extends WebhookSubscription {
  signing_secret: string;
}

export interface WebhookDelivery {
  id: string;
  subscription_id: string;
  event_type: string;
  status: WebhookDeliveryStatus;
  attempt_count: number;
  http_status: number | null;
  error_message: string | null;
  delivered_at: string | null;
  created_at: string;
}

export interface CreateWebhookRequest {
  url: string;
  description?: string;
  events?: string[];
}

export interface UpdateWebhookRequest {
  url?: string;
  description?: string;
  events?: string[];
  status?: WebhookStatus;
}

export const WEBHOOK_EVENTS = [
  { key: 'paper.order.filled', label: 'Paper Order Filled' },
  { key: 'paper.position.opened', label: 'Position Opened' },
  { key: 'paper.position.closed', label: 'Position Closed' },
  { key: 'price.alert.triggered', label: 'Price Alert Triggered' },
  { key: 'intelligence.regime.change', label: 'Regime Change' },
  { key: 'intelligence.signal.generated', label: 'Signal Generated' },
  { key: 'backtest.complete', label: 'Backtest Complete' },
  { key: 'community.trade_idea.posted', label: 'Trade Idea Posted' },
  { key: 'billing.subscription.changed', label: 'Subscription Changed' },
] as const;

export const webhooksApi = {
  list: async () =>
    (await apiClient.get<WebhookSubscription[]>('/enterprise/webhooks')).data,

  create: async (data: CreateWebhookRequest) =>
    (await apiClient.post<WebhookSubscriptionCreated>('/enterprise/webhooks', data)).data,

  update: async (id: string, data: UpdateWebhookRequest) =>
    (await apiClient.patch<WebhookSubscription>(`/enterprise/webhooks/${id}`, data)).data,

  delete: (id: string) =>
    apiClient.delete(`/enterprise/webhooks/${id}`),

  listDeliveries: async (id: string, limit = 50) =>
    (await apiClient.get<WebhookDelivery[]>(`/enterprise/webhooks/${id}/deliveries?limit=${limit}`)).data,
};

// ============================================================================
// API Keys
// ============================================================================

export interface APIKey {
  id: string;
  name: string;
  key_prefix: string;
  scopes: string[];
  allowed_ips: string[];
  is_active: boolean;
  last_used_at: string | null;
  expires_at: string | null;
  created_at: string;
}

export interface APIKeyCreated extends APIKey {
  raw_key: string;
}

export interface CreateAPIKeyRequest {
  name: string;
  scopes?: string[];
  allowed_ips?: string[];
  expires_in_days?: number;
  rate_limit_per_minute?: number;
}

export const API_KEY_SCOPES = [
  { key: 'portfolio:read', label: 'Read Portfolio' },
  { key: 'trades:write', label: 'Execute Trades' },
  { key: 'analytics:read', label: 'Read Analytics' },
  { key: 'market_data:read', label: 'Read Market Data' },
  { key: 'webhooks:manage', label: 'Manage Webhooks' },
  { key: 'full_access', label: 'Full Access' },
] as const;

export interface APIKeyUsageStats {
  key_id: string;
  key_prefix: string;
  requests_last_24h: number;
  requests_last_7d: number;
  last_used_at: string | null;
  top_endpoints_7d: { endpoint: string; count: number }[];
}

export const apiKeysApi = {
  list: async () =>
    (await apiClient.get<APIKey[]>('/enterprise/api-keys')).data,

  create: async (data: CreateAPIKeyRequest) =>
    (await apiClient.post<APIKeyCreated>('/enterprise/api-keys', data)).data,

  revoke: (id: string) =>
    apiClient.delete(`/enterprise/api-keys/${id}`),

  getUsage: async (id: string) =>
    (await apiClient.get<APIKeyUsageStats>(`/enterprise/api-keys/${id}/usage`)).data,
};

// ============================================================================
// Advisor Platform
// ============================================================================

export type AdvisorClientStatus = 'prospect' | 'active' | 'inactive' | 'terminated';
export type RiskTolerance = 'low' | 'medium' | 'high';
export type KYCStatus = 'pending' | 'approved' | 'rejected';
export type ClientSegment = 'mass_market' | 'affluent' | 'hnw' | 'uhnw';
export type FeeType = 'flat' | 'aum_pct' | 'hourly';
export type NoteType = 'general' | 'meeting' | 'call' | 'email' | 'follow_up' | 'review';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'pending' | 'in_progress' | 'done' | 'cancelled';

export interface AdvisorClient {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  external_ref: string | null;
  risk_tolerance: RiskTolerance | null;
  investment_horizon_years: number | null;
  aum_usd: string | null;
  tags: string[];
  status: AdvisorClientStatus;
  notes: string | null;
  // KYC / suitability
  date_of_birth: string | null;
  occupation: string | null;
  employer: string | null;
  annual_income_usd: string | null;
  net_worth_usd: string | null;
  kyc_status: KYCStatus;
  onboarding_completed_at: string | null;
  next_review_date: string | null;
  // Fee structure
  fee_type: FeeType | null;
  fee_value: string | null;
  // Segmentation
  segment: ClientSegment | null;
  created_at: string;
  updated_at: string;
}

export interface CreateAdvisorClientRequest {
  name: string;
  email?: string;
  phone?: string;
  external_ref?: string;
  risk_tolerance?: RiskTolerance;
  investment_horizon_years?: number;
  aum_usd?: string;
  tags?: string[];
  notes?: string;
  // KYC / suitability
  date_of_birth?: string;
  occupation?: string;
  employer?: string;
  annual_income_usd?: string;
  net_worth_usd?: string;
  // Fee structure
  fee_type?: FeeType;
  fee_value?: string;
  // Segmentation
  segment?: ClientSegment;
}

export interface ClientNote {
  id: string;
  advisor_client_id: string;
  note_type: NoteType;
  content: string;
  created_at: string;
}

export interface CreateClientNoteRequest {
  note_type?: NoteType;
  content: string;
}

export interface ClientTask {
  id: string;
  advisor_client_id: string;
  title: string;
  description: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  due_date: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateClientTaskRequest {
  title: string;
  description?: string;
  priority?: TaskPriority;
  due_date?: string;
}

export interface UpdateClientTaskRequest {
  title?: string;
  description?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  due_date?: string;
}

export interface ClientPortfolioLink {
  id: string;
  advisor_client_id: string;
  model_portfolio_id: string;
  allocation_override_pct: string | null;
  notes: string | null;
  linked_at: string;
}

export interface CreatePortfolioLinkRequest {
  model_portfolio_id: string;
  allocation_override_pct?: string;
  notes?: string;
}

export interface CRMDashboard {
  total_clients: number;
  by_status: Record<string, number>;
  by_segment: Record<string, number>;
  by_kyc_status: Record<string, number>;
  total_aum_usd: string;
  avg_aum_usd: string;
  open_tasks: number;
  overdue_tasks: number;
  clients_due_review: number;
}

export interface ModelPortfolio {
  id: string;
  name: string;
  description: string | null;
  risk_level: string;
  allocations: Record<string, number>;
  rebalance_frequency: string;
  drift_threshold_pct: string;
  benchmark_symbol: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateModelPortfolioRequest {
  name: string;
  description?: string;
  risk_level: string;
  allocations: Record<string, number>;
  rebalance_frequency?: string;
  drift_threshold_pct?: string;
  benchmark_symbol?: string;
  is_public?: boolean;
}

export const advisorApi = {
  // Dashboard
  getDashboard: async () =>
    (await apiClient.get<CRMDashboard>('/enterprise/advisor/dashboard')).data,

  // Clients
  listClients: async (status?: AdvisorClientStatus) =>
    (await apiClient.get<AdvisorClient[]>(`/enterprise/advisor/clients${status ? `?status_filter=${status}` : ''}`)).data,

  createClient: async (data: CreateAdvisorClientRequest) =>
    (await apiClient.post<AdvisorClient>('/enterprise/advisor/clients', data)).data,

  getClient: async (id: string) =>
    (await apiClient.get<AdvisorClient>(`/enterprise/advisor/clients/${id}`)).data,

  updateClient: async (id: string, data: Partial<CreateAdvisorClientRequest> & { status?: AdvisorClientStatus; kyc_status?: KYCStatus; next_review_date?: string; onboarding_completed_at?: string }) =>
    (await apiClient.patch<AdvisorClient>(`/enterprise/advisor/clients/${id}`, data)).data,

  deleteClient: (id: string) =>
    apiClient.delete(`/enterprise/advisor/clients/${id}`),

  bulkUpdateStatus: async (client_ids: string[], status: AdvisorClientStatus) =>
    (await apiClient.post<{ updated_count: number }>('/enterprise/advisor/clients/bulk-status', { client_ids, status })).data,

  // Model Portfolios
  listPortfolios: async () =>
    (await apiClient.get<ModelPortfolio[]>('/enterprise/advisor/portfolios')).data,

  createPortfolio: async (data: CreateModelPortfolioRequest) =>
    (await apiClient.post<ModelPortfolio>('/enterprise/advisor/portfolios', data)).data,

  // Notes
  listNotes: async (clientId: string, limit = 50) =>
    (await apiClient.get<ClientNote[]>(`/enterprise/advisor/clients/${clientId}/notes?limit=${limit}`)).data,

  createNote: async (clientId: string, data: CreateClientNoteRequest) =>
    (await apiClient.post<ClientNote>(`/enterprise/advisor/clients/${clientId}/notes`, data)).data,

  deleteNote: (clientId: string, noteId: string) =>
    apiClient.delete(`/enterprise/advisor/clients/${clientId}/notes/${noteId}`),

  // Tasks
  listTasks: async (clientId: string) =>
    (await apiClient.get<ClientTask[]>(`/enterprise/advisor/clients/${clientId}/tasks`)).data,

  createTask: async (clientId: string, data: CreateClientTaskRequest) =>
    (await apiClient.post<ClientTask>(`/enterprise/advisor/clients/${clientId}/tasks`, data)).data,

  updateTask: async (clientId: string, taskId: string, data: UpdateClientTaskRequest) =>
    (await apiClient.patch<ClientTask>(`/enterprise/advisor/clients/${clientId}/tasks/${taskId}`, data)).data,

  deleteTask: (clientId: string, taskId: string) =>
    apiClient.delete(`/enterprise/advisor/clients/${clientId}/tasks/${taskId}`),

  // Portfolio Links
  getPortfolioLink: async (clientId: string) =>
    (await apiClient.get<ClientPortfolioLink>(`/enterprise/advisor/clients/${clientId}/portfolio-link`)).data,

  createPortfolioLink: async (clientId: string, data: CreatePortfolioLinkRequest) =>
    (await apiClient.post<ClientPortfolioLink>(`/enterprise/advisor/clients/${clientId}/portfolio-link`, data)).data,

  deletePortfolioLink: (clientId: string) =>
    apiClient.delete(`/enterprise/advisor/clients/${clientId}/portfolio-link`),
};

// ============================================================================
// Alternative Investments
// ============================================================================

export type AltAssetClass =
  | 'reit'
  | 'commodity'
  | 'forex'
  | 'private_equity'
  | 'venture_capital'
  | 'infrastructure'
  | 'collectibles'
  | 'crypto_defi';

export interface AltHolding {
  id: string;
  asset_class: AltAssetClass;
  name: string;
  ticker: string | null;
  description: string | null;
  quantity: string;
  cost_basis_usd: string;
  current_value_usd: string | null;
  currency: string;
  acquisition_date: string | null;
  maturity_date: string | null;
  annual_yield_pct: string | null;
  extra: Record<string, unknown>;
  last_updated_at: string;
  created_at: string;
}

export interface AltPortfolioSummary {
  total_holdings: number;
  total_cost_basis_usd: string;
  total_current_value_usd: string;
  total_unrealized_gain_usd: string;
  total_unrealized_gain_pct: number;
  by_asset_class: Record<string, { count: number; cost_basis_usd: string; current_value_usd: string }>;
  holdings: AltHolding[];
}

export interface CreateAltHoldingRequest {
  asset_class: AltAssetClass;
  name: string;
  ticker?: string;
  description?: string;
  quantity: string;
  cost_basis_usd: string;
  current_value_usd?: string;
  currency?: string;
  acquisition_date?: string;
  annual_yield_pct?: string;
  extra?: Record<string, unknown>;
}

export const ALT_ASSET_CLASSES: { key: AltAssetClass; label: string; icon: string }[] = [
  { key: 'reit', label: 'REITs', icon: '🏢' },
  { key: 'commodity', label: 'Commodities', icon: '🛢️' },
  { key: 'forex', label: 'Forex', icon: '💱' },
  { key: 'private_equity', label: 'Private Equity', icon: '🏦' },
  { key: 'venture_capital', label: 'Venture Capital', icon: '🚀' },
  { key: 'infrastructure', label: 'Infrastructure', icon: '🏗️' },
  { key: 'collectibles', label: 'Collectibles', icon: '🖼️' },
  { key: 'crypto_defi', label: 'DeFi / Yield Farming', icon: '⛓️' },
];

export const alternativesApi = {
  getSummary: async () =>
    (await apiClient.get<AltPortfolioSummary>('/enterprise/alternatives/summary')).data,

  list: async () =>
    (await apiClient.get<AltHolding[]>('/enterprise/alternatives')).data,

  create: async (data: CreateAltHoldingRequest) =>
    (await apiClient.post<AltHolding>('/enterprise/alternatives', data)).data,

  get: async (id: string) =>
    (await apiClient.get<AltHolding>(`/enterprise/alternatives/${id}`)).data,

  update: async (id: string, data: Partial<CreateAltHoldingRequest>) =>
    (await apiClient.patch<AltHolding>(`/enterprise/alternatives/${id}`, data)).data,

  delete: (id: string) =>
    apiClient.delete(`/enterprise/alternatives/${id}`),
};

// ============================================================================
// Algorithmic Strategies
// ============================================================================

export type StrategyStatus = 'draft' | 'active' | 'archived';

export interface StrategyTemplate {
  key: string;
  name: string;
  description: string;
  parameters: Record<string, {
    type: string;
    default: number | string;
    min?: number;
    max?: number;
    options?: string[];
  }>;
  asset_classes: string[];
}

export interface AlgoStrategy {
  id: string;
  name: string;
  description: string | null;
  template: string;
  parameters: Record<string, unknown>;
  symbols: string[];
  asset_class: string;
  max_position_pct: string;
  stop_loss_pct: string | null;
  take_profit_pct: string | null;
  status: StrategyStatus;
  last_backtest_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateStrategyRequest {
  name: string;
  description?: string;
  template: string;
  parameters?: Record<string, unknown>;
  symbols: string[];
  asset_class?: string;
  max_position_pct?: string;
  stop_loss_pct?: string;
  take_profit_pct?: string;
}

export const strategiesApi = {
  getTemplates: async () =>
    (await apiClient.get<{ templates: StrategyTemplate[] }>('/enterprise/strategies/templates')).data,

  list: async () =>
    (await apiClient.get<AlgoStrategy[]>('/enterprise/strategies')).data,

  create: async (data: CreateStrategyRequest) =>
    (await apiClient.post<AlgoStrategy>('/enterprise/strategies', data)).data,

  get: async (id: string) =>
    (await apiClient.get<AlgoStrategy>(`/enterprise/strategies/${id}`)).data,

  update: async (id: string, data: Partial<CreateStrategyRequest> & { status?: StrategyStatus }) =>
    (await apiClient.patch<AlgoStrategy>(`/enterprise/strategies/${id}`, data)).data,

  delete: (id: string) =>
    apiClient.delete(`/enterprise/strategies/${id}`),
};

// ============================================================================
// Compliance
// ============================================================================

export interface ComplianceAuditReport {
  report_type: string;
  generated_at: string;
  user_id: string;
  period_days: number;
  total_events: number;
  events: {
    id: string;
    action: string;
    success: boolean;
    ip_address: string | null;
    created_at: string | null;
    metadata: Record<string, unknown> | null;
  }[];
}

export const complianceApi = {
  getAuditReport: async (days = 90) =>
    (await apiClient.get<ComplianceAuditReport>(`/enterprise/compliance/audit-report?days=${days}`)).data,
};
