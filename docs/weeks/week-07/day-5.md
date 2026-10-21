# Week 7 · Day 5 — Checkpoint: A/B notebook + 3-page dashboard

<span class="badge">A/B analysis 120 min</span> <span class="badge">Dashboard 120 min</span> <span class="badge">Interview 30 min</span> <span class="badge hw">Checkpoint · 100 points</span>

> STORY **Friday, 9:00.** Five people, two deliverables. Kamola and Nilufar: *"The readout you showed on Tuesday — now as a notebook anyone can re-run, with the decision memo at the end. If the iOS bug or the leak is not in it, it did not happen."* Bekzod and Timur: *"The board pack: three pages, the numbers from the week-3 tiles, a PDF for the board and the `.pbix` for us. Timur will open it and press Refresh; if anything breaks, it is not done."* Madina: *"And eight questions every analyst interview asks this year. A/B testing and Power BI are on every job advert in this city."*

## Today in 3 lines

- **Part A (40 pts):** `checkpoint_ab.ipynb` from `data/python/week7/checkpoint_ab_template.ipynb` — the full offer-screen analysis on `data/ab/`: sanity checks, novelty, the primary result, funnel and money, the FPD guardrail with unit economics, segments with Holm, and the **decision memo**.
- **Part B (40 pts):** the **3-page Power BI dashboard** (Portfolio, Risk, Collections) on `data/powerbi/` — `nur_dashboard.pbix`, a PDF export, a screenshot of each page; graded by the numbers each card must show.
- **Part C (20 pts):** eight interview questions (SRM, peeking, MDE, guardrails, A/A, `CALCULATE` and filter context, measure vs calculated column, the star schema in Power BI), 3–5 sentences each, in `quiz.md`.

**Rules.** Open book: this week's pages, your notebooks, `data/ab/README.md`, `data/powerbi/README.md`, `measures.dax`. Submit to **`submissions/week-07/day-5/`**: `checkpoint_ab.ipynb` (executed — Kernel → Restart & Run All, then save), `nur_dashboard.pbix`, `nur_dashboard.pdf`, `page1_portfolio.png`, `page2_risk.png`, `page3_collections.png`, `quiz.md`. Also due today: **HW 7.2** in `day-3/`. Closed: the model answers until you submit. Power BI click paths are for the current Desktop release; if a menu has moved in yours, the result is what is graded, not the path.

**Plan for the day.**

| Time | What | Output |
|---|---|---|
| 9:00–9:15 | Read all three parts; open the template; Restart & Run All (the loader asserts 27 974 / 67 215 / 2 583) | a green first cell |
| 9:15–11:15 | Part A, A1 → A6, then the memo | six result cells, six interpretations, one memo |
| 11:15–11:30 | Break; Restart & Run All; save | `checkpoint_ab.ipynb` with outputs |
| 11:30–13:30 | Part B: the three pages on yesterday's model; check every card against the checklist | `.pbix`, PDF, three PNGs |
| 13:30–14:00 | Part C in `quiz.md` | eight answers |
| 14:00–14:15 | The checklist at the end; push to `submissions/week-07/day-5/` | done |

---

## Part A — The offer-screen A/B analysis (120 min, 40 pts)

