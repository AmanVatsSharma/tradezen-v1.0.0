# Workspace Interaction Flow

This flowchart keeps the charting modules and docs aligned with the implementation. Update it whenever component responsibilities shift.

```mermaid
flowchart TD
    Watchlist[WatchlistPanel] -->|setSymbol| Context
    Toolbar -->|setSymbol/timeframe/chart type| Context
    IndicatorPanel -->|enable/disable indicators| Context
    DrawingLayer -->|upsert drawing| Context
    AlertPanel -->|upsert alert| Context

    Context -->|state snapshot| useChartData
    useChartData -->|ChartDataPacket| AdvancedChartWorkspace
    AdvancedChartWorkspace --> ChartViewport
    AdvancedChartWorkspace --> InfoRibbon
    AdvancedChartWorkspace --> AlertPanel

    ChartViewport -->|crosshair events| Toolbar
    ChartViewport --> DrawingLayer
    ChartViewport --> InfoRibbon
```

## Notes
- `useChartData` logs cache hits, refresh cycles, and errors for observability.
- `DrawingLayer` normalizes coordinates so resizing the layout keeps annotations intact.
- `AlertPanel` piggybacks on the same state tree, so alerts persist even when switching symbols during the session.
