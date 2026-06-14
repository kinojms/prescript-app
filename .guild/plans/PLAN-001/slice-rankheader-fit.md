---
plan: PLAN-001
title: "RankHeader fitting at 360px"
complexity: 1
---

# RankHeader fitting at 360px

## Objective

Ensure the `RankHeader` action buttons (`BGM On/Off`, `Settings`, `Light/Dark`) and the
rank/trust display fit within a 360px-wide shell without clipping against the shell
border, overlapping the rank text, or wrapping buttons off-screen — while preserving
the 44px minimum tap targets. Secondary priority (US-3).

## Files to Touch

- `src/components/RankHeader.jsx` — modify — adjust the header row layout/spacing so the
  three action buttons and the rank block coexist at 360px.

## Approach

### Current state
`RankHeader.jsx` (lines 28-83): one flex row with a `flex-1 min-w-0` rank/trust/progress
block on the left and a `flex items-center gap-2 flex-shrink-0` group of three text
buttons on the right. Each button is `min-h-11 ... px-3 ... text-xs uppercase
tracking-widest`. At 360px, inside a shell that now has full border + padding, the three
buttons plus the rank text contend for limited width; the wide letter-spacing
(`tracking-widest`) and `px-3` padding make the buttons wide, risking clipping or
collision with the rank text.

### Target
Make the three buttons fit at 360px without clipping or pushing content off-screen,
keeping each button at least 44px tall and tappable. Acceptable techniques (developer
judgment; combine as needed):
- The rank block already has `flex-1 min-w-0` with `truncate` on the rank name — keep
  it so the rank text yields space rather than the buttons.
- Tighten button horizontal padding on the smallest screens (e.g. `px-2` mobile,
  `sm:px-3`) and/or reduce `tracking-widest` → `tracking-wider` on the buttons so labels
  stay on one line and the row stays within 360px.
- Ensure the button group does not wrap awkwardly; if width is still tight, allow the
  rank/trust line to truncate or wrap gracefully (it already uses `flex-wrap` on the
  rank/trust baseline row) while the buttons stay on screen.
- Do NOT remove `min-h-11` (or `min-w-11` on the mode button); tap targets must stay
  ≥ 44px (US-3 AC-2).

### Constraints
- Keep all button labels and `aria-label`s exactly as they are (tests assert these).
- Keep `min-h-11` on the BGM, Settings, and mode buttons; keep `min-w-11` on the mode
  button.
- Desktop appearance must not regress; prefer mobile-only adjustments via the default
  classes with `sm:`/`md:` restoring current spacing if you tighten anything.

## Interface Contract

- `RankHeader` keeps its existing props and API unchanged.
- Button `aria-label` text and visible labels (`BGM On`/`BGM Off`, `Settings`,
  `Light`/`Dark`) are unchanged — other components and tests depend on them.
- No prop or DOM-structure changes that affect `RankHeader.test.jsx` assertions
  (header element present, button roles/names, `min-h-11` presence).

## Acceptance Criteria

- [ ] At 360px wide, all three action buttons are fully visible and tappable with no
      clipping against the shell border (US-3 AC-1).
- [ ] Each action button retains a ≥ 44×44px tap target (`min-h-11`, mode button also
      `min-w-11`) (US-3 AC-2).
- [ ] At 360px, rank/trust text does not overflow its container or overlap the action
      buttons; long rank labels truncate/wrap without pushing buttons off-screen
      (US-3 AC-3, edge case).
- [ ] Desktop header layout is unchanged.
- [ ] `npm test` passes (existing `RankHeader.test.jsx` assertions still hold).
