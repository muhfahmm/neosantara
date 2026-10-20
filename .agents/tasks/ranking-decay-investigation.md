# Neo Santara Ranking Decay Investigation Report

## Executive Summary

The president's ranking (peringkat) in the navbar is experiencing rapid decline due to **multiple compounded decay mechanisms** that activate aggressively when satisfaction sectors fall below the 25-point threshold. The system has three separate decay channels all triggering simultaneously: base kepuasan-driven decay, low sector deficit penalties, and keterbukaan (openness) acceleration. This is **working as designed but with overly aggressive parameters**.

### Key Finding
When any satisfaction sector score drops below 25 points (LOW_SECTOR_SCORE_THRESHOLD), it triggers:
- An additional kepuasan penalty (2 points per low sector every 6 months)
- Threshold reduction from up to 12 months down to 6 months for rating decay
- Keterbukaan multiplier that can further compress the threshold to 0.4x-0.6x

This creates a "cascading collapse" where ranking drops 5+ points per month in crisis states, which feels unfair to players with no apparent game problem.

---

## Root Cause Analysis

### 1. Ranking Calculation System (Primary Logic)

**File:** `apps/src/app/logic/peringkatCalculator.ts`

The president rating system has four decay mechanisms:

#### A. Base Kepuasan-Driven Decay
```typescript
// getThresholdFromSatisfaction() [lines 38-61]
export function getThresholdFromSatisfaction(
  kepuasan: number,
  keterbukaanScore?: number,
  serviceDeficitPressure = 0,
  lowSectorCount = 0,
): number {
  let baseThreshold = 12;  // 12 months = -1 rating/year normally
  
  if (kepuasan <= 25) {
    baseThreshold = 1;  // KRITIS: -1 rating per MONTH
  } else if (kepuasan <= 40) {
    baseThreshold = 3;  // BURUK: -1 rating per 3 months
  } else if (kepuasan <= 65) {
    baseThreshold = 6;  // SEDANG: -1 rating per 6 months
  } else if (kepuasan <= 80) {
    baseThreshold = 9;  // BAIK: -1 rating per 9 months
  } else {
    baseThreshold = 12; // SANGAT BAIK: -1 rating per 12 months
  }
```

**Finding:** When overall kepuasan drops to ≤25, rating decays **1 point per month** instead of 1 per year. This alone is 12x faster.

#### B. Keterbukaan (Openness) Multiplier
```typescript
// Line 53-57
if (keterbukaanScore !== undefined && keterbukaanScore < 50) {
  const factor = Math.max(0.4, 0.4 + (keterbukaanScore / 50) * 0.5);
  // At keterbukaan=10: factor = 0.4 + (10/50)*0.5 = 0.6x
  baseThreshold = Math.max(1, Math.floor(baseThreshold * factor));
}
```

**Finding:** If keterbukaan is low (< 50), threshold is compressed to 0.4x-0.9x of base. A keterbukaan of 10 with kepuasan 30 gives:
- Base threshold = 3 (kepuasan ≤ 40)
- After keterbukaan compression = 3 * 0.6 = 1.8 → floor(1.8) = **1 month**

#### C. Service Deficit Pressure
```typescript
// Line 59-60
const serviceFactor = 1 - Math.min(1, Math.max(0, serviceDeficitPressure)) * 0.5;
baseThreshold = Math.max(1, Math.floor(baseThreshold * serviceFactor));
```

**Finding:** Not widely used in player simulation (NPC uses it), but can further compress threshold.

#### D. Low Sector Count Cap
```typescript
// Line 61
if (lowSectorCount > 0) baseThreshold = Math.min(baseThreshold, 6);
```

**Finding:** If ANY sector score < 25, threshold is capped at 6 months max, but this is overridden by above factors.

---

### 2. Low Sector Deficit Penalty System

**File:** `apps/src/app/logic/npc_country_simulation/npcCountrySimulation.ts` (lines 331-350)
**Decay Constants in:** `apps/src/app/logic/kepuasanCalculator.ts` (lines 240-242)

