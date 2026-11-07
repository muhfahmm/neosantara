// Run: node --test "tests/*.test.mjs"   (from apps/)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fetchDoktrin, mapDoktrinRow } from '../src/lib/doktrinKeterbukaan.ts';

const row = (id, country, name_en) => ({
  id, country, name_en,
  speech_score: 1, religion_score: 2, demo_score: 3, transparency_score: 4, media_score: 5,
  internet_score: 6, border_score: 7, trade_score: 8, diplomacy_score: 9, openness_index: 50,
});

function fakeQuery(rows) {
  const calls = [];
  const fn = async (sql, params) => { calls.push({ sql, params }); return rows; };
  fn.calls = calls;
  return fn;
}

test('mapDoktrinRow maps snake_case columns to the response contract', () => {
  const m = mapDoktrinRow(row(1, 'Indonesia', 'Indonesia'));
  assert.equal(m.speechScore, 1);
  assert.equal(m.opennessIndex, 50);
  assert.deepEqual(Object.keys(m).sort(), [
    'borderScore', 'country', 'demoScore', 'diplomacyScore', 'id', 'internetScore', 'mediaScore',
    'name_en', 'opennessIndex', 'religionScore', 'speechScore', 'tradeScore', 'transparencyScore',
  ]);
});

test('single-country lookup uses PostgreSQL $1 placeholder (not MySQL ?) and returns one object', async () => {
  const q = fakeQuery([row(7, 'Jepang', 'Japan')]);
  const res = await fetchDoktrin(q, '  japan ');
  assert.equal(Array.isArray(res), false);
  assert.equal(res.name_en, 'Japan');
  assert.equal(q.calls.length, 1);
  assert.match(q.calls[0].sql, /\$1/);
  assert.doesNotMatch(q.calls[0].sql, /\?/);
  assert.deepEqual(q.calls[0].params, ['japan']);
});

test('no country returns all rows mapped, with a single query', async () => {
  const q = fakeQuery([row(1, 'A', 'A'), row(2, 'B', 'B')]);
  const res = await fetchDoktrin(q, null);
  assert.equal(res.length, 2);
  assert.equal(q.calls.length, 1);
});

test('unknown country falls back to the full list (previous behaviour)', async () => {
  let n = 0;
  const q = async () => (++n === 1 ? [] : [row(1, 'A', 'A')]);
  const res = await fetchDoktrin(q, 'zzz');
  assert.equal(Array.isArray(res), true);
  assert.equal(n, 2);
});
