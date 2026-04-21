/**
 * News API functions for market intelligence and news articles.
 */
import { apiClient } from '../api-client';

// ============================================================================
// Types
// ============================================================================

export type NewsCategory =
  | 'market_overview'
  | 'earnings'
  | 'economic'
  | 'sector'
  | 'company'
  | 'crypto'
  | 'commodities'
  | 'forex'
  | 'regulatory'
  | 'breaking';

export type NewsSentiment = 'bullish' | 'bearish' | 'neutral';
export type NewsPriority = 'breaking' | 'high' | 'normal' | 'low';
export type NewsSource = 'seeded' | 'benzinga' | 'polygon' | 'alpaca';

export interface NewsArticle {
  id: string;
  headline: string;
  summary: string;
  content?: string;
  source: NewsSource;
  source_url?: string;
  category: NewsCategory;
  sentiment: NewsSentiment;
  sentiment_score: number;
  symbols: string[];
  published_at: string;
  priority: NewsPriority;
  is_premium: boolean;
}

export interface NewsListResponse {
  articles: NewsArticle[];
  total_count: number;
  page: number;
  page_size: number;
  has_more: boolean;
  filters_applied: {
    categories?: string[];
    symbols?: string[];
    sentiment?: string;
    priority?: string;
    search?: string;
  };
  data_source?: 'live' | 'seeded';
}

export interface MarketMover {
  symbol: string;
  name: string;
  change_percent: number;
  price: number;
  volume?: number;
}

export interface SectorPerformance {
  sector: string;
  change_percent: number;
  trend: string;
}

export interface MarketSummary {
  summary_date: string;
  market_status: string;
  headline: string;
  overview: string;
  key_events: string[];
  top_gainers: MarketMover[];
  top_losers: MarketMover[];
  sector_performance: SectorPerformance[];
  sentiment_overview: NewsSentiment;
  sentiment_score: number;
  analysis_note: string;
  tier: string;
}

export interface MarketSummaryResponse {
  summary: MarketSummary;
  is_delayed: boolean;
  delay_minutes: number;
}

export interface NewsEntitlements {
  can_access_news: boolean;
  can_access_premium_news: boolean;
  news_delay_minutes: number;
  daily_news_limit: number;
  daily_news_used: number;
  can_access_market_summary: boolean;
  can_access_sentiment: boolean;
  categories_available: string[];
  tier: string;
}

export interface NewsFilters {
  categories?: NewsCategory[];
  symbols?: string[];
  sentiment?: NewsSentiment;
  priority?: NewsPriority;
  search?: string;
  page?: number;
  page_size?: number;
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Get news entitlements for the current user.
 */
export async function getNewsEntitlements(): Promise<NewsEntitlements> {
  const response = await apiClient.get('/news/entitlements');
  return response.data;
}

/**
 * List news articles with optional filtering.
 */
export async function listNewsArticles(filters?: NewsFilters): Promise<NewsListResponse> {
  const params: Record<string, string | number | undefined> = {};

  if (filters?.categories?.length) {
    params.categories = filters.categories.join(',');
  }
  if (filters?.symbols?.length) {
    params.symbols = filters.symbols.join(',');
  }
  if (filters?.sentiment) {
    params.sentiment = filters.sentiment;
  }
  if (filters?.priority) {
    params.priority = filters.priority;
  }
  if (filters?.search) {
    params.search = filters.search;
  }
  if (filters?.page) {
    params.page = filters.page;
  }
  if (filters?.page_size) {
    params.page_size = filters.page_size;
  }

  const response = await apiClient.get('/news', { params });
  return response.data;
}

/**
 * Get a single news article by ID.
 */
export async function getNewsArticle(articleId: string): Promise<NewsArticle> {
  const response = await apiClient.get(`/news/${articleId}`);
  return response.data;
}

/**
 * Get the daily market summary.
 */
export async function getMarketSummary(): Promise<MarketSummaryResponse> {
  const response = await apiClient.get('/news/summary/daily');
  return response.data;
}

/**
 * Get available news categories for the current user.
 */
export async function getNewsCategories(): Promise<string[]> {
  const response = await apiClient.get('/news/meta/categories');
  return response.data;
}
