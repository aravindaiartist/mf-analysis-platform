# Known Issues & Improvement Roadmap — MF Analysis Platform

---

## Known Issues

### KI-1 — XLS Export Removed in Watchlist Redesign
**Status:** Regression (was working in checkpoint `ea1df92b`, removed in `277e20f`)  
**Impact:** Medium — users cannot export fund analysis to Excel  
**Root cause:** The watchlist redesign commit (`277e20f`) deleted `client/src/lib/exportXLS.ts` and the `xlsx-js-style` dependency as part of a large refactor. The export button was not re-added.  
**Fix:** Restore `exportXLS.ts` from git history (`git show ea1df92b:client/src/lib/exportXLS.ts`), re-add `xlsx-js-style` to `package.json`, and re-wire the Export XLS button in the fund header.

---

### KI-2 — Benchmark Proxy Understates True TRI
**Status:** By design, but worth documenting  
**Impact:** Low — alpha calculations will show slightly higher alpha than reality  
**Root cause:** Index fund NAVs include a TER of ~0.1–0.2% p.a. This means the proxy benchmark slightly understates the true index return, making fund alpha appear marginally better than it is.  
**Mitigation:** The UI labels all proxy benchmarks clearly as "(proxy)". Users can upload a true TRI CSV from NSE Indices for precise alpha.

---

### KI-3 — mfapi.in Reliability
**Status:** External dependency  
**Impact:** Medium — app becomes non-functional if mfapi.in is down  
**Root cause:** The entire data pipeline depends on a single free community API with no SLA.  
**Mitigation:** The app shows a clear error message with retry suggestion. No data is cached beyond the current session.

---

### KI-4 — XIRR Convergence Failure for Very Short Funds
**Status:** Known edge case, handled gracefully  
**Impact:** Low — SIP stats show "N/A" for funds < 3 years old  
**Root cause:** Newton-Raphson XIRR requires at least 80% of the expected monthly installments. Funds < 3 years old cannot produce 3Y SIP cohorts.  
**Behavior:** Score for SIP parameter defaults to 5.0 (neutral) with an explanatory note.

---

### KI-5 — Watchlist indexDD Not Populated on First Add
**Status:** By design, but UX friction  
**Impact:** Low — Market Context badge shows "Index loading" until first Refresh  
**Root cause:** The `indexDD` field is only populated when `refreshNavs()` is called. When a fund is first added to the watchlist, `indexDD` is `undefined`.  
**Fix options:** (a) Fetch benchmark DD during `handleWatchlistToggle` when adding the fund, or (b) show a spinner instead of the "Index loading" text.

---

### KI-6 — Large Bundle Size Warning
**Status:** Non-critical warning  
**Impact:** Low — initial load ~183 KB gzipped (acceptable for a data-heavy tool)  
**Root cause:** Recharts is a large dependency (~115 KB gzipped). The main bundle is not code-split.  
**Fix:** Use dynamic `import()` for the Recharts-heavy chart sections, or replace with a lighter charting library for the simpler charts.

---

### KI-7 — Fund Comparison Tab is a Placeholder
**Status:** Not implemented  
**Impact:** Medium — Compare tab exists in navigation but shows placeholder content  
**Root cause:** The Compare tab was scaffolded but not built out.

---

## Improvement Roadmap

### P1 — High Priority

**R1 — Restore XLS Export**  
Re-add the 7-sheet XLSX workbook export (Summary, Trailing Returns, Rolling Returns, Annual Returns, Drawdown Episodes, SIP Analysis, Scoring Grid). Use `xlsx-js-style` for browser-compatible styled output. See `exportXLS.ts` in git history.

**R2 — Watchlist XLS Export**  
Add an "Export Watchlist" button that dumps all card metrics (fund name, score, CAGR, DD, index DD, market context verdict, buy-zone %, last NAV, last updated) into a single styled sheet.

**R3 — indexDD on Fund Add**  
Fetch benchmark DD immediately when a fund is added to the watchlist so the Market Context badge is populated without requiring a manual Refresh.

### P2 — Medium Priority

**R4 — Fund Comparison Tab**  
Build out the Compare tab: side-by-side analysis of 2 funds with aligned charts, score comparison table, and relative alpha.

**R5 — Sort by Market Context Verdict**  
Add a "Context" sort key to the watchlist sort toolbar to surface all red "Fund-Specific" cards at the top.

**R6 — Market Context Badge in Analyze Header**  
Show the compact badge next to the fund name in the analysis view header, so the verdict is visible without scrolling to the Market Context panel.

**R7 — Offline / PWA Support**  
Add a service worker to cache the fund index and last-analyzed fund data for offline use.

### P3 — Nice to Have

**R8 — Multi-Fund Watchlist XLS**  
Export all watchlist funds in a single workbook, one sheet per fund, with a summary dashboard sheet.

**R9 — Score History Tracking**  
Store a timestamped score history per fund in localStorage so users can see if a fund's quality is improving or deteriorating over time.

**R10 — Peer Comparison**  
Add a "Peer Funds" section showing the top 5 funds in the same category ranked by composite score.

**R11 — NAV Alert Notifications**  
Use the Web Notifications API to push a browser notification when a watchlist fund enters its buy zone (requires user permission grant).

**R12 — True TRI Auto-Download**  
Automate NSE Indices TRI CSV download via a backend proxy (requires upgrading to `web-db-user` feature). Currently requires manual download.
