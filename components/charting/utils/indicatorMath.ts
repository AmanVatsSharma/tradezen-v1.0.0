import { IndicatorConfig } from '../types';

type Candle = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
};

// Utility guard to avoid divisions by zero or NaN propagation.
const safeDiv = (numerator: number, denominator: number) =>
  denominator === 0 ? 0 : numerator / denominator;

/**
 * Calculates a simple moving average for each candle.
 */
export const calculateSMA = (data: Candle[], length: number) => {
  const result: Array<{ time: number; value: number }> = [];
  const queue: number[] = [];
  let sum = 0;

  data.forEach((bar) => {
    queue.push(bar.close);
    sum += bar.close;
    if (queue.length > length) {
      sum -= queue.shift() || 0;
    }
    if (queue.length === length) {
      result.push({ time: bar.time, value: sum / length });
    }
  });

  console.debug('[indicatorMath] SMA computed', { length, points: result.length });
  return result;
};

/**
 * Calculates an exponential moving average.
 */
export const calculateEMA = (data: Candle[], length: number) => {
  const result: Array<{ time: number; value: number }> = [];
  if (data.length === 0) return result;

  const multiplier = 2 / (length + 1);
  let prevEma = data[0].close;

  data.forEach((bar) => {
    const ema = (bar.close - prevEma) * multiplier + prevEma;
    prevEma = ema;
    result.push({ time: bar.time, value: ema });
  });

  console.debug('[indicatorMath] EMA computed', { length, points: result.length });
  return result;
};

/**
 * Calculates the Relative Strength Index.
 */
export const calculateRSI = (data: Candle[], length: number) => {
  const gains: number[] = [];
  const losses: number[] = [];
  const result: Array<{ time: number; value: number }> = [];

  for (let i = 1; i < data.length; i++) {
    const change = data[i].close - data[i - 1].close;
    gains.push(Math.max(0, change));
    losses.push(Math.max(0, -change));
    if (gains.length > length) gains.shift();
    if (losses.length > length) losses.shift();

    if (i >= length) {
      const avgGain = gains.reduce((acc, val) => acc + val, 0) / length;
      const avgLoss = losses.reduce((acc, val) => acc + val, 0) / length;
      const rs = safeDiv(avgGain, avgLoss);
      const rsi = 100 - 100 / (1 + rs);
      result.push({ time: data[i].time, value: Number.isFinite(rsi) ? rsi : 0 });
    }
  }

  console.debug('[indicatorMath] RSI computed', { length, points: result.length });
  return result;
};

/**
 * Calculates MACD (12/26 EMA by default) plus signal line.
 */
export const calculateMACD = (
  data: Candle[],
  fast = 12,
  slow = 26,
  signalLength = 9
) => {
  const fastEMA = calculateEMA(data, fast);
  const slowEMA = calculateEMA(data, slow);
  const macdLine: Array<{ time: number; value: number }> = [];

  fastEMA.forEach((point, idx) => {
    const slowPoint = slowEMA[idx];
    if (!slowPoint) return;
    macdLine.push({
      time: point.time,
      value: point.value - slowPoint.value,
    });
  });

  const signalLine = calculateEMA(
    macdLine.map((p) => ({
      time: p.time,
      open: p.value,
      high: p.value,
      low: p.value,
      close: p.value,
    })),
    signalLength
  );

  console.debug('[indicatorMath] MACD computed', {
    fast,
    slow,
    signalLength,
    points: macdLine.length,
  });

  return { macdLine, signalLine };
};

/**
 * Calculates VWAP for intraday frames.
 */
export const calculateVWAP = (data: Candle[]) => {
  let cumulativePV = 0;
  let cumulativeVolume = 0;
  const result: Array<{ time: number; value: number }> = [];

  data.forEach((bar) => {
    const typicalPrice = (bar.high + bar.low + bar.close) / 3;
    const volume = bar.volume ?? 0;
    cumulativePV += typicalPrice * volume;
    cumulativeVolume += volume;
    result.push({
      time: bar.time,
      value: safeDiv(cumulativePV, cumulativeVolume),
    });
  });

  console.debug('[indicatorMath] VWAP computed', { points: result.length });
  return result;
};

/**
 * Builds indicator series objects keyed by indicator id.
 */
export const computeIndicators = (data: Candle[], configs: IndicatorConfig[]) => {
  const overlays: Record<string, Array<{ time: number; value: number }>> = {};
  const oscillators: Record<string, Array<{ time: number; value: number }>> = {};

  configs
    .filter((cfg) => cfg.enabled)
    .forEach((cfg) => {
      try {
        let values: Array<{ time: number; value: number }> = [];

        switch (cfg.type) {
          case 'sma':
            values = calculateSMA(data, cfg.params.length || 20);
            break;
          case 'ema':
            values = calculateEMA(data, cfg.params.length || 21);
            break;
          case 'rsi':
            values = calculateRSI(data, cfg.params.length || 14);
            break;
          case 'macd': {
            const { macdLine } = calculateMACD(
              data,
              cfg.params.fast || 12,
              cfg.params.slow || 26,
              cfg.params.signal || 9
            );
            values = macdLine;
            break;
          }
          case 'vwap':
            values = calculateVWAP(data);
            break;
          default:
            console.warn('[indicatorMath] Unsupported indicator', cfg.type);
        }

        if (values.length === 0) return;
        if (cfg.pane === 'overlay') {
          overlays[cfg.id] = values;
        } else {
          oscillators[cfg.id] = values;
        }
      } catch (error) {
        console.error('[indicatorMath] unable to compute indicator', {
          indicator: cfg.id,
          error,
        });
      }
    });

  return { overlays, oscillators };
};
