---
id: TASK-002
title: "Update PWA manifest paths for GitHub Pages"
agent: developer
status: done
requirement: REQ-001
plan: PLAN-001
plan-slice: "Task 2: Update PWA manifest paths"
depends-on: []
priority: high
created: 2026-06-14
---

## Objective

Update `public/manifest.json` so that `start_url`, `scope`, and all icon `src` paths use the `/prescript-app/` prefix required for GitHub Pages sub-path hosting.

## Context

- Requirement: .guild/requirements/REQ-001.md
- Plan: docs/superpowers/plans/2026-06-14-github-pages-deploy.md (Task 2)
- Vite does NOT rewrite files in `public/`, so absolute paths must be updated manually
- Incorrect `start_url`/`scope` breaks PWA install prompts and service worker scoping

## Acceptance Criteria

- [x] `start_url` is `"/prescript-app/"`
- [x] `scope` is `"/prescript-app/"`
- [x] All three icon `src` values are prefixed with `/prescript-app/`
- [x] `npm run build` succeeds and `dist/manifest.json` contains the correct values

## Work Log

### 2026-06-14 — developer
- Updated `public/manifest.json`: set `start_url` and `scope` to `/prescript-app/`, prefixed all three icon `src` paths with `/prescript-app/`
- Confirmed `dist/manifest.json` contains the correct values after `npm run build`
- Build failure on first attempt was a transient Windows file-lock on `public/audio/.gitkeep`; second run succeeded cleanly

## Follow-up Tasks
