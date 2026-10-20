# Modal Size Investigation Report
## Neo Santara Project — Kepuasan Menu

**Date:** Investigation conducted  
**Status:** COMPLETE  
**Finding:** Modal sizing inconsistency identified in Kepuasan menu modals

---

## Executive Summary

The modals in the Kepuasan menu are **NOT** sized consistently. Two modals (`StatistikKepuasanModal` and `NaikkanKepuasanModal`) use **larger custom sizing** than the default `NotebookModalWrapper` sizing, while the main "Kepuasan Rakyat" menu modals use the default sizing. The inconsistency needs to be resolved to match all modals to the same size standard.

---

## Evidence

### 1. NotebookModalWrapper — Default Sizing

**File:** `d:\project-sendiri\neosantara\apps\src\app\page\navigasi_menu\2_navigasi_bawah\NotebookModalWrapper.tsx`

**Default max-width class (line 18):**
```typescript
maxWidthClass = 'max-w-3xl lg:max-w-[940px] xl:max-w-[1040px] 2xl:max-w-5xl'
```

**Responsive breakpoints:**
- Mobile: `max-w-3xl` (768px)
- Large: `lg:max-w-[940px]` (940px)
- Extra Large: `xl:max-w-[1040px]` (1040px)
- 2XL: `2xl:max-w-5xl` (64rem = 1024px)

---

### 2. StatistikKepuasanModal — Custom Larger Sizing

**File:** `d:\project-sendiri\neosantara\apps\src\app\page\navigasi_menu\2_navigasi_bawah\1_kepuasan\1_statistik\StatistikKepuasanModal.tsx`

**Line 116:**
```typescript
<NotebookModalWrapper onClose={onClose} maxWidthClass="max-w-4xl lg:max-w-[1000px] xl:max-w-[1100px] 2xl:max-w-6xl">
```

**Responsive breakpoints:**
- Mobile: `max-w-4xl` (896px)
- Large: `lg:max-w-[1000px]` (1000px) — **60px wider than default**
- Extra Large: `xl:max-w-[1100px]` (1100px) — **60px wider than default**
- 2XL: `2xl:max-w-6xl` (72rem = 1152px) — **128px wider than default**

---

### 3. NaikkanKepuasanModal — Custom Larger Sizing (Same as StatistikKepuasanModal)

**File:** `d:\project-sendiri\neosantara\apps\src\app\page\navigasi_menu\2_navigasi_bawah\1_kepuasan\2_naikkan_kepuasan\NaikkanKepuasanModal.tsx`

**Line 254:**
```typescript
<NotebookModalWrapper onClose={onClose} maxWidthClass="max-w-4xl lg:max-w-[1000px] xl:max-w-[1100px] 2xl:max-w-6xl">
```

**Responsive breakpoints:** (Identical to StatistikKepuasanModal)
- Mobile: `max-w-4xl` (896px)
- Large: `lg:max-w-[1000px]` (1000px)
- Extra Large: `xl:max-w-[1100px]` (1100px)
- 2XL: `2xl:max-w-6xl` (1152px)

---

### 4. Other Kepuasan-Related Modals (Info Modal within NaikkanKepuasanModal)

**File:** `d:\project-sendiri\neosantara\apps\src\app\page\navigasi_menu\2_navigasi_bawah\1_kepuasan\2_naikkan_kepuasan\NaikkanKepuasanModal.tsx`

**Info modal (lines 451-456):**
```typescript
className="bg-[#0F2424] border border-[#00FFAA]/30 rounded-2xl overflow-hidden w-full max-w-3xl lg:max-w-[920px] xl:max-w-[1020px] 2xl:max-w-5xl h-full max-h-[calc(100vh-125px)]..."
```

This inline modal uses **almost-default sizing** with slight variations:
- Mobile: `max-w-3xl` (768px) — **Same as default**
- Large: `lg:max-w-[920px]` (920px) — **20px narrower than default**
- Extra Large: `xl:max-w-[1020px]` (1020px) — **20px narrower than default**
- 2XL: `2xl:max-w-5xl` (64rem = 1024px) — **Same as default**

---

## Comparison Table

| Modal | Component | Mobile | Large | XL | 2XL | Notes |
|-------|-----------|--------|-------|-----|-----|-------|
| **Default** | NotebookModalWrapper | 768px | 940px | 1040px | 1024px | — |
| **Statistik** | StatistikKepuasanModal | 896px | 1000px | 1100px | 1152px | **+128px at 2XL** |
| **Naikkan** | NaikkanKepuasanModal | 896px | 1000px | 1100px | 1152px | **+128px at 2XL** |
| **Info** | Info modal (inside Naikkan) | 768px | 920px | 1020px | 1024px | -20px at Large/XL |

