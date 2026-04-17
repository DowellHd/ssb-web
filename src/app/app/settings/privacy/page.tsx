'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Shield,
  Download,
  Trash2,
  Eye,
  Bell,
  BarChart3,
  Mail,
  Users,
  Database,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  FileJson,
  Lock,
  Globe,
  CreditCard,
  Activity,
  RefreshCw,
  Info,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  getPrivacyPreferences,
  updatePrivacyPreferences,
  exportUserData,
  deleteAccount,
  type PrivacyPreferences,
  type DataExport,
} from '@/lib/api/privacy';
import { getErrorMessage } from '@/lib/api-client';

// ============================================================================
// Types
// ============================================================================

type Section = 'overview' | 'preferences' | 'rights' | 'export' | 'delete';

// ============================================================================
// Static data
// ============================================================================

const DATA_CATEGORIES = [
  {
    icon: Users,
    title: 'Account & Identity',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    items: ['Email address', 'Full name', 'Phone number', 'Profile avatar', 'Account creation date'],
    purpose: 'Account creation and authentication',
    legal: 'Contract performance',
    retention: 'Duration of account + 90 days after deletion',
  },
  {
    icon: Activity,
    title: 'Authentication & Security',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    items: ['Login timestamps and IP addresses', 'Device and browser information', 'Failed login attempts', 'Session identifiers (hashed)', 'MFA status'],
    purpose: 'Fraud prevention and account security',
    legal: 'Legitimate interest (security)',
    retention: '12 months rolling, then anonymized',
  },
  {
    icon: BarChart3,
    title: 'Trading & Analysis Activity',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    items: ['Paper trade orders and fills', 'Backtest configurations and results', 'Portfolio watchlists and settings', 'Regime and risk analysis queries', 'Screener filter preferences'],
    purpose: 'Deliver analysis tools and personalize your experience',
    legal: 'Contract performance',
    retention: 'Duration of account; deleted on account closure',
  },
  {
    icon: Globe,
    title: 'Connected Financial Accounts (Plaid)',
    color: 'text-violet-400',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/20',
    items: ['Brokerage account names and numbers (masked)', 'Account balances and holdings', 'Transaction history (read-only)', 'Institution names'],
    purpose: 'Display real portfolio data alongside paper trading tools',
    legal: 'Explicit consent (Plaid OAuth)',
    retention: 'Deleted immediately when you disconnect the account',
    note: 'SSB never receives or stores your brokerage login credentials. All credential handling is performed exclusively by Plaid under their own security and privacy standards.',
  },
  {
    icon: Bell,
    title: 'Usage & Analytics',
    color: 'text-pink-400',
    bg: 'bg-pink-500/10',
    border: 'border-pink-500/20',
    items: ['Feature navigation and click patterns', 'Page load and performance metrics', 'Error reports (Sentry — anonymized)', 'Aggregate usage statistics'],
    purpose: 'Improve product performance and prioritize features',
    legal: 'Consent (configurable below)',
    retention: '24 months, then aggregated',
  },
  {
    icon: CreditCard,
    title: 'Billing & Subscription',
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/20',
    items: ['Subscription plan and status', 'Billing date and payment history', 'Plan feature entitlements'],
    purpose: 'Manage subscription and enforce plan limits',
    legal: 'Contract performance',
    retention: '7 years (financial records regulation)',
    note: 'Payment card data is handled exclusively by Stripe and never stored on SSB servers.',
  },
];

const THIRD_PARTIES = [
  {
    name: 'Plaid',
    role: 'Financial account connectivity',
    data: 'Your brokerage credentials and financial account access (handled directly by Plaid)',
    link: 'https://plaid.com/legal/privacy-statement/',
    optional: true,
  },
  {
    name: 'Stripe',
    role: 'Subscription billing',
    data: 'Payment card details, billing address, transaction records',
    link: 'https://stripe.com/privacy',
    optional: false,
  },
  {
    name: 'Sentry',
    role: 'Error monitoring and performance',
    data: 'Anonymized error traces, performance timing — no financial data',
    link: 'https://sentry.io/privacy/',
    optional: true,
  },
  {
    name: 'Email Service',
    role: 'Transactional and notification emails',
    data: 'Email address and notification content',
    link: null,
    optional: false,
  },
];

