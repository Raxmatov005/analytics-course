# Week 7 · Day 2 — Analysing the A/B test: the result, the traps, the decision

<span class="badge">Learn 60 min</span> <span class="badge">Worked example 15 min</span> <span class="badge">Practice 60 min</span> <span class="badge hw">HW 7.1 due tomorrow</span> <span class="badge company">Company corner</span>

> STORY **Tuesday, 9:00.** The offer-screen test closed on 28 August; the follow-up on the loans is in. Kamola, beaming, with a screenshot from the experiment dashboard: *"**B wins: 9.37 % against 8.28 %, plus 13 %, p = 0.001.** Can we ship on Thursday?"* Nilufar, one seat further: *"Thirteen per cent more loans. Of which how many pay the first instalment? I sign off on nothing that I have not seen the FPD for."* Jasur, not looking up from his laptop: *"The dashboard counts rows. Has anybody checked that the rows are users?"* Madina: *"You have the data and until tomorrow noon. Kamola gets a decision, Nilufar gets the guardrail, and both get the same one slide."*

## Today in 3 lines

- **Clean before you test.** You run three sanity checks — users in more than one variant, the sample ratio overall *and by segment and week*, and the lift day by day — and find out whether Kamola's dashboard can be trusted. Section 2 walks you through the three checks on this very export — run each one yourself before reading what it finds.
- You compute the **primary result** on the population you have decided is clean — difference in points with a 95 % CI, p-value, relative lift — and compare it with the dashboard's number: does the conclusion survive, and how much does the size change?
- You finish the **readout**: the funnel by step, principal (Mann–Whitney, bootstrap), the **FPD guardrail** with its power, segments with a **Holm** correction — and a decision memo Kamola and Nilufar can both sign.

---

## 1. Learn — the order of an analysis

The order is fixed, and it is the order of the readout: **(1) is the experiment sound? (2) the primary result, (3) secondary metrics and guardrails, (4) segments, (5) the decision.** A result read before step 1 is a number from a possibly broken machine. Everything below runs on `users`, `events` and `loans` from `day2_starter.ipynb`; conversion = signed within 7 days of `assigned_at`.

### Step 1a — is one row one user?

```python
len(users), users["user_id"].nunique()                    # 27 974 rows, 27 674 users
dup = users[users["user_id"].duplicated(keep=False)]      # 600 rows = 300 users, each in BOTH variants
```

The README says one row per assignment, intended one per user. **300 users were assigned twice** — 1 to 5 days apart (mean 3.0), first A for 182 of them, first B for 118: the app was reinstalled and the device asked again. They saw **both** screens, so they belong to neither arm; and because `events` has no variant column, a naive merge counts each of their events in A **and** in B. The rule: **drop every row of a user who is in both arms** (not "keep the first assignment" — after the second one, their behaviour is a mix). 600 rows go; 27 374 users remain.

### Step 1b — the sample ratio, overall and by slice

```python
stats.chisquare(users["variant"].value_counts().values)         # rows: 13 845 / 14 129, p = 0.090
stats.chisquare(ud["variant"].value_counts().values)            # users after de-duplication: 13 545 / 13 829, p = 0.086
```

