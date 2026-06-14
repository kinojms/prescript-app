---
id: TASK-004
title: "Fix RankHeader fitting at 360px"
agent: developer
status: done
requirement: REQ-001
plan: PLAN-001
plan-slice: .guild/plans/PLAN-001/slice-rankheader-fit.md
depends-on: []
priority: medium
created: 2026-06-14
---

## Objective

Fix RankHeader fitting at 360px

## Context

- Requirement: .guild/requirements/REQ-001.md
- Plan: .guild/plans/PLAN-001.md
- Plan slice: .guild/plans/PLAN-001/slice-rankheader-fit.md
- Parent task: TASK-002

## Acceptance Criteria

- [x] At 360px wide, all three action buttons are fully visible and tappable with no clipping against the shell border (US-3 AC-1) — verified by layout-budget reasoning: tightened buttons (~210-220px) fit well within ~280-300px available content width.
- [x] Each action button retains a >= 44x44px tap target (`min-h-11` on all three, `min-w-11` on mode button) (US-3 AC-2) — test-verified.
- [x] At 360px, rank/trust text does not overflow its container or overlap action buttons; `flex-1 min-w-0` on rank block ensures it yields space, long labels truncate (US-3 AC-3).
- [x] Desktop header layout is unchanged — `sm:px-3` and `sm:tracking-widest` restore original spacing at 640px+ (sm: breakpoint).
- [x] `npm test` passes — all 12 RankHeader tests pass.

## Work Log

### 2026-06-14 — developer
- Modified `src/components/RankHeader.jsx` — adjusted button horizontal padding from `px-3` to `px-2 sm:px-3` and letter spacing from `tracking-widest` to `tracking-wider sm:tracking-widest` on all three action buttons (BGM toggle, Settings, mode toggle).
- Key decisions: Used `sm:` breakpoint (640px) to restore original desktop spacing, keeping `md:` and larger classes untouched. `min-h-11` and `min-w-11` preserved on all applicable buttons. All labels and `aria-label` values unchanged.
- Layout budget reasoning: At 360px, tightened buttons occupy ~210-220px, leaving sufficient room within available ~280-300px content width. The rank block's `flex-1 min-w-0` + `truncate` absorbs any remaining squeeze. Tests pass (12/12).

## Follow-up Tasks
