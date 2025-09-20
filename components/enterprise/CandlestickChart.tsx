'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
    createChart,
    CrosshairMode,
    IChartApi,
    ISeriesApi,
    Time,
} from 'lightweight-charts'

type Candle = {
    time: number
    open: number
    high: number
    low: number
    close: number
    volume?: number
}

type CandlestickChartProps = {
    data: Candle[]
    isLoading?: boolean
    showVolume?: boolean
    className?: string
}

const CandlestickChart: React.FC<CandlestickChartProps> = ({ data, isLoading, showVolume = true, className }) => {
    const wrapperRef = useRef<HTMLDivElement>(null)
    const priceContainerRef = useRef<HTMLDivElement>(null)
    const volumeContainerRef = useRef<HTMLDivElement>(null)

    const priceChartRef = useRef<IChartApi | null>(null)
    const volumeChartRef = useRef<IChartApi | null>(null)
    const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null)
    const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null)

    const [tooltip, setTooltip] = useState<{
        time: number | null
        open: number | null
        high: number | null
        low: number | null
        close: number | null
        volume: number | null
        x: number
        y: number
        visible: boolean
    }>({ time: null, open: null, high: null, low: null, close: null, volume: null, x: 0, y: 0, visible: false })

    const preparedData = useMemo((): { time: Time; open: number; high: number; low: number; close: number }[] => {
        return (data || []).map((d: Candle) => ({
            time: d.time as Time,
            open: d.open,
            high: d.high,
            low: d.low,
            close: d.close,
        }))
    }, [data])

    const preparedVolume = useMemo((): { time: Time; value: number; color: string }[] => {
        return (data || []).map((d: Candle) => ({
            time: d.time as Time,
            value: d.volume || 0,
            color: d.close >= d.open ? '#16a34a' : '#dc2626',
        }))
    }, [data])

    useEffect(() => {
        if (!priceContainerRef.current) return

        const priceChart = createChart(priceContainerRef.current, {
            width: priceContainerRef.current.clientWidth,
            height: Math.max(120, Math.floor((wrapperRef.current?.clientHeight || 500) * (showVolume ? 0.72 : 0.98))),
            layout: { textColor: '#111827', background: { type: 'Solid', color: 'transparent' } },
            grid: {
                vertLines: { color: 'rgba(17,24,39,0.08)' },
                horzLines: { color: 'rgba(17,24,39,0.08)' },
            },
            crosshair: { mode: CrosshairMode.Normal },
            rightPriceScale: { borderColor: 'rgba(17,24,39,0.12)' },
            timeScale: { borderColor: 'rgba(17,24,39,0.12)' },
        })
        priceChartRef.current = priceChart

        const candleSeries = priceChart.addCandlestickSeries({
            upColor: '#16a34a',
            downColor: '#dc2626',
            borderVisible: false,
            wickUpColor: '#16a34a',
            wickDownColor: '#dc2626',
        })
        candleSeriesRef.current = candleSeries
        candleSeries.setData(preparedData)

        if (showVolume && volumeContainerRef.current) {
            const volumeChart = createChart(volumeContainerRef.current, {
                width: volumeContainerRef.current.clientWidth,
                height: Math.max(80, Math.floor((wrapperRef.current?.clientHeight || 500) * 0.25)),
                layout: { textColor: '#4b5563', background: { type: 'Solid', color: 'transparent' } },
                grid: {
                    vertLines: { color: 'rgba(17,24,39,0.06)' },
                    horzLines: { color: 'rgba(17,24,39,0.06)' },
                },
                rightPriceScale: { borderColor: 'rgba(17,24,39,0.12)' },
                timeScale: { borderColor: 'rgba(17,24,39,0.12)' },
                crosshair: { mode: CrosshairMode.Normal },
            })
            volumeChartRef.current = volumeChart
            const volSeries = volumeChart.addHistogramSeries({
                priceFormat: { type: 'volume' },
                priceScaleId: 'right',
                base: 0,
            })
            volumeSeriesRef.current = volSeries
            volSeries.setData(preparedVolume)

            // Sync time scales
            const sync = () => {
                const logical = priceChart.timeScale().getVisibleLogicalRange()
                if (logical) {
                    volumeChart.timeScale().setVisibleLogicalRange(logical)
                }
            }
            priceChart.timeScale().subscribeVisibleLogicalRangeChange(sync)

            // Crosshair sync and tooltip
            priceChart.subscribeCrosshairMove((param: any) => {
                if (!param.point || !param.time) {
                    setTooltip((t) => ({ ...t, visible: false }))
                    return
                }
                const cdata = candleSeries.coordinateToPrice(param.point.y)
                const seriesData = param.seriesData.get(candleSeries as any) as any
                setTooltip({
                    time: (param.time as number) || null,
                    open: seriesData?.open ?? null,
                    high: seriesData?.high ?? null,
                    low: seriesData?.low ?? null,
                    close: seriesData?.close ?? null,
                    volume: (param.seriesData.get(volumeSeriesRef.current as any) as any)?.value ?? null,
                    x: param.point.x,
                    y: param.point.y,
                    visible: true,
                })
                // Mirror cursor on volume chart
                const vol = volumeChartRef.current
                if (vol) {
                    vol.setCrosshairPosition(param.point.x, param.point.y as number, volumeSeriesRef.current ?? undefined)
                }
            })
        } else {
            // Tooltip for single chart
            priceChart.subscribeCrosshairMove((param: any) => {
                if (!param.point || !param.time) {
                    setTooltip((t) => ({ ...t, visible: false }))
                    return
                }
                const seriesData = param.seriesData.get(candleSeries as any) as any
                setTooltip({
                    time: (param.time as number) || null,
                    open: seriesData?.open ?? null,
                    high: seriesData?.high ?? null,
                    low: seriesData?.low ?? null,
                    close: seriesData?.close ?? null,
                    volume: null,
                    x: param.point.x,
                    y: param.point.y,
                    visible: true,
                })
            })
        }

        priceChart.timeScale().fitContent()

        const handleResize = () => {
            if (!wrapperRef.current) return
            const wrapperHeight = wrapperRef.current.clientHeight
            const wrapperWidth = wrapperRef.current.clientWidth
            const priceHeight = Math.max(120, Math.floor(wrapperHeight * (showVolume ? 0.72 : 0.98)))
            const volumeHeight = Math.max(80, Math.floor(wrapperHeight * 0.25))
            if (priceContainerRef.current && priceChartRef.current) {
                priceChartRef.current.resize(wrapperWidth, priceHeight)
            }
            if (showVolume && volumeContainerRef.current && volumeChartRef.current) {
                volumeChartRef.current.resize(wrapperWidth, volumeHeight)
            }
        }

        window.addEventListener('resize', handleResize)
        handleResize()

        return () => {
            window.removeEventListener('resize', handleResize)
            priceChart.remove()
            priceChartRef.current = null
            candleSeriesRef.current = null
            if (volumeChartRef.current) {
                volumeChartRef.current.remove()
                volumeChartRef.current = null
                volumeSeriesRef.current = null
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // Update data without recreating charts
    useEffect(() => {
        candleSeriesRef.current?.setData(preparedData)
        if (showVolume) {
            volumeSeriesRef.current?.setData(preparedVolume)
        }
    }, [preparedData, preparedVolume, showVolume])

    return (
        <div ref={wrapperRef} className={`relative w-full h-full ${className || ''}`}>
            <div ref={priceContainerRef} className="w-full" />
            {showVolume && <div ref={volumeContainerRef} className="w-full" />}

            {tooltip.visible && (
                <div
                    className="pointer-events-none absolute rounded-md border border-border/50 bg-background/95 px-3 py-2 text-xs shadow-xl"
                    style={{ left: Math.max(8, tooltip.x - 80), top: Math.max(8, tooltip.y - 100) }}
                >
                    <div className="font-medium">{tooltip.time ? new Date(tooltip.time * 1000).toLocaleString() : ''}</div>
                    <div className="mt-1 grid grid-cols-2 gap-x-3 gap-y-0.5 font-mono">
                        <span className="text-muted-foreground">O</span>
                        <span>{tooltip.open?.toLocaleString()}</span>
                        <span className="text-muted-foreground">H</span>
                        <span>{tooltip.high?.toLocaleString()}</span>
                        <span className="text-muted-foreground">L</span>
                        <span>{tooltip.low?.toLocaleString()}</span>
                        <span className="text-muted-foreground">C</span>
                        <span>{tooltip.close?.toLocaleString()}</span>
                        {showVolume && (
                            <>
                                <span className="text-muted-foreground">Vol</span>
                                <span>{tooltip.volume?.toLocaleString()}</span>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default CandlestickChart

