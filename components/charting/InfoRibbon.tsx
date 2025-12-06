'use client';

import React, { useMemo } from 'react';

import { Badge } from '@/components/ui/badge';

import { useChartWorkspace } from './ChartWorkspaceContext';
import { ChartDataPacket } from './types';

interface InfoRibbonProps {
  packet: ChartDataPacket | null;
  status: 'idle' | 'loading' | 'success' | 'error';
  error: string | null;
}

// Live quote ribbon akin to TradingView's footer status strip.
export const InfoRibbon: React.FC<InfoRibbonProps> = ({ packet, status, error }) => {
  const { state } = useChartWorkspace();

  const meta = useMemo(() => {
    if (!packet || packet.candles.length === 0) {
      return {
        lastPrice: '--',
        change: '--',
        changePct: '--',
        prevClose: '--',
      };
    }
    const candles = packet.candles;
    const last = candles[candles.length - 1];
    const prev = candles[candles.length - 2] ?? last;
    const change = last.close - prev.close;
    const changePct = (change / prev.close) * 100;
    return {
      lastPrice: last.close.toFixed(2),
      change: change.toFixed(2),
      changePct: changePct.toFixed(2),
      prevClose: prev.close.toFixed(2),
    };
  }, [packet]);

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-800 bg-slate-950/80 px-4 py-2 text-xs text-slate-200">
      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold text-white">{state.symbol}</span>
        <Badge variant="outline" className="border-slate-700 text-slate-200">
          {state.timeframe}
        </Badge>
        <span className="text-lg font-bold text-white">${meta.lastPrice}</span>
        <span
          className={`text-sm font-semibold ${
            Number(meta.change) >= 0 ? 'text-emerald-400' : 'text-rose-400'
          }`}
        >
          {Number(meta.change) >= 0 ? '+' : ''}
          {meta.change} ({meta.changePct}%)
        </span>
      </div>

      <div className="flex items-center gap-4 text-slate-400">
        <div>
          Prev Close <span className="text-white">${meta.prevClose}</span>
        </div>
        <div>Status: {status}</div>
        {error && <div className="text-rose-400">Error: {error}</div>}
      </div>
    </div>
  );
};
