'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  BookOpen,
  Clock,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  AlertTriangle,
  Lock,
  CheckCircle,
  ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  getLearningModule,
  type LearningModuleDetailResponse,
  type ContentDifficulty,
} from '@/lib/api/learn';
import { getErrorMessage } from '@/lib/api-client';

const DIFFICULTY_CONFIG: Record<ContentDifficulty, { label: string; color: string }> = {
  beginner: { label: 'Beginner', color: 'bg-green-100 text-green-800' },
  intermediate: { label: 'Intermediate', color: 'bg-blue-100 text-blue-800' },
  advanced: { label: 'Advanced', color: 'bg-purple-100 text-purple-800' },
};

export default function ModuleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const moduleId = params.id as string;

  const [data, setData] = useState<LearningModuleDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchModule = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getLearningModule(moduleId);
      setData(response);
    } catch (err: any) {
      const status = err?.response?.status;
      const message = getErrorMessage(err);

      if (status === 401) {
        toast.error('Please sign in to continue');
        router.push('/auth/login');
        return;
      }

      if (status === 403) {
        setError('This is premium content. Upgrade to Pro or Institutional to access.');
        return;
      }

      if (status === 404) {
        setError('Module not found');
        return;
      }

      setError(message || 'Failed to load module');
      toast.error(message || 'Failed to load module');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (moduleId) {
      fetchModule();
    }
  }, [moduleId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-muted-foreground">Loading module...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <AlertTriangle className="h-12 w-12 text-destructive" />
        <h2 className="text-xl font-semibold">Unable to Load Module</h2>
        <p className="text-muted-foreground text-center max-w-md">{error}</p>
        <div className="flex gap-2">
          <Button onClick={() => router.push('/app/learn')} variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Learn
          </Button>
          <Button onClick={fetchModule} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const { module, next_module, previous_module } = data;
  const difficultyConfig = DIFFICULTY_CONFIG[module.difficulty];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
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
            <span className={`text-xs px-2 py-0.5 rounded ${difficultyConfig.color}`}>
              {difficultyConfig.label}
            </span>
            <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded capitalize">
              {module.category.replace('_', ' ')}
            </span>
            {module.is_premium && (
              <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded flex items-center gap-1">
                <Lock className="h-3 w-3" />
                Premium
              </span>
            )}
          </div>
          <span className="text-sm text-muted-foreground flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {module.duration_minutes} min read
          </span>
        </div>

        <h1 className="text-2xl font-bold mb-2">{module.title}</h1>
        <p className="text-muted-foreground">{module.description}</p>
      </div>

      {/* Module content */}
      <div className="rounded-lg border bg-card p-6">
        <div className="prose prose-slate dark:prose-invert max-w-none whitespace-pre-wrap text-sm leading-relaxed">
          {module.content}
        </div>
      </div>

      {/* Key Takeaways */}
      {module.key_takeaways.length > 0 && (
        <div className="rounded-lg border bg-card p-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Key Takeaways
          </h2>
          <ul className="space-y-2">
            {module.key_takeaways.map((takeaway, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                  {index + 1}
                </span>
                <span className="text-sm">{takeaway}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4 border-t">
        {previous_module ? (
          <Link href={`/app/learn/modules/${previous_module}`}>
            <Button variant="outline" className="gap-2">
              <ChevronLeft className="h-4 w-4" />
              Previous Module
            </Button>
          </Link>
        ) : (
          <div />
        )}

        {next_module ? (
          <Link href={`/app/learn/modules/${next_module}`}>
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

      {/* Disclaimer */}
      <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 text-sm text-slate-800">
        <strong>Educational Content:</strong> This module is for educational purposes only and does not
        constitute investment advice. Always do your own research before making investment decisions.
      </div>
    </div>
  );
}
