---
id: TASK-003
title: "Gather requirements for Daily Evaluation"
agent: product-owner
status: done
requirement: REQ-003
plan: null
depends-on: []
priority: high
created: 2026-06-11
---

## Objective

Interview the user and gather comprehensive requirements for: Daily Evaluation

Implement Distortion Check evaluation flow (midnight and manual conclude-day trigger), thematic outcome states, selective daily reset behavior, and distortion-based background/opacity logic.

## Context

- Requirement: .guild/requirements/REQ-003.md

## Acceptance Criteria

- [x] Requirement document fully written with user stories
- [x] Acceptance criteria defined for each story
- [x] Edge cases identified
- [x] Technical considerations documented
- [x] Out of scope clearly defined

## Work Log

### product-owner - 2026-06-11
- Expanded REQ-003 into a concrete Distortion Check requirement with trigger paths, threshold outcomes, and reset boundaries.
- Captured strict preservation constraints (total trust and custom prescripts remain untouched).
- Added distortion overlay rules with opacity scaling tied to failed prescript count.
- Documented technical and edge-case expectations for day-boundary handling and idempotent conclude-day behavior.
- Marked requirement status as `in-progress`.

## Follow-up Tasks

- Plan Daily Evaluation implementation | agent: architect | priority: high
