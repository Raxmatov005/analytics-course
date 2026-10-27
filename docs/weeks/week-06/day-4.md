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

> 💡 **Key idea.** A t-test asks about the **average**; a rank test asks about the **typical** value ("is a random SME payment later than a random Auto one?"). Both can be right on the same data — pick the question first, then the test.

### Mann–Whitney U — comparing two groups by ranks

The **Mann–Whitney U test** (*U-критерий Манна–Уитни*, also Wilcoxon rank-sum) pools both groups, ranks every value (ties get the average rank), and asks whether one group's ranks are systematically higher. H₀: the two distributions are the same — formally, P(X > Y) = P(Y > X). It is **not** a test of medians unless the two shapes are identical (Auto and SME have the same median and still differ in the tail). It is robust to outliers (a 60-day payment is just "the highest rank"), needs no normality, and loses little power when the data *are* normal.

```python
# (shape only — not meant to run)
u = stats.mannwhitneyu(a, b, alternative="two-sided")   # statistic U, p-value
u.statistic / (len(a) * len(b))                          # effect size: P(a random A > a random B) + ½ P(tie)
```

> ⚠️ **Watch out.** Mann–Whitney is not "a test of medians". Auto and SME have the same median (−1 day) and could still differ in the tail. Report it as "a random X tends to be larger / not larger than a random Y", with U / (n₁n₂).

### Wilcoxon signed-rank — the paired version

For paired data the **Wilcoxon signed-rank test** (*критерий Вилкоксона для связанных выборок*) ranks the absolute differences and compares the sums of positive and negative ranks. Yesterday's ten branches, 2025 vs 2026 FPD30: `stats.wilcoxon(w[2026], w[2025])` → W = 7, **p = 0.037** (exact, for n = 10), against the paired t-test's 0.031. Nine of ten branches improved; the ranks say the same as the means.

### Kruskal–Wallis — three or more groups

