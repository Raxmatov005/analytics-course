# Week 6 · Day 4 — Hypothesis tests II: non-parametric tests, multiple comparisons and power

<span class="badge">Learn 60 min</span> <span class="badge">Worked example 15 min</span> <span class="badge">Practice 50 min</span> <span class="badge">Reference card</span> <span class="badge hw">Checkpoint tomorrow</span> <span class="badge company">Company corner</span>

> STORY **Thursday, 9:00.** Jasur, laptop open, a slide from marketing on the screen: *"New SMS reminder three days before the first due date — cuts first-payment defaults!"* *"Your risk-committee note worked: Nilufar wants a fix for the app's FPD, and marketing has one. They want to send the SMS to **2 000 loans** and compare. My question is the one nobody in marketing asks: **is 2 000 enough?** If the SMS really takes FPD from 1.28 % to 1 %, what is the chance a test on 2 000 loans even notices? And while you are at it — Nilufar circled Bukhara as 'the worst branch'. Ten branches, ten tests. Tell me what that does to your 5 %."*

## Today in 3 lines

- When the t-test's assumptions break — skewed days late, a few huge values, tiny groups — use tests on **ranks** (**Mann–Whitney**, **Wilcoxon**, **Kruskal–Wallis**), a **permutation test** built by shuffling, and **Fisher's exact test** instead of χ² when expected counts fall below 5.
- Ten tests at α = 5 % give a **30–40 %** chance of at least one false alarm: **Bonferroni** and **Holm** fix the family-wise error — Bukhara's p = 0.020 becomes 0.199.
- **Power** decides whether a test can answer before you run it: detecting FPD 1.28 % → 1.00 % needs **22 481 loans per arm**; Jasur's 2 000 loans have **9 % power** (13 % even at 2 000 per arm) — and you leave with a one-page **test-choice card** for tomorrow's checkpoint.

---

## 1. Learn — when the textbook test does not fit

### When the t-test is wrong — skew, outliers, ordinal data

**What it is.** The **t-test** compares two **means**. It trusts the CLT to make the mean of each group roughly normal. It goes wrong in three situations:

1. **Skew with a small n.** The CLT has not had enough data yet, so the mean is not yet normal.
2. **Outliers.** A few extreme values move the mean, and the test moves with it.
3. **Ordinal data.** Risk grade A–D or a 1–5 satisfaction score: the distance between two values means nothing, so their average means nothing either.

The way out is a **non-parametric test** (*непараметрический критерий*). Most of them replace each value by its **rank** (*ранг*) — its position after sorting. Ranks need no normality, and an outlier is only "the highest rank".

**How to write it.** Look at the shape before you pick a test. Press ▶ Run: this first block loads the tools and two frames for the whole page — `f`, one row per first instalment (FPD30), and `x`, one row per clean payment with its days late.

```python
import math, sqlite3
import numpy as np
import pandas as pd
from statistics import NormalDist
Phi, zq = NormalDist().cdf, NormalDist().inv_cdf          # the normal CDF and its inverse (z for a probability)
def pmf(k, n, p):                                          # binomial P(X = k), from Day 1
    return math.comb(n, k) * p**k * (1 - p)**(n - k)
def cdf(k, n, p):                                          # binomial P(X <= k)
    return sum(pmf(i, n, p) for i in range(k + 1))

f = pd.read_csv("data/powerbi/fct_first_instalment.csv")          # 7 099 first instalments, fpd30 = 0/1
f["channel"] = f["product"].map({"MICRO": "app", "BNPL": "partner"}).fillna("branch")

con = sqlite3.connect("data/raw/nur.db")
x = pd.read_sql("""
    WITH pay AS (SELECT MIN(payment_id) AS payment_id, installment_id, paid_at, amount
                 FROM payments GROUP BY installment_id, paid_at, amount)      -- 52 850 clean payments, repeats removed
    SELECT p.payment_id, pr.code, l.risk_grade,
           CAST(julianday(date(p.paid_at)) - julianday(i.due_date) AS INTEGER) AS days_late
    FROM pay p
    JOIN installments i ON i.installment_id = p.installment_id
    JOIN loans l        ON l.loan_id = i.loan_id
    JOIN products pr    ON pr.product_id = l.product_id""", con)

two = x[x["code"].isin(["AUTO", "SME"])].groupby("code")["days_late"]
print(len(x), two.agg(["size", "mean", "median", "skew"]).round(2))   # 52850; AUTO 4688 −0.21 −1 5.85; SME 8222 0.04 −1 5.53
print(two.apply(lambda d: (d > 0).mean()).round(3))                  # share paid late: AUTO 0.101, SME 0.124
```

| | n payments | mean days | median | skew | share paid late | share > 30 days | 99th percentile |
|---|---|---|---|---|---|---|---|
| Auto | 4 688 | −0.21 | −1 | 5.85 | 10.1 % | 0.85 % | 28 |
| SME | 8 222 | +0.04 | −1 | 5.53 | 12.4 % | 1.02 % | 31 |

Both products pay one day early in the middle (median −1), and both have a thin tail of 30-day payments that pulls the mean up — a skew near 6, where 0 is symmetric.

**When you use it.**

| Situation | Why the t-test is weak | Use instead |
|---|---|---|
| skewed data, fewer than ~30 per group | the mean is not normal yet | Mann–Whitney, permutation test |
| a few extreme values | they pull the mean | a rank test, or a bootstrap of the median |
| ordinal scale (grade, 1–5 score) | an average of labels has no meaning | a rank test |
| large n, a question about the average | the CLT works | Welch's t-test is fine |

> ⚠️ **Watch out.** With thousands of values, skew alone does not break Welch: 4 688 and 8 222 payments are plenty for the CLT. The real choice is the question — the **average** (t-test) or the **typical** value (rank test). Decide it first; never run both and report the smaller p.

**Your turn.** Which comparison should not use a t-test?

```task
{"id": "w06d4-l1", "kind": "choice", "options": ["Average principal, Auto vs SME, about 4 000 loans each", "Risk grade (A, B, C, D) of app loans vs branch loans", "Mean credit score of 2 000 applicants per channel", "Average days late of 8 000 payments per product"], "answer": 1, "explain": "A grade is an ordered label: 'B minus A' has no size, so a mean grade means nothing. Compare the grades with a rank test (or as a table of counts). The other three are averages of real numbers with large n — Welch works."}
```

### Mann–Whitney U — two independent groups by ranks

**What it is.** The **Mann–Whitney U test** (*U-критерий Манна–Уитни*, also called the Wilcoxon rank-sum test) pools both groups, ranks every value and checks whether one group's ranks are systematically higher. **U** counts the pairs — one value from each group — in which the A value is larger (a tie counts ½). **U / (n₁·n₂)** is the probability that a random A beats a random B. H₀: that probability is ½.

```pic
{"id": "w06d4-pic1", "title": "Pool, sort, rank: A holds ranks 2, 5 and 7", "caption": "A = [2, 5, 9] in teal, B = [1, 3, 4, 7] in amber, sorted together. A's ranks add up to 14, so U = 14 − 3·4/2 = **8**: A wins 8 of the 12 pairs.", "chart": {"type": "bars", "labels": ["1", "2", "3", "4", "5", "6", "7"], "values": [1, 2, 3, 4, 5, 7, 9], "tone": ["b", "a", "b", "b", "a", "b", "a"], "show": true, "note": "x: rank · y: value"}}
```

