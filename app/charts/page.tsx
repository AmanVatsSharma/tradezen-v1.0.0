// src/pages/index.tsx
'use client';

import React, { useRef } from 'react';

import InfoBox from '@/components/InfoBox';
import StockSidebar from '@/components/StockSidebar';
import TimeframeSelector from '@/components/TimeframeSelector';
import { BrandControlsBar } from '@/components/charting/BrandControlsBar';
import { ChartViewport } from '@/components/charting/ChartViewport';
import { ChartWorkspaceProvider, useChartWorkspace } from '@/components/charting/ChartWorkspaceContext';
import { AlertPanel } from '@/components/charting/AlertPanel';
import { IndicatorPanel } from '@/components/charting/IndicatorPanel';
import { DrawingLayer } from '@/components/charting/drawings/DrawingLayer';
import { useChartData } from '@/components/charting/hooks/useChartData';
import { Resolution } from '@/components/charting/types';

const FALLBACK_STOCKS = ['AAPL', 'GOOGL', 'MSFT', 'INFY', 'RELIANCE', 'HDFCBANK', 'ICICIBANK'];

const ChartPage = () => {
  return (
    <ChartWorkspaceProvider>
      <ClassicChartLayout />
    </ChartWorkspaceProvider>
  );
};

const ClassicChartLayout = () => {
  const { state, actions } = useChartWorkspace();
  const chartOverlayRef = useRef<HTMLDivElement | null>(null);
  const { packet, status, error, refetch, lastUpdated } = useChartData({
    symbol: state.symbol,
    timeframe: state.timeframe,
    comparisonSymbols: state.comparisonSymbols,
    indicators: state.indicators,
  });

  const stocks = state.watchlist.length ? state.watchlist : FALLBACK_STOCKS;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#040713] text-white">
      <div className="flex h-full flex-1 flex-col bg-gradient-to-b from-[#060d1f] to-[#02040a]">
        <div className="border-b border-white/5 px-8 pt-8 pb-4">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.5em] text-cyan-300">TradeZen Terminal</p>
              <h1 className="text-3xl font-semibold text-white">Pro Charting Suite</h1>
              <p className="text-sm text-slate-400">Ultimate TradingView-grade tools in TradeZen colors</p>
            </div>
            <div className="text-sm text-slate-300">
              <p>Symbol • {state.symbol}</p>
              {lastUpdated && (
                <p className="text-xs text-slate-500">
                  Updated {new Date(lastUpdated).toLocaleTimeString()}
                </p>
              )}
            </div>
          </div>
          <div className="mt-4">
            <TimeframeSelector
              selectedTimeframe={state.timeframe}
              onChange={(timeframe) => actions.setTimeframe(timeframe as Resolution)}
            />
          </div>
          <BrandControlsBar status={status} lastUpdated={lastUpdated} onRefresh={refetch} />
        </div>

        <div className="flex flex-1 flex-col gap-6 px-8 py-6">
          <div className="relative flex-1 rounded-3xl border border-white/10 bg-gradient-to-br from-[#0b1734] via-[#050d21] to-[#02040a] shadow-[0px_40px_120px_rgba(0,3,12,0.85)]">
            <ChartViewport
              packet={packet}
              status={status}
              chartType={state.chartType}
              theme={state.theme}
              mainContainerRef={chartOverlayRef}
              renderOverlay={(ref) => <DrawingLayer containerRef={ref} />}
            />
            {error && (
              <div className="pointer-events-none absolute bottom-6 left-6 rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-2 text-xs text-rose-100">
                {error}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-[#060d1f]/80 p-2 shadow-inner">
              <IndicatorPanel />
            </div>
            <div className="rounded-3xl border border-white/10 bg-[#060d1f]/80 p-2 shadow-inner">
              <AlertPanel packet={packet} />
            </div>
          </div>
        </div>
      </div>

      <InfoBox
        packet={packet}
        status={status}
        lastUpdated={lastUpdated}
        symbol={state.symbol}
        timeframe={state.timeframe}
      />

      <StockSidebar
        stocks={stocks}
        selectedStock={state.symbol}
        onSelectStock={(ticker) => actions.setSymbol(ticker)}
      />
    </div>
  );
};

export default ChartPage;
