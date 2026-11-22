/**
 * Learn: modules, paths and glossary — served from the same static catalog the
 * app falls back to (src/lib/learn/catalog-data.ts), mapped to the API shapes.
 */
import { CATALOG_GLOSSARY, CATALOG_MODULES, CATALOG_PATHS } from '../../learn/catalog-data';
import type { CatalogGlossaryTerm, CatalogModule, CatalogPath } from '../../learn/catalog';
import { DemoHttpError } from '../errors';
import { daysAgo, iso } from '../prng';
import { get, type DemoRoute } from '../router';

const CREATED = () => iso(daysAgo(60));

const premium = (tier: string) => tier !== 'free';

function apiModule(m: CatalogModule, order: number) {
  return {
    id: m.id,
    title: m.title,
    description: m.summary,
    category: m.category,
    difficulty: m.level,
    format: 'article' as const,
    duration_minutes: m.durationMinutes,
    content: m.content,
    key_takeaways: m.keyTakeaways,
    prerequisites: m.prereqs,
    is_premium: premium(m.tierRequired),
    order,
    created_at: CREATED(),
    updated_at: `${m.lastUpdated}T00:00:00.000Z`,
    topics: m.tags,
    related_features: m.relatedFeatures ?? [],
    videos: (m.videos ?? []).map((v) => ({
      title: v.title,
      youtube_id: v.youtubeId,
      source: v.source,
      duration_label: v.durationLabel,
      tier_required: v.tierRequired,
      link_only: v.linkOnly ?? false,
    })),
    external_resources: m.externalResources.map((r) => ({ label: r.label, url: r.url, source: r.source, tier_required: 'free' })),
  };
}

function apiPath(p: CatalogPath) {
  return {
    id: p.id,
    title: p.title,
    description: p.summary,
    difficulty: p.level,
    modules: p.moduleIds,
    estimated_hours: p.estimatedHours,
    is_premium: premium(p.tierRequired),
  };
}

function apiTerm(t: CatalogGlossaryTerm) {
  return {
    id: t.id,
    term: t.term,
    definition: t.definition,
    category: t.category,
    difficulty: t.level,
    related_terms: t.relatedTerms,
    example: t.example,
    see_also: t.seeAlso,
  };
}

const modules = () => CATALOG_MODULES.map((m, i) => apiModule(m, i + 1));
const categories = () => [...new Set(CATALOG_MODULES.map((m) => m.category))];

// Seeded progress so the learn pages show some completed work.
const PROGRESS: Record<string, number> = { 'module-001': 100, 'module-002': 100, 'module-003': 60 };

export const learnRoutes: DemoRoute[] = [
  get('/learn/modules', ({ query }) => {
    const list = modules().filter(
      (m) => (!query.category || m.category === query.category) && (!query.difficulty || m.difficulty === query.difficulty),
    );
    return { modules: list, total_count: list.length, categories: categories(), user_progress: PROGRESS };
  }),

  get('/learn/modules/:id', ({ params }) => {
    const idx = CATALOG_MODULES.findIndex((m) => m.id === params.id);
    if (idx < 0) throw new DemoHttpError(404, 'Module not found');
    const progress = PROGRESS[params.id];
    return {
      module: apiModule(CATALOG_MODULES[idx], idx + 1),
      next_module: CATALOG_MODULES[idx + 1]?.id,
      previous_module: CATALOG_MODULES[idx - 1]?.id,
      user_progress: progress
        ? {
            module_id: params.id,
            user_id: 'demo-user-001',
            started_at: iso(daysAgo(10)),
            completed_at: progress === 100 ? iso(daysAgo(9)) : undefined,
            progress_percent: progress,
            quiz_score: progress === 100 ? 90 : undefined,
          }
        : undefined,
    };
  }),

  get('/learn/paths', () => ({ paths: CATALOG_PATHS.map(apiPath), total_count: CATALOG_PATHS.length })),

  get('/learn/paths/:id', ({ params }) => {
    const p = CATALOG_PATHS.find((x) => x.id === params.id);
    if (!p) throw new DemoHttpError(404, 'Path not found');
    const mods = p.moduleIds.map((id) => modules().find((m) => m.id === id)).filter((m): m is NonNullable<typeof m> => !!m);
    const done = p.moduleIds.filter((id) => PROGRESS[id] === 100).length;
    return {
      path: apiPath(p),
      modules: mods,
      user_progress_percent: p.moduleIds.length ? Math.round((done / p.moduleIds.length) * 100) : 0,
    };
  }),

  get('/learn/glossary/search', ({ query }) => {
    const q = (query.q || '').toLowerCase();
    const terms = CATALOG_GLOSSARY.filter((t) => t.term.toLowerCase().includes(q) || t.definition.toLowerCase().includes(q)).map(apiTerm);
    return { terms, query: query.q || '', total_matches: terms.length };
  }),

  get('/learn/glossary', ({ query }) => {
    const terms = CATALOG_GLOSSARY.filter(
      (t) =>
        (!query.category || t.category === query.category) &&
        (!query.difficulty || t.level === query.difficulty) &&
        (!query.letter || t.term.toUpperCase().startsWith(query.letter.toUpperCase())),
    ).map(apiTerm);
    return {
      terms,
      total_count: terms.length,
      categories: [...new Set(CATALOG_GLOSSARY.map((t) => t.category))],
      letters: [...new Set(CATALOG_GLOSSARY.map((t) => t.term[0].toUpperCase()))].sort(),
    };
  }),

  get('/learn/glossary/:id', ({ params }) => {
    const t = CATALOG_GLOSSARY.find((x) => x.id === params.id);
    if (!t) throw new DemoHttpError(404, 'Term not found');
    return apiTerm(t);
  }),

  get('/learn/meta/categories', () => categories()),

  get('/learn/meta', () => ({
    total_modules: CATALOG_MODULES.length,
    total_paths: CATALOG_PATHS.length,
    total_glossary_terms: CATALOG_GLOSSARY.length,
    catalog_last_updated: '2026-01-01',
  })),
];
