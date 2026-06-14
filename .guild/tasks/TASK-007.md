---
id: TASK-007
title: "Fix: Resolve nested scroll containers"
agent: developer
status: done
requirement: REQ-001
plan: PLAN-001
depends-on: []
priority: high
created: 2026-06-14
---

## Objective

Resolve the nested scroll container issue introduced in TASK-003. The implementation currently has TWO scroll regions:
1. App.jsx scroll wrapper around PrescriptCard + RecordPanel (`flex-1 overflow-y-auto min-h-0 flex flex-col`)
2. RecordPanel list container (`flex-1 min-h-0 overflow-y-auto`)

This causes the Conclude Day button to become unreachable in landscape orientation because the two competing scroll regions trap it.

## Context

- Requirement: .guild/requirements/REQ-001.md
- Plan: .guild/plans/PLAN-001.md
- Review finding: TASK-006 Work Log — reviewer-architecture and reviewer-edge-case

## Fix

Choose ONE scroll strategy and remove the other:

**Preferred option (keep App.jsx wrapper):** Remove `overflow-y-auto` from RecordPanel's list container so the App.jsx wrapper owns all scrolling. The list should grow without its own scroll. Change RecordPanel list from `flex-1 min-h-0 overflow-y-auto` → `flex-1 min-h-0` (remove overflow-y-auto).

**Alternative (remove App.jsx wrapper):** Remove the scroll wrapper from App.jsx and instead give RecordPanel's list a flex-relative height. Only choose this if keeping the App.jsx wrapper breaks the layout.

Update `RecordPanel.test.jsx` class assertion to match the chosen approach.

## Acceptance Criteria

- [x] Only one scroll region exists in the shell — either App.jsx wrapper OR RecordPanel list, not both
- [x] Conclude Day button remains accessible in landscape viewport
- [x] `npm test` passes (all RecordPanel tests pass; 2 pre-existing failures in useAppState.test.js are unrelated to this task)

## Work Log

### 2026-06-14 — developer
- Removed `overflow-y-auto` from RecordPanel's list container div in `src/components/RecordPanel.jsx` (line 50), keeping `flex-1 min-h-0 hermes-scrollbar pr-1`. The App.jsx wrapper (`flex-1 overflow-y-auto min-h-0 flex flex-col`) is now the single scroll region.
- Updated the test in `src/components/RecordPanel.test.jsx` that previously asserted `overflow-y-auto` was present on the list container. Replaced it with an assertion confirming `overflow-y-auto` is NOT present on `.flex-1`, documenting the intent that App.jsx owns scrolling.
- All 16 RecordPanel tests pass. 2 pre-existing failures in `useAppState.test.js` are unrelated to scroll layout.

## Follow-up Tasks
