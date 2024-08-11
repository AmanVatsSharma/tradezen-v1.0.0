import axios from 'axios';


export const fetchStockData = async (selectedStock: String, selectedTimeframe: String) => {

    const API_KEY = process.env.TWELVE_DATA_API_KEY

    const url = `https://api.twelvedata.com/time_series?symbol=${selectedStock}:NASDAQ&interval=${selectedTimeframe}&outputsize=1200&apikey=77c05afbaac14e4f8d02c61e1a12b0ea`


    try {
        const reponse = await axios.get(url)
        const data = reponse.data
        return data
    } catch (error) {
        console.log('error fetching stock data from twelve data:', error)
    }
}