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
 * - Daily+: BusinessDay { year, month, day }
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

// Pre-created line series store — one series per overlay type
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
  const [chart, setChart] = useState<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const lineSeriesRef = useRef<LineSeriesStore | null>(null);
  const priceLinesRef = useRef<IPriceLine[]>([]);

  // Debug state — captures what the overlay effect computed (shown below chart)
  const [debugInfo, setDebugInfo] = useState<string>('');

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

  // Calculate overlay line data
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
  // Stores chart in STATE so the update effect re-runs on chart recreation.
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

    // Pre-create ALL line series — avoids add/remove cycle on every toggle
    const makeLineSeries = (color: string) =>
      newChart.addLineSeries({
        color,
        lineWidth: 2,
        priceLineVisible: false,
        lastValueVisible: false,
        crosshairMarkerVisible: false,
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

  // Update candle data + overlay data whenever chart, data, or overlay selection changes.
  // All line series exist already — just update their data or clear them.
  useEffect(() => {
    if (!chart || !candleSeriesRef.current || !lineSeriesRef.current || candleData.length === 0) return;

    // Set candle data
    candleSeriesRef.current.setData(candleData);

    const store = lineSeriesRef.current;
    const debugLines: string[] = [
      `data=${data.length} bars, intraday=${isIntraday}`,
      `enabled=[${enabledOverlays.filter(o => o !== 'levels').join(',')}]`,
    ];

    // Update each line series — setData(points) if enabled+data available, else setData([])
    const overlayKeys: Array<keyof typeof store> = ['sma20', 'sma50', 'sma200', 'regression'];
    for (const key of overlayKeys) {
      const series = store[key];
      const overlayName = key === 'regression' ? 'regression' : key;
      const lineData = overlayData[overlayName] ?? [];
      const isEnabled = enabledOverlays.includes(overlayName as OverlayType);

      if (isEnabled && lineData.length > 0) {
        try {
          series.setData(lineData);
          debugLines.push(`${key}: SET ${lineData.length} pts ✓`);
        } catch (err) {
          debugLines.push(`${key}: FAILED – ${String(err)}`);
        }
      } else {
        try {
          series.setData([]);
          debugLines.push(`${key}: cleared (enabled=${isEnabled}, pts=${lineData.length})`);
        } catch (err) {
          debugLines.push(`${key}: clear FAILED – ${String(err)}`);
        }
      }
    }

    chart.timeScale().fitContent();
    setDebugInfo(debugLines.join(' | '));
  }, [chart, candleData, enabledOverlays, overlayData, data.length, isIntraday]);

  // Update key levels (horizontal price lines)
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
      {/* Temporary debug panel — remove once overlay rendering is confirmed working */}
      {debugInfo && (
        <div className="mt-1 px-2 py-1 rounded text-[10px] font-mono bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 break-all">
          {debugInfo}
        </div>
      )}
    </div>
  );
}
