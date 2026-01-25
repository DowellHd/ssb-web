'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  BookOpen,
  GraduationCap,
  Clock,
  ChevronRight,
  RefreshCw,
  AlertTriangle,
  Lock,
  Search,
  Bookmark,
  Award,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  listLearningModules,
  listLearningPaths,
  type LearningModule,
  type LearningPath,
  type ContentCategory,
  type ContentDifficulty,
} from '@/lib/api/learn';
import { getErrorMessage } from '@/lib/api-client';

const CATEGORY_LABELS: Record<ContentCategory, string> = {
  fundamentals: 'Fundamentals',
  technical_analysis: 'Technical Analysis',
  risk_management: 'Risk Management',
  portfolio_theory: 'Portfolio Theory',
  market_mechanics: 'Market Mechanics',
  derivatives: 'Derivatives',
  behavioral_finance: 'Behavioral Finance',
  quantitative: 'Quantitative',
};

const DIFFICULTY_CONFIG: Record<ContentDifficulty, { label: string; color: string }> = {
  beginner: { label: 'Beginner', color: 'bg-green-100 text-green-800' },
  intermediate: { label: 'Intermediate', color: 'bg-blue-100 text-blue-800' },
  advanced: { label: 'Advanced', color: 'bg-purple-100 text-purple-800' },
};

export default function LearnPage() {
  const router = useRouter();
  const [modules, setModules] = useState<LearningModule[]>([]);
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<ContentCategory | ''>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<ContentDifficulty | ''>('');
  const [activeTab, setActiveTab] = useState<'modules' | 'paths' | 'glossary'>('modules');

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [modulesRes, pathsRes] = await Promise.all([
        listLearningModules({
          category: selectedCategory || undefined,
          difficulty: selectedDifficulty || undefined,
        }),
        listLearningPaths(),
      ]);
      setModules(modulesRes.modules);
      setPaths(pathsRes.paths);
    } catch (err: any) {
      const status = err?.response?.status;
      const message = getErrorMessage(err);

      if (status === 401 || status === 403) {
        toast.error('Please sign in to continue');
        router.push('/auth/login');
        return;
      }

      setError(message || 'Failed to load learning content');
      toast.error(message || 'Failed to load learning content');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedCategory, selectedDifficulty]);

  if (error && modules.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <AlertTriangle className="h-12 w-12 text-destructive" />
        <h2 className="text-xl font-semibold">Failed to Load Content</h2>
        <p className="text-muted-foreground text-center max-w-md">{error}</p>
        <Button onClick={fetchData} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Learn</h1>
          <p className="text-muted-foreground mt-1">
            Educational resources to enhance your financial knowledge
          </p>
        </div>
        <Button onClick={fetchData} variant="outline" size="sm" className="gap-2">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setActiveTab('modules')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'modules'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <BookOpen className="h-4 w-4 inline-block mr-2" />
          Modules
        </button>
        <button
          onClick={() => setActiveTab('paths')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'paths'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Award className="h-4 w-4 inline-block mr-2" />
          Learning Paths
        </button>
        <button
          onClick={() => setActiveTab('glossary')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'glossary'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <GraduationCap className="h-4 w-4 inline-block mr-2" />
          Glossary
        </button>
      </div>

      {/* Modules Tab */}
      {activeTab === 'modules' && (
        <>
          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as ContentCategory | '')}
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">All Categories</option>
              {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
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

          {/* Modules List */}
          {loading ? (
            <div className="flex flex-col items-center justify-center min-h-[200px] gap-4">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <p className="text-muted-foreground">Loading modules...</p>
            </div>
          ) : modules.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No modules found</p>
              <p className="text-sm text-muted-foreground mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {modules.map((module) => (
                <ModuleCard key={module.id} module={module} />
              ))}
            </div>
          )}
        </>
      )}

      {/* Learning Paths Tab */}
      {activeTab === 'paths' && (
        <div className="space-y-4">
          {paths.length === 0 ? (
            <div className="text-center py-12">
              <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No learning paths available</p>
            </div>
          ) : (
            paths.map((path) => (
              <PathCard key={path.id} path={path} />
            ))
          )}
        </div>
      )}

      {/* Glossary Tab */}
      {activeTab === 'glossary' && <GlossarySection />}

      {/* Educational Disclaimer */}
      <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 text-sm text-slate-800">
        <strong>Educational Content:</strong> All learning materials are for educational purposes only.
        They do not constitute investment advice. Apply knowledge responsibly and always do your own research.
      </div>
    </div>
  );
}

