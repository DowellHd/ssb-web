/**
 * Tiny route table for demo mode. Replaces the old `url.includes(...)` chain.
 *
 * Patterns look like `/paper/orders/:id`. When several routes match, the one
 * with the fewest `:params` wins, so `/signals/performance` beats `/signals/:id`
 * regardless of registration order.
 */

export type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete';

export interface DemoRequest {
  method: HttpMethod;
  /** Normalised path: no API prefix, no query string, no trailing slash. */
  path: string;
  query: Record<string, string>;
  /** Parsed JSON body (object), or `{}` when there is none. */
  body: any;
  /** Captured `:params` from the matched pattern. */
  params: Record<string, string>;
}

export type DemoHandler = (req: DemoRequest) => unknown | Promise<unknown>;

export interface DemoRoute {
  method: HttpMethod;
  pattern: string;
  handler: DemoHandler;
}

const make =
  (method: HttpMethod) =>
  (pattern: string, handler: DemoHandler): DemoRoute => ({ method, pattern, handler });

export const get = make('get');
export const post = make('post');
export const put = make('put');
export const patch = make('patch');
export const del = make('delete');

// ── Request parsing ─────────────────────────────────────────────────────────

const API_PREFIX = process.env.NEXT_PUBLIC_API_PREFIX || '/api/v1';

export function normalizePath(rawUrl: string): { path: string; query: Record<string, string> } {
  const [pathPart, queryPart = ''] = rawUrl.split('?');
  let path = pathPart;
  // axios may hand us an absolute URL if one was passed explicitly.
  path = path.replace(/^https?:\/\/[^/]+/, '');
  if (path.startsWith(API_PREFIX)) path = path.slice(API_PREFIX.length);
  if (!path.startsWith('/')) path = `/${path}`;
  if (path.length > 1) path = path.replace(/\/+$/, '');

  const query: Record<string, string> = {};
  new URLSearchParams(queryPart).forEach((v, k) => {
    query[k] = v;
  });
  return { path, query };
}

interface AxiosLikeConfig {
  url?: string;
  method?: string;
  params?: Record<string, unknown>;
  data?: unknown;
}

export function parseRequest(config: AxiosLikeConfig): Omit<DemoRequest, 'params'> {
  const { path, query } = normalizePath(config.url || '/');
  if (config.params) {
    for (const [k, v] of Object.entries(config.params)) {
      if (v !== undefined && v !== null) query[k] = String(v);
    }
  }

  // Request interceptors see the *un-serialised* body (an object), while some
  // callers pre-stringify. Accept both.
  let body: any = {};
  if (typeof config.data === 'string' && config.data.length) {
    try {
      body = JSON.parse(config.data);
    } catch {
      body = {};
    }
  } else if (config.data && typeof config.data === 'object') {
    body = config.data;
  }

  return { method: (config.method || 'get').toLowerCase() as HttpMethod, path, query, body };
}

// ── Matching ────────────────────────────────────────────────────────────────

interface Compiled {
  route: DemoRoute;
  segments: string[];
  paramCount: number;
}

export function compileRoutes(routes: DemoRoute[]): Compiled[] {
  return routes.map((route) => {
    const segments = route.pattern.split('/').filter(Boolean);
    return { route, segments, paramCount: segments.filter((s) => s.startsWith(':')).length };
  });
}

export function matchRoute(
  compiled: Compiled[],
  method: HttpMethod,
  path: string,
): { route: DemoRoute; params: Record<string, string> } | null {
  const parts = path.split('/').filter(Boolean);
  let best: { c: Compiled; params: Record<string, string> } | null = null;

  for (const c of compiled) {
    if (c.route.method !== method || c.segments.length !== parts.length) continue;
    const params: Record<string, string> = {};
    let ok = true;
    for (let i = 0; i < parts.length; i++) {
      const seg = c.segments[i];
      if (seg.startsWith(':')) params[seg.slice(1)] = decodeURIComponent(parts[i]);
      else if (seg !== parts[i]) {
        ok = false;
        break;
      }
    }
    if (ok && (!best || c.paramCount < best.c.paramCount)) best = { c, params };
  }
  return best ? { route: best.c.route, params: best.params } : null;
}
