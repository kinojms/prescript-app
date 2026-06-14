# GitHub Pages Deployment Design

**Date:** 2026-06-14
**Repo:** https://github.com/kinojms/prescript-app
**Target URL:** https://kinojms.github.io/prescript-app/

## Overview

Deploy the prescript-app (React + Vite PWA) to GitHub Pages using the official GitHub Actions deployment workflow. Deployments trigger automatically on every push to `master`.

## Changes Required

### 1. Vite Base Path

Add `base: '/prescript-app/'` to `vite.config.js`.

This causes Vite to prefix all generated asset URLs (`/assets/...`, `/icons/...`, `/audio/...`) with `/prescript-app/`, which is required for the app to load correctly when served from a sub-path on GitHub Pages. Without it, the browser requests assets from the root (`/`) and the page renders blank.

### 2. PWA Manifest Paths

Update `public/manifest.json` to use the sub-path prefix. Vite does not rewrite files in `public/`, so absolute paths must be updated manually:

| Field | Current | Updated |
|-------|---------|---------|
| `start_url` | `"/"` | `"/prescript-app/"` |
| `scope` | `"/"` | `"/prescript-app/"` |
| `icons[0].src` | `"/icons/index-sigil-192.png"` | `"/prescript-app/icons/index-sigil-192.png"` |
| `icons[1].src` | `"/icons/index-sigil-512.png"` | `"/prescript-app/icons/index-sigil-512.png"` |
| `icons[2].src` | `"/icons/index-sigil-maskable-512.png"` | `"/prescript-app/icons/index-sigil-maskable-512.png"` |

Incorrect `start_url`/`scope` causes PWA install prompts and service worker scoping to fail.

### 3. GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [master]

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/deploy-pages@v4
        id: deployment
```

**Two jobs:**
- `build`: installs dependencies, runs `vite build`, and uploads the `dist/` folder as a Pages artifact
- `deploy`: waits for `build` to succeed, then publishes the artifact via the official Pages API

### 4. One-time GitHub Settings Step

In the GitHub repo: **Settings → Pages → Source → GitHub Actions**

This must be done once before the first deployment will succeed. No branch or folder selection is needed — the workflow handles everything.

## Not In Scope

- Custom domain configuration
- Preview deployments for PRs
- Environment-specific builds
