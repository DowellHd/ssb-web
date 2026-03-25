'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createCommunityPost } from '@/lib/api/community';

const POST_TYPES = [
  { value: 'commentary', label: 'Commentary' },
  { value: 'research', label: 'Research' },
  { value: 'question', label: 'Question' },
  { value: 'news', label: 'News' },
];

export default function NewPostPage() {
  const router = useRouter();
  const [postType, setPostType] = useState('commentary');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [tickers, setTickers] = useState('');
  const [tags, setTags] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const post = await createCommunityPost({
        post_type: postType,
        title: title.trim() || null,
        body: body.trim(),
        ticker_symbols: tickers.trim()
          ? tickers.split(',').map((t) => t.trim().toUpperCase()).filter(Boolean)
          : null,
        tags: tags.trim() ? tags.split(',').map((t) => t.trim()).filter(Boolean) : null,
      });
      router.push(`/app/community/posts/${post.id}`);
    } catch {
      setError('Failed to publish post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link
        href="/app/community"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Community
      </Link>

      <div>
        <h1 className="text-2xl font-bold">Create a Post</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Share research, commentary, or questions with the community.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Post type */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Post Type</label>
          <div className="flex flex-wrap gap-2">
            {POST_TYPES.map((pt) => (
              <button
                key={pt.value}
                type="button"
                onClick={() => setPostType(pt.value)}
                className={`px-3 py-1.5 rounded-md text-sm border transition-colors ${
                  postType === pt.value
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border text-muted-foreground hover:bg-muted'
                }`}
              >
                {pt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Title <span className="text-muted-foreground font-normal">(optional)</span></label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Brief headline for your post"
            maxLength={200}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Body */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Content</label>
          <textarea
            required
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write your post here…"
            rows={8}
            minLength={1}
            maxLength={10000}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />
          <p className="text-xs text-muted-foreground text-right">{body.length}/10000</p>
        </div>

        {/* Tickers */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Related Tickers <span className="text-muted-foreground font-normal">(optional, comma-separated)</span></label>
          <input
            type="text"
            value={tickers}
            onChange={(e) => setTickers(e.target.value)}
            placeholder="AAPL, MSFT, SPY"
            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Tags */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Tags <span className="text-muted-foreground font-normal">(optional, comma-separated)</span></label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="macro, earnings, sector-rotation"
            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {error && (
          <p className="text-sm text-destructive rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2">
            {error}
          </p>
        )}

        <div className="flex gap-3">
          <Button type="submit" disabled={isSubmitting} className="gap-2">
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Publish Post
          </Button>
          <Link href="/app/community">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
