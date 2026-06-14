---
id: PLAN-001
title: "Mobile Responsiveness Implementation Plan"
requirement: REQ-001
task: TASK-002
created: 2026-06-14
---

# Mobile Responsiveness Implementation Plan

## Architecture Overview

The app composes a full-screen animated `CipherBackground` (fixed, `z-0`) with a
`HermesShell` modal frame (`z-10`) layered on top, plus a `SettingsDrawer`
(`fixed inset-0 z-40`) that overlays everything. The shell wraps `RankHeader`,
`PrescriptCard`, and `RecordPanel` in a vertical flex column.

The mobile defect lives entirely in `HermesShell.jsx`. On mobile the inner shell
uses `min-h-dvh` with only side borders (`border-x-2`, no top/bottom border) and
no max-height constraint. This produces an edge-to-edge vertical strip: the shell
spans the full viewport height with no top/bottom gap, so the cipher background is
only visible as thin left/right slivers, and the page itself can grow taller than
the viewport. Desktop (`md:`) already centers a bounded, rounded, shadowed shell
with `max-h-[88vh]` and `overflow-hidden` — that path is correct and must not change.

The fix restructures the mobile branch of the outer wrapper to **center a bounded,
nearly-full-height shell with a small constant padding gap on all four sides**, and
introduces a **single inner scroll region** so that when content cannot fit (the
critical landscape case, viewport ~360px tall), it scrolls inside the shell rather
than overflowing the page or clipping. The header stays pinned; the card + record
panel share one scrollable area.

Data flow, state, and component props are untouched — this is a CSS/layout-only change.

## Codebase Analysis

- **`src/App.jsx`** (lines 238-291): outer `.app-mount` div holds `CipherBackground`,
  `HermesShell` (with the three children), and `SettingsDrawer` as siblings. No
  height/overflow constraints here beyond the fade animation. The `app-mount` class
  is not defined in `index.css` (only referenced for the animation inline style), so
  it carries no layout rules — safe.
- **`src/components/HermesShell.jsx`** (lines 6-7): the sole file with the layout bug.
  - Outer: `min-h-dvh md:min-h-screen hermes-bg ... md:flex md:items-center md:justify-center md:px-8 md:py-8`
  - Inner: `w-full max-w-md mx-auto min-h-dvh md:min-h-0 md:h-auto md:max-h-[88vh] md:max-w-4xl flex flex-col gap-0 border-x-2 md:border-2 hermes-border ... md:rounded-2xl md:overflow-hidden md:shadow-[...]`
  - Mobile lacks: centering, a height cap, full border, rounding, and overflow control.
- **`src/components/RankHeader.jsx`**: buttons already carry `min-h-11` (44px) tap
  targets. Three text buttons (`BGM On/Off`, `Settings`, `Light/Dark`) plus the rank
  block share one flex row. At 360px the three buttons + rank text compete for width;
  buttons can clip against the shell border or the rank text can collide. Secondary
  scope (US-3).
- **`src/components/RecordPanel.jsx`** (line 50): the history list uses
  `max-h-64 overflow-y-auto` (256px). Under a shell-level scroll region this creates a
  competing nested scroll area at short viewport heights. The scroll strategy must
  account for this.
- **`src/components/PrescriptCard.jsx`** (line 66): root is `flex-1`, absorbing slack
  in portrait. Inside the bounded scroll region it should keep flexing but no longer be
  the page's height driver.
- **`src/components/SettingsDrawer.jsx`**: `fixed inset-0 z-40`, sibling outside the
  shell. Independent of shell sizing; only needs a smoke-verify that it still overlays.
- **`index.css`**: defines `hermes-*` token utilities and the dark-mode variant. The
  shell already uses `dvh` units, which REQ-001 requires preserving. No CSS changes
  needed; all work is Tailwind utility classes in JSX.
- **Tests**: `vitest` + `@testing-library/react` in jsdom. Existing component tests
  (e.g. `RankHeader.test.jsx`) assert class presence and structure, not real layout —
  jsdom does not compute layout. There is no `HermesShell.test.jsx` yet.

## Implementation Tasks

