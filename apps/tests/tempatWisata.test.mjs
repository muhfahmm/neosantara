// Run: node --test "tests/*.test.mjs"   (from apps/)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import {
  parseTempatWisataSql, getTempatWisataFallback, resetTempatWisataFallbackCache,
} from '../src/lib/tempatWisataFallback.ts';

const SQL = `INSERT INTO t VALUES
(1, 'indonesia', 'Candi Borobudur', 5000),
(2, 'jepang', 'Kuil O''Neil', 7000);`;

test('parser extracts rows and unescapes doubled quotes', () => {
  const rows = parseTempatWisataSql(SQL);
  assert.deepEqual(rows, [
    { id: 1, country_slug: 'indonesia', nama_wisata: 'Candi Borobudur', penghasilan: 5000 },
    { id: 2, country_slug: 'jepang', nama_wisata: "Kuil O'Neil", penghasilan: 7000 },
  ]);
});

test('real seed file parses to the same count as the DB table (748)', async () => {
  resetTempatWisataFallbackCache();
  const real = path.resolve('../json/10_database_tempat_wisata/database_tempat_wisata.pg.sql');
  const rows = await getTempatWisataFallback(real);
  assert.equal(rows.length, 748);
});

test('loads once: concurrent calls share one promise, later calls reuse the result', async () => {
  resetTempatWisataFallbackCache();
  const dir = await mkdtemp(path.join(tmpdir(), 'wisata-'));
  const file = path.join(dir, 'x.pg.sql');
  await writeFile(file, SQL);
  try {
    const [a, b] = await Promise.all([getTempatWisataFallback(file), getTempatWisataFallback(file)]);
    assert.equal(a, b, 'same array instance => single load');
    await rm(file); // file gone: cached result must still be served
    assert.equal(await getTempatWisataFallback(file), a);
  } finally {
    await rm(dir, { recursive: true, force: true });
    resetTempatWisataFallbackCache();
  }
});

test('missing file yields [] and is not cached (retry works once file appears)', async () => {
  resetTempatWisataFallbackCache();
  const dir = await mkdtemp(path.join(tmpdir(), 'wisata-'));
  const file = path.join(dir, 'late.pg.sql');
  try {
    assert.deepEqual(await getTempatWisataFallback(file), []);
    await new Promise((r) => setImmediate(r)); // let the not-cached reset run
    await writeFile(file, SQL);
    assert.equal((await getTempatWisataFallback(file)).length, 2);
  } finally {
    await rm(dir, { recursive: true, force: true });
    resetTempatWisataFallbackCache();
  }
});

