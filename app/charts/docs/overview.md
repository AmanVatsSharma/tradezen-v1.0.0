# Chart Workspace Discovery & Gap Analysis

## Current Implementation Snapshot
- `app/charts/page.tsx` renders a single lightweight-charts candlestick via `TestCharts`, basic timeframe buttons, static stock list sidebar, and placeholder info card.
- Data comes from `fetchStockData` (TwelveData) with minimal formatting, single symbol/timeframe, and no caching or streaming.
- Interaction set is limited to built-in crosshair, tooltip, and full-view resize.
- No layout presets, overlays, indicator management, drawings, alerts, or theming options.

## TradingView-Level Feature Targets
| Area | TradingView Advanced Expectations | Current State | Gap |
| --- | --- | --- | --- |
| Layout & UX | Dockable panes, responsive toolbars, watchlists, info panels, floating modals | Single flex layout, static sidebar | Need workspace shell, resizable panes, multi-panel support |
| Chart Types | Candles, bars, hollow, Heikin Ashi, area, baseline, compare symbols | Basic candlestick only | Add dynamic series + overlays |
| Indicators & Studies | Library of indicators (SMA, EMA, RSI, MACD, Volume, custom) with stacked panes | None | Build indicator engine & UI manager |
| Drawing Tools | Trend lines, rays, fib retracements, shapes, text, ruler | None | Add drawing layer + state management |
| Data Handling | Multi-symbol/timeframe, caching, streaming/polling, robust error handling | Single fetch, no retry | Build data service w/ caching, console tracing, failure recovery |
| Alerts & Events | Price alerts w/ management UI | None | Provide alert placement basics + logging |
| Docs & Diagnostics | Module docs, flowcharts, pervasive console logging, comments | None | Create docs + instrumentation per module |

## Data / State Flow (Mermaid)
```mermaid
direction TB
subgraph UI
Toolbar --> WorkspaceState
Watchlist --> WorkspaceState
IndicatorPanel --> WorkspaceState
end

subgraph Services
WorkspaceState --> DataService
DataService --> IndicatorEngine
IndicatorEngine --> ChartOrchestrator
end

ChartOrchestrator --> ChartCanvas
ChartOrchestrator --> DrawingLayer
ChartCanvas --> TooltipHub
DrawingLayer --> AlertManager
TooltipHub --> UI
AlertManager --> UI
```

## Action Items (High-Level)
1. Establish `ChartWorkspaceContext` to coordinate symbol/timeframe/layout/drawings.
2. Build `useChartData` service with caching, retries, structured console logging, and indicator calculations.
3. Implement advanced toolbar, watchlist, info ribbon, and flexible pane system.
4. Integrate drawing/alert layers plus multi-series rendering (candles, volume, indicators).
5. Document each module (architecture, data service, chart renderer) and keep them synced with implementation updates.

## Implementation Status (Updated)
- ✅ `ChartWorkspaceContext` + reducer is live with verbose console traces per action.
- ✅ `useChartData` performs cached TwelveData fetches, computes indicators, and streams short-timeframes.
- ✅ `AdvancedChartWorkspace` mirrors TradingView layout (watchlist | chart stack | alerts) with resizable panes.
- ✅ Drawing + alert subsystems land via `DrawingLayer` and `AlertPanel`; indicator management is handled inline.
- ✅ Docs + flowcharts live under `components/charting/docs` and must be refreshed alongside code changes.
