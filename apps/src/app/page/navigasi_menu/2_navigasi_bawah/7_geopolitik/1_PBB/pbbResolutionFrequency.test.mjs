import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getPbbChancePercentForPeriod,
  rollPbbChancePercent,
} from './pbbResolutionFrequency.ts';

test('converts annual PBB chances to daily and monthly rates', () => {
  assert.ok(Math.abs(getPbbChancePercentForPeriod(30, 'month') - 2.929) < 0.001);
  assert.ok(Math.abs(getPbbChancePercentForPeriod(30, 'day', 365) - 0.0976) < 0.001);
  assert.ok(Math.abs(getPbbChancePercentForPeriod(60, 'month') - 7.352) < 0.001);
  assert.ok(Math.abs(getPbbChancePercentForPeriod(60, 'day', 365) - 0.251) < 0.001);
});

test('clamps annual chances and uses leap-year day counts', () => {
  assert.equal(getPbbChancePercentForPeriod(120, 'year'), 100);
  assert.equal(getPbbChancePercentForPeriod(-10, 'month'), 0);
  assert.ok(
    getPbbChancePercentForPeriod(30, 'day', 366) <
      getPbbChancePercentForPeriod(30, 'day', 365),
  );
});

test('rolls a bounded chance using the supplied random source', () => {
  assert.equal(rollPbbChancePercent(60, () => 0.59), true);
  assert.equal(rollPbbChancePercent(60, () => 0.6), false);
  assert.equal(rollPbbChancePercent(150, () => 0.99), true);
  assert.equal(rollPbbChancePercent(Number.NaN, () => 0), false);
});
