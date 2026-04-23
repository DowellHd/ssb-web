'use client';

import { useEffect, useState } from 'react';
import { ClipboardList, RefreshCw, AlertCircle, CheckCircle, XCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getAuditLogs, type AuditLogEntry, type AuditLogListResponse } from '@/lib/api/meta';

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const PAGE_SIZE = 20;

  const loadData = async (pageNum: number = 1) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getAuditLogs({ page: pageNum, page_size: PAGE_SIZE });
      setLogs(response.logs);
      setTotal(response.total);
      setHasMore(response.has_more);
      setPage(pageNum);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getActionBadge = (action: string) => {
    const actionColors: Record<string, string> = {
      login: 'bg-blue-100 text-blue-800',
      logout: 'bg-slate-100 text-slate-800',
      login_failed: 'bg-red-100 text-red-800',
      password_changed: 'bg-yellow-100 text-yellow-800',
      mfa_enabled: 'bg-green-100 text-green-800',
      mfa_disabled: 'bg-orange-100 text-orange-800',
      session_revoked: 'bg-purple-100 text-purple-800',
      email_verified: 'bg-green-100 text-green-800',
    };
    const color = actionColors[action] || 'bg-slate-100 text-slate-800';
    return (
      <span className={`px-2 py-1 rounded-full text-xs ${color}`}>
        {action.replace(/_/g, ' ')}
      </span>
    );
  };

  if (loading && logs.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <span className="text-muted-foreground">Loading audit logs...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <p className="text-destructive">{error}</p>
        <Button onClick={() => loadData()} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <ClipboardList className="h-7 w-7 text-slate-600" />
            Audit Log
          </h1>
          <p className="text-muted-foreground mt-1">
            Security events, login attempts, and account changes.
          </p>
        </div>
        <Button onClick={() => loadData(page)} variant="ghost" size="icon" disabled={loading} aria-label="Refresh audit log">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Total Events</p>
          <p className="text-2xl font-bold">{total}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Current Page</p>
          <p className="text-2xl font-bold">{page} of {Math.ceil(total / PAGE_SIZE) || 1}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Showing</p>
          <p className="text-2xl font-bold">{logs.length} events</p>
        </div>
      </div>

      {/* Logs list */}
      {logs.length > 0 ? (
        <div className="rounded-lg border bg-card overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Action</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">IP Address</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-t hover:bg-muted/30">
                  <td className="p-4">{getActionBadge(log.action)}</td>
                  <td className="p-4">
                    {log.success ? (
                      <span className="flex items-center gap-1 text-green-600">
                        <CheckCircle className="h-4 w-4" /> Success
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-red-600">
                        <XCircle className="h-4 w-4" /> Failed
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-sm text-muted-foreground font-mono">
                    {log.ip_address || '—'}
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed bg-muted/50 p-12 text-center">
          <ClipboardList className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold mb-2">No Audit Logs Yet</h3>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Your security events and account activity will appear here.
            This includes logins, password changes, MFA events, and more.
          </p>
        </div>
      )}

      {/* Pagination */}
      {total > PAGE_SIZE && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(page - 1) * PAGE_SIZE + 1} - {Math.min(page * PAGE_SIZE, total)} of {total}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadData(page - 1)}
              disabled={page <= 1 || loading}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadData(page + 1)}
              disabled={!hasMore || loading}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Info banner */}
      <div className="rounded-lg bg-slate-50 border border-slate-200 p-4 text-sm text-slate-800">
        <strong>Note:</strong> Audit logs are retained for compliance and security purposes.
        They track all security-related actions on your account including logins, password changes,
        and session management activities.
      </div>
    </div>
  );
}
