# UI/UX Coordination

## Geopolitik claim

Branch: `ui/geopolitik`

This work claims only the following Geopolitik-owned UI files and their directly related styling:

- `apps/src/app/page/navigasi_menu/2_navigasi_bawah/7_geopolitik/**`
- `apps/src/app/page/detail_negara/2_geopolitik/**`
- `apps/src/app/page/detail_negara/1_informasi_umum/1_kedutaan_besar/**` (UI only)
- `apps/src/app/page/detail_negara/1_informasi_umum/2_pakta_non_agresi/**` (UI only)
- `apps/src/app/page/detail_negara/3_operasi_militer/**` (UI only)
- `apps/src/app/page/menus/tracking-modals/**` (UI only)
- `apps/src/app/page/map_system/RequireEmbassyModal.tsx`
- Geopolitik-only diplomatic confirmation and war-analysis modal components discovered during audit.

Do not edit shared files (`NotebookModalWrapper`, `PausedMenuFrame`/`rootFrameMenu`,
`RootModalCloseButton`, `rootModalTypography`, `globals.css`, `useViewportMode`,
`map-system.tsx`, `ModalsManager`, `BottomNav`, `TopNav`, `Navbar`, or
`navigationData`). Report shared-file issues here for coordination.

## Design decisions

- Reuse existing colors, shared modal patterns, and the centralized
  `useViewportMode` breakpoints. Do not add breakpoints or CSS variables.
- Keep gameplay rules and outcomes unchanged; adjust presentation and interaction only.
- Prioritize compact modal headers, one primary scroll region, touch-sized actions,
  readable relationship tiers, and clear diplomacy/military consequences.
- Preserve desktop layout unless a deliberate usability fix is required.

## Audit and priorities

- Repository inventory found PBB/resolution/voting, international organizations,
  embassy and relationship modals, country-detail geopolitics and military
  operations, and diplomacy tracking UI.
- Baseline screenshots were captured for the PBB modal at desktop (1388x820),
  landscape phone (800x360), and portrait phone (390x844). Desktop is balanced;
  landscape leaves little initial content visible below the tab row; portrait
  clips the long title and the third tab and overlaps the top status/navigation
  area.
- Other high-risk patterns found during source audit: embassy actions have small
  targets and remain side-by-side on narrow screens; international-organization
  tabs and info controls are too narrow for touch; military operation cards are
  tall and form a single column on portrait phones; nuclear confirmation did not
  disclose its global relationship penalty.
- PBB, embassy, organization, country-detail diplomacy/military cards, and the
  nuclear confirmation have received focused responsive/accessibility updates.
  Additional PBB and operation-flow states remain to be visually checked.
- The notebook modal frame's portrait offset is set by shared responsive CSS,
  while the visible top status area extends farther than the frame's current
  offset. Request shared-owner review of `--navbar-h` / `--modal-top-offset`
  alignment for portrait mode; do not change shared styles in this branch.
- Priority order: country-detail diplomacy/military actions and their
  confirmations; then embassy/relationship and tracking; then PBB voting and
  international-organization flows.

## Shared-file requests / observations

- Please review portrait modal top offset against the actual stacked mobile
  status/navigation chrome; baseline PBB modal content starts behind that chrome
  at 390x844.
