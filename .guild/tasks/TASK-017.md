---
id: TASK-017
title: "Write unit tests for Deadline Mechanic"
agent: test-writer
status: done
requirement: REQ-002
plan: PLAN-002
depends-on: [TASK-010, TASK-011, TASK-012]
priority: high
created: 2026-06-11
---

## Objective

Write unit tests for Deadline Mechanic

## Context

- Requirement: .guild/requirements/REQ-002.md
- Plan: .guild/plans/PLAN-002.md

## Acceptance Criteria

- [x] Task completed successfully

## Work Log

### test-writer - 2026-06-11
- Confirmed timeout regression test coverage validates:
  - timed directive expiry path
  - auto-diverge behavior
  - exact `-5` trust penalty
  - timeout signal emission for feedback layer
- Verified no regressions in existing state and component tests.

## Follow-up Tasks