Overall: unremarkable. Now by slice (the notebook's `srm_by`), on the de-duplicated users:

| slice | A | B | B share | SRM p |
|---|---|---|---|---|
| Android | 10 745 | 10 702 | 49.9 % | 0.77 |
| **iOS** | 2 800 | 3 127 | 52.8 % | **2.2 × 10⁻⁵** |
| week 1 / 2 / 3 | 3 866 / 3 389 / 3 262 | 3 892 / 3 345 / 3 317 | 50.2 / 49.7 / 50.4 % | 0.77 / 0.59 / 0.50 |
| week 4 (Aug 22–28) | 3 028 | 3 275 | 52.0 % | 0.0019 |
| iOS × weeks 1–3 | 857 / 720 / 686 | 835 / 728 / 742 | 49.3 / 50.3 / 52.0 % | 0.59 / 0.83 / 0.14 |
| **iOS × week 4** | **537** | **822** | **60.5 %** | **1.1 × 10⁻¹⁴** |
| new / returning | 5 998 / 7 547 | 6 253 / 7 576 | 51.0 / 50.1 % | 0.021 / 0.81 |
| mass / affluent / sme | 8 076 / 2 741 / 2 728 | 8 330 / 2 748 / 2 751 | 50.8 / 50.1 / 50.2 % | 0.047 / 0.92 / 0.76 |

One cell is broken: **iOS users assigned 22–28 August went 60 / 40 to B**. The overall test could not see it — 1 359 users out of 27 374 — and a **daily** SRM check could not either (about 980 users a day: only 2 of 28 days have p < 0.05, the smallest 0.024 on 22 August). The slice that matches how the software is built (client × release week) found it. The two other "significant" slices (new p = 0.021, mass p = 0.047) are what eleven checks produce by chance — with the p < 0.001 rule they do not trigger, and after removing the iOS week-4 cell they vanish (new 0.29, mass 0.55): they were echoes of the same bug.

### Step 1c — the hash check

The design says the variant **is** `sha256("offer_screen_v2" + user_id) mod 2`. Recompute it:

```python
users["expected"] = users["user_id"].map(lambda u: hash_variant(u, "offer_screen_v2"))
bad = users[users["variant"] != users["expected"]]          # 431 rows
bad["user_id"].isin(dup["user_id"]).sum()                  # 300: the leak's second assignments
bad[~bad["user_id"].isin(dup["user_id"])].groupby(["device", "variant"]).size()   # iOS / B: 131, all in Aug 22-28
```

**131 iOS users in week 4 were logged as B although their hash says A** — the client defaulted to B when the assignment call timed out (that is what the engineers will find; the data already says *where*). A hash-based split gives you this check for free: the group is not a stored opinion, it is a function you can recompute.

**What to do with a broken cell.** Remove it from **both** arms (iOS, 22–28 August: 1 359 users) — within it, B contains users who should have been A, and whoever times out is not a random user (slow phones, bad networks). After removal: 13 008 / 13 007, **SRM p = 0.995**. Report the exclusion and its size; if the cell were large, the honest answer would be "re-run the week".

### Step 1d — novelty: the daily lift

The chart is in `day2_starter.ipynb`, section 0b. De-duplicated users, conversion within 7 days, by assignment day: A on 1–3 August 7.85 / 7.94 / 8.19 %, B **11.90 / 10.33 / 12.09 %** — a lift of **+4.0, +2.4, +3.9** points on the first three days, then +1.2, −0.3, +0.4, +1.1, … (single days swing by ±3 points: about 490 users per arm per day). By week (iOS week 4 removed): A 8.38 / 8.56 / 7.20 / 7.59 %, B 10.12 / 9.75 / 8.02 / 8.44 %. Days 1–3 alone: 8.01 % vs **11.44 %**, +3.44 points, p = 0.0012; from 4 August: +0.88 points. One day at +5.2 (14 August) proves nothing; **three consecutive launch days**, all far above the rest, plus a known mechanism (returning users exploring a new screen), is the novelty pattern the design anticipated. The pre-registered plan (Day 1): report the **steady state from day 4** as primary, the full period as a sensitivity line.

### Step 2 — the primary result on the clean population

Clean = de-duplicated, iOS week 4 removed, assigned from 4 August: **22 906 users**, 11 472 / 11 434 (SRM p = 0.80).

```python
k = clean.groupby("variant")["conv"].agg(["sum", "size"])                 # A 915 / 11 472 · B 1 013 / 11 434
proportions_ztest([1013, 915], [11434, 11472])                            # z = 2.41, p = 0.0160
confint_proportions_2indep(1013, 11434, 915, 11472, method="newcomb")      # +0.0016 to +0.0160   (difference B - A)
confint_proportions_2indep(1013, 11434, 915, 11472, compare="ratio", method="log")   # 1.020 to 1.210   (ratio B / A)
```

**7.98 % vs 8.86 %: +0.88 points (95 % CI +0.16 to +1.60), p = 0.016; relative lift +11.1 % (95 % CI +2.0 % to +21.0 %).** The relative interval comes from the ratio's CI (log method), minus 1 — not from dividing the difference's limits by 7.98 %. How each cleaning step moved the answer:

| population | A | B | difference (95 % CI) | p | relative lift (95 % CI) |
|---|---|---|---|---|---|
| raw rows (the dashboard) | 8.28 % (13 845) | 9.37 % (14 129) | +1.09 (+0.42 to +1.75) | 0.0014 | +13.1 % (+4.9 to +22.0) |
| − 300 leaked users | 8.05 % | 9.17 % | +1.11 (+0.45 to +1.78) | 0.0010 | +13.8 % (+5.4 to +23.0) |
| − iOS 22–28 Aug | 7.98 % | 9.17 % | +1.19 (+0.51 to +1.87) | 0.00059 | +14.9 % (+6.2 to +24.5) |
| **− days 1–3 (clean)** | **7.98 %** (11 472) | **8.86 %** (11 434) | **+0.88 (+0.16 to +1.60)** | **0.016** | **+11.1 % (+2.0 to +21.0)** |
| sensitivity: − leak, − days 1–3, iOS kept | 8.06 % | 8.88 % | +0.82 | 0.022 | +10.1 % |

The same primary in Excel, one row per variant (week 6's four formula cells, plus the relative lift):

| | A | B | C |
|---|---|---|---|
| 1 | | converted | users |
| 2 | A | 915 | 11472 |
| 3 | B | 1013 | 11434 |
| 5 | pooled | `=(B2+B3)/(C2+C3)` → 0.08417 | |
| 6 | z | `=(B3/C3-B2/C2)/SQRT(B5*(1-B5)*(1/C2+1/C3))` → 2.408 | |
| 7 | p (two-sided) | `=2*(1-NORM.S.DIST(ABS(B6),TRUE))` → 0.0160 | |
| 8 | relative lift | `=(B3/C3)/(B2/C2)-1` → 11.08 % | |

The leak and the SRM inflated B slightly (the leaked users counted twice; the flipped iOS users convert above average); the novelty days inflated it most. The verdict "B is better" survives every version; **the size Kamola can promise is +0.9 points, not +1.1**, and the interval's lower end (+0.16) is close to nothing.

### Step 3a — the funnel: where does the lift come from?

| step (clean users) | A | B | B − A | p |
|---|---|---|---|---|
| viewed the offer | 11 472 | 11 434 | | |
| started an application (of viewers) | 3 858 · 33.6 % | 3 853 · 33.7 % | +0.1 pt | 0.91 |
| submitted (of starters) | 2 832 · 73.4 % | 2 871 · 74.5 % | +1.1 pt | 0.27 |
| approved (of submitted) | 1 124 · 39.7 % | 1 194 · 41.6 % | +1.9 pt | 0.14 |
| signed, any time (of approved) | 993 · 88.4 % | 1 076 · 90.1 % | +1.8 pt | 0.17 |

The new screen does **not** make more people start; the starters finish a little more often at every later step — none significant alone, all in the same direction. That fits the hypothesis (a clear monthly payment means fewer surprises at submission and signing). One step needs a risk eye: **approval** is the scorecard's decision; if B's applicants were approved more often, B might be attracting different people. The difference is within noise (p = 0.14) — note it, do not build a story on it. Rule: a funnel explains a primary result; it does not replace it (five steps = five more tests).

### Step 3b — money: principal and disbursed per viewer

Principal per signed loan (clean users) is right-skewed and capped at the product limit (median 2.27 m vs mean 2.56 m in A; skew 0.6): **A 2 563 847 mean / 2 270 000 median (993 loans), B 2 494 675 / 2 245 000 (1 076)**. Mann–Whitney p = **0.32** (P(B > A) = 0.487); bootstrap of the mean difference (10 000 resamples): **−69 172 soum (95 % CI −174 910 to +35 635)**, −2.7 %. B's loans are perhaps slightly smaller; the data cannot tell. Combine count and size into the business number — **disbursed principal per viewer** (0 for non-converters): A 203 824, B 220 024, **+7.9 %**; bootstrap CI of the difference **−4 423 to +36 856** per viewer, i.e. 203.8 m vs 220.0 m per 1 000 viewers, zero still inside. More loans, slightly smaller: the money effect is smaller and less certain than the conversion effect.

### Step 3c — the guardrail: FPD

| | A | B |
|---|---|---|
| loans of clean users | 993 | 1 076 |
| first-payment defaults | 15 | 24 |
| FPD rate (Wilson 95 %) | **1.51 %** (0.92–2.48) | **2.23 %** (1.50–3.30) |

Two-proportion z-test **p = 0.23** (Fisher 0.26); difference **+0.72 points, 95 % CI −0.49 to +1.94**. "Not significant" here means almost nothing: the test's **power** to detect a true +0.72 points with ~1 000 loans per arm is **23 %**; detecting it with 80 % power needs **5 508 loans per arm** — about 62 000 users per arm at B's 7-day conversion of 8.86 %, some four months of traffic. The guardrail decision therefore rests on the **interval vs the break-even** (Company corner): the point estimate +0.72 is below Day 1's +1.25 (and below +0.94 recomputed with today's numbers), the upper bound +1.94 is above it. The data cannot rule out that B loses money.

### Step 4 — segments, with the correction

Seven pre-registered cuts (device, new vs returning, customer segment), clean population:

| segment | A | B | lift | p | Holm |
|---|---|---|---|---|---|
| Android | 7.86 % | 8.73 % | +0.87 | 0.030 | 0.21 |
| iOS | 8.55 % | 9.48 % | +0.94 | 0.31 | 0.61 |
| new users | 6.54 % | 7.39 % | +0.85 | 0.093 | 0.37 |
| returning users | 9.12 % | 10.08 % | +0.96 | 0.068 | 0.34 |
| affluent | 8.56 % | 10.27 % | +1.71 | 0.047 | 0.28 |
| mass | 7.52 % | 8.14 % | +0.63 | 0.17 | 0.52 |
| sme | 8.74 % | 9.62 % | +0.87 | 0.30 | 0.61 |

Nothing survives Holm; every segment's lift is positive and close to the total. "Affluent +1.7, p = 0.047" is the sentence somebody will want to put on the slide — it is the most extreme of seven, before correction. Whether the lift **differs** between groups is a different test (an **interaction**): new +0.85 vs returning +0.96, difference z = −0.15, **p = 0.88**. "Significant in Android, not in iOS" does not mean the screen works only on Android: iOS has a fifth of the users. Regions (8 more tests): smallest Holm-adjusted p 0.59.

### Step 5 — the decision

| If | Then |
|---|---|
| sound experiment, primary significant, guardrails' intervals inside the safe zone | **ship** |
| primary significant, a guardrail's interval crosses the break-even | **ship in stages** (e.g. 50 % → 100 %) with the guardrail monitored and a hold-out kept, or **extend** if the decision is expensive to reverse |
| primary not significant, MDE was realistic, interval excludes the MDE | **do not ship** (no effect worth having) |
| primary not significant, interval wide (underpowered) | **extend** to the planned n — never "it works a bit" |
| SRM or leak you cannot explain | **do not read the result**; fix and re-run |

Here: row two. A screen change is cheap to reverse; FPD is a two-month-late signal. Ship B to 100 % of new offer views **except a 10 % hold-out on A** for ten weeks, and read FPD on both when ~5 000 B loans have matured.

### Depth (optional)

**Videos (free, YouTube; each link opens at the right minute):**

- ▶ Primary result: p-value and confidence interval — [Самая ПОЛНАЯ и ПОНЯТНАЯ лекция по A/B тестам (Noukash), 30:47](https://youtu.be/FEI1OA-zgb8?t=1847&end=1980)
- ▶ Analysing results in Python — [Data Science Essentials - Crash Course in A/B Testing with Case Study (freeCodeCamp.org), 39:22](https://youtu.be/KZe0C0Qq4p0?t=2362&end=3660)
- ▶ Validity check and launch decision — [A/B Testing in Data Science Interviews by a Google Data Scientist (DataInterview), 12:32](https://youtu.be/DUNk4GPZ9bw?t=752&end=913)
- ▶ Common problems (RU) — Noukash lecture, [35:37](https://youtu.be/FEI1OA-zgb8?t=2137&end=2301)

- RU deck `6.2 A_B Testing.pdf` (lesson 6.2): pp. 4–10 — hashing, salting, uneven splits (the logic behind the hash check).
- Notebook `Lecture6.2 - Tests.ipynb`: the t-test step by step and with scipy (cells 3–19), "was it profitable?" — a skewed revenue metric and the Mann–Whitney U test (cells 20–40), **A/A tests and added-effect checks** — simulate many A/A splits, check the p-values are uniform, add an artificial effect and check the test finds it (cells 41–62), multiple comparisons (cell 63). Run its A/A loop on our `users` + `events` instead of the generated data.
- `Howework_AB.ipynb` — the original course's A/B homework: a "For you" page recommendation test in an online shop; hypothesis + metric + criterion, split, comparability, a synthetic dataset, a power-vs-sample-size plot at MDE 5 %; then the same for profitability. Today's analysis is the next step after that design.
- *Russian terms:* очистка данных эксперимента = experiment data cleaning, утечка в назначении = assignment leak, пересечение групп = group overlap, воронка = funnel, конверсия = conversion, относительный прирост (лифт) = relative lift, бутстрап = bootstrap, барьерная метрика = guardrail, взаимодействие = interaction, поэтапный запуск = staged rollout, контрольная (отложенная) группа = hold-out.

---

## 2. Worked example — the primary result, end to end (15 min)

```python
x = with_conversion(users, events)                                         # one row per user row, conv = signed within 7 days
dup_ids = users.loc[users["user_id"].duplicated(), "user_id"].unique()      # 300
c = x[~x["user_id"].isin(dup_ids)]                                         # 27 374 users
c = c[~((c["device"] == "iOS") & (c["assigned_at"] >= "2026-08-22"))]      # 26 015 — SRM p = 0.995
c = c[c["assigned_at"] >= "2026-08-04"]                                    # 22 906 — the clean population
k = c.groupby("variant")["conv"].agg(["sum", "size"])
z, p = proportions_ztest(k["sum"][::-1], k["size"][::-1])                  # z = 2.408, p = 0.0160  (order: B first, so z > 0 means B higher)
lo, hi = confint_proportions_2indep(1013, 11434, 915, 11472, method="newcomb")                      # +0.00164, +0.01603
rlo, rhi = confint_proportions_2indep(1013, 11434, 915, 11472, compare="ratio", method="log")      # 1.0197, 1.2100
```

**The sentence** (week 6's six parts): *"Users who saw the new screen signed within 7 days 8.86 % of the time against 7.98 % with the current screen (difference +0.88 points, 95 % CI +0.16 to +1.60; relative +11 %, CI +2 % to +21 %); a two-sided two-proportion z-test gives z = 2.41, p = 0.016 on 22 906 users after removing 300 users assigned to both screens, the mis-assigned iOS week and the three novelty days; at α = 5 % the new screen converts better — about 9 more contracts per 1 000 viewers."*

---

## 3. Practice (60 min)

Open `data/python/week7/day2_starter.ipynb`: write `srm_by`, `clean_users`, `ab_readout` until their asserts pass, then one cell per task.

**P1.** The naive result: conversion per variant on every row, z, p, relative lift. Then two reasons why this cannot go to Kamola yet.

<details><summary>Answer</summary>
A 1 147 / 13 845 = **8.28 %**, B 1 324 / 14 129 = **9.37 %**, z = 3.20, **p = 0.0014**, +13.1 %. Not yet: nobody has checked that rows are users (they are not: 27 974 rows, 27 674 users) or that the split is the planned 50/50 in every part of the experiment — a broken split makes the comparison non-random, and then a p-value means nothing.
</details>

**P2.** Duplicates: how many users appear more than once, in which variants, how far apart? Why remove all their rows rather than keep the first assignment?

<details><summary>Answer</summary>
**300 users**, 600 rows, every one of them in **both** A and B; first assignment A for 182, B for 118; second assignment 1.0–5.0 days later (mean 3.0). After the second assignment they saw the other screen — their outcome is caused by a mix of A and B, and their events (no variant column) would be counted in both arms. Keeping the first row would still attribute a mixed outcome to one screen; dropping them costs 1 % of the sample and removes the doubt.
</details>

**P3.** SRM with your `srm_by`: overall (rows and de-duplicated users), by device, by week, by device × week, by day. Which cell is broken, and why did the overall and the daily checks miss it?

<details><summary>Answer</summary>
Overall rows 13 845 / 14 129, **p = 0.090**; users 13 545 / 13 829, **p = 0.086**. Device: iOS **p = 2.2 × 10⁻⁵**; week 4 p = 0.0019; **iOS × week 4: 537 / 822 = 60.5 % B, p = 1.1 × 10⁻¹⁴**. By day only 2 of 28 days below 0.05 (smallest 0.024, 22 August). The broken cell is 1 359 of 27 374 users — 5 % of the data, diluted overall; and a day has only ~980 users, so a 60/40 split of its ~50 iOS users is invisible. Slice by how the software ships: client × release period.
</details>

**P4.** The hash check: recompute every row's variant from `sha256("offer_screen_v2" + user_id)`. How many rows disagree, and how do they split between the two problems?

<details><summary>Answer</summary>
**431 rows** disagree: **300** are the leaked users' re-assignments, **131** are non-duplicate iOS users assigned 22–28 August, **all logged B** although their hash says A. So the SRM is not "B got extra users from somewhere": specific A users were pushed into B — a bug in the iOS client (timeouts defaulting to B), not in the assignment service.
</details>

**P5.** Novelty: daily conversion by variant (de-duplicated), the lift on 1–3 August, a test on days 1–3 alone, and the weekly table with iOS week 4 removed. What does the pre-registered plan say you do?

<details><summary>Answer</summary>
Days 1–3: A 7.85 / 7.94 / 8.19 %, B 11.90 / 10.33 / 12.09 % → lifts **+4.0, +2.4, +3.9**; pooled days 1–3: 8.01 % vs 11.44 %, **+3.44 points, p = 0.0012**. Weekly: A 8.38 / 8.56 / 7.20 / 7.59 %, B 10.12 / 9.75 / 8.02 / 8.44 % — week 1 carries the spike. Plan: steady state (from 4 August) is the primary, the full period a sensitivity line. Leaving the spike in would sell Kamola a lift that the screen will not keep.
</details>

**P6.** The clean primary result with your `ab_readout`, then the cleaning-ladder table (raw → − leak → − iOS week 4 → − days 1–3). Which step changes the answer most?

<details><summary>Answer</summary>
Clean: **7.98 % vs 8.86 %, +0.88 points (+0.16 to +1.60), p = 0.016, +11.1 % (+2.0 to +21.0)**. Ladder: +1.09 (p 0.0014) → +1.11 (0.0010) → +1.19 (0.00059) → **+0.88 (0.016)**. The novelty exclusion moves it most (−0.31 points); the leak and the SRM each push B up a little. The conclusion holds throughout; the size drops by a fifth and the p-value rises tenfold.
</details>

**P7.** The funnel by variant on the clean users: step rates and a two-proportion test per step. Where does the lift come from, and which step would worry a risk manager?

<details><summary>Answer</summary>
Start 33.6 vs 33.7 % (p 0.91); submit 73.4 vs 74.5 % of starters (0.27); approved 39.7 vs 41.6 % of submitted (0.14); signed 88.4 vs 90.1 % of approved (0.17). The lift is not at the door but in finishing — small gains at every later step. The **approval** step worries risk: a higher approval share in B could mean different applicants; here it is within noise, so it goes on the watch list, not into the conclusion.
</details>

**P8.** Principal per loan: describe both arms, Mann–Whitney, a bootstrap CI of the mean difference (10 000 resamples, `default_rng(2026)`). Then disbursed principal per viewer with its bootstrap CI.

<details><summary>Answer</summary>
A 993 loans, mean **2 563 847**, median 2 270 000, sd 1 248 912; B 1 076, **2 494 675**, 2 245 000, 1 197 935. Mann–Whitney **p = 0.32** (P(B > A) = 0.487); mean difference **−69 172 (95 % CI −174 910 to +35 635)**, −2.7 %. Per viewer: A 203 824, B 220 024 (**+7.9 %**), CI of the difference −4 423 to +36 856 — 203.8 m vs 220.0 m per 1 000 viewers, not distinguishable from zero. More contracts, possibly smaller ones.
</details>

**P9.** The FPD guardrail: rates with Wilson intervals, z-test and Fisher, the CI of the difference, the power this test had, and the loans per arm needed. What sentence goes to Nilufar?

<details><summary>Answer</summary>
A 15 / 993 = **1.51 %** (0.92–2.48), B 24 / 1 076 = **2.23 %** (1.50–3.30); z-test **p = 0.23**, Fisher 0.26; difference **+0.72 points (−0.49 to +1.94)**. Power for a true +0.72 points: **23 %**; 80 % needs **5 508 loans per arm**. *"FPD is 0.7 points higher in B, which is within chance, but this test could not have detected a difference of that size; the interval runs up to +1.9 points, beyond the +0.9 to +1.25 points at which B stops paying for itself — so the guardrail is not cleared, it is unknown."*
</details>

**P10.** Segments: lift by device, new vs returning and segment, raw and Holm-adjusted p-values; then the interaction test new vs returning. Which sentence about segments is allowed on the slide?

<details><summary>Answer</summary>
Lifts +0.87 (Android, p 0.030), +0.94 (iOS, 0.31), +0.85 (new, 0.093), +0.96 (returning, 0.068), +1.71 (affluent, 0.047), +0.63 (mass, 0.17), +0.87 (sme, 0.30); **Holm: smallest 0.21** — none significant. Interaction new vs returning: z = −0.15, **p = 0.88**. Allowed: *"The lift is positive in every pre-registered segment and we find no evidence that it differs between segments."* Not allowed: "it works for affluent users" or "it works on Android only".
</details>

<span class="badge stretch">Stretch</span> **P11.** Redo Day 1's unit economics with today's numbers (conversion, average principal per arm, FPD per arm; interest = 9.856 % of principal, i.e. 266 662 ÷ 2 705 586 as on Nur's Micro book; LGD 60 %). Profit per 1 000 viewers per arm; B's break-even FPD; B's profit if its FPD were at the upper end of the CI.

<details><summary>Answer</summary>
A: conversion 7.98 %, principal 2 563 847 → I = 252 692, L = 1 538 308, FPD 1.51 % → 225 638 per loan → **17 996 742** per 1 000 viewers. B: 8.86 %, 2 494 675 → I = 245 875, L = 1 496 805, FPD 2.23 % → 207 004 per loan → **18 339 646** (+1.9 %). Break-even FPD for B: **2.45 %**, i.e. **+0.94 points** over A (smaller than Day 1's +1.25 because B's loans are slightly smaller). At the CI's upper end (A + 1.94 = 3.45 %): **16 454 966**, 8.6 % below A. Expected gain small and positive; the bad case is bigger than the good one — exactly why the rollout is staged.
</details>

### Mistakes people make

- Reading the dashboard's p-value before checking that rows are users and that the split is 50/50 everywhere.
- Checking SRM only overall (p = 0.09 "fine") — or only by day — and never by client × period.
- "Correcting" an SRM by reweighting instead of finding the bug and removing the broken cell.
- Keeping users who saw both variants ("only 1 %").
- Including the launch-day spike; or, the opposite, removing days **because** they hurt the result (exclusions must follow the pre-registered rule).
- A relative-lift CI computed by dividing the difference's CI by the control rate.
- A t-test on skewed money with the conclusion "loans are smaller" from p = 0.20.
- "FPD not significant, guardrail passed" from a test with 23 % power.
- Quoting the best segment (affluent +1.7, p = 0.047) without Holm, or "works on Android but not iOS" without an interaction test.
- A decision memo with no decision — "the results are interesting" is not ship, don't or extend.

---

## 4. Homework

**HW 7.1** (the design document + the A/A check, Day 1) is due **tomorrow** in `submissions/week-07/day-1/`. Today's three TODO functions are practice, not graded — but the checkpoint (Day 5, Part A) is this analysis written up in full, so keep the notebook.

---

## 5. Self-check

1. The overall SRM p-value is 0.09. Is the split fine? What would you check next, and why that? *(→ section 1, "Step 1b", P3)*
2. The FPD difference is "not significant" (p = 0.23). Can Nilufar sign off the guardrail? *(→ "Step 3c", P9)*
3. Why exclude the first three days — and what would make that exclusion illegitimate? *(→ "Step 1d", P5, Mistakes)*

---

## 6. Company corner <span class="badge company">The experiment readout</span>

Every experiment ends on **one slide** with eight lines in this order. Kamola reads the first and the last; Nilufar the guardrails; Jasur the sanity checks; the line nobody reads is the one that will be asked about in three months. Here it is twice — as the dashboard would have filled it, and after the cleaning.

| # | Line | Dashboard version (raw rows) | **Clean version** |
|---|---|---|---|
| 1 | **Hypothesis** | A single button and the monthly payment in large type make more viewers sign a contract. | same |
| 2 | **Design** | user-level 50/50 hash split (`offer_screen_v2`), 1–28 Aug 2026, primary = signed within 7 days, α 5 % two-sided, MDE +0.9 pt, power 77 % at ~14 000/arm | same |
| 3 | **Sanity checks** | "split 49.5 / 50.5, OK" | **300 users in both variants removed; SRM in iOS 22–28 Aug (537 / 822, p ≈ 10⁻¹⁴: client bug) — cell removed from both arms; novelty spike on 1–3 Aug (+3.4 pt) — excluded as pre-registered.** After cleaning: 11 472 / 11 434, SRM p = 0.80 |
| 4 | **Primary result** | 8.28 % → 9.37 %, +1.09 pt (+0.42 to +1.75), p = 0.0014, **+13.1 %** | 7.98 % → 8.86 %, **+0.88 pt (+0.16 to +1.60), p = 0.016, +11.1 % (+2.0 to +21.0)** |
| 5 | **Guardrails** | FPD 1.66 % → 2.64 % (19 / 1 147 vs 35 / 1 324: loans of every raw row that converted within 7 days, leaked users in both arms), p = 0.094 — "almost significantly worse" | FPD 1.51 % → 2.23 %, +0.72 pt (−0.49 to +1.94), p = 0.23, **power 23 %**; break-even +0.94 pt — **not cleared, not failed: unknown**. Principal −2.7 % (MW p = 0.32) |
| 6 | **Segments** | "affluent +1.7 pt, p = 0.047!" | 7 pre-registered cuts, all positive, none after Holm (min 0.21); no interaction (new vs returning p = 0.88) |
| 7 | **Decision** | "ship" (or, from line 5, a panic) | **Ship B in stages:** 100 % of offer views with a **10 % hold-out on A** for ten weeks; stop and roll back if B's FPD exceeds A's by more than 0.94 pt on ≥ 2 000 matured B loans |
| 8 | **What we learned** | — | The lift is in *finishing* (submit → signed), not in starting; novelty is real in this app (on the first 3 days B converted 1.4 times as often as A); the iOS client must log assignment failures — **fix before the next test**; a guardrail test on FPD needs ~5 500 loans per arm, so risk guardrails need hold-outs, not the A/B window |

**How the conclusion changes.** The direction does not: B is better on conversion in every version. Three things change: the **size** (+1.09 → +0.88 points; +13 % → +11 %, and the lower end of the interval from +0.42 to +0.16), the **guardrail story** (raw: FPD p = 0.094, which would have started an argument about a "nearly significant" risk increase; clean: an honest "we cannot tell, so we keep a hold-out"), and the **credibility**: a slide that says *what was removed and why* survives the first question from the CFO; the dashboard's version does not survive Jasur.

> Interview version: *"Walk me through how you analyse an A/B test."* — Sanity first: one row per unit, the sample ratio overall and by the slices the software ships in, units in both arms, the assignment rule recomputed; then the primary metric with a CI and a test, as decided before the start; then guardrails (with their power) and the money; then pre-registered segments with a correction; then a decision — ship, don't, extend, or ship in stages — and what we learned for the next test.

Tomorrow: the numbers move to Power BI. Timur's Excel one-pager breaks every month; the dashboard should refresh itself.

---

## Day quiz

Pass with 80 % to finish the day. Retry as often as you like.

```quiz
{"id": "w07d2", "pass": 0.8, "questions": [
  {"type": "single", "q": "What do you check next?", "code": "len(users), users[\"user_id\"].nunique()\n# (10000, 9900)", "options": ["Which user ids have several rows, and whether those users were assigned to both variants", "Drop the second row of each repeated user and move on", "Reweight the arms", "Nothing — 1 % is noise"], "answer": 0, "explain": "One row must be one user; a user who saw both screens belongs to neither arm, and events without a variant column would be counted in both (→ section 1, 'Step 1a')."},
  {"type": "multi", "q": "Which checks belong to step 1, before the primary result is read?", "options": ["One row per user (rows vs unique ids)", "The sample ratio overall and by the slices the software ships in (client × release week)", "The daily lift chart for novelty", "Holm-corrected segment results", "Recompute every row's variant from the hash"], "answer": [0, 1, 2, 4], "explain": "Segments are step 4; a result read before the sanity checks is a number from a possibly broken machine (→ section 1, 'The order of an analysis')."},
  {"type": "single", "q": "The overall SRM p-value is 0.09. Is the split fine?", "options": ["Not shown: a broken cell holding a few per cent of users is diluted overall; check by device × week and other release slices", "Yes — p is above 0.05", "No — p must be above 0.5", "Only if every single day is fine too"], "answer": 0, "explain": "Slice by how the software ships; a daily check is too thin to see a small cell (→ section 1, 'Step 1b', P3)."},
  {"type": "single", "q": "You find a slice whose split is clearly broken. What do you do?", "options": ["Remove its B users only", "Keep it — the overall split is fine", "Remove it from both arms, report the exclusion and its size — or re-run if it is large", "Reweight it back to 50/50"], "answer": 2, "explain": "Within a broken cell the arms are not comparable; reweighting hides the bug instead of finding it (→ section 1, 'Step 1c', Mistakes)."},
  {"type": "single", "q": "How do you get the 95 % CI of the relative lift?", "code": "lo, hi   = confint_proportions_2indep(kB, nB, kA, nA, method=\"newcomb\")                  # difference B − A\nrlo, rhi = confint_proportions_2indep(kB, nB, kA, nA, compare=\"ratio\", method=\"log\")    # ratio B / A", "options": ["Divide lo and hi by A's rate", "(hi − lo) / 2", "A relative lift has no interval", "rlo − 1 and rhi − 1, from the ratio's interval"], "answer": 3, "explain": "The relative interval comes from the ratio's CI (log method) minus 1, not from dividing the difference's limits by the control rate (→ section 1, 'Step 2', Mistakes)."},
  {"type": "single", "q": "A guardrail test on FPD gives p = 0.30, and its power was 25 %. What can you say?", "options": ["Unresolved: compare the upper end of the difference's CI with the break-even; if it crosses, ship in stages with a hold-out", "The guardrail passed", "FPD got worse", "Extend the test until p < 0.05"], "answer": 0, "explain": "'Not significant' from an underpowered test means almost nothing (→ section 1, 'Step 3c', 'Step 5')."},
  {"type": "number", "q": "Seven pre-registered segments; the smallest raw p-value is 0.030. What is its Holm-adjusted p-value?", "answer": 0.21, "tol": 0.005, "explain": "Holm multiplies the smallest p by the number of tests: 0.030 × 7 = 0.21 — not significant; a segment difference also needs an interaction test (→ section 1, 'Step 4')."},
  {"type": "single", "q": "Company corner: on the one-slide readout, which line comes right before the primary result?", "options": ["What we learned", "Sanity checks — what was removed and why, and the split after cleaning", "The decision", "Segments"], "answer": 1, "explain": "Hypothesis, design, sanity checks, primary, guardrails, segments, decision, learned — a slide that says what was removed survives the CFO (→ Company corner)."}
]}
```

<!-- challenge:start -->

---

## Daily challenge

A bonus for the curious: one harder question on today's topic. Solve it for XP that grows with your challenge streak — a full week of five also adds 10 % to Friday's voucher.

```challenge
{"id": "w07d2", "q": "Someone wants 'the new screen works best for affluent customers' on Kamola's slide. On the clean population (22 906 users, as in today's worked example), test whether the lift differs between the affluent and the mass segment: lift = B rate − A rate in each segment, z = (lift_affluent − lift_mass) / √(sum of the four p(1−p)/n terms), two-sided normal p-value. What is the p-value? Give it to 3 decimals.", "type": "number", "dp": 3, "h": ["3856b54f1bed84556d3b839e"], "hint": "Each segment's lift has its own unpooled variance; the variance of a difference of two independent lifts is the sum of the two.", "sol": "ZGVmIGxpZnQoZCk6CiAgICBnID0gZC5ncm91cGJ5KCJ2YXJpYW50IilbImNvbnYiXS5hZ2coWyJtZWFuIiwgInNpemUiXSkKICAgIHBhLCBuYSwgcGIsIG5iID0gZy5sb2NbIkEiLCAibWVhbiJdLCBnLmxvY1siQSIsICJzaXplIl0sIGcubG9jWyJCIiwgIm1lYW4iXSwgZy5sb2NbIkIiLCAic2l6ZSJdCiAgICByZXR1cm4gcGIgLSBwYSwgcGEgKiAoMSAtIHBhKSAvIG5hICsgcGIgKiAoMSAtIHBiKSAvIG5iCmQxLCB2MSA9IGxpZnQoY1tjWyJzZWdtZW50Il0gPT0gImFmZmx1ZW50Il0pICAgICAjICsxLjcxIHB0CmQyLCB2MiA9IGxpZnQoY1tjWyJzZWdtZW50Il0gPT0gIm1hc3MiXSkgICAgICAgICAjICswLjYzIHB0CnogPSAoZDEgLSBkMikgLyBucC5zcXJ0KHYxICsgdjIpICAgICAgICAgICAgICAgICAgIyAxLjExCjIgKiBzdGF0cy5ub3JtLnNmKGFicyh6KSkgICAgICAgICAgICAgICAgICAgICAgICAgIyAwLjI2NwoKcCA9IDAuMjY3OiB0aGUgYWZmbHVlbnQgbGlmdCAoKzEuNzEgcG9pbnRzKSBpcyBsYXJnZXIgdGhhbiB0aGUgbWFzcyBsaWZ0ICgrMC42MyksIGJ1dCBhIGdhcCBvZiB0aGF0IHNpemUgYmV0d2VlbiB0d28gc2VnbWVudHMgd291bGQgYXBwZWFyIGJ5IGNoYW5jZSBhYm91dCBvbmUgdGltZSBpbiBmb3VyLgonU2lnbmlmaWNhbnQgaW4gYWZmbHVlbnQgKHAgPSAwLjA0NyksIG5vdCBpbiBtYXNzIChwID0gMC4xNyknIGlzIG5vdCBldmlkZW5jZSB0aGF0IHRoZSBlZmZlY3QgZGlmZmVycyDigJQgb25seSB0aGUgaW50ZXJhY3Rpb24gdGVzdCBhbnN3ZXJzIHRoYXQsIGFuZCBpdCBzYXlzIG5vLgpUaGUgc2xpZGUga2VlcHMgdGhlIGFsbG93ZWQgc2VudGVuY2U6IHRoZSBsaWZ0IGlzIHBvc2l0aXZlIGluIGV2ZXJ5IHNlZ21lbnQgYW5kIHdlIGZpbmQgbm8gZXZpZGVuY2UgdGhhdCBpdCBkaWZmZXJzIGJldHdlZW4gdGhlbS4gKFRoZSBzYW1lIGZvcm11bGEgZ2l2ZXMgcCA9IDAuODggZm9yIG5ldyB2cyByZXR1cm5pbmcsIGFzIG9uIHRoZSBwYWdlLik="}
```

<!-- challenge:end -->
