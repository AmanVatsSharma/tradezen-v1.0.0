'use client';

import React, { createContext, useContext, useMemo, useReducer } from 'react';

import {
  AlertDefinition,
  ChartWorkspaceAction,
  ChartWorkspaceState,
  ChartType,
  DrawingPrimitive,
  DrawingTool,
  IndicatorConfig,
  Resolution,
} from './types';

interface ChartWorkspaceContextValue {
  state: ChartWorkspaceState;
  actions: {
    setSymbol: (symbol: string) => void;
    setTimeframe: (timeframe: Resolution) => void;
    setChartType: (type: ChartType) => void;
    toggleTheme: () => void;
    setActiveDrawing: (tool: DrawingTool | null) => void;
    upsertIndicator: (config: IndicatorConfig) => void;
    removeIndicator: (id: string) => void;
    upsertDrawing: (drawing: DrawingPrimitive) => void;
    clearDrawings: () => void;
    upsertAlert: (alert: AlertDefinition) => void;
    toggleAlert: (id: string, enabled: boolean) => void;
    removeAlert: (id: string) => void;
    updateLayout: (layout: Partial<ChartWorkspaceState['layout']>) => void;
    setWatchlist: (symbols: string[]) => void;
  };
}

// Default workspace blueprint that mirrors a TradingView-like preset.
const defaultState: ChartWorkspaceState = {
  symbol: 'AAPL',
  comparisonSymbols: [],
  timeframe: '1day',
  chartType: 'candles',
  indicators: [
    {
      id: 'ema-21',
      type: 'ema',
      params: { length: 21 },
      color: '#f5a524',
      pane: 'overlay',
      enabled: true,
    },
    {
      id: 'rsi-14',
      type: 'rsi',
      params: { length: 14 },
      color: '#22d3ee',
      pane: 'separate',
      enabled: true,
    },
  ],
  drawings: [],
  activeDrawingTool: null,
  alerts: [],
  theme: 'dark',
  layout: {
    showWatchlist: true,
    showAlerts: true,
    indicatorPaneHeight: 32,
  },
  watchlist: ['AAPL', 'MSFT', 'GOOGL', 'NVDA', 'TSLA', 'META', 'AMZN'],
};

const ChartWorkspaceContext = createContext<ChartWorkspaceContextValue | null>(
  null
);

const logAction = (action: ChartWorkspaceAction, nextState: ChartWorkspaceState) => {
  console.info('[ChartWorkspace] action dispatched', {
    type: action.type,
    payload: 'payload' in action ? action.payload : 'n/a',
    summary: {
      symbol: nextState.symbol,
      timeframe: nextState.timeframe,
      indicators: nextState.indicators.length,
      drawings: nextState.drawings.length,
      alerts: nextState.alerts.length,
    },
  });
};

