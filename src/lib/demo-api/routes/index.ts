import type { DemoRoute } from '../router';
import { assistantRoutes } from './assistant';
import { authRoutes } from './auth';
import { marketDataRoutes } from './market-data';
import { signalRoutes } from './signals';
import { tradingRoutes } from './trading';

/** Hand-written routes. Anything not matched here falls through to the catch-all. */
export const ROUTES: DemoRoute[] = [
  ...authRoutes,
  ...marketDataRoutes,
  ...signalRoutes,
  ...tradingRoutes,
  ...assistantRoutes,
];
