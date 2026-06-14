---
id: TASK-008
title: "Fix: Scope mobile layout changes to mobile breakpoints only"
agent: developer
status: done
requirement: REQ-001
plan: PLAN-001
depends-on: []
priority: high
created: 2026-06-14
---

## Objective

The `overflow-hidden` class added to HermesShell's outer wrapper in TASK-003 has no `md:` prefix, meaning it applies on desktop too. This clips the desktop drop shadow (`md:shadow-[0_20px_60px_rgba(0,0,0,0.35)]`).

Also verify that HermesShell's inner shell classes added for mobile don't conflict with or duplicate desktop classes unnecessarily.

## Context

- Requirement: .guild/requirements/REQ-001.md
- Plan: .guild/plans/PLAN-001.md
- Review finding: TASK-006 Work Log — reviewer-architecture and reviewer-edge-case

## Fix

In `src/components/HermesShell.jsx`, add `md:overflow-visible` to the outer wrapper to cancel the mobile `overflow-hidden` at desktop breakpoints. This restores the desktop drop shadow.

Current outer wrapper (mobile classes):
```
h-dvh w-full flex items-center justify-center p-3 sm:p-4 overflow-hidden md:h-auto ...
```

Fix — add `md:overflow-visible`:
```
h-dvh w-full flex items-center justify-center p-3 sm:p-4 overflow-hidden md:overflow-visible md:h-auto ...
```

Run `npm test` after.

## Acceptance Criteria

- [x] `md:overflow-visible` (or equivalent) added to HermesShell outer wrapper
- [x] Desktop drop shadow is no longer clipped (all `md:shadow-*` classes remain present and unobstructed)
- [x] All existing `md:` classes preserved verbatim
- [x] `npm test` passes

## Work Log

### 2026-06-14 — developer
- Added `md:overflow-visible` to the outer wrapper className in `src/components/HermesShell.jsx`, immediately after `overflow-hidden`, so the mobile clip is cancelled at desktop breakpoints and the `md:shadow-[0_20px_60px_rgba(0,0,0,0.35)]` on the inner shell is no longer obstructed.
- All 12 HermesShell tests pass. Two pre-existing failures in `src/hooks/useAppState.test.js` (liveDistortion logic) are unrelated to this change and were present before the edit.

## Follow-up Tasks
