"use client"
import React, { useEffect, useMemo, useState } from 'react'

type Props = {
    selectedStock: string,
}

type Quote = {
    symbol?: string
    name?: string
    exchange?: string
    currency?: string
    datetime?: string
    close?: string
    open?: string
    high?: string
    low?: string
    volume?: string
    previous_close?: string
    change?: string
    percent_change?: string
    is_market_open?: boolean
}

const InfoBox = ({ selectedStock }: Props) => {
  const [loading, setLoading] = useState(false)
  const [quote, setQuote] = useState<Quote | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let ignore = false
    const load = async () => {
      try {
        setLoading(true)
        setError(null)
        const params = new URLSearchParams({ symbol: `${selectedStock}:NASDAQ` })
        const res = await fetch(`/api/twelve/quote?${params.toString()}`, { cache: 'no-store' })
        if (!res.ok) throw new Error('Failed to load quote')
        const data = await res.json()
        if (!ignore) setQuote(data)
      } catch (e: any) {
        if (!ignore) setError(e?.message || 'Error')
      } finally {
        if (!ignore) setLoading(false)
      }
    }
    load()
    const id = setInterval(load, 30_000)
    return () => { ignore = true; clearInterval(id) }
  }, [selectedStock])

  const changeColor = useMemo(() => {
    const pc = Number(quote?.percent_change || 0)
    return pc > 0 ? 'text-green-600' : pc < 0 ? 'text-red-600' : 'text-foreground'
  }, [quote?.percent_change])

  return (
    <aside className='hidden lg:flex w-[320px] h-screen border-l bg-card/30 backdrop-blur-sm'>
      <div className='flex-1 p-4 space-y-4 overflow-y-auto'>
        <div className='flex items-center justify-between'>
          <div>
            <div className='text-sm text-muted-foreground'>Symbol</div>
            <div className='text-xl font-semibold'>{selectedStock}</div>
          </div>
          <div className='text-right'>
            <div className={`text-2xl font-mono ${changeColor}`}>
              {quote?.close ? Number(quote.close).toLocaleString() : '—'}
            </div>
            <div className={`text-xs ${changeColor}`}>
              {quote?.percent_change ? `${Number(quote.percent_change).toFixed(2)}%` : ''}
            </div>
          </div>
        </div>

        <div className='grid grid-cols-2 gap-3 text-sm'>
          <Metric label='Open' value={quote?.open} />
          <Metric label='Prev Close' value={quote?.previous_close} />
          <Metric label='High' value={quote?.high} />
          <Metric label='Low' value={quote?.low} />
          <Metric label='Volume' value={quote?.volume} format='int' />
          <Metric label='Currency' value={quote?.currency} raw />
        </div>

        <div className='rounded-md border px-3 py-2 text-xs text-muted-foreground'>
          <div>Exchange: {quote?.exchange || '—'}</div>
          <div>Updated: {quote?.datetime ? new Date(quote.datetime).toLocaleString() : '—'}</div>
          <div>Status: {quote?.is_market_open ? 'Open' : 'Closed'}</div>
        </div>

        {loading && <div className='text-xs text-muted-foreground'>Updating…</div>}
        {error && <div className='text-xs text-red-600'>{error}</div>}
      </div>
    </aside>
  )
}

function Metric({ label, value, format, raw }: { label: string; value: string | number | undefined; format?: 'int'; raw?: boolean }) {
  let display = '—'
  if (value !== undefined && value !== null) {
    if (raw) display = String(value)
    else if (format === 'int') display = Number(value).toLocaleString()
    else display = Number(value).toLocaleString()
  }
  return (
    <div className='rounded-md border px-3 py-2'>
      <div className='text-xs text-muted-foreground'>{label}</div>
      <div className='font-mono'>{display}</div>
    </div>
  )
}

export default InfoBox