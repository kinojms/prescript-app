---
plan: PLAN-001
title: "Layout regression tests"
complexity: 1
---

# Layout regression tests

## Objective

Add class-presence and structure tests that guard the mobile-responsiveness changes
against regression, following the existing jsdom convention used across the suite
(assert Tailwind class presence and DOM structure — not computed layout, which jsdom
does not provide).

## Files to Touch

- `src/components/HermesShell.test.jsx` — create — tests for the restructured shell.
- `src/components/RankHeader.test.jsx` — modify — add/extend assertions for 360px button
  fitting if the slice changed classes (keep all existing tests passing).

## Approach

Mirror the existing convention (see `src/components/RankHeader.test.jsx`):
`// @vitest-environment jsdom`, `render` from `@testing-library/react`, `cleanup` in
`afterEach`, assert via `container.querySelector(...).className` / `getByRole`.

### HermesShell.test.jsx
Render `<HermesShell><div data-testid="child" /></HermesShell>` and assert:
- Children render (the test child appears).
- The shell uses `dvh` units (some element's className contains `h-dvh`) — guards
  REQ-001's "preserve dvh" requirement.
- The desktop branch is preserved: className contains the key `md:` classes
  (`md:max-h-[88vh]`, `md:rounded-2xl`, `md:overflow-hidden`, `md:max-w-4xl`) — guards
  against accidental desktop regression.
- The mobile shell is bounded/clipped: the inner shell className contains
  `overflow-hidden` and a full border (`border-2`) and rounding (`rounded-2xl`) — guards
  the framed, bounded mobile look.
- The outer wrapper centers + pads on mobile (className contains `items-center`,
  `justify-center`, and a padding class like `p-3`) — guards the tasteful gap.

(Assert against whatever exact class tokens the developer of slice 1 settles on; if they
differ from the suggestions above, assert the tokens actually used. The intent is: dvh
retained, md: preserved, mobile bounded + centered + padded.)

### RankHeader.test.jsx
If slice 2 changed button padding/tracking, add an assertion that the buttons still
contain `min-h-11` (already present at lines 89-96 — extend to cover the BGM button too,
which the existing test omits). Do not remove existing assertions.

### Constraints
- jsdom does not compute layout — do NOT write tests claiming to verify actual pixel
  overflow, viewport height, or no-scroll behavior. Those are manual responsive-DOM /
  device checks. Tests here assert class presence + structure only. State this in a
  comment at the top of the new test file.

## Interface Contract

- Tests consume only the public component APIs (`HermesShell` children prop, `RankHeader`
  props) — no new exports required from the components.
- Class tokens asserted must match the final tokens chosen in slices 1 and 2; coordinate
  by reading those components after they are implemented.

## Acceptance Criteria

- [ ] `src/components/HermesShell.test.jsx` exists and asserts: children render, `dvh`
      retained, key `md:` classes preserved, mobile shell bounded (`overflow-hidden` +
      full border + rounding), outer wrapper centered + padded.
- [ ] `RankHeader.test.jsx` continues to pass and covers `min-h-11` on the action
      buttons (including BGM).
- [ ] A comment documents that jsdom verifies classes/structure only, not real layout.
- [ ] `npm test` passes (full suite green).
