/**
 * Local Rule-Based Assistant v2
 *
 * Enhanced assistant with:
 * - Query normalization (synonyms, aliases)
 * - Intent detection (definition, how_to, troubleshoot, fallback)
 * - Page-aware context (scoped responses)
 * - Response templates per intent
 * - No external API calls - all processing is local
 */

import {
  KB_ENTRIES,
  GLOSSARY,
  SAFETY_PATTERNS,
  SAFETY_RESPONSE,
  DISCLAIMER,
  PAGE_PROMPTS,
  normalizeQuery,
  detectIntent,
  getPagePrompts,
  type KBEntry,
  type Intent,
  type PageScope,
} from './knowledge-base';

// =============================================================================
// Types
// =============================================================================

export interface AssistantContext {
  /** Current page path (e.g., '/app/paper', '/app/risk') */
  page?: string;
  /** Selected position symbol */
  selectedSymbol?: string;
  /** Current account balance */
  accountBalance?: number;
  /** User's subscription tier */
  tier?: 'free' | 'starter' | 'pro' | 'institutional' | 'founder' | 'full_access';
  /** Whether Scenario Mode is currently active */
  isScenarioMode?: boolean;
}

export interface AssistantResponse {
  reply: string;
  topicId: string | null;
  matchedTopic?: string;
  intent: Intent;
  relatedTopics: string[];
  suggestions: string[];
  disclaimer: string;
}

interface KBMatch {
  entryId: string;
  score: number;
  entry: KBEntry;
  pageBoost: boolean;
}

// =============================================================================
// Page Scope Detection
// =============================================================================

function detectPageScope(path?: string): PageScope {
  if (!path) return 'global';

  const pathLower = path.toLowerCase();

  if (pathLower.includes('/paper')) return 'paper';
  if (pathLower.includes('/backtest')) return 'backtest';
  if (pathLower.includes('/risk')) return 'risk';
  if (pathLower.includes('/regime')) return 'regime';
  if (pathLower.includes('/stress')) return 'stress';
  if (pathLower.includes('/settings')) return 'settings';
  if (pathLower.includes('/billing')) return 'billing';
  if (pathLower.includes('/audit')) return 'audit';
  if (pathLower.includes('/portfolio')) return 'portfolio';
  if (pathLower.includes('/options')) return 'options';
  if (pathLower.includes('/learn')) return 'learn';
  if (pathLower.includes('/enterprise')) return 'enterprise';
  if (pathLower.includes('/dashboard') || pathLower === '/app') return 'dashboard';

  return 'global';
}

// =============================================================================
// Keyword Matching
// =============================================================================

/**
 * Simple Levenshtein distance for fuzzy matching
 */
