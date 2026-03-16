'use client';

import { useEffect, useState } from 'react';
import {
  AlertCircle,
  CheckCircle,
  Clock,
  ExternalLink,
  Link2,
  RefreshCw,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  getLinkChecks,
  recheckLink,
  runAllLinkChecks,
  type LinkCheckResult,
  type LinkChecksListResponse,
  type LinkCheckRunResponse,
  type LinkStatus,
  type ResourceType,
} from '@/lib/api/admin';

const STATUS_CONFIG: Record<LinkStatus, { label: string; icon: React.ReactNode; className: string }> = {
  active:    { label: 'Active',     icon: <CheckCircle className="h-4 w-4" />,  className: 'text-green-600' },
  redirected:{ label: 'Redirected', icon: <CheckCircle className="h-4 w-4" />,  className: 'text-blue-600' },
  broken:    { label: 'Broken',     icon: <XCircle className="h-4 w-4" />,      className: 'text-red-600' },
  timeout:   { label: 'Timeout',    icon: <Clock className="h-4 w-4" />,        className: 'text-yellow-600' },
  unchecked: { label: 'Unchecked',  icon: <AlertCircle className="h-4 w-4" />,  className: 'text-slate-400' },
};

function StatusBadge({ status }: { status: LinkStatus }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.unchecked;
  return (
    <span className={`flex items-center gap-1 text-sm ${cfg.className}`}>
      {cfg.icon}
      {cfg.label}
    </span>
  );
}

export default function LinkCheckerPage() {
  const [data, setData] = useState<LinkChecksListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [runResult, setRunResult] = useState<LinkCheckRunResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [recheckingId, setRecheckingId] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<LinkStatus | ''>('');
  const [typeFilter, setTypeFilter] = useState<ResourceType | ''>('');

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = {};
      if (statusFilter) params.link_status = statusFilter;
      if (typeFilter) params.resource_type = typeFilter;
      setData(await getLinkChecks(params as any));
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to load link checks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, typeFilter]);

  const handleRunAll = async () => {
    setRunning(true);
    setRunResult(null);
    setError(null);
    try {
      const result = await runAllLinkChecks();
      setRunResult(result);
      await load();
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Link check run failed');
    } finally {
      setRunning(false);
    }
  };

  const handleRecheck = async (id: string) => {
    setRecheckingId(id);
    try {
      const updated = await recheckLink(id);
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          items: prev.items.map((item) =>
            item.id === id
              ? {
                  ...item,
                  link_status: updated.link_status,
                  http_status_code: updated.http_status_code,
                  error_message: updated.error_message,
                  last_checked_at: updated.checked_at,
                }
              : item
          ),
        };
      });
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Recheck failed');
    } finally {
      setRecheckingId(null);
    }
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <span className="text-muted-foreground">Loading link checks…</span>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <p className="text-destructive">{error}</p>
        <Button onClick={load} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" /> Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <Link2 className="h-7 w-7 text-slate-600" />
            Link Checker
          </h1>
          <p className="text-muted-foreground mt-1">
            Health status of all external URLs and videos in the learn catalog.
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={load} variant="ghost" size="icon" disabled={loading || running}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Button onClick={handleRunAll} disabled={running || loading} variant="default">
            {running ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Checking…
              </>
            ) : (
              'Check All Links'
            )}
          </Button>
        </div>
      </div>

      {/* Run result banner */}
      {runResult && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
          Check complete — {runResult.checked} URLs checked:&nbsp;
          <strong>{runResult.active} active</strong>,&nbsp;
          {runResult.redirected > 0 && <><strong>{runResult.redirected} redirected</strong>,&nbsp;</>}
          <strong className="text-red-700">{runResult.broken} broken</strong>,&nbsp;
          {runResult.timeout > 0 && <><strong className="text-yellow-700">{runResult.timeout} timeout</strong>,&nbsp;</>}
          {runResult.errors > 0 && <><strong>{runResult.errors} errors</strong></>}
        </div>
      )}

      {/* Error banner (non-fatal) */}
      {error && data && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {error}
        </div>
      )}

      {/* Summary cards */}
      {data && (
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border bg-card p-4">
            <p className="text-sm text-muted-foreground">Total Links</p>
            <p className="text-2xl font-bold">{data.total}</p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <XCircle className="h-3.5 w-3.5 text-red-500" /> Broken / Timeout
            </p>
            <p className={`text-2xl font-bold ${data.broken_count > 0 ? 'text-red-600' : ''}`}>
              {data.broken_count}
            </p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <AlertCircle className="h-3.5 w-3.5 text-slate-400" /> Unchecked
            </p>
            <p className="text-2xl font-bold">{data.unchecked_count}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          className="rounded-md border bg-background px-3 py-1.5 text-sm"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as LinkStatus | '')}
        >
          <option value="">All statuses</option>
          <option value="broken">Broken</option>
          <option value="timeout">Timeout</option>
          <option value="active">Active</option>
          <option value="redirected">Redirected</option>
          <option value="unchecked">Unchecked</option>
        </select>

        <select
          className="rounded-md border bg-background px-3 py-1.5 text-sm"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as ResourceType | '')}
        >
          <option value="">All types</option>
          <option value="external">External</option>
          <option value="video">Video</option>
        </select>
      </div>

      {/* Links table */}
      {data && data.items.length > 0 ? (
        <div className="rounded-lg border bg-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-4 font-medium text-muted-foreground">Module</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Label</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Type</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                <th className="text-left p-4 font-medium text-muted-foreground">HTTP</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Last Checked</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item) => (
                <tr
                  key={item.id}
                  className={`border-t hover:bg-muted/30 ${
                    item.link_status === 'broken' || item.link_status === 'timeout'
                      ? 'bg-red-50/30'
                      : ''
                  }`}
                >
                  <td className="p-4 font-mono text-xs text-muted-foreground">{item.module_id}</td>
                  <td className="p-4 max-w-[220px]">
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 hover:underline text-primary truncate"
                      title={item.url}
                    >
                      {item.resource_label}
                      <ExternalLink className="h-3 w-3 flex-shrink-0" />
                    </a>
                    {item.error_message && (
                      <p className="text-xs text-red-600 mt-0.5 truncate" title={item.error_message}>
                        {item.error_message}
                      </p>
                    )}
                  </td>
                  <td className="p-4">
                    <span className="capitalize text-xs bg-muted px-2 py-0.5 rounded-full">
                      {item.resource_type}
                    </span>
                  </td>
                  <td className="p-4">
                    <StatusBadge status={item.link_status} />
                  </td>
                  <td className="p-4 text-muted-foreground font-mono text-xs">
                    {item.http_status_code ?? '—'}
                  </td>
                  <td className="p-4 text-xs text-muted-foreground">
                    {item.last_checked_at
                      ? new Date(item.last_checked_at).toLocaleString()
                      : 'Never'}
                  </td>
                  <td className="p-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRecheck(item.id)}
                      disabled={recheckingId === item.id}
                    >
                      <RefreshCw
                        className={`h-3 w-3 mr-1 ${recheckingId === item.id ? 'animate-spin' : ''}`}
                      />
                      Recheck
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        data && (
          <div className="rounded-lg border border-dashed bg-muted/50 p-12 text-center">
            <Link2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold mb-2">No links match filters</h3>
            <p className="text-sm text-muted-foreground">Try adjusting your filters.</p>
          </div>
        )
      )}
    </div>
  );
}
