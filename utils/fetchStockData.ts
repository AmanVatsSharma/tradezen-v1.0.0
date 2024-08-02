import axios from 'axios';

const API_KEY = process.env.ALPHA_VANTAGE_API_KEY;


type StockData = {
    time: number; // Unix timestamp
    open: number;
    high: number;
    low: number;
    close: number;
};

export const fetchStockData = async (symbol: string, timeframe: string): Promise<StockData[]> => {
    try {
        let interval = '';
        let outputsize = 'compact';
        switch (timeframe) {
            case '1D':
                interval = '1min';
                outputsize = 'full';
                break;
            case '1W':
                interval = '15min';
                outputsize = 'full';
                break;
            case '1M':
                interval = '60min';
                outputsize = 'full';
                break;
            case '1Y':
                interval = 'daily';
                break;
            case 'All':
                interval = 'weekly';
                break;
            default:
                interval = 'daily';
                break;
        }

        const response = await axios.get(`https://www.alphavantage.co/query`, {
            params: {
                function: 'TIME_SERIES_INTRADAY', // or other functions based on the timeframe
                symbol,
                interval,
                outputsize,
                apikey: API_KEY,
            },
        });

        const data = response.data[`Time Series (${interval})`];
        if (!data) {
            throw new Error('No data found for the given symbol and timeframe');
        }

        const stockData: StockData[] = Object.keys(data).map((time) => ({
            time: new Date(time).getTime() / 1000, // Convert to Unix timestamp
            open: parseFloat(data[time]['1. open']),
            high: parseFloat(data[time]['2. high']),
            low: parseFloat(data[time]['3. low']),
            close: parseFloat(data[time]['4. close']),
        }));

        return stockData;
    } catch (error) {
        console.error('Error fetching stock data:', error);
        return [];
    }
};
