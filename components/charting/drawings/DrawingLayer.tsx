'use client';

import React, {
  MutableRefObject,
  PointerEvent,
  useCallback,
  useLayoutEffect,
  useState,
} from 'react';

import { useChartWorkspace } from '../ChartWorkspaceContext';
import { DrawingPrimitive, DrawingTool } from '../types';

interface DrawingLayerProps {
  containerRef: MutableRefObject<HTMLDivElement | null>;
}

const toolColorMap: Record<DrawingTool, string> = {
  trendline: '#f97316',
  ray: '#22d3ee',
  horizontal: '#a3e635',
  rectangle: '#a855f7',
};

// Lightweight drawing engine for annotations (trendline, ray, horizontal, rectangle).
export const DrawingLayer: React.FC<DrawingLayerProps> = ({ containerRef }) => {
  const { state, actions } = useChartWorkspace();
  const [draft, setDraft] = useState<DrawingPrimitive | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  const updateSize = useCallback(() => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setSize({ width: rect.width, height: rect.height });
  }, [containerRef]);

  useLayoutEffect(() => {
    updateSize();
    window.addEventListener('resize', updateSize);
    const observer = new ResizeObserver(() => updateSize());
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => {
      window.removeEventListener('resize', updateSize);
      observer.disconnect();
    };
  }, [updateSize, containerRef]);

  const normalizePoint = (event: PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    return { x: Math.min(Math.max(x, 0), 1), y: Math.min(Math.max(y, 0), 1) };
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!state.activeDrawingTool) return;
    const point = normalizePoint(event);
    const draftDrawing: DrawingPrimitive = {
      id: `draft-${Date.now()}`,
      tool: state.activeDrawingTool,
      points: [point],
    };
    console.info('[DrawingLayer] pointer down', {
      tool: state.activeDrawingTool,
      point,
    });
    setDraft(draftDrawing);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!draft) return;
    const point = normalizePoint(event);
    setDraft({ ...draft, points: [draft.points[0], point] });
  };

  const handlePointerUp = () => {
    if (!draft || draft.points.length < 2) {
      setDraft(null);
      return;
    }
    const finalized: DrawingPrimitive = {
      ...draft,
      id: `drawing-${Date.now()}`,
    };
    console.info('[DrawingLayer] drawing committed', { id: finalized.id });
    actions.upsertDrawing(finalized);
    setDraft(null);
  };

  const renderLine = (drawing: DrawingPrimitive) => {
    if (drawing.points.length < 2) return null;
    const [start, end] = drawing.points;
    const x1 = start.x * size.width;
    const y1 = start.y * size.height;
    const x2 =
      drawing.tool === 'horizontal'
        ? size.width
        : (end?.x ?? start.x) * size.width;
    const y2 =
      drawing.tool === 'horizontal'
        ? y1
        : (end?.y ?? start.y) * size.height;

    return (
      <line
        key={drawing.id}
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={toolColorMap[drawing.tool]}
        strokeWidth={2}
        strokeLinecap="round"
      />
    );
  };

  const renderRectangle = (drawing: DrawingPrimitive) => {
    if (drawing.points.length < 2) return null;
    const [start, end] = drawing.points;
    const x = Math.min(start.x, end.x) * size.width;
    const y = Math.min(start.y, end.y) * size.height;
    const width = Math.abs(end.x - start.x) * size.width;
    const height = Math.abs(end.y - start.y) * size.height;

    return (
      <rect
        key={drawing.id}
        x={x}
        y={y}
        width={width}
        height={height}
        stroke={toolColorMap.rectangle}
        strokeWidth={1.5}
        fill={`${toolColorMap.rectangle}30`}
      />
    );
  };

  const drawingElements = state.drawings.map((drawing) =>
    drawing.tool === 'rectangle' ? renderRectangle(drawing) : renderLine(drawing)
  );

  const draftElement =
    draft &&
    (draft.tool === 'rectangle' ? renderRectangle(draft) : renderLine(draft));

  return (
    <div
      className="pointer-events-auto absolute inset-0 z-20"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      <svg className="h-full w-full">
        {drawingElements}
        {draftElement}
      </svg>
    </div>
  );
};
