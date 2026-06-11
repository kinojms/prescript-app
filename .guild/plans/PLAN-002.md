---
id: PLAN-002
requirement: REQ-002
title: "Deadline Mechanic Implementation Plan"
status: draft
created: 2026-06-11
---

# PLAN-002: Deadline Mechanic

## Goal

Add optional time-sensitive directives for Medium/Hard prescripts with randomized deadline windows, timeout-triggered divergence and penalty, and a themed countdown UI.

## Workstreams

1. Timer-enabled directive model and state lifecycle.
2. Timeout handling pipeline (auto-diverge + -5 trust penalty + one-shot breakdown effect).
3. Countdown bar UI using `#86bada`.
4. Timer correctness and boundary tests.

## Delivery Notes

- Use epoch-based remaining-time computation.
- Ensure timeout side effects are idempotent.
- Keep Easy directives non-timed.
