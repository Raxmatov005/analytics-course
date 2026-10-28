# Week 6 · Day 5 — Checkpoint: intervals and the test-choice quiz

<span class="badge">Analyses 120 min</span> <span class="badge">Quiz 45 min</span> <span class="badge">Interview 30 min</span> <span class="badge hw">Checkpoint · 100 points</span>

> STORY **Friday, 9:00.** Madina, Nilufar and Jasur. Madina: *"This week you learned to say how sure you are. Today you prove it: five analyses on our own data, each with a number, an interval or a p-value, and two sentences a risk manager can repeat. Then twelve situations — you name the test before you touch the data. Then the questions every analyst interview asks about p-values."* Nilufar: *"And the committee note went down well. The committee asked for the same discipline on every number. That starts with you."* Jasur: *"No p-value without its effect size. I will check."*

## Today in 3 lines

- **Part A (50 pts):** `checkpoint.ipynb` from `data/python/week6/checkpoint_template.ipynb` — five analyses on Nur data (a t interval, Wilson intervals, a proportions test, a Mann–Whitney test, a power calculation), each with the result printed and a two-sentence interpretation.
- **Part B (30 pts):** the test-choice quiz — twelve short scenarios; for each, the test and one line of why.
- **Part C (20 pts):** eight interview questions, 3–5 sentences each. Parts B and C go into `quiz.md`.

**Rules.** Open book: this week's pages, your notebooks, the reference card (Day 4, section 2). Hand in with the **📎 box at the end of this page**: `checkpoint.ipynb` (executed — Kernel → Restart & Run All, then save) and `quiz.md`. Also due today: **HW 6.2**, in [Day 2's hand-in box](weeks/week-06/day-2.md). Data as of **2026-10-01**; the template's loader builds `loans`, `f` (FPD30 loans), `x` (52 850 clean payments with `days_late` and `late`) and `apps`. Closed: the model answers until you submit.

