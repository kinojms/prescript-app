---
id: TASK-010
title: "Implement time-sensitive directive state and timeout penalty logic"
agent: developer
status: done
requirement: REQ-002
plan: PLAN-002
plan-slice: .guild/plans/PLAN-002/01-state-and-timer.md
depends-on: [TASK-005]
priority: high
created: 2026-06-11
---

## Objective

Implement time-sensitive directive state and timeout penalty logic

## Context

- Requirement: .guild/requirements/REQ-002.md
- Plan: .guild/plans/PLAN-002.md
- Parent task: TASK-005

## Acceptance Criteria

- [x] Task completed successfully

## Work Log

### developer - 2026-06-11
- Added optional time-sensitive directive decoration for eligible Medium/Hard prescripts.
- Implemented randomized duration assignment (30m / 60m) and persisted deadline metadata on active directives.
- Added timeout auto-diverge pipeline with idempotent guard and direct `-5` trust penalty.
- Exposed timeout signal for UI/audio timeout feedback integration.

## Follow-up Tasks
