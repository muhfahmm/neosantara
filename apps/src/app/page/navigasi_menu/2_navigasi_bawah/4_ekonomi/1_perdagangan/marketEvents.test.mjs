import assert from 'node:assert/strict';
import test from 'node:test';
import {
  advanceTradePriceHistoriesForSimulationDay,
  createDailyMarketPriceFactors,
  getStoredPriceHistory,
  getTradeMarketPrices,
  updateTradePriceHistory,
} from './priceHistoryLogic.ts';
import {
  buildWarEvent,
  combinedEventFactor,
  eventFactor,
  registerMarketEvent,
} from './marketEventsLogic.ts';

const producers = [
  { country: 'Producer A', production: { minyak_bumi: 40 } },
  { country: 'Producer B', production: { minyak_bumi: 20 } },
  { country: 'Other', production: { minyak_bumi: 40, padi: 100 } },
];

test('a war between major oil producers raises oil prices and decays back near baseline', () => {
  const event = buildWarEvent('Producer A', 'Producer B', 10, producers);

  assert.ok(eventFactor(event, 'minyak_bumi', 20) >= 1.15);
  assert.ok(Math.abs(eventFactor(event, 'minyak_bumi', 94) - 1) <= 0.1);
});

test('wars between non-producers have negligible effects and do not spill into rice', () => {
  const event = buildWarEvent('Small A', 'Small B', 10, producers);
  const energyWar = buildWarEvent('Producer A', 'Producer B', 10, producers);

  assert.ok(Math.abs(eventFactor(event, 'minyak_bumi', 20) - 1) < 0.03);
  assert.equal(eventFactor(energyWar, 'padi', 20), 1);
  assert.ok(eventFactor({
    ...energyWar,
    affected: { ...energyWar.affected, padi: 0.1 },
  }, 'padi', 20) > 1);
});

test('combined event factors stay clamped and daily market prices remain positive', () => {
  const positiveEvents = Array.from({ length: 10 }, (_, index) => ({
    id: `positive-${index}`,
    kind: 'shock',
    startDay: 1,
    halfLifeDays: 10,
    magnitude: 100,
    affected: { minyak_bumi: 1 },
  }));
  const negativeEvents = positiveEvents.slice(0, 9).map(event => ({
    ...event,
    id: `negative-${event.id}`,
    affected: { minyak_bumi: -1 },
  }));
  assert.equal(combinedEventFactor(positiveEvents, 'minyak_bumi', 10), 2.5);
  assert.equal(combinedEventFactor(negativeEvents, 'minyak_bumi', 10), 0.4);

  const marketEvent = {
    id: 'extreme-negative',
    kind: 'shock',
    startDay: Math.floor(Date.UTC(2026, 10, 2) / 86_400_000),
    halfLifeDays: 10,
    magnitude: 100,
    affected: { minyak_bumi: -1 },
  };
  const initialState = registerMarketEvent({
    country: 'Indonesia',
    tradeMarketPrices: {
      updatedAt: '2026-11-01',
      prices: { minyak_bumi: 150 },
    },
  }, marketEvent);
  const nextDate = new Date(2026, 10, 2);
  const nextState = advanceTradePriceHistoriesForSimulationDay(
    initialState,
    nextDate,
    createDailyMarketPriceFactors(nextDate),
  );
  assert.ok(getTradeMarketPrices(nextState).minyak_bumi > 0);
});

test('same saved state and simulation date produce identical prices without rewriting old candles', () => {
  const firstDate = new Date(2026, 10, 2);
  const initialState = updateTradePriceHistory({ country: 'Indonesia' }, {
    country: 'Indonesia',
    commodity: 'minyak_bumi',
    currentDate: firstDate,
    randomFactors: createDailyMarketPriceFactors(firstDate),
  });
  const originalHistory = getStoredPriceHistory(initialState, 'Indonesia', 'minyak_bumi');
  assert.ok(originalHistory);

  const event = buildWarEvent('Producer A', 'Producer B', Math.floor(Date.UTC(2026, 10, 3) / 86_400_000), producers);
  const eventState = registerMarketEvent(initialState, event);
  const nextDate = new Date(2026, 10, 3);
  const factors = createDailyMarketPriceFactors(nextDate);
  const nextState = advanceTradePriceHistoriesForSimulationDay(eventState, nextDate, factors);
  const repeatedState = advanceTradePriceHistoriesForSimulationDay(eventState, nextDate, factors);
  const nextHistory = getStoredPriceHistory(nextState, 'Indonesia', 'minyak_bumi');

  assert.deepEqual(getTradeMarketPrices(nextState), getTradeMarketPrices(repeatedState));
  assert.deepEqual(nextHistory.candles.slice(0, originalHistory.candles.length), originalHistory.candles);
  assert.ok(nextHistory.candles.at(-1).close > originalHistory.candles.at(-1).close);
  assert.ok(nextState.tradeMarketPrices.basePriceState.minyak_bumi > 0);
});

test('initial backfill stays event-free except for its current-day anchored candle', () => {
  const currentDate = new Date(2026, 10, 3);
  const priorState = {
    country: 'Indonesia',
    tradeMarketPrices: {
      updatedAt: '2026-11-02',
      prices: { minyak_bumi: 150 },
      basePriceState: { minyak_bumi: 150 },
    },
  };
  const event = buildWarEvent(
    'Producer A',
    'Producer B',
    Math.floor(Date.UTC(2026, 10, 3) / 86_400_000),
    producers,
  );
  const eventState = registerMarketEvent(priorState, event);
  const options = {
    country: 'Indonesia',
    commodity: 'minyak_bumi',
    currentDate,
    randomFactors: createDailyMarketPriceFactors(currentDate),
  };
  const normalState = updateTradePriceHistory(priorState, options);
  const affectedState = updateTradePriceHistory(eventState, options);
  const normalHistory = getStoredPriceHistory(normalState, 'Indonesia', 'minyak_bumi');
  const affectedHistory = getStoredPriceHistory(affectedState, 'Indonesia', 'minyak_bumi');

  assert.deepEqual(
    affectedHistory.candles.slice(0, -24),
    normalHistory.candles.slice(0, -24),
  );
  assert.notEqual(affectedHistory.candles.at(-1).close, normalHistory.candles.at(-1).close);
  assert.equal(affectedHistory.candles.at(-1).close, getTradeMarketPrices(affectedState).minyak_bumi);
});
