import React from 'react';

import { ChartDataPacket } from '@/components/charting/types';

type InfoBoxProps = {
  packet: ChartDataPacket | null;
  status: 'idle' | 'loading' | 'success' | 'error';
  lastUpdated: string | null;
  symbol: string;
  timeframe: string;
};

const numberFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 2,
});

const InfoBox: React.FC<InfoBoxProps> = ({ packet, status, lastUpdated, symbol, timeframe }) => {
  const candles = packet?.candles ?? [];
  const last = candles[candles.length - 1];
  const prev = candles[candles.length - 2] ?? last;

  const change = last && prev ? last.close - prev.close : 0;
  const changePct = prev ? (change / prev.close) * 100 : 0;

  const metrics = [
    { label: 'Open', value: last ? numberFormatter.format(last.open) : '--' },
    { label: 'High', value: last ? numberFormatter.format(last.high) : '--' },
    { label: 'Low', value: last ? numberFormatter.format(last.low) : '--' },
    { label: 'Close', value: last ? numberFormatter.format(last.close) : '--' },
    {
      label: 'Volume',
      value: last?.volume ? `${(last.volume / 1_000_000).toFixed(2)}M` : '--',
    },
    {
      label: 'Source',
      value: packet?.meta?.source?.toUpperCase() ?? 'TWELVEDATA',
    },
  ];

  return (
    <div className="hidden h-full w-[320px] flex-col bg-gradient-to-b from-[#09122b] via-[#050c1a] to-[#050912] text-white shadow-[0_25px_60px_rgba(2,6,23,0.75)] xl:flex">
      <div className="border-b border-white/10 p-6">
        <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">Focus Symbol</p>
        <h2 className="mt-2 text-3xl font-semibold">{symbol}</h2>
        <div className="mt-2 inline-flex items-center rounded-full border border-cyan-400/40 bg-cyan-500/10 px-3 py-1 text-xs uppercase tracking-wide text-cyan-200">
          {timeframe}
        </div>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto p-6 text-sm">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">Status</p>
          <p className="text-lg font-semibold text-white">
            {status === 'loading' ? 'Syncing market feed…' : status === 'error' ? 'Data unavailable' : 'Live data'}
          </p>
          {lastUpdated && (
            <p className="text-xs text-slate-400">Updated {new Date(lastUpdated).toLocaleTimeString()}</p>
          )}
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-400">Last Price</p>
          <p className="text-3xl font-semibold text-white">
            {last ? numberFormatter.format(last.close) : '--'}
          </p>
          <p
            className={`text-sm font-semibold ${
              change >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {change >= 0 ? '+' : ''}
            {numberFormatter.format(change)} ({changePct ? changePct.toFixed(2) : '0.00'}%)
          </p>
        </div>

        <div className="space-y-2 rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-400">Session Meta</p>
          <div className="text-sm text-slate-200">
            <p>Timezone: {packet?.meta?.timezone ?? 'N/A'}</p>
            <p>Currency: {packet?.meta?.currency ?? 'USD'}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 border-t border-white/10 p-6 text-xs uppercase tracking-wide text-slate-400">
        {metrics.map((metric) => (
          <div key={metric.label} className="rounded-xl border border-white/5 bg-white/5 p-3">
            <p>{metric.label}</p>
            <p className="text-lg font-semibold text-white">{metric.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InfoBox;