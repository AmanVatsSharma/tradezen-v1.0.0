// src/pages/api/data.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { symbol } = req.query;
    const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
    const interval = '5min';
    const url = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=${interval}&apikey=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    const timeSeries = data['Time Series (5min)'];
    const chartData = Object.keys(timeSeries).map((key) => ({
        date: key,
        open: parseFloat(timeSeries[key]['1. open']),
        high: parseFloat(timeSeries[key]['2. high']),
        low: parseFloat(timeSeries[key]['3. low']),
        close: parseFloat(timeSeries[key]['4. close']),
    }));

    res.status(200).json(chartData);
}
