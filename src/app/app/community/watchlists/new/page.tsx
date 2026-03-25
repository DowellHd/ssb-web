'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createCommunityWatchlist } from '@/lib/api/community';

export default function NewWatchlistPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [symbolInput, setSymbolInput] = useState('');
  const [symbols, setSymbols] = useState<string[]>([]);
  const [isPublic, setIsPublic] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function addSymbol() {
    const s = symbolInput.trim().toUpperCase();
    if (s && !symbols.includes(s)) {
      setSymbols((prev) => [...prev, s]);
    }
    setSymbolInput('');
  }

  function removeSymbol(s: string) {
    setSymbols((prev) => prev.filter((x) => x !== s));
  }

  function handleSymbolKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addSymbol();
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const wl = await createCommunityWatchlist({
        name: name.trim(),
        description: description.trim() || null,
        symbols,
        is_public: isPublic,
      });
      router.push(`/app/community/watchlists/${wl.id}`);
    } catch {
      setError('Failed to create watchlist. Please try again.');
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
        <h1 className="text-2xl font-bold">Create a Watchlist</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Build and share a list of stocks you&apos;re watching.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Name</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="My Tech Watchlist"
            maxLength={100}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium">
            Description <span className="text-muted-foreground font-normal">(optional)</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What's this watchlist about?"
            rows={3}
            maxLength={500}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />
        </div>

        {/* Symbols */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Symbols</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={symbolInput}
              onChange={(e) => setSymbolInput(e.target.value.toUpperCase())}
              onKeyDown={handleSymbolKeyDown}
              placeholder="AAPL"
              maxLength={10}
              className="flex-1 rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Button type="button" variant="outline" size="sm" onClick={addSymbol}>
              Add
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">Press Enter or comma to add a symbol</p>
          {symbols.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {symbols.map((s) => (
                <span
                  key={s}
                  className="flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded font-mono"
                >
                  {s}
                  <button
                    type="button"
                    onClick={() => removeSymbol(s)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Visibility */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            role="switch"
            aria-checked={isPublic}
            onClick={() => setIsPublic((v) => !v)}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
              isPublic ? 'bg-primary' : 'bg-muted'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                isPublic ? 'translate-x-4' : 'translate-x-0.5'
              }`}
            />
          </button>
          <span className="text-sm">
            {isPublic ? 'Public — visible to the community' : 'Private — only visible to you'}
          </span>
        </div>

        {error && (
          <p className="text-sm text-destructive rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2">
            {error}
          </p>
        )}

        <div className="flex gap-3">
          <Button type="submit" disabled={isSubmitting || !name.trim()} className="gap-2">
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Create Watchlist
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
