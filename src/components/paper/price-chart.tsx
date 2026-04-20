'use client';

import { useEffect, useRef, useMemo, useState } from 'react';
import {
  createChart,
  ColorType,
  IChartApi,
  ISeriesApi,
  CandlestickData,
  LineData,
  Time,
  IPriceLine,
  BusinessDay,
} from 'lightweight-charts';
import type { OverlayType } from '@/lib/api/paper';
import {
  calculateSMA,
  calculateLinearRegression,
  calculateKeyLevels,
  OVERLAY_CONFIGS,
  type OHLCV,
} from '@/lib/chart/overlays';
import {
  type BarSize,
  isIntradayBarSize,
  formatChartTime,
  formatAxisTime,
  formatBusinessDay,
} from '@/lib/chart/timeframes';

interface PriceChartProps {
  symbol: string;
  data: OHLCV[];
  barSize: BarSize;
  enabledOverlays: OverlayType[];
  height?: number;
  className?: string;
}

/**
 * Convert OHLCV time to lightweight-charts Time format.
 * - Intraday: UTCTimestamp (number)
 * - Daily+: BusinessDay { year, month, day } using UTC to avoid timezone day-off-by-one
 */
function toChartTime(timestamp: number, barSize: BarSize): Time {
  if (isIntradayBarSize(barSize)) {
    return timestamp as Time;
  } else {
    const date = new Date(timestamp * 1000);
    return {
      year: date.getUTCFullYear(),
      month: (date.getUTCMonth() + 1) as BusinessDay['month'],
      day: date.getUTCDate() as BusinessDay['day'],
    } as Time;
  }
}

// One pre-created line series per overlay type (avoids add/remove cycle on toggle)
interface LineSeriesStore {
  sma20: ISeriesApi<'Line'>;
  sma50: ISeriesApi<'Line'>;
  sma200: ISeriesApi<'Line'>;
  regression: ISeriesApi<'Line'>;
}

