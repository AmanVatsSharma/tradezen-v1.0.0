'use client';

import React, { useEffect, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { RotateCcw, Sun, Moon, PencilRuler } from 'lucide-react';

import { useChartWorkspace } from './ChartWorkspaceContext';
import { ChartType, DrawingTool, Resolution } from './types';

interface ToolbarProps {
  status: 'idle' | 'loading' | 'success' | 'error';
  lastUpdated: string | null;
  onRefresh: () => Promise<void>;
}

// TradingView-style chart type presets surfaced as quick-select buttons.
const chartTypes: Array<{ label: string; value: ChartType }> = [
  { label: 'Candle', value: 'candles' },
  { label: 'Bars', value: 'bars' },
  { label: 'Line', value: 'line' },
  { label: 'Area', value: 'area' },
  { label: 'Baseline', value: 'baseline' },
  { label: 'Heikin', value: 'heikin' },
];

const drawingTools: Array<{ label: string; value: DrawingTool }> = [
  { label: 'Trend', value: 'trendline' },
  { label: 'Ray', value: 'ray' },
  { label: 'Horizontal', value: 'horizontal' },
  { label: 'Rectangle', value: 'rectangle' },
];

const timeframes: Resolution[] = [
  '1min',
  '5min',
  '15min',
  '30min',
  '45min',
  '1h',
  '2h',
  '4h',
  '1day',
  '1week',
  '1month',
];

export const Toolbar: React.FC<ToolbarProps> = ({ status, lastUpdated, onRefresh }) => {
  const { state, actions } = useChartWorkspace();
  const [symbolInput, setSymbolInput] = useState(state.symbol);

  useEffect(() => {
    setSymbolInput(state.symbol);
  }, [state.symbol]);

  const handleSymbolChange = () => {
    const nextSymbol = symbolInput.trim().toUpperCase();
    if (!nextSymbol) return;
    console.info('[Toolbar] symbol change requested', { nextSymbol });
    actions.setSymbol(nextSymbol);
  };

  const handleTimeframeSelect = (tf: Resolution) => {
    console.info('[Toolbar] timeframe set', { tf });
    actions.setTimeframe(tf);
  };

  const handleChartTypeSelect = (chartType: ChartType) => {
    console.info('[Toolbar] chart type set', { chartType });
    actions.setChartType(chartType);
  };

  const handleActiveDrawing = (tool: DrawingTool) => {
    const nextTool = state.activeDrawingTool === tool ? null : tool;
    console.info('[Toolbar] drawing tool toggled', { tool, nextTool });
    actions.setActiveDrawing(nextTool);
  };

  const handleThemeToggle = () => {
    console.info('[Toolbar] theme toggle triggered');
    actions.toggleTheme();
  };

  const statusLabel = useMemo(() => {
    if (status === 'loading') return 'Syncing…';
    if (status === 'error') return 'Data error';
    if (status === 'success') return `Live • ${lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : 'now'}`;
    return 'Idle';
  }, [status, lastUpdated]);

  return (
    <TooltipProvider>
      <div className="flex flex-wrap items-center gap-3 border-b border-slate-800 bg-slate-900/70 px-4 py-3 text-xs text-slate-100">
        <div className="flex items-center gap-2">
          <Input
            value={symbolInput}
            onChange={(event) => setSymbolInput(event.target.value.toUpperCase())}
            onKeyDown={(event) => event.key === 'Enter' && handleSymbolChange()}
            className="w-28 bg-slate-800/60 text-slate-100"
            placeholder="Symbol"
          />
          <Button size="sm" variant="secondary" onClick={handleSymbolChange}>
            Load
          </Button>
        </div>

        <div className="flex items-center gap-1 overflow-x-auto">
          {timeframes.map((tf) => (
            <Button
              key={tf}
              size="sm"
              variant={tf === state.timeframe ? 'default' : 'ghost'}
              className={cn('capitalize', tf === state.timeframe ? 'bg-sky-500 text-white' : 'text-slate-300')}
              onClick={() => handleTimeframeSelect(tf)}
            >
              {tf}
            </Button>
          ))}
        </div>

        <Select value={state.chartType} onValueChange={(val) => handleChartTypeSelect(val as ChartType)}>
          <SelectTrigger className="w-32 bg-slate-800/60 text-slate-100">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {chartTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-1">
          {drawingTools.map((tool) => (
            <Tooltip key={tool.value}>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant={state.activeDrawingTool === tool.value ? 'default' : 'ghost'}
                  className={cn('flex items-center gap-1', state.activeDrawingTool === tool.value ? 'bg-amber-500 text-black' : 'text-slate-300')}
                  onClick={() => handleActiveDrawing(tool.value)}
                >
                  <PencilRuler className="h-3 w-3" />
                  {tool.label}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Toggle {tool.label} tool
              </TooltipContent>
            </Tooltip>
          ))}
          <Button size="sm" variant="ghost" onClick={() => actions.clearDrawings()}>
            Clear
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="sm" variant="ghost" onClick={handleThemeToggle}>
                {state.theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>Toggle theme</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="sm" variant="outline" onClick={onRefresh} disabled={status === 'loading'}>
                <RotateCcw className="mr-1 h-3 w-3" />
                Refresh
              </Button>
            </TooltipTrigger>
            <TooltipContent>Force data refresh</TooltipContent>
          </Tooltip>
          <span className="text-slate-400">{statusLabel}</span>
        </div>
      </div>
    </TooltipProvider>
  );
};
