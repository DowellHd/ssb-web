'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  BookOpen,
  Clock,
  Flag,
  Heart,
  Info,
  Lock,
  MessageSquare,
  Plus,
  TrendingDown,
  TrendingUp,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { DemoRestricted } from '@/components/demo-restricted';
import { UserAvatar } from '@/components/ui/user-avatar';
import {
  getCommunityEntitlements,
  listTradeIdeas,
  listCommunityPosts,
  listInvestmentClubs,
  listCommunityWatchlists,
  reportContent,
  type CommunityEntitlements,
  type TradeIdea,
  type CommunityPost,
  type InvestmentClub,
  type CommunityWatchlist,
} from '@/lib/api/community';

// ============================================================================
// Helpers
// ============================================================================

function timeAgo(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ============================================================================
// Report button (inline)
// ============================================================================

const REPORT_REASONS = [
  { value: 'spam', label: 'Spam' },
  { value: 'harassment', label: 'Harassment' },
  { value: 'misinformation', label: 'Misinformation' },
  { value: 'inappropriate', label: 'Inappropriate content' },
  { value: 'other', label: 'Other' },
] as const;

type ReportReason = (typeof REPORT_REASONS)[number]['value'];

function ReportButton({
  contentType,
  contentId,
}: {
  contentType: 'post' | 'idea';
  contentId: string;
}) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [open]);

  async function submit(reason: ReportReason) {
    setSubmitting(true);
    try {
      await reportContent({ content_type: contentType, content_id: contentId, reason });
      setDone(true);
      setOpen(false);
      toast.success('Report submitted. Thank you for helping keep the community safe.');
    } catch {
      toast.error('Failed to submit report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (done) return null;

  return (
    <div ref={ref} className="relative" onClick={(e) => e.stopPropagation()}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Report content"
        title="Report this content"
        className="p-1 rounded text-muted-foreground/50 hover:text-muted-foreground hover:bg-muted transition-colors"
      >
        <Flag className="h-3.5 w-3.5" />
      </button>
      {open && (
        <div className="absolute right-0 top-6 z-50 w-44 rounded-lg border bg-popover shadow-md overflow-hidden">
          <p className="px-3 py-2 text-xs font-medium text-muted-foreground border-b">Report reason</p>
          {REPORT_REASONS.map((r) => (
            <button
              key={r.value}
              disabled={submitting}
              onClick={() => submit(r.value)}
              className="flex w-full px-3 py-2 text-xs text-left hover:bg-muted transition-colors disabled:opacity-50"
            >
              {r.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Trade Idea Card
// ============================================================================

function TradeIdeaCard({ idea }: { idea: TradeIdea }) {
  const router = useRouter();
  const isLong = idea.direction === 'long';
  return (
    <div
      onClick={() => router.push(`/app/community/ideas/${idea.id}`)}
      className="rounded-lg border bg-card p-4 hover:bg-muted/30 transition-colors cursor-pointer"
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="font-bold text-base">{idea.symbol}</span>
          <span
            className={`text-xs px-1.5 py-0.5 rounded font-medium flex items-center gap-1 ${
              isLong
                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
            }`}
          >
            {isLong ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {isLong ? 'Long' : 'Short'}
          </span>
          <span
            className={`text-xs px-1.5 py-0.5 rounded ${
              idea.status === 'open'
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            {idea.status}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {timeAgo(idea.created_at)}
          </span>
          <ReportButton contentType="idea" contentId={idea.id} />
        </div>
      </div>

      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{idea.thesis}</p>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <UserAvatar name={idea.author_display_name ?? 'Anonymous'} size={20} />
          <span>{idea.author_display_name ?? 'Anonymous'}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Heart className="h-3.5 w-3.5" />
            {idea.likes_count}
          </span>
          <span className="flex items-center gap-1">
            <MessageSquare className="h-3.5 w-3.5" />
            {idea.comments_count}
          </span>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Post Card
// ============================================================================

function PostCard({ post }: { post: CommunityPost }) {
  const router = useRouter();
  const typeColors: Record<string, string> = {
    research: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    commentary: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    question: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    news: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  };
  return (
    <div
      onClick={() => router.push(`/app/community/posts/${post.id}`)}
      className="rounded-lg border bg-card p-4 hover:bg-muted/30 transition-colors cursor-pointer"
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className={`text-xs px-1.5 py-0.5 rounded capitalize ${typeColors[post.post_type] ?? ''}`}>
            {post.post_type}
          </span>
          {post.ticker_symbols?.slice(0, 3).map((t) => (
            <span key={t} className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">
              {t}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {timeAgo(post.created_at)}
          </span>
          <ReportButton contentType="post" contentId={post.id} />
        </div>
      </div>

      {post.title && <p className="font-medium text-sm mb-1">{post.title}</p>}
      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{post.body}</p>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <UserAvatar name={post.author_display_name ?? 'Anonymous'} size={20} />
          <span>{post.author_display_name ?? 'Anonymous'}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Heart className="h-3.5 w-3.5" />
            {post.likes_count}
          </span>
          <span className="flex items-center gap-1">
            <MessageSquare className="h-3.5 w-3.5" />
            {post.comments_count}
          </span>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Page tabs
// ============================================================================

type Tab = 'feed' | 'ideas' | 'posts' | 'watchlists' | 'clubs';

const TABS: { id: Tab; label: string }[] = [
  { id: 'feed', label: 'Feed' },
  { id: 'ideas', label: 'Trade Ideas' },
  { id: 'posts', label: 'Posts' },
  { id: 'watchlists', label: 'Watchlists' },
  { id: 'clubs', label: 'Clubs' },
];

// ============================================================================
// Page
// ============================================================================

export default function CommunityPage() {
  const [tab, setTab] = useState<Tab>('feed');
  const [entitlements, setEntitlements] = useState<CommunityEntitlements | null>(null);
  const [ideas, setIdeas] = useState<TradeIdea[]>([]);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [clubs, setClubs] = useState<InvestmentClub[]>([]);
  const [watchlists, setWatchlists] = useState<CommunityWatchlist[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      // Fetch entitlements — if the endpoint doesn't exist yet, assume full access
      let ent: CommunityEntitlements = {
        can_access_community: true,
        can_post: true,
        can_create_trade_ideas: true,
        can_create_watchlists: true,
        can_join_clubs: true,
        can_rate_stocks: true,
        tier: 'unknown',
      };
      try {
        ent = await getCommunityEntitlements();
      } catch {
        // Backend not deployed yet — continue with defaults
      }
      setEntitlements(ent);

      if (!ent.can_access_community) {
        setIsLoading(false);
        return;
      }

      // Load feed data — show empty state on error rather than crashing
      try {
        const [ideasRes, postsRes] = await Promise.all([
          listTradeIdeas({ page: 1, page_size: 10 }),
          listCommunityPosts({ page: 1, page_size: 10 }),
        ]);
        setIdeas(ideasRes.ideas);
        setPosts(postsRes.posts);
      } catch {
        // API not available — stay with empty arrays (empty state shown)
      }
      setIsLoading(false);
    }
    load();
  }, []);

  useEffect(() => {
    if (tab === 'clubs' && clubs.length === 0 && entitlements?.can_access_community) {
      listInvestmentClubs({ page: 1, page_size: 20 })
        .then((r) => setClubs(r.clubs))
        .catch(() => {});
    }
    if (tab === 'watchlists' && watchlists.length === 0 && entitlements?.can_access_community) {
      listCommunityWatchlists({ page: 1, page_size: 20 })
        .then((r) => setWatchlists(r.watchlists))
        .catch(() => {});
    }
  }, [tab, entitlements]); // eslint-disable-line react-hooks/exhaustive-deps

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }


  // Not accessible — shouldn't happen (free has community_access=true) but guard anyway
  if (entitlements && !entitlements.can_access_community) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 max-w-md mx-auto text-center">
        <Lock className="h-12 w-12 text-muted-foreground" />
        <h2 className="text-xl font-semibold">Community Access Required</h2>
        <p className="text-muted-foreground">
          Create a free account to access the community feed.
        </p>
        <Link href="/app/billing">
          <Button>Upgrade Plan</Button>
        </Link>
      </div>
    );
  }

  // Merged feed: interleave ideas and posts by date
  const feedItems = [...ideas.map((i) => ({ type: 'idea' as const, item: i, ts: i.created_at })),
    ...posts.map((p) => ({ type: 'post' as const, item: p, ts: p.created_at }))]
    .sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime())
    .slice(0, 20);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Disclaimer */}
      <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30 px-4 py-3 text-sm">
        <Info className="h-4 w-4 mt-0.5 shrink-0 text-blue-600 dark:text-blue-400" />
        <p className="text-blue-800 dark:text-blue-300">
          <strong>Community content is for informational purposes only.</strong> Nothing here
          constitutes financial advice. Always do your own research.
        </p>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            Community
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Trade ideas, research, and watchlists from the community
          </p>
        </div>

        {/* Quick actions */}
        {entitlements?.can_create_trade_ideas && (
          <div className="flex items-center gap-2">
            <Link href="/app/community/ideas/new">
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Trade Idea
              </Button>
            </Link>
            {entitlements.can_post && (
              <Link href="/app/community/posts/new">
                <Button size="sm" variant="outline" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Post
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === t.id
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'feed' && (
        <div className="space-y-4">
          {feedItems.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="No community content yet"
              description="Be the first to share a trade idea or post."
            />
          ) : (
            feedItems.map(({ type, item }) =>
              type === 'idea' ? (
                <TradeIdeaCard key={`idea-${item.id}`} idea={item as TradeIdea} />
              ) : (
                <PostCard key={`post-${item.id}`} post={item as CommunityPost} />
              )
            )
          )}
        </div>
      )}

      {tab === 'ideas' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{ideas.length} trade ideas</p>
            {entitlements?.can_create_trade_ideas && (
              <DemoRestricted action="post trade ideas">
                <Link href="/app/community/ideas/new">
                  <Button size="sm" variant="outline" className="gap-2">
                    <Plus className="h-4 w-4" />
                    New Idea
                  </Button>
                </Link>
              </DemoRestricted>
            )}
          </div>
          {ideas.length === 0 ? (
            <EmptyState
              icon={TrendingUp}
              title="No trade ideas yet"
              description="Share your first trade idea with the community."
            />
          ) : (
            ideas.map((idea) => <TradeIdeaCard key={idea.id} idea={idea} />)
          )}
        </div>
      )}

      {tab === 'posts' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{posts.length} posts</p>
            {entitlements?.can_post && (
              <DemoRestricted action="post to the community">
                <Link href="/app/community/posts/new">
                  <Button size="sm" variant="outline" className="gap-2">
                    <Plus className="h-4 w-4" />
                    New Post
                  </Button>
                </Link>
              </DemoRestricted>
            )}
          </div>
          {posts.length === 0 ? (
            <EmptyState
              icon={MessageSquare}
              title="No posts yet"
              description="Share research notes, commentary, or questions."
            />
          ) : (
            posts.map((post) => <PostCard key={post.id} post={post} />)
          )}
        </div>
      )}

      {tab === 'watchlists' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{watchlists.length} public watchlists</p>
            {entitlements?.can_create_watchlists && (
              <Link href="/app/community/watchlists/new">
                <Button size="sm" variant="outline" className="gap-2">
                  <Plus className="h-4 w-4" />
                  New Watchlist
                </Button>
              </Link>
            )}
          </div>
          {watchlists.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="No shared watchlists yet"
              description="Create a public watchlist to share with the community."
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {watchlists.map((wl) => (
                <Link
                  key={wl.id}
                  href={`/app/community/watchlists/${wl.id}`}
                  className="rounded-lg border bg-card p-4 hover:bg-muted/30 transition-colors"
                >
                  <p className="font-medium mb-1">{wl.name}</p>
                  {wl.description && (
                    <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
                      {wl.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="font-mono">{wl.symbols.slice(0, 5).join(', ')}{wl.symbols.length > 5 ? ` +${wl.symbols.length - 5}` : ''}</span>
                    <span>{wl.followers_count} followers</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'clubs' && (
        <div className="space-y-4">
          {entitlements && !entitlements.can_join_clubs ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30 p-5 text-center space-y-3">
              <Lock className="h-8 w-8 text-amber-600 mx-auto" />
              <p className="font-medium">Investment clubs require a Pro plan</p>
              <p className="text-sm text-muted-foreground">
                Upgrade to join or create private investment clubs.
              </p>
              <Link href="/app/billing">
                <Button size="sm">Upgrade to Pro</Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{clubs.length} public clubs</p>
                <Link href="/app/community/clubs/new">
                  <Button size="sm" variant="outline" className="gap-2">
                    <Plus className="h-4 w-4" />
                    New Club
                  </Button>
                </Link>
              </div>
              {clubs.length === 0 ? (
                <EmptyState
                  icon={Users}
                  title="No public clubs yet"
                  description="Create or join an investment club to collaborate."
                />
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {clubs.map((club) => (
                    <Link
                      key={club.id}
                      href={`/app/community/clubs/${club.id}`}
                      className="rounded-lg border bg-card p-4 hover:bg-muted/30 transition-colors"
                    >
                      <p className="font-medium mb-1">{club.name}</p>
                      {club.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                          {club.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {club.member_count} members
                        </div>
                        {club.viewer_role && (
                          <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded capitalize">
                            {club.viewer_role}
                          </span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Empty state helper
// ============================================================================

function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
      <Icon className="h-10 w-10 text-muted-foreground/40" />
      <p className="font-medium text-muted-foreground">{title}</p>
      <p className="text-sm text-muted-foreground/70 max-w-xs">{description}</p>
    </div>
  );
}
