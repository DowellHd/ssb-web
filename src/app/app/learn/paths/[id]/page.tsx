'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Award,
  Clock,
  AlertTriangle,
  Lock,
  CheckCircle,
  ArrowLeft,
  ChevronRight,
  BookOpen,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCatalogPath, useCatalog } from '@/lib/learn/use-catalog';
import {
  CATEGORY_LABELS,
  DIFFICULTY_CONFIG,
  TIER_LABELS,
} from '@/lib/learn/catalog';
import {
  useRecordLearnVisit,
  useModuleCompletion,
  getPathProgress,
} from '@/lib/learn/use-learn-progress';

// ============================================================================
// Page
// ============================================================================

export default function PathDetailPage() {
  const params = useParams();
  const router = useRouter();
  const pathId = params.id as string;

  const { path: catalogPath, pathModules, isLoading } = useCatalogPath(pathId);
  const { paths } = useCatalog();
  const { isComplete, completedIds } = useModuleCompletion();

  // Record visit unconditionally; skips write when title is empty (not found)
  useRecordLearnVisit('path', pathId, catalogPath?.title ?? '');

  if (!isLoading && !catalogPath) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <AlertTriangle className="h-12 w-12 text-destructive" />
        <h2 className="text-xl font-semibold">Learning Path Not Found</h2>
        <p className="text-muted-foreground text-center max-w-md">
          This path does not exist. It may have been moved or the URL is incorrect.
        </p>
        <Button onClick={() => router.push('/app/learn')} variant="outline" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Learn
        </Button>
      </div>
    );
  }

  if (!catalogPath) return null;

  const difficulty = DIFFICULTY_CONFIG[catalogPath.level];
  const progressPercent = getPathProgress(catalogPath.moduleIds, completedIds);
  const completedCount = catalogPath.moduleIds.filter((id) => isComplete(id)).length;

  // First incomplete module for the "Start / Continue" CTA
  const firstIncomplete = pathModules.find((m) => !isComplete(m.id));
  const isFullyComplete = completedCount === pathModules.length && pathModules.length > 0;

  // "Next up" path suggestion
  const nextPath = catalogPath.nextPathId
    ? paths.find((p) => p.id === catalogPath.nextPathId) ?? null
    : null;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Educational only banner */}
      <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30 px-4 py-3 text-sm">
        <Info className="h-4 w-4 mt-0.5 shrink-0 text-blue-600 dark:text-blue-400" />
        <p className="text-blue-800 dark:text-blue-300">
          <strong>Educational content only.</strong> This learning path is for educational purposes
          and does not constitute investment advice.
        </p>
      </div>

      {/* Back navigation */}
      <Link
        href="/app/learn"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Learn
      </Link>

      {/* Path header */}
      <div className="rounded-lg border bg-card p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <Award className="h-5 w-5 text-primary" />
            <span className={`text-xs px-2 py-0.5 rounded ${difficulty.badgeClass}`}>
              {difficulty.label}
            </span>
            {catalogPath.tierRequired !== 'free' && (
              <span className="text-xs bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 px-2 py-0.5 rounded flex items-center gap-1">
                <Lock className="h-3 w-3" />
                {TIER_LABELS[catalogPath.tierRequired]}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground shrink-0">
            <span className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              {pathModules.length} modules
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {catalogPath.estimatedHours} hr{catalogPath.estimatedHours !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        <h1 className="text-2xl font-bold mb-2">{catalogPath.title}</h1>
        <p className="text-muted-foreground mb-6">{catalogPath.summary}</p>

        {/* Progress */}
        <div className="space-y-2 mb-6">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {completedCount} of {pathModules.length} modules complete
            </span>
            <span className="font-medium text-primary">{progressPercent}%</span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* CTA */}
        {isFullyComplete ? (
          <div className="flex items-center gap-2 text-green-700 dark:text-green-400 font-medium">
            <CheckCircle className="h-5 w-5" />
            Path complete — well done!
          </div>
        ) : firstIncomplete ? (
          <Link href={`/app/learn/modules/${firstIncomplete.id}`}>
            <Button className="gap-2">
              {completedCount === 0 ? 'Start Path' : 'Continue Path'}
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        ) : null}
      </div>

      {/* Module list */}
      <div className="rounded-lg border bg-card divide-y">
        <div className="px-6 py-4">
          <h2 className="font-semibold">Modules in this path</h2>
        </div>
        {pathModules.map((m, index) => {
          const modDifficulty = DIFFICULTY_CONFIG[m.level];
          const done = isComplete(m.id);
          return (
            <Link
              key={m.id}
              href={`/app/learn/modules/${m.id}`}
              className="flex items-start gap-4 px-6 py-4 hover:bg-muted/30 transition-colors group"
            >
              {/* Step indicator */}
              <div className="flex flex-col items-center gap-1 shrink-0">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium border-2 ${
                    done
                      ? 'border-green-500 bg-green-500 text-white'
                      : 'border-muted-foreground/30 text-muted-foreground'
                  }`}
                >
                  {done ? <CheckCircle className="h-4 w-4" /> : index + 1}
                </div>
                {index < pathModules.length - 1 && (
                  <div
                    className={`w-px flex-1 min-h-[1.5rem] ${
                      done ? 'bg-green-500/40' : 'bg-muted-foreground/20'
                    }`}
                  />
                )}
              </div>

              {/* Module info */}
              <div className="flex-1 min-w-0 pb-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className={`text-xs px-2 py-0.5 rounded ${modDifficulty.badgeClass}`}>
                    {modDifficulty.label}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {CATEGORY_LABELS[m.category]}
                  </span>
                  {m.tierRequired !== 'free' && (
                    <span className="text-xs bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 px-2 py-0.5 rounded flex items-center gap-1">
                      <Lock className="h-3 w-3" />
                      {TIER_LABELS[m.tierRequired]}
                    </span>
                  )}
                </div>
                <p className={`font-medium mb-1 ${done ? 'text-muted-foreground line-through' : ''}`}>
                  {m.title}
                </p>
                <p className="text-sm text-muted-foreground line-clamp-1">{m.summary}</p>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {m.durationMinutes} min
                </p>
              </div>

              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 self-center opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          );
        })}
      </div>

      {/* Tags */}
      {catalogPath.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {catalogPath.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs bg-muted text-muted-foreground px-2.5 py-1 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Next up */}
      {nextPath && isFullyComplete && (
        <div className="rounded-lg border border-primary/20 bg-primary/5 dark:bg-primary/10 p-5">
          <p className="text-xs text-muted-foreground mb-1">Suggested next path</p>
          <h3 className="font-semibold mb-1">{nextPath.title}</h3>
          <p className="text-sm text-muted-foreground mb-4">{nextPath.summary}</p>
          <Link href={`/app/learn/paths/${nextPath.id}`}>
            <Button variant="outline" size="sm" className="gap-2">
              View Path
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}

