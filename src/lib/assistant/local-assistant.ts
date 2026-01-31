/**
 * Local Rule-Based Assistant
 *
 * Provides intelligent responses using keyword matching and a knowledge base.
 * No external API calls - all processing is local.
 */

import {
  TOPICS,
  GLOSSARY,
  SAFETY_PATTERNS,
  SAFETY_RESPONSE,
  DISCLAIMER,
  type KBTopic,
} from './knowledge-base';

export interface AssistantResponse {
  reply: string;
  topicId: string | null;
  relatedTopics: string[];
  disclaimer: string;
}

// =============================================================================
// Intent Classification
// =============================================================================

interface IntentMatch {
  topicId: string;
  score: number;
  topic: KBTopic;
}

/**
 * Classify user intent using keyword matching
 */
function classifyIntent(message: string): IntentMatch[] {
  const normalizedMessage = message.toLowerCase().trim();
  const words = normalizedMessage.split(/\s+/);
  const matches: IntentMatch[] = [];

  for (const [topicId, topic] of Object.entries(TOPICS)) {
    let score = 0;

    for (const keyword of topic.keywords) {
      const keywordLower = keyword.toLowerCase();

      // Exact word match (higher score)
      if (words.includes(keywordLower)) {
        score += 10;
      }
      // Partial match / contains
      else if (normalizedMessage.includes(keywordLower)) {
        score += 5;
      }
      // Fuzzy match for common typos
      else if (words.some(word => levenshteinDistance(word, keywordLower) <= 2 && word.length > 3)) {
        score += 3;
      }
    }

    // Boost score for title matches
    if (normalizedMessage.includes(topic.title.toLowerCase())) {
      score += 15;
    }

    if (score > 0) {
      matches.push({ topicId, score, topic });
    }
  }

  // Sort by score descending
  return matches.sort((a, b) => b.score - a.score);
}

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

// =============================================================================
// Safety Check
// =============================================================================

function isSafetyTriggered(message: string): boolean {
  return SAFETY_PATTERNS.some(pattern => pattern.test(message));
}

// =============================================================================
// Glossary Lookup
// =============================================================================

function findGlossaryTerms(message: string): string | null {
  const normalizedMessage = message.toLowerCase();
  const matchedTerms = GLOSSARY.filter(term =>
    normalizedMessage.includes(term.term.toLowerCase())
  );

  if (matchedTerms.length === 0) return null;

  const definitions = matchedTerms.map(t =>
    `**${t.term}**: ${t.definition}`
  ).join('\n\n');

  return `Here are the definitions you might find helpful:\n\n${definitions}`;
}

// =============================================================================
// Response Generation
// =============================================================================

function generateGreeting(): AssistantResponse {
  return {
    reply: `Hello! I'm the SSB Assistant. I can help you learn about:

- **Market Analysis**: Regime detection, trend analysis
- **Risk Metrics**: VaR, volatility, drawdown, stress testing
- **Platform Features**: Backtesting, paper trading, entitlements
- **Investment Concepts**: Strategies, terminology, best practices

What would you like to learn about?`,
    topicId: null,
    relatedTopics: ['what_is_ssb', 'risk_analytics', 'paper_trading'],
    disclaimer: DISCLAIMER,
  };
}

function generateFallback(): AssistantResponse {
  return {
    reply: `I'm not sure I understood that question. Here are some topics I can help with:

- "What is SSB?"
- "Explain market regimes"
- "What is VaR?"
- "How does paper trading work?"
- "Tell me about stress testing"
- "What are the subscription tiers?"

Try asking about one of these topics, or rephrase your question.`,
    topicId: null,
    relatedTopics: ['what_is_ssb', 'market_regime', 'risk_var', 'paper_trading'],
    disclaimer: DISCLAIMER,
  };
}

function formatTopicResponse(topic: KBTopic, relatedMatches: IntentMatch[]): AssistantResponse {
  let reply = topic.content;

  // Add related topics if available
  const relatedTopicIds = topic.relatedTopics || [];
  const additionalRelated = relatedMatches
    .slice(1, 3)
    .map(m => m.topicId)
    .filter(id => !relatedTopicIds.includes(id));

  const allRelated = [...relatedTopicIds, ...additionalRelated].slice(0, 4);

  if (allRelated.length > 0) {
    const relatedLinks = allRelated
      .filter(id => TOPICS[id])
      .map(id => `• ${TOPICS[id].title}`)
      .join('\n');

    if (relatedLinks) {
      reply += `\n\n**Related Topics:**\n${relatedLinks}`;
    }
  }

  return {
    reply,
    topicId: topic.id,
    relatedTopics: allRelated,
    disclaimer: DISCLAIMER,
  };
}

// =============================================================================
// Main Assistant Function
// =============================================================================

/**
 * Process a user message and generate a response
 *
 * This is the main entry point for the local assistant.
 * No API calls are made - all processing is local.
 */
export function processMessage(message: string): AssistantResponse {
  const trimmedMessage = message.trim();

  // Empty or very short messages
  if (trimmedMessage.length < 2) {
    return generateGreeting();
  }

  // Check for greetings
  const greetings = ['hello', 'hi', 'hey', 'help', 'start', '?'];
  if (greetings.some(g => trimmedMessage.toLowerCase() === g)) {
    return generateGreeting();
  }

  // Safety check - redirect harmful requests
  if (isSafetyTriggered(trimmedMessage)) {
    return {
      reply: SAFETY_RESPONSE,
      topicId: null,
      relatedTopics: ['paper_trading', 'backtesting', 'risk_analytics'],
      disclaimer: DISCLAIMER,
    };
  }

  // Check for glossary lookups ("define X", "what is X")
  const defineMatch = trimmedMessage.match(/^(define|what is|what's|meaning of)\s+(.+)/i);
  if (defineMatch) {
    const termQuery = defineMatch[2];
    const glossaryResult = findGlossaryTerms(termQuery);
    if (glossaryResult) {
      return {
        reply: glossaryResult,
        topicId: null,
        relatedTopics: ['risk_analytics'],
        disclaimer: DISCLAIMER,
      };
    }
  }

  // General glossary check
  const glossaryTerms = findGlossaryTerms(trimmedMessage);

  // Classify intent
  const matches = classifyIntent(trimmedMessage);

  // No matches - check glossary or fallback
  if (matches.length === 0) {
    if (glossaryTerms) {
      return {
        reply: glossaryTerms + '\n\nWould you like to learn more about any specific topic?',
        topicId: null,
        relatedTopics: ['risk_analytics', 'what_is_ssb'],
        disclaimer: DISCLAIMER,
      };
    }
    return generateFallback();
  }

  // Return best match
  const bestMatch = matches[0];
  const response = formatTopicResponse(bestMatch.topic, matches);

  // Append glossary terms if found and relevant
  if (glossaryTerms && bestMatch.score < 15) {
    response.reply = glossaryTerms + '\n\n---\n\n' + response.reply;
  }

  return response;
}

/**
 * Get quick prompt suggestions
 */
export function getQuickPrompts(): string[] {
  return [
    'What is a market regime?',
    'Explain VaR in simple terms',
    'How do entitlements work?',
    'How do I use backtesting?',
    'What is paper trading?',
  ];
}

/**
 * Get topic by ID
 */
export function getTopic(topicId: string): KBTopic | null {
  return TOPICS[topicId] || null;
}
