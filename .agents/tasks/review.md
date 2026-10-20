# Code Review: Fractional Decay System Implementation

**Reviewer:** Kiro  
**Date:** 2026-10-20  
**Commit:** 4a7877f6 (feat: implement fractional decay system for rating with 0.1-1.0 multiplier progression)

---

## Summary

The implementation adds a fractional decay system to replace discrete threshold-based rating decay. The system maps satisfaction (kepuasan) levels to continuous multipliers (0.1-1.0) for smoother rating changes. **The implementation contains critical logic errors that break save data compatibility and lose counter scaling.**

---

## Verification Against Requirements

### ✅ Requirement 1: getDecayMultiplierFromSatisfaction() Maps Correctly

**Status:** PASS

The function correctly maps kepuasan ranges to 0.1-1.0 multipliers:
- kepuasan ≤ 25 → 0.1 multiplier ✓
- kepuasan ≤ 40 → 0.3 multiplier ✓
- kepuasan ≤ 65 → 0.6 multiplier ✓
- kepuasan ≤ 80 → 0.85 multiplier ✓
- kepuasan > 80 → 1.0 multiplier ✓

Keterbukaan adjustment and serviceDeficitPressure handling are applied correctly in series.

**File:** `peringkatCalculator.ts` lines 46-79

---

### ❌ Requirement 2: Multiplier Applied Smoothly (No Abrupt Jumps)

**Status:** FAIL - **CRITICAL LOGIC ERROR**

**Finding:** The counter scaling logic is overwritten immediately and has no effect.

**Evidence:**
- **Line 293:** `newRatingMonthCounter = ratingMonthCounter + (monthsPassed * newMultiplier);`
  
This line discards the scaled counter value computed at lines 289-291 (Step 4):
```typescript
// Step 4: Scale counter jika multiplier tier berubah
const prevMultiplier = lastRatingThreshold || newMultiplier;
if (prevMultiplier > 0 && prevMultiplier !== newMultiplier) {
  newRatingMonthCounter = scaleRatingCounterOnMultiplierChange(
    newRatingMonthCounter,
    prevMultiplier,
    newMultiplier
  );
}

// Step 5: [OVERWRITE] Recalculate from scratch, losing scaling
newRatingMonthCounter = ratingMonthCounter + (monthsPassed * newMultiplier);
```

**Consequence:** When a save transitions from old multiplier to new multiplier (e.g., kepuasan drops from 90 to 25), the counter is **not scaled proportionally**. Instead, the old counter value is combined directly with the new multiplier, causing unintended decay jumps.

**Example Scenario:**
- Old save: `ratingMonthCounter = 8`, `last_rating_threshold = 12` (old system), `kepuasan = 50`
- Game tick happens, `kepuasan` drops to 25 (critical)
- Step 4 should scale: `(8 / 12) * 0.1 ≈ 0.067`
- Step 5 actually computes: `8 + (1 * 0.1) = 8.1`
- Result: The scaled counter is lost; decay accelerates unexpectedly

**Recommendation:** Step 5 must preserve the scaled counter:
```typescript
// Step 5 (corrected): Add new months with new multiplier to scaled counter
newRatingMonthCounter = newRatingMonthCounter + (monthsPassed * newMultiplier);
```

**File:** `peringkatCalculator.ts` line 293

---

### ❌ Requirement 3: Decay Calculation (months × multiplier = smooth progression)

**Status:** FAIL - Due to error above

The formula `months * multiplier` is correct in isolation (line 293), but the accumulation logic is broken because scaling is lost. The progression will not be smooth when transitioning between tiers.

---

### ✅ Requirement 4: Bonus Mitigation Still Applies

**Status:** PASS

The Kementerian Kebudayaan bonus is correctly applied to the multiplier:
- **File:** `9_Kementerian_Kebudayaan.ts` lines 32-44
- Function `applyKementerianKebudayaanDecayMultiplierBonus()` correctly reduces the multiplier by the bonus percentage
- Example: `baseMultiplier * (1 - bonusPercent/100)` with clamping to [0, 1]
- Called at line 280 in `calculatePresidentRating()`

