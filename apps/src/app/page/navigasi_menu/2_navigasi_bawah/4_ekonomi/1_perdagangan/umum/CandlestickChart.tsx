'use client';

import { memo } from 'react';
import type { PriceCandle, PriceTimeRange } from './priceHistoryLogic';

interface CandlestickChartProps {
  series: readonly PriceCandle[];
  timeRange: PriceTimeRange;
  currentPrice: number;
}

function formatPrice(price: number): string {
  return String(Math.round(price));
}

function formatVolume(volume: number): string {
  return volume.toLocaleString('id-ID', { maximumFractionDigits: 1 });
}

function formatXLabel(candle: PriceCandle, range: PriceTimeRange): string {
  const date = new Date(candle.time);
  if (range === '1d') {
    return `${date.getUTCHours()}:${String(date.getUTCMinutes()).padStart(2, '0')}`;
  }
  if (range === '1w') {
    return date.toLocaleDateString('id-ID', {
      timeZone: 'UTC',
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  }
  return date.toLocaleDateString('id-ID', { timeZone: 'UTC', day: 'numeric', month: 'short' });
}

function formatTooltipTime(candle: PriceCandle, range: PriceTimeRange): string {
  const date = new Date(candle.time);
  return date.toLocaleString('id-ID', {
    timeZone: 'UTC',
    ...(range === '1d'
      ? { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }
      : { day: 'numeric', month: 'long', year: 'numeric' }),
  });
}

function CandlestickChart({
  series,
  timeRange,
  currentPrice,
}: CandlestickChartProps) {
  if (series.length < 2) {
    return (
      <div className="w-full h-[262px] flex items-center justify-center text-xs text-[#6B8A8A]">
        Tidak ada data harga
      </div>
    );
  }

  const width = 800;
  const height = 220;
  const padding = { top: 16, bottom: 22, left: 58, right: 68 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const minimum = Math.min(...series.map(candle => candle.low));
  const maximum = Math.max(...series.map(candle => candle.high));
  const rawRange = maximum - minimum;
  const rangeBuffer = (rawRange || Math.max(1, maximum * 0.02)) * 0.08;
  const yMin = Math.max(0, minimum - rangeBuffer);
  const yMax = maximum + rangeBuffer;
  const priceRange = yMax - yMin || 1;
  const xScale = (index: number) => padding.left + (index / (series.length - 1)) * chartWidth;
  const yScale = (price: number) => padding.top + chartHeight - ((price - yMin) / priceRange) * chartHeight;
  const candleWidth = Math.min(24, (chartWidth / series.length) * 0.65);
  const halfCandleWidth = candleWidth / 2;
  const maxVolume = Math.max(1, ...series.map(candle => candle.volume));

  return (
    <div className="w-full flex flex-col items-center">
      <svg
        width="100%"
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
        className="max-w-full"
        aria-label="Grafik candlestick harga"
      >
        {[0, 1, 2, 3, 4].map(level => {
          const ratio = level / 4;
          const y = padding.top + chartHeight * ratio;
          const price = yMax - priceRange * ratio;
          return (
            <g key={level}>
              <line
                x1={padding.left}
                y1={y}
                x2={width - padding.right}
                y2={y}
                stroke="rgba(0, 255, 170, 0.1)"
                strokeDasharray="4 4"
              />
              <text
                x={padding.left - 7}
                y={y + 3}
                textAnchor="end"
                fontSize="9"
                fill="#6B8A8A"
              >
                {formatPrice(price)}
              </text>
            </g>
          );
        })}
        <line x1={padding.left} y1={padding.top} x2={padding.left} y2={height - padding.bottom} stroke="rgba(0, 255, 170, 0.2)" />
        <line x1={padding.left} y1={height - padding.bottom} x2={width - padding.right} y2={height - padding.bottom} stroke="rgba(0, 255, 170, 0.2)" />
        <text x={padding.left} y={height - 3} textAnchor="middle" fontSize="9" fill="#6B8A8A">
          {formatXLabel(series[0], timeRange)}
        </text>
        <text x={width - padding.right} y={height - 3} textAnchor="middle" fontSize="9" fill="#6B8A8A">
          {formatXLabel(series[series.length - 1], timeRange)}
        </text>

        {series.map((candle, index) => {
          const x = xScale(index);
          const yHigh = yScale(candle.high);
          const yLow = yScale(candle.low);
          const yOpen = yScale(candle.open);
          const yClose = yScale(candle.close);
          const isUp = candle.close >= candle.open;
          const color = isUp ? '#00FFAA' : '#ff4d4d';
          const tooltip = [
            formatTooltipTime(candle, timeRange),
            `O ${formatPrice(candle.open)}`,
            `H ${formatPrice(candle.high)}`,
            `L ${formatPrice(candle.low)}`,
            `C ${formatPrice(candle.close)}`,
            `Volume ${formatVolume(candle.volume)}`,
          ].join(' | ');
          return (
            <g
              key={timeRange === '1d' ? `hour-${index}` : `${candle.time}-${index}`}
              role="img"
              aria-label={tooltip}
            >
              <title>{tooltip}</title>
              <line x1={x} y1={yHigh} x2={x} y2={yLow} stroke={color} strokeWidth="1.5" />
              <rect
                x={x - halfCandleWidth}
                y={Math.min(yOpen, yClose)}
                width={candleWidth}
                height={Math.max(1, Math.abs(yClose - yOpen))}
                fill={color}
              />
            </g>
          );
        })}

        <line
          x1={padding.left}
          y1={yScale(currentPrice)}
          x2={width - padding.right}
          y2={yScale(currentPrice)}
          stroke="#00FFAA"
          strokeDasharray="4 4"
          strokeWidth="1.5"
        />
        <circle cx={width - padding.right} cy={yScale(currentPrice)} r="4" fill="#00FFAA" stroke="#0A1A1A" strokeWidth="2" />
        <text x={width - padding.right + 5} y={yScale(currentPrice) + 3} fontSize="9" fill="#00FFAA" fontWeight="bold">
          {formatPrice(currentPrice)} NEO
        </text>
      </svg>

      <svg
        width="100%"
        height="42"
        viewBox={`0 0 ${width} 42`}
        preserveAspectRatio="none"
        className="max-w-full"
        aria-label="Volume perdagangan"
      >
        <text x={padding.left - 7} y="9" textAnchor="end" fontSize="8" fill="#6B8A8A">VOL</text>
        <line x1={padding.left} y1="40" x2={width - padding.right} y2="40" stroke="rgba(0, 255, 170, 0.2)" />
        {series.map((candle, index) => {
          const x = xScale(index);
          const barWidth = Math.min(12, (chartWidth / series.length) * 0.65);
          const barHeight = Math.max(1, (candle.volume / maxVolume) * 30);
          const color = candle.close >= candle.open ? '#00FFAA' : '#ff4d4d';
          const tooltip = `${formatTooltipTime(candle, timeRange)} | Volume ${formatVolume(candle.volume)}`;
          return (
            <g
              key={timeRange === '1d' ? `volume-hour-${index}` : `volume-${candle.time}-${index}`}
              role="img"
              aria-label={tooltip}
            >
              <title>{tooltip}</title>
              <rect
                x={x - barWidth / 2}
                y={40 - barHeight}
                width={barWidth}
                height={barHeight}
                fill={color}
                opacity="0.75"
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default memo(CandlestickChart);
