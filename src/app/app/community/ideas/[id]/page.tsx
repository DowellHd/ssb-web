'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  AlertTriangle,
  ArrowLeft,
  Clock,
  Heart,
  Loader2,
  MessageSquare,
  Send,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  getTradeIdea,
  listComments,
  createComment,
  toggleReaction,
  type TradeIdea,
  type SocialComment,
} from '@/lib/api/community';

function timeAgo(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function TradeIdeaDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [idea, setIdea] = useState<TradeIdea | null>(null);
  const [comments, setComments] = useState<SocialComment[]>([]);
  const [commentBody, setCommentBody] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isLiking, setIsLiking] = useState(false);
  const [isCommenting, setIsCommenting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [ideaData, commentsData] = await Promise.all([
          getTradeIdea(id),
          listComments({ parent_type: 'trade_idea', parent_id: id }),
        ]);
        setIdea(ideaData);
        setComments(commentsData);
      } catch {
        setError('Trade idea not found or unavailable.');
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [id]);

  async function handleLike() {
    if (!idea || isLiking) return;
    setIsLiking(true);
    try {
      const res = await toggleReaction({ target_type: 'trade_idea', target_id: idea.id });
      setIdea((prev) =>
        prev
          ? { ...prev, likes_count: res.likes_count, viewer_has_liked: res.reacted }
          : prev
      );
    } finally {
      setIsLiking(false);
    }
  }

  async function handleComment(e: React.FormEvent) {
    e.preventDefault();
    if (!idea || !commentBody.trim()) return;
    setIsCommenting(true);
    try {
      const comment = await createComment({
        parent_type: 'trade_idea',
        parent_id: idea.id,
        body: commentBody.trim(),
      });
      setComments((prev) => [...prev, comment]);
      setIdea((prev) => prev ? { ...prev, comments_count: prev.comments_count + 1 } : prev);
      setCommentBody('');
    } finally {
      setIsCommenting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error || !idea) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <AlertTriangle className="h-10 w-10 text-destructive" />
        <p className="text-muted-foreground">{error ?? 'Trade idea not found.'}</p>
        <Button variant="outline" onClick={() => router.push('/app/community')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Community
        </Button>
      </div>
    );
  }

  const isLong = idea.direction === 'long';

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link
        href="/app/community"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Community
      </Link>

      {/* Idea card */}
      <div className="rounded-lg border bg-card p-6 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold">{idea.symbol}</span>
            <span
              className={`px-2 py-1 rounded text-sm font-medium flex items-center gap-1 ${
                isLong
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
              }`}
            >
              {isLong ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              {isLong ? 'Long' : 'Short'}
            </span>
            <span
              className={`text-xs px-2 py-0.5 rounded ${
                idea.status === 'open'
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {idea.status}
            </span>
          </div>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {timeAgo(idea.created_at)}
          </span>
        </div>

        {/* Author */}
        <p className="text-sm text-muted-foreground">
          by {idea.author_display_name ?? 'Anonymous'} · {idea.time_horizon.replace('_', ' ')} horizon
        </p>

        {/* Price levels */}
        {(idea.entry_price || idea.target_price || idea.stop_loss) && (
          <div className="flex gap-4 text-sm">
            {idea.entry_price && (
              <div>
                <span className="text-muted-foreground">Entry: </span>
                <span className="font-medium">${Number(idea.entry_price).toFixed(2)}</span>
              </div>
            )}
            {idea.target_price && (
              <div>
                <span className="text-muted-foreground">Target: </span>
                <span className="font-medium text-green-600 dark:text-green-400">
                  ${Number(idea.target_price).toFixed(2)}
                </span>
              </div>
            )}
            {idea.stop_loss && (
              <div>
                <span className="text-muted-foreground">Stop: </span>
                <span className="font-medium text-red-600 dark:text-red-400">
                  ${Number(idea.stop_loss).toFixed(2)}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Thesis */}
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <p className="whitespace-pre-wrap text-sm leading-relaxed">{idea.thesis}</p>
        </div>

        {/* Tags */}
        {idea.tags && idea.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {idea.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-4 pt-2 border-t">
          <button
            onClick={handleLike}
            disabled={isLiking}
            className={`flex items-center gap-1.5 text-sm transition-colors ${
              idea.viewer_has_liked
                ? 'text-red-500 dark:text-red-400'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Heart className={`h-4 w-4 ${idea.viewer_has_liked ? 'fill-current' : ''}`} />
            {idea.likes_count} {idea.likes_count === 1 ? 'like' : 'likes'}
          </button>
          <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MessageSquare className="h-4 w-4" />
            {idea.comments_count} {idea.comments_count === 1 ? 'comment' : 'comments'}
          </span>
        </div>
      </div>

      {/* Comments */}
      <div className="space-y-4">
        <h2 className="font-semibold">Comments</h2>

        {comments.map((c) => (
          <div key={c.id} className="rounded-lg border bg-card p-4 space-y-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{c.author_display_name ?? 'Anonymous'}</span>
              <span>{timeAgo(c.created_at)}</span>
            </div>
            <p className="text-sm">{c.body}</p>
          </div>
        ))}

        {/* Comment form */}
        <form onSubmit={handleComment} className="flex gap-2">
          <input
            type="text"
            value={commentBody}
            onChange={(e) => setCommentBody(e.target.value)}
            placeholder="Add a comment…"
            maxLength={2000}
            className="flex-1 rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <Button type="submit" size="sm" disabled={!commentBody.trim() || isCommenting} className="gap-2">
            {isCommenting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
