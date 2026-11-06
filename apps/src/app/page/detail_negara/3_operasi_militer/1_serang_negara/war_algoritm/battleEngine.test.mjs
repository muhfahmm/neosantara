import assert from 'node:assert/strict';
import test from 'node:test';
import { simulateBattleTs } from './battleEngine.ts';

test('a seeded battle produces the same outcome and combat log', () => {
  const input = {
    attackerPower: 1200,
    targetPower: 1000,
    seed: 42,
  };

  assert.deepEqual(simulateBattleTs(input), simulateBattleTs(input));
});

test('a battle that reaches its round limit is decided by surviving power', () => {
  const result = simulateBattleTs({
    attackerPower: 100,
    targetPower: 50,
    damageRate: 0,
    maxRounds: 1,
    seed: 7,
  });

  assert.equal(result.totalRounds, 1);
  assert.equal(result.attackerFinalPower, 100);
  assert.equal(result.targetFinalPower, 50);
  assert.equal(result.winner, 'attacker');
});

test('a tied round-limit result favors the defending target', () => {
  const result = simulateBattleTs({
    attackerPower: 100,
    targetPower: 100,
    damageRate: 0,
    maxRounds: 1,
    seed: 7,
  });

  assert.equal(result.winner, 'target');
  assert.equal(result.isVictory, false);
  assert.match(result.message, /PERTAHANAN BERTAHAN/);
});

test('surviving forces do not regenerate after round 50', () => {
  const result = simulateBattleTs({
    attackerPower: 100,
    targetPower: 50,
    damageRate: 0,
    maxRounds: 51,
    seed: 7,
  });

  assert.equal(result.attackerFinalPower, 100);
  assert.equal(result.targetFinalPower, 50);
});

test('invalid battle inputs are rejected explicitly', () => {
  assert.throws(() => simulateBattleTs({ attackerPower: -1, targetPower: 2 }), RangeError);
  assert.throws(() => simulateBattleTs({ attackerPower: 1, targetPower: 2, damageRate: 1.1 }), RangeError);
  assert.throws(() => simulateBattleTs({ attackerPower: 1, targetPower: 2, maxRounds: 0 }), RangeError);
  assert.throws(() => simulateBattleTs({ attackerPower: 1, targetPower: 2, seed: 1.5 }), RangeError);
  assert.throws(() => simulateBattleTs({ attackerPower: 1, targetPower: 2, terrain: 'desert' }), RangeError);
});
