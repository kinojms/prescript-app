---
id: TASK-007
title: "Implement prescript dataset expansion and payout constants"
agent: developer
status: done
requirement: REQ-001
plan: PLAN-001
plan-slice: .guild/plans/PLAN-001/01-data-and-payouts.md
depends-on: [TASK-004]
priority: high
created: 2026-06-11
---

## Objective

Implement prescript dataset expansion and payout constants

## Context

- Requirement: .guild/requirements/REQ-001.md
- Plan: .guild/plans/PLAN-001.md
- Parent task: TASK-004

## Acceptance Criteria

- [x] Task completed successfully

## Work Log

### developer - 2026-06-11
- Replaced default prescript pool with 15-entry Easy/Medium/Hard dataset.
- Included all required canonical directives verbatim under requested tiers.
- Updated trust payout constants to `Easy=1`, `Medium=5`, `Hard=10`.
- Updated rank tests and default dataset tests to validate the new economy and required content.

## Follow-up Tasks