const reducer = (
  state: ChartWorkspaceState,
  action: ChartWorkspaceAction
): ChartWorkspaceState => {
  let nextState = state;

  switch (action.type) {
    case 'SET_SYMBOL':
      nextState = { ...state, symbol: action.payload };
      break;
    case 'SET_TIMEFRAME':
      nextState = { ...state, timeframe: action.payload };
      break;
    case 'SET_CHART_TYPE':
      nextState = { ...state, chartType: action.payload };
      break;
    case 'TOGGLE_THEME':
      nextState = { ...state, theme: state.theme === 'dark' ? 'light' : 'dark' };
      break;
    case 'SET_ACTIVE_DRAWING':
      nextState = { ...state, activeDrawingTool: action.payload };
      break;
    case 'SET_WATCHLIST':
      nextState = { ...state, watchlist: action.payload };
      break;
    case 'UPSERT_INDICATOR': {
      const exists = state.indicators.some((ind) => ind.id === action.payload.id);
      nextState = {
        ...state,
        indicators: exists
          ? state.indicators.map((ind) =>
              ind.id === action.payload.id ? action.payload : ind
            )
          : [...state.indicators, action.payload],
      };
      break;
    }
    case 'REMOVE_INDICATOR':
      nextState = {
        ...state,
        indicators: state.indicators.filter((ind) => ind.id !== action.payload),
      };
      break;
    case 'UPSERT_DRAWING': {
      const exists = state.drawings.some((d) => d.id === action.payload.id);
      nextState = {
        ...state,
        drawings: exists
          ? state.drawings.map((d) => (d.id === action.payload.id ? action.payload : d))
          : [...state.drawings, action.payload],
      };
      break;
    }
    case 'CLEAR_DRAWINGS':
      nextState = { ...state, drawings: [] };
      break;
    case 'UPSERT_ALERT': {
      const exists = state.alerts.some((alert) => alert.id === action.payload.id);
      nextState = {
        ...state,
        alerts: exists
          ? state.alerts.map((alert) =>
              alert.id === action.payload.id ? action.payload : alert
            )
          : [...state.alerts, action.payload],
      };
      break;
    }
    case 'REMOVE_ALERT':
      nextState = {
        ...state,
        alerts: state.alerts.filter((alert) => alert.id !== action.payload),
      };
      break;
    case 'TOGGLE_ALERT':
      nextState = {
        ...state,
        alerts: state.alerts.map((alert) =>
          alert.id === action.payload.id
            ? { ...alert, enabled: action.payload.enabled }
            : alert
        ),
      };
      break;
    case 'UPDATE_LAYOUT':
      nextState = {
        ...state,
        layout: { ...state.layout, ...action.payload },
      };
      break;
    default:
      nextState = state;
  }

  if (nextState !== state) {
    logAction(action, nextState);
  }

  return nextState;
};

export const ChartWorkspaceProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(reducer, defaultState);

  const actions = useMemo(() => {
    return {
      setSymbol: (symbol: string) => dispatch({ type: 'SET_SYMBOL', payload: symbol }),
      setTimeframe: (timeframe: Resolution) =>
        dispatch({ type: 'SET_TIMEFRAME', payload: timeframe }),
      setChartType: (type: ChartType) =>
        dispatch({ type: 'SET_CHART_TYPE', payload: type }),
      toggleTheme: () => dispatch({ type: 'TOGGLE_THEME' }),
      setActiveDrawing: (tool: DrawingTool | null) =>
        dispatch({ type: 'SET_ACTIVE_DRAWING', payload: tool }),
      upsertIndicator: (config: IndicatorConfig) =>
        dispatch({ type: 'UPSERT_INDICATOR', payload: config }),
      removeIndicator: (id: string) =>
        dispatch({ type: 'REMOVE_INDICATOR', payload: id }),
      upsertDrawing: (drawing: DrawingPrimitive) =>
        dispatch({ type: 'UPSERT_DRAWING', payload: drawing }),
      clearDrawings: () => dispatch({ type: 'CLEAR_DRAWINGS' }),
      upsertAlert: (alert: AlertDefinition) =>
        dispatch({ type: 'UPSERT_ALERT', payload: alert }),
      toggleAlert: (id: string, enabled: boolean) =>
        dispatch({ type: 'TOGGLE_ALERT', payload: { id, enabled } }),
      removeAlert: (id: string) => dispatch({ type: 'REMOVE_ALERT', payload: id }),
      updateLayout: (layout: Partial<ChartWorkspaceState['layout']>) =>
        dispatch({ type: 'UPDATE_LAYOUT', payload: layout }),
      setWatchlist: (symbols: string[]) =>
        dispatch({ type: 'SET_WATCHLIST', payload: symbols }),
    };
  }, []);

  return (
    <ChartWorkspaceContext.Provider value={{ state, actions }}>
      {children}
    </ChartWorkspaceContext.Provider>
  );
};

export const useChartWorkspace = () => {
  const context = useContext(ChartWorkspaceContext);
  if (!context) {
    throw new Error('useChartWorkspace must be used inside ChartWorkspaceProvider');
  }
  return context;
};
