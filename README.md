# CORE ENGINE ACCESS TERMINAL

> A cinematic **underground software-access terminal** — a believable, dense
> neon-green control-software experience. Frontend-only. No real transactions.

Boot into a restricted terminal, browse a private **build marketplace** of 15
fictional engine builds, inspect a build, then run the **OBSIDIAN CORE X**
access chain: a GSAP-driven cinematic unlock → dramatic price reveal → digital
asset selection → access session → verification (with a hard signature-conflict
interrupt + override) → **ACCESS GRANTED**.

The whole experience is a visual simulation — it feels like a screen from a
cyber-thriller, but nothing behind it is real.

---

## 🛑 Safety

Every "payment", "network", and "verification" moment is pure front-end theatre
driven by timers and animation. Specifically, this project contains **no**:

- real payments, payment APIs, wallet connections, or exchange integrations
- blockchain transactions
- valid cryptocurrency addresses (references like `SESSION-X93-A11` are synthetic)
- scannable payment QR codes (the QR graphic is decorative and encodes nothing)
- credential / seed-phrase / password collection
- personal-data collection, IP/location capture, or device fingerprinting
- backend, database, or third-party network requests

A single neutral notice — **`NO REAL TRANSACTIONS`** — appears only inside the
financial (access session) screen. The product/brand/asset names are fictional,
and Gemini is referenced only as *"compatible with Gemini vision workflows"* — no
claim of an official Google product or partnership.

---

## 🧭 Flow

`boot → terminal (system HUD + 15-build marketplace) → build inspection →
OBSIDIAN access chain (GSAP master timeline) → price reveal ($980…→ $430) →
select digital asset (BTC · SOL · ETH · USDT · LTC · XRP) → access session
(synthetic refs, decorative QR, countdown) → VERIFY ACCESS → SIGNATURE CONFLICT
→ OVERRIDE ACCEPTED → ACCESS AUTHENTICATED → ACCESS GRANTED → runtime online`

## 🧰 Stack

- **React 18 + Vite 5 + TypeScript** (strict)
- **GSAP** — the OBSIDIAN access-chain master timeline
- **Framer Motion** — screen transitions
- **HTML5 Canvas** — matrix code field + network-node layer + CRT/scanline layer
- **Web Audio API** — subtle terminal sound (muted by default; nothing autoplays)

## 🚀 Run locally

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build → dist/
npm run preview    # preview the production build
```

## 🎛️ Configuration

Central knobs live in [`src/config.ts`](src/config.ts) — target build, price,
price ladder, access label, boot duration, countdown, sound default, animation
intensity, bilingual labels, and the financial notice. The catalog is in
[`src/data/engines.ts`](src/data/engines.ts) and the assets in
[`src/data/coins.ts`](src/data/coins.ts).

## 🌐 Deployment

Pushing to the deployment branch runs
[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml), which builds and
publishes to GitHub Pages (Settings → Pages → Source: GitHub Actions). Live URL:

**https://hridoysamadder01-coder.github.io/DARKDDDDTDTUK/**

For Vercel / Netlify / Render (served from root), build with a root base path:

```bash
VITE_BASE=/ npm run build   # output: dist/
```
