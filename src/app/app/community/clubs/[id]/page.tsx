'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  AlertTriangle,
  ArrowLeft,
  Clock,
  Lock,
  LogIn,
  LogOut,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  getInvestmentClub,
  listClubMembers,
  joinClub,
  leaveClub,
  type InvestmentClub,
  type ClubMember,
} from '@/lib/api/community';

function timeAgo(isoString: string): string {
  const days = Math.floor((Date.now() - new Date(isoString).getTime()) / 86_400_000);
  if (days === 0) return 'today';
  if (days === 1) return 'yesterday';
  return `${days}d ago`;
}

export default function ClubDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [club, setClub] = useState<InvestmentClub | null>(null);
  const [members, setMembers] = useState<ClubMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isActing, setIsActing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getInvestmentClub(id), listClubMembers(id)])
      .then(([clubData, membersData]) => {
        setClub(clubData);
        setMembers(membersData);
      })
      .catch(() => setError('Club not found.'))
      .finally(() => setIsLoading(false));
  }, [id]);

  async function handleJoin() {
    if (!club || isActing) return;
    setIsActing(true);
    try {
      await joinClub(club.id);
      setClub((c) => c ? { ...c, member_count: c.member_count + 1, viewer_role: 'member' } : c);
      // Reload members list
      const updated = await listClubMembers(club.id);
      setMembers(updated);
    } catch {
      // silently fail — backend may not be deployed yet
    } finally {
      setIsActing(false);
    }
  }

  async function handleLeave() {
    if (!club || isActing) return;
    setIsActing(true);
    try {
      await leaveClub(club.id);
      setClub((c) => c ? { ...c, member_count: Math.max(c.member_count - 1, 1), viewer_role: null } : c);
      const updated = await listClubMembers(club.id);
      setMembers(updated);
    } catch {
      // silently fail
    } finally {
      setIsActing(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error || !club) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <AlertTriangle className="h-10 w-10 text-destructive" />
        <p className="text-muted-foreground">{error ?? 'Club not found.'}</p>
        <Button variant="outline" onClick={() => router.push('/app/community')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Community
        </Button>
      </div>
    );
  }

  const isMember = Boolean(club.viewer_role);
  const isOwner = club.viewer_role === 'owner';

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link
        href="/app/community"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Community
      </Link>

      {/* Club header */}
      <div className="rounded-lg border bg-card p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold truncate">{club.name}</h1>
              {club.is_private && (
                <span className="flex items-center gap-1 text-xs bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 px-2 py-0.5 rounded">
                  <Lock className="h-3 w-3" />
                  Private
                </span>
              )}
            </div>
            {club.description && (
              <p className="text-muted-foreground text-sm">{club.description}</p>
            )}
          </div>

          {/* Join / Leave button */}
          {!isOwner && !club.is_private && (
            isMember ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleLeave}
                disabled={isActing}
                className="shrink-0 gap-2"
              >
                <LogOut className="h-4 w-4" />
                Leave
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={handleJoin}
                disabled={isActing}
                className="shrink-0 gap-2"
              >
                <LogIn className="h-4 w-4" />
                Join
              </Button>
            )
          )}
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            {club.member_count} {club.member_count === 1 ? 'member' : 'members'}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            Created {timeAgo(club.created_at)}
          </span>
          {club.viewer_role && (
            <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded capitalize">
              {club.viewer_role}
            </span>
          )}
        </div>

        {club.tags && club.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {club.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs bg-muted text-muted-foreground px-2.5 py-1 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Members list */}
      <div className="rounded-lg border bg-card divide-y">
        <div className="px-6 py-4">
          <h2 className="font-semibold">Members ({members.length})</h2>
        </div>
        {members.length === 0 ? (
          <div className="px-6 py-8 text-center text-sm text-muted-foreground">
            No members yet.
          </div>
        ) : (
          members.map((m) => (
            <div key={m.user_id} className="flex items-center justify-between px-6 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold">
                  {(m.display_name ?? '?').charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium">{m.display_name ?? 'Anonymous'}</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="capitalize">{m.role}</span>
                <span>Joined {timeAgo(m.joined_at)}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