```typescript
// Constants
export const LOW_SECTOR_SCORE_THRESHOLD = 25;
export const LOW_SECTOR_DECAY_INTERVAL_MONTHS = 6;
export const LOW_SECTOR_DECAY_POINTS_PER_SECTOR = 2;
export const LOW_SECTOR_DECAY_MAX_POINTS_PER_INTERVAL = 10;

// Calculation Logic (npcCountrySimulation.ts, lines 331-350)
const lowSectorCount = countLowSatisfactionSectors(country, metadata);
const accumulatedDeficitMonths = lowSectorCount > 0
  ? previousDeficitMonths + monthsPassed
  : 0;
const completedDeficitPeriods = lowSectorCount > 0
  ? Math.floor(accumulatedDeficitMonths / LOW_SECTOR_DECAY_INTERVAL_MONTHS)
  : 0;
const sectorDeficitPenaltyThisTick = completedDeficitPeriods * Math.min(
  LOW_SECTOR_DECAY_MAX_POINTS_PER_INTERVAL,
  lowSectorCount * LOW_SECTOR_DECAY_POINTS_PER_SECTOR,
);

// This penalty is SUBTRACTED from kepuasan
const nextKepuasan = Math.max(
  1,
  Math.min(
    100,
    parseFloat(
      (
        Number(country.kepuasan ?? 50) -
        sectorDeficitPenaltyThisTick  // <-- DIRECT PENALTY
      ).toFixed(1),
    ),
  ),
);
```

**Finding:** When ANY sector is low (<25), every 6 months:
- Penalty = min(10, lowSectorCount * 2)
- Example: 3 low sectors = min(10, 6) = **10 points kepuasan loss per 6 months**
- This is applied EVERY tick (game day)

---

### 3. How These Compound in Crisis

**Example Scenario:** Player has 3 sectors at 15 (below 25 threshold)

**Initial State:**
- Kepuasan: 50
- Keterbukaan: 30
- Low sectors: 3
- Rating: 50

**After first 6 months:**
1. Sector deficit penalty triggers: kepuasan drops by 10 → **kepuasan = 40**
2. Kepuasan threshold recalculated with kepuasan=40:
   - Base threshold = 3 (kepuasan ≤ 40 tier)
   - Keterbukaan multiplier = 0.4 + (30/50)*0.5 = **0.7x** 
   - Final threshold = floor(3 * 0.7) = **2 months**
3. Rating decays 1 point per 2 months instead of 1 per 12 months
4. Over 12 months: **6 points lost** from kepuasan decay alone
5. Plus: kepuasan continues dropping from sector penalties

**After 12 months in crisis:**
- Kepuasan dropped from 50 → ~20 (due to sector penalties accumulating)
- This triggers lowest kepuasan tier (≤25): threshold = 1 month
- Rating decays **1 point per month** = **12 points per year**
- Plus additional kepuasan decay penalties keep compounding

**Result:** Rating can drop 15-20 points in a year with multiple low sectors, even though player is actively trying to fix the problem.

---

## Evidence from Code

### 1. Navbar Display (apps/src/app/page/navbar/Navbar.tsx)

Line 244-246: Rating is displayed simply as `${presidentRating}/100`
```typescript
<StatusItem 
    icon={<Star className="w-3 h-3 2xl:w-3.5 2xl:h-3.5 fill-[#00FFAA] text-[#00FFAA]" />} 
    label="PERINGKAT" 
    value={`${presidentRating}/100`} 
    color={getPresidentRatingColor(presidentRating)} 
/>
```

Color changes based on severity:
```typescript
function getPresidentRatingColor(rating: number): string {
  if (rating >= 80) return 'text-green-700 font-black';
  if (rating >= 60) return 'text-green-600';
  if (rating >= 40) return 'text-yellow-600';
  if (rating >= 20) return 'text-red-600';
  return 'text-red-700 font-black';
}
```

### 2. Main Calculation Loop (apps/src/app/page/map_system/map-system.tsx)

Lines 5321-5340 show where `calculatePresidentRating()` is called each game tick:

