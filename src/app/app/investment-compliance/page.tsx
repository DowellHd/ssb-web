'use client';

import { useEffect, useState } from 'react';
import {
  AlertCircle,
  BookOpen,
  CheckCircle,
  FileText,
  Loader2,
  Plus,
  Shield,
  Star,
  Trash2,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  checkWashSale,
  listJournalEntries,
  createJournalEntry,
  deleteJournalEntry,
  type JournalEntry,
} from '@/lib/api/portfolio';

const EMOTIONAL_STATES = ['confident', 'anxious', 'neutral', 'greedy', 'fearful', 'excited', 'uncertain'];
const ENTRY_TYPES = ['pre_trade', 'post_trade', 'reflection'];

const ENTRY_TYPE_LABELS: Record<string, string> = {
  pre_trade:  'Pre-Trade',
  post_trade: 'Post-Trade',
  reflection: 'Reflection',
};

function Section({ title, icon: Icon, children, defaultOpen = false }: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex w-full items-center justify-between px-5 py-4 hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Icon className="h-5 w-5 text-primary" />
          <span className="font-semibold">{title}</span>
        </div>
        <span className="text-xs text-muted-foreground">{open ? 'Collapse' : 'Expand'}</span>
      </button>
      {open && <div className="border-t px-5 py-4">{children}</div>}
    </div>
  );
}

