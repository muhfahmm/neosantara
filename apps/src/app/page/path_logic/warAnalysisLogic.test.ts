import assert from 'node:assert/strict';
import test from 'node:test';
import {
  combineMilitaryAidWithDefender,
  isPlayerWarWinner,
} from './warAnalysisLogic.ts';

test('military aid counts a target-side victory as the player-side victory', () => {
  assert.equal(isPlayerWarWinner('target', false, true), true);
  assert.equal(isPlayerWarWinner('attacker', false, true), false);
  assert.equal(isPlayerWarWinner('attacker', false, false), true);
});

test('military aid is added to the defender side using deployed percentages', () => {
  const result = combineMilitaryAidWithDefender({
    defenderDetail: {
      country: 'Aljazair',
      armada: { darat: { tank_tempur_utama: 10 } },
      militarySupportCountries: ['Mali'],
    },
    defenderBreakdown: [
      { groupId: 'darat', dataKey: 'tank_tempur_utama', quantity: 10, totalPower: 100 },
    ],
    aidBreakdown: [
      { groupId: 'darat', dataKey: 'tank_tempur_utama', quantity: 20, totalPower: 400 },
      { groupId: 'darat', dataKey: 'pasukan_infanteri', quantity: 100, totalPower: 100 },
    ],
    deploymentConfig: { tank_tempur_utama: 50, barak: 25 },
    supportCountry: 'Kanada',
  });

  assert.equal(result.addedPower, 225);
  assert.deepEqual(result.detail, {
    country: 'Aljazair',
    armada: {
      darat: {
        tank_tempur_utama: 20,
        pasukan_infanteri: 25,
      },
      laut: {},
      udara: {},
    },
    militarySupportCountries: ['Mali', 'Kanada'],
  });
});
