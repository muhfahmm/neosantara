import assert from 'node:assert/strict';
import test from 'node:test';
import {
  estimateBattleWinProbability,
  getMinimumLossRatioForCasualty,
  resolveBattleDamage,
  simulateBattleTs,
} from './battleEngine.ts';

test('the simulated winner is not reversed by comparing absolute casualties', () => {
  const result = resolveBattleDamage({
    attackerPower: 1000,
    targetPower: 500,
    attackerDamage: 300,
    targetDamage: 100,
    tieBreaker: 'attacker',
  });

  assert.equal(result.winner, 'attacker');
  assert.equal(result.attackerDamage, 300);
  assert.equal(result.targetDamage, 100);
});

test('a requested winner overrides the simulated winner without rewriting casualties', () => {
  const result = resolveBattleDamage({
    attackerPower: 1000,
    targetPower: 500,
    attackerDamage: 400,
    targetDamage: 100,
    tieBreaker: 'target',
    winnerOverride: 'attacker',
  });

  assert.equal(result.winner, 'attacker');
  assert.equal(result.attackerDamage, 400);
  assert.equal(result.targetDamage, 100);
});

test('equal damage uses the battle tie-breaker', () => {
  const result = resolveBattleDamage({
    attackerPower: 1000,
    targetPower: 1000,
    attackerDamage: 100,
    targetDamage: 100,
    tieBreaker: 'target',
  });

  assert.equal(result.winner, 'target');
  assert.equal(result.attackerDamage, 100);
  assert.equal(result.targetDamage, 100);
});

test('a defeated deployed force gets a non-zero loss ratio', () => {
  assert.equal(getMinimumLossRatioForCasualty([10, 4]), 0.1);
  assert.equal(getMinimumLossRatioForCasualty([]), 0);
});

test('a seeded battle produces the same outcome and combat log', () => {
  const input = {
    attackerPower: 1200,
    targetPower: 1000,
    seed: 42,
  };

  assert.deepEqual(simulateBattleTs(input), simulateBattleTs(input));
});

test('battle win probabilities are deterministic and account for draws', () => {
  const input = {
    attackerPower: 100,
    targetPower: 100,
  };
  const estimate = estimateBattleWinProbability(input, 100);

  assert.deepEqual(estimate, estimateBattleWinProbability(input, 100));
  assert.equal(estimate.simulations, 100);
  assert.ok(Math.abs(
    estimate.attackerWinPct + estimate.targetWinPct + estimate.drawPct - 100
  ) < 1e-9);
  assert.equal(estimate.isBalanced, true);
});

test('invalid battle win probability simulation counts are rejected', () => {
  assert.throws(
    () => estimateBattleWinProbability({ attackerPower: 1, targetPower: 1 }, 0),
    RangeError,
  );
});

test('a battle with no forces is reported as a draw, not as a balanced matchup', () => {
  const estimate = estimateBattleWinProbability({
    attackerPower: 0,
    targetPower: 0,
  }, 10);

  assert.equal(estimate.attackerWinPct, 0);
  assert.equal(estimate.targetWinPct, 0);
  assert.equal(estimate.drawPct, 100);
  assert.equal(estimate.isBalanced, false);
});

test('requested invasions use the configured power-based win chance', () => {
  const estimate = estimateBattleWinProbability({
    attackerPower: 200,
    targetPower: 100,
    requestedInvasion: true,
  }, 1000);

  assert.ok(estimate.attackerWinPct > 55 && estimate.attackerWinPct < 65);
  assert.equal(estimate.drawPct, 0);
});

test('a much stronger attacking force is not reported as the defender winner', () => {
  const estimate = estimateBattleWinProbability({
    attackerPower: 2400,
    targetPower: 740,
  }, 100);

  assert.equal(estimate.attackerWinPct, 100);
  assert.equal(estimate.targetWinPct, 0);
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
