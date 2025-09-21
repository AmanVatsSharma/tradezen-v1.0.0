"use client";
import React from 'react';
import { Button } from './ui/button';

interface TimeframeSelectorProps {
    onChange: (timeframe: string) => void;
    selectedTimeframe: string;
}

const TimeframeSelector: React.FC<TimeframeSelectorProps> = ({ onChange, selectedTimeframe }) => {
    const timeframes = ['1min', '5min', '15min', '30min', '45min', '1h', '2h', '4h', '8h', '1day', '1week', '1month'];

    return (
        <div className="relative">
            <div className="flex gap-1 overflow-x-auto no-scrollbar py-1">
                {timeframes.map((timeframe) => {
                    const isActive = timeframe === selectedTimeframe
                    return (
                        <button
                            key={timeframe}
                            className={`px-3 py-1.5 rounded-md text-xs sm:text-sm border whitespace-nowrap ${isActive ? 'bg-accent text-foreground' : 'bg-background hover:bg-accent/50'}`}
                            onClick={() => onChange(timeframe)}
                        >
                            {timeframe}
                        </button>
                    )
                })}
            </div>
        </div>
    );
};

export default TimeframeSelector;
