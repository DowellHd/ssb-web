'use client';

import { useState } from 'react';
import { Shield, Download, RefreshCw, FileText } from 'lucide-react';
import { complianceApi, type ComplianceAuditReport } from '@/lib/api/enterprise';

const PERIOD_OPTIONS = [
  { value: 7, label: 'Last 7 days' },
  { value: 30, label: 'Last 30 days' },
  { value: 90, label: 'Last 90 days' },
  { value: 180, label: 'Last 180 days' },
  { value: 365, label: 'Last year' },
];

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString();
}

export default function CompliancePage() {
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<ComplianceAuditReport | null>(null);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setReport(null);
    try {
      setReport(await complianceApi.getAuditReport(days));
    } catch {
      setError('Failed to generate compliance report. Ensure you have institutional access.');
    } finally {
      setLoading(false);
    }
  }

  function handleDownload() {
    if (!report) return;
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-report-${report.period_days}d-${report.generated_at.split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-xl font-bold">Compliance & Audit</h1>
        <p className="text-sm text-muted-foreground">Generate audit reports for regulatory and internal review.</p>
      </div>

      <form onSubmit={handleGenerate} className="rounded-xl border border-border bg-card p-5 space-y-4">
        <h3 className="font-semibold">Generate Audit Report</h3>

        <div className="space-y-1 max-w-xs">
          <label className="text-xs text-muted-foreground">Reporting Period</label>
          <select
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
          >
            {PERIOD_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
            {loading ? 'Generating…' : 'Generate Report'}
          </button>
        </div>
      </form>

      {report && (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-green-400" />
              <span className="font-semibold text-sm">Audit Report</span>
              <span className="text-xs text-muted-foreground">{formatDate(report.generated_at)}</span>
            </div>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md border border-border hover:bg-muted transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              Download JSON
            </button>
          </div>

          <div className="px-4 py-3 border-b border-border bg-muted/20 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Period</p>
              <p className="font-medium">{report.period_days} days</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Events</p>
              <p className="font-medium">{report.total_events}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Report Type</p>
              <p className="font-medium capitalize">{report.report_type}</p>
            </div>
          </div>

          {report.events.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">No audit events in this period.</div>
          ) : (
            <div className="divide-y divide-border max-h-[480px] overflow-y-auto">
              {report.events.map((ev) => (
                <div key={ev.id} className="px-4 py-3 flex items-start justify-between gap-4 hover:bg-muted/20 transition-colors">
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{ev.action}</p>
                      <span className={`text-xs px-1.5 py-0.5 rounded border ${
                        ev.success
                          ? 'bg-green-500/10 text-green-400 border-green-500/20'
                          : 'bg-red-500/10 text-red-400 border-red-500/20'
                      }`}>
                        {ev.success ? 'success' : 'failed'}
                      </span>
                    </div>
                    {ev.ip_address && (
                      <p className="text-xs text-muted-foreground font-mono">{ev.ip_address}</p>
                    )}
                    {ev.metadata && Object.keys(ev.metadata).length > 0 && (
                      <p className="text-xs text-muted-foreground">
                        {Object.entries(ev.metadata).slice(0, 3).map(([k, v]) => `${k}: ${v}`).join(' · ')}
                      </p>
                    )}
                  </div>
                  <div className="shrink-0 text-xs text-muted-foreground whitespace-nowrap">
                    {formatDate(ev.created_at)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {!report && !loading && (
        <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center space-y-2">
          <Shield className="h-8 w-8 text-muted-foreground mx-auto" />
          <p className="text-sm text-muted-foreground">Select a reporting period and generate your audit report.</p>
        </div>
      )}
    </div>
  );
}
