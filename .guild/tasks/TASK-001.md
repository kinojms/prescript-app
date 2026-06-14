---
id: TASK-001
title: "Add Vite base path for GitHub Pages"
agent: developer
status: done
requirement: REQ-001
plan: PLAN-001
plan-slice: "Task 1: Add Vite base path"
depends-on: []
priority: high
created: 2026-06-14
---

## Objective

Add `base: '/prescript-app/'` to `vite.config.js` so all built asset URLs are prefixed correctly for GitHub Pages sub-path hosting.

## Context

- Requirement: .guild/requirements/REQ-001.md
- Plan: docs/superpowers/plans/2026-06-14-github-pages-deploy.md (Task 1)
- Without this, the app loads a blank page on GitHub Pages because assets are requested from `/` instead of `/prescript-app/`

## Acceptance Criteria

- [x] `base: '/prescript-app/'` added as first property in `defineConfig({})` in `vite.config.js`
- [x] `npm run build` succeeds
- [x] `dist/index.html` references `/prescript-app/assets/` paths

## Work Log

### 2026-06-14 — developer
- Added `base: '/prescript-app/'` as the first property inside `defineConfig({})` in `D:\Projects\prescript-app\vite.config.js`
- Ran `npm run build` — succeeded in 538ms
- Verified `dist/index.html` references `/prescript-app/assets/` for JS and CSS, and `/prescript-app/manifest.json`, `/prescript-app/icons/` for other assets

## Follow-up Tasks
