# Fractional Decay System Implementation Plan

## Overview

Convert the Neo Santara rating decay system from **discrete threshold-based decay** (current: -1 rating per N months) to **smooth fractional decay** that scales continuously with satisfaction level.

**Current System (Discrete):**
- Kepuasan ≤ 25: threshold = 1 month (-1 rating/month)
- Kepuasan ≤ 40: threshold = 3 months (-1 rating/3 months)
- Kepuasan ≤ 65: threshold = 6 months (-1 rating/6 months)
- Kepuasan ≤ 80: threshold = 9 months (-1 rating/9 months)
- Kepuasan > 80: threshold = 12 months (-1 rating/year)

**New System (Fractional):**
- Kepuasan ≤ 25: multiplier = 0.1 per month
- Kepuasan ≤ 40: multiplier = 0.3 per month
- Kepuasan ≤ 65: multiplier = 0.6 per month
- Kepuasan ≤ 80: multiplier = 0.85 per month
- Kepuasan > 80: multiplier = 1.0 per month

**Result:** Decay becomes fractional (0.1 instead of 1) at satisfaction levels 25 and below, smooth transition, no jarring threshold crossings.

---

## Design Decisions

### 1. **Multiplier Tiers vs Continuous Interpolation**
**Decision:** Keep discrete tiers (as specified by user), not continuous interpolation.
**Rationale:** User's request explicitly shows tier boundaries (≤25, ≤40, ≤65, ≤80, >80) with fixed multipliers (0.1, 0.3, 0.6, 0.85, 1.0). This keeps the system predictable and easy to communicate to players.

### 2. **Counter Accumulation Method**
**Decision:** Accumulate fractional decay in `ratingMonthCounter` (same field), let fractional values floor when calculating decrease.
**Rationale:** 
- Preserves the counter scaling logic that already works
- Example: counter=0.5 + 1 month = 1.5, with multiplier 0.1 → actual decay += 0.15, counter becomes 1.5
- When counter ≥ 1, we floor to integer for rating loss
- Matches user's intent: "0.1 agar nanti dikalikan 10 dulu" (multiply by 10 eventually)

### 3. **Migration Path for Existing Saves**
**Decision:** No data migration needed; system works with existing integer counters.
**Rationale:**
- Old saves have integer `ratingMonthCounter` (0-11)
- First calculation after load: counter gets scaled based on old/new threshold, preserves percentage
- Fractional arithmetic automatically handles transition: 5 months + 0.3 multiplier = 5 + 0.3 = 5.3
- No breaking change to save format

### 4. **Bonus Mitigation (Kementerian Kebudayaan)**
**Decision:** Apply bonus BEFORE multiplier calculation, not after.
**Rationale:**
- Current code: `getThresholdFromSatisfaction()` → `applyKementerianKebudayaanRatingDecayReduction()` → use threshold
- New code: `getDecayMultiplier()` → `applyKementerianKebudayaanDecayMultiplierBonus()` → use multiplier
- Preserves bonus semantics: ministry reduces decay pressure, not the multiplier itself
- Bonus can reduce multiplier by %, e.g., if ministry grants 20% reduction, multiplier 0.6 becomes 0.48

### 5. **Sector Deficit Penalty Integration**
**Decision:** Sector penalty stays as additional direct decay, separate from kepuasan-driven multiplier.
**Rationale:**
- Current: `additionalDecay` (sector penalties + crisis penalties) passed to `calculatePresidentRating()`
- New: Same mechanism, now applied alongside fractional decay
- Sector penalty remains: -2 points per low sector, max -10 per 6 months, triggered separately
- Keeps concerns separated: kepuasan-driven vs sector-deficit-driven decay

### 6. **Low Sector Threshold Effect**
**Decision:** Remove `lowSectorCount > 0 ? baseThreshold = Math.min(baseThreshold, 6)` cap; instead let low sectors affect kepuasan normally.
**Rationale:**
- Old system needed threshold cap to limit damage when sectors were low
- New fractional system is already gentle at ≤25 kepuasan (0.1x multiplier)
- Sector penalties already apply via `additionalDecay` mechanism
- Simplifies logic, removes special case

