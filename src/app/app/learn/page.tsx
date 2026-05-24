'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  GraduationCap,
  Clock,
  ChevronRight,
  Lock,
  Search,
  Award,
  Info,
  X,
  PlayCircle,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useCatalog } from '@/lib/learn/use-catalog';
import {
  CATEGORY_LABELS,
  DIFFICULTY_CONFIG,
  type ContentCategory,
  type ContentDifficulty,
  type CatalogModule,
  type CatalogPath,
  type CatalogGlossaryTerm,
  type TierRequired,
} from '@/lib/learn/catalog';
import {
  useLastVisited,
  useClearLastVisited,
  useModuleCompletion,
  getPathProgress,
  type LearnTab,
} from '@/lib/learn/use-learn-progress';
import { useLearnVideoAccess } from '@/lib/learn/learn-video-entitlements';

// ============================================================================
// Duration buckets
// ============================================================================

type DurationBucket = 'all' | 'lt15' | '15to30' | '30to60' | 'gt60';

const DURATION_BUCKET_LABELS: Record<DurationBucket, string> = {
  all: 'Any duration',
  lt15: '< 15 min',
  '15to30': '15–30 min',
  '30to60': '30–60 min',
  gt60: '60+ min',
};

function matchesDurationBucket(minutes: number, bucket: DurationBucket): boolean {
  if (bucket === 'all') return true;
  if (bucket === 'lt15') return minutes < 15;
  if (bucket === '15to30') return minutes >= 15 && minutes < 30;
  if (bucket === '30to60') return minutes >= 30 && minutes < 60;
  if (bucket === 'gt60') return minutes >= 60;
  return true;
}

// ============================================================================
// Search helpers
// ============================================================================

interface SearchResults {
  modules: CatalogModule[];
  paths: CatalogPath[];
  terms: CatalogGlossaryTerm[];
}

function runSearch(
  query: string,
  modules: CatalogModule[],
  paths: CatalogPath[],
  glossary: CatalogGlossaryTerm[]
): SearchResults {
  const q = query.toLowerCase().trim();
  if (!q) return { modules: [], paths: [], terms: [] };

  return {
    modules: modules.filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        m.summary.toLowerCase().includes(q) ||
        m.tags.some((t) => t.toLowerCase().includes(q)) ||
        CATEGORY_LABELS[m.category].toLowerCase().includes(q)
    ),
    paths: paths.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.summary.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
    ),
    terms: glossary.filter(
      (t) =>
        t.term.toLowerCase().includes(q) ||
        t.definition.toLowerCase().includes(q) ||
        t.relatedTerms.some((r) => r.toLowerCase().includes(q))
    ),
  };
}

// ============================================================================
// Page
// ============================================================================

