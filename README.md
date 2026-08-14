# Core Engine — a cinematic prank storefront

> A **prank** website disguised as a premium software-distribution product.
> **100% simulation. Frontend-only. Completely harmless.**

It looks like a real, modern dark product UI — a private "build marketplace"
with a featured product, a real-feeling checkout, a crypto payment page, and a
provisioning + success flow — then reveals the punchline:

> **It was a simulation. You just got pranked — nothing here was real.**

A persistent **`SIMULATION // PRANK ENVIRONMENT`** label is always on screen.

---

## 🛑 Safety — what this project does NOT do

This is a visual prank only. It contains **no** real functionality of any kind:

- ❌ no real payments, no payment APIs, no crypto exchange integration, no wallet connection
- ❌ no blockchain transactions, no real QR payloads (the QR is decorative and encodes nothing)
- ❌ no seed-phrase / password / credential collection, no login capture, no phishing
- ❌ no personal-data collection, IP harvesting, device fingerprinting, or tracking
- ❌ no backend, no database, no network requests to any third party
- ❌ no impersonation of any real brand (the store, products, and coins are fictional)

Every "payment", "verification", and "provisioning" moment is pure front-end
theatre driven by timers and animation. Nothing is ever sent, stored, or
charged. The payment address is an intentionally fake, clearly-marked demo
string (`Demo address — not a real wallet`), and the QR is labelled
`DEMO QR — NON-PAYABLE`.

---

## 🧭 Flow

`splash → storefront (featured build + 15-product catalog) → product detail →
checkout (order summary + choose crypto currency) → crypto payment page
(amount, network, demo QR, demo address, countdown) → "I've paid → verify" →
verification → provisioning → "Access activated" → It was a simulation.`

## 🧰 Stack

- **React 18 + Vite 5 + TypeScript** (strict)
- **Framer Motion** for stage transitions & micro-interactions
- **CSS design system** — modern dark product UI (ambient gradient background,
  system sans-serif, mono for figures), no images required
- **Web Audio API** for subtle UI sound (no audio files, nothing autoplays)

## 🚀 Run locally

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build → dist/
npm run preview    # preview the production build
```

## 🎛️ Configuration

All the main knobs live in [`src/config.ts`](src/config.ts) — brand name,
price, access label, the final reveal copy, splash duration, payment countdown,
sound default, and the persistent simulation label. The product catalog lives
in [`src/data/engines.ts`](src/data/engines.ts) and the payment currencies in
[`src/data/coins.ts`](src/data/coins.ts).

## 🌐 Deployment

### GitHub Pages (automated)

Pushing to the deployment branch runs
[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml), which builds and
publishes to GitHub Pages. Live URL:

**https://hridoysamadder01-coder.github.io/DARKDDDDTDTUK/**

> The repo must be **public** and Pages **Source** set to **GitHub Actions**
> (Settings → Pages). After that, every push deploys automatically.

### Vercel / Netlify / Render (static)

Served from `dist/`. Because those hosts serve from the site root, build with a
root base path:

```bash
VITE_BASE=/ npm run build
```

- **Build command:** `VITE_BASE=/ npm run build`
- **Output directory:** `dist`

---

_Made as a harmless cinematic prank. Show a friend, enjoy the reveal, and
remember: it was all a simulation._
