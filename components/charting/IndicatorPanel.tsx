'use client';

import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

import { useChartWorkspace } from './ChartWorkspaceContext';
import { IndicatorConfig } from './types';

// Indicator manager mirrors TradingView modal but inline for faster workflows.

const indicatorTemplates: Record<
  string,
  Pick<IndicatorConfig, 'type' | 'params' | 'pane'>
> = {
  'EMA 21': { type: 'ema', params: { length: 21 }, pane: 'overlay' },
  'SMA 50': { type: 'sma', params: { length: 50 }, pane: 'overlay' },
  'RSI 14': { type: 'rsi', params: { length: 14 }, pane: 'separate' },
  'MACD 12/26/9': {
    type: 'macd',
    params: { fast: 12, slow: 26, signal: 9 },
    pane: 'separate',
  },
  VWAP: { type: 'vwap', params: {}, pane: 'overlay' },
};

export const IndicatorPanel: React.FC = () => {
  const { state, actions } = useChartWorkspace();
  const [template, setTemplate] = useState<keyof typeof indicatorTemplates>('EMA 21');
  const [length, setLength] = useState(21);

  const handleAdd = () => {
    const base = indicatorTemplates[template];
    if (!base) return;

    const id = `${base.type}-${Date.now()}`;
    const config: IndicatorConfig = {
      id,
      type: base.type,
      params:
        base.type === 'ema' || base.type === 'sma' || base.type === 'rsi'
          ? { length }
          : base.params,
      color: '#22d3ee',
      pane: base.pane,
      enabled: true,
    };
    console.info('[IndicatorPanel] indicator added', { id, template });
    actions.upsertIndicator(config);
  };

  const toggleIndicator = (indicator: IndicatorConfig, enabled: boolean) => {
    console.info('[IndicatorPanel] indicator toggled', {
      id: indicator.id,
      enabled,
    });
    actions.upsertIndicator({ ...indicator, enabled });
  };

  const updateParams = (indicator: IndicatorConfig, value: number) => {
    console.info('[IndicatorPanel] indicator params updated', {
      id: indicator.id,
      value,
    });
    actions.upsertIndicator({
      ...indicator,
      params: { ...indicator.params, length: value },
    });
  };

  return (
    <div className="h-full w-full bg-slate-950/40 p-4 text-xs text-slate-200">
      <h3 className="mb-3 text-sm font-semibold text-white">Indicators</h3>
      <div className="flex flex-wrap items-end gap-2 rounded-lg border border-slate-800 bg-slate-900/60 p-3">
        <div className="flex flex-col gap-1">
          <label className="text-[10px] uppercase tracking-wide text-slate-400">
            Template
          </label>
          <Select value={template} onValueChange={(value) => setTemplate(value as keyof typeof indicatorTemplates)}>
            <SelectTrigger className="w-44 bg-slate-800 text-slate-100">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(indicatorTemplates).map((label) => (
                <SelectItem key={label} value={label}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[10px] uppercase tracking-wide text-slate-400">
            Length
          </label>
          <Input
            type="number"
            value={length}
            min={1}
            className="w-20 bg-slate-800 text-slate-100"
            onChange={(event) => setLength(Number(event.target.value))}
          />
        </div>
        <Button size="sm" onClick={handleAdd}>
          Add Indicator
        </Button>
      </div>

      <div className="mt-4 space-y-2">
        {state.indicators.map((indicator) => (
          <div
            key={indicator.id}
            className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2"
          >
            <div>
              <div className="text-sm font-semibold text-white">{indicator.id}</div>
              <div className="text-slate-400">
                {indicator.type.toUpperCase()} • Pane: {indicator.pane}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {'length' in indicator.params && (
                <Input
                  type="number"
                  value={indicator.params.length}
                  onChange={(event) => updateParams(indicator, Number(event.target.value))}
                  className="w-16 bg-slate-800 text-slate-100"
                />
              )}
              <Switch
                checked={indicator.enabled}
                onCheckedChange={(checked) => toggleIndicator(indicator, checked)}
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  console.info('[IndicatorPanel] indicator removed', { id: indicator.id });
                  actions.removeIndicator(indicator.id);
                }}
              >
                Remove
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
