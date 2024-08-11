import axios from 'axios';


export const fetchTickerData = async (stock: string) => {
  const apiKey = process.env.TWELVE_DATA_API_KEY;
  const url = `https://api.twelvedata.com/quote?symbol=${stock}&apikey=77c05afbaac14e4f8d02c61e1a12b0ea`;

  try {
    const response = await axios.get(url);
    const data = response.data;
    return data
  } catch (error) {
    console.error('Error fetching ticker data:', error);
    throw error;
  }
};
