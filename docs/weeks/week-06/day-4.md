# Week 6 · Day 4 — Hypothesis tests II: non-parametric tests, multiple comparisons and power

<span class="badge">Learn 60 min</span> <span class="badge">Worked example 15 min</span> <span class="badge">Practice 50 min</span> <span class="badge">Reference card</span> <span class="badge hw">Checkpoint tomorrow</span> <span class="badge company">Company corner</span>

> STORY **Thursday, 9:00.** Jasur, laptop open, a slide from marketing on the screen: *"New SMS reminder three days before the first due date — cuts first-payment defaults!"* *"Your risk-committee note worked: Nilufar wants a fix for the app's FPD, and marketing has one. They want to send the SMS to **2 000 loans** and compare. My question is the one nobody in marketing asks: **is 2 000 enough?** If the SMS really takes FPD from 1.28 % to 1 %, what is the chance a test on 2 000 loans even notices? And while you are at it — Nilufar circled Bukhara as 'the worst branch'. Ten branches, ten tests. Tell me what that does to your 5 %."*

## Today in 3 lines

- When the t-test's assumptions break — skewed days late, a few huge values, tiny groups — use tests on **ranks** (**Mann–Whitney**, **Wilcoxon**, **Kruskal–Wallis**), a **permutation test** built by shuffling, and **Fisher's exact test** instead of χ² when expected counts fall below 5.
- Ten tests at α = 5 % give a **30–40 %** chance of at least one false alarm: **Bonferroni** and **Holm** fix the family-wise error — Bukhara's p = 0.020 becomes 0.199.
- **Power** decides whether a test can answer before you run it: detecting FPD 1.28 % → 1.00 % needs **22 481 loans per arm**; Jasur's 2 000 loans have **9 % power** (13 % even at 2 000 per arm) — and you leave with a one-page **test-choice card** for tomorrow's checkpoint.

---

## 1. Learn — when the textbook test does not fit

### When t-tests break

The t-test compares **means** and leans on the CLT. It is fragile when (1) the data are heavily skewed **and** n is small, (2) a few extreme values dominate the mean, (3) the question is not about the mean at all. Days late is the lending example: most payments arrive 1–3 days **early**, the median is **−1 day for every product**, and a thin tail of 30–60-day payments drags the means apart (skew ≈ 5). Auto vs SME:

| | n payments | mean days | median | share paid late | share > 30 days | 99th percentile |
|---|---|---|---|---|---|---|
| Auto | 4 688 | −0.21 | −1 | 10.1 % | 0.85 % | 28 |
| SME | 8 222 | +0.04 | −1 | 12.4 % | 1.02 % | 31 |

**Welch: t = −2.34, p = 0.0195. Mann–Whitney: p = 0.32.** Both are right — they answer different questions. Welch: "are the **average** days late different?" — yes, because SME has a slightly heavier late tail. Mann–Whitney: "does a randomly chosen SME payment tend to be later than a randomly chosen Auto payment?" — no, the probability is 0.505 (U / n₁n₂ = 0.495 for Auto over SME), a coin toss. Decide which question the business is asking **before** choosing the test; never run both and report the one you like.

### Mann–Whitney U — comparing two groups by ranks

The **Mann–Whitney U test** (*U-критерий Манна–Уитни*, also Wilcoxon rank-sum) pools both groups, ranks every value (ties get the average rank), and asks whether one group's ranks are systematically higher. H₀: the two distributions are the same — formally, P(X > Y) = P(Y > X). It is **not** a test of medians unless the two shapes are identical (Auto and SME have the same median and still differ in the tail). It is robust to outliers (a 60-day payment is just "the highest rank"), needs no normality, and loses little power when the data *are* normal.

```python
stats.mannwhitneyu(a, b, alternative="two-sided")       # statistic U, p-value
u.statistic / (len(a) * len(b))                          # effect size: P(a random A > a random B) + ½ P(tie)
```

### Wilcoxon signed-rank — the paired version

For paired data the **Wilcoxon signed-rank test** (*критерий Вилкоксона для связанных выборок*) ranks the absolute differences and compares the sums of positive and negative ranks. Yesterday's ten branches, 2025 vs 2026 FPD30: `stats.wilcoxon(w[2026], w[2025])` → W = 7, **p = 0.037** (exact, for n = 10), against the paired t-test's 0.031. Nine of ten branches improved; the ranks say the same as the means.

### Kruskal–Wallis — three or more groups

