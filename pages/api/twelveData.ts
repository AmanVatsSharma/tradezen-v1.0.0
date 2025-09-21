import axios from 'axios';


export const fetchStockData = async (selectedStock: String, selectedTimeframe: String) => {
    const apiKey = process.env.TWELVE_DATA_API_KEY
    const symbol = `${selectedStock}:NASDAQ`
    const url = `https://api.twelvedata.com/time_series?symbol=${symbol}&interval=${selectedTimeframe}&outputsize=1200&apikey=${apiKey}`

    try {
        const reponse = await axios.get(url)
        const data = reponse.data
        return data
    } catch (error) {
        console.log('error fetching stock data from twelve data:', error)
    }
}