const USER_RIGHTS = [
  {
    icon: Eye,
    title: 'Right to Access (GDPR Art. 15 / CCPA)',
    desc: 'Obtain a complete copy of all personal data SSB holds about you.',
    action: 'export' as Section,
    actionLabel: 'Download Your Data',
  },
  {
    icon: Download,
    title: 'Right to Data Portability (GDPR Art. 20)',
    desc: 'Receive your data in a structured, machine-readable format you can transfer to another service.',
    action: 'export' as Section,
    actionLabel: 'Download Your Data',
  },
  {
    icon: RefreshCw,
    title: 'Right to Rectification (GDPR Art. 16)',
    desc: 'Correct inaccurate personal data. Update your name, email, and phone in Account Settings.',
    action: null,
    actionLabel: null,
  },
  {
    icon: Trash2,
    title: 'Right to Erasure / Deletion (GDPR Art. 17 / CCPA)',
    desc: 'Request permanent deletion of your account and all associated personal data.',
    action: 'delete' as Section,
    actionLabel: 'Delete Account',
  },
  {
    icon: Lock,
    title: 'Right to Restrict Processing (GDPR Art. 18)',
    desc: 'Limit how we process your data. Contact privacy@smartstrategiesbuilder.com to submit a restriction request.',
    action: null,
    actionLabel: null,
  },
  {
    icon: X,
    title: 'Right to Object (GDPR Art. 21 / CCPA Opt-Out)',
    desc: 'Object to processing based on legitimate interest, including analytics and marketing.',
    action: 'preferences' as Section,
    actionLabel: 'Manage Preferences',
  },
];

// ============================================================================
// Toggle component
// ============================================================================

function Toggle({
  checked,
  onChange,
  disabled,
  id,
}: {
  checked: boolean;
  onChange: (val: boolean) => void;
  disabled?: boolean;
  id: string;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      id={id}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={[
        'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent',
        'transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        'disabled:cursor-not-allowed disabled:opacity-50',
        checked ? 'bg-foreground' : 'bg-muted',
      ].join(' ')}
    >
      <span
        className={[
          'pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform duration-200',
          checked ? 'translate-x-4' : 'translate-x-0',
        ].join(' ')}
      />
    </button>
  );
}

// ============================================================================
// Collapsible data category card
// ============================================================================

