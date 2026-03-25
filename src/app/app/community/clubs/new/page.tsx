'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createInvestmentClub } from '@/lib/api/community';

export default function NewClubPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [tags, setTags] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const club = await createInvestmentClub({
        name: name.trim(),
        description: description.trim() || null,
        is_private: isPrivate,
        tags: tags.trim() ? tags.split(',').map((t) => t.trim()).filter(Boolean) : null,
      });
      router.push(`/app/community/clubs/${club.id}`);
    } catch {
      setError('Failed to create club. Please try again.');
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
        <h1 className="text-2xl font-bold">Create an Investment Club</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Collaborate with others on investment ideas and research.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Club Name</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Value Investors Circle"
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
            placeholder="What is this club focused on? Who should join?"
            rows={4}
            maxLength={1000}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />
        </div>

        {/* Tags */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium">
            Tags <span className="text-muted-foreground font-normal">(optional, comma-separated)</span>
          </label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="value-investing, dividends, long-term"
            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Privacy */}
        <div className="rounded-lg border p-4 space-y-3">
          <p className="text-sm font-medium">Visibility</p>
          <div className="flex flex-col gap-2">
            {[
              {
                value: false,
                label: 'Public',
                desc: 'Anyone can find and join this club',
              },
              {
                value: true,
                label: 'Private',
                desc: 'Only members you invite can join',
              },
            ].map(({ value, label, desc }) => (
              <label
                key={label}
                className={`flex items-start gap-3 rounded-md border p-3 cursor-pointer transition-colors ${
                  isPrivate === value ? 'border-primary bg-primary/5' : 'hover:bg-muted/30'
                }`}
              >
                <input
                  type="radio"
                  name="privacy"
                  checked={isPrivate === value}
                  onChange={() => setIsPrivate(value)}
                  className="mt-0.5 accent-primary"
                />
                <div>
                  <p className="text-sm font-medium">{label}</p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {error && (
          <p className="text-sm text-destructive rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2">
            {error}
          </p>
        )}

        <div className="flex gap-3">
          <Button type="submit" disabled={isSubmitting || !name.trim()} className="gap-2">
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Create Club
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
