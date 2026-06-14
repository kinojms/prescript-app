# GitHub Pages Deployment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deploy prescript-app to https://kinojms.github.io/prescript-app/ via GitHub Actions on every push to `master`.

**Architecture:** Three config changes (Vite base path, PWA manifest paths, GitHub Actions workflow) enable automated deployment using GitHub's official Pages deployment API. No logic changes required.

**Tech Stack:** Vite, vite-plugin-pwa, GitHub Actions (`actions/upload-pages-artifact@v3`, `actions/deploy-pages@v4`)

---

## File Map

| File | Action | Purpose |
|------|--------|---------|
| `vite.config.js` | Modify | Add `base: '/prescript-app/'` so built assets use the correct sub-path |
| `public/manifest.json` | Modify | Update `start_url`, `scope`, and icon paths to `/prescript-app/` prefix |
| `.github/workflows/deploy.yml` | Create | GitHub Actions workflow: build → upload artifact → deploy to Pages |

---

### Task 1: Add Vite base path

**Files:**
- Modify: `vite.config.js`

- [ ] **Step 1: Add `base` to vite.config.js**

Open `vite.config.js`. Add `base: '/prescript-app/'` as the first property inside `defineConfig({...})`:

```js
export default defineConfig({
  base: '/prescript-app/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.js',
      registerType: 'autoUpdate',
      injectRegister: false,
      manifest: false,
      includeAssets: [
        'icons/index-sigil-192.png',
        'icons/index-sigil-512.png',
        'icons/index-sigil-maskable-512.png',
        'icons/apple-touch-icon.png',
        'audio/index_message_1.wav',
        'audio/index_message_2.wav',
      ],
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff,woff2,ttf,eot,wav}'],
      },
      devOptions: {
        enabled: true,
      },
    }),
  ],
  test: {
    environment: 'node',
  },
})
```

- [ ] **Step 2: Verify build output references the base path**

Run:
```
npm run build
```

Then check that `dist/index.html` references `/prescript-app/` in its script/link tags:
```
grep -o '/prescript-app/[^"]*' dist/index.html | head -5
```

Expected: output lines like `/prescript-app/assets/index-<hash>.js`

If the grep returns nothing, the base path was not applied — recheck `vite.config.js`.

- [ ] **Step 3: Commit**

```
git add vite.config.js
git commit -m "build: set vite base path for GitHub Pages sub-path"
```

---

### Task 2: Update PWA manifest paths

**Files:**
- Modify: `public/manifest.json`

- [ ] **Step 1: Update manifest.json**

Replace the entire contents of `public/manifest.json` with:

```json
{
  "name": "The Index",
  "short_name": "The Index",
  "description": "The Index initiation and prescript interface.",
  "start_url": "/prescript-app/",
  "scope": "/prescript-app/",
  "display": "standalone",
  "orientation": "portrait-primary",
  "background_color": "#000000",
  "theme_color": "#000000",
  "icons": [
    {
      "src": "/prescript-app/icons/index-sigil-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/prescript-app/icons/index-sigil-512.png",
      "sizes": "512x512",
      "type": "image/png"
    },
    {
      "src": "/prescript-app/icons/index-sigil-maskable-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ]
}
```

- [ ] **Step 2: Verify manifest is copied correctly into dist**

```
npm run build
```

Then confirm:
```
grep -o '"start_url":"[^"]*"' dist/manifest.json
```

Expected: `"start_url":"/prescript-app/"`

- [ ] **Step 3: Commit**

```
git add public/manifest.json
git commit -m "pwa: update manifest paths for GitHub Pages sub-path"
```

---

### Task 3: Create GitHub Actions deployment workflow

**Files:**
- Create: `.github/workflows/deploy.yml`

- [ ] **Step 1: Create the workflows directory and file**

```
mkdir -p .github/workflows
```

Create `.github/workflows/deploy.yml` with this exact content:

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

- [ ] **Step 2: Validate the YAML is well-formed**

```
node -e "const fs=require('fs'); fs.readFileSync('.github/workflows/deploy.yml','utf8'); console.log('OK')"
```

Expected: `OK`

- [ ] **Step 3: Commit and push**

```
git add .github/workflows/deploy.yml
git commit -m "ci: add GitHub Actions workflow for GitHub Pages deployment"
git push origin master
```

---

### Task 4: Enable GitHub Pages in repo settings (manual)

This is a one-time manual step in the GitHub UI. It cannot be automated via the workflow.

- [ ] **Step 1: Open repo Settings**

Go to: https://github.com/kinojms/prescript-app/settings/pages

- [ ] **Step 2: Set source to GitHub Actions**

Under **"Build and deployment" → "Source"**, select **"GitHub Actions"** from the dropdown.

Click **Save**.

- [ ] **Step 3: Confirm the workflow ran successfully**

Go to: https://github.com/kinojms/prescript-app/actions

Find the most recent "Deploy to GitHub Pages" run triggered by your push in Task 3. Both the `build` and `deploy` jobs should show green checkmarks.

- [ ] **Step 4: Verify the live site**

Open https://kinojms.github.io/prescript-app/ in a browser.

The app should load. Open DevTools → Network tab and confirm assets load from `/prescript-app/assets/...` with HTTP 200 responses.
