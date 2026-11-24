import { test } from 'node:test';
import assert from 'node:assert/strict';
import { roundNeo, formatNeo } from '../src/app/logic/economic_logic/neoCurrency.ts';
import { setCurrentGameDateString, getCurrentGameDateString } from '../src/app/logic/gameSessionState.ts';

test('neoCurrency: roundNeo rounds numbers and valid numeric strings', () => {
  assert.equal(roundNeo(100.4), 100);
  assert.equal(roundNeo(100.6), 101);
  assert.equal(roundNeo('250.75'), 251);
  assert.equal(roundNeo(null), 0);
  assert.equal(roundNeo(undefined), 0);
  assert.throws(() => roundNeo('invalid'), TypeError);
});

test('neoCurrency: formatNeo formats properly for id and en locales', () => {
  const formattedId = formatNeo(1000000, 'id-ID');
  assert.ok(formattedId.includes('1.000.000') || formattedId.includes('1000000'));
});

test('gameSessionState: fallback to current ISO date string when window is undefined', () => {
  const dateStr = getCurrentGameDateString();
  assert.match(dateStr, /^\d{4}-\d{2}-\d{2}$/);
});

test('gameSessionState: mock window updates date string properly', () => {
  const mockStorage = new Map();
  globalThis.window = {
    neosantara_current_game_date: undefined,
    sessionStorage: {
      getItem: (k) => mockStorage.get(k) ?? null,
      setItem: (k, v) => mockStorage.set(k, v),
      removeItem: (k) => mockStorage.delete(k),
    },
  };

  setCurrentGameDateString('2028-05-14');
  assert.equal(getCurrentGameDateString(), '2028-05-14');

  // Test save load fallback via sessionStorage
  globalThis.window.neosantara_current_game_date = undefined;
  globalThis.window.sessionStorage.setItem('presiden_simulator_load_save', JSON.stringify({ game_date: '2030-11-20T00:00:00.000Z' }));
  assert.equal(getCurrentGameDateString(), '2030-11-20');

  delete globalThis.window;
});
