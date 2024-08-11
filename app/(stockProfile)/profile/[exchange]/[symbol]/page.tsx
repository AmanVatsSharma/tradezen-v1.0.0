'use client';
import { fetchTickerData } from '@/utils/fetchTickerData';
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { fetchLogo } from '@/utils/fundamentals/fetchLogo';

type Props = {};

interface StockData {
  symbol: string;

  name: string;
  price: number;
  change: number;
  logo: string;
  exchange: string;
  currency: string;
  close: string;
  datetime: string;
  is_market_open: boolean;
  percent_change: string;
}

const StockProfile = (props: Props) => {
  const [loading, setLoading] = useState(true);
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [logo, setLogo] = useState()
  const params = useParams();

  const exchange = Array.isArray(params?.exchange) ? params.exchange[0] : params?.exchange;
  const symbol = Array.isArray(params?.symbol) ? params.symbol[0] : params?.symbol;

  useEffect(() => {
    const fetchData = async () => {
      if (symbol && exchange) {
        try {
          const data = await fetchTickerData(`${symbol}:${exchange}`);
          const fetchedLogo = await fetchLogo(`${symbol}:${exchange}`);
          setStockData(data);
          setLogo(fetchedLogo)
        } catch (error) {
          console.error('Error fetching stock data:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [exchange, symbol]);

  if (loading) {
    return <div className="container mx-auto p-4">Loading...</div>;
  }

  if (!stockData) {
    return <div className="container mx-auto p-4">No data available</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <img src={logo} alt={`${stockData.name} logo`} />
      <h1>{stockData.symbol} </h1>
      <h1>{stockData.exchange}</h1>
      <h1>{stockData.currency}</h1>
      <h1>{stockData.close}</h1>
      <h1>{stockData.datetime}</h1>
      <h1>{stockData.is_market_open}</h1>
      <h1>{stockData.percent_change}</h1>
      <h1>{stockData.name}</h1>
      <p>Price: {stockData.price}</p>
      <p>Change: {stockData.change}</p>
      <p>Exchange: {stockData.exchange}</p>
    </div>
  );
};

export default StockProfile;