**What every Part A answer contains** (graded): the grain in a comment; the code; the output (numbers visible in the saved notebook); the method named (t, Wilson, z, Mann–Whitney, Cohen's h); and **two sentences**: what the number says, and what someone should do or not do with it. A correct number with no interpretation earns 6 of 10.

> 💡 **Key idea.** An answer this week has three parts: the number, how sure you are of it (interval or p-value, with the method named), and what someone should do with it. Drop any one and the reader cannot act.

**Plan for the day.**

| Time | What | Output |
|---|---|---|
| 9:00–9:15 | Read all three parts; open the template; Restart & Run All (the loader asserts 7 828 / 7 099 / 91 / 52 850) | a green first cell |
| 9:15–11:15 | Part A, A1 → A5, 20–25 min each | five result cells, five interpretations |
| 11:15–11:30 | Break; Restart & Run All; save; then the warm-up below Part A (six quick checks, not graded) | `checkpoint.ipynb` with outputs |
| 11:30–12:15 | Part B in `quiz.md` — name the test before you look anything up, then check the Day 4 card | twelve lines |
| 12:15–12:45 | Part C in `quiz.md` | eight short answers |
| 12:45–13:00 | The checklist at the end; hand in (box below) | done |

**The shape of one Part A answer** (Day 3's committee habit, shortened):

```python
# (shape only — not meant to run)
# A0 (example). FPD30, app vs branch — grain: one loan in FPD scope (f, 7 099
# rows)
k = f.groupby("channel")["fpd30"].agg(["sum", "size"]).loc[["app", "branch"]]
# (2.147, 0.0318)
print(proportions_ztest(k["sum"], k["size"]))
# (+0.0005, +0.0133)
print(confint_proportions_2indep(41, 2411, 34, 3263, method="newcomb"))
```

> **Interpretation.** App FPD30 is 1.70 % vs 1.04 % for branch (+0.66 points, 95 % CI +0.05 to +1.33; z-test p = 0.032), about 7 extra first-payment defaults per 1 000 loans. The gap is real at 5 % but small in money and confounded with product, so it supports a cheap fix and a re-test, not closing the channel.

Two sentences: the number with its uncertainty and test, then what it means for a decision. Nothing about "the null hypothesis is rejected" without saying which hypothesis, in business words.

Put the parts of one answer cell in the order a reviewer reads them:

```game
{"type": "order", "id": "w06d5-g1", "title": "One Part A answer", "items": ["A comment with the grain (one row = one loan / one payment)", "The code", "The printed output — numbers visible in the saved notebook", "The method named (t, Wilson, z, Mann–Whitney, Cohen's h)", "Sentence 1: the number with its uncertainty", "Sentence 2: what someone should do — or not do — with it"], "why": "The grain first, because every number depends on it; the decision last, because that is what the reader came for."}
```

One sentence of this A0 write-up would lose points — tap it:

```game
{"type": "bug", "id": "w06d5-g2", "title": "Spot the deduction", "q": "One line would cost points.", "code": "# A0. FPD30, app vs branch — grain: one loan in FPD scope (7 099 rows)\nApp FPD30 is 1.70 % vs 1.04 % for branch (+0.66 points, 95 % CI +0.05 to +1.33).\nTwo-sided two-proportion z-test: z = 2.15, p = 0.032.\nSo the probability that app is no worse than branch is only 3.2 %.\nAbout 7 extra FPDs per 1 000 loans: a cheap fix and a re-test, not closing the channel.", "answer": [3], "why": "The p-value is computed assuming H₀; it is not the probability that H₀ is true."}
```

---

## Part A — Five analyses on Nur data (120 min, 50 pts)

### A1. CI for the average principal by product (t interval) — 10 pts

- **Data.** `loans` — one row per loan (7 828), grouped by product (`code`).
- **Do.** For each of the five products: n, mean, sd (ddof = 1), the 95 % t interval, and the half-width as % of the mean.
- **Answer.** Which product's average do you know least precisely, and why — n or sd? In the box: that product's half-width as % of its mean, to 2 decimals.
- **Taught in.** Day 2, "Confidence interval for a mean — t, not z".

```task
{"id": "w06d5-a1", "kind": "number", "answer": 4.46, "dp": 2, "unit": "% of the mean (AUTO half-width)", "hint": "Half-width = t(0.975, n − 1) × s / √n, with s from ddof = 1; divide by the mean. Day 2, 'Confidence interval for a mean'."}
```

<details><summary>Model answer (open after submitting)</summary>

```python
# (shape only — not meant to run)
# grain: one row per loan (7 828)
rows = []
for code_, g in loans.groupby("code"):
    v = g["principal"].astype(float)
    m, s, n = v.mean(), v.std(ddof=1), len(v)
    lo, hi = stats.t.interval(0.95, n - 1, loc=m, scale=s / np.sqrt(n))
    rows.append([code_, n, m, s, lo, hi, 100 * (hi - lo) / 2 / m])
a1 = pd.DataFrame(rows, columns=["product", "n", "mean", "sd", "ci_lo", "ci_hi", "half_width_pct"]).set_index("product")
#          n         mean           sd        ci_lo        ci_hi  half_width_pct
# AUTO   391  216 858 133   97 345 745  207 179 221  226 537 045            4.46
# BNPL  1569    4 170 880    2 213 122    4 061 288    4 280 471            2.63
# CONS  2418   26 926 915   13 610 482   26 384 151   27 469 679            2.02
# MICRO 2669    2 705 586    1 322 842    2 655 378    2 755 795            1.86
# SME    781  308 728 745  165 524 606  297 101 962  320 355 528            3.77
```

*Interpretation.* Auto's average ticket is known least precisely (±4.5 %, 207–227 m) because it has the fewest loans (391) with a wide spread (sd 45 % of the mean); SME's sd is even larger relative to its mean (54 %) but its 781 loans buy back precision (±3.8 %). For pricing and limits these intervals are narrow enough to use the averages as they are; for a monthly Auto figure (≈ 20 loans) the interval would be about four times wider, so report it with n.

</details>

*Deductions seen most often:* `std()` from numpy (ddof 0) instead of `ddof=1`; a z value instead of t; the half-width given in soum only, so products cannot be compared; "Auto is least precise because its loans are big" (it is n and the relative spread, not the size).

### A2. CI for the approval rate by channel (Wilson) — 10 pts

- **Data.** `apps` — one row per application; keep the **decided** ones (status ≠ `cancelled`, 12 183 rows).
- **Do.** Approved = status starting with `approved`. Per channel: approved, decided, the rate and its Wilson 95 % interval.
- **Answer.** Do the app and branch intervals overlap, and what does that say about the gap? In the box: the app's lower Wilson limit, in % to 2 decimals.
- **Taught in.** Day 2, "The Wilson interval — the right default for a rate" and the Worked example.

```task
{"id": "w06d5-a2", "kind": "number", "answer": 66.79, "dp": 2, "unit": "% (lower Wilson limit, app)", "hint": "Denominator: decided applications only (status ≠ cancelled); numerator: status starting with 'approved'. Day 2, worked example."}
```

<details><summary>Model answer (open after submitting)</summary>

```python
# (shape only — not meant to run)
# grain: one row per application (14 000); decided = not cancelled (12 183)
d = apps[apps["status"] != "cancelled"].assign(approved=lambda t: t["status"].str.startswith("approved").astype(int))
a2 = d.groupby("channel")["approved"].agg(approved="sum", decided="size")
a2["rate"] = a2["approved"] / a2["decided"]
a2[["wilson_lo", "wilson_hi"]] = [proportion_confint(k, n, method="wilson") for k, n in zip(a2["approved"], a2["decided"])]
#          approved  decided   rate  wilson_lo  wilson_hi      (in %)
# app          2915     4274  68.20      66.79      69.58
# branch       3965     5478  72.38      71.18      73.55
# partner      1715     2431  70.55      68.70      72.33
```

*Interpretation.* The app approves 68.2 % of decided applications (95 % CI 66.8–69.6 %) against the branch's 72.4 % (71.2–73.6 %); the intervals do not overlap, so the 4-point gap is not sampling noise — it is policy (no officer to argue a borderline case) or mix (Micro applicants). Partner sits between and overlaps both; the dashboard should show all three with their intervals, and the 4-point gap is worth a look at the app's automated cut-offs.

</details>

*Deductions seen most often:* cancelled applications left in the denominator (that gives 58.2 / 63.7 / 61.9 % — say which convention you use); `approved_not_disbursed` counted as not approved; a Wald interval; "they do not overlap, so app is worse" without a word on why.

**Excel cross-check (optional).** A1: `=AVERAGE(r)`, `=STDEV.S(r)`, `=CONFIDENCE.T(0.05, STDEV.S(r), COUNT(r))` per product from a pivot of `loans_status.csv`. A2: with k in B1, n in B2 and z in B3, the Wilson limits of Day 2's formula; Clopper–Pearson `=BETA.INV(0.025, B1, B2-B1+1)` and `=BETA.INV(0.975, B1+1, B2-B1)` as the conservative check. Matching Python to the third decimal is the point.

### A3. Test: late-payment rate, customer segment sme vs mass — 10 pts

- **Data.** `x` — the 52 850 clean payments; late = paid after the due date. The segment is the customer's (`customers.segment`, reached through `loans.customer_id`).
- **Do.** A two-proportion z-test (or χ² on the 2 × 2), sme vs mass, on payments. Then the loan-level check: any late payment per loan, same test.
- **Answer.** p, the difference in points, the relative risk — and one sentence on what the grain (payments, not loans) does to the test. In the box: z on payments, sme first, to 2 decimals.
- **Taught in.** Day 3, "Test for two proportions — z", and Day 3 P12 (payments vs loans).

```task
{"id": "w06d5-a3", "kind": "number", "answer": 1.26, "dp": 2, "unit": "z (payments, sme − mass)", "hint": "52 850 clean payments; late = paid after the due date; the segment comes through loans.customer_id. The order is sme first. Day 3, P12."}
```

<details><summary>Model answer (open after submitting)</summary>

```python
# (shape only — not meant to run)
# grain: one row per clean payment; sme 11 413, mass 30 601 payments
seg = pd.read_sql("SELECT l.loan_id, c.segment FROM loans l JOIN customers c ON c.customer_id = l.customer_id", con)
xs = x.merge(seg, on="loan_id")
# sme 9 925 / 1 488 · mass 26 752 / 3 849
t = pd.crosstab(xs["segment"], xs["late"]).loc[["sme", "mass"]]
k, n = t[1].to_numpy(), t.sum(axis=1).to_numpy()
# z = 1.26, p = 0.21
proportions_ztest(k, n)
# chi2 = 1.58 (= z²), same p
stats.chi2_contingency(t, correction=False)[:2]
# late share sme 13.04 % · mass 12.58 % · diff +0.46 pp · RR 1.04
# loan level (any late payment): sme 802 / 1 609 = 49.8 % · mass 2 234 / 4 345 =
# 51.4 %; z = -1.08, p = 0.28
```

*Interpretation.* Payments of sme-segment customers are late 13.0 % of the time against 12.6 % for mass customers — +0.46 points, RR 1.04, p = 0.21 — so the data show no difference in lateness between the two segments, and at the loan level the direction even reverses (49.8 % vs 51.4 % of loans with any late payment, p = 0.28). Do not price or limit by customer segment on this evidence; the payment grain could only have overstated a difference, and the loan-level check says there is none to explain — the risk grade (Day 3) is what separates late payers.

</details>

*Deductions seen most often:* raw payments (52 875, with the 25 duplicates) instead of clean ones; "p = 0.21, so the two segments pay exactly the same" (absence of evidence, not proof); no relative risk; the grain sentence missing (payments of one loan are not independent; the loan-level check is the honest version).

### A4. Test: days late, Consumer loans of grade B vs grade C — 10 pts

- **Data.** `x` — the clean payments of Consumer loans (`code == "CONS"`), grade B and grade C.
- **Do.** First the shape of days late per grade: median, mean, skew, share paid late — and one sentence on why not a t-test. Then a two-sided Mann–Whitney U test, grade B first.
- **Answer.** The p-value and the probability of superiority U / (n₁·n₂). In the box: U / (n₁·n₂), to 3 decimals.
- **Taught in.** Day 4, "Mann–Whitney U — two independent groups by ranks", and Day 4 P2.

```task
{"id": "w06d5-a4", "kind": "number", "answer": 0.45, "dp": 3, "unit": "U / (n₁·n₂), grade B first", "hint": "Consumer payments only; stats.mannwhitneyu(grade_B, grade_C, alternative=\"two-sided\"); the order of the samples decides whether you get the number or one minus it. Day 4, P2."}
```

<details><summary>Model answer (open after submitting)</summary>

```python
# (shape only — not meant to run)
# grain: one row per clean payment; Consumer grade B 9 495, grade C 6 155
cb = x.loc[(x.code == "CONS") & (x.risk_grade == "B"), "days_late"]
cc = x.loc[(x.code == "CONS") & (x.risk_grade == "C"), "days_late"]
#              CONS B    CONS C
# median        -1.0      -1.0
# mean         -0.403     0.886
# skew          6.366     4.438
# share late    0.094     0.184
# U = 26 323 435, p = 8.3e-27
u = stats.mannwhitneyu(cb, cc, alternative="two-sided")
u.statistic / (len(cb) * len(cc))  # 0.4504
```

Why not a t-test: days late is heavily right-skewed (skew 4–6) with the same median in both groups, so the mean is driven by a thin tail of very late payments; the question "do grade C Consumer borrowers pay later than grade B?" is about the typical payment, which a rank test answers. (With n in the thousands a Welch test on the means is still *valid* — t = −11.70, p = 2.1 × 10⁻³¹ — it just answers a different question.)

*Interpretation.* Inside the same product, grade C payments tend to arrive later than grade B payments (p ≈ 10⁻²⁶): a random grade-B payment is later than a random grade-C one only 45.0 % of the time, against 50 % for no difference, although both medians are one day early. The scorecard separates lateness even within Consumer loans; the practical gap is the share paid late — 18.4 % vs 9.4 % — which is where an earlier reminder for grade C would act.

</details>

*Deductions seen most often:* "the medians differ" (they are equal); a t-test with no reason given; the effect size missing — a p of 10⁻²⁶ on 15 650 payments says nothing about size without the 45.0 %; all grade B and C payments used instead of the Consumer ones.

### A5. Power: loans needed to detect +2 pp on the app approval rate — 10 pts

- **Data.** The baseline is the app's decided approval rate from A2; `apps` gives the monthly volume of decided app applications in 2026 (whole months only).
- **Do.** Cohen's h for baseline + 2 points; α 0.05 two-sided, power 0.80 → decided applications per arm (round up).
- **Answer.** n per arm, n in total, and how many months of app traffic that is.
- **Taught in.** Day 4, "Power and sample size".

```task
{"id": "w06d5-a5", "kind": "number", "answer": 8362, "dp": 0, "unit": "decided applications per arm", "hint": "p1 = the app's decided approval rate from A2; Cohen's h for p1 + 0.02 vs p1; round up. Day 4, 'Power and sample size'."}
```

<details><summary>Model answer (open after submitting)</summary>

```python
# (shape only — not meant to run)
p1 = 2915 / 4274                          # 68.20 %
h = proportion_effectsize(p1 + 0.02, p1)  # 0.0433
# 8 362 per arm, 16 724 total
n_arm = int(np.ceil(zt_ind_solve_power(effect_size=h, alpha=0.05, power=0.80)))
dec = apps[(apps.channel == "app") & (apps.status != "cancelled")
           # nine full months
           & (apps.applied_at >= "2026-01-01") & (apps.applied_at < "2026-10-01")]
# 183.0 a month → 16 724 / 183.0 ≈ 91 months
dec.groupby(dec.applied_at.dt.to_period("M")).size().mean()
```

*Interpretation.* Detecting a 2-point rise in the app's approval rate (68.2 → 70.2 %) with 80 % power needs 8 362 decided applications per arm — about 91 months of the app's current traffic, so a test of that size is not feasible. With one year of traffic split in two (~1 098 per arm) the smallest detectable change is about +5.4 points; the team should either test a bigger change, pool channels, or accept a monitored rollout instead of a test.

</details>

*Deductions seen most often:* the all-applications rate (58.2 %) as the baseline instead of the decided one; n for both arms reported as "per arm"; a one-sided test without saying so; the one day of October counted as a month; no translation into months — the number that makes the decision.

**If you are stuck (hints, not answers).**

- A1: `loans.groupby("code")["principal"]`, then `stats.t.interval(0.95, n - 1, loc=mean, scale=sd / np.sqrt(n))` per group — Day 2, "Confidence interval for a mean".
- A2: filter `status != "cancelled"` first; `status.str.startswith("approved")` is the numerator; `proportion_confint(..., method="wilson")` — Day 2, worked example.
- A3: the segment comes from `customers` through `loans.customer_id` — merge it onto `x` by `loan_id`; then `pd.crosstab(…, x.late)` on the two segments; for the loan level, `groupby(["loan_id", "segment"]).late.max()` — Day 3, P12.
- A4: filter `x` on `code == "CONS"` and the grade first; describe (`median`, `mean`, `stats.skew`, `(v > 0).mean()`), then `stats.mannwhitneyu(..., alternative="two-sided")` — Day 4, P2.
- A5: your `n_per_arm` from Day 4 works with `p2 = p1 + 0.02`; the months are `2 * n / monthly_volume`, the volume from whole months only — Day 4, Company corner.

---

## Warm-up (not graded, 10 min) — six quick checks

A break between Part A and Part B: the statistics lessons of the RU decks end with short quizzes, and here are their best ideas, on our data. Six questions, one at a time; the fold below has the longer answers.

```check
{"id": "w06d5-sc", "questions": [
  {"type": "single", "q": "The average Micro ticket is 2.71 m soum (sd 1.32 m). One Micro loan is 4.99 m. Is it an outlier?", "options": ["Yes — it is far above the mean", "Not from the mean alone: z = 1.73 is ordinary, and 4.99 m is just under the 5 m product limit — find out what it is before removing anything", "Yes, because Micro tickets are skewed", "Only if Shapiro–Wilk rejects"], "answer": 1, "explain": "Never delete by a z-score alone; a limit, a data error and a real large loan need different treatment."},
  {"type": "number", "q": "Applicants' scores are close to normal, mean 659.6, sd 59.5. Roughly what share score 780 or more, in %?", "answer": 2.2, "tol": 0.2, "explain": "z = (780 − 659.6) / 59.5 = 2.02 → 1 − Φ(2.02) = 2.2 %; the data say 2.0 %."},
  {"type": "single", "q": "Shapiro–Wilk on 500 app principals gives p ≈ 10⁻¹². Does that forbid a t-test on the mean of all 2 669 app principals?", "options": ["Yes — the data are not normal", "No — the t-test needs the sample MEAN to be near normal, which the CLT gives at n = 2 669", "Only if the variances differ", "Yes, unless you drop the outliers"], "answer": 1, "explain": "Normality of the statistic, not of the data (Day 3, 'Checking assumptions')."},
  {"type": "single", "q": "If you take bigger samples, the spread of the sample means…", "options": ["grows like √n", "stays the same", "shrinks like σ / √n", "shrinks like σ / n"], "answer": 2, "explain": "Day 2's table: 49 m at n = 5, 3.3 m at n = 1 000."},
  {"type": "single", "q": "What does a Mann–Whitney test work with, and what is its H₀?", "options": ["Means; H₀: equal means", "Ranks; H₀: both samples come from the same distribution (P(X > Y) = ½)", "Medians; H₀: equal medians", "Counts; H₀: independence"], "answer": 1, "explain": "Ranks, not values — and it is not a test of medians unless the shapes are identical."},
  {"type": "single", "q": "What does an A/A test check?", "options": ["Whether variant A beats variant B", "The experiment system — the split, the logging, the metric pipeline and the test itself", "The power of the test", "Whether the metric is normal"], "answer": 1, "explain": "Two groups with the same treatment should differ 'significantly' about 5 % of the time (our split: 4.9 %)."}
]}
```

<details><summary>Answers</summary>

1. You cannot tell from the mean alone — you need the spread. sd = 1.32 m, so z = (4.99 − 2.71) / 1.32 = **1.73**: not unusual, and 4.99 m is simply the product limit (5 m). Before removing any "outlier", find out what it is (a limit, a data error, a real large loan) — never delete by a z-score alone.
2. z = (780 − 659.6) / 59.5 = 2.02 → `stats.norm.sf(780, 659.6, 59.5)` = **2.2 %**; the data say 2.0 %. (z = 0 would mean the score equals the mean.)
3. Scores: no evidence against normality (p = 0.09). Principals: clearly not normal (they are spread flat between the product limits). It does **not** forbid a t-test on their mean: the requirement is that the *sample mean* is approximately normal, which the CLT gives at n = 2 669.
4. It shrinks like σ/√n: large deviations of the sample mean from the true mean become rarer — the distribution of sample means gets narrower (Day 2's table: 49 m at n = 5, 3.3 m at n = 1 000).
5. With **ranks**, not values; H₀: both samples come from the same distribution (P(X > Y) = ½). Micro vs BNPL days late: p = 1.1 × 10⁻⁸.
6. The experiment **system** — the random split, the logging, the metric pipeline, the test itself: two groups with the same treatment should differ "significantly" about 5 % of the time (our split: 4.9 %).

</details>

---

## Part B — The test-choice quiz (45 min, 30 pts)

- **Do.** For each of the twelve scenarios, name **the test** — plus the correction or the follow-up, if one is needed.
- **Write.** One line of **why**: the outcome type (number or yes/no), the number of groups, paired or not, and what breaks the default test.
- **Where.** `quiz.md`, one line per scenario: `1. Test: … — Why: …`.
- **Points.** 2.5 each: the right test 1.5, the reason 1.

> ⚠️ **Watch out.** Name the test *before* you open the Day 4 card — the card is for checking your choice, not for making it. And watch for the two traps the scenarios hide: the same units measured twice (paired), and many tests at once (a correction).

1. Compare the average ticket across the five products.
2. Is FPD30 independent of the customer's region (eight regions)?
3. Forty collectors used the old call script in August and the new one in September; compare each collector's promise-to-pay rate before and after.
4. A pilot branch opened in June: 3 FPDs in its first 60 loans. Is it worse than the book (1.28 %)?
5. Do app applicants have a different average credit score from branch applicants (4 874 vs 6 049 scores)?
6. Does a typical Micro payment arrive later than a typical BNPL payment (days late per payment)?
7. The same 500 applications were scored by the old and the new scorecard; each gives approve / reject. Does the new one approve more?
8. Two collection strategies, 300 delinquent loans each: compare the collection rate Σ paid / Σ due.
9. Is a higher credit score associated with fewer days late (per loan, average days late)?
10. Timur's dashboard has 25 KPIs; he tests each month-on-month change at 5 % and colours the "significant" ones red.
11. Marketing will test a new app screen on approval rate next month. What do you do before the test starts?
12. Three call-centre scripts, ~400 calls each; outcome: promise to pay yes/no. Which script is best?

<details><summary>Model answers (open after submitting)</summary>

1. **Kruskal–Wallis** (or one-way ANOVA on log-ticket), then pairwise Mann–Whitney with **Holm**. *Why:* a number, five independent groups, money heavily skewed with very different spreads per product. *Trap:* the omnibus test only says "some differ"; and tickets differ by product design (limits 0.5–600 m), so the test is a formality — the useful output is each product's interval (A1).
2. **χ² test of independence** on the 8 × 2 region × FPD table. *Why:* two categorical variables, independent loans. *Trap:* at 1.28 % a region needs about 400 loans for an expected 5 FPDs — check `expected`, pool small regions, or use a permutation χ².
3. **Paired t-test** on the 40 differences (or **Wilcoxon signed-rank**). *Why:* the same collectors measured twice; pairing removes collector-to-collector differences. *Trap:* an independent two-sample test throws that away (Day 3: p 0.031 paired vs 0.055 unpaired); and August vs September also differ in season — say so.
4. **Exact binomial test** vs p₀ = 1.28 %: `stats.binomtest(3, 60, 0.0128)` → p = 0.042 (or Fisher vs the rest of the book). *Why:* expected FPDs = 0.77 — no normal approximation. *Trap:* 3 events; "worse than the book" at p = 0.04 is one branch among ten (Holm), and the interval (Wilson 1.7–13.7 %) is very wide — watch, do not conclude.
5. **Welch t-test**. *Why:* a roughly normal number, two large independent groups; Welch needs no equal-variance assumption. *Trap:* with 4 874 vs 6 049 scores a 1–2-point difference could become "significant" — report the difference with its CI and Cohen's d (Day 3: p = 0.22, d = 0.02).
6. **Mann–Whitney U**. *Why:* the question is about the typical payment; days late is skewed (skew ≈ 5) with tied medians. *Trap:* reading it as "the medians differ" — both medians are −1; it compares whole distributions (P(X > Y)).
7. **McNemar's test** (`statsmodels.stats.contingency_tables.mcnemar`). *Why:* a yes/no outcome measured twice on the same applications — paired proportions; only the discordant ones (approved by one scorecard and not the other) carry information. *Trap:* a two-proportion z-test treats the 500 + 500 as independent and gets the SE wrong.
8. **Permutation test** (shuffle loans between strategies) or a **bootstrap CI** of the difference. *Why:* the statistic is a ratio of sums (Σ paid / Σ due) with no simple SE formula. *Trap:* resampling *payments* instead of *loans* — the unit that was assigned to a strategy is the loan.
9. **Spearman rank correlation**. *Why:* two numbers per loan, the relation is monotone rather than linear, days late is skewed with many ties. *Trap:* Pearson on these data is driven by a few very late loans; and correlation is not a test of the scorecard — the grade table (late share by grade, Day 3) answers the business question better.
10. **Holm** (or Benjamini–Hochberg) across the 25 tests — or stop colouring by p and show intervals. *Why:* 25 tests at 5 % give a 1 − 0.95²⁵ = **72 %** chance of at least one red KPI when nothing changed. *Trap:* every month someone "explains" a red KPI that is noise.
11. A **power / sample-size calculation** first (Cohen's h, `zt_ind_solve_power`); fix α, the metric, the sample size, the end date and the stopping rule in advance; plan an **A/A** check. *Why:* an underpowered test cannot answer (A5: a 2-point change needs ~91 months of app traffic), and peeking turns 5 % into ~21 % (Day 4). *Trap:* "we will run it and see".
12. **χ² test** on the 3 × 2 table, then pairwise two-proportion tests (or Fisher) with **Holm**. *Why:* a rate, three independent groups. *Trap:* testing the best script against the worst only — that is three comparisons chosen after looking.

</details>

---

## Part C — Eight interview questions (30 min, 20 pts)

- **Do.** Answer each of the eight questions in 3–5 sentences: the definition, a Nur number that shows you have used it, the trap.
- **Where.** `quiz.md`, under `## Part C`.
- **Points.** 2.5 each: correct, in your own words, with a number or an example.

> 🎯 **Interview version.** Every answer has the same skeleton: the definition in one sentence, a Nur number that shows you have used it, and the trap people fall into. "p = 0.03 means… — for app vs branch FPD that was… — it is *not* the probability that…".

1. What does a p-value of 0.03 mean? Give the definition and two common misreadings.
2. What does a 95 % confidence interval mean — and what does it not mean?
3. Type I vs type II error: define both, give a lending example of each, and say which one α controls.
4. Why does an FPD rate of 1.28 % need a Wilson interval rather than "p ± 1.96 · SE", especially for a branch or a month?
5. State the central limit theorem in one sentence, and say why it matters for an analyst who works with very skewed loan amounts.
6. A result is "statistically significant". Why is that not enough — what do you report next to it?
7. You test ten branches and one is significant at 5 %. What is the problem and how do you handle it?
8. What is statistical power, what does it depend on, and why should you compute it *before* an experiment?

<details><summary>Model answers (open after submitting)</summary>

1. **p-value.** The probability, assuming H₀ is true, of a result at least as extreme as the one observed. p = 0.03 for app vs branch FPD means: if both channels had the same true rate, a gap of 0.66 points or more would appear in about 3 % of samples this size. It is *not* the probability that H₀ is true, and *not* the probability that the result "is due to chance"; nor does it measure how big or important the difference is.
2. **95 % CI.** A range built by a procedure that captures the true value in 95 % of repeated samples — for app FPD, 1.26–2.30 %. It does not mean "95 % probability the true rate is in this particular interval" (the true rate is fixed), nor that 95 % of loans fall in it. Its width shows the precision; overlapping intervals do not by themselves prove "no difference".
3. **Errors.** Type I: rejecting a true H₀ — concluding the app channel is riskier when it is not and cutting a good channel; its probability is α. Type II: failing to reject a false H₀ — missing a real deterioration in a vintage; its probability is β, and power = 1 − β. α is set in advance; β is controlled by n and the effect size.
4. **Wilson.** Near 0 % the sampling distribution of a rate is skewed, so the Wald interval is too narrow on the high side, can go below zero (2 FPDs in 150 → −0.5 %) and collapses to zero width at 0 events; at n = 400 and p = 1.28 % a "95 %" Wald interval covers only about 88 % of the time. Wilson inverts the score test, stays inside 0–100 %, is asymmetric in the right direction and covers close to 95 % — which matters exactly for small branches and months.
5. **CLT.** The mean of many independent observations is approximately normally distributed around the true mean with sd σ/√n, whatever the shape of the data. That is why we can build t intervals and tests for average ticket even though principal is skewed (skew 2.9) — but with heavy tails the approximation needs larger n (a t interval at n = 30 covered only 89 % on our principals), so for small samples of money use the bootstrap or a larger n.
6. **Significance vs importance.** Significance only says the effect is distinguishable from zero given n; with enough rows any trivial gap is significant (scores app vs branch: p = 0.013, a 3-point difference, d = 0.06). Report the effect size with its interval and in business units — app vs branch FPD: +0.66 points (CI +0.05 to +1.33), 6.6 extra FPDs per 1 000 loans, ~15 m soum a year — and the decision it supports.
7. **Multiple comparisons.** With ten tests at 5 % the chance of at least one false positive is up to 40 % even if no branch differs (our simulation: 31 %). Correct with Holm (or Bonferroni) — Bukhara's p = 0.020 becomes 0.199 — or run one omnibus test first (χ² across branches: p = 0.35), and treat a single hit as something to monitor, not act on.
8. **Power.** The probability of detecting a real effect of a given size: it depends on α, the effect size, n and the variability (for rates, the base rate). Computing it first tells you whether the test can succeed at all: Jasur's 2 000-loan SMS test had 9 % power for FPD 1.28 → 1.00 % (22 481 per arm needed), so a "no effect" result would have been meaningless; the fix was a more frequent metric, not a bigger hope.

</details>

**Follow-ups an interviewer adds** (prepare one sentence each): *"Why n − 1 in the sample variance?"* (unbiased; Day 2) · *"When would you use a one-sided test?"* (pre-registered, one direction changes the action; Day 3) · *"Bootstrap or t-interval?"* (skewed statistic or no formula → bootstrap; Day 2) · *"What is an A/A test for?"* (the system; Day 4) · *"How do you choose α?"* (by the cost of a false alarm vs a miss, before the data) · *"What if the p-value is 0.051?"* (nothing magical happens at 0.05: report the effect and its interval, and the decision it supports).

---

## Before you submit

- [ ] Kernel → Restart & Run All finishes with no red cell; the loader's assert passed; the file is saved **after** the run.
- [ ] Every Part A cell prints its numbers (a DataFrame shown, or `print`) — the reviewer reads the saved outputs, not your code.
- [ ] Every rate has its n; every interval says its method (t, Wilson) and level (95 %).
- [ ] Every test names itself and gives the p-value to two significant digits (or "p < 0.001") **and** an effect size.
- [ ] A3 says what the payment grain does; A4 says why not a t-test; A5 converts loans into months.
- [ ] Ten interpretations, two per task: what the number says, what to do with it.
- [ ] `quiz.md` has twelve Part B lines (test + why) and eight Part C answers.

**`quiz.md` skeleton:**

```markdown
# Checkpoint 6 — quiz
## Part B
1. Test: … — Why: …
…
12. Test: … — Why: …
## Part C
1. p-value: …
…
8. Power: …

```

---

## Scoring and what happens next

| Part | Points | What earns them |
|---|---|---|
| A — five analyses | 50 | per task: correct method and numbers (6), two-sentence interpretation that says what to do (4) |
| B — test-choice quiz | 30 | 2.5 per scenario: the right test (1.5) and a reason that names outcome type, groups, pairing or the broken assumption (1) |
| C — interview | 20 | 2.5 per answer: correct, in your words, with a number or example |

**70 points** to move on. Below 70, the feedback lists the sections to redo (a focused redo, not the whole week). Points go to the [Progress page](progress.md). Next week the tests become **experiments**: A/B testing (randomisation, A/A, sequential looks, guardrails) on Nur's app funnel, and the first Power BI dashboard — where every rate gets its n and its interval.

**Week 6 in five sentences** (what you can now say in any meeting):

1. "Expect 5 FPDs in 400 loans; 10 or more happens 3.6 % of the time if nothing changed" — a binomial tail, not a gut feeling.
2. "App FPD is 1.70 %, 95 % CI 1.26–2.30 %, n = 2 411" — every rate with its n and its Wilson interval.
3. "App is higher than branch, p = 0.03, about 7 extra FPDs per 1 000 loans, ~15 m soum a year" — a test with its effect size and its money.
4. "Bukhara's p = 0.02 is one of ten tests; after Holm it is 0.20" — multiple comparisons before blame.
5. "2 000 loans give 9 % power for that SMS; measure lateness instead" — power before the experiment, not after.

> 💡 **Key idea.** All five sentences have the same shape: a number, its uncertainty, and the decision it supports. That shape is what next week's A/B tests and every Power BI tile will ask of you.

> 🚀 **Stretch (optional, +5 XP).** Write `nur_stats.py` with `wilson_table(df, by, outcome)`, `two_rates_note(k1, n1, k2, n2)` (prints the six-line committee note: rates with Wilson CIs, difference with Newcombe CI, z and Fisher p, RR, extra per 1 000) and `power_note(p1, p2, n_per_arm)` (power, n needed, MDE). Run `two_rates_note` on grade C vs D FPD30 (44 / 2 034 vs 7 / 314) and `power_note(0.0128, 0.010, 1000)`. One module, three functions, every committee question of this week answered in one line each.

```task
{"id": "w06d5-st", "kind": "number", "answer": 0.94, "dp": 2, "unit": "two-sided z-test p, grade C vs D", "hint": "Pooled rate 51 / 2 348; z = (44/2034 − 7/314) / SE.", "model": "z = −0.07, p = 0.94: grade C (2.16 %) and grade D (2.23 %) show no evidence of a difference in FPD30 — and with only 7 FPDs in grade D the interval of the difference is wide, so the note says 'no evidence of a difference', never 'the same'.", "xp": 2}
```

---

### 📎 Hand in here

```sqltask
{"check": "handin-W6D5", "lesson": "W6D5", "title": "Checkpoint 6", "why": "This is the week's proof: every number on Nur's data with its uncertainty and a decision, the test named before the data, and the interview answers you will give for real.", "graded": ["Part A, 50: per task the right method and numbers (6) and a two-sentence interpretation that says what to do (4)", "Part B, 30: per scenario the right test (1.5) and a reason naming outcome type, groups, pairing or the broken assumption (1)", "Part C, 20: per answer correct, in your words, with a number or example (2.5)", "70 points to move on"], "tasks": [{"id": "checkpoint.ipynb", "file": "checkpoint.ipynb", "names": ["checkpoint.ipynb"], "upload": true, "accept": ".ipynb", "q": "Attach `checkpoint.ipynb` — what the page above asks for."}, {"id": "quiz.md", "file": "quiz.md", "text": true, "minLines": 3, "q": "Write `quiz.md` here — what the page above asks for."}, {"id": "Extra", "file": "extra", "upload": true, "optional": true, "q": "Anything else the page lists (one more file, or a .zip of several)."}]}
```

---

## Day quiz

Pass with 80 % to finish the day. Retry as often as you like.

```quiz
{"id": "w06d5", "pass": 0.8, "questions": [
  {"type": "single", "q": "Which gives the sample standard deviation (ddof = 1) for a t interval?", "code": "v = loans.loc[loans[\"code\"] == \"AUTO\", \"principal\"].astype(float)   # a pandas Series", "options": ["np.sqrt(np.var(v))", "np.std(v)", "v.std(ddof=0)", "v.std()"], "answer": 3, "explain": "pandas' .std() defaults to ddof=1; numpy's np.std and np.var default to ddof=0 — the deduction seen most often in A1 (→ A1, Day 2)."},
  {"type": "single", "q": "Which interval does this return?", "code": "from statsmodels.stats.proportion import proportion_confint\nproportion_confint(41, 2411)", "options": ["Clopper–Pearson", "Wilson", "A bootstrap interval", "Wald — method=\"normal\" is the default; pass method=\"wilson\""], "answer": 3, "explain": "statsmodels' default is the Wald interval; a rate near 0 % needs method=\"wilson\" (→ Day 2, A2 deductions)."},
  {"type": "single", "q": "The average Micro ticket is 2.71 m; one Micro loan is 4.99 m. What do you do before calling it an outlier?", "options": ["Replace it with the mean", "Run Shapiro–Wilk", "Delete it — it is far from the mean", "Look at the spread (z ≈ 1.7) and find out what it is: 4.99 m is just under the product limit"], "answer": 3, "explain": "Never delete by a z-score alone; a limit, a data error and a real large loan need different treatment (→ Warm-up 1)."},
  {"type": "single", "q": "Shapiro–Wilk on 500 app principals gives p ≈ 10⁻¹². Does that forbid a t-test on the mean of all 2 669 app principals?", "options": ["Yes, unless you take logs", "Yes — the data are not normal", "Only if Levene also rejects", "No — the t-test needs the sample mean to be approximately normal, which the CLT gives at n = 2 669"], "answer": 3, "explain": "Normality of the statistic, not of the data (→ Warm-up 3, Day 3 'Checking assumptions')."},
  {"type": "number", "q": "Applicants' scores: μ = 659.6, σ = 59.5. What is the z-score of a score of 780 (two decimals)?", "answer": 2.02, "tol": 0.01, "explain": "z = (780 − 659.6) / 59.5 = 2.02, so the normal model puts about 2.2 % at 780 or above (→ Warm-up 2)."},
  {"type": "multi", "q": "Which belong in every Part A interpretation?", "options": ["What someone should do — or not do — with it", "An effect size next to any p-value", "p = 0.000", "\"H₀ is rejected\" without saying which hypothesis, in business words", "The number with its uncertainty (interval or p-value) and the method named"], "answer": [0, 1, 4], "explain": "Two sentences: the number with its test, then the decision it supports; a correct number with no interpretation earns 6 of 10 (→ 'What every Part A answer contains')."},
  {"type": "single", "q": "A test gives p = 0.051. What do you report?", "options": ["'No effect'", "Switch to a one-sided test", "Re-run until p < 0.05", "Nothing magical happens at 0.05: the effect, its interval and the decision it supports"], "answer": 3, "explain": "α is a decision rule fixed in advance, not a cliff; report the size and the uncertainty (→ 'Follow-ups an interviewer adds')."},
  {"type": "single", "q": "When is a one-sided test legitimate?", "options": ["When the two-sided p is just above 0.05", "Whenever n is small", "When it was written down before the data and a result in the other direction would lead to the same action as 'no difference'", "Always for rates"], "answer": 2, "explain": "Switching to one-sided after seeing the direction is the cheapest p-hacking there is (→ Day 3, 'One-sided or two-sided')."}
]}
```

<!-- challenge:start -->

---

## Daily challenge

A bonus for the curious: one harder question on today's topic. Solve it for XP that grows with your challenge streak — a full week of five also adds 10 % to Friday's voucher.

```challenge
{"id": "w06d5", "q": "Jasur asks how well the credit score at the door separates the loans that later had an FPD from those that did not. In the FPD frame f, keep the loans with a credit score (6 907) and run a two-sided Mann–Whitney U test of score, non-FPD loans as the first sample and FPD loans as the second. Report the probability of superiority U / (n₁·n₂) — the chance that a random non-FPD loan has a higher score than a random FPD loan (ties counted half). Give it to 3 decimals.", "type": "number", "dp": 3, "python": true, "h": ["ee9eaa07100cfe8068c07199"], "hint": "The order of the two samples decides whether you get the number or one minus it — the question fixes it.", "sol": "ZyA9IGYuZHJvcG5hKHN1YnNldD1bImNyZWRpdF9zY29yZSJdKSAgICAgICAgICAgICAgICAgICAgICAgICAgICAjIDYgOTA3IGxvYW5zOiA2IDgxOCB3aXRob3V0IEZQRCwgODkgd2l0aAphID0gZy5sb2NbZ1siZnBkMzAiXSA9PSAwLCAiY3JlZGl0X3Njb3JlIl0KYiA9IGcubG9jW2dbImZwZDMwIl0gPT0gMSwgImNyZWRpdF9zY29yZSJdCnUgPSBzdGF0cy5tYW5ud2hpdG5leXUoYSwgYiwgYWx0ZXJuYXRpdmU9InR3by1zaWRlZCIpICAgICAgICAgICAgICMgVSA9IDM4MSA2MjEuNSwgcCA9IDIuOGUtMDUKdS5zdGF0aXN0aWMgLyAobGVuKGEpICogbGVuKGIpKSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIyAwLjYyOQoKMC42Mjk6IHBpY2sgb25lIHBheWluZyBhbmQgb25lIEZQRCBsb2FuIGF0IHJhbmRvbSBhbmQgdGhlIHBheWluZyBvbmUgaGFzIHRoZSBoaWdoZXIgc2NvcmUgNjMgJSBvZiB0aGUgdGltZSDigJQgY2xlYXJseSBiZXR0ZXIgdGhhbiBhIGNvaW4gKHAg4omIIDMgw5cgMTDigbvigbUsIG1lZGlhbnMgNjgxIHZzIDY1NCksIGJ1dCBmYXIgZnJvbSBhIGNsZWFuIHNwbGl0LgpUaGlzIG51bWJlciBpcyB0aGUgc2NvcmVjYXJkJ3MgQVVDIG9uIEZQRDMwOyBhIGNyZWRpdCB0ZWFtIHdvdWxkIHF1b3RlIGl0IGFzIEdpbmkgPSAyIMOXIDAuNjI5IOKIkiAxIOKJiCAwLjI2LCBhIHdlYWsgc2NvcmUgZm9yIHRoaXMgb3V0Y29tZS4KSXQgYWdyZWVzIHdpdGggRGF5IDEncyBCYXllcyBleGVyY2lzZTogYSBsb3cgc2NvcmUgbGlmdHMgRlBEIHJpc2sgYnV0IGFsbW9zdCBldmVyeSBsb3ctc2NvcmUgbG9hbiBzdGlsbCBwYXlzLCBzbyB0aGUgc2NvcmUgYWxvbmUgY2Fubm90IHN0b3AgZmlyc3QtcGF5bWVudCBkZWZhdWx0cy4="}
```

<!-- challenge:end -->
