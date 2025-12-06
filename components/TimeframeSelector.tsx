'use client';
import React from 'react';
import { Button } from './ui/button';

interface TimeframeSelectorProps {
    onChange: (timeframe: string) => void;
    selectedTimeframe: string;
}

const TimeframeSelector: React.FC<TimeframeSelectorProps> = ({
  onChange,
  selectedTimeframe,
}) => {
  const timeframes = [
    '1min',
    '5min',
    '15min',
    '30min',
    '45min',
    '1h',
    '2h',
    '4h',
    '8h',
    '1day',
    '1week',
    '1month',
  ];

  return (
    <div className="flex flex-wrap gap-2 rounded-2xl border border-cyan-500/30 bg-[#060f1f] p-2 text-xs">
      {timeframes.map((timeframe) => {
        const isActive = timeframe === selectedTimeframe;
        return (
          <Button
            key={timeframe}
            size="sm"
            variant="ghost"
            aria-pressed={isActive}
            className={`rounded-xl border px-4 py-1 capitalize ${
              isActive
                ? 'border-cyan-400/70 bg-cyan-500/20 text-cyan-100'
                : 'border-transparent text-slate-300 hover:border-cyan-500/40 hover:text-white'
            }`}
            onClick={() => onChange(timeframe)}
          >
            {timeframe}
          </Button>
        );
      })}
    </div>
  );
};

export default TimeframeSelector;
