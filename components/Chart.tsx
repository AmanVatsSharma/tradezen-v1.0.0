import React, { useEffect, useRef, useState } from 'react';
import { createChart, CrosshairMode } from 'lightweight-charts';
import ChartTooltip from './ChartTooltip';
import { ChartSkeleton } from './ChartSkeleton';

interface ChartProps {
    data: any[];
    isLoading: boolean;
}

const Charts: React.FC<ChartProps> = ({ data, isLoading }) => {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<any>(null);
    const [tooltip, setTooltip] = useState({ price: 0, time: '' });

    useEffect(() => {
        if (!chartContainerRef.current) return;

        const chart = createChart(chartContainerRef.current, {
            width: chartContainerRef.current.clientWidth,
            height: chartContainerRef.current.clientHeight || 700,
            layout: {
                textColor: '#191919',
            },
            grid: {
                vertLines: {
                    color: '#eeeeee',
                },
                horzLines: {
                    color: '#eeeeee',
                },
            },
            crosshair: {
                mode: CrosshairMode.Normal,
            },
        });

        chartRef.current = chart;

        const candlestickSeries = chart.addCandlestickSeries({
            upColor: '#008a00',
            downColor: '#e40000',
            borderVisible: false,
            wickUpColor: '#008a00',
            wickDownColor: '#e40000',
        });

        chart.timeScale().fitContent();
        candlestickSeries.setData(data);

        chart.subscribeCrosshairMove((param: any) => {
            if (!param || !param.time || !param.seriesData) return;
            const price = param.seriesData.get(candlestickSeries)?.close;
            setTooltip({ price: price || 0, time: new Date(param.time * 1000).toLocaleString() });
        });

        const handleResize = () => {
            if (chartContainerRef.current) {
                chart.applyOptions({ width: chartContainerRef.current.clientWidth });
            }
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            chart.remove();
        };
    }, [data]);

    return (
        <div className="relative">
            <div ref={chartContainerRef} style={{ width: '100%', height: '100%' }}>
                {isLoading && <ChartSkeleton />}
            </div>
            <ChartTooltip price={tooltip.price} time={tooltip.time} />
        </div>
    );
};

export default Charts;