function DataCategoryCard({ cat }: { cat: typeof DATA_CATEGORIES[0] }) {
  const [open, setOpen] = useState(false);
  const Icon = cat.icon;
  return (
    <div className={`rounded-lg border ${cat.border} bg-card elevation-1`}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left"
      >
        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${cat.bg}`}>
          <Icon className={`h-4 w-4 ${cat.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold">{cat.title}</p>
          <p className="text-xs text-muted-foreground">{cat.purpose}</p>
        </div>
        {open
          ? <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
          : <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
        }
      </button>

      {open && (
        <div className="border-t border-border/50 px-4 py-3 space-y-3">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">Data collected</p>
            <ul className="space-y-1">
              {cat.items.map((item) => (
                <li key={item} className="flex items-start gap-2 text-xs text-foreground/80">
                  <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-muted-foreground" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 text-xs">
            <div>
              <p className="font-medium text-muted-foreground mb-0.5">Legal basis</p>
              <p className="text-foreground/80">{cat.legal}</p>
            </div>
            <div className="sm:col-span-2">
              <p className="font-medium text-muted-foreground mb-0.5">Retention period</p>
              <p className="text-foreground/80">{cat.retention}</p>
            </div>
          </div>
          {cat.note && (
            <div className="flex gap-2 rounded-md bg-muted/40 p-3">
              <Info className="h-3.5 w-3.5 shrink-0 text-muted-foreground mt-0.5" />
              <p className="text-xs text-muted-foreground">{cat.note}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Main page
// ============================================================================

export default function PrivacyDataPage() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<Section>('overview');
  const [prefs, setPrefs] = useState<PrivacyPreferences | null>(null);
  const [loadingPrefs, setLoadingPrefs] = useState(true);
  const [savingPref, setSavingPref] = useState<keyof PrivacyPreferences | null>(null);

  // Export state
  const [exporting, setExporting] = useState(false);
  const [exportData, setExportData] = useState<DataExport | null>(null);

  // Delete state
  const [deleteStep, setDeleteStep] = useState<'idle' | 'confirm' | 'typing'>('idle');
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);

  const sectionRefs = {
    overview: useRef<HTMLDivElement>(null),
    preferences: useRef<HTMLDivElement>(null),
    rights: useRef<HTMLDivElement>(null),
    export: useRef<HTMLDivElement>(null),
    delete: useRef<HTMLDivElement>(null),
  };

  useEffect(() => {
    loadPrefs();
  }, []);

  const loadPrefs = async () => {
    setLoadingPrefs(true);
    try {
      const data = await getPrivacyPreferences();
      setPrefs(data);
    } catch {
      toast.error('Failed to load privacy preferences');
    } finally {
      setLoadingPrefs(false);
    }
  };

  const scrollTo = (section: Section) => {
    setActiveSection(section);
    sectionRefs[section].current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleToggle = async (key: keyof PrivacyPreferences, value: boolean) => {
    if (!prefs) return;
    const prev = prefs[key];
    setPrefs({ ...prefs, [key]: value });
    setSavingPref(key);
    try {
      const updated = await updatePrivacyPreferences({ [key]: value });
      setPrefs(updated);
      toast.success('Preference updated');
    } catch (err) {
      setPrefs({ ...prefs, [key]: prev });
      toast.error(getErrorMessage(err));
    } finally {
      setSavingPref(null);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    setExportData(null);
    try {
      const data = await exportUserData();
      setExportData(data);
      // Trigger browser download
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ssb-data-export-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Data export downloaded');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') return;
    setDeleting(true);
    try {
      await deleteAccount();
      toast.success('Account deletion initiated. You have been logged out.');
      sessionStorage.removeItem('access_token');
      document.cookie = 'ssb_logged_in=; path=/; SameSite=Lax; Max-Age=0';
      router.push('/');
    } catch (err) {
      toast.error(getErrorMessage(err));
      setDeleting(false);
    }
  };

  const NAV_ITEMS: { id: Section; label: string; icon: React.ElementType }[] = [
    { id: 'overview', label: 'Data Overview', icon: Database },
    { id: 'preferences', label: 'Preferences', icon: Shield },
    { id: 'rights', label: 'Your Rights', icon: Globe },
    { id: 'export', label: 'Download Data', icon: Download },
    { id: 'delete', label: 'Delete Account', icon: Trash2 },
  ];

  return (
    <div className="max-w-5xl space-y-6">
      {/* Page header */}
      <div className="flex items-center gap-4">
        <Link href="/app/settings" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Settings
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold tracking-tight">Privacy & Data Management</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Understand what data SSB collects, exercise your legal rights, and control how your information is used.
        </p>
      </div>

      <div className="flex gap-6 lg:gap-8">
        {/* Sticky side nav — desktop only */}
        <nav className="hidden lg:flex w-48 shrink-0 flex-col gap-1 self-start sticky top-6">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => scrollTo(id)}
              className={[
                'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-left transition-colors duration-150',
                activeSection === id
                  ? 'bg-accent text-foreground font-medium'
                  : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground',
                id === 'delete' && activeSection !== 'delete' ? 'hover:text-red-400' : '',
              ].join(' ')}
            >
              <Icon className={`h-3.5 w-3.5 shrink-0 ${id === 'delete' ? 'text-red-400' : ''}`} />
              {label}
            </button>
          ))}
        </nav>

        {/* Main content */}
        <div className="flex-1 min-w-0 space-y-8">

          {/* ── Section 1: Data Overview ─────────────────────────────── */}
          <section ref={sectionRefs.overview} className="space-y-4 scroll-mt-4">
            <div className="section-header">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted/60">
                <Database className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <div>
                <h2 className="section-title text-base">Data Overview</h2>
                <p className="section-subtitle">What SSB collects and why</p>
              </div>
            </div>

            {/* Plaid callout */}
            <div className="rounded-lg border border-violet-500/25 bg-violet-500/5 p-4">
              <div className="flex items-start gap-3">
                <Shield className="h-4 w-4 text-violet-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-violet-300">Plaid Integration — Financial Data</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    When you connect a brokerage account, SSB uses Plaid to securely access your account data.
                    <strong className="text-foreground"> SSB never receives, stores, or has access to your brokerage username or password.</strong> {' '}
                    Those credentials are entered directly into Plaid&apos;s encrypted interface and are handled exclusively by Plaid
                    under their security infrastructure. SSB only receives read-only account data (balances, holdings, transactions)
                    that you explicitly authorize during the Plaid OAuth flow.
                  </p>
                  <a
                    href="https://plaid.com/legal/privacy-statement/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 transition-colors mt-1"
                  >
                    Plaid Privacy Statement <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </div>

            {/* Data categories */}
            <div className="space-y-2">
              {DATA_CATEGORIES.map((cat) => (
                <DataCategoryCard key={cat.title} cat={cat} />
              ))}
            </div>

            {/* Third parties */}
            <div className="rounded-lg border border-border/70 bg-card p-4 elevation-1 space-y-3">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold">Third-Party Service Providers</h3>
              </div>
              <p className="text-xs text-muted-foreground">
                SSB does not sell your data. We share limited data only with the service providers below, solely to deliver the platform.
              </p>
              <div className="space-y-2">
                {THIRD_PARTIES.map((tp) => (
                  <div key={tp.name} className="flex items-start gap-3 rounded-md bg-muted/30 px-3 py-2.5">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold">{tp.name}</span>
                        <span className="text-xs text-muted-foreground">·</span>
                        <span className="text-xs text-muted-foreground">{tp.role}</span>
                        {tp.optional && (
                          <span className="badge-new">Optional</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{tp.data}</p>
                    </div>
                    {tp.link && (
                      <a
                        href={tp.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 text-xs text-muted-foreground hover:text-foreground transition-colors"
                        title={`${tp.name} Privacy Policy`}
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── Section 2: Preferences ───────────────────────────────── */}
          <section ref={sectionRefs.preferences} className="space-y-4 scroll-mt-4">
            <div className="section-header">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted/60">
                <Shield className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <div>
                <h2 className="section-title text-base">Communication & Consent Preferences</h2>
                <p className="section-subtitle">Control how SSB uses your data for optional purposes</p>
              </div>
            </div>

            <div className="rounded-lg border border-border/70 bg-card elevation-1 divide-y divide-border/50">
              {/* Marketing emails */}
              <div className="flex items-start justify-between gap-4 px-4 py-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted/60 shrink-0 mt-0.5">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <label htmlFor="marketing_emails" className="text-sm font-medium cursor-pointer">Marketing & Product Updates</label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      New features, platform announcements, and financial market insights from the SSB team.
                      You can withdraw this consent at any time.
                    </p>
                    <p className="text-[10px] text-muted-foreground/60 mt-1">Legal basis: Consent · Can be withdrawn any time</p>
                  </div>
                </div>
                <Toggle
                  id="marketing_emails"
                  checked={prefs?.marketing_emails ?? false}
                  onChange={(v) => handleToggle('marketing_emails', v)}
                  disabled={loadingPrefs || savingPref === 'marketing_emails'}
                />
              </div>

              {/* Analytics consent */}
              <div className="flex items-start justify-between gap-4 px-4 py-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted/60 shrink-0 mt-0.5">
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <label htmlFor="analytics_consent" className="text-sm font-medium cursor-pointer">Usage Analytics & Performance Tracking</label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Allow SSB to collect anonymized usage data to improve product performance and prioritize features.
                      No financial data is shared with analytics providers.
                    </p>
                    <p className="text-[10px] text-muted-foreground/60 mt-1">Legal basis: Consent · Third party: Sentry (error monitoring, anonymized)</p>
                  </div>
                </div>
                <Toggle
                  id="analytics_consent"
                  checked={prefs?.analytics_consent ?? false}
                  onChange={(v) => handleToggle('analytics_consent', v)}
                  disabled={loadingPrefs || savingPref === 'analytics_consent'}
                />
              </div>

              {/* Email notifications */}
              <div className="flex items-start justify-between gap-4 px-4 py-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted/60 shrink-0 mt-0.5">
                    <Bell className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <label htmlFor="email_notifications" className="text-sm font-medium cursor-pointer">Transactional Email Notifications</label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      System alerts, security notices, and account-related communications. Disabling this will
                      suppress non-critical alerts but you will still receive security and billing emails.
                    </p>
                    <p className="text-[10px] text-muted-foreground/60 mt-1">Legal basis: Contract · Security/billing emails always sent regardless of this setting</p>
                  </div>
                </div>
                <Toggle
                  id="email_notifications"
                  checked={prefs?.email_notifications ?? true}
                  onChange={(v) => handleToggle('email_notifications', v)}
                  disabled={loadingPrefs || savingPref === 'email_notifications'}
                />
              </div>

              {/* Trade confirmations */}
              <div className="flex items-start justify-between gap-4 px-4 py-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted/60 shrink-0 mt-0.5">
                    <Activity className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <label htmlFor="trade_confirmations" className="text-sm font-medium cursor-pointer">Trade Confirmation Emails</label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Email receipts for paper trade executions and live order fills. Useful for auditing your activity.
                    </p>
                    <p className="text-[10px] text-muted-foreground/60 mt-1">Legal basis: Contract · Requires email notifications to be enabled</p>
                  </div>
                </div>
                <Toggle
                  id="trade_confirmations"
                  checked={prefs?.trade_confirmations ?? true}
                  onChange={(v) => handleToggle('trade_confirmations', v)}
                  disabled={loadingPrefs || savingPref === 'trade_confirmations' || prefs?.email_notifications === false}
                />
              </div>
            </div>

            {loadingPrefs && (
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <RefreshCw className="h-3 w-3 animate-spin" /> Loading preferences…
              </p>
            )}

            <p className="text-xs text-muted-foreground">
              Additional notification preferences (price alerts, portfolio digests, signal alerts) are available in{' '}
              <Link href="/app/settings" className="text-foreground underline underline-offset-2 hover:no-underline">
                Account Settings → Notifications
              </Link>.
            </p>
          </section>

          {/* ── Section 3: Your Rights ───────────────────────────────── */}
          <section ref={sectionRefs.rights} className="space-y-4 scroll-mt-4">
            <div className="section-header">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted/60">
                <Globe className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <div>
                <h2 className="section-title text-base">Your Privacy Rights</h2>
                <p className="section-subtitle">GDPR, CCPA, and applicable state privacy laws</p>
              </div>
            </div>

            <div className="rounded-lg border border-border/70 bg-card p-4 elevation-1">
              <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                Depending on your location, you may have rights under the EU General Data Protection Regulation (GDPR),
                California Consumer Privacy Act (CCPA/CPRA), and equivalent state privacy laws (Virginia VCDPA,
                Colorado CPA, Connecticut CTDPA). SSB honors these rights for all users regardless of location.
              </p>
              <div className="space-y-2">
                {USER_RIGHTS.map((right) => {
                  const Icon = right.icon;
                  return (
                    <div key={right.title} className="flex items-start gap-3 rounded-md border border-border/50 bg-muted/20 px-3 py-3">
                      <Icon className="h-4 w-4 shrink-0 text-muted-foreground mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold">{right.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{right.desc}</p>
                      </div>
                      {right.action && (
                        <button
                          onClick={() => scrollTo(right.action!)}
                          className="shrink-0 text-xs font-medium text-foreground/70 hover:text-foreground transition-colors flex items-center gap-1"
                        >
                          {right.actionLabel}
                          <ChevronRight className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Contact */}
            <div className="rounded-lg border border-border/50 bg-muted/20 p-4 space-y-2">
              <p className="text-xs font-semibold">Exercise Your Rights or Ask a Question</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                To submit a data subject request, withdraw consent, or ask about our data practices, email us at{' '}
                <a href="mailto:privacy@smartstrategiesbuilder.com" className="text-foreground underline underline-offset-2 hover:no-underline">
                  privacy@smartstrategiesbuilder.com
                </a>.
                We will respond within 30 days (or sooner as required by law) and may ask you to verify your identity
                before processing the request.
              </p>
              <p className="text-xs text-muted-foreground">
                Full privacy policy:{' '}
                <Link href="/privacy" target="_blank" className="text-foreground underline underline-offset-2 hover:no-underline inline-flex items-center gap-0.5">
                  smartstrategiesbuilder.com/privacy <ExternalLink className="h-2.5 w-2.5" />
                </Link>
              </p>
            </div>
          </section>

          {/* ── Section 4: Download Data ─────────────────────────────── */}
          <section ref={sectionRefs.export} className="space-y-4 scroll-mt-4">
            <div className="section-header">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted/60">
                <Download className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <div>
                <h2 className="section-title text-base">Download Your Data</h2>
                <p className="section-subtitle">GDPR Article 20 — Right to Data Portability</p>
              </div>
            </div>

            <div className="rounded-lg border border-border/70 bg-card p-5 elevation-1 space-y-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Download a complete machine-readable archive of all personal data SSB holds about you.
                The export is generated in real-time and delivered as a JSON file directly in your browser.
              </p>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {[
                  { icon: Users, label: 'Account profile and preferences' },
                  { icon: Lock, label: 'Security settings (MFA status, session count)' },
                  { icon: Activity, label: 'Login history and active sessions' },
                  { icon: Clock, label: 'Last 1,000 audit log entries' },
                  { icon: Shield, label: 'Privacy consent records' },
                  { icon: FileJson, label: 'JSON format — structured and portable' },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                    {label}
                  </div>
                ))}
              </div>

              <div className="flex items-start gap-2 rounded-md bg-muted/40 p-3">
                <Info className="h-3.5 w-3.5 shrink-0 text-muted-foreground mt-0.5" />
                <p className="text-xs text-muted-foreground">
                  Password hashes, MFA secrets, and raw session tokens are never included in exports.
                  Financial data (Plaid holdings, transactions) is held by your brokerage institution —
                  use your brokerage&apos;s own data export tools for that data.
                </p>
              </div>

              {exportData && (
                <div className="flex items-center gap-2 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <div className="text-xs">
                    <span className="font-medium text-emerald-300">Export downloaded.</span>
                    <span className="text-muted-foreground ml-1">
                      Generated {new Date(exportData.export_metadata.exported_at).toLocaleString()} · {exportData.audit_logs.length} audit log entries · {exportData.sessions.length} sessions included.
                    </span>
                  </div>
                </div>
              )}

              <Button
                onClick={handleExport}
                disabled={exporting}
                variant="outline"
                className="gap-2"
              >
                {exporting
                  ? <><RefreshCw className="h-4 w-4 animate-spin" /> Generating export…</>
                  : <><Download className="h-4 w-4" /> Download My Data (JSON)</>
                }
              </Button>
            </div>
          </section>

          {/* ── Section 5: Delete Account ─────────────────────────────── */}
          <section ref={sectionRefs.delete} className="space-y-4 scroll-mt-4">
            <div className="section-header">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-500/10">
                <Trash2 className="h-3.5 w-3.5 text-red-400" />
              </div>
              <div>
                <h2 className="section-title text-base text-red-400">Delete Account</h2>
                <p className="section-subtitle">GDPR Article 17 — Right to Erasure</p>
              </div>
            </div>

            <div className="rounded-lg border border-red-500/25 bg-red-500/5 p-5 space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">What happens when you delete your account:</p>
                <div className="space-y-1.5">
                  {[
                    'Your account is immediately marked as deleted — you cannot log in',
                    'All active sessions are revoked and you are signed out everywhere',
                    'Your email, name, and personal identifiers are anonymized within seconds',
                    'All privacy preferences and profile data are cleared',
                    'Connected Plaid accounts are removed and their data is deleted',
                    'Audit logs are retained for regulatory compliance but all PII is anonymized',
                    'Billing records are retained for 7 years per financial regulations, then purged',
                    'This action is irreversible — there is no recovery or grace period',
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-red-400/70 mt-0.5" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-start gap-2 rounded-md bg-muted/40 p-3">
                <Info className="h-3.5 w-3.5 shrink-0 text-muted-foreground mt-0.5" />
                <p className="text-xs text-muted-foreground">
                  If you only want to stop using SSB temporarily, you don&apos;t need to delete your account —
                  simply log out and don&apos;t log back in. Your data will remain accessible when you return.
                  For a complete takeout first, use the{' '}
                  <button onClick={() => scrollTo('export')} className="underline underline-offset-2 hover:no-underline">
                    Download Your Data
                  </button>{' '}
                  section above.
                </p>
              </div>

              {deleteStep === 'idle' && (
                <Button
                  variant="outline"
                  onClick={() => setDeleteStep('confirm')}
                  className="gap-2 border-red-500/40 text-red-400 hover:bg-red-500/10 hover:border-red-500/60 hover:text-red-300"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete My Account
                </Button>
              )}

              {deleteStep === 'confirm' && (
                <div className="space-y-3 rounded-lg border border-red-500/30 bg-red-500/5 p-4">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-400 shrink-0" />
                    <p className="text-sm font-semibold text-red-300">Are you sure?</p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    This will permanently delete your account and cannot be undone. Before continuing,
                    consider downloading your data using the export tool above.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeleteStep('idle')}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => setDeleteStep('typing')}
                      className="border-red-500/40 bg-red-500/15 text-red-300 hover:bg-red-500/25 hover:text-red-200"
                    >
                      Yes, continue to deletion
                    </Button>
                  </div>
                </div>
              )}

              {deleteStep === 'typing' && (
                <div className="space-y-3 rounded-lg border border-red-500/40 bg-red-500/8 p-4">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-400 shrink-0" />
                    <p className="text-sm font-semibold text-red-300">Final confirmation required</p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Type <strong className="text-foreground font-mono">DELETE</strong> in all caps to confirm
                    permanent account deletion. This is your last chance to cancel.
                  </p>
                  <Input
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    placeholder="Type DELETE to confirm"
                    className="font-mono border-red-500/30 focus-visible:ring-red-500/50 max-w-xs"
                    autoComplete="off"
                    spellCheck={false}
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => { setDeleteStep('idle'); setDeleteConfirmText(''); }}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      disabled={deleteConfirmText !== 'DELETE' || deleting}
                      onClick={handleDeleteAccount}
                      className="border-red-600 bg-red-600 text-white hover:bg-red-700 disabled:opacity-40"
                    >
                      {deleting
                        ? <><RefreshCw className="h-3.5 w-3.5 animate-spin mr-1.5" /> Deleting…</>
                        : <><Trash2 className="h-3.5 w-3.5 mr-1.5" /> Permanently Delete Account</>
                      }
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
