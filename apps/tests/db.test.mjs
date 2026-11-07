// Run: node --test "tests/*.test.mjs"   (from apps/). Uses Node built-in test runner and native TS type stripping.
import { test } from 'node:test';
import assert from 'node:assert/strict';

async function loadFreshDb() {
  // Unique query string => fresh module instance (module-level pool/config are re-evaluated).
  return import(`../src/lib/db.ts?t=${Date.now()}${Math.random()}`);
}

test('getDbPool rejects with a clear error when no password is configured', async () => {
  const saved = { a: process.env.DB_PASSWORD, b: process.env.PGPASSWORD };
  delete process.env.DB_PASSWORD;
  delete process.env.PGPASSWORD;
  try {
    const { getDbPool } = await loadFreshDb();
    await assert.rejects(() => getDbPool(), /DB_PASSWORD/);
  } finally {
    if (saved.a !== undefined) process.env.DB_PASSWORD = saved.a;
    if (saved.b !== undefined) process.env.PGPASSWORD = saved.b;
  }
});

test('getDbPool rejects an empty password', async () => {
  const saved = process.env.DB_PASSWORD;
  process.env.DB_PASSWORD = '';
  try {
    const { getDbPool } = await loadFreshDb();
    await assert.rejects(() => getDbPool(), /DB_PASSWORD/);
  } finally {
    if (saved === undefined) delete process.env.DB_PASSWORD; else process.env.DB_PASSWORD = saved;
  }
});
