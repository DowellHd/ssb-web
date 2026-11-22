/**
 * API client for making requests to the backend.
 * Handles authentication, request/response interceptors, error handling, and demo mode.
 */
import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

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
   * Routes live in ./demo-api; every request is answered locally (unmatched
   * endpoints get an empty-but-valid response), so nothing hits the network.
   */
  private async handleDemoRequest(config: InternalAxiosRequestConfig): Promise<any> {
    // Lazy import: the demo layer is code-split and never loaded unless demo mode is on.
    const { handleDemoRequest } = await import('./demo-api');
    return handleDemoRequest(config);
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
