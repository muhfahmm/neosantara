import assert from 'node:assert/strict';
import test from 'node:test';
import { buildDayCandles } from './priceHistoryLogic.ts';
import {
  backgroundVolume,
  getVolumeBuckets,
  recordTrade,
} from './tradeVolumeLedger.ts';

test('recordTrade is serializable and retains only the latest 400 days', () => {
  let state = {};
  state = recordTrade(state, {
    commodity: 'padi',
    quantity: 12,
    side: 'buy',
    day: 1000,
    hour: 10,
    counterparty: 'Partner A',
  });
  state = recordTrade(state, {
    commodity: 'padi',
    quantity: 5,
    side: 'sell',
    day: 1000,
    hour: 10,
    counterparty: 'Partner B',
  });
  state = recordTrade(state, {
    commodity: 'padi',
    quantity: 4,
    side: 'sell',
    day: 1001,
    hour: 10,
  });
  state = recordTrade(state, {
    commodity: 'padi',
    quantity: 3,
    side: 'buy',
    day: 1400,
    hour: 9,
  });

  const parsed = JSON.parse(JSON.stringify(state));
  const buckets = getVolumeBuckets(parsed, 'padi');
  assert.deepEqual(buckets, [
    { day: 1001, hour: 10, buyVolume: 0, sellVolume: 4 },
    { day: 1400, hour: 9, buyVolume: 3, sellVolume: 0 },
  ]);
});

test('backgroundVolume is deterministic and scales with global production', () => {
  const repeated = backgroundVolume('padi', 120, 10_000);
  assert.equal(repeated, backgroundVolume('padi', 120, 10_000));
  assert.ok(repeated > backgroundVolume('padi', 120, 0));
});

test('higher relative volume produces larger average candle ranges', () => {
  const profile = { volatility: 0.06, drift: 0 };
  const highVolumeBuckets = Array.from({ length: 24 }, (_, hour) => ({
    day: 500,
    hour,
    buyVolume: 20_000,
    sellVolume: 20_000,
  }));
  const lowVolume = buildDayCandles('Indonesia', 'padi', 500, 100, 100, profile, {
    baselineVolume: 1000,
  });
  const highVolume = buildDayCandles('Indonesia', 'padi', 500, 100, 100, profile, {
    baselineVolume: 1000,
    volumeBuckets: highVolumeBuckets,
  });
  const averageRange = candles => candles.reduce(
    (total, candle) => total + (candle.high - candle.low) / candle.close,
    0,
  ) / candles.length;

  assert.ok(averageRange(highVolume) > averageRange(lowVolume));
  assert.ok(highVolume.every(candle => candle.volume > lowVolume[0].volume));
});

test('large buys and sells move same-day hourly closes in a bounded direction', () => {
  const profile = { volatility: 0, drift: 0 };
  const baseline = buildDayCandles('Indonesia', 'minyak_bumi', 700, 100, 100, profile);
  const buy = buildDayCandles('Indonesia', 'minyak_bumi', 700, 100, 100, profile, {
    baselineVolume: 100,
    volumeBuckets: [{ day: 700, hour: 11, buyVolume: 100_000, sellVolume: 0 }],
  });
  const sell = buildDayCandles('Indonesia', 'minyak_bumi', 700, 100, 100, profile, {
    baselineVolume: 100,
    volumeBuckets: [{ day: 700, hour: 11, buyVolume: 0, sellVolume: 100_000 }],
  });

  assert.ok(buy[11].close > baseline[11].close);
  assert.ok(sell[11].close < baseline[11].close);
  for (const candles of [buy, sell]) {
    for (let hour = 1; hour < candles.length; hour += 1) {
      assert.ok(Math.abs(candles[hour].close / candles[hour].open - 1) <= 0.08);
    }
    assert.equal(candles.at(-1).close, 100);
  }
});