function levenshteinDistance(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Match query against knowledge base entries.
 * Returns scored matches, boosted by page relevance.
 */
function matchKBEntries(
  normalizedQuery: string,
  pageScope: PageScope
): KBMatch[] {
  const words = normalizedQuery.split(/\s+/).filter(w => w.length > 1);
  const matches: KBMatch[] = [];

  for (const [entryId, entry] of Object.entries(KB_ENTRIES)) {
    let score = 0;
    const pageBoost = entry.pageScopes.includes(pageScope) ||
                      entry.pageScopes.includes('global');

    // Check keywords
    for (const keyword of entry.keywords) {
      const keywordLower = keyword.toLowerCase();

      // Exact word match (highest score)
      if (words.includes(keywordLower)) {
        score += 15;
      }
      // Contains keyword (partial match)
      else if (normalizedQuery.includes(keywordLower)) {
        score += 10;
      }
      // Fuzzy match for typos (lower score)
      else if (words.some(word =>
        word.length > 3 && levenshteinDistance(word, keywordLower) <= 2
      )) {
        score += 5;
      }
    }

    // Check aliases
    if (entry.aliases) {
      for (const alias of entry.aliases) {
        if (normalizedQuery.includes(alias.toLowerCase())) {
          score += 12;
        }
      }
    }

    // Boost for title match
    if (normalizedQuery.includes(entry.title.toLowerCase())) {
      score += 20;
    }

    // Page relevance boost
    if (pageBoost && score > 0) {
      score = Math.round(score * 1.5);
    }

    if (score > 0) {
      matches.push({ entryId, score, entry, pageBoost });
    }
  }

  // Sort by score descending
  return matches.sort((a, b) => b.score - a.score);
}

// =============================================================================
// Glossary Lookup
// =============================================================================

function findGlossaryTerms(query: string): string | null {
  const queryLower = query.toLowerCase();
  const matchedTerms = GLOSSARY.filter(term => {
    // Check main term
    if (queryLower.includes(term.term.toLowerCase())) return true;
    // Check aliases
    if (term.aliases?.some(alias => queryLower.includes(alias.toLowerCase()))) {
      return true;
    }
    return false;
  });

  if (matchedTerms.length === 0) return null;

  const definitions = matchedTerms.map(t =>
    `**${t.term}**: ${t.definition}`
  ).join('\n\n');

  return `Here are the definitions:\n\n${definitions}`;
}

// =============================================================================
// Safety Check
// =============================================================================

function isSafetyTriggered(message: string): boolean {
  return SAFETY_PATTERNS.some(pattern => pattern.test(message));
}

// =============================================================================
// Response Templates by Intent
// =============================================================================

function formatDefinitionResponse(entry: KBEntry): string {
  return entry.content.definition;
}

function formatHowToResponse(entry: KBEntry): string {
  if (entry.content.how_to) {
    return entry.content.how_to;
  }
  // Fall back to definition with a note
  return entry.content.definition + '\n\n*For step-by-step instructions, try asking "How do I..." with a specific action.*';
}

function formatTroubleshootResponse(entry: KBEntry): string {
  if (entry.content.troubleshoot) {
    return entry.content.troubleshoot;
  }
  // Fall back with general troubleshooting advice
  return `**Troubleshooting ${entry.title}:**

If you're experiencing issues, try these general steps:
1. Refresh the page
2. Check your internet connection
3. Verify you have the required subscription tier
4. Clear browser cache and try again

If the issue persists, check the Help documentation or contact support.

---

${entry.content.definition}`;
}

function formatResponseByIntent(entry: KBEntry, intent: Intent): string {
  switch (intent) {
    case 'how_to':
      return formatHowToResponse(entry);
    case 'troubleshoot':
      return formatTroubleshootResponse(entry);
    case 'definition':
    default:
      return formatDefinitionResponse(entry);
  }
}

// =============================================================================
// Tier & Context Helpers
// =============================================================================

/**
 * IDs of KB entries where tier context is meaningful to surface.
 */
const TIER_RELEVANT_ENTRIES = new Set([
  'market_regime',
  'regime_indicators',
  'scenario_mode',
  'risk_analytics',
  'stress_testing',
  'entitlements',
  'portfolio_health',
  'correlation_analysis',
  'long_term_insights',
  'view_mode',
  'options_overview',
  'options_chain',
  'learn_feature',
  'api_keys',
]);

/**
 * Returns a brief, factual note about the user's current tier capabilities.
 * Appended to responses for tier-relevant topics.
 */
function buildTierNote(tier?: AssistantContext['tier'], entryId?: string): string {
  if (!tier || !entryId || !TIER_RELEVANT_ENTRIES.has(entryId)) return '';

  switch (tier) {
    case 'founder':
    case 'full_access':
      return '\n\n*Your plan provides full access to all platform features, including real-time data, correlation analysis, portfolio health, all Scenario Mode capabilities, all options features, all learning modules, and full API access.*';
    case 'institutional':
      return '\n\n*Your Institutional plan includes real-time data, correlation analysis, portfolio health, full Scenario Mode, unlimited options contracts, all learning modules, and full API access including webhooks.*';
    case 'pro':
      return '\n\n*Your Pro plan includes real-time regime insights, stress testing, portfolio health, all chart overlays, Scenario Mode with baseline comparison, options chain viewer + paper trading (up to 50 contracts), all learning modules, and API key access.*';
    case 'starter':
      return '\n\n*Your Starter plan includes expanded paper trading limits, Scenario Mode with up to 3 overrides and baseline comparison, and Options Chain Viewer (view-only).*';
    case 'free':
      return '\n\n*Some features shown above require a higher-tier plan. Visit Billing to explore upgrade options.*';
    default:
      return '';
  }
}

/**
 * Returns a contextual note when Scenario Mode is active on the regime page.
 */
function buildScenarioModeNote(isScenarioMode: boolean, pageScope: PageScope): string {
  if (!isScenarioMode || pageScope !== 'regime') return '';
  return '\n\n*Note: Scenario Mode is currently active. The regime classification shown on-screen reflects your overridden indicator values, not live market data. Disable Scenario Mode to return to live analysis.*';
}

// =============================================================================
// Response Generation
// =============================================================================

function generateGreeting(pageScope: PageScope): AssistantResponse {
  const prompts = getPagePrompts(pageScope);

  let contextLine = '';
  if (pageScope !== 'global') {
    contextLine = `\nI see you're on the **${pageScope}** page. `;
  }

  return {
    reply: `Hello! I'm the SSB Assistant.${contextLine}I can help you learn about:

- **Market Analysis**: Regime detection, trend analysis
- **Risk Metrics**: VaR, volatility, drawdown, stress testing
- **Platform Features**: Backtesting, paper trading, options, learning paths
- **API & Enterprise**: API keys, scopes, rate limits, webhooks
- **Investment Concepts**: Strategies, terminology, best practices

What would you like to know?`,
    topicId: null,
    intent: 'fallback',
    relatedTopics: ['what_is_ssb', 'risk_analytics', 'paper_trading'],
    suggestions: prompts,
    disclaimer: DISCLAIMER,
  };
}

function generateFallback(pageScope: PageScope): AssistantResponse {
  const prompts = getPagePrompts(pageScope);

  return {
    reply: `I couldn't find a specific answer for that. Here are some things I can help with:

${prompts.map(p => `- "${p}"`).join('\n')}

Try rephrasing your question, or ask about one of these topics.`,
    topicId: null,
    intent: 'fallback',
    relatedTopics: ['what_is_ssb', 'paper_trading', 'risk_analytics'],
    suggestions: prompts,
    disclaimer: DISCLAIMER,
  };
}

function formatFullResponse(
  entry: KBEntry,
  intent: Intent,
  matches: KBMatch[],
  pageScope: PageScope,
  context?: AssistantContext
): AssistantResponse {
  let reply = formatResponseByIntent(entry, intent);

  // Append scenario mode note when relevant
  const scenarioNote = buildScenarioModeNote(context?.isScenarioMode ?? false, pageScope);
  if (scenarioNote) reply += scenarioNote;

  // Append tier-specific context note for relevant entries
  const tierNote = buildTierNote(context?.tier, entry.id);
  if (tierNote) reply += tierNote;

  // Collect related topics
  const relatedTopicIds = entry.relatedTopics || [];
  const additionalRelated = matches
    .slice(1, 3)
    .map(m => m.entryId)
    .filter(id => !relatedTopicIds.includes(id));

  const allRelated = [...relatedTopicIds, ...additionalRelated].slice(0, 4);

  // Add related topics section
  if (allRelated.length > 0) {
    const relatedLinks = allRelated
      .filter(id => KB_ENTRIES[id])
      .map(id => `- ${KB_ENTRIES[id].title}`)
      .join('\n');

    if (relatedLinks) {
      reply += `\n\n**Related Topics:**\n${relatedLinks}`;
    }
  }

  // Get suggestions based on page context
  const suggestions = getPagePrompts(pageScope);

  return {
    reply,
    topicId: entry.id,
    matchedTopic: entry.title,
    intent,
    relatedTopics: allRelated,
    suggestions,
    disclaimer: DISCLAIMER,
  };
}

// =============================================================================
// Main Assistant Function
// =============================================================================

/**
 * Process a user message and generate a response.
 *
 * This is the main entry point for the local assistant.
 * No API calls are made - all processing is deterministic and local.
 *
 * @param message - User's input message
 * @param context - Optional context (current page, selected symbol, etc.)
 */
export function processMessage(
  message: string,
  context?: AssistantContext
): AssistantResponse {
  const trimmedMessage = message.trim();
  const pageScope = detectPageScope(context?.page);

  // Empty or very short messages
  if (trimmedMessage.length < 2) {
    return generateGreeting(pageScope);
  }

  // Check for greetings
  const greetings = ['hello', 'hi', 'hey', 'help', 'start', '?'];
  if (greetings.some(g => trimmedMessage.toLowerCase() === g)) {
    return generateGreeting(pageScope);
  }

  // Safety check - redirect harmful requests
  if (isSafetyTriggered(trimmedMessage)) {
    return {
      reply: SAFETY_RESPONSE,
      topicId: null,
      intent: 'fallback',
      relatedTopics: ['paper_trading', 'backtesting', 'risk_analytics'],
      suggestions: getPagePrompts(pageScope),
      disclaimer: DISCLAIMER,
    };
  }

  // Normalize the query (apply synonym replacements)
  const normalizedQuery = normalizeQuery(trimmedMessage);

  // Detect intent
  const intent = detectIntent(trimmedMessage);

  // Check for direct glossary lookups ("define X", "what is X")
  const defineMatch = trimmedMessage.match(/^(define|what is|what's|meaning of)\s+(.+)/i);
  if (defineMatch) {
    const termQuery = defineMatch[2];
    const glossaryResult = findGlossaryTerms(termQuery);
    if (glossaryResult) {
      // Check if there's also a KB entry
      const matches = matchKBEntries(normalizeQuery(termQuery), pageScope);
      if (matches.length > 0 && matches[0].score > 10) {
        // Combine glossary with full KB entry
        const bestMatch = matches[0];
        const response = formatFullResponse(bestMatch.entry, 'definition', matches, pageScope, context);
        response.reply = glossaryResult + '\n\n---\n\n' + response.reply;
        return response;
      }

      return {
        reply: glossaryResult + '\n\nWould you like more details on any of these terms?',
        topicId: null,
        intent: 'definition',
        relatedTopics: ['risk_analytics', 'what_is_ssb'],
        suggestions: getPagePrompts(pageScope),
        disclaimer: DISCLAIMER,
      };
    }
  }

  // Match against knowledge base
  const matches = matchKBEntries(normalizedQuery, pageScope);

  // Check for glossary terms in general query
  const glossaryTerms = findGlossaryTerms(normalizedQuery);

  // No KB matches - check glossary or fallback
  if (matches.length === 0) {
    if (glossaryTerms) {
      return {
        reply: glossaryTerms + '\n\nWould you like to learn more about any specific topic?',
        topicId: null,
        intent: 'definition',
        relatedTopics: ['risk_analytics', 'what_is_ssb'],
        suggestions: getPagePrompts(pageScope),
        disclaimer: DISCLAIMER,
      };
    }
    return generateFallback(pageScope);
  }

  // Return best match formatted by intent
  const bestMatch = matches[0];
  const response = formatFullResponse(bestMatch.entry, intent, matches, pageScope, context);

  // Prepend glossary terms if found and KB match is weak
  if (glossaryTerms && bestMatch.score < 15) {
    response.reply = glossaryTerms + '\n\n---\n\n' + response.reply;
  }

  // Add context-aware note if relevant
  if (context?.selectedSymbol && bestMatch.entry.pageScopes.includes('paper')) {
    response.reply += `\n\n*Currently viewing: ${context.selectedSymbol}*`;
  }

  return response;
}

// =============================================================================
// Exported Utilities
// =============================================================================

/**
 * Get quick prompt suggestions for a specific page.
 */
export function getQuickPrompts(page?: string): string[] {
  const scope = detectPageScope(page);
  return PAGE_PROMPTS[scope] || PAGE_PROMPTS.global;
}

/**
 * Get a KB entry by ID.
 */
export function getEntry(entryId: string): KBEntry | null {
  return KB_ENTRIES[entryId] || null;
}

/**
 * Get all entries relevant to a page scope.
 */
export function getEntriesForPage(page?: string): KBEntry[] {
  const scope = detectPageScope(page);
  return Object.values(KB_ENTRIES).filter(
    entry => entry.pageScopes.includes(scope) || entry.pageScopes.includes('global')
  );
}

/**
 * Search entries by query (for autocomplete/typeahead).
 */
export function searchEntries(query: string, limit = 5): KBEntry[] {
  if (query.length < 2) return [];

  const normalized = normalizeQuery(query);
  const matches = matchKBEntries(normalized, 'global');

  return matches.slice(0, limit).map(m => m.entry);
}
