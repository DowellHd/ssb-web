'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  BookOpen,
  Clock,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Lock,
  CheckCircle,
  ArrowLeft,
  Target,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  CATALOG_MODULES,
  getModuleById,
} from '@/lib/learn/catalog-data';
import {
  CATEGORY_LABELS,
  DIFFICULTY_CONFIG,
  TIER_LABELS,
} from '@/lib/learn/catalog';

// ============================================================================
// Navigation helpers
// ============================================================================

function getAdjacentModules(currentId: string): {
  previous: string | null;
  next: string | null;
} {
  const current = getModuleById(currentId);
  if (!current) return { previous: null, next: null };

  const currentIdx = CATALOG_MODULES.findIndex((m) => m.id === currentId);
  const prevMod = currentIdx > 0 ? CATALOG_MODULES[currentIdx - 1] : null;
  const nextMod = currentIdx < CATALOG_MODULES.length - 1 ? CATALOG_MODULES[currentIdx + 1] : null;

  // Only navigate within the same category
  const previous =
    prevMod && prevMod.category === current.category ? prevMod.id : null;
  const next =
    nextMod && nextMod.category === current.category ? nextMod.id : null;

  return { previous, next };
}

// ============================================================================
// Page
// ============================================================================

export default function ModuleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const moduleId = params.id as string;

  const catalogModule = getModuleById(moduleId);

  if (!catalogModule) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <AlertTriangle className="h-12 w-12 text-destructive" />
        <h2 className="text-xl font-semibold">Module Not Found</h2>
        <p className="text-muted-foreground text-center max-w-md">
          This module does not exist. It may have been moved or the URL is incorrect.
        </p>
        <Button onClick={() => router.push('/app/learn')} variant="outline" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Learn
        </Button>
      </div>
    );
  }

  const difficulty = DIFFICULTY_CONFIG[catalogModule.level];
  const { previous, next } = getAdjacentModules(moduleId);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Educational only banner */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30 px-4 py-3 text-sm text-blue-800 dark:text-blue-300">
        <strong>Educational content only.</strong> This module is for learning purposes and does not
        constitute investment advice.
      </div>

      {/* Back navigation */}
      <Link
        href="/app/learn"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Learn
      </Link>

      {/* Module header */}
      <div className="rounded-lg border bg-card p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs px-2 py-0.5 rounded ${difficulty.badgeClass}`}>
              {difficulty.label}
            </span>
            <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded">
              {CATEGORY_LABELS[catalogModule.category]}
            </span>
            {catalogModule.tierRequired !== 'free' && (
              <span className="text-xs bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 px-2 py-0.5 rounded flex items-center gap-1">
                <Lock className="h-3 w-3" />
                {TIER_LABELS[catalogModule.tierRequired]}
              </span>
            )}
          </div>
          <span className="text-sm text-muted-foreground flex items-center gap-1 shrink-0">
            <Clock className="h-4 w-4" />
            {catalogModule.durationMinutes} min read
          </span>
        </div>

        <h1 className="text-2xl font-bold mb-2">{catalogModule.title}</h1>
        <p className="text-muted-foreground">{catalogModule.summary}</p>

        {catalogModule.prereqs.length > 0 && (
          <div className="mt-4 text-sm text-muted-foreground">
            <span className="font-medium">Prerequisites:</span>{' '}
            {catalogModule.prereqs.map((prereqId, i) => {
              const prereq = getModuleById(prereqId);
              return prereq ? (
                <span key={prereqId}>
                  {i > 0 && ', '}
                  <Link
                    href={`/app/learn/modules/${prereqId}`}
                    className="text-primary hover:underline"
                  >
                    {prereq.title}
                  </Link>
                </span>
              ) : null;
            })}
          </div>
        )}
      </div>

      {/* Learning objectives */}
      {catalogModule.learningObjectives.length > 0 && (
        <div className="rounded-lg border bg-card p-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Learning Objectives
          </h2>
          <ul className="space-y-2">
            {catalogModule.learningObjectives.map((obj, i) => (
              <li key={i} className="flex items-start gap-3 text-sm">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary mt-0.5">
                  {i + 1}
                </span>
                {obj}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Module content */}
      <div className="rounded-lg border bg-card p-6">
        <div className="prose prose-slate dark:prose-invert max-w-none whitespace-pre-wrap text-sm leading-relaxed">
          {catalogModule.content}
        </div>
      </div>

      {/* Key takeaways */}
      {catalogModule.keyTakeaways.length > 0 && (
        <div className="rounded-lg border bg-card p-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Key Takeaways
          </h2>
          <ul className="space-y-2">
            {catalogModule.keyTakeaways.map((takeaway, i) => (
              <li key={i} className="flex items-start gap-3 text-sm">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30 text-xs font-medium text-green-700 dark:text-green-400 mt-0.5">
                  {i + 1}
                </span>
                {takeaway}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* External resources */}
      {catalogModule.externalResources.length > 0 && (
        <div className="rounded-lg border bg-card p-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <ExternalLink className="h-5 w-5 text-muted-foreground" />
            External Resources
          </h2>
          <p className="text-xs text-muted-foreground mb-4">
            Curated links from authoritative educational sources.
          </p>
          <ul className="space-y-3">
            {catalogModule.externalResources.map((resource, i) => (
              <li key={i} className="flex items-start gap-3">
                <ExternalLink className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                <div>
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    {resource.label}
                  </a>
                  <p className="text-xs text-muted-foreground">{resource.source}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4 border-t">
        {previous ? (
          <Link href={`/app/learn/modules/${previous}`}>
            <Button variant="outline" className="gap-2">
              <ChevronLeft className="h-4 w-4" />
              Previous Module
            </Button>
          </Link>
        ) : (
          <div />
        )}

        {next ? (
          <Link href={`/app/learn/modules/${next}`}>
            <Button className="gap-2">
              Next Module
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        ) : (
          <Link href="/app/learn">
            <Button variant="outline" className="gap-2">
              Back to Modules
              <BookOpen className="h-4 w-4" />
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
