'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, RefreshCw, Pencil, Save, X, Plus, Trash2,
  CheckSquare, Square, MessageSquare, Link2, Link2Off,
  Calendar, DollarSign, User, Shield, Briefcase, Clock,
  AlertTriangle, CheckCircle2, XCircle, Building2, Lock,
} from 'lucide-react';
import {
  advisorApi,
  type AdvisorClient,
  type AdvisorClientStatus,
  type KYCStatus,
  type ClientNote,
  type ClientTask,
  type ClientPortfolioLink,
  type ModelPortfolio,
  type NoteType,
  type TaskPriority,
  type TaskStatus,
} from '@/lib/api/enterprise';
import { usePlanStore } from '@/stores/plan-store';

// ── helpers ────────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<AdvisorClientStatus, string> = {
  prospect:   'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  active:     'bg-green-500/10 text-green-400 border-green-500/20',
  inactive:   'bg-muted text-muted-foreground border-border',
  terminated: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const KYC_ICONS: Record<KYCStatus, React.ReactNode> = {
  pending:  <Clock className="h-4 w-4 text-yellow-400" />,
  approved: <CheckCircle2 className="h-4 w-4 text-green-400" />,
  rejected: <XCircle className="h-4 w-4 text-red-400" />,
};

const NOTE_TYPE_LABELS: Record<NoteType, string> = {
  general:   'Note',
  meeting:   'Meeting',
  call:      'Call',
  email:     'Email',
  follow_up: 'Follow-up',
  review:    'Review',
};

const PRIORITY_STYLES: Record<TaskPriority, string> = {
  low:    'text-muted-foreground',
  medium: 'text-blue-400',
  high:   'text-orange-400',
  urgent: 'text-red-400',
};

const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  pending:     'Pending',
  in_progress: 'In Progress',
  done:        'Done',
  cancelled:   'Cancelled',
};