export default function LearnPage() {
  const [activeTab, setActiveTab] = useState<LearnTab>('modules');
  const [globalSearch, setGlobalSearch] = useState('');
  const [dismissed, setDismissed] = useState(false);

  const { modules, paths, glossary, meta } = useCatalog();
  const lastVisited = useLastVisited();
  const clearLastVisited = useClearLastVisited();
  const { canAccessTier } = useLearnVideoAccess();
  const { completedIds } = useModuleCompletion();

  const isSearching = globalSearch.trim().length > 0;
  const searchResults = isSearching ? runSearch(globalSearch, modules, paths, glossary) : null;
  const totalSearchResults = searchResults
    ? searchResults.modules.length + searchResults.paths.length + searchResults.terms.length
    : 0;

  return (
    <div className="space-y-6">
      {/* Educational only banner */}
      <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30 p-4 text-sm">
        <Info className="h-4 w-4 mt-0.5 shrink-0 text-blue-600 dark:text-blue-400" />
        <p className="text-blue-800 dark:text-blue-300">
          <strong>Educational content only.</strong> All materials are for learning purposes and do
          not constitute investment advice. Always do your own research before making financial
          decisions.
        </p>
      </div>

      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Learn</h1>
          <p className="text-muted-foreground mt-1">
            Educational resources to build financial knowledge
          </p>
        </div>
        <p className="text-xs text-muted-foreground pt-1">
          Updated{' '}
          {new Date(meta.catalogLastUpdated).toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric',
          })}
        </p>
      </div>

      {/* Continue learning card */}
      {lastVisited && !dismissed && !isSearching && (
        <ContinueLearningCard
          item={lastVisited}
          onDismiss={() => {
            clearLastVisited();
            setDismissed(true);
          }}
          onNavigate={() => setActiveTab(lastVisited.tab)}
        />
      )}

      {/* Global search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search across modules, paths, and glossary…"
          value={globalSearch}
          onChange={(e) => setGlobalSearch(e.target.value)}
          className="pl-9 pr-9"
        />
        {globalSearch && (
          <button
            onClick={() => setGlobalSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Search results or tabbed content */}
      {isSearching ? (
        <SearchResultsView
          results={searchResults!}
          totalCount={totalSearchResults}
          query={globalSearch}
          canAccessTier={canAccessTier}
          completedIds={completedIds}
        />
      ) : (
        <>
          {/* Tab navigation */}
          <div className="flex gap-2 border-b">
            <TabButton
              label="Modules"
              icon={<BookOpen className="h-4 w-4" />}
              count={meta.totalModules}
              active={activeTab === 'modules'}
              onClick={() => setActiveTab('modules')}
            />
            <TabButton
              label="Learning Paths"
              icon={<Award className="h-4 w-4" />}
              count={meta.totalPaths}
              active={activeTab === 'paths'}
              onClick={() => setActiveTab('paths')}
            />
            <TabButton
              label="Glossary"
              icon={<GraduationCap className="h-4 w-4" />}
              count={meta.totalGlossaryTerms}
              active={activeTab === 'glossary'}
              onClick={() => setActiveTab('glossary')}
            />
          </div>

          {activeTab === 'modules' && <ModulesTab modules={modules} canAccessTier={canAccessTier} />}
          {activeTab === 'paths' && <PathsTab paths={paths} canAccessTier={canAccessTier} completedIds={completedIds} />}
          {activeTab === 'glossary' && <GlossaryTab glossary={glossary} />}
        </>
      )}
    </div>
  );
}

// ============================================================================
// Continue learning card
// ============================================================================

