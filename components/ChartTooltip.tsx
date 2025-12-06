'use client';

import React from 'react';

interface TooltipProps {
  price: number;
  time: string;
}

// Floating tooltip that mirrors TradingView's inline HUD.
const ChartTooltip: React.FC<TooltipProps> = ({ price, time }) => {
  return (
    <div className="pointer-events-none absolute left-4 top-4 rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-xs text-slate-100 shadow-2xl backdrop-blur">
      <div className="text-[10px] uppercase tracking-wide text-slate-400">Price</div>
      <div className="text-base font-semibold text-emerald-400">${price?.toFixed(2) ?? '--'}</div>
      <div className="text-[10px] uppercase tracking-wide text-slate-500">Time</div>
      <div className="text-xs">{time || 'Waiting…'}</div>
    </div>
  );
};

export default ChartTooltip;
