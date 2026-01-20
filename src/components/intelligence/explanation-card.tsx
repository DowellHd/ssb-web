'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Info, AlertCircle, Code2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Explanation } from '@/lib/demo-data/regime-analysis';

interface ExplanationCardProps {
  explanation: Explanation;
  className?: string;
  defaultExpanded?: boolean;
}

export function ExplanationCard({
  explanation,
  className,
  defaultExpanded = false,
}: ExplanationCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className={cn('rounded-lg border bg-card', className)}>
      {/* Summary - always visible */}
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/30">
            <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-sm font-medium">Analysis Summary</h4>
              {/* Model version badge for audit transparency */}
              <span className="inline-flex items-center gap-1 rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                <Code2 className="h-2.5 w-2.5" />
                {explanation.model_info.model_type} v{explanation.model_info.version}
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {explanation.summary}
            </p>
          </div>
        </div>
      </div>

      {/* Expandable details */}
      <div className="border-t">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium hover:bg-muted/50 transition-colors"
        >
          <span>View Details</span>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </button>

        {isExpanded && (
          <div className="border-t px-4 py-4 space-y-6">
            {/* Key Factors */}
            <div className="space-y-2">
              <h5 className="text-sm font-medium">Key Factors</h5>
              <ul className="space-y-1.5">
                {explanation.key_factors.map((factor, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-sm text-muted-foreground"
                  >
                    <span className="text-primary mt-1">•</span>
                    <span>{factor}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Model Info */}
            <div className="space-y-2">
              <h5 className="text-sm font-medium">Methodology</h5>
              <div className="rounded-md bg-muted/50 p-3 space-y-2">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-muted-foreground">Model:</span>
                  <span className="font-mono">
                    {explanation.model_info.model_type} v{explanation.model_info.version}
                  </span>
                </div>
                {explanation.model_info.assumptions.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">Assumptions:</span>
                    <ul className="text-xs text-muted-foreground space-y-0.5 ml-4">
                      {explanation.model_info.assumptions.map((assumption, index) => (
                        <li key={index}>• {assumption}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Limitations */}
            {explanation.limitations.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <h5 className="text-sm font-medium">Important Limitations</h5>
                </div>
                <ul className="space-y-1 ml-6">
                  {explanation.limitations.map((limitation, index) => (
                    <li
                      key={index}
                      className="text-xs text-muted-foreground list-disc"
                    >
                      {limitation}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
