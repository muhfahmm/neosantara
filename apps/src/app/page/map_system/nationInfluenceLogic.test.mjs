import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeFaithVictory,
  computeIdeologyVictory,
  computeNationInfluence,
  getMilitaryPowerCardTotals,
  normalizeFaith,
  normalizeIdeology,
} from './nationInfluenceLogic.ts';

const countries = [
  {
    country_slug: 'pemain',
    name_id: 'Pemain',
    name_en: 'Player',
    religion: 'Islam',
    ideology: 'Demokrasi',
  },
  {
    country_slug: 'negara_satu',
    name_id: 'Negara Satu',
    name_en: 'Country One',
    religion: 'Kristen Protestan',
    ideology: 'democracy',
  },
  {
    country_slug: 'negara_dua',
    name_id: 'Negara Dua',
    name_en: 'Country Two',
    religion: 'islam',
    ideology: 'Monarki',
  },
];

test('normalizes faith and ideology synonyms, accents, case, and empty values', () => {
  assert.equal(normalizeFaith('  Krísten Protestan  '), 'protestan');
  assert.equal(normalizeFaith('PROTESTANT'), 'protestan');
  assert.equal(normalizeFaith('-'), null);
  assert.equal(normalizeFaith('  '), null);
  assert.equal(normalizeIdeology(' DEMOCRACY '), 'demokrasi');
  assert.equal(normalizeIdeology('Konservatisme'), 'konservatisme');
});

test('excludes the player and fully annexed countries from faith totals', () => {
  const result = computeFaithVictory(
    { country_slug: 'pemain', religion: 'Islam' },
    countries,
    { negara_dua: { attackerCountry: 'Pemain' } }
  );
  assert.deepEqual(result, { same: 0, total: 1, percent: 0 });
});

test('does not count the player when no explicit country slug is supplied', () => {
  const result = computeFaithVictory(
    { name_id: 'Pemain', religion: 'Islam' },
    countries
  );
  assert.deepEqual(result, { same: 1, total: 2, percent: 50 });
});

test('keeps PBB-occupied countries in the count and excludes annexed aliases', () => {
  const result = computeIdeologyVictory(
    { country_slug: 'pemain', ideology: 'Demokrasi' },
    countries,
    {
      'Negara Satu': { attackerCountry: 'Pemain' },
      'Negara Dua': { attackerCountry: 'PBB', isPbbOccupied: true },
    }
  );
  assert.deepEqual(result, { same: 0, total: 1, percent: 0 });
});

test('returns a zero percentage for an empty denominator', () => {
  const result = computeFaithVictory(
    { country_slug: 'pemain', religion: 'Islam' },
    [countries[0]],
  );
  assert.deepEqual(result, { same: 0, total: 0, percent: 0 });
});

test('recalculates ideology when the player ideology changes', () => {
  const democraticCountries = countries.map(country => ({
    ...country,
    ideology: 'Demokrasi',
  }));
  const democratic = computeNationInfluence(
    { country_slug: 'pemain', religion: 'Islam', ideology: 'Demokrasi' },
    democraticCountries
  );
  const monarchic = computeNationInfluence(
    { country_slug: 'pemain', religion: 'Islam', ideology: 'Monarki' },
    democraticCountries
  );
  assert.equal(democratic.ideology.same, 2);
  assert.equal(monarchic.ideology.same, 0);
  assert.notDeepEqual(democratic.ideology, monarchic.ideology);
});

test('military card totals use the supplied armada summary without recalculation', () => {
  const armadaSummary = {
    totals: {
      totalPower: 1284,
      groups: {
        darat: { power: 840 },
        laut: { power: 300 },
        udara: { power: 144 },
      },
    },
  };
  assert.deepEqual(getMilitaryPowerCardTotals(armadaSummary), {
    totalPower: armadaSummary.totals.totalPower,
    darat: 840,
    laut: 300,
    udara: 144,
  });
});
