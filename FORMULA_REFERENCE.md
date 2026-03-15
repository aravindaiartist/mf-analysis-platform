# Formula Reference — MF Analysis Platform

All formulas are implemented in `client/src/lib/metrics.ts` unless otherwise noted. Every computation is derived purely from daily NAV data — no hardcoded values, no external data sources beyond AMFI.

**Risk-free rate assumption:** 6.5% per annum (India 10-year G-Sec proxy). Used in Sharpe and Sortino calculations.

---

## 1. CAGR (Compound Annual Growth Rate)

**Formula:**
```
CAGR = (endNAV / startNAV)^(1 / years) - 1
```

**Variants computed:**

| Metric | Start NAV | End NAV | Period |
|---|---|---|---|
| CAGR (Inception) | First NAV record | Latest NAV | Full fund age |
| CAGR 1Y | NAV 365.25 days ago | Latest NAV | 1 year |
| CAGR 2Y | NAV 730.5 days ago | Latest NAV | 2 years |
| CAGR 3Y | NAV 1095.75 days ago | Latest NAV | 3 years |
| CAGR 5Y | NAV 1826.25 days ago | Latest NAV | 5 years |

**Guard:** Period CAGR is only computed if the fund has at least 90% of the required trading days (e.g., 1Y CAGR requires ≥ 0.9 × 365 = 328 days of data).

**Implementation:** `cagrCalc()` and `cagrForYears()` in `metrics.ts` lines ~200–220.

---

## 2. Trailing Returns (Short-Period, Not Annualized)

**Formula:**
```
Return = (latestNAV / navNDaysAgo - 1) × 100
```

| Metric | Days back |
|---|---|
| 1W | 7 |
| 1M | 30 |
| 3M | 91 |
| 6M | 182 |

These are simple point-to-point percentage returns, **not** annualized. Displayed in the Trailing Returns section.

**NAV lookup:** Uses binary search (`navAtDate()`) to find the closest available NAV on or before the target date.

---

## 3. Annual Returns (Calendar Year)

**Formula:**
```
Annual Return = (lastNAV_of_year / firstNAV_of_year - 1) × 100
```

- First and last calendar years are labeled as "partial" if the fund did not trade for the full year.
- Years with fewer than 2 records are skipped.

---

## 4. Volatility (Annualized Standard Deviation)

**Formula:**
```
Daily Return_i = NAV_i / NAV_(i-1) - 1
Mean Daily Return = Σ(Daily Return) / N
Variance = Σ(Daily Return - Mean)² / N
Std Dev Daily = √Variance
Std Dev Annual = Std Dev Daily × √252 × 100
```

**Note:** Uses population variance (÷N), not sample variance (÷N-1). 252 trading days per year assumed.

---

## 5. Sharpe Ratio

**Formula:**
```
Risk-Free Daily = 0.065 / 252
Excess Return_i = Daily Return_i - Risk-Free Daily
Mean Excess = Σ(Excess Return) / N
Sharpe = (Mean Excess / Std Dev Daily) × √252
```

**Interpretation thresholds used in scoring:**

| Sharpe | Score |
|---|---|
| > 2.0 | 9.5 |
| > 1.5 | 8.5 |
| > 1.0 | 7.5 |
| > 0.5 | 6.0 |
| ≤ 0.5 | 4.0 |

---

## 6. Sortino Ratio

**Formula:**
```
Downside Returns = Daily Returns where Return < Risk-Free Daily
Downside Variance = Σ(Downside Return - Risk-Free Daily)² / N_total
Downside Std Dev = √(Downside Variance) × √252
Annual Return = (latestNAV / inceptionNAV)^(1/ageYears) - 1
Sortino = (Annual Return - 0.065) / Downside Std Dev
```

**Note:** Denominator uses total N (not just downside N) to avoid inflating the ratio when downside events are rare.

---

## 7. Max Drawdown

**Formula:**
```
For each NAV record:
  Peak = max(NAV seen so far)
  Drawdown_i = (NAV_i - Peak) / Peak × 100

Max Drawdown = min(all Drawdown_i)
```

**Current Drawdown from ATH:**
```
ATH = max(all NAV records)
Current DD = (latestNAV - ATH) / ATH × 100
```

---

## 8. Calmar Ratio

**Formula:**
```
Calmar = CAGR_inception / |Max Drawdown|
```

Both expressed as decimals (not percentages) for the ratio. A Calmar > 1.0 means the fund earns more in annual return than its worst historical drawdown.

---

## 9. Drawdown Episodes

An episode is defined as a continuous period where the fund falls more than **5%** from a local peak and then either recovers or remains ongoing.

**Detection algorithm:**
1. Scan the drawdown series for the start of a >5% decline from a local peak.
2. Track the trough (lowest point within the episode).
3. Mark recovery when NAV returns to the episode's starting peak level.
4. Episodes with fall < 5% are filtered out.

**Fields per episode:** `peakDate`, `peakNav`, `troughDate`, `troughNav`, `fallPct`, `recoveryDate`, `recoveryDays`, `status` (Recovered / Ongoing).

---

## 10. Rolling Returns

**Formula:**
```
For each date D with at least N years of prior data:
  Rolling N-Year Return = (NAV_D / NAV_(D - N*365.25))^(1/N) - 1
```

