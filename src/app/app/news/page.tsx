'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Newspaper,
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw,
  AlertTriangle,
  Search,
  Filter,
  Clock,
  Tag,
  ExternalLink,
  Lock,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  listNewsArticles,
  getMarketSummary,
  type NewsArticle,
  type NewsListResponse,
  type MarketSummaryResponse,
  type NewsCategory,
  type NewsSentiment,
} from '@/lib/api/news';
import { getErrorMessage } from '@/lib/api-client';

const CATEGORY_LABELS: Record<NewsCategory, string> = {
  market_overview: 'Market Overview',
  earnings: 'Earnings',
  economic: 'Economic',
  sector: 'Sector',
  company: 'Company',
  crypto: 'Crypto',
  commodities: 'Commodities',
  forex: 'Forex',
  regulatory: 'Regulatory',
  breaking: 'Breaking',
};

const SENTIMENT_CONFIG: Record<NewsSentiment, { label: string; color: string; icon: any }> = {
  bullish: { label: 'Bullish', color: 'text-green-600 bg-green-100', icon: TrendingUp },
  bearish: { label: 'Bearish', color: 'text-red-600 bg-red-100', icon: TrendingDown },
  neutral: { label: 'Neutral', color: 'text-gray-600 bg-gray-100', icon: Minus },
};

