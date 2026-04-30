'use client';

import { useState } from 'react';
import { Copy, Check, Key, Zap, Shield, BarChart2, BookOpen } from 'lucide-react';

const BASE_URL = 'https://api.smartstrategiesbuilder.ai/api/v1';

const SCOPES = [
  {
    key: 'portfolio:read',
    label: 'portfolio:read',
    description: 'Read broker connections, real portfolio holdings, P&L, sector allocations, wash-sale scan, and benchmarks.',
    endpoints: [
      'GET /brokers',
      'GET /brokers/portfolio-summary',
      'GET /brokers/wash-sale-scan',
      'GET /brokers/{id}/holdings',
      'GET /brokers/{id}/balances',
      'GET /portfolio/benchmarks',
      'POST /portfolio/benchmarks',
      'GET /portfolio/benchmark-comparison/{id}',
      'GET /portfolio/real-vs-paper',
    ],
  },
  {
    key: 'trades:write',
    label: 'trades:write',
    description: 'Read and write paper trading accounts, orders, and positions. Import real portfolio into paper account.',
    endpoints: [
      'GET /paper/account',
      'POST /paper/account',
      'POST /paper/account/reset',
      'POST /paper/orders',
      'GET /paper/orders',
      'DELETE /paper/orders/{id}',
      'GET /paper/positions',
      'GET /paper/performance',
      'POST /paper/import-portfolio',
    ],
  },
  {
    key: 'analytics:read',
    label: 'analytics:read',
    description: 'Access advanced portfolio analytics: attribution, rebalancing, stress tests, tax-loss harvesting, and correlation.',
    endpoints: [
      'GET /portfolio/attribution',
      'GET /portfolio/rebalance',
      'POST /portfolio/stress-test',
      'GET /portfolio/tax-loss-opportunities',
      'GET /portfolio/correlation',
    ],
  },
  {
    key: 'market_data:read',
    label: 'market_data:read',
    description: 'Access news, market summaries, regime analysis, portfolio risk, technical analysis, and advanced analytics.',
    endpoints: [
      'GET /news',
      'GET /news/{id}',
      'GET /news/summary/daily',
      'POST /analytics/optimize',
      'POST /analytics/technical',
      'POST /analytics/factors',
      'POST /analytics/simulate',
      'POST /analytics/dcf',
      'GET /intelligence/regime',
      'POST /intelligence/risk',
      'POST /intelligence/stress-test',
    ],
  },
  {
    key: 'webhooks:manage',
    label: 'webhooks:manage',
    description: 'Create, list, update, and delete webhook subscriptions. View delivery history.',
    endpoints: [
      'POST /enterprise/webhooks',
      'GET /enterprise/webhooks',
      'PATCH /enterprise/webhooks/{id}',
      'DELETE /enterprise/webhooks/{id}',
      'GET /enterprise/webhooks/{id}/deliveries',
    ],
  },
  {
    key: 'full_access',
    label: 'full_access',
    description: 'Grants all scopes above. Equivalent to having every scope on the key.',
    endpoints: ['All endpoints'],
  },
];

const CODE_EXAMPLES = {
  curl: (apiKey: string) => `# List portfolio summary
curl -H "X-API-Key: ${apiKey}" \\
  ${BASE_URL}/brokers/portfolio-summary

# Or use Authorization header
curl -H "Authorization: Bearer ${apiKey}" \\
  ${BASE_URL}/brokers/portfolio-summary`,

  python: (apiKey: string) => `import requests

BASE_URL = "${BASE_URL}"
headers = {"X-API-Key": "${apiKey}"}

# Portfolio summary
resp = requests.get(f"{BASE_URL}/brokers/portfolio-summary", headers=headers)
summary = resp.json()
print(f"Total value: ${'{'}summary['total_value']{'}'}")

# Run technical analysis
resp = requests.post(
    f"{BASE_URL}/analytics/technical",
    headers=headers,
    json={"symbol": "AAPL", "lookback_days": 90},
)
analysis = resp.json()
print(f"Trend bias: {'{'}analysis['trend_bias']{'}'}")`,

  javascript: (apiKey: string) => `const BASE_URL = "${BASE_URL}";
const headers = { "X-API-Key": "${apiKey}" };

// Portfolio summary
const summaryRes = await fetch(\`\${BASE_URL}/brokers/portfolio-summary\`, { headers });
const summary = await summaryRes.json();
console.log("Total value:", summary.total_value);

// Place paper trade
const orderRes = await fetch(\`\${BASE_URL}/paper/orders\`, {
  method: "POST",
  headers: { ...headers, "Content-Type": "application/json" },
  body: JSON.stringify({ symbol: "AAPL", side: "buy", qty: 10, order_type: "market" }),
});
const order = await orderRes.json();
console.log("Order:", order.id);`,
};

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <button
      onClick={handleCopy}
      className="p-1.5 rounded hover:bg-muted text-muted-foreground transition-colors"
      title="Copy"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
}

type Lang = 'curl' | 'python' | 'javascript';