**Windows computed:** 1Y, 3Y, 5Y, 10Y.

**Statistics per window:**

| Stat | Formula |
|---|---|
| Best | max(all rolling returns) |
| Worst | min(all rolling returns) |
| Median | median(all rolling returns) |
| % Positive | count(return > 0) / total × 100 |

---

## 11. SIP XIRR Simulation

**Setup:**
- Monthly SIP amount: ₹10,000 (fixed, for relative comparison only)
- Cohort windows: 3-year and 5-year rolling cohorts
- Each cohort starts on a different month over the fund's history

**Per-cohort calculation:**
```
For each monthly installment date:
  Units purchased = SIP_Amount / NAV_on_date
  Cash flow = -10,000 (outflow)

Final value = total_units × NAV_at_cohort_end
Final cash flow = +final_value (inflow)

XIRR = Newton-Raphson IRR on the cash flow series
```

**XIRR formula (Newton-Raphson):**
```
f(r) = Σ CF_i / (1 + r)^(t_i / 365) = 0

Iterate: r_(n+1) = r_n - f(r_n) / f'(r_n)

where t_i = days from first cash flow to cash flow i
```

Convergence threshold: 1e-6. Max iterations: 100. Returns `null` if it doesn't converge.

**SIP experience classification:**

| XIRR | Experience |
|---|---|
| ≥ 15% | Excellent |
| ≥ 12% | Good |
| ≥ 8% | Moderate |
| < 8% | Poor |

---

## 12. Benchmark Metrics (`benchmark.ts`)

When a benchmark is loaded (auto or manual):

| Metric | Formula |
|---|---|
| Alpha (Inception) | CAGR_fund − CAGR_benchmark |
| Rolling Beat % (1Y/3Y/5Y) | % of rolling windows where fund CAGR > benchmark CAGR |
| Rolling Alpha Median | median(fund rolling return − benchmark rolling return) |
| Correlation | Pearson correlation of aligned daily returns |
| Tracking Error | Annualized std dev of (daily fund return − daily benchmark return) |
| Information Ratio | Alpha_annual / Tracking Error |

**Alignment:** Fund and benchmark NAV series are aligned to the same date range before computing any relative metrics.

---

## 13. 8-Parameter Scoring System

All parameters are scored 0–10. The composite score is a weighted sum normalized to 0–100.

| # | Parameter | Weight | Score Basis |
|---|---|---|---|
| 1 | Rolling Consistency | 15% | % positive windows across 1Y/3Y/5Y rolling |
| 2 | Risk-Adjusted Returns | 15% | Average of DD score + Sharpe score |
| 3 | Return Quality (Absolute) | 15% | CAGR inception vs category thresholds |
| 4 | SIP Investor Experience | 15% | % of 5Y/3Y cohorts above 15% XIRR |
| 5 | Drawdown Recovery Speed | 10% | Average recovery days vs thresholds |
| 6 | Annual Return Consistency | 10% | % of calendar years with positive returns |
| 7 | Volatility-Adjusted Returns | 10% | Sortino + Calmar composite |
| 8 | Data Completeness | 10% | Trading days / expected days |

**Composite score:**
```
Total Score (0–10) = Σ (weight_i / 100) × score_i
Display Score (0–100) = Total Score × 10
```

**Verdict thresholds:**

| Score | Verdict |
|---|---|
| ≥ 8.5 | STRONG BUY |
| ≥ 7.5 | BUY |
| ≥ 6.5 | Continue SIP |
| ≥ 5.5 | CAUTION / SIP Only |
| < 5.5 | AVOID |

---

## 14. Lump Sum Readiness (Two-Gate Check)

Implemented in `DecisionFramework.tsx`.

**Gate 1 — Quality Gate:**
```
PASS if composite score ≥ 65 (out of 100)
```

**Gate 2 — Price Gate:**
```
Category buy-zone thresholds (from categoryAverages.ts):
  Small Cap:   current DD ≤ -22% (range -22% to -30%)
  Mid Cap:     current DD ≤ -18% (range -18% to -25%)
  Sectoral:    current DD ≤ -20% (range -20% to -28%)
  Large/Flexi: current DD ≤ -15% (range -15% to -20%)

PASS if current DD from ATH ≤ category threshold
```

**Signal:**

| Gate 1 | Gate 2 | Signal |
|---|---|---|
| PASS | PASS | GO — Deploy in tranches |
| PASS | FAIL | PARTIAL — Wait for buy zone |
| FAIL | PASS | WAIT — Score too low |
| FAIL | FAIL | AVOID — Neither gate passed |

---

## 15. Market Context Verdict (`MarketContext.tsx`)

Compares fund's current DD from ATH vs benchmark's current DD from ATH.

```
absFund = |fundDD|
absIndex = |indexDD|

if absFund < 5 AND absIndex < 5 → BOTH_RECOVERING (no badge)
if absIndex < 3 AND absFund > 8 → FUND_SPECIFIC_ISSUE
if absFund ≤ absIndex × 1.25   → MARKET_CORRECTION
if absFund ≤ absIndex × 1.75   → FUND_UNDERPERFORMING
else                            → FUND_SPECIFIC_ISSUE
```

**Divergence:**
```
Divergence = fundDD - indexDD
```
Negative divergence means the fund fell more than the index.
