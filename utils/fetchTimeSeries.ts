export type TimeSeriesResponse = {
  meta?: unknown
  values?: Array<{
    datetime: string
    open: string
    high: string
    low: string
    close: string
    volume?: string
  }>
  status?: string
}

export async function fetchTimeSeries(symbol: string, interval: string, outputsize = '1200'): Promise<TimeSeriesResponse> {
  const params = new URLSearchParams({ symbol, interval, outputsize })
  const res = await fetch(`/api/twelve/time-series?${params.toString()}`, { cache: 'no-store' })
  if (!res.ok) {
    throw new Error('Failed to fetch time series')
  }
  return res.json()
}