**Evidence:**
```typescript
export function applyKementerianKebudayaanDecayMultiplierBonus(
  baseMultiplier: number,
  countryDetail: Record<string, unknown> | null | undefined
): number {
  if (!Number.isFinite(baseMultiplier) || baseMultiplier <= 0) return baseMultiplier;
  const bonusPercent = getKementerianKebudayaanRatingDecayReductionPercent(countryDetail);
  if (bonusPercent <= 0) return baseMultiplier;
  const bonusFraction = Math.min(bonusPercent, 90) / 100;
  const adjustedMultiplier = baseMultiplier * (1 - bonusFraction);
  return Math.max(0, Math.min(1, adjustedMultiplier));
}
```

---

### ❌ Requirement 5: Low Sector Penalty System Works

**Status:** FAIL - **INCOMPLETENESS**

The low sector penalty system is not integrated into the new multiplier-based decay. 

**Evidence:**
- Old system (deprecated `getThresholdFromSatisfaction()`): line 111 has `if (lowSectorCount > 0) baseThreshold = Math.min(baseThreshold, 6);`
- New system (`getDecayMultiplierFromSatisfaction()`): lines 46-79 do **not** apply any low sector penalty

The `calculatePresidentRating()` function accepts `lowSectorCount` parameter (line 264) but **never uses it**. It's passed to `getDecayMultiplierFromSatisfaction()` at line 278 but that function ignores it (parameter missing from signature).

**Consequence:** Low sector penalties no longer affect decay rate. Game balance affected.

**Recommendation:** Add `lowSectorCount` parameter to `getDecayMultiplierFromSatisfaction()` and apply the equivalent penalty in the fractional system. For example:
```typescript
if (lowSectorCount > 0) {
  // Apply equivalent pressure: old min 6 months = new ~0.6 multiplier
  const sectorFactor = Math.max(0.6, 1.0 - (lowSectorCount * 0.05));
  baseMultiplier = baseMultiplier * sectorFactor;
}
```

**File:** `peringkatCalculator.ts` lines 46-79, 264, 278

---

### ⚠️ Requirement 6: Counter Scaling Logic

**Status:** FAIL - See Requirement 2

The scaling function exists (`scaleRatingCounterOnMultiplierChange()`) but is overwritten immediately (line 293).

---

### ✅ Requirement 7: Rating Initialization Unchanged

**Status:** PASS

Rating is still initialized at 50 in callers:
- `npcCountrySimulation.ts` line 371: `currentRating: Number(country.presidentRating ?? 50)`
- `map-system.tsx` line 5323: `currentRating: prev.presidentRating ?? 50`

---

### ❌ Requirement 8: Build Succeeds

**Status:** UNKNOWN - No Build Log

**Evidence:** The build log files exist but are empty or not accessible. The code is syntactically valid TypeScript (can verify via IDE) but no recorded build verification available.

**Recommendation:** Run `npm run build` or compile step to verify no errors.

---

### ❌ Requirement 9: No Breaking Changes to Save Data Structure

**Status:** FAIL - **INCOMPATIBLE WITH OLD SAVES**

**Issue 1: Semantic Mismatch in `last_rating_threshold` Field**
- Old saves store threshold in **months** [1-12]: "rating drops when counter reaches this many months"
- New code interprets the same field as **multiplier** [0.1-1.0]: "apply this multiplier to monthly decay"
- When old save loads with threshold=12, it's interpreted as multiplier=12 (invalid, clamped to 1.0)

**Issue 2: Caller Defaults Are Wrong**
- Both callers default `lastRatingThreshold ?? 12`, which is incompatible with new system
- `npcCountrySimulation.ts` line 373: `lastRatingThreshold: Number(country.last_rating_threshold) || 12`
- `map-system.tsx` line 5326: `lastRatingThreshold: prev.last_rating_threshold ?? 12`
- Default should be `1.0` (multiplier for healthy kepuasan > 80)

