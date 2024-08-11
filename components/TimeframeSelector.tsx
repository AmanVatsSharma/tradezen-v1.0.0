'use client';
import React from 'react';
import { Button } from './ui/button';

interface TimeframeSelectorProps {
    onChange: (timeframe: string) => void;
    selectedTimeframe: string;
}

const TimeframeSelector: React.FC<TimeframeSelectorProps> = ({ onChange, selectedTimeframe }) => {
    const timeframes = ['1min', '5min', '15min', '30min', '45min', '1h', '2h', '4h', '8h', '1day', '1week', '1month'];

    return (
        <div className="timeframe-selector border-2 box-border border-gray-300 block">
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
