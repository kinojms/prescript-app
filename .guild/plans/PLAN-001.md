---
id: PLAN-001
requirement: REQ-001
title: "Prescript Difficulty and Scoring Overhaul Implementation Plan"
status: draft
created: 2026-06-11
---

# PLAN-001: Prescript Difficulty and Scoring Overhaul

## Goal

Implement the three-tier difficulty economy (`Easy`, `Medium`, `Hard`) with exact trust payouts (1/5/10), ship a 15+ entry default prescript dataset including required verbatim directives, and ensure rendering/scoring flows consistently use the new difficulty model for both default and custom sources.

## Workstreams

1. **Data + Constants**
   - Expand default prescript dataset to include at least 15 entries split across all three tiers.
   - Add/normalize trust payout map as a shared constant consumed by state logic.
2. **State + Logic**
   - Update execute scoring logic to use the payout map.
   - Ensure custom prescripts support `Medium` tier and hydration compatibility.
3. **UI + Validation**
   - Ensure difficulty labels and selectors expose `Easy/Medium/Hard`.
   - Verify source toggles and pool selection work with mixed default/custom data.
4. **Tests**
   - Cover payout mapping and execute behavior for all tiers.
   - Cover data/hydration compatibility for new difficulty model.

## Delivery Notes

- Keep scoring constants in one canonical location.
- Preserve existing history and trust semantics except payout adjustments.
- Avoid regressions in settings backup/import and prescript rendering.