### 1. HermesShell mobile layout + single scroll region (complexity: 2)
- **Slice**: `.guild/plans/PLAN-001/slice-hermesshell-layout.md`
- **Summary**: Restructure the mobile branch of `HermesShell` to center a bounded,
  nearly-full-height shell with a tasteful all-sides gap, full border + rounding, and a
  single inner scroll region; relax `RecordPanel`'s fixed `max-h-64` so it cooperates
  with shell-level scrolling. Handle portrait and landscape together. Preserve all
  `md:` classes and `dvh` units verbatim.
- **Depends on**: none

### 2. RankHeader fitting at 360px (complexity: 1)
- **Slice**: `.guild/plans/PLAN-001/slice-rankheader-fit.md`
- **Summary**: Ensure the three header action buttons and the rank/trust text fit at
  360px without clipping, overlap, or wrapping off-screen, keeping the 44px tap targets.
  Secondary priority (US-3).
- **Depends on**: none (independent file; can run in parallel with Task 1)

### 3. Layout regression tests (complexity: 1)
- **Slice**: `.guild/plans/PLAN-001/slice-tests.md`
- **Summary**: Add class-presence/structure tests for the new `HermesShell` layout and
  the `RankHeader` fit, in the existing jsdom convention. Guard against regression of
  `dvh` units, preserved `md:` classes, and tap targets.
- **Depends on**: Tasks 1 and 2

## Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Gap mechanism | Constant responsive padding on the outer flex container (`p-3`-ish, optionally `sm:p-4`) + inner `h-full` | Guarantees cipher shows on all four sides; avoids margin + max-height math; a small constant frame reads as deliberate and keeps US-1.4 proportionality acceptable at 360/390/430px. |
| Page scroll vs shell scroll | Switch mobile shell from `min-h-dvh` to `h-dvh` (outer) so the page cannot scroll; content scrolls inside the shell | Satisfies US-1 AC-3 and US-2 AC-1 (no page-body scrollbar). |
| Single scroll region | One `flex-1 overflow-y-auto` wrapper around `PrescriptCard` + `RecordPanel`; header stays fixed at top of the column; shell gets `overflow-hidden` on mobile | Prevents competing nested scrolls at short (landscape) heights; keeps header reachable. |
| RecordPanel `max-h-64` | Relax inside the bounded shell so it does not fight the shell-level scroll (let it grow/shrink within the shared scroll area) | At ~360px landscape height a fixed 256px inner list plus header overflows; a single scroll region must own the overflow. |
| Landscape handling | Same bounded `h-dvh` + centered + single-scroll structure handles landscape; no separate orientation breakpoint needed | The bounded-height + inner-scroll structure is orientation-agnostic; avoids extra `landscape:` complexity. |
| `dvh` units | Preserved | REQ-001 explicitly requires `dvh` over `vh` for browser-chrome correctness. |
| Desktop `md:` classes | Untouched, verbatim | Out of scope per REQ-001; desktop layout is already correct. |
| CSS file changes | None | All changes expressible as Tailwind utility classes in JSX. |

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Restructuring the outer wrapper breaks desktop centering | Desktop regression (out-of-scope breakage) | Keep every `md:` class verbatim; only the non-prefixed mobile classes change. Add an explicit "md: layout unchanged" acceptance check + test asserting `md:` classes still present. |
| Nested scroll (RecordPanel `max-h-64` vs shell scroll) clips or double-scrolls in landscape | US-2 AC-1 violation | Designate one scroll region; relax `RecordPanel`'s fixed cap inside the shell (detailed in slice). |
| Switching `min-h-dvh` → `h-dvh` introduces body scroll if `app-mount`/body adds height | US-1 AC-3 violation | `app-mount` carries no layout rules (verified); verify body has no extra height; outer is `h-dvh overflow-hidden` on mobile. |
| jsdom tests can't verify real overflow | False confidence | Slice and plan state tests assert class presence/structure only; real no-overflow behavior is a manual device/responsive-DOM check, noted in the test slice. |
| SettingsDrawer overlay broken by shell change | Drawer unusable | Drawer is a fixed sibling outside the shell; include a smoke-verify it still opens and overlays. |
