// Run: node --test "tests/*.test.mjs"   (from apps/)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { gunzipSync, brotliDecompressSync } from 'node:zlib';
import {
  setCachedResponse,
  getCachedResponse,
  buildCachedApiResponse,
  invalidateCache,
} from '../src/lib/apiResponseCache.ts';

test('apiResponseCache: sets pre-serialized and pre-compressed buffers with ETag', () => {
  invalidateCache();
  const sample = { hello: 'world', numbers: [1, 2, 3] };
  const payload = setCachedResponse('sample_key', sample);

  assert.ok(payload.etag.startsWith('W/"'));
  assert.equal(gunzipSync(payload.gzipBuffer).toString('utf8'), JSON.stringify(sample));
  assert.equal(brotliDecompressSync(payload.brBuffer).toString('utf8'), JSON.stringify(sample));
  assert.equal(getCachedResponse('sample_key'), payload);
});

test('apiResponseCache: serves 304 Not Modified when ETag matches If-None-Match', () => {
  invalidateCache();
  const payload = setCachedResponse('test_etag', { status: 'ok' });
  const req = new Request('http://localhost/api/test', {
    headers: { 'If-None-Match': payload.etag },
  });

  const res = buildCachedApiResponse(req, payload);
  assert.equal(res.status, 304);
  assert.equal(res.headers.get('ETag'), payload.etag);
  assert.equal(res.headers.get('Access-Control-Allow-Origin'), '*');
});

test('apiResponseCache: serves Brotli or Gzip based on Accept-Encoding', async () => {
  invalidateCache();
  const payload = setCachedResponse('test_comp', { data: 'compressed-test-data' });

  // Test Brotli
  const reqBr = new Request('http://localhost/api/test', {
    headers: { 'Accept-Encoding': 'gzip, deflate, br' },
  });
  const resBr = buildCachedApiResponse(reqBr, payload);
  assert.equal(resBr.status, 200);
  assert.equal(resBr.headers.get('Content-Encoding'), 'br');
  const bufBr = Buffer.from(await resBr.arrayBuffer());
  assert.equal(brotliDecompressSync(bufBr).toString('utf8'), JSON.stringify({ data: 'compressed-test-data' }));

  // Test Gzip
  const reqGz = new Request('http://localhost/api/test', {
    headers: { 'Accept-Encoding': 'gzip, deflate' },
  });
  const resGz = buildCachedApiResponse(reqGz, payload);
  assert.equal(resGz.status, 200);
  assert.equal(resGz.headers.get('Content-Encoding'), 'gzip');
  const bufGz = Buffer.from(await resGz.arrayBuffer());
  assert.equal(gunzipSync(bufGz).toString('utf8'), JSON.stringify({ data: 'compressed-test-data' }));
});
