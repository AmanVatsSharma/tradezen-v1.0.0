import axios from 'axios';

// Runtime helper for TwelveData with robust error logs + env-driven keys.
export const fetchStockData = async (selectedStock: string, selectedTimeframe: string) => {
  const apiKey = process.env.TWELVE_DATA_API_KEY;
  if (!apiKey) {
    throw new Error('Missing TWELVE_DATA_API_KEY in environment variables');
  }

  const normalizedSymbol = selectedStock.includes(':')
    ? selectedStock
    : `${selectedStock}:NASDAQ`;

  const url = `https://api.twelvedata.com/time_series?symbol=${normalizedSymbol}&interval=${selectedTimeframe}&outputsize=1200&apikey=${apiKey}`;

  try {
    console.info('[fetchStockData] requesting TwelveData', {
      symbol: normalizedSymbol,
      timeframe: selectedTimeframe,
    });
    const response = await axios.get(url);
    if (!response?.data) {
      throw new Error('No payload returned from TwelveData');
    }
    return response.data;
  } catch (error) {
    console.error('[fetchStockData] upstream error', error);
    throw error;
  }
};