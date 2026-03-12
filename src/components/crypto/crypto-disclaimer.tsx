import { AlertTriangle } from 'lucide-react';

/**
 * Regulatory disclaimer shown on every crypto page.
 * Cryptocurrency investing involves substantial risk of loss.
 */
export function CryptoDisclaimer() {
  return (
    <div className="rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 dark:border-yellow-900 dark:bg-yellow-950/30">
      <div className="flex items-start gap-2">
        <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5 shrink-0" />
        <p className="text-xs text-yellow-800 dark:text-yellow-300 leading-relaxed">
          <span className="font-semibold">Disclaimer: </span>
          Cryptocurrency prices shown are sourced from third-party market data and are for
          informational purposes only. Cryptocurrencies are highly volatile and speculative
          assets. Past performance is not indicative of future results. SSB does not provide
          investment advice. Nothing on this page constitutes a recommendation to buy, sell,
          or hold any cryptocurrency. Always conduct your own research and consult a qualified
          financial advisor before making investment decisions.
        </p>
      </div>
    </div>
  );
}
