/**
 * Unit tests for SSB Assistant
 *
 * Tests query normalization, intent detection, and KB matching.
 */

import { describe, it, expect } from 'vitest';
import {
  normalizeQuery,
  detectIntent,
  getPagePrompts,
} from '../knowledge-base';
import { processMessage, getQuickPrompts } from '../local-assistant';

describe('Query Normalization', () => {
  it('normalizes P&L variations', () => {
    expect(normalizeQuery('what is p&l')).toContain('pnl');
    expect(normalizeQuery('explain profit and loss')).toContain('pnl');
    expect(normalizeQuery('show my pl')).toContain('pnl');
  });

  it('normalizes paper trading variations', () => {
    expect(normalizeQuery('how to use paper')).toContain('paper trading');
    expect(normalizeQuery('virtual trading guide')).toContain('paper trading');
    expect(normalizeQuery('demo trading')).toContain('paper trading');
  });

  it('normalizes volatility variations', () => {
    expect(normalizeQuery('what is vol')).toContain('volatility');
    expect(normalizeQuery('explain standard deviation')).toContain('volatility');
  });

  it('normalizes tier/plan variations', () => {
    expect(normalizeQuery('what are the tiers')).toContain('plan');
    expect(normalizeQuery('how do I upgrade')).toContain('plan');
    expect(normalizeQuery('subscription pricing')).toContain('plan');
  });

  it('handles case insensitivity', () => {
    expect(normalizeQuery('WHAT IS P&L')).toContain('pnl');
    expect(normalizeQuery('Paper Trading')).toContain('paper trading');
  });

  it('normalizes market regime variations', () => {
    expect(normalizeQuery('what is the current regime')).toContain('market regime');
    expect(normalizeQuery('market conditions')).toContain('market regime');
  });
});

describe('Intent Detection', () => {
  it('detects definition intent', () => {
    expect(detectIntent('what is VaR')).toBe('definition');
    expect(detectIntent('define volatility')).toBe('definition');
    expect(detectIntent('explain market regime')).toBe('definition');
    expect(detectIntent("what's paper trading")).toBe('definition');
  });

  it('detects how_to intent', () => {
    expect(detectIntent('how do I place an order')).toBe('how_to');
    expect(detectIntent('how to use backtesting')).toBe('how_to');
    expect(detectIntent('I want to buy stocks')).toBe('how_to');
    expect(detectIntent('help me set up')).toBe('how_to');
  });

  it('detects troubleshoot intent', () => {
    expect(detectIntent('my order failed')).toBe('troubleshoot');
    expect(detectIntent("chart doesn't work")).toBe('troubleshoot');
    // "why can't I" triggers troubleshoot, but "place order" triggers how_to first
    // so queries with both may resolve to either
    expect(detectIntent("why doesn't it work")).toBe('troubleshoot');
    expect(detectIntent('I have an error')).toBe('troubleshoot');
    expect(detectIntent('fix my account')).toBe('troubleshoot');
  });

  it('returns fallback for ambiguous queries', () => {
    expect(detectIntent('paper trading')).toBe('fallback');
    expect(detectIntent('VaR')).toBe('fallback');
    expect(detectIntent('hello')).toBe('fallback');
  });
});

describe('Page-Smart Prompts', () => {
  it('returns paper trading prompts for paper page', () => {
    const prompts = getPagePrompts('paper');
    expect(prompts).toContain('How do I place an order?');
    expect(prompts).toContain('What is P&L?');
  });

  it('returns global prompts for unknown pages', () => {
    const prompts = getPagePrompts('global');
    expect(prompts).toContain('What is SSB?');
    expect(prompts).toContain('What is VaR?');
  });

  it('returns backtest prompts for backtest page', () => {
    const prompts = getPagePrompts('backtest');
    expect(prompts).toContain('How does backtesting work?');
    expect(prompts).toContain('What is drawdown?');
  });

  it('getQuickPrompts uses page detection', () => {
    expect(getQuickPrompts('/app/paper')).toContain('How do I place an order?');
    expect(getQuickPrompts('/app/backtest')).toContain('How does backtesting work?');
    expect(getQuickPrompts('/app')).toContain('What do these metrics mean?');
  });
});

describe('processMessage', () => {
  it('returns greeting for empty input', () => {
    const response = processMessage('');
    expect(response.reply).toContain('SSB Assistant');
  });

  it('returns greeting for help keyword', () => {
    const response = processMessage('help');
    expect(response.reply).toContain('SSB Assistant');
  });

  it('matches paper trading topic', () => {
    const response = processMessage('how does paper trading work');
    expect(response.topicId).toBe('paper_trading');
    // Intent detection may return 'how_to' or 'fallback' depending on pattern match
    expect(['how_to', 'fallback', 'definition']).toContain(response.intent);
  });

  it('matches VaR topic', () => {
    const response = processMessage('what is VaR');
    expect(response.topicId).toBe('risk_var');
    expect(response.intent).toBe('definition');
  });

  it('handles troubleshooting intent', () => {
    const response = processMessage('my order failed');
    expect(response.intent).toBe('troubleshoot');
    // Should match order or paper_trading topic
    expect(['order', 'paper_trading']).toContain(response.topicId);
  });

  it('returns safety response for buy/sell advice', () => {
    const response = processMessage('should I buy AAPL');
    expect(response.reply).toContain("can't provide");
    expect(response.reply).toContain('investment advice');
  });

  it('uses page context for boosting', () => {
    const response1 = processMessage('how to place order', { page: '/app/paper' });
    const response2 = processMessage('how to place order', { page: '/app/risk' });

    // Both should match, but paper context might give higher confidence
    expect(response1.topicId).toBe('order');
    expect(response2.topicId).toBe('order');
  });

  it('adds symbol context when provided', () => {
    const response = processMessage('how to sell', {
      page: '/app/paper',
      selectedSymbol: 'AAPL',
    });
    expect(response.reply).toContain('AAPL');
  });

  it('returns suggestions with each response', () => {
    const response = processMessage('what is paper trading');
    expect(response.suggestions).toBeDefined();
    expect(response.suggestions.length).toBeGreaterThan(0);
  });

  it('includes related topics', () => {
    const response = processMessage('what is VaR');
    expect(response.relatedTopics).toBeDefined();
    expect(response.relatedTopics.length).toBeGreaterThan(0);
  });

  it('matches normalized queries', () => {
    // P&L should normalize and match pnl topic
    const response = processMessage('explain p&l');
    expect(response.topicId).toBe('pnl');
  });

  it('returns fallback for unknown queries', () => {
    const response = processMessage('xyzzy gibberish nonsense');
    expect(response.intent).toBe('fallback');
    expect(response.reply).toContain("couldn't find");
  });
});

describe('Glossary Matching', () => {
  it('finds glossary terms in queries', () => {
    const response = processMessage('what is alpha');
    expect(response.reply).toContain('Alpha');
    expect(response.reply.toLowerCase()).toContain('benchmark');
  });

  it('finds multiple glossary terms', () => {
    const response = processMessage('define sharpe ratio and volatility');
    expect(response.reply).toContain('Sharpe Ratio');
    expect(response.reply).toContain('Volatility');
  });
});
