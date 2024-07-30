// src/components/TradingViewChart.tsx
import React, { useEffect, useRef } from 'react';

interface TradingViewChartProps {
    symbol: string;
}

const TradingViewChart: React.FC<TradingViewChartProps> = ({ symbol }) => {
    const chartContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!chartContainerRef.current) return;

        new window.TradingView.widget({
            container_id: chartContainerRef.current,
            autosize: true,
            symbol: symbol,
            interval: 'D',
            timezone: 'Etc/UTC',
            theme: 'light',
            style: '1',
            locale: 'en',
            toolbar_bg: '#f1f3f6',
            enable_publishing: false,
            allow_symbol_change: true,
            save_image: false,
        });
    }, [symbol]);

    return <div ref={chartContainerRef} style={{ width: '100%', height: '500px' }} />;
};

export default TradingViewChart;
