'use client';

import React, { useRef } from 'react';

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';

import { ChartViewport } from './ChartViewport';
import { AlertPanel } from './AlertPanel';
import { DrawingLayer } from './drawings/DrawingLayer';
import { IndicatorPanel } from './IndicatorPanel';
import { InfoRibbon } from './InfoRibbon';
import { Toolbar } from './Toolbar';
import { WatchlistPanel } from './WatchlistPanel';
import { useChartWorkspace } from './ChartWorkspaceContext';
import { useChartData } from './hooks/useChartData';

// Advanced workspace replicates TradingView layout (watchlist | chart stack | alerts).
export const AdvancedChartWorkspace: React.FC = () => {
  const { state } = useChartWorkspace();
  const chartOverlayRef = useRef<HTMLDivElement | null>(null);

  const { packet, status, error, refetch, lastUpdated } = useChartData({
    symbol: state.symbol,
    timeframe: state.timeframe,
    comparisonSymbols: state.comparisonSymbols,
    indicators: state.indicators,
  });

  return (
    <div className="flex h-full w-full flex-col bg-slate-950 text-slate-50">
      <Toolbar status={status} lastUpdated={lastUpdated} onRefresh={refetch} />

      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          <ResizablePanel defaultSize={18} minSize={12}>
            <WatchlistPanel />
          </ResizablePanel>

          <ResizableHandle withHandle />

          <ResizablePanel defaultSize={62} minSize={50}>
            <ResizablePanelGroup direction="vertical">
              <ResizablePanel defaultSize={72} minSize={50}>
                <div className="relative h-full rounded-xl border border-slate-800 bg-slate-900/60">
                  <ChartViewport
                    packet={packet}
                    status={status}
                    chartType={state.chartType}
                    theme={state.theme}
                    mainContainerRef={chartOverlayRef}
                    renderOverlay={(ref) => <DrawingLayer containerRef={ref} />}
                  />
                </div>
              </ResizablePanel>
              <ResizableHandle />
              <ResizablePanel defaultSize={28} minSize={18}>
                <IndicatorPanel />
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>

          <ResizableHandle withHandle />

          <ResizablePanel defaultSize={20} minSize={16}>
            <AlertPanel packet={packet} />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      <InfoRibbon packet={packet} status={status} error={error} />
    </div>
  );
};
