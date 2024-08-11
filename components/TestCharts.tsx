import React, { useEffect, useRef, useState } from 'react';
import { createChart, CrosshairMode, PriceScaleMode } from 'lightweight-charts';
import ChartTooltip from './ChartTooltip';
import { ChartSkeleton } from './ChartSkeleton';

interface ChartProps {
    data: any[];
    isLoading: boolean;
}

const TestCharts: React.FC<ChartProps> = ({ data, isLoading }) => {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<any>(null);
    const [tooltip, setTooltip] = useState({ price: 0, time: '' });

    useEffect(() => {
        if (!chartContainerRef.current) return;

        const chart = createChart(chartContainerRef.current, {
            width: chartContainerRef.current.clientWidth,
            height: chartContainerRef.current.clientHeight || 100,
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
                chart.resize(chartContainerRef.current.clientWidth, chartContainerRef.current.clientHeight);
            }
        };

        window.addEventListener('resize', handleResize);

        handleResize();

        return () => {
            window.removeEventListener('resize', handleResize);
            chart.remove();
        };
    }, [data]);

    return (
        <div className="relative w-full h-full">
            <div className=" border-2 box-border border-gray-700 w-full h-full" ref={chartContainerRef} >
                {/* {isLoading && <ChartSkeleton />} */}
            </div>
            <ChartTooltip price={tooltip.price} time={tooltip.time} />
        </div>
    );
};

export default TestCharts;
