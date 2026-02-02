'use client';

import { useEffect, useRef, useMemo, useCallback } from 'react';
import {
  createChart,
  ColorType,
  IChartApi,
  ISeriesApi,
  CandlestickData,
  LineData,
  Time,
  IPriceLine,
} from 'lightweight-charts';
import type { OverlayType } from '@/lib/api/paper';
import {
  calculateSMA,
  calculateLinearRegression,
  calculateKeyLevels,
  OVERLAY_CONFIGS,
  type OHLCV,
} from '@/lib/chart/overlays';

interface PriceChartProps {
  symbol: string;
  data: OHLCV[];
  enabledOverlays: OverlayType[];
  height?: number;
  className?: string;
}

export function PriceChart({
  symbol,
  data,
  enabledOverlays,
  height = 400,
  className,
}: PriceChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const overlaySeriesRef = useRef<Map<string, ISeriesApi<'Line'>>>(new Map());
  const priceLinesRef = useRef<IPriceLine[]>([]);

  // Convert OHLCV data to lightweight-charts format
  const candleData = useMemo((): CandlestickData[] => {
    return data.map((d) => ({
      time: d.time as Time,
      open: d.open,
      high: d.high,
      low: d.low,
      close: d.close,
    }));
  }, [data]);

  // Calculate overlay data
  const overlayData = useMemo(() => {
    const result: Record<string, LineData[]> = {};

    if (enabledOverlays.includes('sma20')) {
      result.sma20 = calculateSMA(data, 20).map((p) => ({
        time: p.time as Time,
        value: p.value,
      }));
    }

    if (enabledOverlays.includes('sma50')) {
      result.sma50 = calculateSMA(data, 50).map((p) => ({
        time: p.time as Time,
        value: p.value,
      }));
    }

    if (enabledOverlays.includes('sma200')) {
      result.sma200 = calculateSMA(data, 200).map((p) => ({
        time: p.time as Time,
        value: p.value,
      }));
    }

    if (enabledOverlays.includes('regression')) {
      result.regression = calculateLinearRegression(data, 50).map((p) => ({
        time: p.time as Time,
        value: p.value,
      }));
    }

    return result;
  }, [data, enabledOverlays]);

  // Calculate key levels
  const keyLevels = useMemo(() => {
    if (!enabledOverlays.includes('levels')) return null;
    return calculateKeyLevels(data);
  }, [data, enabledOverlays]);

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
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
        timeVisible: true,
        secondsVisible: false,
      },
      crosshair: {
        vertLine: {
          color: 'rgba(156, 163, 175, 0.4)',
          width: 1,
          style: 2,
        },
        horzLine: {
          color: 'rgba(156, 163, 175, 0.4)',
          width: 1,
          style: 2,
        },
      },
    });

    chartRef.current = chart;

    // Create candlestick series
    const candleSeries = chart.addCandlestickSeries({
      upColor: '#22c55e',
      downColor: '#ef4444',
      borderUpColor: '#22c55e',
      borderDownColor: '#ef4444',
      wickUpColor: '#22c55e',
      wickDownColor: '#ef4444',
    });
    candleSeriesRef.current = candleSeries;

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
      chartRef.current = null;
      candleSeriesRef.current = null;
      overlaySeriesRef.current.clear();
      priceLinesRef.current = [];
    };
  }, [height]);

  // Update candle data
  useEffect(() => {
    if (!candleSeriesRef.current || candleData.length === 0) return;
    candleSeriesRef.current.setData(candleData);
    chartRef.current?.timeScale().fitContent();
  }, [candleData]);

  // Update overlay series
  useEffect(() => {
    if (!chartRef.current) return;

    const chart = chartRef.current;
    const currentSeries = overlaySeriesRef.current;

    // Remove series that are no longer enabled
    for (const [key, series] of currentSeries.entries()) {
      if (!enabledOverlays.includes(key as OverlayType) || key === 'levels') {
        chart.removeSeries(series);
        currentSeries.delete(key);
      }
    }

    // Add or update enabled overlays (except levels which use price lines)
    for (const overlay of enabledOverlays) {
      if (overlay === 'levels') continue;

      const config = OVERLAY_CONFIGS[overlay];
      const lineData = overlayData[overlay];

      if (!lineData || lineData.length === 0) continue;

      let series = currentSeries.get(overlay);

      if (!series) {
        series = chart.addLineSeries({
          color: config.color,
          lineWidth: 2,
          priceLineVisible: false,
          lastValueVisible: false,
          crosshairMarkerVisible: false,
        });
        currentSeries.set(overlay, series);
      }

      series.setData(lineData);
    }
  }, [enabledOverlays, overlayData]);

  // Update key levels (horizontal lines)
  useEffect(() => {
    if (!candleSeriesRef.current) return;

    const series = candleSeriesRef.current;

    // Clear existing price lines first
    for (const priceLine of priceLinesRef.current) {
      series.removePriceLine(priceLine);
    }
    priceLinesRef.current = [];

    // Create new price lines if levels are enabled
    if (keyLevels && enabledOverlays.includes('levels')) {
      const levelColor = OVERLAY_CONFIGS.levels.color;

      if (keyLevels.prevDayHigh !== null) {
        const line = series.createPriceLine({
          price: keyLevels.prevDayHigh,
          color: levelColor,
          lineWidth: 1,
          lineStyle: 2, // Dashed
          axisLabelVisible: true,
          title: 'Prev High',
        });
        priceLinesRef.current.push(line);
      }

      if (keyLevels.prevDayLow !== null) {
        const line = series.createPriceLine({
          price: keyLevels.prevDayLow,
          color: levelColor,
          lineWidth: 1,
          lineStyle: 2,
          axisLabelVisible: true,
          title: 'Prev Low',
        });
        priceLinesRef.current.push(line);
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
