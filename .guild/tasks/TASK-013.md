---
id: TASK-013
title: "Implement daily evaluation engine and conclude-day reset flow"
agent: developer
status: done
requirement: REQ-003
plan: PLAN-003
plan-slice: .guild/plans/PLAN-003/01-evaluation-engine.md
depends-on: [TASK-006]
priority: high
created: 2026-06-11
---

## Objective

Implement daily evaluation engine and conclude-day reset flow

## Context

- Requirement: .guild/requirements/REQ-003.md
- Plan: .guild/plans/PLAN-003.md
- Parent task: TASK-006

## Acceptance Criteria

- [x] Task completed successfully

## Work Log

### developer - 2026-06-11
- Implemented Distortion Check evaluation engine and conclude-day action in app state.
- Added manual conclude-day entry point and automatic midnight scheduling.
- Implemented selective daily history reset preserving trust and custom prescripts.
- Added evaluation status model (`flawless`, `stable`, `distorting`) and thematic message mapping.

## Follow-up Tasks