**Issue 3: Counter Accumulation Semantics Changed**
- Old system: counter accumulates in "threshold-months" (0-11 before reset)
- New system: counter accumulates in "fractional months" (0-∞ with floor)
- On first load, old counter=8 (old system) becomes counter=8 (new system) but means different things

**Consequence:** Existing saves will have **inverted or wrong decay rates**. A save with healthy kepuasan (multiplier should be 1.0) defaulting to threshold=12 will have its counter scaled down to 1/12 of expected, causing rapid decay.

**Example Scenario:**
- Old save: `last_rating_threshold=12`, `rating_month_counter=6`, `kepuasan=90`
- New system loads: `newMultiplier=1.0`, `prevMultiplier=12` (from saved field)
- Step 4 scaling: `(6 / 12) * 1.0 = 0.5` (scaled down!)
- But Step 5 overwrites this: `6 + (1 * 1.0) = 7` anyway
- Result: Counter jumps to 7 instead of staying ~6.5, unexpected decay

**Recommendation:**
1. Fix the caller defaults to use `1.0` instead of `12`
2. Add a migration path: detect if `last_rating_threshold` is in old range [1-12] and convert to multiplier equivalent via reverse mapping
3. Document save format change

**Files:** 
- `peringkatCalculator.ts` line 280 (Step 4 implementation flawed)
- `npcCountrySimulation.ts` line 373
- `map-system.tsx` line 5326

---

### ❌ Requirement 10: Code Comments Explain 0.1-1.0 Logic

**Status:** PARTIAL

Comments are present and explain the concept well:
- File header (lines 8-15) clearly documents fractional decay system
- Function `getDecayMultiplierFromSatisfaction()` has comprehensive doc comment (lines 39-49)
- `calculatePresidentRating()` has flow documentation (lines 229-249)

However, comments do **not address**:
- Why counter scaling is immediately overwritten (confusing for maintainers)
- How to handle old save data semantics
- The difference between "counter in old system" (threshold-months) vs "new system" (fractional months)

**Recommendation:** Add explanation comment at line 289-293 clarifying the counter logic is intentionally overwritten, or fix the logic if this is a bug.

---

## Additional Issues Found

### Unused Parameter: `lowSectorCount`

**Issue:** Parameter accepted but never used in new decay calculation.

**File:** `peringkatCalculator.ts` line 264 (parameter definition)

**Impact:** Low sector penalties completely removed from game.

---

### Crisis Override Correct

**Status:** ✅ PASS

Crisis override (lines 284-287) correctly forces multiplier to 1.0, giving fast decay during unhandled disasters.

---

## Summary of Findings

| Issue | Severity | File | Line | Status |
|-------|----------|------|------|--------|
| Counter scaling overwritten immediately | **CRITICAL** | peringkatCalculator.ts | 293 | Must Fix |
| Low sector penalty system removed | **HIGH** | peringkatCalculator.ts | 46-79, 264 | Must Fix |
| Caller default threshold wrong (12 instead of 1.0) | **HIGH** | map-system.tsx, npcCountrySimulation.ts | 5326, 373 | Must Fix |
| No save data migration strategy | **HIGH** | peringkatCalculator.ts | N/A | Must Fix |
| Build verification missing | **MEDIUM** | Various | N/A | Should Verify |
| Unused `lowSectorCount` parameter | **LOW** | peringkatCalculator.ts | 264 | Can Clean Up |

---

## Verdict

**CHANGES_REQUESTED**

The implementation has **three critical blockers**:

1. **Counter scaling logic is immediately overwritten**, breaking smooth transitions and causing unexpected decay jumps
2. **Low sector penalty system is not ported** to the new multiplier-based system, removing game balance
3. **Caller defaults are incompatible** with the new multiplier semantics, causing wrong decay rates on load

These must be fixed before approval. The concept and bonus logic are sound, but the core decay accumulation and save compatibility are broken.

