'use client';

import { cn } from '@/lib/utils';

interface CorrelationMatrixProps {
  matrix: Record<string, Record<string, number>>;
  className?: string;
}

function getCorrelationColor(value: number): string {
  // Color scale from red (negative) through white (zero) to green (positive)
  if (value >= 0.8) return 'bg-green-600 text-white';
  if (value >= 0.6) return 'bg-green-500 text-white';
  if (value >= 0.4) return 'bg-green-400 text-white';
  if (value >= 0.2) return 'bg-green-200 text-green-900';
  if (value >= -0.2) return 'bg-gray-100 text-gray-700';
  if (value >= -0.4) return 'bg-red-200 text-red-900';
  if (value >= -0.6) return 'bg-red-400 text-white';
  if (value >= -0.8) return 'bg-red-500 text-white';
  return 'bg-red-600 text-white';
}

export function CorrelationMatrix({ matrix, className }: CorrelationMatrixProps) {
  const symbols = Object.keys(matrix);

  if (symbols.length === 0) {
    return (
      <div className={cn('text-sm text-muted-foreground text-center py-4', className)}>
        No correlation data available
      </div>
    );
  }

  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="w-full text-xs">
        <thead>
          <tr>
            <th className="p-2 text-left font-medium text-muted-foreground" />
            {symbols.map((symbol) => (
              <th
                key={symbol}
                className="p-2 text-center font-medium text-muted-foreground"
              >
                {symbol}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {symbols.map((rowSymbol) => (
            <tr key={rowSymbol}>
              <td className="p-2 font-medium text-muted-foreground">
                {rowSymbol}
              </td>
              {symbols.map((colSymbol) => {
                const value = matrix[rowSymbol]?.[colSymbol] ?? 0;
                const isOnDiagonal = rowSymbol === colSymbol;

                return (
                  <td
                    key={`${rowSymbol}-${colSymbol}`}
                    className={cn(
                      'p-2 text-center font-mono',
                      isOnDiagonal
                        ? 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                        : getCorrelationColor(value)
                    )}
                  >
                    {value.toFixed(2)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Legend */}
      <div className="mt-3 flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded bg-red-500" />
          <span>-1</span>
        </div>
        <div className="h-px w-8 bg-gradient-to-r from-red-500 via-gray-200 to-green-500" />
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded bg-green-500" />
          <span>+1</span>
        </div>
      </div>
    </div>
  );
}
