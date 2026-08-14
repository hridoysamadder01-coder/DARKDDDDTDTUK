# CORE ENGINE ACCESS TERMINAL

> A cinematic **prank** website with an underground hacker-market aesthetic.
> **100% simulation. Frontend-only. Completely harmless.**

Boot into a "restricted underground engine marketplace", browse fictional
software builds, trigger a dramatic multi-layer "access chain", watch a
theatrical price + payment simulation, and get hit with the punchline:

> **PRANK SUCCESS 😈 — YOU JUST ENTERED A SIMULATION.**

A persistent **`SIMULATION // PRANK ENVIRONMENT`** label is always on screen.

---

## 🛑 Safety — what this project does NOT do

This is a visual prank only. It contains **no** real functionality of any kind:

- ❌ no real payments, no Binance API, no Binance Pay, no crypto/wallet connection
- ❌ no blockchain transactions, no real QR payloads (the QR is decorative and encodes nothing)
- ❌ no seed-phrase / password / credential collection, no login capture, no phishing
- ❌ no personal-data collection, IP harvesting, device fingerprinting, or tracking
- ❌ no backend, no database, no network requests to any third party

Every "payment", "verification", "network", and "authorization" moment is pure
front-end theatre driven by timers and animation. Nothing is ever sent, stored,
or charged. Wallet-style labels (e.g. `DEMO-WALLET-7X93-A11F`) are intentionally
fake formats, marked `DEMO QR // NON-PAYABLE`.

---

## 🧰 Stack

- **React 18 + Vite 5 + TypeScript** (strict)
- **Framer Motion** for stage transitions & cinematic timelines
- **HTML5 Canvas** for the matrix code-rain and network-map layers
- **Web Audio API** for synthesised sound (no audio files, nothing autoplays)

## 🚀 Run locally

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build → dist/
npm run preview    # preview the production build
```

## 🎛️ Configuration

All the knobs live in [`src/config.ts`](src/config.ts):

| Setting | Default |
| --- | --- |
| `targetProductName` | `OBSIDIAN CORE X // UNIVERSAL NATIVE BUILD` |
| `price` / `currency` | `430` / `USD` |
| `finalPrankMessage` | `PRANK SUCCESS 😈` |
| `soundEnabledByDefault` | `false` |
| `animationIntensity` | `high` \| `medium` \| `low` |
| `bootDurationMs` | `6000` |
| `countdownSeconds` | `899` (14:59) |
| `supportedPlatforms` | Android / iPhone / Tablet / Universal |
| `bilingualLabels` | `true` (small Chinese atmosphere labels) |

The engine/build directory lives in [`src/data/engines.ts`](src/data/engines.ts).

## 🌐 Deployment

### GitHub Pages (automated)

Pushing to the deployment branch runs
[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml), which builds and
publishes to GitHub Pages automatically (it also self-enables Pages on first
run). Live URL:

**https://hridoysamadder01-coder.github.io/DARKDDDDTDTUK/**

> If the first Actions run cannot auto-enable Pages, open
> **Settings → Pages → Build and deployment → Source: GitHub Actions**, then
> re-run the workflow.

### Vercel / Netlify / Render (static)

Build served from `dist/`. Because those hosts serve from the site root, build
with a root base path:

```bash
VITE_BASE=/ npm run build
```

- **Build command:** `VITE_BASE=/ npm run build`
- **Output directory:** `dist`

---

_Made as a harmless cinematic prank. Show a friend, enjoy the reveal, and
remember: it was all a simulation._
