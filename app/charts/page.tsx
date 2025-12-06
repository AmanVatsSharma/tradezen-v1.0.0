// src/pages/index.tsx
'use client';

import React from 'react';

import { AdvancedChartWorkspace } from '@/components/charting/AdvancedChartWorkspace';
import { ChartWorkspaceProvider } from '@/components/charting/ChartWorkspaceContext';

const ChartPage = () => {
  console.info('[ChartPage] advanced workspace mount');
  return (
    <div className="h-screen w-screen bg-slate-950">
      <ChartWorkspaceProvider>
        <AdvancedChartWorkspace />
      </ChartWorkspaceProvider>
    </div>
  );
};

export default ChartPage;