```typescript
const ratingResult = calculatePresidentRating({
    currentRating: prev.presidentRating ?? 50,
    ratingMonthCounter: prev.rating_month_counter ?? 0,
    lastRatingThreshold: prev.last_rating_threshold ?? 12,
    monthsPassed,
    currentKepuasan: nextKepuasan,
    keterbukaanScore,
    lowSectorCount,
    hasUnhandledPopulationCrisis: hasUnhandledCrisis,
    additionalDecay: sectorDeficitPenaltyThisTick + unhandledDisasterPenalty,
    currentCompletedBoost: currentCompletedBoost,
    countryDetail: prev,
    lastDate,
    currentDate: currentDateStr,
});

if (ratingResult.nextRating !== (prev.presidentRating ?? 50) || currentCompletedBoost > 0) {
    setPresidentRating(ratingResult.nextRating);
}
```

**Key Finding:** `additionalDecay` includes BOTH:
- `sectorDeficitPenaltyThisTick` (10 points max per interval)
- `unhandledDisasterPenalty` (natural disaster penalties)

These are added on top of the kepuasan-driven decay.

### 3. Sector Detection Logic (apps/src/app/logic/kepuasanCalculator.ts)

Lines 553-556:
```typescript
export function countLowSatisfactionSectors(countryDetail: any, metadata: any): number {
  return Object.values(getSatisfactionSectorScores(countryDetail, metadata))
    .filter((score) => score < LOW_SECTOR_SCORE_THRESHOLD).length;
}
```

**Finding:** Uses hardcoded threshold of 25. Every sector below 25 triggers penalties.

---

## The Math Behind Rapid Decay

### Worst-Case Scenario Calculation

**Conditions:**
- 5 sectors at score 20 (all below 25 threshold)
- Overall kepuasan: 25 (critical level)
- Keterbukaan: 20 (very low)
- 6 months pass in game

**Step 1: Sector deficit penalty per 6 months**
```
Penalty = min(10, 5 sectors * 2 points/sector) = min(10, 10) = 10 points
```

**Step 2: Kepuasan drops from 50 → 40 due to accumulated penalties**

**Step 3: Rating threshold recalculation**
```
Base threshold = 1 (kepuasan = 25, KRITIS tier)
Keterbukaan multiplier = max(0.4, 0.4 + (20/50)*0.5) = max(0.4, 0.6) = 0.6x
Final threshold = floor(1 * 0.6) = 1 month
```

**Step 4: Over 12 months**
```
Months elapsed = 12
Threshold = 1 month
Rating decrease = floor(12 / 1) = 12 points
```

**Step 5: Additional decay passed to function**
```
additionalDecay = 10 (sector penalties) + 0 (no crisis) = 10
```

**Step 6: Final rating drop in 12 months**
```
Total = kepuasan_decay (12) + additional_decay (10) = 22 points lost
Result: Rating from 50 → 28 in just one year
```

---

## System Interlock: Why It Feels Exponential

The system has a **positive feedback loop**:

1. **Low sector triggers** (score < 25)
2. **Kepuasan penalty applied** (-10 per 6 months)
3. **Kepuasan drops below 25** (from accumulated penalties)
4. **Rating threshold tightens** (1 month instead of 12)
5. **Rating drops faster** (accelerates decay)
6. **Lower rating affects gameplay** (harder to recover)
7. **Loop repeats** → exponential-looking decay

This is **compounding arithmetic decay**, not truly exponential, but the effect is dramatic because three independent systems all activate at the same threshold (25).

---

## Implementation Quality Issues

### 1. Silent Penalty
- Sector deficit penalty (-10 kepuasan per 6 months) is applied **directly to kepuasan** in NPC sim
- **Never shown to player in UI** — no notification about why kepuasan is dropping
- Player sees rating decline but doesn't understand it's from "low sector compound penalties"

### 2. Bonus System Only Partially Mitigates
**File:** `apps/src/app/page/bonus_logic/kementerian_bonus_logic/9_Kementerian_Kebudayaan.ts`

```typescript
export function applyKementerianKebudayaanRatingDecayReduction(
  baseThresholdMonths: number,
  countryDetail: Record<string, unknown> | null | undefined
): number {
  if (!Number.isFinite(baseThresholdMonths) || baseThresholdMonths <= 0) 
    return baseThresholdMonths;

  const reductionPercent = getKementerianKebudayaanRatingDecayReduction(countryDetail);
  if (reductionPercent <= 0) return baseThresholdMonths;

  const reductionFraction = Math.min(reductionPercent, 90) / 100;
  return Math.ceil(baseThresholdMonths / (1 - reductionFraction));
}
```

