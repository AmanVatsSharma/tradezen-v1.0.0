
interface StockData {
    datetime: string | number | Date,
    open: string,
    high: string,
    low: string,
    close: string,
    volume: string
};

export function formatTwelveData(data: StockData[]) {
    return data.map((item) => ({
        time: new Date(item.datetime).getTime() / 1000,
        open: parseFloat(item.open),
        high: parseFloat(item.high),
        low: parseFloat(item.low),
        close: parseFloat(item.close),
        volume: parseInt(item.volume),
    }));
}
