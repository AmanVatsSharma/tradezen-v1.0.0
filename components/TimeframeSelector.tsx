'use client';
import React from 'react';
import { Button } from './ui/button';

interface TimeframeSelectorProps {
    onChange: (timeframe: string) => void;
    selectedTimeframe: string;
}

const TimeframeSelector: React.FC<TimeframeSelectorProps> = ({ onChange, selectedTimeframe }) => {
    const timeframes = ['1m', '3m', '5m', '10m', '15m', '30m', '1H', '1D', '1W', '1M', '1Y', 'All'];

    return (
        <div className="timeframe-selector">
            {timeframes.map((timeframe) => (
                <Button
                    key={timeframe}
                    className={`timeframe-button p-2 ml-1 ${timeframe === selectedTimeframe ? 'active' : ''}`}
                    onClick={() => onChange(timeframe)}
                >
                    {timeframe}
                </Button>
            ))}
        </div>
    );
};

export default TimeframeSelector;
