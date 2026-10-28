# Week 7 · Day 5 — Checkpoint: A/B notebook + 3-page dashboard

<span class="badge">A/B analysis 120 min</span> <span class="badge">Dashboard 120 min</span> <span class="badge">Interview 30 min</span> <span class="badge hw">Checkpoint · 100 points</span>

> STORY **Friday, 9:00.** Five people, two deliverables. Kamola and Nilufar: *"Tuesday's readout was for the whole app. The rollout starts in the regions, and the regional sales head wants his own — the seven regions outside Tashkent, as a notebook anyone can re-run, with the decision memo at the end. If the iOS bug or the leak touches his users, it must be in it."* Bekzod and Timur: *"The board pack: three pages, the numbers from the week-3 tiles, a PDF for the board and the `.pbix` for us. Timur will open it and press Refresh; if anything breaks, it is not done."* Madina: *"And eight questions every analyst interview asks this year. A/B testing and Power BI are on every job advert in this city."*

## Today in 3 lines

- **Part A (40 pts):** `checkpoint_ab.ipynb` from `data/python/week7/checkpoint_ab_template.ipynb` — the full offer-screen analysis on `data/ab/` for the users outside Tashkent: sanity checks, novelty, the primary result, funnel and money, the FPD guardrail with unit economics, segments with Holm, and the **decision memo**.
- **Part B (40 pts):** the **3-page Power BI dashboard** (Portfolio, Risk, Collections) on `data/powerbi/` — `nur_dashboard.pbix`, a PDF export, a screenshot of each page; graded by the numbers each card must show.
- **Part C (20 pts):** eight interview questions (SRM, peeking, MDE, guardrails, A/A, `CALCULATE` and filter context, measure vs calculated column, the star schema in Power BI), 3–5 sentences each, in `quiz.md`.

**Rules.**

- **Open book:** this week's pages, your notebooks, `data/ab/README.md`, `data/powerbi/README.md`, `measures.dax`.
- **Closed:** the model answers, until you submit.
- **Hand in** with the **📎 box at the end of this page**: `checkpoint_ab.ipynb` (executed — Kernel → Restart & Run All, then save), `nur_dashboard.pbix`, `nur_dashboard.pdf`, `page1_portfolio.png`, `page2_risk.png`, `page3_collections.png`, `quiz.md`.
- **Also due today:** **HW 7.2** in Day 3's box.
- **Power BI click paths** are for the current Desktop release; if a menu has moved in yours, the result is graded, not the path.

**Plan for the day.**

| Time | What | Output |
|---|---|---|
| 9:00–9:15 | The warm-up below (six quick checks); read all three parts; open the template; Restart & Run All (the loader asserts 27 974 / 67 215 / 2 583) | a green first cell |
| 9:15–11:15 | Part A, A1 → A6, then the memo | six result cells, six interpretations, one memo |
| 11:15–11:30 | Break; Restart & Run All; save | `checkpoint_ab.ipynb` with outputs |
| 11:30–13:30 | Part B: the three pages on yesterday's model; check every card against the checklist | `.pbix`, PDF, three PNGs |
| 13:30–14:00 | Part C in `quiz.md` | eight answers |
| 14:00–14:15 | The checklist at the end; hand in (box below) | done |

---

## Warm-up (not graded, 10 min) — six quick checks

Ten minutes before the notebook: six quick checks that wake up Days 1–4. Answer each in its box — nothing here is graded.

**W1.** An experiment ends with 14 050 users in A and 13 950 in B (planned 50/50). What is the SRM p-value?

```task
{"id": "w07d5-p1", "kind": "number", "answer": 0.55, "dp": 2, "model": "srm_pvalue(14050, 13950) = 0.55 (scipy: stats.chisquare([14050, 13950])): no evidence of a mismatch — and still check by slice."}
```

