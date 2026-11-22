import type { DemoRoute } from '../router';
import { accountRoutes } from './account';
import { assistantRoutes } from './assistant';
import { authRoutes } from './auth';
import { cryptoRoutes } from './crypto';
import { intelligenceRoutes } from './intelligence';
import { learnRoutes } from './learn';
import { marketDataRoutes } from './market-data';
import { newsRoutes } from './news';
import { paperRoutes } from './paper';
import { portfolioRoutes } from './portfolio';
import { signalRoutes } from './signals';
import { tradingRoutes } from './trading';

/** Hand-written routes. Anything not matched here falls through to the catch-all. */
export const ROUTES: DemoRoute[] = [
  ...accountRoutes,
  ...authRoutes,
  ...marketDataRoutes,
  ...signalRoutes,
  ...tradingRoutes,
  ...paperRoutes,
  ...portfolioRoutes,
  ...intelligenceRoutes,
  ...cryptoRoutes,
  ...newsRoutes,
  ...learnRoutes,
  ...assistantRoutes,
];
