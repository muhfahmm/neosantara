import assert from 'node:assert/strict';
import test from 'node:test';
import { resolveInfantryQuantity } from './1_barak_logic.ts';

test('infantry strength falls back to soldiers converted from barracks', () => {
  assert.ok(Math.abs(resolveInfantryQuantity(0, 74.7969) - 747969) < 1e-8);
});

test('stored infantry takes precedence over barracks fallback', () => {
  assert.equal(resolveInfantryQuantity(1200, 10), 1200);
});

test('invalid or empty barracks do not create infantry', () => {
  assert.equal(resolveInfantryQuantity(0, Number.NaN), 0);
  assert.equal(resolveInfantryQuantity(undefined, -2), 0);
});
