import assert from 'node:assert/strict';
import test from 'node:test';
import {
  advanceTradePriceHistoriesForSimulationDay,
  aggregateCandles,
  buildDayCandles,
  generateSeededCandle,
  getCandlesForRange,
  getStoredPriceHistory,
  getTradeMarketPrices,
  updateTradePriceHistory,
} from './priceHistoryLogic.ts';

test('aggregateCandles combines hourly OHLC and volume without changing input', () => {
  const hourly = Array.from({ length: 24 }, (_, hour) => ({
    time: hour * 60 * 60 * 1000,
    open: hour === 0 ? 150 : 100 + hour,
    high: hour === 12 ? 250 : 120 + hour,
    low: hour === 7 ? 25 : 90 + hour,
    close: hour === 23 ? 175 : 100 + hour,
    volume: hour + 1,
  }));
  const original = structuredClone(hourly);

  const [daily] = aggregateCandles(hourly, 'day');

  assert.equal(daily.open, hourly[0].open);
  assert.equal(daily.high, 250);
  assert.equal(daily.low, 25);
  assert.equal(daily.close, hourly[23].close);
  assert.equal(daily.volume, hourly.reduce((sum, candle) => sum + candle.volume, 0));
  assert.deepEqual(hourly, original);
});

test('generateSeededCandle is repeatable for the same country, commodity, and hour', () => {
  const first = generateSeededCandle('Indonesia', 'padi', 500, 150);
  const repeated = generateSeededCandle('Indonesia', 'padi', 500, 150);
  const nextHour = generateSeededCandle('Indonesia', 'padi', 501, 150);

  assert.deepEqual(first, repeated);
  assert.notDeepEqual(first, nextHour);
  assert.ok(first.low > 0);
});

test('hourly history is persistent, continuous, and anchored to the saved market price', () => {
  const firstDate = new Date(2026, 10, 2);
  const randomFactors = { padi: 0.5 };
  const firstState = updateTradePriceHistory({ country: 'Indonesia' }, {
    country: 'Indonesia',
    commodity: 'padi',
    currentDate: firstDate,
    randomFactors,
  });
  const history = getStoredPriceHistory(firstState, 'Indonesia', 'padi');
  const serializedState = JSON.parse(JSON.stringify(firstState));
  const restoredHistory = getStoredPriceHistory(serializedState, 'Indonesia', 'padi');

  assert.ok(history);
  assert.equal(history.candles.length, 366 * 24);
  assert.deepEqual(restoredHistory, history);
  assert.equal(
    history.candles.at(-1).close,
    getTradeMarketPrices(firstState).padi,
  );
  const currentDay = getCandlesForRange(history.candles, '1d', firstDate);
  assert.equal(currentDay.length, 24);
  assert.equal(currentDay.at(-1).close, getTradeMarketPrices(firstState).padi);
  assert.ok(currentDay.every(candle => (candle.high - candle.low) / candle.open < 0.06));
  assert.equal(getCandlesForRange(history.candles, '1w', firstDate).length, 7);
  assert.deepEqual(
    getCandlesForRange(history.candles, '1w', firstDate).at(-1),
    aggregateCandles(history.candles.slice(-24), 'day')[0],
  );
  for (let index = 1; index < history.candles.length; index += 1) {
    assert.equal(history.candles[index].open, history.candles[index - 1].close);
  }

  const nextState = updateTradePriceHistory(firstState, {
    country: 'Indonesia',
    commodity: 'padi',
    currentDate: new Date(2026, 10, 3),
    randomFactors,
  });
  const nextHistory = getStoredPriceHistory(nextState, 'Indonesia', 'padi');

  assert.ok(nextHistory);
  assert.deepEqual(nextHistory.candles.slice(0, history.candles.length), history.candles);
  assert.equal(nextHistory.candles.length, history.candles.length + 24);
  assert.equal(nextHistory.candles.at(-1).close, getTradeMarketPrices(nextState).padi);

  const advancedState = advanceTradePriceHistoriesForSimulationDay(
    firstState,
    new Date(2026, 10, 3),
    randomFactors,
  );
  const advancedHistory = getStoredPriceHistory(advancedState, 'Indonesia', 'padi');
  assert.ok(advancedHistory);
  assert.deepEqual(advancedHistory.candles, nextHistory.candles);
});

test('unrelated game-state updates preserve the stored hourly candle array', () => {
  const result = updateTradePriceHistory({ country: 'Indonesia' }, {
    country: 'Indonesia',
    commodity: 'padi',
    currentDate: new Date(2026, 10, 2),
    randomFactors: { padi: 0.5 },
  });
  const firstCandles = getStoredPriceHistory(result, 'Indonesia', 'padi')?.candles;
  const unrelatedUpdate = { ...result, anggaran: 123 };
  const nextCandles = getStoredPriceHistory(unrelatedUpdate, 'Indonesia', 'padi')?.candles;

  assert.ok(firstCandles);
  assert.strictEqual(nextCandles, firstCandles);
});

