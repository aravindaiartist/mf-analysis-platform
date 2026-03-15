# MF Analysis Platform — Developer Handoff README

**Version:** 1.0.0 (checkpoint `579d0632`)  
**Live URL:** https://mfworkbook-analyser.manus.space  
**Stack:** React 19 · TypeScript · Vite 7 · TailwindCSS 4 · Recharts · Lucide Icons  
**Data Source:** AMFI via [mfapi.in](https://mfapi.in) (free, no API key required)

---

## 1. What This App Does

A fully client-side mutual fund deep-analysis platform for Indian equity funds. It fetches live NAV data from AMFI, computes a comprehensive set of metrics, scores the fund on 8 parameters, and provides a structured investment decision framework. No backend, no database, no API keys.

**Key capabilities:**
- Search any AMFI-registered fund by name or scheme code
- Compute 9 metric groups from raw daily NAV data (CAGR, drawdown, rolling returns, Sharpe, Sortino, Calmar, SIP XIRR)
- 8-parameter composite quality score (0–100) with category-specific thresholds
- Two-gate lump sum readiness check (quality gate + price gate)
- Automatic category-appropriate benchmark comparison (Market Context panel)
- Watchlist with buy-zone alerts, per-fund NAV strips, and Market Context badges
- Fund comparison mode (2 funds side-by-side)
- Benchmark overlay (TRI proxy via AMFI index funds, or manual NSE CSV upload)

---

## 2. Prerequisites

| Tool | Version | Notes |
|---|---|---|
| Node.js | ≥ 18.x | 22.13.0 tested |
| pnpm | ≥ 8.x | `npm i -g pnpm` |
| Git | any | for cloning |

---

## 3. Local Development

```bash
# Clone / unzip the source
cd mf-workbook-sop

# Install dependencies (takes ~30s on first run)
pnpm install

# Start dev server (hot-reload on port 3000)
pnpm run dev
```

Open `http://localhost:3000` in your browser.

The app is entirely static — no `.env` file, no secrets, no backend process needed.

---

## 4. Build for Production

```bash
pnpm run build
```

Output lands in `dist/public/`. The build is a standard Vite SPA with a single `index.html` entry point. All assets are content-hashed.

**Build output (approximate):**

| Chunk | Size (gzip) |
|---|---|
| `index.js` (main bundle) | ~183 KB |
| `vendor-recharts.js` | ~115 KB |
| `vendor-radix.js` | ~18 KB |
| `page-glossary.js` (lazy) | ~18 KB |
| CSS | ~23 KB |

---

## 5. Deployment

### Option A — Manus Hosting (current)
The project is already deployed at `mfworkbook-analyser.manus.space`. Click **Publish** in the Manus Management UI after creating a checkpoint.

### Option B — Any Static Host (Vercel, Netlify, Cloudflare Pages)
1. Run `pnpm run build`
2. Deploy the `dist/public/` folder
3. Set the rewrite rule: all routes → `index.html` (SPA routing)

**Vercel `vercel.json`:**
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

**Netlify `_redirects` (place in `dist/public/`):**
```
/*  /index.html  200
```

### Option C — Nginx
```nginx
location / {
  root /var/www/mf-app/dist/public;
  try_files $uri $uri/ /index.html;
}
```

---

## 6. Project Structure

```
mf-workbook-sop/
├── client/
│   ├── index.html              # Vite entry point
│   └── src/
│       ├── App.tsx             # Router (wouter) + ThemeProvider
│       ├── main.tsx            # React entry
│       ├── index.css           # Tailwind 4 tokens + glassmorphic design system
│       ├── pages/
│       │   ├── Home.tsx        # Main app (3000+ lines) — all tabs + analysis
│       │   ├── Glossary.tsx    # Term definitions for all 8 scoring parameters
│       │   └── NotFound.tsx    # 404 page
│       ├── components/
│       │   ├── DecisionFramework.tsx   # Verdict + lump sum readiness + tranche calc
│       │   ├── MarketContext.tsx        # Fund DD vs Index DD comparison panel
│       │   ├── SectionErrorBoundary.tsx # Per-section React error boundary
│       │   └── ui/                     # shadcn/ui component library (40+ components)
│       ├── hooks/
│       │   └── useWatchlist.ts         # localStorage watchlist state management
│       └── lib/
│           ├── metrics.ts              # Core computation engine (all formulas)
│           ├── mfapi.ts                # AMFI data fetcher + fund search
│           ├── benchmark.ts            # Benchmark metrics (alpha, TE, IR, rolling beat)
│           ├── benchmarkProxy.ts       # Auto-fetch benchmarks via AMFI index funds
│           ├── bundledTRI.ts           # Bundled TRI data loader (if applicable)
│           ├── categoryAverages.ts     # Category thresholds + buy-zone triggers
│           └── utils.ts               # cn() Tailwind class merger
├── package.json
├── vite.config.ts
└── tsconfig.json
```

---

## 7. Key Design Decisions

**No backend required.** All data is fetched client-side from `api.mfapi.in`. This means zero hosting cost and zero maintenance for a server process, but it also means CORS is handled by mfapi.in's permissive headers.

**Watchlist in localStorage.** No user accounts, no sync across devices. Entries are persisted as JSON with a migration layer (`migrateEntry()`) that handles schema changes gracefully.

**Category-specific thresholds.** Small Cap, Mid Cap, Sectoral, and Large/Flexi Cap funds are scored against different benchmarks. The `getCategoryBuyZone()` and scoring engine in `metrics.ts` both use `schemeCategory` string matching.

**Benchmark as index fund proxy.** True TRI data requires NSE CSV download. The app auto-fetches index fund NAVs from AMFI as a proxy (labeled clearly in the UI as "proxy"). The proxy scheme codes are hardcoded in `benchmarkProxy.ts`.
