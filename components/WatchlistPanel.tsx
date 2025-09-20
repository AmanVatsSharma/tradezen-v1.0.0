"use client"
import React, { useEffect, useMemo, useState } from 'react'
import { Button } from './ui/button'

type Props = {
  selected: string
  onSelect: (symbol: string) => void
}

const STORAGE_KEY = 'tz_watchlist_v1'

const WatchlistPanel: React.FC<Props> = ({ selected, onSelect }) => {
  const [input, setInput] = useState('')
  const [items, setItems] = useState<string[]>([])

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setItems(JSON.parse(raw))
    } catch {}
  }, [])

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)) } catch {}
  }, [items])

  const add = () => {
    const v = input.trim().toUpperCase()
    if (!v) return
    if (!items.includes(v)) setItems([v, ...items])
    setInput('')
  }

  const remove = (sym: string) => setItems(items.filter(s => s !== sym))

  return (
    <div className='rounded-md border p-3 space-y-3'>
      <div className='text-sm font-medium'>Watchlist</div>
      <div className='flex gap-2'>
        <input
          value={input}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
          placeholder='e.g. AAPL'
          className='flex-1 rounded-md border px-2 py-1 text-sm bg-background'
        />
        <Button size='sm' onClick={add}>Add</Button>
      </div>
      <div className='max-h-64 overflow-y-auto space-y-1'>
        {items.length === 0 && (
          <div className='text-xs text-muted-foreground'>No symbols added.</div>
        )}
        {items.map(sym => (
          <div key={sym} className={`flex items-center justify-between rounded-md border px-2 py-1 text-sm ${selected === sym ? 'bg-accent' : ''}`}>
            <button className='text-left flex-1' onClick={() => onSelect(sym)}>{sym}</button>
            <button className='text-xs text-muted-foreground hover:text-foreground' onClick={() => remove(sym)}>Remove</button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default WatchlistPanel

