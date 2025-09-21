import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createChart, CrosshairMode, IChartApi, ISeriesApi, Time, PriceScaleMode } from 'lightweight-charts';
import ChartTooltip from './ChartTooltip';
import { ChartSkeleton } from './ChartSkeleton';

type Candle = {
    time: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume?: number;
};

interface ChartProps {
    data: Candle[];
    isLoading?: boolean;
    showVolume?: boolean;
    showSMA?: boolean;
    showEMA?: boolean;
    showRSI?: boolean;
    logScale?: boolean;
    chartType?: 'candles' | 'area';
    compareSeries?: Array<{ id: string; label?: string; data: { time: Time; value: number }[]; color?: string }>;
}

const Charts: React.FC<ChartProps> = ({ data, isLoading, showVolume = true, showSMA = false, showEMA = false, showRSI = false, logScale = false, chartType = 'candles', compareSeries = [] }) => {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const priceContainerRef = useRef<HTMLDivElement>(null);
    const volumeContainerRef = useRef<HTMLDivElement>(null);
    const rsiContainerRef = useRef<HTMLDivElement>(null);

    const priceChartRef = useRef<IChartApi | null>(null);
    const volumeChartRef = useRef<IChartApi | null>(null);
    const rsiChartRef = useRef<IChartApi | null>(null);
    const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
    const areaSeriesRef = useRef<ISeriesApi<'Area'> | null>(null);
    const smaSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
    const emaSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
    const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);
    const rsiSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
    const compareLineSeriesRef = useRef<Record<string, ISeriesApi<'Line'>>>({});

    const [tooltip, setTooltip] = useState({ price: 0, time: '' });

    const preparedData = useMemo((): { time: Time; open: number; high: number; low: number; close: number }[] => {
        return (data || []).map((d: Candle) => ({
            time: d.time as Time,
            open: d.open,
            high: d.high,
            low: d.low,
            close: d.close,
        }));
    }, [data]);

    const preparedVolume = useMemo((): { time: Time; value: number; color: string }[] => {
        return (data || []).map((d: Candle) => ({
            time: d.time as Time,
            value: d.volume || 0,
            color: d.close >= d.open ? '#16a34a' : '#dc2626',
        }));
    }, [data]);

    const smaValues = useMemo((): { time: Time; value: number }[] => {
        const period = 20;
        const closes = data.map(d => d.close);
        const result: { time: Time; value: number }[] = [];
        for (let i = 0; i < data.length; i++) {
            if (i + 1 < period) continue;
            const slice = closes.slice(i + 1 - period, i + 1);
            const avg = slice.reduce((a, b) => a + b, 0) / period;
            result.push({ time: data[i].time as Time, value: avg });
        }
        return result;
    }, [data]);

    const emaValues = useMemo((): { time: Time; value: number }[] => {
        const period = 20;
        const k = 2 / (period + 1);
        const result: { time: Time; value: number }[] = [];
        let ema: number | null = null;
        for (let i = 0; i < data.length; i++) {
            const close = data[i].close;
            if (ema === null) ema = close;
            else ema = close * k + (1 - k) * ema;
            if (i + 1 >= period) result.push({ time: data[i].time as Time, value: ema });
        }
        return result;
    }, [data]);

    const rsiValues = useMemo((): { time: Time; value: number }[] => {
        const period = 14;
        if (data.length < period + 1) return [];
        const gains: number[] = [];
        const losses: number[] = [];
        for (let i = 1; i < data.length; i++) {
            const change = data[i].close - data[i - 1].close;
            gains.push(change > 0 ? change : 0);
            losses.push(change < 0 ? -change : 0);
        }
        const rsi: { time: Time; value: number }[] = [];
        let avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
        let avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;
        for (let i = period; i < gains.length; i++) {
            if (i > period) {
                avgGain = (avgGain * (period - 1) + gains[i]) / period;
                avgLoss = (avgLoss * (period - 1) + losses[i]) / period;
            }
            const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
            const value = avgLoss === 0 ? 100 : 100 - 100 / (1 + rs);
            rsi.push({ time: data[i + 1].time as Time, value });
        }
        return rsi;
    }, [data]);

    useEffect(() => {
        if (!priceContainerRef.current) return;

        const priceChart = createChart(priceContainerRef.current, {
            width: priceContainerRef.current.clientWidth,
            height: Math.max(120, Math.floor((wrapperRef.current?.clientHeight || 500) * ((showVolume || showRSI) ? 0.68 : 0.98))),
            layout: { textColor: '#111827', background: { type: 'Solid', color: 'transparent' } },
            grid: {
                vertLines: { color: 'rgba(17,24,39,0.08)' },
                horzLines: { color: 'rgba(17,24,39,0.08)' },
            },
            crosshair: { mode: CrosshairMode.Normal },
            rightPriceScale: { borderColor: 'rgba(17,24,39,0.12)', mode: logScale ? PriceScaleMode.Logarithmic : PriceScaleMode.Normal },
            timeScale: { borderColor: 'rgba(17,24,39,0.12)' },
        });
        priceChartRef.current = priceChart;

        if (chartType === 'candles') {
            const candle = priceChart.addCandlestickSeries({
                upColor: '#16a34a',
                downColor: '#dc2626',
                borderVisible: false,
                wickUpColor: '#16a34a',
                wickDownColor: '#dc2626',
            });
            candleSeriesRef.current = candle;
            candle.setData(preparedData);
        } else {
            const area = priceChart.addAreaSeries({ lineColor: '#0ea5e9', topColor: 'rgba(14,165,233,0.3)', bottomColor: 'rgba(14,165,233,0.0)' });
            const areaData = preparedData.map(d => ({ time: d.time, value: d.close }));
            area.setData(areaData);
            areaSeriesRef.current = area;
        }

        if (showSMA) {
            const sma = priceChart.addLineSeries({ color: '#2563eb', lineWidth: 2 });
            sma.setData(smaValues);
            smaSeriesRef.current = sma;
        }

        if (showEMA) {
            const ema = priceChart.addLineSeries({ color: '#f59e0b', lineWidth: 2 });
            ema.setData(emaValues);
            emaSeriesRef.current = ema;
        }

        if (showVolume && volumeContainerRef.current) {
            const volumeChart = createChart(volumeContainerRef.current, {
                width: volumeContainerRef.current.clientWidth,
                height: Math.max(68, Math.floor((wrapperRef.current?.clientHeight || 500) * (showRSI ? 0.16 : 0.28))),
                layout: { textColor: '#4b5563', background: { type: 'Solid', color: 'transparent' } },
                grid: {
                    vertLines: { color: 'rgba(17,24,39,0.06)' },
                    horzLines: { color: 'rgba(17,24,39,0.06)' },
                },
                rightPriceScale: { borderColor: 'rgba(17,24,39,0.12)' },
                timeScale: { borderColor: 'rgba(17,24,39,0.12)' },
                crosshair: { mode: CrosshairMode.Normal },
            });
            volumeChartRef.current = volumeChart;
            const volSeries = volumeChart.addHistogramSeries({ priceFormat: { type: 'volume' }, priceScaleId: 'right', base: 0 });
            volSeries.setData(preparedVolume);
            volumeSeriesRef.current = volSeries;

            const sync = () => {
                const range = priceChart.timeScale().getVisibleLogicalRange();
                if (range) volumeChart.timeScale().setVisibleLogicalRange(range);
            };
            priceChart.timeScale().subscribeVisibleLogicalRangeChange(sync);
        }

        if (showRSI && rsiContainerRef.current) {
            const rsiChart = createChart(rsiContainerRef.current, {
                width: rsiContainerRef.current.clientWidth,
                height: Math.max(68, Math.floor((wrapperRef.current?.clientHeight || 500) * (showVolume ? 0.16 : 0.28))),
                layout: { textColor: '#4b5563', background: { type: 'Solid', color: 'transparent' } },
                grid: {
                    vertLines: { color: 'rgba(17,24,39,0.06)' },
                    horzLines: { color: 'rgba(17,24,39,0.06)' },
                },
                rightPriceScale: { borderColor: 'rgba(17,24,39,0.12)' },
                timeScale: { borderColor: 'rgba(17,24,39,0.12)' },
                crosshair: { mode: CrosshairMode.Normal },
            });
            rsiChartRef.current = rsiChart;
            const rsiSeries = rsiChart.addLineSeries({ color: '#8b5cf6', lineWidth: 1.5 });
            rsiSeries.setData(rsiValues);
            rsiSeries.createPriceLine({ price: 70, color: 'rgba(148,163,184,0.7)' });
            rsiSeries.createPriceLine({ price: 30, color: 'rgba(148,163,184,0.7)' });
            rsiSeriesRef.current = rsiSeries;

            const syncRsi = () => {
                const range = priceChart.timeScale().getVisibleLogicalRange();
                if (range) rsiChart.timeScale().setVisibleLogicalRange(range);
            };
            priceChart.timeScale().subscribeVisibleLogicalRangeChange(syncRsi);
        }

        priceChart.timeScale().fitContent();

        priceChart.subscribeCrosshairMove((param: any) => {
            if (!param || !param.time || !param.seriesData) return;
            const price = chartType === 'candles'
                ? param.seriesData.get(candleSeriesRef.current as any)?.close
                : param.seriesData.get(areaSeriesRef.current as any)?.value;
            setTooltip({ price: price || 0, time: new Date((param.time as number) * 1000).toLocaleString() });
        });

        const handleResize = () => {
            if (!wrapperRef.current) return;
            const wrapperHeight = wrapperRef.current.clientHeight;
            const wrapperWidth = wrapperRef.current.clientWidth;
            const priceHeight = Math.max(120, Math.floor(wrapperHeight * ((showVolume || showRSI) ? 0.68 : 0.98)));
            const subPaneHeight = Math.max(68, Math.floor(wrapperHeight * (showVolume && showRSI ? 0.16 : 0.28)));
            if (priceChartRef.current) priceChartRef.current.resize(wrapperWidth, priceHeight);
            if (showVolume && volumeChartRef.current) volumeChartRef.current.resize(wrapperWidth, subPaneHeight);
            if (showRSI && rsiChartRef.current) rsiChartRef.current.resize(wrapperWidth, subPaneHeight);
        };

        window.addEventListener('resize', handleResize);
        handleResize();

        return () => {
            window.removeEventListener('resize', handleResize);
            priceChart.remove();
            priceChartRef.current = null;
            candleSeriesRef.current = null;
            areaSeriesRef.current = null;
            smaSeriesRef.current = null;
            emaSeriesRef.current = null;
            if (volumeChartRef.current) {
                volumeChartRef.current.remove();
                volumeChartRef.current = null;
                volumeSeriesRef.current = null;
            }
            if (rsiChartRef.current) {
                rsiChartRef.current.remove();
                rsiChartRef.current = null;
                rsiSeriesRef.current = null;
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Update series data without recreating charts
    useEffect(() => {
        if (chartType === 'candles') {
            if (!candleSeriesRef.current && priceChartRef.current) {
                const cs = priceChartRef.current.addCandlestickSeries({
                    upColor: '#16a34a', downColor: '#dc2626', borderVisible: false, wickUpColor: '#16a34a', wickDownColor: '#dc2626'
                });
                candleSeriesRef.current = cs;
            }
            candleSeriesRef.current?.setData(preparedData);
            if (areaSeriesRef.current && priceChartRef.current) {
                priceChartRef.current.removeSeries(areaSeriesRef.current);
                areaSeriesRef.current = null;
            }
        } else {
            const areaData = preparedData.map(d => ({ time: d.time, value: d.close }));
            if (!areaSeriesRef.current && priceChartRef.current) {
                areaSeriesRef.current = priceChartRef.current.addAreaSeries({ lineColor: '#0ea5e9', topColor: 'rgba(14,165,233,0.3)', bottomColor: 'rgba(14,165,233,0.0)' });
            }
            areaSeriesRef.current?.setData(areaData);
            if (candleSeriesRef.current && priceChartRef.current) {
                priceChartRef.current.removeSeries(candleSeriesRef.current);
                candleSeriesRef.current = null;
            }
        }
        if (showSMA) {
            if (!smaSeriesRef.current && priceChartRef.current) {
                smaSeriesRef.current = priceChartRef.current.addLineSeries({ color: '#2563eb', lineWidth: 2 });
            }
            smaSeriesRef.current?.setData(smaValues);
        } else if (smaSeriesRef.current && priceChartRef.current) {
            priceChartRef.current.removeSeries(smaSeriesRef.current);
            smaSeriesRef.current = null;
        }

        if (showEMA) {
            if (!emaSeriesRef.current && priceChartRef.current) {
                emaSeriesRef.current = priceChartRef.current.addLineSeries({ color: '#f59e0b', lineWidth: 2 });
            }
            emaSeriesRef.current?.setData(emaValues);
        } else if (emaSeriesRef.current && priceChartRef.current) {
            priceChartRef.current.removeSeries(emaSeriesRef.current);
            emaSeriesRef.current = null;
        }

        if (showVolume) {
            volumeSeriesRef.current?.setData(preparedVolume);
        }
        if (showRSI) {
            if (!rsiSeriesRef.current && rsiChartRef.current) {
                rsiSeriesRef.current = rsiChartRef.current.addLineSeries({ color: '#8b5cf6', lineWidth: 1.5 });
                rsiSeriesRef.current.createPriceLine({ price: 70, color: 'rgba(148,163,184,0.7)' });
                rsiSeriesRef.current.createPriceLine({ price: 30, color: 'rgba(148,163,184,0.7)' });
            }
            rsiSeriesRef.current?.setData(rsiValues);
        } else if (rsiSeriesRef.current && rsiChartRef.current) {
            rsiChartRef.current.removeSeries(rsiSeriesRef.current);
            rsiSeriesRef.current = null;
        }

        // Apply log scale on demand
        if (priceChartRef.current) {
            priceChartRef.current.applyOptions({ rightPriceScale: { mode: logScale ? PriceScaleMode.Logarithmic : PriceScaleMode.Normal } });
        }

        // Update compare series lines
        if (priceChartRef.current) {
            const existing = compareLineSeriesRef.current;
            const nextIds = new Set(compareSeries.map(s => s.id));
            // remove stale
            Object.keys(existing).forEach(id => {
                if (!nextIds.has(id)) {
                    priceChartRef.current?.removeSeries(existing[id]);
                    delete existing[id];
                }
            });
            // add/update
            compareSeries.forEach((s, idx) => {
                if (!existing[s.id]) {
                    existing[s.id] = priceChartRef.current!.addLineSeries({ color: s.color || ['#0ea5e9','#22c55e','#ef4444','#a855f7','#eab308'][idx % 5], lineWidth: 1.5 });
                }
                existing[s.id].setData(s.data);
            });
        }
    }, [preparedData, preparedVolume, smaValues, emaValues, rsiValues, showSMA, showEMA, showVolume, showRSI, logScale, chartType, compareSeries]);

    return (
        <div ref={wrapperRef} className="relative w-full h-full">
            <div ref={priceContainerRef} className="w-full" />
            {showVolume && <div ref={volumeContainerRef} className="w-full" />}
            {showRSI && <div ref={rsiContainerRef} className="w-full" />}
            <ChartTooltip price={tooltip.price} time={tooltip.time} />
            {isLoading && <ChartSkeleton />}
        </div>
    );
};

export default Charts;
