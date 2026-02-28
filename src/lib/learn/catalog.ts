/**
 * Learn catalog type definitions.
 *
 * This is the single source of truth for all Learn content types.
 * Pages render from catalog data; the API client handles entitlements and progress.
 */

// ============================================================================
// Enumerations
// ============================================================================

export type ContentCategory =
  | 'fundamentals'
  | 'technical_analysis'
  | 'risk_management'
  | 'portfolio_theory'
  | 'market_mechanics'
  | 'derivatives'
  | 'behavioral_finance'
  | 'quantitative';

export type ContentDifficulty = 'beginner' | 'intermediate' | 'advanced';

/** Tier required to access a piece of content. */
export type TierRequired = 'free' | 'starter' | 'pro' | 'institutional';

// ============================================================================
// Supporting types
// ============================================================================

/** An external educational resource link. */
export interface ResourceLink {
  label: string;
  url: string;
  /** Publisher or source name (e.g. "SEC Investor.gov", "CFA Institute"). */
  source: string;
}

/** An optional video explanation block. */
export interface VideoResource {
  title: string;
  /** YouTube video ID — embedded only. Never autoplay. */
  youtubeId: string;
  /** Source name for attribution label (e.g. "Khan Academy"). */
  source: string;
  durationLabel: string;
  tierRequired: TierRequired;
}

// ============================================================================
// Core catalog types
// ============================================================================

export interface CatalogModule {
  /** Stable identifier matching the backend seed ID (e.g. "module-001"). */
  id: string;
  title: string;
  summary: string;
  /** Full markdown body shown on the detail page. */
  content: string;
  category: ContentCategory;
  level: ContentDifficulty;
  /** Estimated reading time in minutes. */
  durationMinutes: number;
  tierRequired: TierRequired;
  /** IDs of modules that should be completed first. */
  prereqs: string[];
  learningObjectives: string[];
  keyTakeaways: string[];
  tags: string[];
  externalResources: ResourceLink[];
  videos?: VideoResource[];
  /** Optional IDs of SSB app features this module is conceptually related to.
   *  Used by the "Explore in SSB" panel (PR feat/learn-context-links). */
  relatedFeatures?: string[];
  /** ISO date string — shown as "last updated" on the landing page. */
  lastUpdated: string;
}

export interface CatalogPath {
  id: string;
  title: string;
  summary: string;
  level: ContentDifficulty;
  tierRequired: TierRequired;
  /** Ordered list of module IDs in this path. */
  moduleIds: string[];
  /** Estimated total hours. */
  estimatedHours: number;
  tags: string[];
  /** Non-personalized "what comes next" hint for after completing this path. */
  nextPathId?: string;
  lastUpdated: string;
}

export interface CatalogGlossaryTerm {
  id: string;
  term: string;
  definition: string;
  category: ContentCategory;
  level: ContentDifficulty;
  /** Plain-language example sentence. */
  example?: string;
  /** Related term labels (not IDs) — for display. */
  relatedTerms: string[];
  /** IDs of other glossary entries to cross-link. */
  seeAlso: string[];
  lastUpdated: string;
}

// ============================================================================
// Catalog metadata
// ============================================================================

export interface CatalogMeta {
  /** ISO date of the most recent content update in the catalog. */
  catalogLastUpdated: string;
  totalModules: number;
  totalPaths: number;
  totalGlossaryTerms: number;
}

// ============================================================================
// Display helpers
// ============================================================================

export const CATEGORY_LABELS: Record<ContentCategory, string> = {
  fundamentals: 'Fundamentals',
  technical_analysis: 'Technical Analysis',
  risk_management: 'Risk Management',
  portfolio_theory: 'Portfolio Theory',
  market_mechanics: 'Market Mechanics',
  derivatives: 'Derivatives',
  behavioral_finance: 'Behavioral Finance',
  quantitative: 'Quantitative',
};

export const DIFFICULTY_CONFIG: Record<
  ContentDifficulty,
  { label: string; badgeClass: string }
> = {
  beginner: {
    label: 'Beginner',
    badgeClass: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  },
  intermediate: {
    label: 'Intermediate',
    badgeClass: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  },
  advanced: {
    label: 'Advanced',
    badgeClass: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  },
};

export const TIER_LABELS: Record<TierRequired, string> = {
  free: 'Free',
  starter: 'Starter',
  pro: 'Pro',
  institutional: 'Institutional',
};
