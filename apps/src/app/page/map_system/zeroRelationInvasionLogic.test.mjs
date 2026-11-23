import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getZeroRelationInvasionDailyChancePercent,
  rollZeroRelationInvasionWindows,
} from './zeroRelationInvasionLogic.ts';

test('daily rolls preserve an 80 percent chance across a 30-day window', () => {
  const dailyChance = getZeroRelationInvasionDailyChancePercent(80) / 100;
  assert.ok(Math.abs((1 - Math.pow(1 - dailyChance, 30)) - 0.8) < 1e-10);
});

test('tracks a separate 30-day schedule for each zero-relation country', () => {
  const firstRoll = rollZeroRelationInvasionWindows(
    '2026-01-01',
    [
      { identity: 'aa', country: 'Negara A' },
      { identity: 'bb', country: 'Negara B' },
    ],
    null,
    80,
    () => 0.05,
  );
  assert.deepEqual(firstRoll.triggeredTargets.map(target => target.identity), ['aa', 'bb']);
  assert.deepEqual(firstRoll.schedules, {
    aa: { windowStartedAt: '2026-01-01', fired: true },
    bb: { windowStartedAt: '2026-01-01', fired: true },
  });

  const laterRoll = rollZeroRelationInvasionWindows(
    '2026-01-02',
    [{ identity: 'aa', country: 'Negara A' }],
    firstRoll.schedules,
    80,
    () => {
      throw new Error('A fired window must not roll again.');
    },
  );
  assert.deepEqual(laterRoll.triggeredTargets, []);
  assert.equal(laterRoll.schedules.aa.windowStartedAt, '2026-01-01');
});

test('retries in a fresh window after 30 days and removes countries no longer at zero', () => {
  const newWindow = rollZeroRelationInvasionWindows(
    '2026-01-31',
    [{ identity: 'aa', country: 'Negara A' }],
    { aa: { windowStartedAt: '2026-01-01', fired: false } },
    80,
    () => 0.99,
  );
  assert.deepEqual(newWindow.triggeredTargets, []);
  assert.equal(newWindow.schedules.aa.windowStartedAt, '2026-01-31');

  assert.deepEqual(
    rollZeroRelationInvasionWindows('2026-02-01', [], newWindow.schedules, 80, () => 0),
    { schedules: {}, triggeredTargets: [] },
  );
});


test('supports daily invasion frequency window (evaluates every 1 day)', () => {
  const roll = rollZeroRelationInvasionWindows(
    '2026-01-01',
    [{ identity: 'target_daily', country: 'Negara Daily', frequency: 'daily' }],
    null,
    100,
    () => 0.5,
  );
  assert.equal(roll.triggeredTargets.length, 1);
  assert.equal(roll.triggeredTargets[0].identity, 'target_daily');
  assert.equal(roll.schedules.target_daily.fired, true);
  assert.equal(roll.schedules.target_daily.frequency, 'daily');
});

test('supports weekly invasion frequency window (evaluates every 7 days)', () => {
  const rollMiss = rollZeroRelationInvasionWindows(
    '2026-01-01',
    [{ identity: 'target_weekly', country: 'Negara Weekly', frequency: 'weekly' }],
    null,
    90,
    () => 0.99,
  );
  assert.equal(rollMiss.triggeredTargets.length, 0);
  assert.equal(rollMiss.schedules.target_weekly.fired, false);

  // Retries on next week (7 days later)
  const rollHit = rollZeroRelationInvasionWindows(
    '2026-01-08',
    [{ identity: 'target_weekly', country: 'Negara Weekly', frequency: 'weekly' }],
    rollMiss.schedules,
    90,
    () => 0.01,
  );
  assert.equal(rollHit.triggeredTargets.length, 1);
  assert.equal(rollHit.schedules.target_weekly.windowStartedAt, '2026-01-08');
  assert.equal(rollHit.schedules.target_weekly.fired, true);
});
