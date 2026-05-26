/**
 * API client for making requests to the backend.
 * Handles authentication, request/response interceptors, error handling, and demo mode.
 */
import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import {
  generateMockSignals,
  generateMockPortfolio,
  generateMockOHLCV,
  generateMockQuote,
  generateMockPlans,
  generateMockUser,
  generateMockOrders,
} from './mock-data';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const API_PREFIX = process.env.NEXT_PUBLIC_API_PREFIX || '/api/v1';
const IS_DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

class APIClient {
  private client: AxiosInstance;
  private isDemoMode: boolean;
  // Shared refresh promise — prevents multiple simultaneous 401 responses from
  // each spawning their own refresh call, which would cause all but the first
  // to fail with an invalid refresh token.
  private refreshPromise: Promise<string> | null = null;

  constructor() {
    this.isDemoMode = IS_DEMO_MODE;

    this.client = axios.create({
      baseURL: `${API_URL}${API_PREFIX}`,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true, // Important for cookies (refresh tokens)
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor - handle demo mode and auth
    this.client.interceptors.request.use(
      async (config) => {
        // Demo mode: intercept and return mock data
        if (this.isDemoMode) {
          const mockResponse = await this.handleDemoRequest(config);
          if (mockResponse) {
            // Return a rejected promise with mock response attached
            // This will be caught by response interceptor
            return Promise.reject({
              config,
              response: {
                data: mockResponse,
                status: 200,
                statusText: 'OK',
                headers: {},
                config,
              },
              isAxiosError: true,
              toJSON: () => ({}),
              name: 'MockResponse',
              message: 'Demo mode mock response',
            });
          }
        }

        // Production mode: add access token from localStorage
        const accessToken = localStorage.getItem('access_token');
        if (accessToken) {
          config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - handle demo mode, token refresh, and errors
    this.client.interceptors.response.use(
      (response) => response,
      async (error: any) => {
        // Handle demo mode mock responses
        if (this.isDemoMode && error.name === 'MockResponse') {
          return Promise.resolve(error.response);
        }

        // Production mode: handle 401 and token refresh
        const originalRequest: any = error.config;

        // If 401 and not already retried, try to refresh token.
        // Use a shared promise so concurrent 401s all await the same single
        // refresh call instead of each racing to invalidate the refresh token.
        const isAuthEndpoint = originalRequest?.url?.match(/\/auth\/(login|register|mfa\/verify|demo-login)/);
        if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
          originalRequest._retry = true;

          if (!this.refreshPromise) {
            this.refreshPromise = axios
              .post(`${API_URL}${API_PREFIX}/auth/refresh`, {}, { withCredentials: true })
              .then((r) => {
                const token: string = r.data.access_token;
                localStorage.setItem('access_token', token);
                return token;
              })
              .finally(() => {
                this.refreshPromise = null;
              });
          }

          try {
            const access_token = await this.refreshPromise;
            originalRequest.headers.Authorization = `Bearer ${access_token}`;
            return this.client(originalRequest);
          } catch {
            localStorage.removeItem('access_token');
            if (typeof window !== 'undefined') {
              // If this was a demo session, redirect to landing with expiry notice
              const isDemo = localStorage.getItem('is_demo_session') === 'true';
              if (isDemo) {
                localStorage.removeItem('is_demo_session');
                localStorage.removeItem('demo_start_time');
                document.cookie = 'ssb_logged_in=; path=/; SameSite=Lax; Max-Age=0';
                window.location.href = '/?demo_expired=true';
                return Promise.reject(error);
              }
              // Clear the UX session cookie so middleware redirects to login.
              document.cookie = 'ssb_logged_in=; path=/; SameSite=Lax; Max-Age=0';
              window.location.href = '/auth/login';
            }
            return Promise.reject(error);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  /**
   * Handle demo mode requests and return mock data.
   */
  private async handleDemoRequest(config: InternalAxiosRequestConfig): Promise<any> {
    const url = config.url || '';
    const method = config.method?.toLowerCase();

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300 + Math.random() * 700));

    // Auth endpoints
    if (url.includes('/auth/login') && method === 'post') {
      const plan = 'free'; // Demo users get free plan
      return {
        access_token: 'demo_token_' + Date.now(),
        token_type: 'bearer',
        expires_in: 900,
        user: generateMockUser(plan),
        requires_mfa: false,
      };
    }

    if (url.includes('/auth/me')) {
      return generateMockUser('free');
    }

    // Billing endpoints
    if (url.includes('/billing/plans')) {
      return generateMockPlans();
    }

    if (url.includes('/billing/subscription')) {
      return {
        id: 'mock-subscription-id',
        plan: generateMockPlans()[0], // Free plan
        status: 'active',
        current_period_end: new Date(Date.now() + 30 * 86400000).toISOString(),
      };
    }

    // Market data endpoints
    if (url.includes('/market-data/quote/')) {
      const symbol = url.split('/').pop() || 'AAPL';
      return generateMockQuote(symbol);
    }

    if (url.includes('/market-data/quotes')) {
      // Parse symbols from query params
      const symbols = ['AAPL', 'GOOGL', 'MSFT'];
      return symbols.map((symbol) => generateMockQuote(symbol));
    }

    if (url.includes('/market-data/bars/')) {
      const symbol = url.split('/').pop()?.split('?')[0] || 'AAPL';
      return {
        symbol,
        timeframe: '1Day',
        bars: generateMockOHLCV(symbol, 100),
        count: 100,
      };
    }

    if (url.includes('/market-data/status')) {
      return {
        is_open: false,
        next_open: new Date(Date.now() + 12 * 3600000).toISOString(),
        next_close: new Date(Date.now() + 8 * 3600000).toISOString(),
        timestamp: new Date().toISOString(),
      };
    }

    // Signal endpoints
    if (url.includes('/signals/generate') && method === 'post') {
      const body = config.data ? JSON.parse(config.data) : {};
      const symbol = body.symbol || 'AAPL';
      return generateMockSignals(1, true)[0]; // Free users get delayed signals
    }

    if (url.includes('/signals/bulk') && method === 'post') {
      const body = config.data ? JSON.parse(config.data) : {};
      const symbols = body.symbols || ['AAPL', 'GOOGL', 'MSFT'];
      return {
        signals: generateMockSignals(symbols.length, true),
        total: symbols.length,
      };
    }

    if (url.includes('/signals/delay-info')) {
      return {
        plan: 'free',
        delay_minutes: 15,
        is_realtime: false,
        message: 'Signals are delayed by 15 minutes on your current plan',
      };
    }

    // Trading endpoints
    if (url.includes('/trading/portfolio')) {
      return generateMockPortfolio();
    }

    if (url.includes('/trading/positions')) {
      return generateMockPortfolio().positions;
    }

    if (url.includes('/trading/account')) {
      return generateMockPortfolio().account;
    }

    if (url.includes('/trading/orders') && method === 'get') {
      return generateMockOrders(10);
    }

    if (url.includes('/trading/orders') && method === 'post') {
      const body = config.data ? JSON.parse(config.data) : {};
      return {
        id: 'mock-order-new',
        ...body,
        status: 'pending',
        created_at: new Date().toISOString(),
      };
    }

    // Paper trading endpoints
    if (url.includes('/paper/account') && method === 'get') {
      return {
        id: 'demo-paper-account',
        user_id: 'demo-user',
        name: 'Default',
        starting_balance: 100000,
        current_cash: 87500.25,
        created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
        updated_at: new Date().toISOString(),
        is_active: true,
        total_value: 112450.75,
        positions_value: 24950.50,
        total_pl: 12450.75,
        total_pl_pct: 12.45,
      };
    }

    if (url.includes('/paper/account') && method === 'post') {
      const body = config.data ? JSON.parse(config.data) : {};
      return {
        id: 'demo-paper-account-new',
        user_id: 'demo-user',
        name: body.name || 'Default',
        starting_balance: body.starting_balance || 100000,
        current_cash: body.starting_balance || 100000,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_active: true,
        total_value: body.starting_balance || 100000,
        positions_value: 0,
        total_pl: 0,
        total_pl_pct: 0,
      };
    }

    if (url.includes('/paper/limits')) {
      return {
        plan_name: 'free',
        max_positions: 5,
        current_positions: 3,
        positions_remaining: 2,
        orders_per_day: 10,
        orders_today: 4,
        orders_remaining_today: 6,
        history_days: 30,
        is_unlimited: false,
      };
    }

    if (url.includes('/paper/positions')) {
      return [
        {
          id: 'pos-1',
          account_id: 'demo-paper-account',
          symbol: 'AAPL',
          quantity: 50,
          avg_cost: 178.50,
          current_price: 185.25,
          market_value: 9262.50,
          unrealized_pl: 337.50,
          unrealized_pl_pct: 3.78,
          last_price_update: new Date().toISOString(),
        },
        {
          id: 'pos-2',
          account_id: 'demo-paper-account',
          symbol: 'GOOGL',
          quantity: 30,
          avg_cost: 142.75,
          current_price: 148.90,
          market_value: 4467.00,
          unrealized_pl: 184.50,
          unrealized_pl_pct: 4.31,
          last_price_update: new Date().toISOString(),
        },
        {
          id: 'pos-3',
          account_id: 'demo-paper-account',
          symbol: 'MSFT',
          quantity: 25,
          avg_cost: 415.20,
          current_price: 448.84,
          market_value: 11221.00,
          unrealized_pl: 841.00,
          unrealized_pl_pct: 8.11,
          last_price_update: new Date().toISOString(),
        },
      ];
    }

    if (url.match(/\/paper\/orders\/[a-zA-Z0-9-]+$/) && method === 'delete') {
      return { success: true };
    }

    if (url.includes('/paper/orders') && method === 'get') {
      return [
        {
          id: 'order-1',
          account_id: 'demo-paper-account',
          symbol: 'AAPL',
          side: 'buy',
          quantity: 50,
          order_type: 'market',
          limit_price: null,
          status: 'filled',
          filled_quantity: 50,
          avg_fill_price: 178.50,
          created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
          filled_at: new Date(Date.now() - 7 * 86400000).toISOString(),
        },
        {
          id: 'order-2',
          account_id: 'demo-paper-account',
          symbol: 'NVDA',
          side: 'buy',
          quantity: 10,
          order_type: 'limit',
          limit_price: 875.00,
          status: 'pending',
          filled_quantity: 0,
          avg_fill_price: null,
          created_at: new Date(Date.now() - 3600000).toISOString(),
          filled_at: null,
        },
        {
          id: 'order-3',
          account_id: 'demo-paper-account',
          symbol: 'TSLA',
          side: 'sell',
          quantity: 15,
          order_type: 'market',
          limit_price: null,
          status: 'filled',
          filled_quantity: 15,
          avg_fill_price: 245.30,
          created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
          filled_at: new Date(Date.now() - 2 * 86400000).toISOString(),
        },
      ];
    }

    if (url.includes('/paper/orders') && method === 'post') {
      const body = config.data ? JSON.parse(config.data) : {};
      return {
        id: 'order-new-' + Date.now(),
        account_id: 'demo-paper-account',
        symbol: body.symbol,
        side: body.side,
        quantity: body.quantity,
        order_type: body.order_type,
        limit_price: body.limit_price,
        status: body.order_type === 'market' ? 'filled' : 'pending',
        filled_quantity: body.order_type === 'market' ? body.quantity : 0,
        avg_fill_price: body.order_type === 'market' ? 150.00 : null,
        created_at: new Date().toISOString(),
        filled_at: body.order_type === 'market' ? new Date().toISOString() : null,
      };
    }

    if (url.includes('/paper/performance')) {
      const days = 30;
      const snapshots = [];
      let value = 100000;
      for (let i = days; i >= 0; i--) {
        const date = new Date(Date.now() - i * 86400000);
        value = value * (1 + (Math.random() - 0.48) * 0.02);
        snapshots.push({
          date: date.toISOString().split('T')[0],
          total_value: Math.round(value * 100) / 100,
          cash_value: Math.round(value * 0.7 * 100) / 100,
        });
      }
      return {
        period: '30d',
        starting_value: 100000,
        current_value: value,
        total_return: value - 100000,
        total_return_pct: ((value - 100000) / 100000) * 100,
        snapshots,
      };
    }

    // Assistant endpoints
    if (url.includes('/assistant/chat') && method === 'post') {
      const body = config.data ? JSON.parse(config.data) : {};
      const message = body.message?.toLowerCase() || '';

      let reply = "I'm here to help you learn about markets and trading concepts. What would you like to know?";

      if (message.includes('market regime')) {
        reply = "A market regime refers to the prevailing conditions or state of the market over a period. Common regimes include:\n\n• **Bull Market**: Extended period of rising prices\n• **Bear Market**: Extended period of declining prices\n• **High Volatility**: Large price swings, often during uncertainty\n• **Low Volatility**: Stable, range-bound prices\n\nUnderstanding the current regime can help inform investment strategies, though past patterns don't guarantee future performance.\n\n*This is educational information only, not financial advice.*";
      } else if (message.includes('var') || message.includes('value at risk')) {
        reply = "**Value at Risk (VaR)** is a statistical measure of the potential loss in value of a portfolio over a defined period for a given confidence interval.\n\nFor example, a 1-day 95% VaR of $10,000 means there's a 95% confidence that the portfolio won't lose more than $10,000 in one day.\n\nLimitations:\n• Doesn't predict maximum loss\n• Assumes normal market conditions\n• Historical data may not reflect future risks\n\n*This is educational information only, not financial advice.*";
      } else if (message.includes('paper trading')) {
        reply = "**Paper trading** is a simulated trading practice where you can:\n\n• Practice buying and selling without real money\n• Test strategies in real market conditions\n• Learn how order types work\n• Track performance over time\n\nIt's a great way to build confidence before trading with real capital. Your paper trading account starts with virtual funds that you can use to place simulated trades.";
      } else if (message.includes('entitlement') || message.includes('plan')) {
        reply = "SSB offers different subscription tiers with varying features:\n\n• **Free**: Basic access with usage limits\n• **Pro**: Enhanced features and higher limits\n• **Institutional**: Full access for professional use\n\nYou can view and manage your subscription in the Billing section of your account settings.";
      }

      return {
        reply,
        thread_id: body.thread_id || 'demo-thread-' + Date.now(),
        citations: [],
        safety_flags: [],
      };
    }

    if (url.includes('/assistant/account-summary')) {
      return {
        plan_name: 'free',
        billing_portal_url: '/app/billing',
        last_invoice_date: null,
      };
    }

    if (url.match(/\/assistant\/thread\/[a-zA-Z0-9-]+$/) && method === 'delete') {
      return { success: true };
    }

    // Default: return null to proceed with actual request
    return null;
  }

  getInstance(): AxiosInstance {
    return this.client;
  }
}

export const apiClient = new APIClient().getInstance();

// Helper function to extract error message
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;
    const message = data?.message || data?.detail || error.message;
    if (typeof message === 'string') return message;
    if (Array.isArray(message)) {
      return message.map((e: any) => e.msg || String(e)).join(', ');
    }
    if (message && typeof message === 'object') {
      return JSON.stringify(message);
    }
    return error.message || 'An unknown error occurred';
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unknown error occurred';
}
