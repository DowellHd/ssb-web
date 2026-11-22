/**
 * Demo-mode API: answers every request the app would send to the backend, with
 * deterministic data, so nothing leaves the browser.
 *
 * Wired in by `src/lib/api-client.ts` when NEXT_PUBLIC_DEMO_MODE=true. With the
 * flag off none of this runs and the real axios client talks to the real API.
 */
import { catchAll } from './catch-all';
import { hashString } from './prng';
import { compileRoutes, matchRoute, parseRequest, type DemoRequest } from './router';
import { ROUTES } from './routes';

const compiled = compileRoutes(ROUTES);

interface AxiosLikeConfig {
  url?: string;
  method?: string;
  params?: Record<string, unknown>;
  data?: unknown;
}

/** Short, deterministic latency so the demo feels like a real network. */
function latencyMs(path: string): number {
  return 120 + (hashString(path) % 180);
}

/**
 * Resolve a request to mock data with no artificial latency. Always returns a
 * truthy value — in demo mode no request may fall through to the real network.
 */
export async function resolveDemoRequest(config: AxiosLikeConfig): Promise<unknown> {
  const parsed = parseRequest(config);
  const hit = matchRoute(compiled, parsed.method, parsed.path);
  const result = hit
    ? await hit.route.handler({ ...parsed, params: hit.params } as DemoRequest)
    : catchAll({ ...parsed, params: {} });
  return result ?? { success: true };
}

/** Same as `resolveDemoRequest`, plus a short deterministic network delay. */
export async function handleDemoRequest(config: AxiosLikeConfig): Promise<unknown> {
  const { path } = parseRequest(config);
  await new Promise((resolve) => setTimeout(resolve, latencyMs(path)));
  return resolveDemoRequest(config);
}
