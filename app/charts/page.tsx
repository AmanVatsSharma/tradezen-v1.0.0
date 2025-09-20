// src/pages/index.tsx
'use client'
import React, { useEffect, useState } from 'react'
import StockSidebar from '@/components/StockSidebar'
import { ChartSkeleton } from '@/components/ChartSkeleton'
import TimeframeSelector from '@/components/TimeframeSelector'
import InfoBox from '@/components/InfoBox'
import CandlestickChart from '@/components/enterprise/CandlestickChart'
import { fetchTimeSeries } from '@/utils/fetchTimeSeries'
import WatchlistPanel from '@/components/WatchlistPanel'

type Props = {}

type StockData = {
  time: string | number | Date;
  open: string | number;
  high: string | number;
  low: string | number;
  close: string | number;
  volume?: string | number

};


const demoData: StockData[] = [
  { time: 1513977600, open: 75.16, high: 82.84, low: 36.16, close: 45.72 },
  { time: 1514064000, open: 45.12, high: 53.90, low: 45.12, close: 48.09 },
  { time: 1514150400, open: 60.71, high: 60.71, low: 53.39, close: 59.29 },
  { time: 1514236800, open: 68.26, high: 68.26, low: 59.04, close: 60.50 },
  { time: 1514323200, open: 67.71, high: 105.85, low: 66.67, close: 91.04 },
  { time: 1514409600, open: 91.04, high: 121.40, low: 82.70, close: 111.40 },
  { time: 1514496000, open: 111.51, high: 142.83, low: 103.34, close: 131.25 },
  { time: 1514582400, open: 131.33, high: 151.17, low: 77.68, close: 96.43 },
  { time: 1514668800, open: 106.33, high: 110.20, low: 90.39, close: 98.10 },
  { time: 1514755200, open: 109.87, high: 114.69, low: 85.66, close: 111.26 },
];

const stocks = ['AAPL', 'GOOGL', 'MSFT', 'INFY', 'RELIANCE', 'HDFCBANK', 'ICICIBANK'];

const Page = (props: Props) => {
  const [selectedStock, setSelectedStock] = useState(stocks[0])
  const [stockData, setStockData] = useState<StockData[]>(demoData)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTimeframe, setSelectedTimeframe] = useState('1day')
  const [showVolume, setShowVolume] = useState<boolean>(true)

  useEffect(() => {
    const getData = async () => {
      try {
        setIsLoading(true)
        const ts = await fetchTimeSeries(`${selectedStock}:NASDAQ`, selectedTimeframe)
        const values = ts.values || []
        const formatted = values.map((v) => ({
          time: new Date(v.datetime).getTime() / 1000,
          open: parseFloat(v.open),
          high: parseFloat(v.high),
          low: parseFloat(v.low),
          close: parseFloat(v.close),
          volume: v.volume ? parseInt(v.volume) : undefined,
        })) as StockData[]
        const sortedData = formatted.sort((a, b) => (a.time as number) - (b.time as number))
        setStockData(sortedData.length ? sortedData : demoData)
      } catch (e) {
        setStockData(demoData)
      } finally {
        setIsLoading(false)
      }
    }
    getData()
  }, [selectedStock, selectedTimeframe])

  return (
    <div className='flex w-screen h-screen overflow-hidden'>
      <div className="hidden lg:block">
        <StockSidebar
          stocks={stocks}
          selectedStock={selectedStock}
          onSelectStock={setSelectedStock}
        />
      </div>

      <div className="flex-1 w-full h-screen flex flex-col">
        <div className="px-2 sm:px-4 py-2 border-b flex items-center gap-2">
          <TimeframeSelector
            selectedTimeframe={selectedTimeframe}
            onChange={setSelectedTimeframe}
          />
          <div className="ml-auto flex items-center gap-2">
            <button
              className={`px-3 py-1.5 rounded-md border text-xs ${showVolume ? 'bg-accent' : 'bg-background'}`}
              onClick={() => setShowVolume(v => !v)}
            >
              Volume
            </button>
            <button
              className="px-3 py-1.5 rounded-md border text-xs bg-background hover:bg-accent/50"
              onClick={() => {
                // trigger refetch by toggling timeframe quickly
                setSelectedTimeframe(tf => tf)
              }}
            >
              Refresh
            </button>
          </div>
        </div>
        <div className="relative flex-1">
          {isLoading && <ChartSkeleton />}
          <CandlestickChart data={stockData} showVolume={showVolume} className="absolute inset-0" />
        </div>
      </div>

      <div className='hidden xl:flex w-[360px] h-screen border-l bg-background/40 flex-col'>
        <div className='p-3 border-b'>
          <WatchlistPanel selected={selectedStock} onSelect={setSelectedStock} />
        </div>
        <InfoBox selectedStock={selectedStock} />
      </div>
    </div>
  )
};

export default Page;