---

## Root Cause Analysis

The `StatistikKepuasanModal` and `NaikkanKepuasanModal` explicitly pass a `maxWidthClass` prop to `NotebookModalWrapper`, overriding the default sizing with larger dimensions. This was likely done intentionally to provide more space for the content in these modals (grid of sectors and events), but creates a **visual inconsistency** when switching between the Statistik/Naikkan tabs and back to the main view.

The embedded "Info modal" inside `NaikkanKepuasanModal` uses nearly-default sizing, further compounding the inconsistency.

---

## User-Visible Impact

When the user navigates:
1. **Statistik tab** → Modal appears noticeably **wider** (especially on large screens)
2. **Switches to Naikkan Peringkat tab** → Modal **stays same width** (both use custom sizing)
3. **Info modal appears** → Modal becomes slightly **narrower** than the parent Naikkan modal

This creates a jarring, inconsistent UI experience across the three related modal states.

---

## Recommendations

### Option A: Make All Kepuasan Modals Match Default Size
**Approach:** Remove the custom `maxWidthClass` from both `StatistikKepuasanModal` and `NaikkanKepuasanModal`, revert to default sizing, and adjust content layout if needed (e.g., responsive grid, smaller padding on mobile).

**Pros:**
- Consistent with all other modals in the game
- Simpler to maintain
- Reduces custom sizing code

**Cons:**
- May require content reflow on large screens
- Grids might stack more on some breakpoints

---

### Option B: Update Default Sizing to Match Larger Modals
**Approach:** Change `NotebookModalWrapper` default `maxWidthClass` to `'max-w-4xl lg:max-w-[1000px] xl:max-w-[1100px] 2xl:max-w-6xl'`, apply consistently across all modals, and remove the custom prop from Kepuasan modals.

**Pros:**
- Gives all modals more breathing room
- Kepuasan content displays optimally
- Single source of truth for sizing

**Cons:**
- May break layout expectations in other modals
- Requires testing across all 10+ modals in the project
- Risk of unintended visual changes elsewhere

---

### Option C: Standardize All Modals to Default, Keep Kepuasan Custom Only If Needed
**Approach:** Keep the current custom sizing for Kepuasan modals (Options A and B are too broad), but ensure the Info modal inside `NaikkanKepuasanModal` also uses the same custom sizing for consistency.

**Pros:**
- Minimal risk: only touches Kepuasan modals
- Kepuasan stays visually optimized
- Other modals unaffected

**Cons:**
- Kepuasan menu remains visually distinct from the rest of the UI
- Complexity: maintain multiple sizing standards

---

## Conclusion

**The modals in the Kepuasan menu do NOT match the sizing of modals in the main "Kepuasan Rakyat" menu.** The two Kepuasan submenu modals (`StatistikKepuasanModal` and `NaikkanKepuasanModal`) use intentionally larger custom sizing, while the inline Info modal uses nearly-default sizing, creating visual inconsistency.

**Recommended action:** Choose one approach above based on UX priority:
- **UX priority = consistency:** Use Option A (standardize all to default)
- **UX priority = optimize content space:** Use Option B (enlarge all modals)
- **UX priority = minimize risk:** Use Option C (keep Kepuasan custom but consistent, fix Info modal)

The current state is **inconsistent and needs correction**, but the fix depends on the design intent for modal sizing across the entire game.

---

## Files Examined

1. `d:\project-sendiri\neosantara\apps\src\app\page\navigasi_menu\2_navigasi_bawah\NotebookModalWrapper.tsx` — Default wrapper and sizing
2. `d:\project-sendiri\neosantara\apps\src\app\page\navigasi_menu\2_navigasi_bawah\1_kepuasan\1_statistik\StatistikKepuasanModal.tsx` — Statistik modal (custom sizing)
3. `d:\project-sendiri\neosantara\apps\src\app\page\navigasi_menu\2_navigasi_bawah\1_kepuasan\2_naikkan_kepuasan\NaikkanKepuasanModal.tsx` — Naikkan modal (custom sizing) + embedded Info modal (near-default sizing)

---

## Verification Steps (For Implementation)

Once a fix is decided:

1. **Run the game and navigate to Kepuasan Rakyat menu**
2. **Observe the Statistik tab modal width** (take note of left/right margin)
3. **Click to Naikkan Peringkat tab** — modal width should **NOT** change
4. **Open the Info modal** (question mark button) — width should match parent modal
5. **Resize browser to different breakpoints** (mobile, tablet, desktop, 2XL) and verify consistency
6. **Compare modal widths visually** to other game modals (e.g., Kementrian, Tempat Umum, Hunian) to ensure they align

