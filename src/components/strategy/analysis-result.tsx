'use client';

import { AlertTriangle, Clock, Database } from 'lucide-react';
import { ConfidenceRing } from './confidence-ring';
import { RiskBadge } from './risk-badge';
import type { StrategyAnalysis } from '@/lib/api/strategy';

interface AnalysisResultProps {
  analysis: StrategyAnalysis;
}

export function AnalysisResult({ analysis }: AnalysisResultProps) {
  const generatedAt = new Date(analysis.requested_at).toLocaleString();

  return (
    <div className="space-y-6">
      {/* Scores row */}
      <div className="flex flex-wrap items-center justify-center gap-8 rounded-xl border bg-card p-6">
        <ConfidenceRing
          score={analysis.confidence_score}
          label="Analysis Confidence"
        />
        <ConfidenceRing
          score={analysis.diversification_score}
          label="Diversification"
          size={120}
        />
        <div className="flex flex-col items-center gap-3">
          <RiskBadge level={analysis.risk_level} className="text-sm px-4 py-1.5" />
          <span className="text-xs text-muted-foreground">Portfolio Risk Level</span>
          {!analysis.has_portfolio_data && (
            <div className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
              <Database className="h-3 w-3" />
              <span>No portfolio data connected</span>
            </div>
          )}
        </div>
      </div>

      {/* Key themes */}
      {analysis.key_themes.length > 0 && (
        <div className="rounded-xl border bg-card p-5">
          <h3 className="mb-3 text-sm font-semibold">Key Themes Identified</h3>
          <div className="flex flex-wrap gap-2">
            {analysis.key_themes.map((theme) => (
              <span
                key={theme}
                className="rounded-full border bg-muted/40 px-3 py-1 text-xs font-medium text-foreground"
              >
                {theme}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Analysis text */}
      <div className="rounded-xl border bg-card p-5">
        <h3 className="mb-3 text-sm font-semibold">Analysis</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">{analysis.analysis_text}</p>
      </div>

      {/* Disclaimer */}
      <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 dark:border-amber-700 dark:bg-amber-950/30">
        <div className="flex items-start gap-2">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden="true" />
          <p className="text-xs leading-relaxed text-amber-900 dark:text-amber-200">
            <strong>Educational only.</strong> This AI-generated analysis is not financial advice and does not
            constitute a recommendation to buy or sell any security. Always do your own research.
          </p>
        </div>
      </div>

      {/* Meta */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Generated {generatedAt}
        </span>
        <span>Model: {analysis.model_used}</span>
        {analysis.is_cached && (
          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
            Cached result
          </span>
        )}
      </div>
    </div>
  );
}
