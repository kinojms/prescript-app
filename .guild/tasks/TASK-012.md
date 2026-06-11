---
id: TASK-012
title: "Add timer/timeout regression tests"
agent: developer
status: done
requirement: REQ-002
plan: PLAN-002
plan-slice: .guild/plans/PLAN-002/03-tests.md
depends-on: [TASK-005]
priority: high
created: 2026-06-11
---

## Objective

Add timer/timeout regression tests

## Context

- Requirement: .guild/requirements/REQ-002.md
- Plan: .guild/plans/PLAN-002.md
- Parent task: TASK-005

## Acceptance Criteria

- [x] Task completed successfully

## Work Log

### developer - 2026-06-11
- Added timeout regression coverage verifying timed directives auto-diverge and apply `-5` trust penalty on expiry.
- Verified full suite and production build after timer/countdown integration.

## Follow-up Tasks
