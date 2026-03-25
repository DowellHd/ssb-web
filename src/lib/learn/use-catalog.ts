'use client';

/**
 * Catalog data hooks — fetches from API, merges content fields from static fallback.
 *
 * Strategy: initialise with static catalog-data.ts (zero flicker), fetch from API
 * in the background, then swap in the merged result. On API error, static data remains.
 *
 * Content fields (markdown body, sections, keyTermIds, learningObjectives) come from
 * the static catalog because they are not yet stored in the backend. All other fields
 * (videos, external_resources, related_features, metadata) are API-authoritative.
 */
import { useState, useEffect } from 'react';
import { listLearningModules, listLearningPaths } from '../api/learn';
import type { LearningModule as ApiModule, LearningPath as ApiPath } from '../api/learn';
import type {
  CatalogModule,
  CatalogPath,
  CatalogGlossaryTerm,
  CatalogMeta,
  TierRequired,
  ContentDifficulty,
  ContentCategory,
} from './catalog';
import {
  CATALOG_MODULES as STATIC_MODULES,
  CATALOG_PATHS as STATIC_PATHS,
  CATALOG_GLOSSARY as STATIC_GLOSSARY,
  CATALOG_META as STATIC_META,
} from './catalog-data';

// ============================================================================
// Module-level session cache — fetched at most once per page load
// ============================================================================

interface CatalogCache {
  modules: CatalogModule[];
  paths: CatalogPath[];
  glossary: CatalogGlossaryTerm[];
  meta: CatalogMeta;
}

let _cache: CatalogCache | null = null;
let _fetchPromise: Promise<CatalogCache> | null = null;

// Static lookup maps — used to backfill content-only fields
const _staticModuleMap = new Map<string, CatalogModule>(
  STATIC_MODULES.map((m) => [m.id, m])
);
const _staticPathMap = new Map<string, CatalogPath>(
  STATIC_PATHS.map((p) => [p.id, p])
);

// ============================================================================
// API → CatalogModule mapping
// ============================================================================

function mapApiModule(m: ApiModule): CatalogModule {
  const s = _staticModuleMap.get(m.id);
  return {
    id: m.id,
    title: m.title,
    summary: m.description,
    content: s?.content ?? '',
    category: m.category as ContentCategory,
    level: m.difficulty as ContentDifficulty,
    durationMinutes: m.duration_minutes,
    tierRequired: (m.is_premium ? 'pro' : 'free') as TierRequired,
    prereqs: m.prerequisites,
    learningObjectives: s?.learningObjectives ?? [],
    keyTakeaways: m.key_takeaways,
    tags: m.topics ?? s?.tags ?? [],
    sections: s?.sections ?? [],
    externalResources: (m.external_resources ?? []).map((r) => ({
      label: r.label,
      url: r.url,
      source: r.source,
    })),
    videos: (m.videos ?? []).map((v) => ({
      title: v.title,
      youtubeId: v.youtube_id,
      source: v.source,
      durationLabel: v.duration_label,
      tierRequired: v.tier_required as TierRequired,
      linkOnly: v.link_only ?? false,
    })),
    keyTermIds: s?.keyTermIds ?? [],
    relatedFeatures: m.related_features ?? s?.relatedFeatures ?? [],
    lastUpdated: m.updated_at?.split('T')[0] ?? s?.lastUpdated ?? '2026-01-01',
  };
}

function mapApiPath(p: ApiPath): CatalogPath {
  const s = _staticPathMap.get(p.id);
  return {
    id: p.id,
    title: p.title,
    summary: p.description,
    level: p.difficulty as ContentDifficulty,
    tierRequired: (p.is_premium ? 'pro' : 'free') as TierRequired,
    moduleIds: p.modules,
    estimatedHours: p.estimated_hours,
    tags: s?.tags ?? [],
    nextPathId: s?.nextPathId,
    lastUpdated: s?.lastUpdated ?? '2026-01-01',
  };
}

