# The Index
<img width="1905" height="906" alt="image" src="https://github.com/user-attachments/assets/8233916d-bba9-49ad-b120-5922f55567f7" />

<img width="1908" height="907" alt="image" src="https://github.com/user-attachments/assets/045db080-b666-49ad-99cd-206c9f32fc1d" />

A focused React + Vite Progressive Web App for The Index, with native-like installability and offline-ready behavior.

## Features

- Installable PWA with `manifest.json`
- Standalone mobile experience (`display: standalone`)
- Black (`#000000`) theme/background for launch and shell consistency
- Offline caching for app shell, static assets, fonts, and dual WAV audio loops
- Index Sigil app icons (standard + maskable)

## Tech Stack

- React
- Vite
- vite-plugin-pwa
- Workbox (via `vite-plugin-pwa` inject manifest mode)

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Install dependencies

```bash
npm install
```

### Run in development

```bash
npm run dev
```

### Build for production

```bash
npm run build
```

### Preview production build

```bash
npm run preview
```

### Run tests

```bash
npm test
```

## PWA Notes

- Manifest file: `public/manifest.json`
- Service worker source: `src/sw.js`
- Service worker registration: `src/main.jsx`
- Icon assets: `public/icons/`
- Audio loops cached for offline use:
  - `public/audio/index_message_1.wav`
  - `public/audio/index_message_2.wav`

## Install on Mobile

1. Open the deployed app in a supported mobile browser.
2. Use **Add to Home Screen** / **Install App**.
3. Launch from home screen for standalone app mode.
