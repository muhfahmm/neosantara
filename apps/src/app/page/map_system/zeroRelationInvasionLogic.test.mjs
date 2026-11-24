import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getZeroRelationInvasionDailyChancePercent,
  rollZeroRelationInvasionWindows,
} from './zeroRelationInvasionLogic.ts';

test('daily rolls preserve a 65 percent chance across a 30-day window', () => {
  const dailyChance = getZeroRelationInvasionDailyChancePercent(65, 30) / 100;
  assert.ok(Math.abs((1 - Math.pow(1 - dailyChance, 30)) - 0.65) < 1e-10);
});

test('tracks a separate schedule for each zero-relation country', () => {
  const firstRoll = rollZeroRelationInvasionWindows(
    '2026-01-01',
    [
      { identity: 'aa', country: 'Negara A' },
      { identity: 'bb', country: 'Negara B' },
    ],
    null,
    65,
    () => 0.01,
  );
  assert.deepEqual(firstRoll.triggeredTargets.map(target => target.identity), ['aa', 'bb']);
  assert.equal(firstRoll.schedules.aa.fired, true);
  assert.equal(firstRoll.schedules.bb.fired, true);

  const laterRoll = rollZeroRelationInvasionWindows(
    '2026-01-02',
    [{ identity: 'aa', country: 'Negara A' }],
    firstRoll.schedules,
    65,
    () => {
      throw new Error('A fired window must not roll again.');
    },
  );
  assert.deepEqual(laterRoll.triggeredTargets, []);
  assert.equal(laterRoll.schedules.aa.windowStartedAt, '2026-01-01');
});

test('retries in a fresh window after window expires and respects cooldown', () => {
  const newWindow = rollZeroRelationInvasionWindows(
    '2026-01-31',
    [{ identity: 'aa', country: 'Negara A' }],
    { aa: { windowStartedAt: '2026-01-01', fired: false } },
    65,
    () => 0.99,
  );
  assert.deepEqual(newWindow.triggeredTargets, []);
  assert.equal(newWindow.schedules.aa.windowStartedAt, '2026-01-31');

  assert.deepEqual(
    rollZeroRelationInvasionWindows('2026-02-01', [], newWindow.schedules, 65, () => 0),
    { schedules: {}, triggeredTargets: [] },
  );
});

test('prevents spamming attacks within cooldown period', () => {
  const hitRoll = rollZeroRelationInvasionWindows(
    '2026-01-01',
    [{ identity: 'target_daily', country: 'Negara Daily', frequency: 'daily' }],
    null,
    65,
    () => 0.01,
  );
  assert.equal(hitRoll.triggeredTargets.length, 1);

  // Keesokan harinya (dalam masa cooldown 3 hari untuk mode daily)
  const nextDayRoll = rollZeroRelationInvasionWindows(
    '2026-01-02',
    [{ identity: 'target_daily', country: 'Negara Daily', frequency: 'daily' }],
    hitRoll.schedules,
    65,
    () => 0.01,
  );
  assert.equal(nextDayRoll.triggeredTargets.length, 0, 'Harus tertahan cooldown agar tidak spam menyerang tiap hari');
});

test('supports weekly invasion frequency window (evaluates every 14 days with cooldown)', () => {
  const rollMiss = rollZeroRelationInvasionWindows(
    '2026-01-01',
    [{ identity: 'target_weekly', country: 'Negara Weekly', frequency: 'weekly' }],
    null,
    65,
    () => 0.99,
  );
  assert.equal(rollMiss.triggeredTargets.length, 0);
  assert.equal(rollMiss.schedules.target_weekly.fired, false);

  // Retries on next window (14 days later)
  const rollHit = rollZeroRelationInvasionWindows(
    '2026-01-15',
    [{ identity: 'target_weekly', country: 'Negara Weekly', frequency: 'weekly' }],
    rollMiss.schedules,
    65,
    () => 0.01,
  );
  assert.equal(rollHit.triggeredTargets.length, 1);
  assert.equal(rollHit.schedules.target_weekly.windowStartedAt, '2026-01-15');
  assert.equal(rollHit.schedules.target_weekly.fired, true);
});
