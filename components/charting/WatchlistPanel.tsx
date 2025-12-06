'use client';

import React, { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

import { useChartWorkspace } from './ChartWorkspaceContext';

// Sidebar replicating TradingView watchlist behavior with inline add/remove.
export const WatchlistPanel: React.FC = () => {
  const { state, actions } = useChartWorkspace();
  const [query, setQuery] = useState('');
  const [newSymbol, setNewSymbol] = useState('');

  const filteredSymbols = useMemo(() => {
    if (!query) return state.watchlist;
    return state.watchlist.filter((symbol) =>
      symbol.toLowerCase().includes(query.toLowerCase())
    );
  }, [query, state.watchlist]);

  const handleAddSymbol = () => {
    const sanitized = newSymbol.trim().toUpperCase();
    if (!sanitized) return;
    if (state.watchlist.includes(sanitized)) {
      console.info('[WatchlistPanel] symbol already tracked', { sanitized });
      setNewSymbol('');
      return;
    }
    const next = [...state.watchlist, sanitized];
    console.info('[WatchlistPanel] symbol added', { sanitized });
    actions.setWatchlist(next);
    setNewSymbol('');
  };

  const handleRemove = (symbol: string) => {
    const next = state.watchlist.filter((item) => item !== symbol);
    console.info('[WatchlistPanel] symbol removed', { symbol });
    actions.setWatchlist(next);
  };

  return (
    <div className="flex h-full flex-col bg-slate-950/60 p-3">
      <div className="space-y-2">
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search watchlist"
          className="bg-slate-900 text-slate-100"
        />
        <div className="flex gap-2">
          <Input
            value={newSymbol}
            onChange={(event) => setNewSymbol(event.target.value)}
            placeholder="Add symbol"
            className="bg-slate-900 text-slate-100"
            onKeyDown={(event) => event.key === 'Enter' && handleAddSymbol()}
          />
          <Button onClick={handleAddSymbol}>Add</Button>
        </div>
      </div>

      <ScrollArea className="mt-4 flex-1">
        <ul className="space-y-1">
          {filteredSymbols.map((symbol) => (
            <li
              key={symbol}
              className={`flex items-center justify-between rounded-md px-3 py-2 text-sm ${
                symbol === state.symbol
                  ? 'bg-sky-600 text-white'
                  : 'bg-slate-900 text-slate-200'
              }`}
            >
              <button
                className="text-left font-semibold"
                onClick={() => {
                  console.info('[WatchlistPanel] symbol selected', { symbol });
                  actions.setSymbol(symbol);
                }}
              >
                {symbol}
              </button>
              <Button
                variant="ghost"
                size="icon"
                className="text-xs text-slate-400 hover:text-red-400"
                onClick={() => handleRemove(symbol)}
              >
                ×
              </Button>
            </li>
          ))}
        </ul>
      </ScrollArea>
    </div>
  );
};