Every task: code with printed output, then **two sentences** for Kamola (product) and Nilufar (risk). A correct number with no interpretation earns 60 % of the task. Conversion = `contract_signed` within 7 × 24 h of `assigned_at` (the template's `with_conversion`).

### A1. Sanity checks before any result — 8 pts

Rows vs users; SRM overall (rows and users) and by device, week, device × week, with your threshold stated; the hash check; users in both variants. Every problem with its size.

<details><summary>Model answer</summary>

```python
users["user_id"].nunique(), len(users)                                   # 27 674 users, 27 974 rows
dup_ids = users.loc[users["user_id"].duplicated(), "user_id"].unique()    # 300 users, each in A and B
stats.chisquare(users["variant"].value_counts().values).pvalue           # rows 13 845 / 14 129: p = 0.090
ud = users[~users["user_id"].isin(dup_ids)].assign(week=lambda t: (t.assigned_at - pd.Timestamp("2026-08-01")).dt.days // 7 + 1)
stats.chisquare(ud["variant"].value_counts().values).pvalue              # users 13 545 / 13 829: p = 0.086
srm_by(ud, ["device", "week"])                                           # iOS wk4: 537 / 822 (60.5 % B), p = 1.1e-14; all other cells p >= 0.14
expected = users["user_id"].map(lambda u: hash_variant(u, "offer_screen_v2"))
(users["variant"] != expected).sum()                                     # 431 = 300 leak re-assignments + 131 iOS wk4 users logged B, hash A
```

Threshold: p < 0.001 for SRM (many slices are checked). Problems: (1) **300 users in both variants** (600 rows) — removed entirely; (2) **SRM in iOS, 22–28 August**: 1 359 users, 60.5 % B, 131 of them hash-A users logged as B — the cell is removed from both arms (after: 13 008 / 13 007, p = 0.995); device iOS overall (p = 2.2 × 10⁻⁵) and week 4 (p = 0.0019) are the same bug seen through wider slices.

*Interpretation.* The experiment's overall split looked fine (p = 0.09), but 300 users saw both screens and an iOS bug pushed 131 control users into B in the last week; both are removed before any result is read. The iOS client must log assignment failures before the next test, or the same bias will repeat.
</details>

*Deductions seen most often:* SRM checked only overall; the duplicates noticed but only the second row removed; "SRM p = 0.09, so the split is fine"; reweighting the iOS cell instead of removing it; new users p = 0.021 reported as a second problem (it disappears when the iOS cell is removed).

### A2. Novelty — 4 pts

<details><summary>Model answer</summary>

Daily conversion (de-duplicated), B − A on 1–3 August: **+4.0, +2.4, +3.9** points; afterwards single days swing around +1 (±3). Days 1–3 pooled: 8.01 % vs **11.44 %**, +3.44 points, p = 0.0012; from 4 August (clean): +0.88. Weekly (iOS week 4 out): A 8.38 / 8.56 / 7.20 / 7.59 %, B 10.12 / 9.75 / 8.02 / 8.44 %.

*Interpretation.* B's first three days convert 1.4 times as well as A's, then the lift settles at about +0.9 points — a novelty effect the design anticipated. As pre-registered, the primary result uses users assigned from 4 August; the full period is a sensitivity line.
</details>

*Deductions seen most often:* one high day (14 August, +5.2) called novelty; days excluded with no reference to the plan; no chart.

### A3. The primary result — 8 pts

Clean population: conversion per variant, the difference with a 95 % CI, the p-value, the relative lift with its CI; then the same on raw data.

<details><summary>Model answer</summary>

```python
clean = with_conversion(clean_users(users), events)                     # 22 906 users: A 11 472, B 11 434 (SRM p = 0.80)
ab_readout(clean)
# A 915 / 11 472 = 7.98 % · B 1 013 / 11 434 = 8.86 % · diff +0.88 pt (Newcombe +0.16 to +1.60) · z = 2.41, p = 0.0160
# relative +11.1 % (log-ratio CI +2.0 % to +21.0 %)
ab_readout(with_conversion(users, events))
# raw: 8.28 % vs 9.37 % · +1.09 pt (+0.42 to +1.75) · p = 0.0014 · +13.1 % (+4.9 to +22.0)
```

| population | diff (95 % CI) | p | relative |
|---|---|---|---|
| raw | +1.09 (+0.42 to +1.75) | 0.0014 | +13.1 % |
| − leak | +1.11 | 0.0010 | +13.8 % |
| − iOS wk 4 | +1.19 | 0.00059 | +14.9 % |
| **clean** | **+0.88 (+0.16 to +1.60)** | **0.016** | **+11.1 % (+2.0 to +21.0)** |

*Interpretation.* The new screen raises 7-day conversion from 7.98 % to 8.86 % (+0.88 points, 95 % CI +0.16 to +1.60; p = 0.016) — about 9 more contracts per 1 000 viewers. The raw data overstated the lift by a fifth (+1.09 points), mostly through the novelty days; the conclusion holds, but the number to plan with is +0.9 points and the low end of the interval is close to zero.
</details>

*Deductions seen most often:* the relative CI computed by dividing the difference's CI by 7.98 %; z with the arms in the wrong order (negative z for a positive lift, unexplained); no raw-vs-clean comparison; "p = 0.016 means a 98.4 % chance B is better".

### A4. Funnel and money — 6 pts

<details><summary>Model answer</summary>

Funnel (clean): start 33.6 vs 33.7 % (p 0.91); submit 73.4 vs 74.5 % of starters (0.27); approved 39.7 vs 41.6 % of submitted (0.14); signed 88.4 vs 90.1 % of approved (0.17). Principal per loan: A 2 563 847 (median 2 270 000, 993 loans), B 2 494 675 (2 245 000, 1 076); Mann–Whitney **p = 0.32**; bootstrap mean difference **−69 172 (−174 910 to +35 635)**. Disbursed per viewer: A 203 824, B 220 024 (**+7.9 %**), bootstrap CI of the difference −4 423 to +36 856 (203.8 m vs 220.0 m per 1 000 viewers).

*Interpretation.* The lift comes from users finishing an application, not from more users starting one; B's loans may be slightly smaller (−2.7 %, not significant), so the money effect (+7.9 % disbursed per viewer) is smaller than the conversion effect and its interval includes zero. Watch the approval step: a higher approval share in B (p = 0.14) would mean the screen attracts different applicants.
</details>

*Deductions seen most often:* a t-test on principal with "loans are smaller" from p = 0.20; disbursed per viewer averaged over converters only; five funnel p-values read as five findings.

### A5. The guardrail — 8 pts

<details><summary>Model answer</summary>

```python
lc = loans.merge(clean[["user_id", "variant"]], on="user_id").assign(fpd=lambda t: 1 - t.first_instalment_paid_within_30d)
# A 15 / 993 = 1.51 % (Wilson 0.92-2.48) · B 24 / 1 076 = 2.23 % (1.50-3.30)
# z-test p = 0.23 · Fisher p = 0.26 · difference +0.72 pt (Newcombe -0.49 to +1.94)
# power for a true +0.72 pt at these n: 23 % · loans per arm for 80 % power: 5 508 (~65 000 users per arm)
```

Unit economics (interest 9.86 % of principal, LGD 60 %, FPD ≈ PD): per 1 000 viewers **A 17 996 742**, **B 18 339 646** (+1.9 %); break-even FPD for B **2.45 %** = A + **0.94** points; at the CI's upper end (3.45 %) B makes 16 454 966 (−8.6 % vs A).

*Interpretation.* B's FPD is 0.7 points higher, within chance, but the test had only 23 % power, and the interval reaches +1.9 points — beyond the +0.94-point break-even at which B stops paying for itself. The guardrail is therefore unresolved, not passed: B can ship only with FPD monitored against a hold-out.
</details>

*Deductions seen most often:* "FPD not significant — guardrail passed"; FPD on all loans including the leaked users (raw: 19 / 1 206 vs 35 / 1 377, p = 0.087 — a different, contaminated answer); no power statement; the break-even from Day 1 (+1.25) copied without recomputing with the observed principal.

### A6. Segments — 6 pts

<details><summary>Model answer</summary>

| segment | lift (pt) | p | Holm |
|---|---|---|---|
| Android | +0.87 | 0.030 | 0.21 |
| iOS | +0.94 | 0.31 | 0.61 |
| new | +0.85 | 0.093 | 0.37 |
| returning | +0.96 | 0.068 | 0.34 |
| affluent | +1.71 | 0.047 | 0.28 |
| mass | +0.63 | 0.17 | 0.52 |
| sme | +0.87 | 0.30 | 0.61 |

Interaction new vs returning: z = −0.15, **p = 0.88**.

*Interpretation.* The lift is positive in all seven pre-registered segments and none differs significantly after Holm; there is no evidence that the screen works better for one group. The affluent result (+1.7, raw p = 0.047) is the largest of seven comparisons and does not survive correction — it is not a targeting recommendation.
</details>

*Deductions seen most often:* no correction; "works on Android, not on iOS"; segments invented after looking (region, by day of week) presented as pre-registered.

### The decision memo (inside the 40 points)

<details><summary>Model answer</summary>

**Decision: ship B in stages.** B converts better by about +0.9 points; its effect on first-payment defaults is unknown and could cancel the gain, so 10 % of users stay on A until FPD can be read.

| Line | Text |
|---|---|
| Hypothesis | A single button and the monthly payment in large type make more offer viewers sign a contract. |
| Design | User-level 50/50 hash split (`offer_screen_v2`), 1–28 Aug 2026; primary = signed within 7 days; α 5 % two-sided; MDE +0.9 pt; ~14 000 per arm (power 77 %). |
| Sanity checks | 300 users in both variants removed; iOS 22–28 Aug SRM (537 / 822, p ≈ 10⁻¹⁴, client bug) removed from both arms; novelty days 1–3 Aug excluded as planned. Clean: 11 472 / 11 434, SRM p = 0.80. |
| Primary | 7.98 % → 8.86 %: +0.88 pt (95 % CI +0.16 to +1.60), p = 0.016; +11 % relative (+2 % to +21 %). Raw would have said +1.09. |
| Guardrails | FPD 1.51 % → 2.23 % (+0.72, CI −0.49 to +1.94, p = 0.23, power 23 %); break-even +0.94 pt — unresolved. Principal −2.7 % (p = 0.32). Disbursed per viewer +7.9 % (CI includes 0). |
| Segments | All seven positive, none after Holm; no interaction (p = 0.88). |
| Decision and conditions | Roll out to 90 %, keep a 10 % hold-out on A for ten weeks; roll back if B's FPD exceeds A's by more than 0.94 pt once ≥ 2 000 B loans have matured. |
| Learned / next | The lift is in finishing, not starting; novelty lasts ~3 days in this app; fix iOS assignment logging; next test: the submit step (where B helped). |
</details>

**If you are stuck (hints, not answers).**

- A1: `users["user_id"].duplicated(keep=False)`; your Day-2 `srm_by` on `["device", "week"]`; Day 1's `hash_variant` with the salt from `data/ab/README.md` — Day 2, Step 1.
- A2: `groupby([assigned_at.dt.date, "variant"])["conv"].mean().unstack()`, then a line chart — Day 2, Step 1d, P5.
- A3: your `clean_users` and `ab_readout`; `compare="ratio", method="log"` for the relative CI — Day 2, worked example.
- A4: one `isin` per event name for the funnel; `stats.mannwhitneyu`; a bootstrap loop with `default_rng(2026)` — Day 2, P7–P8.
- A5: `proportion_confint(..., method="wilson")`, `NormalIndPower().power(...)`, `zt_ind_solve_power(...)`; the break-even formula from Day 1's Company corner with today's principal — Day 2, P9 and P11.
- A6: a loop over three columns, then `multipletests(p, method="holm")`; the interaction as a z on the difference of two differences — Day 2, P10.

---

## Warm-up (not graded, 10 min) — six quick checks

1. An experiment ends with 14 050 users in A and 13 950 in B. SRM?
2. Kamola wants to detect +0.5 points on 8 % with 1 000 users a day. How long, and what do you tell her?
3. Your A/A test gives p = 0.03 once. Is the system broken?
4. A card shows Outstanding = 1 527 946 681 726. What happened in Power Query?
5. `YTD Disbursed` at September 2026 is 161 480 300 000. What does it show at October 2026, and why so little more?
6. 8.0 % → 8.9 %: the absolute and the relative lift.

<details><summary>Answers</summary>

1. `stats.chisquare([14050, 13950])` → p = **0.55**: no evidence of a mismatch (and still check by slice).
2. **47 519 users per arm**, 95 days at 1 000 a day — over three months; tell her the test can see +0.9 points in a month, or that a +0.5 effect needs a bigger audience or a more sensitive metric.
3. Not by itself — one A/A in twenty is "significant" by chance. Re-run the analysis on many random re-splits (ours: 4.0 % below 0.05, uniform p-values) and check the SRM; a broken system fails repeatedly.
4. Payments (or instalments) were merged onto loans with `outstanding` expanded: each loan's balance was repeated once per payment (×7.3). Remove the merge; relate both facts to the dimensions.
5. **162 333 060 000** — October has only one day of data (21 loans, 852 760 000) because the as-of date is 1 October.
6. **+0.9 points** absolute, **+11.25 %** relative (0.9 / 8.0). Always say which; "+11 %" and "+0.9 %" are different claims.
</details>

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
| | Outstanding by product with share | SME **60.32 %** … MICRO 0.46 % | 2 |
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
| All | Files: `.pbix` refreshes on Timur's PC (relative folder or a parameter), PDF, three PNGs | | 4 |
| All | Model hygiene: star, single direction, date table marked, no (Blank) segment | | 3 |
| | | **total** | **40** |

*Spot checks the reviewer will make after Refresh:* product slicer SME → Outstanding **125 892 942 411**, PAR30 **2.55 %**, `Dynamic Title` *"Outstanding - Small business loan · as of 1 Oct 2026: 125.9 bn soum"*; branch slicer Bukhara Central → Outstanding **15 116 046 338**, PAR30 **4.81 %**, collection rate Sep **92.31 %**; month slicer Aug 2026 on page 1 → Disbursed **22 290 210 000**.

*Deductions seen most often:* the as-of `Outstanding` on a monthly trend line (it is dated by disbursement); Month-End summed over the year; FPD by vintage including August 2026 (11 loans, 0 %); a pie with five products; red used as a series colour; a slicer that does not reach the Collections page; an absolute file path, so the refresh fails elsewhere.

**If you are stuck (hints).** Build page 1 completely before starting page 2 — copy the page (right-click its tab → Duplicate) to keep the top strip. A card shows the wrong number → check the slicers on the page and *Edit interactions* first, then the measure's filter context (Day 4, P3), then the relationship (Day 3, P6). Month-end trend → `Outstanding Month-End` and a visual filter `year_month` ≤ 2026-09. Top N → the Filters pane on the table visual, *Filter type: Top N*, by `Actions`. PDF export exports what is on screen: clear the slicers first.

**No work account?** Then the `.pbix` and the PDF *are* the publication — say so in a one-line `README.md` in the folder. If you do have one: publish to a workspace, set a scheduled refresh (it needs a gateway for files on your PC) and add the link to the README — a bonus mention, no points.

---

## Part C — Eight interview questions (30 min, 20 pts)

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

---

## Before you submit

- [ ] `checkpoint_ab.ipynb`: Restart & Run All finishes with no red cell; saved after the run; every task prints its numbers.
- [ ] A1 names all three problems with their sizes; A3 shows clean and raw side by side; A5 states the power and the break-even; A6 has Holm.
- [ ] The memo starts with one decision word and states its conditions as numbers.
- [ ] `nur_dashboard.pbix` refreshes from a folder path someone else can change (a parameter or a relative location noted in the README); the three pages match the checklist with no slicer selected.
- [ ] `nur_dashboard.pdf` and three PNGs; every page shows "Data as of 1 Oct 2026" and a definitions line.
- [ ] `quiz.md` has eight answers with at least four numbers from this week.
- [ ] A one-line `README.md` says how the dashboard was shared (`.pbix` + PDF, or a Service link) and which Desktop version you used.
- [ ] HW 7.2 (model screenshot + six measures) is in `submissions/week-07/day-3/`.

---

## Scoring and what happens next

| Part | Points | What earns them |
|---|---|---|
| A — A/B analysis | 40 | per task: correct method and numbers (60 %), two-sentence interpretation that says what to do (40 %); the memo is part of A3–A6's interpretation marks |
| B — dashboard | 40 | the checklist above |
| C — interview | 20 | 2.5 per answer: correct, in your words, with a number or example |

**70 points** to move on. Below 70, the feedback lists the sections to redo. Points go to `docs/progress.md`. Next week, the last: **product analytics** (funnels, cohorts, retention, unit economics) on the app events, and the **capstone** — three days, one dataset, a decision for Nur's management, and a mock interview.

**Week 7 in five sentences** (what you can now say in any meeting):

1. "Before/after is not an experiment; a 50/50 hash split over the same weeks is — 14 983 users per arm for +0.9 points."
2. "The split looked fine overall and was 60/40 in iOS last week — check the sample ratio by slice before reading any result."
3. "The new screen adds +0.88 points (CI +0.16 to +1.60), not the +1.09 the dashboard showed; the first three days were novelty."
4. "FPD +0.7 points with 23 % power is unknown, not safe — ship with a hold-out."
5. "One model, one definition per measure, refreshed from the views: PAR30 is 3.12 % on the card, in the SQL and in the PDF."

<span class="badge stretch">Stretch</span> Write `nur_ab.py` with `readout(users, events, window_days=7, exclude=None)` (sanity checks + primary + relative lift, returning a one-row DataFrame) and `guardrail(loans, users, break_even_pt)` (rates, test, CI, power, verdict "pass / fail / unresolved"). Run both on the clean population and on the raw data and paste the two rows into your memo. Then add a fourth page to the dashboard: **Experiments**, with `users.csv` and `loans_followup.csv` loaded, a measure `Conversion 7d` and a line of daily conversion by variant — the novelty spike, visible to Kamola without Python.

---

## Day quiz

Pass with 80 % to finish the day. Retry as often as you like.

```quiz
{"id": "w07d5", "pass": 0.8, "questions": [
  {"type": "single", "q": "B vs A gives p = 0.016. Which reading is right?", "options": ["If the screens did not differ, a gap at least this large would appear in about 1.6 % of experiments of this size", "B is 1.6 % better", "1.6 % of users prefer A", "There is a 98.4 % chance that B is better"], "answer": 0, "explain": "The p-value is computed assuming no difference; it is not the probability that B is better (→ A3 deductions, week 6 Day 3)."},
  {"type": "single", "q": "Some users were assigned to both arms. What do you do with them?", "options": ["Keep their first assignment", "Keep them — they are only 1 %", "Remove only their second row", "Remove every row of those users and report how many"], "answer": 3, "explain": "After the second assignment their outcome comes from a mix of A and B; they belong to neither arm (→ A1 deductions, Day 2 'Step 1a')."},
  {"type": "single", "q": "Why a strict SRM threshold such as p < 0.001?", "options": ["The regulator requires it", "SRM is checked on many slices; a strict threshold keeps false alarms rare, and an alarm means a search for the bug", "0.05 is for A/A tests only", "The arms are large"], "answer": 1, "explain": "Many checks at 5 % would always raise something; the response to a real alarm is finding the cause, not reweighting (→ A1, Day 1 'SRM')."},
  {"type": "single", "q": "B converts better, yet z is negative. Why?", "code": "z, p = proportions_ztest([conv_A, conv_B], [n_A, n_B])\n# z = -2.41", "options": ["A negative z means B is worse", "The p-value must be halved", "A is listed first, so z measures A − B; put B first or say which order you used", "The test is broken"], "answer": 2, "explain": "An unexplained sign is a deduction; the worked example lists B first so that z > 0 means B is higher (→ A3 deductions)."},
  {"type": "number", "q": "Conversion goes from 8.0 % to 8.9 %. What is the relative lift, in %?", "answer": 11.25, "tol": 0.05, "explain": "0.9 / 8.0 = 11.25 % relative; the absolute lift is +0.9 points — always say which (→ Warm-up 6)."},
  {"type": "multi", "q": "Which are correct practices for the Part B dashboard?", "options": ["Put the as-of Outstanding measure on the monthly trend line", "Point the source at a parameter or a relative folder so the refresh works on Timur's PC", "Sum Outstanding Month-End over the year", "A pie chart of the five products", "'Data as of 1 Oct 2026' and a definitions line on every page", "Hide FPD vintages with fewer than 50 loans in scope"], "answer": [1, 4, 5], "explain": "The as-of Outstanding is dated by disbursement, month-end balances are not added, and a pie of five slices breaks the chart rules (→ Part B deductions)."},
  {"type": "single", "q": "What happens on a card when [Due] is 0 or blank, and what should you write instead?", "code": "Collection Rate = [Paid] / [Due]", "options": ["It shows the company total", "It shows Infinity or NaN instead of a blank; write DIVIDE ( [Paid], [Due] )", "Power BI hides the card", "It shows 0 % — fine"], "answer": 1, "explain": "DIVIDE returns blank (or a chosen value) when the denominator is 0 or blank — always DIVIDE for ratios (→ Day 4, 'DIVIDE and VAR … RETURN')."},
  {"type": "single", "q": "One day of the test shows a lift of +5.2 points. Is that a novelty effect?", "options": ["Yes, if p < 0.05 that day", "No — novelty only exists in social apps", "Yes — it is far above the average", "Not by itself: single days swing by ±3 points; novelty is a pattern of the first days with a mechanism, excluded only as pre-registered"], "answer": 3, "explain": "Calling one high day 'novelty' is a listed deduction; exclusions must follow the pre-registered rule (→ A2 deductions, Day 2 'Step 1d')."}
]}
```

<!-- challenge:start -->

---

## Daily challenge

A bonus for the curious: one harder question on today's topic. Solve it for XP that grows with your challenge streak — a full week of five also adds 10 % to Friday's voucher.

```challenge
{"id": "w07d5", "q": "Kamola asks whether the verdict depends on the 7-day window. Re-run your clean primary analysis (300 leaked users out, iOS 22–28 Aug out, assigned from 4 Aug) with conversion = contract_signed within 24 hours of assigned_at (with_conversion(users, events, window_days=1)). What is the two-proportion z statistic, B first so that a positive z means B is higher? Give it to 3 decimals.", "type": "number", "dp": 3, "h": ["0d08426d9e74e040b9c26d04"], "hint": "Only the window changes; the cleaning removes the same users as before, so the denominators stay 11 472 and 11 434.", "sol": "eDEgPSB3aXRoX2NvbnZlcnNpb24odXNlcnMsIGV2ZW50cywgd2luZG93X2RheXM9MSkKYzEgPSB4MVt+eDFbInVzZXJfaWQiXS5pc2luKGR1cF9pZHMpXQpjMSA9IGMxW34oKGMxWyJkZXZpY2UiXSA9PSAiaU9TIikgJiAoYzFbImFzc2lnbmVkX2F0Il0gPj0gIjIwMjYtMDgtMjIiKSldCmMxID0gYzFbYzFbImFzc2lnbmVkX2F0Il0gPj0gIjIwMjYtMDgtMDQiXSAgICAgICAgICAgICAgICAgICAgICAgICMgMjIgOTA2IHVzZXJzCmsgPSBjMS5ncm91cGJ5KCJ2YXJpYW50IilbImNvbnYiXS5hZ2coWyJzdW0iLCAic2l6ZSJdKSAgICAgICAgICAgICAjIEEgNjE4IC8gMTEgNDcyIMK3IEIgNjg1IC8gMTEgNDM0CnByb3BvcnRpb25zX3p0ZXN0KGtbInN1bSJdWzo6LTFdLCBrWyJzaXplIl1bOjotMV0pICAgICAgICAgICAgICAgICAgIyB6ID0gMS45NzMsIHAgPSAwLjA0ODUKCnogPSAxLjk3MyAocCA9IDAuMDQ5KTogd2l0aGluIDI0IGhvdXJzIEIgY29udmVydHMgNS45OSAlIGFnYWluc3QgNS4zOSAlIGZvciBBIOKAlCB0aGUgc2FtZSArMTEgJSByZWxhdGl2ZSBsaWZ0IGFzIHRoZSA3LWRheSB3aW5kb3csIGJ1dCBvbiBmZXdlciBjb252ZXJzaW9ucywgc28gaXQgaXMgb25seSBqdXN0IHNpZ25pZmljYW50LgpXaXRoIDIsIDMgYW5kIDcgZGF5cyB0aGUgcC12YWx1ZXMgYXJlIDAuMDMzLCAwLjAxOCBhbmQgMC4wMTY6IHRoZSBkaXJlY3Rpb24gYW5kIHRoZSByZWxhdGl2ZSBzaXplIGRvIG5vdCBkZXBlbmQgb24gdGhlIHdpbmRvdywgdGhlIGNlcnRhaW50eSBkb2VzLgpGb3IgdGhlIG1lbW86IHRoZSBwcmUtcmVnaXN0ZXJlZCA3LWRheSB3aW5kb3cgc3RheXMgdGhlIHByaW1hcnk7IHRoZSAyNC1ob3VyIHZlcnNpb24gaXMgYSBzZW5zaXRpdml0eSBsaW5lIHNob3dpbmcgdGhlIGxpZnQgaXMgYWxyZWFkeSB0aGVyZSBvbiB0aGUgZmlyc3QgZGF5IOKAlCBhbmQgYSByZWFzb24gbmV2ZXIgdG8gc3dhcCB3aW5kb3dzIGFmdGVyIHNlZWluZyB3aGljaCBvbmUgJ3dpbnMnLg=="}
```

<!-- challenge:end -->
