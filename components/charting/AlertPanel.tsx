'use client';

import React, { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

import { useChartWorkspace } from './ChartWorkspaceContext';
import { AlertDefinition, ChartDataPacket } from './types';

interface AlertPanelProps {
  packet: ChartDataPacket | null;
}

// Simple alert console to mimic TradingView's horizontal alert list drawer.
export const AlertPanel: React.FC<AlertPanelProps> = ({ packet }) => {
  const { state, actions } = useChartWorkspace();
  const [priceInput, setPriceInput] = useState('');
  const [condition, setCondition] = useState<AlertDefinition['condition']>('above');
  const [note, setNote] = useState('');

  const lastPrice = useMemo(() => {
    const last = packet?.candles?.[packet.candles.length - 1];
    return last?.close ?? null;
  }, [packet]);

  const handleAdd = () => {
    const targetPrice = Number(priceInput || lastPrice);
    if (!targetPrice) return;
    const alert: AlertDefinition = {
      id: `alert-${Date.now()}`,
      price: targetPrice,
      condition,
      note,
      enabled: true,
      createdAt: new Date().toISOString(),
    };
    console.info('[AlertPanel] alert created', alert);
    actions.upsertAlert(alert);
    setPriceInput('');
    setNote('');
  };

  const toggleAlert = (alert: AlertDefinition, enabled: boolean) => {
    console.info('[AlertPanel] alert toggled', { id: alert.id, enabled });
    actions.toggleAlert(alert.id, enabled);
  };

  return (
    <div className="flex h-full flex-col bg-slate-950/70 p-4 text-xs text-slate-200">
      <h3 className="text-sm font-semibold text-white">Alerts</h3>
      <div className="mt-3 space-y-2 rounded-lg border border-slate-800 bg-slate-900/60 p-3">
        <Input
          type="number"
          placeholder={`Price (${lastPrice?.toFixed(2) ?? '--'})`}
          className="bg-slate-800 text-slate-100"
          value={priceInput}
          onChange={(event) => setPriceInput(event.target.value)}
        />
        <Select value={condition} onValueChange={(value) => setCondition(value as AlertDefinition['condition'])}>
          <SelectTrigger className="bg-slate-800 text-slate-100">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="above">Cross Above</SelectItem>
            <SelectItem value="below">Cross Below</SelectItem>
            <SelectItem value="cross">Cross Either</SelectItem>
          </SelectContent>
        </Select>
        <Input
          placeholder="Note"
          value={note}
          className="bg-slate-800 text-slate-100"
          onChange={(event) => setNote(event.target.value)}
        />
        <Button onClick={handleAdd}>Create Alert</Button>
      </div>

      <div className="mt-4 space-y-2 overflow-y-auto">
        {state.alerts.map((alert) => (
          <div
            key={alert.id}
            className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2"
          >
            <div>
              <div className="text-sm font-semibold text-white">
                {alert.condition.toUpperCase()} ${alert.price.toFixed(2)}
              </div>
              {alert.note && <div className="text-slate-400">{alert.note}</div>}
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={alert.enabled} onCheckedChange={(checked) => toggleAlert(alert, checked)} />
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  console.info('[AlertPanel] alert removed', { id: alert.id });
                  actions.removeAlert(alert.id);
                }}
              >
                Remove
              </Button>
            </div>
          </div>
        ))}
        {state.alerts.length === 0 && (
          <p className="text-center text-slate-500">No alerts yet.</p>
        )}
      </div>
    </div>
  );
};