**W2.** Kamola wants to detect +0.5 points on a baseline of 8 % (α 5 % two-sided, power 80 %, Cohen's h). How many users per arm?

```task
{"id": "w07d5-p2", "kind": "number", "answer": 47519, "dp": 0, "unit": "users per arm", "hint": "Round up. Then: how many days at 1 000 viewers a day?", "model": "47 519 users per arm — 95 days at 1 000 a day, over three months. Tell her the test can see +0.9 points in a month, or that a +0.5 effect needs a bigger audience or a more sensitive metric."}
```

**W3.** Your A/A test gives p = 0.03 once. Is the system broken?

```task
{"id": "w07d5-p3", "kind": "choice", "options": ["Yes — an A/A test must never be significant", "Not by itself: one A/A in twenty is 'significant' by chance; re-split many times (ours: 4.0 % below 0.05, uniform p-values) and check the SRM", "Yes, if it happens on a weekday", "No — A/A tests cannot fail"], "answer": 1, "explain": "A broken system fails repeatedly: an SRM, far more than 5 % false positives over re-splits, or missing events in one group."}
```

**W4.** A card shows Outstanding = 1 527 946 681 726. What happened in Power Query?

```task
{"id": "w07d5-p4", "kind": "choice", "options": ["Payments were merged onto loans with outstanding expanded: each loan's balance repeated once per payment (×7.3)", "The date table is not marked", "A measure uses / instead of DIVIDE", "The relationship is single-direction"], "answer": 0, "explain": "Remove the merge and relate both facts to the dimensions (Day 3, Company corner)."}
```

**W5.** `YTD Disbursed` at September 2026 is 161 480 300 000. What does it show at October 2026?

```task
{"id": "w07d5-p5", "kind": "number", "answer": 162333060000, "dp": 0, "unit": "soum", "model": "162 333 060 000 — October has only one day of data (21 loans, 852 760 000) because the as-of date is 1 October."}
```

**W6.** Conversion goes from 8.0 % to 8.9 %. What is the relative lift, in %, to 2 decimals?

```task
{"id": "w07d5-p6", "kind": "number", "answer": 11.25, "dp": 2, "unit": "%", "model": "+0.9 points absolute, +11.25 % relative (0.9 / 8.0). Always say which: \"+11 %\" and \"+0.9 %\" are different claims."}
```

---

## Part A — The offer-screen A/B analysis, the regional readout (120 min, 40 pts)

> 💡 **Key idea.** The plan, not the data, decides: the same pre-registered checks, exclusions and segments as Tuesday, on a new population. Filter the regions first, then run every Day-2 check on what is left.

**The population is new.** Tuesday's readout was for every app user. The rollout will start in the regions, and the regional sales head wants a readout of his own: **users in the seven regions outside Tashkent** (`users["region"] != "Tashkent"` — 16 738 of the 27 974 rows). Same experiment, same pre-registered plan (7-day conversion, novelty days excluded, the same seven segments), new numbers: none of them is on Tuesday's page. A user's region never changes, so you can filter first and then run every check of Day 2 on what is left.

Every task: code with printed output, then **two sentences** for Kamola (product) and Nilufar (risk). A correct number with no interpretation earns 60 % of the task. Conversion = `contract_signed` within 7 × 24 h of `assigned_at` (the template's `with_conversion`).

### A1. Sanity checks before any result — 8 pts

**Task.** Rows vs users; SRM overall (rows and users) and by device, week, device × week, with your threshold stated; the hash check; users in both variants. Every problem with its size.

<details><summary>Model answer (open after submitting)</summary>

```python
# (shape only — not meant to run: the template's helpers live in the notebook)
...
# 16 738 rows
reg = users[users["region"] != "Tashkent"]
# 16 558 users, 16 738 rows
reg["user_id"].nunique(), len(reg)
# 180 users, each in A and B
dup_ids = reg.loc[reg["user_id"].duplicated(), "user_id"].unique()
# rows 8 299 / 8 439: p = 0.28
stats.chisquare(reg["variant"].value_counts().values).pvalue
ud = reg[~reg["user_id"].isin(dup_ids)].assign(week=lambda t: (t.assigned_at - pd.Timestamp("2026-08-01")).dt.days // 7 + 1)
# users 8 119 / 8 259: p = 0.27
stats.chisquare(ud["variant"].value_counts().values).pvalue
# iOS wk4: 330 / 482 (59.4 % B), p = 9.6e-8; all other cells p >= 0.13
srm_by(ud, ["device", "week"])
expected = reg["user_id"].map(lambda u: hash_variant(u, "offer_screen_v2"))
# 261 = 180 leak re-assignments + 81 iOS wk4 users logged B, hash A
(reg["variant"] != expected).sum()
```

Threshold: p < 0.001 for SRM (many slices are checked). Problems: (1) **180 users in both variants** (360 rows; first assignment A for 111, B for 69) — removed entirely; (2) **SRM in iOS, 22–28 August**: 812 users, 59.4 % B, 81 of them hash-A users logged as B — the cell is removed from both arms (after: 7 789 / 7 777, p = 0.92). Device iOS overall (p = 0.0070) is the same bug seen through a wider slice; week 4 as a whole (p = 0.12) does not show it at all.

*Interpretation.* In the regions the overall split looks fine (p = 0.28) and even the last week as a whole hides the problem, but 180 users saw both screens and the iOS client pushed 81 control users into B in the last week; both are removed before any result is read. A regional readout that skipped the device × week check would have compared a contaminated B with A.

</details>

*Deductions seen most often:* SRM checked only overall, or only by week; the duplicates noticed but only the second row removed; reweighting the iOS cell instead of removing it; the Tashkent users left in.

### A2. Novelty — 4 pts

**Task.** Daily conversion by variant (de-duplicated users) with a chart of the lift; the lift on 1–3 August and a test on those days; the weekly table with iOS week 4 out. Say what the pre-registered plan does with days 1–3.

<details><summary>Model answer (open after submitting)</summary>

Daily conversion (de-duplicated), B − A on 1–3 August: **+2.8, +0.3, +2.0** points; single days afterwards swing from −4.3 to +5.9 (14 August). Days 1–3 pooled: 8.50 % vs **10.16 %**, +1.66 points, p = 0.22; from 4 August (clean): +1.05. Weekly (iOS week 4 out): A 8.45 / 8.32 / 6.32 / 8.04 %, B 9.57 / 9.85 / 7.30 / 8.84 %.

*Interpretation.* In the regions the launch spike is weaker and noisier than in the whole app (+1.7 points on days 1–3, p = 0.22) — on its own it would not prove a novelty effect. The decision does not depend on that: the pre-registered rule excludes days 1–3 for every population, so the primary uses users assigned from 4 August and the full period is a sensitivity line.

</details>

*Deductions seen most often:* days 1–3 kept "because the spike is small here" (the plan, not the data, decides exclusions); one high day (14 August) called novelty; no chart.

### A3. The primary result — 8 pts

**Task.** Clean population: conversion per variant, the difference with a 95 % CI, the p-value, the relative lift with its CI; then the same on raw data.

<details><summary>Model answer (open after submitting)</summary>

```python
# (shape only — not meant to run: the template's helpers live in the notebook)
...
# 13 725 users: A 6 883, B 6 842 (SRM p = 0.73)
clean = with_conversion(clean_users(reg), events)
ab_readout(clean)
# A 530 / 6 883 = 7.70 % · B 599 / 6 842 = 8.75 % · diff +1.05 pt (Newcombe
# +0.14 to +1.98) · z = 2.25, p = 0.025
# relative +13.7 % (log-ratio CI +1.7 % to +27.2 %)
ab_readout(with_conversion(reg, events))
# raw: 8.12 % vs 9.10 % · +0.98 pt (+0.13 to +1.83) · p = 0.024 · +12.1 % (+1.5
# to +23.7)
```

| population | diff (95 % CI) | p | relative |
|---|---|---|---|
| raw | +0.98 (+0.13 to +1.83) | 0.024 | +12.1 % |
| − leak | +1.00 | 0.020 | +12.8 % |
| − iOS wk 4 | +1.13 | 0.011 | +14.5 % |
| **clean** | **+1.05 (+0.14 to +1.98)** | **0.025** | **+13.7 % (+1.7 to +27.2)** |

*Interpretation.* In the regions the new screen raises 7-day conversion from 7.70 % to 8.75 % (+1.05 points, 95 % CI +0.14 to +1.98; p = 0.025) — about 10 more contracts per 1 000 viewers. Here the raw and the clean answers are close (+0.98 vs +1.05): cleaning is not a way to make the lift bigger or smaller, it is the condition for reading it — and the interval's low end is close to zero.

</details>

*Deductions seen most often:* the relative CI computed by dividing the difference's CI by 7.70 %; z with the arms in the wrong order (negative z for a positive lift, unexplained); no raw-vs-clean comparison; "p = 0.025 means a 97.5 % chance B is better".

### A4. Funnel and money — 6 pts

**Task.** The funnel step rates by variant with a test per step; principal per loan (Mann–Whitney and a bootstrap CI of the mean difference); disbursed principal per viewer with its bootstrap CI.

<details><summary>Model answer (open after submitting)</summary>

Funnel (clean): start 33.3 vs 33.3 % (p 0.95); submit 73.5 vs 74.6 % of starters (0.37); approved 38.4 vs 41.2 % of submitted (0.10); signed 88.9 vs 90.7 % of approved (0.26). Principal per loan: A 2 640 243 (median 2 330 000, 575 loans), B 2 513 443 (2 290 000, 636); Mann–Whitney **p = 0.15**; bootstrap mean difference **−126 800 (−265 376 to +14 550)**, −4.8 %. Disbursed per viewer: A 202 840, B 219 744 (**+8.3 %**), bootstrap CI of the difference −10 048 to +43 827 (202.8 m vs 219.7 m per 1 000 viewers).

*Interpretation.* As in the whole app, the lift comes from users finishing an application, not from more users starting one; B's loans may be smaller (−4.8 %, not significant), so the money effect (+8.3 % disbursed per viewer) has an interval that includes zero. Watch the approval step: 41.2 % vs 38.4 % of submitted forms (p = 0.10) would mean the screen brings in different applicants — which A5 makes urgent.

</details>

*Deductions seen most often:* a t-test on principal with "loans are smaller" from p = 0.15; disbursed per viewer averaged over converters only; five funnel p-values read as five findings.

### A5. The guardrail — 8 pts

**Task.** FPD per variant with Wilson intervals; the z-test and Fisher; the CI of the difference; the power for the observed difference and the loans per arm for 80 %. Then the unit economics: profit per 1 000 viewers per arm and B's break-even FPD, recomputed on the regional numbers.

<details><summary>Model answer (open after submitting)</summary>

```python
# (shape only — not meant to run: the template's helpers live in the notebook)
...
lc = loans.merge(clean[["user_id", "variant"]], on="user_id").assign(fpd=lambda t: 1 - t.first_instalment_paid_within_30d)
# A 6 / 575 = 1.04 % (Wilson 0.48-2.26) · B 14 / 636 = 2.20 % (1.32-3.66)
# z-test p = 0.11 · Fisher p = 0.17 · difference +1.16 pt (Newcombe -0.35 to
# +2.72)
# power for a true +1.16 pt at these n: 37 % · loans per arm for 80 % power: 1
# 809 (~20 700 users per arm)
```

Unit economics (interest 9.856 % of principal = 266 662 ÷ 2 705 586, LGD 60 %, FPD ≈ PD): per 1 000 viewers **A 18 555 488**, **B 18 303 993** (−1.4 %); break-even FPD for B **2.04 %** = A + **0.99** points — and B's observed 2.20 % is already above it; at the CI's upper end (3.77 %) B makes 15 898 606 (−14.3 % vs A).

*Interpretation.* B's FPD is 1.2 points higher in the regions (p = 0.11, with only 37 % power), and its point estimate of 2.20 % is already beyond the 2.04 % at which B stops paying for itself — the expected money effect is slightly negative. The guardrail is not cleared and leans towards failing: B must not go to all regional users until FPD is read on more matured loans.

</details>

*Deductions seen most often:* "FPD not significant — guardrail passed"; the break-even from Day 1 (+1.25) or Day 2 (+0.94) copied without recomputing on the regional principal and FPD; no power statement; FPD on all loans including the leaked users.

### A6. Segments — 6 pts

**Task.** The lift by device, new vs returning and customer segment, with raw and Holm-adjusted p-values; the interaction test new vs returning.

<details><summary>Model answer (open after submitting)</summary>

| segment | lift (pt) | p | Holm |
|---|---|---|---|
| Android | +0.69 | 0.18 | 0.81 |
| iOS | +2.77 | 0.018 | 0.13 |
| new | +0.66 | 0.31 | 0.81 |
| returning | +1.42 | 0.034 | 0.21 |
| affluent | +1.48 | 0.18 | 0.81 |
| mass | +0.82 | 0.16 | 0.81 |
| sme | +1.36 | 0.21 | 0.81 |

Interaction new vs returning: z = −0.82, **p = 0.41**.

*Interpretation.* The lift is positive in all seven pre-registered segments and none is significant after Holm (smallest 0.13); there is no evidence that the screen works better for one group. iOS (+2.8, raw p = 0.018) is the largest of seven comparisons and the slice where a broken cell was just removed — a reason for care, not a targeting recommendation.

</details>

*Deductions seen most often:* no correction; "works on iOS"; segments invented after looking (single regions, day of week) presented as pre-registered.

### The decision memo (inside the 40 points)

**Task.** One decision word first (ship / ship in stages / do not ship / extend), then the eight readout lines of Day 2's Company corner, each with its numbers.

<details><summary>Model answer (open after submitting)</summary>

**Decision: extend — do not roll B out to the regions yet.** B converts better by about +1 point, but its first-payment defaults are already above the break-even in the point estimate; keep the 50/50 test running in the regions until FPD can be read.

| Line | Text |
|---|---|
| Hypothesis | A single button and the monthly payment in large type make more offer viewers sign a contract. |
| Design | User-level 50/50 hash split (`offer_screen_v2`), 1–28 Aug 2026; population: the seven regions outside Tashkent; primary = signed within 7 days; α 5 % two-sided; MDE +0.9 pt. |
| Sanity checks | 180 users in both variants removed; iOS 22–28 Aug SRM (330 / 482, p ≈ 10⁻⁷, client bug) removed from both arms; novelty days 1–3 Aug excluded as planned. Clean: 6 883 / 6 842, SRM p = 0.73. |
| Primary | 7.70 % → 8.75 %: +1.05 pt (95 % CI +0.14 to +1.98), p = 0.025; +13.7 % relative (+1.7 % to +27.2 %). Raw would have said +0.98. |
| Guardrails | FPD 1.04 % → 2.20 % (+1.16, CI −0.35 to +2.72, p = 0.11, power 37 %); break-even +0.99 pt — the point estimate is beyond it. Principal −4.8 % (p = 0.15). Disbursed per viewer +8.3 % (CI includes 0). |
| Segments | All seven positive, none after Holm (min 0.13); no interaction (p = 0.41). |
| Decision and conditions | Keep the 50/50 split in the regions until ~1 800 loans per arm have a readable FPD (about ten more weeks of regional traffic, then two months for the last loans to mature); ship to the regions only if the FPD difference's upper 95 % bound is below +0.99 pt. |
| Learned / next | The regional lift is as large as the app's, the regional loans look riskier; the guardrail must be read per rollout population, not once; fix iOS assignment logging. |

</details>

**If you are stuck (hints, not answers).**

- A1: filter `region != "Tashkent"` first; then `duplicated(keep=False)`; your Day-2 `srm_by` on `["device", "week"]`; Day 1's `hash_variant` with the salt from `data/ab/README.md` — Day 2, 'The data layout' and 'Sanity check 1–3'.
- A2: `groupby([assigned_at.dt.date, "variant"])["conv"].mean().unstack()`, then a line chart — Day 2, 'The daily lift', P6.
- A3: your `clean_users` and `ab_readout` on the regional rows; `compare="ratio", method="log"` for the relative CI — Day 2, worked example.
- A4: one `isin` per event name for the funnel; `stats.mannwhitneyu`; a bootstrap loop with `default_rng(2026)` — Day 2, 'Secondary metrics', P8–P9.
- A5: `proportion_confint(..., method="wilson")`, `NormalIndPower().power(...)`, `zt_ind_solve_power(...)`; the break-even formula from Day 1's Company corner with the regional principal and FPD — Day 2, 'Guardrails', P10 and P15.
- A6: a loop over three columns, then `multipletests(p, method="holm")`; the interaction as a z on the difference of two differences — Day 2, 'Segments', P11.

```game
{"type": "bug", "id": "w07d5-g1", "title": "Two lines of a regional memo that fail review", "q": "A draft memo for the regional sales head. Tap the lines that would lose marks.", "code": "Decision: extend — do not roll B out to the regions yet.\nSanity: 180 users in both variants removed; iOS 22–28 Aug removed from both arms.\nGuardrail: FPD p = 0.11, not significant — guardrail passed.\nBreak-even: +1.25 points, from Day 1's Company corner.\nPrimary: 7.70 % → 8.75 %, +1.05 pt (95 % CI +0.14 to +1.98), p = 0.025.\nSegments: all seven positive, none after Holm (min 0.13).", "answer": [2, 3], "why": "A test with 37 % power cannot pass a guardrail — it is unresolved; and the break-even must be recomputed on the regional principal and FPD (+0.99 points), not copied from Day 1."}
```

**Check your key numbers before you hand in.** The site checks these five; the model answers above stay closed until you submit.

**K1.** Regional users assigned to both variants.

```task
{"id": "w07d5-k1", "kind": "number", "answer": 180, "dp": 0, "unit": "users", "model": "180 regional users in both variants (360 rows) — removed entirely."}
```

**K2.** Users in the clean regional population (leak out, iOS 22–28 August out, assigned from 4 August).

```task
{"id": "w07d5-k2", "kind": "number", "answer": 13725, "dp": 0, "unit": "users", "model": "13 725 clean regional users: A 6 883, B 6 842, SRM p = 0.73."}
```

**K3.** The clean primary difference B − A, in points (two decimals).

```task
{"id": "w07d5-k3", "kind": "number", "answer": 1.05, "dp": 2, "unit": "points", "model": "+1.05 points (7.70 % → 8.75 %), p = 0.025."}
```

**K4.** B's FPD on the loans of clean regional users, in %, to 2 decimals.

```task
{"id": "w07d5-k4", "kind": "number", "answer": 2.2, "dp": 2, "unit": "%", "model": "B 14 / 636 = 2.20 % (A 6 / 575 = 1.04 %)."}
```

**K5.** The smallest Holm-adjusted p-value of the seven segments.

```task
{"id": "w07d5-k5", "kind": "number", "answer": 0.13, "dp": 2, "unit": "", "model": "iOS, raw p = 0.018 × 7 = 0.13 — the smallest after Holm; nothing significant."}
```

---

## Part B — The 3-page dashboard (120 min, 40 pts)

Build on yesterday's model (`nur_week7.pbix` → save as `nur_dashboard.pbix`). Three pages as specified in Day 4's Company corner; the same top strip on each (title, "Data as of 1 Oct 2026", synced slicers for product, branch, month); ≤ 7 visuals per page; titles that state the finding; one colour for bad; the definitions line at the bottom. Export: File → Export → **Export to PDF** (all pages) and a PNG screenshot of each page with **no slicer selected**.

**Required on every page** (graded inside each page's "layout" line):

- the title as a finding, not a label ("PAR30 3.12 %: concentrated in Nukus SME and Bukhara");
- "Data as of 1 Oct 2026" in the top strip, and the definitions line at the bottom;
- the same three slicers in the same place, synced (View → Sync slicers);
- cards in the top row, the trend in the middle, the detail at the bottom; at most seven visuals;
- one colour for "bad" (red), greys and one accent for everything else; no pie with more than three slices;
- tooltips with n wherever a rate is shown for a small group (vintages, collectors, branches).

**Grading checklist — what each card must show** (no slicer, unless stated):

| Page | Card / visual | Must show | Pts |
|---|---|---|---|
| Portfolio | Outstanding | **208 723 504 430** (3 409 loans) | 2 |
| | Disbursed, Sep 2026 | **17 015 490 000** · 361 | 2 |
| | YTD Disbursed at Sep 2026 | **161 480 300 000** (YoY +45.6 %) | 2 |
| | Avg Ticket, Sep 2026 | **47 134 321** | 1 |
| | Month-end trend Jan–Sep 2026 | 151.8 → **208.2 bn** (no October point, no summed balances) | 2 |
| | Outstanding by product with share | SME **60.32 %** … MICRO 0.46 % | 1 |
| | Layout, titles, slicers, as-of | top-left KPI, ≤ 7 visuals, synced slicers | 2 |
| Risk | PAR30 % · NPL90 % | **3.12 %** · **2.55 %** (234 loans 90+) | 3 |
| | FPD30 %, Jul 2026 vintage | **1.09 %** (4 / 367); vintages with n < 50 hidden | 2 |
| | Cure / roll forward 1-30 | **75.78 %** / 19.53 % | 2 |
| | Matrix PAR30 branch × product, conditional formatting | Nukus SME **9.02 %** darkest; Nukus 6.84 %, Termez 0.68 % | 3 |
| | Layout, titles, definitions line | as above | 2 |
| Collections | Collection rate, due Sep 2026 | **94.08 %** (Aug 96.52 %) | 2 |
| | Collected, Sep 2026 | **16 338 823 207** | 2 |
| | Actions / contact / PTP / paid, Sep 2026 | **651** · 72.81 % · 28.57 % · 22.73 % | 2 |
| | Collection rate by branch | Termez 97.68 % top, Tashkent South 91.44 % bottom | 2 |
| | Collector table, Top N 5 | Nilufar Jalilov 52 … Ilhom Qodirov 32 | 2 |
| All | Files: `.pbix` refreshes on Timur's PC (relative folder or a parameter), PDF, three PNGs | | 3 |
| All | Model hygiene: star, single direction, date table marked, no (Blank) segment | | 3 |
| | | **total** | **40** |

*Spot checks the reviewer will make after Refresh:* product slicer SME → Outstanding **125 892 942 411**, PAR30 **2.55 %**, `Dynamic Title` *"Outstanding - Small business loan · as of 1 Oct 2026: 125.9 bn soum"*; branch slicer Bukhara Central → Outstanding **15 116 046 338**, PAR30 **4.81 %**, collection rate Sep **92.31 %**; month slicer Aug 2026 on page 1 → Disbursed **22 290 210 000**.

*Deductions seen most often:* the as-of `Outstanding` on a monthly trend line (it is dated by disbursement); Month-End summed over the year; FPD by vintage including August 2026 (11 loans, 0 %); a pie with five products; red used as a series colour; a slicer that does not reach the Collections page; an absolute file path, so the refresh fails elsewhere.

**If you are stuck (hints).** Build page 1 completely before starting page 2 — copy the page (right-click its tab → Duplicate) to keep the top strip. A card shows the wrong number → check the slicers on the page and *Edit interactions* first, then the measure's filter context (Day 4, P4), then the relationship (Day 3, P6). Month-end trend → `Outstanding Month-End` and a visual filter `year_month` ≤ 2026-09. Top N → the Filters pane on the table visual, *Filter type: Top N*, by `Actions`. PDF export exports what is on screen: clear the slicers first.

**No work account?** Then the `.pbix` and the PDF *are* the publication — say so in a one-line `README.md` in the folder. If you do have one: publish to a workspace, set a scheduled refresh (it needs a gateway for files on your PC) and add the link to the README — a bonus mention, no points.

> ⚠️ **Watch out.** The as-of `Outstanding` is dated by disbursement — it never goes on a monthly trend line, and Month-End balances are never summed over a year. Check every card against the checklist with no slicer selected, then once more after Refresh.

```game
{"type": "sort", "id": "w07d5-g2", "title": "Earns the point, or costs it?", "q": "Part B. Sort each dashboard choice.", "groups": {"Earns the point": ["The source folder is a parameter, so Refresh works on Timur's PC", "\"Data as of 1 Oct 2026\" and a definitions line on every page", "FPD vintages with fewer than 50 loans hidden", "Outstanding Month-End on the trend line"], "Costs the point": ["The as-of Outstanding on the monthly trend line", "Month-End balances summed over the year", "A pie chart of the five products", "Red used as a series colour"]}, "why": "Every deduction in the list is a number that looks right and is wrong, or a page that cannot be refreshed or read."}
```

---

## Part C — Eight interview questions (30 min, 20 pts)

> 💡 **Key idea.** A strong interview answer has three parts: the definition, one number from this week, and what you do about it.

Answer in `quiz.md`, 3–5 sentences each, with a number from this week where it helps. 2.5 points each.

1. What is a sample ratio mismatch, how do you test for it, and what do you do when you find one?
2. Why does checking an A/B test's p-value every day and stopping when it is below 0.05 break the test? What can you do instead?
3. What is the MDE, how is it related to the sample size, and how do you choose it?
4. What is a guardrail metric? Give a lending example and explain how you decide whether it has been "passed".
5. What is an A/A test, what does it check, and what would a failed one look like?
6. Explain filter context and what `CALCULATE` does to it, with an example.
7. Measure or calculated column: what is the difference, and when do you use each?
8. What is a star schema in Power BI, and why are relationships one-to-many and single-direction?

<details><summary>Model answers (open after submitting)</summary>

1. **SRM.** The arms' sizes differ from the planned split by more than chance — a sign that something in assignment or logging is broken, so the arms are no longer comparable. Test with a chi-square goodness-of-fit against the planned shares, overall **and** by the slices the product ships in (device, release, day), with a strict threshold such as p < 0.001. Our test looked fine overall (p = 0.09) and had 537 vs 822 in iOS in its last week (p ≈ 10⁻¹⁴). You do not reweight: you find the cause, remove the broken cell from both arms or re-run, and report it.
2. **Peeking.** A fixed-horizon test controls the false-positive rate for one look at the planned n; each extra look is another chance for a null effect's wandering p-value to dip below 0.05. In our simulation of A/A tests, one look gave 4.9 % false wins, weekly looks 12.4 %, daily looks 27.2 %. Fix the sample size and end date in advance, or use a sequential design with stricter thresholds at each look (Pocock 0.0182 at four looks brought it back to 4.8 %); use live dashboards only to catch bugs.
3. **MDE.** The smallest true effect the test detects with the chosen power (usually 80 %) at the chosen α. The sample size grows with the inverse square of the MDE: 8.0 → 8.9 % needs 14 983 users per arm, half the effect (+0.45) about four times as many. Choose it from the business — the smallest change worth acting on (here: worth a release) — and check that the duration it implies is feasible; never choose the effect you hope for.
4. **Guardrail.** A metric that must not get worse even if the primary improves. In lending: the first-payment-default rate of the loans the change produces — a screen that raises conversion by attracting weaker borrowers can lose money. "Passed" means its confidence interval excludes a harmful change, ideally defined in money: our break-even FPD increase was +0.94 points, the observed interval ran to +1.94, so with 23 % power the guardrail was unresolved and the rollout was staged with a hold-out.
5. **A/A test.** Two groups get the same experience and are analysed with the planned pipeline. It checks the system — the split (SRM), the logging, the metric code and the test's false-positive rate. Ours: 6 411 vs 6 441 (p = 0.79), 8.20 % vs 8.18 % (p = 0.96), and 4.0 % false positives over 1 000 re-splits with uniform p-values. A failed one shows an SRM, a "significant" difference that repeats, many more than 5 % false positives, or missing events in one group.
6. **Filter context and CALCULATE.** A measure is evaluated in a filter context: the slicers, the visual's row and column, page filters, carried to the fact through relationships — in a table by product, SME's row sees only SME loans. `CALCULATE` evaluates an expression in a modified context: its filter arguments replace existing filters on the same columns and add the rest. `CALCULATE([Outstanding], v_loan_status[dpd] > 30)` in the SME row gives SME's outstanding at 30+ DPD, and divided by `[Outstanding]` it is PAR30 for SME (2.55 %). In a calculated column, `CALCULATE` also turns the row into a filter (context transition).
7. **Measure vs calculated column.** A calculated column is computed once per row at refresh, stored, and sees the current row — use it for values you slice or filter by (a bucket, an age band, a key). A measure is computed at query time for every cell in its filter context and stores nothing — use it for every aggregated number on a visual, and always for ratios. Average of a row-level flag gave 3.51 % or 2.85 % for "PAR30"; the measure's ratio of sums gives the right 3.12 %.
8. **Star schema in Power BI.** Fact tables (loans, payments, instalments — each at its own grain) in the centre, dimension tables (date, product, branch, customer) around them, each fact related to the dimensions by one-to-many relationships from the unique dimension key. Single direction means filters flow from dimension to fact, so one slicer reaches every fact consistently and there is exactly one path between any two tables; bidirectional relationships create ambiguity and silently wrong numbers. Facts are never joined to each other — merging a loan's balance onto its payments turned 209 billion into 1.5 trillion.

</details>

**Follow-ups an interviewer adds** (one sentence each): *"Why randomise by user and not session?"* (consistency, independence; Day 1) · *"What is a novelty effect and how do you see it?"* (daily lift chart; Day 2) · *"How would you test a change whose effect on defaults takes months to see?"* (a leading metric + a hold-out; Day 2) · *"Import or DirectQuery?"* (Day 3) · *"What does `ALL` do inside `CALCULATE`?"* (Day 4) · *"How do branch managers see only their branch?"* (RLS; Day 4).

```game
{"type": "flash", "id": "w07d5-g3", "title": "The eight answers in one line each", "cards": [["SRM", "group sizes off the plan by more than chance: chi-square, by slice, p < 0.001; find the bug, do not reweight"], ["Peeking", "every extra look is another chance to cross 0.05: daily looks gave 27 % false wins; fix the end date or go sequential"], ["MDE", "the smallest effect worth acting on; n grows with 1 / MDE² — 14 983 per arm for +0.9 points"], ["Guardrail", "must not get worse; in lending FPD; passed only when its interval excludes the break-even"], ["A/A test", "same screen in both arms: tests the split, logging, metric and the test's 5 %"], ["Filter context + CALCULATE", "the cell's filters; CALCULATE replaces filters on the same column and adds the rest"], ["Measure vs column", "column per row, stored, for slicing; measure per cell, for every number and every ratio"], ["Star schema", "facts at their grain, shared dimensions, one-to-many, single direction; never join facts"]]}
```

---

## Before you submit

- [ ] `checkpoint_ab.ipynb`: Restart & Run All finishes with no red cell; saved after the run; every task prints its numbers.
- [ ] A1 names every problem with its size (users in both variants, the iOS week-4 cell and its hash mismatches); A3 shows clean and raw side by side; A5 states the power and the break-even; A6 has Holm.
- [ ] The memo starts with one decision word and states its conditions as numbers.
- [ ] `nur_dashboard.pbix` refreshes from a folder path someone else can change (a parameter or a relative location noted in the README); the three pages match the checklist with no slicer selected.
- [ ] `nur_dashboard.pdf` and three PNGs; every page shows "Data as of 1 Oct 2026" and a definitions line.
- [ ] `quiz.md` has eight answers with at least four numbers from this week.
- [ ] A one-line `README.md` says how the dashboard was shared (`.pbix` + PDF, or a Service link) and which Desktop version you used.
- [ ] HW 7.2 (model screenshot + six measures) is handed in (Day 3's box).

---

## Scoring and what happens next

| Part | Points | What earns them |
|---|---|---|
| A — A/B analysis | 40 | per task: correct method and numbers (60 %), two-sentence interpretation that says what to do (40 %); the memo is part of A3–A6's interpretation marks |
| B — dashboard | 40 | the checklist above |
| C — interview | 20 | 2.5 per answer: correct, in your words, with a number or example |

**70 points** to move on. Below 70, the feedback lists the sections to redo. Points go to the [Progress page](progress.md). Next week, the last: **product analytics** (funnels, cohorts, retention, unit economics) on the app events, and the **capstone** — three days, one dataset, a decision for Nur's management, and a mock interview.

**Week 7 in five sentences** (what you can now say in any meeting):

1. "Before/after is not an experiment; a 50/50 hash split over the same weeks is — 14 983 users per arm for +0.9 points."
2. "The split looked fine overall and was 60/40 in iOS last week — check the sample ratio by slice before reading any result."
3. "The new screen adds +0.88 points (CI +0.16 to +1.60), not the +1.09 the dashboard showed; the first three days were novelty."
4. "FPD +0.7 points with 23 % power is unknown, not safe — ship with a hold-out."
5. "One model, one definition per measure, refreshed from the views: PAR30 is 3.12 % on the card, in the SQL and in the PDF."

> 🚀 **Stretch (optional, +5 XP).** **S1.** Write `nur_ab.py` with `readout(users, events, window_days=7, exclude=None)` (sanity checks + primary + relative lift, returning a one-row DataFrame) and `guardrail(loans, users, break_even_pt)` (rates, test, CI, power, verdict "pass / fail / unresolved"). Run both on the clean population and on the raw data and paste the two rows into your memo. Then add a fourth page to the dashboard: **Experiments**, with `users.csv` and `loans_followup.csv` loaded, a measure `Conversion 7d` and a line of daily conversion by variant — the novelty spike, visible to Kamola without Python.

```task
{"id": "w07d5-s1", "kind": "free", "min": 20, "xp": 2, "model": "readout, clean (13 725 users): 7.70 % → 8.75 %, +1.05 pt (95 % CI +0.14 to +1.98), z = 2.25, p = 0.025, +13.7 %. readout, raw (16 738 rows): 8.12 % → 9.10 %, +0.98 pt (+0.13 to +1.83), p = 0.024, +12.1 %. guardrail(loans, clean, 0.99): A 1.04 %, B 2.20 %, +1.16 pt (−0.35 to +2.72), p = 0.11, power 37 % → unresolved (the point estimate is already beyond the break-even). Page 4 shows B's daily conversion far above A's on 1–3 August.", "rubric": ["the clean row matches A3 (+1.05 pt, p = 0.025)", "the raw row is shown next to it (+0.98 pt)", "guardrail() returns 'unresolved' with the power and the break-even", "the Experiments page shows the novelty spike"]}
```

---

### 📎 Hand in here

```sqltask
{"check": "handin-W7D5", "lesson": "W7D5", "title": "Checkpoint 7", "tasks": [{"id": "checkpoint_ab.ipynb", "file": "checkpoint_ab.ipynb", "names": ["checkpoint_ab.ipynb"], "upload": true, "accept": ".ipynb", "q": "Attach `checkpoint_ab.ipynb` — what the page above asks for."}, {"id": "nur_dashboard.pbix", "file": "nur_dashboard.pbix", "names": ["nur_dashboard.pbix"], "upload": true, "accept": ".pbix", "q": "Attach `nur_dashboard.pbix` — what the page above asks for."}, {"id": "nur_dashboard.pdf", "file": "nur_dashboard.pdf", "names": ["nur_dashboard.pdf"], "upload": true, "accept": ".pdf", "q": "Attach `nur_dashboard.pdf` — all three pages, no slicer selected."}, {"id": "page1_portfolio.png", "file": "page1_portfolio.png", "names": ["page1_portfolio.png"], "upload": true, "accept": ".png", "q": "Attach `page1_portfolio.png`."}, {"id": "page2_risk.png", "file": "page2_risk.png", "names": ["page2_risk.png"], "upload": true, "accept": ".png", "q": "Attach `page2_risk.png`."}, {"id": "page3_collections.png", "file": "page3_collections.png", "names": ["page3_collections.png"], "upload": true, "accept": ".png", "q": "Attach `page3_collections.png`."}, {"id": "quiz.md", "file": "quiz.md", "text": true, "minLines": 8, "q": "Write `quiz.md` here — Part C, eight answers of 3–5 sentences, at least four numbers from this week."}, {"id": "Extra", "file": "extra", "upload": true, "optional": true, "q": "Anything else the page lists (one more file, or a .zip of several)."}], "why": "Two deliverables a team would actually use: a notebook anyone can re-run with a decision at the end, and a board pack that refreshes instead of being rebuilt.", "graded": ["Part A (40): per task, correct method and numbers (60 %) and a two-sentence interpretation that says what to do (40 %); the memo is part of A3–A6", "Part B (40): the card-by-card checklist, the layout rules and a .pbix that refreshes on someone else's PC", "Part C (20): 2.5 per answer — correct, in your words, with a number or an example", "70 points to move on"]}
```

---

## Day quiz

Pass with 80 % to finish the day. Retry as often as you like.

```quiz
{"id": "w07d5", "pass": 0.8, "questions": [
  {"type": "single", "q": "B vs A gives p = 0.016. Which reading is right?", "options": ["If the screens did not differ, a gap at least this large would appear in about 1.6 % of experiments of this size", "B is 1.6 % better", "1.6 % of users prefer A", "There is a 98.4 % chance that B is better"], "answer": 0, "explain": "The p-value is computed assuming no difference; it is not the probability that B is better (→ A3 deductions, week 6 Day 3)."},
  {"type": "single", "q": "Some users were assigned to both arms. What do you do with them?", "options": ["Keep their first assignment", "Keep them — they are only 1 %", "Remove only their second row", "Remove every row of those users and report how many"], "answer": 3, "explain": "After the second assignment their outcome comes from a mix of A and B; they belong to neither arm (→ A1 deductions, Day 2 'The data layout')."},
  {"type": "single", "q": "Why a strict SRM threshold such as p < 0.001?", "options": ["The regulator requires it", "SRM is checked on many slices; a strict threshold keeps false alarms rare, and an alarm means a search for the bug", "0.05 is for A/A tests only", "The arms are large"], "answer": 1, "explain": "Many checks at 5 % would always raise something; the response to a real alarm is finding the cause, not reweighting (→ A1, Day 1 'SRM')."},
  {"type": "single", "q": "B converts better, yet z is negative. Why?", "code": "z, p = proportions_ztest([conv_A, conv_B], [n_A, n_B])\n# z = -2.41", "options": ["A negative z means B is worse", "The p-value must be halved", "A is listed first, so z measures A − B; put B first or say which order you used", "The test is broken"], "answer": 2, "explain": "An unexplained sign is a deduction; the worked example lists B first so that z > 0 means B is higher (→ A3 deductions)."},
  {"type": "number", "q": "Conversion goes from 8.0 % to 8.9 %. What is the relative lift, in %?", "answer": 11.25, "tol": 0.05, "explain": "0.9 / 8.0 = 11.25 % relative; the absolute lift is +0.9 points — always say which (→ Warm-up 6)."},
  {"type": "multi", "q": "Which are correct practices for the Part B dashboard?", "options": ["Put the as-of Outstanding measure on the monthly trend line", "Point the source at a parameter or a relative folder so the refresh works on Timur's PC", "Sum Outstanding Month-End over the year", "A pie chart of the five products", "'Data as of 1 Oct 2026' and a definitions line on every page", "Hide FPD vintages with fewer than 50 loans in scope"], "answer": [1, 4, 5], "explain": "The as-of Outstanding is dated by disbursement, month-end balances are not added, and a pie of five slices breaks the chart rules (→ Part B deductions)."},
  {"type": "single", "q": "What happens on a card when [Due] is 0 or blank, and what should you write instead?", "code": "Collection Rate = [Paid] / [Due]", "options": ["It shows the company total", "It shows Infinity or NaN instead of a blank; write DIVIDE ( [Paid], [Due] )", "Power BI hides the card", "It shows 0 % — fine"], "answer": 1, "explain": "DIVIDE returns blank (or a chosen value) when the denominator is 0 or blank — always DIVIDE for ratios (→ Day 4, 'The first measures')."},
  {"type": "single", "q": "One day of the test shows a lift of +5.2 points. Is that a novelty effect?", "options": ["Yes, if p < 0.05 that day", "No — novelty only exists in social apps", "Yes — it is far above the average", "Not by itself: single days swing by ±3 points; novelty is a pattern of the first days with a mechanism, excluded only as pre-registered"], "answer": 3, "explain": "Calling one high day 'novelty' is a listed deduction; exclusions must follow the pre-registered rule (→ A2 deductions, Day 2 'The daily lift')."}
]}
```

<!-- challenge:start -->

---

## Daily challenge

A bonus for the curious: one harder question on today's topic. Solve it for XP that grows with your challenge streak — a full week of five also adds 10 % to Friday's voucher.

The editor below runs Python in this page. This block loads the data and Day 2's `with_conversion` — run it first, then clean and test in the editor:

```python
import pandas as pd
from math import sqrt
from statistics import NormalDist
users  = pd.read_csv("data/ab/users.csv", parse_dates=["assigned_at"])
events = pd.read_csv("data/ab/events.csv", parse_dates=["event_time"])

def with_conversion(users, events, window_days=7):
    first = users.groupby("user_id")["assigned_at"].min().rename("first_at").reset_index()
    s = events[events["event_name"] == "contract_signed"].merge(first, on="user_id")
    ok = s[(s["event_time"] >= s["first_at"]) & (s["event_time"] <= s["first_at"] + pd.Timedelta(days=window_days))]
    return users.assign(conv=users["user_id"].isin(ok["user_id"]).astype(int))

dup_ids = users.loc[users["user_id"].duplicated(), "user_id"].unique()
print(len(users), len(events), len(dup_ids))  # 27974 67215 300
```

```challenge
{"id": "w07d5", "q": "Kamola asks whether the verdict depends on the 7-day window. Re-run your clean primary analysis (300 leaked users out, iOS 22–28 Aug out, assigned from 4 Aug) with conversion = contract_signed within 24 hours of assigned_at (with_conversion(users, events, window_days=1)). What is the two-proportion z statistic, B first so that a positive z means B is higher? Give it to 3 decimals.", "type": "number", "dp": 3, "h": ["0d08426d9e74e040b9c26d04"], "hint": "Only the window changes; the cleaning removes the same users as before, so the denominators stay 11 472 and 11 434.", "sol": "eDEgPSB3aXRoX2NvbnZlcnNpb24odXNlcnMsIGV2ZW50cywgd2luZG93X2RheXM9MSkKYzEgPSB4MVt+eDFbInVzZXJfaWQiXS5pc2luKGR1cF9pZHMpXQpjMSA9IGMxW34oKGMxWyJkZXZpY2UiXSA9PSAiaU9TIikgJiAoYzFbImFzc2lnbmVkX2F0Il0gPj0gIjIwMjYtMDgtMjIiKSldCmMxID0gYzFbYzFbImFzc2lnbmVkX2F0Il0gPj0gIjIwMjYtMDgtMDQiXSAgICAgICAgICAgICAgICAgICAgICAgICMgMjIgOTA2IHVzZXJzCmsgPSBjMS5ncm91cGJ5KCJ2YXJpYW50IilbImNvbnYiXS5hZ2coWyJzdW0iLCAic2l6ZSJdKSAgICAgICAgICAgICAjIEEgNjE4IC8gMTEgNDcyIMK3IEIgNjg1IC8gMTEgNDM0CnByb3BvcnRpb25zX3p0ZXN0KGtbInN1bSJdWzo6LTFdLCBrWyJzaXplIl1bOjotMV0pICAgICAgICAgICAgICAgICAgIyB6ID0gMS45NzMsIHAgPSAwLjA0ODUKCnogPSAxLjk3MyAocCA9IDAuMDQ5KTogd2l0aGluIDI0IGhvdXJzIEIgY29udmVydHMgNS45OSAlIGFnYWluc3QgNS4zOSAlIGZvciBBIOKAlCB0aGUgc2FtZSArMTEgJSByZWxhdGl2ZSBsaWZ0IGFzIHRoZSA3LWRheSB3aW5kb3csIGJ1dCBvbiBmZXdlciBjb252ZXJzaW9ucywgc28gaXQgaXMgb25seSBqdXN0IHNpZ25pZmljYW50LgpXaXRoIDIsIDMgYW5kIDcgZGF5cyB0aGUgcC12YWx1ZXMgYXJlIDAuMDMzLCAwLjAxOCBhbmQgMC4wMTY6IHRoZSBkaXJlY3Rpb24gYW5kIHRoZSByZWxhdGl2ZSBzaXplIGRvIG5vdCBkZXBlbmQgb24gdGhlIHdpbmRvdywgdGhlIGNlcnRhaW50eSBkb2VzLgpGb3IgdGhlIG1lbW86IHRoZSBwcmUtcmVnaXN0ZXJlZCA3LWRheSB3aW5kb3cgc3RheXMgdGhlIHByaW1hcnk7IHRoZSAyNC1ob3VyIHZlcnNpb24gaXMgYSBzZW5zaXRpdml0eSBsaW5lIHNob3dpbmcgdGhlIGxpZnQgaXMgYWxyZWFkeSB0aGVyZSBvbiB0aGUgZmlyc3QgZGF5IOKAlCBhbmQgYSByZWFzb24gbmV2ZXIgdG8gc3dhcCB3aW5kb3dzIGFmdGVyIHNlZWluZyB3aGljaCBvbmUgJ3dpbnMnLg==", "python": true}
```

<!-- challenge:end -->