**How to write it.** U = (sum of A's ranks) − n₁·(n₁ + 1) / 2. On a tiny example, A = [2, 5, 9] and B = [1, 3, 4, 7]:

| value | 1 | 2 | 3 | 4 | 5 | 7 | 9 |
|---|---|---|---|---|---|---|---|
| group | B | A | B | B | A | B | A |
| rank | 1 | 2 | 3 | 4 | 5 | 6 | 7 |

A's ranks add up to 2 + 5 + 7 = 14, so U = 14 − 3·4/2 = **8**: A wins 8 of the 3 × 4 = 12 pairs, a share of 0.67.

```python
def mann_whitney(a, b):                                    # two-sided; normal approximation with the tie correction
    a, b = np.asarray(a, dtype=float), np.asarray(b, dtype=float)
    n1, n2 = len(a), len(b)
    pooled = pd.Series(np.concatenate([a, b]))
    r = pooled.rank().to_numpy()                           # ranks of all values together; ties get the average rank
    u = r[:n1].sum() - n1 * (n1 + 1) / 2                   # U for group a
    n, t = n1 + n2, pooled.value_counts().to_numpy().astype(float)
    sd = math.sqrt(n1 * n2 / 12 * ((n + 1) - (t**3 - t).sum() / (n * (n - 1))))   # the spread of U under H0
    z = (abs(u - n1 * n2 / 2) - 0.5) / sd                  # 0.5 = continuity correction
    return u, u / (n1 * n2), 2 * (1 - Phi(z))              # U, P(a random a > a random b), p-value

print(mann_whitney([2, 5, 9], [1, 3, 4, 7])[:2])           # (8.0, 0.667) — the small table
auto, sme = x.loc[x.code == "AUTO", "days_late"], x.loc[x.code == "SME", "days_late"]
print([round(v, 3) for v in mann_whitney(auto, sme)])      # [19075370.5, 0.495, 0.323]
# scipy (the notebook): scipy.stats.mannwhitneyu(auto, sme) — the same U and p
```

U / (n₁n₂) = 0.495: a random Auto payment is later than a random SME payment 49.5 % of the time — a coin toss, and p = 0.32 says so.

**When you use it.**
- Two independent groups, a number or an ordered label, and the question "does one group tend to have larger values?".
- Small or skewed groups, or data with outliers.

| | Welch t-test | Mann–Whitney U |
|---|---|---|
| Asks | are the **averages** different? | does a random A tend to beat a random B? |
| Works on | the values | the ranks |
| A 60-day payment | pulls the mean | is only the top rank |
| Auto vs SME days late | t = −2.34, **p = 0.0195** | **p = 0.32** |

Both answers are right: the averages differ because SME has a slightly heavier late tail; the typical payment does not.

> ⚠️ **Watch out.** Mann–Whitney is not "a test of medians". Auto and SME have the same median (−1 day) and could still differ in the tail. Report it as "a random X tends to be larger (or not) than a random Y", with U / (n₁n₂).

**Your turn.** A = [3, 8, 10], B = [1, 2, 6, 9]. What is U for A? Count the pairs, or use `mann_whitney`.

```task
{"id": "w06d4-l2", "kind": "number", "answer": 9, "dp": 0, "unit": "pairs", "hint": "For each A value, count the B values below it: 3 beats 1 and 2; 8 beats …; 10 beats …", "model": "3 beats 2, 8 beats 3, 10 beats 4: U = 9 of 12 pairs (0.75). By ranks: A's ranks 3 + 5 + 7 = 15, U = 15 − 3·4/2 = 9."}
```

### Wilcoxon signed-rank — the paired version

**What it is.** For **paired** data — the same unit measured twice — the **Wilcoxon signed-rank test** (*критерий Вилкоксона для связанных выборок*) works on the differences. Drop the zero differences, rank the rest by size, then add the ranks of the positive differences (**W+**) and of the negative ones (**W−**). Under H₀ the differences are symmetric around 0, so W+ and W− should be close. W is the smaller of the two.

**How to write it.** The same ten branches, FPD30 of their 2025 vintages against their 2026 vintages:

| branch | 2026 − 2025, points | rank of the size | sign |
|---|---|---|---|
| Samarkand Central | −0.11 | 1 | − |
| Fergana Central | −0.40 | 2 | − |
| Nukus Central | −0.46 | 3 | − |
| Tashkent Central | −0.49 | 4 | − |
| Tashkent South | −0.56 | 5 | − |
| Andijan Central | −0.68 | 6 | − |
| **Tashkent North** | **+0.99** | **7** | **+** |
| Bukhara Central | −1.21 | 8 | − |
| Termez Central | −1.37 | 9 | − |
| Namangan Central | −1.46 | 10 | − |

```python
f["year"] = pd.to_datetime(f["disbursed_at"]).dt.year
w = f[f.year.isin([2025, 2026])].pivot_table(index="branch_name", columns="year", values="fpd30", aggfunc="mean") * 100
d = (w[2026] - w[2025]).to_numpy()
d = d[d != 0]                                              # a zero difference has no sign
r = pd.Series(np.abs(d)).rank().to_numpy()                 # rank the sizes of the differences
w_plus, w_minus = r[d > 0].sum(), r[d < 0].sum()
W = min(w_plus, w_minus)
# exact p-value: under H0 every pattern of + and − signs on the ranks is equally likely (2^10 = 1 024 patterns)
signs = (np.arange(2 ** len(d))[:, None] >> np.arange(len(d))) & 1
plus = signs @ r                                           # W+ of every pattern
print(w_plus, w_minus, np.mean(np.minimum(plus, r.sum() - plus) <= W))   # 7.0 48.0 0.037
# scipy (the notebook): scipy.stats.wilcoxon(w[2026], w[2025]) → W = 7, p = 0.037
```

W+ = 7: only Tashkent North got worse, and its rise is the 7th-largest change of ten; 38 of the 1 024 sign patterns are this lopsided, so p = 0.037.

**When you use it.**
- The same units twice (branches in two years, customers before and after), with few pairs or skewed differences.

| | paired t-test | Wilcoxon signed-rank |
|---|---|---|
| Works on | the mean difference | the ranks of the differences |
| Needs | differences roughly normal | differences roughly symmetric |
| Ten branches, 2025 vs 2026 | p = 0.031 | p = 0.037 |

**Your turn.** Five differences: +3, −1, −4, −2, −5. What is W+ (the sum of the ranks of the positive differences)?

```task
{"id": "w06d4-l3", "kind": "number", "answer": 3, "dp": 0, "unit": "rank sum", "hint": "Rank the sizes 1, 2, 3, 4, 5. Which rank belongs to the only positive difference?", "model": "Sizes 1, 2, 3, 4, 5 get ranks 1 to 5. The only positive difference, +3, has rank 3: W+ = 3, W− = 1 + 2 + 4 + 5 = 12."}
```

### Kruskal–Wallis — three or more groups

**What it is.** The **Kruskal–Wallis test** (*критерий Краскела–Уоллиса*) is Mann–Whitney for k groups — the rank version of one-way ANOVA. In one line: rank everything together, and **H** measures how far each group's mean rank sits from the overall mean rank; under H₀ it follows χ² with k − 1 degrees of freedom.

**How to write it.** H = 12 / (n(n + 1)) · Σ nᵢ · (mean rank of group i − (n + 1)/2)², divided by a tie correction.

```python
def kruskal(groups):
    pooled = pd.concat(groups, ignore_index=True)
    r, n = pooled.rank().to_numpy(), len(pooled)
    h, start = 0.0, 0
    for g in groups:                                        # each group's mean rank against the overall (n + 1) / 2
        rg = r[start:start + len(g)]; start += len(g)
        h += len(g) * (rg.mean() - (n + 1) / 2) ** 2
    h *= 12 / (n * (n + 1))
    t = pooled.value_counts().to_numpy().astype(float)
    return h / (1 - (t**3 - t).sum() / (n**3 - n))          # tie correction
H = kruskal([g["days_late"] for _, g in x.groupby("code")])
print(round(H, 1), math.exp(-H / 2) * (1 + H / 2))         # 61.0 1.8e-12 — for 4 df, P(χ² > H) = e^(−H/2)·(1 + H/2)
print(x.groupby("code")["days_late"].mean().round(2))      # Micro +0.56 stands out; the others −0.21 to +0.04
# scipy (the notebook): scipy.stats.kruskal(*groups); one-way ANOVA: scipy.stats.f_oneway(*groups) → F = 19.3
```

H = 61.0 on 4 degrees of freedom, p = 1.8 × 10⁻¹²: the days late of at least one product differ from the rest, and the means point at Micro.

**When you use it.**
- Three or more independent groups, skewed data or ordered labels.
- Then pairwise Mann–Whitney tests with a correction (Multiple comparisons, below) to say *which* groups differ.

> ⚠️ **Watch out.** A significant Kruskal–Wallis says "at least one group differs", not which one. Do not name a product until the pairwise tests and the correction are done.

**Your turn.** Kruskal–Wallis on days late across the five products gives H = 61.0, p = 1.8 × 10⁻¹². Which conclusion is right?

```task
{"id": "w06d4-l4", "kind": "choice", "options": ["Micro is the worst product — p = 1.8 × 10⁻¹²", "At least one product's days late differ; pairwise tests with a correction say which", "All five products differ from each other", "The medians of the five products differ"], "answer": 1, "explain": "An omnibus test answers one question: are all groups alike? 'No' does not say which ones differ — and here all five medians are the same (−1)."}
```

### Permutation test — build the null by shuffling

**What it is.** If H₀ is true, the group label carries no information, so shuffling it should often produce gaps as large as the real one. A **permutation test** (*перестановочный тест*) shuffles the labels many times, recomputes the statistic each time and reports p = the share of shuffles at least as extreme as the observed value.

**How to write it.** Observed statistic → shuffle the labels 10 000 times → recompute → count. App vs branch FPD:

```python
ab = f[f["channel"].isin(["app", "branch"])]
y, is_app = ab["fpd30"].to_numpy(), (ab["channel"] == "app").to_numpy()
obs = y[is_app].mean() - y[~is_app].mean()                       # the real gap: +0.6586 points
g = np.random.default_rng(2026)                                  # seeded, so you get the same shuffles
diffs = np.array([(lambda s: y[s].mean() - y[~s].mean())(g.permutation(is_app)) for _ in range(10_000)])
print(round(100 * obs, 4), np.mean(np.abs(diffs) >= abs(obs)))   # 0.6586 and p ≈ 0.033 (notebook 0.0326; z-test 0.0318, Fisher 0.0344)
```

A gap of 0.66 points or more appeared in about 3.3 % of 10 000 shuffles, so p ≈ 0.033 — the same answer as yesterday's z-test.

**When you use it.**
- Any statistic with no formula: a difference in medians, in collection rates (Σ paid / Σ due), in the 90th percentile.
- Small or odd-shaped samples. The only assumption: under H₀ the units are exchangeable (any unit could have had any label).

**Your turn.** Put the steps in order.

```game
{"id": "w06d4-g5", "type": "order", "title": "Steps of a permutation test", "items": ["Compute the statistic on the real labels", "Shuffle the labels at random", "Recompute the statistic on the shuffled labels", "Repeat the shuffle 10 000 times", "p = share of shuffles at least as extreme as the real statistic"], "why": "The shuffles build the world where H₀ is true; the p-value asks how often that world produces your result."}
```

### The bootstrap as a test — is zero in the interval?

**What it is.** The **bootstrap** (Day 2) resamples each group with replacement and recomputes the difference each time. As a test: build the 95 % interval of the difference and check whether **0** is inside. Zero outside → significant at 5 %.

```pic
{"id": "w06d4-pic2", "title": "Zero outside the interval: significant. Inside: not", "caption": "Bootstrap 95 % intervals for the FPD gap in points, 10 000 resamples each (seed 2026). App − branch runs from +0.05 to +1.30 and leaves zero out; partner − branch runs from −0.55 to +0.76 and holds it.", "chart": {"type": "intervals", "rows": [{"label": "app − branch", "lo": 0.05, "mid": 0.66, "hi": 1.3}, {"label": "partner − br", "lo": -0.55, "mid": 0.08, "hi": 0.76}], "ref": {"at": 0, "label": "zero"}, "min": -1, "max": 1.5, "unit": " pt"}}
```

**How to write it.** Resample each group → difference → repeat 10 000 times → 2.5th and 97.5th percentiles.

```python
g = np.random.default_rng(2026)
a, b = f.loc[f.channel == "app", "fpd30"].to_numpy(), f.loc[f.channel == "branch", "fpd30"].to_numpy()
d = [g.choice(a, len(a)).mean() - g.choice(b, len(b)).mean() for _ in range(10_000)]
print(np.quantile(d, [0.025, 0.975]))   # ≈ +0.0005 to +0.0130, i.e. +0.05 to +1.30 points — zero is outside; Newcombe gave +0.05 to +1.33
```

The app's FPD is higher by somewhere between 0.05 and 1.30 points; zero is outside, so the difference is significant at 5 %.

**When you use it.**

| | Permutation test | Bootstrap interval |
|---|---|---|
| Answers | could the labels be irrelevant? | how big is the difference, give or take? |
| Gives | a p-value | an interval (and "is 0 inside?") |
| Use for | a yes/no decision | the size you report |

> ⚠️ **Watch out.** Zero just inside the interval is "not significant", not "no difference". Report the interval itself; it shows how large the difference could be.

**Your turn.** A bootstrap interval for the difference in a late rate comes out as −0.4 to +1.1 points. What do you conclude?

```task
{"id": "w06d4-l5", "kind": "choice", "options": ["Significant at 5 % — the interval is mostly positive", "Not significant at 5 % — zero is inside the interval, though a gap of up to +1.1 points is still possible", "The two groups are proven equal", "The test failed; increase the resamples to 100 000"], "answer": 1, "explain": "The test is 'is 0 inside the 95 % interval?'. It is, so no significance — but the interval also says the gap could be as large as +1.1 points: absence of evidence, not evidence of absence."}
```


### Chi-square or Fisher — small tables

**What it is.** The χ² test is an approximation. It needs every **expected count** (row total × column total / grand total) to be **at least 5**. **Fisher's exact test** (*точный критерий Фишера*) needs no approximation: it adds up the probabilities of every table with the same row and column totals that is as unlikely as the one you saw or more. It is exact at any n.

**How to write it.** The 2026-05 vintage, partner vs branch: 4 FPDs in 67 vs 2 in 179.

| | FPD | no FPD | total |
|---|---|---|---|
| partner | 4 (expected 1.63) | 63 | 67 |
| branch | 2 (expected 4.37) | 177 | 179 |
| total | 6 | 240 | 246 |

```python
t = np.array([[4, 63], [2, 177]])                                 # partner vs branch: FPD / no FPD
print((np.outer(t.sum(axis=1), t.sum(axis=0)) / t.sum()).round(2))   # [[1.63 65.37] [4.37 174.63]] — two cells below 5

def fisher(a, b, c, d):                                           # two-sided Fisher exact test for [[a, b], [c, d]]
    r1, c1, n = a + b, a + c, a + b + c + d
    def table_p(k):                                               # P(k in the top-left cell) with the margins fixed
        return math.comb(c1, k) * math.comb(n - c1, r1 - k) / math.comb(n, r1)
    p_obs = table_p(a)
    ks = range(max(0, r1 - (n - c1)), min(r1, c1) + 1)            # every possible top-left count
    return sum(table_p(k) for k in ks if table_p(k) <= p_obs * (1 + 1e-7))   # tables as unlikely as ours, or more
print(round(fisher(4, 63, 2, 177), 4))                            # 0.0485
# scipy (the notebook): scipy.stats.chi2_contingency(t)[1] → 0.083 (Yates), correction=False → 0.028; scipy.stats.fisher_exact(t) → p 0.0485
```

Two expected counts are below 5, the two χ² versions disagree (0.028 and 0.083), and Fisher gives the exact answer, p = 0.0485.

**When you use it.**
- Any 2 × 2 table with an expected count below 5: a vintage × channel, a branch-month, a small campaign.
- With a computer you can simply use Fisher for every 2 × 2.

**Your turn.** A branch-month: 3 FPDs in 40 app loans, 1 FPD in 120 branch loans. What is the expected number of FPDs in the app row?

```task
{"id": "w06d4-l6", "kind": "number", "answer": 1, "dp": 1, "unit": "FPDs", "hint": "Expected = row total × column total / grand total: 40 × 4 / 160.", "model": "40 × 4 / 160 = 1.0 — far below 5, so χ² is unreliable here: use Fisher."}
```

### Multiple comparisons — Bonferroni, Holm, Benjamini–Hochberg

**What it is.** Each test at α = 5 % raises a false alarm 5 % of the time when nothing is real. Run m tests and the chance of **at least one** false alarm — the **family-wise error rate** (*групповая вероятность ошибки*, FWER) — is 1 − 0.95^m: **40 %** for 10 tests. **Corrections for multiple comparisons** (*поправки на множественные сравнения*) adjust the p-values:

- **Bonferroni** (*поправка Бонферрони*): multiply every p by m (cap at 1). Keeps FWER ≤ α; strict.
- **Holm**: sort p from smallest; multiply the smallest by m, the next by m − 1, … and keep the running maximum. The same guarantee, never less power — the default.
- **Benjamini–Hochberg** (*процедура Бенджамини–Хохберга*, BH): controls the **false discovery rate** (FDR) — the expected share of false alarms among the results you flag. Less strict; for screening hundreds of segments.

**How to write it.** Each branch against the other nine (Fisher), then the three corrections:

```python
print(round(1 - 0.95 ** 10, 3))                      # 0.401 — at least one false alarm in 10 tests

def holm(pvals):
    pvals = np.asarray(pvals, dtype=float)
    m, adj, run = len(pvals), np.empty(len(pvals)), 0.0
    for rank, i in enumerate(np.argsort(pvals)):     # smallest p first
        run = max(run, min(1.0, (m - rank) * pvals[i]))   # × m, × (m − 1), … keeping the running maximum
        adj[i] = run
    return adj
def bh(pvals):
    pvals = np.asarray(pvals, dtype=float)
    m, adj, run = len(pvals), np.empty(len(pvals)), 1.0
    for k, i in enumerate(np.argsort(pvals)[::-1]):  # largest p first
        run = min(run, pvals[i] * m / (m - k))       # × m / rank, keeping the running minimum
        adj[i] = run
    return adj
print(holm([0.0318, 0.153, 0.804]))                  # [0.0954 0.306 0.804] — yesterday's three channel pairs

br = f.groupby("branch_name")["fpd30"].agg(["sum", "size"])
k_all, n_all = f["fpd30"].sum(), len(f)              # 91 FPDs in 7 099 loans
br["p"] = [fisher(k, n - k, k_all - k, n_all - n - (k_all - k)) for k, n in zip(br["sum"], br["size"])]
br["bonferroni"] = np.minimum(1, br["p"] * len(br))
br["holm"], br["bh"] = holm(br["p"]), bh(br["p"])
print(br.sort_values("p").head(3).round(3))
# statsmodels (the notebook): statsmodels.stats.multitest.multipletests(p, method="holm") — also "bonferroni", "fdr_bh"
```

| branch | FPD / loans | p | Bonferroni | Holm | BH |
|---|---|---|---|---|---|
| Bukhara Central | 14 / 586 | **0.020** | 0.199 | **0.199** | 0.199 |
| Tashkent North | 8 / 921 | 0.273 | 1 | 1 | 0.869 |
| Nukus Central | 3 / 440 | 0.377 | 1 | 1 | 0.869 |

Bukhara's p = 0.020 looks "significant" alone; tested as one of ten, every correction puts it at 0.199. The omnibus χ² of FPD × branch agrees: χ² = 9.97 on 9 df, p = 0.35.

**When you use it.**
- Several branches, segments, products or KPIs tested at once: Holm.
- Hundreds of segments screened for leads to follow up: BH.
- One test chosen in advance: no correction.

> ⚠️ **Watch out.** Count every test you ran, including the ones you looked at and dropped. "We tested ten branches and report the one that came out" without a correction is the false alarm the correction exists to stop.

**Your turn.** Four segment tests give p = 0.01, 0.02, 0.03, 0.20. Run `holm()` and `bh()` on them in the box above. How many stay below 0.05 under BH?

```task
{"id": "w06d4-l7", "kind": "number", "answer": 3, "dp": 0, "unit": "tests", "hint": "bh([0.01, 0.02, 0.03, 0.20]) — then count the values below 0.05.", "model": "BH: 0.04, 0.04, 0.04, 0.20 → three below 0.05. Holm: 0.04, 0.06, 0.06, 0.20 → only one. BH accepts some false discoveries in exchange for power."}
```

### Peeking — multiple comparisons in time

**What it is.** **Peeking** (*подглядывание*) is testing a running experiment again and again as data arrive, and stopping at the first p < 0.05. Each look is another test, so the false-alarm rate grows like in the previous subsection.

**How to write it.** Simulate an SMS that does **nothing**: both arms 13.34 % late, 150 loans per arm per month, 12 months, 20 000 runs.

```python
g = np.random.default_rng(2026)
p_late, runs, per_month = 947 / 7099, 20_000, 150
ka = g.binomial(per_month, p_late, size=(runs, 12)).cumsum(axis=1)   # arm A: late first instalments so far, month by month
kb = g.binomial(per_month, p_late, size=(runs, 12)).cumsum(axis=1)   # arm B: identical — the SMS does nothing
n_arm = per_month * np.arange(1, 13)                                  # loans per arm after 1, 2, …, 12 months
pool = (ka + kb) / (2 * n_arm)
z = (ka - kb) / n_arm / np.sqrt(pool * (1 - pool) * 2 / n_arm)        # the two-proportion z at every monthly look
print(np.mean(np.abs(z[:, -1]) > 1.96), np.mean((np.abs(z) > 1.96).any(axis=1)))   # ≈ 0.05 once at the end, ≈ 0.21 looking monthly
```

Testing once at the end gives a false positive about 5 % of the time (the notebook: 5.05 %); looking every month and stopping at the first p < 0.05 gives about **21 %** (20.9 %) — a "winning" SMS one time in five, usually declared in month 3.

**When you use it.**
- Any experiment that runs for weeks or months, and any dashboard that people check while it runs.
- The fix: write the sample size and the end date into the plan before the first loan, and read the result once (or use a sequential design built for peeking — week 7).

> ⚠️ **Watch out.** "Let's check the dashboard every Monday and stop when it turns green" is peeking. It turns a 5 % test into a 21 % one.

**Your turn.** A team checks a test that changes nothing every month for a year and stops at the first p < 0.05. What happens to the 5 % false-positive rate?

```task
{"id": "w06d4-l8", "kind": "choice", "options": ["It stays 5 % — each look is a 5 % test", "It falls, because the test stops earlier", "It grows to about 20 %: every look is one more chance for a false alarm", "It becomes exactly 12 × 5 % = 60 %"], "answer": 2, "explain": "Twelve looks are twelve correlated tests: the simulation gives about 21 %, not 60 % (the looks share most of their data) and not 5 %."}
```


### Power and sample size

**What it is.** **Power** (*мощность критерия*) = P(the test rejects H₀ | the effect is real) = 1 − β. It is fixed before any data exist, by five inputs: **α**, the **power** you want, the **baseline** rate, the **effect** you want to detect and **n**. Convention: plan for 80 % power at α = 5 %. For two rates the effect is measured by **Cohen's h** = 2·arcsin√p₁ − 2·arcsin√p₂, and the loans needed **per arm** are:

```
n per arm = 2 · ( (z for α/2 + z for the power) / h )²
FPD 1.28 % → 1.00 %:  h = 0.02642;   n = 2 · ((1.960 + 0.842) / 0.02642)² = 22 481
```

**How to write it.** One calculator for the whole page — sample size, power and (next subsection) MDE:

```python
def cohens_h(p1, p2):                                # the effect size for two rates
    return 2 * math.asin(math.sqrt(p1)) - 2 * math.asin(math.sqrt(p2))
def n_per_arm(p1, p2, alpha=0.05, power=0.80):       # loans needed in EACH group
    return 2 * ((zq(1 - alpha / 2) + zq(power)) / cohens_h(p1, p2)) ** 2
def power_at(p1, p2, n, alpha=0.05):                 # two-sided power with n loans per arm
    h, za = abs(cohens_h(p1, p2)), zq(1 - alpha / 2)
    return Phi(h * math.sqrt(n / 2) - za) + Phi(-h * math.sqrt(n / 2) - za)
def mde_rate(p1, n, alpha=0.05, power=0.80):         # the lowest rate the treated arm must reach to be seen
    h = (zq(1 - alpha / 2) + zq(power)) * math.sqrt(2 / n)
    return math.sin(math.asin(math.sqrt(p1)) - h / 2) ** 2

print(round(cohens_h(0.0128, 0.010), 5), math.ceil(n_per_arm(0.0128, 0.010)))   # 0.02642 22481 — the base case
print(math.ceil(n_per_arm(0.0128, 0.010, alpha=0.01)), math.ceil(n_per_arm(0.0128, 0.010, power=0.90)))   # 33452 30096
print(math.ceil(n_per_arm(0.0128, 0.0064)), math.ceil(n_per_arm(0.128, 0.100)))  # 3541 2016
print(round(power_at(0.0128, 0.010, 1000), 3))       # 0.091 — power with 1 000 per arm
# statsmodels (the notebook): proportion_effectsize(0.0128, 0.010); zt_ind_solve_power(effect_size=h, alpha=0.05, power=0.80)
# Excel: =2*((NORM.S.INV(0.975)+NORM.S.INV(0.8))/(2*ASIN(SQRT(0.0128))-2*ASIN(SQRT(0.01))))^2 → 22 481
```

Change one input at a time from the base case (FPD 1.28 % → 1.00 %, α 5 %, power 80 %):

| Input changed | Loans per arm | What it does |
|---|---|---|
| none — the base case | **22 481** | — |
| α 1 % (stricter) | 33 452 | stricter α → more loans |
| α 10 % (= one-sided 5 %) | 17 709 | looser α → fewer loans |
| power 90 % | 30 096 | more power → more loans |
| effect twice as large: 1.28 → 0.64 % | 3 541 | bigger effect → far fewer (n ∝ 1 / h²) |
| a frequent outcome: 12.8 → 10.0 % (the same −22 %) | 2 016 | a rate far from 0 % → about 11 times fewer |
| n fixed at 1 000 per arm | power **9.1 %** | the test misses a real effect 91 times in 100 |

Detecting FPD falling from 1.28 % to 1.00 % needs 22 481 loans in each arm; with 1 000 per arm the test has a 9 % chance of noticing.

**When you use it.**
- Before every experiment: "how many loans do we need?" and "how long will that take at our volume?".
- Before reading a "not significant": was the test able to see the effect at all?

> ⚠️ **Watch out.** Rare outcomes are expensive to test. A −22 % effect on a 1.28 % rate needs 22 481 loans per arm; the same −22 % on a 12.8 % rate needs 2 016.

**Your turn.** Fill in the formula.

```game
{"type": "cloze", "id": "w06d4-g2", "title": "Loans per arm", "text": "n per arm = 2 · ( ( {{0}} + {{1}} ) / {{2}} )²", "blanks": [["z₁₋α/₂ (1.960)"], ["z₁₋β (0.842)"], ["Cohen's h"]], "distractors": ["the p-value", "σ / √n"], "why": "α and power set the two z values; the effect size h sits in the denominator, so halving the effect quadruples n."}
```

### MDE and the power curve — what can this test see?

**What it is.** Turn the sample-size question round. With n fixed, the **minimum detectable effect** (*минимальный детектируемый эффект*, MDE) is the smallest true change the test detects with 80 % power. The **power curve** shows power against n for one effect.

```pic
{"id": "w06d4-pic3", "title": "Power grows with n — far faster for a frequent metric", "caption": "Power to detect the SMS effect, by loans per arm (α 5 %). Teal: FPD30 falling from 1.28 % to 1.00 % — only 46.4 % with 10 000 per arm. Amber: \"late at all\" falling from 13.3 % to 10.7 % — 73.9 % already at 2 000.", "chart": {"type": "bars", "labels": ["2 000", "2 000", "5 000", "5 000", "10 000", "10 000", "30 000", "30 000"], "values": [13.3, 73.9, 26.2, 98.4, 46.4, 100.0, 89.9, 100.0], "tone": ["a", "b", "a", "b", "a", "b", "a", "b"], "show": true, "unit": "%", "note": "x: loans per arm · teal FPD30 · amber late at all"}}
```

**How to write it.** `mde_rate` and `power_at` from the calculator:

```python
print([round(100 * mde_rate(0.0128, n), 2) for n in (1000, 2000, 10000, 22481)])   # [0.26, 0.48, 0.87, 1.0]
ns = [1000, 2000, 5000, 10000, 22481, 30000]
print([round(100 * power_at(0.0128, 0.010, n), 1) for n in ns])                    # FPD30 1.28 → 1.00 %
print([round(100 * power_at(947 / 7099, 0.8 * 947 / 7099, n), 1) for n in ns])    # late at all 13.3 → 10.7 %
```

| loans per arm | 1 000 | 2 000 | 5 000 | 10 000 | 22 481 | 30 000 |
|---|---|---|---|---|---|---|
| MDE from 1.28 % FPD | 0.26 % | 0.48 % | 0.73 % | 0.87 % | 1.00 % | — |
| power, FPD30 1.28 → 1.00 % | 9.1 % | 13.3 % | 26.2 % | 46.4 % | **80.0 %** | 89.9 % |
| power, late at all 13.3 → 10.7 % | 45.2 % | **73.9 %** | 98.4 % | ≈ 100 % | ≈ 100 % | ≈ 100 % |

With 1 000 loans per arm the SMS must cut FPD from 1.28 % to 0.26 % — by 80 % — before the test reliably sees it.

**When you use it.**
- When n is fixed by the business (a month of loans, one region): say what the test *can* see before it runs.
- When you compare metrics: the same SMS judged on a frequent metric reaches 80 % power with ten times fewer loans.

> 💡 **Key idea.** If the MDE is larger than any effect the change could plausibly have, the test cannot succeed. A test with 9 % power is not a cheap test; it is a test whose "no effect" answer is already written.

**Your turn.** With 5 000 loans per arm, how low must the SMS arm's FPD rate fall to be detected (α 5 %, power 80 %)? Use `mde_rate`, answer in %.

```task
{"id": "w06d4-l9", "kind": "number", "answer": 0.73, "dp": 2, "unit": "%", "hint": "100 * mde_rate(0.0128, 5000)", "model": "0.73 % — a 43 % cut from 1.28 %. Still far more than an SMS reminder is likely to achieve."}
```

### Effect size — how big the difference is

**What it is.** An **effect size** (*размер эффекта*) says **how big** a difference is, in units that do not grow with n. A p-value says only whether the difference could be chance; with enough data a tiny difference becomes "significant".

- For means: **Cohen's d** (*d Коэна*) = difference of the means / pooled standard deviation. Rough guide: 0.2 small, 0.5 medium, 0.8 large.
- For rates: the **difference in points** (p₁ − p₂), the **relative risk** RR = p₁ / p₂ (*относительный риск*), and Cohen's h (for power).

**How to write it.**

```python
def cohens_d(a, b):                                   # difference of means in pooled standard deviations
    a, b = np.asarray(a, dtype=float), np.asarray(b, dtype=float)
    sp = math.sqrt(((len(a) - 1) * a.var(ddof=1) + (len(b) - 1) * b.var(ddof=1)) / (len(a) + len(b) - 2))
    return (a.mean() - b.mean()) / sp
print(round(cohens_d(auto, sme), 3))                  # -0.042 — Welch p = 0.02, yet the effect is nothing
gr = x.groupby("risk_grade")["days_late"]
print(round(cohens_d(gr.get_group("D"), gr.get_group("A")), 2))   # 0.7 — grade D vs grade A: a real difference
pa, pb = f.loc[f.channel == "app", "fpd30"].mean(), f.loc[f.channel == "branch", "fpd30"].mean()
print(round(100 * (pa - pb), 2), round(pa / pb, 2), round(cohens_h(pa, pb), 3))   # 0.66 1.63 0.057
```

| Comparison | p-value | Effect size | Reading |
|---|---|---|---|
| days late, Auto vs SME | 0.0195 | d = −0.04 | significant, negligible |
| days late, grade D vs A | ≈ 0 | d = 0.70 | large |
| FPD, app vs branch | 0.032 | +0.66 points, RR 1.63 | 6.6 extra FPDs per 1 000 loans; 63 % more often |

Auto and SME differ by 0.04 standard deviations — significant only because there are 12 910 payments; grade D pays 0.7 standard deviations later than grade A, a difference a collector can feel.

**When you use it.**
- In every result you report, next to the p-value.
- In power calculations: the effect size is the input that drives n.

> ⚠️ **Watch out.** "Highly significant" is not "large". Report the difference in the business's units (days, points, soum, RR) with its interval; the p-value only says it is probably not chance.

**Your turn.** Grade C payments average +1.05 days late, grade B −0.31; the pooled standard deviation is 6.44 days. What is Cohen's d (C minus B)?

```task
{"id": "w06d4-l10", "kind": "number", "answer": 0.21, "dp": 2, "unit": "standard deviations", "hint": "(1.05 − (−0.31)) / 6.44", "model": "1.36 / 6.44 = 0.21 — a small effect, though with 38 238 payments its p-value is essentially 0."}
```

### The A/A test

**What it is.** An **A/A test** (*A/A-тест*) splits units into two groups that get the **same** treatment and runs the planned analysis. With nothing different, it should come out "significant" about α of the time. It checks the experiment system — the random split, the logging, the metric pipeline, the test — before a real A/B test trusts it.

**How to write it.** Split real FPD loans into two random groups of 2 000, 2 000 times, and count the false alarms:

```python
g = np.random.default_rng(2026)
y_all, hits = f["fpd30"].to_numpy(), 0
for _ in range(2000):
    s = g.choice(y_all, 4000, replace=False)          # 4 000 real loans: the first 2 000 are "A", the rest "A" again
    ka, kb = s[:2000].sum(), s[2000:].sum()
    pool = (ka + kb) / 4000
    hits += abs(ka - kb) / 2000 / math.sqrt(pool * (1 - pool) * 2 / 2000) > 1.96
print(hits / 2000)                                    # ≈ 0.05 (the notebook's run: 0.049) — about α, as it should be
```

About 5 % of the A/A splits come out "significant" (the notebook: 4.9 %) — that is α, so the split and the test behave.

**When you use it.**
- Before the first A/B test on a new system, and after any change to how units are assigned or logged.
- A false-positive rate well above α (say 15 %) means a broken split or a wrong test, not bad luck.

**Your turn.** An A/A test, run 1 000 times on the new experiment platform, comes out "significant" 15 % of the time. What does that mean?

```task
{"id": "w06d4-l11", "kind": "choice", "options": ["Nothing — 15 % is close enough to 5 %", "The SMS works even in the A/A test", "Something in the system is broken: the split, the logging or the test. Fix it before any A/B test", "Use α = 15 % from now on"], "answer": 2, "explain": "In an A/A test nothing differs, so 'significant' should appear about α = 5 % of the time. Three times that is a broken split (for example, by branch or by time) or a test that ignores clustering."}
```


### Putting it together

One request, several of today's tools. *"Micro payments look late. Is Micro really different from each other product, and by how much?"*

```python
micro = x.loc[x.code == "MICRO", "days_late"]
others = ["CONS", "BNPL", "AUTO", "SME"]
res = pd.DataFrame(
    [(c, *mann_whitney(micro, x.loc[x.code == c, "days_late"])[1:], cohens_d(micro, x.loc[x.code == c, "days_late"])) for c in others],
    columns=["vs", "P(Micro later)", "p", "d"])
res["holm"] = holm(res["p"])                          # four pairwise tests → correct for four
print(res.round({"P(Micro later)": 3, "d": 3}))       # P 0.52–0.53, every Holm p below 1e-6, d 0.08–0.12
```

Read it with the questions from this section:

1. **Which test?** Days late are skewed and the question is about the typical payment → ranks. Five groups → **Kruskal–Wallis** first: H = 61.0, p = 1.8 × 10⁻¹² — some product differs.
2. **Which one?** Four pairwise **Mann–Whitney** tests, Micro against each other product.
3. **Four tests, one family** → **Holm**. All four stay below 10⁻⁶.
4. **How big?** **Effect size**: a Micro payment is later than another product's 52–53 % of the time, d = 0.08–0.12. Real, consistent and small: worth a reminder on Micro loans, not a pricing change.

**Which test answers which question?**

```game
{"type": "sort", "id": "w06d4-g1", "title": "Which test?", "q": "Put each Nur question under the test that answers it.", "groups": {"Mann–Whitney": ["Does a typical Micro payment arrive later than a typical BNPL payment?", "Are days late different for two small, skewed groups?"], "Wilcoxon signed-rank": ["The same ten branches, FPD in 2025 vs 2026, skewed differences"], "Kruskal–Wallis": ["Days late across the five products"], "Fisher's exact": ["4 FPDs in 67 vs 2 in 179 — expected counts below 5"], "Permutation test": ["Collection rate Σ paid / Σ due, two strategies", "Difference in 90th percentiles of days late"]}}
```

**The words of the day.**

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

**2. One branch, small counts — Fisher's exact test.** Bukhara vs the other nine: 14 / 586 vs 77 / 6 513. The counts are small, so Fisher, not χ²: **p = 0.020** (odds ratio 2.05). Taken alone, "significant".

**3. Effect size — how big, if it is real.** 2.39 % against 1.18 % for the other nine: +1.21 points, RR 2.0. Large if real — and it rests on 14 FPDs.

**4. Multiple comparisons — it was chosen because it was the highest of ten.** Test all ten branches the same way (section 1, the branch table) and correct with **Holm**: Bukhara's adjusted p is **0.199**; no other branch is below 0.27 even before the correction. The omnibus χ² across the ten branches agrees: **p = 0.35**.

**5. The family-wise error rate — what chance does.** In books where all ten branches share the same true rate, 31 % have at least one branch flagged at 5 % (the notebook's simulation); Tuesday's Company corner showed the top branch averaging 2.00 % by luck alone.

**6. Reporting the result — one sentence.** *"Bukhara's 2.39 % is the highest of ten branches, but once we account for testing ten branches it is within what chance produces (Holm-adjusted p = 0.20); we will watch its Q4 vintages and its product mix rather than act now."*

---

## 4. Practice (50 min)

Every task has its own answer box. The Python boxes share the session of section 1's blocks: `f`, `x`, `pmf`, `cdf`, `mann_whitney`, `fisher`, `holm`, `bh`, `cohens_d`, `cohens_h`, `n_per_arm`, `power_at`, `mde_rate`, `Phi` and `zq` are ready once you have pressed ▶ Run on them. The days-late tasks use `x`, the 52 850 payments with `days_late`, which section 1's first block builds (the notebook `data/python/week6/day4_starter.ipynb` builds the same `f` and `x`, with `scipy`).

**P1.** *(when the t-test is wrong)* For which two comparisons is Welch's t-test the wrong tool?

```task
{"id": "w06d4-p11", "kind": "multi", "options": ["Average days late, 4 688 Auto vs 8 222 SME payments", "A 1–5 satisfaction score, 25 app customers vs 25 branch customers", "Principal of 12 SME loans in Nukus vs 15 in Termez, one of them 590 m soum", "Credit scores of 2 000 vs 2 000 applicants"], "answer": [1, 2], "explain": "A 1–5 score is ordinal (its average has no meaning), and 12 vs 15 loans with one huge value is small and outlier-driven: use Mann–Whitney or a permutation test. Thousands of values and a question about the average are fine for Welch."}
```

<details><summary>Answer</summary>

The satisfaction score and the 12-vs-15 SME principals. A 1–5 score is an ordered label, so compare ranks, not means. Twelve and fifteen loans with one 590 m loan: the mean of each group is mostly that one loan, and n is too small for the CLT to rescue it — Mann–Whitney, or a permutation test on the median. The other two have thousands of values and ask about averages: Welch is right.

</details>

**P2.** *(Mann–Whitney U)* Auto vs SME days late: describe both (n, mean, median, share late, 99th percentile), then Welch and Mann–Whitney. Marketing asks "do SME borrowers pay later than Auto borrowers?" — which test answers that, and what is your answer?

```task
{"id": "w06d4-p1", "kind": "choice", "options": ["Welch (p = 0.02): yes, SME borrowers pay later", "Mann–Whitney (p = 0.32): no — a random SME payment is no more likely to be later than a random Auto one (0.505); what differs is the late tail, a proportions question", "Both, and quote the smaller p", "Neither — the medians are equal, so there is nothing to test"], "answer": 1, "explain": "'Do they pay later' is about the typical payment → a rank test. The means differ (Welch) because SME has a slightly heavier late tail: 12.4 % vs 10.1 % paid late at all."}
```

<details><summary>Answer</summary>

Auto 4 688 payments, mean −0.21, median −1, 10.1 % late, 99th pct 28; SME 8 222, +0.04, −1, 12.4 %, 31. Welch t = −2.34, **p = 0.0195**; Mann–Whitney **p = 0.32**, P(Auto later than SME) = 0.495. "Do SME borrowers pay later" is a question about the typical payment → Mann–Whitney: **no**, a random SME payment is no more likely to be later. What *is* different is the tail: 12.4 vs 10.1 % paid late at all (a proportions question: test it as one).

</details>

**P3.** *(Wilcoxon signed-rank)* Wilcoxon signed-rank on the ten branches' FPD30, 2025 vs 2026, next to the paired t-test. Why might you prefer Wilcoxon here?

```task
{"id": "w06d4-p2", "kind": "choice", "options": ["Wilcoxon always gives a smaller p", "With only ten differences (one of them +0.99) you cannot show they are near normal; Wilcoxon needs only symmetry and loses little power", "The paired t-test cannot be used on rates", "Wilcoxon uses the medians of the two years"], "answer": 1, "explain": "W = 7, p = 0.037 against the paired t-test's 0.031 — both agree that 2026 vintages are better."}
```

<details><summary>Answer</summary>

`stats.wilcoxon(w[2026], w[2025])` → W = 7, **p = 0.037** (exact); paired t p = 0.031. With n = 10, the paired t leans on the differences being roughly normal, which ten branch-level differences (one of them +0.99, Tashkent North) cannot show; Wilcoxon needs only symmetry of the differences and is barely less powerful. Both agree: 2026 vintages are better.

</details>

**P4.** *(Kruskal–Wallis)* Kruskal–Wallis on days late across the five products, then one-way ANOVA (`stats.f_oneway`). Which product drives the result?

```task
{"id": "w06d4-p3", "kind": "choice", "options": ["SME — the biggest loans", "Micro — mean days late +0.56 and 16.3 % of payments late against 10–12 % elsewhere", "Auto — the lowest mean", "None: Kruskal–Wallis only says that at least one product differs"], "answer": 1, "explain": "H = 61.0, p = 1.8 × 10⁻¹². The omnibus test says 'some differ'; the descriptive table shows Micro; pairwise Mann–Whitney with Holm would confirm which."}
```

<details><summary>Answer</summary>

Kruskal–Wallis H = 61.0, **p = 1.8 × 10⁻¹²**; ANOVA F = 19.3, p = 7.5 × 10⁻¹⁶. Means: Micro **+0.56**, SME +0.04, Consumer −0.01, BNPL −0.02, Auto −0.21 (all medians −1). Micro is the odd one out: 16.3 % of its payments are late against 10–12 % elsewhere. Next step: pairwise Mann–Whitney Micro vs each (four tests → Holm).

</details>

**P5.** *(permutation test)* Permutation test for the difference in **mean** days late, Auto − SME (10 000 shuffles, `default_rng(2026)`). Compare with Welch.

```task
{"id": "w06d4-p4", "kind": "choice", "options": ["The permutation p (≈ 0.02) contradicts Welch", "It agrees with Welch (≈ 0.02 vs 0.0195): the MEANS differ because of the tail, while Mann–Whitney says the TYPICAL payment does not — same data, two questions", "It agrees with Mann–Whitney, so Welch was wrong", "A permutation test cannot use the mean"], "answer": 1, "explain": "Observed −0.248 days, permutation p = 0.023. Any statistic works in a permutation test — here the mean, with no normality assumption."}
```

<details><summary>Answer</summary>

Observed −0.248 days; permutation **p = 0.023**; Welch 0.0195. The permutation test makes no normality assumption about the mean and agrees: the *means* differ (the tail), while Mann–Whitney (P2) says the *typical* payment does not. Same data, three tests, two questions.

</details>

**P6.** *(bootstrap as a test)* Bootstrap the difference in **mean** days late, Micro − Auto: 2 000 resamples, `default_rng(2026)`, the 95 % percentile interval. Is zero inside?

```task
{"id": "w06d4-p12", "kind": "choice", "options": ["Yes — the interval is about −0.2 to +0.2 days", "No — the interval is about +0.57 to +0.99 days: Micro payments are later on average", "No — the interval is about +5 to +7 days", "The bootstrap cannot be used for a difference in means"], "answer": 1, "explain": "Observed +0.77 days; the interval stays well above zero, so the difference is significant at 5 % — and the interval gives its size, give or take."}
```

<details><summary>Answer</summary>

```python
g = np.random.default_rng(2026)
m, a = x.loc[x.code == "MICRO", "days_late"].to_numpy(), x.loc[x.code == "AUTO", "days_late"].to_numpy()
d = [g.choice(m, len(m)).mean() - g.choice(a, len(a)).mean() for _ in range(2000)]
print(round(m.mean() - a.mean(), 3), np.quantile(d, [0.025, 0.975]).round(2))   # 0.774 and about [0.57 0.99]
```
Observed **+0.77 days**; interval about **+0.57 to +0.99**. Zero is outside: significant at 5 %. The interval is the part to report — "Micro payments arrive 0.6 to 1.0 days later on average than Auto payments".

</details>

**P7.** *(chi-square or Fisher)* The 2026-05 vintage, partner vs branch (4 / 67 vs 2 / 179). Expected counts, χ² with and without Yates, Fisher. Which do you report, and what do you conclude?

```task
{"id": "w06d4-p5", "kind": "choice", "options": ["χ² without correction, p = 0.028 — partner's May vintage is worse", "Fisher, p = 0.0485 — borderline, and one vintage of 32 and one channel pair of three: after any correction it is noise", "χ² with Yates, p = 0.083 — no difference", "No test: six FPDs are too few for any test"], "answer": 1, "explain": "Expected FPDs 1.63 and 4.37: two cells below 5, so χ² is unreliable and its two versions disagree. Fisher is exact; six FPDs still cannot carry a decision."}
```

<details><summary>Answer</summary>

Expected FPDs 1.63 and 4.37 — two cells below 5, χ² unreliable. Yates **0.083**, uncorrected **0.028**, Fisher **0.0485**. Report Fisher. Conclusion: borderline evidence that partner's May vintage was worse — and it is one vintage of 32 and one channel pair of three, so after any correction it is noise. Six FPDs in total cannot carry a decision.

</details>

**P8.** *(multiple comparisons)* Holm by hand (your TODO) on the three channel-pair p-values from yesterday: app–branch 0.0318, app–partner 0.153, partner–branch 0.804. Then Bonferroni.

```task
{"id": "w06d4-p6", "kind": "python", "starter": "pv = np.array([0.0318, 0.153, 0.804])     # app–branch, app–partner, partner–branch\nprint(holm(pv))\n# add Bonferroni: each p × 3, capped at 1 — print the three values\n", "answer": 0.459, "dp": 3, "model": "print(np.minimum(1, pv * 3))     # [0.0954 0.459 1.   ] — Holm [0.0954 0.306 0.804]: app vs branch is no longer below 0.05"}
```

<details><summary>Answer</summary>

Sorted 0.0318, 0.153, 0.804 → × 3, × 2, × 1 = 0.0954, 0.306, 0.804 → running max unchanged → Holm **0.095 / 0.306 / 0.804**; Bonferroni 0.095 / 0.459 / 1.000. Corrected for three comparisons, app vs branch is no longer significant at 5 %. That is why the committee note says "moderate": the answer depends on whether app vs branch was *the* question (it was Bekzod's, asked from the dashboard) or one of three.

</details>

**P9.** *(multiple comparisons: screening)* The vintage screen: test each of the 31 monthly vintages with ≥ 50 loans against the book rate 1.28 % (exact two-sided binomial). How many are "significant" at 5 %, how many would chance produce, and what survives Holm?

```task
{"id": "w06d4-p7", "kind": "python", "starter": "p0 = 91 / 7099\nv = f.groupby(\"vintage\")[\"fpd30\"].agg([\"sum\", \"size\"])\nv = v[v[\"size\"] >= 50]                     # 31 vintages\nv[\"p\"] = [min(1, 2 * min(cdf(k, n, p0), 1 - cdf(k - 1, n, p0) if k > 0 else 1)) for k, n in zip(v[\"sum\"], v[\"size\"])]\nprint(v.sort_values(\"p\").head(3))\n# add the Holm-adjusted p-values (holm from section 1) and print the smallest one, 2 decimals\n", "answer": 0.88, "dp": 2, "model": "v[\"holm\"] = holm(v[\"p\"])\nprint(round(v[\"holm\"].min(), 2))      # 0.88 — 2026-03 (0 FPDs in 330, raw p = 0.028) does not survive; chance alone gives ~1.6 'hits' in 31"}
```

<details><summary>Answer</summary>

`p = min(1, 2·min(binom.cdf(k, n, p0), binom.sf(k − 1, n, p0)))` per vintage: **1 of 31** below 0.05 — **2026-03**, with **0 FPDs in 330** loans (p = 0.028), a suspiciously *good* month; 2025-04 (7 / 225) is next at 0.054. Chance alone would give 31 × 0.05 ≈ 1.6. Holm: 0.88 for 2026-03 — nothing survives. Check 2026-03's zero against the payment data before celebrating (Day 1, P8).

</details>

**P10.** *(peeking)* Marketing ran a reminder test for eight weeks, looked at the dashboard every Monday and stopped in week 3, when p = 0.04. What do you tell them?

```task
{"id": "w06d4-p13", "kind": "choice", "options": ["Well done — p = 0.04 is below 0.05", "The result cannot be trusted: with weekly looks and a stop at the first p < 0.05, the false-positive rate is far above 5 %. Rerun with the sample size and the end date fixed in advance", "Lower α to 0.01 for the remaining weeks", "Continue to week 8 and report whichever week had the smallest p"], "answer": 1, "explain": "Each look is another test. The page's simulation: one look at the end gives 5 %, monthly looks 21 % — weekly looks are worse still."}
```

<details><summary>Answer</summary>

The p = 0.04 is one of up to eight looks, and the test stopped *because* it crossed 0.05. Section 1's simulation: a test that changes nothing, read once at the end, is "significant" 5 % of the time; read monthly and stopped at the first p < 0.05, 21 %. Weekly looks inflate it further. Rerun with n from a power calculation and the end date written down before the first SMS, and read the result once.

</details>

**P11.** *(power and sample size)* Sample size for the SMS test with other settings: 90 % power; one-sided 80 %. And the achieved power of 1 000 vs 1 000.

```task
{"id": "w06d4-p8", "kind": "python", "starter": "print(math.ceil(n_per_arm(0.0128, 0.010)))              # 80 % power, two-sided: 22481\n# add: 90 % power (two-sided), loans per arm, rounded up\n", "answer": 30096, "dp": 0, "model": "print(math.ceil(n_per_arm(0.0128, 0.010, power=0.90)))       # 30096\nprint(math.ceil(n_per_arm(0.0128, 0.010, alpha=0.10)))       # 17709 — one-sided at 5 % = two-sided at 10 %\nprint(round(power_at(0.0128, 0.010, 1000), 3))               # 0.091"}
```

<details><summary>Answer</summary>

90 % power: **30 096** per arm; one-sided 80 %: **17 709** per arm (one-sided is cheaper — and only legitimate if "SMS makes it worse" and "no change" lead to the same decision, which for a cheap SMS they arguably do); 1 000 per arm: **9.1 %** power. Every setting is far beyond Nur's ~337 new loans a month (January–September 2026).

</details>

**P12.** *(MDE)* MDE: with 1 000, 2 000 and 10 000 loans per arm (α 5 %, power 80 %), what FPD rate must the SMS reach to be detectable from 1.28 %? Use your `mde_rate`.

```task
{"id": "w06d4-p9", "kind": "python", "starter": "print(round(100 * mde_rate(0.0128, 1000), 2))     # 1 000 per arm, in %\n# add 2 000 and 10 000 per arm\n", "answer": 0.48, "dp": 2, "model": "print([round(100 * mde_rate(0.0128, n), 2) for n in (1000, 2000, 10000)])   # [0.26, 0.48, 0.87] — cuts of 80 %, 63 %, 32 %"}
```

<details><summary>Answer</summary>

1 000 → **0.26 %** (an 80 % cut); 2 000 → **0.48 %** (63 %); 10 000 → **0.87 %** (32 %). No reminder SMS cuts first-payment defaults by two thirds — the people who default on the first instalment are mostly not people who forgot. So a 2 000-loan FPD test is designed to fail: its most likely outcome is "not significant", which marketing will then read as "the SMS does not work".

</details>

**P13.** *(effect size)* Cohen's d for days late, grade C vs grade A, with `cohens_d` from section 1. Small, medium or large? Then the share of payments paid late in each grade.

```task
{"id": "w06d4-p14", "kind": "python", "starter": "gr = x.groupby(\"risk_grade\")[\"days_late\"]\n# Cohen's d, grade C minus grade A, rounded to 2 decimals\n", "answer": 0.3, "dp": 2, "model": "print(round(cohens_d(gr.get_group(\"C\"), gr.get_group(\"A\")), 2))   # 0.3 — between small and medium\nprint(gr.apply(lambda d: (d > 0).mean()).round(3))   # A 0.051, B 0.098, C 0.196, D 0.356"}
```

<details><summary>Answer</summary>

d = **0.30** — between small (0.2) and medium (0.5); grade D vs A is 0.70. Shares paid late: A **5.1 %**, B 9.8 %, C **19.6 %**, D 35.6 %. In the business's units, grade C pays late almost four times as often as grade A. The p-value of the C-vs-A comparison is essentially 0 and says nothing about this size; d and the shares do.

</details>

**P14.** *(A/A test)* An A/A design on the share of payments paid late: the ten branches are split into two groups of five, nobody gets any treatment, and a payment-level two-proportion z-test compares the groups. Over all 252 possible splits, 42 (16.7 %) come out "significant" at 5 %. Why so many?

```task
{"id": "w06d4-p15", "kind": "choice", "options": ["252 splits is too few to judge", "The unit that was split is the branch, and branches really differ (11.2 % to 13.6 % of payments late); a test that treats 52 850 payments as independent reads a branch difference as an effect. Randomise loans, or analyse by branch", "The z-test needs α = 1 % for payments", "16.7 % is within the normal range of an A/A test"], "answer": 1, "explain": "An A/A test should be 'significant' about α of the time. Far above α means the split or the test is wrong — here the split follows a real grouping (the branch) that the test ignores."}
```

<details><summary>Answer</summary>

The split was made by **branch**, but the test counts **payments** as if each were assigned on its own. Branches differ for reasons that have nothing to do with any treatment (from 11.2 % of payments late in the smallest branches to 13.6 % in the latest one), and payments of the same loan move together. So a branch difference looks like a treatment effect, and 42 of the 252 splits are "significant" — three times α. That is what A/A tests are for: they catch a split that follows a real grouping (branch, region, day of the week) before a real test is read. Fix: randomise loans, or analyse at the level you randomised (ten branches is very little data).

</details>

> 🚀 **Stretch (optional, +5 XP).** **P15.** *(power and sample size: choosing the metric)* Change the metric. "First instalment paid late at all" (any day after the due date, or not in full) is far more common than FPD30. Compute its rate on the 7 099 loans, the n per arm to detect a 20 % relative cut, the power of 1 000 vs 1 000, and confirm that power by simulation (20 000 runs, `default_rng(2026)`).

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
  {"type": "single", "q": "Welch says p = 0.02, Mann–Whitney says p = 0.32 on the same days-late data. Which is wrong?", "options": ["Welch", "Mann–Whitney", "Neither — Welch asks about the average, Mann–Whitney about the typical payment", "Both"], "answer": 2, "explain": "Pick the business question first, then the test (→ section 1, 'When the t-test is wrong', P2)."},
  {"type": "number", "q": "You test 20 segments at α = 5 % and nothing is real. What is the chance of at least one false alarm, in %?", "answer": 64.2, "tol": 0.3, "explain": "1 − 0.95²⁰ = 64.2 %. Correct with Holm before acting on the one hit (→ section 1, 'Multiple comparisons', P9)."},
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
  {"type": "single", "q": "On the same Auto vs SME days late, Welch gives p = 0.02 and Mann–Whitney p = 0.32. Which is wrong?", "options": ["Mann–Whitney — it ignores the tail", "Welch — the data are skewed", "Both — run a third test", "Neither: Welch asks about the average days late, Mann–Whitney whether a typical payment is later"], "answer": 3, "explain": "Decide which question the business asks before choosing the test, never run both and quote the smaller p (→ section 1, 'When the t-test is wrong', P2)."},
  {"type": "single", "q": "What does the Mann–Whitney U test compare?", "options": ["The means", "The medians", "The variances", "Whether a random value from one group tends to be larger than one from the other — under H₀, P(X > Y) = ½"], "answer": 3, "explain": "It works on ranks and compares whole distributions; equal medians can still differ (→ section 1, 'Mann–Whitney U')."},
  {"type": "single", "q": "Which test do you report for this table?", "code": "t = [[4, 63], [2, 177]]          # partner vs branch, FPD / no FPD\nstats.chi2_contingency(t)[3]      # expected [[1.63, 65.37], [4.37, 174.63]]", "options": ["χ² without correction (p = 0.028)", "A t-test on the two rates", "Fisher's exact test — two expected counts are below 5", "χ² with Yates (p = 0.083)"], "answer": 2, "explain": "χ² is an approximation that needs expected counts ≥ 5; Fisher is exact at any n (→ section 1, 'Chi-square or Fisher', P7)."},
  {"type": "number", "q": "You run 10 independent tests at α = 5 % and nothing is real. What is the chance of at least one false alarm, in %?", "answer": 40.1, "tol": 0.2, "explain": "1 − 0.95¹⁰ = 40.1 % — the family-wise error rate; Holm or Bonferroni bring it back to 5 % (→ section 1, 'Multiple comparisons')."},
  {"type": "single", "q": "What does this return?", "code": "multipletests([0.0318, 0.153, 0.804], method=\"holm\")[1]", "options": ["[0.0954, 0.306, 0.804]", "[0.0318, 0.153, 0.804]", "[0.0106, 0.051, 0.268]", "[0.0954, 0.459, 1.0]"], "answer": 0, "explain": "Holm: the smallest × 3, the next × 2, the last × 1, keeping the running maximum; [0.0954, 0.459, 1.0] is Bonferroni (→ P8)."},
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