function ContinueLearningCard({
  item,
  onDismiss,
  onNavigate,
}: {
  item: NonNullable<ReturnType<typeof useLastVisited>>;
  onDismiss: () => void;
  onNavigate: () => void;
}) {
  const href =
    item.type === 'module'
      ? `/app/learn/modules/${item.id}`
      : item.type === 'path'
        ? `/app/learn/paths/${item.id}`
        : `/app/learn`; // glossary terms don't have their own page yet

  const typeLabel =
    item.type === 'module' ? 'Module' : item.type === 'path' ? 'Learning Path' : 'Glossary';

  return (
    <div className="flex items-center gap-4 rounded-lg border border-primary/20 bg-primary/5 dark:bg-primary/10 px-4 py-3">
      <PlayCircle className="h-5 w-5 text-primary shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground mb-0.5">Continue where you left off</p>
        <p className="text-sm font-medium truncate">{item.title}</p>
        <p className="text-xs text-muted-foreground">{typeLabel}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Link
          href={href}
          onClick={onNavigate}
          className="text-sm font-medium text-primary hover:underline flex items-center gap-1"
        >
          Resume
          <ChevronRight className="h-3 w-3" />
        </Link>
        <button
          onClick={onDismiss}
          className="text-muted-foreground hover:text-foreground"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// Search results view
// ============================================================================

function SearchResultsView({
  results,
  totalCount,
  query,
  canAccessTier,
  completedIds,
}: {
  results: SearchResults;
  totalCount: number;
  query: string;
  canAccessTier: (tierRequired: TierRequired) => boolean;
  completedIds: Set<string>;
}) {
  if (totalCount === 0) {
    return (
      <EmptyState
        icon={<Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />}
        message={`No results for "${query}"`}
        hint="Try different keywords or browse by tab"
      />
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        {totalCount} result{totalCount !== 1 ? 's' : ''} for &ldquo;{query}&rdquo;
      </p>

      {results.modules.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Modules ({results.modules.length})
          </h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {results.modules.map((m) => (
              <ModuleCard key={m.id} module={m} canAccessTier={canAccessTier} />
            ))}
          </div>
        </div>
      )}

      {results.paths.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Learning Paths ({results.paths.length})
          </h3>
          <div className="space-y-4">
            {results.paths.map((p) => (
              <PathCard key={p.id} path={p} canAccessTier={canAccessTier} completedIds={completedIds} />
            ))}
          </div>
        </div>
      )}

      {results.terms.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Glossary ({results.terms.length})
          </h3>
          <div className="space-y-4">
            {results.terms.map((t) => (
              <GlossaryCard key={t.id} term={t} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Tab button
// ============================================================================

function TabButton({
  label,
  icon,
  count,
  active,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
        active
          ? 'border-primary text-primary'
          : 'border-transparent text-muted-foreground hover:text-foreground'
      }`}
    >
      {icon}
      {label}
      <span className="ml-1 text-xs text-muted-foreground">({count})</span>
    </button>
  );
}

// ============================================================================
// Modules tab
// ============================================================================

function ModulesTab({
  modules,
  canAccessTier,
}: {
  modules: CatalogModule[];
  canAccessTier: (tierRequired: TierRequired) => boolean;
}) {
  const [selectedCategory, setSelectedCategory] = useState<ContentCategory | ''>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<ContentDifficulty | ''>('');
  const [selectedDuration, setSelectedDuration] = useState<DurationBucket>('all');

  const filtered = modules.filter((m) => {
    if (selectedCategory && m.category !== selectedCategory) return false;
    if (selectedDifficulty && m.level !== selectedDifficulty) return false;
    if (!matchesDurationBucket(m.durationMinutes, selectedDuration)) return false;
    return true;
  });

  const hasActiveFilters =
    selectedCategory !== '' || selectedDifficulty !== '' || selectedDuration !== 'all';

  function clearFilters() {
    setSelectedCategory('');
    setSelectedDifficulty('');
    setSelectedDuration('all');
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value as ContentCategory | '')}
          className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">All Categories</option>
          {(Object.entries(CATEGORY_LABELS) as [ContentCategory, string][]).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        <select
          value={selectedDifficulty}
          onChange={(e) => setSelectedDifficulty(e.target.value as ContentDifficulty | '')}
          className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">All Levels</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>

        <select
          value={selectedDuration}
          onChange={(e) => setSelectedDuration(e.target.value as DurationBucket)}
          className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          {(Object.entries(DURATION_BUCKET_LABELS) as [DurationBucket, string][]).map(
            ([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            )
          )}
        </select>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-3 w-3" />
            Clear filters
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />}
          message="No modules match your filters"
          hint={
            hasActiveFilters
              ? 'Try clearing some filters to see more results'
              : 'More content coming soon'
          }
          action={
            hasActiveFilters
              ? { label: 'Clear filters', onClick: clearFilters }
              : undefined
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((m) => (
            <ModuleCard key={m.id} module={m} canAccessTier={canAccessTier} />
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Module card
// ============================================================================

function ModuleCard({
  module: m,
  canAccessTier,
}: {
  module: CatalogModule;
  canAccessTier: (tierRequired: TierRequired) => boolean;
}) {
  const difficulty = DIFFICULTY_CONFIG[m.level];
  const locked = m.tierRequired !== 'free' && !canAccessTier(m.tierRequired);

  return (
    <Link
      href={`/app/learn/modules/${m.id}`}
      className="rounded-lg border bg-card p-4 hover:border-primary/50 transition-colors block"
    >
      <div className="flex items-start justify-between mb-3">
        <span className={`text-xs px-2 py-0.5 rounded ${difficulty.badgeClass}`}>
          {difficulty.label}
        </span>
        {locked && (
          <span className="text-xs bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 px-2 py-0.5 rounded flex items-center gap-1">
            <Lock className="h-3 w-3" />
            {m.tierRequired === 'pro' ? 'Pro' : 'Starter+'}
          </span>
        )}
      </div>

      <h3 className="font-semibold mb-2">{m.title}</h3>
      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{m.summary}</p>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {m.durationMinutes} min
        </span>
        <span>{CATEGORY_LABELS[m.category]}</span>
      </div>
    </Link>
  );
}

// ============================================================================
// Paths tab
// ============================================================================

function PathsTab({
  paths,
  canAccessTier,
  completedIds,
}: {
  paths: CatalogPath[];
  canAccessTier: (tierRequired: TierRequired) => boolean;
  completedIds: Set<string>;
}) {
  const [selectedDifficulty, setSelectedDifficulty] = useState<ContentDifficulty | ''>('');

  const filtered = paths.filter((p) => {
    if (selectedDifficulty && p.level !== selectedDifficulty) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Level filter */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={selectedDifficulty}
          onChange={(e) => setSelectedDifficulty(e.target.value as ContentDifficulty | '')}
          className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">All Levels</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
        {selectedDifficulty && (
          <button
            onClick={() => setSelectedDifficulty('')}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-3 w-3" />
            Clear
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />}
          message="No learning paths match your filters"
          hint="Try clearing the level filter"
          action={
            selectedDifficulty
              ? { label: 'Clear filter', onClick: () => setSelectedDifficulty('') }
              : undefined
          }
        />
      ) : (
        <div className="space-y-4">
          {filtered.map((p) => (
            <PathCard key={p.id} path={p} canAccessTier={canAccessTier} completedIds={completedIds} />
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Path card
// ============================================================================

function PathCard({
  path: p,
  canAccessTier,
  completedIds,
}: {
  path: CatalogPath;
  canAccessTier: (tierRequired: TierRequired) => boolean;
  completedIds: Set<string>;
}) {
  const difficulty = DIFFICULTY_CONFIG[p.level];
  const locked = p.tierRequired !== 'free' && !canAccessTier(p.tierRequired);
  const progress = getPathProgress(p.moduleIds, completedIds);
  const completedCount = p.moduleIds.filter((id) => completedIds.has(id)).length;
  const isComplete = progress === 100 && p.moduleIds.length > 0;

  return (
    <Link
      href={`/app/learn/paths/${p.id}`}
      className="rounded-lg border bg-card p-6 hover:border-primary/50 transition-colors block"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Award className="h-5 w-5 text-primary" />
          <span className={`text-xs px-2 py-0.5 rounded ${difficulty.badgeClass}`}>
            {difficulty.label}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {isComplete && (
            <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 px-2 py-0.5 rounded flex items-center gap-1">
              ✓ Complete
            </span>
          )}
          {locked && (
            <span className="text-xs bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 px-2 py-0.5 rounded flex items-center gap-1">
              <Lock className="h-3 w-3" />
              {p.tierRequired === 'pro' ? 'Pro' : 'Starter+'}
            </span>
          )}
        </div>
      </div>

      <h3 className="text-lg font-semibold mb-2">{p.title}</h3>
      <p className="text-sm text-muted-foreground mb-4">{p.summary}</p>

      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span>{p.moduleIds.length} modules</span>
        <span>•</span>
        <span>{p.estimatedHours} hr{p.estimatedHours !== 1 ? 's' : ''}</span>
      </div>

      {/* Progress bar */}
      {completedCount > 0 && (
        <div className="mt-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{completedCount}/{p.moduleIds.length} modules complete</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${isComplete ? 'bg-green-500' : 'bg-primary'}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      <div className="mt-4 flex items-center text-sm text-primary">
        {completedCount > 0 && !isComplete ? 'Continue Path' : isComplete ? 'Review Path' : 'Start Learning Path'}
        <ChevronRight className="h-4 w-4 ml-1" />
      </div>
    </Link>
  );
}

// ============================================================================
// Glossary tab
// ============================================================================

function GlossaryTab({ glossary }: { glossary: CatalogGlossaryTerm[] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLetter, setSelectedLetter] = useState('');

  const availableLetters = Array.from(
    new Set(glossary.map((t) => t.term[0].toUpperCase()))
  ).sort();

  const filtered = glossary.filter((t) => {
    if (selectedLetter && t.term[0].toUpperCase() !== selectedLetter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return t.term.toLowerCase().includes(q) || t.definition.toLowerCase().includes(q);
    }
    return true;
  }).sort((a, b) => a.term.localeCompare(b.term));

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search glossary terms…"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setSelectedLetter('');
          }}
          className="pl-9 pr-9"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Alphabet filter */}
      <div className="flex flex-wrap gap-1">
        <button
          onClick={() => { setSelectedLetter(''); setSearchQuery(''); }}
          className={`px-2 py-1 text-xs rounded transition-colors ${
            !selectedLetter && !searchQuery
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted hover:bg-muted/80'
          }`}
        >
          All
        </button>
        {alphabet.map((letter) => {
          const has = availableLetters.includes(letter);
          return (
            <button
              key={letter}
              onClick={() => {
                if (has) {
                  setSelectedLetter(letter);
                  setSearchQuery('');
                }
              }}
              disabled={!has}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                selectedLetter === letter
                  ? 'bg-primary text-primary-foreground'
                  : has
                    ? 'bg-muted hover:bg-muted/80'
                    : 'bg-muted/40 text-muted-foreground cursor-not-allowed'
              }`}
            >
              {letter}
            </button>
          );
        })}
      </div>

      {/* Terms */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />}
          message={searchQuery ? `No terms matching "${searchQuery}"` : 'No terms found'}
          hint={searchQuery ? 'Try a different search term' : undefined}
          action={
            searchQuery ? { label: 'Clear search', onClick: () => setSearchQuery('') } : undefined
          }
        />
      ) : (
        <div className="space-y-4">
          {filtered.map((t) => (
            <GlossaryCard key={t.id} term={t} />
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Glossary card
// ============================================================================

function GlossaryCard({ term: t }: { term: CatalogGlossaryTerm }) {
  const difficulty = DIFFICULTY_CONFIG[t.level];

  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-lg">{t.term}</h3>
        <span className={`text-xs px-2 py-0.5 rounded ${difficulty.badgeClass}`}>
          {difficulty.label}
        </span>
      </div>
      <p className="text-muted-foreground mb-3 text-sm">{t.definition}</p>
      {t.example && (
        <div className="bg-muted/50 rounded p-3 text-sm mb-3">
          <span className="font-medium">Example:</span> {t.example}
        </div>
      )}
      {t.relatedTerms.length > 0 && (
        <p className="text-sm text-muted-foreground">
          <span className="font-medium">Related:</span> {t.relatedTerms.join(', ')}
        </p>
      )}
    </div>
  );
}

// ============================================================================
// Empty state
// ============================================================================

function EmptyState({
  icon,
  message,
  hint,
  action,
}: {
  icon: React.ReactNode;
  message: string;
  hint?: string;
  action?: { label: string; onClick: () => void };
}) {
  return (
    <div className="text-center py-12">
      {icon}
      <p className="text-muted-foreground font-medium">{message}</p>
      {hint && <p className="text-sm text-muted-foreground mt-1">{hint}</p>}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 text-sm text-primary hover:underline"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
