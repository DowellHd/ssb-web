'use client';

interface ConfidenceRingProps {
  score: number;
  label: string;
  size?: number;
  strokeWidth?: number;
}

export function ConfidenceRing({
  score,
  label,
  size = 120,
  strokeWidth = 10,
}: ConfidenceRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(100, Math.max(0, score * 100));
  const offset = circumference - (pct / 100) * circumference;

  const color =
    pct >= 70 ? 'text-green-500' : pct >= 45 ? 'text-amber-500' : 'text-red-500';
  const stroke =
    pct >= 70 ? '#22c55e' : pct >= 45 ? '#f59e0b' : '#ef4444';

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-muted/20"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.8s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-2xl font-bold tabular-nums ${color}`}>
            {Math.round(pct)}
          </span>
          <span className="text-[10px] text-muted-foreground">/ 100</span>
        </div>
      </div>
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
    </div>
  );
}