---

## Implementation Plan

### Phase 1: Add Multiplier Calculation Function

**Item 1.1:** Add `getDecayMultiplierFromSatisfaction()` function to `peringkatCalculator.ts`
- **What to do:** Create function that returns decay multiplier (0.1 to 1.0) based on kepuasan level
- **Files to create/modify:**
  - `d:\project-sendiri\neosantara\apps\src\app\logic\peringkatCalculator.ts`
- **Function signature:**
  ```typescript
  export function getDecayMultiplierFromSatisfaction(
    kepuasan: number,
    keterbukaanScore?: number,
    serviceDeficitPressure = 0,
  ): number
  ```
- **Logic:**
  - Base multiplier from kepuasan tiers: 0.1 (≤25), 0.3 (≤40), 0.6 (≤65), 0.85 (≤80), 1.0 (>80)
  - If keterbukaan < 50: apply keterbukaan multiplier = 0.4 + (keterbukaan/50)*0.5 (same as before, applied to the base multiplier)
  - If serviceDeficitPressure > 0: reduce multiplier by `(serviceDeficitPressure * 0.5)` (max 50% reduction)
  - Return final multiplier, clamped to [0, 1]
- **Verify:** Run TypeScript compiler on modified file; no build errors

### Phase 1b: Add Bonus Mitigation for Multiplier

**Item 1.2:** Add `applyKementerianKebudayaanDecayMultiplierBonus()` function to bonus logic
- **What to do:** Mirror the existing threshold bonus but for multipliers
- **Files to create/modify:**
  - `d:\project-sendiri\neosantara\apps\src\app\page\bonus_logic\kementerian_bonus_logic\9_Kementerian_Kebudayaan.ts`
- **Function signature:**
  ```typescript
  export function applyKementerianKebudayaanDecayMultiplierBonus(
    baseMultiplier: number,
    countryDetail: Record<string, unknown> | null | undefined
  ): number
  ```
- **Logic:**
  - Get bonus reduction % via `getKementerianKebudayaanRatingDecayReductionPercent()`
  - If no bonus (0%), return baseMultiplier unchanged
  - If bonus exists: `resultMultiplier = baseMultiplier * (1 - bonusPercent/100)`, clamped to [0, 1]
  - Example: 20% bonus + 0.6 multiplier → 0.6 * (1 - 0.2) = 0.48
- **Verify:** TypeScript compiler passes, no build errors

### Phase 2: Refactor Counter Accumulation Logic

**Item 2.1:** Update `calculatePresidentRating()` to use fractional decay and multipliers
- **What to do:** Replace discrete threshold logic with continuous fractional multiplier logic
- **Files to modify:**
  - `d:\project-sendiri\neosantara\apps\src\app\logic\peringkatCalculator.ts`
- **Changes to function:**
  ```typescript
  export function calculatePresidentRating(input: PresidentRatingInput): PresidentRatingOutput {
    // ... existing validation ...
    
    // NEW: Calculate decay multiplier instead of threshold
    const baseMultiplier = getDecayMultiplierFromSatisfaction(
      currentKepuasan,
      keterbukaanScore,
      serviceDeficitPressure,
    );
    
    let newMultiplier = applyKementerianKebudayaanDecayMultiplierBonus(
      baseMultiplier,
      input.countryDetail
    );
    
    // Handle crisis: override multiplier to 1.0 if unhandled crisis
    if (input.hasUnhandledPopulationCrisis) {
      newMultiplier = 1.0;
    }
    
    // Accumulate fractional decay
    let newRatingMonthCounter = ratingMonthCounter + monthsPassed;
    
    // Apply multiplier to decay accumulation
    const fractionalDecayThisMonth = monthsPassed * newMultiplier;
    newRatingMonthCounter += fractionalDecayThisMonth - monthsPassed; // Adjust to fractional
    
    // Calculate how many full rating points we lose
    const ratingDecrease = Math.floor(newRatingMonthCounter);
    const newCounter = newRatingMonthCounter - ratingDecrease;
    
    // Apply boost and decay
    const ratingAfterBoost = Math.min(100, currentRating + currentCompletedBoost);
    const totalDecrease = ratingDecrease + Math.max(0, additionalDecay);
    const nextRating = Math.max(0, ratingAfterBoost - totalDecrease);
    
    return {
      presidentRating: nextRating,
      rating_month_counter: newCounter,
      last_rating_threshold: newMultiplier, // Store multiplier instead of threshold
      nextRating,
      ratingDecreaseThisTick: totalDecrease,
    };
  }
  ```