export function PriceChart({
  symbol,
  data,
  barSize,
  enabledOverlays,
  height = 400,
  className,
}: PriceChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  // Chart stored in STATE so the update effect re-runs when chart is recreated
  const [chart, setChart] = useState<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const lineSeriesRef = useRef<LineSeriesStore | null>(null);
  const priceLinesRef = useRef<IPriceLine[]>([]);

  const isIntraday = isIntradayBarSize(barSize);

  // Convert OHLCV data to lightweight-charts format
  const candleData = useMemo((): CandlestickData[] => {
    return data.map((d) => ({
      time: toChartTime(d.time, barSize),
      open: d.open,
      high: d.high,
      low: d.low,
      close: d.close,
    }));
  }, [data, barSize]);

  // Calculate overlay line data (always compute; enable/disable decides what gets set)
  const overlayData = useMemo(() => {
    const result: Record<string, LineData[]> = {};

    if (data.length >= 20) {
      result.sma20 = calculateSMA(data, 20).map((p) => ({
        time: toChartTime(p.time, barSize),
        value: p.value,
      }));
    }

    if (data.length >= 50) {
      result.sma50 = calculateSMA(data, 50).map((p) => ({
        time: toChartTime(p.time, barSize),
        value: p.value,
      }));
      result.regression = calculateLinearRegression(data, 50).map((p) => ({
        time: toChartTime(p.time, barSize),
        value: p.value,
      }));
    }

    if (data.length >= 200) {
      result.sma200 = calculateSMA(data, 200).map((p) => ({
        time: toChartTime(p.time, barSize),
        value: p.value,
      }));
    }

    return result;
  }, [data, barSize]);

  // Calculate key levels
  const keyLevels = useMemo(() => {
    if (!enabledOverlays.includes('levels') || data.length < 2) return null;
    return calculateKeyLevels(data);
  }, [data, enabledOverlays]);

  // Initialize chart — pre-creates ALL line series to avoid repeated add/remove.
  // Stores result in STATE so dependent effects re-run on chart recreation.
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const newChart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#9ca3af',
      },
      grid: {
        vertLines: { color: 'rgba(156, 163, 175, 0.1)' },
        horzLines: { color: 'rgba(156, 163, 175, 0.1)' },
      },
      width: chartContainerRef.current.clientWidth,
      height,
      rightPriceScale: {
        borderColor: 'rgba(156, 163, 175, 0.2)',
      },
      timeScale: {
        borderColor: 'rgba(156, 163, 175, 0.2)',
        timeVisible: isIntraday,
        secondsVisible: false,
        tickMarkFormatter: (time: Time) => {
          if (typeof time === 'number') {
            return formatAxisTime(time, barSize);
          } else if (typeof time === 'object' && 'year' in time) {
            const bd = time as BusinessDay;
            const date = new Date(bd.year, bd.month - 1, bd.day);
            return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
          }
          return String(time);
        },
      },
      crosshair: {
        vertLine: { color: 'rgba(156, 163, 175, 0.4)', width: 1, style: 2 },
        horzLine: { color: 'rgba(156, 163, 175, 0.4)', width: 1, style: 2 },
      },
      localization: {
        timeFormatter: (time: Time) => {
          if (typeof time === 'number') {
            return formatChartTime(time, barSize);
          } else if (typeof time === 'object' && 'year' in time) {
            return formatBusinessDay(time as BusinessDay);
          }
          return String(time);
        },
      },
    });

    // Candlestick series
    const candleSeries = newChart.addCandlestickSeries({
      upColor: '#22c55e',
      downColor: '#ef4444',
      borderUpColor: '#22c55e',
      borderDownColor: '#ef4444',
      wickUpColor: '#22c55e',
      wickDownColor: '#ef4444',
    });
    candleSeriesRef.current = candleSeries;

    // Pre-create all four line series — they persist for the lifetime of this chart
    // instance. Start hidden; the visibility effect below shows enabled ones.
    // We NEVER call setData([]) to hide — that can corrupt lightweight-charts'
    // internal time-range calculation, causing the entire chart to go blank.
    const makeLineSeries = (color: string) =>
      newChart.addLineSeries({
        color,
        lineWidth: 2,
        priceScaleId: 'right',
        priceLineVisible: false,
        lastValueVisible: false,
        crosshairMarkerVisible: false,
        visible: false,
      });

    lineSeriesRef.current = {
      sma20: makeLineSeries(OVERLAY_CONFIGS.sma20.color),
      sma50: makeLineSeries(OVERLAY_CONFIGS.sma50.color),
      sma200: makeLineSeries(OVERLAY_CONFIGS.sma200.color),
      regression: makeLineSeries(OVERLAY_CONFIGS.regression.color),
    };

    const handleResize = () => {
      if (chartContainerRef.current) {
        newChart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };
    window.addEventListener('resize', handleResize);

    setChart(newChart);

    return () => {
      window.removeEventListener('resize', handleResize);
      newChart.remove();
      candleSeriesRef.current = null;
      lineSeriesRef.current = null;
      priceLinesRef.current = [];
      setChart(null);
    };
  }, [height, isIntraday, barSize]);

  // Effect A — data sync: runs only when the underlying price/overlay data changes,
  // NOT on every overlay toggle. Sets all series data and re-fits the time scale.
  useEffect(() => {
    if (!chart || !candleSeriesRef.current || !lineSeriesRef.current || candleData.length === 0) return;

    candleSeriesRef.current.setData(candleData);

    const store = lineSeriesRef.current;
    const overlayKeys: Array<keyof typeof store> = ['sma20', 'sma50', 'sma200', 'regression'];
    for (const key of overlayKeys) {
      const lineData = overlayData[key] ?? [];
      try {
        store[key].setData(lineData);
      } catch {
        // Series may be in cleanup — skip silently
      }
    }

    chart.timeScale().fitContent();
  }, [chart, candleData, overlayData]);

  // Effect B — visibility sync: runs when enabledOverlays changes (i.e. user toggles a
  // button) and also after chart/data init so initial state is correct.
  // Uses applyOptions({ visible }) instead of setData([]) — calling setData([]) on a
  // line series that shares the right price scale can corrupt lightweight-charts'
  // time-range calculation and blank the entire chart.
  useEffect(() => {
    if (!lineSeriesRef.current) return;

    const store = lineSeriesRef.current;
    const overlayKeys: Array<keyof typeof store> = ['sma20', 'sma50', 'sma200', 'regression'];
    for (const key of overlayKeys) {
      const lineData = overlayData[key] ?? [];
      const isEnabled = enabledOverlays.includes(key as OverlayType);
      try {
        store[key].applyOptions({ visible: isEnabled && lineData.length > 0 });
      } catch {
        // Series may be in cleanup — skip silently
      }
    }
  }, [chart, enabledOverlays, overlayData]);

  // Update key levels (horizontal price lines on the candlestick series)
  useEffect(() => {
    if (!candleSeriesRef.current) return;
    const series = candleSeriesRef.current;
    for (const pl of priceLinesRef.current) series.removePriceLine(pl);
    priceLinesRef.current = [];

    if (keyLevels && enabledOverlays.includes('levels')) {
      const color = OVERLAY_CONFIGS.levels.color;
      if (keyLevels.prevDayHigh !== null) {
        priceLinesRef.current.push(series.createPriceLine({ price: keyLevels.prevDayHigh, color, lineWidth: 1, lineStyle: 2, axisLabelVisible: true, title: 'Prev High' }));
      }
      if (keyLevels.prevDayLow !== null) {
        priceLinesRef.current.push(series.createPriceLine({ price: keyLevels.prevDayLow, color, lineWidth: 1, lineStyle: 2, axisLabelVisible: true, title: 'Prev Low' }));
      }
    }
  }, [keyLevels, enabledOverlays]);

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">{symbol}</span>
        {enabledOverlays.length > 0 && (
          <div className="flex gap-2 text-xs">
            {enabledOverlays.map((overlay) => (
              <span
                key={overlay}
                className="px-1.5 py-0.5 rounded"
                style={{
                  backgroundColor: `${OVERLAY_CONFIGS[overlay].color}20`,
                  color: OVERLAY_CONFIGS[overlay].color,
                }}
              >
                {OVERLAY_CONFIGS[overlay].label}
              </span>
            ))}
          </div>
        )}
      </div>
      <div ref={chartContainerRef} />
    </div>
  );
}
