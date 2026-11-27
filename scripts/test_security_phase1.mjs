import { checkRateLimit, ALLOWED_ORIGINS, getCorsHeaders } from '../apps/src/lib/rateLimit.ts';

async function runTests() {
  console.log('=== TEST 1: CORS Whitelist & Origin Check ===');
  const allowedOrigin = 'https://neosantara.com';
  const disallowedOrigin = 'https://attacker-site.com';

  const reqAllowed = new Request('http://localhost:3000/api/pajak-negara', {
    headers: { origin: allowedOrigin },
  });
  const headersAllowed = getCorsHeaders(reqAllowed);
  if (headersAllowed['Access-Control-Allow-Origin'] === allowedOrigin) {
    console.log('[PASS] Origin resmi https://neosantara.com diizinkan');
  } else {
    console.error('[FAIL] Origin resmi tidak diizinkan:', headersAllowed);
    process.exit(1);
  }

  const reqDisallowed = new Request('http://localhost:3000/api/pajak-negara', {
    headers: { origin: disallowedOrigin },
  });
  const headersDisallowed = getCorsHeaders(reqDisallowed);
  if (!headersDisallowed['Access-Control-Allow-Origin']) {
    console.log('[PASS] Origin penyerang https://attacker-site.com diblokir (tidak ada Allow-Origin)');
  } else {
    console.error('[FAIL] Origin penyerang diizinkan:', headersDisallowed);
    process.exit(1);
  }

  console.log('\n=== TEST 2: Rate Limiting & Retry-After (Fallback In-Memory) ===');
  const testIp = '198.51.100.42';
  const reqLimiter = new Request('http://localhost:3000/api/auth', {
    headers: { 'x-forwarded-for': testIp },
  });

  // Tier auth: limit 5 req/min
  let blocked = false;
  let retrySec = 0;
  for (let i = 1; i <= 6; i++) {
    const res = await checkRateLimit(reqLimiter, 'auth', testIp);
    if (!res.success) {
      blocked = true;
      retrySec = res.retryAfter;
      console.log(`[PASS] Request ke-${i} diblokir dengan Rate Limit Exceeded (HTTP 429). Retry-After: ${retrySec}s`);
      break;
    }
  }

  if (blocked && retrySec > 0) {
    console.log('[PASS] Rate limiter terpusat berfungsi akurat dan menghitung Retry-After');
  } else {
    console.error('[FAIL] Rate limiter gagal memblokir setelah melewati batas');
    process.exit(1);
  }

  console.log('\nSEMUA PENGUJIAN KEAMANAN TAHAP 1 BERHASIL 100%!');
}

runTests().catch(err => {
  console.error(err);
  process.exit(1);
});
