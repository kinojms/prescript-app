---
id: TASK-003
title: "Create GitHub Actions deployment workflow"
agent: developer
status: done
requirement: REQ-001
plan: PLAN-001
plan-slice: "Task 3: Create GitHub Actions deployment workflow"
depends-on: []
priority: high
created: 2026-06-14
---

## Objective

Create `.github/workflows/deploy.yml` using GitHub's official Pages deployment actions (`actions/upload-pages-artifact@v3` and `actions/deploy-pages@v4`) to automatically build and deploy on every push to `master`.

## Context

- Requirement: .guild/requirements/REQ-001.md
- Plan: docs/superpowers/plans/2026-06-14-github-pages-deploy.md (Task 3)
- Uses two-job pattern: `build` (checkout → install → build → upload artifact) and `deploy` (publish artifact via Pages API)
- After pushing, the user must manually set Settings → Pages → Source → "GitHub Actions" in the GitHub repo UI (one-time step)

## Acceptance Criteria

- [x] `.github/workflows/deploy.yml` created with correct content
- [x] YAML is valid (no syntax errors)
- [ ] Workflow pushed to `master` and visible in GitHub Actions tab

## Work Log

### 2026-06-14 — developer
- Created `.github/workflows/` directory (did not previously exist)
- Created `.github/workflows/deploy.yml` with the two-job pattern: `build` (checkout → install → build → upload artifact) and `deploy` (publish via Pages API)
- Used `actions/upload-pages-artifact@v3` and `actions/deploy-pages@v4` as specified
- Workflow triggers on push to `master`
- Note: User must still set Settings → Pages → Source → "GitHub Actions" in GitHub repo UI (one-time manual step)

## Follow-up Tasks