- **Verify:** TypeScript compiler passes; function signature unchanged to callers

**Item 2.2:** Remove obsolete functions and simplify logic
- **What to do:** Delete/deprecate old threshold-based functions that are no longer needed
- **Files to modify:**
  - `d:\project-sendiri\neosantara\apps\src\app\logic\peringkatCalculator.ts`
- **Functions to mark as deprecated or remove:**
  - `getThresholdFromSatisfaction()` (replaced by `getDecayMultiplierFromSatisfaction()`)
  - `calculateRatingDecrease()` (logic now inline in `calculatePresidentRating()`)
  - `scaleRatingCounterOnThresholdChange()` (now applies to multiplier scaling, simpler logic)
- **Rationale:** Cleaner code, removes confusion. Keep old functions as `@deprecated` exports for a release if needed.
- **Verify:** No code paths call removed functions; grep confirms

### Phase 3: Update Counter Scaling on Multiplier Change

**Item 3.1:** Implement multiplier-aware counter scaling
- **What to do:** When multiplier changes (satisfaction tier boundary crossed), scale counter to preserve player perception
- **Files to modify:**
  - `d:\project-sendiri\neosantara\apps\src\app\logic\peringkatCalculator.ts`
- **Logic to add inside `calculatePresidentRating()`:**
  ```typescript
  // Scale counter if multiplier tier changed
  const prevMultiplier = lastRatingThreshold; // Now stores multiplier, not threshold
  if (prevMultiplier > 0 && prevMultiplier !== newMultiplier) {
    // Preserve percentage: if counter was at 50% of previous tier, 
    // keep it at ~50% of new tier
    // newCounter = (oldCounter / oldMultiplier) * newMultiplier
    // But since we're working in "months accumulated", the scaling is simpler:
    // just proportional adjustment
    newRatingMonthCounter = (newRatingMonthCounter / prevMultiplier) * newMultiplier;
  }
  ```
- **Verify:** Unit test: counter = 0.5, prev multiplier = 0.6, new multiplier = 0.3 → counter becomes 0.25 (50% of old range → 50% of new range)

### Phase 4: Update Type Definitions and Return Values

**Item 4.1:** Update `PresidentRatingOutput` and `PresidentRatingState` type definitions
- **What to do:** Clarify that `last_rating_threshold` now holds a multiplier (0-1), not a threshold in months
- **Files to modify:**
  - `d:\project-sendiri\neosantara\apps\src\app\logic\peringkatCalculator.ts`
- **Changes:**
  ```typescript
  export interface PresidentRatingState {
    presidentRating: number;
    rating_month_counter: number;
    last_rating_threshold: number; // Now: multiplier (0-1), previously: months (1-12)
  }
  ```
- **Verify:** TypeScript compiler; search for all type usages

### Phase 5: Update Callers (Game Loop Integration)

**Item 5.1:** Update `map-system.tsx` to work with new multiplier system
- **What to do:** Ensure game loop still calls `calculatePresidentRating()` correctly; no caller-side changes needed if function signature preserved
- **Files to check:**
  - `d:\project-sendiri\neosantara\apps\src\app\page\map_system\map-system.tsx` (lines ~5321)
  - `d:\project-sendiri\neosantara\apps\src\app\logic\npc_country_simulation\npcCountrySimulation.ts` (lines ~369)
