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
      year: date.getFullYear(),
      month: (date.getMonth() + 1) as BusinessDay['month'],
      day: date.getDate() as BusinessDay['day'],
    } as Time;
  }
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
  // Store the chart in STATE so the data/overlay effect re-runs whenever the
  // chart is recreated (refs don't trigger effect dep changes).
  const [chart, setChart] = useState<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const overlaySeriesRef = useRef<Map<string, ISeriesApi<'Line'>>>(new Map());
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

  // Calculate overlay line data
  const overlayData = useMemo(() => {
    const result: Record<string, LineData[]> = {};

    if (enabledOverlays.includes('sma20') && data.length >= 20) {
      result.sma20 = calculateSMA(data, 20).map((p) => ({
        time: toChartTime(p.time, barSize),
        value: p.value,
      }));
    }

    if (enabledOverlays.includes('sma50') && data.length >= 50) {
      result.sma50 = calculateSMA(data, 50).map((p) => ({
        time: toChartTime(p.time, barSize),
        value: p.value,
      }));
    }

    if (enabledOverlays.includes('sma200') && data.length >= 200) {
      result.sma200 = calculateSMA(data, 200).map((p) => ({
        time: toChartTime(p.time, barSize),
        value: p.value,
      }));
    }

    if (enabledOverlays.includes('regression') && data.length >= 50) {
      result.regression = calculateLinearRegression(data, 50).map((p) => ({
        time: toChartTime(p.time, barSize),
        value: p.value,
      }));
    }

    return result;
  }, [data, barSize, enabledOverlays]);

  // Calculate key levels
  const keyLevels = useMemo(() => {
    if (!enabledOverlays.includes('levels') || data.length < 2) return null;
    return calculateKeyLevels(data);
  }, [data, enabledOverlays]);

  // Initialize chart — runs when height/barSize change.
  // Stores result in state so dependent effects re-run on chart recreation.
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

    const candleSeries = newChart.addCandlestickSeries({
      upColor: '#22c55e',
      downColor: '#ef4444',
      borderUpColor: '#22c55e',
      borderDownColor: '#ef4444',
      wickUpColor: '#22c55e',
      wickDownColor: '#ef4444',
    });
    candleSeriesRef.current = candleSeries;

    const handleResize = () => {
      if (chartContainerRef.current) {
        newChart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };
    window.addEventListener('resize', handleResize);

    // Putting chart in state makes overlay/candle effects re-run when chart changes
    setChart(newChart);

    return () => {
      window.removeEventListener('resize', handleResize);
      newChart.remove();
      candleSeriesRef.current = null;
      overlaySeriesRef.current.clear();
      priceLinesRef.current = [];
      setChart(null);
    };
  }, [height, isIntraday, barSize]);

  // Update candle data + overlays in one combined effect.
  // Combined so they're guaranteed to run in the correct order and both
  // react to the chart being recreated (chart is now in state, not a ref).
  useEffect(() => {
    if (!chart || !candleSeriesRef.current || candleData.length === 0) return;

    // Set candle data
    candleSeriesRef.current.setData(candleData);

    // Clean-slate overlay series: remove all existing then re-add
    for (const series of overlaySeriesRef.current.values()) {
      try { chart.removeSeries(series); } catch { /* series already gone */ }
    }
    overlaySeriesRef.current.clear();

    for (const overlay of enabledOverlays) {
      if (overlay === 'levels') continue;

      const config = OVERLAY_CONFIGS[overlay];
      const lineData = overlayData[overlay];
      if (!lineData || lineData.length === 0) continue;

      try {
        const series = chart.addLineSeries({
          color: config.color,
          lineWidth: 2,
          priceLineVisible: false,
          lastValueVisible: false,
          crosshairMarkerVisible: false,
        });
        series.setData(lineData);
        overlaySeriesRef.current.set(overlay, series);
      } catch (err) {
        console.error(`[PriceChart] overlay "${overlay}" failed:`, err);
      }
    }

    chart.timeScale().fitContent();
  }, [chart, candleData, enabledOverlays, overlayData]);

  // Update key levels (horizontal price lines on the candlestick series)
  useEffect(() => {
    if (!candleSeriesRef.current) return;

    const series = candleSeriesRef.current;

    for (const priceLine of priceLinesRef.current) {
      series.removePriceLine(priceLine);
    }
    priceLinesRef.current = [];

    if (keyLevels && enabledOverlays.includes('levels')) {
      const levelColor = OVERLAY_CONFIGS.levels.color;

      if (keyLevels.prevDayHigh !== null) {
        priceLinesRef.current.push(
          series.createPriceLine({
            price: keyLevels.prevDayHigh,
            color: levelColor,
            lineWidth: 1,
            lineStyle: 2,
            axisLabelVisible: true,
            title: 'Prev High',
          })
        );
      }

      if (keyLevels.prevDayLow !== null) {
        priceLinesRef.current.push(
          series.createPriceLine({
            price: keyLevels.prevDayLow,
            color: levelColor,
            lineWidth: 1,
            lineStyle: 2,
            axisLabelVisible: true,
            title: 'Prev Low',
          })
        );
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
