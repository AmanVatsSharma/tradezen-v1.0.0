// src/pages/index.tsx
'use client'
import React, { useEffect, useState } from 'react';
import { fetchStockData } from '@/utils/fetchStockData';
import StockSidebar from '@/components/StockSidebar';
import Charts from '@/components/Chart';
import { ChartSkeleton } from '@/components/ChartSkeleton';
import TimeframeSelector from '@/components/TimeframeSelector';

type Props = {}

type StockData = {
  time: number; // Unix timestamp
  open: number;
  high: number;
  low: number;
  close: number;
};


const demoData: StockData[] = [
  // Use Unix timestamps for demo data as well
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

const stocks = ['AAPL', 'GOOGL', 'MSFT'];

const Page = (props: Props) => {
  const [selectedStock, setSelectedStock] = useState(stocks[0]);
  const [stockData, setStockData] = useState<StockData[]>(demoData);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState('1D');

  useEffect(() => {
    const getData = async () => {
      setIsLoading(true);
      const data = await fetchStockData(selectedStock, selectedTimeframe);
      setStockData(data.length ? data : demoData); // Fallback to demo data if API call fails
      setIsLoading(false); // End loading
    };
    getData();
  }, [selectedStock, selectedTimeframe]);

  return (
    <div className='flex'>
      <div className="flex-1 p-3">
        {/* <TimeframeSelector
          selectedTimeframe={selectedTimeframe}
          onChange={setSelectedTimeframe}
        /> */}

        <Charts data={stockData} isLoading={isLoading} />
        {/* <ChartSkeleton/> */}
      </div>
      <StockSidebar
        stocks={stocks}
        selectedStock={selectedStock}
        onSelectStock={setSelectedStock}
      />
    </div>
  );
};

export default Page;
