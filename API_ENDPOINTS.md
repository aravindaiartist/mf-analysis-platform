# API Endpoints Used — MF Analysis Platform

All data is fetched from **[mfapi.in](https://mfapi.in)**, a free public API that mirrors AMFI NAV data. No API key is required. All endpoints return JSON with permissive CORS headers.

---

## Endpoint 1 — Full Fund List (Search Index)

**Purpose:** Pre-load the complete list of ~2000 AMFI-registered funds for client-side fuzzy search.

```
GET https://api.mfapi.in/mf
```

**Response shape:**
```json
[
  {
    "schemeCode": 120503,
    "schemeName": "Axis Bluechip Fund - Growth",
    "fundHouse": "Axis Mutual Fund",
    "schemeType": "Open Ended Schemes",
    "schemeCategory": "Equity Scheme - Large Cap Fund",
    "schemeNavName": "Axis Bluechip Fund - Regular Plan - Growth",
    "schemeMinAmount": "500",
    "schemeSubCategory": "Large Cap Fund",
    "isin": "INF846K01DP8",
    "isinDiv": ""
  },
  ...
]
```

**Notes:**
- Response is ~300 KB. Cached in `sessionStorage` for the browser session.
- On failure, the app falls back to Endpoint 2 (search?q=).
- Called once on app load via `prewarmFundIndex()`.

---

## Endpoint 2 — Fund Search (Fallback)

**Purpose:** Fallback search when the full fund list fails to load.

```
GET https://api.mfapi.in/mf/search?q={query}
```

**Example:**
```
GET https://api.mfapi.in/mf/search?q=SBI+Small+Cap
```

**Response shape:**
```json
[
  {
    "schemeCode": 125494,
    "schemeName": "SBI Small Cap Fund - Regular Plan - Growth",
    "fundHouse": "SBI Funds Management Limited",
    "schemeType": "Open Ended Schemes",
    "schemeCategory": "Equity Scheme - Small Cap Fund"
  }
]
```

---

## Endpoint 3 — Full NAV History (Primary Data Source)

**Purpose:** Fetch all historical daily NAV records for a specific fund. This is the primary data source for all metric computation.

```
GET https://api.mfapi.in/mf/{schemeCode}
```

**Example:**
```
GET https://api.mfapi.in/mf/125494
```

**Response shape:**
```json
{
  "meta": {
    "scheme_code": 125494,
    "scheme_name": "SBI Small Cap Fund - Regular Plan - Growth",
    "fund_house": "SBI Funds Management Limited",
    "scheme_type": "Open Ended Schemes",
    "scheme_category": "Equity Scheme - Small Cap Fund",
    "scheme_sub_category": "Small Cap Fund"
  },
  "data": [
    { "date": "15-03-2026", "nav": "183.4521" },
    { "date": "14-03-2026", "nav": "181.2340" },
    ...
  ],
  "status": "SUCCESS"
}
```

**Important:** The `meta` object uses **snake_case** keys (`scheme_code`, `scheme_name`, etc.). The app's `fetchFundData()` function in `mfapi.ts` explicitly remaps these to **camelCase** before returning. This remapping is critical — missing it causes "Unknown Fund" and undefined category bugs.

**Key remapping (from `mfapi.ts`):**
```typescript
const meta: MFMeta = {
  schemeCode:     raw.meta.scheme_code,
  schemeName:     raw.meta.scheme_name,
  fundHouse:      raw.meta.fund_house,
  schemeType:     raw.meta.scheme_type,
  schemeCategory: raw.meta.scheme_category,
  // ...
};
```

**Data format:** Dates are in `DD-MM-YYYY` format (not ISO). The parser reverses the array (API returns newest-first) and converts dates to `Date` objects.

---

## Endpoint 4 — Benchmark Proxy (Auto-Fetch)

**Purpose:** Auto-fetch category-appropriate benchmark index data using AMFI index fund NAVs as a proxy for TRI data.

Same endpoint as Endpoint 3, but called with index fund scheme codes:

```
GET https://api.mfapi.in/mf/{indexFundSchemeCode}
```

**Proxy scheme code map (`benchmarkProxy.ts`):**

| Benchmark Name | Proxy Fund | Scheme Code |
|---|---|---|
| Nifty 500 TRI (proxy) | Motilal Oswal Nifty 500 Index Fund | 147625 |
| Nifty 50 TRI (proxy) | UTI Nifty 50 Index Fund | 120716 |
| Nifty 100 TRI (proxy) | UTI Nifty 100 Index Fund | 147666 |
| Nifty Midcap 150 TRI (proxy) | Motilal Oswal Nifty Midcap 150 Index Fund | 147622 |
| Nifty Smallcap 250 TRI (proxy) | Motilal Oswal Nifty Smallcap 250 Index Fund | 147623 |
| Nifty LargeMidcap 250 TRI (proxy) | Motilal Oswal Nifty LargeMidcap 250 Index Fund | 149081 |
| Nifty Next 50 TRI (proxy) | UTI Nifty Next 50 Index Fund | 120684 |
| Nifty 500 Value 50 TRI (proxy) | Motilal Oswal Nifty 500 Value 50 Index Fund | 151739 |

**Limitation:** Index fund NAVs are a close but imperfect proxy for TRI. They include fund expenses (TER ~0.1–0.2%) so the proxy slightly understates the true index return. Labeled clearly in the UI.

---

## Category → Benchmark Auto-Mapping (`categoryAverages.ts`)

When a fund is analyzed, the app calls `getBenchmarkSuggestion(schemeCategory)` to auto-select the appropriate benchmark:

| Category keyword | Benchmark selected |
|---|---|
| `small` | Nifty Smallcap 250 TRI |
| `mid` | Nifty Midcap 150 TRI |
| `large and mid` | Nifty LargeMidcap 250 TRI |
| `flexi` / `multi` / `large` | Nifty 100 TRI |
| `sectoral` / `thematic` | Nifty 500 TRI |
| *(default)* | Nifty 500 TRI |

---

## Rate Limiting & Reliability

mfapi.in is a community-maintained service. It has no documented rate limits but the app applies a **300ms delay** between sequential calls in the "Refresh All" watchlist feature to avoid hammering the API. Individual fund fetches use a 15-second timeout for the fund list and 8-second timeout for NAV data.

The API occasionally returns stale data or times out during market hours. The app shows a user-facing error with a "retry" suggestion in these cases.