- **What to verify:**
  - `calculatePresidentRating()` is called with same parameters (no changes needed)
  - Return values are stored to `rating_month_counter`, `presidentRating`, `last_rating_threshold` (same fields)
  - Sector deficit penalty (`additionalDecay`) still passed correctly
- **Verify:** No build errors; game still compiles

### Phase 6: Testing and Verification

**Item 6.1:** Create unit tests for fractional decay calculations
- **What to do:** Write test suite covering:
  - Multiplier tiers: 0.1, 0.3, 0.6, 0.85, 1.0
  - Keterbukaan multiplier application
  - Bonus mitigation (Kementerian Kebudayaan)
  - Counter accumulation and floor behavior
  - Crisis override to 1.0 multiplier
- **Files to create:**
  - `d:\project-sendiri\neosantara\apps\src\app\logic\__tests__\peringkatCalculator.test.ts` (or appropriate test directory)
- **Test cases:**
  ```typescript
  describe('getDecayMultiplierFromSatisfaction', () => {
    test('kepuasan ≤ 25 returns 0.1', () => {
      expect(getDecayMultiplierFromSatisfaction(20)).toBe(0.1);
    });
    test('kepuasan ≤ 40 returns 0.3', () => {
      expect(getDecayMultiplierFromSatisfaction(35)).toBe(0.3);
    });
    test('kepuasan ≤ 65 returns 0.6', () => {
      expect(getDecayMultiplierFromSatisfaction(60)).toBe(0.6);
    });
    test('kepuasan ≤ 80 returns 0.85', () => {
      expect(getDecayMultiplierFromSatisfaction(75)).toBe(0.85);
    });
    test('kepuasan > 80 returns 1.0', () => {
      expect(getDecayMultiplierFromSatisfaction(90)).toBe(1.0);
    });
  });
  
  describe('calculatePresidentRating fractional decay', () => {
    test('1 month × 0.1 multiplier decays 0.1 rating (accumulates)', () => {
      const result = calculatePresidentRating({
        currentRating: 50,
        ratingMonthCounter: 0,
        lastRatingThreshold: 1.0,
        monthsPassed: 1,
        currentKepuasan: 20, // multiplier 0.1
        currentDate: '2024-01-02',
      });
      expect(result.rating_month_counter).toBe(0.1); // 0 + 1*0.1
      expect(result.presidentRating).toBe(50); // No floor yet
    });
    
    test('10 months × 0.1 multiplier decays 1 rating', () => {
      const result = calculatePresidentRating({
        currentRating: 50,
        ratingMonthCounter: 0,
        lastRatingThreshold: 1.0,
        monthsPassed: 10,
        currentKepuasan: 20, // multiplier 0.1
        currentDate: '2024-01-11',
      });
      expect(result.rating_month_counter).toBe(0); // (0 + 10*0.1 = 1) floor = 0 remainder
      expect(result.presidentRating).toBe(49); // Decayed 1 point
    });
  });
  ```
- **Verify:** `npm run test` or project's test command passes all new tests

**Item 6.2:** Integration test: verify smooth decay transition across kepuasan thresholds
- **What to do:** Simulate 12 months with kepuasan starting at 90, dropping to 20, verify decay curve is smooth
- **Test:** 
  - Month 1-3: kepuasan 90 (1.0 multiplier) → decay 0.33/month
  - Month 4-6: kepuasan 70 (0.85 multiplier) → decay 0.28/month  
  - Month 7-9: kepuasan 50 (0.6 multiplier) → decay 0.2/month
  - Month 10-12: kepuasan 25 (0.1 multiplier) → decay 0.033/month
  - Total rating loss over 12 months ≈ 1 point (smooth, not abrupt)
- **Verify:** Integration test passes

### Phase 7: Save Data Compatibility Check