export default function NewsPage() {
  const router = useRouter();
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [dataSource, setDataSource] = useState<'live' | 'seeded' | null>(null);
  const [summary, setSummary] = useState<MarketSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<NewsCategory | ''>('');
  const [selectedSentiment, setSelectedSentiment] = useState<NewsSentiment | ''>('');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const pageSize = 10;

  const fetchNews = async (resetPage = false) => {
    const currentPage = resetPage ? 1 : page;
    if (resetPage) setPage(1);

    setLoading(true);
    setError(null);
    try {
      const response = await listNewsArticles({
        categories: selectedCategory ? [selectedCategory] : undefined,
        sentiment: selectedSentiment || undefined,
        search: searchQuery || undefined,
        page: currentPage,
        page_size: pageSize,
      });
      setArticles(response.articles);
      setTotalCount(response.total_count);
      setHasMore(response.has_more);
      setDataSource(response.data_source ?? 'live');
    } catch (err: any) {
      const status = err?.response?.status;
      const message = getErrorMessage(err);

      if (status === 401 || status === 403) {
        toast.error('Please sign in to continue');
        router.push('/auth/login');
        return;
      }

      setError(message || 'Failed to load news');
      toast.error(message || 'Failed to load news');
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    setSummaryLoading(true);
    try {
      const response = await getMarketSummary();
      setSummary(response);
    } catch (err: any) {
      // Non-critical; don't block page render
      console.warn('Failed to load market summary:', err);
    } finally {
      setSummaryLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
    fetchSummary();
  }, []);

  useEffect(() => {
    fetchNews(true);
  }, [selectedCategory, selectedSentiment]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchNews(true);
  };

  const formatDate = (dateString: string) => {
    // Backend sends naive UTC datetimes without a timezone suffix.
    // Append 'Z' so the browser parses them as UTC instead of local time,
    // which would otherwise produce negative diffs (e.g. "-300m ago").
    const normalized =
      dateString.endsWith('Z') || dateString.includes('+')
        ? dateString
        : dateString + 'Z';
    const date = new Date(normalized);
    const now = new Date();
    // Clamp to 0 to absorb minor clock skew between server and client
    const diffMs = Math.max(0, now.getTime() - date.getTime());
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getSentimentIcon = (sentiment: NewsSentiment) => {
    const config = SENTIMENT_CONFIG[sentiment];
    const Icon = config.icon;
    return <Icon className="h-3 w-3" />;
  };

  if (error && articles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <AlertTriangle className="h-12 w-12 text-destructive" />
        <h2 className="text-xl font-semibold">Failed to Load News</h2>
        <p className="text-muted-foreground text-center max-w-md">{error}</p>
        <Button onClick={() => fetchNews()} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Market News</h1>
          <p className="text-muted-foreground mt-1">
            Stay informed with the latest market intelligence
          </p>
        </div>
        <Button onClick={() => { fetchNews(); fetchSummary(); }} variant="outline" size="sm" className="gap-2">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>


      {/* Market Summary Card */}
      {!summaryLoading && summary && (
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Newspaper className="h-5 w-5 text-primary" />
            <h2 className="font-semibold">Daily Market Summary</h2>
            {summary.is_delayed && (
              <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded">
                {summary.delay_minutes}min delay
              </span>
            )}
          </div>
          <p className="text-lg font-medium mb-2">{summary.summary.headline}</p>
          <p className="text-sm text-muted-foreground mb-4">{summary.summary.overview}</p>

          {/* Key Events */}
          {summary.summary.key_events.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-medium mb-2">Key Events</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                {summary.summary.key_events.slice(0, 3).map((event, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    {event}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Top Movers */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium mb-2 text-green-600">Top Gainers</h3>
              <div className="space-y-1">
                {summary.summary.top_gainers.slice(0, 3).map((mover) => (
                  <div key={mover.symbol} className="flex justify-between text-sm">
                    <span className="font-medium">{mover.symbol}</span>
                    <span className="text-green-600">+{mover.change_percent.toFixed(2)}%</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium mb-2 text-red-600">Top Losers</h3>
              <div className="space-y-1">
                {summary.summary.top_losers.slice(0, 3).map((mover) => (
                  <div key={mover.symbol} className="flex justify-between text-sm">
                    <span className="font-medium">{mover.symbol}</span>
                    <span className="text-red-600">{mover.change_percent.toFixed(2)}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search news..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button type="submit" variant="outline">
            Search
          </Button>
        </form>

        <div className="flex gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as NewsCategory | '')}
            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">All Categories</option>
            {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>

          <select
            value={selectedSentiment}
            onChange={(e) => setSelectedSentiment(e.target.value as NewsSentiment | '')}
            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">All Sentiment</option>
            <option value="bullish">Bullish</option>
            <option value="neutral">Neutral</option>
            <option value="bearish">Bearish</option>
          </select>
        </div>
      </div>

      {/* News List */}
      {loading && articles.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[200px] gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Loading news...</p>
        </div>
      ) : articles.length === 0 ? (
        <div className="text-center py-12">
          <Newspaper className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No news articles found</p>
          <p className="text-sm text-muted-foreground mt-1">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="space-y-4">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} formatDate={formatDate} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalCount > 0 && (
        <div className="flex items-center justify-between pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            Showing {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, totalCount)} of {totalCount}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setPage(p => p - 1); fetchNews(); }}
              disabled={page === 1 || loading}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setPage(p => p + 1); fetchNews(); }}
              disabled={!hasMore || loading}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="rounded-lg bg-amber-50 border border-amber-300 p-4 text-sm text-slate-800">
        <strong>Disclaimer:</strong> News content is for informational and educational purposes only.
        It does not constitute investment advice or recommendations. Always do your own research.
      </div>
    </div>
  );
}

function ArticleCard({
  article,
  formatDate,
}: {
  article: NewsArticle;
  formatDate: (date: string) => string;
}) {
  const [expanded, setExpanded] = useState(false);
  const sentimentConfig = SENTIMENT_CONFIG[article.sentiment];
  const SentimentIcon = sentimentConfig.icon;

  return (
    <div className="rounded-lg border bg-card p-4 hover:border-primary/50 transition-colors">
      <div className="flex items-start gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded capitalize">
              {CATEGORY_LABELS[article.category] || article.category}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded flex items-center gap-1 ${sentimentConfig.color}`}>
              <SentimentIcon className="h-3 w-3" />
              {sentimentConfig.label}
            </span>
            {article.is_premium && (
              <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded flex items-center gap-1">
                <Lock className="h-3 w-3" />
                Premium
              </span>
            )}
            {article.priority === 'breaking' && (
              <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded animate-pulse">
                Breaking
              </span>
            )}
          </div>

          <h3 className="font-semibold mb-1">{article.headline}</h3>
          <p className="text-sm text-muted-foreground mb-2">{article.summary}</p>

          {expanded && article.content && (
            <div className="text-sm text-muted-foreground mb-2 whitespace-pre-wrap border-t pt-2 mt-2">
              {article.content}
            </div>
          )}

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDate(article.published_at)}
            </span>
            {article.symbols.length > 0 && (
              <span className="flex items-center gap-1">
                <Tag className="h-3 w-3" />
                {article.symbols.slice(0, 3).join(', ')}
                {article.symbols.length > 3 && ` +${article.symbols.length - 3}`}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {article.content && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? 'Show less' : 'Read more'}
            </Button>
          )}
          {article.source_url && (
            <Button variant="ghost" size="sm" asChild>
              <a href={article.source_url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
