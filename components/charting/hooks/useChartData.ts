'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { fetchStockData } from '@/pages/api/twelveData';
import { formatTwelveData } from '@/utils/DataParserTD';

import { computeIndicators } from '../utils/indicatorMath';
import {
  ChartDataPacket,
  IndicatorConfig,
  Resolution,
  UseChartDataResponse,
} from '../types';

const cache = new Map<string, ChartDataPacket>();

const getCacheKey = (symbol: string, timeframe: Resolution) =>
  `${symbol}@${timeframe}`;

const timeframeToRefreshMs = (timeframe: Resolution) => {
  switch (timeframe) {
    case '1min':
    case '5min':
    case '15min':
      return 5000;
    case '30min':
    case '45min':
    case '1h':
    case '2h':
      return 15000;
    default:
      return 60000;
  }
};

interface UseChartDataParams {
  symbol: string;
  timeframe: Resolution;
  comparisonSymbols: string[];
  indicators: IndicatorConfig[];
}

const normalizeResponse = (rawValues: any[]) => {
  const formatted = formatTwelveData(rawValues || []).sort(
    (a, b) => Number(a.time) - Number(b.time)
  );
  return formatted;
};

// Central data service that mirrors TradingView's streaming/cached behavior.
export const useChartData = ({
  symbol,
  timeframe,
  comparisonSymbols,
  indicators,
}: UseChartDataParams): UseChartDataResponse => {
  const [packet, setPacket] = useState<ChartDataPacket | null>(null);
  const [status, setStatus] = useState<UseChartDataResponse['status']>('idle');
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  const memoizedComparisons = useMemo(
    () => Array.from(new Set(comparisonSymbols)),
    [comparisonSymbols]
  );

  const fetchComparisons = useCallback(async () => {
      const responses: Record<string, Array<{ time: number; value: number }>> = {};
      await Promise.all(
        memoizedComparisons.map(async (ticker) => {
          try {
            const comparisonRaw = await fetchStockData(ticker, timeframe);
            const normalized = normalizeResponse(comparisonRaw?.values ?? []);
            responses[ticker] = normalized.map((item) => ({
              time: item.time,
              value: item.close,
            }));
          } catch (comparisonError) {
            console.error('[useChartData] comparison fetch failed', {
              ticker,
              comparisonError,
            });
          }
        })
      );
      return responses;
    },
    [memoizedComparisons, timeframe]
  );

  const buildPacket = useCallback(
    async (rawData: any) => {
      const normalized = normalizeResponse(rawData?.values ?? []);
      const indicatorsPayload = computeIndicators(normalized, indicators);
      const comparisons = await fetchComparisons();

      const volume = normalized.map((item) => ({
        time: item.time,
        value: item.volume ?? 0,
        color: item.close >= item.open ? '#10b981' : '#ef4444',
      }));

      const result: ChartDataPacket = {
        candles: normalized,
        overlays: indicatorsPayload.overlays,
        oscillators: indicatorsPayload.oscillators,
        volume,
        comparisons,
        meta: {
          symbol: rawData?.meta?.symbol ?? symbol,
          timezone: rawData?.meta?.exchange_timezone,
          currency: rawData?.meta?.currency,
          lastUpdated: rawData?.meta?.first_traded,
          source: 'twelvedata',
        },
      };

      return result;
    },
    [fetchComparisons, indicators, symbol]
  );

  const fetchData = useCallback(async () => {
    setStatus((prev) => (prev === 'loading' ? prev : 'loading'));
    setError(null);

    const cacheKey = getCacheKey(symbol, timeframe);
    const cachedPacket = cache.get(cacheKey);
    if (cachedPacket) {
      console.info('[useChartData] resolved from cache', { cacheKey });
      setPacket(cachedPacket);
    }

    try {
      console.info('[useChartData] fetching data', { symbol, timeframe });
      const response = await fetchStockData(symbol, timeframe);
      if (!response || !response.values) {
        throw new Error('No data returned from upstream provider');
      }

      const nextPacket = await buildPacket(response);
      cache.set(cacheKey, nextPacket);
      setPacket(nextPacket);
      setStatus('success');
      setLastUpdated(new Date().toISOString());
      console.info('[useChartData] fetch success', {
        symbol,
        timeframe,
        candles: nextPacket.candles.length,
      });
    } catch (fetchError: any) {
      console.error('[useChartData] fetch failed', fetchError);
      setError(fetchError?.message || 'Unable to fetch market data');
      setStatus('error');
    }
  }, [buildPacket, symbol, timeframe]);

  useEffect(() => {
    let isMounted = true;
    const resolver = async () => {
      if (!isMounted) return;
      await fetchData();
    };
    resolver();

    const refreshRate = timeframeToRefreshMs(timeframe);
    if (refreshRate && refreshRate < 60000) {
      pollingRef.current = setInterval(() => {
        console.info('[useChartData] polling refresh triggered', {
          symbol,
          timeframe,
        });
        fetchData();
      }, refreshRate);
    }

    return () => {
      isMounted = false;
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [fetchData, symbol, timeframe]);

  return {
    packet,
    status,
    error,
    refetch: fetchData,
    lastUpdated,
  };
};