**Issue:** This only helps if Kementerian Kebudayaan is built (and even then, max 90% reduction). For players without this ministry early game, they have no mitigation.

### 3. Asymmetric Recovery
- **Decay:** Automatic, happens every day tick
- **Recovery:** Requires player action (build sectors, manage economy, reduce deficit)
- **Result:** Easier to fall into crisis than climb out

---

## Why This Breaks Game Feel

1. **Unpredictable drops:** Player doesn't see "sector deficit system" in UI, just sees rating crash
2. **Compound penalties:** Three systems triggering simultaneously feels like "the game is punishing me"
3. **Slow recovery:** Fixing 5 sectors takes ~20 game days each = 100 days minimum; rating loss happens in days
4. **New player trap:** Low keterbukaan + low sectors = instant crisis loop; experienced player issue too

---

## Recommendations

### Priority 1: Transparency
- **Add notification** when sector deficit penalties are applied
- **Show threshold visualization** in rating card (e.g., "Rating will drop in 2 months")
- **Display what triggers crisis state** (low kepuasan, sector deficits, keterbukaan)

### Priority 2: Soften Aggressive Parameters
Consider tuning these constants in `kepuasanCalculator.ts`:
- `LOW_SECTOR_DECAY_INTERVAL_MONTHS`: Increase from 6 → 12 (let problems persist longer before penalty)
- `LOW_SECTOR_DECAY_POINTS_PER_SECTOR`: Reduce from 2 → 1 (less aggressive sector penalty)
- `LOW_SECTOR_DECAY_MAX_POINTS_PER_INTERVAL`: Reduce from 10 → 5 (cap penalty lower)

Example tuned values:
```typescript
export const LOW_SECTOR_DECAY_INTERVAL_MONTHS = 12;  // Was 6
export const LOW_SECTOR_DECAY_POINTS_PER_SECTOR = 1;  // Was 2
export const LOW_SECTOR_DECAY_MAX_POINTS_PER_INTERVAL = 5;  // Was 10
```

This gives players 12 months per low sector accumulation instead of 6, halving penalty intensity.

### Priority 3: Add Recovery Pathways
- Sector improvements should provide **rating boost** (not just stop the penalty)
- Reaching > 50 kepuasan should **reduce all thresholds back** (give hope)
- Quick win sectors (e.g., 1-month construction) should have larger satisfaction payoff

### Priority 4: Visualize the Crisis Loop
- Dashboard showing which sectors are low
- Warning when approaching threshold (sector ≤ 35 shows caution)
- Recovery estimate ("Reach 30+ kepuasan to exit crisis mode in 6 months")

---

## Files Modified in Investigation

| File | Lines | Finding |
|------|-------|---------|
| `peringkatCalculator.ts` | 38-61 | Base kepuasan decay tiers: 1-12 months depending on kepuasan |
| `peringkatCalculator.ts` | 53-57 | Keterbukaan multiplier: 0.4x-0.9x compression |
| `kepuasanCalculator.ts` | 240-242 | Low sector decay constants (6 months, 2 pts/sector, 10 max) |
| `npcCountrySimulation.ts` | 331-350 | Sector deficit penalty calculation (-10 kepuasan per 6mo) |
| `map-system.tsx` | 5321-5340 | Main rating update loop |
| `map-system.tsx` | 2452 | Rating state initialization |
| `Navbar.tsx` | 244-246 | Rating display (no threshold visualization) |
| `Navbar.tsx` | 313-320 | Rating color coding |

---

## Conclusion

The ranking decay system is **working as intended**, but the **intention is too punitive**. Three independent decay mechanisms (kepuasan, sector deficits, keterbukaan) all trigger on the same threshold (25) and compound simultaneously, creating a cascade effect that makes ranking feel like it's "crashing" rather than "declining."

The root cause is not a bug, but an **aggressive balance that doesn't match player expectations**. Players expect a gradual penalty for poor management, not a **12x acceleration** when one stat drops below a threshold.

**Recommended action:** Implement Priority 1 (transparency) immediately, then tune Priority 2 (constants) after seeing player feedback.
