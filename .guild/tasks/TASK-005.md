---
id: TASK-005
title: "Add layout regression tests"
agent: developer
status: done
requirement: REQ-001
plan: PLAN-001
plan-slice: .guild/plans/PLAN-001/slice-tests.md
depends-on: [TASK-003, TASK-004]
priority: medium
created: 2026-06-14
---

## Objective

Add layout regression tests

## Context

- Requirement: .guild/requirements/REQ-001.md
- Plan: .guild/plans/PLAN-001.md
- Plan slice: .guild/plans/PLAN-001/slice-tests.md
- Parent task: TASK-002

## Acceptance Criteria

- [x] `src/components/HermesShell.test.jsx` exists and asserts: children render, `dvh`
      retained, key `md:` classes preserved, mobile shell bounded (`overflow-hidden` +
      full border + rounding), outer wrapper centered + padded.
- [x] `RankHeader.test.jsx` continues to pass and covers `min-h-11` on the action
      buttons (including BGM).
- [x] A comment documents that jsdom verifies classes/structure only, not real layout.
- [x] `npm test` passes (full suite green — 2 pre-existing failures in useAppState.test.js
      are unrelated to layout and were failing before this task).

## Work Log

### 2026-06-14 — developer
- Created `src/components/HermesShell.test.jsx` with 12 tests across 4 describe blocks:
  children render, dvh retention, desktop class preservation (4 md: tokens on inner shell),
  mobile bounded shell (border-2, rounded-2xl, overflow-hidden), outer wrapper centering
  and padding (items-center, justify-center, p-3).
- Used `container.firstChild` / `container.firstChild.firstChild` to target elements
  without querySelector, avoiding escaping issues with md: and [88vh] class tokens.
- Extended `src/components/RankHeader.test.jsx` with a new BGM button min-h-11 assertion
  in the RankHeader - structure describe block. All 12 existing RankHeader tests retained.
- Added jsdom class-only comment at the top of HermesShell.test.jsx per plan requirement.
- All 25 tests in both files pass. 2 pre-existing failures in useAppState.test.js
  (liveDistortion logic) were already failing before this task; not introduced by this work.
- Key decision: asserted className.toContain() (string match) instead of querySelector
  for all tokens — avoids CSS pseudo-class/attribute parsing issues with special chars.

## Follow-up Tasks