**Item 7.1:** Test that existing saves load and continue working
- **What to do:** Load a save with old threshold values (1-12) stored in `last_rating_threshold`, verify system treats it as multiplier and game continues
- **Files to test:**
  - Create test save with `last_rating_threshold: 6` (old system: 6 months)
  - Load and simulate 1 month tick
  - Verify: counter scaling applies, no crash
- **Verify:** Save loads without error, rating continues to decay smoothly

---

## Verification Commands

After each phase, run:

1. **TypeScript Build:**
   ```bash
   npm run compile
   # or: npx tsc --noEmit
   ```
   Expected: No compilation errors

2. **Unit Tests (if test runner available):**
   ```bash
   npm run test -- peringkatCalculator
   # or: npx vitest run src/app/logic/__tests__/peringkatCalculator.test.ts
   ```
   Expected: All new tests pass

3. **Game Load and Play:**
   - Start new game, verify rating decays smoothly (not abrupt jumps)
   - Load existing save, verify rating continues to decay, game doesn't crash
   - Lower kepuasan to <25, verify decay is gentle (0.1x multiplier)
   - Raise kepuasan to >80, verify decay slows (1.0x multiplier)

4. **Navbar Display:**
   - Rating should update every game tick (monthly)
   - Color should transition smoothly: green → yellow → red as rating drops
   - No errors in browser console

---

## Rollback Plan

If issues arise:
- **Revert Phase 1-2:** Restore `getThresholdFromSatisfaction()`, restore old `calculatePresidentRating()` logic
- **Keep multiplier functions** if they work well, remove if not
- **Revert git commit** if needed
- Existing saves remain compatible (threshold vs multiplier stored in same field, only interpretation changes)

---

## Migration Notes

### From Player Perspective
- **Before:** Rating drops fast at low satisfaction (1 point/month when critical)
- **After:** Rating drops slowly at low satisfaction (0.1 point/month when critical), 10x slower
- **Expectation:** Players with low satisfaction will see their rating decline more gradually, giving them more time to recover

### From Developer Perspective
- **Counter accumulation now fractional** (can be 5.3, not just 5)
- **Multiplier replaces threshold** (0.1-1.0 instead of 1-12)
- **No database migration** needed; same fields, different interpretation
- **Bonus system still works**, applied before multiplier

---

## Edge Cases Handled

| Case | Behavior |
|------|----------|
| kepuasan crosses 25→26 | Multiplier changes 0.1→0.3; counter scaled proportionally |
| Keterbukaan < 50 | Multiplier compressed; decay accelerates slightly but smoothly |
| Kementerian Kebudayaan bonus active | Multiplier reduced by bonus %; decay further slowed |
| Crisis (unhandled disaster) | Multiplier forced to 1.0; normal decay rate |
| Rating = 0 | Clamped at 0; no negative ratings |
| Counter accumulation < 1 | Fractional rating loss accumulates; rating decreases when floor(counter) changes |
| Existing save loaded | `last_rating_threshold` interpreted as multiplier; works if within [0,1] range; if old value (1-12), may need one-time normalization |

---

## Summary of Changes

| File | Change | Type |
|------|--------|------|
| `peringkatCalculator.ts` | Add `getDecayMultiplierFromSatisfaction()` | New function |
| `peringkatCalculator.ts` | Refactor `calculatePresidentRating()` | Modified |
| `peringkatCalculator.ts` | Mark old functions as deprecated | Cleanup |
| `9_Kementerian_Kebudayaan.ts` | Add `applyKementerianKebudayaanDecayMultiplierBonus()` | New function |
| `peringkatCalculator.test.ts` | Add comprehensive unit tests | New file |
| `map-system.tsx` | No changes required | —— |
| `npcCountrySimulation.ts` | No changes required | —— |

Total files modified: **3 existing + 1 new + 1 new (test)**
Lines of code changed: ~150-200 (new functions + tests)
Breaking changes: **None** (existing saves compatible)
