'use client';

import React, { useEffect, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useChartWorkspace } from './ChartWorkspaceContext';
import { ChartType, DrawingTool } from './types';
import { Moon, PencilRuler, RefreshCw, Sparkles, Sun } from 'lucide-react';

interface BrandControlsBarProps {
  status: 'idle' | 'loading' | 'success' | 'error';
  lastUpdated: string | null;
  onRefresh: () => Promise<void>;
}

const chartTypes: Array<{ label: string; value: ChartType }> = [
  { label: 'Candle', value: 'candles' },
  { label: 'Bars', value: 'bars' },
  { label: 'Line', value: 'line' },
  { label: 'Area', value: 'area' },
  { label: 'Baseline', value: 'baseline' },
  { label: 'Heikin Ashi', value: 'heikin' },
];

const drawingTools: Array<{ label: string; value: DrawingTool }> = [
  { label: 'Trend', value: 'trendline' },
  { label: 'Ray', value: 'ray' },
  { label: 'Horizontal', value: 'horizontal' },
  { label: 'Box', value: 'rectangle' },
];

export const BrandControlsBar: React.FC<BrandControlsBarProps> = ({
  status,
  lastUpdated,
  onRefresh,
}) => {
  const { state, actions } = useChartWorkspace();
  const [symbolInput, setSymbolInput] = useState(state.symbol);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    setSymbolInput(state.symbol);
  }, [state.symbol]);

  const handleSymbolChange = () => {
    const next = symbolInput.trim().toUpperCase();
    if (!next) return;
    actions.setSymbol(next);
    console.info('[BrandControlsBar] symbol updated', { symbol: next });
  };

  const handleDrawingToggle = (tool: DrawingTool) => {
    const nextTool = state.activeDrawingTool === tool ? null : tool;
    actions.setActiveDrawing(nextTool);
    console.info('[BrandControlsBar] drawing toggled', { tool, nextTool });
  };

  const statusLabel = useMemo(() => {
    if (status === 'loading') return 'Syncing data…';
    if (status === 'error') return 'Data error';
    if (status === 'success') {
      return `Live ${lastUpdated ? `• ${new Date(lastUpdated).toLocaleTimeString()}` : ''}`;
    }
    return 'Idle';
  }, [status, lastUpdated]);

  const refreshData = async () => {
    try {
      setIsRefreshing(true);
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <TooltipProvider>
      <div className="mt-4 rounded-2xl border border-cyan-500/40 bg-gradient-to-r from-[#111e3f] via-[#0a1428] to-[#050912] p-4 shadow-[0_15px_60px_rgba(6,10,24,0.65)] text-xs text-slate-200">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Input
              value={symbolInput}
              onChange={(event) => setSymbolInput(event.target.value.toUpperCase())}
              onKeyDown={(event) => event.key === 'Enter' && handleSymbolChange()}
              placeholder="Symbol"
              className="w-24 rounded-xl border border-cyan-400/40 bg-[#061028] text-slate-100 placeholder:text-slate-500"
            />
            <Button
              size="sm"
              className="rounded-xl bg-cyan-500/90 text-black hover:bg-cyan-400"
              onClick={handleSymbolChange}
            >
              Load
            </Button>
          </div>

          <Select value={state.chartType} onValueChange={(val) => actions.setChartType(val as ChartType)}>
            <SelectTrigger className="w-36 rounded-xl border border-cyan-500/40 bg-[#061028] text-slate-100">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#050b18] text-slate-100">
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
                    variant="ghost"
                    className={`rounded-xl border border-transparent text-slate-200 hover:border-cyan-400/60 ${
                      state.activeDrawingTool === tool.value
                        ? 'border-cyan-400/60 bg-cyan-500/20 text-cyan-200'
                        : ''
                    }`}
                    onClick={() => handleDrawingToggle(tool.value)}
                  >
                    <PencilRuler className="mr-1 h-3 w-3" />
                    {tool.label}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Toggle {tool.label}</TooltipContent>
              </Tooltip>
            ))}
            <Button
              size="sm"
              variant="ghost"
              className="rounded-xl border border-transparent text-slate-300 hover:border-rose-500/60 hover:text-rose-200"
              onClick={() => actions.clearDrawings()}
            >
              Clear
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="rounded-full border border-cyan-400/40 bg-[#061028] text-cyan-200"
                  onClick={() => actions.toggleTheme()}
                >
                  {state.theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Toggle theme</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  className="rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 text-black shadow-lg hover:from-cyan-400"
                  onClick={refreshData}
                  disabled={status === 'loading' || isRefreshing}
                >
                  <RefreshCw className="mr-1 h-3 w-3" />
                  Refresh
                </Button>
              </TooltipTrigger>
              <TooltipContent>Force data refresh</TooltipContent>
            </Tooltip>
          </div>

          <div className="ml-auto flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-wide text-slate-300">
            <Sparkles className="h-3 w-3 text-cyan-300" />
            <span>{statusLabel}</span>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};
