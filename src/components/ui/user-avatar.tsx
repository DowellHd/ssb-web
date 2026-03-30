'use client';

import { cn } from '@/lib/utils';

const PRESET_COLORS: Record<string, { bg: string; text: string }> = {
  rose:    { bg: 'bg-rose-500/20',    text: 'text-rose-400' },
  orange:  { bg: 'bg-orange-500/20',  text: 'text-orange-400' },
  amber:   { bg: 'bg-amber-500/20',   text: 'text-amber-400' },
  emerald: { bg: 'bg-emerald-500/20', text: 'text-emerald-400' },
  teal:    { bg: 'bg-teal-500/20',    text: 'text-teal-400' },
  cyan:    { bg: 'bg-cyan-500/20',    text: 'text-cyan-400' },
  blue:    { bg: 'bg-blue-500/20',    text: 'text-blue-400' },
  indigo:  { bg: 'bg-indigo-500/20',  text: 'text-indigo-400' },
  violet:  { bg: 'bg-violet-500/20',  text: 'text-violet-400' },
  purple:  { bg: 'bg-purple-500/20',  text: 'text-purple-400' },
  pink:    { bg: 'bg-pink-500/20',    text: 'text-pink-400' },
  slate:   { bg: 'bg-slate-500/20',   text: 'text-slate-400' },
};

const FALLBACK_COLORS = Object.values(PRESET_COLORS);

function getAutoColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return FALLBACK_COLORS[Math.abs(hash) % FALLBACK_COLORS.length];
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

interface UserAvatarProps {
  avatarUrl?: string | null;
  name: string;
  size?: number; // px, default 32
  className?: string;
}

export function UserAvatar({ avatarUrl, name, size = 32, className }: UserAvatarProps) {
  const initials = getInitials(name || '?');
  const fontSize = size <= 24 ? 'text-[10px]' : size <= 32 ? 'text-xs' : size <= 48 ? 'text-sm' : 'text-base';

  // Photo upload (data URL)
  if (avatarUrl && avatarUrl.startsWith('data:image/')) {
    return (
      <div
        className={cn('relative shrink-0 overflow-hidden rounded-full', className)}
        style={{ width: size, height: size }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={avatarUrl} alt={name} className="h-full w-full object-cover" />
      </div>
    );
  }

  // Preset color
  const presetColor = avatarUrl?.startsWith('preset:')
    ? PRESET_COLORS[avatarUrl.split(':')[1]]
    : null;
  const colors = presetColor ?? getAutoColor(name || '?');

  return (
    <div
      className={cn(
        'shrink-0 rounded-full flex items-center justify-center font-semibold',
        colors.bg,
        colors.text,
        fontSize,
        className,
      )}
      style={{ width: size, height: size }}
      aria-label={name}
    >
      {initials}
    </div>
  );
}

export { PRESET_COLORS };
