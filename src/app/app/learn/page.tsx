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
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  CATALOG_MODULES,
  CATALOG_PATHS,
  CATALOG_GLOSSARY,
  CATALOG_META,
} from '@/lib/learn/catalog-data';
import {
  CATEGORY_LABELS,
  DIFFICULTY_CONFIG,
  type ContentCategory,
  type ContentDifficulty,
  type CatalogModule,
  type CatalogPath,
  type CatalogGlossaryTerm,
} from '@/lib/learn/catalog';

// ============================================================================
// Page
// ============================================================================

export default function LearnPage() {
  const [activeTab, setActiveTab] = useState<'modules' | 'paths' | 'glossary'>('modules');

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
          {new Date(CATALOG_META.catalogLastUpdated).toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric',
          })}
        </p>
      </div>

      {/* Tab navigation */}
      <div className="flex gap-2 border-b">
        <TabButton
          label="Modules"
          icon={<BookOpen className="h-4 w-4" />}
          count={CATALOG_META.totalModules}
          active={activeTab === 'modules'}
          onClick={() => setActiveTab('modules')}
        />
        <TabButton
          label="Learning Paths"
          icon={<Award className="h-4 w-4" />}
          count={CATALOG_META.totalPaths}
          active={activeTab === 'paths'}
          onClick={() => setActiveTab('paths')}
        />
        <TabButton
          label="Glossary"
          icon={<GraduationCap className="h-4 w-4" />}
          count={CATALOG_META.totalGlossaryTerms}
          active={activeTab === 'glossary'}
          onClick={() => setActiveTab('glossary')}
        />
      </div>

      {activeTab === 'modules' && <ModulesTab />}
      {activeTab === 'paths' && <PathsTab />}
      {activeTab === 'glossary' && <GlossaryTab />}
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

function ModulesTab() {
  const [selectedCategory, setSelectedCategory] = useState<ContentCategory | ''>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<ContentDifficulty | ''>('');

  const filtered = CATALOG_MODULES.filter((m) => {
    if (selectedCategory && m.category !== selectedCategory) return false;
    if (selectedDifficulty && m.level !== selectedDifficulty) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
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
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />}
          message="No modules match your filters"
          hint="Try clearing the category or level filter"
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((module) => (
            <ModuleCard key={module.id} module={module} />
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Module card
// ============================================================================

function ModuleCard({ module }: { module: CatalogModule }) {
  const difficulty = DIFFICULTY_CONFIG[module.level];

  return (
    <Link
      href={`/app/learn/modules/${module.id}`}
      className="rounded-lg border bg-card p-4 hover:border-primary/50 transition-colors block"
    >
      <div className="flex items-start justify-between mb-3">
        <span className={`text-xs px-2 py-0.5 rounded ${difficulty.badgeClass}`}>
          {difficulty.label}
        </span>
        {module.tierRequired !== 'free' && (
          <span className="text-xs bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 px-2 py-0.5 rounded flex items-center gap-1">
            <Lock className="h-3 w-3" />
            {module.tierRequired === 'pro' ? 'Pro' : 'Starter+'}
          </span>
        )}
      </div>

      <h3 className="font-semibold mb-2">{module.title}</h3>
      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{module.summary}</p>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {module.durationMinutes} min
        </span>
        <span>{CATEGORY_LABELS[module.category]}</span>
      </div>
    </Link>
  );
}

// ============================================================================
// Paths tab
// ============================================================================

function PathsTab() {
  return (
    <div className="space-y-4">
      {CATALOG_PATHS.length === 0 ? (
        <EmptyState
          icon={<Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />}
          message="No learning paths available"
        />
      ) : (
        CATALOG_PATHS.map((path) => <PathCard key={path.id} path={path} />)
      )}
    </div>
  );
}

// ============================================================================
// Path card
// ============================================================================

function PathCard({ path }: { path: CatalogPath }) {
  const difficulty = DIFFICULTY_CONFIG[path.level];

  return (
    <Link
      href={`/app/learn/paths/${path.id}`}
      className="rounded-lg border bg-card p-6 hover:border-primary/50 transition-colors block"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Award className="h-5 w-5 text-primary" />
          <span className={`text-xs px-2 py-0.5 rounded ${difficulty.badgeClass}`}>
            {difficulty.label}
          </span>
        </div>
        {path.tierRequired !== 'free' && (
          <span className="text-xs bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 px-2 py-0.5 rounded flex items-center gap-1">
            <Lock className="h-3 w-3" />
            {path.tierRequired === 'pro' ? 'Pro' : 'Starter+'}
          </span>
        )}
      </div>

      <h3 className="text-lg font-semibold mb-2">{path.title}</h3>
      <p className="text-sm text-muted-foreground mb-4">{path.summary}</p>

      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span>{path.moduleIds.length} modules</span>
        <span>•</span>
        <span>{path.estimatedHours} hr{path.estimatedHours !== 1 ? 's' : ''}</span>
      </div>

      <div className="mt-4 flex items-center text-sm text-primary">
        Start Learning Path
        <ChevronRight className="h-4 w-4 ml-1" />
      </div>
    </Link>
  );
}

// ============================================================================
// Glossary tab
// ============================================================================

function GlossaryTab() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLetter, setSelectedLetter] = useState('');

  const availableLetters = Array.from(
    new Set(CATALOG_GLOSSARY.map((t) => t.term[0].toUpperCase()))
  ).sort();

  const filtered = CATALOG_GLOSSARY.filter((t) => {
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
          placeholder="Search terms..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setSelectedLetter('');
          }}
          className="pl-9"
        />
      </div>

      {/* Alphabet filter */}
      <div className="flex flex-wrap gap-1">
        <button
          onClick={() => { setSelectedLetter(''); setSearchQuery(''); }}
          className={`px-2 py-1 text-xs rounded transition-colors ${
            !selectedLetter ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'
          }`}
        >
          All
        </button>
        {alphabet.map((letter) => {
          const has = availableLetters.includes(letter);
          return (
            <button
              key={letter}
              onClick={() => has && (setSelectedLetter(letter), setSearchQuery(''))}
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
          message="No terms found"
          hint={searchQuery ? 'Try a different search term' : undefined}
        />
      ) : (
        <div className="space-y-4">
          {filtered.map((term) => (
            <GlossaryCard key={term.id} term={term} />
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Glossary card
// ============================================================================

function GlossaryCard({ term }: { term: CatalogGlossaryTerm }) {
  const difficulty = DIFFICULTY_CONFIG[term.level];

  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-lg">{term.term}</h3>
        <span className={`text-xs px-2 py-0.5 rounded ${difficulty.badgeClass}`}>
          {difficulty.label}
        </span>
      </div>
      <p className="text-muted-foreground mb-3 text-sm">{term.definition}</p>
      {term.example && (
        <div className="bg-muted/50 rounded p-3 text-sm mb-3">
          <span className="font-medium">Example:</span> {term.example}
        </div>
      )}
      {term.relatedTerms.length > 0 && (
        <p className="text-sm text-muted-foreground">
          <span className="font-medium">Related:</span> {term.relatedTerms.join(', ')}
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
}: {
  icon: React.ReactNode;
  message: string;
  hint?: string;
}) {
  return (
    <div className="text-center py-12">
      {icon}
      <p className="text-muted-foreground">{message}</p>
      {hint && <p className="text-sm text-muted-foreground mt-1">{hint}</p>}
    </div>
  );
}