test('custom-priced trade products receive persistent history anchored to their current price', () => {
  const date = new Date(2026, 10, 2);
  const options = {
    country: 'Indonesia',
    commodity: 'tank_tempur_utama',
    currentDate: date,
    randomFactors: {},
    currentPrice: 1250,
  };
  const state = updateTradePriceHistory({ country: 'Indonesia' }, options);
  const history = getStoredPriceHistory(state, 'Indonesia', 'tank_tempur_utama');

  assert.ok(history);
  assert.equal(history.candles.length, 366 * 24);
  assert.equal(history.candles.at(-1).close, 1250);
  assert.deepEqual(updateTradePriceHistory({ country: 'Indonesia' }, options), state);

  const revisedState = updateTradePriceHistory(state, { ...options, currentPrice: 1300 });
  const revisedHistory = getStoredPriceHistory(revisedState, 'Indonesia', 'tank_tempur_utama');
  assert.ok(revisedHistory);
  assert.equal(revisedHistory.candles.at(-1).close, 1300);
  assert.deepEqual(revisedHistory.candles.slice(0, -24), history.candles.slice(0, -24));
});

test('1d always selects exactly the simulation day across month and year boundaries', () => {
  const dates = [
    new Date('2026-11-02T20:19:40.427+07:00'),
    new Date('2026-12-01T12:00:00+07:00'),
    new Date('2027-01-01T00:15:00+07:00'),
  ];

  for (const currentDate of dates) {
    const day = Math.floor(Date.UTC(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate(),
    ) / 86_400_000);
    const hourly = [
      ...buildDayCandles('Indonesia', 'padi', day - 1, 142, 141, { volatility: 0.04, drift: 0 }),
      ...buildDayCandles('Indonesia', 'padi', day, 141, 142, { volatility: 0.04, drift: 0 }),
      ...buildDayCandles('Indonesia', 'padi', day + 1, 142, 139, { volatility: 0.04, drift: 0 }),
    ];
    const daily = getCandlesForRange(hourly, '1d', currentDate);
    const averageRelativeRange = daily.reduce(
      (sum, candle) => sum + (candle.high - candle.low) / candle.open,
      0,
    ) / daily.length;

    assert.equal(daily.length, 24);
    assert.equal(new Date(daily[0].time).getUTCHours(), 0);
    assert.equal(new Date(daily[0].time).getUTCDate(), currentDate.getDate());
    assert.equal(new Date(daily.at(-1).time).getUTCHours(), 23);
    assert.equal(daily.at(-1).close, 142);
    assert.ok(averageRelativeRange < 0.06, `average range ${averageRelativeRange} should be below 6%`);
  }
});

test('1d excludes future candles and ends at the current market price', () => {
  const currentDate = new Date('2026-11-02T20:19:40.427+07:00');
  const day = Math.floor(Date.UTC(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    currentDate.getDate(),
  ) / 86_400_000);
  const hourly = [
    ...buildDayCandles('Indonesia', 'padi', day, 140, 142, { volatility: 0.04, drift: 0 }),
    ...buildDayCandles('Indonesia', 'padi', day + 1, 142, 139, { volatility: 0.04, drift: 0 }),
    ...buildDayCandles('Indonesia', 'padi', day + 2, 139, 145, { volatility: 0.04, drift: 0 }),
  ];
  const daily = getCandlesForRange(hourly, '1d', currentDate);

  assert.equal(daily.length, 24);
  assert.equal(daily[0].time, day * 24 * 60 * 60 * 1000);
  assert.equal(daily.at(-1).time, (day * 24 + 23) * 60 * 60 * 1000);
  assert.equal(daily.at(-1).close, 142);
});

function assertHealthyHistory(history, currentPrice) {
  const closes = history.candles.map(candle => candle.close);
  assert.equal(history.version, 2);
  assert.equal(history.candles.length, 366 * 24);
  assert.ok(Math.max(...closes) / Math.min(...closes) <= 6);
  assert.ok(history.candles.every(candle => Math.abs(candle.close / candle.open - 1) <= 0.15));
  assert.ok(Math.abs(history.candles.at(-1).close / history.candles.at(-1).open - 1) < 0.05);
  assert.equal(history.candles.at(-1).close, currentPrice);
  for (let index = 1; index < history.candles.length; index += 1) {
    assert.equal(history.candles[index].open, history.candles[index - 1].close);
  }
}

test('backfilled padi and minyak histories stay within a realistic price range', () => {
  const currentDate = new Date(2026, 10, 2);
  const currentDayLabel = '2026-11-02';

  for (const [commodity, price] of [['padi', 146], ['minyak_bumi', 150]]) {
    const initialState = {
      country: 'Indonesia',
      tradeMarketPrices: {
        updatedAt: currentDayLabel,
        prices: { [commodity]: price },
      },
    };
    const result = updateTradePriceHistory(initialState, {
      country: 'Indonesia',
      commodity,
      currentDate,
      randomFactors: {},
    });
    const history = getStoredPriceHistory(result, 'Indonesia', commodity);

    assert.ok(history);
    assertHealthyHistory(history, price);
  }
});

test('legacy history is rebuilt and backfill is deterministic', () => {
  const currentDate = new Date(2026, 10, 2);
  const legacyState = {
    country: 'Indonesia',
    tradeMarketPrices: {
      updatedAt: '2026-11-02',
      prices: { padi: 146 },
    },
    tradePriceHistories: {
      'indonesia::padi': {
        lastSimDay: 1,
        candles: [{
          time: 0,
          open: 100,
          high: 100,
          low: 100,
          close: 100000,
          volume: 1,
        }],
      },
    },
  };
  const options = {
    country: 'Indonesia',
    commodity: 'padi',
    currentDate,
    randomFactors: {},
  };
  const rebuilt = updateTradePriceHistory(legacyState, options);
  const repeated = updateTradePriceHistory(legacyState, options);
  const history = getStoredPriceHistory(rebuilt, 'Indonesia', 'padi');

  assert.ok(history);
  assertHealthyHistory(history, 146);
  assert.deepEqual(rebuilt, repeated);
});
