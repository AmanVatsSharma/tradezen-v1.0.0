'use client';

import React, {
  MutableRefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import { ChartSkeleton } from '@/components/ChartSkeleton';
import ChartTooltip from '@/components/ChartTooltip';
import {
  BarData,
  CandlestickStyleOptions,
  ColorType,
  HistogramData,
  IChartApi,
  ISeriesApi,
  LineData,
  LineStyle,
  SeriesDataItemTypeMap,
  Time,
  createChart,
} from 'lightweight-charts';

import { ChartDataPacket, ChartType } from './types';

interface ChartViewportProps {
  packet: ChartDataPacket | null;
  status: 'idle' | 'loading' | 'success' | 'error';
  chartType: ChartType;
  theme: 'light' | 'dark';
  mainContainerRef?: MutableRefObject<HTMLDivElement | null>;
  renderOverlay?: (ref: MutableRefObject<HTMLDivElement | null>) => React.ReactNode;
}

type AnySeries = ISeriesApi<keyof SeriesDataItemTypeMap>;

const chartTheme = (theme: 'light' | 'dark') => ({
  layout: {
    background: { type: ColorType.Solid, color: theme === 'dark' ? '#030712' : '#f8fafc' },
    textColor: theme === 'dark' ? '#e2e8f0' : '#0f172a',
  },
  grid: {
    vertLines: { color: theme === 'dark' ? '#1e293b' : '#e2e8f0' },
    horzLines: { color: theme === 'dark' ? '#1e293b' : '#e2e8f0' },
  },
  crosshair: {
    mode: 0,
  },
  rightPriceScale: {
    borderColor: theme === 'dark' ? '#1e293b' : '#94a3b8',
  },
  timeScale: {
    borderColor: theme === 'dark' ? '#1e293b' : '#94a3b8',
  },
});

// Core price/indicator viewport built on lightweight-charts.
// Core price/indicator viewport built on lightweight-charts.
export const ChartViewport: React.FC<ChartViewportProps> = ({
  packet,
  status,
  chartType,
  theme,
  mainContainerRef,
  renderOverlay,
}) => {
  const priceContainerRef = useRef<HTMLDivElement | null>(null);
  const oscillatorContainerRef = useRef<HTMLDivElement | null>(null);
  const priceChartRef = useRef<IChartApi | null>(null);
  const oscillatorChartRef = useRef<IChartApi | null>(null);
  const mainSeriesRef = useRef<AnySeries | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);
  const overlaySeriesRef = useRef<Record<string, AnySeries>>({});
  const comparisonSeriesRef = useRef<Record<string, AnySeries>>({});
  const oscillatorSeriesRef = useRef<Record<string, AnySeries>>({});
  const [tooltip, setTooltip] = useState({ price: 0, time: '' });

  useEffect(() => {
    if (!mainContainerRef) return;
    const container = priceContainerRef.current;
    mainContainerRef.current = container;
    return () => {
      if (mainContainerRef.current === container) {
        mainContainerRef.current = null;
      }
    };
  }, [mainContainerRef]);

  useEffect(() => {
    if (!priceContainerRef.current) return;
    const container = priceContainerRef.current;
    const priceChart = createChart(container, {
      width: container.clientWidth,
      height: container.clientHeight,
      ...chartTheme(theme),
    });
    priceChartRef.current = priceChart;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        priceChart.applyOptions({ width, height });
      }
    });
    resizeObserver.observe(container);

    return () => {
      resizeObserver.unobserve(container);
      priceChart.remove();
      priceChartRef.current = null;
      mainSeriesRef.current = null;
    };
  }, [theme]);

  useEffect(() => {
    if (!oscillatorContainerRef.current) return;
    const oscillatorChart = createChart(oscillatorContainerRef.current, {
      width: oscillatorContainerRef.current.clientWidth,
      height: oscillatorContainerRef.current.clientHeight,
      ...chartTheme(theme),
      rightPriceScale: { borderColor: '#075985' },
    });
    oscillatorChartRef.current = oscillatorChart;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        oscillatorChart.applyOptions({ width, height });
      }
    });
    resizeObserver.observe(oscillatorContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      oscillatorChart.remove();
      oscillatorChartRef.current = null;
    };
  }, [theme, packet?.oscillators]);

  const baselinePrice = packet?.candles?.[packet.candles.length - 1]?.close ?? 0;

  const createMainSeries = useCallback(() => {
    if (!priceChartRef.current) return null;
    if (mainSeriesRef.current) {
      priceChartRef.current.removeSeries(mainSeriesRef.current);
    }

    switch (chartType) {
      case 'candles':
      case 'heikin': {
        const options: Partial<CandlestickStyleOptions> = {
          upColor: '#22c55e',
          downColor: '#ef4444',
          borderVisible: false,
          wickUpColor: '#22c55e',
          wickDownColor: '#ef4444',
        };
        mainSeriesRef.current = priceChartRef.current.addCandlestickSeries(options);
        break;
      }
      case 'bars': {
        mainSeriesRef.current = priceChartRef.current.addBarSeries({
          upColor: '#22c55e',
          downColor: '#ef4444',
        });
        break;
      }
      case 'line': {
        mainSeriesRef.current = priceChartRef.current.addLineSeries({
          color: '#3b82f6',
          lineWidth: 2,
        });
        break;
      }
      case 'area': {
        mainSeriesRef.current = priceChartRef.current.addAreaSeries({
          topColor: 'rgba(34,197,94,0.5)',
          bottomColor: 'rgba(34,197,94,0.1)',
          lineColor: '#34d399',
          lineWidth: 2,
        });
        break;
      }
      case 'baseline': {
        mainSeriesRef.current = priceChartRef.current.addBaselineSeries({
          baseValue: { type: 'price', price: baselinePrice },
          topLineColor: '#34d399',
          bottomLineColor: '#ef4444',
          topFillColor1: 'rgba(34,197,94,0.5)',
          bottomFillColor1: 'rgba(239,68,68,0.5)',
        });
        break;
      }
      default:
        mainSeriesRef.current = priceChartRef.current.addCandlestickSeries();
    }

    if (!volumeSeriesRef.current) {
      volumeSeriesRef.current = priceChartRef.current.addHistogramSeries({
        priceFormat: { type: 'volume' },
        priceScaleId: 'volume',
        priceLineVisible: false,
        color: '#475569',
      });
      priceChartRef.current.priceScale('volume').applyOptions({
        scaleMargins: { top: 0.8, bottom: 0 },
        borderVisible: false,
      });
    }

    return mainSeriesRef.current;
  }, [chartType, baselinePrice]);

  useEffect(() => {
    if (!priceChartRef.current) return;
    createMainSeries();
  }, [createMainSeries]);

  useEffect(() => {
    if (!packet || !mainSeriesRef.current) return;
    mainSeriesRef.current.setData(packet.candles as BarData[]);
    priceChartRef.current?.timeScale().fitContent();
    volumeSeriesRef.current?.setData(packet.volume as HistogramData<Time>[]);
    console.info('[ChartViewport] primary series updated', {
      candles: packet.candles.length,
      overlays: Object.keys(packet.overlays).length,
      comparisons: Object.keys(packet.comparisons).length,
    });

    Object.keys(overlaySeriesRef.current).forEach((key) => {
      if (!packet.overlays[key]) {
        priceChartRef.current?.removeSeries(overlaySeriesRef.current[key]);
        delete overlaySeriesRef.current[key];
      }
    });

    Object.entries(packet.overlays).forEach(([id, seriesData]) => {
      if (!overlaySeriesRef.current[id]) {
        overlaySeriesRef.current[id] = priceChartRef.current!.addLineSeries({
          color: '#fde047',
          lineWidth: 2,
        });
      }
      overlaySeriesRef.current[id].setData(seriesData as LineData<Time>[]);
    });

    Object.keys(comparisonSeriesRef.current).forEach((key) => {
      if (!packet.comparisons[key]) {
        priceChartRef.current?.removeSeries(comparisonSeriesRef.current[key]);
        delete comparisonSeriesRef.current[key];
      }
    });

    Object.entries(packet.comparisons).forEach(([symbol, seriesData]) => {
      if (!comparisonSeriesRef.current[symbol]) {
        comparisonSeriesRef.current[symbol] = priceChartRef.current!.addLineSeries({
          color: '#60a5fa',
          lineWidth: 2,
          lineStyle: LineStyle.Dotted,
        });
      }
      comparisonSeriesRef.current[symbol].setData(seriesData as LineData<Time>[]);
    });
  }, [packet]);

  useEffect(() => {
    if (!oscillatorChartRef.current) return;

    Object.values(oscillatorSeriesRef.current).forEach((series) => {
      oscillatorChartRef.current?.removeSeries(series);
    });
    oscillatorSeriesRef.current = {};

    Object.entries(packet?.oscillators ?? {}).forEach(([id, seriesData]) => {
      const series = oscillatorChartRef.current!.addLineSeries({
        color: '#22d3ee',
        lineWidth: 2,
      });
      series.setData(seriesData as LineData<Time>[]);
      oscillatorSeriesRef.current[id] = series;
    });
  }, [packet?.oscillators]);

  useEffect(() => {
    if (!priceChartRef.current || !mainSeriesRef.current) return;
    const chart = priceChartRef.current;

    const handler = (param: any) => {
      if (!param.time || !param.seriesData) return;
      const price = param.seriesData.get(mainSeriesRef.current!);
      if (!price) return;
      const value = typeof price === 'number' ? price : price.close;
      setTooltip({
        price: Number(value.toFixed(2)),
        time: new Date((param.time as number) * 1000).toLocaleString(),
      });
    };

    chart.subscribeCrosshairMove(handler);
    return () => chart.unsubscribeCrosshairMove(handler);
  }, [packet]);

  return (
    <div className="relative flex h-full flex-col gap-2">
      <div className="relative flex-1" ref={priceContainerRef}>
        {status === 'loading' && <ChartSkeleton />}
        <ChartTooltip price={tooltip.price} time={tooltip.time} />
        {renderOverlay?.(priceContainerRef)}
      </div>
      {Object.keys(packet?.oscillators ?? {}).length > 0 && (
        <div className="relative h-40" ref={oscillatorContainerRef}>
          <div className="absolute left-2 top-2 z-10 text-[10px] uppercase tracking-wide text-slate-400">
            Oscillators
          </div>
        </div>
      )}
    </div>
  );
};