export default function InvestmentCompliancePage() {
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [loadingJournal, setLoadingJournal] = useState(true);
  const [showJournalForm, setShowJournalForm] = useState(false);
  const [savingJournal, setSavingJournal] = useState(false);

  const [washSaleResult, setWashSaleResult] = useState<Record<string, unknown> | null>(null);
  const [washSaleLoading, setWashSaleLoading] = useState(false);
  const [washSaleError, setWashSaleError] = useState<string | null>(null);

  const [wsForm, setWsForm] = useState({
    symbol: '',
    sold_at: '',
    loss_amount: '',
    repurchased_at: '',
  });

  const [journalForm, setJournalForm] = useState({
    symbol: '',
    entry_type: 'post_trade' as string,
    emotional_state: '',
    technical_notes: '',
    emotional_notes: '',
    lessons_learned: '',
    rating: '',
    tags: '',
    trade_date: '',
  });

  useEffect(() => {
    loadJournal();
  }, []);

  async function loadJournal() {
    setLoadingJournal(true);
    try {
      const entries = await listJournalEntries();
      setJournalEntries(entries);
    } finally {
      setLoadingJournal(false);
    }
  }

  async function handleWashSaleCheck() {
    if (!wsForm.symbol || !wsForm.sold_at || !wsForm.loss_amount) return;
    setWashSaleLoading(true);
    setWashSaleError(null);
    try {
      const result = await checkWashSale({
        symbol: wsForm.symbol.toUpperCase(),
        sold_at: new Date(wsForm.sold_at).toISOString(),
        loss_amount: parseFloat(wsForm.loss_amount),
        repurchased_at: wsForm.repurchased_at ? new Date(wsForm.repurchased_at).toISOString() : undefined,
      });
      setWashSaleResult(result);
    } catch (err: any) {
      setWashSaleError(err?.response?.data?.detail || 'Analysis failed');
    } finally {
      setWashSaleLoading(false);
    }
  }

  async function handleSaveJournal() {
    setSavingJournal(true);
    try {
      const entry = await createJournalEntry({
        symbol: journalForm.symbol || undefined,
        entry_type: journalForm.entry_type,
        emotional_state: journalForm.emotional_state || undefined,
        technical_notes: journalForm.technical_notes || undefined,
        emotional_notes: journalForm.emotional_notes || undefined,
        lessons_learned: journalForm.lessons_learned || undefined,
        rating: journalForm.rating ? parseInt(journalForm.rating) : undefined,
        tags: journalForm.tags ? journalForm.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        trade_date: journalForm.trade_date || undefined,
      });
      setJournalEntries(prev => [entry, ...prev]);
      setShowJournalForm(false);
      setJournalForm({ symbol: '', entry_type: 'post_trade', emotional_state: '', technical_notes: '', emotional_notes: '', lessons_learned: '', rating: '', tags: '', trade_date: '' });
    } finally {
      setSavingJournal(false);
    }
  }

  async function handleDeleteJournal(id: string) {
    await deleteJournalEntry(id);
    setJournalEntries(prev => prev.filter(e => e.id !== id));
  }

  const washResult = washSaleResult as any;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold">Investment Compliance</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Wash sale analysis, trade journaling, and regulatory report preparation.
        </p>
      </div>

      <div className="rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800 p-3 text-xs text-amber-800 dark:text-amber-300">
        <strong>Educational Only:</strong> All compliance tools are for educational and organizational purposes.
        Not tax, legal, or regulatory advice. Consult qualified professionals for actual compliance requirements.
      </div>

      {/* Wash Sale Checker */}
      <Section title="Wash Sale Rule Checker" icon={Shield} defaultOpen>
        <p className="text-sm text-muted-foreground mb-4">
          Check whether a loss sale triggers the IRS 30-day wash sale rule (Section 1091).
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 mb-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Symbol</label>
            <input
              value={wsForm.symbol}
              onChange={e => setWsForm(f => ({ ...f, symbol: e.target.value }))}
              placeholder="AAPL"
              className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Loss Amount ($)</label>
            <input
              value={wsForm.loss_amount}
              onChange={e => setWsForm(f => ({ ...f, loss_amount: e.target.value }))}
              placeholder="1500.00"
              type="number"
              step="0.01"
              className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Date Sold</label>
            <input
              value={wsForm.sold_at}
              onChange={e => setWsForm(f => ({ ...f, sold_at: e.target.value }))}
              type="date"
              className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Repurchased At (optional)</label>
            <input
              value={wsForm.repurchased_at}
              onChange={e => setWsForm(f => ({ ...f, repurchased_at: e.target.value }))}
              type="date"
              className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        <Button
          size="sm"
          onClick={handleWashSaleCheck}
          disabled={washSaleLoading || !wsForm.symbol || !wsForm.sold_at || !wsForm.loss_amount}
        >
          {washSaleLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Shield className="h-4 w-4 mr-2" />}
          Check Wash Sale Rule
        </Button>

        {washSaleError && <p className="text-sm text-destructive mt-2">{washSaleError}</p>}

        {washResult && (
          <div className="mt-4 space-y-3">
            <div className={cn('flex items-center gap-2 rounded-lg border p-3', washResult.is_wash_sale ? 'border-red-300 bg-red-50 dark:bg-red-900/20' : 'border-green-300 bg-green-50 dark:bg-green-900/20')}>
              {washResult.is_wash_sale ? (
                <XCircle className="h-5 w-5 text-red-600 shrink-0" />
              ) : (
                <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
              )}
              <div>
                <p className={cn('font-semibold text-sm', washResult.is_wash_sale ? 'text-red-700' : 'text-green-700')}>
                  {washResult.is_wash_sale ? 'Wash Sale Triggered' : 'No Wash Sale'}
                </p>
                {washResult.is_wash_sale && (
                  <p className="text-xs text-red-600">Disallowed loss: ${washResult.disallowed_loss?.toLocaleString()}</p>
                )}
              </div>
            </div>
            <div className="rounded-lg bg-muted/30 p-3 space-y-1.5">
              {washResult.details?.map((d: string, i: number) => (
                <p key={i} className="text-xs">{d}</p>
              ))}
            </div>
            <p className="text-sm">{washResult.recommendation}</p>
            <p className="text-xs text-muted-foreground">{washResult.disclaimer}</p>
          </div>
        )}
      </Section>

      {/* Trade Journal */}
      <Section title="Trade Journal" icon={BookOpen} defaultOpen>
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">
            Document your trades, thought processes, and lessons learned.
          </p>
          <Button size="sm" variant="outline" onClick={() => setShowJournalForm(v => !v)}>
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            New Entry
          </Button>
        </div>

        {showJournalForm && (
          <div className="rounded-lg border bg-muted/20 p-4 mb-4 space-y-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Symbol (optional)</label>
                <input
                  value={journalForm.symbol}
                  onChange={e => setJournalForm(f => ({ ...f, symbol: e.target.value }))}
                  placeholder="AAPL"
                  className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Entry Type</label>
                <select
                  value={journalForm.entry_type}
                  onChange={e => setJournalForm(f => ({ ...f, entry_type: e.target.value }))}
                  className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {ENTRY_TYPES.map(t => <option key={t} value={t}>{ENTRY_TYPE_LABELS[t]}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Emotional State</label>
                <select
                  value={journalForm.emotional_state}
                  onChange={e => setJournalForm(f => ({ ...f, emotional_state: e.target.value }))}
                  className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">Select...</option>
                  {EMOTIONAL_STATES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Trade Date</label>
                <input
                  value={journalForm.trade_date}
                  onChange={e => setJournalForm(f => ({ ...f, trade_date: e.target.value }))}
                  type="date"
                  className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Technical Notes</label>
              <textarea
                value={journalForm.technical_notes}
                onChange={e => setJournalForm(f => ({ ...f, technical_notes: e.target.value }))}
                placeholder="Entry/exit rationale, indicators, setup..."
                rows={2}
                className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Emotional Notes</label>
              <textarea
                value={journalForm.emotional_notes}
                onChange={e => setJournalForm(f => ({ ...f, emotional_notes: e.target.value }))}
                placeholder="How did you feel? What influenced your decision?"
                rows={2}
                className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Lessons Learned</label>
              <textarea
                value={journalForm.lessons_learned}
                onChange={e => setJournalForm(f => ({ ...f, lessons_learned: e.target.value }))}
                placeholder="What would you do differently?"
                rows={2}
                className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Self-Rating (1–5)</label>
                <input
                  value={journalForm.rating}
                  onChange={e => setJournalForm(f => ({ ...f, rating: e.target.value }))}
                  type="number"
                  min="1"
                  max="5"
                  placeholder="3"
                  className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Tags (comma-separated)</label>
                <input
                  value={journalForm.tags}
                  onChange={e => setJournalForm(f => ({ ...f, tags: e.target.value }))}
                  placeholder="momentum, earnings, missed"
                  className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSaveJournal} disabled={savingJournal}>
                {savingJournal ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Save Entry
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setShowJournalForm(false)}>Cancel</Button>
            </div>
          </div>
        )}

        {loadingJournal ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : journalEntries.length === 0 ? (
          <div className="rounded-lg bg-muted/20 py-8 text-center">
            <BookOpen className="h-7 w-7 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No journal entries yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {journalEntries.map(entry => (
              <div key={entry.id} className="rounded-lg border p-4 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    {entry.symbol && <span className="font-semibold">{entry.symbol}</span>}
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{ENTRY_TYPE_LABELS[entry.entry_type]}</span>
                    {entry.emotional_state && (
                      <span className="rounded-full bg-violet-100 dark:bg-violet-900/30 px-2 py-0.5 text-xs text-violet-700 dark:text-violet-400 capitalize">{entry.emotional_state}</span>
                    )}
                    {entry.rating && (
                      <span className="flex items-center gap-0.5 text-xs text-amber-600">
                        <Star className="h-3 w-3 fill-current" /> {entry.rating}/5
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-muted-foreground">{entry.trade_date || new Date(entry.created_at).toLocaleDateString()}</span>
                    <button onClick={() => handleDeleteJournal(entry.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                {entry.technical_notes && <p className="text-sm"><span className="font-medium text-muted-foreground">Technical: </span>{entry.technical_notes}</p>}
                {entry.emotional_notes && <p className="text-sm"><span className="font-medium text-muted-foreground">Emotional: </span>{entry.emotional_notes}</p>}
                {entry.lessons_learned && <p className="text-sm"><span className="font-medium text-muted-foreground">Lessons: </span>{entry.lessons_learned}</p>}
                {entry.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {entry.tags.map(tag => (
                      <span key={tag} className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">#{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}