export default function APIDocsPage() {
  const [lang, setLang] = useState<Lang>('curl');
  const [demoKey] = useState('ssb_live_your_api_key_here');

  const code = CODE_EXAMPLES[lang](demoKey);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold">API Reference</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Institutional API access for programmatic integration. Base URL:{' '}
          <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">{BASE_URL}</code>
        </p>
      </div>

      {/* Authentication */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Key className="h-4 w-4 text-primary" />
          <h2 className="font-semibold">Authentication</h2>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 space-y-3 text-sm">
          <p>Pass your API key using either method:</p>
          <div className="space-y-2">
            <div className="rounded-lg bg-muted px-3 py-2 font-mono text-xs">
              X-API-Key: ssb_live_...
            </div>
            <div className="rounded-lg bg-muted px-3 py-2 font-mono text-xs">
              Authorization: Bearer ssb_live_...
            </div>
          </div>
          <p className="text-muted-foreground text-xs">
            Keys are prefixed with <code className="bg-muted px-1 rounded">ssb_live_</code>.
            Raw key values are only shown once at creation — store them securely.
          </p>
        </div>
      </section>

      {/* Rate Limits */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-primary" />
          <h2 className="font-semibold">Rate Limits</h2>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-sm space-y-3">
          <p>Rate limits are enforced per API key using a sliding 1-minute window.</p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left pb-2 font-medium">Plan</th>
                  <th className="text-left pb-2 font-medium">Default Rate Limit</th>
                  <th className="text-left pb-2 font-medium">Max Keys</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr><td className="py-2">Pro</td><td>60 req/min</td><td>3</td></tr>
                <tr><td className="py-2">Institutional</td><td>120 req/min</td><td>10</td></tr>
                <tr><td className="py-2">Founder</td><td>120 req/min</td><td>10</td></tr>
              </tbody>
            </table>
          </div>
          <p className="text-muted-foreground text-xs">
            When exceeded, the API returns <code className="bg-muted px-1 rounded">429 Too Many Requests</code> with a{' '}
            <code className="bg-muted px-1 rounded">Retry-After: 60</code> header.
            Custom limits can be set per key at creation time.
          </p>
        </div>
      </section>

      {/* Scopes */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-primary" />
          <h2 className="font-semibold">Scopes</h2>
        </div>
        <div className="space-y-3">
          {SCOPES.map((scope) => (
            <div key={scope.key} className="rounded-xl border border-border bg-card p-4 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <code className="text-xs bg-primary/10 text-primary px-2 py-1 rounded font-mono">{scope.label}</code>
              </div>
              <p className="text-sm text-muted-foreground">{scope.description}</p>
              <details className="group">
                <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground list-none flex items-center gap-1">
                  <span className="group-open:hidden">Show endpoints ({scope.endpoints.length})</span>
                  <span className="hidden group-open:inline">Hide endpoints</span>
                </summary>
                <div className="mt-2 grid gap-1 sm:grid-cols-2">
                  {scope.endpoints.map((ep) => (
                    <code key={ep} className="text-xs bg-muted px-2 py-1 rounded font-mono text-foreground/80">{ep}</code>
                  ))}
                </div>
              </details>
            </div>
          ))}
        </div>
      </section>

      {/* Code Examples */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-primary" />
          <h2 className="font-semibold">Code Examples</h2>
        </div>
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="flex items-center justify-between border-b border-border px-4 py-2">
            <div className="flex gap-1">
              {(['curl', 'python', 'javascript'] as Lang[]).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`px-3 py-1 text-xs rounded-md transition-colors ${
                    lang === l
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  {l === 'javascript' ? 'JavaScript' : l === 'python' ? 'Python' : 'cURL'}
                </button>
              ))}
            </div>
            <CopyButton text={code} />
          </div>
          <pre className="p-4 text-xs font-mono overflow-x-auto leading-relaxed text-foreground/90 bg-muted/30">
            {code}
          </pre>
        </div>
      </section>

      {/* IP Allowlist */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <BarChart2 className="h-4 w-4 text-primary" />
          <h2 className="font-semibold">IP Allowlist</h2>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-sm space-y-2">
          <p>Restrict a key to specific IPs or CIDR ranges at creation time.</p>
          <div className="rounded-lg bg-muted px-3 py-2 font-mono text-xs space-y-1">
            <div># Single IP</div>
            <div>{`"allowed_ips": ["203.0.113.42"]`}</div>
            <div className="mt-1"># CIDR range</div>
            <div>{`"allowed_ips": ["10.0.0.0/8"]`}</div>
          </div>
          <p className="text-xs text-muted-foreground">
            Leave empty to allow requests from any IP. Requests from unlisted IPs receive{' '}
            <code className="bg-muted px-1 rounded">403 Forbidden</code>.
          </p>
        </div>
      </section>

      {/* Error Codes */}
      <section className="space-y-3">
        <h2 className="font-semibold">Error Codes</h2>
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-2.5 text-xs font-medium">Status</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium">Meaning</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-xs">
              <tr><td className="px-4 py-2.5 font-mono">401</td><td className="px-4 py-2.5 text-muted-foreground">Missing or invalid API key</td></tr>
              <tr><td className="px-4 py-2.5 font-mono">403</td><td className="px-4 py-2.5 text-muted-foreground">Key lacks required scope, or IP not allowed</td></tr>
              <tr><td className="px-4 py-2.5 font-mono">404</td><td className="px-4 py-2.5 text-muted-foreground">Resource not found</td></tr>
              <tr><td className="px-4 py-2.5 font-mono">422</td><td className="px-4 py-2.5 text-muted-foreground">Validation error — check request body</td></tr>
              <tr><td className="px-4 py-2.5 font-mono">429</td><td className="px-4 py-2.5 text-muted-foreground">Rate limit exceeded — retry after 60s</td></tr>
              <tr><td className="px-4 py-2.5 font-mono">500</td><td className="px-4 py-2.5 text-muted-foreground">Internal server error</td></tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
