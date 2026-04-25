'use client';

import { useCallback, useEffect, useState } from 'react';
import { Brain, RefreshCw, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StrategyAgreementModal } from '@/components/strategy/agreement-modal';
import { AnalysisResult } from '@/components/strategy/analysis-result';
import { HistoryPanel } from '@/components/strategy/history-panel';
import {
  getAgreementStatus,
  getStrategyHistory,
  runAnalysis,
  type StrategyAnalysis,
  type StrategyHistoryItem,
} from '@/lib/api/strategy';

export default function StrategyPage() {
  const [agreed, setAgreed] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [analysis, setAnalysis] = useState<StrategyAnalysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);

  const [history, setHistory] = useState<StrategyHistoryItem[]>([]);
  const [historyTotal, setHistoryTotal] = useState(0);
  const [historyPage, setHistoryPage] = useState(1);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // Check agreement status on mount
  useEffect(() => {
    getAgreementStatus()
      .then((s) => {
        if (s.has_agreed) setAgreed(true);
        else setShowModal(true);
      })
      .catch(() => setShowModal(true));
  }, []);

  const handleDeleted = (id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
    setHistoryTotal((prev) => Math.max(0, prev - 1));
  };

  const loadHistory = useCallback(async (page = 1, append = false) => {
    if (page === 1) setLoadingHistory(true);
    else setLoadingMore(true);
    try {
      const res = await getStrategyHistory(page, 10);
      setHistory((prev) => (append ? [...prev, ...res.items] : res.items));
      setHistoryTotal(res.total);
      setHistoryPage(page);
    } catch {
      // non-fatal
    } finally {
      setLoadingHistory(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    if (agreed) loadHistory(1);
  }, [agreed, loadHistory]);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    setAnalyzeError(null);
    try {
      // force=true when re-analyzing so the cached stale result is bypassed
      const result = await runAnalysis(analysis !== null);
      setAnalysis(result);
      // Refresh history so the new record appears
      loadHistory(1);
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { status?: number; data?: { detail?: string } } };
        if (axiosErr.response?.status === 429) {
          setAnalyzeError('Rate limit reached. You can run up to 10 analyses per hour.');
        } else if (axiosErr.response?.status === 403) {
          setAnalyzeError(axiosErr.response.data?.detail ?? 'Access denied.');
        } else {
          setAnalyzeError('Analysis failed. Please try again.');
        }
      } else {
        setAnalyzeError('Analysis failed. Please try again.');
      }
    } finally {
      setAnalyzing(false);
    }
  };

  const handleAgreementAccepted = () => {
    setShowModal(false);
    setAgreed(true);
  };

  return (
    <>
      {showModal && <StrategyAgreementModal onAccepted={handleAgreementAccepted} />}

      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-900/30">
                <Brain className="h-5 w-5 text-violet-600 dark:text-violet-400" aria-hidden="true" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">AI Strategy Insights</h1>
                <p className="text-sm text-muted-foreground">
                  Educational portfolio analysis powered by AI
                </p>
              </div>
            </div>
          </div>

          {/* Analyze section */}
          <div className="mb-8 rounded-xl border bg-card p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-base font-semibold mb-1">Run Portfolio Analysis</h2>
                <p className="text-sm text-muted-foreground">
                  {analysis
                    ? 'Rerun to get a fresh analysis of your current portfolio.'
                    : 'Connect your broker via Broker Connections for portfolio-specific insights, or run a general market analysis.'}
                </p>
              </div>
              <Button
                onClick={handleAnalyze}
                disabled={analyzing || !agreed}
                className="shrink-0 gap-2"
              >
                {analyzing ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Analyzing…
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4" />
                    {analysis ? 'Re-analyze' : 'Analyze My Portfolio'}
                  </>
                )}
              </Button>
            </div>

            {analyzeError && (
              <p className="mt-3 text-sm text-destructive">{analyzeError}</p>
            )}
          </div>

          {/* Result */}
          {analysis && (
            <div className="mb-8">
              <AnalysisResult analysis={analysis} />
            </div>
          )}

          {/* History */}
          {agreed && (
            <div>
              <h2 className="mb-4 text-base font-semibold">Past Analyses</h2>
              {loadingHistory ? (
                <div className="flex items-center justify-center py-12">
                  <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <HistoryPanel
                  items={history}
                  total={historyTotal}
                  onDeleted={handleDeleted}
                  onLoadMore={() => loadHistory(historyPage + 1, true)}
                  loadingMore={loadingMore}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
