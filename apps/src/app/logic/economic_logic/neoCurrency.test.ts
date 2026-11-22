import assert from "node:assert/strict";
import test from "node:test";
import { formatNeo, normalizeCountryFinancialState, roundNeo } from "./neoCurrency.ts";

test("NEO values use whole-unit nearest rounding", () => {
  assert.equal(roundNeo(12.49), 12);
  assert.equal(roundNeo(12.5), 13);
  assert.equal(roundNeo("7.6"), 8);
  assert.equal(roundNeo(null), 0);
  assert.throws(() => roundNeo(Number.NaN), TypeError);
  assert.throws(() => roundNeo(Number.POSITIVE_INFINITY), TypeError);
  assert.equal(formatNeo(1234.56, "en-US"), "1,235");
  assert.equal(formatNeo(1234.56, "id-ID"), "1.235");
});

test("saved country finances are normalized without rounding non-currency fields", () => {
  const normalized = normalizeCountryFinancialState({
    anggaran: 125.6,
    totalHutang: 20.4,
    gdp: 999.75,
    pinjamanList: [{
      amount: 10_000.4,
      interest: 4.8,
      totalRepayment: 10_480.42,
      paidAmount: 125.5,
      accumulatedPenalty: 2.4,
    }],
  });

  assert.equal(normalized?.anggaran, 126);
  assert.equal(normalized?.totalHutang, 20);
  assert.equal(normalized?.gdp, 999.75);
  assert.deepEqual(normalized?.pinjamanList?.[0], {
    amount: 10_000,
    interest: 4.8,
    totalRepayment: 10_480,
    paidAmount: 126,
    accumulatedPenalty: 2,
  });
});