// ============================================================================
// Fetch function
// ============================================================================

async function fetchCatalog(): Promise<CatalogCache> {
  if (_cache) return _cache;
  if (_fetchPromise) return _fetchPromise;

  _fetchPromise = (async () => {
    const [modulesRes, pathsRes] = await Promise.all([
      listLearningModules(),
      listLearningPaths(),
    ]);

    const modules = modulesRes.modules.map(mapApiModule);
    const paths = pathsRes.paths.map(mapApiPath);

    // Glossary: API only returns 20 of 38 terms — use full static catalog
    const glossary = STATIC_GLOSSARY;

    const meta: CatalogMeta = {
      catalogLastUpdated: STATIC_META.catalogLastUpdated,
      totalModules: modules.length,
      totalPaths: paths.length,
      totalGlossaryTerms: glossary.length,
    };

    _cache = { modules, paths, glossary, meta };
    _fetchPromise = null;
    return _cache;
  })();

  return _fetchPromise;
}

// ============================================================================
// Hooks
// ============================================================================

interface CatalogState extends CatalogCache {
  isLoading: boolean;
}

function getInitialState(): CatalogState {
  if (_cache) {
    return { ..._cache, isLoading: false };
  }
  return {
    modules: STATIC_MODULES,
    paths: STATIC_PATHS,
    glossary: STATIC_GLOSSARY,
    meta: STATIC_META,
    isLoading: true,
  };
}

/**
 * Returns the full catalog (modules, paths, glossary, meta).
 * Renders immediately with static data, refreshes from API in background.
 */
export function useCatalog(): CatalogState {
  const [state, setState] = useState<CatalogState>(getInitialState);

  useEffect(() => {
    if (_cache) {
      setState({ ..._cache, isLoading: false });
      return;
    }
    fetchCatalog()
      .then((data) => setState({ ...data, isLoading: false }))
      .catch(() => setState((prev) => ({ ...prev, isLoading: false })));
  }, []);

  return state;
}

/**
 * Returns a single catalog module by ID.
 */
export function useCatalogModule(moduleId: string): {
  module: CatalogModule | null;
  allModules: CatalogModule[];
  isLoading: boolean;
} {
  const { modules, isLoading } = useCatalog();
  return {
    module: modules.find((m) => m.id === moduleId) ?? null,
    allModules: modules,
    isLoading,
  };
}

/**
 * Returns a single learning path plus its resolved module list.
 */
export function useCatalogPath(pathId: string): {
  path: CatalogPath | null;
  pathModules: CatalogModule[];
  isLoading: boolean;
} {
  const { paths, modules, isLoading } = useCatalog();
  const path = paths.find((p) => p.id === pathId) ?? null;
  const pathModules = path
    ? (path.moduleIds
        .map((id) => modules.find((m) => m.id === id))
        .filter(Boolean) as CatalogModule[])
    : [];
  return { path, pathModules, isLoading };
}

// ============================================================================
// Synchronous helpers (operate on already-fetched catalog arrays)
// ============================================================================

export function getAdjacentCatalogModules(
  currentId: string,
  modules: CatalogModule[]
): { previous: string | null; next: string | null } {
  const idx = modules.findIndex((m) => m.id === currentId);
  if (idx === -1) return { previous: null, next: null };
  const current = modules[idx];
  const prev = idx > 0 ? modules[idx - 1] : null;
  const next = idx < modules.length - 1 ? modules[idx + 1] : null;
  return {
    previous: prev && prev.category === current.category ? prev.id : null,
    next: next && next.category === current.category ? next.id : null,
  };
}

export function getCatalogKeyTerms(
  moduleId: string,
  modules: CatalogModule[],
  glossary: CatalogGlossaryTerm[]
): CatalogGlossaryTerm[] {
  const mod = modules.find((m) => m.id === moduleId);
  if (!mod?.keyTermIds?.length) return [];
  return glossary.filter((t) => mod.keyTermIds.includes(t.id));
}