The **Kruskal–Wallis test** (*критерий Краскела–Уоллиса*) is Mann–Whitney for k groups (and ANOVA's rank cousin — ANOVA is in the RU deck pp. 36–46). Days late by grade: H = 935, **p ≈ 2 × 10⁻²⁰²** (means −0.87 / −0.31 / +1.05 / +2.96; medians −1 / −1 / −1 / 0). Days late by product: H = 61.0, p = 1.8 × 10⁻¹² (ANOVA F = 19.3, p = 7.5 × 10⁻¹⁶). A significant omnibus test says "at least one group differs", not which — follow with pairwise tests **and** a multiple-comparisons correction.

### Permutation test — build the null by shuffling

If H₀ is true, the channel label is irrelevant: shuffling it should produce gaps as large as the real one often. A **permutation test** (*перестановочный тест*) does exactly that: shuffle the labels 10 000 times, recompute the statistic each time, p = share of shuffles at least as extreme as the observed value.

Press ▶ Run: this first runnable block of the page loads the tools and the FPD frame, then shuffles the channel label 10 000 times.

```python
import math
import numpy as np
import pandas as pd
from statistics import NormalDist
Phi, zq = NormalDist().cdf, NormalDist().inv_cdf          # the normal CDF and its inverse (z for a probability)
def pmf(k, n, p):                                          # binomial P(X = k), from Day 1
    return math.comb(n, k) * p**k * (1 - p)**(n - k)
def cdf(k, n, p):                                          # binomial P(X <= k)
    return sum(pmf(i, n, p) for i in range(k + 1))

f = pd.read_csv("data/powerbi/fct_first_instalment.csv")
f["channel"] = f["product"].map({"MICRO": "app", "BNPL": "partner"}).fillna("branch")
ab = f[f["channel"].isin(["app", "branch"])]
y, is_app = ab["fpd30"].to_numpy(), (ab["channel"] == "app").to_numpy()
obs = y[is_app].mean() - y[~is_app].mean()                       # +0.6586 points
g = np.random.default_rng(2026)
diffs = np.array([(lambda s: y[s].mean() - y[~s].mean())(g.permutation(is_app)) for _ in range(10_000)])
print(round(100 * obs, 4), np.mean(np.abs(diffs) >= abs(obs)))   # 0.6586 and p ≈ 0.033 (notebook 0.0326; z-test 0.0318, Fisher 0.0344)
```

Three methods, one answer for app vs branch. The permutation test's strength is that **any statistic** works — a difference in medians, in collection rates (Σ paid / Σ due), in the 90th percentile — with no formula and no normality, only the assumption that the units are exchangeable under H₀. It is the honest default for small, odd-shaped samples, and it is what next week's A/B tests build on.

### The bootstrap as a test — "is zero in the interval?"

The RU deck's recipe (pp. 20–21): resample each group with replacement, compute the difference each time, build the 95 % interval of the difference, and check whether 0 is inside. App − branch FPD, 10 000 resamples:

```python
g = np.random.default_rng(2026)
a, b = f.loc[f.channel == "app", "fpd30"].to_numpy(), f.loc[f.channel == "branch", "fpd30"].to_numpy()
d = [g.choice(a, len(a)).mean() - g.choice(b, len(b)).mean() for _ in range(10_000)]
print(np.quantile(d, [0.025, 0.975]))   # ≈ +0.05 to +1.30 points — zero is outside; Newcombe gave +0.05 to +1.33
```

Use it for differences that have no formula — medians, percentiles, ratios of sums. The permutation test answers "could the labels be irrelevant?"; the bootstrap interval answers "how big is the difference, give or take?". Report both when the stakes justify it.

### Chi-square or Fisher — small tables

The χ² test is an approximation that needs **expected counts ≥ 5**. Thin cells are everywhere in lending — a vintage × channel, a branch-month. The 2026-05 vintage, partner vs branch: 4 FPDs in 67 vs 2 in 179.

```python
t = np.array([[4, 63], [2, 177]])                                 # partner vs branch: FPD / no FPD
expected = np.outer(t.sum(axis=1), t.sum(axis=0)) / t.sum()
print(expected.round(2))                     # [[1.63, 65.37], [4.37, 174.63]] — two cells below 5
# Fisher by hand: every table with the same margins, each with its hypergeometric probability
r1, c1, n = t[0].sum(), t[:, 0].sum(), t.sum()                    # 67 partner loans, 6 FPDs, 246 loans
def table_p(a):                                                   # P(a FPDs among the 67 partner loans)
    return math.comb(c1, a) * math.comb(n - c1, r1 - a) / math.comb(n, r1)
p_obs = table_p(t[0, 0])
print(round(sum(table_p(a) for a in range(min(r1, c1) + 1) if table_p(a) <= p_obs * (1 + 1e-7)), 4))   # 0.0485
# scipy (the notebook): scipy.stats.chi2_contingency(t)[1] → 0.083 (Yates), correction=False → 0.028; scipy.stats.fisher_exact(t) → OR 5.62, p 0.0485
```

**Fisher's exact test** (*точный критерий Фишера*) computes the probability of every table with the same margins — exact at any n. Here the two χ² versions disagree with each other (0.028 vs 0.083) and Fisher sits between them. Use Fisher whenever an expected count is below 5; with modern computers you can simply use it for every 2 × 2.

Four new tests in one section — sort the situations before you meet a fifth:

```game
{"type": "sort", "id": "w06d4-g1", "title": "Which test?", "q": "Put each Nur question under the test that answers it.", "groups": {"Mann–Whitney": ["Does a typical Micro payment arrive later than a typical BNPL payment?", "Are days late different for two small, skewed groups?"], "Wilcoxon signed-rank": ["The same ten branches, FPD in 2025 vs 2026, skewed differences"], "Kruskal–Wallis": ["Days late across the five products"], "Fisher's exact": ["4 FPDs in 67 vs 2 in 179 — expected counts below 5"], "Permutation test": ["Collection rate Σ paid / Σ due, two strategies", "Difference in 90th percentiles of days late"]}}
```

### Multiple comparisons — ten tests, one false alarm

Each test at α = 5 % has a 5 % false-alarm rate. Run m independent tests on data with **no** real effects and the chance of at least one false alarm — the **family-wise error rate** (*групповая вероятность ошибки*, FWER) — is 1 − 0.95^m: **40.1 %** for 10 tests, 80 % for 32. The notebook simulates it for Nur's ten branches with identical true FPD rates (20 000 books, each branch tested against the book rate with an exact binomial test): a single test is "significant" **3.6 %** of the time (an exact test on counts this small stays under 5 %), and **30.6 %** of books have at least one "significant" branch. Somebody is always flagged.

Corrections (*поправки на множественные сравнения*):

- **Bonferroni**: test each at α / m (or multiply each p by m, cap at 1). Simple, guarantees FWER ≤ α, conservative. In the simulation: **2.3 %** of books with a false alarm.
- **Holm** (step-down): sort p ascending; multiply the smallest by m, the next by m − 1, …; keep the running maximum. Same guarantee as Bonferroni, never less powerful — the default.
- **Benjamini–Hochberg** controls the *false discovery rate* (the share of flagged results that are false) rather than FWER — for screening hundreds of segments.

Bukhara vs the other branches (Fisher): **p = 0.020** — "significant". Holm across the ten branches: **0.199**. The omnibus χ² of FPD × branch: χ² = 9.97, df 9, **p = 0.35**. Bukhara is the branch to watch, not the branch to punish.

```python
print(round(1 - 0.95 ** 10, 3))                      # 0.401 — the chance of at least one false alarm in 10 tests

def holm(pvals):
    pvals = np.asarray(pvals, dtype=float)
    m, adj, run = len(pvals), np.empty(len(pvals)), 0.0
    for rank, i in enumerate(np.argsort(pvals)):     # smallest p first
        run = max(run, min(1.0, (m - rank) * pvals[i]))   # × m, × (m − 1), … keeping the running maximum
        adj[i] = run
    return adj
print(holm([0.0318, 0.153, 0.804]))                  # [0.0954 0.306 0.804]
# statsmodels (the notebook): statsmodels.stats.multitest.multipletests(pvals, alpha=0.05, method="holm") → [reject flags, adjusted p-values, ...]; "bonferroni", "fdr_bh"
```

> ⚠️ **Watch out.** Ten branches, twenty segments, twenty-five KPIs: the more you test, the surer you are to find a "significant" one. Count the tests you ran (including the ones you looked at and dropped) and correct with Holm before anyone acts on a single hit.

### Power and sample size

**Power** (*мощность критерия*) = P(reject H₀ | the effect is real) = 1 − β. It depends on four things: **α** (stricter → less power), the **effect size** (smaller → less), **n** (more → more), and the **noise** — for a rate, how close to 0 % it is. Convention: plan for 80 % power at α = 5 %. For two proportions the effect size is **Cohen's h** = 2·arcsin√p₁ − 2·arcsin√p₂, and the loans needed **per arm**:

```
n = 2 · ( (z₁₋α/₂ + z₁₋β) / h )²       FPD 1.28 % → 1.00 %:  h = 0.02642;   n = 2 · ((1.960 + 0.842) / 0.02642)² = 22 481
```

Fill in the formula before you run it:

```game
{"type": "cloze", "id": "w06d4-g2", "title": "Loans per arm", "text": "n per arm = 2 · ( ( {{0}} + {{1}} ) / {{2}} )²", "blanks": [["z₁₋α/₂ (1.960)"], ["z₁₋β (0.842)"], ["Cohen's h"]], "distractors": ["the p-value", "σ / √n"], "why": "α and power set the two z values; the effect size h sits in the denominator, so halving the effect quadruples n."}
```

```python
def cohens_h(p1, p2):
    return 2 * math.asin(math.sqrt(p1)) - 2 * math.asin(math.sqrt(p2))
def n_per_arm(p1, p2, alpha=0.05, power=0.80):
    return 2 * ((zq(1 - alpha / 2) + zq(power)) / cohens_h(p1, p2)) ** 2
def power_at(p1, p2, n, alpha=0.05):                 # two-sided, n loans per arm
    h, za = abs(cohens_h(p1, p2)), zq(1 - alpha / 2)
    return Phi(h * math.sqrt(n / 2) - za) + Phi(-h * math.sqrt(n / 2) - za)

print(round(cohens_h(0.0128, 0.010), 5))             # 0.02642
print(math.ceil(n_per_arm(0.0128, 0.010)))           # 22481 per arm
print(round(power_at(0.0128, 0.010, 1000), 3))       # 0.091 — power with 1 000 per arm
# statsmodels (the notebook, sm = statsmodels.stats): sm.proportion.proportion_effectsize(0.0128, 0.010);
#   sm.power.zt_ind_solve_power(effect_size=h, alpha=0.05, power=0.80); sm.power.NormalIndPower().power(h, nobs1=1000, alpha=0.05)
```

Excel: `=2*((NORM.S.INV(0.975)+NORM.S.INV(0.8))/(2*ASIN(SQRT(0.0128))-2*ASIN(SQRT(0.01))))^2` → 22 481. Rare outcomes are expensive to test: a 20 % relative cut on a 13 % metric needs about ten times fewer loans (P10).

### MDE — what can this test see?

Turn it round: with n fixed, the **minimum detectable effect** (*минимальный детектируемый эффект*, MDE) is the smallest true change that the test detects with 80 % power. From 1.28 % FPD: 1 000 per arm → **0.26 %** (an 80 % cut); 2 000 per arm → **0.48 %** (a 63 % cut); 10 000 per arm → 0.87 % (a 32 % cut); 22 481 per arm → exactly 1.00 %. If the MDE is larger than any effect the intervention could plausibly have, the test cannot succeed — and a "no significant difference" from it means nothing.

```python
def mde_rate(p1, n, alpha=0.05, power=0.80):         # the lowest rate the treated arm must reach to be seen
    h = (zq(1 - alpha / 2) + zq(power)) * math.sqrt(2 / n)
    return math.sin(math.asin(math.sqrt(p1)) - h / 2) ** 2
print([round(100 * mde_rate(0.0128, n), 2) for n in (1000, 2000, 10000, 22481)])   # [0.26, 0.48, 0.87, 1.0]
```

> 💡 **Key idea.** Power is decided before the data exist — by α, the effect you care about, n and how rare the outcome is. Compute it first: a test with 9 % power is not a cheap test, it is a test whose "no effect" answer is already written.

### The power curve — read it before you promise anything

Power by loans per arm (α 5 %, two-sided), for the FPD effect and for a 20 % cut in "first instalment paid late at all" (13.34 % → 10.67 %, P10):

| loans per arm | 1 000 | 2 000 | 5 000 | 10 000 | 22 481 | 30 000 |
|---|---|---|---|---|---|---|
| FPD30 1.28 → 1.00 % | 9.1 % | 13.3 % | 26.2 % | 46.4 % | **80.0 %** | 89.9 % |
| late at all 13.3 → 10.7 % | 45.2 % | **73.9 %** | 98.4 % | ≈ 100 % | ≈ 100 % | ≈ 100 % |

`[NormalIndPower().power(h, nobs1=n, alpha=0.05) for n in ns]`. Power rises slowly and then saturates; the two rows are the same SMS judged on two metrics.

### Peeking — the multiple-comparisons problem in time

An experiment that runs for months invites a look every month, stopping "when it is significant". Each look is another test. Simulate an SMS that does **nothing** (both arms 13.34 % late, 150 loans per arm per month, 12 months, 20 000 runs, `default_rng(2026)`): testing once at the end gives a **5.05 %** false-positive rate; looking every month and stopping at the first p < 0.05 gives **20.9 %** — a "winning" SMS one time in five, typically declared in month 3. Fix the sample size and the end date in advance (or use a sequential design built for peeking — week 7).

> ⚠️ **Watch out.** "Let's check the dashboard every Monday and stop when it turns green" is peeking. Write the end date and the sample size into the plan before the first loan is sent, and read the result once.

### The A/A test

An **A/A test** (*A/A-тест*) splits units into two groups that receive the **same** treatment and runs the planned analysis. It should be "significant" about α of the time. Split Nur's real FPD loans into random halves of 2 000 two thousand times: **4.9 %** false positives — the splitting and the test behave. In practice an A/A run checks the **experiment system** (randomisation, logging, the metric pipeline) before a real A/B test trusts it; a 15 % A/A false-positive rate means a broken split, not a lucky one. That is week 7's starting point.

```game
{"type": "flash", "id": "w06d4-g3", "title": "Words of the day", "cards": [["Rank", "a value's position after sorting both groups together; ties share the average rank"], ["Family-wise error rate", "the chance of at least one false alarm among many tests: 1 − 0.95^m"], ["Bonferroni", "test each at α / m (or multiply each p by m)"], ["Holm", "sort the p-values, multiply by m, m − 1, …, keep the running maximum — same guarantee, more power"], ["Benjamini–Hochberg", "controls the share of false discoveries, for screening hundreds of segments"], ["Power", "P(reject H₀ | the effect is real) = 1 − β; plan for 80 %"], ["MDE", "the smallest true effect the test detects with 80 % power"], ["Peeking", "testing again and again as data arrive and stopping at the first p < 0.05"], ["A/A test", "two groups with the same treatment: checks the split, the logging and the test"]]}
```

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

**Questions inside the videos.** Open a video from the panel: it stops at these points and asks one question about the bit you just watched.

```videoquiz
{"video": "LcxB56PzylA", "stops": [
  {"at": 150, "q": "What does the Mann–Whitney U test work with?", "options": ["The raw values", "The ranks of the values, both groups pooled", "The means and the variances", "Only the medians"], "answer": 1, "explain": "A 60-day payment is simply 'the highest rank' — that is why outliers do not dominate."},
  {"at": 400, "q": "When is Mann–Whitney the natural choice over a t-test?", "options": ["Large, normal samples", "Paired data", "Three or more groups", "Small or skewed samples, or a question about the typical value"], "answer": 3, "explain": "Days late: skew ≈ 5, the same median — and the question 'is a typical payment later?'."}]}
```

```videoquiz
{"video": "IcLSKko2tsg", "stops": [
  {"at": 850, "q": "The Wilcoxon signed-rank test is for…", "options": ["paired data — it ranks the absolute differences and compares positive with negative ranks", "two independent groups", "three or more groups", "counts in a table"], "answer": 0, "explain": "The ten branches, 2025 vs 2026: W = 7, p = 0.037."},
  {"at": 1100, "q": "Compared with the sign test, Wilcoxon uses…", "options": ["only the signs of the differences", "the signs and the sizes (ranks) of the differences", "the means", "nothing extra"], "answer": 1, "explain": "More information from the same differences — so more power."}]}
```

```videoquiz
{"video": "HLzS5wPqWR0", "stops": [
  {"at": 200, "q": "Why is a correction needed when you run many tests?", "options": ["Each test becomes less accurate", "The chance of at least one false positive grows with the number of tests", "p-values get larger", "The data run out"], "answer": 1, "explain": "10 tests at 5 %: 40 % chance of at least one false alarm."},
  {"at": 400, "q": "Bonferroni for m tests:", "options": ["divide each p by m", "add m to each p", "compare each p with α / m (or multiply p by m)", "use α × m"], "answer": 2, "explain": "Bukhara among ten: 0.020 × 10 = 0.20 (Holm gives 0.199)."}]}
```

```videoquiz
{"video": "K8LQSvtjcEo", "stops": [
  {"at": 900, "q": "The false discovery rate controls…", "options": ["the chance of any false positive", "the type II error", "the power", "the expected share of false positives among the results you call significant"], "answer": 3, "explain": "BH: for screening hundreds of segments, where a few false leads are acceptable."},
  {"at": 1200, "q": "Compared with Bonferroni, Benjamini–Hochberg is…", "options": ["stricter", "less strict — it flags more results", "the same", "only for paired data"], "answer": 1, "explain": "It accepts some false discoveries in exchange for power."}]}
```

```videoquiz
{"video": "qbbY7ubzDoE", "stops": [
  {"at": 2790, "q": "In the simulation, many tests on data with no real effect give…", "options": ["no significant results", "some 'significant' results by chance alone", "only p-values above 0.5", "exactly α significant results every time"], "answer": 1, "explain": "Nur's ten branches with equal true rates: 31 % of books flag at least one."},
  {"at": 2880, "q": "What does a correction for multiple comparisons do?", "options": ["Keeps the overall chance of a false alarm near α", "Makes the data larger", "Removes the outliers", "Raises the power"], "answer": 0, "explain": "Holm and Bonferroni control the family-wise error rate."}]}
```

```videoquiz
{"video": "Rsc5znwR5FA", "stops": [
  {"at": 240, "q": "Statistical power is the probability of…", "options": ["rejecting H₀ when it is true", "getting p < 0.001", "correctly rejecting H₀ when the effect is real", "a type I error"], "answer": 2, "explain": "1 − β. Jasur's 2 000-loan SMS test: 9 %."},
  {"at": 290, "q": "Which change raises power?", "options": ["A smaller sample", "A larger sample", "A smaller effect", "A stricter α"], "answer": 1, "explain": "More n, a bigger effect or a looser α raise power."}]}
```

```videoquiz
{"video": "VX_M3tIyiYk", "stops": [
  {"at": 780, "q": "A power analysis tells you…", "options": ["the p-value you will get", "how many observations you need to detect an effect of a given size", "whether H₀ is true", "the effect size"], "answer": 1, "explain": "FPD 1.28 → 1.00 %: 22 481 per arm at 80 % power."},
  {"at": 890, "q": "When should the power analysis be done?", "options": ["Before collecting the data", "After the test, to explain a null result", "Only if p > 0.05", "Never for rates"], "answer": 0, "explain": "Before: it decides whether the test can answer at all."}]}
```

```videoquiz
{"video": "UFhJefdVCjE", "stops": [
  {"at": 1000, "q": "Adding observations to a test until p < 0.05 is…", "options": ["good practice", "p-hacking — it inflates the false-positive rate", "a power analysis", "a sequential design"], "answer": 1, "explain": "Peeking: monthly looks turned a 5 % test into a 21 % one."},
  {"at": 1300, "q": "How do you avoid it?", "options": ["Look more often", "Use a one-sided test", "Lower the sample size", "Fix the sample size with a power calculation before the test"], "answer": 3, "explain": "Fix n, the metric and the end date in advance."}]}
```

```videoquiz
{"video": "FEI1OA-zgb8", "stops": [
  {"at": 1200, "q": "The sample size an A/B test needs grows when…", "options": ["the effect you want to detect is smaller", "the baseline rate is close to 50 %", "α is looser", "you test once"], "answer": 0, "explain": "n ∝ 1 / h²: halve the effect, quadruple n."},
  {"at": 1450, "q": "What is the MDE of a test?", "options": ["The largest effect it can find", "The smallest true effect it detects with the planned power", "The observed difference", "The p-value threshold"], "answer": 1, "explain": "1 000 per arm can only see FPD fall from 1.28 % to 0.26 %."}]}
```

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

**4. What chance does.** In books where all ten branches share the same true rate, 31 % have at least one branch flagged at 5 % (the notebook's simulation); Tuesday's Company corner showed the top branch averaging 2.00 % by luck alone.

**5. The sentence.** *"Bukhara's 2.39 % is the highest of ten branches, but once we account for testing ten branches it is within what chance produces (Holm-adjusted p = 0.20); we will watch its Q4 vintages and its product mix rather than act now."*

---

## 4. Practice (50 min)

Every task has its own answer box. The Python boxes share the session of section 1's blocks: `f`, `pmf`, `cdf`, `holm`, `cohens_h`, `n_per_arm`, `power_at`, `mde_rate`, `Phi` and `zq` are ready once you have pressed ▶ Run on them. The days-late tasks (P1–P4) need `x`, the 52 850 payments with `days_late`: run them in `data/python/week6/day4_starter.ipynb`, whose loader builds `f` and `x`, and answer here.

**P1.** Auto vs SME days late: describe both (n, mean, median, share late, 99th percentile), then Welch and Mann–Whitney. Marketing asks "do SME borrowers pay later than Auto borrowers?" — which test answers that, and what is your answer?

```task
{"id": "w06d4-p1", "kind": "choice", "options": ["Welch (p = 0.02): yes, SME borrowers pay later", "Mann–Whitney (p = 0.32): no — a random SME payment is no more likely to be later than a random Auto one (0.505); what differs is the late tail, a proportions question", "Both, and quote the smaller p", "Neither — the medians are equal, so there is nothing to test"], "answer": 1, "explain": "'Do they pay later' is about the typical payment → a rank test. The means differ (Welch) because SME has a slightly heavier late tail: 12.4 % vs 10.1 % paid late at all."}
```

<details><summary>Answer</summary>

Auto 4 688 payments, mean −0.21, median −1, 10.1 % late, 99th pct 28; SME 8 222, +0.04, −1, 12.4 %, 31. Welch t = −2.34, **p = 0.0195**; Mann–Whitney **p = 0.32**, P(Auto later than SME) = 0.495. "Do SME borrowers pay later" is a question about the typical payment → Mann–Whitney: **no**, a random SME payment is no more likely to be later. What *is* different is the tail: 12.4 vs 10.1 % paid late at all (a proportions question: test it as one).

</details>

**P2.** Wilcoxon signed-rank on the ten branches' FPD30, 2025 vs 2026, next to the paired t-test. Why might you prefer Wilcoxon here?

```task
{"id": "w06d4-p2", "kind": "choice", "options": ["Wilcoxon always gives a smaller p", "With only ten differences (one of them +0.99) you cannot show they are near normal; Wilcoxon needs only symmetry and loses little power", "The paired t-test cannot be used on rates", "Wilcoxon uses the medians of the two years"], "answer": 1, "explain": "W = 7, p = 0.037 against the paired t-test's 0.031 — both agree that 2026 vintages are better."}
```

<details><summary>Answer</summary>

`stats.wilcoxon(w[2026], w[2025])` → W = 7, **p = 0.037** (exact); paired t p = 0.031. With n = 10, the paired t leans on the differences being roughly normal, which ten branch-level differences (one of them +0.99, Tashkent North) cannot show; Wilcoxon needs only symmetry of the differences and is barely less powerful. Both agree: 2026 vintages are better.

</details>

**P3.** Kruskal–Wallis on days late across the five products, then one-way ANOVA (`stats.f_oneway`). Which product drives the result?

```task
{"id": "w06d4-p3", "kind": "choice", "options": ["SME — the biggest loans", "Micro — mean days late +0.56 and 16.3 % of payments late against 10–12 % elsewhere", "Auto — the lowest mean", "None: Kruskal–Wallis only says that at least one product differs"], "answer": 1, "explain": "H = 61.0, p = 1.8 × 10⁻¹². The omnibus test says 'some differ'; the descriptive table shows Micro; pairwise Mann–Whitney with Holm would confirm which."}
```

<details><summary>Answer</summary>

Kruskal–Wallis H = 61.0, **p = 1.8 × 10⁻¹²**; ANOVA F = 19.3, p = 7.5 × 10⁻¹⁶. Means: Micro **+0.56**, SME +0.04, Consumer −0.01, BNPL −0.02, Auto −0.21 (all medians −1). Micro is the odd one out: 16.3 % of its payments are late against 10–12 % elsewhere. Next step: pairwise Mann–Whitney Micro vs each (four tests → Holm).

</details>

**P4.** Permutation test for the difference in **mean** days late, Auto − SME (10 000 shuffles, `default_rng(2026)`). Compare with Welch.

```task
{"id": "w06d4-p4", "kind": "choice", "options": ["The permutation p (≈ 0.02) contradicts Welch", "It agrees with Welch (≈ 0.02 vs 0.0195): the MEANS differ because of the tail, while Mann–Whitney says the TYPICAL payment does not — same data, two questions", "It agrees with Mann–Whitney, so Welch was wrong", "A permutation test cannot use the mean"], "answer": 1, "explain": "Observed −0.248 days, permutation p = 0.023. Any statistic works in a permutation test — here the mean, with no normality assumption."}
```

<details><summary>Answer</summary>

Observed −0.248 days; permutation **p = 0.023**; Welch 0.0195. The permutation test makes no normality assumption about the mean and agrees: the *means* differ (the tail), while Mann–Whitney (P1) says the *typical* payment does not. Same data, three tests, two questions.

</details>

**P5.** The 2026-05 vintage, partner vs branch (4 / 67 vs 2 / 179). Expected counts, χ² with and without Yates, Fisher. Which do you report, and what do you conclude?

```task
{"id": "w06d4-p5", "kind": "choice", "options": ["χ² without correction, p = 0.028 — partner's May vintage is worse", "Fisher, p = 0.0485 — borderline, and one vintage of 32 and one channel pair of three: after any correction it is noise", "χ² with Yates, p = 0.083 — no difference", "No test: six FPDs are too few for any test"], "answer": 1, "explain": "Expected FPDs 1.63 and 4.37: two cells below 5, so χ² is unreliable and its two versions disagree. Fisher is exact; six FPDs still cannot carry a decision."}
```

<details><summary>Answer</summary>

Expected FPDs 1.63 and 4.37 — two cells below 5, χ² unreliable. Yates **0.083**, uncorrected **0.028**, Fisher **0.0485**. Report Fisher. Conclusion: borderline evidence that partner's May vintage was worse — and it is one vintage of 32 and one channel pair of three, so after any correction it is noise. Six FPDs in total cannot carry a decision.

</details>

**P6.** Holm by hand (your TODO) on the three channel-pair p-values from yesterday: app–branch 0.0318, app–partner 0.153, partner–branch 0.804. Then Bonferroni.

```task
{"id": "w06d4-p6", "kind": "python", "starter": "pv = np.array([0.0318, 0.153, 0.804])     # app–branch, app–partner, partner–branch\nprint(holm(pv))\n# add Bonferroni: each p × 3, capped at 1 — print the three values\n", "answer": 0.459, "dp": 3, "model": "print(np.minimum(1, pv * 3))     # [0.0954 0.459 1.   ] — Holm [0.0954 0.306 0.804]: app vs branch is no longer below 0.05"}
```

<details><summary>Answer</summary>

Sorted 0.0318, 0.153, 0.804 → × 3, × 2, × 1 = 0.0954, 0.306, 0.804 → running max unchanged → Holm **0.095 / 0.306 / 0.804**; Bonferroni 0.095 / 0.459 / 1.000. Corrected for three comparisons, app vs branch is no longer significant at 5 %. That is why the committee note says "moderate": the answer depends on whether app vs branch was *the* question (it was Bekzod's, asked from the dashboard) or one of three.

</details>

**P7.** The vintage screen: test each of the 31 monthly vintages with ≥ 50 loans against the book rate 1.28 % (exact two-sided binomial). How many are "significant" at 5 %, how many would chance produce, and what survives Holm?

```task
{"id": "w06d4-p7", "kind": "python", "starter": "p0 = 91 / 7099\nv = f.groupby(\"vintage\")[\"fpd30\"].agg([\"sum\", \"size\"])\nv = v[v[\"size\"] >= 50]                     # 31 vintages\nv[\"p\"] = [min(1, 2 * min(cdf(k, n, p0), 1 - cdf(k - 1, n, p0) if k > 0 else 1)) for k, n in zip(v[\"sum\"], v[\"size\"])]\nprint(v.sort_values(\"p\").head(3))\n# add the Holm-adjusted p-values (holm from section 1) and print the smallest one, 2 decimals\n", "answer": 0.88, "dp": 2, "model": "v[\"holm\"] = holm(v[\"p\"])\nprint(round(v[\"holm\"].min(), 2))      # 0.88 — 2026-03 (0 FPDs in 330, raw p = 0.028) does not survive; chance alone gives ~1.6 'hits' in 31"}
```

<details><summary>Answer</summary>

`p = min(1, 2·min(binom.cdf(k, n, p0), binom.sf(k − 1, n, p0)))` per vintage: **1 of 31** below 0.05 — **2026-03**, with **0 FPDs in 330** loans (p = 0.028), a suspiciously *good* month; 2025-04 (7 / 225) is next at 0.054. Chance alone would give 31 × 0.05 ≈ 1.6. Holm: 0.88 for 2026-03 — nothing survives. Check 2026-03's zero against the payment data before celebrating (Day 1, P3).

</details>

**P8.** Sample size for the SMS test with other settings: 90 % power; one-sided 80 %. And the achieved power of 1 000 vs 1 000.

```task
{"id": "w06d4-p8", "kind": "python", "starter": "print(math.ceil(n_per_arm(0.0128, 0.010)))              # 80 % power, two-sided: 22481\n# add: 90 % power (two-sided), loans per arm, rounded up\n", "answer": 30096, "dp": 0, "model": "print(math.ceil(n_per_arm(0.0128, 0.010, power=0.90)))       # 30096\nprint(math.ceil(n_per_arm(0.0128, 0.010, alpha=0.10)))       # 17709 — one-sided at 5 % = two-sided at 10 %\nprint(round(power_at(0.0128, 0.010, 1000), 3))               # 0.091"}
```

<details><summary>Answer</summary>

90 % power: **30 096** per arm; one-sided 80 %: **17 709** per arm (one-sided is cheaper — and only legitimate if "SMS makes it worse" and "no change" lead to the same decision, which for a cheap SMS they arguably do); 1 000 per arm: **9.1 %** power. Every setting is far beyond Nur's ~337 new loans a month (January–September 2026).

</details>

**P9.** MDE: with 1 000, 2 000 and 10 000 loans per arm (α 5 %, power 80 %), what FPD rate must the SMS reach to be detectable from 1.28 %? Use your `mde_rate`.

```task
{"id": "w06d4-p9", "kind": "python", "starter": "print(round(100 * mde_rate(0.0128, 1000), 2))     # 1 000 per arm, in %\n# add 2 000 and 10 000 per arm\n", "answer": 0.48, "dp": 2, "model": "print([round(100 * mde_rate(0.0128, n), 2) for n in (1000, 2000, 10000)])   # [0.26, 0.48, 0.87] — cuts of 80 %, 63 %, 32 %"}
```

<details><summary>Answer</summary>

1 000 → **0.26 %** (an 80 % cut); 2 000 → **0.48 %** (63 %); 10 000 → **0.87 %** (32 %). No reminder SMS cuts first-payment defaults by two thirds — the people who default on the first instalment are mostly not people who forgot. So a 2 000-loan FPD test is designed to fail: its most likely outcome is "not significant", which marketing will then read as "the SMS does not work".

</details>

> 🚀 **Stretch (optional, +5 XP).** **P10.** Change the metric. "First instalment paid late at all" (any day after the due date, or not in full) is far more common than FPD30. Compute its rate on the 7 099 loans, the n per arm to detect a 20 % relative cut, the power of 1 000 vs 1 000, and confirm that power by simulation (20 000 runs, `default_rng(2026)`).

```task
{"id": "w06d4-p10", "kind": "python", "starter": "p1 = 947 / 7099                       # 13.34 % of first instalments paid late at all\np2 = p1 * 0.8                         # a 20 % relative cut\n# loans per arm (rounded up), then the power of 1 000 vs 1 000\n", "answer": 2324, "dp": 0, "model": "print(math.ceil(n_per_arm(p1, p2)), round(power_at(p1, p2, 1000), 3))   # 2324 0.452\ng = np.random.default_rng(2026)\na, b = g.binomial(1000, p1, 20_000) / 1000, g.binomial(1000, p2, 20_000) / 1000\npool = (a + b) / 2\nzs = (a - b) / np.sqrt(pool * (1 - pool) * 2 / 1000)\nprint(np.mean(np.abs(zs) > 1.96))     # ≈ 0.45 by simulation", "xp": 2}
```

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

None today: **Checkpoint 6 is tomorrow** (intervals on Nur data, the test-choice quiz, interview questions). Finish the five TODO functions in `day4_starter.ipynb`; the checkpoint's power task uses them. **HW 6.2** is due tomorrow in Day 2's hand-in box. Check two of your functions here:

**H1.** Your `n_per_arm(0.0128, 0.010)` — loans per arm for 80 % power at α = 5 %, two-sided (rounded up)?

```task
{"id": "w06d4-hw1", "kind": "number", "answer": 22481, "dp": 0, "unit": "loans per arm", "hint": "h = 2·asin√0.0128 − 2·asin√0.010 = 0.02642; n = 2 · ((1.960 + 0.842) / h)².", "model": "2 · (2.802 / 0.02642)² = 22 480.8 → 22 481 per arm, 44 962 in total — 11 years of Nur's new loans."}
```

**H2.** And the power of 1 000 vs 1 000 for the same effect, in %?

```task
{"id": "w06d4-hw2", "kind": "number", "answer": 9.1, "dp": 1, "unit": "%", "hint": "Φ(h·√(n/2) − 1.96) + Φ(−h·√(n/2) − 1.96) with n = 1 000.", "model": "h·√500 = 0.591 → Φ(−1.369) ≈ 0.091: the test misses a real 1.28 → 1.00 % effect 91 times in 100."}
```

---

## 6. Self-check

Three questions, one at a time. Wrong? The explanation points to the part of section 1 to reread.

```check
{"id": "w06d4-sc", "questions": [
  {"type": "single", "q": "Welch says p = 0.02, Mann–Whitney says p = 0.32 on the same days-late data. Which is wrong?", "options": ["Welch", "Mann–Whitney", "Neither — Welch asks about the average, Mann–Whitney about the typical payment", "Both"], "answer": 2, "explain": "Pick the business question first, then the test (→ section 1, 'When t-tests break', P1)."},
  {"type": "number", "q": "You test 20 segments at α = 5 % and nothing is real. What is the chance of at least one false alarm, in %?", "answer": 64.2, "tol": 0.3, "explain": "1 − 0.95²⁰ = 64.2 %. Correct with Holm before acting on the one hit (→ section 1, 'Multiple comparisons', P7)."},
  {"type": "multi", "q": "Which of these does power depend on?", "options": ["α", "the effect size", "the p-value you observed", "n", "how rare the outcome is"], "answer": [0, 1, 3, 4], "explain": "Power is fixed before the data; an outcome near 0 % (FPD) needs far more loans (→ section 1, 'Power and sample size', Company corner)."}
]}
```

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

Marketing's test plan has one fatal line — tap it:

```game
{"type": "bug", "id": "w06d4-g4", "title": "The SMS test plan", "q": "One line of the plan breaks the experiment.", "code": "Randomly split 2 000 new loans: 1 000 get the SMS, 1 000 do not.\nPrimary outcome: FPD30; hoped-for effect 1.28 % → 1.00 %.\nα = 5 %, two-sided; the end date is fixed before the first SMS.\nIf the result is not significant, we conclude that the SMS does not work.\nFPD30 and lateness are reported with their n and 95 % intervals.", "answer": [3], "why": "With 9 % power the test misses a real effect 91 times in 100 — a null result from it says almost nothing. Size the test first, or change the metric."}
```

> 🎯 **Interview version.** *"How would you size an experiment on default rates?"* — Fix α, power and the smallest effect worth acting on; compute Cohen's h and n per arm; translate n into calendar time at the real volume; if it is years, change the metric (a frequent leading indicator), the design (all traffic, longer) or the question — and never read a null result from an underpowered test as "no effect".

**Say it like in an interview.** *"Marketing wants to test an SMS reminder on 2 000 loans to cut first-payment defaults from 1.28 % to 1 %. Is that enough?"* — answer in 3–5 sentences, as you would to an interviewer.

```task
{"id": "w06d4-cc", "kind": "free", "min": 30, "model": "No. For 1.28 % → 1.00 % at α = 5 % and 80 % power, Cohen's h is 0.026 and you need about 22 500 loans per arm — 11 years of our volume; with 1 000 per arm the power is only 9 %, so a 'not significant' result would mean almost nothing. I would change the primary metric to something frequent that the SMS acts on directly, such as 'first instalment paid late at all' (13 %), where a 20 % cut needs about 2 300 per arm, and keep FPD30 as a guardrail — or, since an SMS is cheap, roll it out and monitor.", "rubric": ["says it is not enough and gives n per arm (≈ 22 500) or the power (≈ 9 %)", "translates n into time at the real volume", "warns that a null result from an underpowered test is not 'no effect'", "proposes a fix: a frequent metric, longer/all traffic, or decide on cost"]}
```

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
{"id": "w06d4", "q": "Jasur takes option 1 — primary metric 'first instalment paid late at all' (947 / 7 099 = 13.34 % today) — but he can only wait six months: 337 new loans a month (January–September 2026), split evenly, so 1 011 loans per arm. With Cohen's h, two-sided α = 5 % and 80 % power, what is the LOWEST late rate the SMS arm must reach for this test to detect it (the MDE as a rate)? Give a percentage to 3 decimals.", "type": "number", "dp": 3, "python": true, "h": ["2c3dbc0bb304d536c1cf4748"], "hint": "Let the power solver give you the effect size for that n, then turn h back into a rate — h is a difference of 2·arcsin√p.", "sol": "aW1wb3J0IG51bXB5IGFzIG5wCmZyb20gc3RhdHNtb2RlbHMuc3RhdHMucG93ZXIgaW1wb3J0IHp0X2luZF9zb2x2ZV9wb3dlcgpwMSA9IDk0NyAvIDcwOTkgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAjIDAuMTMzNDAKaCA9IHp0X2luZF9zb2x2ZV9wb3dlcihub2JzMT0xMDExLCBhbHBoYT0wLjA1LCBwb3dlcj0wLjgwKSAgICAgICAgIyAwLjEyNDYKcDIgPSBucC5zaW4obnAuYXJjc2luKG5wLnNxcnQocDEpKSAtIGggLyAyKSAqKiAyICAgICAgICAgICAgICAgICAjIDAuMDkzOTgKIyBjaGVjazogTm9ybWFsSW5kUG93ZXIoKS5wb3dlcihwcm9wb3J0aW9uX2VmZmVjdHNpemUocDEsIHAyKSwgbm9iczE9MTAxMSwgYWxwaGE9MC4wNSkg4oaSIDAuODAKCk1ERSA5LjM5OCAlOiBpbiBzaXggbW9udGhzIHRoZSB0ZXN0IGNhbiBvbmx5IHNlZSB0aGUgbGF0ZSByYXRlIGZhbGxpbmcgZnJvbSAxMy4zNCAlIHRvIGFib3V0IDkuNCAlIOKAlCBhIDMwICUgcmVsYXRpdmUgY3V0LCBoYWxmIGFzIGxhcmdlIGFnYWluIGFzIHRoZSAyMCAlIHRoYXQgbWFya2V0aW5nIGhvcGVzIGZvci4KU28gZXZlbiBvbiB0aGUgZnJlcXVlbnQgbWV0cmljLCBhIHNpeC1tb250aCB0ZXN0IGlzIHVuZGVycG93ZXJlZCBmb3IgYSByZWFsaXN0aWMgZWZmZWN0ICh0aGUgMjAgJSBjdXQgbmVlZHMgMiAzMjQgcGVyIGFybSwgYWJvdXQgMTQgbW9udGhzKS4KVGhlIGhvbmVzdCBvcHRpb25zIHN0YXkgdGhlIHNhbWU6IHJ1biBsb25nZXIgb24gYWxsIG5ldyBsb2FucyB3aXRoIGEgZml4ZWQgZW5kIGRhdGUsIHVzZSBkYXlzIGxhdGUgYXMgYSBjb250aW51b3VzIG91dGNvbWUsIG9yIGRlY2lkZSBvbiBjb3N0Lg=="}
```

<!-- challenge:end -->
