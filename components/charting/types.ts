// Shared charting types to keep the advanced workspace strongly typed.
// Each interface is referenced by multiple modules, so edit carefully.
export type Resolution =
  | '1min'
  | '5min'
  | '15min'
  | '30min'
  | '45min'
  | '1h'
  | '2h'
  | '4h'
  | '1day'
  | '1week'
  | '1month';

export type ChartType =
  | 'candles'
  | 'bars'
  | 'line'
  | 'area'
  | 'baseline'
  | 'heikin';

export type DrawingTool = 'trendline' | 'ray' | 'rectangle' | 'horizontal';

export interface IndicatorConfig {
  id: string;
  type: 'sma' | 'ema' | 'rsi' | 'macd' | 'vwap';
  params: Record<string, number>;
  color: string;
  pane: 'overlay' | 'separate';
  enabled: boolean;
}

export interface DrawingPoint {
  x: number; // stored as normalized 0-1 ratio to keep responsive
  y: number;
}

export interface DrawingPrimitive {
  id: string;
  tool: DrawingTool;
  points: DrawingPoint[];
  meta?: Record<string, any>;
}

export interface AlertDefinition {
  id: string;
  price: number;
  condition: 'above' | 'below' | 'cross';
  note?: string;
  enabled: boolean;
  createdAt: string;
}

export interface WorkspaceLayout {
  showWatchlist: boolean;
  showAlerts: boolean;
  indicatorPaneHeight: number;
}

export interface ChartWorkspaceState {
  symbol: string;
  comparisonSymbols: string[];
  timeframe: Resolution;
  chartType: ChartType;
  indicators: IndicatorConfig[];
  drawings: DrawingPrimitive[];
  activeDrawingTool: DrawingTool | null;
  alerts: AlertDefinition[];
  theme: 'light' | 'dark';
  layout: WorkspaceLayout;
  watchlist: string[];
}

export type ChartWorkspaceAction =
  | { type: 'SET_SYMBOL'; payload: string }
  | { type: 'SET_TIMEFRAME'; payload: Resolution }
  | { type: 'SET_CHART_TYPE'; payload: ChartType }
  | { type: 'TOGGLE_THEME' }
  | { type: 'SET_ACTIVE_DRAWING'; payload: DrawingTool | null }
  | { type: 'SET_WATCHLIST'; payload: string[] }
  | { type: 'UPSERT_INDICATOR'; payload: IndicatorConfig }
  | { type: 'REMOVE_INDICATOR'; payload: string }
  | { type: 'UPSERT_DRAWING'; payload: DrawingPrimitive }
  | { type: 'CLEAR_DRAWINGS' }
  | { type: 'UPSERT_ALERT'; payload: AlertDefinition }
  | { type: 'REMOVE_ALERT'; payload: string }
  | { type: 'TOGGLE_ALERT'; payload: { id: string; enabled: boolean } }
  | { type: 'UPDATE_LAYOUT'; payload: Partial<WorkspaceLayout> };

export interface ChartDataPacket {
  candles: Array<{
    time: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume?: number;
  }>;
  overlays: Record<string, Array<{ time: number; value: number }>>;
  oscillators: Record<string, Array<{ time: number; value: number }>>;
  volume: Array<{ time: number; value: number; color?: string }>;
  comparisons: Record<string, Array<{ time: number; value: number }>>;
  meta: {
    symbol: string;
    timezone?: string;
    currency?: string;
    lastUpdated?: string;
    source: 'twelvedata' | 'alphavantage';
  };
}

export interface UseChartDataResponse {
  packet: ChartDataPacket | null;
  status: 'idle' | 'loading' | 'success' | 'error';
  error: string | null;
  refetch: () => Promise<void>;
  lastUpdated: string | null;
}
