'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  AlertTriangle,
  ArrowLeft,
  Bell,
  BellOff,
  Clock,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  getCommunityWatchlist,
  followWatchlist,
  unfollowWatchlist,
  type CommunityWatchlist,
} from '@/lib/api/community';

function timeAgo(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const days = Math.floor(diff / 86_400_000);
  if (days === 0) return 'today';
  if (days === 1) return 'yesterday';
  return `${days}d ago`;
}

export default function WatchlistDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [watchlist, setWatchlist] = useState<CommunityWatchlist | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getCommunityWatchlist(id)
      .then((wl) => {
        setWatchlist(wl);
        setIsFollowing(wl.viewer_follows);
      })
      .catch(() => setError('Watchlist not found.'))
      .finally(() => setIsLoading(false));
  }, [id]);

  async function handleFollowToggle() {
    if (!watchlist) return;
    const prev = isFollowing;
    setIsFollowing(!prev);
    setWatchlist((w) =>
      w ? { ...w, followers_count: w.followers_count + (prev ? -1 : 1) } : w
    );
    try {
      if (prev) {
        await unfollowWatchlist(watchlist.id);
      } else {
        await followWatchlist(watchlist.id);
      }
    } catch {
      // Revert on failure
      setIsFollowing(prev);
      setWatchlist((w) =>
        w ? { ...w, followers_count: w.followers_count + (prev ? 1 : -1) } : w
      );
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error || !watchlist) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <AlertTriangle className="h-10 w-10 text-destructive" />
        <p className="text-muted-foreground">{error ?? 'Watchlist not found.'}</p>
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
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold truncate">{watchlist.name}</h1>
            {watchlist.description && (
              <p className="text-muted-foreground text-sm mt-1">{watchlist.description}</p>
            )}
          </div>
          <Button
            variant={isFollowing ? 'outline' : 'default'}
            size="sm"
            onClick={handleFollowToggle}
            className="shrink-0 gap-2"
          >
            {isFollowing ? (
              <>
                <BellOff className="h-4 w-4" />
                Unfollow
              </>
            ) : (
              <>
                <Bell className="h-4 w-4" />
                Follow
              </>
            )}
          </Button>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>by {watchlist.owner_display_name ?? 'Anonymous'}</span>
          <span className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            {watchlist.followers_count} followers
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            Updated {timeAgo(watchlist.updated_at)}
          </span>
        </div>

        {/* Symbol grid */}
        <div>
          <p className="text-sm font-medium mb-3">{watchlist.symbols.length} symbols</p>
          {watchlist.symbols.length === 0 ? (
            <p className="text-sm text-muted-foreground">No symbols added yet.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {watchlist.symbols.map((symbol) => (
                <span
                  key={symbol}
                  className="font-mono text-sm bg-muted px-3 py-1.5 rounded border font-medium"
                >
                  {symbol}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
