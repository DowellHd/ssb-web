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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  getCommunityPost,
  listComments,
  createComment,
  toggleReaction,
  type CommunityPost,
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

const TYPE_COLORS: Record<string, string> = {
  research: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  commentary: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  question: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  news: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
};

export default function PostDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [post, setPost] = useState<CommunityPost | null>(null);
  const [comments, setComments] = useState<SocialComment[]>([]);
  const [commentBody, setCommentBody] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isLiking, setIsLiking] = useState(false);
  const [isCommenting, setIsCommenting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [postData, commentsData] = await Promise.all([
          getCommunityPost(id),
          listComments({ parent_type: 'post', parent_id: id }),
        ]);
        setPost(postData);
        setComments(commentsData);
      } catch {
        setError('Post not found or unavailable.');
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [id]);

  async function handleLike() {
    if (!post || isLiking) return;
    setIsLiking(true);
    try {
      const res = await toggleReaction({ target_type: 'post', target_id: post.id });
      setPost((prev) =>
        prev ? { ...prev, likes_count: res.likes_count, viewer_has_liked: res.reacted } : prev
      );
    } finally {
      setIsLiking(false);
    }
  }

  async function handleComment(e: React.FormEvent) {
    e.preventDefault();
    if (!post || !commentBody.trim()) return;
    setIsCommenting(true);
    try {
      const comment = await createComment({
        parent_type: 'post',
        parent_id: post.id,
        body: commentBody.trim(),
      });
      setComments((prev) => [...prev, comment]);
      setPost((prev) => prev ? { ...prev, comments_count: prev.comments_count + 1 } : prev);
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

  if (error || !post) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <AlertTriangle className="h-10 w-10 text-destructive" />
        <p className="text-muted-foreground">{error ?? 'Post not found.'}</p>
        <Button variant="outline" onClick={() => router.push('/app/community')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Community
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link
        href="/app/community"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Community
      </Link>

      <div className="rounded-lg border bg-card p-6 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs px-1.5 py-0.5 rounded capitalize ${TYPE_COLORS[post.post_type] ?? ''}`}>
              {post.post_type}
            </span>
            {post.ticker_symbols?.map((t) => (
              <span key={t} className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">
                {t}
              </span>
            ))}
          </div>
          <span className="text-xs text-muted-foreground flex items-center gap-1 shrink-0">
            <Clock className="h-3 w-3" />
            {timeAgo(post.created_at)}
          </span>
        </div>

        {post.title && <h1 className="text-xl font-bold">{post.title}</h1>}

        <p className="text-sm text-muted-foreground">
          by {post.author_display_name ?? 'Anonymous'}
        </p>

        <div className="prose prose-sm dark:prose-invert max-w-none">
          <p className="whitespace-pre-wrap text-sm leading-relaxed">{post.body}</p>
        </div>

        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {post.tags.map((tag) => (
              <span key={tag} className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center gap-4 pt-2 border-t">
          <button
            onClick={handleLike}
            disabled={isLiking}
            className={`flex items-center gap-1.5 text-sm transition-colors ${
              post.viewer_has_liked
                ? 'text-red-500 dark:text-red-400'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Heart className={`h-4 w-4 ${post.viewer_has_liked ? 'fill-current' : ''}`} />
            {post.likes_count} {post.likes_count === 1 ? 'like' : 'likes'}
          </button>
          <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MessageSquare className="h-4 w-4" />
            {post.comments_count} {post.comments_count === 1 ? 'comment' : 'comments'}
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