function fmtAum(val: string | null): string {
  if (!val) return '—';
  const n = parseFloat(val);
  if (isNaN(n)) return '—';
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

function fmtDate(d: string | null): string {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function fmtDateTime(d: string | null): string {
  if (!d) return '—';
  return new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
}

type Tab = 'overview' | 'notes' | 'tasks' | 'portfolio';

// ── Main Component ─────────────────────────────────────────────────────────

export default function ClientDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { normalized, isLoaded } = usePlanStore();
  const isInstitutional = normalized.isAllAccess || normalized.plan === 'institutional';

  const [client, setClient] = useState<AdvisorClient | null>(null);
  const [notes, setNotes] = useState<ClientNote[]>([]);
  const [tasks, setTasks] = useState<ClientTask[]>([]);
  const [portfolioLink, setPortfolioLink] = useState<ClientPortfolioLink | null>(null);
  const [portfolios, setPortfolios] = useState<ModelPortfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('overview');

  // Edit state
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<AdvisorClient>>({});
  const [saving, setSaving] = useState(false);

  // Note form
  const [noteContent, setNoteContent] = useState('');
  const [noteType, setNoteType] = useState<NoteType>('general');
  const [addingNote, setAddingNote] = useState(false);

  // Task form
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: '', description: '', priority: 'medium' as TaskPriority, due_date: '' });
  const [addingTask, setAddingTask] = useState(false);

  // Portfolio link form
  const [selectedPortfolioId, setSelectedPortfolioId] = useState('');
  const [linkingPortfolio, setLinkingPortfolio] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const [c, n, t, p] = await Promise.all([
        advisorApi.getClient(id),
        advisorApi.listNotes(id),
        advisorApi.listTasks(id),
        advisorApi.listPortfolios(),
      ]);
      setClient(c);
      setNotes(n);
      setTasks(t);
      setPortfolios(p);
      try {
        const link = await advisorApi.getPortfolioLink(id);
        setPortfolioLink(link);
      } catch {
        setPortfolioLink(null);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [id]);

  function startEdit() {
    if (!client) return;
    setEditForm({ ...client });
    setEditing(true);
  }

  async function saveEdit() {
    if (!client) return;
    setSaving(true);
    try {
      const updated = await advisorApi.updateClient(client.id, editForm as any);
      setClient(updated);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  async function submitNote(e: React.FormEvent) {
    e.preventDefault();
    if (!noteContent.trim()) return;
    setAddingNote(true);
    try {
      const note = await advisorApi.createNote(id, { note_type: noteType, content: noteContent.trim() });
      setNotes([note, ...notes]);
      setNoteContent('');
      setNoteType('general');
    } finally {
      setAddingNote(false);
    }
  }

  async function deleteNote(noteId: string) {
    await advisorApi.deleteNote(id, noteId);
    setNotes(notes.filter((n) => n.id !== noteId));
  }

  async function submitTask(e: React.FormEvent) {
    e.preventDefault();
    if (!taskForm.title.trim()) return;
    setAddingTask(true);
    try {
      const task = await advisorApi.createTask(id, {
        title: taskForm.title.trim(),
        description: taskForm.description || undefined,
        priority: taskForm.priority,
        due_date: taskForm.due_date || undefined,
      });
      setTasks([...tasks, task]);
      setTaskForm({ title: '', description: '', priority: 'medium', due_date: '' });
      setShowTaskForm(false);
    } finally {
      setAddingTask(false);
    }
  }

  async function toggleTaskDone(task: ClientTask) {
    const newStatus: TaskStatus = task.status === 'done' ? 'pending' : 'done';
    const updated = await advisorApi.updateTask(id, task.id, { status: newStatus });
    setTasks(tasks.map((t) => t.id === task.id ? updated : t));
  }

  async function deleteTask(taskId: string) {
    await advisorApi.deleteTask(id, taskId);
    setTasks(tasks.filter((t) => t.id !== taskId));
  }

  async function linkPortfolio() {
    if (!selectedPortfolioId) return;
    setLinkingPortfolio(true);
    try {
      const link = await advisorApi.createPortfolioLink(id, { model_portfolio_id: selectedPortfolioId });
      setPortfolioLink(link);
      setSelectedPortfolioId('');
    } finally {
      setLinkingPortfolio(false);
    }
  }

  async function unlinkPortfolio() {
    await advisorApi.deletePortfolioLink(id);
    setPortfolioLink(null);
  }

  if (isLoaded && !isInstitutional) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="flex justify-center">
          <div className="p-4 rounded-2xl bg-purple-500/10">
            <Building2 className="h-10 w-10 text-purple-400" />
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Advisor CRM</h1>
          <p className="text-muted-foreground">
            Client profiles require an Institutional plan.
          </p>
        </div>
        <Link
          href="/app/billing"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Lock className="h-4 w-4" />
          Upgrade to Institutional
        </Link>
      </div>
    );
  }

  if (loading || !isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center space-y-3">
        <p className="text-muted-foreground">Client not found.</p>
        <Link href="/app/enterprise/advisor" className="text-sm text-primary hover:underline">
          Back to Advisor CRM
        </Link>
      </div>
    );
  }

  const linkedPortfolio = portfolioLink
    ? portfolios.find((p) => p.id === portfolioLink.model_portfolio_id)
    : null;

  const openTasks = tasks.filter((t) => t.status !== 'done' && t.status !== 'cancelled');
  const overdueTasks = openTasks.filter((t) => t.due_date && new Date(t.due_date) < new Date());

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Back link + header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <Link
            href="/app/enterprise/advisor"
            className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground mt-0.5"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold">{client.name}</h1>
              <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full border capitalize ${STATUS_STYLES[client.status]}`}>
                {client.status}
              </span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                {KYC_ICONS[client.kyc_status]}
                KYC {client.kyc_status}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              {client.email ?? 'No email'}
              {client.phone && ` · ${client.phone}`}
              {client.aum_usd && ` · ${fmtAum(client.aum_usd)} AUM`}
            </p>
          </div>
        </div>
        {!editing ? (
          <button
            onClick={startEdit}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md border border-border hover:bg-muted transition-colors shrink-0"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </button>
        ) : (
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => setEditing(false)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md border border-border hover:bg-muted transition-colors"
            >
              <X className="h-3.5 w-3.5" />
              Cancel
            </button>
            <button
              onClick={saveEdit}
              disabled={saving}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              <Save className="h-3.5 w-3.5" />
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        )}
      </div>

      {/* Quick stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Open Tasks', value: openTasks.length, warn: overdueTasks.length > 0 },
          { label: 'Overdue', value: overdueTasks.length, warn: overdueTasks.length > 0 },
          { label: 'Notes', value: notes.length, warn: false },
          { label: 'Next Review', value: fmtDate(client.next_review_date), warn: false },
        ].map((stat) => (
          <div key={stat.label} className="rounded-lg border border-border bg-card p-3">
            <p className="text-xs text-muted-foreground">{stat.label}</p>
            <p className={`text-base font-semibold ${stat.warn ? 'text-red-400' : ''}`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <div className="flex gap-0">
          {([
            { key: 'overview', label: 'Overview', icon: User },
            { key: 'notes', label: `Notes (${notes.length})`, icon: MessageSquare },
            { key: 'tasks', label: `Tasks (${openTasks.length})`, icon: CheckSquare },
            { key: 'portfolio', label: 'Portfolio Link', icon: Link2 },
          ] as const).map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key as Tab)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                tab === key
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab: Overview */}
      {tab === 'overview' && (
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Basic info */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              Contact & Profile
            </h3>
            {editing ? (
              <div className="space-y-3">
                {[
                  { label: 'Full Name', key: 'name', type: 'text' },
                  { label: 'Email', key: 'email', type: 'email' },
                  { label: 'Phone', key: 'phone', type: 'tel' },
                  { label: 'External Ref (CRM ID)', key: 'external_ref', type: 'text' },
                ].map(({ label, key, type }) => (
                  <div key={key} className="space-y-1">
                    <label className="text-xs text-muted-foreground">{label}</label>
                    <input
                      type={type}
                      className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm"
                      value={(editForm as any)[key] ?? ''}
                      onChange={(e) => setEditForm({ ...editForm, [key]: e.target.value || null })}
                    />
                  </div>
                ))}
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Status</label>
                  <select
                    className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm"
                    value={editForm.status ?? client.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value as AdvisorClientStatus })}
                  >
                    {(['prospect', 'active', 'inactive', 'terminated'] as AdvisorClientStatus[]).map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Tags (comma-separated)</label>
                  <input
                    type="text"
                    className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm"
                    value={(editForm.tags ?? []).join(', ')}
                    onChange={(e) => setEditForm({ ...editForm, tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean) })}
                  />
                </div>
              </div>
            ) : (
              <dl className="space-y-2 text-sm">
                {[
                  { label: 'Email', value: client.email },
                  { label: 'Phone', value: client.phone },
                  { label: 'External Ref', value: client.external_ref },
                  { label: 'Tags', value: client.tags.length > 0 ? client.tags.join(', ') : null },
                  { label: 'Status', value: client.status },
                  { label: 'Segment', value: client.segment },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-start gap-2">
                    <dt className="text-muted-foreground w-28 shrink-0">{label}</dt>
                    <dd className="capitalize">{value ?? '—'}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>

          {/* Investment profile */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              Investment Profile
            </h3>
            {editing ? (
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">AUM (USD)</label>
                  <input
                    type="number"
                    min="0"
                    className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm"
                    value={editForm.aum_usd ?? ''}
                    onChange={(e) => setEditForm({ ...editForm, aum_usd: e.target.value || null })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Risk Tolerance</label>
                  <select
                    className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm"
                    value={editForm.risk_tolerance ?? ''}
                    onChange={(e) => setEditForm({ ...editForm, risk_tolerance: (e.target.value as any) || null })}
                  >
                    <option value="">— Select —</option>
                    <option value="low">Conservative</option>
                    <option value="medium">Moderate</option>
                    <option value="high">Aggressive</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Investment Horizon (years)</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm"
                    value={editForm.investment_horizon_years ?? ''}
                    onChange={(e) => setEditForm({ ...editForm, investment_horizon_years: parseInt(e.target.value) || undefined })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Segment</label>
                  <select
                    className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm"
                    value={editForm.segment ?? ''}
                    onChange={(e) => setEditForm({ ...editForm, segment: (e.target.value as any) || null })}
                  >
                    <option value="">— Select —</option>
                    <option value="mass_market">Mass Market</option>
                    <option value="affluent">Affluent</option>
                    <option value="hnw">HNW</option>
                    <option value="uhnw">UHNW</option>
                  </select>
                </div>
              </div>
            ) : (
              <dl className="space-y-2 text-sm">
                {[
                  { label: 'AUM', value: fmtAum(client.aum_usd) },
                  { label: 'Risk', value: client.risk_tolerance ? { low: 'Conservative', medium: 'Moderate', high: 'Aggressive' }[client.risk_tolerance] : null },
                  { label: 'Horizon', value: client.investment_horizon_years ? `${client.investment_horizon_years} years` : null },
                  { label: 'Annual Income', value: client.annual_income_usd ? fmtAum(client.annual_income_usd) : null },
                  { label: 'Net Worth', value: client.net_worth_usd ? fmtAum(client.net_worth_usd) : null },
                  { label: 'Fee Type', value: client.fee_type },
                  { label: 'Fee Value', value: client.fee_value ? `${parseFloat(client.fee_value).toFixed(2)}${client.fee_type === 'aum_pct' ? '%' : ''}` : null },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-start gap-2">
                    <dt className="text-muted-foreground w-28 shrink-0">{label}</dt>
                    <dd>{value ?? '—'}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>

          {/* KYC / Compliance */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              KYC / Suitability
            </h3>
            {editing ? (
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">KYC Status</label>
                  <select
                    className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm"
                    value={editForm.kyc_status ?? client.kyc_status}
                    onChange={(e) => setEditForm({ ...editForm, kyc_status: e.target.value as KYCStatus })}
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Date of Birth</label>
                  <input
                    type="date"
                    className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm"
                    value={editForm.date_of_birth ?? ''}
                    onChange={(e) => setEditForm({ ...editForm, date_of_birth: e.target.value || null })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Occupation</label>
                  <input
                    type="text"
                    className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm"
                    value={editForm.occupation ?? ''}
                    onChange={(e) => setEditForm({ ...editForm, occupation: e.target.value || null })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Employer</label>
                  <input
                    type="text"
                    className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm"
                    value={editForm.employer ?? ''}
                    onChange={(e) => setEditForm({ ...editForm, employer: e.target.value || null })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Next Review Date</label>
                  <input
                    type="date"
                    className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm"
                    value={editForm.next_review_date ?? ''}
                    onChange={(e) => setEditForm({ ...editForm, next_review_date: e.target.value || null })}
                  />
                </div>
              </div>
            ) : (
              <dl className="space-y-2 text-sm">
                {[
                  { label: 'KYC Status', value: client.kyc_status },
                  { label: 'Date of Birth', value: client.date_of_birth ? fmtDate(client.date_of_birth) : null },
                  { label: 'Occupation', value: client.occupation },
                  { label: 'Employer', value: client.employer },
                  { label: 'KYC Completed', value: client.onboarding_completed_at ? fmtDate(client.onboarding_completed_at) : null },
                  { label: 'Next Review', value: client.next_review_date ? fmtDate(client.next_review_date) : null },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-start gap-2">
                    <dt className="text-muted-foreground w-28 shrink-0">{label}</dt>
                    <dd className="capitalize">{value ?? '—'}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>

          {/* Notes */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              Advisor Notes
            </h3>
            {editing ? (
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">General notes</label>
                <textarea
                  rows={5}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm resize-none"
                  value={editForm.notes ?? ''}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value || null })}
                />
              </div>
            ) : (
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {client.notes || 'No notes yet.'}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Tab: Notes */}
      {tab === 'notes' && (
        <div className="space-y-4">
          <form onSubmit={submitNote} className="rounded-xl border border-border bg-card p-4 space-y-3">
            <div className="flex gap-2">
              <select
                className="rounded-md border border-border bg-background px-3 py-2 text-sm"
                value={noteType}
                onChange={(e) => setNoteType(e.target.value as NoteType)}
              >
                {(Object.keys(NOTE_TYPE_LABELS) as NoteType[]).map((t) => (
                  <option key={t} value={t}>{NOTE_TYPE_LABELS[t]}</option>
                ))}
              </select>
            </div>
            <textarea
              required
              rows={3}
              placeholder="Add a note, meeting summary, or call log…"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm resize-none"
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={addingNote || !noteContent.trim()}
                className="px-4 py-2 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                {addingNote ? 'Saving…' : 'Add Note'}
              </button>
            </div>
          </form>

          <div className="space-y-2">
            {notes.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center">
                <MessageSquare className="h-7 w-7 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No notes yet. Log a meeting, call, or observation above.</p>
              </div>
            ) : (
              notes.map((note) => (
                <div key={note.id} className="rounded-xl border border-border bg-card p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-muted capitalize">
                        {NOTE_TYPE_LABELS[note.note_type]}
                      </span>
                      <span className="text-xs text-muted-foreground">{fmtDateTime(note.created_at)}</span>
                    </div>
                    <button
                      onClick={() => deleteNote(note.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors p-1 rounded"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <p className="text-sm mt-2 whitespace-pre-wrap">{note.content}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab: Tasks */}
      {tab === 'tasks' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              {openTasks.length} open
              {overdueTasks.length > 0 && (
                <span className="text-red-400 ml-2">· {overdueTasks.length} overdue</span>
              )}
            </p>
            <button
              onClick={() => setShowTaskForm(!showTaskForm)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Task
            </button>
          </div>

          {showTaskForm && (
            <form onSubmit={submitTask} className="rounded-xl border border-border bg-card p-4 space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs text-muted-foreground">Title *</label>
                  <input
                    required
                    className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm"
                    value={taskForm.title}
                    onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                    placeholder="e.g. Schedule quarterly review"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Priority</label>
                  <select
                    className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm"
                    value={taskForm.priority}
                    onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value as TaskPriority })}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Due Date</label>
                  <input
                    type="date"
                    className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm"
                    value={taskForm.due_date}
                    onChange={(e) => setTaskForm({ ...taskForm, due_date: e.target.value })}
                  />
                </div>
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs text-muted-foreground">Description</label>
                  <textarea
                    rows={2}
                    className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm resize-none"
                    value={taskForm.description}
                    onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowTaskForm(false)}
                  className="px-3 py-1.5 text-sm rounded-md border border-border hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingTask}
                  className="px-4 py-1.5 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
                >
                  {addingTask ? 'Adding…' : 'Add Task'}
                </button>
              </div>
            </form>
          )}

          <div className="space-y-2">
            {tasks.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center">
                <CheckSquare className="h-7 w-7 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No tasks yet. Add a follow-up above.</p>
              </div>
            ) : (
              tasks.map((task) => {
                const isOverdue = task.status !== 'done' && task.due_date && new Date(task.due_date) < new Date();
                return (
                  <div
                    key={task.id}
                    className={`flex items-start gap-3 rounded-xl border bg-card p-4 ${
                      isOverdue ? 'border-red-500/30' : 'border-border'
                    }`}
                  >
                    <button
                      onClick={() => toggleTaskDone(task)}
                      className="mt-0.5 shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {task.status === 'done'
                        ? <CheckSquare className="h-4 w-4 text-green-400" />
                        : <Square className="h-4 w-4" />
                      }
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className={`text-sm font-medium ${task.status === 'done' ? 'line-through text-muted-foreground' : ''}`}>
                          {task.title}
                        </p>
                        <span className={`text-xs font-medium capitalize ${PRIORITY_STYLES[task.priority]}`}>
                          {task.priority}
                        </span>
                        {isOverdue && (
                          <span className="text-xs text-red-400 flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            Overdue
                          </span>
                        )}
                      </div>
                      {task.description && (
                        <p className="text-xs text-muted-foreground mt-0.5">{task.description}</p>
                      )}
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span>{TASK_STATUS_LABELS[task.status]}</span>
                        {task.due_date && <span>Due {fmtDate(task.due_date)}</span>}
                        {task.completed_at && <span>Done {fmtDate(task.completed_at)}</span>}
                      </div>
                    </div>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="shrink-0 text-muted-foreground hover:text-destructive transition-colors p-1 rounded"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Tab: Portfolio Link */}
      {tab === 'portfolio' && (
        <div className="space-y-4">
          {portfolioLink && linkedPortfolio ? (
            <div className="rounded-xl border border-green-500/30 bg-card p-5 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium">{linkedPortfolio.name}</h3>
                  <p className="text-sm text-muted-foreground capitalize">{linkedPortfolio.risk_level} · {linkedPortfolio.rebalance_frequency}</p>
                </div>
                <button
                  onClick={unlinkPortfolio}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md border border-border hover:bg-muted transition-colors text-muted-foreground"
                >
                  <Link2Off className="h-3.5 w-3.5" />
                  Unlink
                </button>
              </div>
              {linkedPortfolio.description && (
                <p className="text-sm text-muted-foreground">{linkedPortfolio.description}</p>
              )}
              <div className="pt-2 border-t border-border">
                <p className="text-xs text-muted-foreground mb-2">Allocations</p>
                <div className="grid gap-1 sm:grid-cols-2 text-xs">
                  {Object.entries(linkedPortfolio.allocations).map(([sym, weight]) => (
                    <div key={sym} className="flex items-center justify-between">
                      <span className="font-medium">{sym}</span>
                      <span className="text-muted-foreground">{(weight * 100).toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>
              {portfolioLink.notes && (
                <p className="text-sm text-muted-foreground border-t border-border pt-2">{portfolioLink.notes}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Linked {fmtDateTime(portfolioLink.linked_at)}
                {portfolioLink.allocation_override_pct && ` · ${portfolioLink.allocation_override_pct}% of AUM`}
              </p>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border bg-card p-6 space-y-4">
              <div className="text-center">
                <Link2 className="h-7 w-7 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  No model portfolio linked. Select one below to assign a strategy to this client.
                </p>
              </div>
              {portfolios.length === 0 ? (
                <p className="text-center text-xs text-muted-foreground">
                  No model portfolios yet. Create one from the Advisor CRM page.
                </p>
              ) : (
                <div className="flex gap-2">
                  <select
                    className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm"
                    value={selectedPortfolioId}
                    onChange={(e) => setSelectedPortfolioId(e.target.value)}
                  >
                    <option value="">— Select a model portfolio —</option>
                    {portfolios.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.risk_level})
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={linkPortfolio}
                    disabled={!selectedPortfolioId || linkingPortfolio}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
                  >
                    <Link2 className="h-3.5 w-3.5" />
                    {linkingPortfolio ? 'Linking…' : 'Link'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