The **Kruskal–Wallis test** (*критерий Краскела–Уоллиса*) is Mann–Whitney for k groups (and ANOVA's rank cousin — ANOVA is in the RU deck pp. 36–46). Days late by grade: H = 935, **p ≈ 2 × 10⁻²⁰²** (means −0.87 / −0.31 / +1.05 / +2.96; medians −1 / −1 / −1 / 0). Days late by product: H = 61.0, p = 1.8 × 10⁻¹² (ANOVA F = 19.3, p = 7.5 × 10⁻¹⁶). A significant omnibus test says "at least one group differs", not which — follow with pairwise tests **and** a multiple-comparisons correction.

### Permutation test — build the null by shuffling

If H₀ is true, the channel label is irrelevant: shuffling it should produce gaps as large as the real one often. A **permutation test** (*перестановочный тест*) does exactly that: shuffle the labels 10 000 times, recompute the statistic each time, p = share of shuffles at least as extreme as the observed value.

```python
y, is_app = ab["fpd30"].to_numpy(), (ab["channel"] == "app").to_numpy()
obs = y[is_app].mean() - y[~is_app].mean()                       # +0.6586 points
g = np.random.default_rng(2026)
diffs = [ (lambda s: y[s].mean() - y[~s].mean())(g.permutation(is_app)) for _ in range(10_000) ]
np.mean(np.abs(diffs) >= abs(obs))                                # p = 0.0326 (z-test 0.0318, Fisher 0.0344)
```

Three methods, one answer for app vs branch. The permutation test's strength is that **any statistic** works — a difference in medians, in collection rates (Σ paid / Σ due), in the 90th percentile — with no formula and no normality, only the assumption that the units are exchangeable under H₀. It is the honest default for small, odd-shaped samples, and it is what tomorrow's A/B-test week builds on.

### The bootstrap as a test — "is zero in the interval?"

The RU deck's recipe (pp. 20–21): resample each group with replacement, compute the difference each time, build the 95 % interval of the difference, and check whether 0 is inside. App − branch FPD, 10 000 resamples:

```python
g = np.random.default_rng(2026)
a, b = f.loc[f.channel == "app", "fpd30"].to_numpy(), f.loc[f.channel == "branch", "fpd30"].to_numpy()
d = [g.choice(a, len(a)).mean() - g.choice(b, len(b)).mean() for _ in range(10_000)]
np.quantile(d, [0.025, 0.975])          # +0.05 to +1.30 points — zero is outside; Newcombe gave +0.05 to +1.33
```

Use it for differences that have no formula — medians, percentiles, ratios of sums. The permutation test answers "could the labels be irrelevant?"; the bootstrap interval answers "how big is the difference, give or take?". Report both when the stakes justify it.

### Chi-square or Fisher — small tables

The χ² test is an approximation that needs **expected counts ≥ 5**. Thin cells are everywhere in lending — a vintage × channel, a branch-month. The 2026-05 vintage, partner vs branch: 4 FPDs in 67 vs 2 in 179.

```python
t = [[4, 63], [2, 177]]
stats.chi2_contingency(t)[3]                 # expected [[1.63, 65.37], [4.37, 174.63]] — two cells below 5
stats.chi2_contingency(t)[1]                 # 0.083  (Yates);   correction=False → 0.028
stats.fisher_exact(t)                        # odds ratio 5.62, p = 0.0485
```

**Fisher's exact test** (*точный критерий Фишера*) computes the probability of every table with the same margins — exact at any n. Here the two χ² versions disagree with each other (0.028 vs 0.083) and Fisher sits between them. Use Fisher whenever an expected count is below 5; with modern computers you can simply use it for every 2 × 2.

### Multiple comparisons — ten tests, one false alarm

Each test at α = 5 % has a 5 % false-alarm rate. Run m independent tests on data with **no** real effects and the chance of at least one false alarm — the **family-wise error rate** (*групповая вероятность ошибки*, FWER) — is 1 − 0.95^m: **40.1 %** for 10 tests, 80 % for 32. The notebook simulates it for Nur's ten branches with identical true FPD rates (20 000 books, each branch tested against the book rate with an exact binomial test): a single test is "significant" **3.6 %** of the time (an exact test on counts this small stays under 5 %), and **30.6 %** of books have at least one "significant" branch. Somebody is always flagged.

Corrections (*поправки на множественные сравнения*):

- **Bonferroni**: test each at α / m (or multiply each p by m, cap at 1). Simple, guarantees FWER ≤ α, conservative. In the simulation: **2.3 %** of books with a false alarm.
- **Holm** (step-down): sort p ascending; multiply the smallest by m, the next by m − 1, …; keep the running maximum. Same guarantee as Bonferroni, never less powerful — the default.
- **Benjamini–Hochberg** controls the *false discovery rate* (the share of flagged results that are false) rather than FWER — for screening hundreds of segments.

Bukhara vs the other branches (Fisher): **p = 0.020** — "significant". Holm across the ten branches: **0.199**. The omnibus χ² of FPD × branch: χ² = 9.97, df 9, **p = 0.35**. Bukhara is the branch to watch, not the branch to punish.

```python
from statsmodels.stats.multitest import multipletests
multipletests(pvals, alpha=0.05, method="holm")      # [reject flags, adjusted p-values, ...]; "bonferroni", "fdr_bh"
```

### Power and sample size

**Power** (*мощность критерия*) = P(reject H₀ | the effect is real) = 1 − β. It depends on four things: **α** (stricter → less power), the **effect size** (smaller → less), **n** (more → more), and the **noise** — for a rate, how close to 0 % it is. Convention: plan for 80 % power at α = 5 %. For two proportions the effect size is **Cohen's h** = 2·arcsin√p₁ − 2·arcsin√p₂, and the loans needed **per arm**:

```
n = 2 · ( (z₁₋α/₂ + z₁₋β) / h )²       FPD 1.28 % → 1.00 %:  h = 0.02642;   n = 2 · ((1.960 + 0.842) / 0.02642)² = 22 481
```

```python
from statsmodels.stats.proportion import proportion_effectsize
from statsmodels.stats.power import NormalIndPower, zt_ind_solve_power
h = proportion_effectsize(0.0128, 0.010)                                   # 0.02642
zt_ind_solve_power(effect_size=h, alpha=0.05, power=0.80)                  # 22 480.8 → 22 481 per arm
NormalIndPower().power(h, nobs1=1000, alpha=0.05)                          # 0.091 — power with 1 000 per arm
```

Excel: `=2*((NORM.S.INV(0.975)+NORM.S.INV(0.8))/(2*ASIN(SQRT(0.0128))-2*ASIN(SQRT(0.01))))^2` → 22 481. Rare outcomes are expensive to test: a 20 % relative cut on a 13 % metric needs about ten times fewer loans (P10).

### MDE — what can this test see?

Turn it round: with n fixed, the **minimum detectable effect** (*минимальный детектируемый эффект*, MDE) is the smallest true change that the test detects with 80 % power. From 1.28 % FPD: 1 000 per arm → **0.26 %** (an 80 % cut); 2 000 per arm → **0.48 %** (a 63 % cut); 10 000 per arm → 0.87 % (a 32 % cut); 22 481 per arm → exactly 1.00 %. If the MDE is larger than any effect the intervention could plausibly have, the test cannot succeed — and a "no significant difference" from it means nothing.

### The power curve — read it before you promise anything

Power by loans per arm (α 5 %, two-sided), for the FPD effect and for a 20 % cut in "first instalment paid late at all" (13.34 % → 10.67 %, P10):

| loans per arm | 1 000 | 2 000 | 5 000 | 10 000 | 22 481 | 30 000 |
|---|---|---|---|---|---|---|
| FPD30 1.28 → 1.00 % | 9.1 % | 13.3 % | 26.2 % | 46.4 % | **80.0 %** | 89.9 % |
| late at all 13.3 → 10.7 % | 45.2 % | **73.9 %** | 98.4 % | ≈ 100 % | ≈ 100 % | ≈ 100 % |

`[NormalIndPower().power(h, nobs1=n, alpha=0.05) for n in ns]`. Power rises slowly and then saturates; the two rows are the same SMS judged on two metrics.

### Peeking — the multiple-comparisons problem in time

An experiment that runs for months invites a look every month, stopping "when it is significant". Each look is another test. Simulate an SMS that does **nothing** (both arms 13.34 % late, 150 loans per arm per month, 12 months, 20 000 runs, `default_rng(2026)`): testing once at the end gives a **5.05 %** false-positive rate; looking every month and stopping at the first p < 0.05 gives **20.9 %** — a "winning" SMS one time in five, typically declared in month 3. Fix the sample size and the end date in advance (or use a sequential design built for peeking — week 7).

### The A/A test

An **A/A test** (*A/A-тест*) splits units into two groups that receive the **same** treatment and runs the planned analysis. It should be "significant" about α of the time. Split Nur's real FPD loans into random halves of 2 000 two thousand times: **4.9 %** false positives — the splitting and the test behave. In practice an A/A run checks the **experiment system** (randomisation, logging, the metric pipeline) before a real A/B test trusts it; a 15 % A/A false-positive rate means a broken split, not a lucky one. That is week 7's starting point.

### Depth (optional)

**Videos (free, YouTube; each link opens at the right minute):**

- ▶ Mann–Whitney — [Mann-Whitney U Test [Simply explained] (numiqo), 00:23](https://youtu.be/LcxB56PzylA?t=23)
- ▶ Wilcoxon signed-rank and the other rank tests — [Non-parametric tests - Sign test, Wilcoxon signed rank, Mann-Whitney (zedstatistics), 11:26](https://youtu.be/IcLSKko2tsg?t=686&end=1230)
- ▶ Multiple comparisons — [The Bonferroni Correction - Clearly Explained (Steven Bradburn), 01:31](https://youtu.be/HLzS5wPqWR0?t=91)
- ▶ Multiple comparisons and false discovery rate — [False Discovery Rates, FDR, clearly explained (StatQuest), 12:28](https://youtu.be/K8LQSvtjcEo?t=748)
- ▶ Multiple comparisons (RU, simulation) — [Множественная проверка гипотез | Вероятность и статистика #8 (Глеб Михайлов), 45:32](https://youtu.be/qbbY7ubzDoE?t=2732&end=2898)
- ▶ Statistical power — [Statistical Power, Clearly Explained!!! (StatQuest), 03:19](https://youtu.be/Rsc5znwR5FA?t=199&end=297)
- ▶ Power and sample size calculation — [Power Analysis, Clearly Explained!!! (StatQuest), 11:48](https://youtu.be/VX_M3tIyiYk?t=708&end=910)
- ▶ Power calculations (also p-hacking) — [p-hacking and power calculations (StatQuest), 14:12](https://youtu.be/UFhJefdVCjE?t=852)
- ▶ Sample size in an A/B setting (RU) — [Самая ПОЛНАЯ и ПОНЯТНАЯ лекция по A/B тестам (Noukash), 17:57](https://youtu.be/FEI1OA-zgb8?t=1077&end=1482)

- RU deck (TBC Data Analytics 2.0, if you have it) `Непараметрические тесты_latest.pdf` (lesson 5.5): normality checks and log-transform pp. 9–12, which test to choose pp. 13–14, ranks and Mann–Whitney pp. 15–16, Wilcoxon for paired samples pp. 17–18, Kruskal–Wallis p. 19, bootstrap pp. 20–21, power p. 22, MDE p. 23, A/A tests p. 24. Multiple comparisons: `Параметрические тесты (2).pdf` pp. 47–49 (Bonferroni, Tukey HSD).
- Notebooks: `non-parametric.ipynb` (sample-mean normality, Mann–Whitney on exponential data, Wilcoxon, Kruskal–Wallis, bootstrap), `power.ipynb` (power by simulation: 1 000 t-tests on a 1 % shift — the same idea as our simulation cell). `стат_критерии.docx` is a reading list (Habr / YouTube articles on test choice, Mann–Whitney pitfalls, sample size); the card in section 2 is our own.
- *Russian terms:* непараметрический критерий = non-parametric test, ранг = rank, U-критерий Манна–Уитни = Mann–Whitney U, критерий Вилкоксона = Wilcoxon signed-rank, критерий Краскела–Уоллиса = Kruskal–Wallis, перестановочный тест = permutation test, точный критерий Фишера = Fisher's exact test, множественные сравнения = multiple comparisons, поправка Бонферрони / Холма = Bonferroni / Holm correction, мощность = power, объём выборки = sample size, MDE (минимальный детектируемый эффект) = minimum detectable effect, A/A-тест = A/A test.

---

## 2. Reference card — which test? (keep it open tomorrow)

| Outcome | Groups | Paired? | Test (Python) | When it breaks → instead |
|---|---|---|---|---|
| rate (yes/no) | 1 vs a known value | — | exact binomial `stats.binomtest` | — |
| rate | 2 | no | two-proportion z `proportions_ztest`, or χ² 2 × 2 | expected < 5 → **Fisher** `fisher_exact` |
| rate | 2 | yes (same loans, two moments) | **McNemar** `statsmodels.stats.contingency_tables.mcnemar` | — |
| rate | 3+ (or two categoricals) | no | **χ² of independence** `chi2_contingency` | thin cells → pool, or Fisher–Freeman–Halton / permutation |
| mean of a number | 1 vs a value | — | one-sample t `ttest_1samp` | skewed, small n → Wilcoxon signed-rank vs the value |
| number | 2 | no | **Welch t** `ttest_ind(equal_var=False)` | skewed + small n, outliers, "typical" question → **Mann–Whitney**; any statistic → permutation |
| number | 2 | yes | paired t `ttest_rel` | → **Wilcoxon** `wilcoxon` |
| number | 3+ | no | one-way ANOVA `f_oneway` (+ Tukey) | → **Kruskal–Wallis** `kruskal` (+ pairwise MW with Holm) |
| two numbers together | — | — | Pearson `pearsonr` | outliers, monotone not linear → Spearman `spearmanr` |
| median, ratio, percentile | any | either | bootstrap CI / permutation | — |
| many tests at once | — | — | add **Holm** (`multipletests`) | screening hundreds → BH (FDR) |
| before running anything | — | — | **power / sample size** `zt_ind_solve_power`, `TTestIndPower` | MDE too large → change the metric or the n |

Three questions pick the row: **what kind of outcome** (rate or number), **how many groups**, **same units twice or not**. Then the last column asks whether the default's assumptions hold.

---

## 3. Worked example — "Bukhara is the worst branch" (15 min)

**1. The claim.** Bukhara Central: 14 FPDs in 586 loans = 2.39 %, against 1.28 % for the book.

**2. The right test for one branch.** Bukhara vs the other nine: 14 / 586 vs 77 / 6 513; counts are fine but small — Fisher: **p = 0.020** (odds ratio 2.05). Taken alone, "significant".

**3. But it was chosen because it was the highest of ten.** Test all ten the same way (notebook section 4) and correct: Holm-adjusted p for Bukhara **0.199**; no other branch below 0.27 before correction. The omnibus χ² across the ten branches: **p = 0.35**.

**4. What chance does.** In books where all ten branches share the same true rate, 31 % have at least one branch flagged at 5 % (the notebook's simulation); yesterday's Company corner showed the top branch averaging 2.00 % by luck alone.

**5. The sentence.** *"Bukhara's 2.39 % is the highest of ten branches, but once we account for testing ten branches it is within what chance produces (Holm-adjusted p = 0.20); we will watch its Q4 vintages and its product mix rather than act now."*

---

## 4. Practice (50 min)

Open `data/python/week6/day4_starter.ipynb`; the loader builds `f` (FPD loans) and `x` (payments with `days_late`). Add a cell per task.

**P1.** Auto vs SME days late: describe both (n, mean, median, share late, 99th percentile), then Welch and Mann–Whitney. Marketing asks "do SME borrowers pay later than Auto borrowers?" — which test answers that, and what is your answer?

<details><summary>Answer</summary>

Auto 4 688 payments, mean −0.21, median −1, 10.1 % late, 99th pct 28; SME 8 222, +0.04, −1, 12.4 %, 31. Welch t = −2.34, **p = 0.0195**; Mann–Whitney **p = 0.32**, P(Auto later than SME) = 0.495. "Do SME borrowers pay later" is a question about the typical payment → Mann–Whitney: **no**, a random SME payment is no more likely to be later. What *is* different is the tail: 12.4 vs 10.1 % paid late at all (a proportions question: test it as one).

</details>

**P2.** Wilcoxon signed-rank on the ten branches' FPD30, 2025 vs 2026, next to the paired t-test. Why might you prefer Wilcoxon here?

<details><summary>Answer</summary>

`stats.wilcoxon(w[2026], w[2025])` → W = 7, **p = 0.037** (exact); paired t p = 0.031. With n = 10, the paired t leans on the differences being roughly normal, which ten branch-level differences (one of them +0.99, Tashkent North) cannot show; Wilcoxon needs only symmetry of the differences and is barely less powerful. Both agree: 2026 vintages are better.

</details>

**P3.** Kruskal–Wallis on days late across the five products, then one-way ANOVA (`stats.f_oneway`). Which product drives the result?

<details><summary>Answer</summary>

Kruskal–Wallis H = 61.0, **p = 1.8 × 10⁻¹²**; ANOVA F = 19.3, p = 7.5 × 10⁻¹⁶. Means: Micro **+0.56**, SME +0.04, Consumer −0.01, BNPL −0.02, Auto −0.21 (all medians −1). Micro is the odd one out: 16.3 % of its payments are late against 10–12 % elsewhere. Next step: pairwise Mann–Whitney Micro vs each (four tests → Holm).

</details>

**P4.** Permutation test for the difference in **mean** days late, Auto − SME (10 000 shuffles, `default_rng(2026)`). Compare with Welch.

<details><summary>Answer</summary>

Observed −0.248 days; permutation **p = 0.023**; Welch 0.0195. The permutation test makes no normality assumption about the mean and agrees: the *means* differ (the tail), while Mann–Whitney (P1) says the *typical* payment does not. Same data, three tests, two questions.

</details>

**P5.** The 2026-05 vintage, partner vs branch (4 / 67 vs 2 / 179). Expected counts, χ² with and without Yates, Fisher. Which do you report, and what do you conclude?

<details><summary>Answer</summary>

Expected FPDs 1.63 and 4.37 — two cells below 5, χ² unreliable. Yates **0.083**, uncorrected **0.028**, Fisher **0.0485**. Report Fisher. Conclusion: borderline evidence that partner's May vintage was worse — and it is one vintage of 32 and one channel pair of three, so after any correction it is noise. Six FPDs in total cannot carry a decision.

</details>

**P6.** Holm by hand (your TODO) on the three channel-pair p-values from yesterday: app–branch 0.0318, app–partner 0.153, partner–branch 0.804. Then Bonferroni.

<details><summary>Answer</summary>

Sorted 0.0318, 0.153, 0.804 → × 3, × 2, × 1 = 0.0954, 0.306, 0.804 → running max unchanged → Holm **0.095 / 0.306 / 0.804**; Bonferroni 0.095 / 0.459 / 1.000. Corrected for three comparisons, app vs branch is no longer significant at 5 %. That is why the committee note says "moderate": the answer depends on whether app vs branch was *the* question (it was Bekzod's, asked from the dashboard) or one of three.

</details>

**P7.** The vintage screen: test each of the 31 monthly vintages with ≥ 50 loans against the book rate 1.28 % (exact two-sided binomial). How many are "significant" at 5 %, how many would chance produce, and what survives Holm?

<details><summary>Answer</summary>

`p = min(1, 2·min(binom.cdf(k, n, p0), binom.sf(k − 1, n, p0)))` per vintage: **1 of 31** below 0.05 — **2026-03**, with **0 FPDs in 330** loans (p = 0.028), a suspiciously *good* month; 2025-04 (7 / 225) is next at 0.054. Chance alone would give 31 × 0.05 ≈ 1.6. Holm: 0.88 for 2026-03 — nothing survives. Check 2026-03's zero against the payment data before celebrating (Day 1, P3).

</details>

**P8.** Sample size for the SMS test with other settings: 90 % power; one-sided 80 %. And the achieved power of 1 000 vs 1 000.

<details><summary>Answer</summary>

90 % power: **30 096** per arm; one-sided 80 %: **17 709** per arm (one-sided is cheaper — and only legitimate if "SMS makes it worse" and "no change" lead to the same decision, which for a cheap SMS they arguably do); 1 000 per arm: **9.1 %** power. Every setting is far beyond Nur's ~337 new loans a month (January–September 2026).

</details>

**P9.** MDE: with 1 000, 2 000 and 10 000 loans per arm (α 5 %, power 80 %), what FPD rate must the SMS reach to be detectable from 1.28 %? Use your `mde_rate`.

<details><summary>Answer</summary>

1 000 → **0.26 %** (an 80 % cut); 2 000 → **0.48 %** (63 %); 10 000 → **0.87 %** (32 %). No reminder SMS cuts first-payment defaults by two thirds — the people who default on the first instalment are mostly not people who forgot. So a 2 000-loan FPD test is designed to fail: its most likely outcome is "not significant", which marketing will then read as "the SMS does not work".

</details>

<span class="badge stretch">Stretch</span> **P10.** Change the metric. "First instalment paid late at all" (any day after the due date, or not in full) is far more common than FPD30. Compute its rate on the 7 099 loans, the n per arm to detect a 20 % relative cut, the power of 1 000 vs 1 000, and confirm that power by simulation (20 000 runs, `default_rng(2026)`).

<details><summary>Answer</summary>

947 / 7 099 = **13.34 %** (app 15.9 %, branch 11.8 %, partner 12.6 %). A 20 % cut (13.34 → 10.67 %): **2 324 per arm** (`ceil(2 323.1)`); with 1 000 per arm, power **45 %** by formula, **45.5 %** by simulation. Ten times fewer loans than the FPD30 test needs, because the outcome is ten times more frequent and the SMS acts directly on it (a reminder prevents *lateness*; whether it prevents *default* is a second question). The standard design: a frequent **leading** metric as the primary outcome, FPD30 as a guardrail you monitor but do not power for.

</details>

### Mistakes people make

- Mann–Whitney reported as "the medians differ" — it compares distributions; equal medians can still give p ≈ 0.
- Running t and Mann–Whitney and quoting the smaller p.
- χ² on a table with expected counts of 1–2 (use Fisher).
- Testing ten branches, quoting the one with p < 0.05, no correction — and then "investigating" the noise.
- Bonferroni when Holm gives the same guarantee with more power.
- Planning a test without a power calculation; reading "not significant" from an underpowered test as "no effect".
- Powering for the effect you *hope* for (−50 %) instead of the one that is plausible and worth money.
- An A/B test without an A/A check of the split.
- Peeking every month and stopping at the first p < 0.05 — a 5 % test becomes a 21 % one.

---

## 5. Homework

None today: **Checkpoint 6 is tomorrow** (intervals on Nur data, the test-choice quiz, interview questions). Finish the five TODO functions in `day4_starter.ipynb`; the checkpoint's power task uses them. **HW 6.2** is due tomorrow in Day 2's hand-in box.

---

## 6. Self-check

1. Welch says p = 0.02, Mann–Whitney says p = 0.32 on the same data. Which is wrong? *(→ section 1, "When t-tests break", P1)*
2. You test 20 segments at α = 5 % and find one significant. What is the chance of at least one false alarm if nothing is real, and what do you do? *(→ section 1, "Multiple comparisons", P7)*
3. Name the four things power depends on, and say why an FPD test needs so many loans. *(→ section 1, "Power and sample size", Company corner)*

---

## 7. Company corner <span class="badge company">Sample size for a risk experiment</span>

Jasur's question, answered before anyone sends an SMS.

**Design as proposed.** 2 000 loans: 1 000 get the SMS three days before the first due date, 1 000 do not (random split). Primary outcome: FPD30. Hoped-for effect: 1.28 % → 1.00 % (−22 %). α = 5 %, two-sided.

| Question | Answer | How |
|---|---|---|
| Loans needed per arm for 80 % power | **22 481** (44 962 in total) | `zt_ind_solve_power(proportion_effectsize(0.0128, 0.010), alpha=0.05, power=0.8)` |
| At Nur's pace (337 new loans a month, January–September 2026) | **133 months — 11 years** | 44 962 / 337 |
| Power of the proposed 1 000 vs 1 000 | **9.1 %** | `NormalIndPower().power(h, nobs1=1000, alpha=0.05)` |
| … even with 2 000 SMS vs 2 000 control | **13.3 %** (simulation: 12.5 %) | `nobs1=2000` |
| What 1 000 per arm *can* detect (MDE) | FPD 1.28 → **0.26 %** (−80 %) | `mde_rate(0.0128, 1000)` |
| What 2 000 per arm can detect | 1.28 → **0.48 %** (−63 %) | `mde_rate(0.0128, 2000)` |

**The business reading.** As designed, the test has a 91 % chance of returning "not significant" **even if the SMS works exactly as marketing hopes** — and that result would then be used to kill a good idea. Four honest options for Nilufar and marketing:

1. **Change the primary metric** to a frequent one the SMS acts on: *first instalment paid late at all* (13.3 %). A 20 % cut needs 2 324 per arm — about 14 months of all new loans, or 1 000 + 1 000 with 45 % power. Keep FPD30 as a guardrail.
2. **Use a continuous outcome** (days late on the first instalment) with a t-test or Mann–Whitney — more information per loan than a yes/no.
3. **Run longer, on every new loan**, with a pre-registered stopping date, accepting that FPD30 is a 2027 answer.
4. **Do not test — decide on cost.** An SMS costs a few hundred soum; the 25 m-soum app FPD problem from yesterday's note is small. If the downside of sending it to everyone is negligible, roll it out and monitor; a test is worth its cost only when the decision is expensive to reverse.

What goes back to Jasur, in two sentences: *"2 000 loans give 9 % power for a 1.28 → 1.00 % FPD effect; you would need 22 481 per arm. Test 'first instalment paid late' instead (2 324 per arm for a 20 % cut) with FPD30 as a guardrail — or just send the SMS if it costs less than the analysis."*

> Interview version: *"How would you size an experiment on default rates?"* — Fix α, power and the smallest effect worth acting on; compute Cohen's h and n per arm; translate n into calendar time at the real volume; if it is years, change the metric (a frequent leading indicator), the design (all traffic, longer) or the question — and never read a null result from an underpowered test as "no effect".

Tomorrow: Checkpoint 6 — five analyses on Nur data, twelve test-choice scenarios, eight interview questions.

---

## Day quiz

Pass with 80 % to finish the day. Retry as often as you like.

```quiz
{"id": "w06d4", "pass": 0.8, "questions": [
  {"type": "single", "q": "On the same Auto vs SME days late, Welch gives p = 0.02 and Mann–Whitney p = 0.32. Which is wrong?", "options": ["Mann–Whitney — it ignores the tail", "Welch — the data are skewed", "Both — run a third test", "Neither: Welch asks about the average days late, Mann–Whitney whether a typical payment is later"], "answer": 3, "explain": "Decide which question the business asks before choosing the test, never run both and quote the smaller p (→ section 1, 'When t-tests break', P1)."},
  {"type": "single", "q": "What does the Mann–Whitney U test compare?", "options": ["The means", "The medians", "The variances", "Whether a random value from one group tends to be larger than one from the other — under H₀, P(X > Y) = ½"], "answer": 3, "explain": "It works on ranks and compares whole distributions; equal medians can still differ (→ section 1, 'Mann–Whitney U')."},
  {"type": "single", "q": "Which test do you report for this table?", "code": "t = [[4, 63], [2, 177]]          # partner vs branch, FPD / no FPD\nstats.chi2_contingency(t)[3]      # expected [[1.63, 65.37], [4.37, 174.63]]", "options": ["χ² without correction (p = 0.028)", "A t-test on the two rates", "Fisher's exact test — two expected counts are below 5", "χ² with Yates (p = 0.083)"], "answer": 2, "explain": "χ² is an approximation that needs expected counts ≥ 5; Fisher is exact at any n (→ section 1, 'Chi-square or Fisher', P5)."},
  {"type": "number", "q": "You run 10 independent tests at α = 5 % and nothing is real. What is the chance of at least one false alarm, in %?", "answer": 40.1, "tol": 0.2, "explain": "1 − 0.95¹⁰ = 40.1 % — the family-wise error rate; Holm or Bonferroni bring it back to 5 % (→ section 1, 'Multiple comparisons')."},
  {"type": "single", "q": "What does this return?", "code": "multipletests([0.0318, 0.153, 0.804], method=\"holm\")[1]", "options": ["[0.0954, 0.306, 0.804]", "[0.0318, 0.153, 0.804]", "[0.0106, 0.051, 0.268]", "[0.0954, 0.459, 1.0]"], "answer": 0, "explain": "Holm: the smallest × 3, the next × 2, the last × 1, keeping the running maximum; [0.0954, 0.459, 1.0] is Bonferroni (→ P6)."},
  {"type": "multi", "q": "Power depends on…", "options": ["α", "the noise — for a rate, how close it is to 0 %", "the p-value you observed", "n", "the seed of the simulation", "the effect size"], "answer": [0, 1, 3, 5], "explain": "Power is fixed before the data: α, effect, n and variability; rare outcomes like FPD are expensive to test (→ section 1, 'Power and sample size')."},
  {"type": "single", "q": "You look at a running experiment every month and stop at the first p < 0.05. What happens to the 5 % false-positive rate?", "options": ["It grows: in the simulation one look gave 5 %, monthly looks about 21 %", "It falls, because you stop earlier", "It becomes exactly 10 %", "Nothing — each look is a 5 % test"], "answer": 0, "explain": "Each look is another test; fix the sample size and the end date in advance, or use a sequential design (→ section 1, 'Peeking')."},
  {"type": "single", "q": "Company corner: the 2 000-loan SMS test has 9 % power for FPD 1.28 → 1.00 %. What would a 'not significant' result mean?", "options": ["Almost nothing — the test would miss a real effect 91 % of the time; change the metric (first instalment paid late) or decide on cost", "Run it again with 2 000 more loans and it will be significant", "The SMS does not work", "FPD rose"], "answer": 0, "explain": "Never read a null result from an underpowered test as 'no effect' (→ Company corner)."}
]}
```

<!-- challenge:start -->

---

## Daily challenge

A bonus for the curious: one harder question on today's topic. Solve it for XP that grows with your challenge streak — a full week of five also adds 10 % to Friday's voucher.

```challenge
{"id": "w06d4", "q": "Jasur takes option 1 — primary metric 'first instalment paid late at all' (947 / 7 099 = 13.34 % today) — but he can only wait six months: 337 new loans a month (January–September 2026), split evenly, so 1 011 loans per arm. With Cohen's h, two-sided α = 5 % and 80 % power, what is the LOWEST late rate the SMS arm must reach for this test to detect it (the MDE as a rate)? Give a percentage to 3 decimals.", "type": "number", "dp": 3, "h": ["2c3dbc0bb304d536c1cf4748"], "hint": "Let the power solver give you the effect size for that n, then turn h back into a rate — h is a difference of 2·arcsin√p.", "sol": "aW1wb3J0IG51bXB5IGFzIG5wCmZyb20gc3RhdHNtb2RlbHMuc3RhdHMucG93ZXIgaW1wb3J0IHp0X2luZF9zb2x2ZV9wb3dlcgpwMSA9IDk0NyAvIDcwOTkgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAjIDAuMTMzNDAKaCA9IHp0X2luZF9zb2x2ZV9wb3dlcihub2JzMT0xMDExLCBhbHBoYT0wLjA1LCBwb3dlcj0wLjgwKSAgICAgICAgIyAwLjEyNDYKcDIgPSBucC5zaW4obnAuYXJjc2luKG5wLnNxcnQocDEpKSAtIGggLyAyKSAqKiAyICAgICAgICAgICAgICAgICAjIDAuMDkzOTgKIyBjaGVjazogTm9ybWFsSW5kUG93ZXIoKS5wb3dlcihwcm9wb3J0aW9uX2VmZmVjdHNpemUocDEsIHAyKSwgbm9iczE9MTAxMSwgYWxwaGE9MC4wNSkg4oaSIDAuODAKCk1ERSA5LjM5OCAlOiBpbiBzaXggbW9udGhzIHRoZSB0ZXN0IGNhbiBvbmx5IHNlZSB0aGUgbGF0ZSByYXRlIGZhbGxpbmcgZnJvbSAxMy4zNCAlIHRvIGFib3V0IDkuNCAlIOKAlCBhIDMwICUgcmVsYXRpdmUgY3V0LCBoYWxmIGFzIGxhcmdlIGFnYWluIGFzIHRoZSAyMCAlIHRoYXQgbWFya2V0aW5nIGhvcGVzIGZvci4KU28gZXZlbiBvbiB0aGUgZnJlcXVlbnQgbWV0cmljLCBhIHNpeC1tb250aCB0ZXN0IGlzIHVuZGVycG93ZXJlZCBmb3IgYSByZWFsaXN0aWMgZWZmZWN0ICh0aGUgMjAgJSBjdXQgbmVlZHMgMiAzMjQgcGVyIGFybSwgYWJvdXQgMTQgbW9udGhzKS4KVGhlIGhvbmVzdCBvcHRpb25zIHN0YXkgdGhlIHNhbWU6IHJ1biBsb25nZXIgb24gYWxsIG5ldyBsb2FucyB3aXRoIGEgZml4ZWQgZW5kIGRhdGUsIHVzZSBkYXlzIGxhdGUgYXMgYSBjb250aW51b3VzIG91dGNvbWUsIG9yIGRlY2lkZSBvbiBjb3N0Lg=="}
```

<!-- challenge:end -->