function ModuleCard({ module }: { module: LearningModule }) {
  const difficultyConfig = DIFFICULTY_CONFIG[module.difficulty];

  return (
    <Link
      href={`/app/learn/modules/${module.id}`}
      className="rounded-lg border bg-card p-4 hover:border-primary/50 transition-colors block"
    >
      <div className="flex items-start justify-between mb-3">
        <span className={`text-xs px-2 py-0.5 rounded ${difficultyConfig.color}`}>
          {difficultyConfig.label}
        </span>
        {module.is_premium && (
          <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded flex items-center gap-1">
            <Lock className="h-3 w-3" />
            Premium
          </span>
        )}
      </div>

      <h3 className="font-semibold mb-2">{module.title}</h3>
      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{module.description}</p>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {module.duration_minutes} min
        </span>
        <span className="capitalize">{CATEGORY_LABELS[module.category] || module.category}</span>
      </div>
    </Link>
  );
}

function PathCard({ path }: { path: LearningPath }) {
  const difficultyConfig = DIFFICULTY_CONFIG[path.difficulty];

  return (
    <Link
      href={`/app/learn/paths/${path.id}`}
      className="rounded-lg border bg-card p-6 hover:border-primary/50 transition-colors block"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Award className="h-5 w-5 text-primary" />
          <span className={`text-xs px-2 py-0.5 rounded ${difficultyConfig.color}`}>
            {difficultyConfig.label}
          </span>
        </div>
        {path.is_premium && (
          <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded flex items-center gap-1">
            <Lock className="h-3 w-3" />
            Premium
          </span>
        )}
      </div>

      <h3 className="text-lg font-semibold mb-2">{path.title}</h3>
      <p className="text-sm text-muted-foreground mb-4">{path.description}</p>

      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span>{path.modules.length} modules</span>
        <span>•</span>
        <span>{path.estimated_hours} hours</span>
      </div>

      <div className="mt-4 flex items-center text-sm text-primary">
        Start Learning Path
        <ChevronRight className="h-4 w-4 ml-1" />
      </div>
    </Link>
  );
}

function GlossarySection() {
  const router = useRouter();
  const [terms, setTerms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLetter, setSelectedLetter] = useState('');
  const [availableLetters, setAvailableLetters] = useState<string[]>([]);

  const fetchGlossary = async () => {
    setLoading(true);
    try {
      const { listGlossaryTerms, searchGlossary } = await import('@/lib/api/learn');

      if (searchQuery) {
        const response = await searchGlossary(searchQuery);
        setTerms(response.terms);
      } else {
        const response = await listGlossaryTerms({
          letter: selectedLetter || undefined,
        });
        setTerms(response.terms);
        setAvailableLetters(response.letters);
      }
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 401 || status === 403) {
        toast.error('Please sign in to continue');
        router.push('/auth/login');
        return;
      }
      toast.error('Failed to load glossary');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGlossary();
  }, [selectedLetter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchGlossary();
  };

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  return (
    <div className="space-y-4">
      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search terms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button type="submit" variant="outline">
          Search
        </Button>
      </form>

      {/* Alphabet Filter */}
      <div className="flex flex-wrap gap-1">
        <button
          onClick={() => { setSelectedLetter(''); setSearchQuery(''); }}
          className={`px-2 py-1 text-xs rounded ${
            !selectedLetter ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'
          }`}
        >
          All
        </button>
        {alphabet.map((letter) => (
          <button
            key={letter}
            onClick={() => { setSelectedLetter(letter); setSearchQuery(''); }}
            disabled={!availableLetters.includes(letter)}
            className={`px-2 py-1 text-xs rounded ${
              selectedLetter === letter
                ? 'bg-primary text-primary-foreground'
                : availableLetters.includes(letter)
                  ? 'bg-muted hover:bg-muted/80'
                  : 'bg-muted/50 text-muted-foreground cursor-not-allowed'
            }`}
          >
            {letter}
          </button>
        ))}
      </div>

      {/* Terms List */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : terms.length === 0 ? (
        <div className="text-center py-12">
          <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No terms found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {terms.map((term) => (
            <div key={term.id} className="rounded-lg border bg-card p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-lg">{term.term}</h3>
                <span className={`text-xs px-2 py-0.5 rounded ${DIFFICULTY_CONFIG[term.difficulty as ContentDifficulty]?.color || 'bg-gray-100'}`}>
                  {term.difficulty}
                </span>
              </div>
              <p className="text-muted-foreground mb-3">{term.definition}</p>
              {term.example && (
                <div className="bg-muted/50 rounded p-3 text-sm">
                  <span className="font-medium">Example:</span> {term.example}
                </div>
              )}
              {term.related_terms.length > 0 && (
                <div className="mt-3 text-sm text-muted-foreground">
                  <span className="font-medium">Related:</span>{' '}
                  {term.related_terms.join(', ')}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
